<script lang="ts">
  import { onDestroy, onMount, tick } from 'svelte'
  import { writable } from 'svelte/store'
  import { generateLatex, handleUrl } from '../../../lib/alacarte'
  import { mathaleaGetExercicesFromParams } from '../../../lib/mathalea'
  import { darkMode } from '../../../lib/stores/generalStore'
  import { referentielLocale } from '../../../lib/stores/languagesStore'
  import type { IExercice, IExerciceStatique } from '../../../lib/types'
  import Footer from '../../Footer.svelte'
  import ButtonActionInfo from '../../shared/forms/ButtonActionInfo.svelte'
  import ButtonTextAction from '../../shared/forms/ButtonTextAction.svelte'
  import NavBar from '../../shared/header/NavBar.svelte'

  const LS_KEY = 'mathalea_alacarte'

  type ItemEntry = { name: string; url: string }
  type DocumentEntry = { title: string; items: string[]; number: number }
  type DragState = {
    docIndex: number
    fromName: string
    overName: string | null
  }

  let items: ItemEntry[] = []
  let documents: DocumentEntry[] = []

  // --- Restore prompt ---
  let showRestorePrompt = false
  let savedPreview = ''

  // --- Raw editor ---
  let showRawEditor = false
  let rawJson = ''
  let rawJsonError = ''
  let focusedItemName = ''

  // --- Drag & drop ---
  let dragState: DragState | null = null

  // --- URL picker ---
  let showUrlPicker = false
  let pickerIframeRef: HTMLIFrameElement
  let editingItemIndex = -1
  let pickerCurrentUrl = ''
  let pickerSrc = ''
  let pickerPollInterval: ReturnType<typeof setInterval> | null = null

  // --- PDF dialog ---
  let documentTitle = 'Évaluation à la carte'

  let showPdfDialog = false
  let pdfLatexContent = ''
  let pdfCompiling = false
  let pdfReady = false
  let pdfOutputDiv: HTMLDivElement
  let compiledPdfBlobUrl: string | null = null

  function revokeCompiledPdf() {
    if (compiledPdfBlobUrl) {
      URL.revokeObjectURL(compiledPdfBlobUrl)
      compiledPdfBlobUrl = null
    }
  }

  // --- PDF compilation animation ---
  const COMPILATION_MESSAGES = [
    'Envoi vers texlive.net…',
    'Compilation LuaLaTeX…',
    'Traitement des exercices…',
    'Génération des pages…',
    'Finalisation du PDF…',
  ]
  let compilationStep = 0
  let compilationInterval: ReturnType<typeof setInterval> | null = null

  function startCompilationAnimation() {
    compilationStep = 0
    compilationInterval = setInterval(() => {
      compilationStep = (compilationStep + 1) % COMPILATION_MESSAGES.length
    }, 1800)
  }

  function stopCompilationAnimation() {
    if (compilationInterval !== null) {
      clearInterval(compilationInterval)
      compilationInterval = null
    }
  }

  // --- File input ---
  let fileInput: HTMLInputElement

  // --- Auto-regeneration ---
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  function scheduleLatexRegeneration() {
    if (debounceTimer !== null) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      void handleValidate()
    }, 600)
  }

  const latexOutput = writable('')
  const itemsWithExercises: {
    [key: string]: (IExercice | IExerciceStatique)[]
  } = {}

  $: validItemNames = items.map((i) => i.name).filter((n) => n.trim() !== '')

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  onMount(() => {
    const saved = localStorage.getItem(LS_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        const itemCount = Object.keys(parsed.items || {}).length
        const docCount = (parsed.documents || []).length
        savedPreview = `${itemCount} exercice${itemCount > 1 ? 's' : ''}, ${docCount} document${docCount > 1 ? 's' : ''}`
        showRestorePrompt = true
      } catch {
        // ignore corrupted data
      }
    }
  })

  function restoreFromLocalStorage() {
    const saved = localStorage.getItem(LS_KEY)
    if (saved) {
      rawJson = saved
      rawToGui()
    }
    showRestorePrompt = false
  }

  function startFresh() {
    showRestorePrompt = false
  }

  // ── JSON helpers ───────────────────────────────────────────────────────────

  function getJsonObj() {
    const itemsObj: Record<string, string> = {}
    for (const item of items) {
      if (item.name.trim()) itemsObj[item.name] = item.url
    }
    return { items: itemsObj, documents }
  }

  function rawToGui() {
    try {
      const parsed = JSON.parse(rawJson)
      items = Object.entries(parsed.items || {}).map(([name, url]) => ({
        name,
        url: url as string,
      }))
      documents = (parsed.documents || []).map((d: any) => ({
        title: d.title || '',
        items: Array.isArray(d.items) ? d.items : [],
        number: Number(d.number) || 1,
      }))
      rawJsonError = ''
      scheduleLatexRegeneration()
      return true
    } catch {
      rawJsonError = 'JSON invalide'
      return false
    }
  }

  // ── Items management ───────────────────────────────────────────────────────

  function addItem() {
    items = [...items, { name: '', url: '' }]
    scheduleLatexRegeneration()
  }

  function removeItem(index: number) {
    const removedName = items[index].name
    items = items.filter((_, i) => i !== index)
    if (removedName) {
      documents = documents.map((d) => ({
        ...d,
        items: d.items.filter((n) => n !== removedName),
      }))
    }
    scheduleLatexRegeneration()
  }

  function onItemNameFocus(name: string) {
    focusedItemName = name
  }

  function onItemNameBlur(index: number) {
    const newName = items[index].name
    if (focusedItemName !== newName && focusedItemName) {
      documents = documents.map((d) => ({
        ...d,
        items: d.items.map((n) => (n === focusedItemName ? newName : n)),
      }))
    }
    focusedItemName = ''
  }

  // ── URL picker ─────────────────────────────────────────────────────────────

  function openUrlPicker(index: number) {
    editingItemIndex = index
    const currentUrl = items[index].url?.trim()

    // Réécrit l'URL sur la même origine pour garantir l'accès same-origin
    // à contentWindow.location (même en dev vs production)
    if (currentUrl) {
      try {
        const u = new URL(currentUrl)
        pickerSrc = window.location.origin + u.pathname + u.search + u.hash
      } catch {
        pickerSrc = window.location.origin + '/alea/'
      }
    } else {
      pickerSrc = window.location.origin + '/alea/'
    }

    pickerCurrentUrl = pickerSrc
    showUrlPicker = true
    startPickerPolling()
  }

  function startPickerPolling() {
    stopPickerPolling()
    // Interroge l'iframe toutes les 300 ms pour suivre les pushState/replaceState
    pickerPollInterval = setInterval(() => {
      try {
        const href = pickerIframeRef?.contentWindow?.location.href
        if (href && href !== 'about:blank') pickerCurrentUrl = href
      } catch {
        // ne devrait pas arriver (same-origin) — on s'arrête pour éviter le spam
        stopPickerPolling()
      }
    }, 300)
  }

  function stopPickerPolling() {
    if (pickerPollInterval !== null) {
      clearInterval(pickerPollInterval)
      pickerPollInterval = null
    }
  }

  function handlePickerIframeLoad() {
    // Capture l'URL initiale ; le polling prend le relais ensuite
    try {
      const href = pickerIframeRef?.contentWindow?.location.href
      if (href && href !== 'about:blank') pickerCurrentUrl = href
    } catch {
      // cross-origin inattendu
    }
  }

  function confirmUrlPicker() {
    stopPickerPolling()
    if (editingItemIndex >= 0) {
      // Lecture directe au moment du clic — toujours à jour (same-origin)
      let finalUrl = pickerCurrentUrl
      try {
        const href = pickerIframeRef?.contentWindow?.location.href
        if (href && href !== 'about:blank') finalUrl = href
      } catch {
        // fallback sur pickerCurrentUrl (mis à jour par le polling)
      }
      if (finalUrl) {
        items[editingItemIndex].url = finalUrl
        items = items
        scheduleLatexRegeneration()
      }
    }
    showUrlPicker = false
  }

  function closeUrlPicker() {
    stopPickerPolling()
    showUrlPicker = false
  }

  onDestroy(() => {
    stopPickerPolling()
    if (debounceTimer !== null) clearTimeout(debounceTimer)
    stopCompilationAnimation()
    revokeCompiledPdf()
  })

  // ── Documents management ───────────────────────────────────────────────────

  function addDocument() {
    documents = [...documents, { title: '', items: [], number: 1 }]
    scheduleLatexRegeneration()
  }

  function removeDocument(index: number) {
    documents = documents.filter((_, i) => i !== index)
    scheduleLatexRegeneration()
  }

  function toggleItemInDocument(docIndex: number, itemName: string) {
    documents = documents.map((d, i) => {
      if (i !== docIndex) return d
      const newItems = d.items.includes(itemName)
        ? d.items.filter((n) => n !== itemName)
        : [...d.items, itemName]
      return { ...d, items: newItems }
    })
    scheduleLatexRegeneration()
  }

  // ── Drag & drop ────────────────────────────────────────────────────────────

  function onDragStart(docIndex: number, itemName: string, e: DragEvent) {
    dragState = { docIndex, fromName: itemName, overName: null }
    if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'
  }

  function onDragOver(docIndex: number, itemName: string, e: DragEvent) {
    e.preventDefault()
    if (
      dragState &&
      dragState.docIndex === docIndex &&
      itemName !== dragState.fromName
    ) {
      dragState = { ...dragState, overName: itemName }
    }
  }

  function onDragLeave(docIndex: number, itemName: string) {
    if (dragState?.docIndex === docIndex && dragState.overName === itemName) {
      dragState = { ...dragState, overName: null }
    }
  }

  function onDrop(docIndex: number, e: DragEvent) {
    e.preventDefault()
    if (!dragState || dragState.docIndex !== docIndex || !dragState.overName) {
      dragState = null
      return
    }
    const { fromName, overName } = dragState
    documents = documents.map((d, i) => {
      if (i !== docIndex) return d
      const arr = [...d.items]
      const from = arr.indexOf(fromName)
      const to = arr.indexOf(overName)
      if (from === -1 || to === -1) return d
      arr.splice(from, 1)
      arr.splice(to, 0, fromName)
      return { ...d, items: arr }
    })
    dragState = null
    scheduleLatexRegeneration()
  }

  function onDragEnd() {
    dragState = null
  }

  // ── Raw editor ─────────────────────────────────────────────────────────────

  function toggleRawEditor() {
    if (showRawEditor) {
      // Fermeture : applique si valide, sinon garde l'éditeur ouvert
      if (rawToGui()) showRawEditor = false
    } else {
      rawJson = JSON.stringify(getJsonObj(), null, 4)
      rawJsonError = ''
      showRawEditor = true
    }
  }

  function applyRawJson() {
    if (rawToGui()) showRawEditor = false
  }

  function closeRawEditor() {
    showRawEditor = false
    rawJsonError = ''
  }

  function handleKeyDownRaw(event: KeyboardEvent) {
    if (event.key === 'Tab') event.preventDefault()
  }

  // ── Save / load ────────────────────────────────────────────────────────────

  function saveJson() {
    const json = JSON.stringify(getJsonObj(), null, 4)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'alacarte.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleFileLoad(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      rawJson = e.target?.result as string
      rawToGui()
    }
    reader.readAsText(file)
    ;(event.target as HTMLInputElement).value = ''
  }

  // ── Validate (LaTeX + localStorage) ────────────────────────────────────────

  async function handleValidate() {
    const userSettings = getJsonObj()
    for (const [item, itemUrl] of Object.entries(userSettings.items)) {
      try {
        const url = new URL(itemUrl)
        const exercisesParams = handleUrl(url)
        const exercises = await mathaleaGetExercicesFromParams(exercisesParams)
        itemsWithExercises[item] = exercises
      } catch (e) {
        console.error(`Erreur pour l'item "${item}" :`, e)
      }
    }
    const content = generateLatex(userSettings, itemsWithExercises, documentTitle || 'Évaluation à la carte')
    latexOutput.set(content)
    if (Object.keys(userSettings.items).length > 0 || userSettings.documents.length > 0) {
      localStorage.setItem(LS_KEY, JSON.stringify(userSettings, null, 4))
    }
  }

  // ── PDF compilation ────────────────────────────────────────────────────────

  async function handlePdf() {
    if (!$latexOutput) await handleValidate()
    pdfLatexContent = $latexOutput
    showPdfDialog = true
    await tick()
    if (pdfLatexContent) compilePdf()
  }

  function populateTexliveForm(form: HTMLFormElement) {
    const ta = document.createElement('textarea')
    ta.name = 'filecontents[]'
    ta.textContent = pdfLatexContent
    form.appendChild(ta)
    for (const [name, value] of [
      ['filename[]', 'document.tex'],
      ['engine', 'lualatex'],
      ['return', 'pdf'],
    ] as const) {
      const inp = document.createElement('input')
      inp.type = 'hidden'
      inp.name = name
      inp.value = value
      form.appendChild(inp)
    }
  }

  function compilePdf() {
    pdfCompiling = true
    pdfReady = false
    revokeCompiledPdf()
    startCompilationAnimation()

    // Recrée l'iframe pour la réinitialiser
    pdfOutputDiv.innerHTML = ''
    const iframe = document.createElement('iframe')
    iframe.name = 'pdf-output-iframe'
    iframe.style.width = '100%'
    iframe.style.height = '100%'
    iframe.title = 'Résultat PDF'
    // formSubmitted empêche le load initial (iframe vide) d'arrêter l'animation prématurément
    let formSubmitted = false
    iframe.addEventListener('load', () => {
      if (!formSubmitted) return
      pdfCompiling = false
      pdfReady = true
      stopCompilationAnimation()
    })
    pdfOutputDiv.appendChild(iframe)

    // Affichage via soumission de formulaire (synchrone, fiable cross-browser)
    const form = document.getElementById('pdf-compilation-form') as HTMLFormElement
    form.innerHTML = ''
    form.action = 'https://texlive.net/cgi-bin/latexcgi'
    form.method = 'POST'
    form.target = 'pdf-output-iframe'
    form.enctype = 'multipart/form-data'
    populateTexliveForm(form)
    form.submit()
    formSubmitted = true

    // En parallèle : tente de récupérer le blob pour un téléchargement direct (sans recompilation)
    void fetchPdfBlob()
  }

  async function fetchPdfBlob() {
    try {
      const formData = new FormData()
      formData.append('filecontents[]', new Blob([pdfLatexContent], { type: 'text/plain' }), 'document.tex')
      formData.append('filename[]', 'document.tex')
      formData.append('engine', 'lualatex')
      formData.append('return', 'pdf')
      const response = await fetch('https://texlive.net/cgi-bin/latexcgi', { method: 'POST', body: formData })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const blob = await response.blob()
      if (blob.type === 'application/pdf') {
        compiledPdfBlobUrl = URL.createObjectURL(blob)
      }
    } catch {
      // CORS ou erreur : le téléchargement utilisera la recompilation (comportement de repli)
    }
  }

  function downloadPdf() {
    if (compiledPdfBlobUrl) {
      // PDF déjà compilé : téléchargement direct sans recompilation
      const a = document.createElement('a')
      a.href = compiledPdfBlobUrl
      a.download = 'document.pdf'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } else {
      // Repli : recompilation dans un nouvel onglet
      const form = document.createElement('form')
      form.method = 'POST'
      form.action = 'https://texlive.net/cgi-bin/latexcgi'
      form.enctype = 'multipart/form-data'
      form.target = '_blank'
      form.style.display = 'none'
      populateTexliveForm(form)
      document.body.appendChild(form)
      form.submit()
      document.body.removeChild(form)
    }
  }
</script>

<!-- ═══════════════════════════════════════════════════════════ MODALES ══ -->

<!-- Modale : sélecteur d'URL MathALÉA -->
{#if showUrlPicker}
  <div class="fixed inset-0 z-50 flex flex-col p-4 bg-black/60">
    <div
      class="flex flex-col w-full h-full rounded-none overflow-hidden shadow-2xl
        bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
    >
      <!-- En-tête -->
      <div
        class="flex items-center gap-3 px-4 py-3 shrink-0
          border-b border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest"
      >
        <i
          class="bx bx-link text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest text-base shrink-0"
        ></i>
        <input
          bind:value={pickerCurrentUrl}
          class="flex-1 min-w-0 px-2.5 py-1.5 text-xs rounded-none border font-mono
            border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest
            bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark
            text-coopmaths-corpus dark:text-coopmathsdark-corpus
            focus:outline-none focus:border-coopmaths-action dark:focus:border-coopmathsdark-action"
          placeholder="URL récupérée automatiquement…"
        />
        <button
          class="shrink-0 inline-flex items-center gap-1.5 rounded-none px-3 py-1.5 text-sm font-medium
            text-coopmaths-canvas dark:text-coopmathsdark-canvas
            bg-coopmaths-action dark:bg-coopmathsdark-action
            hover:bg-coopmaths-action-lightest dark:hover:bg-coopmathsdark-action-lightest
            transition-colors"
          on:click={confirmUrlPicker}
        >
          <i class="bx bx-check text-base"></i> Valider
        </button>
        <button
          class="shrink-0 rounded-none p-1.5
            text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest
            hover:text-coopmaths-corpus dark:hover:text-coopmathsdark-corpus
            transition-colors"
          on:click={closeUrlPicker}
          title="Fermer"
        >
          <i class="bx bx-x text-xl block"></i>
        </button>
      </div>
      <p
        class="px-4 py-1.5 text-xs text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest shrink-0 border-b border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark"
      >
        Composez votre sélection d'exercices, puis cliquez sur <strong
          >Valider</strong
        > pour récupérer l'URL.
      </p>
      <!-- iframe MathALÉA -->
      <iframe
        bind:this={pickerIframeRef}
        src={pickerSrc}
        class="flex-1 w-full border-0"
        title="Sélection d'exercices MathALÉA"
        on:load={handlePickerIframeLoad}
      ></iframe>
    </div>
  </div>
{/if}

<!-- Modale : compilation PDF -->
{#if showPdfDialog}
  <div class="fixed inset-0 z-50 flex flex-col p-4 bg-black/60">
    <div
      class="flex flex-col w-full h-full rounded-none overflow-hidden shadow-2xl
        bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
    >
      <!-- En-tête -->
      <div
        class="flex items-center gap-3 px-4 py-3 shrink-0
          border-b border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest"
      >
        <i
          class="bx bxs-file-pdf text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest text-base"
        ></i>
        <span class="flex-1 flex items-center gap-2 min-w-0">
          <span class="text-sm font-medium text-coopmaths-corpus dark:text-coopmathsdark-corpus shrink-0">
            Compilation PDF
          </span>
          {#if pdfCompiling}
            <span class="flex items-center gap-1.5 min-w-0 text-coopmaths-action dark:text-coopmathsdark-action">
              <i class="bx bx-loader-alt bx-spin text-base shrink-0"></i>
              <span class="text-sm font-medium shrink-0">Compilation en cours, veuillez patienter…</span>
            </span>
          {/if}
        </span>
        {#if pdfReady}
          <button
            class="shrink-0 inline-flex items-center gap-1.5 rounded-none px-3 py-1.5 text-sm font-medium
              text-coopmaths-canvas dark:text-coopmathsdark-canvas
              bg-coopmaths-action dark:bg-coopmathsdark-action
              hover:bg-coopmaths-action-lightest dark:hover:bg-coopmathsdark-action-lightest
              transition-colors"
            on:click={downloadPdf}
            title="Télécharger le PDF"
          >
            <i class="bx bx-download text-base"></i> Télécharger
          </button>
        {/if}
        <button
          class="shrink-0 rounded-none p-1.5
            text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest
            hover:text-coopmaths-corpus dark:hover:text-coopmathsdark-corpus transition-colors"
          on:click={() => (showPdfDialog = false)}
          title="Fermer"
        >
          <i class="bx bx-x text-xl block"></i>
        </button>
      </div>

      <!-- Corps : éditeur LaTeX à gauche, PDF à droite -->
      <div class="flex flex-1 overflow-hidden">
        <!-- Panneau LaTeX -->
        <div
          class="flex flex-col w-2/5 p-3 gap-2
            border-r border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest"
        >
          <textarea
            bind:value={pdfLatexContent}
            class="flex-1 p-2.5 rounded-none border font-mono text-xs leading-relaxed resize-none
              border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest
              bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark
              text-coopmaths-corpus dark:text-coopmathsdark-corpus
              focus:outline-none focus:border-coopmaths-action dark:focus:border-coopmathsdark-action
              transition-colors"
            spellcheck="false"
          ></textarea>
          <button
            class="shrink-0 inline-flex items-center justify-center gap-1.5
              rounded-none px-3 py-1.5 text-sm font-medium transition-colors
              text-coopmaths-canvas dark:text-coopmathsdark-canvas
              bg-coopmaths-action dark:bg-coopmathsdark-action
              hover:bg-coopmaths-action-lightest dark:hover:bg-coopmathsdark-action-lightest
              disabled:opacity-50 disabled:cursor-not-allowed"
            on:click={compilePdf}
            disabled={pdfCompiling}
          >
            <i
              class="bx {pdfCompiling
                ? 'bx-loader-alt bx-spin'
                : 'bx-play'} text-base"
            ></i>
            {pdfCompiling ? 'Compilation…' : 'Compiler en PDF'}
          </button>
        </div>

        <!-- Panneau PDF -->
        <div class="flex-1 relative bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark">
          {#if pdfCompiling}
            <div class="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4
              bg-coopmaths-canvas dark:bg-coopmathsdark-canvas">
              <i class="bx bx-loader-alt bx-spin text-5xl text-coopmaths-action dark:text-coopmathsdark-action"></i>
              <p class="text-sm font-medium text-coopmaths-corpus dark:text-coopmathsdark-corpus">
                Veuillez patienter…
              </p>
              <p class="text-xs text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest">
                {COMPILATION_MESSAGES[compilationStep]}
              </p>
            </div>
          {/if}
          <div
            bind:this={pdfOutputDiv}
            class="w-full h-full"
          ></div>
        </div>
      </div>
    </div>
  </div>
  <!-- Formulaire caché pour la soumission vers texlive.net -->
  <form id="pdf-compilation-form" style="display:none"></form>
{/if}

<!-- ══════════════════════════════════════════════════════════ PAGE MAIN ══ -->

<main
  class="min-h-screen flex flex-col bg-coopmaths-canvas dark:bg-coopmathsdark-canvas {$darkMode.isActive
    ? 'dark'
    : ''}"
>
  <NavBar
    subtitle="À la carte"
    subtitleType="export"
    handleLanguage={() => {}}
    locale={$referentielLocale}
  />

  <section
    class="flex-1 px-6 py-8 md:py-12 bg-coopmaths-canvas dark:bg-coopmathsdark-canvas max-w-7xl w-full mx-auto"
  >
    <!-- Bannière restauration -->
    {#if showRestorePrompt}
      <div
        class="mb-6 rounded-none border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest
          bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark
          p-4 flex flex-col sm:flex-row sm:items-center gap-3"
      >
        <i
          class="bx bx-history text-xl text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light shrink-0"
        ></i>
        <div class="flex-1 min-w-0">
          <p
            class="text-sm font-medium text-coopmaths-corpus dark:text-coopmathsdark-corpus"
          >
            Travail précédent disponible
          </p>
          <p
            class="text-xs text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light mt-0.5"
          >
            {savedPreview} — voulez-vous reprendre où vous en étiez ?
          </p>
        </div>
        <div class="flex gap-2 shrink-0">
          <button
            class="inline-flex items-center rounded-none px-3 py-1.5 text-sm font-medium
              text-coopmaths-canvas dark:text-coopmathsdark-canvas
              bg-coopmaths-action dark:bg-coopmathsdark-action
              hover:bg-coopmaths-action-lightest dark:hover:bg-coopmathsdark-action-lightest
              transition-colors"
            on:click={restoreFromLocalStorage}
          >
            Reprendre
          </button>
          <button
            class="inline-flex items-center rounded-none px-3 py-1.5 text-sm
              border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest
              text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light
              hover:border-coopmaths-canvas-moredark dark:hover:border-coopmathsdark-canvas-moredark
              transition-colors"
            on:click={startFresh}
          >
            Commencer vide
          </button>
        </div>
      </div>
    {/if}

    <!-- Titre du document -->
    <div class="flex items-center gap-3 mb-4">
      <label
        for="document-title-input"
        class="shrink-0 text-sm font-medium text-coopmaths-corpus dark:text-coopmathsdark-corpus"
      >
        Titre du document
      </label>
      <input
        id="document-title-input"
        bind:value={documentTitle}
        on:input={scheduleLatexRegeneration}
        placeholder="Évaluation à la carte"
        class="flex-1 max-w-sm px-2.5 py-1.5 text-sm rounded-none border
          border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest
          bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark
          text-coopmaths-corpus dark:text-coopmathsdark-corpus
          focus:outline-none focus:border-coopmaths-action dark:focus:border-coopmathsdark-action
          transition-colors"
      />
    </div>

    <!-- Barre d'actions principale -->
    <div
      class="flex flex-wrap items-center gap-2 mb-8 pb-6
        border-b border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest"
    >
      <span class={!$latexOutput ? 'opacity-40 pointer-events-none' : ''}>
        <ButtonTextAction text="PDF" icon="bxs-file-pdf" on:click={handlePdf} disabled={!$latexOutput} />
      </span>
      <button
        class="inline-flex items-center gap-1.5 rounded-none px-3 py-1.5 text-sm font-medium
          text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light
          bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark
          border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest
          hover:border-coopmaths-action dark:hover:border-coopmathsdark-action
          hover:text-coopmaths-action dark:hover:text-coopmathsdark-action
          transition-colors"
        on:click={saveJson}
        title="Télécharger le fichier JSON"
      >
        <i class="bx bx-save text-base"></i> Sauvegarder
      </button>

      <button
        class="inline-flex items-center gap-1.5 rounded-none px-3 py-1.5 text-sm font-medium
          text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light
          bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark
          border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest
          hover:border-coopmaths-action dark:hover:border-coopmathsdark-action
          hover:text-coopmaths-action dark:hover:text-coopmathsdark-action
          transition-colors"
        on:click={() => fileInput.click()}
        title="Charger un fichier JSON"
      >
        <i class="bx bx-upload text-base"></i> Charger
      </button>
      <input
        bind:this={fileInput}
        type="file"
        accept=".json"
        class="hidden"
        on:change={handleFileLoad}
      />

      <button
        class="inline-flex items-center gap-1.5 rounded-none px-3 py-1.5 text-sm font-medium
          transition-colors
          {showRawEditor
            ? 'text-coopmaths-canvas dark:text-coopmathsdark-canvas bg-coopmaths-action dark:bg-coopmathsdark-action hover:bg-coopmaths-action-lightest dark:hover:bg-coopmathsdark-action-lightest'
            : 'text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest hover:border-coopmaths-action dark:hover:border-coopmathsdark-action hover:text-coopmaths-action dark:hover:text-coopmathsdark-action'}"
        on:click={toggleRawEditor}
        title={showRawEditor ? 'Revenir au formulaire' : 'Éditer le JSON brut'}
      >
        <i class="bx {showRawEditor ? 'bx-table' : 'bx-code-alt'} text-base"></i>
        {showRawEditor ? 'Formulaire' : 'JSON brut'}
      </button>
    </div>

    <!-- Grille principale : Exercices + Documents (masquée quand JSON ouvert) -->
    {#if showRawEditor}
      <!-- Éditeur JSON brut : remplace la grille -->
      <div class="mb-8">
        <textarea
          bind:value={rawJson}
          rows="20"
          class="w-full p-3 rounded-none border font-mono text-sm leading-relaxed
            border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest
            bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark
            text-coopmaths-corpus dark:text-coopmathsdark-corpus
            focus:outline-none focus:border-coopmaths-action dark:focus:border-coopmathsdark-action
            transition-colors resize-none"
          on:keydown={handleKeyDownRaw}
        ></textarea>
        {#if rawJsonError}
          <p class="text-red-500 text-xs mt-1.5 flex items-center gap-1">
            <i class="bx bx-error-circle"></i>
            {rawJsonError}
          </p>
        {/if}
        <div class="flex gap-2 mt-3">
          <button
            class="inline-flex items-center rounded-none px-3 py-1.5 text-sm font-medium
              text-coopmaths-canvas dark:text-coopmathsdark-canvas
              bg-coopmaths-action dark:bg-coopmathsdark-action
              hover:bg-coopmaths-action-lightest dark:hover:bg-coopmathsdark-action-lightest
              transition-colors"
            on:click={applyRawJson}
          >
            Appliquer
          </button>
          <button
            class="inline-flex items-center rounded-none px-3 py-1.5 text-sm
              border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest
              text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light
              hover:border-coopmaths-canvas-moredark dark:hover:border-coopmathsdark-canvas-moredark
              transition-colors"
            on:click={closeRawEditor}
          >
            Annuler
          </button>
        </div>
      </div>
    {:else}
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
      <!-- Cadre 1 : Exercices -->
      <div>
        <div class="flex items-baseline gap-3 mb-4">
          <h2
            class="text-base font-semibold text-coopmaths-corpus dark:text-coopmathsdark-corpus"
          >
            Sélection d'exercices
          </h2>
          <span
            class="text-xs text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest"
          >
            nom + URL MathALÉA
          </span>
        </div>

        <div class="space-y-2">
          {#each items as item, i}
            <div
              class="group rounded-none border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest
                bg-coopmaths-canvas dark:bg-coopmathsdark-canvas
                hover:border-coopmaths-canvas-moredark dark:hover:border-coopmathsdark-canvas-moredark
                transition-colors p-3"
            >
              <div class="flex gap-2 items-center mb-2">
                <input
                  bind:value={item.name}
                  placeholder="Nom"
                  class="flex-1 min-w-0 px-2.5 py-1.5 text-sm rounded-none border
                    border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest
                    bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark
                    text-coopmaths-corpus dark:text-coopmathsdark-corpus font-medium
                    placeholder:text-coopmaths-corpus-lightest dark:placeholder:text-coopmathsdark-corpus-lightest
                    focus:outline-none focus:border-coopmaths-action dark:focus:border-coopmathsdark-action
                    transition-colors"
                  on:focus={() => onItemNameFocus(item.name)}
                  on:blur={() => onItemNameBlur(i)}
                  on:input={scheduleLatexRegeneration}
                />
                <button
                  class="shrink-0 rounded-none p-1.5 opacity-0 group-hover:opacity-100
                    text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest
                    hover:text-red-500 dark:hover:text-red-400 transition-all"
                  on:click={() => removeItem(i)}
                  title="Supprimer"
                >
                  <i class="bx bx-trash text-sm block"></i>
                </button>
              </div>

              <!-- Champ URL avec bouton sélecteur -->
              <div class="relative">
                <input
                  bind:value={item.url}
                  placeholder="https://coopmaths.fr/alea/?…"
                  class="w-full pl-2.5 pr-8 py-1.5 text-xs rounded-none border font-mono
                    border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest
                    bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark
                    text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light
                    placeholder:text-coopmaths-corpus-lightest dark:placeholder:text-coopmathsdark-corpus-lightest
                    focus:outline-none focus:border-coopmaths-action dark:focus:border-coopmathsdark-action
                    transition-colors"
                  on:input={scheduleLatexRegeneration}
                />
                <button
                  class="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-none p-0.5
                    text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest
                    hover:text-coopmaths-action dark:hover:text-coopmathsdark-action
                    transition-colors"
                  on:click|preventDefault|stopPropagation={() =>
                    openUrlPicker(i)}
                  title="Choisir dans MathALÉA"
                >
                  <i class="bx bx-link-external text-sm block"></i>
                </button>
              </div>
            </div>
          {/each}

          {#if items.length === 0}
            <div
              class="rounded-none border border-dashed border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest
                p-6 text-center"
            >
              <p
                class="text-sm text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest"
              >
                Aucun exercice
              </p>
            </div>
          {/if}
        </div>

        <button
          class="mt-3 inline-flex items-center gap-1.5 rounded-none px-3 py-1.5 text-sm font-medium
            text-coopmaths-canvas dark:text-coopmathsdark-canvas
            bg-coopmaths-action dark:bg-coopmathsdark-action
            hover:bg-coopmaths-action-lightest dark:hover:bg-coopmathsdark-action-lightest
            transition-colors"
          on:click={addItem}
        >
          <i class="bx bx-plus text-base"></i> Ajouter
        </button>
      </div>

      <!-- Cadre 2 : Documents -->
      <div>
        <div class="flex items-baseline gap-3 mb-4">
          <h2
            class="text-base font-semibold text-coopmaths-corpus dark:text-coopmathsdark-corpus"
          >
            Attribuer des exercices à des élèves ou des groupes
          </h2>
          <span
            class="text-xs text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest"
          >
            nom + exercices + nombre de versions
          </span>
        </div>

        <div class="space-y-2">
          {#each documents as doc, i}
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
              class="group rounded-none border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest
                bg-coopmaths-canvas dark:bg-coopmathsdark-canvas
                hover:border-coopmaths-canvas-moredark dark:hover:border-coopmathsdark-canvas-moredark
                transition-colors p-3"
              on:drop={(e) => onDrop(i, e)}
              on:dragover={(e) => e.preventDefault()}
            >
              <!-- En-tête : titre + versions + supprimer -->
              <div class="flex gap-2 items-center mb-3">
                <input
                  bind:value={doc.title}
                  placeholder="Titre"
                  on:input={scheduleLatexRegeneration}
                  class="flex-1 min-w-0 px-2.5 py-1.5 text-sm rounded-none border font-medium
                    border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest
                    bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark
                    text-coopmaths-corpus dark:text-coopmathsdark-corpus
                    placeholder:text-coopmaths-corpus-lightest dark:placeholder:text-coopmathsdark-corpus-lightest
                    focus:outline-none focus:border-coopmaths-action dark:focus:border-coopmathsdark-action
                    transition-colors"
                />
                <div class="flex items-center gap-1.5 shrink-0">
                  <span
                    class="text-xs text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest"
                    >×</span
                  >
                  <input
                    bind:value={doc.number}
                    type="number"
                    min="1"
                    on:change={scheduleLatexRegeneration}
                    class="w-12 px-1.5 py-1.5 text-sm text-center rounded-none border
                      border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest
                      bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark
                      text-coopmaths-corpus dark:text-coopmathsdark-corpus
                      focus:outline-none focus:border-coopmaths-action dark:focus:border-coopmathsdark-action
                      transition-colors [color-scheme:light]"
                    title="Nombre de versions"
                  />
                </div>
                <button
                  class="shrink-0 rounded-none p-1.5 opacity-0 group-hover:opacity-100
                    text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest
                    hover:text-red-500 dark:hover:text-red-400 transition-all"
                  on:click={() => removeDocument(i)}
                  title="Supprimer"
                >
                  <i class="bx bx-trash text-sm block"></i>
                </button>
              </div>

              <!-- Items actifs : ordonnés, déplaçables -->
              {#if doc.items.length > 0}
                <div class="flex flex-wrap gap-1.5 mb-2">
                  {#each doc.items as itemName}
                    <!-- svelte-ignore a11y_no_static_element_interactions -->
                    <div
                      draggable="true"
                      class="inline-flex items-center gap-1 text-xs rounded-none px-1.5 py-1 border
                        select-none cursor-grab active:cursor-grabbing transition-all
                        border-coopmaths-action/40 dark:border-coopmathsdark-action/40
                        bg-coopmaths-action/8 dark:bg-coopmathsdark-action/8
                        text-coopmaths-action dark:text-coopmathsdark-action font-medium
                        {dragState?.docIndex === i &&
                      dragState.fromName === itemName
                        ? 'opacity-30 scale-95'
                        : ''}
                        {dragState?.docIndex === i &&
                      dragState.overName === itemName
                        ? 'ring-1 ring-coopmaths-action dark:ring-coopmathsdark-action scale-105'
                        : ''}"
                      on:dragstart={(e) => onDragStart(i, itemName, e)}
                      on:dragover={(e) => onDragOver(i, itemName, e)}
                      on:dragleave={() => onDragLeave(i, itemName)}
                      on:dragend={onDragEnd}
                    >
                      <i
                        class="bx bx-grid-vertical text-coopmaths-action/40 dark:text-coopmathsdark-action/40 text-sm"
                      ></i>
                      {itemName}
                      <button
                        class="ml-0.5 text-coopmaths-action/50 dark:text-coopmathsdark-action/50
                          hover:text-coopmaths-action dark:hover:text-coopmathsdark-action transition-colors"
                        on:click={() => toggleItemInDocument(i, itemName)}
                        title="Retirer"
                      >
                        <i class="bx bx-x block"></i>
                      </button>
                    </div>
                  {/each}
                </div>
              {/if}

              <!-- Items disponibles à ajouter -->
              {#if validItemNames.filter((n) => !doc.items.includes(n)).length > 0}
                <div class="flex flex-wrap gap-1.5">
                  {#each validItemNames.filter((n) => !doc.items.includes(n)) as name}
                    <button
                      class="inline-flex items-center gap-1 text-xs rounded-none px-1.5 py-1 border
                        border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest
                        text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest
                        hover:border-coopmaths-action/50 dark:hover:border-coopmathsdark-action/50
                        hover:text-coopmaths-corpus-light dark:hover:text-coopmathsdark-corpus-light
                        transition-colors"
                      on:click={() => toggleItemInDocument(i, name)}
                      title="Ajouter"
                    >
                      <i class="bx bx-plus"></i>{name}
                    </button>
                  {/each}
                </div>
              {:else if validItemNames.length === 0}
                <span
                  class="text-xs italic text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest"
                >
                  Définissez des exercices à gauche
                </span>
              {/if}
            </div>
          {/each}

          {#if documents.length === 0}
            <div
              class="rounded-none border border-dashed border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest
                p-6 text-center"
            >
              <p
                class="text-sm text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest"
              >
                Aucun document
              </p>
            </div>
          {/if}
        </div>

        <button
          class="mt-3 inline-flex items-center gap-1.5 rounded-none px-3 py-1.5 text-sm font-medium
            text-coopmaths-canvas dark:text-coopmathsdark-canvas
            bg-coopmaths-action dark:bg-coopmathsdark-action
            hover:bg-coopmaths-action-lightest dark:hover:bg-coopmathsdark-action-lightest
            transition-colors"
          on:click={addDocument}
        >
          <i class="bx bx-plus text-base"></i> Ajouter
        </button>
      </div>
    </div>
    {/if}

    <!-- Séparateur + actions LaTeX / PDF -->
    <div
      class="pt-6 border-t border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest"
    >
      <div class="flex flex-wrap gap-2 mb-4">
        <span class={!$latexOutput ? 'opacity-40 pointer-events-none' : ''}>
          <ButtonActionInfo
            action="copy"
            textToCopy={$latexOutput}
            text="Copier le code"
            icon="bx-copy"
            successMessage="Code LaTeX copié"
            errorMessage="Impossible de copier le code LaTeX dans le presse-papier"
            class="px-2 py-1 rounded-none"
            disabled={!$latexOutput}
          />
        </span>
      </div>

      {#if $latexOutput}
        <pre
          class="rounded-none border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest
            bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark
            text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light
            p-4 w-full overflow-auto text-xs leading-relaxed">{$latexOutput}</pre>
      {/if}
    </div>
  </section>

  <footer>
    <Footer />
  </footer>
</main>

<style>
  footer {
    margin-top: auto;
  }

</style>
