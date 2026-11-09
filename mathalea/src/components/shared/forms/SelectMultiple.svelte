<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  export let id: string
  export let value: (string | number)[] = []
  export let options: Array<{
    label: string
    value: string | number
    isDisabled?: boolean
  }> = []
  export let isDisabled: boolean = false
  export let size: number | undefined = undefined
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
  Formulaire de sélection multiple

  ### Action :
  `change` est dispatché lorsque la valeur sélectionnée change

  ### Paramètres :
  * `id` : identifiant unique du select
  * `value` : tableau des valeurs sélectionnées
  * `options` : tableau des options avec label et value
  * `isDisabled` : désactive le select
  * `size` : nombre de lignes visibles
  * `name` : nom du champ pour les formulaires
  * `darkBackground` : variante avec fond sombre
  * `classAddenda` : classes CSS additionnelles
-->

<select
  {id}
  {name}
  multiple
  {size}
  bind:value
  on:change={handleChange}
  disabled={isDisabled}
  class="w-full px-2 py-1
    {darkBackground
    ? 'bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark'
    : 'bg-coopmaths-canvas dark:bg-coopmathsdark-canvas'}
    border rounded
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
