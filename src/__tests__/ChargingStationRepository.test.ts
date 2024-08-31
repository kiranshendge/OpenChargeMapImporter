import mongoose, { Model } from 'mongoose';
import { ChargingStationRepository } from '../infrastructure/repository/ChargingStationRepository'; // Adjust the import path as needed
import { address, connection, chargingStations } from '../models/ChargingStationModel'; // Adjust the import paths as needed
import logger from '../utils/logger';

jest.mock('../models/ChargingStationModel', () => ({
  address: { bulkWrite: jest.fn() },
  connection: { bulkWrite: jest.fn() },
  chargingStations: { bulkWrite: jest.fn() },
}));

describe('bulkUpsert', () => {
  let repository: ChargingStationRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new ChargingStationRepository(mongoose.connection);
  });

  it('should perform bulk upsert operations for addresses, connections, and charging stations', async () => {
    const mockData = {
      addresses: [{ id: 1, name: 'Address 1' }],
      connectionList: [{ id: 2, name: 'Connection 1' }],
      chargingStationsList: [{ id: 3, name: 'Charging Station 1' }],
    };

    const mockBulkOpsAddresses = [
      {
        updateOne: {
          filter: { id: 1 },
          update: { $set: { id: 1, name: 'Address 1' } },
          upsert: true,
        },
      },
    ];
    const mockBulkOpsConnections = [
      {
        updateOne: {
          filter: { id: 2 },
          update: { $set: { id: 2, name: 'Connection 1' } },
          upsert: true,
        },
      },
    ];
    const mockBulkOpsChargingStations = [
      {
        updateOne: {
          filter: { id: 3 },
          update: { $set: { id: 3, name: 'Charging Station 1' } },
          upsert: true,
        },
      },
    ];

    await repository.bulkUpsert(mockData);

    expect(address.bulkWrite).toHaveBeenCalledWith(mockBulkOpsAddresses);
    expect(connection.bulkWrite).toHaveBeenCalledWith(mockBulkOpsConnections);
    expect(chargingStations.bulkWrite).toHaveBeenCalledWith(mockBulkOpsChargingStations);
  });

  it('should throw an error if bulk upsert fails', async () => {
    const mockData = {
      addresses: [{ id: 1, name: 'Address 1' }],
      connectionList: [{ id: 2, name: 'Connection 1' }],
      chargingStationsList: [{ id: 3, name: 'Charging Station 1' }],
    };

    const mockError = new Error('Bulk write failed');
    jest.spyOn(address, 'bulkWrite').mockRejectedValueOnce(mockError);

    await expect(repository.bulkUpsert(mockData)).rejects.toThrow(
      'error during insert to mongodb: Bulk write failed',
    );
  });
});

describe('checkRecordExists', () => {
  let mockModel: Partial<Model<Document>>;
  let repository: ChargingStationRepository;

  beforeEach(() => {
    mockModel = {
      findOne: jest.fn(),
    };
    repository = new ChargingStationRepository(mongoose.connection);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  test('should return data if record exists', async () => {
    const mockData = { id: 1, name: 'Test' };
    (mockModel.findOne as jest.Mock).mockResolvedValue(mockData);

    const result = await repository.checkRecordExists(mockModel as Model<Document>, 1);

    expect(result).toEqual(mockData);
    expect(mockModel.findOne).toHaveBeenCalledWith({ id: 1 });
  });

  test('should log error and throw if an error occurs', async () => {
    const mockError = new Error('Database error');
    (mockModel.findOne as jest.Mock).mockRejectedValue(mockError);

    await expect(repository.checkRecordExists(mockModel as Model<Document>, 1)).rejects.toThrow(
      'Database error',
    );
  });
});
