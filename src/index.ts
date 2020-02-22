import config from './config';
import logger from './api/config/logger';
import app from './api/config/express';
import initSoap from './api/config/soap';

const { port, env } = config;

export const server = app.listen(port, async () => {
  try {
    await initSoap();
    logger.info(`server started on port ${port} (${env})`);
  } catch (e) {
    logger.error(
      '[FATAL | INIT]: Could not connect to the fiscalization soap endpoint.',
      e
    );
    process.exit(1);
  }
});

export default app;
