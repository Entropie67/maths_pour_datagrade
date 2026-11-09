// Consigne des adaptations DataGrade de fichiers amont dans upstream-overrides.json :
//   node scripts/record-overrides.mjs "Raison commune" chemin/relatif/a/mathalea ...
// Chaque chemin reçoit l'empreinte SHA-256 de son contenu actuel et la raison.
// Les fichiers absents du manifeste amont (nouveaux fichiers) n'ont pas besoin
// d'être consignés : seul l'écart avec un fichier amont est contrôlé.
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'

const root = new URL('../', import.meta.url)
const [reason, ...paths] = process.argv.slice(2)
if (!reason || paths.length === 0) {
  console.error('Usage : node scripts/record-overrides.mjs "raison" chemin...')
  process.exit(1)
}
const manifest = JSON.parse(readFileSync(new URL('upstream-manifest.json', root), 'utf8'))
const overridesUrl = new URL('upstream-overrides.json', root)
const overrides = JSON.parse(readFileSync(overridesUrl, 'utf8'))
for (const path of paths) {
  if (!manifest.files[path]) {
    console.log(`Ignoré (pas un fichier amont) : ${path}`)
    continue
  }
  const bytes = readFileSync(fileURLToPath(new URL(`mathalea/${path}`, root)))
  overrides[path] = { sha256: createHash('sha256').update(bytes).digest('hex'), reason }
  console.log(`Consigné : ${path}`)
}
writeFileSync(overridesUrl, JSON.stringify(overrides, null, 2) + '\n')
