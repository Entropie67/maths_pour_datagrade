<script lang="ts">
  import { tick } from 'svelte'
  import {
    dismissable,
    popoverPosition,
    portalToMain,
  } from '../../../lib/components/tbiPopup'
  import { tbiControlsVisible, tbiWriting } from '../../../lib/tbiControls'
  import TbiMathText from './TbiMathText.svelte'
  import type { TbiCorrectionDetail, TbiCorrectionMode } from './tbiTypes'
  import {
    tbiButton,
    tbiMenuLabel,
    tbiMenuRow,
    tbiPanel,
    tbiSegment,
    tbiSegmentButton,
  } from './tbiUi'

  /**
   * Commandes d'une carte, dans sa marge gauche : elles ne recouvrent jamais
   * l'énoncé et tiennent dans une carte étroite. Le rail porte la boucle de la
   * classe (correction, nouvelles données) ; le reste est rangé dans un panneau
   * aux lignes libellées, qui s'ouvre à côté du bouton sans sortir de l'écran.
   */
  interface Props {
    number: number
    /** Correction disponible et état de l'affichage */
    hasCorrection?: boolean
    isCorrectionShown?: boolean
    onToggleCorrection?: () => void
    /** Mode retenu pour le bouton de correction */
    correctionMode?: Exclude<TbiCorrectionMode, 'hidden'>
    correctionModes?: {
      value: Exclude<TbiCorrectionMode, 'hidden'>
      label: string
    }[]
    onCorrectionMode?: (mode: Exclude<TbiCorrectionMode, 'hidden'>) => void
    correctionDetail?: TbiCorrectionDetail
    /** Absent : pas de correction minimale (image scannée) */
    onCorrectionDetail?: (detail: TbiCorrectionDetail) => void
    newDataExists?: boolean
    onNewData?: () => void
    /** Absent : le nombre de questions n'est pas modifiable */
    nbQuestions?: number
    onNbQuestions?: (nbQuestions: number) => void
    settingsExist?: boolean
    onSettings?: () => void
    interactifReady?: boolean
    isInteractif?: boolean
    onToggleInteractif?: () => void
    zoom: number
    onZoomIn: () => void
    onZoomOut: () => void
    /** Absent : pas de colonnes de questions (image scannée) */
    cols?: number
    onCols?: (cols: number) => void
    questionSpacing?: number
    onQuestionSpacing?: (spacing: number) => void
    /** Replier la carte (disposition libre) */
    onCollapse?: () => void
    /** Onglets vers lesquels déplacer l'exercice */
    moveTargets?: { value: number | string; label: string }[]
    onMoveTo?: (value: number | string) => void
    onDelete?: () => void
  }

  let {
    number,
    hasCorrection = false,
    isCorrectionShown = false,
    onToggleCorrection,
    correctionMode = 'below',
    correctionModes = [],
    onCorrectionMode,
    correctionDetail = 'full',
    onCorrectionDetail,
    newDataExists = false,
    onNewData,
    nbQuestions,
    onNbQuestions,
    settingsExist = false,
    onSettings,
    interactifReady = false,
    isInteractif = false,
    onToggleInteractif,
    zoom,
    onZoomIn,
    onZoomOut,
    cols,
    onCols,
    questionSpacing,
    onQuestionSpacing,
    onCollapse,
    moveTargets = [],
    onMoveTo,
    onDelete,
  }: Props = $props()

  let isOpen = $state(false)
  let moreButton: HTMLButtonElement | undefined = $state()
  let panel: HTMLElement | undefined = $state()
  let position = $state({ left: 0, top: 0 })

  async function toggle() {
    isOpen = !isOpen
    if (!isOpen) return
    await tick()
    place()
  }

  function place() {
    if (!moreButton || !panel) return
    const anchor = moreButton.getBoundingClientRect()
    const size = panel.getBoundingClientRect()
    position = popoverPosition(
      { left: anchor.left, right: anchor.right, top: anchor.top - 96 },
      { width: size.width, height: size.height },
      { width: window.innerWidth, height: window.innerHeight },
    )
  }

  function run(action?: () => void) {
    isOpen = false
    action?.()
  }

  const NB_QUESTIONS_MAX = 100

  /** Une saisie vide ou invalide rend la valeur en cours, comme une valeur hors bornes */
  function commitNbQuestions(input: HTMLInputElement) {
    const typed = Number.parseInt(input.value, 10)
    const next = Number.isNaN(typed)
      ? nbQuestions
      : Math.min(NB_QUESTIONS_MAX, Math.max(1, typed))
    input.value = String(next)
    if (next !== undefined && next !== nbQuestions) onNbQuestions?.(next)
  }

  const railClass = $derived(
    `absolute left-1 top-14 z-20 flex flex-col gap-1 transition-opacity duration-200 ${
      $tbiControlsVisible && !$tbiWriting
        ? 'opacity-100'
        : 'opacity-0 pointer-events-none'
    }`,
  )
  const railButton = (active = false) =>
    `${tbiButton(active, 'text-2xl')} ${active ? '' : 'bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark hover:!bg-coopmaths-canvas-darkest dark:hover:!bg-coopmathsdark-canvas-darkest'}`
</script>

<div data-tbi-chrome class={railClass}>
  {#if hasCorrection}
    <button
      type="button"
      class={railButton(isCorrectionShown)}
      title={isCorrectionShown
        ? 'Masquer la correction'
        : 'Afficher la correction'}
      aria-label={isCorrectionShown
        ? `Masquer la correction de l'exercice ${number}`
        : `Afficher la correction de l'exercice ${number}`}
      aria-pressed={isCorrectionShown}
      onclick={onToggleCorrection}
    >
      <i class="bx {isCorrectionShown ? 'bx-hide' : 'bx-show'}"></i>
    </button>
  {/if}
  {#if newDataExists}
    <button
      type="button"
      class={railButton()}
      title="Nouvelles données"
      aria-label={`Nouvelles données pour l'exercice ${number}`}
      onclick={onNewData}
    >
      <i class="bx bx-refresh"></i>
    </button>
  {/if}
  <button
    bind:this={moreButton}
    type="button"
    class={railButton(isOpen)}
    title="Plus d'options"
    aria-label={`Plus d'options pour l'exercice ${number}`}
    aria-expanded={isOpen}
    onclick={toggle}
  >
    <i class="bx bx-dots-horizontal-rounded"></i>
  </button>
</div>

{#if isOpen}
  <div
    bind:this={panel}
    use:portalToMain
    use:dismissable={{
      onDismiss: () => (isOpen = false),
      ignore: () => [moreButton],
    }}
    data-tbi-chrome
    data-tbi-panel
    role="dialog"
    aria-label={`Options de l'exercice ${number}`}
    class="{tbiPanel} fixed z-[55] w-[26rem] max-w-[calc(100vw-1rem)] max-h-[calc(100vh-6rem)] overflow-y-auto p-2"
    style:left="{position.left}px"
    style:top="{position.top}px"
  >
    {#if hasCorrection}
      <div class={tbiMenuLabel}>Correction</div>
      <div class="flex flex-col gap-2 px-3 pb-2">
        <div
          class="{tbiSegment} flex-wrap self-start"
          aria-label="Affichage de la correction"
        >
          {#each correctionModes as mode (mode.value)}
            <button
              type="button"
              class={tbiSegmentButton(correctionMode === mode.value)}
              aria-pressed={correctionMode === mode.value}
              onclick={() => onCorrectionMode?.(mode.value)}
            >
              {mode.label}
            </button>
          {/each}
        </div>
        {#if onCorrectionDetail}
          <div
            class="{tbiSegment} self-start"
            aria-label="Détail de la correction"
          >
            <button
              type="button"
              class={tbiSegmentButton(correctionDetail === 'full')}
              aria-pressed={correctionDetail === 'full'}
              title="Afficher la correction entière"
              onclick={() => onCorrectionDetail?.('full')}
            >
              Complète
            </button>
            <button
              type="button"
              class={tbiSegmentButton(correctionDetail === 'minimal')}
              aria-pressed={correctionDetail === 'minimal'}
              title="Quand une correction met sa réponse en évidence, n'afficher que cette réponse"
              onclick={() => onCorrectionDetail?.('minimal')}
            >
              Minimale
            </button>
          </div>
        {/if}
      </div>
    {/if}

    <div class={tbiMenuLabel}>Exercice</div>
    {#if nbQuestions !== undefined}
      <div class="{tbiMenuRow} hover:!bg-transparent">
        <label for="tbi-nb-questions-{number}">Nombre de questions</label>
        <span class="flex items-center gap-1">
          <button
            type="button"
            class={tbiButton(false, 'text-2xl')}
            aria-label="Retirer une question"
            disabled={nbQuestions <= 1}
            onclick={() => onNbQuestions?.(nbQuestions - 1)}
          >
            <i class="bx bx-minus"></i>
          </button>
          <input
            id="tbi-nb-questions-{number}"
            type="number"
            inputmode="numeric"
            min="1"
            max={NB_QUESTIONS_MAX}
            value={nbQuestions}
            class="w-16 h-12 rounded-lg border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark text-center text-lg font-bold tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            onchange={(event) => commitNbQuestions(event.currentTarget)}
            onkeydown={(event) => {
              if (event.key === 'Enter') event.currentTarget.blur()
            }}
          />
          <button
            type="button"
            class={tbiButton(false, 'text-2xl')}
            aria-label="Ajouter une question"
            disabled={nbQuestions >= NB_QUESTIONS_MAX}
            onclick={() => onNbQuestions?.(nbQuestions + 1)}
          >
            <i class="bx bx-plus"></i>
          </button>
        </span>
      </div>
    {/if}
    {#if settingsExist}
      <button type="button" class={tbiMenuRow} onclick={() => run(onSettings)}>
        Paramètres…
        <i class="bx bx-slider text-2xl"></i>
      </button>
    {/if}
    {#if interactifReady}
      <button
        type="button"
        class={tbiMenuRow}
        aria-pressed={isInteractif}
        onclick={() => run(onToggleInteractif)}
      >
        {isInteractif ? 'Revenir à la version projetée' : 'Version interactive'}
        <i class="bx {isInteractif ? 'bx-file' : 'bx-laptop'} text-2xl"></i>
      </button>
    {/if}
    <div class="{tbiMenuRow} hover:!bg-transparent">
      Taille
      <span class="flex items-center gap-1">
        <button
          type="button"
          class={tbiButton(false, 'text-xl')}
          aria-label="Réduire le texte de l'exercice"
          onclick={onZoomOut}
        >
          A−
        </button>
        <span class="w-16 text-center tabular-nums" aria-live="polite"
          >{Math.round(zoom * 100)}&nbsp;%</span
        >
        <button
          type="button"
          class={tbiButton(false, 'text-xl')}
          aria-label="Agrandir le texte de l'exercice"
          onclick={onZoomIn}
        >
          A+
        </button>
      </span>
    </div>
    {#if cols !== undefined}
      <div class="{tbiMenuRow} hover:!bg-transparent">
        Colonnes de l'exercice
        <span class={tbiSegment}>
          {#each [1, 2, 3, 4] as n (n)}
            <button
              type="button"
              class={tbiSegmentButton(cols === n)}
              aria-pressed={cols === n}
              aria-label="{n} colonne{n > 1 ? 's' : ''} de questions"
              onclick={() => onCols?.(n)}
            >
              {n}
            </button>
          {/each}
        </span>
      </div>
    {/if}
    {#if questionSpacing !== undefined}
      <div class="{tbiMenuRow} hover:!bg-transparent">
        Espacement
        <span class="flex items-center gap-1">
          <button
            type="button"
            class={tbiButton(false, 'text-2xl')}
            aria-label="Réduire l'espace entre les questions"
            disabled={questionSpacing <= 0}
            onclick={() => onQuestionSpacing?.(questionSpacing - 1)}
          >
            <i class="bx bx-minus"></i>
          </button>
          <span class="w-8 text-center tabular-nums">{questionSpacing}</span>
          <button
            type="button"
            class={tbiButton(false, 'text-2xl')}
            aria-label="Augmenter l'espace entre les questions"
            onclick={() => onQuestionSpacing?.(questionSpacing + 1)}
          >
            <i class="bx bx-plus"></i>
          </button>
        </span>
      </div>
    {/if}
    {#if onCollapse}
      <button type="button" class={tbiMenuRow} onclick={() => run(onCollapse)}>
        Replier l'exercice
        <i class="bx bx-chevron-up text-2xl"></i>
      </button>
    {/if}

    {#if moveTargets.length > 0}
      <div class={tbiMenuLabel}>Déplacer vers</div>
      {#each moveTargets as target (target.value)}
        <button
          type="button"
          class={tbiMenuRow}
          onclick={() => run(() => onMoveTo?.(target.value))}
        >
          <TbiMathText class="truncate" text={target.label} />
        </button>
      {/each}
    {/if}

    {#if onDelete}
      <div
        class="h-px my-1 bg-coopmaths-canvas-darkest dark:bg-coopmathsdark-canvas-darkest"
      ></div>
      <button
        type="button"
        class="{tbiMenuRow} text-red-700 dark:text-red-400"
        onclick={() => run(onDelete)}
      >
        Supprimer l'exercice
        <i class="bx bx-trash text-2xl"></i>
      </button>
    {/if}
  </div>
{/if}
