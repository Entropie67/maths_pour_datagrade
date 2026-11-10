<script lang="ts">
  import { onMount } from 'svelte'
  import Latex from '../../../lib/Latex'
  import { type LatexFileInfos } from '../../../lib/LatexTypes'
  import { renderKatex } from '../../../lib/outils/outilKatex'
  import InputNumber from './InputNumber.svelte'
  import SelectUnique from './SelectUnique.svelte'

  export let latexFileInfos: LatexFileInfos
  export let latex: Latex

  let locallatexFileInfos: LatexFileInfos

  const labelsOptions = [
    { label: '(aucune)', value: '' },
    { label: '\\alph* : a, b, c, ...', value: '\\alph*)' },
    { label: '\\Alph* : A, B, C, ...', value: '\\Alph*)' },
    { label: '\\roman* : i, ii, iii, ...', value: '\\roman*)' },
    { label: '\\Roman* : I, II, III, ...', value: '\\Roman*)' },
    { label: '\\arabic* : 1, 2, 3, ...', value: '\\arabic*)' },
  ]

  /* -----------------------------
     Init
  ----------------------------- */
  onMount(() => {
    locallatexFileInfos = structuredClone(latexFileInfos)
  })
  function applyChanges() {
    latexFileInfos = locallatexFileInfos
  }
</script>

<section class="mb-6 border rounded-lg p-4 bg-gray-50 mx-auto">
  <h3 class="text-lg font-semibold mb-3">
    Configuration individuelle des exercices
  </h3>
  <div class="flex gap-2 mt-3">
    <button
      class="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-500"
      on:click={applyChanges}
    >
      Appliquer les changements
    </button>
  </div>
  {#each latex.getExercices() as exo}
    <fieldset
      style="margin-top:1rem; border-radius:0.5rem; padding:0.5rem; border:1px solid #ccc;"
    >
      <legend class="px-2 text-base font-semibold text-gray-700"
        >Exercice {exo.index + 1}</legend
      >
      <div class="mt-2 mb-3 space-y-1">
        <div class="text-sm text-gray-600">
          <span class="font-medium text-gray-800">Titre :</span>
          {@html renderKatex(exo.titre)}
        </div>
        <div class="text-sm text-gray-500 truncate">
          <span class="font-medium text-gray-700">UUID :</span>
          {exo.uuid}
        </div>
      </div>
      <label class="flex flex-col text-left w-60 my-4">
        Numération des questions
        <SelectUnique
          id="individual-config-labels-{exo.index}"
          value={locallatexFileInfos?.exos?.[exo.index]?.labels ?? ''}
          options={labelsOptions}
          classAddenda="w-40"
          on:change={(e) => {
            locallatexFileInfos.exos = locallatexFileInfos?.exos || {}
            locallatexFileInfos.exos[exo.index] =
              locallatexFileInfos.exos[exo.index] || {}
            locallatexFileInfos.exos[exo.index].labels = e.detail || undefined
          }}
        />
      </label>
      <div class="flex flex-col text-left w-60 my-4">
        <label for="individual-config-itemsep-{exo.index}"
          >Espace entre les questions</label
        >
        <InputNumber
          id="individual-config-itemsep-{exo.index}"
          min={0}
          max={50}
          value={locallatexFileInfos?.exos?.[exo.index]?.itemsep ?? undefined}
          on:change={(e) => {
            locallatexFileInfos.exos = locallatexFileInfos?.exos || {}
            locallatexFileInfos.exos[exo.index] =
              locallatexFileInfos.exos[exo.index] || {}
            if (e.detail === undefined || e.detail === null) {
              delete locallatexFileInfos.exos[exo.index].itemsep
            } else {
              locallatexFileInfos.exos[exo.index].itemsep = e.detail
            }
          }}
        />
      </div>
      <div class="flex flex-col text-left w-60 my-4">
        <label for="individual-config-cols-{exo.index}"
          >Nombre de colonnes pour l'exercice</label
        >
        <InputNumber
          id="individual-config-cols-{exo.index}"
          min={1}
          max={5}
          value={locallatexFileInfos?.exos?.[exo.index]?.cols}
          on:change={(e) => {
            locallatexFileInfos.exos = locallatexFileInfos?.exos || {}
            locallatexFileInfos.exos[exo.index] =
              locallatexFileInfos.exos[exo.index] || {}
            if (e.detail === undefined || e.detail === null) {
              delete locallatexFileInfos.exos[exo.index].cols
            } else {
              locallatexFileInfos.exos[exo.index].cols = e.detail
            }
          }}
        />
      </div>
      <div class="flex flex-col text-left w-60 my-4">
        <label for="individual-config-cols-corr-{exo.index}"
          >Nombre de colonnes pour la correction</label
        >
        <InputNumber
          id="individual-config-cols-corr-{exo.index}"
          min={1}
          max={5}
          value={locallatexFileInfos?.exos?.[exo.index]?.cols_corr}
          on:change={(e) => {
            locallatexFileInfos.exos = locallatexFileInfos?.exos || {}
            locallatexFileInfos.exos[exo.index] =
              locallatexFileInfos.exos[exo.index] || {}
            if (e.detail === undefined || e.detail === null) {
              delete locallatexFileInfos.exos[exo.index].cols_corr
            } else {
              locallatexFileInfos.exos[exo.index].cols_corr = e.detail
            }
          }}
        />
      </div>
      <fieldset>
        <legend class="flex flex-col text-left w-60 mt-4">Bloc réponse</legend>
        <div class="flex flex-col text-left w-60 mb-2">
          <label for="individual-config-blocrep-nbligs-{exo.index}"
            >Nombre de lignes</label
          >
          <InputNumber
            id="individual-config-blocrep-nbligs-{exo.index}"
            min={1}
            max={20}
            value={locallatexFileInfos?.exos?.[exo.index]?.blocrep?.nbligs}
            on:change={(e) => {
              locallatexFileInfos.exos = locallatexFileInfos?.exos || {}
              locallatexFileInfos.exos[exo.index] =
                locallatexFileInfos.exos[exo.index] || {}
              if (e.detail === undefined || e.detail === null) {
                delete locallatexFileInfos.exos[exo.index].blocrep
              } else {
                const blocrep = locallatexFileInfos.exos[exo.index].blocrep || {
                  nbligs: 1,
                  nbcols: 1,
                }
                blocrep.nbligs = e.detail
                locallatexFileInfos.exos[exo.index].blocrep = blocrep
              }
            }}
          />
        </div>
        <div class="flex flex-col text-left w-60 mb-4">
          <label for="individual-config-blocrep-nbcols-{exo.index}"
            >Nombre de colonnes</label
          >
          <InputNumber
            id="individual-config-blocrep-nbcols-{exo.index}"
            min={1}
            max={20}
            value={locallatexFileInfos?.exos?.[exo.index]?.blocrep?.nbcols}
            on:change={(e) => {
              locallatexFileInfos.exos = locallatexFileInfos?.exos || {}
              locallatexFileInfos.exos[exo.index] =
                locallatexFileInfos.exos[exo.index] || {}
              if (e.detail === undefined || e.detail === null) {
                delete locallatexFileInfos.exos[exo.index].blocrep
              } else {
                const blocrep = locallatexFileInfos.exos[exo.index].blocrep || {
                  nbligs: 1,
                  nbcols: 1,
                }
                blocrep.nbcols = e.detail
                locallatexFileInfos.exos[exo.index].blocrep = blocrep
              }
            }}
          />
        </div>
      </fieldset>
    </fieldset>
  {/each}

  <!-- Card JSON -->
  <div class="w-full mt-6 p-4 border rounded-2xl shadow bg-gray-50">
    <h2 class="text-lg font-bold mb-3">Aperçu JSON</h2>
    <pre
      class="bg-gray-900 text-green-200 p-3 text-left rounded-lg text-sm overflow-x-auto max-h-80">{JSON.stringify(
        locallatexFileInfos || {},
        null,
        2,
      )}
      </pre>
  </div>
</section>
