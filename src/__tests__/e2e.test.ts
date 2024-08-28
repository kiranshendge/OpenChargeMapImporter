import request from 'supertest';
import express from 'express';
import dotenv from 'dotenv';
import { ApolloServer, gql } from 'apollo-server-express';
import {resolvers } from '../resolvers/resolver';
import { ChargingStationService } from '../service/ChargingStationService';
import { ChargingStationRepository } from '../infrastructure/repository/ChargingStationRepository';

dotenv.config();

const typeDefs = gql`
 type AddressInfo {
   id: Int
   title: String
   addressLine1: String
   town: String
   stateOrProvince: String
   postcode: String
   countryId: Int
   latitude: Float
   longitude: Float
   distanceUnit: Int
 }

 type Connection {
   id: Int
   connectionTypeId: Int
   statusTypeId: Int
   levelId: Int
   powerKW: Float
   quantity: Int
 }

 type ChargingStation {
   isRecentlyVerified: Boolean
   dateLastVerified: String
   id: Int
   uuid: String
   dataProviderId: Int
   operatorId: Int
   usageTypeId: Int
   addressInfo: AddressInfo
   connections: [Connection]
   numberOfPoints: Int
   statusTypeId: Int
   dateLastStatusUpdate: String
   dataQualityLevel: Int
   dateCreated: String
   submissionStatusTypeId: Int
 }

 type response {
  statusCode: Int
  body: String
 }
 type Query {
  chargingStations: [ChargingStation!]!
 }
 type Mutation {
   importChargingStations: response!
 }
`;

describe('GraphQL API', () => {
    let app: any;
    let chargingStationService: ChargingStationService;
    let chargingStationRepository: ChargingStationRepository;
    beforeAll(async () => {
        chargingStationRepository = new ChargingStationRepository();
        chargingStationService = new ChargingStationService(chargingStationRepository);
        const server = new ApolloServer({
          typeDefs,
          resolvers,
          context: () => ({ chargingStationService }),
          formatError: (error) => {
            return error;
          },
        });
        await server.start();
        app = express();
        server.applyMiddleware({ app });
      });
  it('imports data from OpenChargeMap API to MongoDB', async () => {
    const apiKey = process.env.OPENCHARGEMAP_API_KEY; // Replace with your actual API key
    const response = await request(app)
      .post('/graphql')
      .send({
        query: `
          mutation {
            importChargingStations()
          }
        `,
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data).toBe('Import completed');
  });
});
