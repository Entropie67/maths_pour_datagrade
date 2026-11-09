#!/usr/bin/env node
/**
 * Supprime les anciennes versions archivées (`<exercice>-old.ts`) devenues
 * inutiles : leurs liens sont redirigés vers la version courante grâce à la
 * table `src/json/uuidsRemplaces.json`.
 *
 *   pnpm archive:purge                       liste ce qui serait supprimé
 *   pnpm archive:purge --appliquer           supprime vraiment
 *   pnpm archive:purge --jours 730           garde les archives de moins de 2 ans
 *   pnpm archive:purge --avant 2025-09-01    garde les archives postérieures
 *
 * Par défaut une archive est conservée un an à partir de son ajout dans git :
 * les copies enregistrées (Capytale, Moodle, QR codes imprimés) d'une année
 * scolaire complète se rouvrent donc avec exactement les mêmes valeurs.
 *
 * Une archive n'est supprimée que si :
 *   - son uuid a un successeur dans la table (sinon le lien casserait) ;
 *   - aucun fichier conservé ne la référence (import, catalogue figé…).
 * Les dépendances figées sans uuid sont supprimées quand plus rien ne les
 * référence.
 *
 * Voir documentation/tests/stabilite-exercices.md.
 */

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { litUuid } from './lib/archive-commun.js'
import {
  FICHIER_REMPLACES,
  avertitSiCloneSuperficiel,
  ecritTable,
  estArchive,
  litTable,
  reconstruit,
  scanneExercices,
} from './lib/uuids-remplaces.js'

process.chdir(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'))

const FICHIER_EMPREINTES = 'tests/e2e/tests/stability/empreintes-exercices.json'
const JOUR_MS = 24 * 60 * 60 * 1000

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

const args = process.argv.slice(2)
const appliquer = args.includes('--appliquer')
const valeur = (option) => {
  const i = args.indexOf(option)
  return i >= 0 ? args[i + 1] : undefined
}
const jours = Number(valeur('--jours') ?? 365)
const avantOption = valeur('--avant')
const limite = avantOption
  ? new Date(avantOption)
  : new Date(Date.now() - jours * JOUR_MS)
if (Number.isNaN(limite.getTime())) {
  console.error(
    'Usage : pnpm archive:purge [--appliquer] [--jours N | --avant AAAA-MM-JJ]',
  )
  process.exit(1)
}

avertitSiCloneSuperficiel()

// ---------------------------------------------------------------------------
// Dates d'ajout dans git (la plus ancienne par fichier)
// ---------------------------------------------------------------------------

function datesAjout() {
  const sortie = execFileSync(
    'git',
    [
      'log',
      '--diff-filter=A',
      '--no-renames',
      '--name-only',
      '--format=D%aI',
      '--',
      'src/exercices',
    ],
    { encoding: 'utf8', maxBuffer: 1024 * 1024 * 256 },
  )
  const dates = new Map()
  let date = null
  // du plus récent au plus ancien : la dernière date vue pour un fichier est
  // celle de son premier ajout
  for (const ligne of sortie.split('\n')) {
    if (ligne.startsWith('D')) date = new Date(ligne.slice(1))
    else if (ligne.trim() !== '') dates.set(ligne, date)
  }
  return dates
}

// ---------------------------------------------------------------------------
// Références : jetons « …old… » cités par chaque fichier du dépôt
// ---------------------------------------------------------------------------

const sansExtension = (nom) => nom.replace(/\.(ts|js|svelte)$/, '')

function jetonsDesFichiers() {
  const jetons = new Map()
  const parcours = (dossier) => {
    for (const entree of fs.readdirSync(dossier, { withFileTypes: true })) {
      const complet = path.join(dossier, entree.name).replace(/\\/g, '/')
      if (entree.isDirectory()) {
        if (entree.name === 'node_modules' || complet === 'src/json') continue
        parcours(complet)
      } else if (/\.(ts|js|svelte)$/.test(entree.name)) {
        const trouves = fs
          .readFileSync(complet, 'utf8')
          .match(/[\w.-]*old[\w.-]*/gi)
        jetons.set(complet, new Set((trouves ?? []).map(sansExtension)))
      }
    }
  }
  for (const racine of ['src', 'tests', 'tasks']) {
    if (fs.existsSync(racine)) parcours(racine)
  }
  return jetons
}

// ---------------------------------------------------------------------------
// Sélection
// ---------------------------------------------------------------------------

const exercices = scanneExercices()
const archivesAvecUuid = exercices.filter((e) => e.archive)
const uuidDe = new Map(archivesAvecUuid.map((e) => [e.chemin, e.uuid]))

// toutes les archives, avec ou sans uuid (dépendances figées)
const toutesArchives = []
const parcoursArchives = (dossier) => {
  for (const entree of fs.readdirSync(dossier, { withFileTypes: true })) {
    const complet = path.join(dossier, entree.name).replace(/\\/g, '/')
    if (entree.isDirectory()) parcoursArchives(complet)
    else if (/\.(ts|js)$/.test(entree.name) && estArchive(complet)) {
      toutesArchives.push(complet)
    }
  }
}
parcoursArchives('src/exercices')

const { ajouts } = reconstruit()
const table = { ...litTable(), ...ajouts }
const dates = datesAjout()

const trop_recentes = []
const sansSuccesseur = []
const nomsAvecEspace = []
let candidates = new Set()

for (const chemin of toutesArchives) {
  if (/\s/.test(path.basename(chemin))) {
    nomsAvecEspace.push(chemin)
    continue
  }
  const uuid = uuidDe.get(chemin) ?? litUuid(fs.readFileSync(chemin, 'utf8'))
  if (!uuid) {
    candidates.add(chemin) // dépendance figée : jugée sur ses références
    continue
  }
  const date = dates.get(chemin)
  if (!date || date >= limite) {
    trop_recentes.push(chemin)
    continue
  }
  if (!(uuid in table)) {
    sansSuccesseur.push(`${chemin} (${uuid})`)
    continue
  }
  candidates.add(chemin)
}

// point fixe : on retire les candidates citées par un fichier conservé
const jetons = jetonsDesFichiers()
const nomDe = (chemin) => sansExtension(path.basename(chemin))
const referencees = []
let change = true
while (change) {
  change = false
  for (const chemin of [...candidates]) {
    const nom = nomDe(chemin)
    for (const [fichier, ensemble] of jetons) {
      if (fichier === chemin || !ensemble.has(nom)) continue
      if (candidates.has(fichier)) continue
      candidates.delete(chemin)
      referencees.push(`${chemin} ← ${fichier}`)
      change = true
      break
    }
  }
}

// ---------------------------------------------------------------------------
// Rapport
// ---------------------------------------------------------------------------

const liste = (titre, elements) => {
  if (elements.length === 0) return
  console.log(`\n${titre} (${elements.length})`)
  for (const e of elements.sort()) console.log(`  ${e}`)
}

const aSupprimer = [...candidates].sort()
const uuidsSupprimes = aSupprimer
  .map((c) => uuidDe.get(c) ?? litUuid(fs.readFileSync(c, 'utf8')))
  .filter(Boolean)

console.log(
  `Archives ajoutées avant le ${limite.toISOString().slice(0, 10)} : purge ${appliquer ? '' : '(simulation, ajouter --appliquer) '}`,
)
liste('À supprimer', aSupprimer)
liste('Conservées : encore référencées par un fichier conservé', referencees)
liste(`Conservées : sans successeur dans ${FICHIER_REMPLACES}`, sansSuccesseur)
liste('Conservées : nom avec espace, à traiter à la main', nomsAvecEspace)
console.log(
  `\nConservées : trop récentes ou date inconnue : ${trop_recentes.length}`,
)

if (!appliquer) {
  console.log(
    '\nRien n’a été modifié. Relancer avec --appliquer pour supprimer.',
  )
  process.exit(0)
}

// ---------------------------------------------------------------------------
// Application
// ---------------------------------------------------------------------------

ecritTable(table)
for (const chemin of aSupprimer) fs.rmSync(chemin)

if (fs.existsSync(FICHIER_EMPREINTES)) {
  const registre = JSON.parse(fs.readFileSync(FICHIER_EMPREINTES, 'utf8'))
  let retirees = 0
  for (const uuid of uuidsSupprimes) {
    if (uuid in registre) {
      delete registre[uuid]
      retirees++
    }
  }
  const lignes = Object.keys(registre)
    .sort((a, b) => a.localeCompare(b))
    .map((u) => ` ${JSON.stringify(u)}: ${JSON.stringify(registre[u])}`)
  fs.writeFileSync(FICHIER_EMPREINTES, `{\n${lignes.join(',\n')}\n}\n`)
  console.log(
    `\n✅ ${retirees} empreinte(s) retirée(s) de ${FICHIER_EMPREINTES}`,
  )
}

console.log(
  `✅ ${aSupprimer.length} fichier(s) supprimé(s), ${FICHIER_REMPLACES} à jour.`,
)
console.log('\nÉtapes suivantes :')
console.log('  1. pnpm makeJson')
console.log('  2. pnpm uuids:check')
console.log('  3. pnpm stability:check')
console.log('  4. relire le diff avant de committer')
