<script lang="ts">
  import type { InterfaceGlobalOptions } from '../../../../lib/types'
  import type { CanOptions } from '../../../../lib/types/can'
  import ButtonToggleAlt from '../../../shared/forms/ButtonToggleAlt.svelte'
  import type { ReglagesEleveMode } from './types'

  export let globalOptions: InterfaceGlobalOptions
  export let canOptions: CanOptions
  export let mode: ReglagesEleveMode = 'lien'

  // Sous Capytale, la correction de la Course aux nombres se règle dans
  // sa propre section (accès aux solutions)
  $: isDisabled = mode === 'capytale' && canOptions.isChoosen
</script>

<div class="pb-2">
  <div
    class="pl-2 pb-2 font-bold text-coopmaths-struct-light dark:text-coopmathsdark-struct-light"
  >
    Correction
  </div>
  <div class="flex flex-row justify-start items-center px-4">
    <ButtonToggleAlt
      title={'Accès aux corrections'}
      {isDisabled}
      bind:value={globalOptions.isSolutionAccessible}
      id={'config-eleve-acces-corrections-toggle'}
      explanations={[
        'Les élèves pourront accéder aux corrections en cliquant sur un bouton.',
        "Les élèves n'auront aucun moyen de voir la correction.",
      ]}
    />
  </div>
  <div class="flex flex-row justify-start items-center px-4 pt-2">
    <ButtonToggleAlt
      title={"N'afficher la correction que si la réponse est fausse"}
      isDisabled={isDisabled || !globalOptions.isSolutionAccessible}
      bind:value={globalOptions.isCorrectionOnlyOnError}
      id={'config-eleve-correction-si-erreur-toggle'}
      explanations={[
        'Sous une bonne réponse, seul le smiley sera affiché ; la correction ne sera affichée que sous les mauvaises réponses.',
        'La correction sera affichée sous toutes les questions, bonnes ou mauvaises.',
      ]}
    />
  </div>
</div>
