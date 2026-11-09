<script lang="ts">
  import { buildMathAleaURL } from '../../../../../lib/components/urls'
  import ButtonShortLink from '../../../../shared/edurl/ButtonShortLink.svelte'
  import ButtonQRCode from '../../../../shared/forms/ButtonQRCode.svelte'
  import ButtonActionInfo from '../../../../shared/forms/ButtonActionInfo.svelte'
  import ButtonIconTooltip from '../../../../shared/forms/ButtonIconTooltip.svelte'
  import { goToTypstWithSeries } from '../../goToTypstWithSeries'

  export let returnToStart: () => void
  export let backToSettings: () => void
  export let goToOverview: () => void
</script>

<div class="flex flex-row items-baseline justify-center w-full my-4">
  <ButtonIconTooltip
    icon="bx-arrow-back mx-[3vw] my-2 text-[6vw]"
    tooltip="Début du Diaporama"
    on:click={returnToStart}
  />
  <ButtonIconTooltip
    icon="bx-detail mx-[3vw] my-2 text-[6vw]"
    tooltip="Questions + Réponses"
    on:click={goToOverview}
  />
  <ButtonIconTooltip
    icon="bx-printer mx-[3vw] my-2 text-[6vw]"
    tooltip="PDF sujets + corrigés"
    on:click={goToTypstWithSeries}
  />
  <ButtonActionInfo
    action="copy"
    textToCopy={buildMathAleaURL({ view: 'diaporama' }).toString()}
    icon="bx-link text-[6vw] mx-[3vw] my-2"
    tooltip="Lien du Diaporama"
    successMessage="Le lien est copié dans le presse-papier !"
    errorMessage="Impossible de copier le lien dans le presse-papier."
  />
  <ButtonQRCode
    icon="bx-qr text-[6vw] mx-[3vw] my-2"
    tooltip="QR-code du diaporama"
    customUrl={document.URL}
  />
  <ButtonShortLink
    icon="bx-collapse-horizontal text-[6vw] mx-[3vw] my-2"
    tooltip="Lien raccourci du diaporama (edurl.fr)"
    title="Diaporama"
    getUrl={() => buildMathAleaURL({ view: 'diaporama' }).toString()}
  />
  <ButtonIconTooltip
    icon="bx-home-alt-2 text-[6vw] mx-[3vw] my-2"
    tooltip="Sortir du diaporama"
    on:click={backToSettings}
  />
</div>
