import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  const userId = req.cookies.userId;

  res.send(`
    <html>
      <body>
        <h1>Your userId is : ${userId}</h1>
      </body>
    </html>
  `);
});

app.get('/api', (req, res) => {
  res.json({ message: 'Hello, world!' });
});

app.get('/status', (req, res) => {
  res.json({ message: 'Server is running' });
});

export default app;
