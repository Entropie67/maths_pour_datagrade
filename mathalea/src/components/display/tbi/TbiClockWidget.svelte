<script lang="ts">
  import { onDestroy } from 'svelte'
  import { tbiTimerAlarm } from '../../../lib/stores/tbiStore'
  import {
    TBI_CLOCK_MAX_W,
    TBI_CLOCK_MIN_W,
    TBI_TIMER_PRESETS,
    timerLeftMs as timerLeftOf,
    updateTbiTool,
    type TbiClockMode,
    type TbiClockTool,
  } from '../../../lib/stores/tbiToolsStore'
  import TbiToolFrame from './TbiToolFrame.svelte'
  import type { TbiToolFrameProps } from './tbiTypes'

  /**
   * Horloge, minuteur et chronomètre. Leurs temps sont calculés depuis des
   * horodatages portés par l'état, robustes au throttling des onglets en
   * arrière-plan. Les chiffres suivent la largeur de l'outil pour rester lisibles
   * du fond de la classe.
   */
  interface Props {
    tool: TbiClockTool
    /** Commandes communes aux outils (voir `TbiToolsLayer`) */
    frame: TbiToolFrameProps
  }

  let { tool: clock, frame }: Props = $props()

  function updateTbiClock(patch: Partial<TbiClockTool>) {
    updateTbiTool(clock.id, patch)
  }

  let now = $state(Date.now())
  const interval = setInterval(() => {
    now = Date.now()
  }, 200)
  onDestroy(() => clearInterval(interval))

  const modes: {
    value: TbiClockMode
    label: string
    icon: string
  }[] = [
    { value: 'clock', label: 'Horloge', icon: 'bx-time-five' },
    { value: 'timer', label: 'Minuteur', icon: 'bx-hourglass' },
    { value: 'stopwatch', label: 'Chronomètre', icon: 'bx-stopwatch' },
  ]

  const timerLeftMs = $derived(timerLeftOf(clock, now))
  const isTimerRunning = $derived(clock.timerEndAt !== null)
  const stopwatchMs = $derived(
    clock.stopwatchElapsedMs +
      (clock.stopwatchStartAt === null ? 0 : now - clock.stopwatchStartAt),
  )

  $effect(() => {
    if (clock.timerEndAt !== null && timerLeftMs === 0) {
      updateTbiClock({ timerEndAt: null, timerRemainingMs: 0 })
      tbiTimerAlarm.set({ sound: clock.sound })
    }
  })

  /** Temps restant arrondi à la seconde supérieure : 00:00 signifie « terminé » */
  function formatMs(ms: number, roundUp = false): string {
    const totalSeconds = roundUp ? Math.ceil(ms / 1000) : Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  function formatPreset(seconds: number): string {
    return seconds < 60 ? `${seconds} s` : `${seconds / 60} min`
  }

  function setTimerDuration(seconds: number) {
    const ms = seconds * 1000
    updateTbiClock({
      timerDurationMs: ms,
      timerRemainingMs: ms,
      timerEndAt: null,
    })
  }

  function onCustomMinutes(event: Event) {
    const minutes = Number((event.currentTarget as HTMLInputElement).value)
    if (Number.isFinite(minutes) && minutes > 0) {
      setTimerDuration(Math.min(minutes, 180) * 60)
    }
  }

  function startPauseTimer() {
    if (clock.timerEndAt !== null) {
      updateTbiClock({
        timerRemainingMs: Math.max(0, clock.timerEndAt - Date.now()),
        timerEndAt: null,
      })
      return
    }
    const remaining =
      clock.timerRemainingMs > 0
        ? clock.timerRemainingMs
        : clock.timerDurationMs
    updateTbiClock({
      timerEndAt: Date.now() + remaining,
      timerRemainingMs: remaining,
    })
  }

  function resetTimer() {
    updateTbiClock({
      timerEndAt: null,
      timerRemainingMs: clock.timerDurationMs,
    })
  }

  function startPauseStopwatch() {
    if (clock.stopwatchStartAt !== null) {
      updateTbiClock({
        stopwatchElapsedMs:
          clock.stopwatchElapsedMs + (Date.now() - clock.stopwatchStartAt),
        stopwatchStartAt: null,
      })
    } else {
      updateTbiClock({ stopwatchStartAt: Date.now() })
    }
  }

  function resetStopwatch() {
    updateTbiClock({ stopwatchStartAt: null, stopwatchElapsedMs: 0 })
  }

  const modeButtonClass =
    'flex items-center justify-center w-11 h-11 rounded-lg text-xl shrink-0'
  const commandClass =
    'flex items-center justify-center gap-1 min-w-12 h-12 px-3 rounded-lg font-semibold'
  const primaryCommandClass = `${commandClass} bg-coopmaths-struct dark:bg-coopmathsdark-struct text-coopmaths-canvas dark:text-coopmathsdark-canvas`
  const secondaryCommandClass = `${commandClass} bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark hover:bg-coopmaths-canvas-darkest dark:hover:bg-coopmathsdark-canvas-darkest`
</script>

<TbiToolFrame
  title={modes.find((mode) => mode.value === clock.mode)?.label ?? 'Horloge'}
  x={clock.x}
  y={clock.y}
  w={clock.w}
  z={clock.z}
  minW={TBI_CLOCK_MIN_W}
  maxW={TBI_CLOCK_MAX_W}
  {...frame}
>
  {#snippet header()}
    {#each modes as mode (mode.value)}
      <button
        type="button"
        class="{modeButtonClass} {clock.mode === mode.value
          ? 'bg-coopmaths-struct dark:bg-coopmathsdark-struct text-coopmaths-canvas dark:text-coopmathsdark-canvas'
          : 'hover:bg-coopmaths-canvas-darkest dark:hover:bg-coopmathsdark-canvas-darkest'}"
        title={mode.label}
        aria-label={mode.label}
        aria-pressed={clock.mode === mode.value}
        onclick={() => updateTbiClock({ mode: mode.value })}
      >
        <i class="bx {mode.icon}"></i>
      </button>
    {/each}
    {#if clock.mode === 'timer'}
      <button
        type="button"
        class="{modeButtonClass} hover:bg-coopmaths-canvas-darkest dark:hover:bg-coopmathsdark-canvas-darkest"
        title={clock.sound
          ? 'Couper le son de fin du minuteur'
          : 'Activer le son de fin du minuteur'}
        aria-label="Son de fin du minuteur"
        aria-pressed={clock.sound}
        onclick={() => updateTbiClock({ sound: !clock.sound })}
      >
        <i class="bx {clock.sound ? 'bx-bell' : 'bx-bell-off'}"></i>
      </button>
    {/if}
  {/snippet}
  <div class="clock-body flex flex-col items-center gap-3 p-3">
    {#if clock.mode === 'clock'}
      <span class="digits seconds">
        {new Date(now).toLocaleTimeString('fr-FR')}
      </span>
    {:else if clock.mode === 'timer'}
      <span class="digits">{formatMs(timerLeftMs, true)}</span>
      <div class="flex flex-row flex-wrap items-center justify-center gap-1">
        {#each TBI_TIMER_PRESETS as seconds (seconds)}
          <button
            type="button"
            class="{secondaryCommandClass} text-base"
            aria-pressed={clock.timerDurationMs === seconds * 1000}
            onclick={() => setTimerDuration(seconds)}
          >
            {formatPreset(seconds)}
          </button>
        {/each}
        <label class="flex items-center gap-1 text-base font-semibold">
          <input
            type="number"
            min="0.25"
            max="180"
            step="0.25"
            class="w-16 h-12 rounded-lg border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest bg-coopmaths-canvas dark:bg-coopmathsdark-canvas px-1 text-right"
            aria-label="Durée du minuteur en minutes"
            value={clock.timerDurationMs / 60_000}
            onchange={onCustomMinutes}
          />
          min
        </label>
      </div>
      <div class="flex flex-row items-center gap-2">
        <button
          type="button"
          class={primaryCommandClass}
          onclick={startPauseTimer}
        >
          <i class="bx {isTimerRunning ? 'bx-pause' : 'bx-play'} text-xl"></i>
          {isTimerRunning ? 'Pause' : 'Démarrer'}
        </button>
        <button
          type="button"
          class={secondaryCommandClass}
          title="Réinitialiser"
          aria-label="Réinitialiser le minuteur"
          onclick={resetTimer}
        >
          <i class="bx bx-reset text-xl"></i>
        </button>
      </div>
    {:else}
      <span class="digits">{formatMs(stopwatchMs)}</span>
      <div class="flex flex-row items-center gap-2">
        <button
          type="button"
          class={primaryCommandClass}
          onclick={startPauseStopwatch}
        >
          <i
            class="bx {clock.stopwatchStartAt !== null
              ? 'bx-pause'
              : 'bx-play'} text-xl"
          ></i>
          {clock.stopwatchStartAt !== null ? 'Pause' : 'Démarrer'}
        </button>
        <button
          type="button"
          class={secondaryCommandClass}
          title="Réinitialiser"
          aria-label="Réinitialiser le chronomètre"
          onclick={resetStopwatch}
        >
          <i class="bx bx-reset text-xl"></i>
        </button>
      </div>
    {/if}
  </div>
</TbiToolFrame>

<style>
  .clock-body {
    container-type: inline-size;
  }
  .digits {
    font:
      700 22cqw / 1 ui-monospace,
      'Source Code Pro',
      Menlo,
      monospace;
    font-variant-numeric: tabular-nums;
  }
  .digits.seconds {
    font-size: 15cqw;
  }
  button[aria-pressed='true'].text-base {
    outline: 2px solid var(--color-coopmaths-struct);
    outline-offset: -2px;
  }
</style>
