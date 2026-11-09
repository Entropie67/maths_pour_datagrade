<script lang="ts">
  import { dismissTbiToast, tbiToast } from '../../../lib/stores/tbiToastStore'
  import TbiMathText from './TbiMathText.svelte'

  function act() {
    const action = $tbiToast?.onAction
    dismissTbiToast()
    action?.()
  }
</script>

<div
  class="fixed left-1/2 -translate-x-1/2 bottom-24 z-[60] print-hidden"
  role="status"
  aria-live="polite"
>
  {#if $tbiToast}
    <div
      data-tbi-chrome
      class="flex flex-row items-center gap-4 pl-5 pr-2 py-2 rounded-xl shadow-lg whitespace-nowrap text-lg font-semibold bg-coopmaths-corpus text-coopmaths-canvas dark:bg-coopmathsdark-corpus dark:text-coopmathsdark-canvas"
    >
      <TbiMathText text={$tbiToast.message} />
      {#if $tbiToast.actionLabel}
        <button
          type="button"
          class="min-h-12 px-4 rounded-lg font-bold bg-white/20 dark:bg-black/20 hover:bg-white/30 dark:hover:bg-black/30"
          onclick={act}
        >
          {$tbiToast.actionLabel}
        </button>
      {/if}
    </div>
  {/if}
</div>
