<script lang="ts">
  import { onDestroy } from 'svelte'
  import { watchAutoSave } from '../../../lib/mesFeuilles/autoSave'
  import {
    folderPath,
    foldersOf,
    SPACE_LABELS,
    type SavedSelection,
    type SheetLibrary,
  } from '../../../lib/mesFeuilles/library'
  import {
    readMathaleaLink,
    type LinkContent,
  } from '../../../lib/mesFeuilles/selectionLink'
  import {
    editedSelectionId,
    isStorageAvailable,
    loadLibrary,
    rememberEditedSelection,
  } from '../../../lib/mesFeuilles/storage'
  import { mathaleaGoToView } from '../../../lib/mathaleaUtils'
  import {
    isInIframe,
    savesLocationStore,
  } from '../../../lib/stores/generalStore'
  import { globalOptions } from '../../../lib/stores/globalOptions'
  import NewSelectionForm from './NewSelectionForm.svelte'
  import SheetDialog from './SheetDialog.svelte'
  import { primaryButton, secondaryButton } from './styles'

  /**
   * Bouton « Ajouter à mes sélections » : enregistre le lien de la page
   * (exercices, graines et réglages) dans « Mes sélections ». Absent dans un
   * iframe et sous une plateforme (Capytale, Moodle…).
   */
  interface Props {
    /** Lien à enregistrer, lu au clic */
    getUrl: () => string
    /** Barre d'outils de la conception de document, ou page « Lien pour les élèves » */
    variant: 'toolbar' | 'config'
  }

  let { getUrl, variant }: Props = $props()

  let isOpen = $state(false)
  let library: SheetLibrary | undefined = $state()
  let content: LinkContent | undefined = $state()
  let error = $state('')
  let edited: SavedSelection | undefined = $state()
  let saved: SavedSelection | undefined = $state()
  let stopWatch: (() => void) | undefined

  const isAvailable = $derived(
    isStorageAvailable() && !$isInIframe && $globalOptions.recorder == null,
  )

  async function open() {
    saved = undefined
    error = ''
    content = undefined
    try {
      content = readMathaleaLink(getUrl())
    } catch {
      error =
        variant === 'toolbar'
          ? 'Ajoutez d’abord des exercices à la feuille.'
          : 'Cette feuille ne contient aucun exercice.'
    }
    try {
      library = await loadLibrary()
    } catch (loadError) {
      console.error('Lecture de « Mes sauvegardes » impossible', loadError)
      error = 'Ce navigateur ne permet pas d’enregistrer de sélection.'
    }
    const editedId = variant === 'toolbar' ? editedSelectionId() : null
    edited = library?.selections.find((s) => s.id === editedId)
    // la sauvegarde automatique suit aussi les ajouts faits depuis cette page
    stopWatch ??= watchAutoSave()
    isOpen = true
  }

  onDestroy(() => stopWatch?.())

  function done(next: SheetLibrary, selection: SavedSelection) {
    library = next
    saved = selection
    if (edited?.id === selection.id) rememberEditedSelection(null)
  }

  function showSelections() {
    isOpen = false
    savesLocationStore.set({
      space: 'selections',
      folderId: saved?.folderId ?? null,
    })
    mathaleaGoToView('mes-sauvegardes')
  }

  const location = $derived(
    saved === undefined || library === undefined
      ? ''
      : [
          SPACE_LABELS.selections,
          ...folderPath(foldersOf(library, 'selections'), saved.folderId).map(
            (f) => f.name,
          ),
        ].join(' › '),
  )
</script>

{#if isAvailable}
  {#if variant === 'toolbar'}
    <div
      class="tooltip tooltip-bottom tooltip-neutral"
      data-tip="Ajouter à mes sélections"
    >
      <button
        type="button"
        aria-label="Ajouter à mes sélections"
        class="flex items-center justify-center size-9 rounded-full transition-colors
          text-coopmaths-action dark:text-coopmathsdark-action
          hover:bg-coopmaths-action-100 dark:hover:bg-coopmathsdark-canvas-dark
          hover:text-coopmaths-action-dark dark:hover:text-coopmathsdark-action-lightest"
        onclick={open}
      >
        <i aria-hidden="true" class="bx bx-bookmark-plus text-2xl"></i>
      </button>
    </div>
  {:else}
    <button
      type="button"
      class="tooltip tooltip-bottom tooltip-neutral text-coopmaths-action hover:text-coopmaths-action-lightest dark:text-coopmathsdark-action dark:hover:text-coopmathsdark-action-lightest"
      data-tip="Ajouter ce lien à mes sélections"
      aria-label="Ajouter ce lien à mes sélections"
      onclick={open}
    >
      <i aria-hidden="true" class="bx bx-bookmark-plus text-2xl"></i>
    </button>
  {/if}

  <SheetDialog
    open={isOpen}
    title={saved !== undefined
      ? 'Sélection enregistrée'
      : 'Ajouter à mes sélections'}
    onclose={() => (isOpen = false)}
  >
    {#if saved !== undefined}
      <div class="flex flex-col gap-4">
        <p>
          <i
            class="bx bx-check-circle text-coopmaths-action dark:text-coopmathsdark-action"
            aria-hidden="true"
          ></i>
          « {saved.name} » est dans {location}.
        </p>
        <div class="flex flex-row justify-end gap-3">
          <button
            type="button"
            class={secondaryButton}
            onclick={() => (isOpen = false)}>Fermer</button
          >
          <button type="button" class={primaryButton} onclick={showSelections}>
            <i class="bx bx-folder-open" aria-hidden="true"></i> Voir mes sélections
          </button>
        </div>
      </div>
    {:else if error !== '' || library === undefined}
      <div class="flex flex-col gap-4">
        <p>{error}</p>
        <div class="flex flex-row justify-end">
          <button
            type="button"
            class={primaryButton}
            onclick={() => (isOpen = false)}>Fermer</button
          >
        </div>
      </div>
    {:else}
      <NewSelectionForm
        {library}
        {content}
        editedSelection={edited}
        folderId={edited?.folderId ?? null}
        oncancel={() => (isOpen = false)}
        onsaved={done}
      />
    {/if}
  </SheetDialog>
{/if}
