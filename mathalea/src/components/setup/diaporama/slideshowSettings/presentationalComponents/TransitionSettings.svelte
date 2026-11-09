<script lang="ts">
  import { isIntegerInRange0to3 } from '../../../../../lib/types/integerInRange'
  import CheckboxWithLabel from '../../../../shared/forms/CheckboxWithLabel.svelte'
  import FormRadio from '../../../../shared/forms/FormRadio.svelte'
  import NumberInput from '../../../../shared/forms/InputNumber.svelte'

  export let transitionSounds: {
    0: HTMLAudioElement
    1: HTMLAudioElement
    2: HTMLAudioElement
    3: HTMLAudioElement
  }
  export let screenBetweenSlides: boolean
  export let sound: 0 | 1 | 2 | 3 | 4
  export let updateFlow: (flow: 0 | 1 | 2) => void
  export let updateScreenBetweenSlides: (screenBetweenSlides: boolean) => void
  export let updateTune: (tune: -1 | 0 | 1 | 2 | 3) => void
  export let updatePauseAfterEachQuestion: (
    pauseAfterEachQuestion: boolean,
  ) => void
  export let questionThenCorrectionToggle: boolean
  export let questionWithCorrectionToggle: boolean
  export let pauseAfterEachQuestion: boolean
  export let isManualModeActive: boolean
  export let durationCorrection: number | undefined
  export let updateDurationCorrection: (
    durationCorrection: number | undefined,
  ) => void

  let previousDurationCorrection = durationCorrection || 10
  let isSpecificCorrectionDuration = !!durationCorrection
  function handleChangeIsSpecificCorrectionDuration(isSpecific: boolean) {
    isSpecificCorrectionDuration = isSpecific
    updateDurationCorrection(
      isSpecific ? previousDurationCorrection : undefined,
    )
  }

  const labelsForSounds = [
    { label: 'Son 1', value: 0 },
    { label: 'Son 2', value: 1 },
    { label: 'Son 3', value: 2 },
    { label: 'Son 4', value: 3 },
  ]

  let soundToggle = sound > 0
  $: soundToggle = sound > 0

  const tuneCandidate = Math.max(sound - 1, 0)
  let tune: 0 | 1 | 2 | 3 = isIntegerInRange0to3(tuneCandidate)
    ? tuneCandidate
    : 0
</script>

<div class="pb-8">
  <div
    class="flex text-lg font-bold mb-1
    text-coopmaths-struct dark:text-coopmathsdark-struct"
  >
    Transitions
  </div>
  <CheckboxWithLabel
    id="slideshow-transition-alternate-checkbox"
    isChecked={questionThenCorrectionToggle}
    label="Alterner questions et corrections"
    on:change={(e) => {
      const isChecked = e.detail
      updateFlow(isChecked ? 1 : 0)
    }}
  />
  <div class="ml-3">
    <CheckboxWithLabel
      id="slideshow-transition-with-question-checkbox"
      isChecked={questionWithCorrectionToggle}
      isDisabled={!questionThenCorrectionToggle}
      label="En gardant les questions affichées"
      on:change={(e) => {
        const isChecked = e.detail
        updateFlow(isChecked ? 2 : 1)
      }}
    />
    <div class="flex items-center">
      <CheckboxWithLabel
        id="slideshow-transition-correction-duration-checkbox"
        isChecked={isSpecificCorrectionDuration}
        isDisabled={!questionThenCorrectionToggle || isManualModeActive}
        label="Durée d'affichage de la correction (en s)"
        on:change={(e) => {
          const isChecked = e.detail
          handleChangeIsSpecificCorrectionDuration(isChecked)
        }}
      />
      <div class="w-20 ml-2">
        <NumberInput
          id="slideshow-transition-correction-duration-input"
          ariaLabel="Durée d'affichage de la correction en secondes"
          value={previousDurationCorrection}
          isDisabled={!isSpecificCorrectionDuration ||
            !questionThenCorrectionToggle ||
            isManualModeActive}
          on:change={(e) => {
            const newDuration = e.detail
            if (!newDuration) return
            previousDurationCorrection = newDuration
            updateDurationCorrection(newDuration)
          }}
        />
      </div>
    </div>
  </div>
  <CheckboxWithLabel
    id="slideshow-transition-screen-between-checkbox"
    isChecked={screenBetweenSlides}
    label="Avec des cartons entre les questions"
    on:change={(e) => {
      const isChecked = e.detail
      updateScreenBetweenSlides(isChecked)
    }}
  />
  <CheckboxWithLabel
    id="slideshow-transition-sound-checkbox"
    isChecked={soundToggle}
    label="Jouer un son entre les questions"
    on:change={(e) => {
      const isChecked = e.detail
      if (isChecked) {
        transitionSounds[tune].play()
        updateTune(tune)
      } else {
        updateTune(-1)
      }
    }}
  />
  <FormRadio
    title="son"
    isDisabled={!soundToggle}
    bind:valueSelected={tune}
    labelsValues={labelsForSounds}
    orientation="row"
    on:newvalue={() => {
      transitionSounds[tune].play()
      updateTune(tune)
    }}
  />
  <CheckboxWithLabel
    id="slideshow-pause-after-each-question-checkbox"
    isChecked={pauseAfterEachQuestion}
    label="Avec une pause après chaque question"
    on:change={(e) => {
      const isChecked = e.detail
      updatePauseAfterEachQuestion(isChecked)
    }}
  />
</div>
