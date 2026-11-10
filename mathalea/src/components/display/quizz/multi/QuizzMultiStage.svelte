<script lang="ts">
  import {
    quizzAnswerCount,
    quizzProgress,
  } from '../../../../lib/stores/quizzStore'
  import type { QuizzStatusMessage } from '../../../../modules/quizz/transport/QuizzTransport'
  import type {
    QuizzRole,
    QuizzStatusDataMap,
  } from '../../../../modules/quizz/types'
  import SelectAnswer from '../layouts/SelectAnswer.svelte'
  import ShowLeaderboard from '../layouts/ShowLeaderboard.svelte'
  import ShowPodium from '../layouts/ShowPodium.svelte'
  import ShowPrepared from '../layouts/ShowPrepared.svelte'
  import ShowQuestion from '../layouts/ShowQuestion.svelte'
  import ShowResponses from '../layouts/ShowResponses.svelte'
  import ShowResult from '../layouts/ShowResult.svelte'
  import ShowStart from '../layouts/ShowStart.svelte'

  /**
   * Scène du mode multi-joueurs : traduit le statut courant (reçu du serveur
   * via les stores) en layout, selon le rôle local. Équivalent du bloc de
   * rendu de Quizz.svelte (V1), avec filtrage par rôle :
   * - le joueur répond (SELECT_ANSWER interactif) et voit son verdict
   *   personnel (SHOW_RESULT) puis son rang (FINISHED) ;
   * - le manager observe (SELECT_ANSWER spectateur avec compteur), voit
   *   l'histogramme (SHOW_RESPONSES) et le classement (SHOW_LEADERBOARD,
   *   que le serveur ne diffuse qu'à lui).
   */
  export let status: QuizzStatusMessage
  export let role: QuizzRole
  export let onImage: boolean = false
  export let onSubmit: (answerIds: number[]) => void = () => {}
</script>

{#if status.name === 'SHOW_START'}
  <ShowStart data={status.data as QuizzStatusDataMap['SHOW_START']} {onImage} />
{:else if status.name === 'SHOW_PREPARED'}
  <ShowPrepared
    data={status.data as QuizzStatusDataMap['SHOW_PREPARED']}
    {onImage}
  />
{:else if status.name === 'SHOW_QUESTION'}
  {#key $quizzProgress.current}
    <ShowQuestion data={status.data as QuizzStatusDataMap['SHOW_QUESTION']} />
  {/key}
{:else if status.name === 'SELECT_ANSWER'}
  {#key $quizzProgress.current}
    {#if role === 'manager'}
      <SelectAnswer
        data={status.data as QuizzStatusDataMap['SELECT_ANSWER']}
        onSubmit={() => {}}
        spectator={true}
        answerCount={$quizzAnswerCount}
      />
    {:else}
      <SelectAnswer
        data={status.data as QuizzStatusDataMap['SELECT_ANSWER']}
        {onSubmit}
      />
    {/if}
  {/key}
{:else if status.name === 'WAIT'}
  <div
    class="flex flex-col items-center gap-4 text-xl font-semibold
    {onImage
      ? 'text-white drop-shadow'
      : 'text-coopmaths-struct dark:text-coopmathsdark-struct'}"
  >
    <span class="quizz-wait-dots">●●●</span>
    {(status.data as QuizzStatusDataMap['WAIT']).text}
  </div>
{:else if status.name === 'SHOW_RESULT' && role === 'player'}
  {#key $quizzProgress.current}
    <ShowResult data={status.data as QuizzStatusDataMap['SHOW_RESULT']} />
  {/key}
{:else if status.name === 'SHOW_RESPONSES' && role === 'manager'}
  {#key $quizzProgress.current}
    <ShowResponses data={status.data as QuizzStatusDataMap['SHOW_RESPONSES']} />
  {/key}
{:else if status.name === 'SHOW_LEADERBOARD' && role === 'manager'}
  <ShowLeaderboard
    data={status.data as QuizzStatusDataMap['SHOW_LEADERBOARD']}
  />
{:else if status.name === 'FINISHED'}
  <ShowPodium
    data={status.data as QuizzStatusDataMap['FINISHED']}
    showPersonal={role === 'player'}
  />
{/if}

<style>
  .quizz-wait-dots {
    letter-spacing: 0.5em;
    animation: quizz-wait-anim 1.2s ease-in-out infinite;
  }
  @keyframes quizz-wait-anim {
    0%,
    100% {
      opacity: 0.3;
    }
    50% {
      opacity: 1;
    }
  }
</style>
