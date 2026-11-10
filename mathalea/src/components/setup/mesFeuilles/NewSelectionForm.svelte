<script lang="ts">
  import { untrack } from 'svelte'
  import {
    addSelection,
    changeFolders,
    COMMENT_MAX_LENGTH,
    createFolder,
    foldersOf,
    SPACE_LABELS,
    updateSelection,
    type SavedSelection,
    type SheetLibrary,
    type Stars,
  } from '../../../lib/mesFeuilles/library'
  import {
    defaultSelectionName,
    readSelectionLink,
    replaceExercises,
    type LinkContent,
  } from '../../../lib/mesFeuilles/selectionLink'
  import {
    requestPersistentStorage,
    updateLibrary,
  } from '../../../lib/mesFeuilles/storage'
  import FolderPicker from './FolderPicker.svelte'
  import StarRating from './StarRating.svelte'
  import {
    primaryButton,
    quietText,
    secondaryButton,
    textInput,
  } from './styles'

  /**
   * Ajout d'une sélection à « Mes sélections » : à partir d'un lien collé,
   * ou de l'état de l'application (`content`). Si l'enseignant modifie les
   * exercices d'une sélection (`editedSelection`), propose aussi de la
   * mettre à jour.
   */
  interface Props {
    library: SheetLibrary
    /** Lien à enregistrer ; absent, l'enseignant colle un lien */
    content?: LinkContent
    folderId?: string | null
    editedSelection?: SavedSelection
    oncancel: () => void
    /** Après l'enregistrement (nouvelle sélection ou mise à jour) */
    onsaved: (library: SheetLibrary, selection: SavedSelection) => void
  }

  let {
    library,
    content,
    folderId = null,
    editedSelection,
    oncancel,
    onsaved,
  }: Props = $props()

  let current = $state(untrack(() => library))
  let link = $state('')
  let name = $state(
    untrack(() => (content === undefined ? '' : defaultSelectionName(content))),
  )
  let isNameTouched = $state(false)
  let folder: string | null = $state(untrack(() => folderId))
  let stars: Stars = $state(0)
  let comment = $state('')
  let newDataEachTime = $state(false)
  let isSaving = $state(false)
  let saveError = $state('')

  const parsed = $derived.by(() => {
    if (content !== undefined) return { content, error: '' }
    if (link.trim() === '') return { content: undefined, error: '' }
    try {
      return { content: readSelectionLink(link), error: '' }
    } catch (error) {
      return {
        content: undefined,
        error: error instanceof Error ? error.message : 'Lien illisible.',
      }
    }
  })

  // nom proposé d'après le lien, tant que l'enseignant n'en a pas tapé un
  $effect(() => {
    const read = parsed.content
    if (read !== undefined && !untrack(() => isNameTouched)) {
      name = defaultSelectionName(read)
    }
  })

  async function addFolder(folderName: string, parentId: string | null) {
    let id = ''
    current = await updateLibrary((lib) =>
      changeFolders(lib, 'selections', (set) => {
        const created = createFolder(set, folderName, parentId)
        id = created.folder.id
        return created.library
      }),
    )
    return id
  }

  async function save() {
    const read = parsed.content
    if (read === undefined) return
    isSaving = true
    saveError = ''
    try {
      let selection: SavedSelection | undefined
      current = await updateLibrary((lib) => {
        const added = addSelection(lib, {
          ...read,
          name,
          folderId: folder,
          stars,
          comment,
          newDataEachTime: read.externalUrl === undefined && newDataEachTime,
        })
        selection = added.selection
        return added.library
      })
      requestPersistentStorage()
      if (selection !== undefined) onsaved(current, selection)
    } catch (error) {
      console.error('Enregistrement impossible', error)
      saveError = 'La sélection n’a pas pu être enregistrée dans ce navigateur.'
    } finally {
      isSaving = false
    }
  }

  async function replace(edited: SavedSelection) {
    const read = parsed.content
    if (read === undefined) return
    isSaving = true
    saveError = ''
    try {
      current = await updateLibrary((lib) =>
        updateSelection(lib, edited.id, replaceExercises(edited.query, read)),
      )
      const updated = current.selections.find((s) => s.id === edited.id)
      if (updated !== undefined) onsaved(current, updated)
    } catch (error) {
      console.error('Mise à jour impossible', error)
      saveError = 'La sélection n’a pas pu être mise à jour.'
    } finally {
      isSaving = false
    }
  }
</script>

<form
  class="flex flex-col gap-4"
  onsubmit={(event) => {
    event.preventDefault()
    save()
  }}
>
  {#if content === undefined}
    <label class="flex flex-col gap-1">
      <span class="font-semibold">Lien</span>
      <!-- svelte-ignore a11y_autofocus -->
      <textarea
        class="{textInput} text-sm"
        rows="3"
        placeholder="https://coopmaths.fr/alea/?uuid=…"
        autofocus
        required
        bind:value={link}
      ></textarea>
      {#if parsed.error !== ''}
        <span
          class="text-sm text-coopmaths-warn-darkest dark:text-coopmathsdark-warn-darkest"
          role="alert">{parsed.error}</span
        >
      {:else if parsed.content !== undefined && parsed.content.externalUrl === undefined}
        <span class={quietText}>
          {parsed.content.exercises.length} exercice{parsed.content.exercises
            .length > 1
            ? 's'
            : ''} : {parsed.content.exercises.join(', ')}
        </span>
      {:else}
        <span class={quietText}>
          Coller une adresse web. Pour un lien MathALÉA, utiliser une page de
          mathalea.fr/alea ou coopmaths.fr/alea.
        </span>
      {/if}
    </label>
  {/if}

  {#if editedSelection !== undefined && parsed.content !== undefined}
    <div
      class="flex flex-col gap-2 rounded-lg px-4 py-3 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark"
    >
      <p class="text-sm">
        Vous modifiez les exercices de la sélection « {editedSelection.name} ». La
        mettre à jour garde son nom, ses étoiles, son commentaire et ses réglages
        (vue, présentation…).
      </p>
      <button
        type="button"
        class="{primaryButton} self-start text-sm py-1"
        disabled={isSaving}
        onclick={() => replace(editedSelection)}
      >
        <i class="bx bx-revision" aria-hidden="true"></i> Mettre à jour « {editedSelection.name}
        »
      </button>
      <p class={quietText}>Ou l’enregistrer comme une nouvelle sélection :</p>
    </div>
  {/if}

  <label class="flex flex-col gap-1">
    <span class="font-semibold">Nom</span>
    <input
      type="text"
      class={textInput}
      required
      bind:value={name}
      oninput={() => (isNameTouched = true)}
    />
  </label>
  <div class="flex flex-row flex-wrap items-center gap-3">
    <span class="font-semibold">Étoiles</span>
    <StarRating
      value={stars}
      onchange={(value) => (stars = value)}
      label="la nouvelle sélection"
      size="text-2xl"
    />
  </div>
  <label class="flex flex-col gap-1">
    <span class="font-semibold">Commentaire</span>
    <textarea
      class="{textInput} text-sm"
      rows="2"
      maxlength={COMMENT_MAX_LENGTH}
      placeholder="Marche bien en début de séquence, question 3 difficile…"
      bind:value={comment}
    ></textarea>
  </label>
  {#if parsed.content !== undefined && parsed.content.externalUrl === undefined}
    <label class="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" bind:checked={newDataEachTime} />
      Nouveaux énoncés à chaque ouverture
    </label>
  {/if}
  <div class="flex flex-col gap-1">
    <span class="font-semibold">Dossier</span>
    <FolderPicker
      library={foldersOf(current, 'selections')}
      rootLabel={current.organization?.merged
        ? 'Feuilles, sélections et séances'
        : SPACE_LABELS.selections}
      bind:selected={folder}
      oncreate={addFolder}
    />
  </div>
  {#if saveError !== ''}
    <p
      class="text-sm text-coopmaths-warn-darkest dark:text-coopmathsdark-warn-darkest"
      role="alert"
    >
      {saveError}
    </p>
  {/if}
  <div class="flex flex-row justify-end gap-3">
    <button type="button" class={secondaryButton} onclick={oncancel}>
      Annuler
    </button>
    <button
      type="submit"
      class={primaryButton}
      disabled={isSaving || parsed.content === undefined}
    >
      <i class="bx bx-bookmark-plus" aria-hidden="true"></i> Ajouter
    </button>
  </div>
</form>
