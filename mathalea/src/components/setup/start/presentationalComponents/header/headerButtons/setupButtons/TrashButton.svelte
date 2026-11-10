<script lang="ts">
  import ToolbarIconButton from './ToolbarIconButton.svelte'

  export let trash: () => void
</script>

<ToolbarIconButton
  icon="bx-trash"
  tooltip="Supprimer tous les exercices"
  on:click={trash}
/>
