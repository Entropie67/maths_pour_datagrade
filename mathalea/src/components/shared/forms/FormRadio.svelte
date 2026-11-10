<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  type FlexOrientation = 'col' | 'row'

  export let title: string
  export let valueSelected: string | number
  export let labelsValues: {
    label: string
    value: string | number
    isDisabled?: boolean
  }[] = []
  export let isDisabled: boolean = false
  export let orientation: FlexOrientation = 'col'

  const name =
    title !== undefined
      ? title
          .replaceAll(' ', '')
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
      : Math.round(new Date().getTime()).toString()
  const dispatch = createEventDispatcher()
  function valueHasChanged() {
    dispatch('newvalue')
  }
</script>

<!--
  @component
  Formulaire avec boutons radios

  ### Action :

  `newvalue` est dispatché lorsque la valeur du groupe de question a changé

  ### Paramètres :

  * `title` :  titre du groupe de boutons
  * `isDisabled`: booléen servant à désactiver le groupe

  ### Exemple :

    ```tsx
  <FormRadio
      isDisabled={maVariable2 === 0}
      bind:valueSelected={maVariable}
      labelsValues={[
          { label: 'Titre du label 1', value: '1' },
          { label: 'Titre du label 2', value: '2', isDisabled: true }
      ]}
      on:newvalue={() => {do_something}}
  />
  ```
 -->

<div
  class="flex justify-start items-start mt-1"
  class:flex-col={orientation === 'col'}
  class:flex-row={orientation === 'row'}
>
  {#each labelsValues as labelValue, i}
    <div class="form-check flex flex-row ml-4 items-center">
      <input
        class="form-check-input rounded-full h-4 w-4 mt-1 mr-2 border
          transition duration-200 focus:outline-0 focus:ring-0
          text-coopmaths-action dark:text-coopmathsdark-action
          bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark
          border-coopmaths-action dark:border-coopmathsdark-action
          checked:border-coopmaths-action dark:checked:border-coopmathsdark-action
          active:border-coopmaths-action dark:active:border-coopmathsdark-action
          focus:border-coopmaths-action dark:focus:border-coopmathsdark-action
          checked:bg-coopmaths-action dark:checked:bg-coopmathsdark-action
          {isDisabled || labelValue.isDisabled ? '' : 'cursor-pointer'}"
        type="radio"
        {name}
        id={name + i.toString()}
        bind:group={valueSelected}
        value={labelValue.value}
        disabled={isDisabled || labelValue.isDisabled}
        on:change={valueHasChanged}
      />
      <label
        class="form-check-label inline-block text-sm
          {valueSelected === labelValue.value ? 'font-semibold' : 'font-light'}
          {isDisabled || labelValue.isDisabled
          ? 'text-coopmaths-corpus/10 dark:text-coopmathsdark-corpus/10'
          : 'text-coopmaths-corpus/70 dark:text-coopmathsdark-corpus/70 cursor-pointer'}"
        for={name + i.toString()}
      >
        {labelValue.label}
      </label>
    </div>
  {/each}
</div>
