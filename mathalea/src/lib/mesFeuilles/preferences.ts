import type { TypstDocumentOptions } from '../../components/setup/typst/buildTypstDocument'
import type { CanOptions } from '../types/can'
import { byName, cleanName, newId } from './library'
import { notifyContentChange } from './storage'
import {
  latest,
  readTombstones,
  recordRemovals,
  type Candidate,
  type Tombstone,
} from './tombstones'

/**
 * Réglages de « Mes sauvegardes » : réglages du lien pour les élèves et
 * modèles de document de la vue Impression (Typst).
 *
 * Gardés dans `localStorage`, lisible sans attendre : la vue Impression
 * applique le modèle par défaut avant sa première compilation. Ils font
 * partie du fichier `.mathalea` (voir `libraryFile.ts`).
 */

export const PREFERENCES_KEY = 'mathalea-mes-reglages'

// ---------- Lien pour les élèves ----------

/**
 * Réglages de la page « Lien pour les élèves » repris d'une fiche à l'autre.
 * Pas l'interactivité (`setInteractive`) : elle suit le choix « Papier » ou
 * « Numérique » de la conception de document.
 */
const STUDENT_GLOBAL_OPTIONS = {
  presMode: [
    'liste_exos',
    'un_exo_par_page',
    'une_question_par_page',
    'recto',
    'verso',
  ],
  calculatricesForcees: ['-', '0', '1', '2', '3', '9'],
  isSolutionAccessible: 'boolean',
  isCorrectionOnlyOnError: 'boolean',
  isCheckPerQuestion: 'boolean',
  isTitleDisplayed: 'boolean',
  isReferenceDisplayed: 'boolean',
  isInteractiveFree: 'boolean',
  oneShot: 'boolean',
  twoColumns: 'boolean',
} as const

/**
 * Réglages de la Course aux nombres repris d'une fiche à l'autre. Ni l'onglet
 * choisi, ni la durée totale, ni le titre : ils dépendent de la fiche.
 */
const STUDENT_CAN_OPTIONS = {
  timerMode: ['global', 'question'],
  durationPerQuestionInSeconds: 'number',
  feedbackMode: ['end', 'each'],
  solutionsAccess: 'boolean',
  solutionsMode: ['gathered', 'split'],
  isInteractive: 'boolean',
  isTimerDisabled: 'boolean',
} as const

export type StudentGlobalOptions = {
  -readonly [
    K in keyof typeof STUDENT_GLOBAL_OPTIONS
  ]?: (typeof STUDENT_GLOBAL_OPTIONS)[K] extends 'boolean'
    ? boolean
    : (typeof STUDENT_GLOBAL_OPTIONS)[K][number]
}

export type StudentCanOptions = Partial<
  Pick<CanOptions, keyof typeof STUDENT_CAN_OPTIONS>
>

export const LINK_FORMATS = ['clear', 'crypt', 'short'] as const
export type LinkFormat = (typeof LINK_FORMATS)[number]

export interface StudentLinkPreferences {
  globalOptions: StudentGlobalOptions
  canOptions: StudentCanOptions
  /** Nouvelles données à chaque chargement */
  isDataRandom: boolean
  linkFormat: LinkFormat
  updatedAt: string
}

type Spec = Record<string, 'boolean' | 'number' | readonly string[]>

/** Garde les réglages connus dont la valeur a le bon type */
function pickOptions(source: unknown, spec: Spec): Record<string, unknown> {
  const picked: Record<string, unknown> = {}
  if (!isRecord(source)) return picked
  for (const [key, kind] of Object.entries(spec)) {
    const value = source[key]
    const valid =
      kind === 'boolean'
        ? typeof value === 'boolean'
        : kind === 'number'
          ? typeof value === 'number' && Number.isFinite(value) && value > 0
          : typeof value === 'string' && kind.includes(value)
    if (valid) picked[key] = value
  }
  return picked
}

/** Réglages du lien élève à partir de l'état de la page */
export function studentLinkPreferences(
  globalOptions: object,
  canOptions: object,
  isDataRandom: boolean,
  linkFormat: LinkFormat,
  now: string = new Date().toISOString(),
): StudentLinkPreferences {
  return {
    globalOptions: pickOptions(
      globalOptions,
      STUDENT_GLOBAL_OPTIONS,
    ) as StudentGlobalOptions,
    canOptions: pickOptions(
      canOptions,
      STUDENT_CAN_OPTIONS,
    ) as StudentCanOptions,
    isDataRandom,
    linkFormat,
    updatedAt: now,
  }
}

/** Les mêmes réglages, sans tenir compte de la date */
export function sameStudentLink(
  a: StudentLinkPreferences | null,
  b: StudentLinkPreferences | null,
): boolean {
  if (a === null || b === null) return a === b
  return (
    stableStringify({ ...a, updatedAt: '' }) ===
    stableStringify({ ...b, updatedAt: '' })
  )
}

function readStudentLink(value: unknown): StudentLinkPreferences | null {
  if (!isRecord(value)) return null
  return {
    globalOptions: pickOptions(
      value.globalOptions,
      STUDENT_GLOBAL_OPTIONS,
    ) as StudentGlobalOptions,
    canOptions: pickOptions(
      value.canOptions,
      STUDENT_CAN_OPTIONS,
    ) as StudentCanOptions,
    isDataRandom: value.isDataRandom === true,
    linkFormat: LINK_FORMATS.includes(value.linkFormat as LinkFormat)
      ? (value.linkFormat as LinkFormat)
      : 'clear',
    updatedAt: readDate(value.updatedAt),
  }
}

// ---------- Modèles de document (vue Impression) ----------

/**
 * Réglages propres à une fiche, jamais repris d'un modèle : le titre, les
 * graines épinglées des sujets et la présentation « Course aux nombres »
 * (détectée d'après les exercices).
 */
const SHEET_SPECIFIC_OPTIONS = [
  'title',
  'subtitle',
  'versionSeeds',
  'canMode',
] as const

export type TypstModelOptions = Partial<
  Omit<TypstDocumentOptions, (typeof SHEET_SPECIFIC_OPTIONS)[number]>
>

export interface TypstModel {
  id: string
  name: string
  options: TypstModelOptions
  createdAt: string
  updatedAt: string
}

/**
 * Réglages d'un document qui vont dans un modèle : tous, sauf ceux de la
 * fiche (`SHEET_SPECIFIC_OPTIONS`) et le barème de la page de garde, qui
 * dépend des exercices.
 */
export function typstModelOptions(options: object): TypstModelOptions {
  const copy: Record<string, unknown> = JSON.parse(JSON.stringify(options))
  for (const key of SHEET_SPECIFIC_OPTIONS) delete copy[key]
  if (isRecord(copy.coverPage)) delete copy.coverPage.bareme
  return copy as TypstModelOptions
}

/**
 * Applique les réglages d'un modèle à ceux d'un document : les réglages de la
 * fiche restent, le barème de la page de garde aussi.
 */
export function applyTypstModel<T extends TypstDocumentOptions>(
  options: T,
  model: object,
): T {
  const modelOptions = typstModelOptions(model)
  const cover = isRecord(modelOptions.coverPage)
    ? { ...options.coverPage, ...modelOptions.coverPage }
    : options.coverPage
  return { ...options, ...modelOptions, coverPage: cover }
}

/** Le document a les réglages du modèle */
export function matchesTypstModel(options: object, model: TypstModel): boolean {
  return (
    stableStringify(typstModelOptions(options)) ===
    stableStringify(typstModelOptions(model.options))
  )
}

const HEADER_STYLE_SUMMARIES: Record<string, string> = {
  epure: 'en-tête épuré',
  cartouche: 'en-tête cartouche',
  cadre: 'en-tête encadré',
  aucun: 'sans en-tête',
}

/** Résumé en une ligne des réglages les plus visibles d'un modèle */
export function describeTypstModel(model: TypstModel): string {
  const o: Partial<TypstDocumentOptions> = model.options
  const parts: string[] = []
  if (typeof o.font === 'string') {
    parts.push(
      typeof o.fontSize === 'number' ? `${o.font} ${o.fontSize} pt` : o.font,
    )
  } else if (typeof o.fontSize === 'number') {
    parts.push(`${o.fontSize} pt`)
  }
  if (typeof o.columns === 'number') {
    parts.push(`${o.columns} colonne${o.columns > 1 ? 's' : ''}`)
  }
  if (o.pageFormat === 'a4' || o.pageFormat === 'a5') {
    parts.push(
      `${o.pageFormat.toUpperCase()}${o.orientation === 'landscape' ? ' paysage' : ''}`,
    )
  }
  if (typeof o.headerStyle === 'string') {
    parts.push(HEADER_STYLE_SUMMARIES[o.headerStyle] ?? o.headerStyle)
  }
  if (
    typeof o.coverPage?.template === 'string' &&
    o.coverPage.template !== 'aucune'
  ) {
    parts.push('page de garde')
  }
  if (o.showCorrections === false) parts.push('sans correction')
  return parts.join(' · ')
}

function readTypstModel(value: unknown): TypstModel | null {
  if (!isRecord(value) || typeof value.id !== 'string' || value.id === '') {
    return null
  }
  if (!isRecord(value.options)) return null
  return {
    id: value.id,
    name: cleanName(typeof value.name === 'string' ? value.name : '', 'Modèle'),
    // les valeurs sont revérifiées par la vue Impression quand elle les applique
    options: typstModelOptions(value.options),
    createdAt: readDate(value.createdAt),
    updatedAt: readDate(value.updatedAt),
  }
}

// ---------- L'ensemble des réglages ----------

export interface Preferences {
  studentLink: StudentLinkPreferences | null
  typstModels: TypstModel[]
  /** Modèle appliqué aux nouvelles fiches de la vue Impression */
  defaultTypstModel: { id: string | null; updatedAt: string }
  /** Pierres tombales des modèles supprimés (voir `tombstones.ts`) */
  deleted: Tombstone[]
}

export function emptyPreferences(): Preferences {
  return {
    studentLink: null,
    typstModels: [],
    defaultTypstModel: { id: null, updatedAt: new Date(0).toISOString() },
    deleted: [],
  }
}

/** Réglages lus dans `localStorage` ou dans un fichier, revérifiés */
export function readPreferences(value: unknown): Preferences {
  const empty = emptyPreferences()
  if (!isRecord(value)) return empty
  const typstModels = (
    Array.isArray(value.typstModels) ? value.typstModels : []
  )
    .map(readTypstModel)
    .filter((model): model is TypstModel => model !== null)
  const def = isRecord(value.defaultTypstModel) ? value.defaultTypstModel : {}
  const defaultId = typeof def.id === 'string' ? def.id : null
  const ids = new Set(typstModels.map((m) => m.id))
  return {
    studentLink: readStudentLink(value.studentLink),
    typstModels,
    defaultTypstModel: {
      id: defaultId !== null && ids.has(defaultId) ? defaultId : null,
      updatedAt: readDate(def.updatedAt),
    },
    deleted: readTombstones(value.deleted).filter((t) => !ids.has(t.id)),
  }
}

export function hasPreferences(preferences: Preferences): boolean {
  return preferences.studentLink !== null || preferences.typstModels.length > 0
}

export function defaultTypstModel(preferences: Preferences): TypstModel | null {
  const id = preferences.defaultTypstModel.id
  return preferences.typstModels.find((model) => model.id === id) ?? null
}

export function sortedTypstModels(preferences: Preferences): TypstModel[] {
  return [...preferences.typstModels].sort(byName)
}

export function addTypstModel(
  preferences: Preferences,
  name: string,
  options: object,
  now: string = new Date().toISOString(),
): { preferences: Preferences; model: TypstModel } {
  const model: TypstModel = {
    id: newId(),
    name: cleanName(name, 'Modèle'),
    options: typstModelOptions(options),
    createdAt: now,
    updatedAt: now,
  }
  return {
    preferences: {
      ...preferences,
      typstModels: [...preferences.typstModels, model],
    },
    model,
  }
}

function changeTypstModel(
  preferences: Preferences,
  id: string,
  change: (model: TypstModel) => TypstModel,
): Preferences {
  return {
    ...preferences,
    typstModels: preferences.typstModels.map((model) =>
      model.id === id ? change(model) : model,
    ),
  }
}

/** Remplace les réglages du modèle par ceux du document */
export function updateTypstModel(
  preferences: Preferences,
  id: string,
  options: object,
  now: string = new Date().toISOString(),
): Preferences {
  return changeTypstModel(preferences, id, (model) => ({
    ...model,
    options: typstModelOptions(options),
    updatedAt: now,
  }))
}

/**
 * Modifie quelques réglages du modèle ; les autres restent ce qu'ils étaient.
 * @param changes réglages à écrire (une valeur `undefined` retire le réglage)
 */
export function patchTypstModel(
  preferences: Preferences,
  id: string,
  changes: TypstModelOptions,
  now: string = new Date().toISOString(),
): Preferences {
  return changeTypstModel(preferences, id, (model) => {
    const options: Record<string, unknown> = { ...model.options, ...changes }
    for (const key of Object.keys(options)) {
      if (options[key] === undefined) delete options[key]
    }
    return { ...model, options: typstModelOptions(options), updatedAt: now }
  })
}

/** Copie du modèle, sous un autre nom (jamais le modèle par défaut) */
export function duplicateTypstModel(
  preferences: Preferences,
  id: string,
  now: string = new Date().toISOString(),
): { preferences: Preferences; model: TypstModel | null } {
  const original = preferences.typstModels.find((model) => model.id === id)
  if (original === undefined) return { preferences, model: null }
  const model: TypstModel = {
    ...original,
    id: newId(),
    name: cleanName(`${original.name} (copie)`, original.name),
    options: typstModelOptions(original.options),
    createdAt: now,
    updatedAt: now,
  }
  return {
    preferences: {
      ...preferences,
      typstModels: [...preferences.typstModels, model],
    },
    model,
  }
}

export function renameTypstModel(
  preferences: Preferences,
  id: string,
  name: string,
  now: string = new Date().toISOString(),
): Preferences {
  return changeTypstModel(preferences, id, (model) => ({
    ...model,
    name: cleanName(name, model.name),
    updatedAt: now,
  }))
}

export function deleteTypstModel(
  preferences: Preferences,
  id: string,
  now: string = new Date().toISOString(),
): Preferences {
  return {
    ...preferences,
    typstModels: preferences.typstModels.filter((model) => model.id !== id),
    defaultTypstModel:
      preferences.defaultTypstModel.id === id
        ? { id: null, updatedAt: now }
        : preferences.defaultTypstModel,
  }
}

/** Modèle des nouvelles fiches (`null` : réglages d'origine de MathALÉA) */
export function setDefaultTypstModel(
  preferences: Preferences,
  id: string | null,
  now: string = new Date().toISOString(),
): Preferences {
  return { ...preferences, defaultTypstModel: { id, updatedAt: now } }
}

export interface PreferencesMergeResult {
  preferences: Preferences
  /** Réglages ajoutés, remplacés ou supprimés (modèles, lien élève, modèle par défaut) */
  imported: number
}

/** Comment fusionner deux versions des réglages */
export interface MergeOptions {
  /**
   * Synchronisation entre appareils : les suppressions de l'autre version
   * s'appliquent (pierres tombales). Sinon (import d'un fichier), rien n'est
   * effacé et un élément supprimé ici revient, avec la date de l'import.
   */
  sync?: boolean
  /** Date de l'import */
  now?: string
}

/**
 * Fusionne les modèles de document. Import : un modèle inconnu est ajouté,
 * un modèle connu n'est remplacé que par une version plus récente.
 * Synchronisation : pour chaque modèle, la modification ou la suppression la
 * plus récente l'emporte.
 */
function mergeTypstModels(
  local: Preferences,
  imported: Preferences,
  { sync = false, now = new Date().toISOString() }: MergeOptions,
): { typstModels: TypstModel[]; deleted: Tombstone[]; count: number } {
  let count = 0
  if (!sync) {
    const removed = new Set(local.deleted.map((t) => t.id))
    const byId = new Map(local.typstModels.map((model) => [model.id, model]))
    for (const model of imported.typstModels) {
      const existing = byId.get(model.id)
      if (existing !== undefined && model.updatedAt <= existing.updatedAt) {
        continue
      }
      byId.set(
        model.id,
        removed.has(model.id) ? { ...model, updatedAt: now } : model,
      )
      count++
    }
    return {
      typstModels: [...byId.values()],
      deleted: local.deleted.filter((t) => !byId.has(t.id)),
      count,
    }
  }
  const winners = new Map<string, Candidate<TypstModel | Tombstone>>()
  const consider = (version: Candidate<TypstModel | Tombstone>) => {
    const current = winners.get(version.value.id)
    winners.set(
      version.value.id,
      current === undefined ? version : latest(current, version),
    )
  }
  for (const prefs of [local, imported]) {
    for (const model of prefs.typstModels) {
      consider({ time: model.updatedAt, rank: 0, value: model })
    }
    for (const tombstone of prefs.deleted) {
      consider({ time: tombstone.deletedAt, rank: 1, value: tombstone })
    }
  }
  const localModels = new Map(local.typstModels.map((m) => [m.id, m]))
  const typstModels: TypstModel[] = []
  const deleted: Tombstone[] = []
  for (const { rank, value } of winners.values()) {
    const localModel = localModels.get(value.id)
    if (rank === 0) {
      typstModels.push(value as TypstModel)
      if (localModel !== value) count++
    } else {
      deleted.push(value as Tombstone)
      if (localModel !== undefined) count++
    }
  }
  return { typstModels, deleted, count }
}

/**
 * Fusionne des réglages importés ou synchronisés : modèles (voir
 * `mergeTypstModels`) ; les réglages du lien élève et le choix du modèle par
 * défaut ne sont remplacés que par une version plus récente.
 */
export function mergePreferences(
  local: Preferences,
  imported: Preferences,
  options: MergeOptions = {},
): PreferencesMergeResult {
  const models = mergeTypstModels(local, imported, options)
  let count = models.count
  const typstModels = models.typstModels
  let studentLink = local.studentLink
  if (
    imported.studentLink !== null &&
    (studentLink === null ||
      (imported.studentLink.updatedAt > studentLink.updatedAt &&
        !sameStudentLink(imported.studentLink, studentLink)))
  ) {
    studentLink = imported.studentLink
    count++
  }
  let defaultModel = local.defaultTypstModel
  const importedDefault = imported.defaultTypstModel
  if (
    importedDefault.updatedAt > defaultModel.updatedAt &&
    importedDefault.id !== defaultModel.id
  ) {
    defaultModel = importedDefault
    count++
  }
  if (
    defaultModel.id !== null &&
    !typstModels.some((model) => model.id === defaultModel.id)
  ) {
    defaultModel = { ...defaultModel, id: null }
  }
  return {
    preferences: {
      studentLink,
      typstModels,
      defaultTypstModel: defaultModel,
      deleted: models.deleted,
    },
    imported: count,
  }
}

// ---------- Stockage ----------

export function loadPreferences(): Preferences {
  try {
    const raw = window.localStorage.getItem(PREFERENCES_KEY)
    return raw == null ? emptyPreferences() : readPreferences(JSON.parse(raw))
  } catch {
    return emptyPreferences()
  }
}

/**
 * Modifie les réglages à partir de leur dernière version enregistrée et
 * prévient « Mes sauvegardes » (sauvegarde automatique, autres onglets). Un
 * modèle qui disparaît laisse une pierre tombale.
 * @returns les réglages enregistrés (inchangés si le stockage est indisponible)
 */
export function updatePreferences(
  change: (preferences: Preferences) => Preferences,
): Preferences {
  const previous = loadPreferences()
  const changed = change(previous)
  const next: Preferences = {
    ...changed,
    deleted: recordRemovals(
      changed.deleted ?? [],
      previous.typstModels.map((model) => model.id),
      new Set(changed.typstModels.map((model) => model.id)),
      new Date().toISOString(),
    ),
  }
  try {
    window.localStorage.setItem(PREFERENCES_KEY, JSON.stringify(next))
    notifyContentChange()
  } catch {
    return loadPreferences()
  }
  return next
}

// ---------- Outils ----------

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readDate(value: unknown): string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value))
    ? value
    : new Date(0).toISOString()
}

/** JSON aux clés triées : deux objets égaux donnent la même chaîne */
export function stableStringify(value: unknown): string {
  return JSON.stringify(value, (_key, inner: unknown) =>
    isRecord(inner)
      ? Object.fromEntries(
          Object.keys(inner)
            .sort()
            .map((key) => [key, inner[key]]),
        )
      : inner,
  )
}
