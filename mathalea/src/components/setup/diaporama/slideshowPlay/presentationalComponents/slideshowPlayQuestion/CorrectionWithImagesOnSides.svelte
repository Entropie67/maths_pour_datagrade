<script lang="ts">
  import type { Vue } from '../../../types'

  export let slideView: Vue
</script>

<div>
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html slideView.correctionText}
</div>
<div>
  {#each slideView.correctionSvgs as correctionSvg}
    <div>
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html correctionSvg}
    </div>
  {/each}
</div>
