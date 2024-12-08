import express from 'express';

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  const userId = (req as any).userId;
  res.send(`
    <html>
      <body>
        <h1>Bienvenue</h1>
        <p>Votre userId est : ${userId}</p>
      </body>
    </html>
  `);
});

app.get('/status', (req, res) => {
  res.json({ message: 'Server is running' });
});

export default app;
