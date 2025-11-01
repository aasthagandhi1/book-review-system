const { Low, JSONFile } = require('lowdb');
const path = require('path');

const file = path.join(__dirname, '..', 'data.json');

let db;

async function initDB() {
  const adapter = new JSONFile(file);
  db = new Low(adapter);
  await db.read();
  if (!db.data) {
    db.data = { users: [], books: [], reviews: [] };
    await db.write();
  }
}

function getDB() {
  return db;
}

module.exports = { initDB, getDB };
