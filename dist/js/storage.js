export const STORAGE_KEY = 'dayform.v1';
export const dayKey = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
export function readStorage() { try { const data = JSON.parse(localStorage.getItem(STORAGE_KEY)); return data?.version === 1 && Array.isArray(data.widgets) ? data : null; } catch { return null; } }
export function writeStorage(data) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); return true; } catch { return false; } }
