import mongoose, { Model } from 'mongoose';
import { ChargingStationRepository } from '../infrastructure/repository/ChargingStationRepository';

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
