import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { SAFE_ROOT, resolveUnsafe, mapToMockIfSystemFile } from '../utils/fsSandbox.js';

const router = Router();

// POST /api/documents/download { file: string }
router.post('/download', (req, res) => {
  const fileParam = (req.body?.file as string) || '';
  const baseDir = SAFE_ROOT;
  const resolved = resolveUnsafe(baseDir, fileParam);
  const mapped = mapToMockIfSystemFile(resolved);
  try {
    if (!fs.existsSync(mapped)) {
      return res.status(404).json({ error: 'File not found', requested: fileParam, resolved });
    }
    const stat = fs.statSync(mapped);
    if (stat.isDirectory()) {
      return res.status(400).json({ error: 'Requested path is a directory' });
    }
    res.setHeader('Content-Type', guessedContentType(mapped));
    const stream = fs.createReadStream(mapped);
    return stream.pipe(res);
  } catch (error) {
    return res.status(500).json({ error: 'Unable to read file', detail: (error as Error).message });
  }
});

function guessedContentType(filePath: string): string {
  const lower = filePath.toLowerCase();
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.json')) return 'application/json';
  if (lower.endsWith('.txt')) return 'text/plain; charset=utf-8';
  return 'application/octet-stream';
}

export default router;
