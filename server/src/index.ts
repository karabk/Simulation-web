import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeInMemoryDatabase } from './db.js';
import { ensureSandboxLayout, SAFE_ROOT } from './utils/fsSandbox.js';

// Routes
import userRoutes from './routes/user.js';
import translationRoutes from './routes/translations.js';
import documentRoutes from './routes/documents.js';
import uploadRoutes from './routes/upload.js';
import simulationRoutes from './routes/simulations.js';

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 8080;

app.use(cors({ origin: true }));
app.use(express.json({ limit: '5mb' }));

// Initialize DB and sandbox
initializeInMemoryDatabase();
ensureSandboxLayout();

// Disclaimer header for every response
app.use((req, res, next) => {
  res.setHeader('X-Education-Disclaimer', 'FOR EDUCATIONAL USE ONLY; DO NOT DEPLOY PUBLICLY');
  next();
});

// API routes
app.use('/api/user', userRoutes);
app.use('/api/translations', translationRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api', simulationRoutes);

// Serve client if built
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDist = path.resolve(__dirname, '../public');
app.use(express.static(clientDist));
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`WebSec Simulation server running on http://localhost:${port}`);
  // eslint-disable-next-line no-console
  console.log(`Sandbox root: ${SAFE_ROOT}`);
});
