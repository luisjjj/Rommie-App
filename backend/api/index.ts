import { createApp } from '../src/app.js';

// Vercel serverless entry: the platform imports this handler per invocation.
// Routes already handle EOF/response lifecycles; there is no persistent listener.
const app = createApp();

export default function handler(req: any, res: any) {
  return app(req, res);
}
