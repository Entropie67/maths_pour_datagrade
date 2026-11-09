<script lang="ts">
  import ButtonIcon from '../../../../../shared/forms/ButtonIcon.svelte'
  import SlideshowPlayTimerSettingsModal from './SlideshowPlayTimerSettingsModal.svelte'

  export let handleTimerChange: (cursorTimeValue: number) => void
  export let switchDisplayMode: () => void
  export let backToSettings: (event: Event) => void
  export let pause: () => void
  export let play: (isUserAction: boolean) => void
  export let isManualModeActive: boolean | undefined
  export let isQuestionVisible: boolean
  export let isCorrectionVisible: boolean
  export let currentSlideDuration: number
  export let BUTTONS_CLASS: string

  let isTimerSettingsModalDisplayedOnce = false

  $: getDisplayMode = () => {
    if (isQuestionVisible && !isCorrectionVisible) {
      return 'Q'
    }
    if (isQuestionVisible && isCorrectionVisible) {
      return 'Q+C'
    }
    if (!isQuestionVisible && isCorrectionVisible) {
      return 'C'
    }
    return ''
  }

  let isTimerSettingsModalDisplayed = false
  function displayTimerSettingsModal() {
    isTimerSettingsModalDisplayed = true
  }

  $: if (isTimerSettingsModalDisplayed) {
    pause()
    isTimerSettingsModalDisplayedOnce = true
  } else if (isTimerSettingsModalDisplayedOnce) {
    play(true)
  }
</script>

<ButtonIcon
  icon="bx-stopwatch {BUTTONS_CLASS}"
  ariaLabel="Régler la durée de chaque question"
  title="Régler la durée de chaque question"
  floatUnderText={isManualModeActive ? 'Manuel' : currentSlideDuration + 's'}
  on:click={displayTimerSettingsModal}
/>
<ButtonIcon
  icon="bx-show {BUTTONS_CLASS}"
  ariaLabel="Changer l'affichage (question, correction)"
  title="Raccourci clavier : Entrée"
  floatUnderText={getDisplayMode()}
  on:click={switchDisplayMode}
/>
<ButtonIcon
  icon="bx-power-off {BUTTONS_CLASS}"
  ariaLabel="Retour au paramétrage"
  title="Retour au paramétrage"
  on:click={backToSettings}
/>
<SlideshowPlayTimerSettingsModal
  bind:isTimerSettingsModalDisplayed
  {handleTimerChange}
/>
