import { decrypt, EXERCISE_URL_PARAMS, isCrypted } from '../components/urls'
import type { SavedSelection } from './library'
import { isMathaleaUrl, readWebUrl } from './webLink'

/**
 * Liens de « Mes sélections » : lecture d'un lien MathALÉA collé ou
 * enregistré depuis l'application, lecture et réécriture de ses réglages
 * (vue, interactivité, présentation de la vue élève…).
 *
 * Une sélection garde la requête complète du lien, graines comprises. Les
 * réglages propres à une vue (`es` et `title` de la vue élève, `ds` du
 * diaporama, `can…` de la course aux nombres) restent dans la requête quand
 * on change de vue, pour les retrouver en y revenant ; `selectionUrl` ne met
 * dans le lien ouvert que ceux de la vue choisie, comme le fait l'application
 * (`appendGlobalOptionsToURL`).
 */

/** Vues proposées pour ouvrir une sélection */
export const SELECTION_VIEWS = [
  { value: '', label: 'Conception', icon: 'bx-edit-alt' },
  { value: 'eleve', label: 'Élève', icon: 'bxs-graduation' },
  { value: 'diaporama', label: 'Diaporama', icon: 'bx-slideshow' },
  { value: 'tbi', label: 'Vidéoprojection', icon: 'bx-chalkboard' },
  { value: 'can', label: 'Course aux nombres', icon: 'bx-timer' },
  { value: 'typst', label: 'Impression', icon: 'bx-printer' },
  { value: 'tex', label: 'PDF via LaTeX', icon: 'bx-code-alt' },
] as const

export type PresMode =
  'liste_exos' | 'un_exo_par_page' | 'une_question_par_page' | 'recto' | 'verso'

export const PRES_MODES: { value: PresMode; label: string }[] = [
  { value: 'liste_exos', label: 'Tous les exercices sur une page' },
  { value: 'un_exo_par_page', label: 'Une page par exercice' },
  { value: 'une_question_par_page', label: 'Une page par question' },
]

/** Interactivité de tous les exercices, ou réglage propre à chaque exercice */
export type Interactivity = 'tous' | 'aucun' | 'mixte'

export interface LinkSettings {
  /** Paramètre `v` (chaîne vide : conception de document) */
  view: string
  interactivity: Interactivity
  /** Vue élève */
  presMode: PresMode
  isSolutionAccessible: boolean
  /** L'élève peut changer l'interactivité */
  isInteractiveFree: boolean
  /** Une seule réponse */
  oneShot: boolean
  /** Titre du bandeau (pas de bandeau si vide) */
  title: string
}

/** Contenu d'un lien, prêt à enregistrer */
export interface LinkContent {
  externalUrl?: string
  query: string
  exercises: string[]
}

/** Vues qui lisent les réglages `es` et `title` (voir `appendGlobalOptionsToURL`) */
const ES_VIEWS = new Set(['eleve', 'myriade', 'indices', 'indice'])
const DIAPORAMA_VIEWS = new Set(['diaporama', 'overview'])
/** Vues où l'interactivité a un sens (conception, vue élève, course aux nombres) */
const INTERACTIVE_VIEWS = new Set(['', 'can', ...ES_VIEWS])

export function isInteractiveView(view: string): boolean {
  return INTERACTIVE_VIEWS.has(view)
}
const DIAPORAMA_PARAMS = ['ds', 'select', 'order']
const CAN_PARAMS = [
  'canD',
  'canTi',
  'canT',
  'canSA',
  'canSM',
  'canI',
  'canNC',
  'canQ',
  'canFB',
]
const ES_PARAMS = ['es', 'title']

/**
 * Paramètres propres à une copie d'élève, à une plateforme ou à une session,
 * retirés d'un lien enregistré
 */
const TRANSIENT_PARAMS = [
  'feuille',
  'recorder',
  'answers',
  'done',
  'iframe',
  'triche',
  'log',
  'cor',
]

/**
 * `es` par défaut de la vue élève : tous les exercices sur une page, réglage
 * de chaque exercice, correction disponible, interactivité modifiable, titre
 * et références affichés (voir `buildEsParams`)
 */
const DEFAULT_ES = '221100110'
/** Position des modes de présentation dans `es` (voir `presModeId`) */
const PRES_MODE_CODES: Record<PresMode, string> = {
  liste_exos: '2',
  un_exo_par_page: '1',
  une_question_par_page: '3',
  recto: '4',
  verso: '5',
}
const PRES_MODE_FROM_CODE: Record<string, PresMode> = {
  '0': 'liste_exos',
  '1': 'un_exo_par_page',
  '2': 'liste_exos',
  '3': 'une_question_par_page',
  '4': 'recto',
  '5': 'verso',
}

type Entry = [string, string]

/** Requête découpée : un groupe de paramètres par exercice, puis les réglages de la série */
interface ParsedQuery {
  exercises: Entry[][]
  globals: Entry[]
  hash: string
}

const exerciseParams = new Set(EXERCISE_URL_PARAMS)

/**
 * Découpe une requête comme `mathaleaUpdateExercicesParamsFromUrl` : un
 * `uuid`, ou un `id` qui ne suit pas un `uuid`, ouvre un nouvel exercice ;
 * les paramètres d'exercice qui suivent lui appartiennent.
 */
function parseQuery(query: string): ParsedQuery {
  const hashIndex = query.indexOf('#')
  const search = hashIndex < 0 ? query : query.slice(0, hashIndex)
  const parsed: ParsedQuery = {
    exercises: [],
    globals: [],
    hash: hashIndex < 0 ? '' : query.slice(hashIndex),
  }
  let previousKey = ''
  for (const [key, value] of new URLSearchParams(search)) {
    if (key === 'uuid' || (key === 'id' && previousKey !== 'uuid')) {
      parsed.exercises.push([[key, value]])
    } else if (exerciseParams.has(key) && parsed.exercises.length > 0) {
      parsed.exercises[parsed.exercises.length - 1].push([key, value])
    } else {
      parsed.globals.push([key, value])
    }
    previousKey = key
  }
  return parsed
}

function buildQuery(parsed: ParsedQuery): string {
  const params = new URLSearchParams()
  for (const exercise of parsed.exercises) {
    for (const [key, value] of exercise) params.append(key, value)
  }
  for (const [key, value] of parsed.globals) params.append(key, value)
  const search = params.toString()
  return (search === '' ? '?' : `?${search}`) + parsed.hash
}

function getGlobal(parsed: ParsedQuery, key: string): string | undefined {
  return parsed.globals.find(([k]) => k === key)?.[1]
}

/** Remplace (à la même place) ou retire un réglage de la série */
function setGlobal(parsed: ParsedQuery, key: string, value: string | null) {
  const index = parsed.globals.findIndex(([k]) => k === key)
  const others = parsed.globals.filter(([k]) => k !== key)
  if (value !== null) {
    others.splice(index < 0 ? others.length : index, 0, [key, value])
  }
  parsed.globals = others
}

function withoutGlobals(parsed: ParsedQuery, keys: string[]): ParsedQuery {
  return {
    ...parsed,
    globals: parsed.globals.filter(([key]) => !keys.includes(key)),
  }
}

/** Références des exercices (`id`, ou `uuid` à défaut) */
function exerciseRefs(parsed: ParsedQuery): string[] {
  return parsed.exercises.map(
    (exercise) =>
      exercise.find(([key]) => key === 'id')?.[1] ??
      exercise.find(([key]) => key === 'uuid')?.[1] ??
      '',
  )
}

/**
 * Lit un lien MathALÉA (adresse complète, éventuellement cryptée, ou requête
 * `?uuid=…`) : seule la requête est gardée, sans les paramètres propres à
 * une copie d'élève ou à une plateforme.
 * @throws Error avec un message à afficher si ce n'est pas un lien d'exercices
 */
export function readMathaleaLink(
  input: string,
  allowEmpty = false,
): LinkContent {
  const text = input.trim()
  let url: URL
  try {
    url = new URL(
      /^[a-z][a-z0-9+.-]*:/i.test(text) ||
        text.startsWith('?') ||
        text.startsWith('/')
        ? text
        : `https://${text}`,
      'https://coopmaths.fr/alea/',
    )
  } catch {
    throw new Error('Ce texte n’est pas un lien.')
  }
  if (isCrypted(url)) url = decrypt(url)
  const parsed = withoutGlobals(
    parseQuery(url.search + url.hash),
    TRANSIENT_PARAMS,
  )
  if (!allowEmpty && parsed.exercises.length === 0) {
    throw new Error('Ce lien ne contient aucun exercice MathALÉA.')
  }
  return { query: buildQuery(parsed), exercises: exerciseRefs(parsed) }
}

/** Lit un lien web ; seuls les liens de l’application ont des réglages MathALÉA. */
export function readSelectionLink(input: string): LinkContent {
  const text = input.trim()
  if (text.startsWith('?') || text.startsWith('/alea/'))
    return readMathaleaLink(text, true)
  const url = readWebUrl(text)
  return isMathaleaUrl(url)
    ? readMathaleaLink(url.href, true)
    : { externalUrl: url.href, query: '?', exercises: [] }
}

function readTitle(value: string | undefined): string {
  if (value === undefined) return ''
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export function readSettings(query: string): LinkSettings {
  const parsed = parseQuery(query)
  const view = getGlobal(parsed, 'v') ?? ''
  const es = getGlobal(parsed, 'es') ?? ''
  const eleveEs = es.length >= 6 ? es : DEFAULT_ES
  const perExercise = parsed.exercises.map((exercise) =>
    exercise.some(([key, value]) => key === 'i' && value === '1'),
  )
  let interactivity: Interactivity = perExercise.every(Boolean)
    ? 'tous'
    : perExercise.some(Boolean)
      ? 'mixte'
      : 'aucun'
  if (ES_VIEWS.has(view) && (es.charAt(1) === '0' || es.charAt(1) === '1')) {
    interactivity = es.charAt(1) === '1' ? 'tous' : 'aucun'
  } else if (view === 'can') {
    interactivity = getGlobal(parsed, 'canI') === '1' ? 'tous' : 'aucun'
  } else if (!ES_VIEWS.has(view) && getGlobal(parsed, 'numerique') === '1') {
    interactivity = 'tous'
  }
  return {
    view,
    interactivity,
    presMode: PRES_MODE_FROM_CODE[eleveEs.charAt(0)] ?? 'liste_exos',
    isSolutionAccessible: eleveEs.charAt(2) === '1',
    isInteractiveFree: eleveEs.charAt(3) === '1',
    oneShot: eleveEs.charAt(4) === '1',
    title: readTitle(getGlobal(parsed, 'title')),
  }
}

/**
 * Réécrit la requête avec les réglages demandés, sans toucher à ce qui ne
 * change pas (un `es` court reste tel quel si la présentation ne change pas).
 */
export function applySettings(query: string, settings: LinkSettings): string {
  const before = readSettings(query)
  const parsed = parseQuery(query)
  setGlobal(parsed, 'v', settings.view === '' ? null : settings.view)

  const isEsView = ES_VIEWS.has(settings.view)
  const isInteractivityChanged =
    settings.interactivity !== before.interactivity ||
    settings.view !== before.view
  if (settings.interactivity !== 'mixte' && isInteractivityChanged) {
    const isAll = settings.interactivity === 'tous'
    parsed.exercises = parsed.exercises.map((exercise) => [
      ...exercise.filter(([key]) => key !== 'i'),
      ...(isAll ? ([['i', '1']] as Entry[]) : []),
    ])
    setGlobal(parsed, 'numerique', null)
    if (settings.view === 'can') setGlobal(parsed, 'canI', isAll ? '1' : '0')
  }

  if (isEsView) {
    const current = getGlobal(parsed, 'es') ?? ''
    const interactivityCode =
      settings.interactivity === 'tous'
        ? '1'
        : settings.interactivity === 'aucun'
          ? '0'
          : '2'
    // sans `es`, l'interactivité reste portée par les `i` des exercices
    const isInteractivityKept =
      current.length >= 6
        ? current.charAt(1) === interactivityCode
        : !isInteractivityChanged
    const isEsUnchanged =
      isInteractivityKept &&
      before.presMode === settings.presMode &&
      before.isSolutionAccessible === settings.isSolutionAccessible &&
      before.isInteractiveFree === settings.isInteractiveFree &&
      before.oneShot === settings.oneShot
    if (!isEsUnchanged) {
      const chars = (current.length >= 6 ? current : DEFAULT_ES)
        .padEnd(DEFAULT_ES.length, ' ')
        .split('')
        .map((char, i) => (char === ' ' ? DEFAULT_ES.charAt(i) : char))
      chars[0] = PRES_MODE_CODES[settings.presMode]
      chars[1] = interactivityCode
      chars[2] = settings.isSolutionAccessible ? '1' : '0'
      chars[3] = settings.isInteractiveFree ? '1' : '0'
      chars[4] = settings.oneShot ? '1' : '0'
      setGlobal(parsed, 'es', chars.join(''))
    }
    const title = settings.title.trim()
    if (title !== before.title) {
      // même double encodage que `buildMathAleaURL`, relu par `decodeURIComponent`
      setGlobal(
        parsed,
        'title',
        title === '' ? null : encodeURIComponent(title),
      )
    }
  }
  return buildQuery(parsed)
}

/** Requête limitée aux réglages de sa vue, comme l'écrit l'application */
function queryForView(parsed: ParsedQuery): ParsedQuery {
  const view = getGlobal(parsed, 'v') ?? ''
  const unused = [
    ...(ES_VIEWS.has(view) ? ['numerique'] : ES_PARAMS),
    ...(DIAPORAMA_VIEWS.has(view) ? [] : DIAPORAMA_PARAMS),
    ...(view === 'can' ? [] : CAN_PARAMS),
  ]
  return withoutGlobals(parsed, unused)
}

/** Vues proposées en accès direct depuis une sélection, quelle que soit sa vue */
export const QUICK_VIEWS = [
  { value: 'diaporama', label: 'Diaporama', icon: 'bx-slideshow' },
  { value: 'tbi', label: 'Vidéoprojection', icon: 'bx-chalkboard' },
  { value: 'typst', label: 'Imprimer', icon: 'bx-printer' },
] as const

/**
 * URL qui ouvre la sélection sur le site courant.
 * @param base adresse de la page de l'application (origine et chemin)
 * @param view autre vue que celle de la sélection (diaporama, impression…)
 */
export function selectionUrl(
  selection: SavedSelection,
  base: string,
  view?: string,
): string {
  if (selection.externalUrl !== undefined)
    return readWebUrl(selection.externalUrl).href
  const source = parseQuery(selection.query)
  if (view !== undefined) setGlobal(source, 'v', view === '' ? null : view)
  const parsed = queryForView(source)
  if (selection.newDataEachTime) {
    parsed.exercises = parsed.exercises.map((exercise) =>
      exercise.filter(([key]) => key !== 'alea'),
    )
  }
  return urlFromQuery(buildQuery(parsed), base)
}

/**
 * URL qui ouvre les exercices de la sélection dans la conception de document
 * (mêmes graines), pour les modifier puis mettre la sélection à jour
 */
export function editExercisesUrl(
  selection: SavedSelection,
  base: string,
): string {
  const parsed = parseQuery(selection.query)
  setGlobal(parsed, 'v', null)
  return urlFromQuery(buildQuery(queryForView(parsed)), base)
}

function urlFromQuery(query: string, base: string): string {
  const url = new URL(base)
  const hashIndex = query.indexOf('#')
  url.search = hashIndex < 0 ? query : query.slice(0, hashIndex)
  url.hash = hashIndex < 0 ? '' : query.slice(hashIndex)
  return url.href
}

/**
 * Remplace les exercices d'une sélection par ceux d'un nouveau lien, en
 * gardant les réglages de la sélection (vue, présentation, titre…)
 */
export function replaceExercises(
  query: string,
  content: LinkContent,
): LinkContent {
  const parsed = parseQuery(query)
  const next = parseQuery(content.query)
  const merged = buildQuery({ ...parsed, exercises: next.exercises })
  // l'interactivité choisie pour tous les exercices vaut aussi pour les nouveaux
  const settings = readSettings(query)
  const result =
    settings.interactivity === 'mixte'
      ? merged
      : applySettings(merged, settings)
  return { query: result, exercises: exerciseRefs(next) }
}

/** Vue d'ouverture d'une sélection (paramètre `v`, vide : conception) */
export function selectionView(selection: SavedSelection): string {
  return selection.externalUrl !== undefined
    ? 'external'
    : (getGlobal(parseQuery(selection.query), 'v') ?? '')
}

/** Rang d'une vue pour le tri par vue : celles de `SELECTION_VIEWS`, puis les autres */
export function viewRank(view: string): number {
  const index = SELECTION_VIEWS.findIndex((v) => v.value === view)
  return index < 0 ? SELECTION_VIEWS.length : index
}

/** Libellé de la vue d'une sélection */
export function viewLabel(view: string): { label: string; icon: string } {
  if (view === 'external') return { label: 'Lien web', icon: 'bx-link' }
  return (
    SELECTION_VIEWS.find((v) => v.value === view) ?? {
      label: `Vue « ${view} »`,
      icon: 'bx-window',
    }
  )
}

/** Résumé des réglages, pour la liste des sélections */
export function describeSettings(settings: LinkSettings): string[] {
  const parts: string[] = [viewLabel(settings.view).label]
  if (ES_VIEWS.has(settings.view)) {
    parts.push(
      PRES_MODES.find((m) => m.value === settings.presMode)?.label ??
        settings.presMode,
    )
  }
  if (!isInteractiveView(settings.view)) return parts
  if (settings.interactivity === 'tous') parts.push('tout interactif')
  else if (settings.interactivity === 'aucun') parts.push('sans interactivité')
  else parts.push('interactivité au choix de chaque exercice')
  if (ES_VIEWS.has(settings.view)) {
    if (settings.isSolutionAccessible) parts.push('correction disponible')
    if (settings.oneShot) parts.push('une seule réponse')
  }
  return parts
}

/** Nom proposé pour une nouvelle sélection : titre, sinon références des exercices */
export function defaultSelectionName(content: LinkContent): string {
  if (content.externalUrl !== undefined)
    return new URL(content.externalUrl).hostname
  const title = readSettings(content.query).title.trim()
  if (title !== '') return title
  const refs = content.exercises.filter((ref) => ref !== '')
  if (refs.length === 0) return 'Sélection'
  return refs.length > 4 ? `${refs.slice(0, 4).join(', ')}…` : refs.join(', ')
}
