declare global {
  interface Window { __API_BASE__?: string }
}

export const API_BASE: string = (typeof window !== 'undefined' && window.__API_BASE__) || (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8080';

