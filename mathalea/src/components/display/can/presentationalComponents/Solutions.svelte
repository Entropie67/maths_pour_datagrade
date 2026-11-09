<!--
  @component
  Vue des corrections d'une Course aux nombres.

  Deux modes (store `canOptions.solutionsMode`) :
  - `split` : une question par écran avec navigation ;
  - `gathered` : toutes les questions sur une même page (capture d'écran facile).

  En mode interactif, on affiche aussi ce que l'élève avait répondu
  (« Réponse donnée : ... »). Le formatage des réponses et le nettoyage du HTML
  des questions sont délégués à `src/lib/components/canSolutions.ts` : c'est
  là-bas (et dans les hooks statiques des customElements) qu'il faut intervenir
  pour gérer un nouveau type d'interactivité, pas ici.
-->
<script lang="ts">
  import { afterUpdate, onMount } from 'svelte'
  import {
    formatStudentAnswer,
    stripInteractiveWidgets,
  } from '../../../../lib/components/canSolutions'
  import { mathaleaRenderDiv } from '../../../../lib/mathalea'
  import { canOptions } from '../../../../lib/stores/canStore'
  import type { QuestionResult } from '../../../../lib/types'
  import ButtonToggle from '../../../shared/forms/ButtonToggle.svelte'
  import NavigationButtons from './NavigationButtons.svelte'
  import Pagination from './Pagination.svelte'
  import Question from './Question.svelte'

  let current: number = 0
  export let questions: string[]
  export let consignes: string[]
  export let corrections: string[]
  export let consignesCorrections: string[]
  export let answers: string[]
  export let resultsByQuestion: QuestionResult[]
  export let time: string
  export let score: string
  const numberOfQuestions: number = questions.length
  // En mode « correction uniquement des mauvaises réponses », les corrections
  // des bonnes réponses sont masquées mais restent affichables une à une.
  const solutionDisplayed: boolean[] = new Array(numberOfQuestions).fill(false)

  let displayCorrection = true

  onMount(() => {
    const questionContent = document.getElementById(
      'can-solutions',
    ) as HTMLDivElement
    if (questionContent) {
      mathaleaRenderDiv(questionContent)
    }
  })

  afterUpdate(() => {
    const answersContents = document.querySelectorAll(
      '[id^="answer-container"]',
    )
    for (let i = 0; i < answersContents.length; i++) {
      const content = answersContents[i] as HTMLDivElement
      mathaleaRenderDiv(content)
    }
  })

  // La correction de la question i est masquée si elle est juste et que le
  // mode « correction uniquement des mauvaises réponses » est actif, sauf si
  // elle a été dépliée à la main (solutionDisplayed). Calculé de façon
  // réactive : une fonction appelée dans le template ne serait pas
  // réinvalidée par un clic sur le bouton.
  let correctionHidden: boolean[] = []
  $: correctionHidden = questions.map(
    (_question, i) =>
      !solutionDisplayed[i] &&
      Boolean(resultsByQuestion[i]) &&
      displayCorrection,
  )
</script>

<div
  class="w-full h-full flex flex-col items-center bg-coopmaths-canvas dark:bg-coopmathsdark-canvas
   {$canOptions.solutionsMode === 'split'
    ? 'justify-between'
    : 'justify-start'}"
>
  {#if $canOptions.solutionsMode === 'split'}
    <div class="w-full flex flex-col">
      <Pagination
        bind:current
        {numberOfQuestions}
        {resultsByQuestion}
        state={'solutions'}
      />
    </div>
    <div
      class="flex flex-col justify-center items-center font-light text-coopmaths-corpus dark:text-coopmathsdark-corpus text-3xl md:text-5xl"
    >
      {#key current}
        <Question
          consigne={consignes[current]}
          question={questions[current]}
          consigneCorrection={consignesCorrections[current]}
          correction={corrections[current]}
          mode={'correction'}
          visible={true}
          index={current}
        />
        {#if $canOptions.isInteractive}
          <div
            id="answer-container-{current}"
            class="text-2xl text-coopmaths-corpus dark:text-coopmathsdark-corpus font-light py-2 md:py-4"
          >
            Réponse donnée&nbsp;:&nbsp;
            <span
              id="answer-{current}"
              class="text-coopmaths-warn-800 dark:text-coopmathsdark-warn font-medium"
            >
              {@html formatStudentAnswer(questions[current], answers[current])}
            </span>
          </div>
        {/if}
      {/key}
    </div>
    <NavigationButtons
      bind:current
      {numberOfQuestions}
      state={'solutions'}
      {resultsByQuestion}
      handleEndOfRace={() => {}}
    />
  {/if}
  {#if $canOptions.solutionsMode === 'gathered'}
    <div
      class="w-full flex justify-center items-center p-6 bg-coopmaths-struct text-coopmaths-canvas dark:bg-coopmathsdark-struct dark:text-coopmathsdark-canvas text-5xl md:text-7xl font-black"
    >
      Corrections
    </div>
    <div
      class="w-full grid grid-rows-3 md:grid-cols-3 py-4 px-4 md:px-10 mb-10"
    >
      {#if $canOptions.isInteractive}
        <div
          id="score"
          class="text-normal text-center text-coopmaths-corpus dark:text-coopmathsdark-corpus font-light"
        >
          Score : <span
            class="text-coopmaths-warn-1000 dark:text-coopmathsdark-warn font-bold"
            >{score}</span
          >
        </div>
      {/if}
      <div
        id="time"
        class="text-normal text-center text-coopmaths-corpus dark:text-coopmathsdark-corpus font-light"
      >
        Temps : <span
          class="text-coopmaths-warn-1000 dark:text-coopmathsdark-warn font-bold"
          >{time}</span
        >
      </div>
      <div class="flex justify-center text-center">
        <ButtonToggle
          bind:value={displayCorrection}
          titles={[
            'Correction uniquement des mauvaises réponses',
            'Correction de toutes les questions',
          ]}
        />
      </div>
    </div>
    <ol
      class="w-full list-none list-inside text-base flex flex-row flex-wrap p-4 md:p-10 bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
      id="can-solutions"
    >
      {#each [...Array(numberOfQuestions).keys()] as i}
        <li class="break-inside-avoid-column mx-2 min-w-[32%]">
          <div class="flex flex-row items-center justify-start">
            <div
              class="text-lg text-coopmaths-struct dark:text-coopmathsdark-struct font-bold"
            >
              Question {i + 1}
            </div>
            <div class={$canOptions.isInteractive ? 'flex text-xl' : 'hidden'}>
              {#if resultsByQuestion[i]}
                <button
                  type="button"
                  aria-label="Afficher la correction"
                  on:click={() => {
                    solutionDisplayed[i] = !solutionDisplayed[i]
                  }}
                >
                  <i
                    class="pl-2 bx bxs-check-square text-coopmaths-warn-800 dark:text-green-500"
                  ></i>
                </button>
              {:else}
                <i
                  class="pl-2 bx bxs-x-square text-red-500 dark:text-coopmathsdark-warn"
                ></i>
              {/if}
            </div>
          </div>
          <div class="flex flex-col">
            <div
              class="p-2 text-pretty text-coopmaths-corpus dark:text-coopmathsdark-corpus"
              hidden={correctionHidden[i]}
            >
              <!-- eslint-disable-next-line svelte/no-at-html-tags -->
              {@html stripInteractiveWidgets(questions[i])}
            </div>
            <div
              class="p-2 text-pretty bg-coopmaths-warn-200 dark:bg-coopmathsdark-warn-lightest text-coopmaths-corpus dark:text-coopmathsdark-corpus-darkest"
              hidden={correctionHidden[i]}
            >
              <!-- eslint-disable-next-line svelte/no-at-html-tags -->
              {@html consignesCorrections[i]}
              <!-- eslint-disable-next-line svelte/no-at-html-tags -->
              {@html corrections[i]}
            </div>
            <div
              id="answer-container-{i}"
              class="{$canOptions.isInteractive &&
              (!resultsByQuestion[i] || !displayCorrection)
                ? 'flex text-coopmaths-corpus dark:text-coopmathsdark-corpus font-light py-2 md:py-4'
                : 'hidden'} "
            >
              Réponse donnée&nbsp;:&nbsp;
              <span
                id="answer-{i}"
                class="text-coopmaths-warn-1000 dark:text-coopmathsdark-warn font-medium"
              >
                {@html formatStudentAnswer(questions[i], answers[i])}
              </span>
            </div>
          </div>
        </li>
      {/each}
    </ol>
  {/if}
</div>
