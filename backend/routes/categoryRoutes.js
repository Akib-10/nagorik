import express from 'express';
import { listCategories } from '../controllers/categoryController.js';

const router = express.Router();

router.get('/', listCategories); // public — the report form's dropdown

export default router;
