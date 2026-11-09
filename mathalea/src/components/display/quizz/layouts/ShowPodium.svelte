<script lang="ts">
  import type { QuizzStatusDataMap } from '../../../../modules/quizz/types'

  /** Écran final : score personnel (solo) ou podium (projection). */
  export let data: QuizzStatusDataMap['FINISHED']
  /**
   * Affiche le rang et le total personnels sous le podium (joueur en mode
   * multi-joueurs, dont la charge FINISHED contient rank et myPoints).
   */
  export let showPersonal: boolean = false

  const medals = ['🥇', '🥈', '🥉']
  const heights = ['h-32', 'h-24', 'h-20']
  // Podium affiché dans l'ordre 2e - 1er - 3e
  $: podium = [data.top[1], data.top[0], data.top[2]].filter(Boolean)
</script>

<div
  class="relative flex flex-col items-center justify-center gap-8 px-6 w-full overflow-hidden"
>
  {#if data.scoring !== 'none'}
    <div class="quizz-confetti" aria-hidden="true">
      {#each Array(24) as _, i}
        <span
          style="left: {(i * 41) % 100}%; background: hsl({(i * 47) %
            360}, 80%, 60%); animation-duration: {2.5 +
            (i % 5) *
              0.4}s; animation-delay: {(i % 7) * 0.3}s"
        ></span>
      {/each}
    </div>
  {/if}
  <h2
    class="quizz-text-title font-extrabold text-center
    text-coopmaths-struct dark:text-coopmathsdark-struct"
  >
    {data.subject}
  </h2>
  {#if data.scoring === 'none'}
    <div
      class="text-2xl font-bold
      text-coopmaths-corpus dark:text-coopmathsdark-corpus"
    >
      Quizz terminé — bravo !
    </div>
  {:else if data.top.length <= 1}
    <div
      class="flex flex-col items-center gap-3 shadow-xl px-10 py-8
      bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
    >
      <span class="text-6xl">🏆</span>
      <div
        class="text-2xl font-extrabold
        text-coopmaths-corpus dark:text-coopmathsdark-corpus"
      >
        Score : {data.myPoints ?? data.top[0]?.points ?? 0} point{(data.myPoints ??
          data.top[0]?.points ??
          0) > 1
          ? 's'
          : ''}
      </div>
    </div>
  {:else}
    <div class="flex flex-row items-end justify-center gap-4">
      {#each podium as player}
        {@const rank = data.top.indexOf(player)}
        <div class="flex flex-col items-center gap-2">
          <span class="text-4xl">{medals[rank]}</span>
          <span
            class="font-bold text-lg
            text-coopmaths-corpus dark:text-coopmathsdark-corpus"
          >
            {player.username}
          </span>
          <span
            class="font-extrabold text-xl
            text-coopmaths-struct dark:text-coopmathsdark-struct"
          >
            {player.points}
          </span>
          <div
            class="w-24 bg-coopmaths-struct-light
            dark:bg-coopmathsdark-struct-light {heights[rank]}"
          ></div>
        </div>
      {/each}
    </div>
  {/if}
  {#if showPersonal && data.rank != null}
    <div
      class="shadow-xl px-8 py-3 text-xl font-bold
      bg-coopmaths-canvas dark:bg-coopmathsdark-canvas
      text-coopmaths-corpus dark:text-coopmathsdark-corpus"
    >
      Votre rang : {data.rank} — {data.myPoints ?? 0} point{(data.myPoints ??
        0) > 1
        ? 's'
        : ''}
    </div>
  {/if}
</div>

<style>
  .quizz-confetti {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
  }
  .quizz-confetti span {
    position: absolute;
    top: -10px;
    width: 8px;
    height: 14px;
    border-radius: 2px;
    animation-name: quizz-fall;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
  }
  @keyframes quizz-fall {
    from {
      transform: translateY(-10px) rotate(0deg);
      opacity: 1;
    }
    to {
      transform: translateY(110vh) rotate(720deg);
      opacity: 0.6;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .quizz-confetti {
      display: none;
    }
  }
</style>
