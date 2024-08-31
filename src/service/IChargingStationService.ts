import { ChargingStation } from '../dto/ChargingStationDto';

export interface IChargingStationService {
  fetchOpenChargeMapData(maxresults: number, retries?: number): Promise<ChargingStation[]>;
  getCachedData(maxresults: number): Promise<ChargingStation[]>;
  importDataToDB(chargingStations: ChargingStation[]): Promise<void>;
  runWorker(limit: number): any;
  importDataConcurrently(): Promise<void>;
}
