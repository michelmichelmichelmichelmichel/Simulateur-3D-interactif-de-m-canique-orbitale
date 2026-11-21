/**
 * Mesure l'écart entre le modèle képlérien et JPL Horizons, planète par planète.
 * Usage : node scripts/accuracy-report.mjs
 * (affiche un tableau Markdown réutilisable dans docs/evaluation.md)
 */
import { readFileSync } from 'node:fs'
import { heliocentricPosition } from '../src/physics/kepler.js'

const horizons = JSON.parse(readFileSync(new URL('../tests/fixtures/horizons.json', import.meta.url), 'utf8'))
const norm = (p) => Math.hypot(p.x, p.y, p.z)
const angleDeg = (p, q) =>
  (Math.acos(Math.min(1, (p.x * q.x + p.y * q.y + p.z * q.z) / (norm(p) * norm(q)))) * 180) / Math.PI

console.log('| Planète | Écart angulaire max (′) | Écart angulaire moyen (′) | Écart de distance max (%) |')
console.log('|---|---|---|---|')
for (const [planet, refs] of Object.entries(horizons.positions)) {
  const angles = []
  const distances = []
  for (const ref of refs) {
    const p = heliocentricPosition(planet, ref.jd)
    angles.push(angleDeg(p, ref) * 60)
    distances.push((Math.abs(norm(p) - norm(ref)) / norm(ref)) * 100)
  }
  const max = (values) => Math.max(...values)
  const mean = (values) => values.reduce((s, v) => s + v, 0) / values.length
  console.log(
    `| ${planet} | ${max(angles).toFixed(2)} | ${mean(angles).toFixed(2)} | ${max(distances).toFixed(3)} |`,
  )
}
