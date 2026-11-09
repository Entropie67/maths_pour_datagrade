<script lang="ts">
  import type { VueType } from '../../../../../../lib/VueType'
  import ButtonsDeck from '../../../../../shared/ui/ButtonsDeck.svelte'
  import ExportButtons from './exportButtons/ExportButtons.svelte'
  import SetupButtons from './setupButtons/SetupButtons.svelte'

  export let reorderModalDisplayed: boolean = false
  export let zoomUpdate: (plusMinus: '+' | '-') => void
  export let setAllInteractive: (isAllInteractive: boolean) => void
  export let newDataForAll: () => void
  export let trash: () => void
  export let handleExport: (vue: VueType) => void
  export let exportQcmCam: () => Promise<void>
</script>

<ButtonsDeck class="md:pl-10 flex md:flex">
  <div
    slot="setup-buttons"
    class="flex flex-row justify-start items-center gap-3 md:gap-4"
  >
    <SetupButtons
      bind:reorderModalDisplayed
      {zoomUpdate}
      {setAllInteractive}
      {newDataForAll}
      {trash}
    />
  </div>
  <div
    slot="export-buttons"
    data-tour="export-buttons"
    class="flex flex-row justify-end items-center space-x-3 md:space-x-4"
  >
    <ExportButtons {handleExport} {exportQcmCam} />
  </div>
</ButtonsDeck>
