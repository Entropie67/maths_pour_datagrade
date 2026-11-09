<script lang="ts">
  import type { QuizzStatusDataMap } from '../../../../modules/quizz/types'

  /**
   * Classement intermédiaire (mode projection).
   * En V1 un seul joueur virtuel (« La classe ») : affichage du score et de
   * la série ; l'animation ancien → nouveau classement prendra tout son
   * sens en multi-joueurs (V2).
   */
  export let data: QuizzStatusDataMap['SHOW_LEADERBOARD']
</script>

<div class="flex flex-col items-center justify-center gap-6 px-6 w-full">
  <h2
    class="quizz-text-result font-extrabold
    text-coopmaths-struct dark:text-coopmathsdark-struct"
  >
    Score
  </h2>
  <div class="flex flex-col items-stretch gap-2 w-full max-w-xl">
    {#each data.leaderboard as player, i}
      <div
        class="flex items-center justify-between shadow px-6 py-3
        bg-coopmaths-canvas dark:bg-coopmathsdark-canvas
        text-coopmaths-corpus dark:text-coopmathsdark-corpus"
      >
        <span class="flex items-center gap-3 text-lg font-semibold">
          <span
            class="flex items-center justify-center h-8 w-8 rounded-full
            bg-coopmaths-struct dark:bg-coopmathsdark-struct
            text-white font-bold"
          >
            {i + 1}
          </span>
          {player.username}
          {#if player.streak >= 2}
            <span
              class="flex items-center gap-1 px-2 py-0.5 text-sm font-bold
              bg-amber-700 text-white"
              title="Série de bonnes réponses"
            >
              <i class="bx bxs-flame"></i>{player.streak}
            </span>
          {/if}
        </span>
        <span class="text-xl font-extrabold">{player.points}</span>
      </div>
    {/each}
  </div>
</div>
