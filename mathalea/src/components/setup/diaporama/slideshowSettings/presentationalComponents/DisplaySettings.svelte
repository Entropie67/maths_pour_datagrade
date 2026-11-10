<script lang="ts">
  import ButtonIconTooltip from '../../../../shared/forms/ButtonIconTooltip.svelte'
  import FullscreenButton from '../../../start/presentationalComponents/header/headerButtons/setupButtons/FullscreenButton.svelte'

  export let goToOverview: () => void
</script>

<div class="flex flex-row justify-start items-center pb-6">
  <div
    class="flex text-lg font-bold
    text-coopmaths-struct dark:text-coopmathsdark-struct"
  >
    Aperçu
  </div>
  <div class="pl-4">
    <ButtonIconTooltip
      icon="bx-detail text-2xl"
      tooltip="Aperçu des questions/réponses"
      on:click={goToOverview}
    />
  </div>
  <div class="pl-4">
    <FullscreenButton />
  </div>
</div>
