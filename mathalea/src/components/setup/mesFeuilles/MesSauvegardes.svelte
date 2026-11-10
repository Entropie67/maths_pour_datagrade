<script lang="ts">
  import { onMount, tick } from 'svelte'
  import { get } from 'svelte/store'
  import {
    addSession,
    backupStatus,
    setLibraryOrganization,
    canMoveFolder,
    changeFolders,
    childFolders,
    countSelections,
    countSessions,
    countSheets,
    createFolder,
    deleteFolder,
    deleteForever,
    duplicateSelection,
    duplicateSession,
    duplicateSheet,
    emptyBackupRecord,
    emptyLibrary,
    folderAndDescendants,
    folderPath,
    foldersOf,
    libraryItems,
    moveFolder,
    moveItems,
    moveSelection,
    moveSession,
    moveSheet,
    purgeTrash,
    restoreItems,
    recordBackup,
    renameFolder,
    renameSession,
    renameSheet,
    searchSelections,
    searchSessions,
    searchSheets,
    selectionsIn,
    sessionsIn,
    SHEET_KIND_LABELS,
    sheetKind,
    sheetsIn,
    sheetUrl,
    sortSelections,
    SPACE_LABELS,
    trashDaysLeft,
    trashedSpace,
    trashItems,
    TRASH_DAYS,
    updateSelection,
    COMMENT_MAX_LENGTH,
    type BackupRecord,
    type SavedSelection,
    type SavedSession,
    type SavedSheet,
    type SelectionChange,
    type SelectionOrder,
    type SheetFolder,
    type SheetLibrary,
    type Space,
    type Stars,
    type TrashedItem,
  } from '../../../lib/mesFeuilles/library'
  import {
    buildLibraryFile,
    exportFileName,
    libraryPart,
    LIBRARY_FILE_EXTENSION,
    LIBRARY_FILE_MIME_TYPE,
    mergeLibraries,
    parseLibraryFile,
    readLibraryFileText,
    zipLibraryFile,
    type ExportedFolder,
    type MergeResult,
  } from '../../../lib/mesFeuilles/libraryFile'
  import {
    editExercisesUrl,
    selectionUrl,
    selectionView,
    viewLabel,
    viewRank,
  } from '../../../lib/mesFeuilles/selectionLink'
  import {
    defaultSessionName,
    isTbiSettingsData,
    readTbiSettings,
    sessionShareUrl,
    sessionUrl,
  } from '../../../lib/mesFeuilles/sessionLink'
  import {
    deletePreviews,
    isStorageAvailable,
    loadBackupRecord,
    loadLibrary,
    loadPreview,
    loadPreviews,
    onLibraryChange,
    rememberEditedSelection,
    requestPersistentStorage,
    savePreview,
    savePreviews,
    updateBackupRecord,
    updateLibrary,
  } from '../../../lib/mesFeuilles/storage'
  import {
    hasSecretSettings,
    hasSettings,
    importSettings,
    loadSettings,
    settingsCoveredBy,
    settingsFingerprint,
  } from '../../../lib/mesFeuilles/settings'
  import {
    chooseAutoSaveFile,
    getAutoSaveState,
    onAutoSaveStateChange,
    resumeAutoSave,
    stopAutoSave,
    watchAutoSave,
    type AutoSaveState,
  } from '../../../lib/mesFeuilles/autoSave'
  import {
    updatePreferences,
    type Preferences,
  } from '../../../lib/mesFeuilles/preferences'
  import {
    loadParcoursSettings,
    mergeParcours,
    saveParcoursLibrary,
  } from '../../../lib/mesFeuilles/parcoursSettings'
  import { deleteParcours } from '../../../lib/parcours/parcoursLibrary'
  import {
    saveSlideshowHistory,
    type SlideshowHistoryEntry,
  } from '../../../lib/mesFeuilles/slideshowHistory'
  import {
    updateStudentClasses,
    type StudentClasses,
  } from '../../../lib/mesFeuilles/studentClasses'
  import { downloadBlob } from '../../../lib/spreadsheet'
  import { savesLocationStore } from '../../../lib/stores/generalStore'
  import { globalOptions } from '../../../lib/stores/globalOptions'
  import { referentielLocale } from '../../../lib/stores/languagesStore'
  import NavBar from '../../shared/header/NavBar.svelte'
  import FolderPicker from './FolderPicker.svelte'
  import FolderTree from './FolderTree.svelte'
  import LatexLogo from './LatexLogo.svelte'
  import NewSelectionForm from './NewSelectionForm.svelte'
  import SelectionItem from './SelectionItem.svelte'
  import SelectionSettings from './SelectionSettings.svelte'
  import SessionItem from './SessionItem.svelte'
  import SheetDialog from './SheetDialog.svelte'
  import SheetThumbnail from './SheetThumbnail.svelte'
  import EdurlTokenPanel from './EdurlTokenPanel.svelte'
  import ShortLinksPanel from './ShortLinksPanel.svelte'
  import ShortLinkDialog from '../../shared/edurl/ShortLinkDialog.svelte'
  import { copyTextToClipboard } from '../../../lib/components/clipboard'
  import ParcoursPanel from './ParcoursPanel.svelte'
  import SlideshowHistoryPanel from './SlideshowHistoryPanel.svelte'
  import StudentClassesPanel from './StudentClassesPanel.svelte'
  import TypstModelsPanel from './TypstModelsPanel.svelte'
  import {
    dangerButton,
    iconButton,
    primaryButton,
    quietText,
    secondaryButton,
    textInput,
  } from './styles'

  /**
   * « Mes sauvegardes » : trois arborescences de dossiers, « Mes feuilles »
   * (fiches des vues Impression et LaTeX), « Mes sélections » (liens
   * MathALÉA annotés) et « Mes séances au vidéoprojecteur » (états de la vue
   * TBI), puis les parcours de l'application et les réglages gardés avec elles (modèles de
   * document de la vue Impression, historique des diaporamas). Tout reste dans
   * ce navigateur ; un fichier `.mathalea` les sauvegarde et les reprend
   * ailleurs.
   */

  /** Volet affiché à la place des dossiers : parcours ou réglages */
  type SettingsPanel =
    | 'parcours'
    | 'affichage'
    | 'modeles'
    | 'classes'
    | 'diaporamas'
    | 'jeton'
    | 'liens'

  type Item =
    | { kind: 'sheet'; sheet: SavedSheet }
    | { kind: 'selection'; selection: SavedSelection }
    | { kind: 'session'; session: SavedSession }
    | { kind: 'folder'; space: Space; folder: SheetFolder }

  const SPACE_ICONS: Record<Space, string> = {
    feuilles: 'bx-printer',
    selections: 'bx-bookmarks',
    seances: 'bx-chalkboard',
  }

  let library: SheetLibrary = $state(emptyLibrary())
  let isLoaded = $state(false)
  let loadError = $state(false)
  const start = get(savesLocationStore)
  let space: Space = $state(start.space)
  let currentFolderId: string | null = $state(start.folderId)
  /** Sélection à montrer à l'arrivée (retour après modification de ses exercices) */
  let highlightId = $state(start.selectionId ?? '')
  let search = $state('')
  let notice = $state('')
  let noticeIsError = $state(false)
  /** Action proposée avec le message (« Annuler » une mise à la corbeille) */
  let noticeAction = $state<{ label: string; run: () => void } | null>(null)
  let isTrashOpen = $state(false)
  /** Volet ouvert (parcours, modèles, diaporamas), `null` : les dossiers */
  let panel = $state<SettingsPanel | null>(start.panel ?? null)
  let isTrashTarget = $state(false)
  /** Feuilles, sélections ou éléments de la corbeille cochés */
  let checkedIds = $state(new Set<string>())
  let isBulkMoveOpen = $state(false)
  let bulkMoveTarget: string | null = $state(null)
  let selectionOrder: SelectionOrder = $state('nom')
  let minStars: Stars = $state(0)

  // fenêtres
  let previewSheet = $state<SavedSheet | null>(null)
  let moving = $state<Item | null>(null)
  let moveTarget: string | null = $state(null)
  let deleting = $state<Item | null>(null)
  let isNewFolderOpen = $state(false)
  let newFolderName = $state('')
  let isNewSelectionOpen = $state(false)
  let settingsFor = $state<SavedSelection | null>(null)
  /** Sélection dont on crée ou montre le lien raccourci, et QR code affiché d'emblée */
  let shortFor = $state<SavedSelection | null>(null)
  let shortShowQr = $state(false)
  let copiedShortId = $state('')
  let commentFor = $state<SavedSelection | null>(null)
  let commentValue = $state('')
  // renommage en place
  let renamingId = $state('')
  let renameValue = $state('')
  // glisser-déposer
  let dragged = $state<Item | null>(null)
  let isFileOver = $state(false)
  let isHelpOpen = $state(false)
  let copiedId = $state('')
  let copiedTimer: ReturnType<typeof setTimeout> | undefined
  let backup: BackupRecord = $state(emptyBackupRecord())
  /** Réglages de `localStorage` repris dans le fichier (voir `settings.ts`) */
  let settings = $state(loadSettings())
  const settingsPrint = $derived(settingsFingerprint(settings))
  const backupState = $derived(backupStatus(library, backup, settingsPrint))
  const canExport = $derived(
    library.organization !== undefined ||
      libraryItems(library).length > 0 ||
      hasSettings(settings) ||
      hasSecretSettings(settings),
  )
  let autoSave = $state<AutoSaveState>({ kind: 'unsupported' })

  const merged = $derived(library.organization?.merged === true)
  const rootLabel = $derived(
    merged ? 'Feuilles, sélections et séances' : SPACE_LABELS[space],
  )

  async function changeOrganization(value: boolean) {
    await change((lib) => setLibraryOrganization(lib, value))
    space = 'feuilles'
    currentFolderId = null
    checkedIds = new Set()
  }

  const tree = $derived(foldersOf(library, space))
  const currentFolder = $derived(
    tree.folders.find((f) => f.id === currentFolderId),
  )
  const path = $derived(folderPath(tree, currentFolderId))
  const subFolders = $derived(childFolders(tree, currentFolderId))
  const isSearching = $derived(search.trim() !== '')
  const sheets = $derived(
    isSearching
      ? searchSheets(library, search)
      : merged || space === 'feuilles'
        ? sheetsIn(library, currentFolderId)
        : [],
  )
  const sessions = $derived(
    isSearching
      ? searchSessions(library, search)
      : merged || space === 'seances'
        ? sessionsIn(library, currentFolderId)
        : [],
  )
  const selections = $derived(
    sortSelections(
      (isSearching
        ? searchSelections(library, search)
        : merged || space === 'selections'
          ? selectionsIn(library, currentFolderId)
          : []
      ).filter((s) => s.stars >= minStars),
      selectionOrder,
      (s) => viewRank(selectionView(s)),
    ),
  )
  /** Sélections regroupées par vue (tri par vue), sinon un seul groupe */
  const selectionGroups = $derived.by(() => {
    if (selectionOrder !== 'vue') return [{ title: '', items: selections }]
    const groups: { title: string; items: SavedSelection[] }[] = []
    for (const selection of selections) {
      const title = viewLabel(selectionView(selection)).label
      const last = groups.at(-1)
      if (last?.title === title) last.items.push(selection)
      else groups.push({ title, items: [selection] })
    }
    return groups
  })
  const trashEntries = $derived(
    [...library.trash].sort((a, b) => (a.deletedAt < b.deletedAt ? 1 : -1)),
  )
  /** Éléments affichés qu'on peut cocher */
  const visibleIds = $derived(
    isTrashOpen
      ? trashEntries.map((t) => t.item.id)
      : [
          ...sheets.map((s) => s.id),
          ...sessions.map((s) => s.id),
          ...selections.map((s) => s.id),
        ],
  )
  const checkedVisible = $derived(visibleIds.filter((id) => checkedIds.has(id)))
  /** Arborescence commune des éléments cochés (`null` : éléments de plusieurs arborescences mêlés) */
  const checkedSpace = $derived.by((): Space | null => {
    if (merged) return 'feuilles'
    const spaces = new Set<Space>()
    for (const id of checkedVisible) {
      if (library.sheets.some((s) => s.id === id)) spaces.add('feuilles')
      else if (library.sessions.some((s) => s.id === id)) spaces.add('seances')
      else spaces.add('selections')
    }
    return spaces.size === 1 ? [...spaces][0] : null
  })
  /** Sélections du dossier ou de la recherche, avant le filtre des étoiles */
  const hasSelections = $derived(
    isSearching
      ? searchSelections(library, search).length > 0
      : (merged || space === 'selections') &&
          selectionsIn(library, currentFolderId).length > 0,
  )
  const isLibraryEmpty = $derived(
    libraryItems(library).length === 0 &&
      library.folders.length === 0 &&
      library.selectionFolders.length === 0 &&
      library.sessionFolders.length === 0,
  )

  // on revient au même dossier en rouvrant la vue
  $effect(() => {
    savesLocationStore.set({ space, folderId: currentFolderId })
  })

  $effect(() => {
    if (!isLoaded || highlightId === '') return
    const id = highlightId
    tick().then(() =>
      document
        .getElementById(`selection-${id}`)
        ?.scrollIntoView({ block: 'center', behavior: 'smooth' }),
    )
    const timer = setTimeout(() => (highlightId = ''), 3000)
    return () => clearTimeout(timer)
  })

  async function refresh() {
    try {
      library = await loadLibrary()
      backup = await loadBackupRecord()
      settings = loadSettings()
      await refreshAutoSave()
      isLoaded = true
      // dossier supprimé dans un autre onglet
      if (
        currentFolderId !== null &&
        !foldersOf(library, space).folders.some((f) => f.id === currentFolderId)
      ) {
        currentFolderId = null
      }
    } catch (error) {
      console.error('Lecture de « Mes sauvegardes » impossible', error)
      loadError = true
    }
  }

  // ---------- Réglages : modèles de document, historique des diaporamas ----------

  /** Modifie les modèles de document ; l'état de la sauvegarde est recalculé */
  function changePreferences(
    update: (preferences: Preferences) => Preferences,
  ) {
    updatePreferences(update)
    settings = loadSettings()
  }

  /** Le jeton edurl.fr a changé (saisi, oublié ou refusé) : l'état de la sauvegarde est recalculé */
  function changeEdurlToken() {
    settings = loadSettings()
  }

  /** Modifie les classes du tirage au sort ; l'état de la sauvegarde est recalculé */
  function changeClasses(update: (value: StudentClasses) => StudentClasses) {
    updateStudentClasses(update)
    settings = loadSettings()
  }

  function changeSlideshows(items: SlideshowHistoryEntry[]) {
    saveSlideshowHistory(items)
    settings = loadSettings()
  }

  /** Supprime un parcours (pierre tombale comprise) ; l'état de la sauvegarde est recalculé */
  function removeParcours(id: string) {
    saveParcoursLibrary(deleteParcours(loadParcoursSettings().library, id))
    settings = loadSettings()
  }

  function openPanel(target: SettingsPanel) {
    isTrashOpen = false
    panel = target
    search = ''
  }

  onMount(() => {
    if (!isStorageAvailable()) {
      loadError = true
      return
    }
    refresh().then(purgeExpired)
    const stopSync = onLibraryChange(refresh)
    const stopWatch = watchAutoSave()
    const stopState = onAutoSaveStateChange(refreshAutoSave)
    return () => {
      stopSync()
      stopWatch()
      stopState()
      clearTimeout(copiedTimer)
    }
  })

  // ---------- Sauvegarde automatique ----------

  async function refreshAutoSave() {
    try {
      autoSave = await getAutoSaveState()
    } catch (error) {
      console.error('État de la sauvegarde automatique illisible', error)
    }
  }

  async function startAutoSave() {
    try {
      if (await chooseAutoSaveFile()) {
        await refreshAutoSave()
        showNotice(
          'Sauvegarde automatique activée : le fichier sera réécrit après chaque modification.',
        )
      }
    } catch (error) {
      console.error('Choix du fichier impossible', error)
      showNotice('Le fichier de sauvegarde n’a pas pu être choisi.', true)
    }
  }

  async function restartAutoSave() {
    try {
      if (!(await resumeAutoSave())) {
        showNotice(
          'Le navigateur n’a pas autorisé l’écriture dans le fichier de sauvegarde.',
          true,
        )
      }
      await refreshAutoSave()
    } catch (error) {
      console.error('Reprise de la sauvegarde automatique impossible', error)
      showNotice('La sauvegarde automatique n’a pas pu reprendre.', true)
    }
  }

  async function endAutoSave() {
    await stopAutoSave()
    await refreshAutoSave()
  }

  function showNotice(
    text: string,
    isError = false,
    action: { label: string; run: () => void } | null = null,
  ) {
    notice = text
    noticeIsError = isError
    noticeAction = action
  }

  // le message disparaît seul, sauf une erreur
  $effect(() => {
    if (notice === '' || noticeIsError) return
    const timer = setTimeout(() => (notice = ''), 8000)
    return () => clearTimeout(timer)
  })

  // ---------- Cocher ----------

  function toggleChecked(id: string) {
    const next = new Set(checkedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    checkedIds = next
  }

  function checkAll() {
    checkedIds = new Set(
      checkedVisible.length === visibleIds.length ? [] : visibleIds,
    )
  }

  // ce qui est coché ne vaut que pour la liste affichée
  $effect(() => {
    void space
    void currentFolderId
    void isTrashOpen
    void panel
    void search
    checkedIds = new Set()
  })

  async function moveChecked() {
    const ids = checkedVisible
    isBulkMoveOpen = false
    await change((lib) => moveItems(lib, ids, bulkMoveTarget))
    checkedIds = new Set()
  }

  // ---------- Corbeille ----------

  function plural(count: number, word: string): string {
    return `${count} ${word}${count > 1 ? 's' : ''}`
  }

  /** Met à la corbeille, avec « Annuler » dans le message */
  async function trash(ids: string[], label: string) {
    if (ids.length === 0) return
    await change((lib) => trashItems(lib, ids))
    checkedIds = new Set()
    showNotice(`${label} dans la corbeille (${TRASH_DAYS} jours).`, false, {
      label: 'Annuler',
      run: () => restore(ids),
    })
  }

  async function restore(ids: string[]) {
    await change((lib) => restoreItems(lib, ids))
    checkedIds = new Set()
    showNotice(
      ids.length === 1
        ? 'Élément remis à sa place.'
        : `${ids.length} éléments remis à leur place.`,
    )
  }

  let foreverIds = $state<string[] | null>(null)

  async function confirmDeleteForever() {
    const ids = foreverIds ?? []
    foreverIds = null
    let removed: string[] = []
    await change((lib) => {
      const result = deleteForever(lib, ids)
      removed = result.removedSheetIds
      return result.library
    })
    await deletePreviews(removed)
    checkedIds = new Set()
  }

  /** Supprime les éléments restés plus de `TRASH_DAYS` jours dans la corbeille */
  async function purgeExpired() {
    if (purgeTrash(library).library === library) return
    let removed: string[] = []
    await change((lib) => {
      const result = purgeTrash(lib)
      removed = result.removedSheetIds
      return result.library
    })
    await deletePreviews(removed)
  }

  function trashedOrigin(entry: TrashedItem): string {
    return [SPACE_LABELS[trashedSpace(entry)], ...entry.location].join(' › ')
  }

  async function change(transform: (lib: SheetLibrary) => SheetLibrary) {
    try {
      library = await updateLibrary(transform)
    } catch (error) {
      console.error('Enregistrement impossible', error)
      showNotice(
        'La modification n’a pas pu être enregistrée dans ce navigateur.',
        true,
      )
    }
  }

  // ---------- Ouvrir ----------

  function appBase(): string {
    return window.location.origin + window.location.pathname
  }

  function openSheet(sheet: SavedSheet) {
    window.location.assign(sheetUrl(sheet, appBase()))
  }

  function openSession(session: SavedSession) {
    window.location.assign(sessionUrl(session).href)
  }

  function openFolder(target: Space, folderId: string | null) {
    isTrashOpen = false
    panel = null
    space = target
    currentFolderId = folderId
    search = ''
  }

  // ---------- Sélections ----------

  /** Ouvre la sélection dans un nouvel onglet, dans sa vue ou dans `view` */
  function openSelection(selection: SavedSelection, view?: string) {
    window.open(selectionUrl(selection, appBase(), view), '_blank', 'noopener')
  }

  function editSelection(selection: SavedSelection) {
    // « Ajouter à mes sélections » proposera de mettre cette sélection à jour
    rememberEditedSelection(selection.id)
    window.location.assign(editExercisesUrl(selection, appBase()))
  }

  async function copySelectionLink(selection: SavedSelection) {
    try {
      await navigator.clipboard.writeText(selectionUrl(selection, appBase()))
      copiedId = selection.id
      clearTimeout(copiedTimer)
      copiedTimer = setTimeout(() => (copiedId = ''), 2000)
    } catch (error) {
      console.error('Copie impossible', error)
      showNotice('Le lien n’a pas pu être copié dans le presse-papier.', true)
    }
  }

  function openShortLink(selection: SavedSelection, qr = false) {
    shortFor = selection
    shortShowQr = qr
  }

  async function copyShortLink(selection: SavedSelection) {
    if (selection.shortLink === undefined) return
    if (await copyTextToClipboard(selection.shortLink.url)) {
      copiedShortId = selection.id
      setTimeout(() => {
        if (copiedShortId === selection.id) copiedShortId = ''
      }, 2000)
    } else {
      showNotice('Le lien n’a pas pu être copié dans le presse-papier.', true)
    }
  }

  /** Copie le lien de partage de la séance (exercices et réglages partageables) */
  async function copySessionLink(session: SavedSession) {
    try {
      await navigator.clipboard.writeText(sessionShareUrl(session).href)
      copiedId = session.id
      clearTimeout(copiedTimer)
      copiedTimer = setTimeout(() => (copiedId = ''), 2000)
    } catch (error) {
      console.error('Copie impossible', error)
      showNotice('Le lien n’a pas pu être copié dans le presse-papier.', true)
    }
  }

  /** Le lien court (créé, ou mis à jour) est gardé avec la sélection */
  async function saveShortLink(url: string, longUrl: string) {
    if (shortFor !== null) {
      await editSelectionData(shortFor, { shortLink: { url, longUrl } })
    }
  }

  /** Le lien court de la sélection ne mène plus à la version actuelle de la sélection */
  function isShortLinkStale(selection: SavedSelection): boolean {
    return (
      selection.shortLink !== undefined &&
      selection.shortLink.longUrl !== selectionUrl(selection, appBase())
    )
  }

  async function editSelectionData(
    selection: SavedSelection,
    data: SelectionChange,
  ) {
    await change((lib) => updateSelection(lib, selection.id, data))
  }

  async function saveSettings(data: SelectionChange) {
    const selection = settingsFor
    settingsFor = null
    if (selection !== null) await editSelectionData(selection, data)
  }

  function startComment(selection: SavedSelection) {
    commentFor = selection
    commentValue = selection.comment
  }

  async function saveComment() {
    const selection = commentFor
    commentFor = null
    if (selection !== null) {
      await editSelectionData(selection, { comment: commentValue })
    }
  }

  // ---------- Dossiers ----------

  async function addFolder(
    name: string,
    parentId: string | null,
    target: Space = space,
  ) {
    let id = ''
    await change((lib) =>
      changeFolders(lib, target, (set) => {
        const created = createFolder(set, name, parentId)
        id = created.folder.id
        return created.library
      }),
    )
    return id
  }

  async function submitNewFolder() {
    if (newFolderName.trim() === '') return
    await addFolder(newFolderName, currentFolderId)
    newFolderName = ''
    isNewFolderOpen = false
  }

  function countIn(target: Space, folderId: string | null): number {
    if (merged)
      return (
        countSheets(library, folderId) +
        countSelections(library, folderId) +
        countSessions(library, folderId)
      )
    if (target === 'feuilles') return countSheets(library, folderId)
    return target === 'selections'
      ? countSelections(library, folderId)
      : countSessions(library, folderId)
  }

  // ---------- Renommer ----------

  function startRename(id: string, name: string) {
    renamingId = id
    renameValue = name
  }

  function itemName(item: Item): string {
    if (item.kind === 'sheet') return item.sheet.name
    if (item.kind === 'selection') return item.selection.name
    if (item.kind === 'session') return item.session.name
    return item.folder.name
  }

  async function commitRename(item: Item) {
    if (renamingId === '') return
    const value = renameValue
    renamingId = ''
    if (value.trim() === '' || value === itemName(item)) return
    if (item.kind === 'sheet') {
      await change((lib) => renameSheet(lib, item.sheet.id, value))
    } else if (item.kind === 'selection') {
      await editSelectionData(item.selection, { name: value })
    } else if (item.kind === 'session') {
      await change((lib) => renameSession(lib, item.session.id, value))
    } else {
      await change((lib) =>
        changeFolders(lib, item.space, (set) =>
          renameFolder(set, item.folder.id, value),
        ),
      )
    }
  }

  function renameKeydown(event: KeyboardEvent, item: Item) {
    if (event.key === 'Enter') {
      event.preventDefault()
      commitRename(item)
    } else if (event.key === 'Escape') {
      event.preventDefault()
      renamingId = ''
    }
  }

  // ---------- Déplacer ----------

  function itemSpace(item: Item): Space {
    if (item.kind === 'sheet') return 'feuilles'
    if (item.kind === 'selection') return 'selections'
    if (item.kind === 'session') return 'seances'
    return item.space
  }

  function itemParent(item: Item): string | null {
    if (item.kind === 'sheet') return item.sheet.folderId
    if (item.kind === 'selection') return item.selection.folderId
    if (item.kind === 'session') return item.session.folderId
    return item.folder.parentId
  }

  function startMove(item: Item) {
    moving = item
    moveTarget = itemParent(item)
  }

  async function applyMove(item: Item, folderId: string | null) {
    if (item.kind === 'sheet') {
      await change((lib) => moveSheet(lib, item.sheet.id, folderId))
    } else if (item.kind === 'selection') {
      await change((lib) => moveSelection(lib, item.selection.id, folderId))
    } else if (item.kind === 'session') {
      await change((lib) => moveSession(lib, item.session.id, folderId))
    } else {
      await change((lib) =>
        changeFolders(lib, item.space, (set) =>
          moveFolder(set, item.folder.id, folderId),
        ),
      )
    }
  }

  async function confirmMove() {
    if (moving === null) return
    await applyMove(moving, moveTarget)
    moving = null
  }

  const movingDisabledIds = $derived(
    moving?.kind === 'folder'
      ? folderAndDescendants(foldersOf(library, moving.space), moving.folder.id)
      : new Set<string>(),
  )

  /** Un élément ne se dépose que dans un dossier de sa propre arborescence */
  function canDrop(target: Space, folderId: string | null): boolean {
    if (dragged === null || (!merged && itemSpace(dragged) !== target))
      return false
    if (itemParent(dragged) === folderId) return false
    return (
      dragged.kind !== 'folder' ||
      canMoveFolder(foldersOf(library, target), dragged.folder.id, folderId)
    )
  }

  async function dropOn(target: Space, folderId: string | null) {
    const item = dragged
    dragged = null
    if (item !== null && (merged || itemSpace(item) === target)) {
      await applyMove(item, folderId)
    }
  }

  function dragStart(event: DragEvent, item: Item) {
    dragged = item
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', itemName(item))
    }
  }

  function folderDropHandlers(target: Space, folderId: string | null) {
    return {
      ondragover: (event: DragEvent) => {
        if (!canDrop(target, folderId)) return
        event.preventDefault()
        if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
      },
      ondrop: (event: DragEvent) => {
        if (!canDrop(target, folderId)) return
        event.preventDefault()
        event.stopPropagation()
        dropOn(target, folderId)
      },
    }
  }

  function isDragged(id: string): boolean {
    if (dragged === null) return false
    if (dragged.kind === 'sheet') return dragged.sheet.id === id
    if (dragged.kind === 'selection') return dragged.selection.id === id
    if (dragged.kind === 'session') return dragged.session.id === id
    return dragged.folder.id === id
  }

  // ---------- Dupliquer, supprimer ----------

  async function duplicate(sheet: SavedSheet) {
    let copyId = ''
    await change((lib) => {
      const result = duplicateSheet(lib, sheet.id)
      copyId = result.sheet?.id ?? ''
      return result.library
    })
    if (copyId === '') return
    const preview = await loadPreview(sheet.id)
    if (preview !== undefined) await savePreview(copyId, preview)
  }

  /** Feuille ou sélection : à la corbeille sans confirmation (« Annuler ») */
  function deleteItem(item: Item) {
    if (item.kind === 'sheet') {
      trash([item.sheet.id], `Feuille « ${item.sheet.name} » placée`)
    } else if (item.kind === 'selection') {
      trash([item.selection.id], `Sélection « ${item.selection.name} » placée`)
    } else if (item.kind === 'session') {
      trash([item.session.id], `Séance « ${item.session.name} » placée`)
    } else {
      deleting = item
    }
  }

  async function confirmDelete() {
    const item = deleting
    const count = deletingCount
    deleting = null
    if (item?.kind === 'folder') {
      await change(
        (lib) => deleteFolder(lib, item.folder.id, item.space).library,
      )
      if (
        currentFolderId !== null &&
        !foldersOf(library, space).folders.some((f) => f.id === currentFolderId)
      ) {
        currentFolderId = item.folder.parentId
      }
      showNotice(
        count === 0
          ? `Dossier « ${item.folder.name} » supprimé.`
          : `Dossier « ${item.folder.name} » supprimé, son contenu est dans la corbeille.`,
      )
    }
  }

  const deletingCount = $derived(
    deleting?.kind === 'folder'
      ? countIn(deleting.space, deleting.folder.id)
      : 0,
  )

  // ---------- Exporter, importer ----------

  async function exportLibrary(scope: ExportedFolder | null = null) {
    try {
      const part = libraryPart(library, scope)
      const previews = await loadPreviews(part.sheets.map((s) => s.id))
      const current = scope === null ? loadSettings() : null
      const file = buildLibraryFile(library, previews, scope, current)
      const folderName =
        scope === null
          ? 'mes-sauvegardes'
          : (foldersOf(library, scope.space).folders.find(
              (f) => f.id === scope.folderId,
            )?.name ?? 'dossier')
      downloadBlob(
        new Blob([await zipLibraryFile(file)], {
          type: LIBRARY_FILE_MIME_TYPE,
        }),
        exportFileName(folderName),
      )
      backup = await updateBackupRecord((record) =>
        recordBackup(
          record,
          libraryItems(part),
          file.exportedAt,
          current === null ? undefined : settingsFingerprint(current),
          scope === null ? (library.organization?.updatedAt ?? '') : undefined,
        ),
      )
    } catch (error) {
      console.error('Export impossible', error)
      showNotice('L’export n’a pas abouti.', true)
    }
  }

  /**
   * Ajoute comme séance un fichier de réglages de la vue TBI (JSON des
   * anciennes versions du bouton « Sauvegarder » de la vue). La séance va dans
   * le dossier ouvert de « Mes séances », sinon à la racine.
   * @returns `true` si le fichier est un fichier de réglages de la vue TBI
   */
  async function importTbiFile(file: File, text: string): Promise<boolean> {
    let data: unknown
    try {
      data = JSON.parse(text)
    } catch {
      return false
    }
    if (!isTbiSettingsData(data)) return false
    const result = readTbiSettings(data)
    if ('error' in result) {
      showNotice(result.error, true)
      return true
    }
    // nom du fichier, sauf celui que proposait l'ancien bouton « Sauvegarder »
    const base = file.name.replace(/\.[^.]*$/, '').trim()
    const name = /^reglages-tbi/i.test(base)
      ? defaultSessionName(result.state)
      : base
    const folderId = merged || space === 'seances' ? currentFolderId : null
    let session: SavedSession | null = null
    await change((lib) => {
      const added = addSession(lib, name, folderId, result.state)
      session = added.session
      return added.library
    })
    const added = session as SavedSession | null
    if (added !== null) {
      requestPersistentStorage()
      openFolder('seances', added.folderId)
      showNotice(
        `Séance « ${added.name} » importée depuis le fichier de réglages.`,
      )
    }
    return true
  }

  async function importFile(file: File | undefined) {
    if (file === undefined) return
    try {
      const text = await readLibraryFileText(await file.arrayBuffer())
      if (await importTbiFile(file, text)) return
      const parsed = parseLibraryFile(text)
      let result: MergeResult | null = null
      await change((lib) => {
        result = mergeLibraries(lib, parsed.library)
        return result.library
      })
      const merged = result as MergeResult | null
      if (merged === null) return
      const previews = new Map(
        merged.importedSheetIds
          .filter((id) => parsed.previews.has(id))
          .map((id) => [id, parsed.previews.get(id)!] as const),
      )
      await savePreviews(previews)
      // les feuilles, sélections et séances qui sont, dans leur version actuelle, dans
      // ce fichier sont déjà sauvegardées ailleurs que dans le navigateur
      const inFile = new Map(
        libraryItems(parsed.library).map((item) => [item.id, item.updatedAt]),
      )
      const backedUp = libraryItems(library).filter(
        (item) => inFile.get(item.id) === item.updatedAt,
      )
      const parcoursCount =
        parsed.settings === null
          ? 0
          : mergeParcours(loadParcoursSettings(), parsed.settings.parcours)
              .imported
      const settingsCount =
        parsed.settings === null
          ? 0
          : // hors bêta, les parcours sont invisibles : comptés avec les réglages
            importSettings(parsed.settings) -
            ($globalOptions.beta ? parcoursCount : 0)
      settings = loadSettings()
      // réglages identiques à ceux du fichier : ils sont sauvegardés ailleurs
      const settingsInFile =
        parsed.settings !== null && settingsCoveredBy(parsed.settings, settings)
      backup = await updateBackupRecord((record) =>
        recordBackup(
          record,
          backedUp,
          null,
          settingsInFile ? settingsFingerprint(settings) : undefined,
          parsed.library.organization?.updatedAt ===
            library.organization?.updatedAt
            ? (library.organization?.updatedAt ?? '')
            : undefined,
        ),
      )
      requestPersistentStorage()
      const parts: string[] = []
      if (merged.added > 0)
        parts.push(
          `${plural(merged.added, 'élément')} ajouté${merged.added > 1 ? 's' : ''}`,
        )
      if (merged.updated > 0)
        parts.push(
          `${merged.updated} mise${merged.updated > 1 ? 's' : ''} à jour`,
        )
      if (merged.unchanged > 0) parts.push(`${merged.unchanged} déjà à jour`)
      if (parcoursCount > 0 && $globalOptions.beta)
        parts.push(
          `${parcoursCount} parcours importé${parcoursCount > 1 ? 's' : ''}`,
        )
      if (settingsCount > 0)
        parts.push(
          `${plural(settingsCount, 'réglage')} importé${settingsCount > 1 ? 's' : ''}`,
        )
      showNotice(
        parts.length > 0
          ? `Import terminé : ${parts.join(', ')}.`
          : parsed.settings !== null && hasSettings(parsed.settings)
            ? 'Import terminé : vos réglages étaient déjà à jour.'
            : 'Import terminé : le fichier ne contenait ni feuille, ni sélection, ni séance, ni réglage.',
      )
    } catch (error) {
      showNotice(
        error instanceof Error ? error.message : 'Import impossible.',
        true,
      )
    }
  }

  function isFileDrag(event: DragEvent): boolean {
    return (
      dragged === null && (event.dataTransfer?.types.includes('Files') ?? false)
    )
  }

  // ---------- Affichage ----------

  const dateFormat = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  function formatDate(iso: string): string {
    const date = new Date(iso)
    return Number.isNaN(date.getTime()) ? '' : dateFormat.format(date)
  }

  function locationOf(target: Space, folderId: string | null): string {
    return [
      SPACE_LABELS[target],
      ...folderPath(foldersOf(library, target), folderId).map((f) => f.name),
    ].join(' › ')
  }

  const starFilters: { value: Stars; label: string }[] = [
    { value: 0, label: 'Toutes' },
    { value: 1, label: '1 étoile ou plus' },
    { value: 2, label: '2 étoiles ou plus' },
    { value: 3, label: '3 étoiles' },
  ]
</script>

<svelte:head>
  <title>MathALÉA - Mes sauvegardes</title>
</svelte:head>

<svelte:window
  ondragover={(event) => {
    if (!isFileDrag(event)) return
    event.preventDefault()
    isFileOver = true
  }}
  ondragleave={(event) => {
    if (event.relatedTarget === null) isFileOver = false
  }}
  ondrop={(event) => {
    if (!isFileDrag(event)) return
    event.preventDefault()
    isFileOver = false
    importFile(event.dataTransfer?.files[0])
  }}
  ondragend={() => (dragged = null)}
/>

{#snippet renameInput(item: Item)}
  <!-- svelte-ignore a11y_autofocus -->
  <input
    type="text"
    class="{textInput} py-1"
    aria-label="Nouveau nom"
    autofocus
    bind:value={renameValue}
    onkeydown={(event) => renameKeydown(event, item)}
    onblur={() => commitRename(item)}
  />
{/snippet}

{#snippet spaceTree(target: Space)}
  <section class="flex flex-col gap-1">
    <h2
      class="px-2 text-xs font-bold uppercase tracking-wide text-coopmaths-struct dark:text-coopmathsdark-struct"
    >
      {merged ? 'Feuilles, sélections et séances' : SPACE_LABELS[target]}
    </h2>
    <FolderTree
      library={foldersOf(library, target)}
      rootLabel={merged
        ? 'Feuilles, sélections et séances'
        : SPACE_LABELS[target]}
      rootIcon={SPACE_ICONS[target]}
      count={(folderId) => countIn(target, folderId)}
      currentId={isSearching ||
      isTrashOpen ||
      panel !== null ||
      (!merged && space !== target)
        ? undefined
        : currentFolderId}
      onselect={(folderId) => openFolder(target, folderId)}
      canDrop={(folderId) => canDrop(target, folderId)}
      ondrop={(folderId) => dropOn(target, folderId)}
    />
  </section>
{/snippet}

{#snippet checkBox(id: string, name: string, position: string)}
  <input
    type="checkbox"
    class="{position} size-5 cursor-pointer rounded accent-coopmaths-action {checkedIds.has(
      id,
    ) || checkedVisible.length > 0
      ? ''
      : 'md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100'}"
    aria-label="Cocher {name}"
    checked={checkedIds.has(id)}
    onchange={() => toggleChecked(id)}
  />
{/snippet}

{#snippet trashView()}
  <div class="flex flex-row flex-wrap items-center gap-3">
    <h2
      class="text-xl font-bold text-coopmaths-struct dark:text-coopmathsdark-struct"
    >
      <i class="bx bx-trash" aria-hidden="true"></i> Corbeille
    </h2>
    <span class={quietText}>
      Les éléments supprimés y restent {TRASH_DAYS} jours, puis sont effacés définitivement.
    </span>
    <span class="grow"></span>
    {#if trashEntries.length > 0}
      <button
        type="button"
        class="{secondaryButton} py-1 text-sm"
        onclick={() => (foreverIds = trashEntries.map((t) => t.item.id))}
      >
        <i class="bx bx-trash-alt" aria-hidden="true"></i> Vider la corbeille
      </button>
    {/if}
  </div>
  {#if checkedVisible.length > 0}
    <div
      class="sticky top-16 z-[5] flex flex-row flex-wrap items-center gap-3 rounded-lg px-4 py-2 bg-coopmaths-action/10 dark:bg-coopmathsdark-action/20 border border-coopmaths-action dark:border-coopmathsdark-action"
      role="region"
      aria-label="Éléments cochés"
    >
      <span class="font-semibold">
        {plural(checkedVisible.length, 'élément')} coché{checkedVisible.length >
        1
          ? 's'
          : ''}
      </span>
      <button
        type="button"
        class="text-sm underline hover:text-coopmaths-action dark:hover:text-coopmathsdark-action"
        onclick={checkAll}
      >
        {checkedVisible.length === visibleIds.length
          ? 'Tout décocher'
          : `Tout cocher (${visibleIds.length})`}
      </button>
      <span class="grow"></span>
      <button
        type="button"
        class="{primaryButton} py-1 text-sm"
        onclick={() => restore(checkedVisible)}
      >
        <i class="bx bx-undo" aria-hidden="true"></i> Restaurer
      </button>
      <button
        type="button"
        class="{dangerButton} py-1 text-sm"
        onclick={() => (foreverIds = checkedVisible)}
      >
        <i class="bx bx-trash" aria-hidden="true"></i> Supprimer définitivement
      </button>
    </div>
  {/if}
  {#if trashEntries.length === 0}
    <p class={quietText}>La corbeille est vide.</p>
  {:else}
    <ul class="flex flex-col gap-2">
      {#each trashEntries as entry (entry.item.id)}
        {@const days = trashDaysLeft(entry)}
        <li
          class="group flex flex-row flex-wrap items-center gap-3 rounded-lg border px-4 py-2 {checkedIds.has(
            entry.item.id,
          )
            ? 'border-coopmaths-action dark:border-coopmathsdark-action'
            : 'border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest'}"
        >
          {@render checkBox(entry.item.id, entry.item.name, '')}
          <i
            class="bx {SPACE_ICONS[
              trashedSpace(entry)
            ]} text-2xl text-coopmaths-action dark:text-coopmathsdark-action"
            aria-hidden="true"
          ></i>
          <div class="flex min-w-0 flex-1 flex-col">
            <span class="font-semibold truncate">
              {entry.item.name}
              {#if entry.kind === 'sheet' && sheetKind(entry.item) === 'tex'}
                <LatexLogo class="ml-1 text-sm opacity-80" />
              {/if}
            </span>
            <span class="{quietText} truncate">
              Était dans {trashedOrigin(entry)} · supprimé le {formatDate(
                entry.deletedAt,
              )} · {days === 0
                ? 'effacé aujourd’hui'
                : `effacé dans ${plural(days, 'jour')}`}
            </span>
          </div>
          <button
            type="button"
            class="{secondaryButton} py-1 text-sm"
            onclick={() => restore([entry.item.id])}
          >
            <i class="bx bx-undo" aria-hidden="true"></i> Restaurer
          </button>
          <button
            type="button"
            class={iconButton}
            title="Supprimer définitivement"
            aria-label="Supprimer définitivement {entry.item.name}"
            onclick={() => (foreverIds = [entry.item.id])}
          >
            <i class="bx bx-trash text-lg"></i>
          </button>
        </li>
      {/each}
    </ul>
  {/if}
{/snippet}

<div
  class="flex flex-col min-h-screen bg-coopmaths-canvas dark:bg-coopmathsdark-canvas text-coopmaths-corpus dark:text-coopmathsdark-corpus"
>
  <NavBar
    subtitle="Mes sauvegardes"
    subtitleType="export"
    handleLanguage={() => {}}
    locale={$referentielLocale}
    showLanguage={false}
  />

  <div
    class="sticky top-0 z-10 flex flex-row flex-wrap items-center gap-3 px-4 md:px-8 py-3 border-b border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
  >
    <label class="relative flex items-center grow max-w-md">
      <i
        class="bx bx-search absolute left-3 text-lg opacity-60"
        aria-hidden="true"
      ></i>
      <input
        type="search"
        class="{textInput} pl-9"
        placeholder={$globalOptions.beta
          ? 'Rechercher une feuille, une sélection, une séance, un parcours, un modèle, un exercice…'
          : 'Rechercher une feuille, une sélection, une séance, un modèle, un exercice…'}
        aria-label="Rechercher dans mes sauvegardes"
        bind:value={search}
      />
    </label>
    <div class="grow"></div>
    <button
      type="button"
      class={secondaryButton}
      title="Où sont enregistrées mes sauvegardes ? Comment les sauvegarder ?"
      onclick={() => (isHelpOpen = true)}
    >
      <i class="bx bx-help-circle" aria-hidden="true"></i> Aide
    </button>
    <button
      type="button"
      class={secondaryButton}
      title="Créer un dossier dans « {currentFolder?.name ?? rootLabel} »"
      onclick={() => {
        newFolderName = ''
        isNewFolderOpen = true
      }}
    >
      <i class="bx bx-folder-plus" aria-hidden="true"></i> Nouveau dossier
    </button>
    <button
      type="button"
      class={secondaryButton}
      title="Coller une adresse web pour l’ajouter à « Mes sélections »"
      onclick={() => (isNewSelectionOpen = true)}
    >
      <i class="bx bx-bookmark-plus" aria-hidden="true"></i> Ajouter un lien
    </button>
    <label
      class={secondaryButton}
      title="Reprendre des sauvegardes exportées (fichier {LIBRARY_FILE_EXTENSION}, ou fichier JSON de réglages de la vue TBI), sans rien effacer"
    >
      <i class="bx bx-import" aria-hidden="true"></i> Importer
      <input
        type="file"
        accept="{LIBRARY_FILE_EXTENSION},application/json"
        class="hidden"
        onchange={(event) => {
          const input = event.currentTarget
          importFile(input.files?.[0])
          input.value = ''
        }}
      />
    </label>
    <button
      type="button"
      class={primaryButton}
      disabled={!canExport}
      title="Télécharger toutes mes feuilles, sélections, séances et réglages dans un fichier {LIBRARY_FILE_EXTENSION}"
      onclick={() => exportLibrary()}
    >
      <i class="bx bx-export" aria-hidden="true"></i> Exporter tout
    </button>
  </div>

  {#if isFileOver}
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-coopmaths-canvas/90 dark:bg-coopmathsdark-canvas/90 pointer-events-none"
    >
      <p
        class="rounded-xl border-2 border-dashed border-coopmaths-action dark:border-coopmathsdark-action px-10 py-8 text-xl font-bold text-coopmaths-struct dark:text-coopmathsdark-struct"
      >
        Déposez le fichier {LIBRARY_FILE_EXTENSION} (ou JSON de la vue TBI) pour importer
        ses sauvegardes
      </p>
    </div>
  {/if}

  <div class="flex flex-1 flex-col md:flex-row w-full max-w-screen-2xl mx-auto">
    <aside
      class="md:w-64 shrink-0 px-4 py-4 md:py-6 flex flex-col gap-6 md:border-r border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest"
    >
      {@render spaceTree('feuilles')}
      {#if !merged}
        {@render spaceTree('selections')}
      {/if}
      {#if !merged}{@render spaceTree('seances')}{/if}
      {#if $globalOptions.beta}
        <section class="flex flex-col gap-1">
          <h2
            class="px-2 text-xs font-bold uppercase tracking-wide text-coopmaths-struct dark:text-coopmathsdark-struct"
          >
            Mes parcours
          </h2>
          <button
            type="button"
            class="flex items-center gap-2 rounded px-2 py-1 text-sm text-left {panel ===
            'parcours'
              ? 'bg-coopmaths-action/15 dark:bg-coopmathsdark-action/20 font-semibold text-coopmaths-action dark:text-coopmathsdark-action'
              : 'hover:bg-coopmaths-canvas-dark dark:hover:bg-coopmathsdark-canvas-dark'}"
            aria-current={panel === 'parcours' ? 'page' : undefined}
            title="Parcours de l’application MathALÉA préparés dans la vue Parcours"
            onclick={() => openPanel('parcours')}
          >
            <i class="bx bx-book-content" aria-hidden="true"></i>
            <span class="truncate">Parcours pour l’application</span>
            <span class="ml-auto text-xs opacity-60"
              >{settings.parcours.library.entries.length}</span
            >
          </button>
        </section>
      {/if}
      <section class="flex flex-col gap-1">
        <h2
          class="px-2 text-xs font-bold uppercase tracking-wide text-coopmaths-struct dark:text-coopmathsdark-struct"
        >
          Liens raccourcis
        </h2>
        <button
          type="button"
          class="flex items-center gap-2 rounded px-2 py-1 text-sm text-left {panel ===
          'liens'
            ? 'bg-coopmaths-action/15 dark:bg-coopmathsdark-action/20 font-semibold text-coopmaths-action dark:text-coopmathsdark-action'
            : 'hover:bg-coopmaths-canvas-dark dark:hover:bg-coopmathsdark-canvas-dark'}"
          aria-current={panel === 'liens' ? 'page' : undefined}
          title="Vos liens edurl.fr vers coopmaths.fr et mathalea.fr"
          onclick={() => openPanel('liens')}
        >
          <i class="bx bx-link-alt" aria-hidden="true"></i>
          <span class="truncate">Liens edurl.fr</span>
        </button>
      </section>
      <section class="flex flex-col gap-1">
        <h2
          class="px-2 text-xs font-bold uppercase tracking-wide text-coopmaths-struct dark:text-coopmathsdark-struct"
        >
          Mes réglages
        </h2>
        {#each [{ value: 'affichage' as const, label: 'Affichage', icon: 'bx-layout', count: '', title: 'Organisation des feuilles et des sélections' }, { value: 'modeles' as const, label: 'Modèles de document', icon: 'bx-palette', count: settings.preferences.typstModels.length, title: 'Réglages enregistrés de la vue Impression' }, { value: 'classes' as const, label: 'Classes', icon: 'bx-group', count: settings.classes.classes.length, title: 'Classes du tirage au sort de la vue vidéoprojecteur' }, { value: 'diaporamas' as const, label: 'Historique des diaporamas', icon: 'bx-slideshow', count: settings.slideshowHistory.length, title: 'Diaporamas lancés depuis cet ordinateur' }, { value: 'jeton' as const, label: 'Jeton edurl.fr', icon: 'bx-key', count: settings.edurlToken.value === null ? '' : '✓', title: 'Jeton d’accès au raccourcisseur de liens edurl.fr' }] as entry (entry.value)}
          <button
            type="button"
            class="flex items-center gap-2 rounded px-2 py-1 text-sm text-left {panel ===
            entry.value
              ? 'bg-coopmaths-action/15 dark:bg-coopmathsdark-action/20 font-semibold text-coopmaths-action dark:text-coopmathsdark-action'
              : 'hover:bg-coopmaths-canvas-dark dark:hover:bg-coopmathsdark-canvas-dark'}"
            aria-current={panel === entry.value ? 'page' : undefined}
            title={entry.title}
            onclick={() => openPanel(entry.value)}
          >
            <i class="bx {entry.icon}" aria-hidden="true"></i>
            <span class="truncate">{entry.label}</span>
            <span class="ml-auto text-xs opacity-60">{entry.count}</span>
          </button>
        {/each}
      </section>
      <button
        type="button"
        class="flex items-center gap-2 rounded px-2 py-1 text-sm text-left {isTrashOpen
          ? 'bg-coopmaths-action/15 dark:bg-coopmathsdark-action/20 font-semibold text-coopmaths-action dark:text-coopmathsdark-action'
          : 'hover:bg-coopmaths-canvas-dark dark:hover:bg-coopmathsdark-canvas-dark'} {isTrashTarget
          ? 'ring-2 ring-coopmaths-action dark:ring-coopmathsdark-action'
          : ''}"
        aria-current={isTrashOpen ? 'page' : undefined}
        title="Feuilles, sélections et séances supprimées depuis moins de {TRASH_DAYS} jours (glisser un élément ici pour le supprimer)"
        onclick={() => {
          isTrashOpen = true
          panel = null
          search = ''
        }}
        ondragover={(event) => {
          if (dragged === null || dragged.kind === 'folder') return
          event.preventDefault()
          isTrashTarget = true
        }}
        ondragleave={() => (isTrashTarget = false)}
        ondrop={(event) => {
          event.preventDefault()
          isTrashTarget = false
          const item = dragged
          dragged = null
          if (item !== null) deleteItem(item)
        }}
      >
        <i class="bx bx-trash" aria-hidden="true"></i>
        <span class="truncate">Corbeille</span>
        <span class="ml-auto text-xs opacity-60">{library.trash.length}</span>
      </button>
    </aside>

    <main class="flex-1 min-w-0 px-4 md:px-8 py-6 flex flex-col gap-6">
      {#if isLoaded && (backupState.total > 0 || settingsPrint !== '')}
        {@const isSafe =
          backupState.onlyInBrowser === 0 && !backupState.settingsOnlyInBrowser}
        <section
          aria-label="État de la sauvegarde"
          class="flex flex-row flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border px-4 py-3 {isSafe
            ? 'border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest'
            : 'border-coopmaths-warn-dark dark:border-coopmathsdark-warn-dark bg-coopmaths-warn-lightest/40 dark:bg-coopmathsdark-warn-lightest/10'}"
        >
          <i
            class="bx text-3xl {isSafe
              ? 'bx-check-shield text-coopmaths-action dark:text-coopmathsdark-action'
              : 'bx-error text-coopmaths-warn-dark dark:text-coopmathsdark-warn-dark'}"
            aria-hidden="true"
          ></i>
          <div class="flex min-w-60 flex-1 flex-col gap-1">
            <p class="font-semibold">
              {#if isSafe}
                Toutes vos sauvegardes sont aussi dans un fichier.
              {:else if backupState.onlyInBrowser === 0}
                Vos réglages ne sont que dans ce navigateur.
              {:else if backupState.onlyInBrowser === backupState.total}
                {backupState.total === 1
                  ? 'Votre sauvegarde n’est que dans ce navigateur'
                  : `Vos ${backupState.total} sauvegardes ne sont que dans ce navigateur`}
                (100&nbsp;%).
              {:else}
                {plural(backupState.onlyInBrowser, 'sauvegarde')} sur {backupState.total}
                ({backupState.percent}&nbsp;%)
                {backupState.onlyInBrowser > 1 ? 'ne sont' : 'n’est'} que dans ce
                navigateur.
              {/if}
            </p>
            {#if backupState.settingsOnlyInBrowser}
              <p class={quietText}>
                {backupState.onlyInBrowser === 0
                  ? `Organisation des dossiers, modèles de document, classes, lien pour les élèves, historique des diaporamas${$globalOptions.beta ? ', parcours' : ''}, jeton edurl.fr.`
                  : `Vos réglages aussi (organisation des dossiers, modèles de document, classes, lien pour les élèves, historique des diaporamas${$globalOptions.beta ? ', parcours' : ''}, jeton edurl.fr).`}
              </p>
            {/if}
            {#if backupState.total > 0}
              <div
                class="h-1.5 w-full max-w-md overflow-hidden rounded-full bg-coopmaths-warn-dark/30 dark:bg-coopmathsdark-warn-dark/30"
                role="meter"
                aria-label="Part des sauvegardes copiées dans un fichier"
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow={100 - backupState.percent}
              >
                <div
                  class="h-full bg-coopmaths-action dark:bg-coopmathsdark-action"
                  style="width: {100 - backupState.percent}%"
                ></div>
              </div>
            {/if}
            <p class={quietText}>
              {backupState.lastExportAt === null
                ? 'Aucun export pour l’instant.'
                : `Dernier export le ${formatDate(backupState.lastExportAt)}.`}
              <button
                type="button"
                class="underline hover:text-coopmaths-action dark:hover:text-coopmathsdark-action"
                onclick={() => (isHelpOpen = true)}
                >Pourquoi sauvegarder ?</button
              >
            </p>
            {#if autoSave.kind === 'active'}
              <p class="text-sm flex flex-row flex-wrap items-center gap-x-2">
                <i
                  class="bx bx-sync text-coopmaths-action dark:text-coopmathsdark-action"
                  aria-hidden="true"
                ></i>
                Sauvegarde automatique dans « {autoSave.fileName} »{backup.lastAutoSaveAt
                  ? ` (dernière écriture le ${formatDate(backup.lastAutoSaveAt)})`
                  : ''}.
                <button
                  type="button"
                  class="underline hover:text-coopmaths-action dark:hover:text-coopmathsdark-action"
                  onclick={startAutoSave}>Changer de fichier</button
                >
                <button
                  type="button"
                  class="underline hover:text-coopmaths-action dark:hover:text-coopmathsdark-action"
                  onclick={endAutoSave}>Arrêter</button
                >
              </p>
            {:else if autoSave.kind === 'paused'}
              <p class="text-sm flex flex-row flex-wrap items-center gap-2">
                <i
                  class="bx bx-pause-circle text-coopmaths-warn-dark dark:text-coopmathsdark-warn-dark"
                  aria-hidden="true"
                ></i>
                Sauvegarde automatique en pause : le navigateur demande à nouveau
                l’autorisation d’écrire dans « {autoSave.fileName} ».
                <button
                  type="button"
                  class="{secondaryButton} py-0.5 text-sm"
                  onclick={restartAutoSave}
                >
                  <i class="bx bx-play" aria-hidden="true"></i> Reprendre
                </button>
              </p>
            {:else if autoSave.kind === 'error'}
              <p class="text-sm flex flex-row flex-wrap items-center gap-2">
                <i
                  class="bx bx-error-circle text-coopmaths-warn-dark dark:text-coopmathsdark-warn-dark"
                  aria-hidden="true"
                ></i>
                La sauvegarde automatique dans « {autoSave.fileName} » a échoué (fichier
                déplacé ou supprimé ?).
                <button
                  type="button"
                  class="{secondaryButton} py-0.5 text-sm"
                  onclick={startAutoSave}
                >
                  <i class="bx bx-file" aria-hidden="true"></i> Choisir un fichier
                </button>
              </p>
            {/if}
          </div>
          {#if autoSave.kind === 'off'}
            <button
              type="button"
              class="{secondaryButton} py-1 text-sm"
              title="Choisir un fichier que MathALÉA réécrira après chaque modification (par exemple dans un dossier synchronisé avec Nextcloud)"
              onclick={startAutoSave}
            >
              <i class="bx bx-sync" aria-hidden="true"></i> Sauvegarde automatique
            </button>
          {/if}
          {#if !isSafe}
            <button
              type="button"
              class="{primaryButton} py-1 text-sm"
              onclick={() => exportLibrary()}
            >
              <i class="bx bx-export" aria-hidden="true"></i> Exporter tout
            </button>
          {/if}
        </section>
      {/if}

      {#if notice !== ''}
        <p
          class="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 flex flex-row items-center gap-3 w-max max-w-[90vw] rounded-lg px-4 py-3 shadow-lg {noticeIsError
            ? 'bg-coopmaths-warn-lightest dark:bg-coopmathsdark-warn-lightest text-coopmaths-warn-darkest dark:text-coopmathsdark-warn-darkest'
            : 'bg-coopmaths-struct dark:bg-coopmathsdark-struct text-coopmaths-canvas dark:text-coopmathsdark-canvas'}"
          role="status"
        >
          <span class="flex-1">{notice}</span>
          {#if noticeAction !== null}
            {@const action = noticeAction}
            <button
              type="button"
              class="font-bold underline"
              onclick={() => {
                notice = ''
                action.run()
              }}>{action.label}</button
            >
          {/if}
          <button
            type="button"
            aria-label="Fermer le message"
            onclick={() => (notice = '')}
          >
            <i class="bx bx-x text-xl"></i>
          </button>
        </p>
      {/if}

      {#if loadError}
        <p
          class="rounded-lg px-4 py-3 bg-coopmaths-warn-lightest dark:bg-coopmathsdark-warn-lightest text-coopmaths-warn-darkest dark:text-coopmathsdark-warn-darkest"
        >
          Ce navigateur ne permet pas d’enregistrer de sauvegardes (navigation
          privée ou stockage désactivé). L’import d’un fichier
          {LIBRARY_FILE_EXTENSION} n’est pas possible non plus.
        </p>
      {:else if !isLoaded}
        <div class="flex justify-center py-24">
          <i class="bx bx-loader-alt bx-spin text-4xl" aria-hidden="true"></i>
        </div>
      {:else if isTrashOpen}
        {@render trashView()}
      {:else if panel === 'parcours' && $globalOptions.beta}
        <ParcoursPanel
          parcours={settings.parcours}
          {search}
          ondelete={removeParcours}
          {formatDate}
        />
      {:else if panel === 'affichage'}
        <section class="flex flex-col gap-6" aria-label="Affichage">
          <h2
            class="text-xl font-bold text-coopmaths-struct dark:text-coopmathsdark-struct"
          >
            Affichage
          </h2>
          <div class="flex max-w-lg flex-col gap-2">
            <label class="flex flex-col gap-1 text-sm">
              Organisation des sauvegardes
              <select
                class={textInput}
                value={merged ? 'merged' : 'separate'}
                disabled={!isLoaded || loadError}
                onchange={(event) =>
                  changeOrganization(event.currentTarget.value === 'merged')}
              >
                <option value="separate"
                  >Feuilles, sélections et séances séparées</option
                >
                <option value="merged">Dossiers communs</option>
              </select>
            </label>
            <p class={quietText}>
              Choisir des espaces séparés ou des dossiers communs pouvant
              contenir des feuilles, des sélections et des séances.
            </p>
          </div>
        </section>
      {:else if panel === 'modeles'}
        <TypstModelsPanel
          preferences={settings.preferences}
          {search}
          onchange={changePreferences}
          {formatDate}
        />
      {:else if panel === 'classes'}
        <StudentClassesPanel
          classes={settings.classes}
          {search}
          onchange={changeClasses}
          {formatDate}
        />
      {:else if panel === 'diaporamas'}
        <SlideshowHistoryPanel
          items={settings.slideshowHistory}
          {search}
          onchange={changeSlideshows}
          {formatDate}
        />
      {:else if panel === 'jeton'}
        <EdurlTokenPanel
          token={settings.edurlToken}
          onchange={changeEdurlToken}
          {formatDate}
        />
      {:else if panel === 'liens'}
        <ShortLinksPanel
          token={settings.edurlToken.value}
          selections={library.selections}
          {search}
          ontokenchange={changeEdurlToken}
          onnotice={(text, isError) => showNotice(text, isError)}
          {formatDate}
        />
      {:else}
        {#if checkedVisible.length > 0}
          <div
            class="sticky top-16 z-[5] flex flex-row flex-wrap items-center gap-3 rounded-lg px-4 py-2 bg-coopmaths-action/10 dark:bg-coopmathsdark-action/20 border border-coopmaths-action dark:border-coopmathsdark-action"
            role="region"
            aria-label="Éléments cochés"
          >
            <span class="font-semibold">
              {plural(checkedVisible.length, 'élément')}
              coché{checkedVisible.length > 1 ? 's' : ''}
            </span>
            <button
              type="button"
              class="text-sm underline hover:text-coopmaths-action dark:hover:text-coopmathsdark-action"
              onclick={checkAll}
            >
              {checkedVisible.length === visibleIds.length
                ? 'Tout décocher'
                : `Tout cocher (${visibleIds.length})`}
            </button>
            <span class="grow"></span>
            <button
              type="button"
              class="{secondaryButton} py-1 text-sm"
              disabled={checkedSpace === null}
              title={checkedSpace === null
                ? 'Des éléments de « Mes feuilles », « Mes sélections » et « Mes séances » ne se rangent pas dans les mêmes dossiers'
                : 'Déplacer dans un autre dossier'}
              onclick={() => {
                bulkMoveTarget = isSearching ? null : currentFolderId
                isBulkMoveOpen = true
              }}
            >
              <i class="bx bx-move" aria-hidden="true"></i> Déplacer
            </button>
            <button
              type="button"
              class="{dangerButton} py-1 text-sm"
              onclick={() =>
                trash(
                  checkedVisible,
                  `${plural(checkedVisible.length, 'élément')} placé${checkedVisible.length > 1 ? 's' : ''}`,
                )}
            >
              <i class="bx bx-trash" aria-hidden="true"></i> Supprimer
            </button>
            <button
              type="button"
              class={iconButton}
              title="Tout décocher"
              aria-label="Tout décocher"
              onclick={() => (checkedIds = new Set())}
            >
              <i class="bx bx-x text-xl"></i>
            </button>
          </div>
        {/if}
        <!-- Fil d'Ariane, cible de dépôt comme l'arborescence -->
        {#if isSearching}
          <h2
            class="text-xl font-bold text-coopmaths-struct dark:text-coopmathsdark-struct"
          >
            {sheets.length + selections.length + sessions.length === 0
              ? 'Aucune sauvegarde ne correspond à la recherche'
              : [
                  sheets.length > 0 ? plural(sheets.length, 'feuille') : '',
                  selections.length > 0
                    ? plural(selections.length, 'sélection')
                    : '',
                  sessions.length > 0 ? plural(sessions.length, 'séance') : '',
                ]
                  .filter((part) => part !== '')
                  .join(', ')
                  .replace(/, ([^,]*)$/, ' et $1') +
                (sheets.length + selections.length + sessions.length > 1
                  ? ' trouvées'
                  : ' trouvée')}
          </h2>
        {:else}
          <nav
            aria-label="Chemin du dossier"
            class="flex flex-row flex-wrap items-center gap-1 text-lg"
          >
            <button
              type="button"
              class="rounded px-1 font-bold {currentFolderId === null
                ? 'text-coopmaths-struct dark:text-coopmathsdark-struct'
                : 'text-coopmaths-action dark:text-coopmathsdark-action hover:underline'}"
              onclick={() => openFolder(space, null)}
              {...folderDropHandlers(space, null)}
            >
              {rootLabel}
            </button>
            {#each path as folder (folder.id)}
              <i class="bx bx-chevron-right opacity-60" aria-hidden="true"></i>
              <button
                type="button"
                class="rounded px-1 font-bold {folder.id === currentFolderId
                  ? 'text-coopmaths-struct dark:text-coopmathsdark-struct'
                  : 'text-coopmaths-action dark:text-coopmathsdark-action hover:underline'}"
                onclick={() => openFolder(space, folder.id)}
                {...folderDropHandlers(space, folder.id)}
              >
                {folder.name}
              </button>
            {/each}
            {#if currentFolder !== undefined}
              <span class="ml-2 flex flex-row items-center gap-1">
                <button
                  type="button"
                  class={iconButton}
                  title="Renommer ce dossier"
                  aria-label="Renommer ce dossier"
                  onclick={() =>
                    startRename(currentFolder.id, currentFolder.name)}
                >
                  <i class="bx bx-rename text-xl"></i>
                </button>
                <button
                  type="button"
                  class={iconButton}
                  title="Exporter ce dossier ({LIBRARY_FILE_EXTENSION})"
                  aria-label="Exporter ce dossier"
                  onclick={() =>
                    exportLibrary({ space, folderId: currentFolder.id })}
                >
                  <i class="bx bx-export text-xl"></i>
                </button>
              </span>
            {/if}
          </nav>
          {#if currentFolder !== undefined && renamingId === currentFolder.id}
            <div class="max-w-md">
              {@render renameInput({
                kind: 'folder',
                space,
                folder: currentFolder,
              })}
            </div>
          {/if}
        {/if}

        {#if isLibraryEmpty}
          <div
            class="flex flex-col items-start gap-3 max-w-2xl rounded-xl px-6 py-6 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark"
          >
            <h2
              class="text-xl font-bold text-coopmaths-struct dark:text-coopmathsdark-struct"
            >
              Aucune sauvegarde pour l’instant
            </h2>
            <p>
              <strong>Feuilles</strong> : composez une feuille d’exercices,
              ouvrez-la dans la vue <strong>Impression</strong> ou
              <strong>LaTeX</strong>, puis cliquez sur
              <strong><i class="bx bx-save"></i> Enregistrer</strong>. Elle
              apparaîtra ici avec ses réglages et ses retouches.
            </p>
            <p>
              <strong>Sélections</strong> : dans la conception de document ou la
              page du lien pour les élèves, cliquez sur
              <i class="bx bx-bookmark-plus" aria-hidden="true"></i>
              <strong>Ajouter à mes sélections</strong>, ou collez ici une
              adresse web avec « Ajouter un lien ».
            </p>
            <p>
              <strong>Séances au vidéoprojecteur</strong> : dans la vue
              <strong>Vidéoprojection</strong>, cliquez sur
              <i class="bx bx-save" aria-hidden="true"></i>
              <strong>Enregistrer</strong> pour garder les exercices, leurs graines
              et la disposition de la séance. Un ancien fichier JSON de réglages de
              la vue s’importe aussi avec « Importer ».
            </p>
            <p class={quietText}>
              Vous avez déjà un fichier {LIBRARY_FILE_EXTENSION} ? Importez-le avec
              le bouton « Importer » ou déposez-le sur cette page.
            </p>
          </div>
        {/if}

        {#if !isSearching && subFolders.length > 0}
          <section
            aria-label="Dossiers"
            class="grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-3"
          >
            {#each subFolders as folder (folder.id)}
              {@const item = { kind: 'folder' as const, space, folder }}
              {@const count = countIn(space, folder.id)}
              <div
                role="group"
                aria-label="Dossier {folder.name}"
                draggable={renamingId !== folder.id}
                ondragstart={(event) => dragStart(event, item)}
                class="group flex flex-row items-center gap-2 rounded-lg border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest px-3 py-2 hover:border-coopmaths-action dark:hover:border-coopmathsdark-action {isDragged(
                  folder.id,
                )
                  ? 'opacity-50'
                  : ''}"
                {...folderDropHandlers(space, folder.id)}
              >
                <i
                  class="bx bxs-folder text-3xl text-coopmaths-action dark:text-coopmathsdark-action"
                  aria-hidden="true"
                ></i>
                {#if renamingId === folder.id}
                  <div class="grow">{@render renameInput(item)}</div>
                {:else}
                  <button
                    type="button"
                    class="flex min-w-0 grow flex-col text-left"
                    onclick={() => openFolder(space, folder.id)}
                  >
                    <span class="truncate font-semibold">{folder.name}</span>
                    <span class={quietText}>
                      {count === 0
                        ? 'vide'
                        : plural(
                            count,
                            merged
                              ? 'élément'
                              : space === 'feuilles'
                                ? 'feuille'
                                : space === 'selections'
                                  ? 'sélection'
                                  : 'séance',
                          )}
                    </span>
                  </button>
                  <span
                    class="flex flex-row opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
                  >
                    <button
                      type="button"
                      class={iconButton}
                      title="Renommer"
                      aria-label="Renommer le dossier {folder.name}"
                      onclick={() => startRename(folder.id, folder.name)}
                    >
                      <i class="bx bx-rename text-lg"></i>
                    </button>
                    <button
                      type="button"
                      class={iconButton}
                      title="Déplacer"
                      aria-label="Déplacer le dossier {folder.name}"
                      onclick={() => startMove(item)}
                    >
                      <i class="bx bx-move text-lg"></i>
                    </button>
                    <button
                      type="button"
                      class={iconButton}
                      title="Supprimer"
                      aria-label="Supprimer le dossier {folder.name}"
                      onclick={() => deleteItem(item)}
                    >
                      <i class="bx bx-trash text-lg"></i>
                    </button>
                  </span>
                {/if}
              </div>
            {/each}
          </section>
        {/if}

        {#if sheets.length > 0}
          <section aria-label="Feuilles" class="flex flex-col gap-3">
            {#if isSearching || merged}
              <h3
                class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct"
              >
                <i class="bx {SPACE_ICONS.feuilles}" aria-hidden="true"></i>
                {SPACE_LABELS.feuilles}
              </h3>
            {/if}
            <div
              class="grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-5"
            >
              {#each sheets as sheet (sheet.id)}
                {@const item = { kind: 'sheet' as const, sheet }}
                <article
                  draggable={renamingId !== sheet.id}
                  ondragstart={(event) => dragStart(event, item)}
                  class="group relative flex flex-col overflow-hidden rounded-lg border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark shadow-sm hover:shadow-md {isDragged(
                    sheet.id,
                  )
                    ? 'opacity-50'
                    : ''} {checkedIds.has(sheet.id)
                    ? 'ring-2 ring-coopmaths-action dark:ring-coopmathsdark-action'
                    : ''}"
                >
                  {@render checkBox(
                    sheet.id,
                    sheet.name,
                    'absolute left-2 top-2 z-[1]',
                  )}
                  {#if sheetKind(sheet) === 'omr'}
                    <span
                      class="absolute right-2 top-2 z-[1] rounded bg-white px-2 py-1 text-xs text-slate-800"
                    >
                      <i class="bx bx-scan" aria-hidden="true"></i> Évaluation avec
                      scan
                    </span>
                  {/if}
                  {#if sheetKind(sheet) === 'tex'}
                    <LatexLogo
                      badge
                      class="absolute right-2 top-2 z-[1] pointer-events-none"
                    />
                  {/if}
                  <button
                    type="button"
                    class="block border-b border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest"
                    title="Aperçu"
                    aria-label="Aperçu de {sheet.name}"
                    onclick={() => (previewSheet = sheet)}
                  >
                    <SheetThumbnail
                      sheetId={sheet.id}
                      version={sheet.updatedAt}
                    />
                  </button>
                  <div class="flex flex-col gap-1 px-3 pt-2">
                    {#if renamingId === sheet.id}
                      {@render renameInput(item)}
                    {:else}
                      <h3
                        class="font-semibold leading-tight line-clamp-2"
                        title={sheet.name}
                      >
                        {sheet.name}
                      </h3>
                    {/if}
                    {#if isSearching}
                      <span
                        class="{quietText} truncate"
                        title={locationOf('feuilles', sheet.folderId)}
                      >
                        <i class="bx bx-folder" aria-hidden="true"></i>
                        {locationOf('feuilles', sheet.folderId)}
                      </span>
                    {/if}
                    <span class={quietText}>{formatDate(sheet.updatedAt)}</span>
                    {#if sheet.exercises.length > 0}
                      <span
                        class="{quietText} truncate"
                        title={sheet.exercises.join(', ')}
                      >
                        {sheet.exercises.length} exercice{sheet.exercises
                          .length > 1
                          ? 's'
                          : ''} :
                        {sheet.exercises.join(', ')}
                      </span>
                    {/if}
                  </div>
                  <div
                    class="mt-auto flex flex-row flex-wrap items-center gap-0.5 px-2 py-2"
                  >
                    <button
                      type="button"
                      class="{primaryButton} px-3 py-1 text-sm"
                      title="Rouvrir dans la vue {SHEET_KIND_LABELS[
                        sheetKind(sheet)
                      ]} pour la modifier"
                      onclick={() => openSheet(sheet)}
                    >
                      <i class="bx bx-edit" aria-hidden="true"></i> Modifier
                    </button>
                    <span class="grow"></span>
                    <button
                      type="button"
                      class={iconButton}
                      title="Renommer"
                      aria-label="Renommer {sheet.name}"
                      onclick={() => startRename(sheet.id, sheet.name)}
                    >
                      <i class="bx bx-rename text-lg"></i>
                    </button>
                    <button
                      type="button"
                      class={iconButton}
                      title="Déplacer"
                      aria-label="Déplacer {sheet.name}"
                      onclick={() => startMove(item)}
                    >
                      <i class="bx bx-move text-lg"></i>
                    </button>
                    <button
                      type="button"
                      class={iconButton}
                      title="Dupliquer"
                      aria-label="Dupliquer {sheet.name}"
                      onclick={() => duplicate(sheet)}
                    >
                      <i class="bx bx-duplicate text-lg"></i>
                    </button>
                    <button
                      type="button"
                      class={iconButton}
                      title="Supprimer"
                      aria-label="Supprimer {sheet.name}"
                      onclick={() => deleteItem(item)}
                    >
                      <i class="bx bx-trash text-lg"></i>
                    </button>
                  </div>
                </article>
              {/each}
            </div>
          </section>
        {/if}

        {#if sessions.length > 0}
          <section aria-label="Séances" class="flex flex-col gap-3">
            {#if isSearching || merged}
              <h3
                class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct"
              >
                <i class="bx {SPACE_ICONS.seances}" aria-hidden="true"></i>
                {SPACE_LABELS.seances}
              </h3>
            {/if}
            {#each sessions as session (session.id)}
              {@const item = { kind: 'session' as const, session }}
              <SessionItem
                {session}
                isChecked={checkedIds.has(session.id)}
                isCheckVisible={checkedVisible.length > 0}
                oncheck={() => toggleChecked(session.id)}
                location={isSearching
                  ? locationOf('seances', session.folderId)
                  : undefined}
                date={formatDate(session.updatedAt)}
                isDragged={isDragged(session.id)}
                isCopied={copiedId === session.id}
                renameField={renamingId === session.id
                  ? sessionRename
                  : undefined}
                ondragstart={(event) => dragStart(event, item)}
                onopen={() => openSession(session)}
                oncopy={() => copySessionLink(session)}
                onrename={() => startRename(session.id, session.name)}
                onmove={() => startMove(item)}
                onduplicate={() =>
                  change((lib) => duplicateSession(lib, session.id).library)}
                ondelete={() => deleteItem(item)}
              />
              {#snippet sessionRename()}
                {@render renameInput(item)}
              {/snippet}
            {/each}
          </section>
        {/if}

        {#if hasSelections}
          <section aria-label="Sélections" class="flex flex-col gap-3">
            <div class="flex flex-row flex-wrap items-center gap-x-4 gap-y-2">
              {#if isSearching || merged}
                <h3
                  class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct"
                >
                  <i class="bx {SPACE_ICONS.selections}" aria-hidden="true"></i>
                  {SPACE_LABELS.selections}
                </h3>
              {/if}
              <span class="grow"></span>
              <label
                class="flex flex-row items-center gap-2 text-sm whitespace-nowrap"
              >
                Trier par
                <select
                  class="{textInput} w-auto py-1 text-sm"
                  bind:value={selectionOrder}
                >
                  <option value="nom">nom</option>
                  <option value="etoiles">étoiles</option>
                  <option value="date">date de modification</option>
                  <option value="vue">vue (élève, diaporama…)</option>
                </select>
              </label>
              <label
                class="flex flex-row items-center gap-2 text-sm whitespace-nowrap"
              >
                Afficher
                <select
                  class="{textInput} w-auto py-1 text-sm"
                  bind:value={minStars}
                >
                  {#each starFilters as filter (filter.value)}
                    <option value={filter.value}>{filter.label}</option>
                  {/each}
                </select>
              </label>
            </div>
            {#each selectionGroups as group (group.title)}
              {#if group.title !== ''}
                <h4
                  class="mt-2 font-semibold text-coopmaths-struct dark:text-coopmathsdark-struct"
                >
                  {group.title}
                  <span class="{quietText} font-normal"
                    >({group.items.length})</span
                  >
                </h4>
              {/if}
              {#each group.items as selection (selection.id)}
                {@const item = { kind: 'selection' as const, selection }}
                <SelectionItem
                  {selection}
                  isChecked={checkedIds.has(selection.id)}
                  isCheckVisible={checkedVisible.length > 0}
                  oncheck={() => toggleChecked(selection.id)}
                  location={isSearching
                    ? locationOf('selections', selection.folderId)
                    : undefined}
                  date={formatDate(selection.updatedAt)}
                  isDragged={isDragged(selection.id)}
                  isCopied={copiedId === selection.id}
                  isHighlighted={highlightId === selection.id}
                  renameField={renamingId === selection.id
                    ? selectionRename
                    : undefined}
                  ondragstart={(event) => dragStart(event, item)}
                  onopen={(view) => openSelection(selection, view)}
                  oncopy={() => copySelectionLink(selection)}
                  onshortlink={() => openShortLink(selection)}
                  oncopyshort={() => copyShortLink(selection)}
                  onshortqr={() => openShortLink(selection, true)}
                  isShortCopied={copiedShortId === selection.id}
                  isShortStale={isShortLinkStale(selection)}
                  onsettings={() => (settingsFor = selection)}
                  onedit={() => editSelection(selection)}
                  onstars={(stars) => editSelectionData(selection, { stars })}
                  oncomment={() => startComment(selection)}
                  onrename={() => startRename(selection.id, selection.name)}
                  onmove={() => startMove(item)}
                  onduplicate={() =>
                    change(
                      (lib) => duplicateSelection(lib, selection.id).library,
                    )}
                  ondelete={() => deleteItem(item)}
                />
                {#snippet selectionRename()}
                  {@render renameInput(item)}
                {/snippet}
              {/each}
            {:else}
              <p class={quietText}>
                Aucune sélection n’a autant d’étoiles ici.
                <button
                  type="button"
                  class="underline hover:text-coopmaths-action dark:hover:text-coopmathsdark-action"
                  onclick={() => (minStars = 0)}>Afficher toutes</button
                >
              </p>
            {/each}
          </section>
        {/if}

        {#if !isSearching && !isLibraryEmpty && subFolders.length === 0 && sheets.length === 0 && sessions.length === 0 && !hasSelections}
          <p class={quietText}>
            {#if merged}
              Ce dossier est vide. Glissez-y des feuilles, des sélections ou des
              séances, ou enregistrez-y un nouveau contenu.
            {:else if space === 'feuilles'}
              Ce dossier est vide. Glissez-y des feuilles ou enregistrez-y une
              fiche depuis la vue Impression ou LaTeX.
            {:else if space === 'seances'}
              Ce dossier est vide. Glissez-y des séances, enregistrez-y l’état
              de la vue Vidéoprojection avec le bouton « Enregistrer », ou
              importez un fichier JSON de réglages de cette vue.
            {:else}
              Ce dossier est vide. Glissez-y des sélections, ajoutez-y un lien
              ou utilisez le bouton « Ajouter à mes sélections » de la
              conception de document.
            {/if}
          </p>
        {/if}
      {/if}
    </main>
  </div>
</div>

<SheetDialog
  open={isHelpOpen}
  title="Où sont enregistrées mes sauvegardes ?"
  width="max-w-2xl"
  onclose={() => (isHelpOpen = false)}
>
  <div class="flex flex-col gap-4 leading-relaxed">
    <section class="flex flex-col gap-1">
      <h3
        class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct"
      >
        <i class="bx bx-lock-alt" aria-hidden="true"></i> Tout reste sur cet ordinateur
      </h3>
      <p>
        Vos feuilles, vos sélections, vos séances, vos dossiers et les aperçus
        sont enregistrés dans ce navigateur, sur cet ordinateur. Rien ne
        transite par les serveurs de MathALÉA&nbsp;: ni vos sauvegardes, ni
        votre nom, ni aucune autre donnée personnelle. Il n’y a pas de compte à
        créer.
      </p>
    </section>
    <section class="flex flex-col gap-1">
      <h3
        class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct"
      >
        <i class="bx bx-error" aria-hidden="true"></i> Ces données peuvent disparaître
      </h3>
      <p>
        Vos sauvegardes ne sont pas disponibles sur un autre ordinateur ni dans
        un autre navigateur. Elles sont perdues si les données de navigation
        sont effacées, en navigation privée, après une réinitialisation de
        l’ordinateur, ou quand le navigateur fait de la place (Safari efface les
        données d’un site qui n’a pas été ouvert depuis sept jours).
      </p>
    </section>
    <section class="flex flex-col gap-1">
      <h3
        class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct"
      >
        <i class="bx bx-bookmarks" aria-hidden="true"></i> Feuilles, sélections et
        séances
      </h3>
      <p>
        <strong>Mes feuilles</strong> rassemble les fiches enregistrées depuis
        la vue Impression et la vue LaTeX (repérées par le logo
        <LatexLogo />), avec leurs retouches. <strong>Mes sélections</strong>
        rassemble des liens vers des exercices&nbsp;: ajoutés avec le bouton
        <i class="bx bx-bookmark-plus" aria-hidden="true"></i> de la conception
        de document ou du lien pour les élèves, ou collés avec « Ajouter un lien
        ». Chaque sélection garde ses réglages (vue, interactivité,
        présentation), un commentaire et de 0 à 3 étoiles.
        <strong>Mes séances au vidéoprojecteur</strong>
        rassemble l’état de la vue Vidéoprojection, enregistré avec le bouton
        <i class="bx bx-save" aria-hidden="true"></i>&nbsp;: exercices et
        graines, disposition (colonnes, placement libre, onglets), zoom,
        corrections et widgets. « Ouvrir » rétablit la séance à l’identique.
      </p>
      <p>
        {#if $globalOptions.beta}
          <strong>Mes parcours</strong> rassemble les parcours de l’application MathALÉA
          préparés dans la vue Parcours, avec leurs classes et leurs objectifs&nbsp;:
          les rouvrir pour les modifier, ou les supprimer.
        {/if}
        <strong>Mes réglages</strong> rassemble les modèles de document de la
        vue Impression (à modifier, renommer, dupliquer ou supprimer), les
        classes du tirage au sort de la vue vidéoprojecteur (élèves et nombre de
        tirages) et l’historique des diaporamas lancés depuis cet ordinateur,
        ainsi que le jeton d’accès à edurl.fr. <strong>Liens raccourcis</strong> liste vos liens
        courts edurl.fr vers coopmaths.fr et mathalea.fr (créés avec les boutons «
        Lien raccourci » de MathALÉA)&nbsp;: les ouvrir, les copier, les renommer
        ou les supprimer.
      </p>
      <p>
        Cochez plusieurs éléments pour les déplacer ou les supprimer d’un coup.
        Un élément supprimé reste {TRASH_DAYS} jours dans la
        <strong>corbeille</strong>, d’où il peut être remis à sa place.
      </p>
    </section>
    <section
      class="flex flex-col gap-1 rounded-lg px-4 py-3 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark"
    >
      <h3 class="font-bold">Responsabilité</h3>
      <p>
        L’association CoopMaths, qui édite MathALÉA, ne peut être tenue
        responsable de la perte de ces données. Il appartient à chacun de
        sauvegarder son travail.
      </p>
    </section>
    <section class="flex flex-col gap-1">
      <h3
        class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct"
      >
        <i class="bx bx-export" aria-hidden="true"></i> Sauvegarder son travail
      </h3>
      <ol class="list-decimal pl-6 flex flex-col gap-1">
        <li>
          Cliquer sur « Exporter tout » pour télécharger un fichier
          {LIBRARY_FILE_EXTENSION} qui contient toutes vos feuilles, vos sélections,
          vos séances et leurs dossiers, ainsi que {$globalOptions.beta
            ? 'vos parcours de l’application et '
            : ''}vos réglages&nbsp;: modèles de document de la vue Impression,
          réglages du lien pour les élèves, historique des diaporamas et jeton
          edurl.fr. Ce fichier contient donc votre jeton&nbsp;: ne le partagez
          pas.
        </li>
        <li>
          Ranger ce fichier dans un espace lui-même sauvegardé&nbsp;: votre
          Nextcloud sur apps.education.fr, l’ENT, une clé USB, un service de
          stockage en ligne…
        </li>
        <li>
          Sur un autre ordinateur, ou après une perte, cliquer sur « Importer »
          et choisir ce fichier. L’import n’efface rien&nbsp;: il ajoute les
          feuilles, sélections, séances, {$globalOptions.beta
            ? 'parcours, '
            : ''}réglages absents et met à jour ceux qui ont changé. Un ancien
          fichier JSON de la vue Vidéoprojection est ajouté comme une séance.
        </li>
      </ol>
      <p>
        <strong>Sauvegarde automatique (Chrome, Edge).</strong> Le bouton «
        Sauvegarde automatique » fait choisir un fichier
        {LIBRARY_FILE_EXTENSION} que MathALÉA réécrit après chaque modification. Placé
        dans un dossier synchronisé (client Nextcloud d’apps.education.fr, OneDrive…),
        il est aussi copié dans le nuage. À la réouverture du navigateur, cliquer
        sur « Reprendre » pour l’autoriser de nouveau (ou choisir « Autoriser à chaque
        visite »). Firefox et Safari ne le permettent pas : y exporter régulièrement.
      </p>
      <p>
        Le cadre « État de la sauvegarde » indique la part de vos sauvegardes
        qui n’existe que dans ce navigateur&nbsp;: une feuille, une sélection ou
        une séance créée, modifiée, renommée ou déplacée depuis le dernier
        export y est comptée. Exportez de nouveau dès qu’il n’est plus vert.
      </p>
    </section>
    <div class="flex flex-row justify-end">
      <button
        type="button"
        class={primaryButton}
        onclick={() => (isHelpOpen = false)}>J’ai compris</button
      >
    </div>
  </div>
</SheetDialog>

<SheetDialog
  open={previewSheet !== null}
  title={previewSheet?.name ?? ''}
  width="max-w-4xl"
  onclose={() => (previewSheet = null)}
>
  {#if previewSheet !== null}
    {@const sheet = previewSheet}
    <div class="flex flex-col gap-4">
      <div class="flex flex-row flex-wrap items-center gap-3">
        {#if sheetKind(sheet) === 'tex'}
          <LatexLogo badge class="ring-1 ring-black/20" />
        {/if}
        <span class={quietText}>
          {locationOf('feuilles', sheet.folderId)} · modifiée le {formatDate(
            sheet.updatedAt,
          )}
        </span>
        <span class="grow"></span>
        <button
          type="button"
          class={primaryButton}
          onclick={() => openSheet(sheet)}
        >
          <i class="bx bx-edit" aria-hidden="true"></i> Modifier
        </button>
      </div>
      <div
        class="rounded-lg bg-coopmaths-canvas-darkest dark:bg-coopmathsdark-canvas-darkest p-4"
      >
        <SheetThumbnail sheetId={sheet.id} version={sheet.updatedAt} allPages />
      </div>
      <p class={quietText}>
        {#if sheetKind(sheet) === 'tex'}
          L’aperçu montre les premières pages du PDF tel qu’il a été compilé à
          l’enregistrement. « Modifier » régénère la feuille à l’identique dans
          la vue LaTeX (le code retouché à la main est conservé).
        {:else}
          L’aperçu montre la feuille telle qu’elle a été enregistrée (premier
          sujet affiché). « Modifier » la régénère à l’identique dans la vue
          Impression.
        {/if}
      </p>
    </div>
  {/if}
</SheetDialog>

<SheetDialog
  open={moving !== null}
  title={moving === null
    ? ''
    : moving.kind === 'folder'
      ? `Déplacer le dossier « ${moving.folder.name} »`
      : `Déplacer « ${itemName(moving)} »`}
  onclose={() => (moving = null)}
>
  {#if moving !== null}
    {@const target = itemSpace(moving)}
    <div class="flex flex-col gap-4">
      <FolderPicker
        library={foldersOf(library, target)}
        rootLabel={merged
          ? 'Feuilles, sélections et séances'
          : SPACE_LABELS[target]}
        bind:selected={moveTarget}
        disabledIds={movingDisabledIds}
        oncreate={(name, parentId) => addFolder(name, parentId, target)}
      />
      <div class="flex flex-row justify-end gap-3">
        <button
          type="button"
          class={secondaryButton}
          onclick={() => (moving = null)}>Annuler</button
        >
        <button type="button" class={primaryButton} onclick={confirmMove}>
          <i class="bx bx-move" aria-hidden="true"></i> Déplacer ici
        </button>
      </div>
    </div>
  {/if}
</SheetDialog>

<SheetDialog
  open={deleting !== null}
  title="Supprimer le dossier ?"
  onclose={() => (deleting = null)}
>
  <div class="flex flex-col gap-4">
    <p>
      {#if deleting?.kind === 'folder'}
        {@const word = merged
          ? 'élément'
          : deleting.space === 'feuilles'
            ? 'feuille'
            : deleting.space === 'selections'
              ? 'sélection'
              : 'séance'}
        Le dossier « {deleting.folder.name} » et ses sous-dossiers seront supprimés.
        {deletingCount === 0
          ? 'Il est vide.'
          : deletingCount === 1
            ? `Son contenu ira dans la corbeille pour ${TRASH_DAYS} jours.`
            : `Les ${plural(deletingCount, word)} qu’il contient iront dans la corbeille pour ${TRASH_DAYS} jours.`}
        Restaurer {deletingCount > 1 ? 'l’une d’elles' : 'son contenu'} recréera le
        dossier.
      {/if}
    </p>
    <div class="flex flex-row justify-end gap-3">
      <button
        type="button"
        class={secondaryButton}
        onclick={() => (deleting = null)}>Annuler</button
      >
      <button type="button" class={dangerButton} onclick={confirmDelete}>
        <i class="bx bx-trash" aria-hidden="true"></i> Supprimer
      </button>
    </div>
  </div>
</SheetDialog>

<SheetDialog
  open={isBulkMoveOpen}
  title="Déplacer {plural(checkedVisible.length, 'élément')}"
  onclose={() => (isBulkMoveOpen = false)}
>
  {#if isBulkMoveOpen && checkedSpace !== null}
    {@const target = checkedSpace}
    <div class="flex flex-col gap-4">
      <FolderPicker
        library={foldersOf(library, target)}
        rootLabel={merged
          ? 'Feuilles, sélections et séances'
          : SPACE_LABELS[target]}
        bind:selected={bulkMoveTarget}
        oncreate={(name, parentId) => addFolder(name, parentId, target)}
      />
      <div class="flex flex-row justify-end gap-3">
        <button
          type="button"
          class={secondaryButton}
          onclick={() => (isBulkMoveOpen = false)}>Annuler</button
        >
        <button type="button" class={primaryButton} onclick={moveChecked}>
          <i class="bx bx-move" aria-hidden="true"></i> Déplacer ici
        </button>
      </div>
    </div>
  {/if}
</SheetDialog>

<SheetDialog
  open={foreverIds !== null}
  title="Supprimer définitivement ?"
  onclose={() => (foreverIds = null)}
>
  <div class="flex flex-col gap-4">
    <p>
      {foreverIds?.length === 1
        ? 'Cet élément sera supprimé de ce navigateur.'
        : `Ces ${foreverIds?.length ?? 0} éléments seront supprimés de ce navigateur.`}
      Cette action est définitive, sauf si vous avez exporté vos sauvegardes.
    </p>
    <div class="flex flex-row justify-end gap-3">
      <button
        type="button"
        class={secondaryButton}
        onclick={() => (foreverIds = null)}>Annuler</button
      >
      <button type="button" class={dangerButton} onclick={confirmDeleteForever}>
        <i class="bx bx-trash" aria-hidden="true"></i> Supprimer définitivement
      </button>
    </div>
  </div>
</SheetDialog>

<SheetDialog
  open={isNewFolderOpen}
  title="Nouveau dossier"
  onclose={() => (isNewFolderOpen = false)}
>
  <form
    class="flex flex-col gap-4"
    onsubmit={(event) => {
      event.preventDefault()
      submitNewFolder()
    }}
  >
    <label class="flex flex-col gap-1">
      <span>
        Dans « {currentFolder?.name ?? rootLabel} »
      </span>
      <!-- svelte-ignore a11y_autofocus -->
      <input
        type="text"
        class={textInput}
        placeholder="Nom du dossier"
        required
        autofocus
        bind:value={newFolderName}
      />
    </label>
    <div class="flex flex-row justify-end gap-3">
      <button
        type="button"
        class={secondaryButton}
        onclick={() => (isNewFolderOpen = false)}>Annuler</button
      >
      <button type="submit" class={primaryButton}>
        <i class="bx bx-folder-plus" aria-hidden="true"></i> Créer
      </button>
    </div>
  </form>
</SheetDialog>

<SheetDialog
  open={isNewSelectionOpen}
  title="Ajouter un lien à mes sélections"
  onclose={() => (isNewSelectionOpen = false)}
>
  <NewSelectionForm
    {library}
    folderId={merged || space === 'selections' ? currentFolderId : null}
    oncancel={() => (isNewSelectionOpen = false)}
    onsaved={(next, selection) => {
      library = next
      isNewSelectionOpen = false
      openFolder('selections', selection.folderId)
    }}
  />
</SheetDialog>

<ShortLinkDialog
  open={shortFor !== null}
  getUrl={() => (shortFor === null ? '' : selectionUrl(shortFor, appBase()))}
  title={shortFor?.name ?? ''}
  existing={shortFor?.shortLink === undefined
    ? undefined
    : { shortUrl: shortFor.shortLink.url, longUrl: shortFor.shortLink.longUrl }}
  showQr={shortShowQr}
  oncreated={saveShortLink}
  onclose={() => (shortFor = null)}
/>

<SheetDialog
  open={settingsFor !== null}
  title="Réglages de « {settingsFor?.name ?? ''} »"
  width="max-w-2xl"
  onclose={() => (settingsFor = null)}
>
  {#if settingsFor !== null}
    <SelectionSettings
      selection={settingsFor}
      base={appBase()}
      oncancel={() => (settingsFor = null)}
      onsave={saveSettings}
    />
  {/if}
</SheetDialog>

<SheetDialog
  open={commentFor !== null}
  title="Commentaire de « {commentFor?.name ?? ''} »"
  onclose={() => (commentFor = null)}
>
  <form
    class="flex flex-col gap-4"
    onsubmit={(event) => {
      event.preventDefault()
      saveComment()
    }}
  >
    <label class="flex flex-col gap-1">
      <span class={quietText}>
        Pour vous seul : ce commentaire n’apparaît pas dans le lien. N’y
        indiquez aucune donnée personnelle d’élève (nom, résultat…).
      </span>
      <!-- svelte-ignore a11y_autofocus -->
      <textarea
        class={textInput}
        rows="6"
        maxlength={COMMENT_MAX_LENGTH}
        autofocus
        placeholder="Marche bien en début de séquence, question 3 difficile…"
        bind:value={commentValue}
      ></textarea>
    </label>
    <div class="flex flex-row justify-end gap-3">
      <button
        type="button"
        class={secondaryButton}
        onclick={() => (commentFor = null)}>Annuler</button
      >
      <button type="submit" class={primaryButton}>
        <i class="bx bx-check" aria-hidden="true"></i> Enregistrer
      </button>
    </div>
  </form>
</SheetDialog>
