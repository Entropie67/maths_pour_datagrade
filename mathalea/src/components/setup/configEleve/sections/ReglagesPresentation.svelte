<script lang="ts">
  import type { InterfaceGlobalOptions } from '../../../../lib/types'
  import { exercicesParams } from '../../../../lib/stores/generalStore'
  import ButtonToggleAlt from '../../../shared/forms/ButtonToggleAlt.svelte'
  import FormRadio from '../../../shared/forms/FormRadio.svelte'
  import InputText from '../../../shared/forms/InputText.svelte'

  export let globalOptions: InterfaceGlobalOptions

  let presMode: NonNullable<InterfaceGlobalOptions['presMode']> =
    globalOptions.presMode ?? 'liste_exos'
</script>

<div class="pb-2 w-full flex flex-col">
  <div
    class="pl-2 pb-2 font-bold text-coopmaths-struct-light dark:text-coopmathsdark-struct-light"
  >
    Présentation
  </div>
  <div class="pl-4 pb-4 w-full flex flex-col">
    <div class="flex flex-row items-center">
      <div
        class="shrink-0 whitespace-nowrap text-sm font-light text-coopmaths-corpus/70 dark:text-coopmathsdark-corpus/70"
      >
        Titre&nbsp;:
      </div>
      <InputText
        inputID="config-eleve-titre-input"
        bind:value={globalOptions.title}
        showTitle={false}
        classAddenda="font-light m-2"
      />
    </div>
    <div
      class="mt-1 text-coopmaths-corpus font-light italic text-xs {!globalOptions.title ||
      globalOptions.title.length === 0
        ? ''
        : 'invisible'}"
    >
      Pas de bandeau si laissé vide.
    </div>
  </div>
  <FormRadio
    title="présentation"
    bind:valueSelected={presMode}
    on:newvalue={() => (globalOptions.presMode = presMode)}
    labelsValues={[
      {
        label: 'Tous les exercices sur une page',
        value: 'liste_exos',
      },
      {
        label: 'Une page par exercice',
        value: 'un_exo_par_page',
        isDisabled: $exercicesParams.length === 1,
      },
      {
        label: 'Une page par question',
        value: 'une_question_par_page',
      },
      // { label: 'Cartes', value: 'cartes' }
    ]}
  />
  <div class="pl-4 pt-4">
    <ButtonToggleAlt
      title={'Deux colonnes'}
      isDisabled={globalOptions.presMode === 'un_exo_par_page' ||
        globalOptions.presMode === 'une_question_par_page'}
      bind:value={globalOptions.twoColumns}
      id={'config-eleve-nb-colonnes-toggle'}
      explanations={[
        'Les exercices seront présentés sur deux colonnes.',
        'Les exercices seront présentés sur une seule colonne.',
      ]}
    />
  </div>
</div>
