import './config/env.js';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { co2 } from '@tgwf/co2';

import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import issueRoutes from './routes/issueRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import userRoutes from './routes/userRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';


const app = express();
app.use(cors());
// Media now travels as multipart straight to Cloudinary; JSON bodies only
// carry normal form fields and Cloudinary metadata references.
app.use(express.json({ limit: '1mb' }));

// Initialize CO2.js with the Sustainable Web Design model
const co2Emission = new co2({ model: 'swd' });

// Middleware to calculate data transfer size
app.use((req, res, next) => {
  let requestBytes = 0;
  let responseBytes = 0;

  // Calculate request size
  if (req.body) {
    requestBytes = Buffer.byteLength(JSON.stringify(req.body), 'utf8');
  }
  if (req.query) {
    requestBytes += Buffer.byteLength(JSON.stringify(req.query), 'utf8');
  }
  if (req.headers) {
    requestBytes += Buffer.byteLength(JSON.stringify(req.headers), 'utf8');
  }

  // Override res.write to calculate response size
  const originalWrite = res.write;
  const originalEnd = res.end;

  res.write = function (chunk) {
    if (chunk) {
      responseBytes += Buffer.byteLength(chunk, 'utf8');
    }
    originalWrite.apply(res, arguments);
  };

  res.end = function (chunk) {
    if (chunk) {
      responseBytes += Buffer.byteLength(chunk, 'utf8');
    }
    // Store total bytes
    res.locals.totalBytes = requestBytes + responseBytes;
    // Calculate carbon emissions
    const greenHost = false; // Set to true if your server is hosted on a green host
    const emissions = co2Emission.perByte(res.locals.totalBytes, greenHost);
    console.log(`Data transferred: ${res.locals.totalBytes} bytes`);
    console.log(`Estimated CO2 emissions: ${emissions.toFixed(3)} grams`);
    originalEnd.apply(res, arguments);
  };

  next();
});
app.use('/api/issues', issueRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/admin', adminRoutes); 
app.use('/api/categories', categoryRoutes);


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