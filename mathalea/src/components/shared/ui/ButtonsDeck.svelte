<script lang="ts">
  export let setupButtonsList = [
    { bxName: 'bx-zoom-in' },
    { bxName: 'bx-zoom-out' },
    { bxName: 'bx-refresh' },
    { bxName: 'bx-trash' },
    { bxName: 'bx-fullScreen' },
  ]
  export let exportButtonsList = [
    { bxName: 'bx-slideshow' },
    { bxName: 'bxs-graduation' },
  ]
</script>

<!--
  @component
  Container pour positionner les boutons de réglages généraux de la liste des exercices

  ### Paramètres

  * `setupButtonsList` : liste d'icônes à afficher
  * `exportButtonsList` : idem
  * `barWidthPercentage` : pourcentage pour le calcul de la longueur de la barre...

  ### Remarque

  Les paramètres `setupButtonsList` et `exportButtonsList` ne sont utiles que pour calibrer la barre des boutons.
  Dans les faits, la déclaration des boutons se fait dans

  ```tsx
  <div slot="setup-buttons" ...>
    boutons ici
  </div>
  ```
  et dans

  ```tsx
  <div slot="export-buttons" ...>
    boutons ici
  </div>
  ```
 -->

<div
  class={`${
    $$props.class || ''
  } flex flex-col w-full md:flex-row justify-start items-start sm:justify-center sm:items-center`}
>
  <div class="relative flex flex-col w-full">
    <div
      class="w-full flex flex-col lg:flex-row lg:pr-4 justify-between items-center bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
    >
      <div id="setupButtonsBar" class="flex">
        <slot name="setup-buttons">
          {#each setupButtonsList as button}
            <i
              class="bx bx-sm px-2 {button.bxName} hover:text-coopmaths-action-lightest text-coopmaths-action dark:text-coopmathsdark-action dark:hover:text-coopmathsdark-action-lightest"
            ></i>
          {/each}
        </slot>
      </div>
      {#if $$slots.input}
        <div id="input">
          <slot name="input" />
        </div>
      {/if}
      {#if $$slots['export-buttons']}
        <div id="exportButtonsBar" class="xl:pr-6">
          <slot name="export-buttons">
            {#each exportButtonsList as button}
              <i
                class="bx bx-sm px-2 {button.bxName} hover:text-coopmaths-action-lightest text-coopmaths-action dark:text-coopmathsdark-action dark:hover:text-coopmathsdark-action-lightest"
              ></i>
            {/each}
          </slot>
        </div>
      {/if}
    </div>
  </div>
</div>
