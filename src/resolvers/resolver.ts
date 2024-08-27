import { ChargingStationService } from '../service/ChargingStationService';
import { SuccessResponse } from '../utils/response';

export const resolvers = {
        Query: {
          chargingStations: async (parent: any, args: any, context: { chargingStationService: ChargingStationService; }, info: any) => {
            const {chargingStationService} = context;
            const data = await chargingStationService.getAllStations();
            return SuccessResponse(data);
          },
        },
        Mutation: {
          importChargingStations: async (parent: any, args: any, context: { chargingStationService: ChargingStationService; }, info: any) => {
            const {chargingStationService} = context;
            await chargingStationService.importData();
            return SuccessResponse('Import completed');
          }
        }
};