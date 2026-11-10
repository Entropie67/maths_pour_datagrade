/**
 * Table des uuid remplacés (`src/json/uuidsRemplaces.json`) : ancien uuid →
 * uuid de la version courante de l'exercice.
 *
 * Quand une version est archivée (`<exercice>-old.ts`), l'ancien uuid reste
 * servi par le fichier d'archive. Le jour où l'archive est supprimée
 * (`pnpm archive:purge`), la table redirige les vieux liens vers la version
 * courante. L'app ne consulte la table que pour un uuid qui n'a plus de
 * fichier : tant que l'archive existe, elle garde la priorité.
 *
 * Valeur `null` : exercice supprimé volontairement, sans remplaçant.
 */

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { RACINE_EXERCICES, litUuid } from './archive-commun.js'

export const FICHIER_REMPLACES = 'src/json/uuidsRemplaces.json'

/**
 * Avertit quand le dépôt est un clone partiel : l'historique est tronqué, donc
 * des successeurs d'uuid et des dates d'ajout ne peuvent pas être retrouvés.
 */
export function avertitSiCloneSuperficiel() {
  try {
    const sortie = execFileSync(
      'git',
      ['rev-parse', '--is-shallow-repository'],
      {
        encoding: 'utf8',
      },
    )
    if (sortie.trim() === 'true') {
      console.warn(
        "⚠️  Clone partiel : l'historique git est tronqué, des successeurs ne seront pas\n" +
          "   retrouvés et les dates d'ajout sont approximatives (jamais trop anciennes).\n" +
          '   Pour un résultat complet : git fetch --unshallow\n',
      )
    }
  } catch {
    // pas de git utilisable : les autres appels échoueront avec un message clair
  }
}

/** Une archive est un fichier dont le nom contient `old` (hors `bold`). */
export function estArchive(chemin) {
  return /old/i.test(path.basename(chemin).replace(/bold/gi, ''))
}

/** Lit la table (objet vide si le fichier n'existe pas encore). */
export function litTable() {
  if (!fs.existsSync(FICHIER_REMPLACES)) return {}
  return JSON.parse(fs.readFileSync(FICHIER_REMPLACES, 'utf8'))
}

/** Écrit la table, triée par uuid pour des diffs lisibles. */
export function ecritTable(table) {
  const triee = Object.fromEntries(
    Object.entries(table).sort(([a], [b]) => a.localeCompare(b)),
  )
  fs.writeFileSync(FICHIER_REMPLACES, JSON.stringify(triee, null, 2) + '\n')
}

/**
 * Parcourt `src/exercices/` et renvoie, pour chaque fichier qui exporte un
 * uuid, `{ uuid, chemin, archive }`.
 */
export function scanneExercices() {
  const resultat = []
  const parcours = (dossier) => {
    for (const entree of fs.readdirSync(dossier, { withFileTypes: true })) {
      const complet = path.join(dossier, entree.name).replace(/\\/g, '/')
      if (entree.isDirectory()) parcours(complet)
      else if (/\.(ts|js)$/.test(entree.name)) {
        const uuid = litUuid(fs.readFileSync(complet, 'utf8'))
        if (uuid)
          resultat.push({ uuid, chemin: complet, archive: estArchive(complet) })
      }
    }
  }
  parcours(RACINE_EXERCICES)
  return resultat
}

/** uuid des fichiers de travail (non archivés) de l'arbre courant. */
export function uuidsVivants(exercices = scanneExercices()) {
  return new Set(exercices.filter((e) => !e.archive).map((e) => e.uuid))
}

/** Tous les uuid portés par un fichier de l'arbre, archives comprises. */
export function uuidsPresents(exercices = scanneExercices()) {
  return new Set(exercices.map((e) => e.uuid))
}

/**
 * Parcourt l'historique git et renvoie les changements d'uuid d'un même
 * fichier : `Map<ancien, nouveau>`. Si un uuid a été remplacé plusieurs fois,
 * le changement le plus récent l'emporte. Les allers-retours (A→B puis B→A,
 * comme un retour arrière) donnent les deux arêtes.
 *
 * @param {string} [ref] révision de départ (par défaut HEAD et ses ancêtres)
 */
export function aretesGit(ref = 'HEAD') {
  const sortie = execFileSync(
    'git',
    [
      'log',
      '-p',
      '--no-color',
      '-G',
      'export const uuid',
      '--format=C %H',
      ref,
      '--',
      RACINE_EXERCICES,
    ],
    { encoding: 'utf8', maxBuffer: 1024 * 1024 * 512 },
  )
  const aretes = new Map()
  let supprime = null
  for (const ligne of sortie.split('\n')) {
    if (ligne.startsWith('C ') || ligne.startsWith('diff --git')) {
      supprime = null
      continue
    }
    const retire = ligne.match(/^-export const uuid = '([^']+)'/)
    if (retire) {
      supprime = retire[1]
      continue
    }
    const ajoute = ligne.match(/^\+export const uuid = '([^']+)'/)
    if (ajoute && supprime && supprime !== ajoute[1]) {
      // le plus récent d'abord : on ne remplace pas une arête déjà vue
      if (!aretes.has(supprime)) aretes.set(supprime, ajoute[1])
      supprime = null
    }
  }
  return aretes
}

/**
 * Suit les arêtes de `depart` jusqu'à un uuid vivant. Renvoie `null` si la
 * chaîne s'arrête ailleurs ou boucle.
 */
export function resoud(depart, aretes, vivants) {
  const vus = new Set()
  let courant = depart
  while (!vivants.has(courant)) {
    if (vus.has(courant)) return null
    vus.add(courant)
    const suivant = aretes.get(courant)
    if (!suivant) return null
    courant = suivant
  }
  return courant
}

/** Chemin du fichier de travail correspondant à une archive, par son nom. */
export function fichierDeTravail(cheminArchive) {
  const extension = path.extname(cheminArchive)
  const base = path.basename(cheminArchive, extension)
  const sansOld = base
    .replace(/[-_ ]?old\d*$/i, '')
    .replace(/[-_ ]?old\d*$/i, '')
  if (sansOld === base) return null
  const candidat = path.join(path.dirname(cheminArchive), sansOld + extension)
  return fs.existsSync(candidat) ? candidat.replace(/\\/g, '/') : null
}

/**
 * Ajoute (sans écraser) l'entrée `ancien → courant` dans la table.
 * Appelé par `pnpm archive` et `pnpm archive:retro`.
 */
export function ajouteRemplacement(ancien, courant) {
  if (ancien === courant) return
  const table = litTable()
  // aplatit : tout ce qui pointait vers `ancien` pointe désormais vers `courant`
  for (const [cle, valeur] of Object.entries(table)) {
    if (valeur === ancien) table[cle] = courant
  }
  table[ancien] = courant
  ecritTable(table)
}

/**
 * Entrées à ajouter à la table pour couvrir toutes les archives de l'arbre et
 * tous les uuid disparus dont l'historique git donne le successeur.
 *
 * @returns {{ ajouts: Record<string,string>, orphelins: string[] }}
 *   `orphelins` : uuid d'archive dont aucun successeur n'est retrouvé.
 */
export function reconstruit() {
  const exercices = scanneExercices()
  const vivants = uuidsVivants(exercices)
  const aretes = aretesGit()
  const table = litTable()
  const ajouts = {}
  const orphelins = []

  const traite = (uuid, repli) => {
    if (vivants.has(uuid) || uuid in table) return
    const cible =
      resoud(uuid, aretes, vivants) ??
      (repli ? resoud(repli, aretes, vivants) : null)
    if (cible) ajouts[uuid] = cible
    else orphelins.push(uuid)
  }

  // 1. archives présentes dans l'arbre
  for (const e of exercices.filter((x) => x.archive)) {
    const travail = fichierDeTravail(e.chemin)
    const uuidTravail = travail
      ? litUuid(fs.readFileSync(travail, 'utf8'))
      : null
    // le nom du fichier est un repli : l'historique git est plus fiable
    traite(e.uuid, uuidTravail)
  }
  // 2. uuid disparus de l'arbre (archive supprimée, retour arrière…)
  const presents = uuidsPresents(exercices)
  for (const ancien of aretes.keys()) {
    if (presents.has(ancien)) continue
    traite(ancien, null)
  }
  return { ajouts, orphelins }
}

/** La révision existe-t-elle dans ce dépôt ? */
function refExiste(ref) {
  try {
    execFileSync(
      'git',
      ['rev-parse', '--verify', '--quiet', `${ref}^{commit}`],
      {
        stdio: 'ignore',
      },
    )
    return true
  } catch {
    return false
  }
}

/** uuid exportés par les exercices à une révision : `Map<uuid, chemin>`. */
function uuidsALaRevision(ref) {
  let sortie = ''
  try {
    sortie = execFileSync(
      'git',
      [
        'grep',
        '-n',
        '--no-color',
        '-E',
        "^export const uuid = '",
        ref,
        '--',
        RACINE_EXERCICES,
      ],
      { encoding: 'utf8', maxBuffer: 1024 * 1024 * 64 },
    )
  } catch {
    return new Map()
  }
  const resultat = new Map()
  for (const ligne of sortie.split('\n')) {
    // `<ref>:<chemin>:<n°>:export const uuid = '<uuid>'`
    const m = ligne.match(/^[^:]+:(.+?):\d+:export const uuid = '([^']+)'/)
    if (m && /\.(ts|js)$/.test(m[1])) resultat.set(m[2], m[1])
  }
  return resultat
}

/**
 * Contrôles de cohérence de la table, et de non-régression par rapport à une
 * révision de référence (par défaut `origin/main`, puis `main`).
 *
 * @returns {{ erreurs: string[], avertissements: string[] }}
 */
export function verifie(refBase = process.env.BASE_REF) {
  const erreurs = []
  const avertissements = []
  const exercices = scanneExercices()
  const vivants = uuidsVivants(exercices)
  const presents = uuidsPresents(exercices)
  const table = litTable()

  for (const [ancien, courant] of Object.entries(table)) {
    if (vivants.has(ancien)) {
      erreurs.push(
        `${ancien} est dans ${FICHIER_REMPLACES} mais appartient à un exercice courant : retirer cette entrée.`,
      )
    }
    if (courant !== null && !vivants.has(courant)) {
      erreurs.push(
        `${ancien} → ${courant} : ${courant} n'est l'uuid d'aucun exercice courant (archive ou inconnu). Viser l'uuid de la version courante.`,
      )
    }
  }

  const ref =
    refBase ?? ['origin/main', 'main'].find((candidat) => refExiste(candidat))
  if (!ref || !refExiste(ref)) {
    avertissements.push(
      'Aucune révision de référence (origin/main, main) : contrôle des uuid disparus ignoré.',
    )
  } else {
    for (const [uuid, chemin] of uuidsALaRevision(ref)) {
      if (presents.has(uuid) || uuid in table) continue
      erreurs.push(
        `L'uuid ${uuid} (${chemin} dans ${ref}) a disparu sans entrée dans ${FICHIER_REMPLACES} : les liens partagés cassent.\n` +
          `    → ajouter "${uuid}": "<uuid de la version courante>" (ou null si l'exercice est supprimé pour de bon).`,
      )
    }
  }
  return { erreurs, avertissements }
}
