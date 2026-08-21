const axios = require("axios");
const cheerio = require("cheerio");
const url = require("url");

const visited = new Set();

async function crawl(target, depth = 2) {
  if (depth === 0 || visited.has(target)) return [];
  
  visited.add(target);
  console.log(`[CRAWL] Depth ${depth}: ${target}`);

  let jsFiles = [];

  try {
    const res = await axios.get(target, { 
      timeout: 10000,
      maxRedirects: 5,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      }
    });
    
    const $ = cheerio.load(res.data);
    const baseUrl = target;

    // Extract external JS files
    $("script[src]").each((i, el) => {
      const src = $(el).attr("src");
      if (src) {
        const fullUrl = url.resolve(baseUrl, src);
        // Only add HTTP/HTTPS URLs, skip data URIs for now
        if (fullUrl.startsWith("http") && !visited.has(fullUrl)) {
          jsFiles.push(fullUrl);
          console.log(`[JS] Found: ${fullUrl.substring(0, 80)}...`);
        }
      }
    });

    // Extract inline scripts (may contain hardcoded secrets)
    $("script:not([src])").each((i, el) => {
      const inlineCode = $(el).html();
      if (inlineCode && inlineCode.length > 50) {
        // Store inline code as data URI for processing
        const dataUri = `data:text/javascript;base64,${Buffer.from(inlineCode).toString('base64')}`;
        if (!visited.has(dataUri)) {
          jsFiles.push(dataUri);
        }
      }
    });

    // Crawl links recursively (limited concurrency)
    if (depth > 1) {
      const links = [];
      $("a[href]").each((i, el) => {
        const href = $(el).attr("href");
        if (href) {
          const fullUrl = url.resolve(baseUrl, href);
          // Only crawl same-origin or subdomains
          if (fullUrl.startsWith("http") && !visited.has(fullUrl)) {
            const targetHost = new URL(target).hostname;
            const linkHost = new URL(fullUrl).hostname;
            if (linkHost === targetHost || linkHost.endsWith(`.${targetHost}`)) {
              links.push(fullUrl);
            }
          }
        }
      });

      // Limit to 10 links per page to avoid explosion
      const limitedLinks = links.slice(0, 10);
      for (const link of limitedLinks) {
        const nested = await crawl(link, depth - 1);
        jsFiles.push(...nested);
      }
    }

  } catch (err) {
    if (err.code !== 'ECONNABORTED') {
      console.error(`[ERROR] Failed to crawl ${target}: ${err.message}`);
    }
  }

  // Remove duplicates
  return [...new Set(jsFiles)];
}

module.exports = { crawl };