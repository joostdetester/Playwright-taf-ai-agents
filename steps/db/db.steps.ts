// steps/db/db.steps.ts
import { Given, When, Then } from '../bdd';
import { expect } from '@playwright/test';
import mysql from 'mysql2/promise';
import { projectConfig } from '../../config/project.config';
import { World } from '../world';
import { ensureDockerMysqlForDbTests } from './docker-mysql-bootstrap';

let connection: mysql.Connection;
let rows: any[] = [];

async function createConnectionWithRetry() {
  const maxAttempts = 30;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await mysql.createConnection({
        host: projectConfig.db.host,
        port: projectConfig.db.port ? Number(projectConfig.db.port) : undefined,
        user: projectConfig.db.user,
        password: projectConfig.db.password,
        database: projectConfig.db.name,
      });
    } catch (err) {
      lastError = err;
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  throw lastError;
}

Given('the database is available', async function () {
  await ensureDockerMysqlForDbTests(projectConfig.db);
  connection = await createConnectionWithRetry();

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS books (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      author VARCHAR(255) NOT NULL,
      published_year INT NOT NULL
    )
  `);

  await connection.execute(
    `DELETE FROM books WHERE author = 'BDD Author'`
  );

  const [result] = await connection.execute('SELECT 1 as ok');
  expect((result as any[])[0].ok).toBe(1);
});

When('I seed the books table with test data', async function () {
  await connection.execute(`
    INSERT INTO books (title, author, published_year)
    VALUES
      ('BDD DB Book 1', 'BDD Author', 2026),
      ('BDD DB Book 2', 'BDD Author', 2025)
  `);
});

Then('I can read the books from the database', async function () {
  const [result] = await connection.execute(
    `SELECT * FROM books WHERE author = 'BDD Author'`
  );

  rows = result as any[];
  expect(rows.length).toBeGreaterThan(0);
});

Given('the database contains books by {string}', async ({ world }, author: string) => {
  await ensureDockerMysqlForDbTests(projectConfig.db);
  const connection = await createConnectionWithRetry();

  // Try to read existing books for the author
  let [rows] = await connection.execute(
    `
    SELECT *
    FROM books
    WHERE author = ?
    `,
    [author]
  );

  world.dbBooks = (rows as any[]) || [];

  // If none found, insert a couple of sample rows and re-query
  if (!world.dbBooks.length) {
    await connection.execute(
      `
      INSERT INTO books (title, author, published_year)
      VALUES
        (?, ?, ?),
        (?, ?, ?)
      `,
      [
        `${author} Book 1`, author, new Date().getFullYear(),
        `${author} Book 2`, author, new Date().getFullYear() - 1,
      ]
    );

    const [newRows] = await connection.execute(
      `
      SELECT *
      FROM books
      WHERE author = ?
      `,
      [author]
    );

    world.dbBooks = (newRows as any[]) || [];
  }

  if (!world.dbBooks.length) {
    await connection.end();
    throw new Error(`No books found in DB for author "${author}" after seeding`);
  }

  await connection.end();
});