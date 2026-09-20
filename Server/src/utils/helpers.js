function cleanText(str = '') {
  return str.replace(/\s+/g, ' ').trim();
}

function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

module.exports = { cleanText, clamp };
