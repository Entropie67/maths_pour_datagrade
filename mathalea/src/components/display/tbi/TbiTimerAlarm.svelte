<script lang="ts">
  import { onDestroy, onMount } from 'svelte'

  /**
   * Fin du minuteur : un signal visible du fond de la classe, sur tout l'écran,
   * et un son si le prof l'a demandé. Disparaît seul, ou au premier toucher.
   */
  interface Props {
    sound: boolean
    onDismiss: () => void
  }

  let { sound, onDismiss }: Props = $props()

  /** Durée du signal (ms) */
  const ALARM_DURATION = 10_000

  let timer: ReturnType<typeof setTimeout> | undefined
  let audioContext: AudioContext | undefined

  function playChime() {
    try {
      audioContext = new AudioContext()
      const start = audioContext.currentTime
      for (const [index, frequency] of [880, 660, 880, 660].entries()) {
        const oscillator = audioContext.createOscillator()
        const gain = audioContext.createGain()
        oscillator.frequency.value = frequency
        gain.gain.setValueAtTime(0.25, start + index * 0.35)
        gain.gain.exponentialRampToValueAtTime(
          0.001,
          start + index * 0.35 + 0.3,
        )
        oscillator.connect(gain).connect(audioContext.destination)
        oscillator.start(start + index * 0.35)
        oscillator.stop(start + index * 0.35 + 0.3)
      }
    } catch {
      // son indisponible : le signal visuel suffit
    }
  }

  onMount(() => {
    timer = setTimeout(onDismiss, ALARM_DURATION)
    if (sound) playChime()
  })

  onDestroy(() => {
    clearTimeout(timer)
    void audioContext?.close()
  })
</script>

<button
  type="button"
  class="alarm fixed inset-0 z-[70] flex items-center justify-center print-hidden"
  aria-label="Fermer le signal de fin du minuteur"
  onclick={onDismiss}
>
  <span
    class="px-12 py-6 rounded-3xl text-7xl font-extrabold shadow-2xl text-white bg-red-700"
    role="alert"
  >
    Temps écoulé
  </span>
</button>

<style>
  .alarm {
    box-shadow: inset 0 0 0 24px #b91c1c;
    animation: alarm-pulse 1s ease-in-out infinite;
  }
  @keyframes alarm-pulse {
    50% {
      box-shadow: inset 0 0 0 48px #b91c1c;
      background: rgb(0 0 0 / 15%);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .alarm {
      animation: none;
    }
  }
</style>
