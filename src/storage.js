/**
 * storage.js — Reemplaza window.storage de Claude.ai con localStorage.
 * Misma API: get(key), set(key, value), delete(key), list(prefix)
 * Los datos quedan guardados en el navegador de cada PC.
 */

const PREFIX = "bertoldi_app__";

export const storage = {
  async get(key) {
    try {
      const val = localStorage.getItem(PREFIX + key);
      if (val === null) throw new Error("not found");
      return { key, value: val };
    } catch {
      throw new Error("not found");
    }
  },
  async set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, value);
      return { key, value };
    } catch (e) {
      // localStorage puede fallar si está lleno (quota exceeded)
      console.error("storage.set error:", e);
      return null;
    }
  },
  async delete(key) {
    localStorage.removeItem(PREFIX + key);
    return { key, deleted: true };
  },
  async list(prefix = "") {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(PREFIX + prefix)) {
        keys.push(k.slice(PREFIX.length));
      }
    }
    return { keys };
  },
};
