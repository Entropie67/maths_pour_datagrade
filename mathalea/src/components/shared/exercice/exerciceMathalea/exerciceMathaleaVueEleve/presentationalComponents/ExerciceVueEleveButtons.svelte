<script lang="ts">
  import type { InterfaceGlobalOptions } from '../../../../../../lib/types'
  import type TypeExercice from '../../../../../../exercices/Exercice'
  import ButtonTextAction from '../../../../forms/ButtonTextAction.svelte'
  import BasicClassicModal from '../../../../modal/BasicClassicModal.svelte'
  import BugReportModal from '../../../shared/BugReportModal.svelte'
  export let exercise: TypeExercice

  let isIndiceModalDisplayed = false
  let isBugReportDisplayed = false
  export let indiceLastExercice: number
  export let globalOptions: InterfaceGlobalOptions
  export let newData: () => void
  export let isCorrectionVisible: boolean
  export let switchCorrectionVisible: () => void
  export let isInteractif: boolean
  export let switchInteractif: () => void
  export let columnsCount: number
  export let columnsCountUpdate: (plusMinus: '+' | '-') => void
  export let showCorrectionButton: boolean = true
  export let showInteractivityButton: boolean = true
  export let showNewDataButton: boolean = true
  export let showStepCorrectionButton = false
  export let correctionProgressionComplete = false
  export let showNextCorrection: () => void = () => {}
</script>

<div
  class="flex flex-row flex-wrap gap-y-2 justify-start items-center {indiceLastExercice >
    1 && globalOptions.presMode !== 'un_exo_par_page'
    ? 'ml-2 lg:ml-6'
    : 'ml-2'} mb-1 lg:mb-2 {globalOptions.presMode === 'recto' ||
  globalOptions.presMode === 'verso'
    ? 'hidden'
    : 'flex'}"
>
  {#if exercise.tip && exercise.tip.length > 0 && exercise.tipAvailable !== false}
    <div class="flex mr-2">
      <ButtonTextAction
        text="Indice"
        icon="bx-help-circle"
        class="py-0.5 px-2 text-[0.7rem]"
        inverted={false}
        on:click={() => {
          isIndiceModalDisplayed = true
        }}
      />
    </div>
    <BasicClassicModal
      bind:isDisplayed={isIndiceModalDisplayed}
      icon="bx-help-circle"
    >
      <span slot="header">Indice</span>
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      <div slot="content" class="text-left">{@html exercise.tip}</div>
    </BasicClassicModal>
  {/if}
  <div
    class={showNewDataButton &&
    !globalOptions.oneShot &&
    globalOptions.done !== '1'
      ? 'flex'
      : 'hidden'}
  >
    <ButtonTextAction
      text="Nouvel Énoncé"
      icon="bx-refresh"
      class="py-[2px] px-2 text-[0.7rem]"
      inverted={true}
      on:click={() => {
        newData()
      }}
    />
  </div>
  {#if showStepCorrectionButton}
    <div class="flex ml-2 shrink-0">
      <ButtonTextAction
        text="Correction pas à pas"
        title="Dévoiler la correction suivante"
        icon="bx-skip-next"
        class="py-[2px] px-2 text-[0.7rem] whitespace-nowrap"
        inverted={true}
        disabled={correctionProgressionComplete}
        on:click={showNextCorrection}
      />
    </div>
  {/if}
  {#if showCorrectionButton}
    <div
      class={globalOptions.isSolutionAccessible &&
      !exercise.isDone &&
      ((exercise.interactif && exercise.isDone) || !exercise.interactif)
        ? 'flex ml-2'
        : 'hidden'}
    >
      <ButtonTextAction
        text={isCorrectionVisible
          ? 'Masquer la correction'
          : 'Voir la correction'}
        icon={isCorrectionVisible ? 'bx-hide' : 'bx-show'}
        class="py-[2px] px-2 text-[0.7rem] w-36"
        inverted={true}
        on:click={switchCorrectionVisible}
      />
    </div>
  {/if}
  {#if showInteractivityButton && !exercise.interactifObligatoire}
    <div
      class={globalOptions.isInteractiveFree && exercise?.interactifReady
        ? 'flex ml-2'
        : 'hidden'}
    >
      <ButtonTextAction
        text={isInteractif ? "Désactiver l'interactivité" : 'Rendre interactif'}
        icon={isInteractif ? 'bx-toggle-right' : 'bx-toggle-left'}
        class="py-[2px] px-2 text-[0.7rem]"
        inverted={true}
        on:click={switchInteractif}
      />
    </div>
  {/if}
  <!-- juste avant le réglage du nombre de colonnes -->
  <button
    class="flex items-center ml-2"
    type="button"
    title="Signaler un problème dans cet exercice"
    aria-label="Signaler un problème dans cet exercice"
    on:click={() => {
      isBugReportDisplayed = true
    }}
  >
    <i
      class="text-coopmaths-action hover:text-coopmaths-action-darkest dark:text-coopmathsdark-action dark:hover:text-coopmathsdark-action-darkest bx bx-bug text-base"
    ></i>
  </button>
  {#if isBugReportDisplayed}
    <BugReportModal
      bind:isDisplayed={isBugReportDisplayed}
      exerciceId={exercise.id}
      exerciceTitle={exercise.titre}
      exerciceIndex={exercise.numeroExercice}
    />
  {/if}
  {#if globalOptions.recorder === undefined}
    <div
      class="hidden md:flex flex-row justify-start items-center text-coopmaths-struct dark:text-coopmathsdark-struct text-xs"
    >
      <button
        class={columnsCount > 1 && window.innerWidth > 1000
          ? 'visible'
          : 'invisible'}
        type="button"
        aria-label="Réduire le nombre de colonnes"
        on:click={() => columnsCountUpdate('-')}
      >
        <i
          class="text-coopmaths-action hover:text-coopmaths-action-darkest dark:text-coopmathsdark-action dark:hover:text-coopmathsdark-action-darkest bx ml-2 bx-xs bx-minus"
        ></i>
      </button>
      <i class="bx ml-1 bx-xs bx-columns"></i>
      <button
        type="button"
        aria-label="Augmenter le nombre de colonnes"
        on:click={() => columnsCountUpdate('+')}
      >
        <i
          class="text-coopmaths-action hover:text-coopmaths-action-darkest dark:text-coopmathsdark-action dark:hover:text-coopmathsdark-action-darkest bx ml-1 bx-xs bx-plus"
        ></i>
      </button>
    </div>
  {/if}
</div>
