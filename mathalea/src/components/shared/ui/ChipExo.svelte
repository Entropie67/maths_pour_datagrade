<script lang="ts">
  import { exercicesParams } from '../../../lib/stores/generalStore'
  export let text: string = ''
  export let indice: number

  function remove() {
    exercicesParams.update((l) => [
      ...l.slice(0, indice),
      ...l.slice(indice + 1),
    ])
  }
</script>

<!--
  @component
  Chip dédié pour les exercices. Contient un bouton `x` qui permet de le retirer de la liste.

  ### Paramètres

  * `text` : titre du chip
  * `indice` : propre position dans la liste de chips

  ### Utilisation

  ``tsx
  <ChipExo text={id.title} {indice} />
  ```
 -->

<div
  id="exo-{indice}"
  class="flex justify-center w-full items-center rounded-full bg-coopmaths-struct dark:bg-coopmathsdark-struct pl-1 pr-2 py-[1px] shadow-sm cursor-move"
>
  <div
    class="block w-10/12 px-1 text-center text-coopmaths-canvas dark:text-coopmathsdark-canvas text-xs text-ellipsis overflow-hidden whitespace-nowrap"
  >
    {text.replaceAll('_', ' ')}
  </div>
  <button
    class="ml-2 w-2/12 bg-transparent hover focus:outline-none cursor-pointer"
    aria-label="Retirer l'exercice"
    on:click={remove}
  >
    <i
      class="text-coopmaths-action hover:text-coopmaths-action-lightest dark:text-coopmathsdark-action dark:hover:text-coopmathsdark-action-lightest bx bx-x font-semibold text-base"
    ></i>
  </button>
</div>

<style>
</style>
