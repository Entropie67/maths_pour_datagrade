<script lang="ts">
  import ButtonText from './ButtonText.svelte'
  export let text: string
  export let title: string = ''
  export let disabled: boolean = false
  export let icon: string = ''
  export let inverted: boolean = false
  export let iconFirst = true

  $: buttonClass = [
    $$props.class || 'rounded-lg py-1 px-2',
    disabled
      ? [
          'cursor-not-allowed',
          'bg-coopmaths-action/40',
          'text-coopmaths-canvas/70',
          'hover:bg-coopmaths-action/40',
          'dark:bg-coopmathsdark-action/10',
          'dark:text-coopmathsdark-canvas/50',
          'dark:hover:bg-coopmathsdark-action/10',
          inverted ? 'border border-coopmaths-action/40' : '',
        ].join(' ')
      : inverted
        ? [
            'border border-coopmaths-action',
            'text-coopmaths-action dark:text-coopmathsdark-action',
            'bg-coopmaths-canvas dark:bg-coopmathsdark-canvas',
            'hover:bg-coopmaths-action dark:hover:bg-coopmathsdark-action',
            'hover:text-coopmaths-canvas dark:hover:text-coopmathsdark-canvas',
          ].join(' ')
        : [
            'text-coopmaths-canvas dark:text-coopmathsdark-canvas',
            'bg-coopmaths-action dark:bg-coopmathsdark-action',
            'hover:bg-coopmaths-action-lightest dark:hover:bg-coopmathsdark-action-lightest',
          ].join(' '),
  ].join(' ')
</script>

<ButtonText
  id={$$props.id}
  class={buttonClass}
  {text}
  {title}
  {disabled}
  {icon}
  {inverted}
  {iconFirst}
  on:click
/>
