<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { mathaleaGenerateSeed } from '../../../lib/mathalea'

  export let title: string = ''
  export let placeholder: string = ''
  export let showTitle: boolean = true
  export let value: string | number = ''
  export let isDisabled: boolean = false
  export let inputID: string = mathaleaGenerateSeed()
  export let classAddenda: string = ''
  export let darkBackground: boolean = false
  export let autocomplete: 'on' | 'off' = 'off'
  export let autocorrect: 'on' | 'off' = 'off'
  export let autocapitalize:
    'none' | 'off' | 'on' | 'characters' | 'sentences' | 'words' = 'off'
  export let spellcheck: boolean = false

  const dispatch = createEventDispatcher()

  function handleInput(event: Event) {
    dispatch('input', event)
  }

  function handleChange(event: Event) {
    dispatch('change', event)
  }

  function handlePaste(event: ClipboardEvent) {
    dispatch('paste', event)
  }
</script>

<!--
  @component
  Champ de saisie de texte

  ### Paramètres

  * `title` : titre du champ de texte (situé au-dessus du champ de saisie)
  * `placeholder` : texte de'invite pour le champ
  * `showTitle` : flag permettant de décider de l'affichage du titre au-dessus du champ ou pas
  * `value` : valeur du champ
  * `isDisabled` : flag permettant de désactiver le champ
  * `inputID` : ID du champ
  * `classAddenda` : éléments de style à ajouter à ceux déjà présents ( voir [Tailwindd CSS](https://tailwindcss.com/docs/installation))

  ### Exemple

  ```tsx
  <InputText
    title="Importer les exercices d'une feuille élève"
    placeholder="Lien"
    bind:value={urlFeuilleEleve}
    classAddenda="w-50"
  />
  ```

 -->

<div class="w-full">
  <label
    class="font-light text-sm pr-4
      {showTitle ? 'block' : 'hidden'}
      {isDisabled
      ? 'text-coopmaths-struct/10 dark:text-coopmathsdark-struct/10'
      : 'text-coopmaths-struct dark:text-coopmathsdark-struct'}"
    for={inputID}
  >
    {title}
  </label>
  <input
    type="text"
    id={inputID}
    name={inputID}
    disabled={isDisabled}
    bind:value
    {placeholder}
    {autocomplete}
    {autocorrect}
    {autocapitalize}
    spellcheck={spellcheck ? 'true' : 'false'}
    on:input={handleInput}
    on:change={handleChange}
    on:paste={handlePaste}
    class="block w-full text-sm border h-10 pr-0
      border-coopmaths-action dark:border-coopmathsdark-action
      focus:border-coopmaths-action-lightest dark:focus:border-coopmathsdark-action-lightest
      focus:outline-0 focus:ring-0 focus:border
      {darkBackground
      ? 'bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-dark'
      : 'bg-coopmaths-canvas dark:bg-coopmathsdark-canvas text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light'}
      disabled:opacity-20
      {classAddenda}"
  />
</div>
