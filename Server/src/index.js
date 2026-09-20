require('dotenv').config();
const buildApp = require('./app');

const start = async () => {
  const app = await buildApp();
  const port = process.env.PORT || 3001;
  const host = process.env.HOST || '0.0.0.0';

  try {
    await app.listen({ port, host });
    console.log(`StreamX API live → http://${host}:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
