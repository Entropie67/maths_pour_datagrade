<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  type Segment = {
    id: string
    label: string
    ariaControls?: string
  }

  /**
   * Choix exclusif entre deux ou trois modes, avec des segments dans une même
   * pastille : le segment actif est plein (couleur d'action, texte clair et
   * coche), les autres restent discrets. Même interface que `Tabs`.
   */
  export let tabs: Segment[]
  export let activeTab: string

  const dispatch = createEventDispatcher<{ change: string }>()
</script>

<div
  class="flex flex-row gap-1 p-1 rounded-full border border-coopmaths-action/40 dark:border-coopmathsdark-action/40 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark"
  role="tablist"
>
  {#each tabs as tab}
    <button
      type="button"
      id="{tab.id}-btn"
      class="flex-1 flex flex-row items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-bold uppercase leading-tight transition-colors
      {activeTab === tab.id
        ? 'bg-coopmaths-action text-coopmaths-canvas dark:bg-coopmathsdark-action dark:text-coopmathsdark-canvas shadow-md'
        : 'bg-transparent text-coopmaths-action dark:text-coopmathsdark-action hover:bg-coopmaths-action/10 dark:hover:bg-coopmathsdark-action/20'}"
      role="tab"
      aria-controls={tab.ariaControls ?? tab.id}
      aria-selected={activeTab === tab.id}
      on:click={() => dispatch('change', tab.id)}
    >
      <i
        class="bx bx-check text-xl {activeTab === tab.id ? '' : 'invisible'}"
        aria-hidden="true"
      ></i>
      {tab.label}
    </button>
  {/each}
</div>
