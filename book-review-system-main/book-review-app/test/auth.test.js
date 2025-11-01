const request = require('supertest');
const app = require('../src/server');
const { initDB, getDB } = require('../src/db');
const { expect } = require('chai');

describe('Auth and Reviews API', function() {
  before(async () => {
    await initDB();
    const db = getDB();
    await db.read();
    db.data.users = [];
    db.data.books = [];
    db.data.reviews = [];
    // add a book
    db.data.books.push({ id: 'book1', title: 'Test Book', author: 'Author' });
    await db.write();
  });

  let token;
  it('registers a user', async () => {
    const res = await request(app).post('/api/auth/register').send({ username: 'alice', password: 'password' });
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('id');
  });

  it('logs in', async () => {
    const res = await request(app).post('/api/auth/login').send({ username: 'alice', password: 'password' });
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('token');
    token = res.body.token;
  });

  it('creates a review for book1', async () => {
    const res = await request(app).post('/api/reviews').set('Authorization', 'Bearer ' + token).send({ bookId: 'book1', rating: 5, text: 'Great!' });
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('id');
  });

  it('lists reviews for book1', async () => {
    const res = await request(app).get('/api/reviews').query({ bookId: 'book1' });
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array').that.is.not.empty;
  });
});
