<script lang="ts">
  import ToolbarIconButton from './ToolbarIconButton.svelte'
  export let reorderModalDisplayed: boolean
</script>

<ToolbarIconButton
  icon="bx-transfer rotate-90"
  tooltip="Réorganisation"
  on:click={() => {
    reorderModalDisplayed = !reorderModalDisplayed
  }}
/>
