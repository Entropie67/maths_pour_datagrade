/**
 * Fonctions partagées par `tasks/archive-exercice.js` (archivage avant une
 * modification encore à venir) et `tasks/archive-exercice-retro.js` (archivage
 * après coup, quand la dérive est déjà commitée).
 *
 * La règle du dépôt : pour un `uuid` et une graine donnés, les valeurs d'un
 * énoncé ne changent jamais. Quand une modification les change, la version
 * publiée est figée dans un fichier `<exercice>-old.ts` (avec son `uuid`
 * d'origine et sans référence dans les menus) pendant que le fichier de travail
 * reçoit un `uuid` neuf. Voir documentation/tests/stabilite-exercices.md.
 */

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

export const RACINE_EXERCICES = 'src/exercices'

/**
 * Retrouve le fichier d'un exercice à partir de son code (ex. `6N1E`) en
 * parcourant `src/exercices/`. Le nom de fichier doit correspondre exactement
 * au code : `6N1E.ts` mais pas `6N1E-2.ts` ni `6N1E-old.ts`.
 *
 * @param {string} code
 * @returns {string[]} chemins relatifs trouvés (0, 1 ou plusieurs)
 */
export function chercheParCode(code) {
  const trouves = []
  const parcours = (dossier) => {
    for (const entree of fs.readdirSync(dossier, { withFileTypes: true })) {
      const complet = path.join(dossier, entree.name)
      if (entree.isDirectory()) parcours(complet)
      else if (entree.name === `${code}.ts` || entree.name === `${code}.js`) {
        trouves.push(complet.replace(/\\/g, '/'))
      }
    }
  }
  parcours(RACINE_EXERCICES)
  return trouves
}

/**
 * Résout l'argument de ligne de commande (`6N1E` ou
 * `src/exercices/6e/6N1E.ts`) en un chemin de fichier d'exercice.
 * Termine le process avec un message si la résolution échoue.
 *
 * @param {string} argument
 * @returns {string} chemin relatif vers le fichier d'exercice
 */
export function resoudChemin(argument) {
  let chemin = argument.replace(/\\/g, '/')

  if (!chemin.includes('/')) {
    const trouves = chercheParCode(chemin)
    if (trouves.length === 0) {
      console.error(
        `Aucun exercice nommé « ${chemin} » sous ${RACINE_EXERCICES}/.\n` +
          'Passez le chemin complet du fichier si besoin.',
      )
      process.exit(1)
    }
    if (trouves.length > 1) {
      console.error(
        `Plusieurs fichiers correspondent à « ${chemin} » :\n` +
          trouves.map((f) => `  ${f}`).join('\n') +
          '\nRelancez avec le chemin complet.',
      )
      process.exit(1)
    }
    chemin = trouves[0]
    console.log(`Exercice trouvé : ${chemin}\n`)
  }

  if (!/^src\/exercices\/.+\.(ts|js)$/.test(chemin)) {
    console.error(`Chemin inattendu : ${chemin}`)
    console.error("Il faut un fichier d'exercice, sous src/exercices/.")
    process.exit(1)
  }
  if (/-old\d*\.(ts|js)$/i.test(chemin)) {
    console.error(`${chemin} est déjà une version archivée.`)
    process.exit(1)
  }
  return chemin
}

/**
 * Nom du fichier d'archive à créer pour un exercice, en tenant compte des
 * archives déjà présentes : `<exercice>-old.ts`, puis `-old2.ts`, `-old3.ts`…
 *
 * @param {string} chemin chemin du fichier d'exercice (working tree)
 * @returns {{ cheminArchive: string, numeroArchive: number, suffixeClasse: string }}
 */
export function prochainCheminArchive(chemin) {
  const extension = path.extname(chemin)
  const racineChemin = chemin.replace(new RegExp(`${extension}$`), '')
  let numeroArchive = 1
  let cheminArchive = `${racineChemin}-old${extension}`
  while (fs.existsSync(cheminArchive)) {
    numeroArchive++
    cheminArchive = `${racineChemin}-old${numeroArchive}${extension}`
  }
  const suffixeClasse = numeroArchive === 1 ? 'Old' : `Old${numeroArchive}`
  return { cheminArchive, numeroArchive, suffixeClasse }
}

/** Lit l'`uuid` exporté par un contenu de fichier d'exercice. */
export function litUuid(contenu) {
  return contenu.match(/export const uuid = '([^']+)'/)?.[1] ?? null
}

/**
 * Vide les références d'un contenu de fichier pour le sortir des menus.
 * `'NR'` fait totalement ignorer l'exercice côté CH, alors qu'un tableau vide
 * le renverrait dans les exercices non classés
 * (cf tasks/updateMenuInternational.js).
 *
 * @param {string} contenu
 * @param {string} [chemin] pour un message d'avertissement lisible
 */
export function dereference(contenu, chemin = 'le fichier') {
  const bloc = contenu.match(/export const refs = \{[^}]*\}/)
  if (!bloc) {
    console.warn(
      `⚠️  Aucun \`export const refs\` dans ${chemin} : à déréférencer à la main.`,
    )
    return contenu
  }
  const nouveauBloc = bloc[0].replace(
    /'([\w-]+)':\s*\[[^\]]*\]/g,
    (_, locale) => (locale === 'fr-ch' ? "'fr-ch': ['NR']" : `'${locale}': []`),
  )
  return contenu.replace(bloc[0], nouveauBloc)
}

/**
 * Suffixe `Old` (ou `Old2`, `Old3`…) sur la classe exportée par défaut, pour la
 * distinguer dans les traces sans collision entre archives successives.
 *
 * @param {string} contenu
 * @param {string} suffixe `Old`, `Old2`…
 */
export function renommeClasse(contenu, suffixe) {
  return contenu.replace(
    /export default class (\w+)/,
    (_, nom) => `export default class ${nom.replace(/Old\d*$/, '')}${suffixe}`,
  )
}

/**
 * En-tête déposé en haut d'un fichier d'archive.
 *
 * @param {string} uuidPublie uuid dont les liens sont préservés
 * @param {string} [precision] ligne de contexte supplémentaire
 * @param {'exercice'|'dependance'} [role] `dependance` = copie figée d'un
 *   fichier dont hérite un exercice archivé, pas elle-même un exercice publié
 */
export function enTeteArchive(uuidPublie, precision = '', role = 'exercice') {
  const premiere =
    role === 'dependance'
      ? "// Copie figée : dépendance d'un exercice archivé, gelée pour que ses\n" +
        '// tirages ne bougent plus. Ne plus la modifier : toute correction va\n' +
        "// dans la version courante du fichier d'origine.\n"
      : '// Version archivée : conservée pour que les liens (sujets et corrigés)\n' +
        `// déjà partagés avec l'uuid ${uuidPublie} continuent d'afficher les mêmes\n` +
        '// valeurs. Ne plus la modifier : toute correction va dans la version courante.\n'
  return premiere + (precision ? `// ${precision}\n` : '')
}

/**
 * Génère un `uuid` de 5 caractères hexadécimaux absent du dépôt.
 * Parcourt `src/exercices/` pour éviter toute collision.
 */
export function nouvelUuid() {
  const dejaPris = new Set()
  const parcours = (dossier) => {
    for (const entree of fs.readdirSync(dossier, { withFileTypes: true })) {
      const complet = path.join(dossier, entree.name)
      if (entree.isDirectory()) parcours(complet)
      else if (/\.(ts|js)$/.test(entree.name)) {
        const m = litUuid(fs.readFileSync(complet, 'utf8'))
        if (m) dejaPris.add(m)
      }
    }
  }
  parcours(RACINE_EXERCICES)
  let candidat
  do {
    let dt = Date.now()
    candidat = 'xxxxx'.replace(/x/g, () => {
      const r = ((dt + Math.random() * 16) % 16) | 0
      dt = Math.floor(dt / 16)
      return r.toString(16)
    })
  } while (dejaPris.has(candidat))
  return candidat
}

/**
 * Remplace l'`uuid` d'un contenu de fichier de travail et met à jour (ou
 * ajoute) `dateDeModifImportante`.
 *
 * @param {string} contenu
 * @param {string} uuidNeuf
 * @param {string} date `jj/mm/aaaa`
 */
export function poseUuidEtDate(contenu, uuidNeuf, date) {
  let sortie = contenu.replace(
    /export const uuid = '[^']+'/,
    `export const uuid = '${uuidNeuf}'`,
  )
  sortie = sortie.includes('export const dateDeModifImportante')
    ? sortie.replace(
        /export const dateDeModifImportante = '[^']*'/,
        `export const dateDeModifImportante = '${date}'`,
      )
    : sortie.replace(
        /export const uuid = '[^']+'/,
        `export const dateDeModifImportante = '${date}'\n\nexport const uuid = '${uuidNeuf}'`,
      )
  return sortie
}

/** Contenu d'un fichier à une révision git, ou `null` s'il n'y existait pas. */
export function contenuALaRevision(rev, chemin) {
  try {
    return execFileSync('git', ['show', `${rev}:${chemin}`], {
      encoding: 'utf8',
    })
  } catch {
    return null
  }
}

/** Vrai si `chemin` est identique entre deux révisions git. */
export function inchangeEntre(revA, revB, chemin) {
  try {
    execFileSync('git', ['diff', '--quiet', revA, revB, '--', chemin])
    return true
  } catch {
    return false
  }
}

/**
 * Résout un import relatif (`../4e/4C35`, `./util`) depuis un fichier source
 * vers un chemin de fichier réel du dépôt, en essayant les extensions et
 * `/index`. Renvoie un chemin relatif à la racine du dépôt, ou `null`.
 *
 * @param {string} fichierSource chemin du fichier qui contient l'import
 * @param {string} spec cible de l'import
 */
export function resoudImport(fichierSource, spec) {
  if (!spec.startsWith('.')) return null
  const base = path.posix.join(path.posix.dirname(fichierSource), spec)
  const candidats = [
    base,
    `${base}.ts`,
    `${base}.js`,
    `${base}/index.ts`,
    `${base}/index.js`,
  ]
  for (const c of candidats) {
    if (fs.existsSync(c) && fs.statSync(c).isFile()) return c
  }
  return null
}

/**
 * Parcourt les imports relatifs d'un contenu source.
 * @param {string} contenu
 * @returns {{ spec: string, brut: string }[]} spec = cible, brut = ligne entière
 */
export function importsRelatifs(contenu) {
  const trouves = []
  const regex = /(?:import|export)\s[^'"]*?from\s*['"](\.[^'"]+)['"]/g
  let m
  while ((m = regex.exec(contenu)) !== null) {
    trouves.push({ spec: m[1], brut: m[0] })
  }
  return trouves
}

/** Liste récursive des fichiers `.ts`/`.js` d'un dossier. */
function listeFichiers(dossier) {
  const fichiers = []
  for (const entree of fs.readdirSync(dossier, { withFileTypes: true })) {
    const complet = path.posix.join(dossier, entree.name)
    if (entree.isDirectory()) fichiers.push(...listeFichiers(complet))
    else if (/\.(ts|js)$/.test(entree.name)) fichiers.push(complet)
  }
  return fichiers
}

/** Échappe une chaîne pour l'insérer dans une expression régulière. */
function echappe(texte) {
  return texte.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Vrai si `contenu` importe `spec` ET étend l'un des noms importés
 * (`import Parent from './Parent'` puis `class Enfant extends Parent`).
 */
function etendUnImport(contenu, spec) {
  const regex = new RegExp(
    `import\\s+([^'"]*?)\\s+from\\s*['"]${echappe(spec)}['"]`,
    'g',
  )
  for (const m of contenu.matchAll(regex)) {
    const noms = [...m[1].matchAll(/(?:\bas\s+)?([A-Za-z_$][\w$]*)/g)]
      .map((n) => n[1])
      .filter((n) => n !== 'as' && n !== 'type')
    // pour `{ a as b }`, le nom local est `b` (le dernier de chaque paire)
    if (noms.some((n) => new RegExp(`\\bextends\\s+${echappe(n)}\\b`).test(contenu))) {
      return true
    }
  }
  return false
}

/**
 * Fichiers de `src/exercices/` qui dépendent d'un exercice, directement ou à
 * travers d'autres fichiers (enfant, petit-enfant…). Une modification de
 * `chemin` qui change ses tirages fait aussi dériver ces fichiers, donc leurs
 * liens partagés.
 *
 * @param {string} chemin fichier d'exercice (parent)
 * @returns {{
 *   chemin: string,
 *   code: string,
 *   profondeur: number,
 *   herite: boolean,
 *   archive: boolean,
 *   avecUuid: boolean,
 * }[]} `profondeur` 1 = importe `chemin`, 2 = importe un fichier de profondeur 1…
 *   `herite` : le fichier étend ce qu'il importe (profondeur 1 seulement) ;
 *   `archive` : fichier `-old` ; `avecUuid` : exercice publiable (sinon simple
 *   classe intermédiaire).
 */
export function trouveDescendants(chemin) {
  const contenus = new Map()
  const importeurs = new Map() // cible -> Set<importeur>
  for (const fichier of listeFichiers(RACINE_EXERCICES)) {
    const contenu = fs.readFileSync(fichier, 'utf8')
    contenus.set(fichier, contenu)
    for (const { spec } of importsRelatifs(contenu)) {
      const cible = resoudImport(fichier, spec)
      if (!cible) continue
      if (!importeurs.has(cible)) importeurs.set(cible, new Set())
      importeurs.get(cible).add(fichier)
    }
  }

  const profondeurs = new Map([[chemin, 0]])
  let frontiere = [chemin]
  while (frontiere.length > 0) {
    const suivante = []
    for (const cible of frontiere) {
      for (const importeur of importeurs.get(cible) ?? []) {
        if (profondeurs.has(importeur)) continue
        profondeurs.set(importeur, profondeurs.get(cible) + 1)
        suivante.push(importeur)
      }
    }
    frontiere = suivante
  }

  const descendants = []
  for (const [fichier, profondeur] of profondeurs) {
    if (fichier === chemin) continue
    const contenu = contenus.get(fichier)
    const herite =
      profondeur === 1 &&
      importsRelatifs(contenu).some(
        ({ spec }) =>
          resoudImport(fichier, spec) === chemin && etendUnImport(contenu, spec),
      )
    descendants.push({
      chemin: fichier,
      code: path.posix.basename(fichier).replace(/\.(ts|js)$/, ''),
      profondeur,
      herite,
      archive: /-old\d*\.(ts|js)$/i.test(fichier),
      avecUuid: litUuid(contenu) !== null,
    })
  }
  return descendants.sort(
    (a, b) => a.profondeur - b.profondeur || a.chemin.localeCompare(b.chemin),
  )
}
