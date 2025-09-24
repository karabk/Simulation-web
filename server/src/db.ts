import Database from 'better-sqlite3';

export interface AppUser {
  id: number;
  username: string;
  password: string;
  email: string;
}

export interface SystemFileRecord {
  id: number;
  path: string;
  content: string;
}

export const db = new Database(':memory:');

export function initializeInMemoryDatabase() {
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS app_user (
      id INTEGER PRIMARY KEY,
      username TEXT,
      password TEXT,
      email TEXT
    );

    CREATE TABLE IF NOT EXISTS system_files (
      id INTEGER PRIMARY KEY,
      path TEXT UNIQUE,
      content TEXT
    );
  `);

  const userCount: { count: number } | undefined = db.prepare('SELECT COUNT(1) as count FROM app_user').get() as any;
  if (!userCount || userCount.count === 0) {
    const insertUser = db.prepare('INSERT INTO app_user (id, username, password, email) VALUES (?, ?, ?, ?)');
    insertUser.run(1, 'admin', 'mock_hash_123', 'admin@example.com');
    insertUser.run(2, 'alice', 'mock_hash_abc', 'alice@example.com');
    insertUser.run(3, 'bob', 'mock_hash_xyz', 'bob@example.com');
  }

  const sysCount: { count: number } | undefined = db.prepare('SELECT COUNT(1) as count FROM system_files').get() as any;
  if (!sysCount || sysCount.count === 0) {
    const insertFile = db.prepare('INSERT INTO system_files (path, content) VALUES (?, ?)');
    insertFile.run('/etc/passwd', `root:x:0:0:root:/root:/bin/bash\n` +
      `daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\n` +
      `www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\n` +
      `student:x:1000:1000:student:/home/student:/bin/bash\n`);
    insertFile.run('/etc/hosts', '127.0.0.1 localhost\n::1 ip6-localhost');
  }
}

export function getDatabaseVersion(): string {
  const row = db.prepare('SELECT sqlite_version() as version').get() as any;
  return row?.version ?? 'unknown';
}

export function listTables(): string[] {
  const rows = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all() as any[];
  return rows.map(r => r.name);
}

export function getAdminUser(): AppUser | undefined {
  return db.prepare("SELECT id, username, password, email FROM app_user WHERE username='admin' LIMIT 1").get() as any;
}

export function getSystemFileContent(path: string): string | undefined {
  const row = db.prepare('SELECT content FROM system_files WHERE path = ?').get(path) as any;
  return row?.content;
}
