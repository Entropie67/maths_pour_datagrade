<script lang="ts">
  import type { InterfaceGlobalOptions } from '../../../../lib/types'
  import type { CanOptions } from '../../../../lib/types/can'
  import ButtonToggleAlt from '../../../shared/forms/ButtonToggleAlt.svelte'
  import FormRadio from '../../../shared/forms/FormRadio.svelte'
  import type { ReglagesEleveMode } from './types'

  export let globalOptions: InterfaceGlobalOptions
  export let canOptions: CanOptions
  export let mode: ReglagesEleveMode = 'lien'

  // Relu depuis les options pour suivre les changements extérieurs
  // (par exemple `toggleCan` qui impose « Tout interactif »)
  $: setInteractive = globalOptions.setInteractive ?? '2'
  // Sous Capytale, la Course aux nombres impose l'interactivité
  $: isRadioDisabled = mode === 'capytale' && canOptions.isChoosen
</script>

<div class="pb-2">
  <div
    class="pl-2 pb-2 font-bold text-coopmaths-struct-light dark:text-coopmathsdark-struct-light"
  >
    Interactivité
  </div>
  <FormRadio
    title="Interactif"
    bind:valueSelected={setInteractive}
    isDisabled={isRadioDisabled}
    on:newvalue={() => (globalOptions.setInteractive = setInteractive)}
    labelsValues={[
      { label: 'Laisser tel quel', value: '2' },
      { label: 'Tout interactif', value: '1' },
      { label: "Pas d'interactivité", value: '0' },
    ]}
  />
  {#if mode === 'lien'}
    <div class="pl-2 pt-4">
      <ButtonToggleAlt
        title={"Modifier l'interactivité"}
        bind:value={globalOptions.isInteractiveFree}
        id={'config-eleve-interactif-permis-toggle'}
        explanations={[
          "Les élèves peuvent rendre l'exercice interactif ou pas.",
          "Les élèves ne pourront pas changer le statut de l'interactivité.",
        ]}
      />
    </div>
  {/if}
  <div class="pl-2 pt-2">
    <ButtonToggleAlt
      title={'Une seule réponse'}
      isDisabled={globalOptions.setInteractive === '0'}
      bind:value={globalOptions.oneShot}
      id={'config-eleve-refaire-toggle'}
      explanations={[
        "Les élèves n'auront qu'une seule possibilité pour répondre aux exercices.",
        "Les élèves pourront refaire les exercices autant de fois qu'ils le souhaitent.",
      ]}
    />
  </div>
  <div class="pl-2 pt-2">
    <ButtonToggleAlt
      title={'Vérifier question par question'}
      bind:value={globalOptions.isCheckPerQuestion}
      id={'config-eleve-verifier-par-question-toggle'}
      explanations={[
        'Chaque question interactive aura son bouton « Vérifier ». Sans interactivité, la correction pourra être dévoilée question par question, ou sous-question par sous-question si l’énoncé le permet.',
        "Les élèves vérifieront toutes les réponses d'un exercice en une seule fois.",
      ]}
    />
  </div>
</div>
