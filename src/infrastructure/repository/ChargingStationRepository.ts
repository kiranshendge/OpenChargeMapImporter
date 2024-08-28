import { injectable } from "inversify";
import { chargingStations, address, connection } from '../../models/ChargingStationModel'
import { ChargingStation } from "../../models/ChargingStation";
import { IChargingStationRepository } from "./IChargingStationRepository";
import logger from "../../utils/logger";
import 'reflect-metadata';

@injectable()
export class ChargingStationRepository implements IChargingStationRepository {
    async bulkUpsert(data: any): Promise<void> {
      try{
        const bulkAddressOps = this.upsert(data.addresses);
        await address.bulkWrite(bulkAddressOps);
        const bulkConnectionOps = this.upsert(data.connectionList);
        await connection.bulkWrite(bulkConnectionOps);
        const bulkChargingStnOps = this.upsert(data.chargingStations);
        await chargingStations.bulkWrite(bulkChargingStnOps);
      }
      catch (error: any) {
        logger.error(`error during insert to mongodb: ${error.message}`);
        throw new Error(`error during insert to mongodb: ${error.message}`)
      }
      }

      async getAll(): Promise<ChargingStation[]> {
        return chargingStations.find().populate(['addressInfo', 'connections']);
      }

      upsert(model: any): any {
        const bulkOps = model.map((item: any) => ({
          updateOne: {
            filter: { id: item.id },
            update: { $set: item },
            upsert: true
          }
        }));
        return bulkOps;
      }
}