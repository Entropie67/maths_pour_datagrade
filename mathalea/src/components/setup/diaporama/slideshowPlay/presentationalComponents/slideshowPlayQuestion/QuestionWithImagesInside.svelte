<script lang="ts">
  import { renderDiv } from '../../../../../../lib/mathalea'
  import type { Vue } from '../../../types'

  export let slideView: Vue
</script>

<div class="flex flex-col">
  <div>
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html slideView.consigne}
  </div>
  {#key slideView.question}
    <div use:renderDiv={slideView.question}>
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html slideView.question}
    </div>
  {/key}
</div>
