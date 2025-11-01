const express = require('express');
const router = express.Router();
const { getDB } = require('../db');
const { nanoid } = require('nanoid');

// List books
router.get('/', async (req, res) => {
  const db = getDB();
  await db.read();
  res.json(db.data.books);
});

// Create book (admin-style, no auth for simplicity)
router.post('/', async (req, res) => {
  const db = getDB();
  const { title, author, year } = req.body;
  if (!title || !author) return res.status(400).json({ error: 'title and author required' });
  await db.read();
  const book = { id: nanoid(), title, author, year: year || null };
  db.data.books.push(book);
  await db.write();
  res.status(201).json(book);
});

// Get book
router.get('/:id', async (req, res) => {
  const db = getDB();
  await db.read();
  const book = db.data.books.find(b => b.id === req.params.id);
  if (!book) return res.status(404).json({ error: 'Not found' });
  res.json(book);
});

module.exports = router;
