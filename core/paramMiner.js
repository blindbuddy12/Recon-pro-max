function extractParams(content) {
  const regex = /[?&]([a-zA-Z0-9_\-]+)=/g;
  let params = new Set();
  let match;

  while ((match = regex.exec(content)) !== null) {
    params.add(match[1]);
  }

  return Array.from(params);
}

module.exports = { extractParams };