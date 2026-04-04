import { Router } from 'express';
import { authMiddleware } from '../../middlewares/authMiddleware';
import {
  getBoardsController,
  createBoardController,
  getBoardWithTasksController,
  createTaskController,
  deleteTaskController,
  updateTaskStatusController,
} from './board.controller';

export const router = Router();

router.get('/', authMiddleware, getBoardsController);
router.post('/', authMiddleware, createBoardController);
router.get('/:id', authMiddleware, getBoardWithTasksController);

router.post('/:boardId/tasks', authMiddleware, createTaskController);
router.delete('/:boardId/tasks/:taskId', authMiddleware, deleteTaskController);
router.patch('/:boardId/tasks/:taskId', authMiddleware, updateTaskStatusController);
