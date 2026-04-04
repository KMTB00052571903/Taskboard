import { Request, Response, NextFunction } from 'express';
import { getUserFromRequest } from '../../middlewares/authMiddleware';
import {
  getBoardsService,
  createBoardService,
  getBoardWithTasksService,
  createTaskService,
  deleteTaskService,
  updateTaskStatusService,
} from './board.service';

export const getBoardsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const boards = await getBoardsService();
    res.json(boards);
  } catch (error) {
    next(error);
  }
};

export const createBoardController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = getUserFromRequest(req);
    const { name } = req.body;
    const board = await createBoardService(name, user.id);
    res.status(201).json(board);
  } catch (error) {
    next(error);
  }
};

export const getBoardWithTasksController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const board = await getBoardWithTasksService(req.params.id as string);
    res.json(board);
  } catch (error) {
    next(error);
  }
};

export const createTaskController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = getUserFromRequest(req);
    const { title } = req.body;
    const task = await createTaskService(req.params.boardId as string, title, user.id);
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

export const deleteTaskController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await deleteTaskService(req.params.boardId as string, req.params.taskId as string);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const updateTaskStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status } = req.body;
    const task = await updateTaskStatusService(
      req.params.boardId as string,
      req.params.taskId as string,
      status
    );
    res.json(task);
  } catch (error) {
    next(error);
  }
};
