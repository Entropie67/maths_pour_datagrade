<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import { tweened } from 'svelte/motion'
  import type Latex from '../../../lib/Latex'
  import {
    buildImagesUrlsList,
    getLogoCanUrls,
    doesLatexNeedsPics,
    getExosContentList,
    getPicsNames,
  } from '../../../lib/Latex'
  import { type LatexFileInfos } from '../../../lib/LatexTypes'
  import PdFviewer from '../../shared/forms/PDFviewer.svelte'

  const {
    latex,
    latexFileInfos,
    autoStart,
    pdfViewerDisplay,
  }: {
    latex: Latex
    latexFileInfos: LatexFileInfos
    autoStart: boolean
    pdfViewerDisplay: boolean
  } = $props()

  // Variables locales réactives
  let pdfBlob: Blob | null = $state(null)
  let downloadFilename: string | null = $state(null)
  let pdfUrl: string | null = $state(null)
  let clockAbled = $state(false)
  let errorMessage: string | null = $state(null) // 🟠 <-- nouvelle variable d’état
  let errorLog = $state('') // 🔹 pour stocker le texte brut du serveur
  let attempt = $state(0)
  let isWaitingRetry = $state(false)
  let retrySecondsLeft = $state(0)
  let cancelled = false

  const original = 60 // secondes de délai avant abandon d’une tentative
  const timer = tweened(original)

  const maxAttempts = 4 // 1 tentative initiale + 3 relances automatiques
  const retryDelaySeconds = 8
  const retryTimer = tweened(retryDelaySeconds)

  let compileIntervalId: ReturnType<typeof setInterval> | undefined
  let retryIntervalId: ReturnType<typeof setInterval> | undefined
  let retryTimeoutId: ReturnType<typeof setTimeout> | undefined

  onDestroy(() => {
    cancelled = true
    clearInterval(compileIntervalId)
    clearInterval(retryIntervalId)
    clearTimeout(retryTimeoutId)
  })

  // fabrique un nom de fichier
  function generateFilename(prefix = 'document', ext = 'pdf') {
    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
    const time = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
    return `${prefix}_${date}_${time}.${ext}`
  }

  function downloadAndExtractPDF(blob: Blob, filename: string) {
    pdfBlob = blob
    downloadFilename = filename
  }

  /**
   * Traduit l’erreur brute du `fetch` en message français compréhensible, et
   * indique si l’erreur est transitoire (service injoignable : on peut
   * relancer automatiquement) ou définitive (erreur de compilation LaTeX :
   * relancer ne changera rien).
   */
  function describeError(err: unknown): { message: string; retryable: boolean } {
    if (err instanceof DOMException && err.name === 'TimeoutError') {
      return {
        message: `Le serveur n’a pas répondu dans le délai imparti (${original}s).`,
        retryable: true,
      }
    }
    if (err instanceof TypeError) {
      // Échec réseau générique du navigateur (service injoignable, hors-ligne...)
      return {
        message: 'Le service de compilation est momentanément injoignable.',
        retryable: true,
      }
    }
    return {
      message: err instanceof Error ? err.message : String(err),
      retryable: false,
    }
  }

  // une seule tentative de compilation
  async function tryCompileOnce(formData: FormData) {
    timer.set(original)
    clockAbled = true
    clearInterval(compileIntervalId)
    compileIntervalId = setInterval(() => {
      timer.update((n) => {
        if (n > 0) return n - 1
        clearInterval(compileIntervalId)
        return 0
      })
    }, 1000)

    try {
      const res = await fetch('https://latexcompiler.duckdns.org/generate', {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(original * 1000),
      })
      if (!res.ok) {
        // Récupère le contenu d’erreur (même en 500)
        errorLog = await res.text()
        console.error('Réponse serveur:', res.status, errorLog)
        throw new Error(`La compilation a échoué (erreur ${res.status}).`)
      }
      const blob = await res.blob()
      await downloadAndExtractPDF(blob, generateFilename('document', 'pdf'))
    } finally {
      clockAbled = false
      clearInterval(compileIntervalId)
    }
  }

  // attend `seconds` secondes en affichant un décompte, avant de relancer
  function waitBeforeRetry(seconds: number): Promise<void> {
    return new Promise((resolve) => {
      isWaitingRetry = true
      retrySecondsLeft = seconds
      retryTimer.set(seconds)
      clearInterval(retryIntervalId)
      retryIntervalId = setInterval(() => {
        retrySecondsLeft = Math.max(retrySecondsLeft - 1, 0)
        retryTimer.set(retrySecondsLeft)
        if (retrySecondsLeft <= 0) clearInterval(retryIntervalId)
      }, 1000)
      retryTimeoutId = setTimeout(() => {
        isWaitingRetry = false
        resolve()
      }, seconds * 1000)
    })
  }

  // 🟢 fonction de compilation, avec relance automatique en cas d’erreur réseau
  export async function compileToPDF() {
    errorMessage = null // 🧹 reset erreur à chaque tentative
    errorLog = '' // 🔹 reset log d’erreur
    pdfBlob = null
    downloadFilename = null
    attempt = 0

    const contents = await latex.getContents(latexFileInfos)
    if (contents.content === '') {
      return
    }
    const { latexWithPreamble } = await latex.getFile(latexFileInfos)
    const picsWanted = doesLatexNeedsPics(contents)
    const exosContentList = getExosContentList(latex.exercices)
    const picsNames = getPicsNames(exosContentList)
    const imagesUrls: string[] = picsWanted
      ? [
          ...buildImagesUrlsList(exosContentList, picsNames),
          ...getLogoCanUrls(latexWithPreamble),
        ]
      : []

    const formData = new FormData()
    formData.append('name', 'document.tex')
    formData.append('originalname', 'document.tex')
    formData.append('file', new Blob([latexWithPreamble]), 'document.tex')

    for (let im = 0; im < imagesUrls.length; im++) {
      const imaUrl = imagesUrls[im].replace(
        'https://coopmaths.fr',
        window.location.origin,
      )
      const visual = await fetch(imaUrl)
      const blob = await visual.blob()
      formData.append('name', imaUrl.split('/').slice(-1)[0])
      formData.append('originalname', imaUrl.split('/').slice(-1)[0])
      formData.append('file', blob, imaUrl.split('/').slice(-1)[0])
    }

    for (attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await tryCompileOnce(formData)
        return // succès
      } catch (err) {
        if (cancelled) return
        const { message, retryable } = describeError(err)
        console.error(
          `Erreur de compilation (tentative ${attempt}/${maxAttempts}) :`,
          err,
        )
        errorMessage = message

        const isLastAttempt = attempt === maxAttempts
        if (!retryable || isLastAttempt) return

        await waitBeforeRetry(retryDelaySeconds)
        if (cancelled) return
      }
    }
  }

  $effect(() => {
    if (pdfBlob === null) {
      pdfUrl = null
      return
    }

    const url = URL.createObjectURL(pdfBlob)
    pdfUrl = url

    // cleanup garanti :
    // - avant le prochain effet
    // - à la destruction du composant
    return () => {
      URL.revokeObjectURL(url)
    }
  })

  // auto-lancement
  onMount(() => {
    if (autoStart) compileToPDF()
  })
</script>

<div class="flex flex-col h-full">
  {#if !autoStart}
    <!-- 🟣 Bouton manuel pour lancer la compilation -->
    <div class="m-2 text-center">
      <button
        onclick={compileToPDF}
        class="px-3 py-1 rounded bg-coopmaths-action text-white hover:bg-coopmaths-action-lightest disabled:opacity-50"
        disabled={clockAbled || isWaitingRetry}
      >
        {#if clockAbled}
          Compilation en cours...
        {:else if isWaitingRetry}
          Nouvelle tentative en cours...
        {:else}
          Compiler en PDF
        {/if}
      </button>
    </div>
  {/if}

  {#if clockAbled}
    <div class="loader text-center m-2">
      <i class="bx bx-loader-alt bx-spin text-lg"></i>
      <progress value={$timer / original}></progress>
      {$timer.toFixed(0)}s
      {#if attempt > 1}
        <div class="text-xs text-coopmaths-corpus dark:text-coopmathsdark-corpus">
          Tentative {attempt}/{maxAttempts}
        </div>
      {/if}
    </div>
  {/if}

  {#if isWaitingRetry}
    <div class="m-2 p-2 text-center text-amber-700 border border-amber-400 bg-amber-50 rounded">
      <i class="bx bx-loader-alt bx-spin text-lg"></i>
      Nouvelle tentative dans {retrySecondsLeft}s… (tentative {attempt + 1}/{maxAttempts})
      <progress class="block w-full mt-1" value={$retryTimer / retryDelaySeconds}></progress>
    </div>
  {/if}

  {#if pdfBlob}
    {#if downloadFilename}
      <div class="m-2">
        <a
          href={pdfUrl}
          download={downloadFilename}
          class="px-3 py-1 rounded bg-coopmaths-action text-white hover:bg-coopmaths-action-lightest"
        >
          Télécharger {downloadFilename}
        </a>
      </div>
    {/if}
    {#if pdfViewerDisplay}
      <div class="flex-1 overflow-auto m-2">
        <PdFviewer blob={pdfBlob} />
      </div>
    {/if}
  {/if}

  {#if !pdfBlob && !clockAbled && !isWaitingRetry && !errorMessage}
    <div
      class="m-2 text-center text-coopmaths-corpus dark:text-coopmathsdark-corpus"
    >
      Aucun PDF généré
    </div>
  {/if}

  <!-- 🔴 Message d’erreur (affiché seulement une fois toutes les tentatives épuisées) -->
  {#if errorMessage && !clockAbled && !isWaitingRetry}
    <div
      class="m-2 p-2 text-center text-red-600 border border-red-400 bg-red-50 rounded"
    >
      ⚠️ Aucun PDF généré : {errorMessage}
      {#if attempt > 1}
        <div class="text-xs mt-1">
          Échec après {attempt} tentative{attempt > 1 ? 's' : ''}.
        </div>
      {/if}
      <div class="mt-2">
        <button
          onclick={compileToPDF}
          class="px-3 py-1 rounded bg-coopmaths-action text-white hover:bg-coopmaths-action-lightest"
        >
          Réessayer
        </button>
      </div>
    </div>
  {/if}

  {#if errorLog}
    <div
      class="m-2 p-2 border border-gray-300 bg-gray-100 rounded text-left overflow-auto"
    >
      <pre class="text-xs text-gray-800 whitespace-pre-wrap">
        {errorLog}
      </pre>
    </div>
  {/if}
</div>
