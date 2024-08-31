import express from 'express';
import { ApolloServer, gql } from 'apollo-server-express';
import dotenv from 'dotenv';
import { resolvers } from './resolvers/resolver';
import 'reflect-metadata';
import { connectDB } from './infrastructure/dbConnection';
import { ChargingStationService } from './service/ChargingStationService';
import { ChargingStationRepository } from './infrastructure/repository/ChargingStationRepository';
import { GraphQLError } from 'graphql';
import mongoose from 'mongoose';
import { typeDefs } from './schema';
import { startScheduler } from './cronjob/dailyScheduler';

dotenv.config();

const startServer = async () => {
  await connectDB();
  const chargingRepo = new ChargingStationRepository(mongoose.connection);
  const chargingStationService = new ChargingStationService(chargingRepo, mongoose.connection);

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: () => ({ chargingStationService }),
    formatError: (error) => {
      return new GraphQLError(error.message);
    },
  });
  await server.start();
  const app: any = express();
  server.applyMiddleware({ app });
  app.listen({ port: process.env.PORT }, () =>
    console.log(`Server ready at http://localhost:4000${server.graphqlPath}`),
  );
  startScheduler();
};

startServer().catch(console.error);
