<script lang="ts">
  import { onMount } from 'svelte'
  import { decodeExosGrouping } from '../../../lib/LatexGroup'
  import type { IExercice, IExerciceStatique } from '../../../lib/types'

  export let exercices: (IExercice | IExerciceStatique)[] = []
  export let latexFileInfos: {
    exosGrouping?: string
  }

  /** Chaque groupe contient des indices d'exos en 0-based */
  type ExoGroup = number[]
  let exoGroups: ExoGroup[] = []

  let draggedExo: number | null = null

  /* -----------------------------
   Groupes (0-based) -> string imprimante (1-based)
   Grammaire :
   -   : séparateur de groupes
   ;   : concaténation dans un groupe
   :   : plage
   ex: [[0,2],[3,4,5,6]] -> "1;3-4:7"
----------------------------- */
  function groupsToString(groups: number[][]): string {
    return (
      groups
        .map((group) => {
          if (group.length === 0) return ''

          const sorted = [...group].sort((a, b) => a - b)
          const parts: string[] = []

          let start = sorted[0]
          let prev = sorted[0]

          for (let i = 1; i <= sorted.length; i++) {
            const curr = sorted[i]

            if (curr === prev + 1) {
              prev = curr
            } else {
              const a = start + 1
              const b = prev + 1
              parts.push(a === b ? `${a}` : `${a}:${b}`)
              start = curr
              prev = curr
            }
          }

          // concaténation interne au groupe
          return parts.join(';')
        })
        .filter(Boolean)
        // séparateur de groupes
        .join('-')
    )
  }

  /* -----------------------------
     Drag & Drop
  ----------------------------- */
  function onDragStart(exoIndex: number) {
    if (exercices[exoIndex].typeExercice === 'statique') return
    draggedExo = exoIndex
  }

  function onDrop(groupIndex: number) {
    if (draggedExo === null) return

    // retirer de tous les groupes
    exoGroups = exoGroups.map((g) => g.filter((e) => e !== draggedExo))

    // ajouter au groupe cible
    exoGroups[groupIndex].push(draggedExo)
    exoGroups[groupIndex].sort((a, b) => a - b)

    // supprimer groupes vides
    exoGroups = exoGroups.filter((g) => g.length > 0)

    sync()
    draggedExo = null
  }

  function addGroup() {
    exoGroups = [...exoGroups, []]
  }

  function resetGroups() {
    exoGroups = exercices.map((_, i) => [i]) // ⬅️ 0-based
    sync()
  }

  function applyChanges() {
    latexFileInfos.exosGrouping = groupsToString(exoGroups)
  }

  function sync() {
    // latexFileInfos.exosGrouping = groupsToString(exoGroups)
  }

  /* -----------------------------
     Init
  ----------------------------- */
  onMount(() => {
    for (let i = 0; i < exercices.length; i++) {
      console.log('exo', i, exercices[i].typeExercice)
    }
    if (latexFileInfos.exosGrouping) {
      exoGroups = decodeExosGrouping(
        latexFileInfos.exosGrouping,
        exercices.length,
      )
    }

    if (exoGroups.length === 0) {
      exoGroups = exercices.map((_, i) => [i])
    }

    sync()
  })
</script>

<!--
   UI
-->
<div class="space-y-3">
  <div class="flex justify-between items-center">
    <h3 class="font-bold text-sm">Regroupement des exercices (drag & drop)</h3>

    <button class="text-xs px-2 py-1 border rounded" on:click={resetGroups}>
      Réinitialiser
    </button>
  </div>

  {#each exoGroups as group, gIndex}
    <div
      class="border rounded-lg p-2 bg-gray-50"
      role="region"
      on:dragover|preventDefault
      on:drop={() => onDrop(gIndex)}
    >
      <div class="text-xs font-semibold mb-1">
        Groupe {gIndex + 1}
      </div>

      {#each group as exoIndex}
        <div
          draggable="true"
          role="button"
          tabindex="0"
          on:dragstart={() => onDragStart(exoIndex)}
          class="cursor-move px-2 py-1 mb-1 bg-white border rounded shadow-sm text-xs"
        >
          Exercice {exoIndex + 1}
          {exercices[exoIndex].typeExercice
            ? ' -- ' + exercices[exoIndex].typeExercice
            : ''}
        </div>
      {/each}

      {#if group.length === 0}
        <div class="text-xs text-gray-400 italic">Déposez un exercice ici</div>
      {/if}
    </div>
  {/each}

  <button class="text-xs px-2 py-1 border rounded w-full" on:click={addGroup}>
    + Nouveau groupe
  </button>

  <div class="flex gap-2 mt-3">
    <button
      class="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-500"
      on:click={applyChanges}
    >
      Appliquer
    </button>
  </div>
  <div class="text-xs text-gray-500 mt-2">
    <strong>Syntaxe générée :</strong>
    <code>{groupsToString(exoGroups)}</code>
  </div>

  <div class="text-xs text-gray-400">
    <ul class="list-disc ml-4">
      <li><code>;</code> sépare les groupes</li>
      <li><code>:</code> ajoute un exercice au groupe</li>
      <li><code>-</code> définit une plage</li>
    </ul>
  </div>
</div>
