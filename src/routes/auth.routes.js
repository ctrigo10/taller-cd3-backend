import express from 'express';
import {
  signup,
  signin,
  loginCiudadania,
  callback,
  logout
} from '../controllers/auth.controller.js';
import { verifySignUp } from '../middlewares/index.js';

const router = express.Router();

// Signup Route
router.post(
  '/signup',
  [verifySignUp.checkDuplicateUsernameOrEmail, verifySignUp.checkRolesExisted],
  signup
);

// Signin Route
router.post('/signin', signin);

// Ciudadania Routes
router.get('/ciudadania', loginCiudadania);
router.get('/callback', callback);
router.get('/logout', logout);

export default router;
