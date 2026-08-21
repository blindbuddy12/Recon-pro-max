function isFalsePositive(value) {
  const lowerValue = value.toLowerCase().trim();
  
  // Only filter obvious non-secrets - be very conservative
  
  // 1. SHA hash patterns (integrity attributes like sha384-xxx)
  if (/^sha(256|384|512)-[a-zA-Z0-9+/=]{40,}$/i.test(value)) {
    return true;
  }
  
  // 2. Placeholder patterns (exact matches only)
  const placeholderPatterns = [
    /^[xX]{5,}$/,           // xxxxxx
    /^YOUR_[A-Z_]+$/i,      // YOUR_API_KEY
    /^ENTER_[A-Z_]+$/i,     // ENTER_KEY_HERE
    /^INSERT_[A-Z_]+$/i,    // INSERT_TOKEN
    /^(abc)+$/i,            // abcabcabc
    /^(123)+$/              // 123123123
  ];
  
  for (const placeholder of placeholderPatterns) {
    if (placeholder.test(value)) return true;
  }
  
  // 3. JavaScript method calls like s.getSomething()
  // This catches s.getHardwareConcurrency but NOT AIzaSyA...
  if (/^s\.[a-zA-Z][a-zA-Z0-9_]*$/.test(value)) {
    return true;
  }
  
  // 4. Variable names with common JS keywords (only if all lowercase)
  const jsKeywords = ['excludeavailable', 'screenresolution', 
                      'hardwareconcurrency', 'integrity', 'webflow',
                      'cloudfront', 'hostname'];
  
  const isAllLower = value === value.toLowerCase();
  const hasJsKeyword = jsKeywords.some(kw => lowerValue.includes(kw));
  
  if (isAllLower && hasJsKeyword && value.length > 20) {
    return true;
  }
  
  return false;
}

function filterResults(results) {
  if (!results || results.length === 0) return [];
  
  const filtered = results.filter(r => {
    if (!r || !r.value) return false;
    
    // Skip if too short
    if (r.value.length < 10) return false;
    
    // Skip if too long
    if (r.value.length > 500) return false;
    
    // Check false positives
    if (isFalsePositive(r.value)) return false;
    
    return true;
  });
  
  // Remove duplicates
  const seen = new Set();
  return filtered.filter(r => {
    const key = r.value.substring(0, 50);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

module.exports = { filterResults, isFalsePositive };