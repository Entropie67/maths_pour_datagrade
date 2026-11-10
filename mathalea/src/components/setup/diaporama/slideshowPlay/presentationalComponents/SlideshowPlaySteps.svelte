<script lang="ts">
  import { onMount } from 'svelte'
  export let isManualModeActive: boolean | undefined
  export let currentQuestionNumber: number
  export let totalQuestionsNumber: number
  export let goToQuestion: (index: number) => void
  export let ratioTime: number
  export let currentSlideDuration: number

  let stepsContainer: HTMLElement | null
  onMount(() => {
    stepsContainer = document.getElementById('stepsContainer')
  })

  $: {
    if (stepsContainer) {
      const steps = stepsContainer.querySelectorAll('button')
      if (steps[currentQuestionNumber]) {
        steps[currentQuestionNumber].scrollIntoView()
      }
      if (steps[currentQuestionNumber + 5]) {
        steps[currentQuestionNumber + 5].scrollIntoView()
      } else {
        steps[totalQuestionsNumber - 1].scrollIntoView()
      }
      if (steps[currentQuestionNumber - 5]) {
        steps[currentQuestionNumber - 5].scrollIntoView()
      } else {
        steps[0].scrollIntoView()
      }
      const diapoProgressContainer = document.getElementById(
        'diapoProgressContainer',
      )
      if (diapoProgressContainer) diapoProgressContainer.scrollIntoView()
    }
  }
</script>

<div
  id="diapoProgressContainer"
  class:invisible={isManualModeActive}
  class="flex flex-row flex-shrink-0 h-6 border
    border-coopmaths-warn dark:border-coopmathsdark-warn"
>
  <div
    class="bg-coopmaths-warn dark:bg-coopmathsdark-warn"
    style="width: {ratioTime}%; transition: width {currentSlideDuration /
      100}s linear"
  ></div>
</div>
<div id="stepsContainer" class="steps-container">
  {#each [...Array(totalQuestionsNumber).keys()] as i}
    <button
      on:click={() => goToQuestion(i)}
      class="step-item"
      class:step-completed={currentQuestionNumber > i}
      class:step-current={currentQuestionNumber === i}
    >
      <span class="step-indicator">{i + 1}</span>
    </button>
  {/each}
</div>

<style>
  .steps-container {
    display: flex;
    flex-wrap: nowrap;
    width: 100%;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
    padding: 0.5rem 1rem;
    overflow-x: auto;
    overflow-y: hidden;
  }

  .step-item {
    display: flex;
    flex-grow: 1;
    justify-content: center;
    position: relative;
    cursor: pointer;
    background: transparent;
    border: none;
    min-width: 4rem;
  }

  .step-item::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 8px;
    top: 50%;
    right: 50%;
    transform: translateY(-50%);
    background-color: #d1d5db;
  }

  .step-item:first-child::before {
    display: none;
  }

  :global(.dark) .step-item::before {
    background-color: #4b5563;
  }

  .step-item.step-completed::before,
  .step-item.step-current::before {
    background-color: #f15929;
  }

  :global(.dark) .step-item.step-completed::before,
  :global(.dark) .step-item.step-current::before {
    background-color: #ffb86c;
  }

  .step-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    position: relative;
    z-index: 1;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background-color: #d1d5db;
    transition: transform 0.2s ease-in-out;
  }

  :global(.dark) .step-indicator {
    background-color: #4b5563;
  }

  .step-completed .step-indicator {
    background-color: #f15929;
  }

  :global(.dark) .step-completed .step-indicator {
    background-color: #ffb86c;
  }

  .step-current .step-indicator {
    background-color: #f15929;
    animation: pulse 1s infinite ease-in-out;
  }

  :global(.dark) .step-current .step-indicator {
    background-color: #ffb86c;
  }

  .step-item:hover .step-indicator {
    transform: scale(1.2);
  }

  @keyframes pulse {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.3);
    }
  }
</style>
