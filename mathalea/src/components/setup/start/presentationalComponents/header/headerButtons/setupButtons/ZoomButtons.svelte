<script lang="ts">
  import ToolbarIconButton from './ToolbarIconButton.svelte'

  export let zoomUpdate: (plusMinus: '+' | '-') => void
</script>

<ToolbarIconButton
  icon="bx-zoom-out"
  tooltip="Réduire la taille du texte"
  on:click={() => zoomUpdate('-')}
/>
<ToolbarIconButton
  icon="bx-zoom-in"
  tooltip="Augmenter la taille du texte"
  on:click={() => zoomUpdate('+')}
/>
