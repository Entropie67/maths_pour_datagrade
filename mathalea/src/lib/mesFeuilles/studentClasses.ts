import { byName, cleanName, newId } from './library'
import { stableStringify } from './preferences'
import { notifyContentChange } from './storage'

/**
 * Classes du widget « Tirage au sort » de la vue TBI : la liste des élèves de
 * chaque classe et le nombre de fois où chacun a été tiré au sort. Gardées
 * dans `localStorage`, elles font partie du fichier `.mathalea` (« Mes
 * sauvegardes » > Mes réglages > Classes).
 */

export const STUDENT_CLASSES_KEY = 'mathalea-classes'

/**
 * Un élève tiré deux fois de plus qu'un autre a `DRAW_WEIGHT_RATIO²` fois
 * moins de chances que lui d'être tiré : les moins tirés passent en priorité
 * sans que le tirage devienne prévisible.
 */
export const DRAW_WEIGHT_RATIO = 4

const MAX_STUDENT_NAME_LENGTH = 100

export interface ClassStudent {
  name: string
  /** Nombre de fois où l'élève a été tiré au sort */
  draws: number
}

export interface StudentClass {
  id: string
  name: string
  students: ClassStudent[]
  createdAt: string
  updatedAt: string
}

export interface StudentClasses {
  classes: StudentClass[]
}

export function emptyStudentClasses(): StudentClasses {
  return { classes: [] }
}

export function hasStudentClasses(value: StudentClasses): boolean {
  return value.classes.length > 0
}

export function sortedStudentClasses(value: StudentClasses): StudentClass[] {
  return [...value.classes].sort(byName)
}

// ---------- Liste des élèves ----------

function cleanStudentName(name: string): string {
  return name.replace(/\s+/g, ' ').trim().slice(0, MAX_STUDENT_NAME_LENGTH)
}

/**
 * Élèves d'une liste saisie à la main : un par ligne, ou séparés par des
 * virgules ou des points-virgules. Les doublons sont écartés.
 */
export function parseStudentNames(text: string): string[] {
  const names: string[] = []
  for (const raw of text.split(/[\n\r,;]+/)) {
    const name = cleanStudentName(raw)
    if (name !== '' && !names.includes(name)) names.push(name)
  }
  return names
}

/** Liste des élèves, un par ligne, pour la modifier à la main */
export function studentNamesText(studentClass: StudentClass): string {
  return studentClass.students.map((student) => student.name).join('\n')
}

// ---------- Tirage au sort ----------

/**
 * Poids de chaque élève dans le tirage : 1 pour les moins tirés, divisé par
 * `DRAW_WEIGHT_RATIO` pour chaque tirage de plus.
 */
export function drawWeights(students: readonly ClassStudent[]): number[] {
  if (students.length === 0) return []
  const min = Math.min(...students.map((student) => student.draws))
  return students.map((student) => DRAW_WEIGHT_RATIO ** (min - student.draws))
}

/** Probabilité de chaque élève d'être tiré au prochain tirage */
export function drawProbabilities(students: readonly ClassStudent[]): number[] {
  const weights = drawWeights(students)
  const total = weights.reduce((sum, weight) => sum + weight, 0)
  return weights.map((weight) => (total === 0 ? 0 : weight / total))
}

/**
 * Indice de l'élève tiré au sort, `-1` si la classe est vide.
 * @param random nombre aléatoire de [0 ; 1[
 */
export function pickStudentIndex(
  students: readonly ClassStudent[],
  random: number = Math.random(),
): number {
  const weights = drawWeights(students)
  const total = weights.reduce((sum, weight) => sum + weight, 0)
  let threshold = random * total
  for (let i = 0; i < weights.length; i++) {
    threshold -= weights[i]
    if (threshold < 0) return i
  }
  return weights.length - 1
}

// ---------- Modifications ----------

function changeStudentClass(
  value: StudentClasses,
  id: string,
  change: (studentClass: StudentClass) => StudentClass,
): StudentClasses {
  return {
    ...value,
    classes: value.classes.map((studentClass) =>
      studentClass.id === id ? change(studentClass) : studentClass,
    ),
  }
}

export function addStudentClass(
  value: StudentClasses,
  name: string,
  names: readonly string[],
  now: string = new Date().toISOString(),
): { classes: StudentClasses; studentClass: StudentClass } {
  const studentClass: StudentClass = {
    id: newId(),
    name: cleanName(name, 'Classe'),
    students: names.map((student) => ({ name: student, draws: 0 })),
    createdAt: now,
    updatedAt: now,
  }
  return {
    classes: { ...value, classes: [...value.classes, studentClass] },
    studentClass,
  }
}

export function renameStudentClass(
  value: StudentClasses,
  id: string,
  name: string,
  now: string = new Date().toISOString(),
): StudentClasses {
  return changeStudentClass(value, id, (studentClass) => ({
    ...studentClass,
    name: cleanName(name, studentClass.name),
    updatedAt: now,
  }))
}

/**
 * Remplace la liste des élèves ; un élève qui reste garde son nombre de
 * tirages.
 */
export function setStudentNames(
  value: StudentClasses,
  id: string,
  names: readonly string[],
  now: string = new Date().toISOString(),
): StudentClasses {
  return changeStudentClass(value, id, (studentClass) => {
    const draws = new Map(
      studentClass.students.map((student) => [student.name, student.draws]),
    )
    return {
      ...studentClass,
      students: names.map((name) => ({ name, draws: draws.get(name) ?? 0 })),
      updatedAt: now,
    }
  })
}

/** Change le nombre de tirages d'un élève (jamais négatif) */
export function setStudentDraws(
  value: StudentClasses,
  id: string,
  studentName: string,
  draws: number,
  now: string = new Date().toISOString(),
): StudentClasses {
  const count = Number.isFinite(draws) ? Math.max(0, Math.round(draws)) : 0
  return changeStudentClass(value, id, (studentClass) => ({
    ...studentClass,
    students: studentClass.students.map((student) =>
      student.name === studentName ? { ...student, draws: count } : student,
    ),
    updatedAt: now,
  }))
}

/** Ajoute `delta` (1 : tirage, -1 : tirage annulé) au compteur d'un élève */
export function addStudentDraw(
  value: StudentClasses,
  id: string,
  studentName: string,
  delta = 1,
  now: string = new Date().toISOString(),
): StudentClasses {
  const student = value.classes
    .find((studentClass) => studentClass.id === id)
    ?.students.find((s) => s.name === studentName)
  if (student === undefined) return value
  return setStudentDraws(value, id, studentName, student.draws + delta, now)
}

export function resetStudentDraws(
  value: StudentClasses,
  id: string,
  now: string = new Date().toISOString(),
): StudentClasses {
  return changeStudentClass(value, id, (studentClass) => ({
    ...studentClass,
    students: studentClass.students.map((student) => ({
      ...student,
      draws: 0,
    })),
    updatedAt: now,
  }))
}

export function deleteStudentClass(
  value: StudentClasses,
  id: string,
): StudentClasses {
  return {
    ...value,
    classes: value.classes.filter((studentClass) => studentClass.id !== id),
  }
}

// ---------- Lecture ----------

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readDate(value: unknown): string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value))
    ? value
    : new Date(0).toISOString()
}

function readStudents(value: unknown): ClassStudent[] {
  if (!Array.isArray(value)) return []
  const students: ClassStudent[] = []
  for (const raw of value) {
    if (!isRecord(raw) || typeof raw.name !== 'string') continue
    const name = cleanStudentName(raw.name)
    if (name === '' || students.some((student) => student.name === name)) {
      continue
    }
    const draws =
      typeof raw.draws === 'number' && Number.isFinite(raw.draws)
        ? Math.max(0, Math.round(raw.draws))
        : 0
    students.push({ name, draws })
  }
  return students
}

function readStudentClass(value: unknown): StudentClass | null {
  if (!isRecord(value) || typeof value.id !== 'string' || value.id === '') {
    return null
  }
  return {
    id: value.id,
    name: cleanName(typeof value.name === 'string' ? value.name : '', 'Classe'),
    students: readStudents(value.students),
    createdAt: readDate(value.createdAt),
    updatedAt: readDate(value.updatedAt),
  }
}

/** Classes lues dans `localStorage` ou dans un fichier, revérifiées */
export function readStudentClasses(value: unknown): StudentClasses {
  if (!isRecord(value)) return emptyStudentClasses()
  const classes: StudentClass[] = []
  for (const raw of Array.isArray(value.classes) ? value.classes : []) {
    const studentClass = readStudentClass(raw)
    if (studentClass !== null && !classes.some((c) => c.id === studentClass.id))
      classes.push(studentClass)
  }
  return { classes }
}

/** Ce qui compte pour l'état de la sauvegarde : ni les dates, ni l'ordre */
export function studentClassesContent(value: StudentClasses): unknown {
  return [...value.classes]
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
    .map(({ id, name, students }) => ({ id, name, students }))
}

// ---------- Fusion ----------

export interface StudentClassesMergeResult {
  classes: StudentClasses
  /** Classes ajoutées ou remplacées */
  imported: number
}

/**
 * Fusionne des classes importées, sans rien effacer : une classe inconnue est
 * ajoutée, une classe connue n'est remplacée que par une version plus récente
 * (chaque tirage date la classe).
 */
export function mergeStudentClasses(
  local: StudentClasses,
  imported: StudentClasses,
): StudentClassesMergeResult {
  let count = 0
  const byId = new Map(local.classes.map((c) => [c.id, c]))
  for (const studentClass of imported.classes) {
    const existing = byId.get(studentClass.id)
    if (
      existing !== undefined &&
      (studentClass.updatedAt <= existing.updatedAt ||
        stableStringify(studentClass) === stableStringify(existing))
    ) {
      continue
    }
    byId.set(studentClass.id, studentClass)
    count++
  }
  return { classes: { classes: [...byId.values()] }, imported: count }
}

// ---------- Stockage ----------

export function loadStudentClasses(): StudentClasses {
  try {
    const raw = window.localStorage.getItem(STUDENT_CLASSES_KEY)
    return readStudentClasses({ classes: raw == null ? [] : JSON.parse(raw) })
  } catch {
    return emptyStudentClasses()
  }
}

function writeStudentClasses(
  previous: StudentClasses,
  next: StudentClasses,
): StudentClasses {
  // rien n'a changé : pas de sauvegarde automatique, pas de rechargement des autres onglets
  if (stableStringify(next) === stableStringify(previous)) return previous
  try {
    window.localStorage.setItem(
      STUDENT_CLASSES_KEY,
      JSON.stringify(next.classes),
    )
    notifyContentChange()
  } catch {
    return loadStudentClasses()
  }
  return next
}

/**
 * Modifie les classes à partir de leur dernière version enregistrée (un autre
 * onglet a pu les changer) et prévient « Mes sauvegardes ».
 * @returns les classes enregistrées
 */
export function updateStudentClasses(
  change: (value: StudentClasses) => StudentClasses,
): StudentClasses {
  const previous = loadStudentClasses()
  return writeStudentClasses(previous, change(previous))
}

/** Enregistre des classes fusionnées (import d'un fichier) */
export function saveStudentClasses(value: StudentClasses): void {
  writeStudentClasses(loadStudentClasses(), value)
}
