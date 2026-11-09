<script lang="ts">
  /**
   * Barre de progression d'une phase chronométrée (cooldown ou temps de
   * réponse). Le parent la recrée à chaque phase via {#key}.
   */
  export let seconds: number
  export let colorClass: string = 'bg-coopmaths-action dark:bg-coopmathsdark-action'
</script>

<div
  class="w-11/12 max-w-7xl h-3 overflow-hidden
  bg-coopmaths-corpus/10 dark:bg-coopmathsdark-corpus/10"
  role="progressbar"
  aria-valuemin={0}
  aria-valuemax={seconds}
  aria-valuenow={seconds}
>
  <div
    class="h-full {colorClass} quizz-timer-bar"
    style="animation-duration: {seconds}s"
  ></div>
</div>

<style>
  .quizz-timer-bar {
    animation-name: quizz-progress;
    animation-timing-function: linear;
    animation-fill-mode: forwards;
    width: 100%;
  }
  @keyframes quizz-progress {
    from {
      width: 100%;
    }
    to {
      width: 0%;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .quizz-timer-bar {
      animation: none;
    }
  }
</style>
