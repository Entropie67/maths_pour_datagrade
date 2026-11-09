<script lang="ts">
  export let text: string
  export let title: string = ''
  export let disabled: boolean = false
  export let icon: string = ''
  export let iconFirst: boolean = true
</script>

<button
  type="button"
  title={title || undefined}
  id={$$props.id}
  class="{$$props.class ||
    'rounded-lg py-1 px-2'} inline-flex items-center justify-center gap-2"
  {disabled}
  on:click
>
  {#if iconFirst}
    {#if icon !== ''}
      <i class="bx {icon} shrink-0" aria-hidden="true"></i>
    {/if}
    {text}
  {:else}
    {text}
    {#if icon !== ''}
      <i class="bx {icon} shrink-0" aria-hidden="true"></i>
    {/if}
  {/if}
</button>
