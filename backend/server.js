import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import issueRoutes from './routes/issueRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
// ==== PROFILE EDIT: START ====
import profileRoutes from './routes/profileRoutes.js';
// ==== PROFILE EDIT: END ====
// ==== NOTIFICATION EDIT: START ====
import notificationRoutes from './routes/notificationRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
// ==== NOTIFICATION EDIT: END ====

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/api/issues', issueRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// ==== PROFILE EDIT: START ====
app.use('/api/profile', profileRoutes);
// ==== PROFILE EDIT: END ====
// ==== NOTIFICATION EDIT: START ====
app.use('/api/notifications', notificationRoutes);
app.use('/api/comments', commentRoutes);
// ==== NOTIFICATION EDIT: END ====

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