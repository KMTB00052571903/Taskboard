import { Request, Response, NextFunction } from 'express';
import { authenticateUserService } from './auth.service';

export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const result = await authenticateUserService({ email, password });
    res.json(result);
  } catch (error) {
    next(error);
  }
};
