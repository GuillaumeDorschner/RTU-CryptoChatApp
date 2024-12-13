import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send(`
    <html>
      <body>
        <h1>Bienvenue</h1>
        <p>Votre userId est : Welcome User</p>
      </body>
    </html>
  `);
});

app.get('/status', (req, res) => {
  res.json({ message: 'Server is running' });
});

app.post('/api/generateUserId', (req, res) => {
  try {
    const userId = uuidv4();
    res.status(201).json({ userId });
  } catch (error) {
    console.error('Error generating user ID:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default app;
