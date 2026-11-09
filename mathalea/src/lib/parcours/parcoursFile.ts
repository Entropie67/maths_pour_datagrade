/**
 * Lecture et écriture du fichier de parcours (format `classes-mathalea/1`),
 * identique à celui de l'application MathALÉA : les classes et leurs parcours
 * (ce que lisent les élèves) et, pour une publication complète, toute la
 * bibliothèque de l'enseignant (parcours sans classe, objectifs).
 */
import { isLesson } from './lessonFile'
import { isOpening } from './parcoursOpening'
import type { Level, Objective, Parcours, Step } from './parcoursTypes'

export const FILE_FORMAT = 'classes-mathalea/1'
const OLD_FORMAT = 'classe-mathalea/1' // une seule classe, anciennes versions

export interface ClassInFile {
  nom: string
  parcours: Parcours[] // dans l'ordre vu par les élèves
}

export interface LibraryInFile {
  parcours: Parcours[]
  objectifs?: Objective[]
}

export interface ParcoursFile {
  format: typeof FILE_FORMAT
  exporteLe: string
  classes: ClassInFile[]
  banque?: boolean // publication complète : dans un dossier, la plus récente compte
  bibliotheque?: LibraryInFile
}

const isObject = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === 'object' && !Array.isArray(v)
const isString = (v: unknown): v is string => typeof v === 'string'
const isInteger = (v: unknown): v is number => Number.isInteger(v)
const optional = (v: unknown, check: (x: unknown) => boolean) =>
  v === undefined || check(v)
const listOf = (v: unknown, check: (x: unknown) => boolean): v is unknown[] =>
  Array.isArray(v) && v.every(check)
const noDuplicate = (values: unknown[]) =>
  new Set(values).size === values.length
const isParam = (v: unknown) =>
  isString(v) || typeof v === 'number' || typeof v === 'boolean'

const isResource = (r: unknown) =>
  isObject(r) && isString(r.titre) && isString(r.lien)

export function isStep(v: unknown): v is Step {
  if (!isObject(v)) return false
  return (
    isString(v.uuid) &&
    isString(v.titre) &&
    optional(v.id, isString) &&
    optional(v.nbQuestions, (n) => isInteger(n) && (n as number) > 0) &&
    optional(v.titreMasque, (b) => typeof b === 'boolean') &&
    optional(
      v.objectifs,
      (o) => listOf(o, isString) && noDuplicate(o as unknown[]),
    ) &&
    [v.sup, v.sup2, v.sup3, v.sup4].every((s) => optional(s, isParam))
  )
}

function isLevel(v: unknown): v is Level {
  if (!isObject(v)) return false
  return (
    isString(v.titre) &&
    isInteger(v.nb) &&
    (v.nb as number) >= 0 &&
    optional(v.acces, (a) => a === 'libre' || a === 'seuil') &&
    optional(v.seuil, (n) => typeof n === 'number' && n >= 0 && n <= 100) &&
    optional(v.ouverture, isOpening) &&
    optional(v.ressource, isResource) &&
    optional(
      v.pause,
      (x) =>
        isObject(x) && isString(x.texte) && optional(x.ressource, isResource),
    ) &&
    optional(v.fiche, isLesson)
  )
}

export function isParcours(v: unknown): v is Parcours {
  if (!isObject(v)) return false
  return (
    isString(v.id) &&
    /^[a-z0-9-]+$/.test(v.id) &&
    isInteger(v.version) &&
    (v.version as number) > 0 &&
    isString(v.titre) &&
    isString(v.objectif) &&
    optional(v.auteurs, (l) => listOf(l, isString)) &&
    optional(v.descriptionEleves, isString) &&
    optional(v.descriptionEnseignant, isString) &&
    isString(v.niveau) &&
    isString(v.theme) &&
    [1, 2, 3].includes(v.difficulte as number) &&
    optional(v.icone, isString) &&
    ['une_question_par_page', 'un_exo_par_page', 'liste_exos'].includes(
      v.presentation as string,
    ) &&
    ['question', 'page', 'parcours'].includes(v.correction as string) &&
    listOf(v.etapes, isStep) &&
    optional(v.paliers, (l) => listOf(l, isLevel)) &&
    optional(v.style, (x) => x === 'paliers' || x === 'ceintures') &&
    optional(
      v.premiereCeinture,
      (n) => isInteger(n) && (n as number) >= 0 && (n as number) < 7,
    ) &&
    optional(v.enTetesMasques, (b) => typeof b === 'boolean') &&
    optional(v.melanger, (b) => typeof b === 'boolean') &&
    optional(v.fiche, isLesson)
  )
}

const uniqueParcours = (v: unknown): v is Parcours[] =>
  listOf(v, isParcours) && noDuplicate((v as Parcours[]).map((p) => p.id))

export const isObjective = (o: unknown): o is Objective =>
  isObject(o) &&
  isString(o.libelle) &&
  isString(o.niveau) &&
  isString(o.theme) &&
  optional(o.code, isString)

/** Fichier de parcours lu et vérifié en entier ; sinon une erreur lisible */
export function readParcoursFile(text: string): ParcoursFile {
  const invalid = () =>
    new Error('Ce fichier n’est pas un fichier de parcours MathALÉA valide.')
  let raw: Record<string, unknown>
  try {
    raw = JSON.parse(text)
  } catch {
    throw invalid()
  }
  let file: ParcoursFile
  if (
    raw?.format === OLD_FORMAT &&
    isString(raw.classe) &&
    Array.isArray(raw.parcours)
  ) {
    file = {
      format: FILE_FORMAT,
      exporteLe: String(raw.exporteLe ?? ''),
      classes: [{ nom: raw.classe, parcours: raw.parcours as Parcours[] }],
    }
  } else if (raw?.format === FILE_FORMAT && Array.isArray(raw.classes)) {
    file = raw as unknown as ParcoursFile
  } else {
    throw invalid()
  }
  const classesOk =
    listOf(
      file.classes,
      (c) => isObject(c) && isString(c.nom) && uniqueParcours(c.parcours),
    ) && noDuplicate(file.classes.map((c) => c.nom))
  if (!classesOk) throw invalid()
  if (file.bibliotheque !== undefined) {
    const lib = file.bibliotheque as unknown as Record<string, unknown>
    if (
      !isObject(lib) ||
      !uniqueParcours(lib.parcours) ||
      !optional(lib.objectifs, (o) => listOf(o, isObjective))
    ) {
      throw invalid()
    }
  }
  return file
}

export function createParcoursFile(
  classes: ClassInFile[],
  library?: LibraryInFile,
): string {
  const file: ParcoursFile = {
    format: FILE_FORMAT,
    exporteLe: new Date().toISOString(),
    classes,
    banque: true,
    ...(library ? { bibliotheque: library } : {}),
  }
  return JSON.stringify(file, null, 2)
}

/** Nom horodaté : une nouvelle publication n'est jamais renommée « (1) » par le drive */
export function timestampedName(
  base: string,
  extension = 'json',
  date = new Date(),
) {
  const z = (n: number) => String(n).padStart(2, '0')
  return `${base}-${date.getFullYear()}-${z(date.getMonth() + 1)}-${z(date.getDate())}-${z(date.getHours())}h${z(date.getMinutes())}.${extension}`
}
