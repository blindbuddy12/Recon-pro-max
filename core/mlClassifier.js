function classifyFinding(value) {
  let score = 0;

  if (value.length > 20) score += 2;
  if (/[A-Z]/.test(value)) score += 1;
  if (/[0-9]/.test(value)) score += 1;
  if (/[_\-]/.test(value)) score += 1;

  if (score >= 4) return "HIGH";
  if (score >= 2) return "MEDIUM";
  return "LOW";
}

function classifyResults(results) {
  return results.map(r => ({
    ...r,
    severity: classifyFinding(r.value)
  }));
}

module.exports = { classifyResults };