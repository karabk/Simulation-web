import fs from 'fs';
import path from 'path';
import { getSystemFileContent } from '../db.js';

export const SAFE_ROOT = process.env.SAFE_ROOT || '/tmp/websec-sim';

export function ensureSandboxLayout() {
  const translationsDir = path.join(SAFE_ROOT, 'translations');
  const docsDir = path.join(SAFE_ROOT, 'user_docs');
  const uploadsDir = path.join(SAFE_ROOT, 'uploads');
  const mockSystemDir = path.join(SAFE_ROOT, 'mock_system');
  for (const dir of [SAFE_ROOT, translationsDir, docsDir, uploadsDir, mockSystemDir]) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Seed translations
  const enPath = path.join(translationsDir, 'en.json');
  const esPath = path.join(translationsDir, 'es.json');
  if (!fs.existsSync(enPath)) fs.writeFileSync(enPath, JSON.stringify({ hello: 'Hello', welcome: 'Welcome' }, null, 2));
  if (!fs.existsSync(esPath)) fs.writeFileSync(esPath, JSON.stringify({ hello: 'Hola', welcome: 'Bienvenido' }, null, 2));

  // Seed a mock user document
  const reportPath = path.join(docsDir, 'report.pdf');
  if (!fs.existsSync(reportPath)) fs.writeFileSync(reportPath, 'This is a mock PDF report for demonstration purposes.');

  // Seed mock system files
  const passwdPath = path.join(mockSystemDir, 'etc_passwd.txt');
  const hostsPath = path.join(mockSystemDir, 'etc_hosts.txt');
  if (!fs.existsSync(passwdPath)) fs.writeFileSync(passwdPath, getSystemFileContent('/etc/passwd') || '');
  if (!fs.existsSync(hostsPath)) fs.writeFileSync(hostsPath, getSystemFileContent('/etc/hosts') || '');
}

// Intentionally unsafe path resolution for simulation (do NOT copy in real apps)
export function resolveUnsafe(baseDir: string, userInputPath: string): string {
  return path.join(baseDir, userInputPath);
}

// Safety layer mapper: if requested path indicates access to system files, redirect to mock equivalents
export function mapToMockIfSystemFile(resolvedPath: string): string {
  const normalized = resolvedPath.replace(/\\/g, '/');
  if (normalized.includes('/etc/passwd')) {
    return path.join(SAFE_ROOT, 'mock_system', 'etc_passwd.txt');
  }
  if (normalized.includes('/etc/hosts')) {
    return path.join(SAFE_ROOT, 'mock_system', 'etc_hosts.txt');
  }
  return resolvedPath;
}

export function safeReadTextFile(resolvedPath: string): string {
  const mapped = mapToMockIfSystemFile(resolvedPath);
  return fs.readFileSync(mapped, 'utf-8');
}
