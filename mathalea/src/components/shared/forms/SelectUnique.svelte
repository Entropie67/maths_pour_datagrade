<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  export let id: string
  export let value: string | number = ''
  export let options: Array<{
    label: string
    value: string | number
    isDisabled?: boolean
  }> = []
  export let isDisabled: boolean = false
  export let name: string = ''
  export let darkBackground: boolean = false
  export let classAddenda: string = ''

  const dispatch = createEventDispatcher()

  function handleChange() {
    dispatch('change', value)
  }
</script>

<!--
  @component
  Formulaire de sélection unique

  ### Action :
  `change` est dispatché lorsque la valeur sélectionnée change

  ### Paramètres :
  * `id` : identifiant unique du select
  * `value` : valeur sélectionnée
  * `options` : tableau des options avec label et value
  * `isDisabled` : désactive le select
  * `name` : nom du champ pour les formulaires
  * `darkBackground` : variante avec fond sombre
  * `classAddenda` : classes CSS additionnelles
-->

<select
  {id}
  {name}
  bind:value
  on:change={handleChange}
  disabled={isDisabled}
  class="w-full px-2 py-1 h-10
    {darkBackground
    ? 'bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark'
    : 'bg-coopmaths-canvas dark:bg-coopmathsdark-canvas'}
    text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-dark
    border
    border-coopmaths-action dark:border-coopmathsdark-action
    focus:outline-0 focus:ring-0
    focus:border-coopmaths-action-lightest dark:focus:border-coopmathsdark-action-lightest
    disabled:opacity-30
    {classAddenda}"
>
  {#each options as option}
    <option
      value={option.value}
      disabled={option.isDisabled}
      class="bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark"
    >
      {option.label}
    </option>
  {/each}
</select>
