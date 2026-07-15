// POST /api/admin — acciones del organizador (requiere PIN)
//   {pin, accion:"resultados", j, res:[9]}   guarda resultados (L/E/V o null)
//   {pin, accion:"cuota", cuota:50}          fija la cuota por persona
import { jornadaValida } from "../cal.js";
import { guardaJSON, leeJSON } from "../store.js";

const PIN_DEF = "QUINIELA2026"; // cámbialo con la variable de entorno ADMIN_PIN en Vercel

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });
  const { pin, accion } = req.body || {};
  const PIN = process.env.ADMIN_PIN || PIN_DEF;
  if (String(pin) !== PIN) return res.status(401).json({ error: "PIN incorrecto" });

  if (accion === "resultados") {
    const jn = jornadaValida(req.body.j);
    const r = req.body.res;
    if (!jn) return res.status(400).json({ error: "Jornada inválida" });
    if (!Array.isArray(r) || r.length !== 9 || !r.every(x => x === null || ["L", "E", "V"].includes(x)))
      return res.status(400).json({ error: "Resultados inválidos" });
    await guardaJSON(`data/j${jn}/results.json`, { res: r, ts: new Date().toISOString() });
    return res.status(200).json({ ok: true, mensaje: "Resultados de la J" + jn + " guardados" });
  }

  if (accion === "cuota") {
    const c = Number(req.body.cuota);
    if (!(c >= 0)) return res.status(400).json({ error: "Cuota inválida" });
    const cfg = (await leeJSON("data/config.json")) || {};
    cfg.cuota = c;
    await guardaJSON("data/config.json", cfg);
    return res.status(200).json({ ok: true, mensaje: "Cuota actualizada a $" + c });
  }

  return res.status(400).json({ error: "Acción desconocida" });
}
