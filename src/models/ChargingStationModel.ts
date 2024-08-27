import { Schema, model } from 'mongoose';
import { AddressInfo, ChargingStation, Connection } from './ChargingStation';
import { v4 as uuidv4} from 'uuid';

const AddressInfoSchema = new Schema({
  _id: { type: String, default: uuidv4 },
  id: { type: Number, alias:'ID'},
  title: { type: String, alias:'Title'},
  addressLine1: { type: String, alias:'AddressLine1'},
  town: { type: String, alias:'Town'},
  stateOrProvince: { type: String, alias:'StateOrProvince'},
  postcode: { type: String, alias:'Postcode'},
  countryId: { type: Number, alias:'CountryID'},
  latitude: { type: Number, alias:'Latitude'},
  longitude: { type: Number, alias:'Longitude'},
  distanceUnit: { type: Number, alias:'DistanceUnit'}
});

const ConnectionSchema = new Schema({
  _id: { type: String, default: uuidv4 },
  id: { type: Number, alias:'ID'},
  connectionTypeId: { type: Number, alias:'ConnectionTypeID'},
  statusTypeId: { type: Number, alias:'StatusTypeID'},
  levelId: { type: Number, alias:'LevelID'},
  powerKW: { type: Number, alias:'PowerKW'},
  quantity: { type: Number, alias:'Quantity'}
});

const ChargingStationSchema = new Schema<any>({
  _id: { type: String, default: uuidv4 },
  isRecentlyVerified: { type: Boolean, alias:'IsRecentlyVerified'},
  dateLastVerified: { type: Date, alias:'DateLastVerified'},
  stationId: { type: Number, alias:'ID'},
  uuid: { type: String, alias:'UUID'},
  dataProviderId: { type: Number, alias:'DataProviderID'},
  operatorId: { type: Number, alias:'OperatorID'},
  usageTypeId: { type: Number, alias:'UsageTypeID'},
  addressInfo: { type: String, ref: 'Address', require: true},
  connections: [{ type: String, ref: 'Connection', require: true}],
  numberOfPoints: { type: Number, alias:'NumberOfPoints'},
  statusTypeId: { type: Number, alias:'StatusTypeID'},
  dateLastStatusUpdate: { type: Date, alias:'DateLastStatusUpdate'},
  dataQualityLevel: { type: Number, alias:'DataQualityLevel'},
  dateCreated: { type: Date, alias:'DateCreated'},
  submissionStatusTypeId: { type: Number, alias:'SubmissionStatusTypeID'}
},
{
  toJSON: {
      transform(doc, ret, options) {
          delete ret.__v;
          delete ret.createdAt;
          delete ret.updatedAt;
          delete ret._id;
      }
  },
  timestamps: true,
});

// ChargingStationSchema.virtual('addressAlias')
//   .get(function() {
//     return this.address;
//   })
//   .set(function(value) {
//     this.address = value;
//   });

// ChargingStationSchema.virtual('connectionsAlias')
//   .get(function() {
//     return this.connections;
//   })
//   .set(function(value) {
//     this.connections = value;
//   });

export const address = model<AddressInfo>('Address', AddressInfoSchema);
export const connection = model<Connection>('Connection', ConnectionSchema);

export const ChargingStationModel = model<ChargingStation>('ChargingStation', ChargingStationSchema);