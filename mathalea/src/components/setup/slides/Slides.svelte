<script lang="ts">
  import { getShortAnswer } from '../typst/minimalCorrection'
  import seedrandom from 'seedrandom'
  import { onDestroy, onMount } from 'svelte'
  import { get } from 'svelte/store'
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
  import { MATH_FONTS, TEXT_FONTS } from '../typst/buildTypstDocument'
  import type { TypstAnchor } from '../typst/typstCompiler'
  import {
    anchorPosition,
    separatePages,
    type PreviewPageGeometry,
  } from '../shared/typstPreview'
  import {
    buildSlidesDocument,
    defaultSlidesDocumentOptions,
    harvestSlidesCarryOver,
    type SlideAlign,
    type SlideInput,
    type SlidesCarryOver,
    type SlidesDocumentOptions,
  } from './buildSlidesDocument'

  type DisplayMode = 'code' | 'preview'
  const STORAGE_KEY = 'mathaleaSlidesView'

  let displayMode: DisplayMode = $state('preview')
  let documentOptions: SlidesDocumentOptions = $state({
    ...defaultSlidesDocumentOptions,
  })
  let isSettingsOpen = $state(true)
  /** Affiche les boutons de réglage sur chaque diapositive de l'aperçu */
  let showOverlay = $state(true)
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
        if (parsed.documentOptions != null) {
          documentOptions = {
            ...defaultSlidesDocumentOptions,
            ...parsed.documentOptions,
          }
        }
      }
    } catch {
      // préférences illisibles : on garde les valeurs par défaut
    }
  }

  let exercises: (IExercice | null)[] = $state([])
  let isLoading = $state(true)
  /** Exercices qui ne peuvent pas devenir des diapositives (interactifs purs...) */
  let warnings: string[] = $state([])
  /** Le code a été modifié à la main depuis sa génération */
  let isEdited = $state(false)
  let code = $state('')
  let isCompiling = $state(false)
  let isGeneratingPdf = $state(false)
  let diagnostics: string[] = $state([])
  let svgContent = $state('')

  function persistPreferences() {
    if (!isLocalStorageAvailable()) return
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          displayMode,
          documentOptions: $state.snapshot(documentOptions),
          showOverlay,
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

  /**
   * Regénère le contenu (listeQuestions, listeCorrections...) de l'exercice
   * k. `idVue` (0 par défaut) tire une version différente de la même graine,
   * pour construire la deuxième colonne du multivue (comme le `reroll` du
   * diaporama) : la graine d'origine est toujours restaurée après coup.
   */
  function regenerate(k: number, idVue = 0) {
    const exercise = exercises[k]
    if (exercise == null) return
    exercise.numeroExercice = k
    if (
      exercise.seed === undefined &&
      typeof exercise.applyNewSeed === 'function'
    ) {
      exercise.applyNewSeed()
    }
    const originalSeed = exercise.seed
    try {
      if (idVue > 0 && exercise.seed !== undefined) {
        exercise.seed = exercise.seed + String(idVue)
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
    } finally {
      exercise.seed = originalSeed
    }
  }

  /**
   * Une diapositive par question : la question (précédée de la consigne de
   * l'exercice s'il en a une) en grand, sa correction sur une autre page.
   * En multivue, une deuxième version de chaque question (autre graine) est
   * générée et affichée à côté de la première, comme dans le diaporama.
   */
  function buildSlides(): SlideInput[] {
    const slides: SlideInput[] = []
    const newWarnings: string[] = []
    const format = (text: string) =>
      mathaleaFormatExercice(text).replaceAll('{zoomFactor}', '1')
    const buildVersions = (k: number, exercise: IExercice, idVue: number) => {
      regenerate(k, idVue)
      const intro = [exercise.consigne, exercise.introduction]
        .filter((text) => text != null && text.length > 0)
        .join('<br>')
      const questions = exercise.listeQuestions ?? []
      const corrections = exercise.listeCorrections ?? []
      return questions.map((question, i) => {
        const shortAnswer = getShortAnswer(exercise, i)
        return {
          question: format(
            intro.length > 0 ? `${intro}<br>${question}` : question,
          ),
          correction: format(corrections[i] ?? ''),
          shortAnswer: shortAnswer == null ? shortAnswer : format(shortAnswer),
        }
      })
    }
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
      const primary = buildVersions(k, exercise, 0)
      const extra = documentOptions.multivue
        ? buildVersions(k, exercise, 1)
        : []
      for (const [i, version] of primary.entries()) {
        const extraVersion = extra[i]
        slides.push(
          extraVersion != null
            ? { ...version, extraVersions: [extraVersion] }
            : version,
        )
      }
    }
    warnings = newWarnings
    return slides
  }

  /**
   * Regénère le code : les réglages faits sur l'aperçu (taille, alignement,
   * ordre, diapositives masquées, zoom des figures) sont relus dans le code
   * courant pour survivre à la régénération.
   */
  function buildCode(overrides: Partial<SlidesCarryOver> = {}): string {
    return buildSlidesDocument(
      buildSlides(),
      $state.snapshot(documentOptions),
      {
        ...harvestSlidesCarryOver(code),
        ...overrides,
      },
    )
  }

  /** Le professeur perd ses modifications manuelles : on le prévient */
  function confirmOverwrite(): boolean {
    if (!isEdited) return true
    return window.confirm(
      'Le code Typst a été modifié : le regénérer écrasera vos modifications. Continuer ?',
    )
  }

  /** Regénère le code à partir des réglages (contenu, tailles, titre...) */
  function applyDocumentOptions() {
    persistPreferences()
    if (!confirmOverwrite()) return
    code = buildCode()
    isEdited = false
    scheduleCompile(code, 0)
  }

  function resetDocumentOptions() {
    documentOptions = { ...defaultSlidesDocumentOptions }
    persistPreferences()
    // réinitialisation complète : les réglages faits sur l'aperçu
    // (tailles, ordre, diapositives masquées) ne sont pas repris
    code = buildSlidesDocument(buildSlides(), $state.snapshot(documentOptions))
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

  let previewPages: PreviewPageGeometry[] = $state([])
  let previewViewBox = $state({ width: 0, height: 0 })
  /** Repères publiés par le document compilé (un par diapositive, un par figure) */
  let anchors: TypstAnchor[] = $state([])

  /** Couleurs proposées pour le titre des diapositives (palette + personnalisée) */
  const TITLE_COLORS = [
    { label: 'Gris', value: '#6b7280' },
    { label: 'Noir', value: '#000000' },
    { label: 'Orange', value: '#f15929' },
    { label: 'Bleu', value: '#1d4ed8' },
    { label: 'Vert', value: '#4a7c59' },
  ]

  const TITLE_POSITIONS: {
    value: SlidesDocumentOptions['titlePosition']
    label: string
  }[] = [
    { value: 'top-left', label: 'En haut à gauche' },
    { value: 'top-center', label: 'En haut au centre' },
    { value: 'top-right', label: 'En haut à droite' },
    { value: 'bottom-left', label: 'En bas à gauche' },
    { value: 'bottom-center', label: 'En bas au centre' },
    { value: 'bottom-right', label: 'En bas à droite' },
  ]

  /** Boutons de réglage d'une diapositive, positionnés en % de l'aperçu */
  interface SlideWidget {
    num: number
    side: 'question' | 'correction'
    left: number
    top: number
  }

  /** Boutons de zoom d'une figure, positionnés en % de l'aperçu */
  interface FigureWidget {
    num: number
    left: number
    top: number
  }

  const slideWidgets: SlideWidget[] = $derived(
    anchors.flatMap((anchor) => {
      if (
        anchor.kind !== 'diapo-question' &&
        anchor.kind !== 'diapo-correction'
      ) {
        return []
      }
      const position = anchorPosition(anchor, previewPages, previewViewBox)
      if (position == null) return []
      return [
        {
          num: anchor.num,
          side:
            anchor.kind === 'diapo-correction'
              ? ('correction' as const)
              : ('question' as const),
          ...position,
        },
      ]
    }),
  )

  const figureWidgets: FigureWidget[] = $derived(
    anchors.flatMap((anchor) => {
      if (anchor.kind !== 'figure') return []
      const position = anchorPosition(anchor, previewPages, previewViewBox)
      if (position == null) return []
      return [{ num: anchor.num, ...position }]
    }),
  )

  /** Crayon d'édition de la page de garde, s'il y en a une */
  const coverWidget: { left: number; top: number } | null = $derived(
    anchors
      .filter((anchor) => anchor.kind === 'diapo-garde')
      .map((anchor) => anchorPosition(anchor, previewPages, previewViewBox))
      .find((position) => position != null) ?? null,
  )

  /** Couleur hexadécimale courante du titre (pour le sélecteur personnalisé) */
  const isCustomTitleColor = $derived(
    !TITLE_COLORS.some((color) => color.value === documentOptions.titleColor),
  )

  /** Diapositives masquées, relues dans le code (pour pouvoir les réafficher) */
  const hiddenSlides: number[] = $derived(
    harvestSlidesCarryOver(code).hidden ?? [],
  )

  /** Pas d'ajustement du facteur de taille d'une diapositive, et ses bornes */
  const SLIDE_SCALE_STEP = 0.1

  /** Facteur de taille courant d'une face, lu dans le code */
  function slideScale(num: number, side: 'question' | 'correction'): number {
    const match = new RegExp(
      `^#let diapo-${num}-${side}-taille = ([\\d.]+)$`,
      'm',
    ).exec(code)
    return match != null ? Number(match[1]) : 1
  }

  /** Alignement vertical courant d'une face, lu dans le code */
  function slideAlign(
    num: number,
    side: 'question' | 'correction',
  ): SlideAlign {
    const match = new RegExp(
      `^#let diapo-${num}-${side}-align = "(top|center|bottom)"$`,
      'm',
    ).exec(code)
    return match != null ? (match[1] as SlideAlign) : documentOptions.align
  }

  /**
   * Ajuste la taille du texte d'une diapositive : édition ciblée de la ligne
   * `#let diapo-N-question-taille = ...` du code. Comme les éditions de la
   * palette de la vue Typst, elle ne marque pas le code comme modifié : elle
   * est reprise à la régénération (voir `harvestSlidesCarryOver`).
   */
  function adjustSlideScale(
    num: number,
    side: 'question' | 'correction',
    delta: number,
  ) {
    const pattern = new RegExp(`^#let diapo-${num}-${side}-taille = .*$`, 'm')
    if (!pattern.test(code)) return
    const next = Math.min(
      3,
      Math.max(
        0.3,
        Math.round((slideScale(num, side) + delta * SLIDE_SCALE_STEP) * 100) /
          100,
      ),
    )
    code = code.replace(pattern, `#let diapo-${num}-${side}-taille = ${next}`)
    scheduleCompile(code, 0)
  }

  const ALIGN_CYCLE: SlideAlign[] = ['top', 'center', 'bottom']
  const ALIGN_ICONS: Record<SlideAlign, string> = {
    top: 'bx-arrow-to-top',
    center: 'bx-align-middle',
    bottom: 'bx-arrow-to-bottom',
  }
  const ALIGN_LABELS: Record<SlideAlign, string> = {
    top: 'en haut',
    center: 'au centre',
    bottom: 'en bas',
  }

  /** Fait tourner l'alignement vertical du contenu : haut → centre → bas */
  function cycleSlideAlign(num: number, side: 'question' | 'correction') {
    const pattern = new RegExp(`^#let diapo-${num}-${side}-align = .*$`, 'm')
    if (!pattern.test(code)) return
    const current = slideAlign(num, side)
    const next =
      ALIGN_CYCLE[(ALIGN_CYCLE.indexOf(current) + 1) % ALIGN_CYCLE.length]
    code = code.replace(pattern, `#let diapo-${num}-${side}-align = "${next}"`)
    scheduleCompile(code, 0)
  }

  /**
   * Modale d'édition du code Typst d'une page (icône crayon de l'aperçu) :
   * elle ne montre que le contenu d'un bloc `#let <nom> = [ ... ]` du
   * document — une diapositive ou la page de garde —, pas tout le document.
   */
  let editedBlock: { name: string; label: string } | null = $state(null)
  let editedBody = $state('')

  /** Bloc de contenu dans le code (groupes : ouverture, corps, fermeture) */
  function blockPattern(name: string) {
    return new RegExp(`^(#let ${name} = \\[\\n)([\\s\\S]*?)(\\n\\]$)`, 'm')
  }

  function openBlockEditor(name: string, label: string) {
    const match = blockPattern(name).exec(code)
    if (match == null) return
    editedBlock = { name, label }
    editedBody = match[2]
  }

  function saveBlockEditor() {
    if (editedBlock == null) return
    const pattern = blockPattern(editedBlock.name)
    if (pattern.test(code)) {
      code = code.replace(
        pattern,
        (_match, open: string, _body: string, close: string) =>
          `${open}${editedBody}${close}`,
      )
      // le contenu d'une diapositive est reconstruit à chaque régénération :
      // la modification serait écrasée, on prévient
      isEdited = true
      scheduleCompile(code, 0)
    }
    editedBlock = null
  }

  /**
   * Modale des textes de la page de garde (crayon de l'aperçu) : titre et
   * sous-titre en texte, comme la page de garde de la vue Typst — le code
   * Typst de la page, lui, se retouche en mode « Code ».
   */
  let isCoverModalOpen = $state(false)
  let coverDraft = $state({ title: '', subtitle: '' })

  function openCoverModal() {
    coverDraft = {
      title: documentOptions.coverTitle,
      subtitle: documentOptions.coverSubtitle,
    }
    isCoverModalOpen = true
  }

  function saveCoverModal() {
    documentOptions.coverTitle = coverDraft.title
    documentOptions.coverSubtitle = coverDraft.subtitle
    isCoverModalOpen = false
    applyDocumentOptions()
  }

  /** Pas d'ajustement du zoom d'une figure, et bornes (20 % à 300 %) */
  const FIGURE_ZOOM_STEP = 0.1

  function adjustFigureZoom(figNum: number, delta: number) {
    const pattern = new RegExp(`^#let fig-${figNum}-zoom = ([\\d.]+)$`, 'm')
    const match = pattern.exec(code)
    if (match == null) return
    const next = Math.min(
      3,
      Math.max(
        0.2,
        Math.round((Number(match[1]) + delta * FIGURE_ZOOM_STEP) * 100) / 100,
      ),
    )
    code = code.replace(pattern, `#let fig-${figNum}-zoom = ${next}`)
    scheduleCompile(code, 0)
  }

  /**
   * Ordre et masquage changent la suite des pages : le document est regénéré
   * (les réglages faits sur l'aperçu sont repris via le carry-over).
   */
  function rebuildWith(overrides: Partial<SlidesCarryOver>) {
    if (!confirmOverwrite()) return
    code = buildCode(overrides)
    isEdited = false
    scheduleCompile(code, 0)
  }

  /** Retire (ou remet) une diapositive du diaporama */
  function toggleSlideHidden(num: number) {
    const carryOver = harvestSlidesCarryOver(code)
    const hidden = new Set(carryOver.hidden ?? [])
    if (hidden.has(num)) hidden.delete(num)
    else hidden.add(num)
    rebuildWith({ hidden: [...hidden].sort((a, b) => a - b) })
  }

  /** Déplace une diapositive d'un rang vers l'avant (−1) ou l'arrière (+1) */
  function moveSlide(num: number, delta: number) {
    const carryOver = harvestSlidesCarryOver(code)
    const order = [...(carryOver.order ?? [])]
    const index = order.indexOf(num)
    const target = index + delta
    if (index < 0 || target < 0 || target >= order.length) return
    ;[order[index], order[target]] = [order[target], order[index]]
    rebuildWith({ order })
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
    // le titre de la page de garde nomme aussi le fichier exporté
    return (
      documentOptions.coverTitle
        .trim()
        .replace(/[^\p{L}\p{N} _-]/gu, '')
        .replace(/\s+/g, '_') || 'diaporama'
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
</script>

<svelte:head>
  <title>MathALÉA - Diaporama PDF</title>
</svelte:head>

<main
  class="{$darkMode.isActive
    ? 'dark'
    : ''} flex flex-col h-screen bg-coopmaths-canvas-darkest dark:bg-coopmathsdark-canvas-darkest"
>
  <div class="bg-coopmaths-canvas dark:bg-coopmathsdark-canvas">
    <NavBar
      subtitle="Diaporama PDF"
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
        {#each [{ mode: 'preview', icon: 'bx-file-pdf', label: 'Aperçu' }, { mode: 'code', icon: 'bx-code-alt', label: 'Code' }] as choice (choice.mode)}
          <button
            type="button"
            class="flex items-center gap-1 px-3 py-1 text-sm {displayMode ===
            choice.mode
              ? 'bg-coopmaths-action text-coopmaths-canvas dark:bg-coopmathsdark-action dark:text-coopmathsdark-canvas'
              : 'text-coopmaths-action dark:text-coopmathsdark-action hover:bg-coopmaths-canvas-dark dark:hover:bg-coopmathsdark-canvas-dark'}"
            aria-pressed={displayMode === choice.mode}
            onclick={() => setDisplayMode(choice.mode as DisplayMode)}
          >
            <i aria-hidden="true" class="bx {choice.icon} text-lg"></i>
            {choice.label}
          </button>
        {/each}
      </div>

      <button
        type="button"
        title="Réglages du diaporama"
        aria-pressed={isSettingsOpen}
        class="flex items-center gap-1 text-sm {isSettingsOpen
          ? 'text-coopmaths-action font-semibold dark:text-coopmathsdark-action'
          : 'text-coopmaths-action/60 hover:text-coopmaths-action dark:text-coopmathsdark-action/60 dark:hover:text-coopmathsdark-action'}"
        onclick={() => (isSettingsOpen = !isSettingsOpen)}
      >
        <i aria-hidden="true" class="bx bx-cog text-xl"></i>
        Réglages
      </button>

      <button
        type="button"
        title="Nouvelles données aléatoires pour tous les exercices"
        class="flex items-center gap-1 text-sm text-coopmaths-action hover:text-coopmaths-action-lightest dark:text-coopmathsdark-action dark:hover:text-coopmathsdark-action-lightest"
        onclick={newDataForAll}
      >
        <i aria-hidden="true" class="bx bx-refresh text-xl"></i>
        Nouvelles données
      </button>

      <button
        type="button"
        title="Afficher sur l'aperçu les boutons de réglage de chaque diapositive (taille du texte, alignement, ordre, masquage)"
        aria-pressed={showOverlay}
        class="flex items-center gap-1 text-sm {showOverlay
          ? 'text-coopmaths-action font-semibold dark:text-coopmathsdark-action'
          : 'text-coopmaths-action/60 hover:text-coopmaths-action dark:text-coopmathsdark-action/60 dark:hover:text-coopmathsdark-action'}"
        onclick={() => {
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
              Réglages du diaporama
            </h3>
            <button
              type="button"
              aria-label="Fermer les réglages"
              onclick={() => (isSettingsOpen = false)}
            >
              <i
                aria-hidden="true"
                class="bx bx-x text-2xl text-coopmaths-action dark:text-coopmathsdark-action"
              ></i>
            </button>
          </div>

          <p class="text-xs opacity-75">
            Une question en grand par page, au format d'un écran. Projetez le
            PDF en plein écran et faites défiler les pages.
          </p>

          <ExportViewLinks current="slides" />

          <label class="flex flex-col gap-1 text-sm">
            Contenu
            <select
              class="rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
              bind:value={documentOptions.content}
              onchange={applyDocumentOptions}
            >
              <option value="questions-corrections">
                Questions puis corrections
              </option>
              <option value="alternees">
                Chaque correction après sa question
              </option>
              <option value="toutes-questions-puis-alternees">
                Toutes les questions, puis alternance question/réponse
              </option>
              <option value="questions">Questions seules</option>
              <option value="corrections">Corrections seules</option>
            </select>
          </label>

          <label class="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              bind:checked={documentOptions.multivue}
              onchange={applyDocumentOptions}
            />
            Multivue (deux versions différentes côte à côte)
          </label>

          <div
            class="space-y-3 rounded border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest p-3"
          >
            <div
              class="text-sm font-bold text-coopmaths-struct dark:text-coopmathsdark-struct"
            >
              Récapitulatifs (fin du document)
            </div>

            <label class="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                bind:checked={documentOptions.recapQuestions}
                onchange={applyDocumentOptions}
              />
              Toutes les questions
            </label>

            {#if documentOptions.recapQuestions}
              <input
                type="text"
                aria-label="Titre du récapitulatif des questions"
                placeholder="Titre du récapitulatif"
                class="w-full rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
                bind:value={documentOptions.recapQuestionsTitle}
                onchange={applyDocumentOptions}
              />
            {/if}

            <label class="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                bind:checked={documentOptions.recapAnswers}
                onchange={applyDocumentOptions}
              />
              Toutes les questions et leurs réponses
            </label>

            {#if documentOptions.recapAnswers}
              <input
                type="text"
                aria-label="Titre du récapitulatif des questions et réponses"
                placeholder="Titre du récapitulatif"
                class="w-full rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
                bind:value={documentOptions.recapAnswersTitle}
                onchange={applyDocumentOptions}
              />
              <p class="text-xs opacity-75">
                Les réponses sont réduites à ce que la correction met en
                évidence, comme la « correction minimale » de la vue Typst.
              </p>
            {/if}

            {#if documentOptions.recapQuestions || documentOptions.recapAnswers}
              <div class="flex items-center justify-between gap-4 text-sm">
                <label for="slides-recap-fontsize-input">
                  Taille du texte (pt)
                </label>
                <input
                  id="slides-recap-fontsize-input"
                  type="number"
                  min="6"
                  max="48"
                  step="1"
                  class="w-16 rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
                  bind:value={documentOptions.recapFontSize}
                  onchange={applyDocumentOptions}
                />
              </div>

              <div class="flex items-center justify-between gap-4 text-sm">
                <label for="slides-recap-columns-input">Colonnes</label>
                <input
                  id="slides-recap-columns-input"
                  type="number"
                  min="1"
                  max="4"
                  step="1"
                  class="w-16 rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
                  bind:value={documentOptions.recapColumns}
                  onchange={applyDocumentOptions}
                />
              </div>
            {/if}
          </div>

          <label class="flex items-center justify-between gap-4 text-sm">
            Format
            <select
              class="rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
              bind:value={documentOptions.ratio}
              onchange={applyDocumentOptions}
            >
              <option value="16-9">16/9</option>
              <option value="4-3">4/3</option>
            </select>
          </label>

          <div class="flex items-center justify-between gap-4 text-sm">
            <label for="slides-question-fontsize-input">
              Taille des questions (pt)
            </label>
            <input
              id="slides-question-fontsize-input"
              type="number"
              min="10"
              max="120"
              step="2"
              class="w-16 rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
              bind:value={documentOptions.questionFontSize}
              onchange={applyDocumentOptions}
            />
          </div>

          <div class="flex items-center justify-between gap-4 text-sm">
            <label for="slides-correction-fontsize-input">
              Taille des corrections (pt)
            </label>
            <input
              id="slides-correction-fontsize-input"
              type="number"
              min="10"
              max="120"
              step="2"
              class="w-16 rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
              bind:value={documentOptions.correctionFontSize}
              onchange={applyDocumentOptions}
            />
          </div>

          <label class="flex items-center justify-between gap-4 text-sm">
            Alignement vertical
            <select
              class="rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
              bind:value={documentOptions.align}
              onchange={applyDocumentOptions}
            >
              <option value="top">Haut</option>
              <option value="center">Centre</option>
              <option value="bottom">Bas</option>
            </select>
          </label>

          <label class="flex items-center justify-between gap-4 text-sm">
            Alignement horizontal
            <select
              class="rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
              bind:value={documentOptions.horizontalAlign}
              onchange={applyDocumentOptions}
            >
              <option value="center">Centré</option>
              <option value="left">À gauche</option>
            </select>
          </label>

          <div class="flex items-center justify-between gap-4 text-sm">
            <label for="slides-figure-zoom-input">Zoom des figures</label>
            <input
              id="slides-figure-zoom-input"
              type="number"
              min="0.5"
              max="3"
              step="0.1"
              class="w-16 rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
              bind:value={documentOptions.figureZoom}
              onchange={applyDocumentOptions}
            />
          </div>

          <label class="flex items-center justify-between gap-4 text-sm">
            Police du texte
            <select
              class="rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm max-w-40"
              bind:value={documentOptions.font}
              onchange={applyDocumentOptions}
            >
              {#each TEXT_FONTS as font (font)}
                <option value={font}>{font}</option>
              {/each}
            </select>
          </label>

          <label class="flex items-center justify-between gap-4 text-sm">
            Police des maths
            <select
              class="rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm max-w-40"
              bind:value={documentOptions.mathFont}
              onchange={applyDocumentOptions}
            >
              {#each MATH_FONTS as font (font)}
                <option value={font}>{font}</option>
              {/each}
            </select>
          </label>

          <label class="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              bind:checked={documentOptions.showNumbers}
              onchange={applyDocumentOptions}
            />
            Numéroter les diapositives
          </label>

          <label class="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              bind:checked={documentOptions.showCorrectionLabel}
              onchange={applyDocumentOptions}
            />
            Écrire « Correction » sur les corrections
          </label>

          <label class="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              bind:checked={documentOptions.autoFit}
              onchange={applyDocumentOptions}
            />
            Réduire le texte des diapositives trop chargées
          </label>

          <label class="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              bind:checked={documentOptions.autoVerticalSpacing}
              onchange={applyDocumentOptions}
            />
            Gestion automatique des espaces verticaux
          </label>

          <div class="space-y-1.5">
            <label class="text-sm" for="slides-footer-input">Pied de page</label
            >
            <input
              id="slides-footer-input"
              type="text"
              placeholder="Aucun pied de page"
              class="w-full rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
              bind:value={documentOptions.footer}
              onchange={applyDocumentOptions}
            />
          </div>

          <div class="space-y-1.5">
            <label class="text-sm" for="slides-title-input">
              Titre sur chaque diapositive
            </label>
            <input
              id="slides-title-input"
              type="text"
              placeholder="Ex. le thème de la séance"
              class="w-full rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
              bind:value={documentOptions.slideTitle}
              onchange={applyDocumentOptions}
            />
          </div>

          <div class="flex items-center justify-between gap-4 text-sm">
            <label for="slides-title-size-input">
              Taille du titre et du pied (pt)
            </label>
            <input
              id="slides-title-size-input"
              type="number"
              min="6"
              max="48"
              step="1"
              class="w-16 rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
              bind:value={documentOptions.titleSize}
              onchange={applyDocumentOptions}
            />
          </div>

          {#if documentOptions.slideTitle.trim() !== ''}
            <label class="flex items-center justify-between gap-4 text-sm">
              Position du titre
              <select
                class="rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm max-w-40"
                bind:value={documentOptions.titlePosition}
                onchange={applyDocumentOptions}
              >
                {#each TITLE_POSITIONS as position (position.value)}
                  <option value={position.value}>{position.label}</option>
                {/each}
              </select>
            </label>

            <div class="flex items-center justify-between gap-4 text-sm">
              <span>Couleur du titre</span>
              <div class="flex items-center gap-1.5">
                {#each TITLE_COLORS as color (color.value)}
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
                    onclick={() => {
                      documentOptions.titleColor = color.value
                      applyDocumentOptions()
                    }}
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
                  oninput={(e) => {
                    documentOptions.titleColor = e.currentTarget.value
                    applyDocumentOptions()
                  }}
                />
              </div>
            </div>
          {/if}

          {#if hiddenSlides.length > 0}
            <div class="space-y-1.5">
              <span class="text-sm">Diapositives masquées</span>
              <div class="flex flex-row flex-wrap gap-2">
                {#each hiddenSlides as num (num)}
                  <button
                    type="button"
                    title="Réafficher la diapositive {num}"
                    class="flex items-center gap-1 rounded-full border border-coopmaths-action/40 px-2 py-0.5 text-sm text-coopmaths-action hover:bg-coopmaths-action/10 dark:border-coopmathsdark-action/40 dark:text-coopmathsdark-action"
                    onclick={() => toggleSlideHidden(num)}
                  >
                    <i aria-hidden="true" class="bx bx-show text-base"></i>
                    {num}
                  </button>
                {/each}
              </div>
            </div>
          {/if}

          <button
            type="button"
            class="text-sm text-coopmaths-action underline dark:text-coopmathsdark-action"
            onclick={resetDocumentOptions}
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
            {#each warnings as warning (warning)}
              <p>{warning}</p>
            {/each}
          </div>
        {/if}

        {#if displayMode === 'code'}
          <textarea
            class="grow w-full resize-none font-mono text-sm p-4 bg-[#282c34] text-[#abb2bf] focus:outline-hidden"
            spellcheck="false"
            bind:value={code}
            oninput={onCodeInput}
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
              <div class="typst-preview relative mx-auto max-w-5xl">
                <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                {@html svgContent}
                {#if showOverlay}
                  <!-- clef positionnelle : une même diapositive (ou figure)
                       peut apparaitre sur plusieurs pages, par exemple quand
                       la question est rappelée sur sa correction -->
                  {#each slideWidgets as widget, index (index)}
                    <div
                      class="absolute z-10 flex flex-row items-center rounded-full border border-coopmaths-action/40 bg-coopmaths-canvas/90 shadow-sm dark:border-coopmathsdark-action/40 dark:bg-coopmathsdark-canvas/90"
                      style="left: {widget.left}%; top: {widget.top}%; transform: translate(-50%, -50%);"
                    >
                      <button
                        type="button"
                        title="Réduire le texte de cette diapositive"
                        class="px-1 py-0.5 text-coopmaths-action hover:text-coopmaths-action-lightest dark:text-coopmathsdark-action dark:hover:text-coopmathsdark-action-lightest"
                        onclick={() =>
                          adjustSlideScale(widget.num, widget.side, -1)}
                      >
                        <i aria-hidden="true" class="bx bx-minus text-sm"></i>
                      </button>
                      <button
                        type="button"
                        title="Agrandir le texte de cette diapositive"
                        class="px-1 py-0.5 text-coopmaths-action hover:text-coopmaths-action-lightest dark:text-coopmathsdark-action dark:hover:text-coopmathsdark-action-lightest"
                        onclick={() =>
                          adjustSlideScale(widget.num, widget.side, 1)}
                      >
                        <i aria-hidden="true" class="bx bx-plus text-sm"></i>
                      </button>
                      <button
                        type="button"
                        title="Contenu aligné {ALIGN_LABELS[
                          slideAlign(widget.num, widget.side)
                        ]} : cliquer pour changer"
                        class="px-1 py-0.5 text-coopmaths-action hover:text-coopmaths-action-lightest dark:text-coopmathsdark-action dark:hover:text-coopmathsdark-action-lightest"
                        onclick={() => cycleSlideAlign(widget.num, widget.side)}
                      >
                        <i
                          aria-hidden="true"
                          class="bx {ALIGN_ICONS[
                            slideAlign(widget.num, widget.side)
                          ]} text-sm"
                        ></i>
                      </button>
                      <button
                        type="button"
                        title="Éditer le code Typst de cette diapositive"
                        class="px-1 py-0.5 text-coopmaths-action hover:text-coopmaths-action-lightest dark:text-coopmathsdark-action dark:hover:text-coopmathsdark-action-lightest"
                        onclick={() =>
                          openBlockEditor(
                            `diapo-${widget.num}-${widget.side}`,
                            `Diapositive ${widget.num} — ${widget.side === 'correction' ? 'correction' : 'question'}`,
                          )}
                      >
                        <i aria-hidden="true" class="bx bx-pencil text-sm"></i>
                      </button>
                      <button
                        type="button"
                        title="Déplacer cette diapositive vers le début"
                        class="px-1 py-0.5 text-coopmaths-action hover:text-coopmaths-action-lightest dark:text-coopmathsdark-action dark:hover:text-coopmathsdark-action-lightest"
                        onclick={() => moveSlide(widget.num, -1)}
                      >
                        <i aria-hidden="true" class="bx bx-chevron-left text-sm"
                        ></i>
                      </button>
                      <button
                        type="button"
                        title="Déplacer cette diapositive vers la fin"
                        class="px-1 py-0.5 text-coopmaths-action hover:text-coopmaths-action-lightest dark:text-coopmathsdark-action dark:hover:text-coopmathsdark-action-lightest"
                        onclick={() => moveSlide(widget.num, 1)}
                      >
                        <i
                          aria-hidden="true"
                          class="bx bx-chevron-right text-sm"
                        ></i>
                      </button>
                      <button
                        type="button"
                        title="Retirer cette question du diaporama (question et correction)"
                        class="px-1 py-0.5 text-coopmaths-action hover:text-coopmaths-action-lightest dark:text-coopmathsdark-action dark:hover:text-coopmathsdark-action-lightest"
                        onclick={() => toggleSlideHidden(widget.num)}
                      >
                        <i aria-hidden="true" class="bx bx-hide text-sm"></i>
                      </button>
                    </div>
                  {/each}
                  {#if coverWidget != null}
                    <div
                      class="absolute z-10 flex flex-row items-center rounded-full border border-coopmaths-action/40 bg-coopmaths-canvas/90 shadow-sm dark:border-coopmathsdark-action/40 dark:bg-coopmathsdark-canvas/90"
                      style="left: {coverWidget.left}%; top: {coverWidget.top}%; transform: translate(-50%, -50%);"
                    >
                      <button
                        type="button"
                        title="Modifier le titre et le sous-titre de la page de garde"
                        class="px-1 py-0.5 text-coopmaths-action hover:text-coopmaths-action-lightest dark:text-coopmathsdark-action dark:hover:text-coopmathsdark-action-lightest"
                        onclick={openCoverModal}
                      >
                        <i aria-hidden="true" class="bx bx-pencil text-sm"></i>
                      </button>
                    </div>
                  {/if}
                  {#each figureWidgets as widget, index (index)}
                    <div
                      class="absolute z-10 flex flex-row items-center rounded-full border border-coopmaths-action/40 bg-coopmaths-canvas/90 shadow-sm dark:border-coopmathsdark-action/40 dark:bg-coopmathsdark-canvas/90"
                      style="left: {widget.left}%; top: {widget.top}%; transform: translate(-50%, -50%);"
                    >
                      <button
                        type="button"
                        title="Réduire cette figure"
                        class="px-1 py-0.5 text-coopmaths-action hover:text-coopmaths-action-lightest dark:text-coopmathsdark-action dark:hover:text-coopmathsdark-action-lightest"
                        onclick={() => adjustFigureZoom(widget.num, -1)}
                      >
                        <i aria-hidden="true" class="bx bx-zoom-out text-sm"
                        ></i>
                      </button>
                      <button
                        type="button"
                        title="Agrandir cette figure"
                        class="px-1 py-0.5 text-coopmaths-action hover:text-coopmaths-action-lightest dark:text-coopmathsdark-action dark:hover:text-coopmathsdark-action-lightest"
                        onclick={() => adjustFigureZoom(widget.num, 1)}
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
            {#each diagnostics as diagnostic (diagnostic)}
              <p>{diagnostic}</p>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  {/if}

  {#if editedBlock != null}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onclick={(event) => {
        if (event.target === event.currentTarget) editedBlock = null
      }}
      onkeydown={(event) => {
        if (event.key === 'Escape') editedBlock = null
      }}
    >
      <div
        class="w-full max-w-2xl rounded-lg bg-coopmaths-canvas dark:bg-coopmathsdark-canvas p-5 space-y-3 text-coopmaths-corpus dark:text-coopmathsdark-corpus shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-label="Code Typst de la page"
      >
        <div class="flex items-center justify-between">
          <h3
            class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct"
          >
            {editedBlock.label}
          </h3>
          <button
            type="button"
            aria-label="Fermer"
            onclick={() => (editedBlock = null)}
          >
            <i
              aria-hidden="true"
              class="bx bx-x text-2xl text-coopmaths-action dark:text-coopmathsdark-action"
            ></i>
          </button>
        </div>

        <p class="text-xs opacity-75">
          {#if editedBlock.name === 'page-de-garde'}
            Code Typst de la page de garde. Il est conservé quand le document
            est régénéré ; <code>#titre-document</code> reprend le titre saisi dans
            les réglages.
          {:else}
            Code Typst du contenu de cette diapositive. Attention : régénérer le
            document (changement de réglage, nouvelles données) écrasera cette
            modification.
          {/if}
        </p>

        <textarea
          class="h-72 w-full resize-none font-mono text-sm p-3 rounded bg-[#282c34] text-[#abb2bf] focus:outline-hidden"
          spellcheck="false"
          bind:value={editedBody}
        ></textarea>

        <div class="flex flex-row justify-end gap-3">
          <button
            type="button"
            class="text-sm text-coopmaths-action underline dark:text-coopmathsdark-action"
            onclick={() => (editedBlock = null)}
          >
            Annuler
          </button>
          <ButtonTextAction
            text="Appliquer"
            icon="bx-check"
            inverted={true}
            class="rounded-lg py-1 px-2"
            on:click={saveBlockEditor}
          />
        </div>
      </div>
    </div>
  {/if}

  {#if isCoverModalOpen}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onclick={(event) => {
        if (event.target === event.currentTarget) isCoverModalOpen = false
      }}
      onkeydown={(event) => {
        if (event.key === 'Escape') isCoverModalOpen = false
      }}
    >
      <div
        class="w-full max-w-md rounded-lg bg-coopmaths-canvas dark:bg-coopmathsdark-canvas p-5 space-y-3 text-coopmaths-corpus dark:text-coopmathsdark-corpus shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-label="Textes de la page de garde"
      >
        <div class="flex items-center justify-between">
          <h3
            class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct"
          >
            Page de garde
          </h3>
          <button
            type="button"
            aria-label="Fermer"
            onclick={() => (isCoverModalOpen = false)}
          >
            <i
              aria-hidden="true"
              class="bx bx-x text-2xl text-coopmaths-action dark:text-coopmathsdark-action"
            ></i>
          </button>
        </div>

        <div class="space-y-1.5">
          <label class="text-sm" for="slides-cover-title-input">Titre</label>
          <input
            id="slides-cover-title-input"
            type="text"
            class="w-full rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
            bind:value={coverDraft.title}
            onkeydown={(event) => {
              if (event.key === 'Enter') saveCoverModal()
            }}
          />
        </div>

        <div class="space-y-1.5">
          <label class="text-sm" for="slides-cover-subtitle-input">
            Sous-titre
          </label>
          <input
            id="slides-cover-subtitle-input"
            type="text"
            class="w-full rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
            bind:value={coverDraft.subtitle}
            onkeydown={(event) => {
              if (event.key === 'Enter') saveCoverModal()
            }}
          />
        </div>

        <div class="flex flex-row justify-end gap-3">
          <button
            type="button"
            class="text-sm text-coopmaths-action underline dark:text-coopmathsdark-action"
            onclick={() => (isCoverModalOpen = false)}
          >
            Annuler
          </button>
          <ButtonTextAction
            text="Enregistrer"
            icon="bx-check"
            inverted={true}
            class="rounded-lg py-1 px-2"
            on:click={saveCoverModal}
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
