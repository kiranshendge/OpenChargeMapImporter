import { ChargingStationRepository } from '../infrastructure/repository/ChargingStationRepository';
import { ChargingStation } from '../models/ChargingStation';
import axios from 'axios';
import { limiter} from '../utils/rateLimiter';
import { IChargingStationService } from './IChargingStationService';
import { inject, injectable } from 'inversify';
import { v4 as uuidv4} from 'uuid';
import logger from '../utils/logger';
import { Worker } from 'worker_threads';
import path from 'path';
import 'reflect-metadata';
import { stringify } from 'querystring';

@injectable()
export class ChargingStationService implements IChargingStationService {
  constructor(@inject('IChargingStationRepository') private repository: ChargingStationRepository) {}

  async fetchData(maxresults: number, retries = 5): Promise<any> {
    try {
      const response = await limiter.schedule(() => axios.get('https://api.openchargemap.io/v3/poi/', {
        params: {
          key: process.env.OPENCHARGEMAP_API_KEY,
          maxresults
        }
      }));
      return response.data;
    }
    catch (error: any) {
      logger.error("errror:", JSON,stringify(error))
      if (retries > 0 && error.response && error.response.status === 403) {
        logger.error('Authentication error: Invalid API key');
        throw new Error('Invalid API key');
      } else if (retries > 0) {
        const delay = Math.pow(2, 5 - retries) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        return await this.fetchData(retries - 1);
      } else {
        logger.error(`Error while fetching data from openchargemap API: ${error.message}`);
        throw new Error(`Failed to fetch data from API: ${error.message}`)
      }
    }
  };

  async importData(): Promise<any> {
    try {
      let chargingStations = await this.fetchData(30);
      const addresses = chargingStations.map((item: { AddressInfo: any; }) => ({
          id: item.AddressInfo.ID,
          title:item.AddressInfo.Title,
          addressLine1: item.AddressInfo.AddressLine1,
          town: item.AddressInfo.Town,
          stateOrProvince: item.AddressInfo.StateOrProvince,
          postcode: item.AddressInfo.Postcode,
          countryId: item.AddressInfo.CountryID,
          latitude: item.AddressInfo.Latitude,
          longitude: item.AddressInfo.Longitude,
          distanceUnit: item.AddressInfo.DistanceUnit,
          _id: uuidv4()
      }));
  
      const connectionList = chargingStations.flatMap((item: { Connections: any; }) => 
          item.Connections.map((connection: any) => ({
            id: connection.ID,
            connectionTypeId: connection.ConnectionTypeID,
            statusTypeId: connection.StatusTypeID,
            levelId: connection.LevelID,
            powerKW: connection.PowerKW,
            quantity: connection.Quantity,
            _id: uuidv4()
      })));
  
      chargingStations = chargingStations.map((item: any) => ({
        isRecentlyVerified: item.IsRecentlyVerified,
        dateLastVerified: new Date(item.DateLastVerified),
        id: item.ID,
        uuid: item.UUID,
        dataProviderId: item.DataProviderID,
        operatorId: item.OperatorID,
        usageTypeId: item.UsageTypeID,
        addressInfo: addresses.find((addr: any) => addr.id === item.AddressInfo.ID)._id,
        connections: connectionList.filter((conn: any) => item.Connections.some((c: any) => c.ID === conn.id)).map((obj:any) => obj._id),
        numberOfPoints: item.NumberOfPoints,
        statusTypeId: item.StatusTypeID,
        dateLastStatusUpdate: new Date(item.DateLastStatusUpdate),
        dataQualityLevel: item.DataQualityLevel,
        dateCreated: new Date(item.DateCreated),
        submissionStatusTypeId: item.SubmissionStatusTypeID
      }));
      
      const bulkData = {
        chargingStations,
        addresses,
        connectionList
      }
      await this.repository.bulkUpsert(bulkData);
      logger.info('Data imported successfully');
    }
    catch (error: any) {
      logger.error(`Data import failed: ${error.message}`);
      throw new Error(error.message);
    }
  }

  runWorker(offset: number, limit: number): any {
    return new Promise((resolve, reject) => {
      const worker = new Worker('./src/worker.js', {
        workerData: { offset, limit, path: './worker.ts' }
      });
      worker.on('message', resolve);
      worker.on('error', reject);
      worker.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`Worker stopped with exit code ${code}`));
          // worker.terminate();
        }
      });
    });
  };

  async importDataConcurrently(): Promise<void>{
    let offset = 0;
    const BATCH_SIZE = 100;
    const CONCURRENCY = 2;
    const promises = [];
    while (true) {
      for (let i = 0; i < CONCURRENCY; i++) {
        promises.push(this.runWorker(offset, BATCH_SIZE));
        offset += BATCH_SIZE;
      }
      await Promise.all(promises);
      promises.length = 0;
    }
  };

  async getAllStations(): Promise<ChargingStation[]> {
      return this.repository.getAll();
  }
}
