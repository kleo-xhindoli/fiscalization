import { config } from 'dotenv-safe';
import path from 'path';

const env = process.env.NODE_ENV || 'development';
const envFile = '.env';

config({
  path: path.join(__dirname, `../${envFile}`),
  sample: path.join(__dirname, '../.env.example'),
});

const port = process.env.API_PORT as string;
const apiBasePath = process.env.API_BASE_PATH as string;

export default {
  env,
  apiBasePath,
  port,
};
