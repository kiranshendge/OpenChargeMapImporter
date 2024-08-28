export class AddressInfo {
    id!: number;
    title!: string;
    addressLine1!: string;
    town!: string;
    stateOrProvince!: string;
    postcode!: string;
    countryId!: number;
    latitude!: number;
    longitude!: number;
    distanceUnit!: number;
  }
  
  export class Connection {
    id!: number;
    connectionTypeId!: number;
    statusTypeId!: number;
    levelId!: number;
    powerKW!: number;
    quantity!: number;
  }
  
  export class ChargingStation {
    isRecentlyVerified!: boolean;
    dateLastVerified!: Date;
    id!: Date;
    uuid!: string;
    dataProviderId!: number;
    operatorId!: number;
    usageTypeId!: number;
    addressInfo!: AddressInfo;
    connections!: Connection[];
    numberOfPoints!: number;
    statusTypeId!: number;
    dateLastStatusUpdate!: Date;
    dataQualityLevel!: number;
    dateCreated!: Date;
    submissionStatusTypeId!: number;
  }
  