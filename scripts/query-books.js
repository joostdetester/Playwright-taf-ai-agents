const mysql = require('mysql2/promise');

async function main() {
  const config = {
    host: '127.0.0.1',
    port: 3307,
    user: 'joost',
    password: "9e9m-!sxQ4T8Q2.",
    database: 'rahulshettyacademy',
    connectTimeout: 5000,
  };

  let conn;
  try {
    conn = await mysql.createConnection(config);
  } catch (err) {
    console.error('Failed to connect to MySQL:', err.message || err);
    process.exitCode = 2;
    return;
  }

  try {
    const [rows] = await conn.execute('SELECT * FROM books');
    console.log(JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error('Query failed:', err.message || err);
    process.exitCode = 3;
  } finally {
    try { await conn.end(); } catch (e) {}
  }
}

main();
