<script lang="ts">
  import { onMount } from 'svelte'
  import { loadVitrineHtml } from '../../../../lib/components/vitrineAsso'

  /**
   * Appelé si le fragment n'a pas pu être récupéré : le parent affiche
   * alors l'accueil historique (liens rapides + carrousel).
   */
  export let onUnavailable: () => void

  // Le fragment vient de notre propre site (même origine, voir
  // lib/components/vitrineAsso.ts) : l'injection en {@html} est volontaire.
  let html: string | null = null

  onMount(async () => {
    html = await loadVitrineHtml()
    if (html === null) onUnavailable()
  })
</script>

{#if html !== null}
  <div class="flex-1">
    {@html html}
  </div>
{/if}
