import { injectable } from "inversify";
import { ChargingStationModel, address, connection } from '../../models/ChargingStationModel'
import { ChargingStation } from "../../models/ChargingStation";
import { IChargingStationRepository } from "./IChargingStationRepository";
import logger from "../../utils/logger";

@injectable()
export class ChargingStationRepository implements IChargingStationRepository {
    async bulkUpsert(data: any): Promise<void> {
      try{
        await address.insertMany(data.addresses);
        await connection.insertMany(data.connectionList);
        await ChargingStationModel.insertMany(data.chargingStations);
      }
      catch (error: any) {
        logger.error(`error during insert to mongodb: ${error.message}`);
        throw new Error(`error during insert to mongodb: ${error.message}`)
      }
      }

      async getAll(): Promise<ChargingStation[]> {
        return ChargingStationModel.find().populate(['addressInfo', 'connections']);
      }
}