<script lang="ts">
  import { quizzCooldownTick } from '../../../../lib/stores/quizzStore'
  import type { QuizzStatusDataMap } from '../../../../modules/quizz/types'

  /** Écran de lancement : titre du quizz puis compte à rebours. */
  export let data: QuizzStatusDataMap['SHOW_START']
  export let onImage: boolean = false
</script>

<div class="flex flex-col items-center justify-center gap-8 px-6 text-center">
  <h1
    class="quizz-text-title font-extrabold
    {onImage
    ? 'text-white drop-shadow-lg'
    : 'text-coopmaths-struct dark:text-coopmathsdark-struct'}"
  >
    {data.subject}
  </h1>
  <div
    class="flex items-center justify-center h-28 w-28
    bg-coopmaths-action dark:bg-coopmathsdark-action
    text-white text-5xl font-extrabold shadow-xl
    {($quizzCooldownTick ?? 0) > 0 ? 'quizz-pulse' : ''}"
  >
    {#if ($quizzCooldownTick ?? 0) > 0}
      {$quizzCooldownTick}
    {:else}
      <span class="text-2xl font-bold">Prêt&nbsp;?</span>
    {/if}
  </div>
</div>

<style>
  .quizz-pulse {
    animation: quizz-pulse-anim 1s ease-in-out infinite;
  }
  @keyframes quizz-pulse-anim {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.08);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .quizz-pulse {
      animation: none;
    }
  }
</style>
