<script lang="ts">
  import ButtonIconTooltip from '../forms/ButtonIconTooltip.svelte'
  import ShortLinkDialog from './ShortLinkDialog.svelte'

  /**
   * Bouton « Lien raccourci (edurl.fr) », à placer à côté des boutons Lien et
   * QR-code : il ouvre une fenêtre qui raccourcit l'URL et la propose à la
   * copie et en QR code.
   */

  /** URL à raccourcir, lue au clic (elle peut avoir changé depuis l'affichage) */
  export let getUrl: () => string
  /** Nom du lien dans edurl.fr (titre du document, du quizz…) */
  export let title: string = ''
  // deux flèches qui se rapprochent : ne se confond pas avec le bouton qui copie le lien complet
  export let icon: string = 'bx-collapse-horizontal text-2xl'
  export let cornerIcon: string = ''
  export let cornerIconClass: string = ''
  export let tooltip: string = 'Lien raccourci (edurl.fr)'
  export let disabled: boolean = false

  let isOpen = false
</script>

<ButtonIconTooltip
  {icon}
  {tooltip}
  {disabled}
  {cornerIcon}
  {cornerIconClass}
  class={$$props.class || ''}
  on:click={() => (isOpen = true)}
/>

<ShortLinkDialog
  open={isOpen}
  {getUrl}
  {title}
  onclose={() => (isOpen = false)}
/>
