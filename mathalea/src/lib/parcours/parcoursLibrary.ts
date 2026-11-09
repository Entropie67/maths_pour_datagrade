/**
 * Bibliothèque de parcours de l'enseignant sur le site : on crée un parcours
 * pour un niveau, on le donne ensuite à des classes. Elle se publie en un seul
 * fichier (lu par les élèves, repris par l'application de l'enseignant) et se
 * reprend depuis ce fichier. Mêmes règles que l'application MathALÉA.
 */
import { withoutKeys } from './lessonFile'
import { createParcoursFile, type ParcoursFile } from './parcoursFile'
import { mergeObjectives } from './parcoursObjectives'
import {
  parcoursId,
  type Objective,
  type Parcours,
  type Presentation,
  type Validation,
} from './parcoursTypes'

export interface LibraryEntry {
  parcours: Parcours
  classes: string[] // classes qui le reçoivent
  published?: number // version contenue dans la dernière publication
  /**
   * Dernière modification du parcours ou de ses classes, posée à
   * l'enregistrement dans ce navigateur (voir `saveParcoursLibrary`) : elle
   * sert à la fusion des sauvegardes, pas au fichier des élèves.
   */
  updatedAt?: string
}

/** Derniers choix de création : ils préremplissent le parcours suivant */
export interface CreationDefaults {
  niveau: string
  difficulte: 1 | 2 | 3
  presentation: Presentation
  correction: Validation
  enTetesMasques?: boolean
  melanger?: boolean
}

export interface TeacherLibrary {
  classes: string[]
  entries: LibraryEntry[] // l'ordre est celui vu par les élèves dans chaque classe
  objectives: Objective[]
  defaults?: CreationDefaults
}

export const emptyLibrary = (): TeacherLibrary => ({
  classes: [],
  entries: [],
  objectives: [],
})

const ready = (e: LibraryEntry) =>
  e.parcours.titre.trim() !== '' && e.parcours.etapes.length > 0

// Un parcours sans classe se publie aussi : il reste dans la bibliothèque du fichier
export const toPublish = (e: LibraryEntry) =>
  ready(e) && e.published !== e.parcours.version

export const unpublishedCount = (lib: TeacherLibrary) =>
  lib.entries.filter(toPublish).length

export const parcoursOfClass = (lib: TeacherLibrary, className: string) =>
  lib.entries.filter((e) => e.classes.includes(className))

/**
 * Enregistre un parcours (création ou modification). Un parcours déjà publié
 * qui change passe à la version suivante : les élèves gardent l'ancienne pour
 * leurs séances commencées.
 */
export function saveParcours(
  lib: TeacherLibrary,
  p: Parcours,
): { library: TeacherLibrary; id: string } {
  const i = p.id ? lib.entries.findIndex((e) => e.parcours.id === p.id) : -1
  const before = i === -1 ? undefined : lib.entries[i]
  const unchanged =
    before && JSON.stringify(before.parcours) === JSON.stringify(p)
  const version =
    before &&
    !unchanged &&
    before.published !== undefined &&
    before.published >= p.version
      ? before.published + 1
      : p.version
  const parcours = { ...p, id: p.id || parcoursId(p.titre), version }
  const entry: LibraryEntry = {
    parcours,
    classes: before?.classes ?? [],
    published: before?.published,
  }
  const entries = [...lib.entries]
  if (i === -1) entries.push(entry)
  else entries[i] = entry
  return {
    library: {
      ...lib,
      entries,
      defaults: {
        niveau: p.niveau,
        difficulte: p.difficulte,
        presentation: p.presentation,
        correction: p.correction,
        enTetesMasques: !!p.enTetesMasques,
        melanger: !!p.melanger,
      },
    },
    id: parcours.id,
  }
}

export const deleteParcours = (
  lib: TeacherLibrary,
  id: string,
): TeacherLibrary => ({
  ...lib,
  entries: lib.entries.filter((e) => e.parcours.id !== id),
})

/** Copie en nouveau parcours (nouvel identifiant, V1) */
export const duplicate = (p: Parcours): Parcours => ({
  ...(JSON.parse(JSON.stringify(p)) as Parcours),
  id: '',
  version: 1,
  titre: `${p.titre} (copie)`,
})

export function assign(
  lib: TeacherLibrary,
  id: string,
  classes: string[],
): TeacherLibrary {
  const known = [...lib.classes]
  for (const c of classes) if (!known.includes(c)) known.push(c)
  return {
    ...lib,
    classes: known,
    entries: lib.entries.map((e) =>
      e.parcours.id === id ? { ...e, classes: [...classes] } : e,
    ),
  }
}

/** Parcours d'une classe choisis dans la bibliothèque (ceux déjà présents gardent leur rang) */
export function setClassParcours(
  lib: TeacherLibrary,
  className: string,
  ids: string[],
): TeacherLibrary {
  return {
    ...lib,
    classes: lib.classes.includes(className)
      ? lib.classes
      : [...lib.classes, className],
    entries: lib.entries.map((e) => {
      const wanted = ids.includes(e.parcours.id)
      if (wanted === e.classes.includes(className)) return e
      return {
        ...e,
        classes: wanted
          ? [...e.classes, className]
          : e.classes.filter((c) => c !== className),
      }
    }),
  }
}

export function addClass(lib: TeacherLibrary, name: string): TeacherLibrary {
  const n = name.trim()
  return !n || lib.classes.includes(n)
    ? lib
    : { ...lib, classes: [...lib.classes, n] }
}

export function renameClass(
  lib: TeacherLibrary,
  before: string,
  after: string,
): TeacherLibrary {
  const n = after.trim()
  if (!n || n === before || lib.classes.includes(n)) return lib
  return {
    ...lib,
    classes: lib.classes.map((c) => (c === before ? n : c)),
    // Le nom change pour les élèves : ces parcours sont à republier
    entries: lib.entries.map((e) =>
      e.classes.includes(before)
        ? {
            ...e,
            classes: e.classes.map((c) => (c === before ? n : c)),
            published: undefined,
          }
        : e,
    ),
  }
}

/** Retire la classe ; ses parcours restent dans la bibliothèque */
export const removeClass = (
  lib: TeacherLibrary,
  name: string,
): TeacherLibrary => ({
  ...lib,
  classes: lib.classes.filter((c) => c !== name),
  entries: lib.entries.map((e) => ({
    ...e,
    classes: e.classes.filter((c) => c !== name),
  })),
})

/** Échange un parcours avec son voisin dans une classe (ordre vu par les élèves) */
export function move(
  lib: TeacherLibrary,
  id: string,
  className: string,
  direction: -1 | 1,
): TeacherLibrary {
  const ranks = lib.entries.flatMap((e, i) =>
    e.classes.includes(className) ? [i] : [],
  )
  const k = ranks.findIndex((i) => lib.entries[i].parcours.id === id)
  const other = ranks[k + direction]
  if (k === -1 || other === undefined) return lib
  const entries = [...lib.entries]
  ;[entries[ranks[k]], entries[other]] = [entries[other], entries[ranks[k]]]
  return { ...lib, entries }
}

/** Chapitres déjà utilisés : ceux du niveau d'abord */
export function knownChapters(lib: TeacherLibrary, level: string) {
  const themes = (entries: LibraryEntry[]) => [
    ...new Set(entries.map((e) => e.parcours.theme.trim()).filter(Boolean)),
  ]
  const ofLevel = themes(lib.entries.filter((e) => e.parcours.niveau === level))
  return {
    ofLevel,
    others: themes(lib.entries).filter((t) => !ofLevel.includes(t)),
  }
}

const validLink = (r?: { titre: string; lien: string }) =>
  !!r && r.titre.trim() !== '' && /^https?:\/\/\S+$/.test(r.lien.trim())

/** Parcours tel qu'il part aux élèves : ressources et pauses incomplètes retirées */
export function cleaned(p: Parcours): Parcours {
  // Identifiants d'exercices propres aux salons : ils ne partent pas aux élèves
  if (p.etapes.some((s) => s.cle !== undefined))
    p = { ...p, etapes: p.etapes.map(({ cle: _cle, ...s }) => s) }
  if (p.fiche) p = { ...p, fiche: withoutKeys(p.fiche) }
  if (!p.paliers) return p
  return {
    ...p,
    paliers: p.paliers.map((l) => {
      const { ressource, pause, fiche, ...rest } = l
      const pauseText = pause?.texte.trim()
      return {
        ...rest,
        ...(fiche ? { fiche: withoutKeys(fiche) } : {}),
        ...(validLink(ressource) ? { ressource } : {}),
        ...(pauseText
          ? {
              pause: {
                texte: pauseText,
                ...(validLink(pause!.ressource)
                  ? { ressource: pause!.ressource }
                  : {}),
              },
            }
          : {}),
      }
    }),
  }
}

/**
 * Publication : un fichier avec les classes (ce que lisent les élèves) et
 * toute la bibliothèque. Les parcours prêts sont marqués publiés.
 */
export function publish(lib: TeacherLibrary): {
  text: string
  library: TeacherLibrary
} {
  const classes = lib.classes
    .map((nom) => ({
      nom,
      parcours: parcoursOfClass(lib, nom)
        .filter(ready)
        .map((e) => cleaned(e.parcours)),
    }))
    .filter((c) => c.parcours.length > 0)
  const text = createParcoursFile(classes, {
    parcours: lib.entries.map((e) => cleaned(e.parcours)),
    ...(lib.objectives.length ? { objectifs: lib.objectives } : {}),
  })
  return {
    text,
    library: {
      ...lib,
      entries: lib.entries.map((e) =>
        ready(e) ? { ...e, published: e.parcours.version } : e,
      ),
    },
  }
}

/**
 * Reprend un fichier publié (par l'application ou par cette page) : classes,
 * attributions et ordre, parcours sans classe, objectifs. Un parcours plus
 * récent dans le fichier remplace la copie ; rien n'est supprimé.
 */
export function restore(
  lib: TeacherLibrary,
  file: ParcoursFile,
): TeacherLibrary {
  const classes = [...lib.classes]
  for (const c of file.classes)
    if (!classes.includes(c.nom)) classes.push(c.nom)
  const entries = [...lib.entries]
  const take = (p: Parcours) => {
    const i = entries.findIndex((e) => e.parcours.id === p.id)
    if (i === -1)
      entries.push({ parcours: p, classes: [], published: p.version })
    else if (entries[i].parcours.version < p.version)
      entries[i] = { ...entries[i], parcours: p, published: p.version }
  }
  for (const c of file.classes) for (const p of c.parcours) take(p)
  for (const p of file.bibliotheque?.parcours ?? []) take(p)
  for (const c of file.classes) {
    for (const p of c.parcours) {
      const i = entries.findIndex((e) => e.parcours.id === p.id)
      if (!entries[i].classes.includes(c.nom))
        entries[i] = { ...entries[i], classes: [...entries[i].classes, c.nom] }
    }
  }
  return {
    ...lib,
    classes,
    entries,
    objectives: mergeObjectives(
      lib.objectives,
      file.bibliotheque?.objectifs ?? [],
    ),
  }
}
