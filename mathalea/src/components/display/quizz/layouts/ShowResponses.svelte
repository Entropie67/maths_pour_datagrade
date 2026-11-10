<script lang="ts">
  import type { QuizzStatusDataMap } from '../../../../modules/quizz/types'
  import AnswerButton from '../presentationalComponents/AnswerButton.svelte'
  import CorrectionPanel from '../presentationalComponents/CorrectionPanel.svelte'

  /**
   * Révélation en mode projection : bonne(s) réponse(s) mise(s) en évidence,
   * choix éventuel de la classe, puis correction.
   */
  export let data: QuizzStatusDataMap['SHOW_RESPONSES']

  function stateOf(index: number): 'correct' | 'incorrect' | 'selected' {
    if (data.solutions.includes(index)) return 'correct'
    if (data.selected?.includes(index)) return 'selected'
    return 'incorrect'
  }
</script>

<div class="flex flex-col items-center justify-center gap-6 px-6 w-full">
  <div class="w-11/12 max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-3">
    {#each data.answers as answer, i}
      <AnswerButton index={i} html={answer} state={stateOf(i)} disabled={true} />
    {/each}
  </div>
  <CorrectionPanel html={data.correction} />
</div>
