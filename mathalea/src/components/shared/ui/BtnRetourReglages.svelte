<script lang="ts">
  import { mathaleaGoToView } from '../../../lib/mathaleaUtils'
  import ButtonIconTooltip from '../forms/ButtonIconTooltip.svelte'

  export let icon: string = 'bxs-home'
  export let tooltipPosition: 'auto' | 'top' | 'bottom' | 'left' | 'right' =
    'left'
  let klass: string = ''
  export { klass as class }

  // Retour à la vue prof (réglages) depuis une vue élève / CAN, à l'image de
  // ce que propose déjà la bannière des vues Myriade et Indice.
  function goToVueProf() {
    window.history.replaceState({}, '', window.location.href)
    mathaleaGoToView('')
    window.history.replaceState({}, '', window.location.href)
  }
</script>

<ButtonIconTooltip
  {icon}
  {tooltipPosition}
  tooltip="Page d'accueil du site"
  class={klass}
  on:click={goToVueProf}
/>
