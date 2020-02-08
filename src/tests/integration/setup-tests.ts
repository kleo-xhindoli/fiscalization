import config from '../../config';
import logger from '../../api/config/logger';
import app from '../../api/config/express';

const { port, env } = config;

export function initializeServer() {
  return app.listen(port, () => {
    logger.info(`server started on port ${port} (${env})`);
  });
}

export default app;
