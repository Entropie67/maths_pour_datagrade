#!/usr/bin/env node
/**
 * Compare une version archivée d'exercice (`<code>-old.ts`) avec sa version
 * courante, côte à côte dans la vue prof du navigateur.
 *
 *   pnpm review:archives
 *
 * Le script liste les archives créées il y a moins d'un mois, de la plus
 * récente à la plus ancienne, une par ligne. On navigue au clavier (↑/↓),
 * on valide avec Entrée : la vue prof s'ouvre avec les deux exercices à la
 * suite (version courante puis archive) pour vérifier que la modification
 * assumée est bien celle attendue.
 *
 * À lancer après `pnpm archive <code>` puis `pnpm makeJson` (sans quoi l'uuid
 * de l'archive n'est pas encore résolu et l'exercice ne se charge pas).
 *
 * Le serveur de dev est cherché sur les ports habituels ; on peut forcer
 * l'URL de base avec la variable d'environnement `MATHALEA_URL`.
 */

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
)
process.chdir(projectRoot)

const RACINE_EXOS = 'src/exercices'
const JOURS = 30

// Ports usuels d'un `pnpm dev` (vite.config + .claude/launch.json).
const PORTS_DEV = [5173, 5199, 5201, 5203]

/**
 * URL de base de la vue prof. `MATHALEA_URL` a priorité ; sinon on cherche un
 * serveur de dev qui répond sur un port connu, avec 5173 par défaut.
 */
async function baseUrl() {
  if (process.env.MATHALEA_URL) {
    return process.env.MATHALEA_URL.replace(/\?.*$/, '')
  }
  for (const port of PORTS_DEV) {
    const url = `http://localhost:${port}/alea/`
    try {
      const ctrl = new AbortController()
      const t = setTimeout(() => ctrl.abort(), 400)
      await fetch(url, { signal: ctrl.signal })
      clearTimeout(t)
      return url
    } catch {
      // port muet : on essaie le suivant
    }
  }
  console.warn(
    '⚠️  Aucun serveur de dev détecté (ports ' +
      PORTS_DEV.join(', ') +
      '). Lance `pnpm dev`, ou fixe MATHALEA_URL.\n',
  )
  return `http://localhost:${PORTS_DEV[0]}/alea/`
}

/** Reconnaît `X-old.ts`, `X-old2.ts`, `X-old-old.ts`… (pas `XOld.ts`). */
const MOTIF_ARCHIVE = /-old(?:\d+|-?old)*\.(?:ts|js)$/i

/** Liste récursive des fichiers d'exercices archivés. */
function listeArchives(dossier, acc = []) {
  for (const entree of fs.readdirSync(dossier, { withFileTypes: true })) {
    const complet = path.join(dossier, entree.name)
    if (entree.isDirectory()) listeArchives(complet, acc)
    else if (MOTIF_ARCHIVE.test(entree.name))
      acc.push(complet.replace(/\\/g, '/'))
  }
  return acc
}

/**
 * Date de référence d'une archive : date du commit qui l'a ajoutée, ou date de
 * modification du fichier s'il n'est pas encore suivi par git (archive juste
 * créée, pas encore committée — le cas d'usage principal).
 */
function dateArchive(chemin) {
  try {
    const secondes = execFileSync(
      'git',
      ['log', '--diff-filter=A', '--format=%at', '-n', '1', '--', chemin],
      { encoding: 'utf8' },
    ).trim()
    if (secondes) return Number(secondes) * 1000
  } catch {
    // pas de git ou fichier inconnu : on retombe sur le mtime
  }
  return fs.statSync(chemin).mtimeMs
}

/** Chemin de la version courante correspondant à une archive, ou null. */
function versionCourante(cheminArchive) {
  const dossier = path.dirname(cheminArchive)
  const extension = path.extname(cheminArchive)
  let racine = path.basename(cheminArchive, extension)
  for (let i = 0; i < 4; i++) {
    const candidat = path.join(dossier, racine + extension)
    if (candidat !== cheminArchive && fs.existsSync(candidat)) {
      return candidat.replace(/\\/g, '/')
    }
    const reduit = racine.replace(/-?old\d*$/i, '').replace(/-$/, '')
    if (reduit === racine) break
    racine = reduit
  }
  return null
}

/** uuid déclaré dans un fichier d'exercice. */
function uuidDe(chemin) {
  return fs
    .readFileSync(chemin, 'utf8')
    .match(/export const uuid = '([^']+)'/)?.[1]
}

function ageRelatif(ms) {
  const jours = Math.floor((Date.now() - ms) / 86_400_000)
  if (jours <= 0) return "aujourd'hui"
  if (jours === 1) return 'hier'
  return `il y a ${jours} j`
}

function ouvreNavigateur(url) {
  const [commande, args] =
    process.platform === 'darwin'
      ? ['open', [url]]
      : process.platform === 'win32'
        ? ['cmd', ['/c', 'start', '', url]]
        : ['xdg-open', [url]]
  try {
    execFileSync(commande, args, { stdio: 'ignore' })
  } catch (erreur) {
    console.error(`Impossible d'ouvrir le navigateur : ${erreur.message}`)
    console.error(`Ouvre l'URL manuellement :\n${url}`)
  }
}

/** Sélection clavier ; résout l'entrée choisie ou null si annulé. */
function choisir(entrees) {
  return new Promise((resolve) => {
    let index = 0
    readline.emitKeypressEvents(process.stdin)
    if (process.stdin.isTTY) process.stdin.setRawMode(true)

    const rendu = () => {
      console.clear()
      console.log(
        'Archive à comparer avec sa version courante ' +
          '(↑/↓ puis Entrée, Échap pour annuler) :\n',
      )
      for (const [i, e] of entrees.entries()) {
        const marqueur = i === index ? '❯' : ' '
        const date = new Date(e.date).toISOString().slice(0, 10)
        const actuel = e.courante ? '' : '  ⚠ version courante introuvable'
        console.log(
          `${marqueur} ${date}  ${ageRelatif(e.date).padEnd(12)} ${e.archive}${actuel}`,
        )
      }
    }

    const nettoyer = () => {
      if (process.stdin.isTTY) process.stdin.setRawMode(false)
      process.stdin.removeListener('keypress', surTouche)
      process.stdin.pause()
    }

    function surTouche(_, touche) {
      if (touche.name === 'up' || touche.name === 'k') {
        index = (index - 1 + entrees.length) % entrees.length
        rendu()
      } else if (touche.name === 'down' || touche.name === 'j') {
        index = (index + 1) % entrees.length
        rendu()
      } else if (touche.name === 'return' || touche.name === 'enter') {
        nettoyer()
        resolve(entrees[index])
      } else if (
        touche.name === 'escape' ||
        (touche.ctrl && touche.name === 'c')
      ) {
        nettoyer()
        resolve(null)
      }
    }

    process.stdin.on('keypress', surTouche)
    rendu()
  })
}

const limite = Date.now() - JOURS * 86_400_000
const toutes = listeArchives(RACINE_EXOS)
  .map((archive) => ({ archive, date: dateArchive(archive) }))
  .sort((a, b) => b.date - a.date)

const entrees = toutes
  .filter((e) => e.date >= limite)
  .map((e) => ({ ...e, courante: versionCourante(e.archive) }))

if (entrees.length === 0) {
  console.log(
    `Aucune archive créée depuis moins de ${JOURS} jours sous ${RACINE_EXOS}/.`,
  )
  if (toutes.length > 0) {
    console.log(
      `(${toutes.length} archives plus anciennes ignorées ; ` +
        `ajuste JOURS dans ${path.relative(projectRoot, fileURLToPath(import.meta.url))} au besoin.)`,
    )
  }
  process.exit(0)
}

if (!process.stdin.isTTY) {
  console.log(`Archives de moins de ${JOURS} jours (récentes en premier) :`)
  for (const e of entrees) {
    console.log(
      `  ${new Date(e.date).toISOString().slice(0, 10)}  ${e.archive}`,
    )
  }
  console.log('\nLancer dans un terminal interactif pour choisir et comparer.')
  process.exit(0)
}

const choix = await choisir(entrees)
console.clear()

if (!choix) {
  console.log('Annulé.')
  process.exit(0)
}

const uuidArchive = uuidDe(choix.archive)
if (!uuidArchive) {
  console.error(`Aucun \`export const uuid\` dans ${choix.archive}.`)
  process.exit(1)
}

const uuids = []
if (choix.courante) {
  const uuidCourant = uuidDe(choix.courante)
  if (uuidCourant) uuids.push(uuidCourant)
  else
    console.warn(
      `⚠️  Aucun uuid dans ${choix.courante}, on ouvre l'archive seule.`,
    )
} else {
  console.warn("⚠️  Version courante introuvable, on ouvre l'archive seule.")
}
uuids.push(uuidArchive)

// Avertit si `pnpm makeJson` n'a pas encore été lancé après l'archivage :
// sans entrée dans uuidsToUrlFR.json, l'exercice ne se charge pas.
try {
  const resolus = JSON.parse(
    fs.readFileSync('src/json/uuidsToUrlFR.json', 'utf8'),
  )
  const manquants = uuids.filter((u) => !(u in resolus))
  if (manquants.length > 0) {
    console.warn(
      `⚠️  uuid non résolu(s) : ${manquants.join(', ')}\n` +
        '   Lance `pnpm makeJson` puis relance cette commande.\n',
    )
  }
} catch {
  // json absent : on n'empêche pas l'ouverture
}

const url = `${await baseUrl()}?${uuids.map((u) => `uuid=${u}`).join('&')}`

console.log('Version courante puis archive dans la vue prof :\n')
if (choix.courante) console.log(`  courante : ${choix.courante}`)
console.log(`  archive  : ${choix.archive}`)
console.log(`\n${url}\n`)

ouvreNavigateur(url)
process.exit(0)
