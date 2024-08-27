import { ChargingStation } from '../../models/ChargingStation';

export interface IChargingStationRepository {
    bulkUpsert(chargingStations: ChargingStation[]): Promise<void>;
    getAll(): Promise<ChargingStation[]>;
}
