import cron from 'node-cron';
import logger from '../utils/logger';
import { APIError } from '../utils/error';
import { ChargingStationService } from '../service/ChargingStationService';
import { ChargingStationRepository } from '../infrastructure/repository/ChargingStationRepository';
import mongoose from 'mongoose';

export const startScheduler = () => {
  cron.schedule('0 0 * * *', async () => {
    try {
      const repository = new ChargingStationRepository(mongoose.connection);
      const chargingStationService = new ChargingStationService(repository, mongoose.connection);
      await chargingStationService.importDataConcurrently();
      logger.info(`Data imported successfully through scheduler`);
    } catch (error: any) {
      logger.error(error.message);
      throw new APIError('error in data import');
    }
  });
};
