/**
 * Hook de pre-commit : enregistre l'empreinte de stabilité des exercices
 * nouveaux (ou qui ont reçu un uuid neuf, typiquement après `pnpm archive`).
 *
 * Seuls les uuid des exercices indexés et absents du registre sont calculés :
 * une empreinte existante n'est jamais réécrite, sans quoi une dérive passerait
 * inaperçue. Sans nouvel uuid, le script sort immédiatement.
 *
 * Contournement ponctuel : SKIP_STABILITY=1 git commit …
 * Voir documentation/tests/stabilite-exercices.md
 */

import { execFileSync, spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const FICHIER_EMPREINTES = 'tests/e2e/tests/stability/empreintes-exercices.json'

if (process.env.SKIP_STABILITY === '1') process.exit(0)

function git(...args) {
  return execFileSync('git', args, { encoding: 'utf8' })
}

const fichiers = git(
  'diff',
  '--cached',
  '--name-only',
  '--diff-filter=ACMR',
  '--',
  'src/exercices',
)
  .split('\n')
  .filter((f) => f.endsWith('.ts') && !f.endsWith('.test.ts'))

if (fichiers.length === 0) process.exit(0)

let registre = {}
try {
  registre = JSON.parse(readFileSync(FICHIER_EMPREINTES, 'utf8'))
} catch {
  // registre absent : tous les uuid sont nouveaux
}

/** uuid -> fichier, lus dans la version indexée des fichiers. */
const manquants = new Map()
for (const fichier of fichiers) {
  const contenu = git('show', `:${fichier}`)
  const uuid = contenu.match(
    /export\s+const\s+uuid\s*=\s*['"`]([^'"`]+)['"`]/,
  )?.[1]
  if (uuid && registre[uuid] === undefined) manquants.set(uuid, fichier)
}

if (manquants.size === 0) process.exit(0)

console.log(
  `🔏 Empreinte de stabilité à enregistrer pour ${manquants.size} exercice(s) :\n` +
    [...manquants].map(([uuid, f]) => `  - ${f} (${uuid})`).join('\n'),
)

// Le registre est ajouté au commit : on refuse d'y embarquer des
// modifications que le développeur n'aurait pas lui-même indexées.
const registreModifieNonIndexe =
  spawnSync('git', ['diff', '--quiet', '--', FICHIER_EMPREINTES]).status !== 0

const resultat = spawnSync('pnpm', ['stability:update'], {
  stdio: 'inherit',
  env: { ...process.env, STABILITY_UUIDS: [...manquants.keys()].join(' ') },
})

if (resultat.status !== 0) {
  console.error(
    "\n❌ Impossible de calculer l'empreinte de stabilité (voir ci-dessus).\n" +
      'Corriger l’exercice, ou commiter sans ce contrôle avec SKIP_STABILITY=1.',
  )
  process.exit(1)
}

const nouveauRegistre = JSON.parse(readFileSync(FICHIER_EMPREINTES, 'utf8'))
const nonEmpreintes = [...manquants].filter(
  ([uuid]) => nouveauRegistre[uuid] === undefined,
)
if (nonEmpreintes.length > 0) {
  // uuid hors catalogue (fichier non référencé, ressource…) : rien à protéger
  console.log(
    'ℹ️  Hors catalogue, sans empreinte :\n' +
      nonEmpreintes.map(([uuid, f]) => `  - ${f} (${uuid})`).join('\n'),
  )
}

if (registreModifieNonIndexe) {
  console.log(
    `⚠️  ${FICHIER_EMPREINTES} avait déjà des modifications non indexées : ` +
      "il n'est pas ajouté automatiquement. Vérifier puis l'ajouter au commit.",
  )
  process.exit(1)
}
git('add', FICHIER_EMPREINTES)
console.log(`✅ ${FICHIER_EMPREINTES} mis à jour et ajouté au commit.`)
