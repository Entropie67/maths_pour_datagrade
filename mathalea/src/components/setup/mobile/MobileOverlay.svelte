<script lang="ts">
  import type { Snippet } from 'svelte'
  import { fly } from 'svelte/transition'

  /**
   * Panneau plein écran de la vue mobile : il recouvre la liste des exercices
   * le temps d'y choisir une action.
   */
  type Props = {
    title: string
    onclose: () => void
    children: Snippet
  }

  const { title, onclose, children }: Props = $props()
</script>

<div
  transition:fly={{ y: 300, duration: 200 }}
  class="fixed inset-0 z-[1100] flex flex-col overflow-y-auto
  bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
>
  <div
    class="sticky top-0 flex flex-row items-center justify-between gap-2 px-4 py-3
    border-b border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest
    bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
  >
    <h2
      class="text-lg font-bold truncate text-coopmaths-struct dark:text-coopmathsdark-struct"
    >
      {title}
    </h2>
    <button
      type="button"
      aria-label="Fermer le menu"
      onclick={onclose}
      class="shrink-0 p-1 text-coopmaths-action dark:text-coopmathsdark-action"
    >
      <i class="bx bx-x text-3xl"></i>
    </button>
  </div>
  <div class="flex flex-col gap-2 p-4">
    {@render children()}
  </div>
</div>
