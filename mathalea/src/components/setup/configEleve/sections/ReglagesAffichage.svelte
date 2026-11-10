<script lang="ts">
  import type { InterfaceGlobalOptions } from '../../../../lib/types'
  import ButtonToggleAlt from '../../../shared/forms/ButtonToggleAlt.svelte'

  export let globalOptions: InterfaceGlobalOptions
  /** Appelé après chaque bascule d'un affichage (titre ou référence) */
  export let onToggle: () => void = () => {}
</script>

<div class="pb-2">
  <div
    class="pl-2 pb-2 font-bold text-coopmaths-struct-light dark:text-coopmathsdark-struct-light"
  >
    Affichage du titre de l'exercice
  </div>
  <div class="flex flex-row justify-start items-center px-4">
    <ButtonToggleAlt
      title={"Titre de l'exercice"}
      bind:value={globalOptions.isTitleDisplayed}
      id={'config-eleve-title-displayed-toggle'}
      explanations={['Les titres sont affichés', 'Les titres sont masqués.']}
      on:toggle={onToggle}
    />
  </div>
</div>
<div class="pb-2">
  <div
    class="pl-2 pb-2 font-bold text-coopmaths-struct-light dark:text-coopmathsdark-struct-light"
  >
    Affichage de la référence de l'exercice
  </div>
  <div class="flex flex-row justify-start items-center px-4">
    <ButtonToggleAlt
      title={"Référence de l'exercice"}
      bind:value={globalOptions.isReferenceDisplayed}
      id={'config-eleve-reference-displayed-toggle'}
      explanations={[
        'Les références sont affichées',
        'Les références sont masquées.',
      ]}
      on:toggle={onToggle}
    />
  </div>
</div>
