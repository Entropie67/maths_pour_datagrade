import type { OmrSavedState } from '../omr/omrSavedState'
/**
 * « Mes sauvegardes » : bibliothèque personnelle de l'enseignant, en trois
 * arborescences séparées par défaut, ou dans des dossiers communs au choix.
 *
 * - « Mes feuilles » : les fiches de la vue Impression (Typst) et de la vue
 *   LaTeX (`v=tex`). Une feuille n'est pas un PDF figé : c'est l'état MathALÉA
 *   qui la régénère (requête de l'URL de la vue, avec graines, réglages et
 *   `typstParam` ou `texParam`). La stabilité des graines des exercices
 *   publiés garantit que la feuille rouverte est identique. Seul l'aperçu
 *   (SVG compilé, ou pages du PDF pour LaTeX) est gardé à part, pour les
 *   vignettes (voir `storage.ts`).
 * - « Mes sélections » : des liens MathALÉA (exercices et réglages d'une vue),
 *   avec un commentaire et de 0 à 3 étoiles (voir `selectionLink.ts`).
 * - « Mes séances au vidéoprojecteur » : l'état complet de la vue TBI
 *   (exercices, graines, dispositions, widgets), le fichier de réglages de la
 *   vue (voir `sessionLink.ts`).
 *
 * Toutes les fonctions de ce module sont pures : elles renvoient une nouvelle
 * bibliothèque sans modifier celle reçue.
 */

import { recordRemovals, type Tombstone } from './tombstones'

export interface SheetFolder {
  id: string
  name: string
  /** Dossier parent, `null` à la racine */
  parentId: string | null
  createdAt: string
  updatedAt: string
}

export interface SavedSheet {
  id: string
  name: string
  /** Dossier qui contient la feuille, `null` à la racine */
  folderId: string | null
  /**
   * Requête et fragment de l'URL de la vue Impression ou LaTeX
   * (`?uuid=…&v=typst…`, `?uuid=…&v=tex…`), sans l'origine : la feuille se
   * rouvre sur le site qui l'affiche (coopmaths.fr, miroir, développement
   * local).
   */
  query: string
  /** Références des exercices, pour l'affichage et la recherche */
  exercises: string[]
  /**
   * Code LaTeX retouché à la main (feuille LaTeX seulement) : la requête ne
   * régénère que le code d'origine. Absent si le code n'a pas été modifié.
   */
  code?: string
  /** Sujet, scan et correction de la vue Évaluation avec scan. */
  omr?: OmrSavedState
  createdAt: string
  updatedAt: string
}

/** Vue qui produit une feuille */
export type SheetKind = 'typst' | 'tex' | 'omr'

export const SHEET_KIND_LABELS: Record<SheetKind, string> = {
  typst: 'Impression',
  tex: 'LaTeX',
  omr: 'Évaluation avec scan',
}

/** Longueur maximale du code LaTeX retouché gardé avec une feuille */
export const SHEET_CODE_MAX_LENGTH = 500_000

/** Nombre d'étoiles d'une sélection */
export type Stars = 0 | 1 | 2 | 3

/** Lien raccourci edurl.fr d'une sélection */
export interface SelectionShortLink {
  /** Adresse courte (`https://edurl.fr/…`) */
  url: string
  /**
   * Adresse vers laquelle le lien court menait à sa création ou à sa dernière
   * mise à jour : si la sélection change, le lien est périmé.
   */
  longUrl: string
}

export interface SavedSelection {
  /** URL complète pour un lien web extérieur à MathALÉA. */
  externalUrl?: string
  id: string
  name: string
  /** Dossier de « Mes sélections » qui contient la sélection, `null` à la racine */
  folderId: string | null
  /**
   * Requête de l'URL MathALÉA (`?uuid=…&v=eleve&es=…`), sans l'origine, avec
   * les graines : la sélection se rouvre sur le site qui l'affiche.
   */
  query: string
  /** Références des exercices, pour l'affichage et la recherche */
  exercises: string[]
  stars: Stars
  /** Commentaire libre de l'enseignant (texte brut) */
  comment: string
  /** Nouveaux énoncés à chaque ouverture : les graines sont retirées du lien */
  newDataEachTime: boolean
  /** Lien raccourci créé depuis « Mes sélections » (voir `ShortLinkDialog`) */
  shortLink?: SelectionShortLink
  createdAt: string
  updatedAt: string
}

/** Valeur du champ `type` d'un fichier de réglages de la vue TBI */
export const SESSION_STATE_TYPE = 'mathalea-tbi'

/**
 * État de la vue TBI d'une séance : le fichier de réglages de la vue
 * (`TbiSettingsFile` de `tbiStore.ts`, `type: 'mathalea-tbi'`), gardé tel
 * quel. Il porte la liste des exercices avec leurs graines (`exercices`) et
 * tous les réglages d'affichage ; la vue TBI seule sait l'interpréter.
 */
export type SessionState = { type: typeof SESSION_STATE_TYPE } & Record<
  string,
  unknown
>

export interface SavedSession {
  id: string
  name: string
  /** Dossier de « Mes séances » qui contient la séance, `null` à la racine */
  folderId: string | null
  /** État de la vue TBI : exercices (graines comprises) et réglages d'affichage */
  state: SessionState
  /** Références des exercices, pour l'affichage et la recherche */
  exercises: string[]
  createdAt: string
  updatedAt: string
}

/** Ensemble de dossiers d'une arborescence */
export interface FolderSet {
  folders: SheetFolder[]
}

/** Feuille, sélection ou séance supprimée, gardée dans la corbeille */
export type TrashedItem = (
  | { kind: 'sheet'; item: SavedSheet }
  | { kind: 'selection'; item: SavedSelection }
  | { kind: 'session'; item: SavedSession }
) & {
  deletedAt: string
  /** Noms des dossiers qui la contenaient, pour la remettre au même endroit */
  location: string[]
}

export interface LibraryOrganization {
  merged: boolean
  updatedAt: string
}

export interface SheetLibrary {
  /** Organisation choisie ; absente dans les anciennes sauvegardes. */
  organization?: LibraryOrganization
  /** Dossiers de « Mes feuilles » */
  folders: SheetFolder[]
  sheets: SavedSheet[]
  /** Dossiers de « Mes sélections », indépendants de ceux des feuilles */
  selectionFolders: SheetFolder[]
  selections: SavedSelection[]
  /** Dossiers de « Mes séances », indépendants de ceux des feuilles et des sélections */
  sessionFolders: SheetFolder[]
  sessions: SavedSession[]
  /** Corbeille : vidée des éléments supprimés depuis plus de `TRASH_DAYS` jours */
  trash: TrashedItem[]
  /**
   * Pierres tombales des dossiers, feuilles, sélections et séances supprimés
   * définitivement, pour la synchronisation (voir `tombstones.ts`)
   */
  deleted: Tombstone[]
}

/** Arborescence de « Mes sauvegardes » */
export type Space = 'feuilles' | 'selections' | 'seances'

export const SPACE_LABELS: Record<Space, string> = {
  feuilles: 'Mes feuilles',
  selections: 'Mes sélections',
  seances: 'Mes séances au vidéoprojecteur',
}

/** Aperçu compilé d'une feuille, gardé à part de la bibliothèque */
export interface SheetPreview {
  /** SVG de toutes les pages, sans script */
  svg: string
  /** Dimensions de la première page (unités du SVG), pour la vignette */
  pageWidth: number
  pageHeight: number
  pageCount: number
}

export function emptyLibrary(): SheetLibrary {
  return {
    folders: [],
    sheets: [],
    selectionFolders: [],
    selections: [],
    sessionFolders: [],
    sessions: [],
    trash: [],
    deleted: [],
  }
}

/** Champ de la bibliothèque qui porte les dossiers de chaque arborescence */
const FOLDERS_KEY = {
  feuilles: 'folders',
  selections: 'selectionFolders',
  seances: 'sessionFolders',
} as const satisfies Record<Space, keyof SheetLibrary>

/** Dossiers d'une arborescence, sous la forme attendue par les fonctions des dossiers */
export function foldersOf(library: SheetLibrary, space: Space): FolderSet {
  return { folders: library[FOLDERS_KEY[space]] }
}

/**
 * Applique à une arborescence une opération sur ses dossiers.
 * @param change opération (`createFolder`, `moveFolder`…) sur les dossiers seuls
 */
export function changeFolders(
  library: SheetLibrary,
  space: Space,
  change: (set: FolderSet) => FolderSet,
): SheetLibrary {
  const { folders } = change(foldersOf(library, space))
  if (library.organization?.merged)
    return {
      ...library,
      folders,
      selectionFolders: folders,
      sessionFolders: folders,
    }
  return { ...library, [FOLDERS_KEY[space]]: folders }
}

/**
 * Réunit les dossiers sans modifier les contenus ni leurs identifiants.
 * Au retour au mode séparé, chaque espace garde une copie du classement.
 */
export function setLibraryOrganization(
  library: SheetLibrary,
  merged: boolean,
  date: string = now(),
): SheetLibrary {
  if (!!library.organization?.merged === merged) {
    return merged ? mergeSharedFolderNames(library, date) : library
  }
  if (merged) {
    const folders = sharedFolders(library)
    return mergeSharedFolderNames(
      {
        ...library,
        folders,
        selectionFolders: folders,
        sessionFolders: folders,
        organization: { merged, updatedAt: date },
      },
      date,
    )
  }
  // Les dossiers redeviennent indépendants, avec des identifiants distincts.
  const ids = new Map(library.selectionFolders.map((f) => [f.id, newId()]))
  const sessionIds = new Map(library.sessionFolders.map((f) => [f.id, newId()]))
  return {
    ...library,
    organization: { merged, updatedAt: date },
    sessionFolders: library.sessionFolders.map((f) => ({
      ...f,
      id: sessionIds.get(f.id)!,
      parentId:
        f.parentId === null ? null : (sessionIds.get(f.parentId) ?? null),
      updatedAt: date,
    })),
    sessions: library.sessions.map((s) =>
      s.folderId === null
        ? s
        : {
            ...s,
            folderId: sessionIds.get(s.folderId) ?? null,
            updatedAt: date,
          },
    ),
    selectionFolders: library.selectionFolders.map((f) => ({
      ...f,
      id: ids.get(f.id)!,
      parentId: f.parentId === null ? null : (ids.get(f.parentId) ?? null),
      updatedAt: date,
    })),
    selections: library.selections.map((s) =>
      s.folderId === null
        ? s
        : {
            ...s,
            folderId: ids.get(s.folderId) ?? null,
            updatedAt: date,
          },
    ),
  }
}

/** Union des deux arbres ; la version la plus récente d'un dossier l'emporte. */
export function sharedFolders(
  library: Pick<
    SheetLibrary,
    'folders' | 'selectionFolders' | 'sessionFolders'
  >,
): SheetFolder[] {
  const folders = new Map<string, SheetFolder>()
  for (const folder of [
    ...library.folders,
    ...library.selectionFolders,
    ...library.sessionFolders,
  ]) {
    const previous = folders.get(folder.id)
    if (!previous || folder.updatedAt > previous.updatedAt)
      folders.set(folder.id, folder)
  }
  return [...folders.values()]
}

/** Fusionne les dossiers homonymes de même parent, puis leurs descendants. */
export function mergeSharedFolderNames(
  library: SheetLibrary,
  date: string,
): SheetLibrary {
  // Le choix de l'identifiant est stable, quel que soit l'ordre des appareils.
  const pending = sharedFolders(library).sort((a, b) =>
    a.id.localeCompare(b.id),
  )
  const ids = new Map<string, string>()
  const names = new Map<string, SheetFolder>()
  const folders: SheetFolder[] = []
  while (pending.length > 0) {
    const index = pending.findIndex(
      (f) => f.parentId === null || ids.has(f.parentId),
    )
    // La réparation habituelle traite les parents manquants et les cycles.
    const [folder] = pending.splice(index < 0 ? 0 : index, 1)
    const parentId =
      folder.parentId === null ? null : (ids.get(folder.parentId) ?? null)
    const key = JSON.stringify([parentId, cleanName(folder.name, 'Dossier')])
    const existing = names.get(key)
    if (existing) {
      ids.set(folder.id, existing.id)
    } else {
      const kept =
        parentId === folder.parentId
          ? folder
          : { ...folder, parentId, updatedAt: date }
      ids.set(folder.id, folder.id)
      names.set(key, kept)
      folders.push(kept)
    }
  }
  const keptById = new Map(folders.map((f) => [f.id, f]))
  const orderedFolders = sharedFolders(library).flatMap((f) => {
    const kept = keptById.get(f.id)
    return kept ? [kept] : []
  })
  const remap = <T extends { folderId: string | null; updatedAt: string }>(
    item: T,
  ): T => {
    if (item.folderId === null) return item
    const folderId = ids.get(item.folderId) ?? item.folderId
    return folderId === item.folderId
      ? item
      : { ...item, folderId, updatedAt: date }
  }
  return {
    ...library,
    folders: orderedFolders,
    selectionFolders: orderedFolders,
    sessionFolders: orderedFolders,
    sessions: library.sessions.map(remap),
    sheets: library.sheets.map(remap),
    selections: library.selections.map(remap),
    deleted:
      ids.size === folders.length
        ? library.deleted
        : recordRemovals(
            library.deleted,
            ids.keys(),
            new Set(folders.map((f) => f.id)),
            date,
          ),
  }
}

export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}

function now(): string {
  return new Date().toISOString()
}

const collator = new Intl.Collator('fr', { numeric: true, sensitivity: 'base' })

export function byName<T extends { name: string }>(a: T, b: T): number {
  return collator.compare(a.name, b.name)
}

/** Nom nettoyé, ou nom par défaut s'il est vide */
export function cleanName(name: string, fallback: string): string {
  const trimmed = name.replace(/\s+/g, ' ').trim()
  return trimmed === '' ? fallback : trimmed.slice(0, 200)
}

// ---------- Dossiers ----------

export function childFolders(
  library: FolderSet,
  parentId: string | null,
): SheetFolder[] {
  return library.folders.filter((f) => f.parentId === parentId).sort(byName)
}

/** Identifiants du dossier et de tous ses sous-dossiers */
export function folderAndDescendants(
  library: FolderSet,
  folderId: string,
): Set<string> {
  const ids = new Set([folderId])
  let grew = true
  while (grew) {
    grew = false
    for (const folder of library.folders) {
      if (
        folder.parentId !== null &&
        ids.has(folder.parentId) &&
        !ids.has(folder.id)
      ) {
        ids.add(folder.id)
        grew = true
      }
    }
  }
  return ids
}

/** Chemin de la racine jusqu'au dossier (inclus) */
export function folderPath(
  library: FolderSet,
  folderId: string | null,
): SheetFolder[] {
  const path: SheetFolder[] = []
  const seen = new Set<string>()
  let current = library.folders.find((f) => f.id === folderId)
  while (current !== undefined && !seen.has(current.id)) {
    seen.add(current.id)
    path.unshift(current)
    const parentId = current.parentId
    current = library.folders.find((f) => f.id === parentId)
  }
  return path
}

export function createFolder<L extends FolderSet>(
  library: L,
  name: string,
  parentId: string | null,
): { library: L; folder: SheetFolder } {
  const date = now()
  const folder: SheetFolder = {
    id: newId(),
    name: cleanName(name, 'Nouveau dossier'),
    parentId: library.folders.some((f) => f.id === parentId) ? parentId : null,
    createdAt: date,
    updatedAt: date,
  }
  return {
    library: { ...library, folders: [...library.folders, folder] },
    folder,
  }
}

export function renameFolder<L extends FolderSet>(
  library: L,
  folderId: string,
  name: string,
): L {
  return {
    ...library,
    folders: library.folders.map((f) =>
      f.id === folderId
        ? { ...f, name: cleanName(name, f.name), updatedAt: now() }
        : f,
    ),
  }
}

/** Un dossier peut-il aller dans `parentId` (ni lui-même, ni un de ses descendants) ? */
export function canMoveFolder(
  library: FolderSet,
  folderId: string,
  parentId: string | null,
): boolean {
  if (parentId === null) return true
  if (!library.folders.some((f) => f.id === parentId)) return false
  return !folderAndDescendants(library, folderId).has(parentId)
}

export function moveFolder<L extends FolderSet>(
  library: L,
  folderId: string,
  parentId: string | null,
): L {
  if (!canMoveFolder(library, folderId, parentId)) return library
  return {
    ...library,
    folders: library.folders.map((f) =>
      f.id === folderId && f.parentId !== parentId
        ? { ...f, parentId, updatedAt: now() }
        : f,
    ),
  }
}

/**
 * Supprime un dossier et ses sous-dossiers ; les feuilles (ou sélections)
 * qu'ils contiennent vont dans la corbeille.
 * @returns la bibliothèque et les identifiants des éléments mis à la corbeille
 */
export function deleteFolder(
  library: SheetLibrary,
  folderId: string,
  space: Space = 'feuilles',
): { library: SheetLibrary; trashedIds: string[] } {
  const ids = folderAndDescendants(foldersOf(library, space), folderId)
  const items: { id: string; folderId: string | null }[] = library.organization
    ?.merged
    ? [...library.sheets, ...library.selections, ...library.sessions]
    : space === 'feuilles'
      ? library.sheets
      : space === 'selections'
        ? library.selections
        : library.sessions
  const trashedIds = items
    .filter((item) => item.folderId !== null && ids.has(item.folderId))
    .map((item) => item.id)
  const trashed = trashItems(library, trashedIds)
  return {
    library: changeFolders(trashed, space, (set) => ({
      folders: set.folders.filter((f) => !ids.has(f.id)),
    })),
    trashedIds,
  }
}

// ---------- Feuilles ----------

export function sheetsIn(
  library: SheetLibrary,
  folderId: string | null,
): SavedSheet[] {
  return library.sheets.filter((s) => s.folderId === folderId).sort(byName)
}

/** Nombre de feuilles du dossier et de ses sous-dossiers */
export function countSheets(
  library: SheetLibrary,
  folderId: string | null,
): number {
  if (folderId === null) return library.sheets.length
  const ids = folderAndDescendants(library, folderId)
  return library.sheets.filter(
    (s) => s.folderId !== null && ids.has(s.folderId),
  ).length
}

/** Recherche dans les noms des feuilles et les références des exercices */
export function searchSheets(
  library: SheetLibrary,
  search: string,
): SavedSheet[] {
  const words = normalize(search)
    .split(' ')
    .filter((w) => w !== '')
  if (words.length === 0) return []
  return library.sheets
    .filter((sheet) => {
      const text = normalize(
        [
          sheet.name,
          ...sheet.exercises,
          ...(sheetKind(sheet) !== 'typst'
            ? [SHEET_KIND_LABELS[sheetKind(sheet)]]
            : []),
          ...folderPath(library, sheet.folderId).map((f) => f.name),
        ].join(' '),
      )
      return words.every((w) => text.includes(w))
    })
    .sort(byName)
}

export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

/** Contenu enregistré d'une feuille, produit par la vue Impression ou LaTeX */
export interface SheetContent {
  query: string
  exercises: string[]
  /** Code LaTeX retouché à la main (vue LaTeX) */
  code?: string
  /** Sujet, scan et correction de la vue Évaluation avec scan. */
  omr?: OmrSavedState
}

/** Vue d'une requête enregistrée : LaTeX si `v=tex`, Impression sinon */
export function queryKind(query: string): SheetKind {
  const hashIndex = query.indexOf('#')
  const search = hashIndex < 0 ? query : query.slice(0, hashIndex)
  const view = new URLSearchParams(search).get('v')
  return view === 'tex' || view === 'omr' ? view : 'typst'
}

export function sheetKind(sheet: Pick<SavedSheet, 'query'>): SheetKind {
  return queryKind(sheet.query)
}

/** Code retouché à garder, ou `undefined` (vide, ou trop long pour être gardé) */
export function cleanSheetCode(code: unknown): string | undefined {
  return typeof code === 'string' &&
    code.trim() !== '' &&
    code.length <= SHEET_CODE_MAX_LENGTH
    ? code
    : undefined
}

export function addSheet(
  library: SheetLibrary,
  name: string,
  folderId: string | null,
  content: SheetContent,
): { library: SheetLibrary; sheet: SavedSheet } {
  const date = now()
  const sheet: SavedSheet = {
    id: newId(),
    name: cleanName(name, 'Feuille sans titre'),
    folderId: library.folders.some((f) => f.id === folderId) ? folderId : null,
    query: content.query,
    exercises: [...content.exercises],
    createdAt: date,
    updatedAt: date,
  }
  const code = cleanSheetCode(content.code)
  if (code !== undefined) sheet.code = code
  if (content.omr !== undefined) sheet.omr = structuredClone(content.omr)
  return { library: { ...library, sheets: [...library.sheets, sheet] }, sheet }
}

/** Remplace le contenu d'une feuille existante (nouvel enregistrement) */
export function updateSheetContent(
  library: SheetLibrary,
  sheetId: string,
  content: SheetContent,
): SheetLibrary {
  return {
    ...library,
    sheets: library.sheets.map((s) => {
      if (s.id !== sheetId) return s
      const updated: SavedSheet = {
        ...s,
        query: content.query,
        exercises: [...content.exercises],
        updatedAt: now(),
      }
      // le code retouché est celui de cet enregistrement, ou aucun
      const code = cleanSheetCode(content.code)
      if (code === undefined) delete updated.code
      else updated.code = code
      if (content.omr === undefined) delete updated.omr
      else updated.omr = structuredClone(content.omr)
      return updated
    }),
  }
}

export function renameSheet(
  library: SheetLibrary,
  sheetId: string,
  name: string,
): SheetLibrary {
  return {
    ...library,
    sheets: library.sheets.map((s) =>
      s.id === sheetId
        ? { ...s, name: cleanName(name, s.name), updatedAt: now() }
        : s,
    ),
  }
}

export function moveSheet(
  library: SheetLibrary,
  sheetId: string,
  folderId: string | null,
): SheetLibrary {
  if (folderId !== null && !library.folders.some((f) => f.id === folderId)) {
    return library
  }
  return {
    ...library,
    sheets: library.sheets.map((s) =>
      s.id === sheetId && s.folderId !== folderId
        ? { ...s, folderId, updatedAt: now() }
        : s,
    ),
  }
}

export function duplicateSheet(
  library: SheetLibrary,
  sheetId: string,
): { library: SheetLibrary; sheet: SavedSheet | null } {
  const original = library.sheets.find((s) => s.id === sheetId)
  if (original === undefined) return { library, sheet: null }
  const date = now()
  const sheet: SavedSheet = {
    ...original,
    ...(original.omr ? { omr: structuredClone(original.omr) } : {}),
    id: newId(),
    name: `${original.name} (copie)`,
    exercises: [...original.exercises],
    createdAt: date,
    updatedAt: date,
  }
  return { library: { ...library, sheets: [...library.sheets, sheet] }, sheet }
}

export function deleteSheet(
  library: SheetLibrary,
  sheetId: string,
): SheetLibrary {
  return { ...library, sheets: library.sheets.filter((s) => s.id !== sheetId) }
}

// ---------- Sélections ----------

const STAR_VALUES: readonly Stars[] = [0, 1, 2, 3]

/** Nombre d'étoiles valide (0 à 3) */
export function toStars(value: unknown): Stars {
  return STAR_VALUES.includes(value as Stars) ? (value as Stars) : 0
}

/** Longueur maximale d'un commentaire */
export const COMMENT_MAX_LENGTH = 2000

/** Commentaire nettoyé (espaces en bout de ligne, longueur maximale) */
export function cleanComment(comment: string): string {
  return comment
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+$/gm, '')
    .trim()
    .slice(0, COMMENT_MAX_LENGTH)
}

export type SelectionOrder = 'nom' | 'etoiles' | 'date' | 'vue'

/**
 * Trie les sélections : par nom, par étoiles (les mieux notées d'abord), par
 * date de modification (les plus récentes d'abord) ou par vue, puis par nom.
 * @param viewRank rang de la vue d'une sélection (tri par vue)
 */
export function sortSelections(
  selections: readonly SavedSelection[],
  order: SelectionOrder,
  viewRank: (selection: SavedSelection) => number = () => 0,
): SavedSelection[] {
  return [...selections].sort((a, b) => {
    if (order === 'etoiles' && a.stars !== b.stars) return b.stars - a.stars
    if (order === 'vue') {
      const rank = viewRank(a) - viewRank(b)
      if (rank !== 0) return rank
    }
    if (order === 'date' && a.updatedAt !== b.updatedAt) {
      return a.updatedAt < b.updatedAt ? 1 : -1
    }
    return byName(a, b)
  })
}

export function selectionsIn(
  library: SheetLibrary,
  folderId: string | null,
): SavedSelection[] {
  return library.selections.filter((s) => s.folderId === folderId).sort(byName)
}

/** Nombre de sélections du dossier et de ses sous-dossiers */
export function countSelections(
  library: SheetLibrary,
  folderId: string | null,
): number {
  if (folderId === null) return library.selections.length
  const ids = folderAndDescendants(foldersOf(library, 'selections'), folderId)
  return library.selections.filter(
    (s) => s.folderId !== null && ids.has(s.folderId),
  ).length
}

/**
 * Recherche dans les noms, commentaires et références des exercices des
 * sélections, et dans les noms de leurs dossiers
 */
export function searchSelections(
  library: SheetLibrary,
  search: string,
): SavedSelection[] {
  const words = normalize(search)
    .split(' ')
    .filter((w) => w !== '')
  if (words.length === 0) return []
  const folders = foldersOf(library, 'selections')
  return library.selections
    .filter((selection) => {
      const text = normalize(
        [
          selection.name,
          selection.comment,
          selection.externalUrl ?? '',
          ...selection.exercises,
          ...folderPath(folders, selection.folderId).map((f) => f.name),
        ].join(' '),
      )
      return words.every((w) => text.includes(w))
    })
    .sort(byName)
}

/** Ce qu'on choisit en ajoutant une sélection */
export interface NewSelection {
  externalUrl?: string
  name: string
  folderId: string | null
  query: string
  exercises: string[]
  stars?: Stars
  comment?: string
  newDataEachTime?: boolean
}

export function addSelection(
  library: SheetLibrary,
  input: NewSelection,
): { library: SheetLibrary; selection: SavedSelection } {
  const date = now()
  const selection: SavedSelection = {
    id: newId(),
    name: cleanName(input.name, 'Sélection sans titre'),
    folderId: library.selectionFolders.some((f) => f.id === input.folderId)
      ? input.folderId
      : null,
    ...(input.externalUrl === undefined
      ? {}
      : { externalUrl: input.externalUrl }),
    query: input.query,
    exercises: [...input.exercises],
    stars: toStars(input.stars),
    comment: cleanComment(input.comment ?? ''),
    newDataEachTime: input.newDataEachTime ?? false,
    createdAt: date,
    updatedAt: date,
  }
  return {
    library: { ...library, selections: [...library.selections, selection] },
    selection,
  }
}

/** Ce qui se modifie dans une sélection existante */
export type SelectionChange = Partial<
  Pick<
    SavedSelection,
    'name' | 'query' | 'exercises' | 'stars' | 'comment' | 'newDataEachTime'
  >
> & {
  /** `null` retire le lien raccourci de la sélection */
  shortLink?: SelectionShortLink | null
}

/** Modifie une sélection ; sans effet (même date) si rien ne change */
export function updateSelection(
  library: SheetLibrary,
  selectionId: string,
  change: SelectionChange,
): SheetLibrary {
  return {
    ...library,
    selections: library.selections.map((s) => {
      if (s.id !== selectionId) return s
      const { shortLink, ...rest } = change
      const next: SavedSelection = {
        ...s,
        ...rest,
        name:
          change.name === undefined ? s.name : cleanName(change.name, s.name),
        stars: change.stars === undefined ? s.stars : toStars(change.stars),
        comment:
          change.comment === undefined
            ? s.comment
            : cleanComment(change.comment),
        exercises:
          change.exercises === undefined ? s.exercises : [...change.exercises],
      }
      if (shortLink === null) delete next.shortLink
      else if (shortLink !== undefined) next.shortLink = { ...shortLink }
      const isSame =
        next.shortLink?.url === s.shortLink?.url &&
        next.shortLink?.longUrl === s.shortLink?.longUrl &&
        next.name === s.name &&
        next.query === s.query &&
        next.stars === s.stars &&
        next.comment === s.comment &&
        next.newDataEachTime === s.newDataEachTime &&
        next.exercises.join(' ') === s.exercises.join(' ')
      return isSame ? s : { ...next, updatedAt: now() }
    }),
  }
}

export function moveSelection(
  library: SheetLibrary,
  selectionId: string,
  folderId: string | null,
): SheetLibrary {
  if (
    folderId !== null &&
    !library.selectionFolders.some((f) => f.id === folderId)
  ) {
    return library
  }
  return {
    ...library,
    selections: library.selections.map((s) =>
      s.id === selectionId && s.folderId !== folderId
        ? { ...s, folderId, updatedAt: now() }
        : s,
    ),
  }
}

export function duplicateSelection(
  library: SheetLibrary,
  selectionId: string,
): { library: SheetLibrary; selection: SavedSelection | null } {
  const original = library.selections.find((s) => s.id === selectionId)
  if (original === undefined) return { library, selection: null }
  const date = now()
  const selection: SavedSelection = {
    ...original,
    id: newId(),
    name: `${original.name} (copie)`,
    exercises: [...original.exercises],
    createdAt: date,
    updatedAt: date,
  }
  // le lien raccourci reste à l'original : la copie aura le sien
  delete selection.shortLink
  return {
    library: { ...library, selections: [...library.selections, selection] },
    selection,
  }
}

export function deleteSelection(
  library: SheetLibrary,
  selectionId: string,
): SheetLibrary {
  return {
    ...library,
    selections: library.selections.filter((s) => s.id !== selectionId),
  }
}

// ---------- Séances au vidéoprojecteur ----------

/** Références des exercices d'un état de la vue TBI (`id`, sinon `uuid`) */
export function sessionExercises(state: SessionState): string[] {
  return Array.isArray(state.exercices)
    ? state.exercices.flatMap((exercise: unknown) => {
        if (typeof exercise !== 'object' || exercise === null) return []
        const { id, uuid } = exercise as { id?: unknown; uuid?: unknown }
        const ref = typeof id === 'string' && id !== '' ? id : uuid
        return typeof ref === 'string' && ref !== '' ? [ref] : []
      })
    : []
}

export function sessionsIn(
  library: SheetLibrary,
  folderId: string | null,
): SavedSession[] {
  return library.sessions.filter((s) => s.folderId === folderId).sort(byName)
}

/** Nombre de séances du dossier et de ses sous-dossiers */
export function countSessions(
  library: SheetLibrary,
  folderId: string | null,
): number {
  if (folderId === null) return library.sessions.length
  const ids = folderAndDescendants(foldersOf(library, 'seances'), folderId)
  return library.sessions.filter(
    (s) => s.folderId !== null && ids.has(s.folderId),
  ).length
}

/** Recherche dans les noms et les références des exercices des séances, et dans les noms de leurs dossiers */
export function searchSessions(
  library: SheetLibrary,
  search: string,
): SavedSession[] {
  const words = normalize(search)
    .split(' ')
    .filter((w) => w !== '')
  if (words.length === 0) return []
  const folders = foldersOf(library, 'seances')
  return library.sessions
    .filter((session) => {
      const text = normalize(
        [
          session.name,
          ...session.exercises,
          ...folderPath(folders, session.folderId).map((f) => f.name),
        ].join(' '),
      )
      return words.every((w) => text.includes(w))
    })
    .sort(byName)
}

/**
 * Une séance est utilisable si son état est celui de la vue TBI et porte la
 * liste de ses exercices, chacun avec son `uuid`. La liste peut être vide :
 * une séance peut ne contenir que des widgets ou des documents (liens,
 * vidéos).
 */
export function isSessionState(value: unknown): value is SessionState {
  if (typeof value !== 'object' || value === null) return false
  const { type, exercices } = value as Record<string, unknown>
  return (
    type === SESSION_STATE_TYPE &&
    Array.isArray(exercices) &&
    exercices.every(
      (exercise: unknown) =>
        typeof exercise === 'object' &&
        exercise !== null &&
        typeof (exercise as { uuid?: unknown }).uuid === 'string' &&
        (exercise as { uuid: string }).uuid !== '',
    )
  )
}

export function addSession(
  library: SheetLibrary,
  name: string,
  folderId: string | null,
  state: SessionState,
): { library: SheetLibrary; session: SavedSession } {
  const date = now()
  const session: SavedSession = {
    id: newId(),
    name: cleanName(name, 'Séance sans titre'),
    folderId: library.sessionFolders.some((f) => f.id === folderId)
      ? folderId
      : null,
    state,
    exercises: sessionExercises(state),
    createdAt: date,
    updatedAt: date,
  }
  return {
    library: { ...library, sessions: [...library.sessions, session] },
    session,
  }
}

/** Remplace l'état d'une séance existante (nouvel enregistrement) */
export function updateSessionState(
  library: SheetLibrary,
  sessionId: string,
  state: SessionState,
): SheetLibrary {
  return {
    ...library,
    sessions: library.sessions.map((s) =>
      s.id === sessionId
        ? {
            ...s,
            state,
            exercises: sessionExercises(state),
            updatedAt: now(),
          }
        : s,
    ),
  }
}

export function renameSession(
  library: SheetLibrary,
  sessionId: string,
  name: string,
): SheetLibrary {
  return {
    ...library,
    sessions: library.sessions.map((s) =>
      s.id === sessionId
        ? { ...s, name: cleanName(name, s.name), updatedAt: now() }
        : s,
    ),
  }
}

export function moveSession(
  library: SheetLibrary,
  sessionId: string,
  folderId: string | null,
): SheetLibrary {
  if (
    folderId !== null &&
    !library.sessionFolders.some((f) => f.id === folderId)
  ) {
    return library
  }
  return {
    ...library,
    sessions: library.sessions.map((s) =>
      s.id === sessionId && s.folderId !== folderId
        ? { ...s, folderId, updatedAt: now() }
        : s,
    ),
  }
}

export function duplicateSession(
  library: SheetLibrary,
  sessionId: string,
): { library: SheetLibrary; session: SavedSession | null } {
  const original = library.sessions.find((s) => s.id === sessionId)
  if (original === undefined) return { library, session: null }
  const date = now()
  const session: SavedSession = {
    ...original,
    id: newId(),
    name: `${original.name} (copie)`,
    state: structuredClone(original.state),
    exercises: [...original.exercises],
    createdAt: date,
    updatedAt: date,
  }
  return {
    library: { ...library, sessions: [...library.sessions, session] },
    session,
  }
}

// ---------- Actions groupées ----------

/** Déplace des feuilles, des sélections ou des séances dans un dossier de leur arborescence */
export function moveItems(
  library: SheetLibrary,
  ids: Iterable<string>,
  folderId: string | null,
): SheetLibrary {
  let next = library
  for (const id of ids) {
    if (library.sheets.some((s) => s.id === id)) {
      next = moveSheet(next, id, folderId)
    } else if (library.sessions.some((s) => s.id === id)) {
      next = moveSession(next, id, folderId)
    } else {
      next = moveSelection(next, id, folderId)
    }
  }
  return next
}

// ---------- Corbeille ----------

/** Durée de conservation dans la corbeille, en jours */
export const TRASH_DAYS = 30
const DAY_MS = 24 * 60 * 60 * 1000

/** Met des feuilles, des sélections ou des séances à la corbeille */
export function trashItems(
  library: SheetLibrary,
  ids: Iterable<string>,
  date: string = now(),
): SheetLibrary {
  const wanted = new Set(ids)
  const names = (space: Space, folderId: string | null) =>
    folderPath(foldersOf(library, space), folderId).map((f) => f.name)
  const trashed: TrashedItem[] = [
    ...library.sheets
      .filter((s) => wanted.has(s.id))
      .map((item) => ({
        kind: 'sheet' as const,
        item,
        deletedAt: date,
        location: names('feuilles', item.folderId),
      })),
    ...library.selections
      .filter((s) => wanted.has(s.id))
      .map((item) => ({
        kind: 'selection' as const,
        item,
        deletedAt: date,
        location: names('selections', item.folderId),
      })),
    ...library.sessions
      .filter((s) => wanted.has(s.id))
      .map((item) => ({
        kind: 'session' as const,
        item,
        deletedAt: date,
        location: names('seances', item.folderId),
      })),
  ]
  if (trashed.length === 0) return library
  return {
    ...library,
    sheets: library.sheets.filter((s) => !wanted.has(s.id)),
    selections: library.selections.filter((s) => !wanted.has(s.id)),
    sessions: library.sessions.filter((s) => !wanted.has(s.id)),
    trash: [...trashed, ...library.trash],
  }
}

/** Arborescence d'un élément de la corbeille */
export function trashedSpace(entry: TrashedItem): Space {
  if (entry.kind === 'sheet') return 'feuilles'
  return entry.kind === 'selection' ? 'selections' : 'seances'
}

/**
 * Dossier où remettre un élément : le sien s'il existe encore, sinon un
 * dossier du même chemin, recréé au besoin
 */
function restoreFolder(
  library: SheetLibrary,
  entry: TrashedItem,
): { library: SheetLibrary; folderId: string | null } {
  const space = trashedSpace(entry)
  const { folderId } = entry.item
  if (folderId === null) return { library, folderId }
  if (foldersOf(library, space).folders.some((f) => f.id === folderId)) {
    return { library, folderId }
  }
  let next = library
  let parentId: string | null = null
  for (const name of entry.location) {
    const existing: SheetFolder | undefined = childFolders(
      foldersOf(next, space),
      parentId,
    ).find((f) => f.name === name)
    if (existing !== undefined) {
      parentId = existing.id
      continue
    }
    let createdId = ''
    next = changeFolders(next, space, (set) => {
      const created = createFolder(set, name, parentId)
      createdId = created.folder.id
      return created.library
    })
    parentId = createdId
  }
  return { library: next, folderId: parentId }
}

/**
 * Remet des éléments de la corbeille à leur place. Leur date de modification
 * devient celle de la restauration : plus récente que la mise à la corbeille,
 * elle l'emporte à la synchronisation.
 */
export function restoreItems(
  library: SheetLibrary,
  ids: Iterable<string>,
  date: string = now(),
): SheetLibrary {
  const wanted = new Set(ids)
  let next: SheetLibrary = {
    ...library,
    trash: library.trash.filter((entry) => !wanted.has(entry.item.id)),
  }
  for (const entry of library.trash) {
    if (!wanted.has(entry.item.id)) continue
    const place = restoreFolder(next, entry)
    next = place.library
    if (entry.kind === 'sheet') {
      next = {
        ...next,
        sheets: [
          ...next.sheets,
          { ...entry.item, folderId: place.folderId, updatedAt: date },
        ],
      }
    } else if (entry.kind === 'selection') {
      next = {
        ...next,
        selections: [
          ...next.selections,
          { ...entry.item, folderId: place.folderId, updatedAt: date },
        ],
      }
    } else {
      next = {
        ...next,
        sessions: [
          ...next.sessions,
          { ...entry.item, folderId: place.folderId, updatedAt: date },
        ],
      }
    }
  }
  return next
}

/**
 * Supprime définitivement des éléments de la corbeille.
 * @returns la bibliothèque et les feuilles supprimées (pour effacer leurs aperçus)
 */
export function deleteForever(
  library: SheetLibrary,
  ids: Iterable<string>,
): { library: SheetLibrary; removedSheetIds: string[] } {
  const wanted = new Set(ids)
  return {
    library: {
      ...library,
      trash: library.trash.filter((entry) => !wanted.has(entry.item.id)),
    },
    removedSheetIds: library.trash
      .filter((entry) => entry.kind === 'sheet' && wanted.has(entry.item.id))
      .map((entry) => entry.item.id),
  }
}

/** Jours restants avant la suppression définitive (0 : aujourd'hui) */
export function trashDaysLeft(entry: TrashedItem, date: Date = new Date()) {
  const elapsed = date.getTime() - Date.parse(entry.deletedAt)
  return Math.max(0, Math.ceil(TRASH_DAYS - elapsed / DAY_MS))
}

/** Vide la corbeille des éléments supprimés depuis plus de `TRASH_DAYS` jours */
export function purgeTrash(
  library: SheetLibrary,
  date: Date = new Date(),
): { library: SheetLibrary; removedSheetIds: string[] } {
  const limit = date.getTime() - TRASH_DAYS * DAY_MS
  const expired = library.trash
    .filter((entry) => !(Date.parse(entry.deletedAt) > limit))
    .map((entry) => entry.item.id)
  if (expired.length === 0) return { library, removedSheetIds: [] }
  return deleteForever(library, expired)
}

// ---------- Pierres tombales ----------

/** Identifiants des dossiers, feuilles, sélections et séances, corbeille comprise */
export function libraryIds(library: SheetLibrary): Set<string> {
  return new Set([
    ...library.folders.map((f) => f.id),
    ...library.selectionFolders.map((f) => f.id),
    ...library.sessionFolders.map((f) => f.id),
    ...library.sheets.map((s) => s.id),
    ...library.selections.map((s) => s.id),
    ...library.sessions.map((s) => s.id),
    ...library.trash.map((entry) => entry.item.id),
  ])
}

/**
 * Ajoute à la bibliothèque modifiée une pierre tombale pour chaque élément
 * disparu (dossier supprimé, feuille supprimée définitivement…). Mettre à la
 * corbeille n'est pas supprimer : l'élément reste dans la bibliothèque.
 * @param before bibliothèque avant la modification
 * @param after bibliothèque après la modification
 */
export function recordDeletions(
  before: SheetLibrary,
  after: SheetLibrary,
  date: string = now(),
): SheetLibrary {
  return {
    ...after,
    deleted: recordRemovals(
      after.deleted ?? [],
      libraryIds(before),
      libraryIds(after),
      date,
    ),
  }
}

// ---------- URL ----------

/** Paramètre d'URL des vues Impression et LaTeX qui désigne la feuille en cours d'édition */
export const SHEET_URL_PARAM = 'feuille'

/** Paramètre d'URL de la vue TBI qui désigne la séance en cours d'édition */
export const SESSION_URL_PARAM = 'seance'

/**
 * Requête à enregistrer pour une URL de la vue Impression ou LaTeX : sans l'origine,
 * ni le paramètre `feuille` (propre à la bibliothèque de ce navigateur).
 */
export function queryFromUrl(href: string): string {
  const url = new URL(href)
  url.searchParams.delete(SHEET_URL_PARAM)
  return url.search + url.hash
}

/**
 * URL qui rouvre la feuille dans sa vue (Impression ou LaTeX) du site
 * courant, reliée à la feuille pour pouvoir l'enregistrer à nouveau.
 * @param base adresse de la page de l'application (origine et chemin)
 */
export function sheetUrl(sheet: SavedSheet, base: string): string {
  const url = new URL(base)
  const hashIndex = sheet.query.indexOf('#')
  const search = hashIndex < 0 ? sheet.query : sheet.query.slice(0, hashIndex)
  url.search = search
  url.hash = hashIndex < 0 ? '' : sheet.query.slice(hashIndex)
  url.searchParams.set('v', sheetKind(sheet))
  url.searchParams.set(SHEET_URL_PARAM, sheet.id)
  return url.href
}

// ---------- État de la sauvegarde ----------

/**
 * Ce qui a déjà été écrit dans un fichier `.mathalea` (export, ou import
 * d'un fichier) : pour chaque feuille, la date de la version sauvegardée.
 */
export interface BackupRecord {
  /** Date du dernier export, `null` si aucun */
  lastExportAt: string | null
  /** Identifiant de feuille → `updatedAt` de la version écrite dans un fichier */
  savedVersions: Record<string, string>
  /** Date de la dernière écriture de la sauvegarde automatique */
  lastAutoSaveAt?: string | null
  /** Empreinte des réglages écrits dans un fichier (voir `settingsFingerprint`) */
  savedSettings?: string
  /** Date du choix d’organisation écrit dans le fichier complet. */
  savedOrganization?: string
}

export function emptyBackupRecord(): BackupRecord {
  return { lastExportAt: null, savedVersions: {} }
}

/** Élément sauvegardé : feuille, sélection ou séance */
type Versioned = { id: string; updatedAt: string }

/** Feuilles, sélections et séances de la bibliothèque */
export function libraryItems(library: SheetLibrary): Versioned[] {
  return [...library.sheets, ...library.selections, ...library.sessions]
}

/**
 * Mémorise les versions des feuilles, sélections et séances écrites dans un fichier,
 * et l'empreinte des réglages s'ils y sont aussi
 */
export function recordBackup(
  record: BackupRecord,
  items: readonly Versioned[],
  exportedAt: string | null,
  settingsFingerprint?: string,
  organizationVersion?: string,
): BackupRecord {
  const savedVersions = { ...record.savedVersions }
  for (const item of items) savedVersions[item.id] = item.updatedAt
  return {
    ...record,
    lastExportAt: exportedAt ?? record.lastExportAt,
    savedVersions,
    ...(organizationVersion === undefined
      ? {}
      : { savedOrganization: organizationVersion }),
    ...(settingsFingerprint === undefined
      ? {}
      : { savedSettings: settingsFingerprint }),
  }
}

export interface BackupStatus {
  /** Nombre de feuilles, de sélections et de séances */
  total: number
  /** Feuilles, sélections et séances absentes de tout fichier, ou modifiées depuis */
  onlyInBrowser: number
  /** Part des éléments qui ne sont que dans ce navigateur (0 à 100, arrondie) */
  percent: number
  lastExportAt: string | null
  /** Réglages (lien élève, modèles, diaporamas) absents de tout fichier, ou modifiés depuis */
  settingsOnlyInBrowser: boolean
}

/**
 * @param settingsFingerprint empreinte des réglages actuels (vide s'il n'y
 *   en a pas)
 */
export function backupStatus(
  library: SheetLibrary,
  record: BackupRecord,
  settingsFingerprint = '',
): BackupStatus {
  const items = libraryItems(library)
  const total = items.length
  const onlyInBrowser = items.filter(
    (item) => record.savedVersions[item.id] !== item.updatedAt,
  ).length
  return {
    total,
    onlyInBrowser,
    percent: total === 0 ? 0 : Math.round((onlyInBrowser / total) * 100),
    lastExportAt: record.lastExportAt,
    settingsOnlyInBrowser:
      (settingsFingerprint !== '' &&
        settingsFingerprint !== record.savedSettings) ||
      (library.organization !== undefined &&
        library.organization.updatedAt !== record.savedOrganization),
  }
}
