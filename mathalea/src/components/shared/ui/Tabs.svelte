<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  type Tab = {
    id: string
    label: string
    ariaControls?: string
  }

  export let tabs: Tab[]
  export let activeTab: string

  const dispatch = createEventDispatcher<{ change: string }>()

  function handleClick(tabId: string) {
    dispatch('change', tabId)
  }
</script>

<ul
  class="flex list-none flex-row flex-wrap border-b-0 pl-0 pt-0 bg-coopmaths-canvas-darkest dark:bg-coopmathsdark-canvas"
  role="tablist"
>
  {#each tabs as tab}
    <li role="presentation" class="flex-grow basis-0 text-center">
      <button
        type="button"
        id="{tab.id}-btn"
        class="relative block w-full font-extrabold px-7 pb-3.5 pt-4 text-base uppercase leading-tight hover:isolate focus:isolate
        {activeTab === tab.id
          ? 'bg-coopmaths-canvas text-coopmaths-struct dark:bg-coopmathsdark-canvas dark:text-coopmathsdark-struct'
          : 'bg-coopmaths-canvas-darkest text-coopmaths-action dark:bg-coopmathsdark-canvas-darkest dark:text-coopmathsdark-action hover:bg-coopmaths-action/10 dark:hover:bg-coopmathsdark-action/20'}"
        role="tab"
        aria-controls={tab.ariaControls ?? tab.id}
        aria-selected={activeTab === tab.id}
        on:click={() => handleClick(tab.id)}
      >
        {tab.label}
      </button>
    </li>
  {/each}
</ul>
