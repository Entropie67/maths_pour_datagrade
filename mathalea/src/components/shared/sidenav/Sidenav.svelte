<script lang="ts">
  import { fly } from 'svelte/transition'

  export let isOpen: boolean = true
  export let width: number = 400
</script>

{#if isOpen}
  <nav
    id="sidenav"
    transition:fly|global={{ x: -width, duration: 300 }}
    class="absolute left-0 top-0 h-full z-[1035] overflow-y-auto overscroll-contain
           bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark"
    style="width: {width}px"
  >
    <slot />
  </nav>
{/if}
