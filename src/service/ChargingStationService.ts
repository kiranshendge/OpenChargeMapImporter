import { ChargingStationRepository } from '../infrastructure/repository/ChargingStationRepository';
import { AddressInfo, ChargingStation, Connection } from '../dto/ChargingStationDto';
import axios from 'axios';
import { limiter } from '../utils/rateLimiter';
import { IChargingStationService } from './IChargingStationService';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';
import { Worker } from 'worker_threads';
import mongoose from 'mongoose';
import { chargingStations, address, connection } from '../models/ChargingStationModel';
import redisClient from '../cache/redisClient';
import { APIError, AuthorizeError } from '../utils/error';
import { AppConstant } from '../utils/constant';

export class ChargingStationService implements IChargingStationService {
  private readonly dbConnection: mongoose.Connection;
  private readonly repository: ChargingStationRepository;

  constructor(repository: ChargingStationRepository, dbConnection: mongoose.Connection) {
    this.dbConnection = dbConnection;
    this.repository = repository;
  }

  async fetchOpenChargeMapData(
    maxresults: number,
    retries = AppConstant.MAX_RETRIES,
  ): Promise<ChargingStation[]> {
    try {
      const response = await limiter.schedule(() =>
        axios.get(AppConstant.OPENCHARGEMAP_URL, {
          params: {
            key: process.env.OPENCHARGEMAP_API_KEY,
            maxresults,
          },
        }),
      );
      return response.data;
    } catch (error: any) {
      if (retries > 0 && error.response && error.response.status === 403) {
        logger.error('Authentication error: Invalid API key');
        throw new AuthorizeError('Invalid API key');
      } else if (retries > 0) {
        const delay = Math.pow(2, 5 - retries) * 1000; // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, delay));
        return await this.fetchOpenChargeMapData(retries - 1);
      } else {
        logger.error(`Error while fetching data from openchargemap API: ${error.message}`);
        throw new APIError(`Failed to fetch data from API: ${error.message}`);
      }
    }
  }

  async getCachedData(maxresults: number): Promise<ChargingStation[]> {
    try {
      const cacheKey = `openchargemap:${AppConstant.REDIS_CACHE_KEY}`;
      const cachedData = await redisClient.get(cacheKey);

      if (cachedData) {
        return JSON.parse(cachedData);
      }

      const data: ChargingStation[] = await this.fetchOpenChargeMapData(maxresults);
      await redisClient.set(cacheKey, JSON.stringify(data), {
        EX: 3600, // Cache for 1 hour
      });

      return data;
    } catch (error) {
      logger.error(`error from redis cache: ${error}`);
      throw error;
    }
  }

  async importDataToDB(chargingStationsData: ChargingStation[]): Promise<void> {
    try {
      const addressesPromises = chargingStationsData.map(
        async (item: { AddressInfo: AddressInfo }) => {
          const existingRecord = await this.repository.checkRecordExists(
            address,
            item.AddressInfo.ID,
          );
          return {
            id: item.AddressInfo.ID,
            title: item.AddressInfo.Title,
            addressLine1: item.AddressInfo.AddressLine1,
            town: item.AddressInfo.Town,
            stateOrProvince: item.AddressInfo.StateOrProvince,
            postcode: item.AddressInfo.Postcode,
            countryId: item.AddressInfo.CountryID,
            latitude: item.AddressInfo.Latitude,
            longitude: item.AddressInfo.Longitude,
            distanceUnit: item.AddressInfo.DistanceUnit,
            _id: existingRecord ? existingRecord._id : uuidv4(),
          };
        },
      );

      const addresses = await Promise.all(addressesPromises);

      const connectionPromises = chargingStationsData.flatMap(
        (item: { Connections: Connection[] }) =>
          item.Connections.map(async (conn: Connection) => {
            const existingRecord = await this.repository.checkRecordExists(connection, conn.ID);
            return {
              id: conn.ID,
              connectionTypeId: conn.ConnectionTypeID,
              statusTypeId: conn.StatusTypeID,
              levelId: conn.LevelID,
              powerKW: conn.PowerKW,
              quantity: conn.Quantity,
              _id: existingRecord ? existingRecord._id : uuidv4(),
            };
          }),
      );

      const connectionList = await Promise.all(connectionPromises);

      const chargingStationsPromises = chargingStationsData.map(async (item: ChargingStation) => {
        const existingRecord = await this.repository.checkRecordExists(chargingStations, item.ID);
        return {
          isRecentlyVerified: item.IsRecentlyVerified,
          dateLastVerified: new Date(item.DateLastVerified),
          id: item.ID,
          uuid: item.UUID,
          dataProviderId: item.DataProviderID,
          operatorId: item.OperatorID,
          usageTypeId: item.UsageTypeID,
          addressInfo: addresses.find((addr: any) => addr?.id === item?.AddressInfo?.ID)?._id,
          connections: connectionList
            .filter((conn: any) => item.Connections.some((c: any) => c.ID === conn.id))
            .map((obj: any) => obj._id),
          numberOfPoints: item.NumberOfPoints,
          statusTypeId: item.StatusTypeID,
          dateLastStatusUpdate: new Date(item.DateLastStatusUpdate),
          dataQualityLevel: item.DataQualityLevel,
          dateCreated: new Date(item.DateCreated),
          submissionStatusTypeId: item.SubmissionStatusTypeID,
          _id: existingRecord ? existingRecord._id : uuidv4(),
        };
      });

      const chargingStationsList = await Promise.all(chargingStationsPromises);

      const bulkData = {
        chargingStationsList,
        addresses,
        connectionList,
      };
      await this.repository.bulkUpsert(bulkData);
      logger.info('Data imported successfully');
    } catch (error: any) {
      logger.error(`Data import failed: ${error.message}`);
      throw new APIError(error.message);
    }
  }

  runWorker(limit: number): any {
    return new Promise((resolve, reject) => {
      const worker = new Worker('./dist/workers/worker.js', {
        workerData: { limit, path: '../src/workers/worker.ts' },
      });
      worker.on('message', (message: any) => {
        if (message.type === 'error') {
          logger.error(`error from worker: ${message.message}`);
          reject(message);
        } else {
          resolve(true);
        }
      });
      worker.on('error', (error: any) => {
        reject(error.message);
      });
      worker.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`Worker stopped with exit code ${code}`));
          worker.terminate();
        }
      });
    });
  }

  async importDataConcurrently(): Promise<void> {
    const BATCH_SIZE = parseInt(process.env.BATCH_SIZE as string);
    const CONCURRENCY = parseInt(process.env.CONCURRENCY as string);
    const promises = [];
    try {
      for (let i = 0; i < CONCURRENCY; i++) {
        promises.push(this.runWorker(BATCH_SIZE));
      }
      await Promise.all(promises);
      promises.length = 0;
    } catch (error: any) {
      throw new APIError(error.message);
    }
  }
}
