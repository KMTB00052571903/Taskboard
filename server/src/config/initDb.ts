import { db } from "./database";
import bcrypt from "bcryptjs";

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

const SEED_IDS = {
  alice: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  bob: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  charlie: "c3d4e5f6-a7b8-9012-cdef-123456789012",
  board: "d4e5f6a7-b8c9-0123-defa-234567890123",
};

const seedData = async (): Promise<void> => {
  const hash = await bcrypt.hash("123456", 10);

  await db.query(
    "INSERT INTO users (id, email, password, user_name) VALUES ($1, $2, $3, $4)",
    [SEED_IDS.alice, "alice@email.com", hash, "Alice"],
  );

  await db.query(
    "INSERT INTO users (id, email, password, user_name) VALUES ($1, $2, $3, $4)",
    [SEED_IDS.bob, "bob@email.com", hash, "Bob"],
  );

  await db.query(
    "INSERT INTO users (id, email, password, user_name) VALUES ($1, $2, $3, $4)",
    [SEED_IDS.charlie, "charlie@email.com", hash, "Charlie"],
  );

  await db.query(
    "INSERT INTO boards (id, name, created_by) VALUES ($1, $2, $3)",
    [SEED_IDS.board, "Sprint Board", SEED_IDS.alice],
  );

  await db.query(
    "INSERT INTO tasks (title, status, board_id, created_by) VALUES ($1, $2, $3, $4)",
    ["Diseñar interfaz", "TODO", SEED_IDS.board, SEED_IDS.alice],
  );
  await db.query(
    "INSERT INTO tasks (title, status, board_id, created_by) VALUES ($1, $2, $3, $4)",
    ["Configurar base de datos", "IN_PROGRESS", SEED_IDS.board, SEED_IDS.alice],
  );
  await db.query(
    "INSERT INTO tasks (title, status, board_id, created_by) VALUES ($1, $2, $3, $4)",
    ["Escribir documentación", "COMPLETED", SEED_IDS.board, SEED_IDS.alice],
  );

  console.log("Seed data created");
};
