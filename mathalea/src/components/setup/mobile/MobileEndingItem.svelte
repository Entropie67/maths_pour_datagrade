<script lang="ts">
  import { endingLabel, endingReference } from '../../../lib/components/mobileMenu'
  import type { JSONReferentielEnding } from '../../../lib/types/referentiels'

  /**
   * Ligne d'exercice de la vue mobile (navigation par thèmes ou résultat de
   * recherche) : référence, libellé et badge du nombre de sélections.
   */
  type Props = {
    ending: JSONReferentielEnding
    count: number
    onclick: () => void
  }

  const { ending, count, onclick }: Props = $props()
</script>

<li>
  <button
    type="button"
    {onclick}
    class="w-full flex flex-row items-center justify-between gap-3 px-4 py-3 text-left
    bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark
    active:bg-coopmaths-canvas-darkest dark:active:bg-coopmathsdark-canvas-darkest
    transition-colors duration-150"
  >
    <div class="min-w-0 text-coopmaths-corpus dark:text-coopmathsdark-corpus">
      {#if endingReference(ending)}
        <span
          class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct"
          >{endingReference(ending)}</span
        >
        &nbsp;
      {/if}
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html endingLabel(ending)}
    </div>
    {#if count > 0}
      <span
        class="shrink-0 inline-flex items-center justify-center h-6 min-w-6 px-2 rounded-full
        bg-coopmaths-warn dark:bg-coopmathsdark-warn
        text-coopmaths-canvas dark:text-coopmathsdark-canvas text-xs font-bold"
      >
        {count}
      </span>
    {/if}
  </button>
</li>
