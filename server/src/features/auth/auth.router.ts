import { Router } from 'express';
import { loginController } from './auth.controller';

export const router = Router();

router.post('/login', loginController);
