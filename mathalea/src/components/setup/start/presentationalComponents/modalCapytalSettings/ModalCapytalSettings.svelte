<script lang="ts">
  import type { InterfaceGlobalOptions } from '../../../../../lib/types'
  import type { CanOptions } from '../../../../../lib/types/can'
  import ButtonTextAction from '../../../../shared/forms/ButtonTextAction.svelte'
  import BasicClassicModal from '../../../../shared/modal/BasicClassicModal.svelte'
  import SegmentedControl from '../../../../shared/ui/SegmentedControl.svelte'
  import ReglagesCan from '../../../configEleve/sections/ReglagesCan.svelte'
  import ReglagesClassique from '../../../configEleve/sections/ReglagesClassique.svelte'
  import ReglagesDonnees from '../../../configEleve/sections/ReglagesDonnees.svelte'

  export let isSettingsDialogDisplayed = false
  export let globalOptions: InterfaceGlobalOptions
  export let canOptions: CanOptions
  export let toggleCan: () => void
  export let buildUrlAndOpenItInNewTab: (status: 'eleve' | 'usual') => void
  export let updateParams: (params: {
    globalOptions: InterfaceGlobalOptions
    canOptions: CanOptions
  }) => void

  const params = {
    globalOptions,
    canOptions,
  }

  $: if (globalOptions) {
    params.globalOptions = globalOptions
  }

  $: if (canOptions) {
    params.canOptions = canOptions
  }

  const tabs = [
    {
      id: 'classic',
      label: 'Présentation classique',
      ariaControls: 'tabs-pres-classic',
    },
    { id: 'can', label: 'Course aux nombres', ariaControls: 'tabs-pres-can' },
  ]

  $: activeTab = params.canOptions.isChoosen ? 'can' : 'classic'

  function handleTabChange(e: CustomEvent<string>) {
    params.canOptions.isChoosen = e.detail === 'can'
    toggleCan()
  }
</script>

<BasicClassicModal
  bind:isDisplayed={isSettingsDialogDisplayed}
  on:close={() => updateParams(params)}
>
  <div slot="header">Réglages de l'affichage des exercices</div>
  <div slot="content" class="pt-2 pl-2 text-justify font-light">
    <!-- Le contenu n'est monté qu'à l'ouverture : les champs partagent leurs
         identifiants avec la page de configuration du lien élève -->
    {#if isSettingsDialogDisplayed}
      <div class="px-4 pb-2">
        <SegmentedControl {tabs} {activeTab} on:change={handleTabChange} />
        <div
          class="pt-2 text-center text-sm font-light text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light"
        >
          {#if activeTab === 'can'}
            Les questions seront posées les unes à la suite des autres en temps
            limité.
          {:else}
            Les exercices seront posés suivant les réglages ci-dessous.
          {/if}
        </div>
      </div>
      {#if activeTab === 'classic'}
        <div id="tabs-pres-classic" role="tabpanel">
          <ReglagesClassique
            bind:globalOptions={params.globalOptions}
            canOptions={params.canOptions}
            mode="capytale"
          />
        </div>
      {:else}
        <div id="tabs-pres-can" role="tabpanel">
          <ReglagesCan bind:canOptions={params.canOptions} mode="capytale" />
        </div>
      {/if}
      <div class="pt-2 px-4">
        <ReglagesDonnees
          bind:isDataRandom={params.globalOptions.isDataRandom}
        />
      </div>
    {/if}
  </div>
  <div slot="footer" class="flex flex-row justify-end space-x-4 w-full">
    <div class="pt-4 pb-8 px-4">
      <ButtonTextAction
        class="text-sm py-1 px-2 rounded-md h-7"
        on:click={() => {
          isSettingsDialogDisplayed = false
        }}
        text="Valider"
      />
    </div>
    <div class="pt-4 pb-8 px-4">
      <ButtonTextAction
        class="text-sm py-1 px-2 rounded-md h-7"
        on:click={() => {
          buildUrlAndOpenItInNewTab('eleve')
        }}
        text="Aperçu"
      />
    </div>
  </div>
</BasicClassicModal>
