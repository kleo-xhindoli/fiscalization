import { config } from 'dotenv-safe';
import path from 'path';
import fs from "fs";

const env = process.env.NODE_ENV || 'development';
let envFile = '.env.example';

const envPath = path.join(__dirname, `../.env`);
if (fs.existsSync(envPath)){
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

export default {
  env,
  apiBasePath,
  port,
};
