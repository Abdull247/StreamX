const enkuddi = require('../services/scrapers/enkuddi');

async function enkuddiRoutes(fastify) {

  // GET /api/enkuddi/home?page=1&limit=24
  fastify.get('/home', async (req, reply) => {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 24, 50);
    try {
      return await enkuddi.scrapeHome({ page, limit });
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ ok: false, error: err.message });
    }
  });

  // POST /api/enkuddi/home
  fastify.post('/home', async (req, reply) => {
    const b = req.body || {};
    const page = parseInt(b.page) || 1;
    const limit = Math.min(parseInt(b.limit) || 24, 50);
    try {
      return await enkuddi.scrapeHome({ page, limit });
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ ok: false, error: err.message });
    }
  });

  // GET /api/enkuddi/search?q=...&page=1
  fastify.get('/search', async (req, reply) => {
    const q = req.query.q || req.query.query || '';
    if (!q.trim()) return reply.code(400).send({ ok: false, error: 'Missing q' });
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 24, 50);
    try {
      return await enkuddi.scrapeSearch({ q, page, limit });
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ ok: false, error: err.message });
    }
  });

  // POST /api/enkuddi/search
  fastify.post('/search', async (req, reply) => {
    const b = req.body || {};
    const q = b.q || b.query || '';
    if (!q.trim()) return reply.code(400).send({ ok: false, error: 'Missing q' });
    try {
      return await enkuddi.scrapeSearch({
        q,
        page: parseInt(b.page) || 1,
        limit: Math.min(parseInt(b.limit) || 24, 50)
      });
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ ok: false, error: err.message });
    }
  });
}

module.exports = enkuddiRoutes;
