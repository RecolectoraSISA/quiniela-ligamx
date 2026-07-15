// GET /api/jornada?j=1  → partidos, estado, participantes y (si ya cerró) picks, puntos y ganadores
import { CAL, jornadaValida, cerrada, puntos } from "../cal.js";
import { leeJSON, leeCarpeta } from "../store.js";

export default async function handler(req, res) {
  const jn = jornadaValida(req.query.j);
  if (!jn) return res.status(400).json({ error: "Jornada inválida" });
  const cerr = cerrada(jn);
  const [entradas, resultados, config] = await Promise.all([
    leeCarpeta(`data/j${jn}/picks/`),
    leeJSON(`data/j${jn}/results.json`),
    leeJSON("data/config.json"),
  ]);
  const cuota = (config && config.cuota) || 0;
  const out = {
    j: jn,
    cierre: CAL[jn].cierre,
    cerrada: cerr,
    partidos: CAL[jn].p,
    participantes: entradas.map(e => e.nombre).sort(),
    bote: entradas.length * cuota,
    cuota,
  };
  if (cerr) {
    const rs = (resultados && resultados.res) || Array(9).fill(null);
    out.res = rs;
    out.filas = entradas.map(e => ({
      nombre: e.nombre,
      picks: e.picks,
      pts: rs.some(x => x) ? puntos(e.picks, rs) : null,
    })).sort((a, b) => (b.pts ?? -1) - (a.pts ?? -1) || a.nombre.localeCompare(b.nombre));
    const completa = rs.every(x => x);
    out.completa = completa;
    if (completa && out.filas.length) {
      const max = out.filas[0].pts;
      out.ganadores = out.filas.filter(f => f.pts === max).map(f => f.nombre);
    } else out.ganadores = [];
  }
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json(out);
}
