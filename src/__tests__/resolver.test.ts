import mongoose from 'mongoose';
import { MockChargingStationRepository } from '../infrastructure/repository/MockChargingStationRepository';
import { resolvers } from '../resolvers/resolver';
import { ChargingStationService } from '../service/ChargingStationService';

const mockChargingStationService = {
  importDataConcurrently: jest.fn(),
};

// Mock the SuccessResponse function
const SuccessResponse = jest.fn().mockReturnValue('Import completed');

describe('Resolvers', () => {
  describe('Mutation', () => {
    describe('importChargingStations', () => {
      let repository: any;
      let mockConnection: mongoose.Connection;
      let chargingStationService: ChargingStationService;
      let mockContext: any;
      beforeEach(() => {
        repository = new MockChargingStationRepository(mockConnection);
        chargingStationService = new ChargingStationService(repository, mockConnection);
      });
      it('should call importDataConcurrently and return success response', async () => {
        // Arrange
        const parent = {};
        const args = {};
        const info = {};
        mockContext = { chargingStationService: mockChargingStationService };
        const expectedResult = {
          body: { data: 'Import completed', message: 'success' },
          statusCode: 200,
        };

        // Act
        const result = await resolvers.Mutation.importChargingStations(
          parent,
          args,
          mockContext,
          info,
        );

        // Assert
        expect(mockChargingStationService.importDataConcurrently).toHaveBeenCalled();
        expect(result).toEqual(expectedResult);
      });
    });
  });
});
