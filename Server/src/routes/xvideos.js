const xvideos = require('../services/scrapers/xvideos');

async function xvideosRoutes(fastify) {

  // HOME
  fastify.get('/home', async (req, reply) => {
    const page = parseInt(req.query.page) || 0;
    const limit = Math.min(parseInt(req.query.limit) || 48, 100);
    try { return await xvideos.scrapeHome({ page, limit }); }
    catch (err) { return reply.code(500).send({ ok: false, error: err.message }); }
  });
  fastify.post('/home', async (req, reply) => {
    const b = req.body || {};
    try { return await xvideos.scrapeHome({ page: parseInt(b.page)||0, limit: Math.min(parseInt(b.limit)||48,100) }); }
    catch (err) { return reply.code(500).send({ ok: false, error: err.message }); }
  });

  // SEARCH + FILTERS
  // GET /api/xvideos/search?q=blonde&page=0&limit=40&sort=views&quality=hd
  fastify.get('/search', async (req, reply) => {
    const q = req.query.q || req.query.query || '';
    if (!q.trim()) return reply.code(400).send({ ok: false, error: 'Missing q' });
    const opts = {
      q,
      page: parseInt(req.query.page) || 0,
      limit: Math.min(parseInt(req.query.limit) || 48, 100),
      sort: req.query.sort || 'relevance',
      quality: req.query.quality || null,
      duration: req.query.duration || null,
      date: req.query.date || null
    };
    try { return await xvideos.scrapeSearch(opts); }
    catch (err) { return reply.code(500).send({ ok: false, error: err.message }); }
  });

  // POST /api/xvideos/search   body can carry all filters
  fastify.post('/search', async (req, reply) => {
    const b = req.body || {};
    const q = b.q || b.query || '';
    if (!q.trim()) return reply.code(400).send({ ok: false, error: 'Missing q' });
    const opts = {
      q,
      page: parseInt(b.page) || 0,
      limit: Math.min(parseInt(b.limit) || 48, 100),
      sort: b.sort || 'relevance',
      quality: b.quality || null,
      duration: b.duration || null,
      date: b.date || null
    };
    try { return await xvideos.scrapeSearch(opts); }
    catch (err) { return reply.code(500).send({ ok: false, error: err.message }); }
  });

  // CATEGORY
  // GET /api/xvideos/category?cat=Amateur-65&page=0
  fastify.get('/category', async (req, reply) => {
    const cat = req.query.cat || req.query.category || '';
    if (!cat) return reply.code(400).send({ ok: false, error: 'Missing cat' });
    try {
      return await xvideos.scrapeCategory({
        cat,
        page: parseInt(req.query.page) || 0,
        limit: Math.min(parseInt(req.query.limit) || 48, 100)
      });
    } catch (err) { return reply.code(500).send({ ok: false, error: err.message }); }
  });

  // BEST / TOP
  fastify.get('/best', async (req, reply) => {
    try {
      return await xvideos.scrapeBest({
        page: parseInt(req.query.page) || 0,
        limit: Math.min(parseInt(req.query.limit) || 48, 100)
      });
    } catch (err) { return reply.code(500).send({ ok: false, error: err.message }); }
  });

  // DETAILS
  fastify.get('/details', async (req, reply) => {
    let url = req.query.url || req.query.link || '';
    if (!url && req.query.eid) url = `https://www.xvideos.com/video.${req.query.eid}/`;
    if (!url) return reply.code(400).send({ ok: false, error: 'Missing url or eid' });
    try { return await xvideos.scrapeDetails(url); }
    catch (err) { return reply.code(500).send({ ok: false, error: err.message }); }
  });
  fastify.post('/details', async (req, reply) => {
    const url = (req.body || {}).url || (req.body || {}).link || '';
    if (!url) return reply.code(400).send({ ok: false, error: 'Missing url' });
    try { return await xvideos.scrapeDetails(url); }
    catch (err) { return reply.code(500).send({ ok: false, error: err.message }); }
  });

  // RECOMMENDATIONS ONLY
  fastify.get('/recommendations', async (req, reply) => {
    const url = req.query.url || req.query.link || '';
    if (!url) return reply.code(400).send({ ok: false, error: 'Missing url' });
    try { return await xvideos.scrapeRecommendations(url); }
    catch (err) { return reply.code(500).send({ ok: false, error: err.message }); }
  });
  fastify.post('/recommendations', async (req, reply) => {
    const url = (req.body || {}).url || (req.body || {}).link || '';
    if (!url) return reply.code(400).send({ ok: false, error: 'Missing url' });
    try { return await xvideos.scrapeRecommendations(url); }
    catch (err) { return reply.code(500).send({ ok: false, error: err.message }); }
  });
}

module.exports = xvideosRoutes;
