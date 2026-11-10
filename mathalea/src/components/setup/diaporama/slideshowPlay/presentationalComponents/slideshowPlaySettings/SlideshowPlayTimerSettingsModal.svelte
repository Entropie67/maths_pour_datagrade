<script lang="ts">
  import RangeSlider from '../../../../../shared/forms/RangeSlider.svelte'
  import BasicClassicModal from '../../../../../shared/modal/BasicClassicModal.svelte'

  export let handleTimerChange: (cursorTimeValue: number) => void
  export let isTimerSettingsModalDisplayed: boolean
</script>

<BasicClassicModal
  bind:isDisplayed={isTimerSettingsModalDisplayed}
  icon="bx-stopwatch"
>
  <h3
    slot="header"
    class="font-bold text-lg
    text-coopmaths-struc dark:text-coopmathsdark-struct"
  >
    <p>Temps par question</p>
  </h3>
  <div slot="content" class="flex flex-col justify-center items-center">
    <p
      class="
      text-coopmaths-corpus dark:text-coopmathsdark-corpus"
    >
      Régler la durée de projection en secondes
    </p>
    <div class="flex justify-center w-full md:w-3/4 xl:w-2/3">
      <RangeSlider
        on:change={(e) => {
          const cursorTimeValue = e.detail
          handleTimerChange(cursorTimeValue)
        }}
      />
    </div>
  </div>
</BasicClassicModal>
