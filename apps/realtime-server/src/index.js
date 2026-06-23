const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const setupSessionManager = require('./socket/sessionManager');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*', // For MVP, allow all. In prod, restrict to frontend URL
    methods: ['GET', 'POST']
  }
});

setupSessionManager(io);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Real-time server listening on port ${PORT}`);
});
