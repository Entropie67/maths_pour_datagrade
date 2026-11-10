<script lang="ts">
  import ZoomButtons from './ZoomButtons.svelte'
  import FormatToggle from './FormatToggle.svelte'
  import ReorderButton from './ReorderButton.svelte'
  import NewDataButton from './NewDataButton.svelte'
  import TrashButton from './TrashButton.svelte'
  import SaveSelectionButton from '../../../../../mesFeuilles/SaveSelectionButton.svelte'
  import { mathaleaBuildUrlFromExercicesParams } from '../../../../../../../lib/mathalea'

  export let reorderModalDisplayed: boolean
  export let zoomUpdate: (plusMinus: '+' | '-') => void
  export let setAllInteractive: (isAllInteractive: boolean) => void
  export let newDataForAll: () => void
  export let trash: () => void
</script>

<FormatToggle {setAllInteractive} />
<div
  class="h-6 w-px bg-coopmaths-canvas-moredark dark:bg-coopmathsdark-canvas-darkest"
></div>
<div class="flex flex-row items-center gap-1">
  <ZoomButtons {zoomUpdate} />
  <ReorderButton bind:reorderModalDisplayed />
  <NewDataButton {newDataForAll} />
  <SaveSelectionButton
    variant="toolbar"
    getUrl={() => mathaleaBuildUrlFromExercicesParams().href}
  />
  <TrashButton {trash} />
</div>
