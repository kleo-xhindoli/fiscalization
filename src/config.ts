import { config } from 'dotenv-safe';
import path from 'path';
import fs from 'fs';
import { Client, Clients } from './types';

const env = process.env.NODE_ENV || 'development';
let envFile = '.env.example';

const envPath = path.join(__dirname, `../.env`);
if (fs.existsSync(envPath)) {
  envFile = '.env';
}

if (process.env.NODE_ENV != 'production') {
  config({
    path: path.join(__dirname, `../${envFile}`),
    sample: path.join(__dirname, '../.env.example'),
  });
}

const port = process.env.API_PORT as string;
const apiBasePath = process.env.API_BASE_PATH as string;

const clients: Clients = {
  [process.env.MAGNUM_API_KEY as string]: { name: 'magnum' },
};

export default {
  env,
  apiBasePath,
  port,
  clients,
};
