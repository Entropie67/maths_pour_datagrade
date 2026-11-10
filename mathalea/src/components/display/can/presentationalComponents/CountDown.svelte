<script lang="ts">
  import { onMount } from 'svelte'
  import type { CanState } from '../../../../lib/types/can'
  import { canOptions } from '../../../../lib/stores/canStore'
  export let state: CanState
  export let count: number = 6
  onMount(() => {
    const counter = document.getElementById('counter')
    if (counter) {
      const interval = window.setInterval(() => {
        const nextcount = --count
        if (nextcount === 0) {
          window.clearInterval(interval)
          canOptions.update((options) => {
            options.state = 'race'
            return options
          })
          state = 'race'
        }
        requestAnimationFrame(() => {
          counter.textContent = nextcount.toString()
          counter.classList.remove('big')
          requestAnimationFrame(() => {
            counter.classList.add('big')
          })
        })
      }, 1000)
    }
  })
</script>

<div
  class="h-full w-full flex flex-col items-center justify-center bg-coopmaths-struct dark:bg-coopmathsdark-canvas text-coopmaths-canvas dark:text-coopmathsdark-corpus"
>
  <div id="counter" class="big font-black">3</div>
</div>

<style>
  #counter.big {
    font-size: 2000%;
    opacity: 0;
    transition: all linear 1s;
  }
</style>
