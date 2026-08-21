const axios = require("axios");

async function fuzzParams(baseUrl, params) {
  let results = [];

  for (let param of params) {
    try {
      let res = await axios.get(`${baseUrl}?${param}=test`);
      results.push({ param, status: res.status });
    } catch {}
  }

  return results;
}

module.exports = { fuzzParams };