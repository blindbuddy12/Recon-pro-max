function detectGraphQL(content) {
  const patterns = [/\/graphql/gi, /query\s*\{/gi, /mutation\s*\{/gi];

  let found = [];

  patterns.forEach(p => {
    let m = content.match(p);
    if (m) found.push(...m);
  });

  return found;
}

module.exports = { detectGraphQL };