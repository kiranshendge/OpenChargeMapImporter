import { parentPort, workerData } from 'worker_threads';
import { ChargingStationService } from '../service/ChargingStationService';
import { ChargingStationRepository } from '../infrastructure/repository/ChargingStationRepository';
import { connectDB } from '../infrastructure/dbConnection';
import mongoose from 'mongoose';
import { ChargingStation } from '../dto/ChargingStationDto';

const run = async () => {
  try {
    const { limit } = workerData;
    await connectDB();
    const dbConnection = mongoose.connection;
    const chargingRepo = new ChargingStationRepository(dbConnection);
    const chargingStationService = new ChargingStationService(chargingRepo, dbConnection);
    const data: ChargingStation[] = await chargingStationService.getCachedData(limit);
    await chargingStationService.importDataToDB(data);
    parentPort?.postMessage('done');
  } catch (error: any) {
    parentPort?.postMessage({ type: 'error', message: error.message });
  }
};

run().catch(console.error);
