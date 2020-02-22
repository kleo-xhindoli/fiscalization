import { config } from 'dotenv-safe';
import path from 'path';
import { Clients } from './types';

const env = process.env.NODE_ENV || 'development';
let envFile = env === 'test' ? '.env.test' : '.env';

if (process.env.NODE_ENV != 'production') {
  config({
    path: path.join(__dirname, `../${envFile}`),
    sample: path.join(__dirname, '../.env.example'),
  });
}

const port = process.env.API_PORT as string;
const apiBasePath = process.env.API_BASE_PATH as string;
const fiscSoftwareNumber = process.env.FISCALIZATION_SOFTWARE_NUMBER as string;
const fiscManufacturerNumber = process.env
  .FISCALIZATION_MANUFACTURER_NUMBER as string;
const fiscEndpoint = process.env.FISCALIZATION_ENDPOINT as string;

const clients: Clients = {
  [process.env.MAGNUM_API_KEY as string]: { name: 'magnum' },
};

export default {
  env,
  apiBasePath,
  port,
  clients,
  fiscSoftwareNumber,
  fiscManufacturerNumber,
  fiscEndpoint,
};
