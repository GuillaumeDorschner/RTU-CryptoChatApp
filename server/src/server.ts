import http from 'http';
import app from './api';
import { startWebSocketServer } from './ws';

const PORT = 3000;
const WS_PORT = 3001;

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`HTTP server running on http://localhost:${PORT}`);
});

startWebSocketServer(WS_PORT);
