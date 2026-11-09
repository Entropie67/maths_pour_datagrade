/**
 * Présence dans un salon (qui est là, sur quel parcours, quel élément) et
 * verrous qui en découlent. Module léger : la connexion elle-même
 * (`salonConnection.ts`, avec Yjs) n'est chargée qu'une fois connecté.
 */
import { BLOCK_LABELS } from '../lessonFile'
import {
  levelName,
  type Lesson,
  type Objective,
  type Parcours,
} from '../parcoursTypes'
import type { SalonComment, SalonLesson, SalonMessage } from './salonDoc'

export interface Presence {
  clientId: number
  nom: string
  couleur: string
  parcours: string | null // parcours ouvert
  element: string | null // élément en cours de modification
  depuis: number // depuis quand il l'a ouvert : le premier garde la main
  pointeur?: Pointer | null // souris au-dessus de l'éditeur
}

/**
 * Position de la souris, relative à l'élément survolé (fractions de sa
 * largeur et de sa hauteur) : elle reste juste quelle que soit la largeur de
 * l'écran de chacun. Élément vide : relative à tout l'éditeur.
 */
export interface Pointer {
  element: string
  x: number
  y: number
}

export interface SalonSnapshot {
  status: 'connexion' | 'connecte' | 'hors-ligne' | 'refuse'
  unsynced: number // modifications pas encore reçues par le serveur
  parcours: Parcours[]
  fiches: SalonLesson[] // fiches seules
  objectives: Objective[]
  messages: SalonMessage[]
  comments: SalonComment[]
  presences: Presence[] // les autres personnes connectées
  me: Presence // ma présence
}

// Couleurs des personnes : lisibles sur fond clair et sombre
const COLORS = [
  '#2563eb',
  '#16a34a',
  '#c026d3',
  '#ea580c',
  '#0891b2',
  '#dc2626',
  '#7c3aed',
  '#ca8a04',
]
export const colorOf = (id: number) => COLORS[Math.abs(id) % COLORS.length]

/** Initiales affichées dans la pastille d'une personne */
export const initials = (nom: string) =>
  nom
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')

/** Une pastille par personne (plusieurs onglets ouverts : une seule) */
export function people(presences: Presence[], parcours?: string) {
  const seen = new Map<string, Presence>()
  for (const p of presences)
    if (parcours === undefined || p.parcours === parcours)
      if (!seen.has(p.nom)) seen.set(p.nom, p)
  return [...seen.values()]
}

/**
 * Personne qui a la main sur un élément : celle qui l'a ouvert la première.
 * null si c'est moi (ou personne) : je peux le modifier.
 */
export function lockHolder(
  s: Pick<SalonSnapshot, 'presences' | 'me'>,
  parcours: string,
  element: string,
): Presence | null {
  const { presences, me: mine } = s
  const others = presences.filter(
    (p) => p.parcours === parcours && p.element === element,
  )
  if (!others.length) return null
  const first = others.reduce((a, b) =>
    a.depuis < b.depuis || (a.depuis === b.depuis && a.clientId < b.clientId)
      ? a
      : b,
  )
  const iHaveIt = mine.parcours === parcours && mine.element === element
  if (
    iHaveIt &&
    (mine.depuis < first.depuis ||
      (mine.depuis === first.depuis && mine.clientId < first.clientId))
  )
    return null
  return first
}

/**
 * Éléments d'un parcours (présence, verrous, commentaires) : « parcours »
 * (commentaire général), « entete »,
 * « etape:<cle> », « palier:<rang> », « pause:<rang> », « eleves ».
 */
export function elementName(p: Parcours, el: string): string {
  if (el === 'parcours') return 'Parcours en général'
  if (el === 'entete') return 'Titre et réglages'
  if (el === 'eleves') return 'Pour les élèves'
  const [kind, value] = el.split(':')
  if (kind === 'etape') {
    const s = p.etapes.find((x) => x.cle === value)
    return s ? `Exercice ${s.id ?? s.titre ?? ''}`.trim() : 'Exercice retiré'
  }
  const k = Number(value)
  if (kind === 'palier') return levelName(p, k)
  if (kind === 'pause') return `Pause après : ${levelName(p, k).toLowerCase()}`
  return el
}

/** Identifiant stable d'un exercice, d'un bloc ou d'une fiche dans un salon */
export const newKey = () =>
  Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)

/**
 * Document ouvert (présence, verrous, commentaires) : identifiant du parcours,
 * « fiche:<id> » pour une fiche seule, « fiche:<parcours>:<palier> » pour la
 * fiche d'un parcours (« parcours » à la place du rang sans paliers).
 */
export const lessonDocId = (id: string, level?: number | null) =>
  level === undefined
    ? `fiche:${id}`
    : `fiche:${id}:${level === null ? 'parcours' : level}`

/** Éléments d'une fiche : « fiche » (titre et réglages), « bloc:<cle> » */
export function lessonElementName(l: Lesson, el: string): string {
  if (el === 'parcours') return 'Fiche en général'
  if (el === 'fiche') return 'Titre de la fiche'
  const [kind, value] = el.split(':')
  if (kind === 'bloc') {
    const k = l.blocs.findIndex((b) => b.cle === value)
    return k === -1
      ? 'Bloc retiré'
      : `Bloc ${k + 1} (${BLOCK_LABELS[l.blocs[k].type].toLowerCase()})`
  }
  return el
}

/** Ce que l'éditeur d'un parcours de salon sait des autres */
export interface EditorCollab {
  lock: (element: string) => Presence | null // quelqu'un d'autre le modifie
  comments: (element: string) => number // commentaires non résolus
  oncomment: (element: string) => void // ouvre ses commentaires
}
