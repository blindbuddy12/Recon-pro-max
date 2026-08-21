# Recon Pro Max 🔍

**Recon Pro Max** is a high-performance, multi-threaded JavaScript security analysis engine designed for security researchers, bug bounty hunters, and penetration testers. It automates the discovery of exposed API secrets, hidden routes, parameter sinks, and structural vulnerabilities within target Webpack/JavaScript assets.

By leveraging Shannon Entropy calculations, AST-based heuristic analysis, and parallel worker threads, **Recon Pro Max** delivers high-speed asset parsing while drastically minimizing false positives.

---

## 🚀 Key Features

### 🔐 Multi-Tiered Secret & Credential Detection
* **Strict RegEx & Entropy Engine:** Identifies AWS, Google, Stripe, JWT, SSH keys, and database connection strings using Shannon Entropy analysis.
* **Contextual Heuristics:** Calculates character diversity and filters out test environment keywords (`mock`, `sandbox`, `localhost`).
* **Noise Pruning:** Automatically ignores JS method calls, property names, and SHA integrity hashes.

### 🌐 JS Asset Crawling & Parsing
* **Recursive Discovery:** Uncovers dynamic chunk scripts, external JS endpoints, and inline Base64 payloads using `axios` and `cheerio`.
* **Code Deobfuscation:** Detects minified or packed JS blocks and normalizes code via `js-beautify` prior to evaluation.
* **Source Map Probing:** Checks for exposed `.js.map` files to reconstruct original backend client code.

### 🎯 Endpoint & Attack Surface Analysis
* **Parameter Extractor & Fuzzer:** Extracts hidden URL query parameters and tests endpoint responsiveness.
* **GraphQL Detector:** Surfaces exposed GraphQL endpoints, schemas, and query definitions.
* **Severity Classifier:** Evaluates match complexity (casing, digits, entropy) to assign automated risk levels (`Critical`, `High`, `Medium`, `Low`).

### ⚡ Engine & Performance Architecture
* **Multi-Threaded Processing:** Utilizes Node.js `worker_threads` for non-blocking parallel parsing of massive Webpack bundles.
* **Dual Interface:** Full interactive CLI runner alongside a modern Express-powered Web Dashboard.
* **Multi-Format Reporting:** Generates structured output files in JSON, HTML, and raw text formats.

---

## 📊 High-Level Engine Architecture

               ┌────────────────────────┐
               │    Target Website      │
               └───────────┬────────────┘
                           │
                 [ 🕷️ Crawler Module ]
                           │
      ┌────────────────────┴────────────────────┐
      ▼                                         ▼
[ 📜 External Scripts ]               [ 📦 Webpack Chunks ]
      │                                         │
      └────────────────────┬────────────────────┘
                           │
               [ 🧹 Deobfuscator Engine ]
                           │
          ┌────────────────┴────────────────┐
          ▼                                 ▼
[ 🧵 Worker Thread Pool ]         [ 🔍 Secret & FP Filter ]
          │                                 │
          └────────────────┬────────────────┘
                           │
               [ 🛡️ Severity Classifier ]
                           │
          ┌────────────────┴────────────────┐
          ▼                                 ▼
[ 🖥️ Interactive CLI ]             [ 📊 Web Dashboard UI ]

📋 System Requirements

Node.js: v18.0.0 or higher

npm: v9.0.0 or higher

Operating System: Linux (Kali, Ubuntu), macOS, or Windows WSL

🛠️ Installation

# 1. Clone the repository
git clone [https://github.com/YOUR-USERNAME/recon-pro-max.git](https://github.com/YOUR-USERNAME/recon-pro-max.git)

# 2. Navigate into project directory
cd recon-pro-max

# 3. Install core CLI dependencies
npm install

# 4. Install Web Dashboard dependencies
cd web && npm install && cd ..
🖥️ Usage Guide

Command Line Interface (CLI)
Run a full security scan against a target domain:

Bash
node bin/recon.js --url [https://target.com](https://target.com) --depth 2 --threads 4
Filter specific analysis modules:

Bash
node bin/recon.js --url [https://target.com/app.js](https://target.com/app.js) --secrets-only
Web GUI Dashboard
Launch the local web server:

Bash
npm run web
Open your browser and navigate to http://localhost:3000 to run scans and view real-time findings.

🗂️ Project Structure

recon-pro-max/
├── bin/                       # Executable CLI entry point
│   └── recon.js
├── core/                      # Engine scanner modules
│   ├── aiEngine.js            # Shannon entropy & heuristics
│   ├── classifier.js          # Finding severity mapping
│   ├── crawler.js             # Asset discovery & fetching
│   ├── deobfuscator.js        # JS unminification
│   ├── falsePositive.js       # False positive reduction
│   ├── graphqlDetector.js     # GraphQL probe engine
│   ├── paramExtractor.js      # Parameter extractor & fuzzer
│   ├── validator.js           # Secret matching regex rules
│   ├── worker.js              # Multi-thread worker process
│   └── workerPool.js          # Parallel execution thread pool
├── config/                    # Detection rules & configurations
│   └── regexRules.json
├── utils/                     # Logging & output handlers
│   └── logger.js
├── web/                       # Web Dashboard Application
│   ├── public/                # Frontend assets & HTML UI
│   ├── package.json           # Web dashboard dependencies
│   └── server.js              # Express API server
├── reports/                   # Saved scan output (.json / .html)
├── package.json               # Root CLI package manager
└── .gitignore                 # Dependency exclusions

⚠️ Disclaimer

Recon Pro Max is built exclusively for authorized penetration testing, bug bounty research, and security audits. Do NOT execute scans against targets without prior written authorization. The developer assumes no liability for misuse or damage caused by this utility.

🧑‍💻 Author

Developed as an advanced JavaScript reconnaissance framework to demonstrate:

Offensive Static Application Security Testing (SAST)

Node.js Multi-Threading & Asynchronous Stream Processing

Heuristic Entropy Analysis for Secret Leakage Detection
