const beautify = require("js-beautify").js;

function beautifyJS(code) {
  return beautify(code, { indent_size: 2 });
}

module.exports = { beautifyJS };