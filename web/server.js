const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Store recent findings for new connections
let recentFindings = [];

function sendUpdate(data) {
  console.log(`[DASHBOARD] Sending ${data.results?.length || 0} findings for ${data.file?.substring(0, 50)}...`);
  
  // Store in recent findings
  recentFindings.push(data);
  if (recentFindings.length > 100) recentFindings.shift();
  
  // Emit to all connected clients
  io.emit("update", data);
}

// Handle client connections
io.on("connection", (socket) => {
  console.log(`[DASHBOARD] Client connected: ${socket.id}`);
  
  // Send recent findings to new client
  if (recentFindings.length > 0) {
    socket.emit("history", recentFindings);
    console.log(`[DASHBOARD] Sent ${recentFindings.length} historical findings`);
  }
  
  socket.on("disconnect", () => {
    console.log(`[DASHBOARD] Client disconnected: ${socket.id}`);
  });
});

const PORT = parseInt(process.env.PORT) || 3000;

server.listen(PORT, () => {
  console.log(`✅ Dashboard: http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use!`);
    console.error(`   Try: set PORT=${PORT + 1} && node bin/recon.js <target>`);
    process.exit(1);
  }
});

module.exports = { sendUpdate, io };