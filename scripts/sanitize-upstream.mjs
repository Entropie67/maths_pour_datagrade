import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'

const root = new URL('../', import.meta.url)
const path = 'tests/e2e/helpers/issue.ts'
const file = new URL(`mathalea/${path}`, root)
let source = readFileSync(file, 'utf8')
source = source.replace(/headers\.append\('PRIVATE-TOKEN', 'glpat-[A-Za-z0-9_-]+'\)/g, "headers.append('PRIVATE-TOKEN', token)")
source = source.replace(/glpat-[A-Za-z0-9_-]+/g, '${MATHALEA_GITLAB_TOKEN}')
if (!source.includes('const token = process.env.MATHALEA_GITLAB_TOKEN')) {
  source = source.replace('  if (tickets.nombreInitial >= tickets.nombreMax) {', `  const token = process.env.MATHALEA_GITLAB_TOKEN
  if (!token) {
    log('Création de tickets désactivée : MATHALEA_GITLAB_TOKEN absent')
    return
  }
  if (tickets.nombreInitial >= tickets.nombreMax) {`)
}
writeFileSync(file, source)
writeFileSync(new URL('upstream-overrides.json', root), JSON.stringify({
  [path]: {
    sha256: createHash('sha256').update(source).digest('hex'),
    reason: "Jeton GitLab amont remplacé par MATHALEA_GITLAB_TOKEN ; aucune requête sans configuration explicite."
  }
}, null, 2) + '\n')
console.log('Jeton amont externalisé ; exception tracée dans upstream-overrides.json.')
