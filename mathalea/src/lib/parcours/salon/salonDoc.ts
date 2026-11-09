/**
 * Contenu d'un salon dans un document Yjs : parcours, fiches, objectifs,
 * discussion et commentaires. Chaque exercice d'un parcours et chaque bloc
 * d'une fiche a un identifiant stable (`cle`) : deux personnes qui modifient
 * deux exercices (ou deux blocs) ne s'écrasent pas.
 *
 * - `parcours` : identifiant du parcours → Y.Map { entete, ordre, etapes, fiches }
 *   - `entete` : champs du parcours (paliers compris, sans leurs fiches), un par clé
 *   - `ordre` : clés des exercices, dans l'ordre
 *   - `etapes` : clé → exercice
 *   - `fiches` : « parcours » ou rang du palier → fiche
 * - `fiches` : identifiant → fiche seule
 *   (une fiche : Y.Map { entete, ordre, blocs }, comme un parcours)
 * - `objectifs` : libellé → objectif ; `objectifs-ordre` : leur ordre
 * - `discussion` : messages du salon
 * - `commentaires` : identifiant → commentaire sur un élément d'un parcours
 *   ou d'une fiche
 */
import * as Y from 'yjs'
import type {
  Lesson,
  LessonBlock,
  Objective,
  Parcours,
  Step,
} from '../parcoursTypes'
import { newKey } from './salonPresence'

export interface SalonMessage {
  id: string
  auteur: string
  texte: string
  le: string
}

export interface SalonComment {
  id: string
  parcours: string // parcours ou fiche (voir `lessonDocId`)
  element: string // « entete », « etape:<cle> », « palier:<rang> », « bloc:<cle> »…
  auteur: string
  texte: string
  le: string
  resolu?: boolean // sur le premier commentaire : vaut pour toute la conversation
  parent?: string // réponse : identifiant du premier commentaire
}

/** Fiche seule du salon */
export interface SalonLesson {
  id: string
  fiche: Lesson
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

/** Éléments sans identifiant : on leur en donne un (même liste sinon) */
function keyed<T extends { cle?: string }>(list: T[]): T[] {
  const keys = list.map((s) => s.cle)
  if (keys.every(Boolean) && new Set(keys).size === keys.length) return list
  const used = new Set<string>()
  return list.map((s) => {
    // Un élément dupliqué garde une clé déjà prise : il en reçoit une autre
    const cle = s.cle && !used.has(s.cle) ? s.cle : newKey()
    used.add(cle)
    return { ...s, cle }
  })
}

export function withKeys(p: Parcours): Parcours {
  const etapes = keyed(p.etapes)
  return etapes === p.etapes ? p : { ...p, etapes }
}

export function lessonWithKeys(l: Lesson): Lesson {
  const blocs = keyed(l.blocs)
  return blocs === l.blocs ? l : { ...l, blocs }
}

// ---------- Écriture champ par champ ----------
/** Champs d'un en-tête : seuls ceux qui changent sont réécrits */
function writeFields(header: Y.Map<unknown>, fields: Record<string, unknown>) {
  for (const [k, v] of Object.entries(fields)) {
    if (v === undefined) {
      if (header.has(k)) header.delete(k)
    } else if (!same(header.get(k), v)) header.set(k, v)
  }
  for (const k of [...header.keys()])
    if (fields[k] === undefined) header.delete(k)
}

/** Liste d'éléments à clé : chaque élément à part, plus leur ordre */
function writeList<T extends { cle?: string }>(
  items: Y.Map<unknown>,
  order: Y.Array<string>,
  list: T[],
) {
  const keys = list.map((s) => s.cle!)
  for (const { cle, ...s } of list)
    if (!same(items.get(cle!), s)) items.set(cle!, s)
  for (const k of [...items.keys()]) if (!keys.includes(k)) items.delete(k)
  if (!same(order.toArray(), keys)) {
    order.delete(0, order.length)
    order.insert(0, keys)
  }
}

function readList<T>(items: Y.Map<unknown>, order: Y.Array<string>): T[] {
  // Élément supprimé par quelqu'un d'autre pendant un déplacement : ignoré ;
  // ordre réécrit en même temps par deux personnes : chaque clé une fois
  return [...new Set(order.toArray())]
    .filter((k) => items.has(k))
    .map((k) => ({ ...(items.get(k) as T), cle: k }))
}

// ---------- Fiches ----------
function newLessonMap() {
  const y = new Y.Map<unknown>()
  y.set('entete', new Y.Map<unknown>())
  y.set('ordre', new Y.Array<string>())
  y.set('blocs', new Y.Map<unknown>())
  return y
}

function writeLessonInto(y: Y.Map<unknown>, lesson: Lesson) {
  const l = lessonWithKeys(lesson)
  const { blocs, ...fields } = l
  writeFields(y.get('entete') as Y.Map<unknown>, fields)
  writeList(
    y.get('blocs') as Y.Map<unknown>,
    y.get('ordre') as Y.Array<string>,
    blocs,
  )
  return l
}

function readLessonFrom(y: Y.Map<unknown> | undefined): Lesson | null {
  const header = y?.get('entete') as Y.Map<unknown> | undefined
  const order = y?.get('ordre') as Y.Array<string> | undefined
  const blocks = y?.get('blocs') as Y.Map<unknown> | undefined
  if (!header || !order || !blocks) return null
  const fields = header.toJSON() as Omit<Lesson, 'blocs'>
  return {
    ...fields,
    titre: fields.titre ?? '',
    blocs: readList<LessonBlock>(blocks, order),
  }
}

const lessonsMap = (doc: Y.Doc) => doc.getMap<Y.Map<unknown>>('fiches')

/** Écrit une fiche seule : seuls les champs et blocs modifiés changent */
export function writeLesson(doc: Y.Doc, id: string, lesson: Lesson) {
  let l = lesson
  doc.transact(() => {
    const all = lessonsMap(doc)
    let y = all.get(id)
    if (!y) {
      y = newLessonMap()
      all.set(id, y)
    }
    l = writeLessonInto(y, lesson)
  })
  return l
}

export function removeLesson(doc: Y.Doc, id: string) {
  lessonsMap(doc).delete(id)
}

export function readLessons(doc: Y.Doc): SalonLesson[] {
  return [...lessonsMap(doc).entries()]
    .map(([id, y]) => ({ id, fiche: readLessonFrom(y) }))
    .filter((l): l is SalonLesson => l.fiche !== null)
    .sort((a, b) => a.fiche.titre.localeCompare(b.fiche.titre, 'fr'))
}

// ---------- Parcours ----------
const parcoursMap = (doc: Y.Doc) => doc.getMap<Y.Map<unknown>>('parcours')

/** Écrit un parcours dans le salon : seuls les champs, exercices et blocs modifiés changent */
export function writeParcours(
  doc: Y.Doc,
  parcours: Parcours,
  origin?: unknown,
) {
  const p = withKeys(parcours)
  doc.transact(() => {
    const all = parcoursMap(doc)
    let y = all.get(p.id)
    if (!y) {
      y = new Y.Map<unknown>()
      y.set('entete', new Y.Map<unknown>())
      y.set('ordre', new Y.Array<string>())
      y.set('etapes', new Y.Map<Omit<Step, 'cle'>>())
      all.set(p.id, y)
    }
    // Les fiches à part : modifier une fiche ne réécrit pas les paliers
    const { etapes, fiche, paliers, ...rest } = p
    writeFields(y.get('entete') as Y.Map<unknown>, {
      ...rest,
      paliers: paliers?.map(({ fiche: _f, ...l }) => l),
    })
    writeList(
      y.get('etapes') as Y.Map<unknown>,
      y.get('ordre') as Y.Array<string>,
      etapes,
    )

    const wanted = new Map<string, Lesson>()
    if (fiche) wanted.set('parcours', fiche)
    paliers?.forEach((l, i) => {
      if (l.fiche) wanted.set(String(i), l.fiche)
    })
    let lessons = y.get('fiches') as Y.Map<Y.Map<unknown>> | undefined
    if (!lessons && wanted.size) {
      lessons = new Y.Map<Y.Map<unknown>>()
      y.set('fiches', lessons)
    }
    if (!lessons) return
    for (const [k, l] of wanted) {
      let f = lessons.get(k)
      if (!f) {
        f = newLessonMap()
        lessons.set(k, f)
      }
      writeLessonInto(f, l)
    }
    for (const k of [...lessons.keys()]) if (!wanted.has(k)) lessons.delete(k)
  }, origin)
  return p
}

/** Parcours tel qu'il est dans le salon (exercices et blocs avec leur clé) */
export function readParcours(y: Y.Map<unknown>): Parcours | null {
  const header = y.get('entete') as Y.Map<unknown> | undefined
  const order = y.get('ordre') as Y.Array<string> | undefined
  const steps = y.get('etapes') as Y.Map<unknown> | undefined
  if (!header || !order || !steps) return null
  const fields = header.toJSON() as Omit<Parcours, 'etapes'>
  if (typeof fields.id !== 'string') return null
  const lessons = y.get('fiches') as Y.Map<Y.Map<unknown>> | undefined
  // Salons d'avant les fiches à part : fiche encore dans l'en-tête
  const lessonAt = (k: string, before?: Lesson) =>
    readLessonFrom(lessons?.get(k)) ?? (lessons ? null : (before ?? null))
  const { fiche, paliers, ...rest } = fields
  const parcoursLesson = lessonAt('parcours', fiche)
  return {
    ...rest,
    ...(parcoursLesson ? { fiche: parcoursLesson } : {}),
    ...(paliers
      ? {
          paliers: paliers.map(({ fiche: before, ...l }, i) => {
            const f = lessonAt(String(i), before)
            return f ? { ...l, fiche: f } : l
          }),
        }
      : {}),
    etapes: readList<Step>(steps, order),
  }
}

export function readAll(doc: Y.Doc): Parcours[] {
  return [...parcoursMap(doc).values()]
    .map(readParcours)
    .filter((p): p is Parcours => p !== null)
    .sort((a, b) => a.titre.localeCompare(b.titre, 'fr'))
}

export function removeParcours(doc: Y.Doc, id: string) {
  parcoursMap(doc).delete(id)
}

// ---------- Objectifs ----------
const objectivesMap = (doc: Y.Doc) => doc.getMap<Objective>('objectifs')
const objectivesOrder = (doc: Y.Doc) => doc.getArray<string>('objectifs-ordre')

export function readSalonObjectives(doc: Y.Doc): Objective[] {
  const all = objectivesMap(doc)
  const keys = new Set(objectivesOrder(doc).toArray())
  for (const k of all.keys()) keys.add(k)
  return [...keys].filter((k) => all.has(k)).map((k) => all.get(k)!)
}

/** Liste des objectifs du salon : seuls ceux qui changent sont réécrits */
export function writeSalonObjectives(doc: Y.Doc, list: Objective[]) {
  doc.transact(() => {
    const all = objectivesMap(doc)
    const keys = list.map((o) => o.libelle)
    for (const o of list) if (!same(all.get(o.libelle), o)) all.set(o.libelle, o)
    for (const k of [...all.keys()]) if (!keys.includes(k)) all.delete(k)
    const order = objectivesOrder(doc)
    if (!same(order.toArray(), keys)) {
      order.delete(0, order.length)
      order.insert(0, keys)
    }
  })
}

/** Ajoute les objectifs absents (même libellé = même objectif) ; renvoie leur nombre */
export function addSalonObjectives(doc: Y.Doc, added: Objective[]) {
  const all = objectivesMap(doc)
  const fresh = added.filter(
    (o, i) =>
      o.libelle &&
      !all.has(o.libelle) &&
      added.findIndex((x) => x.libelle === o.libelle) === i,
  )
  if (!fresh.length) return 0
  doc.transact(() => {
    for (const o of fresh) all.set(o.libelle, o)
    objectivesOrder(doc).push(fresh.map((o) => o.libelle))
  })
  return fresh.length
}

// ---------- Discussion et commentaires ----------
const messages = (doc: Y.Doc) => doc.getArray<SalonMessage>('discussion')
const comments = (doc: Y.Doc) => doc.getMap<SalonComment>('commentaires')

export const readMessages = (doc: Y.Doc) => messages(doc).toArray()

export function addMessage(doc: Y.Doc, auteur: string, texte: string) {
  const t = texte.trim()
  if (!t) return
  messages(doc).push([
    {
      id: newKey(),
      auteur,
      texte: t.slice(0, 2000),
      le: new Date().toISOString(),
    },
  ])
}

export const readComments = (doc: Y.Doc) =>
  [...comments(doc).values()].sort((a, b) => a.le.localeCompare(b.le))

export function addComment(
  doc: Y.Doc,
  c: Pick<SalonComment, 'parcours' | 'element' | 'auteur' | 'texte' | 'parent'>,
) {
  const texte = c.texte.trim()
  if (!texte) return
  const id = newKey()
  // Une réponse rouvre la conversation
  const root = c.parent ? comments(doc).get(c.parent) : undefined
  doc.transact(() => {
    if (root?.resolu) comments(doc).set(root.id, { ...root, resolu: false })
    comments(doc).set(id, {
      ...c,
      id,
      texte: texte.slice(0, 2000),
      le: new Date().toISOString(),
    })
  })
}

export function setResolved(doc: Y.Doc, id: string, resolu: boolean) {
  const c = comments(doc).get(id)
  if (c) comments(doc).set(id, { ...c, resolu })
}
