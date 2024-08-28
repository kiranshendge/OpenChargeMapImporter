import { parentPort, workerData } from 'worker_threads';
import axios from 'axios';
import { v4 as uuidv4} from 'uuid';
import { chargingStations } from './models/ChargingStationModel';
import { ChargingStationService } from './service/ChargingStationService';
import { ChargingStationRepository } from './infrastructure/repository/ChargingStationRepository';

const chargingRepo = new ChargingStationRepository();
const chargingStationService = new ChargingStationService(chargingRepo);

const fetchData = async (maxresults: number) => {
  const response = await axios.get('https://api.openchargemap.io/v3/poi/', {
    params: {
      key: process.env.OPENCHARGEMAP_API_KEY,
      maxresults
    }
  });
  return response.data;
};

const importData = async (data: any) => {
  const bulkOps = data.map((item: any) => ({
    updateOne: {
      filter: { stationId: item.ID },
      update: { $set: item },
      upsert: true
    }
  }));
  await chargingStations.bulkWrite(bulkOps);
};

const fetchAllChargingStation = async(limit: number) => {
  let allStations = [];
  while (true) {
    const batchPOIs = await fetchData(limit);
    if (batchPOIs.length === 0) break; // No more data
    allStations.push(...batchPOIs);
  }
}
const run = async () => {
  const { offset, limit } = workerData;
  const data = await fetchData(limit);
  // await chargingStationService.importData(data);
  parentPort?.postMessage('done');
};

run()
.catch(console.error);

