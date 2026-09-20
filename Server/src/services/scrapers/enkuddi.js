const cheerio = require('cheerio');
const { fetchPage } = require('./base');

function clean(text = '') {
  return text.replace(/\s+/g, ' ').trim();
}

function parseViews(raw = '') {
  const m = raw.match(/([\d,]+)\s*views?/i);
  return m ? m[1].replace(/,/g, '') : (raw || '0');
}

async function scrapeHome({ page = 1, limit = 24 } = {}) {
  // enkuddi home is https://enkuddi.com/  (page 1)
  // later pages usually /page/2/ etc.
  const url = page <= 1
    ? 'https://enkuddi.com/'
    : `https://enkuddi.com/page/${page}/`;

  const html = await fetchPage(url);
  const $ = cheerio.load(html);
  const items = [];

  $('.after-dark-card').each((i, el) => {
    if (items.length >= limit) return false;

    const $el = $(el);
    const $link = $el.find('h2 a, a[href*="enkuddi.com"]').first();
    const href = $link.attr('href') || '';
    const title = clean($link.text() || $link.attr('title') || '');

    const $img = $el.find('img').first();
    let thumb = $img.attr('data-src') || $img.attr('src') || '';
    if (thumb.startsWith('data:')) thumb = $img.attr('data-src') || '';

    // date + views sit in the bottom meta row
    const metaTexts = $el.find('.opacity-60, .text-sm').text() || '';
    const dateMatch = metaTexts.match(/(\d+\s+(?:day|days|week|weeks|month|months|year|years)\s+ago|just now|\d{1,2}\s+\w+\s+\d{4})/i);
    const date = dateMatch ? clean(dateMatch[0]) : '';
    const views = parseViews(metaTexts);

    if (!title || !href) return;

    items.push({
      id: i + 1,
      title,
      thumb,
      views,
      date,
      link: href.startsWith('http') ? href : `https://enkuddi.com${href}`,
      site: 'enkuddi',
      page
    });
  });

  return {
    site: 'enkuddi',
    source: url,
    page,
    count: items.length,
    items
  };
}

async function scrapeSearch({ q = '', page = 1, limit = 24 } = {}) {
  if (!q || !String(q).trim()) throw new Error('Search query required');
  const encoded = encodeURIComponent(String(q).trim());
  const url = page <= 1
    ? `https://enkuddi.com/?s=${encoded}`
    : `https://enkuddi.com/page/\( {page}/?s= \){encoded}`;

  const html = await fetchPage(url);
  const $ = cheerio.load(html);
  const items = [];

  $('.after-dark-card').each((i, el) => {
    if (items.length >= limit) return false;
    const $el = $(el);
    const $link = $el.find('h2 a').first();
    const href = $link.attr('href') || '';
    const title = clean($link.text() || '');
    const $img = $el.find('img').first();
    let thumb = $img.attr('data-src') || $img.attr('src') || '';
    if (thumb.startsWith('data:')) thumb = $img.attr('data-src') || '';
    const metaTexts = $el.find('.opacity-60, .text-sm').text() || '';
    const dateMatch = metaTexts.match(/(\d+\s+(?:day|days|week|weeks|month|months|year|years)\s+ago|just now)/i);
    const date = dateMatch ? clean(dateMatch[0]) : '';
    const views = parseViews(metaTexts);

    if (!title || !href) return;

    items.push({
      id: i + 1,
      title,
      thumb,
      views,
      date,
      link: href.startsWith('http') ? href : `https://enkuddi.com${href}`,
      site: 'enkuddi',
      query: q,
      page
    });
  });

  return {
    site: 'enkuddi',
    source: url,
    query: q,
    page,
    count: items.length,
    items
  };
}

module.exports = {
  scrapeHome,
  scrapeSearch
};
