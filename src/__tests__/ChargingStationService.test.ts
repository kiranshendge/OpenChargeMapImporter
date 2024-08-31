import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { IChargingStationRepository } from '../infrastructure/repository/IChargingStationRepository';
import { MockChargingStationRepository } from '../infrastructure/repository/MockChargingStationRepository';
import { ChargingStationService } from '../service/ChargingStationService';
import mongoose from 'mongoose';
import mockData from './mockData/chargingStationData.json';
import { createClient } from 'redis';
import { Worker } from 'worker_threads';

jest.mock('redis', () => ({
  createClient: jest.fn().mockReturnValue({
    get: jest.fn(),
    set: jest.fn(),
    on: jest.fn(),
    connect: jest.fn().mockResolvedValue(undefined),
  }),
}));

jest.mock('worker_threads', () => ({
  Worker: jest.fn(),
}));

const mockWorker = Worker as jest.MockedClass<typeof Worker>;

describe('Charging station Service', () => {
  const mockAxios = new MockAdapter(axios);
  let repository: any;
  let mockConnection: mongoose.Connection;
  const redisClient = createClient();
  let workerInstance: any;

  beforeEach(() => {
    repository = new MockChargingStationRepository(mockConnection);
    workerInstance = {
      on: jest.fn(),
      terminate: jest.fn(),
    };
    mockWorker.mockImplementation(() => workerInstance);
    jest.clearAllMocks();
  });
  afterEach(() => {
    mockAxios.reset();
  });

  describe('Fetch data function', () => {
    it('fetches data successfully', async () => {
      const service = new ChargingStationService(repository, mockConnection);
      const mockResponse = { data: 'mocked data' };
      mockAxios.onGet('https://api.openchargemap.io/v3/poi/').reply(200, mockResponse);

      const result = await service.fetchOpenChargeMapData(10);
      expect(result).toEqual(mockResponse);
    });

    it('handles API key authentication error', async () => {
      const service = new ChargingStationService(repository, mockConnection);
      mockAxios.onGet('https://api.openchargemap.io/v3/poi/').reply(403);

      await expect(service.fetchOpenChargeMapData(10)).rejects.toThrow('Invalid API key');
    });
  });

  describe('import data function', () => {
    it('should import data successfully', async () => {
      const service = new ChargingStationService(repository, mockConnection);
      const chargingStationsData: any = mockData;
      jest.spyOn(repository, 'bulkUpsert').mockImplementationOnce(() => Promise.resolve({}));
      await service.importDataToDB(chargingStationsData);
      expect(repository.bulkUpsert).toHaveBeenCalled();
    });

    it('should handle import failure', async () => {
      const service = new ChargingStationService(repository, mockConnection);
      const chargingStationData: any = mockData;
      const mockError = new Error('Data import failed');
      jest.spyOn(repository, 'bulkUpsert').mockRejectedValueOnce(mockError);
      await expect(service.importDataToDB(chargingStationData)).rejects.toThrow(
        'Data import failed',
      );
    });
  });

  describe('import data concurrently function', () => {
    it('should run workers concurrently', async () => {
      process.env.BATCH_SIZE = '100';
      process.env.CONCURRENCY = '2';
      const service = new ChargingStationService(repository, mockConnection);
      const mockRunWorker = jest.fn().mockResolvedValueOnce(true);
      await service.importDataConcurrently.call({
        runWorker: mockRunWorker,
      });
      expect(mockRunWorker).toHaveBeenCalledTimes(2);
    });

    it('should throw error', async () => {
      process.env.BATCH_SIZE = '100';
      process.env.CONCURRENCY = '2';
      const service = new ChargingStationService(repository, mockConnection);
      const mockError = new Error('run worker failed');
      const mockRunWorker = jest.fn().mockRejectedValueOnce(mockError);
      await expect(
        service.importDataConcurrently.call({
          runWorker: mockRunWorker,
        }),
      ).rejects.toThrow(mockError);
    });
  });

  describe('get cached data', () => {
    it('should return cached data if available', async () => {
      const service = new ChargingStationService(repository, mockConnection);
      const mockCachedData = JSON.stringify([{ ID: 1, Title: 'Charging Station 1' }]);
      jest.spyOn(redisClient, 'get').mockResolvedValueOnce(mockCachedData);

      const result = await service.getCachedData(10);

      expect(redisClient.get).toHaveBeenCalledWith('openchargemap:ChargingStations');
      expect(result).toEqual(JSON.parse(mockCachedData));
    });

    it('should fetch data and cache it if not available in cache', async () => {
      const service = new ChargingStationService(repository, mockConnection);
      const mockFetchedData = [{ ID: 1, Title: 'Charging Station 1' }];
      jest.spyOn(redisClient, 'get').mockResolvedValueOnce(null);

      // Mock the fetchData method
      const fetchDataMock = jest.fn().mockResolvedValue(mockFetchedData);
      service.fetchOpenChargeMapData = fetchDataMock;

      const result = await service.getCachedData(10);
      expect(redisClient.get).toHaveBeenCalledWith('openchargemap:ChargingStations');
      expect(fetchDataMock).toHaveBeenCalledWith(10);
      expect(redisClient.set).toHaveBeenCalledWith(
        'openchargemap:ChargingStations',
        JSON.stringify(mockFetchedData),
        { EX: 3600 },
      );
      expect(result).toEqual(mockFetchedData);
    });
  });

  describe('run worker', () => {
    it('should resolve when worker sends a success message', async () => {
      const service = new ChargingStationService(repository, mockConnection);
      const limit = 10;
      const promise = service.runWorker(limit);

      const messageHandler = workerInstance.on.mock.calls.find(
        (call: string[]) => call[0] === 'message',
      )[1];
      messageHandler({ type: 'success' });

      await expect(promise).resolves.toBe(true);
    });

    it('should reject when worker sends an error message', async () => {
      const service = new ChargingStationService(repository, mockConnection);
      const limit = 10;
      const promise = service.runWorker(limit);

      const messageHandler = workerInstance.on.mock.calls.find(
        (call: string[]) => call[0] === 'message',
      )[1];
      messageHandler({ type: 'error', message: 'Something went wrong' });

      await expect(promise).rejects.toEqual({ type: 'error', message: 'Something went wrong' });
    });

    it('should reject when worker emits an error event', async () => {
      const service = new ChargingStationService(repository, mockConnection);
      const limit = 10;
      const promise = service.runWorker(limit);

      const errorHandler = workerInstance.on.mock.calls.find(
        (call: string[]) => call[0] === 'error',
      )[1];
      errorHandler(new Error('Worker error'));

      await expect(promise).rejects.toBe('Worker error');
    });

    it('should reject when worker exits with a non-zero code', async () => {
      const service = new ChargingStationService(repository, mockConnection);
      const limit = 10;
      const promise = service.runWorker(limit);

      const exitHandler = workerInstance.on.mock.calls.find(
        (call: string[]) => call[0] === 'exit',
      )[1];
      exitHandler(1);

      await expect(promise).rejects.toThrow('Worker stopped with exit code 1');
      expect(workerInstance.terminate).toHaveBeenCalled();
    });
  });
});
