// GET /api/general → tabla general acumulada del torneo
import { puntos } from "../cal.js";
import { leeJSON, leeCarpeta } from "../store.js";

export default async function handler(req, res) {
  const tot = {};
  const jornadas = [];
  for (let j = 1; j <= 17; j++) jornadas.push(j);
  await Promise.all(jornadas.map(async (j) => {
    const rj = await leeJSON(`data/j${j}/results.json`);
    if (!rj || !rj.res || !rj.res.some(x => x)) return;
    const entradas = await leeCarpeta(`data/j${j}/picks/`);
    for (const e of entradas) {
      tot[e.nombre] = (tot[e.nombre] || 0) + puntos(e.picks, rj.res);
    }
  }));
  const filas = Object.keys(tot).map(n => ({ nombre: n, pts: tot[n] }))
    .sort((a, b) => b.pts - a.pts || a.nombre.localeCompare(b.nombre));
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({ filas });
}
