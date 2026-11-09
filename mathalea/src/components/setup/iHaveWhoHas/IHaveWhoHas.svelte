<script lang="ts">
  import { getShortAnswer } from '../typst/minimalCorrection'
  import JSZip from 'jszip'
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
  import {
    anchorPosition,
    separatePages,
    type PreviewPageGeometry,
  } from '../shared/typstPreview'
  import {
    buildIHaveWhoHasCards,
    buildIHaveWhoHasDocument,
    defaultIHaveWhoHasDocumentOptions,
    duplicateMinimalAnswers,
    harvestIHaveWhoHasCarryOver,
    iHaveWhoHasSeriesId,
    I_HAVE_WHO_HAS_BACK_IMAGE,
    I_HAVE_WHO_HAS_BACK_IMAGE_VIRTUAL_PATH,
    type IHaveWhoHasDocumentOptions,
  } from '../typst/buildIHaveWhoHasDocument'
  import {
    MATH_FONTS,
    TEXT_FONTS,
    type TypstExerciseInput,
  } from '../typst/buildTypstDocument'
  import type { TypstAnchor } from '../typst/typstCompiler'

  type DisplayMode = 'preview' | 'code'
  const STORAGE_KEY = 'mathaleaIHaveWhoHasView'
  const PREFERENCES_VERSION = 2
  const MAX_UNIQUE_ATTEMPTS = 100

  let displayMode: DisplayMode = 'preview'
  let documentOptions: IHaveWhoHasDocumentOptions = {
    ...defaultIHaveWhoHasDocumentOptions,
  }
  let isSettingsOpen = true
  let exercises: (IExercice | null)[] = []
  let isLoading = true
  let isCompiling = false
  let isGeneratingPdf = false
  let isEdited = false
  let code = ''
  let svgContent = ''
  let diagnostics: string[] = []
  let warnings: string[] = []
  let previewPages: PreviewPageGeometry[] = []
  let previewViewBox = { width: 0, height: 0 }
  let anchors: TypstAnchor[] = []
  let compileTimer: ReturnType<typeof setTimeout>
  let compileToken = 0
  let backImageBytes: Uint8Array | null = null

  if (isLocalStorageAvailable()) {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      if (saved != null) {
        const parsed = JSON.parse(saved)
        if (parsed.displayMode === 'preview' || parsed.displayMode === 'code') {
          displayMode = parsed.displayMode
        }
        if (parsed.documentOptions != null) {
          documentOptions = {
            ...defaultIHaveWhoHasDocumentOptions,
            ...parsed.documentOptions,
          }
          // La première version utilisait portrait par défaut. Lors de la
          // migration, basculer une fois les préférences existantes vers le
          // nouveau défaut paysage afin que le changement soit visible aussi
          // pour les utilisateurs ayant déjà ouvert cette vue.
          if (parsed.version !== PREFERENCES_VERSION) {
            documentOptions.orientation = 'landscape'
          }
        }
      }
    } catch {
      // préférences illisibles : les valeurs par défaut restent actives
    }
  }

  function persistPreferences() {
    if (!isLocalStorageAvailable()) return
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          version: PREFERENCES_VERSION,
          displayMode,
          documentOptions,
        }),
      )
    } catch {
      // stockage indisponible : sans conséquence sur la vue
    }
  }

  function regenerate(index: number) {
    const exercise = exercises[index]
    if (exercise == null) return
    exercise.numeroExercice = index
    if (exercise.seed === undefined) exercise.applyNewSeed?.()
    seedrandom(exercise.seed, { global: true })
    if (exercise.typeExercice === 'statique') return
    context.isTypst = true
    try {
      if (exercise.typeExercice === 'simple') {
        mathaleaHandleExerciceSimple(exercise, false, index)
      } else {
        exercise.nouvelleVersionWrapper?.(index)
      }
    } finally {
      context.isTypst = false
    }
  }

  function buildInputs(): TypstExerciseInput[] {
    const inputs: TypstExerciseInput[] = []
    const nextWarnings: string[] = []
    for (const [index, exercise] of exercises.entries()) {
      if (exercise == null) {
        nextWarnings.push(`Exercice ${index + 1} : chargement impossible.`)
        continue
      }
      if (exercise.typeExercice?.includes('html')) {
        nextWarnings.push(
          `${exercise.titre} : cet exercice exclusivement interactif ne peut pas être exporté.`,
        )
        continue
      }
      regenerate(index)
      const format = (text: string) =>
        mathaleaFormatExercice(text).replaceAll('{zoomFactor}', '1')
      inputs.push({
        ref: exercise.id ?? '',
        intro: '',
        questions: (exercise.listeQuestions ?? []).map(format),
        introCorrection: '',
        corrections: (exercise.listeCorrections ?? []).map(format),
        shortAnswers: (exercise.listeQuestions ?? []).map((_, i) => {
          const answer = getShortAnswer(exercise, i)
          return answer == null ? answer : format(answer)
        }),
        numbered: false,
      })
    }
    warnings = nextWarnings
    return inputs
  }

  function drawNewSeeds() {
    seedrandom(undefined, { global: true })
    const params = get(exercicesParams)
    for (const [index, exercise] of exercises.entries()) {
      if (exercise == null) continue
      exercise.seed = undefined
      exercise.applyNewSeed?.()
      if (params[index] != null && exercise.seed !== undefined) {
        params[index].alea = exercise.seed
      }
    }
  }

  /** Retire si nécessaire jusqu'à former une chaîne sans réponse en double. */
  function buildUniqueInputs(
    forceNewData = false,
  ): TypstExerciseInput[] | null {
    if (forceNewData) drawNewSeeds()
    let inputs = buildInputs()
    let attempts = 0
    while (
      duplicateMinimalAnswers(inputs).length > 0 &&
      attempts < MAX_UNIQUE_ATTEMPTS
    ) {
      drawNewSeeds()
      inputs = buildInputs()
      attempts++
    }
    exercicesParams.update((list) => list)
    if (duplicateMinimalAnswers(inputs).length > 0) {
      warnings = [
        `Impossible d’obtenir des réponses toutes différentes après ${MAX_UNIQUE_ATTEMPTS} tirages. Modifiez les réglages ou les exercices.`,
      ]
      return null
    }
    if (buildIHaveWhoHasCards(inputs).length === 0) {
      warnings = ['Aucune question avec une correction associée à exporter.']
      return null
    }
    return inputs
  }

  function generatedCode(forceNewData = false): string | null {
    const inputs = buildUniqueInputs(forceNewData)
    if (inputs == null) return null
    const carryOver = harvestIHaveWhoHasCarryOver(code)
    // Un réglage de mise en page conserve les repères. « Nouvelles données »
    // crée une nouvelle série et doit donc les rebrasser entièrement.
    if (forceNewData) delete carryOver.cardCodes
    const seriesId = iHaveWhoHasSeriesId(
      exercises
        .map((exercise) => exercise?.seed ?? '')
        .concat(JSON.stringify(inputs)),
    )
    return buildIHaveWhoHasDocument(
      inputs,
      documentOptions,
      carryOver,
      seriesId,
    )
  }

  interface CardWidget {
    num: number
    left: number
    top: number
  }

  $: cardWidgets = anchors.flatMap((anchor): CardWidget[] => {
    if (anchor.kind !== 'carte-recto' || anchor.num < 1) return []
    const position = anchorPosition(anchor, previewPages, previewViewBox)
    return position == null ? [] : [{ num: anchor.num, ...position }]
  })

  function cardScale(num: number): number {
    const match = new RegExp(
      `^#let carte-${num}-taille = ([\\d.]+)$`,
      'm',
    ).exec(code)
    return match == null ? 1 : Number(match[1])
  }

  function adjustCardScale(num: number, delta: number) {
    const pattern = new RegExp(`^#let carte-${num}-taille = .*$`, 'm')
    if (!pattern.test(code)) return
    const next = Math.min(
      3,
      Math.max(0.4, Math.round((cardScale(num) + delta * 0.1) * 100) / 100),
    )
    code = code.replace(pattern, `#let carte-${num}-taille = ${next}`)
    scheduleCompile(code, 0)
  }

  function confirmOverwrite(): boolean {
    return (
      !isEdited ||
      window.confirm(
        'Le code Typst a été modifié : le regénérer écrasera vos modifications. Continuer ?',
      )
    )
  }

  function regenerateCode(forceNewData = false) {
    if (!confirmOverwrite()) return
    persistPreferences()
    const next = generatedCode(forceNewData)
    if (next == null) return
    code = next
    isEdited = false
    scheduleCompile(code, 0)
  }

  function resetOptions() {
    documentOptions = { ...defaultIHaveWhoHasDocumentOptions }
    regenerateCode()
  }

  function scheduleCompile(source: string, delay = 500) {
    clearTimeout(compileTimer)
    compileTimer = setTimeout(() => compile(source), delay)
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
      if (token === compileToken) {
        diagnostics = [error instanceof Error ? error.message : String(error)]
      }
    } finally {
      if (token === compileToken) isCompiling = false
    }
  }

  function filename() {
    return (
      documentOptions.title
        .trim()
        .replace(/[^\p{L}\p{N} _-]/gu, '')
        .replace(/\s+/g, '_') || 'jai-qui-a'
    )
  }

  function downloadBlob(blob: Blob, name: string) {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = name
    link.click()
    URL.revokeObjectURL(url)
  }

  function downloadTyp() {
    if (backImageBytes == null) return
    const zip = new JSZip()
    zip.file(`${filename()}.typ`, code)
    zip.file(I_HAVE_WHO_HAS_BACK_IMAGE, backImageBytes)
    zip.generateAsync({ type: 'blob' }).then((blob) => {
      downloadBlob(blob, `${filename()}.zip`)
    })
  }

  async function loadBackImage() {
    const response = await window.fetch(
      `${import.meta.env.BASE_URL}assets/i-have-who-has/versoGKiA.jpg`,
    )
    if (!response.ok) throw new Error('Verso des cartes introuvable.')
    backImageBytes = new Uint8Array(await response.arrayBuffer())
    const { setStaticImageBytes } = await import('../typst/typstCompiler')
    setStaticImageBytes(
      new Map([[I_HAVE_WHO_HAS_BACK_IMAGE_VIRTUAL_PATH, backImageBytes]]),
    )
  }

  async function downloadPdf() {
    if (isGeneratingPdf) return
    isGeneratingPdf = true
    try {
      const { compileTypstToPdf } = await import('../typst/typstCompiler')
      const pdf = await compileTypstToPdf(code)
      if (pdf == null) {
        window.alert('La compilation du PDF a échoué.')
      } else {
        downloadBlob(
          new Blob([pdf as BlobPart], { type: 'application/pdf' }),
          `${filename()}.pdf`,
        )
      }
    } finally {
      isGeneratingPdf = false
    }
  }

  onMount(async () => {
    try {
      await loadBackImage()
    } catch (error) {
      warnings = [error instanceof Error ? error.message : String(error)]
    }
    const results = await Promise.allSettled(buildExercisesList())
    exercises = results.map((result) =>
      result.status === 'fulfilled' ? result.value : null,
    )
    exercises.forEach((exercise) => {
      if (exercise != null) exercise.interactif = false
    })
    const initial = generatedCode()
    if (initial != null) {
      code = initial
      compile(code)
    }
    isLoading = false
  })

  onDestroy(() => {
    clearTimeout(compileTimer)
    exercises.forEach((exercise) => {
      exercise?.reinit?.()
      exercise?.destroy?.()
    })
  })
</script>

<svelte:head><title>MathALÉA - J’ai… qui a… ?</title></svelte:head>

<main
  class="{$darkMode.isActive
    ? 'dark'
    : ''} flex flex-col h-screen bg-coopmaths-canvas-darkest dark:bg-coopmathsdark-canvas-darkest"
>
  <div class="bg-coopmaths-canvas dark:bg-coopmathsdark-canvas">
    <NavBar
      subtitle="J’ai… qui a… ?"
      subtitleType="export"
      handleLanguage={() => {}}
      locale={$referentielLocale}
    />
    <div
      class="flex flex-row flex-wrap items-center gap-x-6 gap-y-3 px-4 md:px-8 py-3 border-b border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest text-coopmaths-corpus dark:text-coopmathsdark-corpus"
    >
      <div
        class="flex rounded-lg overflow-hidden border border-coopmaths-action"
        role="group"
        aria-label="Mode d'affichage"
      >
        {#each [{ mode: 'preview', icon: 'bx-file-pdf', label: 'Aperçu' }, { mode: 'code', icon: 'bx-code-alt', label: 'Code' }] as choice}
          <button
            type="button"
            class="flex items-center gap-1 px-3 py-1 text-sm {displayMode ===
            choice.mode
              ? 'bg-coopmaths-action text-white'
              : 'text-coopmaths-action'}"
            on:click={() => {
              displayMode = choice.mode as DisplayMode
              persistPreferences()
            }}
          >
            <i class="bx {choice.icon} text-lg"></i>{choice.label}
          </button>
        {/each}
      </div>
      <button
        type="button"
        class="flex items-center gap-1 text-sm text-coopmaths-action"
        on:click={() => (isSettingsOpen = !isSettingsOpen)}
        ><i class="bx bx-cog text-xl"></i>Réglages</button
      >
      <button
        type="button"
        class="flex items-center gap-1 text-sm text-coopmaths-action"
        on:click={() => regenerateCode(true)}
        ><i class="bx bx-refresh text-xl"></i>Nouvelles données</button
      >
      <div class="grow"></div>
      {#if displayMode === 'code'}<ButtonTextAction
          text="Télécharger le .typ (.zip)"
          icon="bx-file-blank"
          inverted={true}
          class="rounded-lg py-1 px-2"
          title="Archive ZIP contenant le code Typst et l’image du verso"
          on:click={downloadTyp}
        />{/if}
      <ButtonTextAction
        text={isGeneratingPdf ? 'PDF en cours...' : 'Télécharger le PDF'}
        icon={isGeneratingPdf ? 'bx-loader-alt bx-spin' : 'bx-download'}
        inverted={true}
        class="rounded-lg py-1 px-2"
        on:click={downloadPdf}
      />
    </div>
  </div>

  {#if isLoading}
    <div class="flex grow items-center justify-center">
      <i class="bx bx-loader-alt bx-spin text-4xl"></i>
    </div>
  {:else}
    <div class="flex grow min-h-0">
      {#if isSettingsOpen}
        <aside
          class="w-80 shrink-0 overflow-y-auto border-r bg-coopmaths-canvas dark:bg-coopmathsdark-canvas p-5 space-y-4 text-coopmaths-corpus dark:text-coopmathsdark-corpus"
        >
          <div class="flex justify-between">
            <h3 class="font-bold">Réglages des cartes</h3>
            <button
              type="button"
              aria-label="Fermer les réglages"
              on:click={() => (isSettingsOpen = false)}
              ><i class="bx bx-x text-2xl"></i></button
            >
          </div>
          <p class="text-xs opacity-75">
            Une carte par question. La réponse courante et la question suivante
            sont imprimées du même côté. Les réponses sont toutes différentes.
          </p>
          <ExportViewLinks current="i-have-who-has" />
          <label class="block text-sm"
            >Titre<input
              class="mt-1 w-full rounded py-0.5"
              bind:value={documentOptions.title}
              on:change={() => regenerateCode()}
            /></label
          >
          <label class="flex justify-between text-sm"
            >Format<select
              class="rounded py-0.5"
              bind:value={documentOptions.pageFormat}
              on:change={() => regenerateCode()}
              ><option value="a4">A4</option><option value="a5">A5</option
              ></select
            ></label
          >
          <label class="flex justify-between text-sm"
            >Orientation<select
              class="rounded py-0.5"
              bind:value={documentOptions.orientation}
              on:change={() => regenerateCode()}
              ><option value="portrait">Portrait</option><option
                value="landscape">Paysage</option
              ></select
            ></label
          >
          <label class="flex justify-between text-sm"
            >Cartes par ligne<input
              type="number"
              min="1"
              max="4"
              class="w-16 rounded py-0.5"
              bind:value={documentOptions.columns}
              on:change={() => regenerateCode()}
            /></label
          >
          <label class="flex justify-between text-sm"
            >Lignes par page<input
              type="number"
              min="1"
              max="8"
              class="w-16 rounded py-0.5"
              bind:value={documentOptions.rows}
              on:change={() => regenerateCode()}
            /></label
          >
          <label class="flex justify-between text-sm"
            >Taille « J’ai » (pt)<input
              type="number"
              min="8"
              max="30"
              class="w-16 rounded py-0.5"
              bind:value={documentOptions.answerFontSize}
              on:change={() => regenerateCode()}
            /></label
          >
          <label class="flex justify-between text-sm"
            >Taille « Qui a » (pt)<input
              type="number"
              min="8"
              max="30"
              class="w-16 rounded py-0.5"
              bind:value={documentOptions.questionFontSize}
              on:change={() => regenerateCode()}
            /></label
          >
          <label class="flex justify-between text-sm"
            >Interligne (em)<input
              type="number"
              min="0.5"
              max="3"
              step="0.05"
              class="w-16 rounded py-0.5"
              bind:value={documentOptions.lineSpacing}
              on:change={() => regenerateCode()}
            /></label
          >
          <label class="flex justify-between text-sm"
            >Traits (pt)<input
              type="number"
              min="0"
              max="3"
              step="0.1"
              class="w-16 rounded py-0.5"
              bind:value={documentOptions.separatorThickness}
              on:change={() => regenerateCode()}
            /></label
          >
          <label class="flex justify-between text-sm"
            >Police du texte<select
              class="max-w-40 rounded py-0.5"
              bind:value={documentOptions.font}
              on:change={() => regenerateCode()}
              >{#each TEXT_FONTS as font}<option value={font}>{font}</option
                >{/each}</select
            ></label
          >
          <label class="flex justify-between text-sm"
            >Police des maths<select
              class="max-w-40 rounded py-0.5"
              bind:value={documentOptions.mathFont}
              on:change={() => regenerateCode()}
              >{#each MATH_FONTS as font}<option value={font}>{font}</option
                >{/each}</select
            ></label
          >
          <label class="flex gap-2 text-sm"
            ><input
              type="checkbox"
              bind:checked={documentOptions.showNumbers}
              on:change={() => regenerateCode()}
            />Numéroter les cartes</label
          >
          <button
            type="button"
            class="text-sm text-coopmaths-action underline"
            on:click={resetOptions}>Réinitialiser les réglages</button
          >
        </aside>
      {/if}
      <div class="flex flex-col grow min-w-0">
        {#if warnings.length > 0}<div
            class="px-4 py-2 text-sm bg-amber-100 text-amber-900"
          >
            {#each warnings as warning}<p>{warning}</p>{/each}
          </div>{/if}
        {#if displayMode === 'code'}
          <textarea
            class="grow w-full resize-none font-mono text-sm p-4 bg-[#282c34] text-[#abb2bf]"
            spellcheck="false"
            bind:value={code}
            on:input={() => {
              isEdited = true
              scheduleCompile(code)
            }}
          ></textarea>
        {:else}
          <div class="grow overflow-auto p-4 relative">
            {#if svgContent === '' && isCompiling}<div
                class="flex justify-center py-24"
              >
                <i class="bx bx-loader-alt bx-spin text-4xl"></i>
              </div>{:else if svgContent === ''}<p class="text-center py-24">
                Aucun aperçu disponible.
              </p>{:else}<div class="typst-preview relative mx-auto max-w-3xl">
                <!-- eslint-disable-next-line svelte/no-at-html-tags -->{@html svgContent}
                {#each cardWidgets as widget (`card-${widget.num}`)}
                  <div
                    class="absolute z-10 flex items-center rounded-full border border-coopmaths-action/40 bg-coopmaths-canvas/90 shadow-sm dark:border-coopmathsdark-action/40 dark:bg-coopmathsdark-canvas/90"
                    style="left: {widget.left}%; top: {widget.top}%; transform: translate(-50%, -50%);"
                  >
                    <button
                      type="button"
                      title="Réduire le contenu de la carte {widget.num}"
                      class="px-1 py-0.5 text-coopmaths-action dark:text-coopmathsdark-action"
                      on:click={() => adjustCardScale(widget.num, -1)}
                    >
                      <i class="bx bx-minus text-sm"></i>
                    </button>

                    <button
                      type="button"
                      title="Agrandir le contenu de la carte {widget.num}"
                      class="px-1 py-0.5 text-coopmaths-action dark:text-coopmathsdark-action"
                      on:click={() => adjustCardScale(widget.num, 1)}
                    >
                      <i class="bx bx-plus text-sm"></i>
                    </button>
                  </div>
                {/each}
              </div>{/if}{#if isCompiling}<i
                class="bx bx-loader-alt bx-spin absolute top-6 right-6 text-2xl"
              ></i>{/if}
          </div>
        {/if}
        {#if diagnostics.length > 0}<div
            class="max-h-40 overflow-y-auto px-4 py-2 text-sm font-mono bg-red-100 text-red-900"
          >
            {#each diagnostics as diagnostic}<p>{diagnostic}</p>{/each}
          </div>{/if}
      </div>
    </div>
  {/if}
</main>

<style>
  /* Le conteneur des pastilles et le SVG doivent avoir exactement la même
     largeur ; sinon les pourcentages issus du viewBox sont décalés. */
  .typst-preview :global(svg) {
    width: 100%;
    height: auto;
  }
</style>
