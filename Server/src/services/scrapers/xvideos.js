const cheerio = require('cheerio');
const { fetchPage } = require('./base');

function clean(text = '') {
  return text.replace(/\s+/g, ' ').trim()
    .replace(/&comma;/g, ',')
    .replace(/&apos;/g, "'")
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"');
}

function parseViews(raw = '') {
  const m = raw.match(/([\d.,]+)\s*([kKmMbB])?\s*Views?/i) || raw.match(/([\d.,]+)\s*([kKmMbB])?/i);
  if (!m) return raw || '0';
  return m[0].replace(/\s*Views?/i, '').trim();
}

function extractJsonLd($) {
  const script = $('script[type="application/ld+json"]').first();
  if (!script.length) return null;
  try { return JSON.parse(script.html()); } catch { return null; }
}

function extractRelated(html) {
  const match = html.match(/video_related\s*=\s*(\[[\s\S]*?\]);/);
  if (!match) return [];
  try {
    const arr = JSON.parse(match[1]);
    return arr.map(v => ({
      id: v.id || null,
      eid: v.eid || null,
      title: clean(v.tf || v.t || ''),
      duration: v.d || '',
      views: v.n || '0',
      rating: v.r || null,
      thumb: v.i || v.il || v.ip || '',
      link: v.u ? (v.u.startsWith('http') ? v.u : `https://www.xvideos.com${v.u}`) : null,
      uploader: v.pn || v.p || null,
      uploader_url: v.pu ? `https://www.xvideos.com${v.pu}` : null,
      site: 'xvideos'
    }));
  } catch { return []; }
}

function extractPlayerStreams(html) {
  const streams = { low: null, high: null, hls: null, thumb: null, thumb_slide: null };
  const low = html.match(/setVideoUrlLow\('([^']+)'\)/);
  const high = html.match(/setVideoUrlHigh\('([^']+)'\)/);
  const hls = html.match(/setVideoHLS\('([^']+)'\)/);
  const thumb = html.match(/setThumbUrl\('([^']+)'\)/);
  const slide = html.match(/setThumbSlide\('([^']+)'\)/);
  if (low) streams.low = low[1];
  if (high) streams.high = high[1];
  if (hls) streams.hls = hls[1];
  if (thumb) streams.thumb = thumb[1];
  if (slide) streams.thumb_slide = slide[1];
  return streams;
}

function parseListing($, limit = 48, extra = {}) {
  const items = [];
  $('.thumb-block, .frame-block.thumb-block').each((i, el) => {
    if (items.length >= limit) return false;
    const $el = $(el);
    const id = $el.attr('data-id') || null;
    const eid = $el.attr('data-eid') || null;
    const $link = $el.find('a[href*="/video"]').first();
    const href = $link.attr('href') || '';
    const title = clean($link.attr('title') || $el.find('.title a').attr('title') || $el.find('.title a').text() || '');
    const $img = $el.find('img').first();
    let thumb = $img.attr('data-src') || $img.attr('data-src-avif') || $img.attr('src') || '';
    if (thumb && thumb.includes('lightbox-blank')) thumb = $img.attr('data-src') || '';
    const duration = clean($el.find('.duration').first().text() || '');
    const metaText = clean($el.find('.metadata').text() || '');
    const views = parseViews(metaText);
    const uploader = clean($el.find('.metadata .name').text() || '');

    if (!title || !href) return;

    items.push({
      id: id ? Number(id) : i + 1,
      eid,
      title,
      duration,
      views,
      uploader,
      thumb,
      link: href.startsWith('http') ? href : `https://www.xvideos.com${href}`,
      site: 'xvideos',
      ...extra
    });
  });
  return items;
}

async function scrapeHome({ page = 0, limit = 48 } = {}) {
  const url = page <= 0 ? 'https://www.xvideos.com/' : `https://www.xvideos.com/new/${page}`;
  const html = await fetchPage(url);
  const $ = cheerio.load(html);
  const items = parseListing($, limit, { page });
  return { site: 'xvideos', source: url, page, count: items.length, items };
}

async function scrapeSearch(opts = {}) {
  const {
    q = '',
    page = 0,
    limit = 48,
    sort = 'relevance',     // relevance | date | views | rating
    quality = null,         // hd | 1080p | 720p | all
    duration = null,        // short | medium | long  (or min-max later)
    date = null             // today | week | month | year
  } = opts;

  if (!q || !String(q).trim()) throw new Error('Search query required');

  const encoded = encodeURIComponent(String(q).trim());
  let url = `https://www.xvideos.com/?k=${encoded}`;

  // pagination
  if (page > 0) url += `&p=${page}`;

  // sort mapping (xvideos uses different params)
  if (sort === 'date' || sort === 'newest') url += '&sort=relevance&date='; // fallback, real sort is limited
  if (sort === 'views' || sort === 'popular') url += '&sort=views';
  if (sort === 'rating') url += '&sort=rating';

  // quality
  if (quality === 'hd' || quality === '1080p' || quality === '720p') {
    url += `&quality=${quality === 'hd' ? 'hd' : quality}`;
  }

  // rough date filter via path if needed (xvideos supports some)
  // for now we keep query clean and let client filter further if needed

  const html = await fetchPage(url);
  const $ = cheerio.load(html);
  const items = parseListing($, limit, { query: q, page, sort, quality, duration, date });

  return {
    site: 'xvideos',
    source: url,
    query: q,
    page,
    sort,
    quality,
    duration,
    date,
    count: items.length,
    items
  };
}

async function scrapeCategory({ cat = '', page = 0, limit = 48 } = {}) {
  if (!cat) throw new Error('Category slug required');
  // common pattern: /c/Amateur-65  or just search by name
  let url;
  if (cat.startsWith('/c/') || cat.includes('-')) {
    url = cat.startsWith('http') ? cat : `https://www.xvideos.com${cat.startsWith('/') ? cat : '/c/' + cat}`;
  } else {
    url = `https://www.xvideos.com/?k=${encodeURIComponent(cat)}`;
  }
  if (page > 0) url += (url.includes('?') ? '&' : '?') + `p=${page}`;

  const html = await fetchPage(url);
  const $ = cheerio.load(html);
  const items = parseListing($, limit, { category: cat, page });
  return { site: 'xvideos', source: url, category: cat, page, count: items.length, items };
}

async function scrapeBest({ page = 0, limit = 48 } = {}) {
  const url = page <= 0 ? 'https://www.xvideos.com/best' : `https://www.xvideos.com/best/${page}`;
  const html = await fetchPage(url);
  const $ = cheerio.load(html);
  const items = parseListing($, limit, { list: 'best', page });
  return { site: 'xvideos', source: url, list: 'best', page, count: items.length, items };
}

async function scrapeDetails(videoUrl) {
  if (!videoUrl || !videoUrl.includes('xvideos.com')) {
    throw new Error('Valid xvideos video URL required');
  }
  const html = await fetchPage(videoUrl);
  const $ = cheerio.load(html);
  const ld = extractJsonLd($);
  const streams = extractPlayerStreams(html);
  const related = extractRelated(html);

  const title = clean(
    (ld && ld.name) ||
    $('meta[property="og:title"]').attr('content') ||
    $('title').text().replace(' - XVIDEOS.COM', '') || ''
  );
  const description = clean((ld && ld.description) || title);
  const durationSec = parseInt($('meta[property="og:duration"]').attr('content') || 0, 10) || null;
  const durationIso = (ld && ld.duration) || null;
  const thumb = (ld && ld.thumbnailUrl && ld.thumbnailUrl[0]) ||
                $('meta[property="og:image"]').attr('content') ||
                streams.thumb || null;
  const views = (ld && ld.interactionStatistic && ld.interactionStatistic.userInteractionCount) || null;
  const uploadDate = (ld && ld.uploadDate) || null;

  let tags = [];
  const tagsMatch = html.match(/"video_tags"\s*:\s*(\[[^\]]+\])/);
  if (tagsMatch) { try { tags = JSON.parse(tagsMatch[1]); } catch {} }

  let uploader = null, uploaderUrl = null;
  const uploaderMatch = html.match(/"uploader"\s*:\s*"([^"]+)"/);
  const uploaderUrlMatch = html.match(/"uploader_url"\s*:\s*"([^"]+)"/);
  if (uploaderMatch) uploader = uploaderMatch[1];
  if (uploaderUrlMatch) uploaderUrl = `https://www.xvideos.com${uploaderUrlMatch[1]}`;

  const eidMatch = videoUrl.match(/\/video\.([a-z0-9]+)\//i) || html.match(/"encoded_id_video"\s*:\s*"([^"]+)"/);
  const eid = eidMatch ? eidMatch[1] : null;
  const idMatch = html.match(/"id_video"\s*:\s*(\d+)/);
  const id = idMatch ? Number(idMatch[1]) : null;

  return {
    ok: true,
    site: 'xvideos',
    source: videoUrl,
    id, eid, title, description,
    duration_seconds: durationSec,
    duration_iso: durationIso,
    views, upload_date: uploadDate,
    thumb, tags, uploader, uploader_url: uploaderUrl,
    streams: { low: streams.low, high: streams.high, hls: streams.hls },
    thumbs: { main: streams.thumb || thumb, slide: streams.thumb_slide },
    related_count: related.length,
    related
  };
}

async function scrapeRecommendations(videoUrl) {
  const full = await scrapeDetails(videoUrl);
  return {
    ok: true,
    site: 'xvideos',
    source: videoUrl,
    count: full.related.length,
    items: full.related
  };
}

module.exports = {
  scrapeHome,
  scrapeSearch,
  scrapeCategory,
  scrapeBest,
  scrapeDetails,
  scrapeRecommendations,
  scrape: async (opts = {}) => (await scrapeHome(opts)).items
};
