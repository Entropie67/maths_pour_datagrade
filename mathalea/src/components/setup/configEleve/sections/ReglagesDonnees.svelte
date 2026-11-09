<script lang="ts">
  import ButtonToggleAlt from '../../../shared/forms/ButtonToggleAlt.svelte'

  // `undefined` équivaut à des données différentes pour chaque élève
  export let isDataRandom: boolean | undefined
</script>

<div class="pb-2">
  <div
    class="pl-2 pb-2 font-bold text-coopmaths-struct-light dark:text-coopmathsdark-struct-light"
  >
    Données
  </div>
  <div class="flex flex-row justify-start items-center px-4">
    <ButtonToggleAlt
      title={'Données différentes'}
      value={isDataRandom ?? true}
      on:toggle={() => (isDataRandom = !(isDataRandom ?? true))}
      id={'config-eleve-donnes-differentes-toggle'}
      explanations={[
        "Chaque élève aura des pages avec des données différentes d'un autre élève.",
        'Tous les élèves auront des pages identiques.',
      ]}
    />
  </div>
</div>
