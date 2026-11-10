/**
 * Exercices du référentiel de MathALÉA pour les parcours de l'application :
 * ceux du moteur (src/moteur), indexés par uuid, avec l'objectif du programme
 * sous lequel le site les range.
 */
import { listerExercices, type ExerciceDuReferentiel } from '../../moteur'
import type { Language } from '../types/languages'
import { LEVELS } from './parcoursTypes'

export type ReferentialExercise = ExerciceDuReferentiel & {
  objective?: { code: string; libelle: string }
}

export type Country = 'FR' | 'CH'
/** Pays du référentiel affiché (drapeau de l'en-tête, `lang=fr-CH` dans l'URL) */
export const countryOf = (lang: Language): Country =>
  lang === 'fr-CH' ? 'CH' : 'FR'

const caches: Partial<Record<Country, Promise<Map<string, ReferentialExercise>>>> =
  {}

/**
 * Index des exercices par uuid (chargé une fois par pays, à la demande) : ceux
 * du référentiel du pays, avec leur code de ce pays, puis ceux que seul l'autre
 * référentiel range (un parcours peut venir de l'autre pays).
 */
export function exerciseIndex(
  country: Country = 'FR',
): Promise<Map<string, ReferentialExercise>> {
  const other: Country = country === 'FR' ? 'CH' : 'FR'
  caches[country] ??= Promise.all([
    listerExercices(country),
    listerExercices(other),
  ]).then(([own, foreign]) => {
    const index = new Map<string, ReferentialExercise>()
    // Un exercice rangé à plusieurs endroits : sa place sous un objectif du programme d'abord
    for (const e of own) {
      const known = index.get(e.uuid)
      if (!known || (!known.objective && e.objectif))
        index.set(e.uuid, { ...e, objective: e.objectif })
    }
    for (const e of foreign)
      if (!index.has(e.uuid)) index.set(e.uuid, { ...e, objective: e.objectif })
    return index
  })
  return caches[country]
}

export interface OfficialChapter {
  code: string // 5N2…
  name: string
}

/**
 * Niveaux suisses : les rubriques du référentiel suisse de MathALÉA (section
 * comprise en 9e, 10e et 11e), avec le chemin de la fenêtre « Ajouter un
 * exercice » (`mobileMenu.json`) et celui du référentiel où sont leurs
 * chapitres. Préqualifiant : ses rubriques sont ses chapitres.
 */
interface SwissLevel {
  name: string // niveau du parcours
  menu: string[] // chemin de la fenêtre d'ajout jusqu'au niveau
  referential: string[] // chemin du niveau dans referentiel2022CH
}
const cycle = (code: string): SwissLevel => ({
  name: code,
  menu: ['ecoleObligatoire', code],
  referential: ["Cycle d'orientation", code],
})
const college = (n: number, label: string): SwissLevel => ({
  name: `${label} Collège`,
  menu: ['secondaireII', `${n}e-college`],
  referential: ['Collège', `${label} année`],
})
const SWISS_LEVELS: SwissLevel[] = [
  ...['9R3', '9R2', '9R1', '10LS', '10LC', '10CT', '11LS', '11LC', '11CT'].map(
    cycle,
  ),
  college(1, '1re'),
  college(2, '2e'),
  college(3, '3e'),
  college(4, '4e'),
  { name: 'Préqualifiant', menu: ['prequalifiant'], referential: ['Préqualifiant'] },
  { name: 'Primaire', menu: ['primaire', 'primaire'], referential: ['Primaire', 'PR'] },
]

/** Niveaux proposés dans l'éditeur, selon le référentiel affiché */
export function levelsFor(country: Country): string[] {
  return country === 'CH' ? SWISS_LEVELS.map((l) => l.name) : LEVELS
}
/**
 * Anciens niveaux suisses (référentiel d'avant le 5 novembre 2026) : les
 * parcours qui les portent les gardent ; on les range avant leurs sections et
 * la fenêtre d'ajout s'ouvre sur le Cycle d'orientation.
 */
const OLD_SWISS_LEVELS: Record<string, string> = {
  '9e': '9R3',
  '10e': '10LS',
  '11e': '11LS',
}
/** Tous les niveaux connus, pour trier une bibliothèque qui mêle les deux pays */
export const ALL_LEVELS = [
  ...LEVELS,
  ...SWISS_LEVELS.flatMap((l) => [
    ...Object.keys(OLD_SWISS_LEVELS).filter(
      (old) => OLD_SWISS_LEVELS[old] === l.name,
    ),
    l.name,
  ]),
]

const swissChapters = (
  referentialCH: unknown,
  themesCH: unknown,
): Record<string, OfficialChapter[]> => {
  const titles = themesCH as Record<string, { titre?: string }>
  const result: Record<string, OfficialChapter[]> = {}
  for (const level of SWISS_LEVELS) {
    let node: unknown = referentialCH
    for (const key of level.referential)
      node = (node as Record<string, unknown> | undefined)?.[key]
    result[level.name] = Object.keys((node as Record<string, unknown>) ?? {})
      .filter((code) => titles[code]?.titre)
      .map((code) => ({ code, name: titles[code].titre! }))
  }
  return result
}

let chapterCache: Promise<Record<string, OfficialChapter[]>> | null = null

/**
 * Chapitres du site par niveau (référentiel), dans l'ordre du menu : ceux des
 * niveaux français et suisses (leurs noms ne se recoupent pas).
 */
export function officialChapters(): Promise<Record<string, OfficialChapter[]>> {
  chapterCache ??= Promise.all([
    import('../../json/referentiel2022FR.json'),
    import('../../json/levelsThemesList.json'),
    import('../../json/referentiel2022CH.json'),
    import('../../json/levelsThemesListCH.json'),
  ]).then(([{ default: referential }, { default: names }, ch, chNames]) => {
    const titles = names as Record<string, { titre?: string }>
    const result: Record<string, OfficialChapter[]> = swissChapters(
      ch.default,
      chNames.default,
    )
    for (const [level, chapters] of Object.entries(
      referential as Record<string, Record<string, unknown>>,
    )) {
      result[level] = Object.keys(chapters ?? {})
        .filter((code) => titles[code]?.titre)
        .map((code) => ({ code, name: titles[code].titre! }))
    }
    return result
  })
  return chapterCache
}

/** Rubrique et niveau du menu « Ajouter un exercice » pour un niveau de l'application */
export function menuPathFor(level: string, chapterCode?: string): string[] {
  const swiss = SWISS_LEVELS.find((l) => l.name === level)
  if (swiss) return chapterCode ? [...swiss.menu, chapterCode] : swiss.menu
  if (level in OLD_SWISS_LEVELS) return ['ecoleObligatoire']
  const college = ['6e', '5e', '4e', '3e']
  const lycee: Record<string, string> = {
    '2e': '2e',
    '1re': '1e',
    Terminale: 'terminale',
  }
  const base = college.includes(level)
    ? ['college', level]
    : lycee[level]
      ? ['lycee', lycee[level]]
      : []
  return base.length && chapterCode ? [...base, chapterCode] : base
}
