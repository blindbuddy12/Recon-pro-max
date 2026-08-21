#!/usr/bin/env node

const axios = require("axios");
const fs = require("fs");
const path = require("path");

const { crawl } = require("../core/crawler");
const { scanWithWorker } = require("../core/scanner");
const { aiDetect } = require("../core/aiDetector");
const { classifyResults } = require("../core/mlClassifier");
const { extractParams } = require("../core/paramMiner");
const { detectGraphQL } = require("../core/graphql");
const { isPackedJS, deobfuscate } = require("../core/deobfuscator");
const { beautifyJS } = require("../utils/beautifier");
const { sendUpdate } = require("../web/server");
const { filterResults } = require("../core/filter");
const { validateResults } = require("../core/validator");

// Ensure reports directory exists
const reportsDir = path.join(__dirname, "..", "reports");
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

const patterns = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "patterns.json")));
const target = process.argv[2];

if (!target) {
  console.error("Usage: node bin/recon.js <target-url>");
  process.exit(1);
}

(async () => {
  console.log("╔════════════════════════════════════════╗");
  console.log("║     🔍 JS Secret Scanner Pro Max       ║");
  console.log("╚════════════════════════════════════════╝");
  console.log(`\n[INIT] Target: ${target}`);
  console.log(`[INIT] Patterns loaded: ${Object.keys(patterns).length}`);

  const jsFiles = await crawl(target, 2);
  console.log(`\n[INFO] Found ${jsFiles.length} unique JS sources to scan\n`);

  if (jsFiles.length === 0) {
    console.log("[WARNING] No JS files found!");
    return;
  }

  let resultsAll = [];
  let totalFindings = 0;
  let scannedCount = 0;
  let errorCount = 0;

  for (let file of jsFiles) {
    try {
      scannedCount++;
      process.stdout.write(`[${scannedCount}/${jsFiles.length}] Scanning: ${file.substring(0, 60)}... `);
      
      let content;
      
      // Handle data URIs (inline scripts)
      if (file.startsWith("data:")) {
        const base64Data = file.split(",")[1];
        content = Buffer.from(base64Data, 'base64').toString('utf-8');
      } else {
        const res = await axios.get(file, { 
          timeout: 15000,
          maxContentLength: 50 * 1024 * 1024, // 50MB max
          responseType: 'text'
        });
        content = res.data.toString();
      }

      // Skip if too small
      if (content.length < 100) {
        console.log("SKIP (too small)");
        continue;
      }

      // Deobfuscate if packed
      if (isPackedJS(content)) {
        content = deobfuscate(content);
      }

      // Beautify for better analysis
      content = beautifyJS(content);

      // Multi-layer detection
      let results = await scanWithWorker(content, patterns);
      let aiResults = aiDetect(content);

      // Combine
      let combined = [...results, ...aiResults];

      // Filter and validate
      combined = filterResults(combined);
      combined = validateResults(combined);
      combined = classifyResults(combined);

      // Only keep MEDIUM and HIGH confidence
      const significant = combined.filter(r => r.confidence === "MEDIUM" || r.confidence === "HIGH");
      
      console.log(`✓ Found: ${significant.length} secrets`);

      if (significant.length > 0) {
        totalFindings += significant.length;
        
        let output = {
          file: file.substring(0, 100),
          results: significant,
          params: extractParams(content),
          gql: detectGraphQL(content),
          fuzz: [],
          scannedAt: new Date().toISOString()
        };

        sendUpdate(output);
        resultsAll.push(output);
      }

    } catch (err) {
      errorCount++;
      console.log(`✗ Error: ${err.message.substring(0, 50)}`);
    }
  }

  // Save report
  const report = {
    scanInfo: {
      target,
      scannedAt: new Date().toISOString(),
      totalFiles: jsFiles.length,
      scannedFiles: scannedCount,
      errors: errorCount,
      totalFindings
    },
    findings: resultsAll
  };

  fs.writeFileSync(
    path.join(reportsDir, "report.json"), 
    JSON.stringify(report, null, 2)
  );

  console.log(`\n╔════════════════════════════════════════╗`);
  console.log(`║  📊 SCAN COMPLETE                      ║`);
  console.log(`╠════════════════════════════════════════╣`);
  console.log(`║  Files Scanned: ${scannedCount.toString().padStart(3)}                  ║`);
  console.log(`║  Total Secrets: ${totalFindings.toString().padStart(3)}                  ║`);
  console.log(`║  Errors:        ${errorCount.toString().padStart(3)}                  ║`);
  console.log(`╚════════════════════════════════════════╝`);
  console.log(`\n📁 Report saved to: reports/report.json`);
  console.log(`🌐 Dashboard: http://localhost:3000`);
})();