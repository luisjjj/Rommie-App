import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth.js';
import { profileRouter, discoveryRouter } from './routes/discovery.js';
import { socialRouter } from './routes/social.js';
import { errorHandler } from './middleware/auth.js';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (_req, res) => res.json({ ok: true, service: 'roomie-backend', version: '0.1.0' }));

  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1', profileRouter);
  app.use('/api/v1', discoveryRouter);
  app.use('/api/v1', socialRouter);

  app.use((_req, res) => res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } }));
  app.use(errorHandler);
  return app;
}
