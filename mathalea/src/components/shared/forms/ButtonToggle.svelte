<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { getUniqueStringBasedOnTimeStamp } from '../../../lib/components/time'

  export let titles: string[] = ['', '']
  export let value: boolean = true
  export let isDisabled: boolean = false
  export let classAddenda: string = ''
  export let textSize: string = 'sm'
  export let buttonSize: string = 'sm'
  export let id: string = 'toggle-' + getUniqueStringBasedOnTimeStamp()

  const dispatch = createEventDispatcher()

  function toggle() {
    value = !value
    dispatch('toggle')
  }
</script>

<!--
  @component
  Bouton toogle avec deux états

  __Paramètres__ :

  * `titles` : tableau pour le titre du boutons (un pour `true`, un pour `false`)
  * `value`: booléen lié au bouton
  * `isDisabled`: booléen servant à désactiver le bouton
  * `classAddenda`: chaîne correspondant à des _ajouts_ pour le style

  Usage:
    ```tsx
  <ButtonToggle
      titles={['Titre pour true', 'Titre pour false']}
      bind:value={maVariable}
      isDisabled={variable2 === 0}
      on:click={maFonction}
  />
  ```
 -->
<div class="flex flex-row justify-start items-center {classAddenda}">
  <button
    type="button"
    {id}
    class="flex justify-center items-center"
    on:click={toggle}
    disabled={isDisabled}
    aria-label={value ? titles[0] : titles[1]}
  >
    <i
      class="bx bx-{buttonSize} translate-y-[0.15rem] {value
        ? 'bx-toggle-right'
        : 'bx-toggle-left'}
        {isDisabled ? 'text-coopmaths-action/10 dark:text-coopmathsdark-action/10' : 'text-coopmaths-action hover:text-coopmaths-action-lightest dark:text-coopmathsdark-action dark:hover:text-coopmathsdark-action-lightest'}"
      aria-describedby={value ? titles[0] : titles[1]}
    ></i>
  </button>
  <div
    class="{textSize === 'xs'
      ? 'pl-1'
      : 'pl-2'} inline-block text-{textSize} font-light {isDisabled
      ? 'text-coopmaths-corpus/10 dark:text-coopmathsdark-corpus/10'
      : 'text-coopmaths-corpus/70 dark:text-coopmathsdark-corpus/70'}"
  >
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html `${value ? titles[0] : titles[1]}`}
  </div>
</div>
