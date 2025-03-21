import express from 'express';
import { signup, signin, callback, loginCD } from '../controllers/auth.controller.js';
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

// Ciudadanía Digital Auteticación
router.get('/ciudadania', loginCD)
router.get('/callback', callback)

export default router;
