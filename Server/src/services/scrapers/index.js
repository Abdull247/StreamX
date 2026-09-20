const xvideos = require('./xvideos');

const scrapers = {
  xvideos
};

function getScraper(site) {
  return scrapers[site] || null;
}

function listSites() {
  return Object.keys(scrapers);
}

module.exports = { getScraper, listSites, xvideos };
