/**
 * Versions d'un salon : copies horodatées gardées par le serveur (une par heure
 * au plus). On y relit un parcours tel qu'il était ; revenir à une version le
 * réécrit dans le salon comme une modification normale (rien n'est effacé, et
 * l'on peut encore revenir à la version d'avant).
 */
import * as Y from 'yjs'
import type { Parcours } from '../parcoursTypes'
import { levelGroups } from '../parcoursTypes'
import { readAll } from './salonDoc'
import { salonVersion } from './salonApi'

const docs = new Map<string, Promise<Y.Doc>>()

/** Document d'une copie (chargé une fois) */
export function versionDoc(salon: string, le: string): Promise<Y.Doc> {
  const key = `${salon}/${le}`
  let d = docs.get(key)
  if (!d) {
    d = salonVersion(salon, le).then(({ etat }) => docFromBase64(etat))
    d.catch(() => docs.delete(key))
    docs.set(key, d)
  }
  return d
}

export function docFromBase64(etat: string): Y.Doc {
  const bytes = Uint8Array.from(atob(etat), (c) => c.charCodeAt(0))
  const doc = new Y.Doc()
  Y.applyUpdate(doc, bytes)
  return doc
}

/** Le parcours dans une copie, s'il y était */
export const parcoursIn = (doc: Y.Doc, id: string): Parcours | null =>
  readAll(doc).find((p) => p.id === id) ?? null

/**
 * Même contenu pour l'enseignant : les clés internes (`cle`) des exercices et
 * des blocs sont ignorées, car le salon en ajoute aux blocs anciens quand il
 * réécrit un parcours.
 */
export const sameParcours = (a: Parcours | null, b: Parcours | null) =>
  JSON.stringify(a, (k, v) => (k === 'cle' ? undefined : v)) ===
  JSON.stringify(b, (k, v) => (k === 'cle' ? undefined : v))

/** « 2 paliers · 6 exercices » */
export function versionSummary(p: Parcours): string {
  const groups = levelGroups(p).length
  const n = p.etapes.length
  return [
    p.titre || 'Sans titre',
    groups > 1 ? `${groups} paliers` : '',
    `${n} exercice${n > 1 ? 's' : ''}`,
  ]
    .filter(Boolean)
    .join(' · ')
}

/**
 * Parcours supprimés depuis : présents dans une copie, absents du salon. Pour
 * chacun, sa dernière version connue (copies de la plus récente à la plus
 * ancienne).
 */
export function deletedParcours(
  copies: { le: string; doc: Y.Doc }[],
  current: Parcours[],
): { parcours: Parcours; le: string }[] {
  const now = new Set(current.map((p) => p.id))
  const found = new Map<string, { parcours: Parcours; le: string }>()
  for (const { le, doc } of copies)
    for (const p of readAll(doc))
      if (!now.has(p.id) && !found.has(p.id))
        found.set(p.id, { parcours: p, le })
  return [...found.values()]
}

/** Date lisible d'une copie : « aujourd'hui 14 h », « hier 9 h », « 3 nov. 18 h » */
export function versionDate(le: string, now = new Date()): string {
  const d = new Date(le)
  const day = (x: Date) => x.toDateString()
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  const hour = `${d.getHours()} h ${String(d.getMinutes()).padStart(2, '0')}`
  if (day(d) === day(now)) return `aujourd’hui ${hour}`
  if (day(d) === day(yesterday)) return `hier ${hour}`
  return `${d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} ${hour}`
}
