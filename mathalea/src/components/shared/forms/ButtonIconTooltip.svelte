<script lang="ts">
  import ButtonIcon from './ButtonIcon.svelte'
  export let icon: string
  /** Texte de l'infobulle, repris comme nom accessible du bouton */
  export let tooltip: string
  export let tooltipPosition: 'auto' | 'top' | 'bottom' | 'left' | 'right' =
    'bottom'
  export let title: string = ''
  export let disabled: boolean = false
  export let floatUnderText: string = ''
  export let cornerIcon: string = ''
  export let cornerIconClass: string = ''
</script>

<!-- À la différence de ButtonIcon qui est vraiment un bouton, ButtonIconTooltip est un div qui contient un bouton -->

<div
  class="tooltip tooltip-neutral"
  class:tooltip-top={tooltipPosition === 'top'}
  class:tooltip-bottom={tooltipPosition === 'bottom'}
  class:tooltip-left={tooltipPosition === 'left'}
  class:tooltip-right={tooltipPosition === 'right'}
  data-tip={tooltip}
>
  <ButtonIcon
    class={$$props.class || ''}
    {icon}
    {title}
    ariaLabel={tooltip}
    {disabled}
    {floatUnderText}
    {cornerIcon}
    {cornerIconClass}
    on:click
  />
</div>
