import { ChargingStationRepository } from '../infrastructure/repository/ChargingStationRepository';
import { ChargingStation } from '../models/ChargingStation';
import axios from 'axios';
import { rateLimit } from '../utils/rateLimiter';
import { retryOperation } from '../utils/retryPolicy';
import { IChargingStationService } from './IChargingStationService';
import { inject, injectable } from 'inversify';
import { v4 as uuidv4} from 'uuid';
import logger from '../utils/logger';

@injectable()
export class ChargingStationService implements IChargingStationService {
  constructor(@inject('IChargingStationRepository') private repository: ChargingStationRepository) {}

  async fetchData(maxresults: number): Promise<any> {
    try {
      const response = await axios.get('https://api.openchargemap.io/v3/poi/', {
        params: {
          key: process.env.OPENCHARGEMAP_API_KEY,
          maxresults
        }
      });
      return response.data;
    }
    catch (error: any) {
      logger.error(`Error while fetching data from openchargemap API: ${error.message}`);
      throw new Error(`Failed to fetch data from API: ${error.message}`)
    }
  };

  async fetchDataWithRetryRateLimit(maxresults: number): Promise<any> {
    return retryOperation(rateLimit(await this.fetchData(maxresults)));
  }

  async importData(): Promise<void> {
    try {
      let chargingStations = await this.fetchData(10);
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
        stationId: item.ID,
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
      throw new Error('Data import failed');
    }
  }

  async getAllStations(): Promise<ChargingStation[]> {
      return this.repository.getAll();
  }
}
