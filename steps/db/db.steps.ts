// steps/db/db.steps.ts
import { Given, When, Then } from '../bdd';
import { expect } from '@playwright/test';
import mysql from 'mysql2/promise';
import { projectConfig } from '../../config/project.config';

let connection: mysql.Connection;
let rows: any[] = [];

Given('the database is available', async function () {
  connection = await mysql.createConnection({
    host: projectConfig.db.host,
    port: projectConfig.db.port ? Number(projectConfig.db.port) : undefined,
    user: projectConfig.db.user,
    password: projectConfig.db.password,
    database: projectConfig.db.name,
  });

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