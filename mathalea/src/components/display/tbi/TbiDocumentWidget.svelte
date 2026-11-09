<script lang="ts">
  import { flushSync, onDestroy, untrack } from 'svelte'
  import type { PDFPageProxy, RenderTask } from 'pdfjs-dist'
  import {
    replaceTbiDocument,
    updateTbiDocumentViewer,
    TBI_DOCUMENT_VIEWER_MAX_H,
    TBI_DOCUMENT_VIEWER_MAX_W,
    TBI_DOCUMENT_VIEWER_MIN_H,
    TBI_DOCUMENT_VIEWER_MIN_W,
    type TbiDocumentViewer,
  } from '../../../lib/stores/tbiDocumentStore'
  import {
    canvasPixelRatio,
    clampDocumentZoom,
    clampPage,
    clampSelection,
    containsRegion,
    expandRegion,
    fitScale,
    loadTbiDocument,
    loadTbiDocumentFromUrl,
    nextRotation,
    regionOfPage,
    TbiDocumentError,
    TBI_DOCUMENT_ACCEPT,
    TBI_DOCUMENT_MAX_ZOOM,
    TBI_DOCUMENT_MIN_ZOOM,
    TBI_DOCUMENT_ZOOM_STEP,
    type TbiDocumentFit,
    type TbiDocumentRegion,
    type TbiDocumentRotation,
    type TbiDocumentSource,
    type TbiScreenRect,
    visibleRegion,
    zoomForRegion,
  } from '../../../lib/tbiDocument'
  import {
    externalUrlOf,
    TBI_WEB_PAGE_SANDBOX,
    viewerContentTitle,
    type TbiLinkContent,
    type TbiViewerContent,
  } from '../../../lib/tbiLink'
  import TbiApigeomFigure from './TbiApigeomFigure.svelte'
  import TbiJsxGraphFigure from './TbiJsxGraphFigure.svelte'
  import TbiLinkForm from './TbiLinkForm.svelte'
  import TbiMarkdownNote from './TbiMarkdownNote.svelte'
  import TbiToolFrame from './TbiToolFrame.svelte'
  import type { TbiToolFrameProps } from './tbiTypes'

  interface Props {
    /** Visualiseur affiché : document, position, taille et ordre d'empilement */
    viewer: TbiDocumentViewer
    /** Commandes communes aux outils (voir `TbiToolsLayer`) */
    frame: TbiToolFrameProps
  }

  let { viewer, frame }: Props = $props()

  // `viewer` est remplacé à chaque déplacement : le dérivé ne change, lui,
  // qu'avec le contenu, et le document n'est donc rechargé qu'à ce moment
  let content = $derived(viewer.content)
  /** Vidéo affichée dans un lecteur (iframe ou `<video>`), sans pdf.js */
  let video = $derived(content?.type === 'video' ? content.video : null)
  let note = $derived(content?.type === 'markdown' ? content : null)
  let figure = $derived(content?.type === 'figure' ? content : null)
  /** Contenu affiché sans pdf.js ni canvas, dans son propre composant */
  let hasEmbed = $derived(video !== null || note !== null || figure !== null)
  /** Lien d'origine, à ouvrir dans un onglet si le site refuse l'affichage ici */
  let externalUrl = $derived(externalUrlOf(content))
  /** Lien qui n'a pas pu être affiché : il reste dans le champ de saisie */
  let failedUrl = $derived(content?.type === 'link' ? content.url : '')

  /** Marge autour de la page, dans la zone de défilement (px) */
  const PAGE_PADDING = 12
  /** Délai avant de redessiner un PDF après un changement de taille (ms) */
  const RENDER_DELAY = 120
  /** Marge dessinée autour de la partie visible, en fraction du cadre */
  const RENDER_MARGIN = 0.5

  let source = $state<TbiDocumentSource | null>(null)
  let isLoading = $state(false)
  let errorMessage = $state('')
  let page = $state(1)
  let pageInput = $state('1')
  let rotation = $state<TbiDocumentRotation>(0)
  let fit = $state<TbiDocumentFit>('page')
  let zoom = $state(1)
  /** Taille de la page affichée à l'échelle 1, rotation comprise */
  let pageBase = $state({ width: 0, height: 0 })
  let pdfPage = $state<PDFPageProxy | null>(null)

  /** Taille utile de la zone de défilement (hors marge), suivie en direct */
  let boxW = $state(0)
  let boxH = $state(0)

  let scale = $derived(
    fitScale(pageBase.width, pageBase.height, boxW, boxH, fit) * zoom,
  )
  let displayW = $derived(pageBase.width * scale)
  let displayH = $derived(pageBase.height * scale)
  let pageCount = $derived(source?.pageCount ?? 0)
  let fileName = $derived(viewerContentTitle(content))

  let widgetEl: HTMLElement = $state()!
  let scrollEl: HTMLElement | undefined = $state()
  let pageEl: HTMLElement | undefined = $state()
  let canvasEl: HTMLCanvasElement | undefined = $state()
  let fileInput: HTMLInputElement

  // ------------------------------------------------------------------
  // Chargement du document et de la page
  // ------------------------------------------------------------------

  /** Jeton du dernier chargement : un chargement dépassé est abandonné */
  let loadToken = 0

  async function load(current: TbiViewerContent | null) {
    const token = ++loadToken
    const previous = source
    source = null
    pdfPage = null
    pageBase = { width: 0, height: 0 }
    errorMessage = ''
    videoError = ''
    linkFormOpen = false
    void previous?.destroy()
    // visualiseur vide, vidéo, note ou figure : rien à charger ici
    if (
      current === null ||
      current.type === 'video' ||
      current.type === 'markdown' ||
      current.type === 'figure'
    ) {
      isLoading = false
      return
    }
    isLoading = true
    try {
      const loaded =
        current.type === 'file'
          ? await loadTbiDocument(current.file)
          : await loadTbiDocumentFromUrl(current.url)
      if ('type' in loaded) {
        // pas un document paginé : le contenu à afficher remplace le lien ou le
        // fichier, ce qui relance le chargement
        if (token === loadToken) replaceTbiDocument(viewer.id, loaded)
        return
      }
      if (token !== loadToken) {
        void loaded.destroy()
        return
      }
      page = 1
      pageInput = '1'
      rotation = 0
      zoom = 1
      cropMode = false
      selection = null
      discardDrawing()
      // un PDF (fiche, sujet) se lit mieux sur toute la largeur, une photo
      // se regarde en entier
      fit = loaded.kind === 'pdf' ? 'width' : 'page'
      source = loaded
    } catch (error) {
      if (token !== loadToken) return
      errorMessage =
        error instanceof TbiDocumentError
          ? error.message
          : 'Ce document ne peut pas être ouvert.'
      console.error('Ouverture du document impossible', error)
    } finally {
      if (token === loadToken) isLoading = false
    }
  }

  $effect(() => {
    const current = content
    // `load` lit puis réécrit `source` : seul le contenu est une dépendance
    untrack(() => void load(current))
  })

  /** Jeton de la dernière page demandée (changement de page rapide) */
  let pageToken = 0

  $effect(() => {
    const current = source
    const number = page
    const turn = rotation
    const token = ++pageToken
    if (current === null) return
    if (current.kind === 'image') {
      pdfPage = null
      pageBase =
        turn % 180 === 0
          ? { width: current.width, height: current.height }
          : { width: current.height, height: current.width }
      return
    }
    current
      .getPage(number)
      .then((proxy) => {
        if (token !== pageToken) return
        const viewport = proxy.getViewport({
          scale: 1,
          rotation: (proxy.rotate + turn) % 360,
        })
        pageBase = { width: viewport.width, height: viewport.height }
        // nouvelle page : le dessin de la précédente ne doit pas être étiré
        discardDrawing()
        pdfPage = proxy
      })
      .catch((error) => {
        if (token !== pageToken) return
        console.error('Lecture de la page impossible', error)
        errorMessage = 'Cette page ne peut pas être affichée.'
      })
  })

  // ------------------------------------------------------------------
  // Rendu de la page (PDF ou image)
  // ------------------------------------------------------------------

  /**
   * Seule la partie visible de la page (avec une marge) est dessinée, dans un
   * canvas de la taille du cadre : à fort zoom, un canvas de la page entière
   * dépasse la mémoire graphique (Safari affiche alors le cadre du
   * visualiseur en noir) et reste flou. Le canvas se place dans la page à
   * la position et à l'échelle de son dernier dessin.
   *
   * Pendant un zoom ou un redimensionnement, la taille CSS de la page suit en
   * direct (le canvas est mis à l'échelle) et le dessin n'est refait qu'à
   * l'arrêt, dans un canvas hors écran recopié une fois prêt : la page ne
   * clignote jamais. Le défilement ne redessine que si la zone visible sort
   * de la zone déjà dessinée.
   */
  let renderTask: RenderTask | null = null
  let renderTimer: ReturnType<typeof setTimeout> | undefined
  let hasBitmap = false
  /** Zone dessinée (px de la page à l'échelle `scale` du dessin) */
  let drawn = $state<(TbiScreenRect & { scale: number }) | null>(null)

  let drawnStyle = $derived.by(() => {
    if (drawn === null || scale <= 0) return 'display: none'
    const k = scale / drawn.scale
    return `left: ${drawn.left * k}px; top: ${drawn.top * k}px; width: ${drawn.width * k}px; height: ${drawn.height * k}px`
  })

  /** Rectangles (page, zone de défilement) à l'écran, ou null sans mise en page */
  function layoutRects(): { page: DOMRect; view: TbiScreenRect } | null {
    if (!scrollEl || !pageEl) return null
    const box = scrollEl.getBoundingClientRect()
    return {
      page: pageEl.getBoundingClientRect(),
      view: {
        left: box.left,
        top: box.top,
        width: scrollEl.clientWidth,
        height: scrollEl.clientHeight,
      },
    }
  }

  /** Partie visible de la page, dans le repère de la page à l'échelle actuelle */
  function visibleOfPage(): TbiScreenRect | null {
    const rects = layoutRects()
    return rects && visibleRegion(rects.page, rects.view)
  }

  /** Zone à dessiner : partie visible et marge, ou le coin de la page */
  function windowToDraw(): TbiScreenRect | null {
    const rects = layoutRects()
    if (!rects) return null
    const { page, view } = rects
    const visible = visibleRegion(page, view) ?? {
      left: 0,
      top: 0,
      width: Math.min(page.width, view.width),
      height: Math.min(page.height, view.height),
    }
    return expandRegion(
      visible,
      view.width * RENDER_MARGIN,
      view.height * RENDER_MARGIN,
      page.width,
      page.height,
    )
  }

  /** Recopie le dessin hors écran dans le canvas affiché, d'un seul tenant */
  function showDrawing(
    offscreen: HTMLCanvasElement,
    area: TbiScreenRect,
    drawnScale: number,
  ) {
    const target = canvasEl
    if (target === undefined) return
    target.width = offscreen.width
    target.height = offscreen.height
    target.getContext('2d')?.drawImage(offscreen, 0, 0)
    drawn = { ...area, scale: drawnScale }
    // position et image changent dans la même image affichée
    flushSync()
    hasBitmap = true
  }

  async function renderPdfPage() {
    const proxy = pdfPage
    const area = windowToDraw()
    if (proxy === null || canvasEl === undefined || area === null) return
    if (scale <= 0) return
    renderTask?.cancel()
    const drawnScale = scale
    const viewport = proxy.getViewport({
      scale: drawnScale,
      rotation: (proxy.rotate + rotation) % 360,
      offsetX: -area.left,
      offsetY: -area.top,
    })
    const ratio = canvasPixelRatio(
      area.width,
      area.height,
      window.devicePixelRatio || 1,
    )
    const offscreen = document.createElement('canvas')
    offscreen.width = Math.max(1, Math.floor(area.width * ratio))
    offscreen.height = Math.max(1, Math.floor(area.height * ratio))
    const context = offscreen.getContext('2d')
    if (context === null) return
    // un PDF n'a pas toujours de fond opaque
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, offscreen.width, offscreen.height)
    const task = proxy.render({
      canvas: offscreen,
      canvasContext: context,
      viewport,
      transform: ratio === 1 ? undefined : [ratio, 0, 0, ratio, 0, 0],
    })
    renderTask = task
    try {
      await task.promise
    } catch (error) {
      if ((error as Error)?.name !== 'RenderingCancelledException') {
        console.error('Rendu de la page impossible', error)
      }
      return
    }
    if (renderTask !== task) return
    renderTask = null
    showDrawing(offscreen, area, drawnScale)
  }

  let imageElement: { url: string; element: HTMLImageElement } | null = null
  let imageRenderToken = 0

  async function loadImageElement(url: string): Promise<HTMLImageElement> {
    if (imageElement?.url === url) return imageElement.element
    const element = new Image()
    element.src = url
    await element.decode()
    imageElement = { url, element }
    return element
  }

  async function renderImagePage() {
    const current = source
    const area = windowToDraw()
    if (current === null || current.kind !== 'image' || area === null) return
    if (canvasEl === undefined || displayW <= 0 || displayH <= 0) return
    const token = ++imageRenderToken
    const turn = rotation
    const width = displayW
    const height = displayH
    const drawnScale = scale
    let element: HTMLImageElement
    try {
      element = await loadImageElement(current.url)
    } catch (error) {
      console.error('Rendu de l’image impossible', error)
      return
    }
    if (token !== imageRenderToken) return
    const ratio = canvasPixelRatio(
      area.width,
      area.height,
      window.devicePixelRatio || 1,
    )
    const offscreen = document.createElement('canvas')
    offscreen.width = Math.max(1, Math.floor(area.width * ratio))
    offscreen.height = Math.max(1, Math.floor(area.height * ratio))
    const context = offscreen.getContext('2d')
    if (context === null) return
    context.imageSmoothingQuality = 'high'
    context.scale(ratio, ratio)
    context.translate(-area.left, -area.top)
    // l'image est dessinée à plat, puis pivotée avec le contexte
    context.translate(width / 2, height / 2)
    context.rotate((turn * Math.PI) / 180)
    const [drawW, drawH] = turn % 180 === 0 ? [width, height] : [height, width]
    context.drawImage(element, -drawW / 2, -drawH / 2, drawW, drawH)
    showDrawing(offscreen, area, drawnScale)
  }

  function scheduleRender() {
    if (renderTimer !== undefined) clearTimeout(renderTimer)
    renderTimer = setTimeout(
      () => {
        renderTimer = undefined
        if (source?.kind === 'image') void renderImagePage()
        else void renderPdfPage()
      },
      hasBitmap ? RENDER_DELAY : 0,
    )
  }

  /** Oublie le dessin (nouvelle page, rotation) : il ne doit pas être étiré */
  function discardDrawing() {
    hasBitmap = false
    drawn = null
  }

  /** Défilement : redessiner seulement si la zone visible sort du dessin */
  function onScroll() {
    if (drawn === null || scale <= 0) return
    const visible = visibleOfPage()
    if (visible === null) return
    const k = scale / drawn.scale
    const covered = {
      left: drawn.left * k,
      top: drawn.top * k,
      width: drawn.width * k,
      height: drawn.height * k,
    }
    if (!containsRegion(covered, visible)) scheduleRender()
  }

  $effect(() => {
    // dépendances : page, échelle, rotation, document et taille du cadre
    void pdfPage
    void scale
    void rotation
    void canvasEl
    void source
    void boxW
    void boxH
    scheduleRender()
  })

  // ------------------------------------------------------------------
  // Navigation, zoom, rotation
  // ------------------------------------------------------------------

  function goToPage(number: number) {
    const next = clampPage(number, pageCount)
    pageInput = String(next)
    if (next === page) return
    page = next
    scrollEl?.scrollTo({ top: 0, left: 0 })
  }

  function onPageInputChange() {
    goToPage(Number(pageInput))
  }

  /**
   * Zoome en gardant fixe le point (clientX, clientY) de la page : la
   * position relative de ce point dans la page est relevée avant le zoom,
   * puis la zone de défilement est décalée pour qu'il revienne sous le
   * pointeur (ou au centre du cadre pour les boutons).
   */
  function zoomAt(nextZoom: number, clientX?: number, clientY?: number) {
    const clamped = clampDocumentZoom(nextZoom)
    if (clamped === zoom) return
    if (!scrollEl || !pageEl) {
      zoom = clamped
      return
    }
    const box = scrollEl.getBoundingClientRect()
    const x = clientX ?? box.left + box.width / 2
    const y = clientY ?? box.top + box.height / 2
    const before = pageEl.getBoundingClientRect()
    const fx = before.width > 0 ? (x - before.left) / before.width : 0.5
    const fy = before.height > 0 ? (y - before.top) / before.height : 0.5
    zoom = clamped
    flushSync()
    const after = pageEl.getBoundingClientRect()
    scrollEl.scrollLeft += after.left + fx * after.width - x
    scrollEl.scrollTop += after.top + fy * after.height - y
  }

  /**
   * Affiche la zone choisie (fractions de la page) sur toute la largeur du
   * cadre : zoom calculé pour cette largeur, puis zone amenée en haut à
   * gauche du cadre (centrée si elle est plus petite que lui). Si la zone
   * est trop petite pour le zoom maximal, elle est simplement agrandie au
   * maximum.
   */
  function zoomToRegion(region: TbiDocumentRegion) {
    if (!scrollEl || !pageEl) return
    zoom = zoomForRegion(
      region,
      pageBase.width,
      boxW,
      fitScale(pageBase.width, pageBase.height, boxW, boxH, fit),
    )
    flushSync()
    const box = scrollEl.getBoundingClientRect()
    const after = pageEl.getBoundingClientRect()
    const regionW = region.width * after.width
    const regionH = region.height * after.height
    const targetLeft =
      box.left + Math.max(PAGE_PADDING, (scrollEl.clientWidth - regionW) / 2)
    const targetTop =
      box.top + Math.max(PAGE_PADDING, (scrollEl.clientHeight - regionH) / 2)
    scrollEl.scrollLeft += after.left + region.left * after.width - targetLeft
    scrollEl.scrollTop += after.top + region.top * after.height - targetTop
  }

  function zoomIn() {
    zoomAt(zoom * TBI_DOCUMENT_ZOOM_STEP)
  }

  function zoomOut() {
    zoomAt(zoom / TBI_DOCUMENT_ZOOM_STEP)
  }

  function setFit(next: TbiDocumentFit) {
    fit = next
    zoom = 1
    scrollEl?.scrollTo({ top: 0, left: 0 })
  }

  function rotate() {
    discardDrawing()
    rotation = nextRotation(rotation)
  }

  // ------------------------------------------------------------------
  // Zoom sur une zone : rectangle tracé entre deux angles opposés
  // ------------------------------------------------------------------

  /** Outil actif : le glisser trace un rectangle au lieu de déplacer la page */
  let cropMode = $state(false)
  /** Rectangle en cours de tracé, en pixels d'écran */
  let selection = $state<TbiScreenRect | null>(null)
  let selectionStart: { x: number; y: number } | null = null
  let selectionPointer: number | null = null

  /** Partie de la page réellement visible dans la zone de défilement */
  function visiblePageRect(): TbiScreenRect | null {
    if (!scrollEl || !pageEl) return null
    const page = pageEl.getBoundingClientRect()
    const box = scrollEl.getBoundingClientRect()
    const left = Math.max(page.left, box.left)
    const top = Math.max(page.top, box.top)
    const right = Math.min(page.right, box.left + scrollEl.clientWidth)
    const bottom = Math.min(page.bottom, box.top + scrollEl.clientHeight)
    return { left, top, width: right - left, height: bottom - top }
  }

  function toggleCrop() {
    cropMode = !cropMode
    cancelSelection()
  }

  function cancelSelection() {
    selection = null
    selectionStart = null
    selectionPointer = null
  }

  function startSelection(event: PointerEvent) {
    if (selectionPointer !== null) return
    try {
      scrollEl?.setPointerCapture(event.pointerId)
    } catch {
      // pointeur déjà inactif : sans conséquence
    }
    selectionPointer = event.pointerId
    selectionStart = { x: event.clientX, y: event.clientY }
    selection = null
  }

  function moveSelection(event: PointerEvent) {
    const bounds = visiblePageRect()
    if (event.pointerId !== selectionPointer || !selectionStart || !bounds) {
      return
    }
    // un tracé trop petit n'est pas affiché : le simple clic ne dessine rien
    selection = clampSelection(
      selectionStart,
      { x: event.clientX, y: event.clientY },
      bounds,
    )
  }

  function endSelection(event: PointerEvent) {
    if (event.pointerId !== selectionPointer) return
    const chosen = selection
    const page = pageEl?.getBoundingClientRect()
    cancelSelection()
    if (event.type === 'pointercancel' || !chosen || !page) return
    zoomToRegion(regionOfPage(chosen, page))
    // un recadrage à la fois : le glisser déplace de nouveau la page
    cropMode = false
  }

  // ------------------------------------------------------------------
  // Déplacement de la page à la main et zoom à deux doigts / Ctrl + molette
  // ------------------------------------------------------------------

  const pointers = new Map<number, { x: number; y: number }>()
  let pinch: { distance: number; zoom: number } | null = null
  let isPanning = $state(false)

  function pinchMetrics() {
    const [a, b] = [...pointers.values()]
    return {
      distance: Math.hypot(a.x - b.x, a.y - b.y),
      x: (a.x + b.x) / 2,
      y: (a.y + b.y) / 2,
    }
  }

  function onContentPointerDown(event: PointerEvent) {
    if (source === null) return
    if (event.pointerType === 'mouse' && event.button !== 0) return
    // clic sur une barre de défilement : défilement natif (`offsetX` serait
    // relatif à l'élément touché, la page, et non à la zone de défilement)
    if (scrollEl) {
      const box = scrollEl.getBoundingClientRect()
      if (
        event.clientX - box.left > scrollEl.clientWidth ||
        event.clientY - box.top > scrollEl.clientHeight
      ) {
        return
      }
    }
    if (cropMode) {
      startSelection(event)
      return
    }
    try {
      scrollEl?.setPointerCapture(event.pointerId)
    } catch {
      // pointeur déjà inactif : sans conséquence
    }
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
    if (pointers.size === 2) {
      pinch = { distance: pinchMetrics().distance, zoom }
    }
    isPanning = true
  }

  function onContentPointerMove(event: PointerEvent) {
    if (cropMode) {
      moveSelection(event)
      return
    }
    const previous = pointers.get(event.pointerId)
    if (!previous || !scrollEl) return
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
    if (pointers.size >= 2 && pinch !== null) {
      const { distance, x, y } = pinchMetrics()
      if (pinch.distance > 0)
        zoomAt((pinch.zoom * distance) / pinch.distance, x, y)
    } else if (pointers.size === 1) {
      scrollEl.scrollLeft -= event.clientX - previous.x
      scrollEl.scrollTop -= event.clientY - previous.y
    }
  }

  function onContentPointerUp(event: PointerEvent) {
    if (cropMode) {
      pointers.delete(event.pointerId)
      isPanning = pointers.size > 0
      endSelection(event)
      return
    }
    pointers.delete(event.pointerId)
    if (pointers.size < 2) pinch = null
    if (pointers.size === 0) isPanning = false
  }

  /** Ctrl + molette (et pincement du pavé tactile, qui l'imite) : zoom */
  function onWheel(event: WheelEvent) {
    if (!event.ctrlKey || source === null) return
    event.preventDefault()
    zoomAt(zoom * Math.exp(-event.deltaY / 200), event.clientX, event.clientY)
  }

  // ------------------------------------------------------------------
  // Clavier : télécommande de présentation (Page préc. / suiv.) et zoom
  // ------------------------------------------------------------------

  function onKeydown(event: KeyboardEvent) {
    if (isTextInput(event.target)) return
    if (event.key === 'Escape' && linkFormOpen) {
      linkFormOpen = false
    } else if (event.key === 'Escape' && cropMode) {
      toggleCrop()
    } else if (event.key === 'Escape' && maximized) {
      toggleMaximized()
    } else if (source === null) {
      return
    } else if (event.key === 'PageDown') {
      goToPage(page + 1)
    } else if (event.key === 'PageUp') {
      goToPage(page - 1)
    } else if (event.key === 'Home') {
      goToPage(1)
    } else if (event.key === 'End') {
      goToPage(pageCount)
    } else if (event.key === '+' || event.key === '=') {
      zoomIn()
    } else if (event.key === '-') {
      zoomOut()
    } else if (event.key === '0') {
      setFit(fit)
    } else {
      return
    }
    event.preventDefault()
  }

  // ------------------------------------------------------------------
  // Fichier
  // ------------------------------------------------------------------

  function chooseFile() {
    fileInput.click()
  }

  function onFileChosen() {
    const chosen = fileInput.files?.[0]
    // même fichier choisi deux fois de suite : l'événement doit se redéclencher
    fileInput.value = ''
    if (chosen) replaceTbiDocument(viewer.id, { type: 'file', file: chosen })
  }

  // ------------------------------------------------------------------
  // Lien internet (document ou vidéo)
  // ------------------------------------------------------------------

  /** Formulaire de lien ouvert depuis la barre, par-dessus le document */
  let linkFormOpen = $state(false)
  /** Erreur de lecture d'un fichier vidéo (`<video>`) */
  let videoError = $state('')

  function toggleLinkForm() {
    linkFormOpen = !linkFormOpen
  }

  function onLinkSubmit(link: TbiLinkContent) {
    linkFormOpen = false
    // même lien saisi de nouveau (après une erreur réseau) : nouvel objet,
    // donc nouveau chargement
    replaceTbiDocument(viewer.id, { ...link })
  }

  let noteComponent: { stopEditing: () => void } | undefined = $state()

  /**
   * Une note repasse en affichage quand le focus quitte son visualiseur (les
   * boutons de la note et la barre de titre en font partie). L'élément actif
   * n'est connu qu'après l'événement ; il n'a pas changé quand c'est la fenêtre
   * du navigateur qui perd le focus (changement d'onglet) : la note reste alors
   * en édition.
   */
  function onWidgetFocusOut() {
    if (note === null) return
    setTimeout(() => {
      if (!widgetEl?.contains(document.activeElement)) {
        noteComponent?.stopEditing()
      }
    })
  }

  function updateNote(patch: { text?: string; fontSize?: number }) {
    if (note)
      updateTbiDocumentViewer(viewer.id, { content: { ...note, ...patch } })
  }

  function isTextInput(target: EventTarget | null): boolean {
    return (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement
    )
  }

  // ------------------------------------------------------------------
  // Plein écran (le widget occupe toute la fenêtre)
  // ------------------------------------------------------------------

  let maximized = $state(false)

  // ------------------------------------------------------------------
  // Cadre discret : au repos, seul le document est visible ; l'interface
  // (en-tête, outils, poignées) suit les commandes de la vue TBI
  // ------------------------------------------------------------------

  let isEditingNote = $state(false)
  /** Sans document (vide, chargement, erreur), l'interface reste visible */
  let showChrome = $derived(
    frame.chromeVisible ||
      linkFormOpen ||
      (source === null && !hasEmbed) ||
      isEditingNote,
  )

  /** Un clic sur un élément qui ne prend pas le focus quitte aussi la note */
  function onWindowPointerDown(event: PointerEvent) {
    if (event.target instanceof Node && widgetEl.contains(event.target)) return
    noteComponent?.stopEditing()
  }

  /** Le clavier (télécommande de présentation) agit sur le widget touché */
  function onFrameFront(event: PointerEvent) {
    frame.onFront(event)
    if (!isTextInput(event.target)) widgetEl.focus({ preventScroll: true })
  }

  function toggleMaximized() {
    maximized = !maximized
  }

  // ------------------------------------------------------------------
  // Déplacement et redimensionnement du widget (même pattern que le feu
  // tricolore : style modifié en direct, store mis à jour au relâchement)
  // ------------------------------------------------------------------

  /**
   * Pendant un geste, le lecteur vidéo (iframe) ne doit pas capter le
   * pointeur, sans quoi le glisser s'interrompt en passant au-dessus
   */
  let isGesturing = $state(false)

  let resizeObserver: ResizeObserver | undefined

  function measureBox() {
    if (!scrollEl) return
    boxW = Math.max(0, scrollEl.clientWidth - 2 * PAGE_PADDING)
    boxH = Math.max(0, scrollEl.clientHeight - 2 * PAGE_PADDING)
  }

  $effect(() => {
    const el = scrollEl
    if (!el) return
    resizeObserver = new ResizeObserver(measureBox)
    resizeObserver.observe(el)
    measureBox()
    // écouteur non passif : Ctrl + molette ne doit pas zoomer toute la page
    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      resizeObserver?.disconnect()
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('scroll', onScroll)
    }
  })

  onDestroy(() => {
    loadToken++
    pageToken++
    if (renderTimer !== undefined) clearTimeout(renderTimer)
    imageRenderToken++
    renderTask?.cancel()
    void source?.destroy()
  })

  const barButtonClass =
    'flex items-center justify-center w-11 h-11 rounded-lg shrink-0 hover:bg-coopmaths-canvas-darkest dark:hover:bg-coopmathsdark-canvas-darkest disabled:opacity-40 disabled:hover:bg-transparent'
  const toolButtonClass =
    'flex items-center justify-center w-11 h-11 rounded-lg shrink-0 text-coopmaths-corpus dark:text-coopmathsdark-corpus hover:bg-coopmaths-canvas-darkest dark:hover:bg-coopmathsdark-canvas-darkest disabled:opacity-40 disabled:hover:bg-transparent'

  function toolToggleClass(active: boolean): string {
    return active
      ? 'flex items-center justify-center w-11 h-11 rounded-lg shrink-0 bg-coopmaths-struct dark:bg-coopmathsdark-struct text-coopmaths-canvas dark:text-coopmathsdark-canvas'
      : toolButtonClass
  }
</script>

<svelte:window onpointerdown={onWindowPointerDown} />

<TbiToolFrame
  bind:frame={widgetEl}
  title={source === null && !hasEmbed ? 'Document' : fileName}
  x={viewer.x}
  y={viewer.y}
  w={viewer.w}
  h={viewer.h}
  z={viewer.z}
  minW={TBI_DOCUMENT_VIEWER_MIN_W}
  maxW={TBI_DOCUMENT_VIEWER_MAX_W}
  minH={TBI_DOCUMENT_VIEWER_MIN_H}
  maxH={TBI_DOCUMENT_VIEWER_MAX_H}
  {...frame}
  chromeVisible={showChrome}
  {maximized}
  closeLabel="Fermer le document"
  bodyClass="relative flex flex-col {showChrome
    ? ''
    : '!border-transparent !shadow-none !bg-transparent'}"
  onFront={onFrameFront}
  onGesture={(active) => (isGesturing = active)}
  onkeydown={onKeydown}
  onfocusout={onWidgetFocusOut}
>
  {#snippet header()}
    {#if externalUrl}
      <a
        class={barButtonClass}
        href={externalUrl}
        target="_blank"
        rel="noopener noreferrer"
        title="Ouvrir dans un nouvel onglet (si le site refuse de s’afficher ici)"
        aria-label="Ouvrir dans un nouvel onglet"
      >
        <i class="bx bx-link-external text-xl"></i>
      </a>
    {/if}
    {#if note === null}
      <!-- une note n'a pas d'autre source : ne pas risquer de la remplacer -->
      <button
        type="button"
        class="{barButtonClass} {linkFormOpen
          ? 'bg-coopmaths-canvas-darkest dark:bg-coopmathsdark-canvas-darkest'
          : ''}"
        title="Afficher un lien (PDF, image, vidéo, page web)"
        aria-label="Afficher un lien (PDF, image, vidéo, page web)"
        aria-pressed={linkFormOpen}
        onclick={toggleLinkForm}
      >
        <i class="bx bx-link text-xl"></i>
      </button>
      <button
        type="button"
        class={barButtonClass}
        title="Ouvrir un fichier"
        aria-label="Ouvrir un fichier"
        onclick={chooseFile}
      >
        <i class="bx bx-folder-open text-xl"></i>
      </button>
    {/if}
    <button
      type="button"
      class={barButtonClass}
      title={maximized ? 'Réduire (Échap)' : 'Agrandir à tout l’écran'}
      aria-label={maximized
        ? 'Réduire le document'
        : 'Agrandir le document à tout l’écran'}
      onclick={toggleMaximized}
    >
      <i class="bx {maximized ? 'bx-exit-fullscreen' : 'bx-fullscreen'} text-xl"
      ></i>
    </button>
  {/snippet}

  <input
    bind:this={fileInput}
    type="file"
    accept={TBI_DOCUMENT_ACCEPT}
    class="hidden"
    onchange={onFileChosen}
  />

  {#if linkFormOpen && (source !== null || hasEmbed)}
    <!-- par-dessus le document : il reste affiché tant qu'aucun lien n'est validé -->
    <div
      class="absolute left-0 right-0 top-0 z-10 flex justify-center p-2 shadow-md bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark border-b border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest"
    >
      <TbiLinkForm
        onSubmit={onLinkSubmit}
        onCancel={() => (linkFormOpen = false)}
        autofocus
      />
    </div>
  {/if}

  {#if note !== null}
    <div
      class="flex flex-col flex-1 min-h-0 overflow-hidden {maximized ? '' : ''}"
    >
      <TbiMarkdownNote
        bind:this={noteComponent}
        text={note.text}
        fontSize={note.fontSize}
        showTools={showChrome}
        onChange={updateNote}
        onEditingChange={(editing) => (isEditingNote = editing)}
      />
    </div>
  {:else if figure !== null}
    <div
      class="flex flex-col flex-1 min-h-0 overflow-hidden {maximized ? '' : ''}"
    >
      {#if figure.format === 'apigeom'}
        <TbiApigeomFigure viewerId={viewer.id} source={figure.source} />
      {:else}
        <TbiJsxGraphFigure {figure} {isGesturing} />
      {/if}
    </div>
  {:else if video !== null}
    <div
      class="relative flex-1 min-h-0 overflow-hidden bg-black {maximized
        ? ''
        : ''}"
    >
      {#if video.provider === 'file'}
        <!-- svelte-ignore a11y_media_has_caption -->
        <video
          src={video.src}
          controls
          playsinline
          preload="metadata"
          class="block w-full h-full {isGesturing ? 'pointer-events-none' : ''}"
          onerror={() =>
            (videoError =
              'Cette vidéo ne peut pas être lue : vérifier le lien ou le format (MP4, WebM).')}
        ></video>
        {#if videoError}
          <p
            class="absolute inset-x-0 top-1/2 -translate-y-1/2 px-4 text-center text-sm text-white"
          >
            {videoError}
          </p>
        {/if}
      {:else}
        <!-- `sandbox` avant `src` : il doit s'appliquer dès le premier chargement -->
        <iframe
          sandbox={video.provider === 'web' ? TBI_WEB_PAGE_SANDBOX : undefined}
          src={video.src}
          title={fileName}
          class="block w-full h-full border-0 {isGesturing
            ? 'pointer-events-none'
            : ''}"
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          referrerpolicy="strict-origin-when-cross-origin"
        ></iframe>
      {/if}
    </div>
  {:else if source === null}
    <div
      class="flex-1 min-h-0 flex flex-col items-center justify-center gap-3 p-4 text-center text-coopmaths-corpus dark:text-coopmathsdark-corpus {maximized
        ? ''
        : ''}"
    >
      {#if isLoading}
        <i
          class="bx bx-loader-alt bx-spin text-4xl text-coopmaths-struct dark:text-coopmathsdark-struct"
        ></i>
        <span class="text-sm">Ouverture du document…</span>
      {:else}
        <i
          class="bx bx-file text-5xl text-coopmaths-struct dark:text-coopmathsdark-struct"
        ></i>
        {#if errorMessage}
          <p
            class="text-sm text-coopmaths-warn-dark dark:text-coopmathsdark-warn-dark"
          >
            {errorMessage}
          </p>
        {/if}
        {#key content}
          <TbiLinkForm
            onSubmit={onLinkSubmit}
            initialValue={failedUrl}
            autofocus={content === null}
          />
        {/key}
        <button
          type="button"
          class="px-4 py-2 rounded-full shadow-md text-coopmaths-canvas dark:text-coopmathsdark-canvas bg-coopmaths-action hover:bg-coopmaths-action-darkest dark:bg-coopmathsdark-action dark:hover:bg-coopmathsdark-action-darkest"
          onclick={chooseFile}
        >
          Ouvrir un fichier
        </button>
        <p class="text-xs max-w-sm opacity-80">
          PDF, image, note Markdown, figure ApiGeom ou JSXGraph, ou lien vers
          une vidéo, une figure GeoGebra ou n’importe quelle page web. On peut
          aussi déposer un fichier ou un lien dans la page, ou le coller
          (Ctrl+V).
        </p>
      {/if}
    </div>
  {:else}
    <!-- la page se déplace à la main ; le clavier est géré par le widget -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      bind:this={scrollEl}
      class="flex-1 min-h-0 overflow-auto {showChrome
        ? 'bg-coopmaths-canvas-darkest dark:bg-coopmathsdark-canvas'
        : ''} {cropMode
        ? 'cursor-crosshair'
        : isPanning
          ? 'cursor-grabbing'
          : 'cursor-grab'}"
      style="touch-action: none"
      onpointerdown={onContentPointerDown}
      onpointermove={onContentPointerMove}
      onpointerup={onContentPointerUp}
      onpointercancel={onContentPointerUp}
    >
      <div
        class="flex items-center justify-center box-border"
        style="min-width: 100%; min-height: 100%; width: max-content; padding: {PAGE_PADDING}px"
      >
        <div
          bind:this={pageEl}
          class="relative shrink-0 overflow-hidden bg-white select-none {showChrome
            ? 'shadow-md'
            : ''}"
          style="width: {displayW}px; height: {displayH}px"
        >
          <canvas bind:this={canvasEl} class="absolute block" style={drawnStyle}
          ></canvas>
        </div>
      </div>
    </div>

    <div
      class="flex flex-row flex-wrap items-center justify-center gap-x-2 gap-y-1 px-2 py-1 shrink-0 text-sm text-coopmaths-corpus dark:text-coopmathsdark-corpus border-t border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest transition-opacity duration-150 {showChrome
        ? ''
        : 'opacity-0 pointer-events-none'} {maximized ? '' : 'rounded-b-xl'}"
    >
      {#if pageCount > 1}
        <div class="flex flex-row items-center gap-1">
          <button
            type="button"
            class={toolButtonClass}
            title="Page précédente (Page préc.)"
            aria-label="Page précédente"
            disabled={page <= 1}
            onclick={() => goToPage(page - 1)}
          >
            <i class="bx bx-chevron-left text-2xl"></i>
          </button>
          <input
            type="text"
            inputmode="numeric"
            class="w-14 h-11 px-1 text-center rounded border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest bg-coopmaths-canvas dark:bg-coopmathsdark-canvas text-coopmaths-corpus dark:text-coopmathsdark-corpus"
            aria-label="Numéro de page"
            bind:value={pageInput}
            onchange={onPageInputChange}
            onkeydown={(event) => {
              if (event.key === 'Enter') onPageInputChange()
            }}
          />
          <span class="whitespace-nowrap">/ {pageCount}</span>
          <button
            type="button"
            class={toolButtonClass}
            title="Page suivante (Page suiv.)"
            aria-label="Page suivante"
            disabled={page >= pageCount}
            onclick={() => goToPage(page + 1)}
          >
            <i class="bx bx-chevron-right text-2xl"></i>
          </button>
        </div>
      {/if}
      <div class="flex flex-row items-center gap-1">
        <button
          type="button"
          class={toolButtonClass}
          title="Réduire le zoom (−)"
          aria-label="Réduire le zoom"
          disabled={zoom <= TBI_DOCUMENT_MIN_ZOOM}
          onclick={zoomOut}
        >
          <i class="bx bx-zoom-out text-xl"></i>
        </button>
        <span class="w-12 text-center tabular-nums" aria-live="polite">
          {Math.round(zoom * 100)}&nbsp;%
        </span>
        <button
          type="button"
          class={toolButtonClass}
          title="Augmenter le zoom (+)"
          aria-label="Augmenter le zoom"
          disabled={zoom >= TBI_DOCUMENT_MAX_ZOOM}
          onclick={zoomIn}
        >
          <i class="bx bx-zoom-in text-xl"></i>
        </button>
      </div>
      <div class="flex flex-row items-center gap-1">
        <button
          type="button"
          class={toolToggleClass(fit === 'width' && zoom === 1)}
          title="Ajuster à la largeur"
          aria-label="Ajuster à la largeur"
          aria-pressed={fit === 'width' && zoom === 1}
          onclick={() => setFit('width')}
        >
          <i class="bx bx-expand-horizontal text-xl"></i>
        </button>
        <button
          type="button"
          class={toolToggleClass(fit === 'page' && zoom === 1)}
          title="Afficher la page entière"
          aria-label="Afficher la page entière"
          aria-pressed={fit === 'page' && zoom === 1}
          onclick={() => setFit('page')}
        >
          <i class="bx bx-collapse text-xl"></i>
        </button>
        <button
          type="button"
          class={toolToggleClass(cropMode)}
          title="Zoomer sur une zone : tracer un rectangle (Échap pour annuler)"
          aria-label="Zoomer sur une zone"
          aria-pressed={cropMode}
          onclick={toggleCrop}
        >
          <i class="bx bx-crop text-xl"></i>
        </button>
        <button
          type="button"
          class={toolButtonClass}
          title="Pivoter d’un quart de tour"
          aria-label="Pivoter d’un quart de tour"
          onclick={rotate}
        >
          <i class="bx bx-rotate-right text-xl"></i>
        </button>
      </div>
    </div>
  {/if}

  {#if selection}
    <!-- le widget est fixe sans transformation : coordonnées d'écran directes -->
    <div
      class="fixed pointer-events-none border-2 border-dashed border-coopmaths-struct dark:border-coopmathsdark-struct bg-coopmaths-struct/15 dark:bg-coopmathsdark-struct/15"
      style="left: {selection.left}px; top: {selection.top}px; width: {selection.width}px; height: {selection.height}px"
    ></div>
  {/if}
</TbiToolFrame>
