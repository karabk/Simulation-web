import { Router } from 'express';
import { db, getAdminUser, getDatabaseVersion, listTables } from '../db.js';

const router = Router();

// GET /api/user/profile - Vulnerable to header-based SQL injection simulation
router.get('/profile', (req, res) => {
  const userAgent = (req.headers['user-agent'] as string) || '';

  // Simulated vulnerable query building
  const baseQuery = `SELECT id, username, password, email FROM app_user WHERE username='admin'`; // base
  const concatenatedQuery = baseQuery + userAgent; // unsafe concat to simulate injection

  // Heuristic handling for SQLi demonstration
  const ua = userAgent.toLowerCase();
  try {
    if (ua.includes("'")) {
      if (ua.includes("and 1=1")) {
        // success path: return admin
        const admin = getAdminUser();
        return res.status(200).json({
          note: 'Boolean-based SQLi succeeded (1=1). Query executed.',
          query: concatenatedQuery,
          user: admin,
        });
      }
      if (ua.includes("and 1=2")) {
        return res.status(401).json({
          note: 'Boolean-based SQLi failed (1=2). No rows returned.',
          query: concatenatedQuery,
          error: 'No matching user',
        });
      }
      if (ua.includes('sqlite_version') || ua.includes('version()')) {
        return res.status(200).json({
          note: 'Union/stacked query simulated: leaked DB version',
          query: concatenatedQuery,
          dbVersion: getDatabaseVersion(),
        });
      }
      if (ua.includes('sqlite_master') || ua.includes('table')) {
        return res.status(200).json({
          note: 'Extracted table names from sqlite_master',
          query: concatenatedQuery,
          tables: listTables(),
        });
      }
      if (ua.includes('app_user')) {
        const rows = db.prepare('SELECT id, username, password, email FROM app_user').all();
        return res.status(200).json({
          note: 'Dumped users via injected reference to app_user',
          query: concatenatedQuery,
          users: rows,
        });
      }
      // Default behavior for presence of a single quote → SQL error
      return res.status(401).json({
        note: 'SQL error due to unescaped single quote',
        query: concatenatedQuery,
        error: 'SQL syntax error near \''\'',
      });
    }

    // Normal behavior without injection markers
    const admin = getAdminUser();
    return res.status(200).json({
      note: 'Normal query without injection markers',
      query: concatenatedQuery,
      user: admin,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal error', detail: (error as Error).message });
  }
});

export default router;
