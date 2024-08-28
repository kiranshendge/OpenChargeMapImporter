import mongoose, { Schema, model } from 'mongoose';
import { AddressInfo, ChargingStation, Connection } from './ChargingStation';
import { v4 as uuidv4} from 'uuid';

type AddressInfoModel = {
  id: number;
  title: string;
  addressLine1: string;
  town: string;
  stateOrProvince: string;
  postcode: string;
  countryId: number;
  latitude: number;
  longitude: number;
  distanceUnit: number;
}

export type AddressDoc = mongoose.Document & AddressInfoModel;

const AddressInfoSchema = new Schema({
  _id: { type: String, default: uuidv4 },
  id: { type: Number, required: true},
  title: { type: String, required: true},
  addressLine1: { type: String, required: true},
  town: { type: String, required: true},
  stateOrProvince: { type: String, required: true},
  postcode: { type: String, required: true},
  countryId: { type: Number, required: true},
  latitude: { type: Number, required: true},
  longitude: { type: Number, required: true},
  distanceUnit: { type: Number, required: true}
});

type ConnectionModel = {
  id: number;
  connectionTypeId: number;
  statusTypeId: number;
  levelId: number;
  powerKW: number;
  quantity: number;
}

export type ConnectionDoc = mongoose.Document & ConnectionModel;

const ConnectionSchema = new Schema({
  _id: { type: String, default: uuidv4 },
  id: { type: Number, required: true},
  connectionTypeId: { type: Number, required: true},
  statusTypeId: { type: Number, required: true},
  levelId: { type: Number, required: true},
  powerKW: { type: Number, required: true},
  quantity: { type: Number, required: true}
});

type ChargingStationModel = {
  isRecentlyVerified: boolean;
  dateLastVerified: Date;
  id: number;
  uuid: string;
  dataProviderId: number;
  operatorId: number;
  usageTypeId: number;
  addressInfo: AddressInfo;
  connections: Connection[];
  numberOfPoints: number;
  statusTypeId: number;
  dateLastStatusUpdate: Date;
  dataQualityLevel: number;
  dateCreated: Date;
  submissionStatusTypeId: number;
}

export type ChargingStationDoc = mongoose.Document & ChargingStationModel;

const ChargingStationSchema = new Schema<any>({
  _id: { type: String, default: uuidv4 },
  isRecentlyVerified: { type: Boolean, required: true},
  dateLastVerified: { type: Date, required: true},
  id: { type: Number, required: true},
  uuid: { type: String, required: true},
  dataProviderId: { type: Number, required: true},
  operatorId: { type: Number, required: true},
  usageTypeId: { type: Number, required: true},
  addressInfo: { type: String, ref: 'Address', required: true},
  connections: [{ type: String, ref: 'Connection', required: true}],
  numberOfPoints: { type: Number, required: true},
  statusTypeId: { type: Number, required: true},
  dateLastStatusUpdate: { type: Date, required: true},
  dataQualityLevel: { type: Number, required: true},
  dateCreated: { type: Date, required: true},
  submissionStatusTypeId: { type: Number, required: true}
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

const address = 
    mongoose.models.addressInfo ||
    mongoose.model<AddressDoc>('Address', AddressInfoSchema);

const connection = 
    mongoose.models.connections ||
    mongoose.model<ConnectionDoc>('Connection', ConnectionSchema);

const chargingStations = 
    mongoose.models.chargingStation ||
    mongoose.model<ChargingStationDoc>('ChargingStation', ChargingStationSchema);

export { address, connection, chargingStations };
// export const address = model<AddressInfo>('Address', AddressInfoSchema);
// export const connection = model<Connection>('Connection', ConnectionSchema);

// export const ChargingStationModel = model<ChargingStation>('ChargingStation', ChargingStationSchema);