<script lang="ts">
  import type { QuizzStatusDataMap } from '../../../../modules/quizz/types'
  import AnswerButton from '../presentationalComponents/AnswerButton.svelte'
  import CorrectionPanel from '../presentationalComponents/CorrectionPanel.svelte'

  /**
   * Résultat du joueur local : verdict et points, rappel de SA réponse au
   * milieu des propositions (feedback immédiat), puis la correction.
   */
  export let data: QuizzStatusDataMap['SHOW_RESULT']

  function stateOf(index: number): 'correct' | 'incorrect' | 'dimmed' {
    if (data.solutions.includes(index)) return 'correct'
    if (data.selected?.includes(index)) return 'incorrect'
    return 'dimmed'
  }

  const lettre = (index: number) => String.fromCharCode(65 + index)
  $: choix =
    data.selected == null || data.selected.length === 0
      ? 'Vous n’avez pas répondu'
      : data.selected.length === 1
        ? `Votre réponse : ${lettre(data.selected[0])}`
        : `Vos réponses : ${data.selected.map(lettre).join(', ')}`
  $: attendu = `Bonne${data.solutions.length > 1 ? 's' : ''} réponse${
    data.solutions.length > 1 ? 's' : ''
  } : ${data.solutions.map(lettre).join(', ')}`
</script>

<div class="flex flex-col items-center justify-center gap-5 px-6 w-full">
  <div
    class="flex flex-row items-center gap-4 shadow-xl px-8 py-4
    bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
  >
    {#if data.correct}
      <i class="bx bx-check-circle text-6xl text-coopmaths-warn"></i>
    {:else}
      <i class="bx bx-x-circle text-6xl text-coopmaths-action"></i>
    {/if}
    <div class="flex flex-col items-start">
      <div
        class="quizz-text-result font-extrabold
        text-coopmaths-corpus dark:text-coopmathsdark-corpus"
      >
        {data.message}
      </div>
      {#if data.scoring !== 'none'}
        <div
          class="quizz-text-correction font-bold
          {data.points > 0
          ? 'text-coopmaths-warn-dark'
          : 'text-coopmaths-corpus/60 dark:text-coopmathsdark-corpus/60'}"
        >
          {data.points > 0 ? `+${data.points}` : data.points} point{Math.abs(
            data.points,
          ) > 1
            ? 's'
            : ''}
          <span class="font-light">
            — Total : {data.myPoints} point{data.myPoints > 1 ? 's' : ''}
          </span>
        </div>
      {/if}
    </div>
  </div>

  <div class="w-11/12 max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-3">
    {#each data.answers as answer, i}
      <AnswerButton index={i} html={answer} state={stateOf(i)} disabled={true} />
    {/each}
  </div>
  <div
    class="quizz-text-correction font-semibold
    text-coopmaths-corpus/80 dark:text-coopmathsdark-corpus/80"
  >
    {choix} — {attendu}
  </div>

  <CorrectionPanel html={data.correction} />
</div>
