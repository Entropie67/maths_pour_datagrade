/**
 * Date d'ouverture d'un palier, lue par l'application MathALÉA mobile : le
 * palier reste fermé avant cet instant, en plus de la règle d'accès. Mêmes
 * règles que `catalogue.ts` de l'application (`estOuverture`,
 * `ouvertureDuJour`).
 */

/** Heure d'ouverture d'un palier le jour choisi */
export const OPENING_HOUR = 8

const two = (n: number) => String(n).padStart(2, '0')

/** Jour valide au format AAAA-MM-JJ (pas de 31 février) */
export function isDay(v: unknown): v is string {
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false
  const [y, m, d] = v.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return (
    date.getFullYear() === y &&
    date.getMonth() === m - 1 &&
    date.getDate() === d
  )
}

/**
 * Ouverture au jour choisi : 8 h ce jour-là dans le fuseau de l'appareil de
 * l'enseignant (heure d'été comprise), décalage écrit en clair.
 */
export function openingOfDay(day: string): string {
  const [y, m, d] = day.split('-').map(Number)
  const offset = -new Date(y, m - 1, d, OPENING_HOUR).getTimezoneOffset()
  const sign = offset < 0 ? '-' : '+'
  return `${day}T${two(OPENING_HOUR)}:00:00${sign}${two(Math.floor(Math.abs(offset) / 60))}:${two(Math.abs(offset) % 60)}`
}

/** Instant d'ouverture valide : « AAAA-MM-JJTHH:MM:SS » suivi de « Z » ou du décalage */
export function isOpening(v: unknown): v is string {
  return (
    typeof v === 'string' &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})$/.test(v) &&
    isDay(v.slice(0, 10)) &&
    Number.isFinite(Date.parse(v))
  )
}

/** Jour de l'ouverture chez l'enseignant (AAAA-MM-JJ) */
export const dayOfOpening = (opening: string) => opening.slice(0, 10)

/** « jeudi 12 novembre 2026 », jour de l'ouverture */
export function openingLabel(opening: string): string {
  const [y, m, d] = dayOfOpening(opening).split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
