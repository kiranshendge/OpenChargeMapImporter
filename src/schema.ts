import { gql } from 'apollo-server-express';

export const typeDefs = gql`
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

  type respBody {
    message: String!
    data: String
  }

  type response {
    statusCode: Int
    body: respBody
  }
  type Query {
    chargingStations: [ChargingStation!]!
  }
  type Mutation {
    importChargingStations: response!
  }
`;
