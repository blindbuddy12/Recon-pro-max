const beautify = require("js-beautify").js;

function isPackedJS(content) {
  return content.includes("eval(function(p,a,c,k,e,d)");
}

function deobfuscate(content) {
  try {
    return beautify(content);
  } catch {
    return content;
  }
}

module.exports = { isPackedJS, deobfuscate };