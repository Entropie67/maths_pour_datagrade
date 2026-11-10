<script lang="ts">
  /**
   * Repères d'un élément dans un salon : cadre à la couleur de la personne qui
   * le modifie (elle garde la main) et bouton de ses commentaires. À placer
   * dans un conteneur `relative` portant `data-element`.
   */
  import type { EditorCollab } from '../../../../lib/parcours/salon/salonPresence'

  let { collab, element }: { collab: EditorCollab; element: string } =
    $props()

  const holder = $derived(collab.lock(element))
  const n = $derived(collab.comments(element))
</script>

{#if holder}
  <!-- Quelqu'un d'autre modifie cet élément : il garde la main -->
  <div
    class="absolute inset-0 z-10 rounded-lg cursor-not-allowed"
    style="box-shadow: inset 0 0 0 2px {holder.couleur}; background-color: color-mix(in srgb, {holder.couleur} 7%, transparent)"
  ></div>
{/if}
<div class="absolute -top-3 right-3 z-20 flex flex-row items-center gap-1">
  {#if holder}
    <span
      class="rounded-full px-2 py-0.5 text-xs font-semibold text-white"
      style="background-color: {holder.couleur}">{holder.nom} modifie</span
    >
  {/if}
  <button
    type="button"
    class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold border bg-coopmaths-canvas dark:bg-coopmathsdark-canvas {n
      ? 'border-coopmaths-action dark:border-coopmathsdark-action text-coopmaths-action dark:text-coopmathsdark-action'
      : 'border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light hover:text-coopmaths-action dark:hover:text-coopmathsdark-action'}"
    title="Commenter"
    aria-label="Commentaires ({n})"
    onclick={() => collab.oncomment(element)}
    ><i class="bx bx-comment" aria-hidden="true"></i>{n || ''}</button
  >
</div>
