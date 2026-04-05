import { Router } from 'express';
import { loginController, refreshTokenController, signupController } from '../controllers/authController';

export const authRouter = Router();

// Public
authRouter.post('/login', loginController);
authRouter.post('/signup', signupController);
authRouter.post('/refresh-token', refreshTokenController);
