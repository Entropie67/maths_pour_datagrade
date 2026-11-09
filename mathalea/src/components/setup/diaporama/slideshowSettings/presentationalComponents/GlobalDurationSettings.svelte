<script lang="ts">
  import type { IExercice } from '../../../../../lib/types'
  import CheckboxWithLabel from '../../../../shared/forms/CheckboxWithLabel.svelte'
  import NumberInput from '../../../../shared/forms/InputNumber.svelte'

  export let exercises: IExercice[]
  export let isManualModeActive: boolean
  export let updateManualMode: (isManualModeActive: boolean) => void
  export let durationGlobal: number | undefined
  export let updateDurationGlobal: (durationGlobal: number | undefined) => void

  let previousDurationGlobal = durationGlobal || 10
  let isSameDurationForAll = !!durationGlobal
  function handleChangeIsSameDurationForAll(newIsSameDurationForAll: boolean) {
    isSameDurationForAll = newIsSameDurationForAll
    if (isSameDurationForAll) {
      updateDurationGlobal(previousDurationGlobal)
    } else {
      updateDurationGlobal(undefined)
    }
  }

  function updatePreviousDurationGlobal(newDurationGlobal: number) {
    previousDurationGlobal = newDurationGlobal
    updateDurationGlobal(newDurationGlobal)
  }
</script>

<div
  class="flex flex-col lg:flex-row px-4 pb-4 w-full
  justify-start lg:justify-between
  items-start lg:items-center"
>
  <div
    class="flex text-lg font-bold
    text-coopmaths-struct dark:text-coopmathsdark-struct"
  >
    Durées et nombres de questions
  </div>
  <div class="flex items-center">
    <CheckboxWithLabel
      id="slideshow-manual-mode-checkbox"
      isChecked={isManualModeActive}
      label="Défilement manuel"
      on:change={(e) => {
        const isChecked = e.detail
        updateManualMode(isChecked)
      }}
    />
    <CheckboxWithLabel
      id="slideshow-same-duration-checkbox"
      isChecked={isSameDurationForAll}
      isDisabled={exercises.length === 1 || isManualModeActive}
      label="Même durée pour toutes les questions"
      on:change={(e) => {
        const isChecked = e.detail
        handleChangeIsSameDurationForAll(isChecked)
      }}
    />
    <NumberInput
      id="diaporama-same-duration-input"
      value={previousDurationGlobal}
      isDisabled={!isSameDurationForAll || isManualModeActive}
      on:change={(e) => {
        const previousDurationGlobal = e.detail
        updatePreviousDurationGlobal(previousDurationGlobal)
      }}
    />
  </div>
</div>
