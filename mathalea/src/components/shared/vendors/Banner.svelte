<script lang="ts">
  import BtnRetourReglages from '../ui/BtnRetourReglages.svelte'

  export let brandImagePath: string | null = null
  export let productImagePath: string | null =
    'assets/images/vendors/bordas/myriade-bordas-logo.png'
  export let icon: string = 'bxs-home'
</script>

<div
  id="vendor-banner"
  class="flex flex-col items-center justify-center w-full px-2 lg:px-8 bg-coopmaths-canvas"
>
  <div class="flex items-center justify-between w-full p-4">
    <img
      src="assets/svg/logo_mathalea.svg"
      alt="Dé MathALÉA"
      class="h-7 lg:h-9"
    />
    <div class="flex flex-row m-0 p-0 items-center justify-center space-x-3">
      <img class="h-6 lg:h-8" src={productImagePath} alt="Manual" />
      {#if brandImagePath}
        <img class="h-6 lg:h-8" src={brandImagePath} alt="Brand" />
      {/if}
    </div>
    <BtnRetourReglages
      {icon}
      tooltipPosition="bottom"
      class="hidden lg:block text-3xl"
    />
  </div>
  <BtnRetourReglages
    {icon}
    tooltipPosition="bottom"
    class="block lg:hidden text-3xl"
  />
</div>
