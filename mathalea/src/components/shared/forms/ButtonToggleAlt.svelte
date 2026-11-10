<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { getUniqueStringBasedOnTimeStamp } from '../../../lib/components/time'

  export let title: string
  export let explanations = ["Text when it's on", "Text when it's off"]
  export let value: boolean = true
  export let isDisabled: boolean = false
  export let inLine: boolean = false
  export let id = ['toggle-', getUniqueStringBasedOnTimeStamp()].join('')
  const dispatch = createEventDispatcher()

  function toggle() {
    value = !value
    dispatch('toggle')
  }
</script>

<div
  {id}
  class="flex justify-start {$$props.class} {inLine
    ? 'flex-row items-center'
    : 'flex-col items-start'}"
>
  <div class="flex flex-row items-center space-x-1">
    <input
      class="mr-2 mt-[0.3rem] h-3 w-8 appearance-none rounded-[0.4375rem] bg-coopmaths-canvas border-coopmaths-action dark:border-coopmathsdark-action disabled:border-coopmaths-action/10 dark:disabled:border-coopmathsdark-action/10 before:pointer-events-none before:absolute before:h-3 before:w-3 before:rounded-full before:bg-transparent before:content-[''] after:absolute after:z-[2] after:-mt-[0.1875rem] after:h-4 after:w-4 after:rounded-full after:border disabled:after:border-coopmaths-action/10 dark:disabled:after:border-coopmathsdark-action/0 after:border-coopmaths-action dark:after:border-coopmathsdark-action after:bg-coopmaths-canvas-darkest after:shadow-[0_0px_3px_0_rgb(0_0_0_/_7%),_0_2px_2px_0_rgb(0_0_0_/_4%)] after:transition-[background-color_0.2s,transform_0.2s] after:content-[''] checked:bg-coopmaths-action checked:after:absolute checked:after:z-[2] checked:after:-mt-[3px] checked:after:ml-[1.0625rem] checked:after:h-4 checked:after:w-4 checked:after:rounded-full checked:after:border-none checked:after:bg-coopmaths-action checked:after:transition-[background-color_0.2s,transform_0.2s] checked:after:content-[''] disabled:checked:bg-coopmaths-action/10 disabled:checked:after:bg-coopmaths-action/10 dark:disabled:checked:bg-coopmathsdark-action/10 dark:disabled:checked:after:bg-coopmathsdark-action/10 hover:cursor-pointer focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] focus:before:transition-[box-shadow_0.2s,transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-4 focus:after:w-4 focus:after:rounded-full focus:after:content-[''] checked:focus:border-coopmaths-action checked:focus:bg-coopmaths-action checked:focus:before:ml-[1.0625rem] checked:focus:before:scale-100 dark:bg-coopmathsdark-canvas dark:after:bg-coopmathsdark-canvas-darkest dark:checked:bg-coopmathsdark-action dark:checked:after:bg-coopmathsdark-action"
      type="checkbox"
      role="switch"
      id="input-{id}"
      disabled={isDisabled}
      on:change={toggle}
      checked={value}
    />
    <label
      class="inline-block pl-[0.15rem] hover:cursor-pointer text-sm
      {value ? 'font-semibold' : 'font-light'}
      {isDisabled
        ? 'text-coopmaths-corpus/10 dark:text-coopmathsdark-corpus/10'
        : 'text-coopmaths-corpus/70 dark:text-coopmathsdark-corpus/70'}"
      for="input-{id}"
    >
      {title}
    </label>
  </div>
  <div
    class="flex flex-row font-light text-xs
    {isDisabled
      ? 'text-coopmaths-corpus/10 dark:text-coopmathsdark-corpus/10'
      : 'text-coopmaths-corpus/70 dark:text-coopmathsdark-corpus/70'}
    {inLine ? 'px-2 mt-[0.1125rem]' : 'p-2'}"
  >
    {#if value}
      {explanations[0]}
    {:else}
      {explanations[1]}
    {/if}
  </div>
</div>
