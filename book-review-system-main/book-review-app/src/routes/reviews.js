const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getDB } = require('../db');
const { nanoid } = require('nanoid');

// List reviews for a book: /api/reviews?bookId=...
router.get('/', async (req, res) => {
  const db = getDB();
  await db.read();
  const bookId = req.query.bookId;
  if (bookId) {
    const reviews = db.data.reviews.filter(r => r.bookId === bookId);
    return res.json(reviews);
  }
  res.json(db.data.reviews);
});

// Create review (authenticated)
router.post('/', auth, async (req, res) => {
  const db = getDB();
  const { bookId, rating, text } = req.body;
  if (!bookId || !rating) return res.status(400).json({ error: 'bookId and rating required' });
  await db.read();
  const book = db.data.books.find(b => b.id === bookId);
  if (!book) return res.status(400).json({ error: 'Invalid bookId' });
  const review = { id: nanoid(), bookId, userId: req.user.id, username: req.user.username, rating, text: text || '', createdAt: new Date().toISOString() };
  db.data.reviews.push(review);
  await db.write();
  res.status(201).json(review);
});

// Update review (owner)
router.put('/:id', auth, async (req, res) => {
  const db = getDB();
  await db.read();
  const rev = db.data.reviews.find(r => r.id === req.params.id);
  if (!rev) return res.status(404).json({ error: 'Not found' });
  if (rev.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  rev.rating = req.body.rating ?? rev.rating;
  rev.text = req.body.text ?? rev.text;
  await db.write();
  res.json(rev);
});

// Delete review (owner)
router.delete('/:id', auth, async (req, res) => {
  const db = getDB();
  await db.read();
  const idx = db.data.reviews.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const rev = db.data.reviews[idx];
  if (rev.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  db.data.reviews.splice(idx,1);
  await db.write();
  res.json({ success: true });
});

module.exports = router;
