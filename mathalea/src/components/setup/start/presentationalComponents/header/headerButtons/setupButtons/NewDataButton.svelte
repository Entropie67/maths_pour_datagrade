<script lang="ts">
  import ToolbarIconButton from './ToolbarIconButton.svelte'

  export let newDataForAll: () => void
</script>

<ToolbarIconButton
  icon="bx-refresh"
  tooltip="Nouveaux énoncés"
  on:click={newDataForAll}
/>
