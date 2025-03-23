import express from 'express';
import { authJwt } from '../middlewares/index.js';
import {
  uploadFile,
  uploadMiddleware,
} from '../controllers/documento.controller.js';

const router = express.Router();

router.post('/upload', [authJwt.verifyToken], uploadMiddleware, uploadFile);

router.post('/callback', (req, res) => {
  console.log('Respuesta Aprobador: ', req.body)
  res.send(req.body)
})

export default router;
