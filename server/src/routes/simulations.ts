import { Router } from 'express';

const router = Router();

const scenarios = [
  {
    id: 'sqli-user-agent',
    name: 'SQL Injection via User-Agent header',
    endpoint: 'GET /api/user/profile',
    payloads: [
      "'",
      "' AND 1=1 --",
      "' AND 1=2 --",
      "' UNION SELECT sqlite_version() --",
      "' UNION SELECT name FROM sqlite_master WHERE type='table' --"
    ],
  },
  {
    id: 'path-traversal-translations',
    name: 'Path Traversal (translations)',
    endpoint: 'GET /api/translations/:language',
    payloads: ['../etc/passwd', '../etc/hosts'],
  },
  {
    id: 'path-traversal-download',
    name: 'Path Traversal (download)',
    endpoint: 'POST /api/documents/download',
    payloads: ['../../../etc/passwd', 'user_docs/report.pdf'],
  },
];

router.get('/simulations/list', (_req, res) => {
  return res.status(200).json({ scenarios });
});

// POST /api/simulation/validate { id, request }
router.post('/simulation/validate', (req, res) => {
  const { id, request } = req.body || {};
  let success = false;
  let details = '';

  if (id === 'sqli-user-agent') {
    const ua = (request?.headers?.['user-agent'] || '').toLowerCase();
    if (ua.includes("and 1=1")) { success = true; details = 'Boolean true condition returned rows.'; }
    else if (ua.includes('sqlite_version')) { success = true; details = 'Database version leaked.'; }
    else if (ua.includes('sqlite_master')) { success = true; details = 'Table names leaked.'; }
  }

  if (id === 'path-traversal-translations') {
    const lang = (request?.params?.language || request?.pathParam || '').toString();
    if (lang.includes('..') || lang.includes('/etc/')) { success = true; details = 'Traversal attempted.'; }
  }

  if (id === 'path-traversal-download') {
    const file = (request?.body?.file || '').toString();
    if (file.includes('..') || file.includes('/etc/')) { success = true; details = 'Traversal attempted.'; }
  }

  return res.status(200).json({ id, success, details });
});

export default router;
