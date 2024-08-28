import { ChargingStationService } from '../service/ChargingStationService';
import { SuccessResponse } from '../utils/response';

export const resolvers = {
        Query: {
          chargingStations: async (parent: any, args: any, context: { chargingStationService: ChargingStationService; }, info: any) => {
            const {chargingStationService} = context;
            return await chargingStationService.getAllStations();
          },
        },
        Mutation: {
          importChargingStations: async (parent: any, args: any, context: { chargingStationService: ChargingStationService; }, info: any) => {
            const {chargingStationService} = context;
            await chargingStationService.importData();
            // await chargingStationService.importDataConcurrently();
            return SuccessResponse('Import completed');
          }
        }
};