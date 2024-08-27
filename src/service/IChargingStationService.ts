import { ChargingStation } from "../models/ChargingStation";

export interface IChargingStationService {
    importData(): Promise<void>;
    getAllStations(): Promise<ChargingStation[]>;
}
