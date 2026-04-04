import { db } from './database';
import bcrypt from 'bcryptjs';

export const initDb = async (): Promise<void> => {
  await db.exec(`
    DROP TABLE IF EXISTS tasks CASCADE;
    DROP TABLE IF EXISTS boards CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
      email     TEXT NOT NULL UNIQUE,
      password  TEXT NOT NULL,
      user_name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS boards (
      id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
      name       TEXT NOT NULL,
      created_by TEXT NOT NULL REFERENCES users(id),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
      title      TEXT NOT NULL,
      status     TEXT NOT NULL DEFAULT 'TODO',
      board_id   TEXT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
      created_by TEXT NOT NULL REFERENCES users(id),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  await seedData();
};

const seedData = async (): Promise<void> => {
  const hash = await bcrypt.hash('123456', 10);

  const alice = await db.query<{ id: string }>(
    'INSERT INTO users (email, password, user_name) VALUES ($1, $2, $3) RETURNING id',
    ['alice@email.com', hash, 'Alice']
  );

  await db.query(
    'INSERT INTO users (email, password, user_name) VALUES ($1, $2, $3)',
    ['bob@email.com', hash, 'Bob']
  );

  await db.query(
    'INSERT INTO users (email, password, user_name) VALUES ($1, $2, $3)',
    ['charlie@email.com', hash, 'Charlie']
  );

  const board = await db.query<{ id: string }>(
    'INSERT INTO boards (name, created_by) VALUES ($1, $2) RETURNING id',
    ['Sprint Board', alice.rows[0].id]
  );

  const boardId = board.rows[0].id;

  await db.query(
    "INSERT INTO tasks (title, status, board_id, created_by) VALUES ($1, $2, $3, $4)",
    ['Diseñar interfaz', 'TODO', boardId, alice.rows[0].id]
  );
  await db.query(
    "INSERT INTO tasks (title, status, board_id, created_by) VALUES ($1, $2, $3, $4)",
    ['Configurar base de datos', 'IN_PROGRESS', boardId, alice.rows[0].id]
  );
  await db.query(
    "INSERT INTO tasks (title, status, board_id, created_by) VALUES ($1, $2, $3, $4)",
    ['Escribir documentación', 'COMPLETED', boardId, alice.rows[0].id]
  );

  console.log('Seed data created');
};
