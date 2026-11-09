<script lang="ts">
  import type { QuizzStatusDataMap } from '../../../../modules/quizz/types'

  /** Écran « Préparez-vous » : numéro de question et nombre de réponses. */
  export let data: QuizzStatusDataMap['SHOW_PREPARED']
  export let onImage: boolean = false

  const labels = ['A', 'B', 'C', 'D']
  const colorClasses = ['bg-quizz-1', 'bg-quizz-2', 'bg-quizz-3', 'bg-quizz-4']
</script>

<div class="flex flex-col items-center justify-center gap-10 px-6 text-center">
  <h2
    class="quizz-text-title font-extrabold quizz-pop
    {onImage
    ? 'text-white drop-shadow-lg'
    : 'text-coopmaths-struct dark:text-coopmathsdark-struct'}"
  >
    Question {data.questionNumber}
  </h2>
  <div class="flex flex-row justify-center gap-3">
    {#each labels.slice(0, data.totalAnswers) as label, i}
      <span
        class="flex items-center justify-center h-16 w-16 md:h-20 md:w-20
        text-white text-2xl md:text-3xl font-bold shadow-lg quizz-pop
        {colorClasses[i]}"
        style="animation-delay: {i * 100}ms"
      >
        {label}
      </span>
    {/each}
  </div>
</div>

<style>
  .quizz-pop {
    animation: quizz-pop-anim 0.4s ease-out both;
  }
  @keyframes quizz-pop-anim {
    from {
      transform: scale(0.6);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .quizz-pop {
      animation: none;
    }
  }
</style>
