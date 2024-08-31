export class AddressInfo {
  ID!: number;
  Title!: string;
  AddressLine1!: string;
  Town!: string;
  StateOrProvince!: string;
  Postcode!: string;
  CountryID!: number;
  Latitude!: number;
  Longitude!: number;
  DistanceUnit!: number;
}

export class Connection {
  ID!: number;
  ConnectionTypeID!: number;
  StatusTypeID!: number;
  LevelID!: number;
  PowerKW!: number;
  Quantity!: number;
}

export class ChargingStation {
  IsRecentlyVerified!: boolean;
  DateLastVerified!: Date;
  ID!: number;
  UUID!: string;
  DataProviderID!: number;
  OperatorID!: number;
  UsageTypeID!: number;
  AddressInfo!: AddressInfo;
  Connections!: Connection[];
  NumberOfPoints!: number;
  StatusTypeID!: number;
  DateLastStatusUpdate!: Date;
  DataQualityLevel!: number;
  DateCreated!: Date;
  SubmissionStatusTypeID!: number;
}
