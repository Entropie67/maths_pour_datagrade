<script lang="ts">
  import { formattedTimeStamp } from '../../../../../lib/components/time'
  import { exercicesParams } from '../../../../../lib/stores/generalStore'
  import type { IExercice } from '../../../../../lib/types'
  import {
    getShortAnswer,
    reponsesMisesEnEvidence,
  } from '../../../typst/minimalCorrection'
  import { extraitLettresQcm } from '../../answersTable'
  import NumberInput from '../../../../shared/forms/InputNumber.svelte'

  export let exercises: IExercice[]
  export let selectedExercisesIndexes: number[]
  export let isManualModeActive: boolean
  export let updateExercises: (updateSlidesContent?: boolean) => void
  export let durationGlobal: number | undefined
  export let remove: (exerciseIndex: number) => void
  let stringDureeTotale = '0'

  $: getTotalNbOfQuestions = () => {
    let sum = 0
    for (const [i, exercice] of exercises.entries()) {
      if (selectedExercisesIndexes.length > 0) {
        if (selectedExercisesIndexes.includes(i)) {
          sum += exercice.nbQuestions
        }
      } else {
        sum += exercice.nbQuestions
      }
    }
    return sum
  }

  $: if (exercises && exercises.length > 0) {
    stringDureeTotale = formattedTimeStamp(getTotalDuration())
  }

  function getTotalDuration() {
    let sum = 0
    for (const [i, exercice] of exercises.entries()) {
      if (
        selectedExercisesIndexes !== undefined &&
        selectedExercisesIndexes.length > 0
      ) {
        if (selectedExercisesIndexes.includes(i)) {
          sum +=
            (durationGlobal || exercice.duration || 10) * exercice.nbQuestions
        }
      } else {
        sum +=
          (durationGlobal || exercice.duration || 10) * exercice.nbQuestions
      }
    }
    return sum
  }

  function usesFullCorrection(exercise: IExercice): boolean {
    // Les exercices sont chargés avant leur premier tirage dans les réglages.
    if (exercise.listeCorrections.length === 0)
      return exercise.reponseCourteDisponible === false
    return exercise.listeCorrections.some((correction, i) => {
      if (!correction?.trim() || extraitLettresQcm(exercise, i).length > 0)
        return false
      const answer = getShortAnswer(exercise, i)
      return (
        answer === null ||
        (answer === undefined &&
          reponsesMisesEnEvidence(correction).length === 0)
      )
    })
  }

  function updateQuestionsNb(i: number, value: number) {
    exercises[i].nbQuestions = value
    exercicesParams.update((params) => {
      params[i].nbQuestions = value
      return params
    })
    updateExercises()
  }

  function updateDuration(i: number, value: number) {
    exercises[i].duration = value
    exercicesParams.update((params) => {
      params[i].duration = value
      return params
    })
    updateExercises()
  }
</script>

<div
  class="table-wrp block shadow ring-1 rounded-lg
  ring-opacity-10 dark:ring-opacity-20
  ring-coopmaths-struct dark:ring-coopmathsdark-struct"
>
  <table
    class="table-fixed min-w-full
    divide-y
    divide-opacity-10 dark:divide-opacity-20
    divide-coopmaths-struct dark:divide-coopmathsdark-struct"
  >
    <thead
      class="sticky top-0
      bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark"
    >
      <tr>
        <th
          scope="col"
          class="py-3.5 pl-4 pr-3 w-4/6
            text-left text-sm font-semibold
            text-coopmaths-struct dark:text-coopmathsdark-struct"
        >
          Exercices
          <span
            class="pl-1 font-light text-xs
            text-coopmaths-struct-light dark:text-coopmathsdark-struct-light
            {selectedExercisesIndexes.length > 0 ? '' : 'invisible'}"
          >
            ({selectedExercisesIndexes.length} parmi {exercises.length})
          </span>
        </th>
        <th
          scope="col"
          class="py-3.5 pl-4 pr-3 w-1/6
            text-center text-sm font-semibold
            text-coopmaths-struct dark:text-coopmathsdark-struct"
        >
          <div class={isManualModeActive ? 'opacity-20' : ''}>
            Durée par question
          </div>
          <div
            class="font-light text-xs
            text-coopmaths-struct-light dark:text-coopmathsdark-struct-light"
          >
            {#if !isManualModeActive}
              Durée diapo :<span class="font-light ml-1"
                >{stringDureeTotale}</span
              >
            {:else}
              <span class="font-light ml-1"></span>
            {/if}
          </div>
        </th>
        <th
          scope="col"
          class="py-3.5 pl-4 pr-3 w-1/6
            text-center text-sm font-semibold
            text-coopmaths-struct dark:text-coopmathsdark-struct"
        >
          <div>Nombres de questions</div>
          <div
            class="font-light text-xs
            text-coopmaths-struct-light dark:text-coopmathsdark-struct-light"
          >
            Total :<span class="font-light ml-1">{getTotalNbOfQuestions()}</span
            >
          </div>
        </th>
        <th></th>
      </tr>
    </thead>
    <tbody class="overflow-y-auto" id="exercisesList">
      {#each exercises as exercise, i (exercise.id + '-' + i)}
        <tr>
          <td
            class="whitespace-normal px-3 py-4 text-sm text-coopmaths-corpus dark:text-coopmathsdark-corpus"
          >
            <span
              class="{selectedExercisesIndexes.length > 0 &&
              selectedExercisesIndexes.length < exercises.length &&
              selectedExercisesIndexes.includes(i)
                ? ''
                : 'invisible'} pr-2"
            >
              <i
                aria-hidden="true"
                class="bx text-xs bxs-circle text-coopmaths-warn-lightest dark:text-coopmathsdark-warn-lightest"
              ></i>
            </span>
            {exercise.id} - {exercise.titre}
            {#if usesFullCorrection(exercise)}
              <p class="mt-1 text-xs opacity-75">
                Tableau des réponses : aperçu de la correction pour les
                questions sans réponse courte.
              </p>
            {/if}
          </td>
          <td class="whitespace-normal px-3 py-4 text-sm">
            <NumberInput
              id="diaporama-exo-duration-{i}"
              max={1000}
              value={exercise.duration || 10}
              isDisabled={!!durationGlobal || isManualModeActive}
              on:change={(e) => {
                const duration = e.detail
                updateDuration(i, duration)
              }}
            />
          </td>
          <td class="whitespace-normal px-3 py-4 text-sm">
            <NumberInput
              id="diaporama-exo-nb-questions-{i}"
              value={exercise.nbQuestions}
              isDisabled={exercise.nbQuestionsModifiable === false}
              on:change={(e) => {
                const nbQuestions = e.detail
                updateQuestionsNb(i, nbQuestions)
              }}
            />
          </td>
          <td>
            <button
              class="mx-2 tooltip tooltip-left tooltip-neutral"
              data-tip="Supprimer l'exercice"
              type="button"
              aria-label="Supprimer l'exercice"
              on:click={() => remove(i)}
            >
              <i
                aria-hidden="true"
                class="text-coopmaths-action hover:text-coopmaths-action-lightest dark:text-coopmathsdark-action dark:hover:text-coopmathsdark-action-lightest bx bx-trash"
              ></i>
            </button>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .table-wrp {
    max-height: 60%;
    overflow-y: auto;
    display: block;
  }
  thead {
    position: sticky;
    top: 0;
  }
</style>
