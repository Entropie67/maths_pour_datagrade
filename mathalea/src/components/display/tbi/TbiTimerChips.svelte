<script lang="ts">
  import { onDestroy } from 'svelte'
  import { setTbiActiveTab } from '../../../lib/stores/tbiStore'
  import {
    isTbiToolShown,
    tbiActiveScope,
    tbiTools,
    timerLeftMs,
    type TbiClockTool,
  } from '../../../lib/stores/tbiToolsStore'

  /** Minuteurs en marche sur d'autres onglets : ils restent visibles ici */
  const away = $derived(
    $tbiTools.filter(
      (tool): tool is TbiClockTool =>
        tool.kind === 'clock' &&
        tool.timerEndAt !== null &&
        !isTbiToolShown(tool, $tbiActiveScope),
    ),
  )

  let now = $state(Date.now())
  const interval = setInterval(() => {
    now = Date.now()
  }, 500)
  onDestroy(() => clearInterval(interval))

  function format(ms: number): string {
    const seconds = Math.ceil(ms / 1000)
    return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
  }
</script>

{#each away as tool (tool.id)}
  <button
    type="button"
    class="inline-flex items-center gap-2 h-12 px-3 shrink-0 rounded-full font-bold tabular-nums bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark hover:bg-coopmaths-canvas-darkest dark:hover:bg-coopmathsdark-canvas-darkest"
    title="Revenir à l'onglet du minuteur"
    aria-label={`Minuteur sur un autre onglet : ${format(timerLeftMs(tool, now))}. Y aller.`}
    onclick={() => setTbiActiveTab(tool.scope)}
  >
    <i class="bx bx-hourglass text-2xl"></i>
    {format(timerLeftMs(tool, now))}
  </button>
{/each}
