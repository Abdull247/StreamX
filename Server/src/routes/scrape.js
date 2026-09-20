const { getScraper } = require('../services/scrapers');

async function scrapeRoutes(fastify, options) {
  // GET /api/scrape?site=xvideos
  fastify.get('/scrape', async (request, reply) => {
    const site = (request.query.site || 'xvideos').toLowerCase();
    const limit = parseInt(request.query.limit) || 24;

    try {
      const scraper = getScraper(site);
      if (!scraper) {
        return reply.code(400).send({
          ok: false,
          error: `Site "${site}" not supported yet`
        });
      }

      const items = await scraper.scrape({ limit });
      return {
        ok: true,
        site,
        count: items.length,
        items
      };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({
        ok: false,
        error: err.message
      });
    }
  });
}

module.exports = scrapeRoutes;
