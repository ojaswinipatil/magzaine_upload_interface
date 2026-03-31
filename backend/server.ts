import express from 'express';
import { createServer as createViteServer } from 'vite';
import db from './src/db.js';
import { v4 as uuidv4 } from 'uuid';

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Mock user ID for now
  const MOCK_USER_ID = 'user_123';

  // API Routes
  app.get('/api/content', (req, res) => {
    const rows = db.prepare('SELECT * FROM content WHERE userId = ? ORDER BY updatedAt DESC').all(MOCK_USER_ID);
    res.json(rows.map((row: any) => ({
      ...row,
      data: JSON.parse(row.data)
    })));
  });

  app.post('/api/content', (req, res) => {
    const { type, title, data } = req.body;
    const id = uuidv4();
    const stmt = db.prepare('INSERT INTO content (id, userId, type, title, data) VALUES (?, ?, ?, ?, ?)');
    stmt.run(id, MOCK_USER_ID, type, title, JSON.stringify(data));
    res.json({ id, type, title, data });
  });

  app.get('/api/content/:id', (req, res) => {
    const row: any = db.prepare('SELECT * FROM content WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json({
      ...row,
      data: JSON.parse(row.data)
    });
  });

  app.put('/api/content/:id', (req, res) => {
    const { title, data, published } = req.body;
    const stmt = db.prepare('UPDATE content SET title = ?, data = ?, published = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ? AND userId = ?');
    stmt.run(title, JSON.stringify(data), published ? 1 : 0, req.params.id, MOCK_USER_ID);
    res.json({ success: true });
  });

  app.delete('/api/content/:id', (req, res) => {
    const stmt = db.prepare('DELETE FROM content WHERE id = ? AND userId = ?');
    stmt.run(req.params.id, MOCK_USER_ID);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
