import { chargingStations, address, connection } from '../../models/ChargingStationModel';
import { ChargingStation } from '../../models/ChargingStation';
import { IChargingStationRepository } from './IChargingStationRepository';
import logger from '../../utils/logger';
import { createBulkOps } from '../../utils/bulkOps';
import mongoose, { Model } from 'mongoose';

export class ChargingStationRepository implements IChargingStationRepository {
  private readonly dbConnection: mongoose.Connection;
  constructor(dbConnection: mongoose.Connection) {
    this.dbConnection = dbConnection;
  }
  async bulkUpsert(data: any): Promise<void> {
    const session = await this.dbConnection.startSession();
    session.startTransaction();
    try {
      const bulkAddressOps = createBulkOps(data.addresses);
      await address.bulkWrite(bulkAddressOps);
      const bulkConnectionOps = createBulkOps(data.connectionList);
      await connection.bulkWrite(bulkConnectionOps);
      const bulkChargingStnOps = createBulkOps(data.chargingStationsList);
      await chargingStations.bulkWrite(bulkChargingStnOps);
      await session.commitTransaction();
    } catch (error: any) {
      await session.abortTransaction();
      logger.error(`error during insert to mongodb: ${error.message}`);
      throw new Error(`error during insert to mongodb: ${error.message}`);
    }
    finally {
      session.endSession()
    }
  }

  async checkRecordExists<T extends Document>(model: Model<T>, id: number): Promise<any> {
    try {
      const data = await model.findOne({ id: id });
      return data;
    } catch (error: any) {
      logger.error(`error fetching data by Id: ${error.message}`);
      throw new Error(error);
    }
  }
}
