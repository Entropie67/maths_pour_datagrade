/**
 * Archive « après coup » la version publiée d'un exercice dont les tirages ont
 * déjà dérivé dans un commit (voire un déploiement).
 *
 *   pnpm archive:retro 2N40-1
 *   pnpm archive:retro 2N40-1 --changed-file src/exercices/4e/4C35.ts
 *   pnpm archive:retro 2N40-1 --good-rev 02c15f53a
 *
 * `pnpm archive` suppose que `HEAD` contient encore la version publiée et le
 * working tree la version modifiée. Quand la modification est déjà commitée,
 * cette hypothèse tombe : `HEAD` porte la dérive et la version publiée est en
 * arrière dans l'historique. Ce script :
 *
 *   1. retrouve la dernière révision où l'empreinte de l'exercice correspondait
 *      encore à `empreintes-exercices.json` (« bonne révision »), soit par
 *      `--good-rev`, soit en rejouant l'empreinte commit par commit ;
 *   2. fige à cette révision le fichier d'exercice **et** les fichiers
 *      d'exercices dont il hérite qui ont dérivé depuis, en `-old.ts` frères,
 *      imports réécrits vers les `-old` correspondants (variante A) ;
 *   3. donne un `uuid` neuf au fichier de travail et cale
 *      `dateDeModifImportante` sur la date du commit de dérive ;
 *   4. déplace l'entrée d'empreinte vers le fichier `-old` et vérifie le gel.
 *
 * Limite irréductible : les liens créés entre le commit de dérive et
 * maintenant ont été distribués avec les valeurs dérivées sous l'ancien `uuid`,
 * qui pointe désormais vers l'archive. Le script affiche cette fenêtre.
 *
 * Étapes suivantes affichées en fin d'exécution : `pnpm makeJson`,
 * `pnpm stability:update`, `pnpm review:archives`, relecture du diff.
 */

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline'
import {
  contenuALaRevision,
  dereference,
  enTeteArchive,
  importsRelatifs,
  inchangeEntre,
  litUuid,
  nouvelUuid,
  poseUuidEtDate,
  prochainCheminArchive,
  renommeClasse,
  resoudChemin,
  resoudImport,
} from './lib/archive-commun.js'
import { ajouteRemplacement } from './lib/uuids-remplaces.js'

const FICHIER_EMPREINTES = 'tests/e2e/tests/stability/empreintes-exercices.json'

// ---------------------------------------------------------------------------
// Arguments
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const positionnels = []
  const options = {}
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--changed-file') options.changedFile = argv[++i]
    else if (a === '--good-rev') options.goodRev = argv[++i]
    else if (a === '--date') options.date = argv[++i]
    else if (a === '--no-verify') options.verify = false
    else if (a === '--yes' || a === '-y') options.yes = true
    else if (a.startsWith('-')) {
      console.error(`Option inconnue : ${a}`)
      process.exit(1)
    } else positionnels.push(a)
  }
  return { positionnels, options }
}

const { positionnels, options } = parseArgs(process.argv.slice(2))
if (options.verify === undefined) options.verify = true

if (positionnels.length !== 1) {
  console.error(
    "Usage : pnpm archive:retro <code ou chemin de l'exercice> [options]\n" +
      '\n' +
      '  --changed-file <chemin>  fichier dont la modification a provoqué la dérive\n' +
      "                           (défaut : le fichier d'exercice lui-même)\n" +
      '  --good-rev <sha>         dernière révision « bonne » (sinon recherche auto)\n' +
      '  --date <jj/mm/aaaa>      date de dérive (sinon celle du commit de dérive)\n' +
      '  --no-verify              ne pas lancer makeJson + stability:check à la fin\n' +
      '  --yes                    ne pas demander de confirmation\n',
  )
  process.exit(1)
}

// ---------------------------------------------------------------------------
// Contexte
// ---------------------------------------------------------------------------

function git(args, opts = {}) {
  return execFileSync('git', args, { encoding: 'utf8', ...opts })
}

function assertArbrePropre(fichiers) {
  const sales = fichiers.filter((f) => {
    try {
      git(['diff', '--quiet', '--', f])
      git(['diff', '--quiet', '--cached', '--', f])
      return false
    } catch {
      return true
    }
  })
  if (sales.length > 0) {
    console.error(
      'Ces fichiers ont des modifications non commitées :\n' +
        sales.map((f) => `  ${f}`).join('\n') +
        '\nLe script a besoin de les remettre à une révision antérieure puis de\n' +
        'les restaurer. Committez ou remisez (`git stash`) avant de relancer.',
    )
    process.exit(1)
  }
}

const cheminExo = resoudChemin(positionnels[0])
const changedFile = options.changedFile
  ? options.changedFile.replace(/\\/g, '/')
  : cheminExo

for (const f of [cheminExo, changedFile]) {
  if (!fs.existsSync(f)) {
    console.error(`Fichier introuvable : ${f}`)
    process.exit(1)
  }
}

const contenuTravailExo = fs.readFileSync(cheminExo, 'utf8')
const uuidPublie = litUuid(contenuTravailExo)
if (!uuidPublie) {
  console.error(`Aucun \`export const uuid\` dans ${cheminExo}.`)
  process.exit(1)
}

// Le rejeu d'empreinte résout l'uuid via src/json/uuidsToUrlFR.json : il doit
// pointer sur le fichier de travail. Un `-old` créé lors d'un essai précédent a
// pu le laisser incohérent (ce fichier est hors dépôt).
const FICHIER_UUIDS = 'src/json/uuidsToUrlFR.json'
try {
  const map = JSON.parse(fs.readFileSync(FICHIER_UUIDS, 'utf8'))
  const attendu = cheminExo.replace(/^src\/exercices\//, '')
  if (map[uuidPublie] !== attendu) {
    console.log(
      `${FICHIER_UUIDS} n'associe pas ${uuidPublie} à ${attendu} ` +
        `(actuel : ${map[uuidPublie] ?? 'absent'}). Régénération…`,
    )
    execFileSync('pnpm', ['makeJson'], { stdio: 'inherit' })
  }
} catch {
  execFileSync('pnpm', ['makeJson'], { stdio: 'inherit' })
}

const registre = JSON.parse(fs.readFileSync(FICHIER_EMPREINTES, 'utf8'))
const empreinteAttendue = registre[uuidPublie]
if (!empreinteAttendue) {
  console.error(
    `Rien d'enregistré pour l'uuid ${uuidPublie} dans ${FICHIER_EMPREINTES}.\n` +
      "Sans empreinte de référence, il n'y a pas de version publiée à retrouver :\n" +
      'utilisez `pnpm archive` (modif à venir) ou `pnpm stability:update` (dérive assumée).',
  )
  process.exit(1)
}

/** Empreintes « nombres » attendues, par combinaison. */
const nbAttendus = Object.fromEntries(
  Object.entries(empreinteAttendue.v).map(([cle, v]) => [cle, v.split(':')[0]]),
)

// Commits qui ont touché le fichier fautif, du plus récent au plus ancien.
const commitsChangedFile = git([
  'log',
  '--format=%H\t%cI\t%s',
  '--',
  changedFile,
])
  .trim()
  .split('\n')
  .filter(Boolean)
  .map((l) => {
    const [sha, date, ...reste] = l.split('\t')
    return { sha, date, sujet: reste.join('\t') }
  })

if (commitsChangedFile.length === 0) {
  console.error(`Aucun commit ne touche ${changedFile}.`)
  process.exit(1)
}

// ---------------------------------------------------------------------------
// 1. Trouver la bonne révision
// ---------------------------------------------------------------------------

/**
 * Calcule les empreintes « nombres » de l'exercice tel qu'il est codé à `rev`,
 * en échangeant temporairement `cheminExo` et `changedFile` pour cette
 * révision et en rejouant le test de stabilité (STABILITY_UPDATE, filtré).
 *
 * L'entrée de `uuidPublie` est retirée du fichier d'empreintes avant le rejeu :
 * en mode filtré, `stability:update` recopie les entrées existantes, donc sans
 * ça une génération qui échoue laisserait l'ancienne valeur en place et on la
 * prendrait à tort pour un tirage conforme.
 *
 * @returns {Record<string,string>|null} empreintes « nombres » par combinaison,
 *   ou `null` si la génération n'a rien produit à cette révision.
 */
function nbALaRevision(rev) {
  const sauvegardes = new Map()
  const aRestaurer = [cheminExo, changedFile, FICHIER_EMPREINTES]
  for (const f of aRestaurer) sauvegardes.set(f, fs.readFileSync(f))
  try {
    for (const f of [cheminExo, changedFile]) {
      const c = contenuALaRevision(rev, f)
      if (c === null) return null // le fichier n'existait pas à cette révision
      fs.writeFileSync(f, c)
    }
    const sansCible = { ...registre }
    delete sansCible[uuidPublie]
    const lignes = Object.keys(sansCible)
      .sort((a, b) => a.localeCompare(b))
      .map((u) => ` ${JSON.stringify(u)}: ${JSON.stringify(sansCible[u])}`)
    fs.writeFileSync(FICHIER_EMPREINTES, `{\n${lignes.join(',\n')}\n}\n`)

    execFileSync(
      'pnpm',
      [
        'exec',
        'vitest',
        '--config',
        'tests/e2e/vitest.config.stability.js',
        '--run',
      ],
      {
        stdio: 'pipe',
        env: {
          ...process.env,
          STABILITY_UUIDS: uuidPublie,
          STABILITY_UPDATE: '1',
        },
      },
    )
    const maj = JSON.parse(fs.readFileSync(FICHIER_EMPREINTES, 'utf8'))
    const v = maj[uuidPublie]?.v
    if (!v) return null
    return Object.fromEntries(
      Object.entries(v).map(([cle, val]) => [cle, val.split(':')[0]]),
    )
  } catch {
    return null
  } finally {
    for (const [f, buf] of sauvegardes) fs.writeFileSync(f, buf)
  }
}

/** Vrai si toutes les combinaisons de référence sont retrouvées à l'identique. */
function correspond(nbObtenus) {
  if (!nbObtenus) return false
  return Object.entries(nbAttendus).every(
    ([cle, attendu]) => nbObtenus[cle] === attendu,
  )
}

let goodRev = options.goodRev
let driftCommit

if (goodRev) {
  goodRev = git(['rev-parse', goodRev]).trim()
  // Le commit de dérive est le plus ancien commit de changedFile strictement
  // plus récent que goodRev.
  const idx = commitsChangedFile.findIndex((c) => c.sha === goodRev)
  driftCommit = idx > 0 ? commitsChangedFile[idx - 1] : commitsChangedFile[0]
  console.log(`Bonne révision fournie : ${goodRev.slice(0, 9)}`)
} else {
  assertArbrePropre([cheminExo, changedFile])
  console.log(
    `Recherche de la dernière révision sans dérive (rejeu d'empreinte sur ` +
      `${commitsChangedFile.length} commit(s))…\n`,
  )
  for (let i = 0; i < commitsChangedFile.length; i++) {
    const c = commitsChangedFile[i]
    process.stdout.write(
      `  ${c.sha.slice(0, 9)} ${c.date.slice(0, 10)} ${c.sujet.slice(0, 60)} … `,
    )
    const nb = nbALaRevision(c.sha)
    if (correspond(nb)) {
      console.log('empreinte conforme ✔')
      goodRev = c.sha
      driftCommit = i > 0 ? commitsChangedFile[i - 1] : c
      break
    }
    console.log('dérive')
  }
  if (!goodRev) {
    console.error(
      "\nAucune révision testée ne reproduit l'empreinte enregistrée.\n" +
        'Relancez avec `--good-rev <sha>` (et éventuellement `--date jj/mm/aaaa`).',
    )
    process.exit(1)
  }
}

const dateDerive =
  options.date || new Date(driftCommit.date).toLocaleDateString('fr-FR')

console.log('')
console.log(`Bonne révision   : ${goodRev.slice(0, 9)}`)
console.log(
  `Commit de dérive : ${driftCommit.sha.slice(0, 9)} (${dateDerive}) ${driftCommit.sujet}`,
)

// ---------------------------------------------------------------------------
// 2. Ensemble des fichiers d'exercices à figer
// ---------------------------------------------------------------------------

/**
 * Suit les imports relatifs depuis `cheminExo` (à la bonne révision) et retient
 * les fichiers sous src/exercices/ qui ont dérivé entre goodRev et HEAD.
 * Signale à part les dépendances src/lib ou src/modules qui ont dérivé : leur
 * gel n'est pas automatisé.
 */
function ensembleAFiger() {
  const aFiger = new Set()
  const helpersDerives = new Set()
  const vus = new Set()
  const pile = [cheminExo]
  while (pile.length) {
    const f = pile.pop()
    if (vus.has(f)) continue
    vus.add(f)
    const contenu = contenuALaRevision(goodRev, f) ?? fs.readFileSync(f, 'utf8')
    for (const { spec } of importsRelatifs(contenu)) {
      const cible = resoudImport(f, spec)
      if (!cible) continue
      const derive = !inchangeEntre(goodRev, 'HEAD', cible)
      if (cible.startsWith('src/exercices/')) {
        if (derive) aFiger.add(cible)
        pile.push(cible)
      } else if (
        derive &&
        (cible.startsWith('src/lib/') || cible.startsWith('src/modules/'))
      ) {
        helpersDerives.add(cible)
      }
    }
  }
  // changedFile fourni explicitement : on le fige s'il est sous src/exercices/.
  if (changedFile !== cheminExo && changedFile.startsWith('src/exercices/')) {
    aFiger.add(changedFile)
  } else if (
    changedFile !== cheminExo &&
    !changedFile.startsWith('src/exercices/')
  ) {
    helpersDerives.add(changedFile)
  }
  return { aFiger: [...aFiger], helpersDerives: [...helpersDerives] }
}

const { aFiger, helpersDerives } = ensembleAFiger()

// Tous les chemins `-old` sont calculés une seule fois, avant toute écriture :
// `prochainCheminArchive` dépend des fichiers présents sur le disque et
// changerait de réponse après la création du premier `-old`.
const archivesParFichier = new Map()
for (const f of [cheminExo, ...aFiger]) {
  archivesParFichier.set(f, prochainCheminArchive(f))
}
const cheminOldDe = (f) => archivesParFichier.get(f).cheminArchive

console.log('')
console.log('Fichiers à figer :')
console.log(`  ${cheminExo}  → archive (uuid ${uuidPublie} conservé)`)
for (const f of aFiger) console.log(`  ${f}  → dépendance figée (uuid neuf)`)
if (helpersDerives.length) {
  console.log('')
  console.log(
    '⚠️  Dépendances partagées qui ont aussi dérivé (gel non automatisé) :',
  )
  for (const f of helpersDerives) console.log(`  ${f}`)
  console.log(
    '   Si la vérification finale échoue, il faudra traiter ces fichiers à la main\n' +
      '   (souvent : la dérive n’affecte que le mode interactif et ne compte pas).',
  )
}

// ---------------------------------------------------------------------------
// 3. Confirmation
// ---------------------------------------------------------------------------

async function confirme(question) {
  if (options.yes) return true
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  const reponse = await new Promise((res) =>
    rl.question(`${question} [o/N] `, res),
  )
  rl.close()
  return /^o(ui)?$/i.test(reponse.trim())
}

const uuidNeufExo = nouvelUuid()

console.log('')
console.log('Actions :')
console.log(`  créer  ${cheminOldDe(cheminExo)}  (uuid ${uuidPublie})`)
for (const f of aFiger) {
  console.log(`  créer  ${cheminOldDe(f)}  (uuid neuf)`)
}
console.log(
  `  éditer ${cheminExo}  → uuid ${uuidNeufExo}, dateDeModifImportante ${dateDerive}`,
)
console.log(
  `  éditer ${FICHIER_EMPREINTES}  → entrée ${uuidPublie} déplacée vers l'archive`,
)
console.log('')

if (!(await confirme('Appliquer ?'))) {
  console.log('Abandon, rien écrit.')
  process.exit(0)
}

// ---------------------------------------------------------------------------
// 4. Écriture
// ---------------------------------------------------------------------------

// uuid neuf attribué à chaque dépendance figée, pour réécrire les imports.
const uuidParDependance = new Map()
for (const f of aFiger) uuidParDependance.set(f, nouvelUuid())

/**
 * Réécrit les imports relatifs d'un contenu figé qui visent un autre fichier
 * figé, pour les faire pointer vers le `-old` correspondant.
 */
function reecritImports(contenu, fichierSource) {
  let sortie = contenu
  for (const { spec, brut } of importsRelatifs(contenu)) {
    const cible = resoudImport(fichierSource, spec)
    if (!cible || !archivesParFichier.has(cible)) continue
    let specOld = path.posix
      .relative(path.posix.dirname(fichierSource), cheminOldDe(cible))
      .replace(/\.(ts|js)$/, '')
    if (!specOld.startsWith('.')) specOld = `./${specOld}`
    sortie = sortie.replace(brut, brut.replace(spec, specOld))
  }
  return sortie
}

/**
 * Fige un fichier à `goodRev` dans son `-old` : imports réécrits, refs vidées,
 * classe suffixée. `uuidCible` est conservé (archive de l'exercice) ou neuf
 * (dépendance encore vivante ailleurs sous son uuid d'origine).
 */
function ecritArchive(fichier, uuidCible, precisionEnTete, role) {
  const { cheminArchive, suffixeClasse } = archivesParFichier.get(fichier)
  const original = contenuALaRevision(goodRev, fichier)
  if (original === null) {
    console.error(`Impossible de lire ${fichier} à ${goodRev.slice(0, 9)}.`)
    process.exit(1)
  }
  let contenu = reecritImports(original, fichier)
  contenu = dereference(contenu, fichier)
  contenu = renommeClasse(contenu, suffixeClasse)
  contenu = contenu.replace(
    /export const uuid = '[^']+'/,
    `export const uuid = '${uuidCible}'`,
  )
  fs.writeFileSync(
    cheminArchive,
    enTeteArchive(uuidCible, precisionEnTete, role) + contenu,
  )
  console.log(`✅ ${cheminArchive} (uuid ${uuidCible})`)
}

// 4a. Dépendances figées (uuid neuf : le fichier vivant garde l'uuid publié).
for (const f of aFiger) {
  ecritArchive(
    f,
    uuidParDependance.get(f),
    `Gelée à la révision ${goodRev.slice(0, 9)} pour ${path.basename(
      cheminExo,
    )} (dérive du ${dateDerive}).`,
    'dependance',
  )
}

// 4b. Archive de l'exercice (uuid publié conservé, déréférencée).
ecritArchive(
  cheminExo,
  uuidPublie,
  `Version publiée jusqu'au ${dateDerive} (commit ${driftCommit.sha.slice(0, 9)}).`,
  'exercice',
)

// 4c. Fichier de travail : uuid neuf + dateDeModifImportante.
fs.writeFileSync(
  cheminExo,
  poseUuidEtDate(contenuTravailExo, uuidNeufExo, dateDerive),
)
console.log(`✅ ${cheminExo} → uuid ${uuidNeufExo}`)

// 4c bis. Table des uuid remplacés : après la purge de l'archive, les vieux
// liens iront vers la version courante.
ajouteRemplacement(uuidPublie, uuidNeufExo)
console.log(`✅ src/json/uuidsRemplaces.json : ${uuidPublie} → ${uuidNeufExo}`)

// 4d. Empreinte : l'entrée de l'uuid publié décrit désormais l'archive.
{
  const j = JSON.parse(fs.readFileSync(FICHIER_EMPREINTES, 'utf8'))
  const cheminArchive = cheminOldDe(cheminExo)
  if (j[uuidPublie]) {
    j[uuidPublie].ex = cheminArchive.replace(/^src\/exercices\//, '')
    const lignes = Object.keys(j)
      .sort((a, b) => a.localeCompare(b))
      .map((u) => ` ${JSON.stringify(u)}: ${JSON.stringify(j[u])}`)
    fs.writeFileSync(FICHIER_EMPREINTES, `{\n${lignes.join(',\n')}\n}\n`)
    console.log(`✅ ${FICHIER_EMPREINTES} → ${uuidPublie} pointe sur l'archive`)
  }
}

// ---------------------------------------------------------------------------
// 5. Vérification
// ---------------------------------------------------------------------------

if (options.verify) {
  console.log("\nVérification (makeJson puis stability:check sur l'archive)…")
  try {
    execFileSync('pnpm', ['makeJson'], { stdio: 'inherit' })
    execFileSync(
      'pnpm',
      [
        'exec',
        'vitest',
        '--config',
        'tests/e2e/vitest.config.stability.js',
        '--run',
      ],
      {
        stdio: 'inherit',
        env: { ...process.env, STABILITY_UUIDS: uuidPublie },
      },
    )
    console.log(
      `\n✅ L'archive reproduit l'empreinte enregistrée : le gel est correct.`,
    )
  } catch {
    console.error(
      "\n❌ L'archive ne reproduit pas l'empreinte enregistrée.\n" +
        (helpersDerives.length
          ? '   Une dépendance partagée listée plus haut a probablement un effet sur\n' +
            '   les tirages. Il faut la figer à la main puis relancer avec --good-rev.\n'
          : '   Vérifiez la bonne révision (--good-rev) ou signalez le cas.\n'),
    )
    process.exit(1)
  }
}

// ---------------------------------------------------------------------------
// Bilan
// ---------------------------------------------------------------------------

console.log('')
console.log('────────────────────────────────────────────────────────')
console.log('Fenêtre de corrigés ambigus :')
console.log(
  `  du ${dateDerive} (commit de dérive) à aujourd'hui, des liens ont pu être\n` +
    `  partagés sous l'uuid ${uuidPublie} avec les valeurs DÉRIVÉES. Ils pointent\n` +
    `  désormais vers l'archive (valeurs d'origine). Rien ne permet de les\n` +
    '  rattraper : à signaler si des corrigés de cette période circulent.',
)
console.log('')
console.log('Étapes suivantes :')
console.log(
  '  1. pnpm stability:update        (enregistre la version courante)',
)
console.log('  2. pnpm review:archives         (compare courante vs archive)')
console.log('  3. relire le diff avant de committer')
if (helpersDerives.length) {
  console.log('  ⚠️  vérifier les dépendances partagées signalées plus haut')
}
