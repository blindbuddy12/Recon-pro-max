function validateFinding(finding) {
  const val = finding.value;
  let confidence = "LOW";
  let indicators = [];
  let category = "generic";

  // Skip SHA hashes
  if (/^(sha(256|384|512)|md5|hash)/i.test(val)) {
    return { ...finding, confidence: "LOW", category: "hash", 
             indicators: "likely_hash_not_secret", validatedAt: new Date().toISOString() };
  }

  if (val.length >= 20) { confidence = "MEDIUM"; indicators.push("length"); }
  if (val.length >= 32) { indicators.push("long_key"); }

  // Patterns with word boundaries \b to ensure standalone secrets
  const strongPatterns = [
    // Google API Key - 30-40 chars after AIza
    { pattern: /\bAIza[0-9A-Za-z\-_]{30,40}\b/, name: "Google_API_Key", category: "cloud", confidence: "HIGH" },
    
    // AWS - with word boundaries
    { pattern: /\bAKIA[0-9A-Z]{16}\b/, name: "AWS_Access_Key", category: "cloud", confidence: "HIGH" },
    { pattern: /\b(?!sha)(?!md5)[0-9a-zA-Z/+]{40}\b/, name: "AWS_Secret_Key", category: "cloud", confidence: "HIGH" },
    
    // GitHub tokens
    { pattern: /\bghp_[0-9a-zA-Z]{36}\b/, name: "GitHub_Personal_Token", category: "version_control", confidence: "HIGH" },
    { pattern: /\bgithub_pat_[0-9a-zA-Z_]{20,}\b/, name: "GitHub_Fine_Grained_Token", category: "version_control", confidence: "HIGH" },
    
    // GitLab
    { pattern: /\bglpat-[0-9a-zA-Z\-_]{20}\b/, name: "GitLab_Personal_Token", category: "version_control", confidence: "HIGH" },
    
    // Slack
    { pattern: /\bxox[baprs]-[0-9a-zA-Z]{10,48}\b/, name: "Slack_Token", category: "communication", confidence: "HIGH" },
    
    // Stripe - CRITICAL
    { pattern: /\bsk_live_[0-9a-zA-Z]{24}\b/, name: "Stripe_Live_Secret", category: "payment", confidence: "CRITICAL" },
    { pattern: /\brk_live_[0-9a-zA-Z]{24}\b/, name: "Stripe_Restricted_Live", category: "payment", confidence: "CRITICAL" },
    
    // Twilio
    { pattern: /\bSK[0-9a-fA-F]{32}\b/, name: "Twilio_API_Key", category: "communication", confidence: "HIGH" },
    { pattern: /\bAC[0-9a-fA-F]{32}\b/, name: "Twilio_Account_SID", category: "communication", confidence: "HIGH" },
    
    // SendGrid
    { pattern: /\bSG\.[\w\d\-_]{22}\.[\w\d\-_]{43}\b/, name: "SendGrid_API_Key", category: "communication", confidence: "HIGH" },
    
    // JWT
    { pattern: /\beyJ[A-Za-z0-9_-]*\.eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*\b/, name: "JWT_Token", category: "auth", confidence: "HIGH" },
    
    // Vault Token - proper format only
    { pattern: /\bs\.[a-zA-Z0-9]{8,}\.[a-zA-Z0-9]{8,}\b/, name: "Vault_Token", category: "secrets_management", confidence: "CRITICAL" },
    
    // Private Keys - CRITICAL
    { pattern: /-----BEGIN (RSA|DSA|EC|OPENSSH)? PRIVATE KEY-----/, name: "Private_Key", category: "crypto", confidence: "CRITICAL" },
    
    // Database URIs
    { pattern: /\bmongodb(\+srv)?:\/\/[^\s'"]+\b/, name: "MongoDB_URI", category: "database", confidence: "CRITICAL" },
    { pattern: /\bpostgres(?:ql)?:\/\/[^\s'"]+\b/, name: "PostgreSQL_URI", category: "database", confidence: "CRITICAL" }
  ];

  let matched = false;
  for (const { pattern, name, category: cat, confidence: conf } of strongPatterns) {
    if (pattern.test(val)) {
      confidence = conf;
      indicators.push(name);
      category = cat;
      matched = true;
      break;
    }
  }

  // Test keywords reduce confidence
  const testKeywords = ["test", "example", "sample", "dummy", "fake", "mock", "sandbox"];
  if (testKeywords.some(kw => val.toLowerCase().includes(kw))) {
    if (confidence === "CRITICAL") confidence = "HIGH";
    else if (confidence === "HIGH") confidence = "MEDIUM";
    else if (confidence === "MEDIUM") confidence = "LOW";
    indicators.push("test_keyword_detected");
  }

  return { ...finding, confidence, category, indicators: indicators.join(", "), validatedAt: new Date().toISOString() };
}

function validateResults(results) {
  if (!results || results.length === 0) return [];
  return results.map(validateFinding);
}

module.exports = { validateResults, validateFinding };