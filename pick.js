// POST /api/pick  {j, nombre, picks:[9 x L/E/V]}
import { jornadaValida, cerrada, normalizaNombre, claveNombre, picksValidos } from "../cal.js";
import { guardaJSON } from "../store.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });
  const { j, nombre, picks } = req.body || {};
  const jn = jornadaValida(j);
  if (!jn) return res.status(400).json({ error: "Jornada inválida" });
  const nom = normalizaNombre(nombre);
  if (!nom || nom.length < 2) return res.status(400).json({ error: "Escribe tu nombre (mínimo 2 letras)" });
  if (!picksValidos(picks)) return res.status(400).json({ error: "Faltan partidos por marcar" });
  if (cerrada(jn)) return res.status(403).json({ error: "La jornada " + jn + " ya cerró. Pronóstico no recibido." });
  await guardaJSON(`data/j${jn}/picks/${claveNombre(nom)}.json`, { nombre: nom, picks, ts: new Date().toISOString() });
  return res.status(200).json({ ok: true, mensaje: "¡Pronóstico de " + nom + " registrado para la J" + jn + "!" });
}
