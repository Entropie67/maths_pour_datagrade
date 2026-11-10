<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  /**
   * Nombre de fois où l'élément est sélectionné.
   * L'indicateur n'est rendu que si selectedCount >= 1.
   */
  export let selectedCount: number

  const dispatch = createEventDispatcher<{ remove: void }>()
</script>

<!--
  @component
  Indicateur de sélection positionné en absolu à gauche de son conteneur parent.

  Affiche un carré orange (icône bxs-message-alt) qui se transforme en poubelle
  au survol, permettant de retirer une occurrence de l'élément de la sélection.
  Un badge numérique est superposé si l'élément est sélectionné plus d'une fois.

  #### Prérequis CSS du parent
  Le conteneur parent doit avoir `position: relative` et suffisamment de
  padding / margin à gauche (≥ 1rem / 16px) pour que le bouton ne chevauche
  pas le contenu. La classe Tailwind `ml-4` sur le parent convient.

  #### Usage
  ```svelte
  <li class="relative ml-4">
    <SelectedIndicator {selectedCount} on:remove={handleRemove} />
    <button on:click={handleAdd}>…</button>
  </li>
  ```

  #### Événements
  - **remove** — émis au clic ou à la touche sur l'indicateur
-->
{#if selectedCount >= 1}
  <button
    type="button"
    class="absolute -left-4 top-1/2 -translate-y-1/2 group"
    on:click={() => dispatch('remove')}
    on:keydown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') dispatch('remove')
    }}
    aria-label="Retirer de la sélection"
  >
    <div class="relative">
      <!-- Carré orange (état par défaut) -->
      <i
        class="text-base bx bxs-message-alt -rotate-90
               text-coopmaths-action-light dark:text-coopmathsdark-action-light
               opacity-100 group-hover:opacity-0 transition-opacity"
      ></i>
      <!-- Poubelle (apparaît au survol) -->
      <i
        class="text-base bx bx-trash
               absolute top-0 -left-0.5
               text-coopmaths-action-light dark:text-coopmathsdark-action-light
               opacity-0 group-hover:opacity-100 transition-opacity"
      ></i>
    </div>

    <!-- Badge numérique quand l'élément est sélectionné plusieurs fois -->
    {#if selectedCount >= 2}
      <div
        class="absolute left-1 top-0.5 text-[0.6rem] font-bold
               text-coopmaths-canvas dark:text-coopmathsdark-canvas-dark
               group-hover:hidden"
      >
        {selectedCount}
      </div>
    {/if}
  </button>
{/if}
