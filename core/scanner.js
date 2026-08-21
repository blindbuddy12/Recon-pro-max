const { Worker } = require("worker_threads");
const path = require("path");

function scanWithWorker(content, patterns) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.resolve(__dirname, "worker.js"));

    worker.postMessage({ content, patterns });

    worker.on("message", resolve);
    worker.on("error", reject);
  });
}

module.exports = { scanWithWorker };