import Database from 'better-sqlite3';
const db = new Database('app.db');

const query = `
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    dueDate TEXT NOT NULL,
    isComplete INTEGER NOT NULL
)`;

db.exec(query);

export { db };