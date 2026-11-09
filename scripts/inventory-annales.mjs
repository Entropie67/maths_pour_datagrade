import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'

const root = new URL('../', import.meta.url)
const assets = new Map()
const exercises = []
const activeUuids = new Set()
function active(node) {
  if (!node || typeof node !== 'object') return
  if (typeof node.uuid === 'string') activeUuids.add(node.uuid)
  for (const value of Object.values(node)) active(value)
}
for (const file of ['referentielStaticFR.json', 'referentielStaticCH.json']) active(JSON.parse(readFileSync(new URL(`mathalea/src/json/${file}`, root))))
function add(path, uuid, kind, optional = false) {
  if (typeof path !== 'string') return
  path = path.replace(/^https?:\/\/[^/]+\/alea\//, '').replace(/^\/?alea\//, '')
  if (!(path.startsWith('static/') || /^assets\/(crpe|bac|dnb|e3c|evacom|taf)\//.test(path)) || path.includes('..')) return
  const entry = assets.get(path) ?? { path, exercises: [], kinds: [], optional: true }
  if (!entry.exercises.includes(uuid)) entry.exercises.push(uuid)
  if (!entry.kinds.includes(kind)) entry.kinds.push(kind)
  entry.optional &&= optional
  assets.set(path, entry)
}
function values(value) { return Array.isArray(value) ? value : [value] }
for (const file of readdirSync(new URL('mathalea/src/json/', root)).filter(f => /^dictionnaire.*\.ts$/.test(f))) {
  const module = await import(new URL(`mathalea/src/json/${file}`, root))
  function walk(node, key = '') {
    if (!node || typeof node !== 'object') return
    if (node.typeExercice || (file === 'dictionnaireMathadata.ts' && node.title)) {
      const uuid = node.uuid ?? key
      const family = uuid.split('_')[0].toLowerCase()
      exercises.push({ uuid, dictionary: file, family, year: node.annee ?? null, activeCatalogue: activeUuids.has(uuid) || file === 'dictionnaireMathadata.ts' })
      for (const [field, kind] of [['png', 'statement-image'], ['pngCor', 'correction-image'], ['url', 'statement-tex'], ['urlcor', 'correction-tex'], ['tex', 'statement-tex'], ['texCor', 'correction-tex']]) {
        for (const path of values(node[field])) add(path, uuid, kind)
      }
      if (node.annee && !node.png) {
        const dir = `static/${family}/${node.annee}`
        add(`${dir}/tex/png/${uuid}.png`, uuid, 'statement-image')
        add(`${dir}/tex/png/${uuid}_cor.png`, uuid, 'correction-image')
        add(`${dir}/tex/${uuid}.tex`, uuid, 'statement-tex')
        add(`${dir}/tex/${uuid}_cor.tex`, uuid, 'correction-tex')
      }
      if (node.typ) {
        add(`static/${uuid.split('_')[0]}/${node.annee}/typ/${uuid}.typ`, uuid, 'statement-typst')
        add(`static/${uuid.split('_')[0]}/${node.annee}/typ/${uuid}_cor.typ`, uuid, 'correction-typst', true)
      }
      if (file === 'dictionnaireMathadata.ts') {
        for (const suffix of ['', '_cor']) {
          add(`static/mathadata/tex/${uuid}${suffix}.tex`, uuid, 'mathadata-tex')
          add(`static/mathadata/tex/png/${uuid}${suffix}.png`, uuid, 'mathadata-image')
        }
      }
      return
    }
    for (const [k, v] of Object.entries(node)) walk(v, k)
  }
  for (const dictionary of Object.values(module)) walk(dictionary)
}
mkdirSync(new URL('resources/', root), { recursive: true })
const manifest = { upstreamCommit: 'f03d4179f5ebade4828bb3b78e8cf2021309a37b', baseUrl: 'https://mathalea-static.s3-website.fr-par.scw.cloud/alea/', exercises, assets: [...assets.values()].sort((a,b) => a.path.localeCompare(b.path)) }
writeFileSync(new URL('resources/annales-inventory.json', root), JSON.stringify(manifest, null, 2) + '\n')
console.log(JSON.stringify({ exercises: exercises.length, assets: assets.size, families: exercises.reduce((r,e) => (r[e.dictionary] = (r[e.dictionary] ?? 0) + 1, r), {}) }, null, 2))
