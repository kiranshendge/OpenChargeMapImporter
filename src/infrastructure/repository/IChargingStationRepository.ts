import { Model } from 'mongoose';
import { ChargingStation } from '../../models/ChargingStation';

export interface IChargingStationRepository {
  bulkUpsert(chargingStations: ChargingStation[]): Promise<void>;
  checkRecordExists(model: Model<any>, id: number): Promise<any>;
}
