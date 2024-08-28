import { ChargingStation } from "../models/ChargingStation";

export interface IChargingStationService {
    importData(chargingStations: any): Promise<void>;
    getAllStations(): Promise<ChargingStation[]>;
}
