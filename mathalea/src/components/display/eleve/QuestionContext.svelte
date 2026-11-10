<script lang="ts">
  import { mathaleaRenderDiv } from '../../../lib/mathalea'

  export let content: string
  export let exerciseIndex: number
  export let zoom = 1

  function renderContext(node: HTMLDivElement) {
    mathaleaRenderDiv(node)
  }
</script>

<!-- Garder une seule instance du contexte, y compris de ses figures dynamiques.
     Les questions d'un même exercice partagent cette instance jusqu'à ce que
     leur contexte change ; Svelte détruit alors les anciens custom elements.
     Le conteneur évite que le remplacement du bloc `{#key}` supprime les
     questions voisines. -->
<div>
  {#key `${exerciseIndex}:${content}`}
    <div
      class="container text-coopmaths-corpus dark:text-coopmathsdark-corpus pl-2 my-2 py-2"
      class:hidden={!content}
      style="font-size: {zoom}rem"
      use:renderContext
    >
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html content}
    </div>
  {/key}
</div>
