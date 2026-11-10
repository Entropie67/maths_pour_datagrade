<script lang="ts">
  import type { IExercice } from '../../../../../lib/types'
  import CheckboxWithLabel from '../../../../shared/forms/CheckboxWithLabel.svelte'
  import NumberInput from '../../../../shared/forms/InputNumber.svelte'

  export let exercises: IExercice[]
  export let selectedExercisesIndexes: number[]
  export let applyRandomSelectionOfExercises: (
    numberOfSelectedExercises: number,
  ) => void

  const isSelectedExercises: boolean = selectedExercisesIndexes.length > 0
  let selectedExercisesCount: number = selectedExercisesIndexes.length
</script>

<div class="pb-6">
  <div
    class="flex text-lg font-bold mb-1
      {exercises.length === 1 ? 'text-coopmaths-struct/20 dark:text-coopmathsdark-struct/20' : 'text-coopmaths-struct dark:text-coopmathsdark-struct'}"
  >
    Sélection aléatoire d'exercices
  </div>
  <CheckboxWithLabel
    id="slideshow-selected-exercises-checkbox"
    isChecked={isSelectedExercises}
    isDisabled={exercises.length === 1}
    label="Seulement certains exercices de la liste"
    on:change={(e) => {
      const isChecked = e.detail
      selectedExercisesCount = isChecked ? exercises.length - 1 : 0
      applyRandomSelectionOfExercises(selectedExercisesCount)
    }}
  />
  <div class="pl-8 mt-1 flex">
    <NumberInput
      id="slideshow-selected-exercises-count-input"
      max={exercises.length - 1}
      value={selectedExercisesCount}
      isDisabled={!selectedExercisesCount}
      on:change={(e) => {
        const selectedExercisesCount = e.detail
        applyRandomSelectionOfExercises(selectedExercisesCount)
      }}
    />
    <span
      class="ml-2 my-auto
        {selectedExercisesCount
        ? 'text-coopmaths-corpus dark:text-coopmathsdark-corpus'
        : 'text-coopmaths-corpus/10 dark:text-coopmathsdark-corpus/10'}"
    >
      parmi {exercises.length}
    </span>
  </div>
</div>
