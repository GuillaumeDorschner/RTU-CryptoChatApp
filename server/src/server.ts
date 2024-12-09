import http from 'http';
import app from './app';
import { WebSocketServer } from './ws';

const PORT = 3000;

const server = http.createServer(app);

WebSocketServer(server);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
