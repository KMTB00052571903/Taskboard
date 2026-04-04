import Boom from '@hapi/boom';
import { db } from '../../config/database';
import { supabase } from '../../config/supabase';
import { BoardWithCreator, BoardWithTasks, TaskWithCreator } from './board.types';

// ─── Broadcast helpers ───────────────────────────────────────

const broadcastTaskCreated = async (boardId: string, task: TaskWithCreator) => {
  const channel = supabase.channel(`board:${boardId}`);
  await channel.httpSend('task-created', task);
  supabase.removeChannel(channel);
};

const broadcastTaskDeleted = async (boardId: string, taskId: string) => {
  const channel = supabase.channel(`board:${boardId}`);
  await channel.httpSend('task-deleted', { taskId });
  supabase.removeChannel(channel);
};

const broadcastTaskUpdated = async (boardId: string, task: TaskWithCreator) => {
  const channel = supabase.channel(`board:${boardId}`);
  await channel.httpSend('task-updated', task);
  supabase.removeChannel(channel);
};

// ─── Board services ──────────────────────────────────────────

export const getBoardsService = async (): Promise<BoardWithCreator[]> => {
  const result = await db.query<BoardWithCreator>(
    `SELECT b.id, b.name, b.created_at,
      json_build_object('user_name', u.user_name, 'email', u.email) AS created_by
    FROM boards b
    JOIN users u ON u.id = b.created_by
    ORDER BY b.created_at DESC`
  );
  return result.rows;
};

export const createBoardService = async (
  name: string,
  userId: string
): Promise<BoardWithCreator> => {
  const result = await db.query<BoardWithCreator>(
    `WITH inserted AS (
      INSERT INTO boards (name, created_by) VALUES ($1, $2)
      RETURNING id, name, created_by, created_at
    )
    SELECT i.id, i.name, i.created_at,
      json_build_object('user_name', u.user_name, 'email', u.email) AS created_by
    FROM inserted i
    JOIN users u ON u.id = i.created_by`,
    [name, userId]
  );
  return result.rows[0];
};

export const getBoardWithTasksService = async (
  boardId: string
): Promise<BoardWithTasks> => {
  const boardResult = await db.query<BoardWithCreator>(
    `SELECT b.id, b.name, b.created_at,
      json_build_object('user_name', u.user_name, 'email', u.email) AS created_by
    FROM boards b
    JOIN users u ON u.id = b.created_by
    WHERE b.id = $1`,
    [boardId]
  );

  if (boardResult.rows.length === 0) {
    throw Boom.notFound('Board not found');
  }

  const tasksResult = await db.query<TaskWithCreator>(
    `SELECT t.id, t.title, t.status, t.board_id, t.created_at,
      json_build_object('user_name', u.user_name, 'email', u.email) AS created_by
    FROM tasks t
    JOIN users u ON u.id = t.created_by
    WHERE t.board_id = $1
    ORDER BY t.created_at ASC`,
    [boardId]
  );

  return { ...boardResult.rows[0], tasks: tasksResult.rows };
};

// ─── Task services ───────────────────────────────────────────

export const createTaskService = async (
  boardId: string,
  title: string,
  userId: string
): Promise<TaskWithCreator> => {
  const result = await db.query<TaskWithCreator>(
    `WITH inserted AS (
      INSERT INTO tasks (title, board_id, created_by) VALUES ($1, $2, $3)
      RETURNING id, title, status, board_id, created_by, created_at
    )
    SELECT i.id, i.title, i.status, i.board_id, i.created_at,
      json_build_object('user_name', u.user_name, 'email', u.email) AS created_by
    FROM inserted i
    JOIN users u ON u.id = i.created_by`,
    [title, boardId, userId]
  );

  const task = result.rows[0];
  broadcastTaskCreated(boardId, task);
  return task;
};

export const deleteTaskService = async (
  boardId: string,
  taskId: string
): Promise<void> => {
  const result = await db.query(
    'DELETE FROM tasks WHERE id = $1 AND board_id = $2 RETURNING id',
    [taskId, boardId]
  );

  if (result.rows.length === 0) {
    throw Boom.notFound('Task not found');
  }

  broadcastTaskDeleted(boardId, taskId);
};

export const updateTaskStatusService = async (
  boardId: string,
  taskId: string,
  status: string
): Promise<TaskWithCreator> => {
  const validStatuses = ['TODO', 'IN_PROGRESS', 'COMPLETED'];
  if (!validStatuses.includes(status)) {
    throw Boom.badRequest('Estado inválido. Debe ser TODO, IN_PROGRESS o COMPLETED');
  }

  const result = await db.query<TaskWithCreator>(
    `WITH updated AS (
      UPDATE tasks SET status = $1 WHERE id = $2 AND board_id = $3
      RETURNING id, title, status, board_id, created_by, created_at
    )
    SELECT u.id, u.title, u.status, u.board_id, u.created_at,
      json_build_object('user_name', usr.user_name, 'email', usr.email) AS created_by
    FROM updated u
    JOIN users usr ON usr.id = u.created_by`,
    [status, taskId, boardId]
  );

  if (result.rows.length === 0) {
    throw Boom.notFound('Task not found');
  }

  const task = result.rows[0];
  broadcastTaskUpdated(boardId, task);
  return task;
};
