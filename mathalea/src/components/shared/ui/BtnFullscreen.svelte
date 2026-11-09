<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import {
    isFullscreen,
    listenToFullscreenChange,
    toggleFullscreen,
  } from '../../../lib/fullscreen'

  export let size: 'xs' | 'sm' | 'md' | 'lg' | 'bx-sm md:bx-md' = 'sm'
  export let isBorderTransparent: boolean = false
  /** Sans pastille ni bordure, pour s'aligner sur les boutons de la vue CAN */
  export let isPlain: boolean = false

  let stopListening: () => void

  onMount(() => {
    stopListening = listenToFullscreenChange()
  })

  onDestroy(() => {
    stopListening?.()
  })
</script>

<button
  type="button"
  on:click={() => toggleFullscreen($isFullscreen)}
  class="tooltip tooltip-left tooltip-neutral"
  data-tip={$isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
  aria-label={$isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
>
  <i
    aria-hidden="true"
    class="bx {size} {$isFullscreen
      ? 'bx-exit-fullscreen'
      : 'bx-fullscreen'} text-coopmaths-action dark:text-coopmathsdark-action hover:text-coopmaths-action-lightest dark:hover:text-coopmathsdark-action-lightest
    {isPlain
      ? ''
      : 'rounded-full p-1 border border-coopmaths-action hover:border-coopmaths-action-lightest bg-coopmaths-canvas dark:bg-coopmathsdark-canvas'}
    {isPlain || !isBorderTransparent ? '' : 'lg:border-transparent'}"
  ></i>
</button>
