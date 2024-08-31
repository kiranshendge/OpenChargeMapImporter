import { ChargingStationService } from '../service/ChargingStationService';
import { successResponse } from '../utils/response';

export const resolvers = {
  Mutation: {
    importChargingStations: async (
      parent: any,
      args: any,
      context: { chargingStationService: ChargingStationService },
      info: any,
    ) => {
      const { chargingStationService } = context;
      await chargingStationService.importDataConcurrently();
      return successResponse('Import completed');
    },
  },
};
