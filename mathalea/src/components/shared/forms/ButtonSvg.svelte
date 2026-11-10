<script lang="ts">
  import { getUniqueStringBasedOnTimeStamp } from '../../../lib/components/time'
  import LatexIcon from '../icons/LatexIcon.svelte'
  export let isDisabled: boolean = false
  export let classDeclaration: string =
    'w-4 h-4 hover:fill-coopmaths-action-lightest fill-coopmaths-action dark:fill-coopmathsdark-action dark:hover:fill-coopmathsdark-action-lightest'
  export let idLabel: string = getUniqueStringBasedOnTimeStamp('btn-')
</script>

<!--
  @component
  Bouton permettant d'inclure une icone déclarée en SVG dans un composant spécifique (icone LaTeX par défaut)

  ### Paramètres

  * `isDisabled` : flag permettant de désactiver le bouton
  * `classDeclaration` : éléments de style ([Tailwind](https://tailwindcss.com/docs/installation))
  * `idLabel` : ID du bouton (`btn-` additionné d'un nombre unique par défaut)

  ### Remarques
  Les éléments de style sont à ajouter normalement au composant par un `class`. Ces éléments viendront s'ajouter
  à ceux déjà présents concernant la couleur du texte. ILs doivent être au format [Tailwind](https://tailwindcss.com/docs/installation).

  ### Exemple

  ```tsx
  <ButtonSvg
    on:click={() => {
      $callerComponent = "tools"
      globalOptions.update((params) => {
        params.v = "moodle"
        return params
      })
    }}
  >
    <div slot="svelte-icon">
      <MoodleIcon class="w-8 h-8 fill-current hover:text-coopmaths-action-lightest text-coopmaths-action dark:text-coopmathsdark-action dark:hover:text-coopmathsdark-action-lightest" />
    </div>
  </ButtonSvg>
  ```
 -->

<button
  type="button"
  class={`${$$props.class || ''}`}
  on:click
  disabled={isDisabled}
  id={idLabel}
>
  <slot name="svelte-icon">
    <LatexIcon class={classDeclaration} />
  </slot>
</button>
