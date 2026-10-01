// backend/config/env.js
// Loads backend/.env once, before any other module reads process.env.
//
// This must be *imported* (never called) by config modules: ES module imports
// are hoisted and evaluated before the importing module's body, so a plain
// `dotenv.config()` call in server.js runs too late — config/cloudinary.js and
// config/media.js snapshot process.env at module scope and would freeze on
// empty values.
//
// The path is resolved relative to this file, not process.cwd(), so the server
// and scripts behave the same no matter which directory they are launched from.
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

dotenv.config({
  path: fileURLToPath(new URL('../.env', import.meta.url)),
});