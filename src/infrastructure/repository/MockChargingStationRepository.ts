import { IChargingStationRepository } from './IChargingStationRepository';
import { chargingStations } from '../../models/ChargingStationModel';
import mongoose, { Model } from 'mongoose';
import { ChargingStation } from '../../models/ChargingStation';

export class MockChargingStationRepository implements IChargingStationRepository {
  private readonly dbConnection: mongoose.Connection;
  constructor(dbConnection: mongoose.Connection) {
    this.dbConnection = dbConnection;
  }
  bulkUpsert(chargingStations: ChargingStation[]): Promise<void> {
    const mockData = [
      {
        _id: 123,
        ...chargingStations,
      },
    ] as unknown;
    return Promise.resolve();
  }
  checkRecordExists(model: Model<any>, id: number): Promise<any> {
    const mockData = { _id: '02400f3c-54f3-4d9a-be42-f433d4b2f8c9' };
    return Promise.resolve(mockData);
  }
}
