<script lang="ts">
  import type TypeExercice from '../../../../../../exercices/Exercice'
  import { progressiveCorrection } from './progressiveCorrection'
  import {
    mathaleaRenderDiv,
    mathaleaFormatExercice,
  } from '../../../../../../lib/mathalea'

  export let exercise: TypeExercice
  export let exerciseIndex: number
  export let questionIndex: number
  export let isCorrectionVisible: boolean
  export let isQuestionCorrect: boolean | undefined = undefined
  export let hideCorrectionOnSuccess: boolean = false
  /** Vérification question par question : la question a son propre bouton « Vérifier » */
  export let isCheckable: boolean = false
  export let isChecked: boolean = false
  export let score:
    { nbBonnesReponses: number; nbReponses: number } | undefined = undefined
  export let onCheck: () => void = () => {}
  /** Bouton masqué (FlowMath sans bouton de validation) */
  export let isCheckButtonHidden: boolean = false

  export let isProgressiveCorrection: boolean = false
  export let onCorrectionReveal: () => void = () => {}

  $: questionHtml = mathaleaFormatExercice(
    exercise.listeQuestions[questionIndex],
  )
  $: displayedQuestion =
    isProgressiveCorrection && !isCorrectionVisible
      ? progressiveCorrection(
          questionHtml,
          mathaleaFormatExercice(
            exercise.listeCorrections[questionIndex] ?? '',
          ),
          exercise.consigneCorrection,
        )
      : questionHtml

  // Garder le HTML sous le contrôle de l'action : KaTeX réécrit les nœuds
  // texte et peut déplacer les bornes d'un bloc {@html} lors des bascules.
  function renderQuestion(node: HTMLElement, html: string) {
    let previous: string | undefined
    function update(content: string) {
      if (content === previous) return
      previous = content
      node.innerHTML = content
      mathaleaRenderDiv(node)
    }
    update(html)
    return { update }
  }

  function observeCorrections(node: HTMLElement) {
    function onToggle(event: Event) {
      const details = event.target
      if (
        details instanceof HTMLDetailsElement &&
        details.classList.contains('correction-progressive') &&
        details.open
      ) {
        mathaleaRenderDiv(details)
        onCorrectionReveal()
      }
    }
    node.addEventListener('toggle', onToggle, true)
    return {
      destroy: () => node.removeEventListener('toggle', onToggle, true),
    }
  }

  $: isCorrectionDisplayed =
    isCorrectionVisible &&
    !(hideCorrectionOnSuccess && isQuestionCorrect === true)
</script>

<div
  style="break-inside:avoid"
  id="consigne{exerciseIndex}-{questionIndex}"
  class="container max-w-full text-left grid grid-cols-1 auto-cols-min gap-4 mb-3 lg:mb-4"
>
  <li
    use:observeCorrections
    id="exercice{exerciseIndex}Q{questionIndex}"
    style="line-height: {exercise.spacing || 1}"
  >
    {#if exercise.questionRefs?.[questionIndex]}
      <span
        class="text-xs font-mono text-coopmaths-struct dark:text-coopmathsdark-struct mr-2"
        >{exercise.questionRefs[questionIndex]}</span
      ><br />
    {/if}
    <div class="contents" use:renderQuestion={displayedQuestion}></div>
    <!-- Bouton « Vérifier » et score de la question, à la suite du champ de
         réponse (sur la même ligne s'il y a de la place). Le conteneur est
         toujours présent et ignoré par KaTeX : l'auto-render remplacerait
         sinon les nœuds texte vides qui servent d'ancres aux blocs `{#if}`. -->
    <span class="katex-ignore">
      {#if isCheckable}
        {#if !isChecked}
          {#if !isCheckButtonHidden}
            <button
              type="button"
              id="buttonScoreEx{exerciseIndex}Q{questionIndex}"
              class="inline-flex items-center gap-1 ml-3 align-middle text-xs text-coopmaths-action dark:text-coopmathsdark-action hover:text-coopmaths-action-lightest dark:hover:text-coopmathsdark-action-lightest hover:underline underline-offset-2"
              on:click={onCheck}
            >
              <i class="bx bx-check-circle text-sm" aria-hidden="true"></i>
              Vérifier
            </button>
          {/if}
        {:else if score != null && score.nbReponses > 1}
          <!-- le smiley suffit pour une question sur 1 point -->
          <span
            id="scoreEx{exerciseIndex}Q{questionIndex}"
            class="ml-3 align-middle text-sm font-bold text-coopmaths-struct dark:text-coopmathsdark-struct"
            >Score : {score.nbBonnesReponses} / {score.nbReponses}</span
          >
        {/if}
        <!-- message « unité manquante » propre à la question -->
        <span id="alerteUniteEx{exerciseIndex}Q{questionIndex}" class="ml-3"
        ></span>
      {/if}
    </span>
  </li>
  {#if isCorrectionDisplayed}
    <div
      class="relative self-start border-l-coopmaths-struct dark:border-l-coopmathsdark-struct border-l-[3px] text-coopmaths-corpus dark:text-coopmathsdark-corpus mt-6 mb-4 lg:mb-0 ml-0 lg:ml-0 py-2 pl-4 lg:pl-6"
      id="correction-exo{exerciseIndex}Q{questionIndex}"
    >
      <div
        class={exercise.consigneCorrection.length !== 0
          ? 'container max-w-full text-justify bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark px-4 py-2 mr-2 ml-6 mb-2 font-light relative w-2/3'
          : 'hidden'}
      >
        <div
          class="{exercise.consigneCorrection.length !== 0
            ? 'container max-w-full text-justify absolute top-4 -left-4'
            : 'hidden'} "
        >
          <i
            class="bx bx-bulb scale-200 text-coopmaths-warn-dark dark:text-coopmathsdark-warn-dark"
          ></i>
        </div>
        <div class="">
          <!-- eslint-disable-next-line svelte/no-at-html-tags -->
          {@html exercise.consigneCorrection}
        </div>
      </div>
      <div
        class="container overflow-x-auto overflow-y-hidden md:overflow-x-auto py-1"
        style="line-height: {exercise.spacingCorr || 1}; break-inside:avoid"
      >
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html mathaleaFormatExercice(exercise.listeCorrections[questionIndex])}
      </div>
      <div
        class="absolute flex flex-row py-[1.5px] px-3 rounded-t-md justify-center items-center -left-0.75 -top-3.75 bg-coopmaths-struct dark:bg-coopmathsdark-struct font-semibold text-xs text-coopmaths-canvas dark:text-coopmathsdark-canvas"
      >
        Correction
      </div>
      <div
        class="absolute border-coopmaths-struct dark:border-coopmathsdark-struct bottom-0 left-0 border-b-[3px] w-4"
      ></div>
    </div>
  {/if}
</div>

<style>
  li {
    break-inside: avoid;
  }
</style>
