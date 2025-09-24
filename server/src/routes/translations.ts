import { Router } from 'express';
import path from 'path';
import { SAFE_ROOT, resolveUnsafe, safeReadTextFile } from '../utils/fsSandbox.js';

const router = Router();

// GET /api/translations/:language - Intentional path traversal simulation
router.get('/:language', (req, res) => {
  const language = req.params.language;
  const baseDir = path.join(SAFE_ROOT, 'translations');
  const resolved = resolveUnsafe(baseDir, `${language}.json`);
  try {
    const content = safeReadTextFile(resolved);
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).send(content);
  } catch (error) {
    return res.status(404).json({
      error: 'File not found (or blocked by sandbox)',
      requested: resolved,
      detail: (error as Error).message,
    });
  }
});

export default router;
