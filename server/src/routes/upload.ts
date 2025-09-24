import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { SAFE_ROOT } from '../utils/fsSandbox.js';

const router = Router();

const uploadsDir = path.join(SAFE_ROOT, 'uploads');
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`)
});
const upload = multer({ storage });

router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const fullPath = path.join(uploadsDir, req.file.filename);
  const meta = {
    originalName: req.file.originalname,
    storedName: req.file.filename,
    path: fullPath,
    size: req.file.size,
    mimetype: req.file.mimetype,
  };

  // Optional: preview parsed content for JSON/CSV
  let preview: unknown = undefined;
  try {
    if (req.file.mimetype === 'application/json' || req.file.originalname.toLowerCase().endsWith('.json')) {
      preview = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
    } else if (req.file.originalname.toLowerCase().endsWith('.csv')) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const lines = content.trim().split(/\r?\n/).slice(0, 5);
      preview = { firstLines: lines };
    } else if (req.file.mimetype === 'image/png' || req.file.originalname.toLowerCase().endsWith('.png')) {
      preview = { note: 'PNG uploaded (binary preview omitted)' };
    }
  } catch (e) {
    preview = { error: (e as Error).message };
  }

  return res.status(200).json({ message: 'File uploaded', meta, preview });
});

export default router;
