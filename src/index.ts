import express from 'express';
import { ApolloServer, gql } from 'apollo-server-express';
import dotenv from 'dotenv';
import { resolvers } from './resolvers/resolver';
import 'reflect-metadata';
import { connectDB } from './infrastructure/dbConnection';
import { ChargingStationService } from './service/ChargingStationService';
import { ChargingStationRepository } from './infrastructure/repository/ChargingStationRepository';

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
   stationId: Int
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

const startServer = async () => {
  await connectDB();
  const chargingRepo = new ChargingStationRepository();
  const chargingStationService = new ChargingStationService(chargingRepo);

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: () => ({ chargingStationService }),
  });
  await server.start();
  const app: any = express();
  server.applyMiddleware({ app });
  app.listen({ port: process.env.PORT }, () =>
    console.log(`Server ready at http://localhost:4000${server.graphqlPath}`)
  );
};

startServer().catch(console.error);
