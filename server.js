const dotenv = require('dotenv');
const createConnection = require('./config/db');

process.on('uncaughtException', (err) => {
  console.log({ errorName: err.name, error: err.message });
  console.log('uncaught Exception... shutting down');

  process.exit(1);
});

dotenv.config({ path: './config/config.env' });
const app = require('./app');

(async () => await createConnection())();

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log('server listening...');
});

process.on('unhandledRejection', (err) => {
  console.log({ errorName: err.name, error: err.message });
  console.log('Unhandled Rejection... shutting down');

  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM recieved... shutting down');
  server.close(() => {
    console.log('process terminated 😴');
  });
});
