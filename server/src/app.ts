import express from 'express';

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'hello world' });
});

app.get('/status', (req, res) => {
  res.json({ message: 'Server is running' });
});

export default app;
