<script lang="ts">
  import { onMount } from 'svelte'
  import Sortable from 'sortablejs'
  import NumberInput from '../../../shared/forms/InputNumber.svelte'
  import type { ExerciseQuizzCompatibility } from '../../../../lib/quizz/buildQuizz'
  import {
    QUIZZ_DEFAULT_TIME,
    QUIZZ_MAX_TIME,
    QUIZZ_MIN_TIME,
  } from '../../../../lib/quizz/quizzParams'

  export let report: ExerciseQuizzCompatibility[]
  export let times: number[]
  export let onTimeChange: (index: number, value: number) => void
  export let onRemove: (index: number) => void
  export let onEnableQcm: (index: number) => void
  export let onReorder: (oldIndex: number, newIndex: number) => void

  onMount(() => {
    const tbody = document.getElementById('quizz-exercises-list')
    if (tbody == null) return
    Sortable.create(tbody, {
      animation: 150,
      handle: '.quizz-drag-handle',
      // Sortable est écrit en JavaScript : le type d'evt n'est pas disponible.
      // @ts-ignore
      onEnd: (evt) => {
        onReorder(evt.oldIndex, evt.newIndex)
      },
    })
  })
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
          class="py-3.5 pl-2 pr-3 w-3/6
            text-left text-sm font-semibold
            text-coopmaths-struct dark:text-coopmathsdark-struct"
        >
          Exercices
          <span
            class="block font-light text-xs
            text-coopmaths-struct-light dark:text-coopmathsdark-struct-light"
          >
            Glisser-déposer pour réorganiser les questions
          </span>
        </th>
        <th
          scope="col"
          class="py-3.5 pl-4 pr-3 w-1/6
            text-center text-sm font-semibold
            text-coopmaths-struct dark:text-coopmathsdark-struct"
        >
          Compatibilité
        </th>
        <th
          scope="col"
          class="py-3.5 pl-4 pr-3 w-1/6
            text-center text-sm font-semibold
            text-coopmaths-struct dark:text-coopmathsdark-struct"
        >
          Temps de réponse (s)
        </th>
        <th class="w-10"></th>
      </tr>
    </thead>
    <tbody class="overflow-y-auto" id="quizz-exercises-list">
      {#each report as exercise, i (exercise.ref + '-' + i)}
        {@const incompatible = exercise.status === 'incompatible'}
        <tr>
          <!-- Le grisé ne concerne que le contenu non interactif :
               la poignée de déplacement et la corbeille restent pleinement
               visibles pour signifier qu'elles restent utilisables. -->
          <td
            class="whitespace-normal px-3 py-4 text-sm
            text-coopmaths-corpus dark:text-coopmathsdark-corpus"
          >
            <span
              class="quizz-drag-handle inline-block cursor-grab align-middle mr-2
              text-coopmaths-struct-light dark:text-coopmathsdark-struct-light"
              aria-label="Réorganiser l'exercice"
            >
              <i aria-hidden="true" class="bx bx-grid-vertical text-lg"></i>
            </span>
            <span class={incompatible ? 'opacity-50' : ''}>
              {exercise.ref} - {exercise.titre}
              {#if incompatible && exercise.reason}
                <div
                  class="pl-8 font-light text-xs italic
                  text-coopmaths-corpus/70 dark:text-coopmathsdark-corpus/70"
                >
                  {exercise.reason}
                </div>
              {/if}
            </span>
          </td>
          <td class="whitespace-normal px-3 py-4 text-sm text-center">
            {#if exercise.status === 'ok'}
              <span
                class="inline-block px-2 py-0.5 rounded-full text-xs font-semibold
                bg-coopmaths-warn-100 text-coopmaths-warn-darkest"
              >
                {exercise.keptQuestions.length} question{exercise.keptQuestions
                  .length > 1
                  ? 's'
                  : ''}
              </span>
            {:else if exercise.status === 'partial'}
              <span
                class="inline-block px-2 py-0.5 rounded-full text-xs font-semibold
                bg-coopmaths-action-100 text-coopmaths-action-darkest"
                title="{exercise.droppedCount} question(s) écartée(s) : plus de 4 propositions"
              >
                {exercise.keptQuestions.length} question{exercise.keptQuestions
                  .length > 1
                  ? 's'
                  : ''} ({exercise.droppedCount} écartée{exercise.droppedCount >
                1
                  ? 's'
                  : ''})
              </span>
            {:else if exercise.convertible}
              <button
                type="button"
                class="px-2 py-1 rounded-md text-xs font-semibold
                text-coopmaths-canvas bg-coopmaths-action
                hover:bg-coopmaths-action-lightest
                dark:bg-coopmathsdark-action dark:hover:bg-coopmathsdark-action-lightest
                dark:text-coopmathsdark-canvas"
                on:click={() => onEnableQcm(i)}
              >
                Activer la version QCM
              </button>
            {:else}
              <span
                class="inline-block px-2 py-0.5 rounded-full text-xs font-semibold
                bg-coopmaths-corpus/10 text-coopmaths-corpus/70
                dark:bg-coopmathsdark-corpus/10 dark:text-coopmathsdark-corpus/70"
              >
                Incompatible
              </span>
            {/if}
          </td>
          <td
            class="whitespace-normal px-3 py-4 text-sm {incompatible
              ? 'opacity-50'
              : ''}"
          >
            <NumberInput
              id="quizz-exo-time-{i}"
              min={QUIZZ_MIN_TIME}
              max={QUIZZ_MAX_TIME}
              value={times[i] ?? QUIZZ_DEFAULT_TIME}
              isDisabled={incompatible}
              on:change={(e) => {
                if (e.detail !== undefined) onTimeChange(i, e.detail)
              }}
            />
          </td>
          <td>
            <button
              class="mx-2 tooltip tooltip-left tooltip-neutral"
              data-tip="Supprimer l'exercice"
              type="button"
              aria-label="Supprimer l'exercice"
              on:click={() => onRemove(i)}
            >
              <i
                aria-hidden="true"
                class="text-coopmaths-action hover:text-coopmaths-action-lightest
                dark:text-coopmathsdark-action dark:hover:text-coopmathsdark-action-lightest bx bx-trash"
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
