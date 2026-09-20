const Fastify = require('fastify');
const cors = require('@fastify/cors');

const buildApp = async () => {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: true });

  app.register(require('./routes/health'));
  app.register(require('./routes/providers'), { prefix: '/api' });
  app.register(require('./routes/xvideos'), { prefix: '/api/xvideos' });
  app.register(require('./routes/enkuddi'), { prefix: '/api/enkuddi' });

  // keep old generic if it still exists
  try {
    app.register(require('./routes/scrape'), { prefix: '/api' });
  } catch (e) {}

  return app;
};

module.exports = buildApp;
