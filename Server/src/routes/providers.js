const providerConfig = require('../config/providers');

async function providersRoutes(fastify) {
  // GET /api/providers  →  { default, providers: [...] }
  fastify.get('/providers', async (request, reply) => {
    return {
      default: providerConfig.default,
      providers: providerConfig.providers
    };
  });

  // GET /api/providers/:id  →  single provider or 404
  fastify.get('/providers/:id', async (request, reply) => {
    const found = providerConfig.providers.find(
      (p) => p.id === request.params.id
    );
    if (!found) {
      return reply.code(404).send({ ok: false, error: 'Unknown provider' });
    }
    return found;
  });
}

module.exports = providersRoutes;
