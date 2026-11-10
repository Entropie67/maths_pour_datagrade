<script lang="ts">
  import ButtonIcon from '../../../../../shared/forms/ButtonIcon.svelte'
  import FullscreenButton from '../../../../start/presentationalComponents/header/headerButtons/setupButtons/FullscreenButton.svelte'

  export let zoomPlus: () => void
  export let zoomMinus: () => void
  export let BUTTONS_CLASS: string
</script>

<FullscreenButton />
<ButtonIcon
  icon="bx-plus {BUTTONS_CLASS}"
  ariaLabel="Agrandir l'affichage"
  title="Raccourci clavier : +"
  on:click={zoomPlus}
/>
<ButtonIcon
  icon="bx-minus {BUTTONS_CLASS}"
  ariaLabel="Réduire l'affichage"
  title="Raccourci clavier : -"
  on:click={zoomMinus}
/>
