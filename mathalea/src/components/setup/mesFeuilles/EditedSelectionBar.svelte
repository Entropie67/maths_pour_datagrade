<script lang="ts">
  import { onMount } from 'svelte'
  import { mathaleaBuildUrlFromExercicesParams } from '../../../lib/mathalea'
  import { mathaleaGoToView } from '../../../lib/mathaleaUtils'
  import { watchAutoSave } from '../../../lib/mesFeuilles/autoSave'
  import {
    updateSelection,
    type SavedSelection,
  } from '../../../lib/mesFeuilles/library'
  import {
    readMathaleaLink,
    replaceExercises,
  } from '../../../lib/mesFeuilles/selectionLink'
  import {
    editedSelectionId,
    isStorageAvailable,
    loadLibrary,
    onLibraryChange,
    rememberEditedSelection,
    updateLibrary,
  } from '../../../lib/mesFeuilles/storage'
  import {
    exercicesParams,
    savesLocationStore,
  } from '../../../lib/stores/generalStore'
  import { globalOptions } from '../../../lib/stores/globalOptions'
  import { primaryButton, secondaryButton } from './styles'

  /**
   * Bandeau de la conception de document quand l'enseignant modifie les
   * exercices d'une sélection (« Modifier les exercices » de « Mes
   * sélections ») : enregistrer par-dessus la sélection et y revenir.
   */

  let selection: SavedSelection | undefined = $state()
  let isSaving = $state(false)
  let saveError = $state(false)

  async function refresh() {
    const id = editedSelectionId()
    if (id === null) {
      selection = undefined
      return
    }
    try {
      selection = (await loadLibrary()).selections.find((s) => s.id === id)
    } catch (error) {
      console.error('Lecture de « Mes sauvegardes » impossible', error)
    }
  }

  onMount(() => {
    if (!isStorageAvailable()) return
    refresh()
    const stopSync = onLibraryChange(refresh)
    const stopWatch = watchAutoSave()
    return () => {
      stopSync()
      stopWatch()
    }
  })

  /** Sélection mise à jour avec les exercices de la page, `null` sans exercice */
  const replaced = $derived.by(() => {
    // dépendances : exercices et options de la page
    void $exercicesParams
    void $globalOptions
    if (selection === undefined) return null
    try {
      const content = readMathaleaLink(
        mathaleaBuildUrlFromExercicesParams().href,
      )
      return replaceExercises(selection.query, content)
    } catch {
      return null
    }
  })
  const isChanged = $derived(
    replaced !== null &&
      selection !== undefined &&
      replaced.query !== selection.query,
  )

  function backToSelection(target: SavedSelection) {
    rememberEditedSelection(null)
    savesLocationStore.set({
      space: 'selections',
      folderId: target.folderId,
      selectionId: target.id,
    })
    mathaleaGoToView('mes-sauvegardes')
  }

  async function saveAndReturn() {
    if (selection === undefined || replaced === null) return
    const target = selection
    const change = replaced
    isSaving = true
    saveError = false
    try {
      await updateLibrary((lib) => updateSelection(lib, target.id, change))
      backToSelection(target)
    } catch (error) {
      console.error('Mise à jour impossible', error)
      saveError = true
    } finally {
      isSaving = false
    }
  }

  function stopEditing() {
    rememberEditedSelection(null)
    selection = undefined
  }
</script>

{#if selection !== undefined && ($globalOptions.v ?? '') === ''}
  {@const current = selection}
  <div
    class="print-hidden flex flex-row flex-wrap items-center gap-x-4 gap-y-2 px-4 md:px-8 py-2 border-y-2 border-coopmaths-action dark:border-coopmathsdark-action bg-coopmaths-action/10 dark:bg-coopmathsdark-action/20 text-coopmaths-corpus dark:text-coopmathsdark-corpus"
    role="region"
    aria-label="Modification d’une sélection"
  >
    <i
      class="bx bx-bookmarks text-3xl text-coopmaths-action dark:text-coopmathsdark-action"
      aria-hidden="true"
    ></i>
    <div class="flex min-w-60 flex-1 flex-col">
      <span>
        Vous modifiez la sélection <strong>« {current.name} »</strong>.
      </span>
      <span class="text-sm">
        {#if saveError}
          La sélection n’a pas pu être enregistrée dans ce navigateur.
        {:else if replaced === null}
          Ajoutez au moins un exercice pour pouvoir l’enregistrer.
        {:else if isChanged}
          Modifications non enregistrées. Ses réglages (vue, présentation,
          titre…) seront gardés.
        {:else}
          Ajoutez, retirez, réordonnez ou paramétrez les exercices, puis
          enregistrez.
        {/if}
      </span>
    </div>
    <button
      type="button"
      class="{secondaryButton} text-sm py-1.5"
      onclick={() => backToSelection(current)}
    >
      <i class="bx bx-arrow-back" aria-hidden="true"></i>
      {isChanged ? 'Revenir sans enregistrer' : 'Revenir à ma sélection'}
    </button>
    <button
      type="button"
      class="{primaryButton} text-lg px-6"
      disabled={isSaving || replaced === null || !isChanged}
      onclick={saveAndReturn}
    >
      <i
        class="bx {isSaving ? 'bx-loader-alt bx-spin' : 'bx-save'} text-2xl"
        aria-hidden="true"
      ></i>
      Enregistrer et revenir
    </button>
    <button
      type="button"
      class="text-coopmaths-corpus dark:text-coopmathsdark-corpus hover:text-coopmaths-action dark:hover:text-coopmathsdark-action"
      title="Ne plus modifier cette sélection (le bandeau disparaît)"
      aria-label="Ne plus modifier cette sélection"
      onclick={stopEditing}
    >
      <i class="bx bx-x text-2xl"></i>
    </button>
  </div>
{/if}
