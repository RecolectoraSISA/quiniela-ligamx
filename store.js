// Acceso a Vercel Blob (lectura/escritura de JSON)
import { put, list } from "@vercel/blob";

const OPTS = { access: "public", addRandomSuffix: false, allowOverwrite: true, cacheControlMaxAge: 60 };

export async function guardaJSON(ruta, obj) {
  await put(ruta, JSON.stringify(obj), { ...OPTS, contentType: "application/json" });
}

export async function leeJSON(ruta) {
  try {
    const { blobs } = await list({ prefix: ruta, limit: 1 });
    const b = blobs.find(x => x.pathname === ruta);
    if (!b) return null;
    const r = await fetch(b.url + "?t=" + Date.now(), { cache: "no-store" });
    if (!r.ok) return null;
    return await r.json();
  } catch (e) {
    return null;
  }
}

export async function leeCarpeta(prefijo) {
  const { blobs } = await list({ prefix: prefijo, limit: 1000 });
  const out = [];
  for (const b of blobs) {
    try {
      const r = await fetch(b.url + "?t=" + Date.now(), { cache: "no-store" });
      if (r.ok) out.push(await r.json());
    } catch (e) { /* blob ilegible: se ignora */ }
  }
  return out;
}
