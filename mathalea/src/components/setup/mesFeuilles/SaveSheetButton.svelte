<script lang="ts">
  import { onMount } from 'svelte'
  import { mathaleaUpdateUrlFromExercicesParams } from '../../../lib/mathalea'
  import {
    addSheet,
    createFolder,
    emptyLibrary,
    folderPath,
    foldersOf,
    sheetKind,
    updateSheetContent,
    type SheetKind,
    type SheetContent,
    type SheetLibrary,
    type SheetPreview,
  } from '../../../lib/mesFeuilles/library'
  import {
    isStorageAvailable,
    loadLibrary,
    onLibraryChange,
    requestPersistentStorage,
    savePreview,
    updateLibrary,
  } from '../../../lib/mesFeuilles/storage'
  import {
    currentSheetStore,
    previousSheetStore,
  } from '../../../lib/stores/generalStore'
  import { watchAutoSave } from '../../../lib/mesFeuilles/autoSave'
  import FolderPicker from './FolderPicker.svelte'
  import SheetDialog from './SheetDialog.svelte'
  import {
    primaryButton,
    quietText,
    secondaryButton,
    textInput,
  } from './styles'

  /**
   * Bouton « Enregistrer » des vues Impression et LaTeX : enregistre la fiche
   * dans « Mes feuilles » (vue « Mes sauvegardes »), ou met à jour la feuille
   * d'où elle a été ouverte (paramètre `feuille` de l'URL). Une fiche non
   * reliée crée toujours une nouvelle feuille par défaut ; la dernière feuille
   * reliée est seulement proposée au remplacement.
   */
  interface Props {
    /** État de la fiche au moment de l'enregistrement */
    getContent: () => Promise<{ content: SheetContent; preview?: SheetPreview }>
    /** Nom proposé pour une nouvelle feuille (titre du document) */
    defaultName: string
    /** Vue qui enregistre : une feuille ne se remplace que par une fiche de la même vue */
    kind?: SheetKind
    /** Créer directement à la racine avec le nom proposé, sans ouvrir la fenêtre. */
    oneClick?: boolean
    disabled?: boolean
  }

  let {
    getContent,
    defaultName,
    kind = 'typst',
    oneClick = false,
    disabled = false,
  }: Props = $props()

  const outlined =
    'flex items-center gap-1 rounded-lg border border-coopmaths-action py-1 px-2 text-sm text-coopmaths-action hover:bg-coopmaths-action hover:text-coopmaths-canvas dark:border-coopmathsdark-action dark:text-coopmathsdark-action dark:hover:bg-coopmathsdark-action dark:hover:text-coopmathsdark-canvas disabled:opacity-50 disabled:cursor-wait'

  let library: SheetLibrary = $state(emptyLibrary())
  let isLoaded = $state(false)
  const linkedSheet = $derived(
    library.sheets.find(
      (s) => s.id === $currentSheetStore && sheetKind(s) === kind,
    ),
  )
  const previousSheet = $derived(
    linkedSheet === undefined && $previousSheetStore !== ''
      ? library.sheets.find(
          (s) => s.id === $previousSheetStore && sheetKind(s) === kind,
        )
      : undefined,
  )
  let isDialogOpen = $state(false)
  let name = $state('')
  let folderId: string | null = $state(null)
  let isSaving = $state(false)
  /** Retour après un enregistrement, porté par l'icône du bouton (sans décaler la barre) */
  let feedback = $state<'' | 'saved' | 'error'>('')
  let feedbackTimer: ReturnType<typeof setTimeout> | undefined

  async function refresh() {
    try {
      library = await loadLibrary()
      isLoaded = true
    } catch (error) {
      console.error('Lecture de « Mes sauvegardes » impossible', error)
    }
  }

  onMount(() => {
    if (!isStorageAvailable()) return
    refresh()
    const stop = onLibraryChange(refresh)
    // un enregistrement depuis cette vue réécrit aussi la sauvegarde automatique
    const stopWatch = watchAutoSave()
    return () => {
      stop()
      stopWatch()
      clearTimeout(feedbackTimer)
    }
  })

  // une feuille supprimée (ici ou dans un autre onglet) n'est plus reliée
  $effect(() => {
    if (isLoaded && $currentSheetStore !== '' && linkedSheet === undefined) {
      currentSheetStore.set('')
    }
  })

  function showFeedback(value: 'saved' | 'error') {
    feedback = value
    clearTimeout(feedbackTimer)
    feedbackTimer = setTimeout(() => (feedback = ''), 2000)
  }

  const saveIcon = $derived(
    isSaving
      ? 'bx-loader-alt bx-spin'
      : feedback === 'saved'
        ? 'bx-check'
        : feedback === 'error'
          ? 'bx-error'
          : 'bx-save',
  )

  function openSaveAs() {
    name =
      linkedSheet !== undefined ? `${linkedSheet.name} (copie)` : defaultName
    folderId = linkedSheet?.folderId ?? null
    isDialogOpen = true
  }

  async function save() {
    if (linkedSheet === undefined) {
      if (oneClick) {
        name = defaultName
        folderId = null
        await saveAs()
      } else openSaveAs()
      return
    }
    await replace(linkedSheet.id)
  }

  /** Met à jour une feuille existante et y relie la fiche */
  async function replace(sheetId: string) {
    isSaving = true
    try {
      const { content, preview } = await getContent()
      library = await updateLibrary((lib) =>
        updateSheetContent(lib, sheetId, content),
      )
      if (preview !== undefined) await savePreview(sheetId, preview)
      if ($currentSheetStore !== sheetId) {
        currentSheetStore.set(sheetId)
        previousSheetStore.set('')
        mathaleaUpdateUrlFromExercicesParams()
      }
      isDialogOpen = false
      showFeedback('saved')
    } catch (error) {
      console.error('Enregistrement impossible', error)
      showFeedback('error')
    } finally {
      isSaving = false
    }
  }

  async function saveAs() {
    isSaving = true
    try {
      const { content, preview } = await getContent()
      let sheetId = ''
      library = await updateLibrary((lib) => {
        const added = addSheet(lib, name, folderId, content)
        sheetId = added.sheet.id
        return added.library
      })
      if (preview !== undefined) await savePreview(sheetId, preview)
      requestPersistentStorage()
      currentSheetStore.set(sheetId)
      previousSheetStore.set('')
      mathaleaUpdateUrlFromExercicesParams()
      isDialogOpen = false
      showFeedback('saved')
    } catch (error) {
      console.error('Enregistrement impossible', error)
      showFeedback('error')
    } finally {
      isSaving = false
    }
  }

  async function addFolder(folderName: string, parentId: string | null) {
    let id = ''
    library = await updateLibrary((lib) => {
      const created = createFolder(lib, folderName, parentId)
      id = created.folder.id
      return created.library
    })
    return id
  }

  const location = $derived(
    linkedSheet === undefined
      ? ''
      : [
          'Mes feuilles',
          ...folderPath(library, linkedSheet.folderId).map((f) => f.name),
        ].join(' › '),
  )
</script>

{#if isStorageAvailable()}
  <div class="flex flex-row items-center gap-2" data-tour="typst-save-sheet">
    <button
      type="button"
      class={outlined}
      disabled={disabled || isSaving || !isLoaded}
      title={linkedSheet !== undefined
        ? `Mettre à jour « ${linkedSheet.name} » dans ${location}`
        : kind === 'omr'
          ? 'Enregistrer cette évaluation dans « Mes sauvegardes » (dans ce navigateur)'
          : 'Enregistrer cette fiche dans « Mes feuilles » (dans ce navigateur)'}
      onclick={save}
    >
      <i class="bx {saveIcon} text-xl" aria-hidden="true"></i>
      Enregistrer
    </button>
    {#if linkedSheet !== undefined}
      <button
        type="button"
        class={outlined}
        disabled={disabled || isSaving || !isLoaded}
        title="Enregistrer comme une nouvelle feuille"
        aria-label="Enregistrer sous"
        onclick={openSaveAs}
      >
        <i class="bx bx-duplicate text-xl" aria-hidden="true"></i>
      </button>
    {/if}
    <span class="sr-only" role="status">
      {feedback === 'saved'
        ? 'Enregistré dans Mes sauvegardes'
        : feedback === 'error'
          ? 'Enregistrement impossible'
          : ''}
    </span>
  </div>
{/if}

<SheetDialog
  open={isDialogOpen}
  title="Enregistrer dans Mes feuilles"
  onclose={() => (isDialogOpen = false)}
>
  <form
    class="flex flex-col gap-4"
    onsubmit={(event) => {
      event.preventDefault()
      saveAs()
    }}
  >
    <label class="flex flex-col gap-1">
      <span class="font-semibold">Nom de la feuille</span>
      <input type="text" class={textInput} bind:value={name} required />
    </label>
    <div class="flex flex-col gap-1">
      <span class="font-semibold">Dossier</span>
      <FolderPicker
        library={foldersOf(library, 'feuilles')}
        bind:selected={folderId}
        oncreate={addFolder}
      />
    </div>
    {#if previousSheet !== undefined}
      <div
        class="flex flex-col gap-2 rounded-lg px-4 py-3 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark"
      >
        <p class="text-sm">
          Vous avez travaillé sur la feuille « {previousSheet.name} ». Pour la compléter
          plutôt que d’en créer une nouvelle, remplacez-la par cette fiche.
        </p>
        <button
          type="button"
          class="{secondaryButton} self-start text-sm py-1"
          disabled={isSaving}
          onclick={() => replace(previousSheet.id)}
        >
          <i class="bx bx-revision" aria-hidden="true"></i> Remplacer « {previousSheet.name}
          »
        </button>
      </div>
    {/if}
    <p class={quietText}>
      La feuille est enregistrée dans ce navigateur. Pour la retrouver sur un
      autre ordinateur, exportez vos sauvegardes depuis « Mes sauvegardes ».
    </p>
    <div class="flex flex-row justify-end gap-3">
      <button
        type="button"
        class={secondaryButton}
        onclick={() => (isDialogOpen = false)}>Annuler</button
      >
      <button type="submit" class={primaryButton} disabled={isSaving}>
        <i class="bx bx-save" aria-hidden="true"></i> Enregistrer
      </button>
    </div>
  </form>
</SheetDialog>
