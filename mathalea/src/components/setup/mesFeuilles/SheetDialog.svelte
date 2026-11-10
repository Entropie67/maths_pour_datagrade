<script lang="ts">
  import type { Snippet } from 'svelte'

  /**
   * Fenêtre modale des vues « Mes sauvegardes » (`<dialog>` natif :
   * Échap et clic à l'extérieur la ferment).
   * `pointer-events-auto` : la fenêtre peut être montée dans un parent en
   * `pointer-events-none` (calque des outils du TBI), dont elle hériterait
   * sinon (le fond `::backdrop` aussi).
   */
  interface Props {
    open: boolean
    title: string
    /** Largeur maximale (classe Tailwind) */
    width?: string
    onclose: () => void
    children: Snippet
  }

  let { open, title, width = 'max-w-lg', onclose, children }: Props = $props()

  let dialog: HTMLDialogElement | undefined = $state()

  $effect(() => {
    if (dialog === undefined) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  })
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<dialog
  bind:this={dialog}
  aria-label={title}
  class="pointer-events-auto m-auto w-full {width} max-h-[90vh] overflow-y-auto rounded-xl p-6 shadow-lg text-coopmaths-corpus dark:text-coopmathsdark-corpus bg-coopmaths-canvas dark:bg-coopmathsdark-canvas backdrop:bg-black/40"
  onclick={(event) => {
    if (event.target === dialog) onclose()
  }}
  onclose={() => {
    if (open) onclose()
  }}
>
  {#if open}
    <div class="flex flex-row items-start justify-between gap-4 mb-4">
      <h2
        class="text-xl font-bold text-coopmaths-struct dark:text-coopmathsdark-struct"
      >
        {title}
      </h2>
      <button
        type="button"
        aria-label="Fermer"
        class="text-coopmaths-corpus dark:text-coopmathsdark-corpus hover:text-coopmaths-action dark:hover:text-coopmathsdark-action"
        onclick={onclose}
      >
        <i class="bx bx-x text-2xl"></i>
      </button>
    </div>
    {@render children()}
  {/if}
</dialog>
