import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';

// ─── Mock Supabase (hoisted — no external references) ────────
vi.mock('../config/supabase', () => {
  const mockHttpSend = vi.fn().mockResolvedValue(undefined);
  const mockChannel = vi.fn().mockReturnValue({ httpSend: mockHttpSend });
  const mockRemoveChannel = vi.fn();

  return {
    supabase: {
      channel: mockChannel,
      removeChannel: mockRemoveChannel,
      __mockHttpSend: mockHttpSend,
      __mockChannel: mockChannel,
      __mockRemoveChannel: mockRemoveChannel,
    },
  };
});

import { app } from '../app';
import { initDb } from '../config/initDb';
import { supabase } from '../config/supabase';

const mockChannel = (supabase as any).__mockChannel as ReturnType<typeof vi.fn>;
const mockHttpSend = (supabase as any).__mockHttpSend as ReturnType<typeof vi.fn>;

beforeEach(async () => {
  await initDb();
  mockHttpSend.mockClear();
  mockChannel.mockClear();
});

// ─── Helpers ─────────────────────────────────────────────────
async function login(email: string, password: string): Promise<string> {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email, password });
  return res.body.token;
}

async function getFirstBoardId(token: string): Promise<string> {
  const res = await request(app)
    .get('/api/boards')
    .set('Authorization', `Bearer ${token}`);
  return res.body[0].id;
}

// ─────────────────────────────────────────────────────────────
// Requerimiento 1 — Broadcast task-created al crear una tarea
// ─────────────────────────────────────────────────────────────
describe('Requerimiento 1: Broadcast task-created al crear una tarea', () => {
  it('debe hacer broadcast de task-created en el canal board:{boardId}', async () => {
    const token = await login('alice@email.com', '123456');
    const boardId = await getFirstBoardId(token);

    const res = await request(app)
      .post(`/api/boards/${boardId}/tasks`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Nueva tarea de prueba' });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Nueva tarea de prueba');

    expect(mockChannel).toHaveBeenCalledWith(`board:${boardId}`);
    expect(mockHttpSend).toHaveBeenCalledWith(
      'task-created',
      expect.objectContaining({ title: 'Nueva tarea de prueba' })
    );
  });
});

// ─────────────────────────────────────────────────────────────
// Requerimiento 2 — Broadcast task-deleted al eliminar una tarea
// ─────────────────────────────────────────────────────────────
describe('Requerimiento 2: Broadcast task-deleted al eliminar una tarea', () => {
  it('debe hacer broadcast de task-deleted en el canal board:{boardId}', async () => {
    const token = await login('alice@email.com', '123456');
    const boardId = await getFirstBoardId(token);

    // Get an existing task
    const boardRes = await request(app)
      .get(`/api/boards/${boardId}`)
      .set('Authorization', `Bearer ${token}`);
    const taskId = boardRes.body.tasks[0].id;

    mockChannel.mockClear();
    mockHttpSend.mockClear();

    const res = await request(app)
      .delete(`/api/boards/${boardId}/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(204);

    expect(mockChannel).toHaveBeenCalledWith(`board:${boardId}`);
    expect(mockHttpSend).toHaveBeenCalledWith(
      'task-deleted',
      expect.objectContaining({ taskId })
    );
  });
});

// ─────────────────────────────────────────────────────────────
// Requerimiento 3 — Broadcast task-updated al cambiar estado
// ─────────────────────────────────────────────────────────────
describe('Requerimiento 3: Broadcast task-updated al cambiar estado de una tarea', () => {
  it('debe hacer broadcast de task-updated en el canal board:{boardId}', async () => {
    const token = await login('alice@email.com', '123456');
    const boardId = await getFirstBoardId(token);

    // Get an existing task with status TODO
    const boardRes = await request(app)
      .get(`/api/boards/${boardId}`)
      .set('Authorization', `Bearer ${token}`);
    const task = boardRes.body.tasks.find((t: { status: string }) => t.status === 'TODO');

    mockChannel.mockClear();
    mockHttpSend.mockClear();

    const res = await request(app)
      .patch(`/api/boards/${boardId}/tasks/${task.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'IN_PROGRESS' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('IN_PROGRESS');

    expect(mockChannel).toHaveBeenCalledWith(`board:${boardId}`);
    expect(mockHttpSend).toHaveBeenCalledWith(
      'task-updated',
      expect.objectContaining({ status: 'IN_PROGRESS' })
    );
  });
});
