import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import smsRoutes from './routes/sms.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Basic health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'Cyferion API v1' });
});

// API Routes
app.use('/api', smsRoutes);

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Cyferion Ingestion API running on port ${port}`);
  });
}

export default app;
