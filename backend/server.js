import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import issueRoutes from './routes/issueRoutes.js';
// ==== PROFILE EDIT: START ====
import profileRoutes from './routes/profileRoutes.js';
// ==== PROFILE EDIT: END ====

const app = express();
app.use(cors());
// 10mb limit — report-এ base64 photo আপলোড থাকে, তাই বড় body allow করছি
app.use(express.json({ limit: '10mb' }));
app.use('/api/issues', issueRoutes);
app.use('/api/auth', authRoutes);
// ==== PROFILE EDIT: START ====
app.use('/api/profile', profileRoutes);
// ==== PROFILE EDIT: END ====

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.json({ status: 'ok', database: states[dbState] || dbState });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();