async function healthRoutes(fastify, options) {
  fastify.get('/health', async (request, reply) => {
    return {
      status: 'live',
      service: 'StreamX API',
      timestamp: Date.now()
    };
  });
}

module.exports = healthRoutes;
