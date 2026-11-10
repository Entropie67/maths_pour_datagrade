<script lang="ts">
  import seedrandom from 'seedrandom'
  import { onDestroy, onMount } from 'svelte'
  import { get } from 'svelte/store'
  import { orangeMathalea } from '../../../lib/colors'
  import { buildExercisesList } from '../../../lib/components/exercisesUtils'
  import {
    mathaleaFormatExercice,
    mathaleaHandleExerciceSimple,
  } from '../../../lib/mathalea'
  import { darkMode, exercicesParams } from '../../../lib/stores/generalStore'
  import { referentielLocale } from '../../../lib/stores/languagesStore'
  import { isLocalStorageAvailable } from '../../../lib/stores/storage'
  import type { IExercice } from '../../../lib/types'
  import { context } from '../../../modules/context'
  import ButtonTextAction from '../../shared/forms/ButtonTextAction.svelte'
  import NavBar from '../../shared/header/NavBar.svelte'
  import ExportViewLinks from '../shared/ExportViewLinks.svelte'
  import {
    anchorPosition,
    separatePages,
    type PreviewPageGeometry,
  } from '../shared/typstPreview'
  import { MATH_FONTS, TEXT_FONTS } from '../typst/buildTypstDocument'
  import { getShortAnswer, minimalCorrection } from '../typst/minimalCorrection'
  import type { TypstAnchor } from '../typst/typstCompiler'
  import {
    buildFlashcardsDocument,
    defaultFlashcardsDocumentOptions,
    harvestFlashcardsCarryOver,
    type FlashcardInput,
    type FlashcardsDocumentOptions,
  } from './buildFlashcardsDocument'

  type DisplayMode = 'code' | 'preview'
  const STORAGE_KEY = 'mathaleaFlashcardsView'

  let displayMode: DisplayMode = 'preview'
  let documentOptions: FlashcardsDocumentOptions = {
    ...defaultFlashcardsDocumentOptions,
  }
  let isSettingsOpen = true
  /** Affiche sur l'aperçu les contrôles de taille du texte des cartes et de zoom des images */
  let showOverlay = true
  /**
   * Réduit chaque correction à ses réponses mises en évidence en orange
   * (voir `minimalCorrection`, déjà utilisée par la vue Typst).
   */
  let minimalCorrections = false
  if (isLocalStorageAvailable()) {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      if (saved != null) {
        const parsed = JSON.parse(saved)
        if (['code', 'preview'].includes(parsed.displayMode)) {
          displayMode = parsed.displayMode
        }
        if (typeof parsed.showOverlay === 'boolean') {
          showOverlay = parsed.showOverlay
        }
        if (typeof parsed.minimalCorrections === 'boolean') {
          minimalCorrections = parsed.minimalCorrections
        }
        if (parsed.documentOptions != null) {
          documentOptions = {
            ...defaultFlashcardsDocumentOptions,
            ...parsed.documentOptions,
          }
        }
      }
    } catch {
      // préférences illisibles : on garde les valeurs par défaut
    }
  }

  let exercises: (IExercice | null)[] = []
  let isLoading = true
  /** Exercices qui ne peuvent pas devenir des cartes (interactifs purs...) */
  let warnings: string[] = []
  /** Le code a été modifié à la main depuis sa génération */
  let isEdited = false
  let code = ''
  let isCompiling = false
  let isGeneratingPdf = false
  let diagnostics: string[] = []
  let svgContent = ''

  function persistPreferences() {
    if (!isLocalStorageAvailable()) return
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          displayMode,
          documentOptions,
          showOverlay,
          minimalCorrections,
        }),
      )
    } catch {
      // stockage plein ou indisponible : sans conséquence
    }
  }

  function setDisplayMode(mode: DisplayMode) {
    displayMode = mode
    persistPreferences()
  }

  /** Regénère le contenu (listeQuestions, listeCorrections...) de l'exercice k */
  function regenerate(k: number) {
    const exercise = exercises[k]
    if (exercise == null) return
    exercise.numeroExercice = k
    if (
      exercise.seed === undefined &&
      typeof exercise.applyNewSeed === 'function'
    ) {
      exercise.applyNewSeed()
    }
    seedrandom(exercise.seed, { global: true })
    if (exercise.typeExercice === 'statique') {
      // Contenu figé (images/texte fixes) : rien à régénérer.
      return
    }
    context.isTypst = true
    try {
      if (exercise.typeExercice === 'simple') {
        mathaleaHandleExerciceSimple(exercise, false, k)
      } else if (typeof exercise.nouvelleVersionWrapper === 'function') {
        exercise.nouvelleVersionWrapper(k)
      }
    } finally {
      context.isTypst = false
    }
  }

  /**
   * Une carte par question : la question (précédée de la consigne de
   * l'exercice s'il en a une, pour que la carte se suffise à elle-même) au
   * recto, sa correction au verso.
   */
  function buildCards(): FlashcardInput[] {
    const cards: FlashcardInput[] = []
    const newWarnings: string[] = []
    for (const [k, exercise] of exercises.entries()) {
      if (exercise == null) {
        newWarnings.push(
          `Exercice ${k + 1} : il n'a pas pu être chargé, il n'est pas pris en charge par cette vue.`,
        )
        continue
      }
      if (
        exercise.typeExercice != null &&
        exercise.typeExercice.includes('html')
      ) {
        newWarnings.push(
          `${exercise.titre} : cet exercice n'existe qu'en version interactive, il ne peut pas être exporté.`,
        )
        continue
      }
      regenerate(k)
      const intro = [exercise.consigne, exercise.introduction]
        .filter((text) => text != null && text.length > 0)
        .join('<br>')
      const format = (text: string) =>
        mathaleaFormatExercice(text).replaceAll('{zoomFactor}', '1')
      const questions = exercise.listeQuestions ?? []
      const corrections = exercise.listeCorrections ?? []
      for (const [i, question] of questions.entries()) {
        const correction = format(corrections[i] ?? '')
        const shortAnswer = getShortAnswer(exercise, i)
        cards.push({
          front: format(
            intro.length > 0 ? `${intro}<br>${question}` : question,
          ),
          back: minimalCorrections
            ? minimalCorrection(
                correction,
                shortAnswer == null ? shortAnswer : format(shortAnswer),
              )
            : correction,
        })
      }
    }
    warnings = newWarnings
    return cards
  }

  function buildCode(): string {
    // les tailles réglées carte par carte (boutons +/− de l'aperçu) sont
    // relues dans le code courant pour survivre à la régénération
    return buildFlashcardsDocument(
      buildCards(),
      documentOptions,
      harvestFlashcardsCarryOver(code),
    )
  }

  /** Le professeur perd ses modifications manuelles : on le prévient */
  function confirmOverwrite(): boolean {
    if (!isEdited) return true
    return window.confirm(
      'Le code Typst a été modifié : le regénérer écrasera vos modifications. Continuer ?',
    )
  }

  /** Regénère le code à partir des réglages (colonnes, taille du texte...) */
  function applyDocumentOptions() {
    documentOptions.startNumber = Number.isFinite(documentOptions.startNumber)
      ? Math.max(1, Math.trunc(documentOptions.startNumber))
      : 1
    persistPreferences()
    if (!confirmOverwrite()) return
    code = buildCode()
    isEdited = false
    scheduleCompile(code, 0)
  }

  function resetDocumentOptions() {
    documentOptions = { ...defaultFlashcardsDocumentOptions }
    persistPreferences()
    // réinitialisation complète : les tailles réglées carte par carte
    // ne sont pas reprises
    code = buildFlashcardsDocument(buildCards(), documentOptions)
    isEdited = false
    scheduleCompile(code, 0)
  }

  /** Nouvelles données aléatoires pour tous les exercices */
  function newDataForAll() {
    if (!confirmOverwrite()) return
    // Math.random peut être verrouillé sur la graine du dernier exercice
    // régénéré (seedrandom global) : réamorçage avant de tirer les nouvelles
    seedrandom(undefined, { global: true })
    const params = get(exercicesParams)
    for (const [k, exercise] of exercises.entries()) {
      if (exercise == null) continue
      exercise.seed = undefined
      if (typeof exercise.applyNewSeed === 'function') exercise.applyNewSeed()
      if (params[k] != null && exercise.seed !== undefined) {
        params[k].alea = exercise.seed
      }
    }
    exercicesParams.update((list) => list)
    code = buildCode()
    isEdited = false
    scheduleCompile(code, 0)
  }

  /** Frappe dans l'éditeur de code : recompilation débouncée */
  function onCodeInput() {
    isEdited = true
    scheduleCompile(code)
  }

  /**
   * Compilation en direct : débouncée pendant la frappe et sérialisée
   * (une seule compilation à la fois, la dernière demande gagne).
   */
  let compileTimer: ReturnType<typeof setTimeout>
  let compileToken = 0
  function scheduleCompile(source: string, delay = 500) {
    clearTimeout(compileTimer)
    compileTimer = setTimeout(() => compile(source), delay)
  }

  let previewPages: PreviewPageGeometry[] = []
  let previewViewBox = { width: 0, height: 0 }
  /** Repères publiés par le document compilé (un par face de carte) */
  let anchors: TypstAnchor[] = []

  /** Couleurs proposées pour le titre des cartes (palette + personnalisée) */
  const TITLE_COLORS = [
    { label: 'Gris', value: '#6b7280' },
    { label: 'Noir', value: '#000000' },
    { label: 'Orange', value: '#f15929' },
    { label: 'Bleu', value: '#1d4ed8' },
    { label: 'Vert', value: '#4a7c59' },
  ]

  /** Boutons +/− d'une face de carte, positionnés en % de l'aperçu */
  interface CardWidget {
    num: number
    side: 'recto' | 'verso'
    left: number
    top: number
  }

  /** Boutons de zoom d'une figure embarquée, positionnés en % de l'aperçu */
  interface FigureWidget {
    num: number
    left: number
    top: number
  }

  /** Convertit les repères (pt, par page) en positions % sur l'aperçu */
  function computeCardWidgets(
    anchorList: TypstAnchor[],
    pages: PreviewPageGeometry[],
    viewBox: { width: number; height: number },
  ): CardWidget[] {
    const widgets: CardWidget[] = []
    for (const anchor of anchorList) {
      if (anchor.kind !== 'carte-recto' && anchor.kind !== 'carte-verso') {
        continue
      }
      const position = anchorPosition(anchor, pages, viewBox)
      if (position == null) continue
      widgets.push({
        num: anchor.num,
        side: anchor.kind === 'carte-verso' ? 'verso' : 'recto',
        ...position,
      })
    }
    return widgets
  }
  $: cardWidgets = computeCardWidgets(anchors, previewPages, previewViewBox)

  /**
   * Repères des figures embarquées (`mathalea-figure-block`) : le repère est
   * déjà au coin haut-droit du rendu final de la figure ; la pastille est
   * décalée vers le haut pour ne pas recouvrir l'image (comme dans la vue Typst).
   */
  function computeFigureWidgets(
    anchorList: TypstAnchor[],
    pages: PreviewPageGeometry[],
    viewBox: { width: number; height: number },
  ): FigureWidget[] {
    const widgets: FigureWidget[] = []
    for (const anchor of anchorList) {
      if (anchor.kind !== 'figure') continue
      const position = anchorPosition(anchor, pages, viewBox)
      if (position == null) continue
      widgets.push({ num: anchor.num, ...position })
    }
    return widgets
  }
  $: figureWidgets = computeFigureWidgets(anchors, previewPages, previewViewBox)

  /** Zoom courant d'une figure (`#let fig-N-zoom`), lu dans le code */
  $: figureZooms = (() => {
    const values: Record<number, number> = {}
    for (const match of code.matchAll(/^#let fig-(\d+)-zoom = ([\d.]+)/gm)) {
      values[Number(match[1])] = Number(match[2])
    }
    return values
  })()

  /** Modale de réglage du style du titre (ancrage, taille, couleur, opacité) */
  let isTitleStyleModalOpen = false

  /** Couleur hexadécimale courante du titre (pour le sélecteur personnalisé) */
  $: isCustomTitleColor = !TITLE_COLORS.some(
    (color) => color.value === documentOptions.titleColor,
  )

  function setTitlePosition(
    position: FlashcardsDocumentOptions['titlePosition'],
  ) {
    documentOptions.titlePosition = position
    applyDocumentOptions()
  }

  function adjustTitleSize(delta: number) {
    documentOptions.titleSize = Math.min(
      24,
      Math.max(6, documentOptions.titleSize + delta),
    )
    applyDocumentOptions()
  }

  function setTitleColor(hex: string) {
    documentOptions.titleColor = hex
    applyDocumentOptions()
  }

  function setTitleOpacity(opacity: number) {
    documentOptions.titleOpacity = opacity
    applyDocumentOptions()
  }

  /** Pas d'ajustement du facteur de taille d'une face, et ses bornes */
  const CARD_SCALE_STEP = 0.1
  /** Facteur de taille courant d'une face, lu dans le code */
  function cardScale(num: number, side: 'recto' | 'verso'): number {
    const match = new RegExp(
      `^#let carte-${num}-${side}-taille = ([\\d.]+)$`,
      'm',
    ).exec(code)
    return match != null ? Number(match[1]) : 1
  }

  /**
   * Ajuste la taille du texte d'une face de carte : édition ciblée de la
   * ligne `#let carte-N-recto-taille = ...` du code. Comme les éditions de
   * la palette de la vue Typst, elle ne marque pas le code comme modifié :
   * elle est reprise à la régénération (voir `harvestFlashcardsCarryOver`).
   */
  function adjustCardScale(
    num: number,
    side: 'recto' | 'verso',
    delta: number,
  ) {
    const pattern = new RegExp(`^#let carte-${num}-${side}-taille = .*$`, 'm')
    if (!pattern.test(code)) return
    const next = Math.min(
      3,
      Math.max(
        0.4,
        Math.round((cardScale(num, side) + delta * CARD_SCALE_STEP) * 100) /
          100,
      ),
    )
    code = code.replace(pattern, `#let carte-${num}-${side}-taille = ${next}`)
    scheduleCompile(code, 0)
  }

  /** Pas d'ajustement du zoom d'une figure, et bornes (20 % à 300 %) */
  const FIGURE_ZOOM_STEP = 0.1
  /**
   * Ajuste le zoom d'une figure embarquée : édition ciblée de la ligne
   * `#let fig-N-zoom = ...` du code. Comme `adjustCardScale`, elle ne marque
   * pas le code comme modifié : elle est reprise à la régénération (voir
   * `harvestFlashcardsCarryOver`).
   */
  function adjustFigureZoom(num: number, delta: number) {
    const pattern = new RegExp(`^#let fig-${num}-zoom = .*$`, 'm')
    if (!pattern.test(code)) return
    const current = figureZooms[num] ?? 1
    const next = Math.min(
      3,
      Math.max(
        0.2,
        Math.round((current + delta * FIGURE_ZOOM_STEP) * 100) / 100,
      ),
    )
    code = code.replace(pattern, `#let fig-${num}-zoom = ${next}`)
    scheduleCompile(code, 0)
  }

  async function compile(source: string) {
    const token = ++compileToken
    isCompiling = true
    try {
      const { compileTypstToSvg } = await import('../typst/typstCompiler')
      const result = await compileTypstToSvg(source)
      if (token !== compileToken) return
      diagnostics = result.diagnostics
      if (result.svg != null) {
        const separated = separatePages(result.svg)
        svgContent = separated.svg
        previewPages = separated.pages
        previewViewBox = separated.viewBox
        anchors = result.anchors ?? []
      }
    } catch (error) {
      if (token !== compileToken) return
      console.error('Erreur lors de la compilation Typst', error)
      diagnostics = [
        'La compilation a échoué : ' +
          (error instanceof Error ? error.message : String(error)),
      ]
    } finally {
      if (token === compileToken) isCompiling = false
    }
  }

  async function loadExercises() {
    isLoading = true
    const results = await Promise.allSettled(buildExercisesList())
    exercises = results.map((result) =>
      result.status === 'fulfilled' ? result.value : null,
    )
    for (const exercise of exercises) {
      if (exercise != null) exercise.interactif = false
    }
    isLoading = false
  }

  onMount(async () => {
    await loadExercises()
    code = buildCode()
    compile(code)
  })

  onDestroy(() => {
    clearTimeout(compileTimer)
    for (const exercise of exercises) {
      if (exercise == null) continue
      exercise.reinit?.()
      exercise.destroy?.()
    }
  })

  function exportFilename() {
    return (
      documentOptions.title
        .trim()
        .replace(/[^\p{L}\p{N} _-]/gu, '')
        .replace(/\s+/g, '_') || 'flashcards'
    )
  }

  function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  async function downloadPdf() {
    if (isGeneratingPdf) return
    isGeneratingPdf = true
    try {
      const { compileTypstToPdf } = await import('../typst/typstCompiler')
      const pdf = await compileTypstToPdf(code)
      if (pdf == null) {
        window.alert(
          'La compilation du PDF a échoué : corrigez les erreurs signalées sous l’aperçu.',
        )
        return
      }
      downloadBlob(
        new Blob([pdf as BlobPart], { type: 'application/pdf' }),
        `${exportFilename()}.pdf`,
      )
    } catch (error) {
      console.error("Erreur lors de l'export PDF", error)
    } finally {
      isGeneratingPdf = false
    }
  }

  function downloadTyp() {
    downloadBlob(
      new Blob([code], { type: 'text/plain;charset=utf-8' }),
      `${exportFilename()}.typ`,
    )
  }

  /** Exporte les cartes générées dans le format JSON compris par Mémotest. */
  function exportToMemotest() {
    const cards = buildCards().map(({ front, back }) => ({
      question: `${front}<div style="font-size: 0.6em; font-style: italic; color: ${orangeMathalea}; margin-top: 0.5em;">Généré par Mathaléa</div>`,
      questionSpeech: '',
      answer: back,
      answerSpeech: '',
    }))

    if (cards.length === 0) {
      window.alert("Aucune carte compatible avec Mémotest n'a été générée.")
      return
    }

    const payload = {
      title: `Flashcards : ${documentOptions.title.trim() || 'MathALÉA'}`,
      cards,
      source: {
        application: 'MathALÉA',
        url: window.location.href,
        exercises: exercises.flatMap((exercise) =>
          exercise == null
            ? []
            : [
                {
                  uuid: exercise.uuid,
                  title: exercise.titre,
                  seed: exercise.seed,
                },
              ],
        ),
      },
    }

    downloadBlob(
      new Blob([JSON.stringify(payload, null, 2)], {
        type: 'application/json;charset=utf-8',
      }),
      `${exportFilename()}-memotest.json`,
    )
  }
</script>

<svelte:head>
  <title>MathALÉA - Flash-cards</title>
</svelte:head>

<main
  class="{$darkMode.isActive
    ? 'dark'
    : ''} flex flex-col h-screen bg-coopmaths-canvas-darkest dark:bg-coopmathsdark-canvas-darkest"
>
  <div class="bg-coopmaths-canvas dark:bg-coopmathsdark-canvas">
    <NavBar
      subtitle="Flash-cards"
      subtitleType="export"
      handleLanguage={() => {}}
      locale={$referentielLocale}
    />
    <div
      class="flex flex-row flex-wrap items-center gap-x-6 gap-y-3 px-4 md:px-8 py-3 border-b border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest text-coopmaths-corpus dark:text-coopmathsdark-corpus"
    >
      <div
        class="flex flex-row rounded-lg overflow-hidden border border-coopmaths-action dark:border-coopmathsdark-action"
        role="group"
        aria-label="Mode d'affichage"
      >
        {#each [{ mode: 'preview', icon: 'bx-file-pdf', label: 'Aperçu' }, { mode: 'code', icon: 'bx-code-alt', label: 'Code' }] as choice}
          <button
            type="button"
            class="flex items-center gap-1 px-3 py-1 text-sm {displayMode ===
            choice.mode
              ? 'bg-coopmaths-action text-coopmaths-canvas dark:bg-coopmathsdark-action dark:text-coopmathsdark-canvas'
              : 'text-coopmaths-action dark:text-coopmathsdark-action hover:bg-coopmaths-canvas-dark dark:hover:bg-coopmathsdark-canvas-dark'}"
            aria-pressed={displayMode === choice.mode}
            on:click={() => setDisplayMode(choice.mode as DisplayMode)}
          >
            <i aria-hidden="true" class="bx {choice.icon} text-lg"></i>
            {choice.label}
          </button>
        {/each}
      </div>

      <button
        type="button"
        title="Réglages des cartes"
        aria-pressed={isSettingsOpen}
        class="flex items-center gap-1 text-sm {isSettingsOpen
          ? 'text-coopmaths-action font-semibold dark:text-coopmathsdark-action'
          : 'text-coopmaths-action/60 hover:text-coopmaths-action dark:text-coopmathsdark-action/60 dark:hover:text-coopmathsdark-action'}"
        on:click={() => (isSettingsOpen = !isSettingsOpen)}
      >
        <i aria-hidden="true" class="bx bx-cog text-xl"></i>
        Réglages
      </button>

      <button
        type="button"
        title="Nouvelles données aléatoires pour tous les exercices"
        class="flex items-center gap-1 text-sm text-coopmaths-action hover:text-coopmaths-action-lightest dark:text-coopmathsdark-action dark:hover:text-coopmathsdark-action-lightest"
        on:click={newDataForAll}
      >
        <i aria-hidden="true" class="bx bx-refresh text-xl"></i>
        Nouvelles données
      </button>

      <button
        type="button"
        title="Afficher sur l'aperçu les boutons de taille du texte de chaque carte et de zoom des images"
        aria-pressed={showOverlay}
        class="flex items-center gap-1 text-sm {showOverlay
          ? 'text-coopmaths-action font-semibold dark:text-coopmathsdark-action'
          : 'text-coopmaths-action/60 hover:text-coopmaths-action dark:text-coopmathsdark-action/60 dark:hover:text-coopmathsdark-action'}"
        on:click={() => {
          showOverlay = !showOverlay
          persistPreferences()
        }}
      >
        <i aria-hidden="true" class="bx bx-slider text-xl"></i>
        Mise en page
      </button>

      <div class="grow"></div>

      {#if displayMode === 'code'}
        <ButtonTextAction
          text="Télécharger le .typ"
          icon="bx-file-blank"
          inverted={true}
          class="rounded-lg py-1 px-2"
          on:click={downloadTyp}
        />
      {/if}
      <ButtonTextAction
        text="Exporter vers Mémotest"
        icon="bx-export"
        inverted={true}
        class="rounded-lg py-1 px-2"
        on:click={exportToMemotest}
      />
      <ButtonTextAction
        text={isGeneratingPdf ? 'PDF en cours...' : 'Télécharger le PDF'}
        icon={isGeneratingPdf ? 'bx-loader-alt bx-spin' : 'bx-download'}
        inverted={true}
        class="rounded-lg py-1 px-2 min-w-42.5"
        on:click={downloadPdf}
      />
    </div>
  </div>

  {#if isLoading}
    <div
      class="flex w-full justify-center items-center py-24 text-coopmaths-corpus dark:text-coopmathsdark-corpus"
    >
      <i aria-hidden="true" class="bx bx-loader-alt bx-spin text-4xl"></i>
    </div>
  {:else}
    <div class="flex flex-row grow min-h-0">
      {#if isSettingsOpen}
        <div
          class="w-80 shrink-0 overflow-y-auto border-r border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest bg-coopmaths-canvas dark:bg-coopmathsdark-canvas text-coopmaths-corpus dark:text-coopmathsdark-corpus p-5 space-y-4"
        >
          <div class="flex items-center justify-between">
            <h3
              class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct"
            >
              Réglages des cartes
            </h3>
            <button
              type="button"
              aria-label="Fermer les réglages"
              on:click={() => (isSettingsOpen = false)}
            >
              <i
                aria-hidden="true"
                class="bx bx-x text-2xl text-coopmaths-action dark:text-coopmathsdark-action"
              ></i>
            </button>
          </div>

          <p class="text-xs opacity-75">
            Une carte par question : la question au recto, la réponse au verso.
            Imprimez en recto-verso (retournement sur les bords longs) puis
            découpez en suivant les pointillés.
          </p>

          <ExportViewLinks current="flashcards" />

          <label class="flex items-center justify-between gap-4 text-sm">
            Format
            <select
              class="rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
              bind:value={documentOptions.pageFormat}
              on:change={applyDocumentOptions}
            >
              <option value="a4">A4</option>
              <option value="a5">A5</option>
            </select>
          </label>

          <label class="flex items-center justify-between gap-4 text-sm">
            Orientation
            <select
              class="rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
              bind:value={documentOptions.orientation}
              on:change={applyDocumentOptions}
            >
              <option value="portrait">Portrait</option>
              <option value="landscape">Paysage</option>
            </select>
          </label>

          <div class="flex items-center justify-between gap-4 text-sm">
            <label for="flashcards-columns-input">Cartes par ligne</label>
            <input
              id="flashcards-columns-input"
              type="number"
              min="1"
              max="4"
              step="1"
              class="w-16 rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
              bind:value={documentOptions.columns}
              on:change={applyDocumentOptions}
            />
          </div>

          <div class="flex items-center justify-between gap-4 text-sm">
            <label for="flashcards-rows-input">Lignes par page</label>
            <input
              id="flashcards-rows-input"
              type="number"
              min="1"
              max="6"
              step="1"
              class="w-16 rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
              bind:value={documentOptions.rows}
              on:change={applyDocumentOptions}
            />
          </div>

          <div class="flex items-center justify-between gap-4 text-sm">
            <label for="flashcards-separator-thickness-input">
              Épaisseur des traits de découpe (pt)
            </label>
            <input
              id="flashcards-separator-thickness-input"
              type="number"
              min="0.2"
              max="4"
              step="0.1"
              class="w-16 rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
              bind:value={documentOptions.separatorThickness}
              on:change={applyDocumentOptions}
            />
          </div>

          <div class="flex items-center justify-between gap-4 text-sm">
            <label for="flashcards-question-fontsize-input">
              Taille des questions (pt)
            </label>
            <input
              id="flashcards-question-fontsize-input"
              type="number"
              min="8"
              max="24"
              step="1"
              class="w-16 rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
              bind:value={documentOptions.questionFontSize}
              on:change={applyDocumentOptions}
            />
          </div>

          <div class="flex items-center justify-between gap-4 text-sm">
            <label for="flashcards-answer-fontsize-input">
              Taille des réponses (pt)
            </label>
            <input
              id="flashcards-answer-fontsize-input"
              type="number"
              min="8"
              max="24"
              step="1"
              class="w-16 rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
              bind:value={documentOptions.answerFontSize}
              on:change={applyDocumentOptions}
            />
          </div>

          <div class="flex items-center justify-between gap-4 text-sm">
            <label for="flashcards-line-spacing-input">Interligne (em)</label>
            <input
              id="flashcards-line-spacing-input"
              type="number"
              min="0.5"
              max="3"
              step="0.05"
              class="w-16 rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
              bind:value={documentOptions.lineSpacing}
              on:change={applyDocumentOptions}
            />
          </div>

          <label class="flex items-center justify-between gap-4 text-sm">
            Police du texte
            <select
              class="rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm max-w-40"
              bind:value={documentOptions.font}
              on:change={applyDocumentOptions}
            >
              {#each TEXT_FONTS as font}
                <option value={font}>{font}</option>
              {/each}
            </select>
          </label>

          <label class="flex items-center justify-between gap-4 text-sm">
            Police des maths
            <select
              class="rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm max-w-40"
              bind:value={documentOptions.mathFont}
              on:change={applyDocumentOptions}
            >
              {#each MATH_FONTS as font}
                <option value={font}>{font}</option>
              {/each}
            </select>
          </label>

          <label class="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              bind:checked={documentOptions.showNumbers}
              on:change={applyDocumentOptions}
            />
            Numéroter les cartes (pour réapparier recto et verso)
          </label>

          <div class="flex items-center justify-between gap-4 text-sm">
            <label for="flashcards-start-number-input">Premier numéro</label>
            <input
              id="flashcards-start-number-input"
              type="number"
              min="1"
              step="1"
              class="w-20 rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
              bind:value={documentOptions.startNumber}
              disabled={!documentOptions.showNumbers}
              on:change={applyDocumentOptions}
            />
          </div>

          <label class="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              bind:checked={minimalCorrections}
              on:change={applyDocumentOptions}
            />
            <span
              title="Quand une correction met sa réponse en évidence (en orange), n'afficher que cette réponse"
            >
              Correction minimale
            </span>
          </label>

          <div class="flex items-center justify-between">
            <span
              class="text-sm font-semibold text-coopmaths-struct dark:text-coopmathsdark-struct"
            >
              Titre des cartes
            </span>
            <button
              type="button"
              title="Réglages du titre (ancrage, taille, couleur, opacité)"
              aria-label="Réglages du titre (ancrage, taille, couleur, opacité)"
              class="text-coopmaths-action hover:text-coopmaths-action-lightest dark:text-coopmathsdark-action dark:hover:text-coopmathsdark-action-lightest"
              on:click={() => (isTitleStyleModalOpen = true)}
            >
              <i aria-hidden="true" class="bx bx-cog text-lg"></i>
            </button>
          </div>

          <div class="space-y-1.5">
            <label class="text-sm" for="flashcards-front-title-input">
              Titre recto
            </label>
            <input
              id="flashcards-front-title-input"
              type="text"
              placeholder="Affiché sur chaque recto"
              class="w-full rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
              bind:value={documentOptions.frontTitle}
              on:change={applyDocumentOptions}
            />
          </div>

          <div class="space-y-1.5">
            <label class="text-sm" for="flashcards-back-title-input">
              Titre verso
            </label>
            <input
              id="flashcards-back-title-input"
              type="text"
              placeholder="Affiché sur chaque verso"
              class="w-full rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
              bind:value={documentOptions.backTitle}
              on:change={applyDocumentOptions}
            />
          </div>

          <button
            type="button"
            class="text-sm text-coopmaths-action underline dark:text-coopmathsdark-action"
            on:click={resetDocumentOptions}
          >
            Réinitialiser les réglages
          </button>
        </div>
      {/if}

      <div class="flex flex-col grow min-w-0">
        {#if warnings.length > 0}
          <div
            class="px-4 py-2 text-sm bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100"
          >
            {#each warnings as warning}
              <p>{warning}</p>
            {/each}
          </div>
        {/if}

        {#if displayMode === 'code'}
          <textarea
            class="grow w-full resize-none font-mono text-sm p-4 bg-[#282c34] text-[#abb2bf] focus:outline-hidden"
            spellcheck="false"
            bind:value={code}
            on:input={onCodeInput}
          ></textarea>
        {:else}
          <div class="grow overflow-auto p-4 relative">
            {#if svgContent === ''}
              <div
                class="flex flex-col items-center gap-3 py-24 text-coopmaths-corpus dark:text-coopmathsdark-corpus"
              >
                <i aria-hidden="true" class="bx bx-loader-alt bx-spin text-4xl"
                ></i>
                <p class="text-sm">Compilation de l'aperçu en cours...</p>
              </div>
            {:else}
              <div class="typst-preview relative mx-auto max-w-3xl">
                <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                {@html svgContent}
                {#if showOverlay}
                  {#each cardWidgets as widget (`${widget.side}-${widget.num}`)}
                    <div
                      class="absolute z-10 flex flex-row items-center rounded-full border border-coopmaths-action/40 bg-coopmaths-canvas/90 shadow-sm dark:border-coopmathsdark-action/40 dark:bg-coopmathsdark-canvas/90"
                      style="left: {widget.left}%; top: {widget.top}%; transform: translate(-50%, -50%);"
                    >
                      <button
                        type="button"
                        title="Réduire le texte de cette carte ({widget.side ===
                        'verso'
                          ? 'réponse'
                          : 'question'} {widget.num})"
                        class="px-1 py-0.5 text-coopmaths-action hover:text-coopmaths-action-lightest dark:text-coopmathsdark-action dark:hover:text-coopmathsdark-action-lightest"
                        on:click={() =>
                          adjustCardScale(widget.num, widget.side, -1)}
                      >
                        <i aria-hidden="true" class="bx bx-minus text-sm"></i>
                      </button>
                      <button
                        type="button"
                        title="Agrandir le texte de cette carte ({widget.side ===
                        'verso'
                          ? 'réponse'
                          : 'question'} {widget.num})"
                        class="px-1 py-0.5 text-coopmaths-action hover:text-coopmaths-action-lightest dark:text-coopmathsdark-action dark:hover:text-coopmathsdark-action-lightest"
                        on:click={() =>
                          adjustCardScale(widget.num, widget.side, 1)}
                      >
                        <i aria-hidden="true" class="bx bx-plus text-sm"></i>
                      </button>
                    </div>
                  {/each}
                  {#each figureWidgets as widget (`figure-${widget.num}`)}
                    <div
                      class="absolute z-10 flex flex-row items-center rounded-full border border-coopmaths-action/40 bg-coopmaths-canvas/90 shadow-sm dark:border-coopmathsdark-action/40 dark:bg-coopmathsdark-canvas/90"
                      style="left: {widget.left}%; top: {widget.top}%; transform: translate(-100%, -100%);"
                    >
                      <button
                        type="button"
                        title="Réduire l'image"
                        class="px-1 py-0.5 text-coopmaths-action hover:text-coopmaths-action-lightest dark:text-coopmathsdark-action dark:hover:text-coopmathsdark-action-lightest"
                        on:click={() => adjustFigureZoom(widget.num, -1)}
                      >
                        <i aria-hidden="true" class="bx bx-zoom-out text-sm"
                        ></i>
                      </button>
                      <span class="px-0.5 text-[0.6rem] tabular-nums">
                        {Math.round((figureZooms[widget.num] ?? 1) * 100)}%
                      </span>
                      <button
                        type="button"
                        title="Agrandir l'image"
                        class="px-1 py-0.5 text-coopmaths-action hover:text-coopmaths-action-lightest dark:text-coopmathsdark-action dark:hover:text-coopmathsdark-action-lightest"
                        on:click={() => adjustFigureZoom(widget.num, 1)}
                      >
                        <i aria-hidden="true" class="bx bx-zoom-in text-sm"></i>
                      </button>
                    </div>
                  {/each}
                {/if}
              </div>
            {/if}
            {#if isCompiling && svgContent !== ''}
              <div
                class="absolute top-6 right-6 text-coopmaths-action dark:text-coopmathsdark-action"
              >
                <i aria-hidden="true" class="bx bx-loader-alt bx-spin text-2xl"
                ></i>
              </div>
            {/if}
          </div>
        {/if}

        {#if diagnostics.length > 0}
          <div
            class="max-h-40 overflow-y-auto px-4 py-2 text-sm font-mono bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-100"
          >
            {#each diagnostics as diagnostic}
              <p>{diagnostic}</p>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  {/if}

  {#if isTitleStyleModalOpen}
    <!-- svelte-ignore a11y-no-static-element-interactions a11y-click-events-have-key-events -->
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      on:click|self={() => (isTitleStyleModalOpen = false)}
    >
      <div
        class="w-80 rounded-lg bg-coopmaths-canvas dark:bg-coopmathsdark-canvas p-5 space-y-4 text-coopmaths-corpus dark:text-coopmathsdark-corpus shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-label="Réglages du titre des cartes"
      >
        <div class="flex items-center justify-between">
          <h3
            class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct"
          >
            Réglages du titre
          </h3>
          <button
            type="button"
            aria-label="Fermer"
            on:click={() => (isTitleStyleModalOpen = false)}
          >
            <i
              aria-hidden="true"
              class="bx bx-x text-2xl text-coopmaths-action dark:text-coopmathsdark-action"
            ></i>
          </button>
        </div>

        <p class="text-xs opacity-75">
          Ancrage, taille, couleur et opacité sont communs au titre recto et au
          titre verso, sur toutes les cartes.
        </p>

        <div class="space-y-1.5">
          <span class="text-sm">Point d'ancrage</span>
          <!-- mini-carte : 6 points cliquables (2 lignes × 3 colonnes) -->
          <div
            class="mx-auto grid h-16 w-28 grid-cols-3 grid-rows-2 gap-1 rounded border-2 border-dashed border-coopmaths-action/40 p-1 dark:border-coopmathsdark-action/40"
          >
            {#each [{ position: 'top-left', label: 'Ancrer le titre en haut à gauche' }, { position: 'top-center', label: 'Ancrer le titre en haut au centre' }, { position: 'top-right', label: 'Ancrer le titre en haut à droite' }, { position: 'bottom-left', label: 'Ancrer le titre en bas à gauche' }, { position: 'bottom-center', label: 'Ancrer le titre en bas au centre' }, { position: 'bottom-right', label: 'Ancrer le titre en bas à droite' }] as choice}
              <button
                type="button"
                title={choice.label}
                aria-label={choice.label}
                aria-pressed={documentOptions.titlePosition === choice.position}
                class="flex items-center justify-center rounded {documentOptions.titlePosition ===
                choice.position
                  ? 'bg-coopmaths-action/20 dark:bg-coopmathsdark-action/20'
                  : 'hover:bg-coopmaths-action/10 dark:hover:bg-coopmathsdark-action/10'}"
                on:click={() =>
                  setTitlePosition(
                    choice.position as FlashcardsDocumentOptions['titlePosition'],
                  )}
              >
                <span
                  class="h-2.5 w-2.5 rounded-full {documentOptions.titlePosition ===
                  choice.position
                    ? 'scale-125 bg-coopmaths-action dark:bg-coopmathsdark-action'
                    : 'bg-coopmaths-action/40 dark:bg-coopmathsdark-action/40'}"
                ></span>
              </button>
            {/each}
          </div>
        </div>

        <div class="flex items-center justify-between gap-4 text-sm">
          <span>Taille</span>
          <div class="flex items-center gap-2">
            <button
              type="button"
              title="Réduire le titre"
              class="text-coopmaths-action hover:text-coopmaths-action-lightest dark:text-coopmathsdark-action dark:hover:text-coopmathsdark-action-lightest"
              on:click={() => adjustTitleSize(-1)}
            >
              <i aria-hidden="true" class="bx bx-minus text-lg"></i>
            </button>
            <span class="w-10 text-center tabular-nums">
              {documentOptions.titleSize}pt
            </span>
            <button
              type="button"
              title="Agrandir le titre"
              class="text-coopmaths-action hover:text-coopmaths-action-lightest dark:text-coopmathsdark-action dark:hover:text-coopmathsdark-action-lightest"
              on:click={() => adjustTitleSize(1)}
            >
              <i aria-hidden="true" class="bx bx-plus text-lg"></i>
            </button>
          </div>
        </div>

        <div class="flex items-center justify-between gap-4 text-sm">
          <span>Couleur</span>
          <div class="flex items-center gap-1.5">
            {#each TITLE_COLORS as color}
              <button
                type="button"
                title={color.label}
                aria-label={color.label}
                aria-pressed={documentOptions.titleColor === color.value}
                class="h-6 w-6 rounded-full border-2 transition {documentOptions.titleColor ===
                color.value
                  ? 'border-coopmaths-action dark:border-coopmathsdark-action scale-110'
                  : 'border-transparent'}"
                style="background-color: {color.value};"
                on:click={() => setTitleColor(color.value)}
              ></button>
            {/each}
            <input
              type="color"
              title="Couleur personnalisée du titre"
              aria-label="Couleur personnalisée du titre"
              class="h-6 w-6 cursor-pointer rounded-full border-2 {isCustomTitleColor
                ? 'border-coopmaths-action dark:border-coopmathsdark-action scale-110'
                : 'border-transparent'} bg-transparent p-0"
              value={documentOptions.titleColor}
              on:input={(e) => setTitleColor(e.currentTarget.value)}
            />
          </div>
        </div>

        <div class="flex items-center justify-between gap-4 text-sm">
          <span>Opacité</span>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            title="Opacité du titre"
            aria-label="Opacité du titre"
            class="w-32 cursor-pointer"
            value={documentOptions.titleOpacity}
            on:change={(e) => setTitleOpacity(Number(e.currentTarget.value))}
          />
        </div>
      </div>
    </div>
  {/if}
</main>

<style>
  .typst-preview :global(svg) {
    width: 100%;
    height: auto;
  }
</style>
