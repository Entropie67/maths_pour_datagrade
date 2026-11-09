<script lang="ts">
  import { onDestroy, onMount, tick, untrack } from 'svelte'
  import { get, type Unsubscriber } from 'svelte/store'
  import { isStatic, isSvelte } from '../../../lib/components/componentsUtils'
  import { getStaticExercicePngUrls } from '../../../lib/components/exercisesUtils'
  import {
    mathaleaHandleParamOfOneExercice,
    mathaleaLoadExerciceFromUuid,
    mathaleaUpdateUrlFromExercicesParams,
  } from '../../../lib/mathalea'
  import { SESSION_URL_PARAM } from '../../../lib/mesFeuilles/library'
  import {
    isStorageAvailable,
    loadLibrary,
  } from '../../../lib/mesFeuilles/storage'
  import {
    currentSessionStore,
    exercicesParams,
    tbiParamStore,
  } from '../../../lib/stores/generalStore'
  import {
    activeTbiTab,
    areTbiCardsAtDefaultPlace,
    balanceTbiColumnsByHeight,
    addTbiBoard,
    enterTbiSeries,
    ensureTbiBoard,
    addTbiTab,
    applyTbiBoards,
    applyTbiSharedState,
    decodeTbiParam,
    deleteTbiCard,
    encodeTbiParam,
    getTbiSharedState,
    importTbiSettings,
    loadTbiDraft,
    isTbiCardInteractive,
    loadTbiLocalLayout,
    reconcileTbiCards,
    removeTbiTab,
    reorderTbiCard,
    moveTbiCardInColumns,
    saveTbiDraft,
    saveTbiLocalLayout,
    setTbiTabLayout,
    setTbiTabNbColumns,
    setTbiTabSingleColumnAlign,
    renameTbiTab,
    rescaleTbiFreeCards,
    setTbiCardsCorrectionShown,
    setTbiCardsGeometry,
    setTbiCardsZoom,
    shuffleTbiCards,
    stepTbiActiveTab,
    tbiIsShuffling,
    tbiState,
    tbiTabCardIndices,
    tbiTabLabel,
    tbiTimerAlarm,
    updateTbiBoard,
    type TbiState,
  } from '../../../lib/stores/tbiStore'
  import {
    openTbiDocuments,
    openTbiViewers,
    readSavedDocuments,
    restoreTbiLinkViewers,
  } from '../../../lib/stores/tbiDocumentStore'
  import { isTbiToolShown, tbiTools } from '../../../lib/stores/tbiToolsStore'
  import { supportedFiles } from '../../../lib/tbiDocument'
  import { linksOfUriList, parseTbiLink } from '../../../lib/tbiLink'
  import { showTbiToast } from '../../../lib/stores/tbiToastStore'
  import { fitZoom } from '../../../lib/components/tbiFit'
  import {
    forceTbiControls,
    installTbiControls,
    tbiControlsVisible,
    tbiEditing,
    tbiOpenPanel,
    tbiWriting,
    toggleTbiFullscreen,
  } from '../../../lib/tbiControls'
  import { tbiLabelPlain } from '../../../lib/tbiLabel'
  import {
    redoTbiBoard,
    resetTbiBoardHistory,
    undoTbiBoard,
  } from '../../../lib/stores/tbiBoardStore'
  import { freeLayoutColumns, packFreeCards } from '../../../lib/tbiLayout'
  import { TBI_BOTTOM_RESERVE } from '../../../lib/tbiToolPlacement'
  import type { InterfaceParams } from '../../../lib/types'
  import TypstAddExerciseModal from '../../setup/typst/addExercise/TypstAddExerciseModal.svelte'
  import TbiBoardBackground from './TbiBoardBackground.svelte'
  import TbiBoardCanvas from './TbiBoardCanvas.svelte'
  import TbiEmptyState from './TbiEmptyState.svelte'
  import TbiMathText from './TbiMathText.svelte'
  import TbiTimerAlarm from './TbiTimerAlarm.svelte'
  import TbiToast from './TbiToast.svelte'
  import TbiBar from './TbiBar.svelte'
  import TbiToolsLayer from './TbiToolsLayer.svelte'
  import type { TbiItem, TbiTabEntry } from './tbiTypes'
  import TbiTabView from './layouts/TbiTabView.svelte'

  let items: TbiItem[] = $state([])
  let isReady = $state(false)
  let uuids: string[] = []
  let tbiStateUnsubscriber: Unsubscriber | undefined
  let lastEncodedSharedState = ''
  let syncUrlTimer: ReturnType<typeof setTimeout> | undefined

  let nextItemKey = 0

  async function buildTbiItem(
    param: InterfaceParams,
    index: number,
  ): Promise<TbiItem> {
    const base = {
      paramsIndex: index,
      uuid: param.uuid,
      id: param.id ?? param.uuid,
      key: nextItemKey++,
    }
    if (isStatic(param.uuid)) {
      // annale scannée / banque externe : affichée telle quelle comme image
      return {
        ...base,
        exercise: null,
        staticContent: getStaticExercicePngUrls(param.uuid),
      }
    }
    if (isSvelte(param.uuid)) {
      return { ...base, exercise: null, staticContent: null }
    }
    const exercise = await mathaleaLoadExerciceFromUuid(param.uuid)
    if (!exercise) {
      return { ...base, exercise: null, staticContent: null }
    }
    mathaleaHandleParamOfOneExercice(exercise, param)
    exercise.numeroExercice = index
    exercise.interactif = isTbiCardInteractive(exercise, param.interactif)
    return { ...base, exercise, staticContent: null }
  }

  async function loadItems() {
    const params = get(exercicesParams)
    const result: TbiItem[] = []
    for (let i = 0; i < params.length; i++) {
      result.push(await buildTbiItem(params[i], i))
    }
    items = result
    uuids = items.map((item) => item.uuid)
  }

  function persistLayout() {
    saveTbiLocalLayout(uuids)
  }

  /** Titre de chaque exercice : le nom par défaut de son onglet */
  function titleOf(item: TbiItem): string {
    return item.exercise?.titre ?? item.staticContent?.title ?? item.id
  }

  // copie : l'état est muté en place, un $derived de la même référence ne se
  // recalculerait pas
  const activeTab = $derived({ ...activeTbiTab($tbiState) })
  const tabEntries: TbiTabEntry[] = $derived(
    $tbiState.tabs.map((tab) => ({
      id: tab.id,
      label: tbiTabLabel(tab, $tbiState, items.map(titleOf)),
    })),
  )
  const activeTabLabel = $derived(
    tabEntries.find((entry) => entry.id === activeTab.id)?.label ?? '',
  )

  /**
   * Pendant l'écriture, un tapotement trace un point : les commandes restent
   * affichées. Chaque onglet parcouru reçoit de quoi écrire.
   */
  $effect(() => {
    forceTbiControls($tbiWriting)
    if ($tbiWriting && activeTab.board === undefined) {
      untrack(() => ensureTbiBoard(activeTab.id))
    }
  })

  /** Modale « Ajouter un exercice » (déclenchée depuis la barre d'outils) */
  let isAddExerciseOpen = $state(false)

  function openAddExercise() {
    isAddExerciseOpen = true
  }

  /**
   * Ajoute une ressource à la fin de l'affichage : ses paramètres rejoignent
   * exercicesParams (donc l'URL), une carte TBI est créée pour elle
   * (reconcileTbiCards) et la disposition est persistée.
   * @param {InterfaceParams} params paramètres de l'exercice choisi
   */
  async function addExerciseToTbi(params: InterfaceParams) {
    exercicesParams.update((list) => [...list, params])
    const item = await buildTbiItem(params, items.length)
    items = [...items, item]
    uuids = items.map((i) => i.uuid)
    reconcileTbiCards(uuids)
    persistLayout()
  }

  /**
   * Photographie de la séance (ordre et paramètres des exercices, état des
   * cartes), pour annuler une suppression ou un mélange. Les objets `item`
   * sont conservés tels quels : ils portent l'exercice déjà construit.
   */
  function takeSnapshot() {
    return {
      params: get(exercicesParams).map((params) => ({ ...params })),
      state: JSON.parse(JSON.stringify(get(tbiState))) as TbiState,
      tools: [...get(tbiTools)],
      items: [...items],
    }
  }

  function restoreSnapshot(snapshot: ReturnType<typeof takeSnapshot>) {
    exercicesParams.set(snapshot.params)
    tbiState.set(snapshot.state)
    tbiTools.set(snapshot.tools)
    items = snapshot.items.map((item, i) => {
      item.paramsIndex = i
      if (item.exercise) item.exercise.numeroExercice = i
      return item
    })
    uuids = items.map((item) => item.uuid)
    persistLayout()
    mathaleaUpdateUrlFromExercicesParams()
  }

  /** Nouvelles données pour les exercices affichés : on peut revenir en arrière */
  function newDataFor(paramsIndices: number[]) {
    const seeds = new Map(
      items.flatMap((item) =>
        item.exercise && paramsIndices.includes(item.paramsIndex)
          ? [[item.paramsIndex, item.exercise.seed]]
          : [],
      ) as [number, string | undefined][],
    )
    document.dispatchEvent(
      new CustomEvent('tbiNewData', { detail: paramsIndices }),
    )
    showTbiToast('Nouvelles données', {
      label: 'Annuler',
      run: () =>
        document.dispatchEvent(
          new CustomEvent('tbiRestoreSeeds', { detail: seeds }),
        ),
    })
  }

  /**
   * Mélange aléatoirement l'ordre des exercices puis réaligne `items` sur la
   * permutation obtenue. Active brièvement `tbiIsShuffling` pour que les
   * dispositions animent le glissement des cartes vers leur nouvelle place.
   */
  let shuffleResetTimer: ReturnType<typeof setTimeout> | undefined
  function applyShuffle() {
    const snapshot = takeSnapshot()
    const order = shuffleTbiCards()
    if (!order) return
    showTbiToast('Ordre des exercices mélangé', {
      label: 'Annuler',
      run: () => restoreSnapshot(snapshot),
    })
    tbiIsShuffling.set(true)
    items = order.map((oldIndex, newIndex) => {
      const item = items[oldIndex]
      item.paramsIndex = newIndex
      if (item.exercise) item.exercise.numeroExercice = newIndex
      return item
    })
    uuids = items.map((item) => item.uuid)
    persistLayout()
    if (shuffleResetTimer !== undefined) clearTimeout(shuffleResetTimer)
    // fenêtre couvrant la durée de l'animation FLIP la plus longue
    shuffleResetTimer = setTimeout(() => tbiIsShuffling.set(false), 800)
  }

  /** Déplace un exercice (sémantique splice) et réaligne items sur le nouvel ordre */
  function applyReorder(from: number, to: number, groups?: number[][]) {
    if (groups) {
      const destination = moveTbiCardInColumns(from, groups)
      if (destination === null) return
      to = destination
    } else if (!reorderTbiCard(from, to)) return
    items.splice(to, 0, items.splice(from, 1)[0])
    items = items.map((item, i) => {
      item.paramsIndex = i
      if (item.exercise) item.exercise.numeroExercice = i
      return item
    })
    uuids = items.map((item) => item.uuid)
    persistLayout()
  }

  /** Supprime un exercice et réaligne items sur les indices restants */
  function applyDelete(paramsIndex: number) {
    const snapshot = takeSnapshot()
    showTbiToast('Exercice supprimé', {
      label: 'Annuler',
      run: () => restoreSnapshot(snapshot),
    })
    deleteTbiCard(paramsIndex)
    items.splice(paramsIndex, 1)
    items = items.map((item, i) => {
      item.paramsIndex = i
      if (item.exercise) item.exercise.numeroExercice = i
      return item
    })
    uuids = items.map((item) => item.uuid)
    persistLayout()
  }

  /** Ajoute à l'onglet affiché une copie de chaque exercice d'un onglet */
  async function duplicateTab(tabId: string) {
    const state = get(tbiState)
    const source = state.tabs.find((tab) => tab.id === tabId)
    if (!source) return
    const indices = tbiTabCardIndices(state, tabId)
    const label = tabEntries.find((entry) => entry.id === tabId)?.label ?? ''
    const copyId = addTbiTab()
    setTbiTabLayout(copyId, source.layout)
    setTbiTabNbColumns(copyId, source.nbColumns)
    setTbiTabSingleColumnAlign(copyId, source.singleColumnAlign)
    renameTbiTab(copyId, `${label} (copie)`)
    if (source.board) {
      addTbiBoard(copyId)
      const { background, gridSize, strokes } = source.board
      updateTbiBoard(copyId, () => ({
        background,
        gridSize,
        strokes: [...strokes],
      }))
    }
    const params = get(exercicesParams)
    for (const index of indices) {
      await addExerciseToTbi({ ...params[index] })
    }
    showTbiToast(`Onglet dupliqué : ${label}`)
  }

  /** Supprime un onglet, ses exercices et ses outils ; on peut se raviser */
  function deleteTab(tabId: string) {
    const snapshot = takeSnapshot()
    const label = tabEntries.find((entry) => entry.id === tabId)?.label ?? ''
    const indices = tbiTabCardIndices(get(tbiState), tabId)
    for (const index of [...indices].reverse()) {
      deleteTbiCard(index)
      items.splice(index, 1)
    }
    items = items.map((item, i) => {
      item.paramsIndex = i
      if (item.exercise) item.exercise.numeroExercice = i
      return item
    })
    uuids = items.map((item) => item.uuid)
    tbiTools.update((tools) => tools.filter((tool) => tool.scope !== tabId))
    removeTbiTab(tabId)
    persistLayout()
    showTbiToast(`Onglet supprimé : ${label}`, {
      label: 'Annuler',
      run: () => restoreSnapshot(snapshot),
    })
  }

  /** Exercices de l'onglet affiché */
  function shownIndices(): number[] {
    return tbiTabCardIndices(get(tbiState), get(tbiState).activeTabId)
  }

  /**
   * Taille des exercices ajustée à l'écran : le contenu de l'onglet tient sans
   * défiler. Le zoom ne descend pas sous 100 % : un onglet très long défile.
   */
  const FIT_BOUNDS = { min: 1, max: 2.5 }
  const FIT_MARGIN = 32

  function contentBottom(): number {
    const cards = document.querySelectorAll('[data-tbi-card-content]')
    return Math.max(
      0,
      ...[...cards].map(
        (card) => card.getBoundingClientRect().bottom + window.scrollY,
      ),
    )
  }

  /** Colonnes que l'ajustement peut ouvrir pour un onglet qui ne tient pas */
  const FIT_MAX_COLUMNS = 3

  async function fitActiveTabZoom(tabId: string, indices: number[]) {
    await fitZoom({
      start: get(tbiState).cards[indices[0]]?.zoom ?? 1,
      bounds: FIT_BOUNDS,
      apply: (zoom) => {
        if (get(tbiState).activeTabId === tabId) {
          setTbiCardsZoom(indices, zoom)
        }
      },
      measure: () => ({
        content: contentBottom(),
        available: window.innerHeight - TBI_BOTTOM_RESERVE - FIT_MARGIN,
      }),
    })
  }

  function doesContentFit(): boolean {
    return (
      contentBottom() <= window.innerHeight - TBI_BOTTOM_RESERVE - FIT_MARGIN
    )
  }

  /**
   * Ajuste l'onglet affiché. En colonnes, s'il ne tient pas à 100 %, il s'étale
   * sur une colonne de plus (réparties selon la hauteur des exercices) plutôt
   * que d'obliger la classe à le faire défiler.
   * @param canOpenColumns faux pour un lien ou une séance qui fixe sa disposition
   */
  async function fitActiveTab(canOpenColumns = true) {
    const tabId = get(tbiState).activeTabId
    const indices = shownIndices()
    if (indices.length === 0) return
    const tab = activeTbiTab(get(tbiState))
    const isFree = tab.layout === 'free'
    if (isFree) await arrangeFreeTab()
    await nextFrames()
    await fitActiveTabZoom(tabId, indices)
    if (!isFree && canOpenColumns) {
      const maxColumns = Math.min(FIT_MAX_COLUMNS, indices.length)
      let nbColumns = tab.nbColumns
      while (!doesContentFit() && nbColumns < maxColumns) {
        nbColumns++
        setTbiTabNbColumns(tabId, nbColumns)
        await nextFrames()
        balanceColumns()
        await nextFrames()
        await fitActiveTabZoom(tabId, indices)
      }
    }
    if (isFree && get(tbiState).activeTabId === tabId) await arrangeFreeTab()
    persistLayout()
  }

  async function nextFrames() {
    await tick()
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    })
  }

  /** Range les exercices de l'onglet affiché sur toute la largeur, sans recouvrement */
  async function arrangeFreeTab() {
    const indices = shownIndices()
    if (indices.length === 0) return
    const panel = document.getElementById('tbi-tab-panel')
    const padding = panel ? parseFloat(getComputedStyle(panel).paddingLeft) : 16
    const areaWidth = window.innerWidth - 2 * padding
    const gap = 16
    const nbColumns = freeLayoutColumns(indices.length)
    const w = Math.round((areaWidth - gap * (nbColumns - 1)) / nbColumns)
    // la largeur d'abord : elle change la hauteur des cartes
    setTbiCardsGeometry(new Map(indices.map((i) => [i, { w }])))
    await nextFrames()
    const heights = indices.map(
      (i) =>
        document.querySelector<HTMLElement>(`[data-tbi-shell="${i}"]`)
          ?.offsetHeight ?? 0,
    )
    const packed = packFreeCards(heights, areaWidth, gap)
    setTbiCardsGeometry(new Map(indices.map((i, k) => [i, packed[k]])))
    persistLayout()
  }

  /** Répartit les colonnes de l'onglet affiché d'après la hauteur des exercices */
  function balanceColumns() {
    const indices = shownIndices()
    const tab = activeTbiTab(get(tbiState))
    const cards = document.querySelectorAll<HTMLElement>('[data-tbi-card]')
    const heightByKey = new Map(
      [...cards].map((card) => [
        Number(card.dataset.tbiCard),
        card.offsetHeight,
      ]),
    )
    balanceTbiColumnsByHeight(
      indices,
      indices.map((i) => heightByKey.get(items[i]?.key) ?? 0),
      tab.nbColumns,
    )
  }

  /**
   * Premier affichage d'un onglet : sa taille s'ajuste à l'écran, sauf si le
   * lien ou la séance en fixe une. Les exercices encore à leur place de cascade
   * sont rangés.
   */
  const fittedTabs = new Set<string>()
  /** Un lien ou une séance décrit déjà la disposition : on n'y touche pas */
  const initialUrlParams = new URL(window.location.href).searchParams
  let hasFixedLayout =
    initialUrlParams.has('tbiParam') || initialUrlParams.has(SESSION_URL_PARAM)
  $effect(() => {
    if (!isReady) return
    const tabId = activeTab.id
    const count = tbiTabCardIndices($tbiState, tabId).length
    if (count === 0 || fittedTabs.has(tabId)) return
    fittedTabs.add(tabId)
    untrack(() => {
      const state = get(tbiState)
      const indices = tbiTabCardIndices(state, tabId)
      const isDefaultZoom = indices.every((i) => state.cards[i].zoom === 1)
      const tab = activeTbiTab(state)
      const isFree = tab.layout === 'free'
      // une écriture déjà posée resterait en place, sans les exercices
      if ((tab.board?.strokes.length ?? 0) > 0) return
      if (isDefaultZoom) void fitActiveTab(!hasFixedLayout)
      else if (isFree && areTbiCardsAtDefaultPlace(state, indices)) {
        void arrangeFreeTab()
      }
    })
  })

  /** Défilement du contenu au fil de l'eau d'une fenêtre qui change de largeur */
  let lastViewportWidth = window.innerWidth
  function onResize() {
    if (window.innerWidth === lastViewportWidth) return
    rescaleTbiFreeCards(lastViewportWidth, window.innerWidth)
    lastViewportWidth = window.innerWidth
  }

  /**
   * Raccourcis, notamment pour une télécommande de présentation : Page préc. et
   * Page suiv. changent d'onglet, C affiche la correction, N de nouvelles
   * données, F le plein écran. Pas dans un champ de saisie ni dans un outil, qui
   * utilise le clavier pour lui-même (page d'un document, calculatrice).
   */
  function onKeydown(event: KeyboardEvent) {
    const target = event.target
    if (
      get(tbiWriting) &&
      (event.ctrlKey || event.metaKey) &&
      event.key.toLowerCase() === 'z'
    ) {
      const tab = activeTbiTab(get(tbiState))
      if (!tab.board) return
      event.preventDefault()
      if (event.shiftKey) redoTbiBoard(tab.id, tab.board.strokes)
      else undoTbiBoard(tab.id, tab.board.strokes)
      return
    }
    if (
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      (target instanceof Element &&
        (isTextField(target) || target.closest('[data-tbi-tool]')))
    ) {
      return
    }
    const indices = shownIndices()
    switch (event.key) {
      case 'PageDown':
      case 'PageUp':
        event.preventDefault()
        stepTbiActiveTab(event.key === 'PageDown' ? 1 : -1)
        break
      case 'c':
      case 'C': {
        const { cards } = get(tbiState)
        const isShown =
          indices.length > 0 &&
          indices.every((i) => cards[i].correctionMode !== 'hidden')
        setTbiCardsCorrectionShown(indices, !isShown)
        break
      }
      case 'n':
      case 'N':
        if (indices.length > 0) newDataFor(indices)
        break
      case 'e':
      case 'E':
        tbiEditing.set(false)
        tbiWriting.update((writing) => !writing)
        break
      case 'f':
      case 'F':
        void toggleTbiFullscreen()
        break
      case 'Escape':
        tbiEditing.set(false)
        tbiWriting.set(false)
        break
    }
  }

  /**
   * Fichiers et liens (depuis un autre onglet : image, lien d'une vidéo…)
   * glissés dans la vue : chacun s'ouvre dans un nouveau visualiseur de
   * document. Sans cela, le navigateur remplacerait la vue TBI par le fichier
   * ou la page déposés. Le compteur suit les entrées/sorties successives
   * au-dessus des éléments de la page, pour n'afficher le cadre de dépôt
   * qu'une fois.
   */
  let fileDragDepth = $state(0)

  function isFileDrag(event: DragEvent): boolean {
    const types = event.dataTransfer?.types ?? []
    return types.includes('Files') || types.includes('text/uri-list')
  }

  /** Dépôt dans un champ de saisie (lien dans le champ d'un visualiseur) */
  function isTextField(target: EventTarget | null): boolean {
    return (
      target instanceof HTMLElement &&
      (target.isContentEditable ||
        target.closest('input, textarea, math-field') !== null)
    )
  }

  function onDragEnter(event: DragEvent) {
    if (!isFileDrag(event) || isTextField(event.target)) return
    event.preventDefault()
    fileDragDepth++
  }

  function onDragOver(event: DragEvent) {
    if (!isFileDrag(event) || isTextField(event.target)) return
    event.preventDefault()
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy'
  }

  function onDragLeave(event: DragEvent) {
    if (!isFileDrag(event)) return
    fileDragDepth = Math.max(0, fileDragDepth - 1)
  }

  function onDrop(event: DragEvent) {
    if (!isFileDrag(event)) return
    fileDragDepth = 0
    if (isTextField(event.target)) return
    event.preventDefault()
    const transfer = event.dataTransfer
    const files = supportedFiles(transfer?.files)
    if (files.length > 0 || (transfer?.files.length ?? 0) > 0) {
      openTbiDocuments(files)
      return
    }
    openTbiViewers(linksOfUriList(transfer?.getData('text/uri-list') ?? ''))
  }

  /**
   * Image ou PDF collé (capture d'écran, fichier copié), ou lien copié
   * (document, vidéo) : même traitement
   */
  function onPaste(event: ClipboardEvent) {
    if (isTextField(event.target)) return
    const files = supportedFiles(event.clipboardData?.files)
    if (files.length > 0) {
      event.preventDefault()
      openTbiDocuments(files)
      return
    }
    const link = parseTbiLink(event.clipboardData?.getData('text/plain') ?? '')
    if (link === null) return
    event.preventDefault()
    openTbiViewers([link])
  }

  // séance ouverte depuis « Mes séances au vidéoprojecteur » (ou rechargée) :
  // « Enregistrer » met à jour cette séance (voir `SaveSessionButton`). Au retour
  // d'une autre vue, l'URL n'est pas encore réécrite : le lien reste en mémoire.
  const urlSessionId =
    new URL(window.location.href).searchParams.get(SESSION_URL_PARAM) ?? ''
  if (urlSessionId !== '') currentSessionStore.set(urlSessionId)

  /**
   * Applique à la vue l'état de la séance enregistrée : réglages d'affichage
   * de chaque carte, widgets, positions du mode libre. Les exercices sont déjà
   * ceux de l'URL (voir `sessionUrl`). Une séance introuvable (lien d'un autre
   * navigateur, séance supprimée) est détachée de la vue.
   * @param documentsOnly vue rechargée : l'URL porte déjà le reste de l'état,
   * seuls les documents et vidéos (absents de l'URL) sont repris de la séance
   */
  async function applySavedSession(sessionId: string, documentsOnly = false) {
    try {
      const session = isStorageAvailable()
        ? (await loadLibrary()).sessions.find((s) => s.id === sessionId)
        : undefined
      if (session === undefined) {
        currentSessionStore.set('')
        return
      }
      if (documentsOnly) {
        const { tabs } = get(tbiState)
        restoreTbiLinkViewers(
          readSavedDocuments(session.state.documents),
          (index) => tabs[index]?.id,
        )
        applyTbiBoards(session.state.boards)
        return
      }
      importTbiSettings(session.state)
      persistLayout()
    } catch (error) {
      console.error('Lecture de « Mes sauvegardes » impossible', error)
    }
  }

  const uninstallControls = installTbiControls()
  tbiEditing.set(false)
  tbiWriting.set(false)

  /** Un onglet sans exercice, écriture ni outil affiche ce qu'on peut y faire */
  const isEmpty = $derived(
    !$tbiWriting &&
      (activeTab.board?.strokes.length ?? 0) === 0 &&
      tbiTabCardIndices($tbiState, activeTab.id).length === 0 &&
      !$tbiTools.some((tool) => isTbiToolShown(tool, activeTab.id)),
  )

  /** Chargement de la page : la vue est décrite par l'URL et les sauvegardes */
  async function restoreSavedView() {
    // l'URL (tbiParam) décrit la disposition partagée, le localStorage
    // les positions/tailles dépendantes de l'écran : le localStorage est
    // appliqué en premier, puis l'URL (si présente) par-dessus, pour que
    // la position partagée d'un widget prenne le pas sur la sauvegarde locale
    loadTbiLocalLayout(uuids)
    const urlParam = new URL(window.location.href).searchParams.get('tbiParam')
    if (urlParam != null) {
      tbiParamStore.set(urlParam)
      applyTbiSharedState(decodeTbiParam(urlParam))
      // les documents et vidéos ne sont pas dans l'URL : ceux de la séance
      // reliée (dernier enregistrement) sont rouverts
      if (urlSessionId !== '') await applySavedSession(urlSessionId, true)
      else {
        const hasDraft = loadTbiDraft(uuids)
        // un lien partagé ne porte pas l'écriture : autant le dire
        if (
          !hasDraft &&
          decodeTbiParam(urlParam).boards?.some((board) => board?.hasInk)
        ) {
          showTbiToast('Ce lien rouvre la séance sans ce qui y était écrit')
        }
      }
    } else if (urlSessionId !== '') {
      // lien de « Mes sauvegardes » : sans tbiParam, l'état vient de la séance.
      // Avec tbiParam (vue rechargée), l'URL porte l'état courant, qui peut
      // avoir été retouché depuis le dernier enregistrement.
      await applySavedSession(urlSessionId)
    } else {
      loadTbiDraft(uuids)
    }
  }

  onMount(async () => {
    await loadItems()
    const entry = enterTbiSeries(uuids)
    if (entry === 'replaced') {
      resetTbiBoardHistory()
      hasFixedLayout = false
      // l'URL décrit encore la série précédente
      mathaleaUpdateUrlFromExercicesParams()
    }
    if (entry === 'opening') await restoreSavedView()
    else if (entry === 'replaced') loadTbiLocalLayout(uuids)
    isReady = true
    // au retour d'une autre vue, tbiParam peut décrire les exercices d'avant
    lastEncodedSharedState = get(tbiParamStore)
    // Maintient l'URL à jour avec la partie partageable de l'état. tbiState
    // notifie sur CHAQUE mutation, y compris les positions/tailles du mode
    // libre (pas concernées par l'URL) mises à jour à chaque pointermove
    // d'un glisser-déposer : sans ce débounce, un encodage JSON+base64 de
    // tout l'état tournerait à chaque déplacement de souris et rendrait
    // l'interface perceptiblement lente pendant le geste.
    const syncUrl = () => {
      if (!isReady) return
      if (syncUrlTimer !== undefined) clearTimeout(syncUrlTimer)
      syncUrlTimer = setTimeout(() => {
        syncUrlTimer = undefined
        saveTbiDraft(uuids)
        const encoded = encodeTbiParam(getTbiSharedState(get(tbiState)))
        if (encoded === lastEncodedSharedState) return
        lastEncodedSharedState = encoded
        tbiParamStore.set(encoded)
        mathaleaUpdateUrlFromExercicesParams()
      }, 200)
    }
    const unsubscribeState = tbiState.subscribe(syncUrl)
    const unsubscribeTools = tbiTools.subscribe(syncUrl)
    tbiStateUnsubscriber = () => {
      unsubscribeState()
      unsubscribeTools()
    }
  })

  onDestroy(() => {
    uninstallControls()
    if (syncUrlTimer !== undefined) clearTimeout(syncUrlTimer)
    if (shuffleResetTimer !== undefined) clearTimeout(shuffleResetTimer)
    tbiStateUnsubscriber?.()
  })
</script>

<svelte:window
  ondragenter={onDragEnter}
  ondragover={onDragOver}
  ondragleave={onDragLeave}
  ondrop={onDrop}
  onpaste={onPaste}
  onkeydown={onKeydown}
  onresize={onResize}
/>

<main
  class="tbi-view relative min-h-screen w-full pb-24 bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
>
  <TbiBar
    {tabEntries}
    onAddExercise={openAddExercise}
    onShuffle={applyShuffle}
    onNewData={newDataFor}
    onDuplicateTab={duplicateTab}
    onDeleteTab={deleteTab}
    onFit={() => fitActiveTab()}
    onArrange={arrangeFreeTab}
    onBalance={balanceColumns}
  />
  {#if isReady && activeTab.board}
    <TbiBoardBackground board={activeTab.board} />
  {/if}
  {#if isReady}
    {#if isEmpty}
      <TbiEmptyState
        title={activeTabLabel}
        onAddExercise={openAddExercise}
        onWrite={() => {
          addTbiBoard(activeTab.id)
          tbiWriting.set(true)
        }}
        onOpenTools={() => tbiOpenPanel.set('tools')}
      />
    {:else}
      <TbiTabView
        {items}
        {tabEntries}
        onMove={applyReorder}
        {persistLayout}
        onDelete={applyDelete}
      />
    {/if}
  {/if}
  {#if isReady && activeTab.board}
    <TbiBoardCanvas tabId={activeTab.id} board={activeTab.board} />
  {/if}
  <TbiToolsLayer {persistLayout} tabLabel={activeTabLabel} />
  {#if !$tbiControlsVisible}
    <!-- au repos : où en est la séance, et comment retrouver les commandes -->
    <div
      class="fixed left-1/2 -translate-x-1/2 bottom-2 z-30 text-base tabular-nums opacity-70 pointer-events-none print-hidden text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light"
    >
      {#if $tbiState.tabs.length > 1}
        {$tbiState.tabs.findIndex((tab) => tab.id === activeTab.id) + 1} / {$tbiState
          .tabs.length} · <TbiMathText text={activeTabLabel} />
      {/if}
    </div>
    <div
      class="fixed right-3 bottom-2 z-30 text-base opacity-70 pointer-events-none print-hidden text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light"
    >
      Tapoter pour afficher les commandes
    </div>
  {/if}
  <TbiToast />
  {#if $tbiTimerAlarm}
    <TbiTimerAlarm
      sound={$tbiTimerAlarm.sound}
      onDismiss={() => tbiTimerAlarm.set(null)}
    />
  {/if}
  {#if fileDragDepth > 0}
    <div
      class="fixed inset-0 z-[80] flex items-center justify-center pointer-events-none bg-coopmaths-struct/20 dark:bg-coopmathsdark-struct/20 border-4 border-dashed border-coopmaths-struct dark:border-coopmathsdark-struct print-hidden"
    >
      <span
        class="px-6 py-3 rounded-full shadow-lg text-lg font-semibold bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark text-coopmaths-struct dark:text-coopmathsdark-struct"
      >
        Déposer le document ou le lien (PDF, image, note, figure, vidéo, page
        web) pour l’afficher
      </span>
    </div>
  {/if}
  {#if isAddExerciseOpen}
    <TypstAddExerciseModal
      onAdd={addExerciseToTbi}
      target={`l'onglet « ${tbiLabelPlain(activeTabLabel)} »`}
      onClose={() => (isAddExerciseOpen = false)}
    />
  {/if}
</main>

<style>
  @media (prefers-reduced-motion: reduce) {
    .tbi-view :global(*) {
      transition: none !important;
      animation-duration: 0.01ms !important;
    }
  }
</style>
