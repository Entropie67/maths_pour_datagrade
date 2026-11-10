<script lang="ts">
  import { createEventDispatcher, onDestroy } from 'svelte'
  import { millisecondToMinSec } from '../../../../lib/components/time'
  import ElapsedTime from './ElapsedTime.svelte'

  export let durationInMilliSeconds
  /**
   * Course sans limite de temps : le temps continue d'être mesuré (pour le
   * score final et les LMS) mais il n'est ni affiché ni utilisé pour arrêter
   * la course.
   */
  export let isDisabled: boolean = false
  /**
   * Chronomètre en pause (feedback affiché entre deux questions) : le temps
   * passé en pause n'est pas décompté.
   */
  export let isPaused: boolean = false
  const dispatch = createEventDispatcher()

  let elapsed = 0
  const duration = durationInMilliSeconds // 1min
  let displayedTime = ''
  let widthFactor = 1
  export const terminateTimer = (): void => {
    if (frame) cancelAnimationFrame(frame)
    frame = undefined
    dispatch('message', {
      state: 'endTimer',
      elapsed,
      duration,
    })
  }
  /** Temps décompté jusqu'ici (en millisecondes), sans arrêter le chronomètre. */
  export const getElapsed = (): number => elapsed
  let lastTime = window.performance.now()
  let frame: number | undefined
  ;(function update() {
    const time = window.performance.now()
    if (!isPaused) elapsed += time - lastTime

    if (elapsed > duration && !isDisabled) {
      terminateTimer()
    } else {
      frame = requestAnimationFrame(update)
      if (!isDisabled) {
        const timeD = millisecondToMinSec(duration - elapsed)
        const formattedtime = [
          timeD.minutes.toString().padStart(2, '0'),
          timeD.seconds.toString().padStart(2, '0'),
        ].join(':')

        displayedTime = formattedtime
        widthFactor = (duration - elapsed) / duration
      }
      lastTime = time
    }
  })()

  onDestroy(() => {
    if (frame) cancelAnimationFrame(frame)
    frame = undefined
  })
</script>

{#if !isDisabled}
  <ElapsedTime {widthFactor} {displayedTime} />
{/if}
