import express from 'express';
import { authJwt } from '../middlewares/index.js';
import {
  uploadFile,
  uploadMiddleware,
} from '../controllers/documento.controller.js';

const router = express.Router();

router.post('/upload', [authJwt.verifyToken], uploadMiddleware, uploadFile);

export default router;
