<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  export let id: string
  export let isChecked: boolean
  export let isDisabled: boolean = false
  export let label: string = ''
  export let size: 'sm' | 'md' = 'md'
  export let darkBackground: boolean = false

  const dispatch = createEventDispatcher()

  $: sizeClass = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'
  $: fontSize = size === 'sm' ? 'text-xs' : 'text-sm'
</script>

<div
  class="flex flex-row justify-start items-center p-1
  {isDisabled ? 'opacity-30' : ''}"
>
  <input
    {id}
    aria-describedby={id}
    type="checkbox"
    class="{sizeClass} rounded
      {darkBackground
      ? 'bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark'
      : 'bg-coopmaths-canvas dark:bg-coopmathsdark-canvas'}
      {isDisabled
      ? 'border-coopmaths-action/20 dark:border-coopmathsdark-action/20'
      : 'border-coopmaths-action dark:border-coopmathsdark-action cursor-pointer'}
      checked:bg-coopmaths-action dark:checked:bg-coopmathsdark-action
      focus:ring-3
      focus:ring-coopmaths-action dark:focus:ring-coopmathsdark-action"
    bind:checked={isChecked}
    on:change={() => dispatch('change', isChecked)}
    disabled={isDisabled}
  />
  {#if label}
    <label
      for={id}
      class="ml-3 {fontSize} font-light
        {isDisabled ? '' : 'cursor-pointer'}"
    >
      {label}
    </label>
  {/if}
</div>
