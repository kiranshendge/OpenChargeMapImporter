import { resolvers } from '../resolvers/resolver';
import axios from 'axios';
import mockData from './mockData/chargingStationData.json';
import mongoose, { ConnectOptions } from 'mongoose';
import { ChargingStationService } from '../service/ChargingStationService';
import { ApolloServer, gql } from 'apollo-server-express';
import { createClient } from 'redis';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { typeDefs } from '../schema';

// Mock the axios.get function to simulate the OpenChargeMap API response
jest.mock('axios');
const mockRequest = mockData;

(axios.get as jest.MockedFunction<typeof axios.get>).mockResolvedValue({ data: mockRequest });

let mongoServer: MongoMemoryServer;
let redisClient: ReturnType<typeof createClient>;
let repository: any;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as ConnectOptions);

  redisClient = createClient();
  await redisClient.connect();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  await redisClient.quit();
});

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: () => ({
    chargingStationService: new ChargingStationService(repository, mongoose.connection),
  }),
});

describe('E2E Test for Importing Charging Stations', () => {
  it('should import charging stations and store them in MongoDB', async () => {
    const IMPORT_CHARGING_STATIONS = gql`
      mutation {
        importChargingStations {
          body {
            message
            data
          }
          statusCode
        }
      }
    `;

    const response = await server.executeOperation({ query: IMPORT_CHARGING_STATIONS });

    expect(response.data).toBeDefined();
    expect(response.data?.importChargingStations.body.data).toBe('Import completed');
  });
});
