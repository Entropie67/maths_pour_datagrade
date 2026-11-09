/**
 * Vérification de types limitée aux fichiers modifiés et à leurs dépendants
 * (`pnpm check:changed`).
 *
 * 1. Les fichiers `.ts` et `.svelte` de `src/` modifiés par rapport à `HEAD`
 *    (indexés ou non, nouveaux fichiers et suppressions compris) sont repérés.
 * 2. Le graphe des imports relatifs de `src/` est reconstruit, puis on remonte
 *    transitivement vers les fichiers qui importent les fichiers modifiés.
 * 3. Les fichiers modifiés et leurs dépendants sont passés à `svelte-check` grâce
 *    à un tsconfig temporaire qui étend `tsconfig.json`. Seules les erreurs de
 *    ces fichiers sont affichées.
 *
 * Si le nombre de fichiers à contrôler dépasse `--max` (500 par défaut), si un
 * `.d.ts` a changé ou si une dépendance est inconnue, le contrôle complet est
 * lancé : il serait presque aussi long.
 *
 * Usage :
 *   pnpm check:changed                  fichiers modifiés par rapport à HEAD
 *   pnpm check:changed <fichier> …      fichiers donnés explicitement
 *   pnpm check:changed --max 1000       change le seuil de bascule
 *   pnpm check:changed --no-deps        sans les dépendants
 *   pnpm check:changed --all            contrôle complet
 * Voir documentation/developpement/auteurs-exercices/valider-un-exercice.md
 */

import { execFileSync, spawnSync } from 'node:child_process'
import {
  existsSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'

const TSCONFIG_TEMPORAIRE = '.tsconfig.check-changed.tmp.json'
const SEUIL_PAR_DEFAUT = 500
const EXTENSIONS = ['.ts', '.svelte', '.js']

function git(...args) {
  return execFileSync('git', args, { encoding: 'utf8' })
}

function lancer(commande, args) {
  return spawnSync(commande, args, { stdio: 'inherit' }).status ?? 1
}

function complet(raison) {
  console.log(`${raison}\nContrôle complet : pnpm check`)
  process.exit(lancer('pnpm', ['check']))
}

const args = process.argv.slice(2)
const indexSeuil = args.indexOf('--max')
const seuil = indexSeuil >= 0 ? Number(args[indexSeuil + 1]) : SEUIL_PAR_DEFAUT
const demandes = args.filter(
  (a, i) => !a.startsWith('--') && !(indexSeuil >= 0 && i === indexSeuil + 1),
)

if (args.includes('--all')) complet('Option --all.')

// --- 1. Fichiers modifiés ---------------------------------------------------

const modifies = git('diff', 'HEAD', '--name-only', '--diff-filter=ACMR').split(
  '\n',
)
const supprimes = git('diff', 'HEAD', '--name-only', '--diff-filter=D').split(
  '\n',
)
const nouveaux = git('ls-files', '--others', '--exclude-standard').split('\n')

const estSource = (f) =>
  f.startsWith('src/') && (f.endsWith('.ts') || f.endsWith('.svelte'))

const candidats = demandes.length > 0 ? demandes : [...modifies, ...nouveaux]
const fichiers = [...new Set(candidats)].filter(estSource)
const disparus = demandes.length > 0 ? [] : supprimes.filter(estSource)

if (fichiers.length === 0 && disparus.length === 0) {
  console.log(
    'Aucun fichier .ts ou .svelte modifié dans src/ : rien à contrôler.',
  )
  process.exit(0)
}
if (fichiers.some((f) => f.endsWith('.d.ts'))) {
  complet('Un fichier .d.ts a changé : il peut affecter tous les fichiers.')
}

// --- 2. Graphe des imports --------------------------------------------------

function lister(dossier) {
  const resultat = []
  for (const nom of readdirSync(dossier)) {
    const chemin = join(dossier, nom)
    if (statSync(chemin).isDirectory()) resultat.push(...lister(chemin))
    else if (EXTENSIONS.some((e) => nom.endsWith(e))) resultat.push(chemin)
  }
  return resultat
}

const REGEX_IMPORT = [
  /\b(?:import|export)\s[^'"`;]*?\sfrom\s*['"]([^'"]+)['"]/g,
  /\bimport\s*['"]([^'"]+)['"]/g,
  /\bimport\(\s*['"]([^'"]+)['"]\s*\)/g,
]

const sansExtension = (f) => f.replace(/\.(ts|svelte|js)$/, '')

function resoudre(depuis, specifieur) {
  const base = resolve(dirname(depuis), specifieur)
  const essais = [
    base,
    ...EXTENSIONS.map((e) => base + e),
    ...EXTENSIONS.map((e) => join(base, `index${e}`)),
    // `import './x.js'` qui désigne `x.ts`
    ...EXTENSIONS.map((e) => sansExtension(base) + e),
  ]
  return essais.find((c) => existsSync(c) && statSync(c).isFile())
}

const racine = process.cwd()
const dependants = new Map() // fichier importé -> fichiers qui l'importent
const importesInconnus = new Map() // chemin sans extension -> fichiers qui l'importent

for (const chemin of lister(join(racine, 'src'))) {
  const contenu = readFileSync(chemin, 'utf8')
  const depuis = relative(racine, chemin)
  for (const regex of REGEX_IMPORT) {
    for (const [, specifieur] of contenu.matchAll(regex)) {
      if (!specifieur.startsWith('.')) continue
      const cible = resoudre(chemin, specifieur)
      if (cible) {
        const cle = relative(racine, cible)
        if (!dependants.has(cle)) dependants.set(cle, new Set())
        dependants.get(cle).add(depuis)
      } else {
        const cle = relative(
          racine,
          sansExtension(resolve(dirname(chemin), specifieur)),
        )
        if (!importesInconnus.has(cle)) importesInconnus.set(cle, new Set())
        importesInconnus.get(cle).add(depuis)
      }
    }
  }
}

// --- 3. Fichiers à contrôler ------------------------------------------------

const aControler = new Set(fichiers)
const aVisiter = [...fichiers]
for (const f of disparus) {
  for (const d of importesInconnus.get(sansExtension(f)) ?? []) {
    if (!aControler.has(d)) {
      aControler.add(d)
      aVisiter.push(d)
    }
  }
}
if (!args.includes('--no-deps')) {
  while (aVisiter.length > 0) {
    const courant = aVisiter.pop()
    for (const d of dependants.get(courant) ?? []) {
      if (!aControler.has(d)) {
        aControler.add(d)
        aVisiter.push(d)
      }
    }
  }
}
const cibles = [...aControler].filter(estSource)
const nbDependants = cibles.length - fichiers.length

if (cibles.length > seuil) {
  complet(
    `${fichiers.length} fichier(s) modifié(s) et ${nbDependants} dépendant(s) : au-dessus du seuil de ${seuil} fichiers.`,
  )
}

// --- 4. Contrôle ------------------------------------------------------------

writeFileSync(
  TSCONFIG_TEMPORAIRE,
  JSON.stringify({
    extends: './tsconfig.json',
    include: ['src/**/*.d.ts', ...cibles.map((f) => resolve(f))],
  }),
)
console.log(
  `Contrôle de ${fichiers.length} fichier(s) modifié(s) et de ${nbDependants} dépendant(s).`,
)
if (nbDependants > 0 && nbDependants <= 15) {
  console.log(
    `Dépendants :\n  ${cibles.filter((f) => !fichiers.includes(f)).join('\n  ')}`,
  )
}

let statut = 1
try {
  const resultat = spawnSync(
    'pnpm',
    [
      'exec',
      'svelte-check',
      '--tsconfig',
      `./${TSCONFIG_TEMPORAIRE}`,
      '--output',
      'machine',
    ],
    {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=8192' },
    },
  )
  // svelte-check rapporte aussi les fichiers importés ; on ne garde que ceux contrôlés
  const concernes = new Set(cibles)
  const diagnostics = resultat.stdout
    .split('\n')
    .filter((ligne) => / (ERROR|WARNING) "/.test(ligne))
    .filter((ligne) => concernes.has(ligne.match(/"([^"]*)"/)?.[1]))
  for (const ligne of diagnostics) console.log(ligne.replace(/^\d+ /, ''))
  const erreurs = diagnostics.filter((l) => l.includes(' ERROR "')).length
  if (resultat.error || !resultat.stdout.includes(' START ')) {
    console.error(resultat.stderr || resultat.error)
    statut = 1
  } else {
    console.log(`${erreurs} erreur(s) dans les fichiers contrôlés.`)
    statut = erreurs > 0 ? 1 : 0
  }
} finally {
  rmSync(TSCONFIG_TEMPORAIRE, { force: true })
}
process.exit(statut)
