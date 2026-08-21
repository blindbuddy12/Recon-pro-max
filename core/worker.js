const { parentPort } = require("worker_threads");

parentPort.on("message", ({ content, patterns }) => {
  const results = [];
  const text = content.toString();
  
  // Scan line by line for better context and performance
  const lines = text.split('\n');
  
  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const line = lines[lineNum];
    
    for (const [key, patternStr] of Object.entries(patterns)) {
      try {
        // Create fresh regex without 'g' flag for single match
        const regex = new RegExp(patternStr, "i");
        const match = regex.exec(line);
        
        if (match && match[0]) {
          const value = match[0];
          
          // Additional validation: must be reasonable length
          if (value.length >= 10 && value.length <= 500) {
            results.push({
              type: key,
              value: value,
              line: lineNum + 1,
              context: line.substring(0, 150).trim()
            });
          }
        }
      } catch (err) {
        // Invalid regex pattern, skip silently
      }
    }
  }

  parentPort.postMessage(results);
});