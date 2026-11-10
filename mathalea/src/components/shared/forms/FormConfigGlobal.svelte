<script lang="ts">
  import Latex from '../../../lib/Latex'
  import { type LatexFileInfos } from '../../../lib/LatexTypes'
  import CheckboxWithLabel from './CheckboxWithLabel.svelte'
  import InputNumber from './InputNumber.svelte'
  import SelectMultiple from './SelectMultiple.svelte'
  import SelectUnique from './SelectUnique.svelte'

  export let latexFileInfos: LatexFileInfos
  export let latex: Latex

  const labelsOptions = [
    { label: '(aucune)', value: '' },
    { label: 'a, b, c, ...', value: '\\alph*)' },
    { label: 'A, B, C, ...', value: '\\Alph*)' },
    { label: 'i, ii, iii, ...', value: '\\roman*)' },
    { label: 'I, II, III, ...', value: '\\Roman*)' },
    { label: '1, 2, 3, ...', value: '\\arabic*)' },
  ]

  $: exercicesOptions = latex.getExercices().map((exo) => ({
    label: `${exo.index + 1} - ${exo.titre}`,
    value: exo.index,
  }))

  let selectedExos: number[] = Array.from(
    { length: latex.exercices.length },
    (_, i) => i,
  ) // exos sélectionnés pour appliquer config globale
  let globalConfig = {
    labels: '',
    itemsep: { enabled: false, value: 1 },
    cols: { enabled: false, value: 1 },
    cols_corr: { enabled: false, value: 1 },
    blocrep: { enabled: false, nbligs: 5, nbcols: 1 },
  }

  function applyGlobalConfig() {
    latexFileInfos.exos = latexFileInfos.exos || {}
    for (const idx of selectedExos) {
      const exoConfig: any = {}

      if (globalConfig.labels !== '' && globalConfig.labels !== undefined) {
        exoConfig.labels = globalConfig.labels
      }

      if (globalConfig.itemsep.enabled) {
        exoConfig.itemsep = globalConfig.itemsep.value
      }

      if (globalConfig.cols?.enabled) {
        exoConfig.cols = globalConfig.cols.value
      }

      if (globalConfig.cols_corr?.enabled) {
        exoConfig.cols_corr = globalConfig.cols_corr.value
      }

      if (globalConfig.blocrep?.enabled) {
        exoConfig.blocrep = {
          nbligs: globalConfig.blocrep.nbligs,
          nbcols: globalConfig.blocrep.nbcols,
        }
      }
      latexFileInfos.exos[idx] = {
        ...latexFileInfos.exos[idx],
        ...exoConfig,
      }
    }
  }

  function cancelAllChanges() {
    // Réinitialise toutes les configurations des exercices
    latexFileInfos.exos = {}
    selectedExos = []
    globalConfig = {
      labels: '',
      itemsep: { enabled: false, value: 1 },
      cols: { enabled: false, value: 1 },
      cols_corr: { enabled: false, value: 1 },
      blocrep: { enabled: false, nbligs: 5, nbcols: 1 },
    }
  }
</script>

<section class="mb-6 border rounded-lg p-4 bg-gray-50 mx-auto">
  <h3 class="text-lg font-semibold mb-3 text-center">
    Configuration globale des exercices
  </h3>
  <div class="flex flex-col gap-3 items-start">
    <!-- Labels -->
    <div class="flex flex-col w-50 text-left">
      Numérotation des questions
      <SelectUnique
        id="global-config-labels"
        bind:value={globalConfig.labels}
        options={labelsOptions}
        classAddenda="mt-1"
      />
    </div>

    <!-- Itemsep -->
    <div class="flex flex-col w-full text-left">
      Espace entre les questions
      <div class="flex flex-row items-center gap-2 w-30">
        <CheckboxWithLabel
          id="global-config-itemsep-enabled"
          bind:isChecked={globalConfig.itemsep.enabled}
        />
        <InputNumber
          id="global-config-itemsep"
          min={0}
          max={50}
          isDisabled={!globalConfig.itemsep.enabled}
          bind:value={globalConfig.itemsep.value}
        />
      </div>
    </div>

    <!-- Colonnes -->
    <div class="flex flex-col w-full text-left">
      Nombre de colonnes pour l'exercice
      <div class="flex flex-row items-center gap-2 w-30">
        <CheckboxWithLabel
          id="global-config-cols-enabled"
          bind:isChecked={globalConfig.cols.enabled}
        />
        <InputNumber
          id="global-config-cols"
          min={1}
          max={5}
          isDisabled={!globalConfig.cols.enabled}
          bind:value={globalConfig.cols.value}
        />
      </div>
    </div>

    <div class="flex flex-col w-full text-left">
      Nombre de colonnes pour la correction
      <div class="flex flex-row items-center gap-2 w-30">
        <CheckboxWithLabel
          id="global-config-cols-corr-enabled"
          bind:isChecked={globalConfig.cols_corr.enabled}
        />
        <InputNumber
          id="global-config-cols-corr"
          min={1}
          max={5}
          isDisabled={!globalConfig.cols_corr.enabled}
          bind:value={globalConfig.cols_corr.value}
        />
      </div>
    </div>

    <!-- Bloc réponse -->
    <fieldset class="flex flex-col gap-4 w-full">
      <legend class="text-left font-medium">Bloc réponse</legend>
      <CheckboxWithLabel
        id="global-config-blocrep-enabled"
        bind:isChecked={globalConfig.blocrep.enabled}
        label="Activer le bloc réponse"
      />

      <div>
        <div class="flex flex-row items-center gap-2 w-60">
          <label for="global-config-blocrep-nbligs" class="w-32 text-left"
            >Nombre de lignes</label
          >
          <InputNumber
            id="global-config-blocrep-nbligs"
            min={1}
            max={20}
            isDisabled={!globalConfig.blocrep.enabled}
            bind:value={globalConfig.blocrep.nbligs}
          />
        </div>

        <div class="flex flex-row items-center gap-2 w-60 mt-2">
          <label for="global-config-blocrep-nbcols" class="w-32 text-left"
            >Nombre de colonnes</label
          >
          <InputNumber
            id="global-config-blocrep-nbcols"
            min={1}
            max={20}
            isDisabled={!globalConfig.blocrep.enabled}
            bind:value={globalConfig.blocrep.nbcols}
          />
        </div>
      </div>
    </fieldset>

    <!-- Exercices ciblés -->
    <label class="flex flex-col w-full">
      Appliquer aux exercices :
      <SelectMultiple
        id="global-config-selectedExos"
        bind:value={selectedExos}
        options={exercicesOptions}
        classAddenda="mt-1 h-24"
      />
    </label>
  </div>

  <!-- Boutons d’action -->
  <div class="pt-4 flex flex-col sm:flex-row sm:flex-wrap gap-3 justify-start">
    <button
      type="button"
      on:click={applyGlobalConfig}
      class="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-500"
    >
      Appliquer
    </button>

    <button
      type="button"
      class="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
      on:click={cancelAllChanges}
    >
      Annuler les changements
    </button>
  </div>
</section>
