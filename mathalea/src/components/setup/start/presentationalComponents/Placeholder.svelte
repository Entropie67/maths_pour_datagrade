<script lang="ts">
  import { getLang } from '../../../../lib/stores/languagesStore'
  import { globalOptions } from '../../../../lib/stores/globalOptions'
  import Footer from '../../../Footer.svelte'
  import Carousel from './carousel/Carousel.svelte'
  import QuickLinks from './QuickLinks.svelte'
  import VitrineAsso from './VitrineAsso.svelte'

  export let text: string
  const lang = getLang()

  // PHASE-BETA-VITRINE : la vitrine de l'association (contenu externalisé
  // sur coopmaths.fr/www) remplace les liens rapides et le carrousel. Pour
  // l'ouvrir à tous, retirer la condition sur `beta` (et l'ancien bloc).
  let isVitrineUnavailable = false
  $: isVitrineDisplayed = !isVitrineUnavailable
</script>

<!-- La vitrine peut dépasser la hauteur de l'écran : on laisse alors la zone
     des exercices défiler, alors que le carrousel historique remplit la hauteur. -->
<div class="relative flex-1 {isVitrineDisplayed ? 'min-h-full' : 'h-full'}">
  <div
    class="flex flex-col justify-between {isVitrineDisplayed
      ? 'min-h-full'
      : 'h-full'} text-coopmaths-corpus dark:text-coopmathsdark-corpus md:px-10 py-6"
  >
    <!-- <div class="bg-coopmaths-canvas">
      <span class="text-coopmaths-canvas">&nbsp;</span>  <- Décommenter si pas d'Advertising
    </div> -->
    <!-- <Advertising /> -->
    {#if lang === 'fr-FR'}
      <div
        class="hidden md:flex md:flex-col {isVitrineDisplayed
          ? ''
          : 'md:h-full'} gap-3"
      >
        {#if isVitrineDisplayed}
          <VitrineAsso onUnavailable={() => (isVitrineUnavailable = true)} />
        {:else}
          <QuickLinks />
          <div class="flex-1 min-h-0">
            <Carousel />
          </div>
        {/if}
      </div>
    {/if}
    <div
      class="animate-pulse flex flex-col md:flex-row justify-start space-x-6 items-center {lang !==
      'fr-FR'
        ? 'mt-32 md:mt-40'
        : 'md:hidden'}"
    >
      <div class="mt-[10px]">
        <div class="hidden md:inline-flex">
          <i class="bx bx-chevron-left text-[50px]"></i>
        </div>
        <div class="inline-flex md:hidden">
          <i class="bx bx-chevron-up text-[50px]"></i>
        </div>
      </div>
      <div class="font-extralight text-[50px]">
        {text}
      </div>
    </div>
    <div class="invisible sm:visible flex items-center justify-center">
      <Footer />
    </div>
  </div>
</div>
