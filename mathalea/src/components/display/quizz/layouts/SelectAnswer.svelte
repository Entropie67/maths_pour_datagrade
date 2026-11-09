<script lang="ts">
  import { onDestroy, onMount, tick } from 'svelte'
  import type { QuizzStatusDataMap } from '../../../../modules/quizz/types'
  import AnswerButton from '../presentationalComponents/AnswerButton.svelte'
  import QuizzTimer from '../presentationalComponents/QuizzTimer.svelte'
  import { quizzRenderDiv } from '../quizzRender'

  /** Phase de réponse : énoncé, boutons colorés A-D, barre de temps. */
  export let data: QuizzStatusDataMap['SELECT_ANSWER']
  export let onSubmit: (answerIds: number[]) => void
  /**
   * Mode spectateur (écran du manager en multi-joueurs) : les réponses sont
   * affichées sans interaction possible, avec le compteur de réponses reçues.
   */
  export let spectator: boolean = false
  /** Nombre de joueurs ayant répondu (mode spectateur). */
  export let answerCount: number = 0

  let selected: number[] = []
  let submitted = spectator
  let container: HTMLDivElement

  onMount(async () => {
    await tick()
    quizzRenderDiv(container)
    window.addEventListener('keydown', handleKeydown)
  })

  onDestroy(() => {
    window.removeEventListener('keydown', handleKeydown)
  })

  function select(index: number) {
    if (submitted) return
    if (data.questionType === 'single') {
      submitted = true
      onSubmit([index])
    } else {
      selected = selected.includes(index)
        ? selected.filter((k) => k !== index)
        : [...selected, index]
    }
  }

  function validate() {
    if (submitted || selected.length === 0) return
    submitted = true
    onSubmit(selected)
  }

  function handleKeydown(event: KeyboardEvent) {
    if (submitted) return
    const key = event.key.toLowerCase()
    const byDigit = ['1', '2', '3', '4'].indexOf(key)
    const byLetter = ['a', 'b', 'c', 'd'].indexOf(key)
    const index = byDigit >= 0 ? byDigit : byLetter
    if (index >= 0 && index < data.answers.length) {
      select(index)
    } else if (event.key === 'Enter' && data.questionType === 'multi') {
      validate()
    }
  }

  function stateOf(index: number): 'idle' | 'selected' {
    return selected.includes(index) ? 'selected' : 'idle'
  }
</script>

<div class="flex flex-col items-center justify-center gap-6 px-6 w-full">
  <div
    bind:this={container}
    class="w-11/12 max-w-7xl shadow-lg px-8 py-4 text-center
    quizz-text-question font-semibold
    bg-coopmaths-canvas dark:bg-coopmathsdark-canvas
    text-coopmaths-corpus dark:text-coopmathsdark-corpus"
  >
    {@html data.question}
  </div>
  <QuizzTimer seconds={data.time} />
  <div class="w-11/12 max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-3">
    {#each data.answers as answer, i}
      <AnswerButton
        index={i}
        html={answer}
        state={stateOf(i)}
        disabled={submitted}
        onSelect={select}
      />
    {/each}
  </div>
  {#if spectator}
    <div
      class="px-6 py-2 text-lg font-bold shadow
      bg-coopmaths-canvas dark:bg-coopmathsdark-canvas
      text-coopmaths-struct dark:text-coopmathsdark-struct"
    >
      {answerCount} / {data.totalPlayer} réponse{answerCount > 1 ? 's' : ''}
    </div>
  {:else if data.questionType === 'multi'}
    <button
      type="button"
      class="px-6 py-2 text-lg font-bold shadow
      text-coopmaths-canvas bg-coopmaths-action
      hover:bg-coopmaths-action-lightest
      dark:bg-coopmathsdark-action dark:hover:bg-coopmathsdark-action-lightest
      dark:text-coopmathsdark-canvas
      disabled:opacity-40"
      disabled={selected.length === 0 || submitted}
      on:click={validate}
    >
      Valider
    </button>
  {/if}
</div>
