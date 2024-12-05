import http from 'http';
import app from './app';
import { setupWebSocket } from './ws';

const PORT = 3000;

// Crée un serveur HTTP à partir d'Express
const server = http.createServer(app);

// Configure WebSocket
setupWebSocket(server);

// Démarre le serveur
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
