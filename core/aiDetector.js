function shannonEntropy(str) {
  const map = {};
  for (let c of str) map[c] = (map[c] || 0) + 1;

  return Object.values(map).reduce((acc, freq) => {
    const p = freq / str.length;
    return acc - p * Math.log2(p);
  }, 0);
}

function entropyScore(str) {
  const entropy = shannonEntropy(str);
  return Math.min(100, Math.max(0, (entropy / 5.0) * 100));
}

function looksLikeSecret(str) {
  // Must have mix of character types
  const hasUpper = /[A-Z]/.test(str);
  const hasLower = /[a-z]/.test(str);
  const hasDigit = /[0-9]/.test(str);
  const hasSpecial = /[^A-Za-z0-9]/.test(str);
  
  const typeCount = [hasUpper, hasLower, hasDigit, hasSpecial].filter(Boolean).length;
  const uniqueRatio = new Set(str).size / str.length;
  
  return typeCount >= 3 && uniqueRatio > 0.3;
}

// List of words that indicate false positive
const FALSE_POSITIVE_WORDS = [
  "exclude", "include", "available", "screen", "resolution", "width", "height",
  "options", "config", "settings", "dontuse", "fake", "font", "canvas", "context",
  "element", "document", "window", "function", "return", "undefined", "null",
  "prototype", "constructor", "this", "self", "that", "event", "target", "current",
  "default", "value", "key", "name", "id", "class", "style", "data", "attr",
  "prop", "html", "text", "content", "inner", "outer", "child", "parent", "sibling",
  "next", "prev", "first", "last", "each", "map", "filter", "reduce", "find",
  "search", "match", "test", "split", "join", "slice", "substring", "substr",
  "replace", "trim", "toLowerCase", "toUpperCase", "charAt", "charCodeAt",
  "fromCharCode", "encode", "decode", "parse", "stringify", "json", "xml",
  "url", "uri", "path", "domain", "host", "port", "protocol", "query", "hash",
  "param", "source", "destination", "origin", "referrer", "userAgent", "platform",
  "vendor", "product", "app", "version", "mode", "type", "status", "state", "code",
  "message", "error", "success", "fail", "done", "complete", "start", "end",
  "begin", "finish", "init", "load", "ready", "change", "click", "submit", "focus",
  "blur", "hover", "scroll", "resize", "mousemove", "mousedown", "mouseup",
  "keydown", "keyup", "keypress", "touch", "swipe", "pinch", "zoom", "rotate",
  "shake", "orientation", "device", "mobile", "tablet", "desktop", "responsive",
  "breakpoint", "media", "print", "speech", "all", "none", "hidden", "visible",
  "collapse", "disabled", "enabled", "readonly", "required", "checked", "selected",
  "multiple", "autofocus", "autocomplete", "placeholder", "pattern", "min", "max",
  "step", "range", "date", "time", "datetime", "color", "email", "tel", "search",
  "number", "file", "image", "button", "reset", "password", "textarea", "select",
  "option", "optgroup", "fieldset", "legend", "label", "input", "output", "progress",
  "meter", "details", "summary", "dialog", "menu", "menuitem", "tooltip", "popover",
  "modal", "overlay", "backdrop", "container", "wrapper", "before", "after", "prepend",
  "append", "insert", "remove", "detach", "empty", "clone", "copy", "cut", "paste",
  "drag", "drop", "sort", "shuffle", "random", "unique", "duplicate", "merge",
  "concat", "extend", "assign", "spread", "rest", "destruct", "import", "export",
  "with", "debugger", "use strict", "eval", "arguments", "caller", "callee", "bind",
  "call", "apply", "length", "display", "visibility", "opacity", "z-index",
  "position", "top", "right", "bottom", "left", "float", "clear", "overflow", "clip",
  "transform", "transition", "animation", "keyframes", "supports", "charset",
  "namespace", "font-face", "counter-style", "page", "margin", "padding", "border",
  "outline", "background", "color", "shadow", "gradient", "image", "size", "repeat",
  "attachment", "origin", "clip", "filter", "mask", "composite", "blend", "isolation",
  "will-change", "contain", "paint", "layout", "style", "strict", "items", "self",
  "gap", "order", "grow", "shrink", "basis", "wrap", "direction", "flow", "pack",
  "line", "align", "justify", "place", "space", "around", "evenly", "between",
  "center", "start", "end", "flex", "grid", "block", "inline", "table", "list",
  "run-in", "compact", "marker", "box", "flexbox", "subgrid", "masonry", "template",
  "area", "auto", "minmax", "fit-content", "dense", "auto-flow", "implicit", "explicit",
  "track", "cell", "item", "index", "absolute", "relative", "fixed", "sticky",
  "static", "inherit", "initial", "unset", "revert", "revert-layer", "global", "local",
  "scroll", "border-box", "padding-box", "content-box", "text", "no-clip", "slice",
  "clone", "smooth", "touch", "pan", "zoom", "grab", "grabbing", "all-scroll",
  "col-resize", "row-resize", "n-resize", "e-resize", "s-resize", "w-resize",
  "ne-resize", "nw-resize", "se-resize", "sw-resize", "ew-resize", "ns-resize",
  "nesw-resize", "nwse-resize", "zoom-in", "zoom-out", "not-allowed", "no-drop",
  "wait", "help", "context-menu", "cell", "crosshair", "vertical-text", "alias",
  "move", "pointer", "progress", "winding", "evenodd", "yes", "no", "true", "false",
  "null", "undefined", "NaN", "Infinity", "console", "log", "warn", "error", "info",
  "debug", "trace", "assert", "clear", "count", "countReset", "group", "groupEnd",
  "table", "time", "timeEnd", "timeLog", "profile", "profileEnd", "timeStamp"
];

function aiDetect(content) {
  let findings = [];
  
  // Define all 100 secret contexts
  const secretContexts = [
    // AWS (Category: cloud)
    { 
      patterns: [/AKIA[0-9A-Z]{16}/g, /ASIA[0-9A-Z]{16}/g],
      type: "aws_access_key",
      category: "cloud",
      minEntropy: 3.0,
      indicators: ["aws", "amazon", "access_key"]
    },
    { 
      patterns: [/(?<!sha384-)(?<!sha256-)(?<!sha512-)[0-9a-zA-Z/+]{40}/g],
      type: "aws_secret_key",
      category: "cloud",
      minEntropy: 4.0,
      indicators: ["aws", "amazon", "secret_key"],
      validate: (val) => !val.startsWith('sha') && !val.includes('/')
    },
    
    // Google / Firebase (Category: cloud)
    {
      patterns: [/AIza[0-9A-Za-z\-_]{30,40}/g],
      type: "google_api_key",
      category: "cloud",
      minEntropy: 4.0,
      indicators: ["google", "api", "firebase", "gcp"]
    },
    {
      patterns: [/[0-9]+-[0-9A-Za-z_]{32}\.apps\.googleusercontent\.com/g],
      type: "google_oauth_id",
      category: "cloud",
      minEntropy: 3.5,
      indicators: ["google", "oauth", "client_id"]
    },
    {
      patterns: [/AAAA[A-Za-z0-9_-]{7}:[A-Za-z0-9_-]{140}/g],
      type: "firebase_secret",
      category: "cloud",
      minEntropy: 4.5,
      indicators: ["firebase", "google", "database"]
    },
    
    // GitHub (Category: version_control)
    {
      patterns: [
        /ghp_[0-9a-zA-Z]{36}/g,
        /gho_[0-9a-zA-Z]{36}/g,
        /ghu_[0-9a-zA-Z]{36}/g,
        /ghs_[0-9a-zA-Z]{36}/g,
        /ghr_[0-9a-zA-Z]{36}/g,
        /github_pat_[0-9a-zA-Z_]{20,}/g
      ],
      type: "github_token",
      category: "version_control",
      minEntropy: 4.5,
      indicators: ["github", "git", "token"]
    },
    
    // GitLab (Category: version_control)
    {
      patterns: [/glpat-[0-9a-zA-Z\-_]{20}/g, /glrt-[a-zA-Z0-9_-]{20}/g],
      type: "gitlab_token",
      category: "version_control",
      minEntropy: 4.0,
      indicators: ["gitlab", "ci_cd", "token"]
    },
    
    // Slack (Category: communication)
    {
      patterns: [
        /xox[baprs]-[0-9a-zA-Z]{10,48}/g,
        /https:\/\/hooks\.slack\.com\/services\/T[a-zA-Z0-9_]{8}\/B[a-zA-Z0-9_]{8}\/[a-zA-Z0-9_]{24}/g
      ],
      type: "slack_token",
      category: "communication",
      minEntropy: 4.0,
      indicators: ["slack", "webhook", "messaging"]
    },
    
    // Discord (Category: communication)
    {
      patterns: [
        /[MN][A-Za-z\d]{23}\.[\w-]{6}\.[\w-]{27}/g,
        /https:\/\/discord(?:app)?\.com\/api\/webhooks\/[0-9]+\/[a-zA-Z0-9_-]+/g
      ],
      type: "discord_token",
      category: "communication",
      minEntropy: 4.5,
      indicators: ["discord", "bot", "webhook"]
    },
    
    // Stripe (Category: payment) - CRITICAL
    {
      patterns: [
        /sk_live_[0-9a-zA-Z]{24}/g,
        /rk_live_[0-9a-zA-Z]{24}/g
      ],
      type: "stripe_live_key",
      category: "payment",
      minEntropy: 4.5,
      indicators: ["stripe", "payment", "live", "critical"],
      critical: true
    },
    
    // Twilio (Category: communication)
    {
      patterns: [/SK[0-9a-fA-F]{32}/g, /AC[0-9a-fA-F]{32}/g],
      type: "twilio_credential",
      category: "communication",
      minEntropy: 3.5,
      indicators: ["twilio", "sms", "voice"]
    },
    
    // SendGrid (Category: communication)
    {
      patterns: [/SG\.[\w\d\-_]{22}\.[\w\d\-_]{43}/g],
      type: "sendgrid_key",
      category: "communication",
      minEntropy: 4.5,
      indicators: ["sendgrid", "email", "smtp"]
    },
    
    // JWT (Category: auth)
    {
      patterns: [/eyJ[A-Za-z0-9_-]*\.eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*/g],
      type: "jwt_token",
      category: "auth",
      minEntropy: 4.0,
      indicators: ["jwt", "json_web_token", "authentication"]
    },
    
    // Database URIs (Category: database) - CRITICAL
    {
      patterns: [
        /mongodb(\+srv)?:\/\/[^\s'"]+/g,
        /postgres(?:ql)?:\/\/[^\s'"]+/g,
        /mysql:\/\/[^\s'"]+/g,
        /redis:\/\/[^\s'"]+/g
      ],
      type: "database_uri",
      category: "database",
      minEntropy: 3.0,
      indicators: ["database", "connection_string", "credentials_in_url"],
      critical: true
    },
    
    // Private Keys (Category: crypto) - CRITICAL
    {
      patterns: [
        /-----BEGIN (RSA|DSA|EC|OPENSSH)? PRIVATE KEY-----/g,
        /-----BEGIN PGP PRIVATE KEY BLOCK-----/g
      ],
      type: "private_key",
      category: "crypto",
      minEntropy: 4.5,
      indicators: ["private_key", "encryption", "certificate"],
      critical: true
    },
    
    // Generic high entropy (Category: generic)
    {
      patterns: [
        /api[_-]?key\s*[:=]\s*["']?[A-Za-z0-9\-._]{16,}/gi,
        /secret\s*[:=]\s*["']?[A-Za-z0-9\-._]{16,}/gi,
        /token\s*[:=]\s*["']?[A-Za-z0-9\-._]{16,}/gi,
        /bearer\s+[A-Za-z0-9_.-]{20,}/gi
      ],
      type: "generic_secret",
      category: "generic",
      minEntropy: 3.5,
      indicators: ["high_entropy", "possible_secret", "needs_review"]
    }
  ];

  // Process all contexts
  for (const context of secretContexts) {
    for (const pattern of context.patterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const candidate = match[0];
        
        // Skip if too short
        if (candidate.length < 10) continue;
        
        // Skip if contains false positive words
        const lowerCandidate = candidate.toLowerCase();
        const hasFalsePositive = FALSE_POSITIVE_WORDS.some(word => 
          lowerCandidate.includes(word.toLowerCase())
        );
        if (hasFalsePositive) continue;
        
        // Calculate entropy
        const entropy = shannonEntropy(candidate);
        const score = entropyScore(candidate);
        
        // Check if looks like real secret
        const secretLike = looksLikeSecret(candidate);
        
        // Additional validation if provided
        if (context.validate && !context.validate(candidate)) continue;
        
        // Validate against minimum entropy
        if (entropy >= context.minEntropy && (secretLike || context.critical)) {
          let confidence = "MEDIUM";
          if (context.critical) confidence = "CRITICAL";
          else if (entropy > 4.5) confidence = "HIGH";
          
          findings.push({
            type: `AI_${context.type.toUpperCase()}`,
            value: candidate.substring(0, 150),
            category: context.category,
            confidence: confidence,
            entropy: entropy.toFixed(2),
            entropyScore: Math.round(score),
            indicators: context.indicators,
            position: match.index,
            length: candidate.length
          });
        }
        
        // Prevent infinite loop
        if (match.index === pattern.lastIndex) {
          pattern.lastIndex++;
        }
      }
    }
  }

  // Remove duplicates
  const seen = new Set();
  return findings.filter(f => {
    const key = f.value.substring(0, 50);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

module.exports = { aiDetect, shannonEntropy, entropyScore, looksLikeSecret };