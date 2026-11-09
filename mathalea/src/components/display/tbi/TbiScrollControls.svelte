<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import { tbiButton } from './tbiUi'

  /**
   * Faire défiler un long contenu sur un tableau est pénible : deux boutons dans
   * le bandeau, seulement quand il y a de quoi défiler, et un fondu au bas de
   * l'écran quand du contenu y est caché.
   */
  let canGoUp = $state(false)
  let canGoDown = $state(false)

  function update() {
    const { scrollY, innerHeight } = window
    const total = document.documentElement.scrollHeight
    canGoUp = scrollY > 1
    canGoDown = scrollY + innerHeight < total - 1
  }

  function scrollPage(direction: 1 | -1) {
    window.scrollBy({
      top: direction * window.innerHeight * 0.75,
      behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
    })
  }

  let observer: ResizeObserver | undefined

  onMount(() => {
    observer = new ResizeObserver(update)
    observer.observe(document.documentElement)
    update()
  })

  onDestroy(() => observer?.disconnect())
</script>

<svelte:window onscroll={update} onresize={update} />

{#if canGoUp || canGoDown}
  <button
    type="button"
    class={tbiButton(false, '')}
    title="Remonter"
    aria-label="Remonter"
    disabled={!canGoUp}
    onclick={() => scrollPage(-1)}
  >
    <i class="bx bx-chevron-up text-3xl"></i>
  </button>
  <button
    type="button"
    class={tbiButton(false, '')}
    title="Descendre"
    aria-label="Descendre"
    disabled={!canGoDown}
    onclick={() => scrollPage(1)}
  >
    <i class="bx bx-chevron-down text-3xl"></i>
  </button>
{/if}

{#if canGoDown}
  <div
    class="tbi-fade fixed left-0 right-0 bottom-0 z-20 h-20 pointer-events-none print-hidden"
  ></div>
{/if}

<style>
  .tbi-fade {
    background: linear-gradient(
      to bottom,
      transparent,
      var(--color-coopmaths-canvas)
    );
  }
  :global(.dark) .tbi-fade {
    background: linear-gradient(
      to bottom,
      transparent,
      var(--color-coopmathsdark-canvas)
    );
  }
</style>
