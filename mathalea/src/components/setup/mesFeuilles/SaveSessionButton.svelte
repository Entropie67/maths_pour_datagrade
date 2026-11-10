<script lang="ts">
  import { onMount } from 'svelte'
  import { mathaleaUpdateUrlFromExercicesParams } from '../../../lib/mathalea'
  import { mathaleaGoToView } from '../../../lib/mathaleaUtils'
  import {
    addSession,
    changeFolders,
    createFolder,
    emptyLibrary,
    folderPath,
    foldersOf,
    SPACE_LABELS,
    updateSessionState,
    type SessionState,
    type SheetLibrary,
  } from '../../../lib/mesFeuilles/library'
  import { defaultSessionName } from '../../../lib/mesFeuilles/sessionLink'
  import {
    isStorageAvailable,
    loadLibrary,
    onLibraryChange,
    requestPersistentStorage,
    updateLibrary,
  } from '../../../lib/mesFeuilles/storage'
  import {
    currentSessionStore,
    savesLocationStore,
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
   * Boutons « Enregistrer » et « Mes sauvegardes » de la vue TBI : enregistrent
   * l'état de la vue dans « Mes séances au vidéoprojecteur » (vue « Mes
   * sauvegardes »), ou mettent à jour la séance d'où elle a été ouverte
   * (paramètre `seance` de l'URL). Une vue non reliée crée une nouvelle séance.
   */
  interface Props {
    /** État de la vue au moment de l'enregistrement (fichier de réglages de la vue) */
    getState: () => SessionState
    /** Classe des boutons ronds de la barre d'outils de la vue */
    buttonClass: string
    /** Signale l'ouverture ou la fermeture de la fenêtre d'enregistrement */
    onDialogChange?: (isOpen: boolean) => void
    /** Lignes de menu avec leur libellé, plutôt que des boutons à icône seule */
    showLabels?: boolean
    /** Faux : rien à enregistrer, seule la réouverture d'une séance est proposée */
    hasContent?: boolean
  }

  let {
    getState,
    buttonClass,
    onDialogChange,
    showLabels = false,
    hasContent = true,
  }: Props = $props()

  let library: SheetLibrary = $state(emptyLibrary())
  let isLoaded = $state(false)
  const linkedSession = $derived(
    library.sessions.find((s) => s.id === $currentSessionStore),
  )
  let isDialogOpen = $state(false)
  let name = $state('')
  let folderId: string | null = $state(null)
  let isSaving = $state(false)
  /** Retour après un enregistrement, porté par l'icône du bouton */
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

  // une séance supprimée (ici ou dans un autre onglet) n'est plus reliée
  $effect(() => {
    if (
      isLoaded &&
      $currentSessionStore !== '' &&
      linkedSession === undefined
    ) {
      currentSessionStore.set('')
      mathaleaUpdateUrlFromExercicesParams()
    }
  })

  $effect(() => {
    onDialogChange?.(isDialogOpen)
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
      linkedSession !== undefined
        ? `${linkedSession.name} (copie)`
        : defaultSessionName(getState())
    folderId = linkedSession?.folderId ?? null
    isDialogOpen = true
  }

  async function save() {
    if (linkedSession === undefined) {
      openSaveAs()
      return
    }
    isSaving = true
    try {
      const state = getState()
      library = await updateLibrary((lib) =>
        updateSessionState(lib, linkedSession.id, state),
      )
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
      const state = getState()
      let sessionId = ''
      library = await updateLibrary((lib) => {
        const added = addSession(lib, name, folderId, state)
        sessionId = added.session.id
        return added.library
      })
      requestPersistentStorage()
      currentSessionStore.set(sessionId)
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
    library = await updateLibrary((lib) =>
      changeFolders(lib, 'seances', (set) => {
        const created = createFolder(set, folderName, parentId)
        id = created.folder.id
        return created.library
      }),
    )
    return id
  }

  function openSaves() {
    savesLocationStore.set({
      space: 'seances',
      folderId: linkedSession?.folderId ?? null,
    })
    mathaleaGoToView('mes-sauvegardes')
  }

  const location = $derived(
    linkedSession === undefined
      ? ''
      : [
          SPACE_LABELS.seances,
          ...folderPath(
            foldersOf(library, 'seances'),
            linkedSession.folderId,
          ).map((f) => f.name),
        ].join(' › '),
  )
</script>

{#if isStorageAvailable()}
  {#if hasContent}
  <button
    type="button"
    class={buttonClass}
    disabled={isSaving}
    title={linkedSession !== undefined
      ? `Mettre à jour « ${linkedSession.name} » dans ${location}`
      : `Enregistrer cette séance dans « ${SPACE_LABELS.seances} » (dans ce navigateur)`}
    aria-label="Enregistrer"
    onclick={save}
  >
    {#if showLabels}Enregistrer la séance{/if}
    <i class="bx {saveIcon} {showLabels ? 'text-2xl' : 'text-xl'}" aria-hidden="true"></i>
  </button>
  {#if linkedSession !== undefined}
    <button
      type="button"
      class={buttonClass}
      disabled={isSaving}
      title="Enregistrer comme une nouvelle séance"
      aria-label="Enregistrer sous"
      onclick={openSaveAs}
    >
      {#if showLabels}Enregistrer comme nouvelle séance{/if}
      <i class="bx bx-duplicate {showLabels ? 'text-2xl' : 'text-xl'}" aria-hidden="true"></i>
    </button>
  {/if}
  {/if}
  <button
    type="button"
    class={buttonClass}
    title="Mes sauvegardes : rouvrir une séance enregistrée"
    aria-label="Mes sauvegardes"
    onclick={openSaves}
  >
    {#if showLabels}Mes sauvegardes…{/if}
    <i class="bx bx-folder-open {showLabels ? 'text-2xl' : 'text-xl'}" aria-hidden="true"></i>
  </button>
  <span class="sr-only" role="status">
    {feedback === 'saved'
      ? 'Séance enregistrée'
      : feedback === 'error'
        ? 'Enregistrement impossible'
        : ''}
  </span>
{/if}

<SheetDialog
  open={isDialogOpen}
  title="Enregistrer dans {SPACE_LABELS.seances}"
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
      <span class="font-semibold">Nom de la séance</span>
      <input type="text" class={textInput} bind:value={name} required />
    </label>
    <div class="flex flex-col gap-1">
      <span class="font-semibold">Dossier</span>
      <FolderPicker
        library={foldersOf(library, 'seances')}
        rootLabel={SPACE_LABELS.seances}
        bind:selected={folderId}
        oncreate={addFolder}
      />
    </div>
    <p class={quietText}>
      La séance (onglets, exercices, graines, disposition, outils, écriture, liens et vidéos) est
      enregistrée dans ce navigateur. Pour la retrouver sur un autre ordinateur,
      exportez vos sauvegardes depuis « Mes sauvegardes ».
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
