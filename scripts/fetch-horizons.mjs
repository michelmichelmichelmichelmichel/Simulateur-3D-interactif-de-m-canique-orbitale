/**
 * Récupère des positions de référence depuis l'API JPL Horizons et les enregistre
 * dans tests/fixtures/horizons.json (données de référence pour les tests).
 *
 * Usage : node scripts/fetch-horizons.mjs
 *
 * Paramètres Horizons :
 * - centre : Soleil (500@10), vecteurs héliocentriques ;
 * - plan : écliptique et équinoxe moyens J2000 (REF_PLANE=ECLIPTIC, REF_SYSTEM=ICRF) ;
 * - unités : unités astronomiques (AU) ;
 * - corps : barycentres des systèmes planétaires (1 à 8 ; 3 = barycentre Terre-Lune),
 *   ce qui correspond à ce que modélisent les éléments képlériens du JPL.
 *
 * Documentation : https://ssd-api.jpl.nasa.gov/doc/horizons.html
 */
import { writeFile, mkdir } from 'node:fs/promises'

const API = 'https://ssd.jpl.nasa.gov/api/horizons.api'

const BODIES = {
  mercury: '1',
  venus: '2',
  earth: '3',
  mars: '4',
  jupiter: '5',
  saturn: '6',
  uranus: '7',
  neptune: '8',
}

// Dates réparties sur l'intervalle de validité des éléments (1800-2050)
const DATES = [
  '1850-06-15T00:00:00Z',
  '1900-01-01T00:00:00Z',
  '1950-03-21T00:00:00Z',
  '1980-07-04T00:00:00Z',
  '2000-01-01T12:00:00Z',
  '2010-10-10T00:00:00Z',
  '2020-02-29T00:00:00Z',
  '2026-11-21T00:00:00Z',
  '2035-05-05T00:00:00Z',
  '2049-12-31T00:00:00Z',
]

const toJulianDate = (iso) => Date.parse(iso) / 86400000 + 2440587.5

async function fetchBody(id, jds) {
  const params = new URLSearchParams({
    format: 'json',
    COMMAND: `'${id}'`,
    OBJ_DATA: 'NO',
    MAKE_EPHEM: 'YES',
    EPHEM_TYPE: 'VECTORS',
    CENTER: "'500@10'",
    REF_PLANE: 'ECLIPTIC',
    REF_SYSTEM: 'ICRF',
    VEC_TABLE: '1',
    OUT_UNITS: 'AU-D',
    CSV_FORMAT: 'YES',
    TLIST_TYPE: 'JD',
    TLIST: `'${jds.join(' ')}'`,
  })
  const response = await fetch(`${API}?${params}`)
  if (!response.ok) throw new Error(`HTTP ${response.status} pour le corps ${id}`)
  const { result } = await response.json()

  const block = result.split('$$SOE')[1]?.split('$$EOE')[0]
  if (!block) throw new Error(`Réponse inattendue pour le corps ${id} :\n${result}`)

  return block
    .trim()
    .split('\n')
    .map((line) => {
      const [jd, , x, y, z] = line.split(',').map((field) => field.trim())
      return { jd: Number(jd), x: Number(x), y: Number(y), z: Number(z) }
    })
}

const jds = DATES.map(toJulianDate)
const positions = {}
for (const [name, id] of Object.entries(BODIES)) {
  positions[name] = await fetchBody(id, jds)
  console.log(`${name} : ${positions[name].length} positions`)
}

const fixture = {
  source: 'JPL Horizons API (https://ssd.jpl.nasa.gov/api/horizons.api)',
  fetchedAt: new Date().toISOString(),
  frame: 'Héliocentrique, écliptique et équinoxe moyens J2000, unités AU, temps TDB',
  dates: DATES,
  positions,
}

await mkdir(new URL('../tests/fixtures/', import.meta.url), { recursive: true })
await writeFile(new URL('../tests/fixtures/horizons.json', import.meta.url), JSON.stringify(fixture, null, 2) + '\n')
console.log('Écrit : tests/fixtures/horizons.json')
