<script lang="ts">
  import {
    activeTbiModalCard,
    TBI_MAX_ZOOM,
    TBI_MIN_ZOOM,
    chooseTbiCardCorrectionMode,
    setTbiCardCorrectionMode,
    tbiCardLastCorrectionMode,
    tbiCardNumber,
    tbiState,
    toggleTbiCardCorrection,
    stepTbiCardsZoom,
  } from '../../../lib/stores/tbiStore'
  import { fitZoom } from '../../../lib/components/tbiFit'
  import TbiCardRail from './TbiCardRail.svelte'
  import { tbiButton } from './tbiUi'
  import type { TbiStaticContent } from './tbiTypes'

  /**
   * Modes d'affichage de la correction d'une ressource statique. Sous-ensemble
   * de ceux d'un exercice rejouable : « après chaque question » et « minimale »
   * n'ont pas de sens pour une image scannée.
   */
  type StaticCorrectionMode = 'hidden' | 'below' | 'replace' | 'modal'

  interface Props {
    content: TbiStaticContent
    paramsIndex: number
    /** Onglets vers lesquels déplacer l'exercice */
    moveTargets?: { value: number | string; label: string }[]
    onMoveTo?: (paramsIndex: number, value: number | string) => void
    /** Replier la carte (disposition libre) */
    onCollapse?: (paramsIndex: number) => void
    /** Demande de suppression, traitée par la vue TBI */
    onDelete?: (paramsIndex: number) => void
  }

  let {
    content,
    paramsIndex,
    moveTargets = [],
    onMoveTo,
    onCollapse,
    onDelete,
  }: Props = $props()

  // Réglage porté par tbiState (partagé dans l'URL et la séance enregistrée).
  // « Après chaque question » n'existe pas pour une image : traité comme « sous l'énoncé ».
  let correctionMode: StaticCorrectionMode = $derived.by(() => {
    const mode = $tbiState.cards[paramsIndex]?.correctionMode ?? 'hidden'
    return mode === 'perQuestion' ? 'below' : mode
  })
  /** Zoom propre à la correction en plein écran, indépendant du zoom de la carte */
  let modalZoom = $state(1.2)

  let zoom = $derived($tbiState.cards[paramsIndex]?.zoom ?? 1)
  let cardNumber = $derived(tbiCardNumber($tbiState, paramsIndex))
  let lastCorrectionMode = $derived.by(() => {
    const last = tbiCardLastCorrectionMode($tbiState.cards[paramsIndex])
    return last === 'perQuestion' ? 'below' : last
  })

  let hasCorrection = $derived(content.pngCor.length > 0)

  const CORRECTION_OPTIONS: {
    value: Exclude<StaticCorrectionMode, 'hidden'>
    label: string
  }[] = [
    { value: 'below', label: "Sous l'énoncé" },
    { value: 'replace', label: "À la place de l'énoncé" },
    { value: 'modal', label: 'Plein écran' },
  ]

  function setCorrectionMode(mode: StaticCorrectionMode) {
    setTbiCardCorrectionMode(paramsIndex, mode)
    if (mode === 'modal') modalZoom = Math.max(zoom, 1.2)
  }

  $effect(() => {
    if (correctionMode === 'modal' && $activeTbiModalCard !== paramsIndex) {
      setTbiCardCorrectionMode(paramsIndex, 'hidden')
    }
  })

  /** Correction en plein écran : sa taille remplit la fenêtre */
  let modalEl: HTMLDialogElement | undefined = $state()
  let modalContentEl: HTMLElement | undefined = $state()

  /** Les images doivent être chargées pour que leur hauteur soit connue */
  async function fitModal(content: HTMLElement) {
    await Promise.allSettled(
      [...content.querySelectorAll('img')].map((image) => image.decode()),
    )
    modalZoom = await fitZoom({
      start: modalZoom,
      bounds: { min: 0.4, max: TBI_MAX_ZOOM },
      apply: (next) => (modalZoom = next),
      measure: () => ({
        content: content.getBoundingClientRect().height,
        available: modalEl ? modalEl.clientHeight - content.offsetTop - 32 : 0,
      }),
    })
  }

  $effect(() => {
    if (correctionMode === 'modal' && modalContentEl) {
      void fitModal(modalContentEl)
    }
  })

  function zoomModalBy(delta: number) {
    modalZoom = Math.min(
      TBI_MAX_ZOOM,
      Math.max(TBI_MIN_ZOOM, modalZoom + delta),
    )
  }

  function openDialog(node: HTMLDialogElement) {
    node.showModal()
    return {
      destroy() {
        node.close()
      },
    }
  }

  let imageWidth = $derived(`min(100%, calc(850px * ${zoom}))`)
</script>

<section
  class="relative w-full min-h-52 rounded-lg border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest bg-coopmaths-canvas dark:bg-coopmathsdark-canvas shadow-sm"
  data-tbi-card-content
>
  <!--
    Vue TBI : on n'affiche pas le titre de la ressource, seulement son numéro
    (1-based) dans un rectangle bleuMathalea placé dans une marge à gauche,
    vers le haut de la carte (comme pour une carte d'exercice).
  -->
  <div
    class="absolute left-0 top-3 z-10 min-w-9 rounded-r-md bg-coopmaths-struct dark:bg-coopmathsdark-struct px-3 py-1.5 text-center text-lg font-bold leading-none text-coopmaths-canvas dark:text-coopmathsdark-canvas shadow"
    aria-label="Exercice numéro {cardNumber}"
  >
    {cardNumber}
  </div>

  <TbiCardRail
    number={cardNumber}
    {hasCorrection}
    isCorrectionShown={correctionMode !== 'hidden'}
    onToggleCorrection={() => toggleTbiCardCorrection(paramsIndex)}
    correctionMode={correctionMode === 'hidden'
      ? lastCorrectionMode
      : correctionMode}
    correctionModes={CORRECTION_OPTIONS}
    onCorrectionMode={(mode) => chooseTbiCardCorrectionMode(paramsIndex, mode)}
    {zoom}
    onZoomIn={() => stepTbiCardsZoom([paramsIndex], 1)}
    onZoomOut={() => stepTbiCardsZoom([paramsIndex], -1)}
    onCollapse={onCollapse ? () => onCollapse(paramsIndex) : undefined}
    {moveTargets}
    onMoveTo={(value) => onMoveTo?.(paramsIndex, value)}
    onDelete={onDelete ? () => onDelete(paramsIndex) : undefined}
  />

  <div class="pl-14 pr-3 pb-3 pt-3">
    {#if correctionMode !== 'replace'}
      {#each content.png as url, i (i)}
        <img
          src={url}
          class="mb-4 max-w-full"
          style="width: {imageWidth}"
          alt="énoncé"
        />
      {/each}
    {/if}

    {#if correctionMode === 'below' || correctionMode === 'replace'}
      <div
        class="relative border-l-coopmaths-struct dark:border-l-coopmathsdark-struct border-l-[3px] mt-6 mb-4 py-2 pl-4"
      >
        <div
          class="absolute flex flex-row py-[1.5px] px-3 rounded-t-md justify-center items-center -left-0.75 -top-3.75 bg-coopmaths-struct dark:bg-coopmathsdark-struct font-semibold text-xs text-coopmaths-canvas dark:text-coopmathsdark-canvas"
        >
          Correction
        </div>
        {#each content.pngCor as url, i (i)}
          <img
            src={url}
            class="mb-4 max-w-full"
            style="width: {imageWidth}"
            alt="correction"
          />
        {/each}
      </div>
    {/if}
  </div>

  {#if correctionMode === 'modal'}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <dialog
      bind:this={modalEl}
      class="m-0 w-screen h-screen max-w-none max-h-none p-6 overflow-y-auto
        text-coopmaths-corpus dark:text-coopmathsdark-corpus
        bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
      use:openDialog
      onclick={(event) => {
        if (event.target === event.currentTarget) setCorrectionMode('hidden')
      }}
      onclose={() => setCorrectionMode('hidden')}
    >
      <div class="flex flex-row flex-wrap items-center gap-2 mb-4 text-lg">
        <h2
          class="flex-1 text-2xl font-bold text-coopmaths-struct dark:text-coopmathsdark-struct"
        >
          Correction de l'exercice {cardNumber}
        </h2>
        <button
          type="button"
          class={tbiButton(false, 'text-xl')}
          title="Réduire"
          aria-label="Réduire la correction"
          onclick={() => zoomModalBy(-0.25)}
        >
          A−
        </button>
        <span class="w-20 text-center font-bold tabular-nums"
          >{Math.round(modalZoom * 100)}&nbsp;%</span
        >
        <button
          type="button"
          class={tbiButton(false, 'text-xl')}
          title="Agrandir"
          aria-label="Agrandir la correction"
          onclick={() => zoomModalBy(0.25)}
        >
          A+
        </button>
        <button
          type="button"
          class={tbiButton(false, '')}
          title="Fermer"
          aria-label="Fermer la correction"
          onclick={() => setCorrectionMode('hidden')}
        >
          <i class="bx bx-x text-3xl"></i>
        </button>
      </div>
      <div bind:this={modalContentEl} class="flex flex-col items-center">
        {#each content.pngCor as url, i (i)}
          <img
            src={url}
            class="mb-4 max-w-full"
            style="width: min(100%, calc(850px * {modalZoom}))"
            alt="correction"
          />
        {/each}
      </div>
    </dialog>
  {/if}
</section>
