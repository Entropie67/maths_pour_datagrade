<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { CoopmathsColor } from '../../../../../../../lib/types'
  export let text = ''
  export let bgColor: CoopmathsColor = 'warn'
  export let textColor: CoopmathsColor = 'corpus'
  export let isVisible: boolean = true

  // Au clic sur le bouton, on diffuse _action_
  const dispatch = createEventDispatcher()

  function triggerAction() {
    dispatch('action', {
      msg: 'Action triggered !',
    })
  }
</script>

<!--
  @component
  Chip avec bouton pour fermeture

  ### Paramètres

  * `text` : titre affiché dans le chip
  * `textColor` : couleur du texte
  * `bgColor` : couleur de l'arrière-plan du chip
  * `isVisible` : flag permettant de cacher le chip

  ### Action

  `action` est diffusée lorsque le bouton de fermeture est cliqué et sera récupérée dans le composant par `on:action`

  ### Exemple
  ```tsx
  <Chip
    text={(levelsMap.get(filter) ?? typesMap.get(filter)).title}
    textColor="canvas"
    bgColor="struct"
    isVisible={selectedFilters.includes(filter)}
    on:action={() => {
      updateFilters(filter)
    }}
  />
  ```
 -->

<div
  class="{isVisible
    ? 'inline-flex'
    : 'hidden'} flex-wrap scale-75 mr-1 items-center justify-center rounded-full bg-coopmaths-{bgColor} dark:bg-coopmathsdark-{bgColor} text-coopmaths-{textColor} dark:text-coopmathsdark-{textColor} text-xs px-2 py-[1px] shadow-sm"
>
  {text}
  <button
    class="ml-1 bg-transparent hover focus:outline-none cursor-pointer"
    aria-label="Retirer le filtre"
    on:click={triggerAction}
  >
    <i
      class="text-coopmaths-action hover:text-coopmaths-action-lightest dark:text-coopmathsdark-action dark:hover:text-coopmathsdark-action-lightest bx bx-x font-semibold text-base"
    ></i>
  </button>
</div>
