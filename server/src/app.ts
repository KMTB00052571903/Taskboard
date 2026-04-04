import express from 'express';
import cors from 'cors';
import { errorsMiddleware } from './middlewares/errorsMiddleware';
import { router as authRouter } from './features/auth/auth.router';
import { router as boardRouter } from './features/boards/board.router';

export const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (_req, res) => {
  res.json([
    { method: 'POST', endpoint: '/api/auth/login' },
    { method: 'GET', endpoint: '/api/boards' },
    { method: 'POST', endpoint: '/api/boards' },
    { method: 'GET', endpoint: '/api/boards/:id' },
    { method: 'POST', endpoint: '/api/boards/:boardId/tasks' },
    { method: 'DELETE', endpoint: '/api/boards/:boardId/tasks/:taskId' },
    { method: 'PATCH', endpoint: '/api/boards/:boardId/tasks/:taskId' },
  ]);
});

app.use('/api/auth', authRouter);
app.use('/api/boards', boardRouter);

app.use(errorsMiddleware);
