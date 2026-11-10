<script lang="ts">
  import { exercicesParams } from '../../../../../lib/stores/generalStore'
  import {
    localisedIDToUuid,
    referentielLocale,
  } from '../../../../../lib/stores/languagesStore'
  import { uuidNouvelleVersion } from '../../../../../lib/uuidsRemplaces'

  export let indiceExercice: number

  $: uuid = $exercicesParams[indiceExercice]?.uuid
  $: nouvelleVersion = uuid ? uuidNouvelleVersion(uuid) : undefined

  function remplacer() {
    if (!nouvelleVersion) return
    const nouveauUuid = nouvelleVersion
    exercicesParams.update((params) =>
      params.map((param, index) => {
        if (index !== indiceExercice) return param
        // Les formulaires et le mode QCM peuvent changer entre deux versions.
        const reglages = { ...param }
        for (const cle of [
          'id',
          'sup',
          'sup2',
          'sup3',
          'sup4',
          'sup5',
          'versionQcm',
        ]) {
          delete reglages[cle]
        }
        const id =
          Object.entries(localisedIDToUuid[$referentielLocale]).find(
            ([, uuid]) => uuid === nouveauUuid,
          )?.[0] ??
          Object.entries(localisedIDToUuid['fr-FR']).find(
            ([, uuid]) => uuid === nouveauUuid,
          )?.[0]
        return { ...reglages, uuid: nouveauUuid, id }
      }),
    )
  }
</script>

{#if nouvelleVersion}
  <button
    type="button"
    class="print-hidden shrink-0 mx-2 px-2 py-1 rounded border border-current text-xs font-normal text-coopmaths-action dark:text-coopmathsdark-action hover:underline"
    title="Remplacer cet ancien exercice par sa nouvelle version avec ses paramètres de contenu par défaut"
    on:click={remplacer}
  >
    <i class="bx bx-transfer-alt" aria-hidden="true"></i>
    Nouvelle version
  </button>
{/if}
