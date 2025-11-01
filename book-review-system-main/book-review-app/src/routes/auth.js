const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDB } = require('../db');
const { nanoid } = require('nanoid');
const SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';

// Register
router.post('/register', async (req, res) => {
  const db = getDB();
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  await db.read();
  const existing = db.data.users.find(u => u.username === username);
  if (existing) return res.status(400).json({ error: 'User exists' });
  const hash = await bcrypt.hash(password, 8);
  const user = { id: nanoid(), username, password: hash };
  db.data.users.push(user);
  await db.write();
  res.json({ id: user.id, username: user.username });
});

// Login
router.post('/login', async (req, res) => {
  const db = getDB();
  const { username, password } = req.body;
  await db.read();
  const user = db.data.users.find(u => u.username === username);
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: '2h' });
  res.json({ token });
});

module.exports = router;
