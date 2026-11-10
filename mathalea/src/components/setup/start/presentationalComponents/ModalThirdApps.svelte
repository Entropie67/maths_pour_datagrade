<script lang="ts">
  import Card from '../../../shared/ui/Card.svelte'
  import BasicClassicModal from '../../../shared/modal/BasicClassicModal.svelte'
  import appsTierce from '../../../../json/referentielAppsTierce.json'
  import type { AppTierceGroup } from '../../../../lib/types/referentiels'

  export let thirdAppsChoiceModal: BasicClassicModal | undefined = undefined
  export let showThirdAppsChoiceDialog: boolean
  export let appsTierceInExercisesList: string[]

  const appsTierceReferentielArray: AppTierceGroup[] = Object.values(appsTierce)
</script>

<!-- Fenêtre de dialogue pour le choix des applications tierces -->
<BasicClassicModal
  bind:this={thirdAppsChoiceModal}
  bind:isDisplayed={showThirdAppsChoiceDialog}
>
  <div slot="header">Applications</div>
  <div slot="content">
    <div class="p2">
      {#each appsTierceReferentielArray as group}
        <div class="mx-2 pt-8">
          <div class="font-bold text-2xl text-coopmaths-struct py-4">
            {group.rubrique}
          </div>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            {#each group.liste as app}
              <Card
                application={app}
                selected={appsTierceInExercisesList.includes(app.uuid)}
                loadImages={showThirdAppsChoiceDialog}
              />
            {/each}
          </div>
        </div>
      {/each}
    </div>
  </div>
</BasicClassicModal>
