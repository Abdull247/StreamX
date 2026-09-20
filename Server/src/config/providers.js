// Available video sources (providers).
// This is the single source of truth returned by GET /api/providers.
// Add a new provider here (matching an existing scraper) to surface it to clients.
module.exports = {
  default: 'xvideos',
  providers: [
    {
      id: 'xvideos',
      name: 'Xvideos',
      label: 'xvideos.com',
      baseUrl: 'https://www.xvideos.com',
      type: 'scraper'
    },
    {
      id: 'enkuddi',
      name: 'Enkuddi',
      label: 'enkuddi.com',
      baseUrl: 'https://enkuddi.com',
      type: 'scraper'
    }
  ]
};
