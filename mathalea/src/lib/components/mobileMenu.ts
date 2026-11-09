// Outils de navigation du menu de la vue mobile.
//
// La vue mobile ne parcourt pas les référentiels dans leur intégralité : les
// rubriques affichées (Collège / Lycée puis les niveaux de chacune) sont
// décrites dans `src/json/mobileMenu.json`. Chaque rubrique pointe vers un
// nœud d'un des référentiels du menu (`aleatoires`, `examens`, …) et la
// navigation se poursuit ensuite dans l'arborescence de ce référentiel.
import katex from 'katex'
import mobileMenuContent from '../../json/mobileMenu.json'
import levelsThemesList from '../../json/levelsThemesList.json'
import levelsThemesListCH from '../../json/levelsThemesListCH.json'
import {
  isExamItemInReferentiel,
  isExerciceItemInReferentiel,
  isJSONReferentielEnding,
  isTool,
  resourceHasMonth,
  resourceHasPlace,
  type JSONReferentielEnding,
  type JSONReferentielObject,
  type ReferentielInMenu,
} from '../types/referentiels'
import { ALLOWED_LANGUAGES, type Language } from '../types/languages'
import { monthes } from './handleDate'
import { codeToLevelTitle } from './refUtils'
import { sortSwissCycleEntries } from './swissReferentiel'

/** Lien externe affiché en tête d'écran d'un niveau de la vue mobile. */
export type MobileMenuExternalLink = {
  title: string
  url: string
  icon?: string
}

/**
 * Entrée de niveau d'une rubrique de la vue mobile.
 * @property {string} id identifiant unique de l'entrée dans sa rubrique (utilisé dans le chemin de navigation)
 * @property {string} title libellé affiché sur la tuile
 * @property {string} referentiel nom du référentiel du menu contenant le nœud (`aleatoires`, `examens`, …)
 * @property {string[]} path chemin des clés menant au nœud dans ce référentiel
 * @property {MobileMenuExternalLink[]} externalLinks liens externes affichés au-dessus des thèmes de ce niveau (optionnel)
 * @property {Language[]} locales locales affichant cette entrée (optionnel, toutes par défaut)
 */
export type MobileMenuEntry = {
  id: string
  title: string
  referentiel: string
  path: string[]
  externalLinks?: MobileMenuExternalLink[]
  locales?: Language[]
}

/**
 * Vues qui utilisent ces rubriques : la vue mobile et la modale « Ajouter un
 * exercice » de la vue Typst (qui propose des rubriques supplémentaires).
 */
export type MobileMenuView = 'mobile' | 'typst'

/** Vues d'une rubrique qui n'en déclare pas (`views` absent du JSON). */
const ALL_MENU_VIEWS: MobileMenuView[] = ['mobile', 'typst']

/**
 * Rubrique de premier niveau de la vue mobile (Collège, Lycée, …).
 * @property {string} id identifiant unique de la rubrique
 * @property {string} title libellé affiché sur la grosse tuile
 * @property {string} subtitle texte secondaire de la tuile (optionnel)
 * @property {string} icon classe d'icône boxicons de la tuile (optionnel)
 * @property {MobileMenuView[]} views vues qui affichent la rubrique (optionnel, toutes par défaut)
 * @property {Language[]} locales locales affichant la rubrique (optionnel, toutes par défaut)
 * @property {MobileMenuEntry[]} entries niveaux proposés dans la rubrique
 */
export type MobileMenuSection = {
  id: string
  title: string
  subtitle?: string
  icon?: string
  views?: MobileMenuView[]
  locales?: Language[]
  entries: MobileMenuEntry[]
}

const allMenuSections: MobileMenuSection[] = (
  mobileMenuContent as { sections: MobileMenuSection[] }
).sections

/** Toutes les locales, valeur par défaut d'une rubrique ou d'une entrée sans `locales`. */
const ALL_LOCALES: Language[] = [...ALLOWED_LANGUAGES]

/**
 * Rubriques proposées dans une vue et une locale données : les rubriques et
 * entrées dont le référentiel ne couvre pas cette locale sont retirées (par
 * exemple les niveaux français pour la locale `fr-CH`, ou l'inverse).
 * @param {MobileMenuView} view vue concernée
 * @param {Language} lang locale du référentiel affiché
 * @returns {MobileMenuSection[]} les rubriques (et leurs entrées) que cette vue affiche
 */
function sectionsForView(
  view: MobileMenuView,
  lang: Language,
): MobileMenuSection[] {
  return allMenuSections
    .filter((section) => (section.views ?? ALL_MENU_VIEWS).includes(view))
    .filter((section) => (section.locales ?? ALL_LOCALES).includes(lang))
    .map((section) => ({
      ...section,
      entries: section.entries.filter((entry) =>
        (entry.locales ?? ALL_LOCALES).includes(lang),
      ),
    }))
    .filter((section) => section.entries.length > 0)
}

/**
 * Rubriques de la vue mobile pour une locale donnée, telles que décrites
 * dans `mobileMenu.json`.
 * @param {Language} lang locale du référentiel affiché
 * @returns {MobileMenuSection[]} les rubriques de la vue mobile
 */
export function mobileMenuSectionsForLocale(
  lang: Language,
): MobileMenuSection[] {
  return sectionsForView('mobile', lang)
}

/**
 * Rubriques de la modale « Ajouter un exercice » de la vue Typst pour une
 * locale donnée : celles de la vue mobile, plus la Course aux nombres et les
 * ressources complémentaires.
 * @param {Language} lang locale du référentiel affiché
 * @returns {MobileMenuSection[]} les rubriques de la modale
 */
export function typstMenuSectionsForLocale(
  lang: Language,
): MobileMenuSection[] {
  return sectionsForView('typst', lang)
}

/**
 * Chemin ouvert par la tuile d'une rubrique : une rubrique qui ne propose
 * qu'un niveau (Primaire) ouvre directement ce niveau, sans écran
 * intermédiaire à une seule tuile.
 * @param {MobileMenuSection} section rubrique choisie
 * @returns {string[]} le chemin de navigation
 */
export function sectionPath(section: MobileMenuSection): string[] {
  return section.entries.length === 1
    ? [section.id, section.entries[0].id]
    : [section.id]
}

/**
 * Chemin du retour depuis `path`, symétrique de `sectionPath` : on ne
 * s'arrête pas sur l'écran d'une rubrique à un seul niveau.
 * @param {MobileMenuSection[]} sections rubriques de la vue
 * @param {string[]} path chemin courant
 * @returns {string[]} le chemin parent
 */
export function parentPath(
  sections: MobileMenuSection[],
  path: string[],
): string[] {
  const parent = path.slice(0, -1)
  if (parent.length !== 1) return parent
  const section = sections.find((s) => s.id === parent[0])
  return section !== undefined && section.entries.length === 1 ? [] : parent
}

const themesTitlesCH = levelsThemesListCH as Record<string, { titre?: string }>
// Les codes des thèmes français (`6N1`, …) et suisses (`9NO1`, `1mF2`, …) ne
// se recouvrent pas : une seule table sert aux deux référentiels.
const themesTitles = {
  ...themesTitlesCH,
  ...(levelsThemesList as Record<string, { titre?: string }>),
}

/**
 * Remplace les portions encadrées par des `$` par leur rendu KaTeX.
 * @param {string} text texte pouvant contenir des maths
 * @returns {string} HTML prêt à être injecté
 */
export function renderMathsInLabel(text: string): string {
  if (!text.includes('$')) return text
  let rendered = text
  const matchs = text.match(/(\$)(.*?)\1/g)
  matchs?.forEach((match) => {
    rendered = rendered.replace(
      match,
      katex.renderToString(match.replaceAll('$', '')),
    )
  })
  return rendered
}

/**
 * Traduit la clé d'un nœud de référentiel en libellé affichable.
 * On cherche d'abord dans les thèmes/sous-thèmes, puis dans les niveaux,
 * et à défaut on renvoie la clé elle-même (cas des thèmes d'annales).
 * @param {string} code clé du nœud
 * @returns {string} HTML du libellé
 */
export function nodeLabel(code: string): string {
  const title = themesTitles[code]?.titre ?? codeToLevelTitle(code)
  return renderMathsInLabel(title)
}

/**
 * Code d'un thème du référentiel suisse à afficher sous son intitulé (comme
 * `9NO1 : …` dans le menu de la vue bureau) : les enseignants s'y repèrent
 * par ces codes. Chaîne vide pour toute autre clé.
 * @param {string} code clé du nœud
 * @returns {string} le code ou une chaîne vide
 */
export function nodeCode(code: string): string {
  const title = themesTitlesCH[code]?.titre
  return title !== undefined && title !== code ? code : ''
}

/**
 * Descend dans un référentiel du menu en suivant un chemin de clés.
 * @param {ReferentielInMenu[]} referentiels référentiels disponibles dans le menu
 * @param {string} name nom du référentiel visé (`aleatoires`, `examens`, …)
 * @param {string[]} path chemin des clés à suivre
 * @returns {JSONReferentielObject | undefined} le nœud atteint, `undefined` si le chemin n'existe pas
 */
export function resolveNode(
  referentiels: ReferentielInMenu[],
  name: string,
  path: string[],
): JSONReferentielObject | undefined {
  const referentiel = referentiels.find((r) => r.name === name)
  if (referentiel === undefined) return undefined
  let node: JSONReferentielObject = referentiel.referentiel
  for (const key of path) {
    const child = node[key]
    if (
      child === undefined ||
      child === null ||
      typeof child !== 'object' ||
      Array.isArray(child) ||
      isJSONReferentielEnding(child)
    ) {
      return undefined
    }
    node = child as JSONReferentielObject
  }
  return node
}

/** Valeur numérique d'une chaîne ; `+Infinity` si absente ou non numérique. */
function numericValue(value: string | undefined): number {
  if (!value) return Number.POSITIVE_INFINITY
  const parsed = parseInt(value, 10)
  return Number.isNaN(parsed) ? Number.POSITIVE_INFINITY : parsed
}

/** Index du mois (0..11) ; `+Infinity` si absent ou inconnu. */
function monthIndex(mois: string | undefined): number {
  if (!mois) return Number.POSITIVE_INFINITY
  const index = monthes.indexOf(mois)
  return index === -1 ? Number.POSITIVE_INFINITY : index
}

/**
 * Comparateur des annales : année décroissante, puis mois décroissant,
 * puis lieu, puis numéro de l'exercice dans le sujet initial.
 */
function compareExams(
  [, a]: [string, JSONReferentielEnding],
  [, b]: [string, JSONReferentielEnding],
): number {
  if (!isExamItemInReferentiel(a) || !isExamItemInReferentiel(b)) return 0
  return (
    numericValue(b.annee) - numericValue(a.annee) ||
    monthIndex(b.mois) - monthIndex(a.mois) ||
    (a.lieu ?? '').localeCompare(b.lieu ?? '', 'fr') ||
    numericValue(a.numeroInitial) - numericValue(b.numeroInitial)
  )
}

/**
 * Sépare les enfants directs d'un nœud entre sous-catégories (affichées en
 * tuiles) et exercices (affichés en liste).
 * @param {JSONReferentielObject | undefined} node nœud à découper
 * @returns les sous-catégories et les exercices du nœud
 */
export function splitChildren(node: JSONReferentielObject | undefined): {
  categories: string[]
  endings: Array<[string, JSONReferentielEnding]>
} {
  const categories: string[] = []
  const endings: Array<[string, JSONReferentielEnding]> = []
  if (node === undefined) return { categories, endings }
  for (const [key, value] of Object.entries(node)) {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
      continue
    }
    if (isJSONReferentielEnding(value)) {
      endings.push([key, value as JSONReferentielEnding])
    } else {
      categories.push(key)
    }
  }
  if (endings.length > 0 && isExamItemInReferentiel(endings[0][1])) {
    endings.sort(compareExams)
  }
  return { categories, endings: sortSwissCycleEntries(endings) }
}

/**
 * Construit le libellé affiché pour un exercice dans la liste mobile.
 * @param {JSONReferentielEnding} ending terminaison du référentiel
 * @returns {string} HTML du libellé
 */
export function endingLabel(ending: JSONReferentielEnding): string {
  if (isExerciceItemInReferentiel(ending) || isTool(ending)) {
    return renderMathsInLabel(ending.titre)
  }
  if (resourceHasPlace(ending)) {
    const mois = resourceHasMonth(ending) ? `${ending.mois} ` : ''
    const jour =
      ending.jour !== undefined
        ? ` [${ending.jour === 'J1' ? 'Sujet 1' : 'Sujet 2'}]`
        : ''
    return `${ending.typeExercice.toUpperCase()} ${mois}${ending.annee} ${ending.lieu}${jour} — exercice ${ending.numeroInitial}`
  }
  if ('titre' in ending && typeof ending.titre === 'string' && ending.titre) {
    return renderMathsInLabel(ending.titre)
  }
  return ending.uuid
}

/**
 * Référence courte d'un exercice (son `id` pédagogique), affichée en tête de
 * ligne quand elle existe.
 * @param {JSONReferentielEnding} ending terminaison du référentiel
 * @returns {string} la référence ou une chaîne vide
 */
export function endingReference(ending: JSONReferentielEnding): string {
  if (isExerciceItemInReferentiel(ending) || isTool(ending)) return ending.id
  return ''
}
