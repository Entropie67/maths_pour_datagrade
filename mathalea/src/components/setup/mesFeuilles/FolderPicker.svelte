<script lang="ts">
  import {
    childFolders,
    type FolderSet,
    type SheetFolder,
  } from '../../../lib/mesFeuilles/library'
  import { iconButton, quietText, secondaryButton, textInput } from './styles'

  /**
   * Choix d'un dossier d'une partie de « Mes sauvegardes » (enregistrer,
   * déplacer), avec création d'un sous-dossier du dossier choisi.
   */
  interface Props {
    library: FolderSet
    /** Nom de la racine (« Mes feuilles », « Mes sélections ») */
    rootLabel?: string
    selected: string | null
    /** Dossiers impossibles à choisir (un dossier ne va pas dans lui-même) */
    disabledIds?: Set<string>
    oncreate: (name: string, parentId: string | null) => Promise<string>
  }

  let {
    library,
    rootLabel = 'Mes feuilles',
    selected = $bindable(),
    disabledIds = new Set(),
    oncreate,
  }: Props = $props()

  let isCreating = $state(false)
  let newName = $state('')

  async function create() {
    const name = newName.trim()
    if (name === '') return
    selected = await oncreate(name, selected)
    newName = ''
    isCreating = false
  }

  function option(isSelected: boolean, isDisabled: boolean): string {
    if (isDisabled) return 'opacity-40 cursor-not-allowed'
    return isSelected
      ? 'bg-coopmaths-action text-coopmaths-canvas dark:bg-coopmathsdark-action dark:text-coopmathsdark-canvas'
      : 'hover:bg-coopmaths-canvas-dark dark:hover:bg-coopmathsdark-canvas-dark'
  }
</script>

{#snippet branch(folders: SheetFolder[], depth: number)}
  {#each folders as folder (folder.id)}
    {@const isDisabled = disabledIds.has(folder.id)}
    <li>
      <button
        type="button"
        role="radio"
        aria-checked={selected === folder.id}
        disabled={isDisabled}
        class="flex w-full items-center gap-2 rounded px-2 py-1 text-left {option(
          selected === folder.id,
          isDisabled,
        )}"
        style="padding-left: {0.5 + depth * 1.25}rem"
        onclick={() => (selected = folder.id)}
      >
        <i class="bx bx-folder" aria-hidden="true"></i>
        <span class="truncate">{folder.name}</span>
      </button>
      {#if !isDisabled}
        <ul>
          {@render branch(childFolders(library, folder.id), depth + 1)}
        </ul>
      {/if}
    </li>
  {/each}
{/snippet}

<div class="flex flex-col gap-2">
  <ul
    role="radiogroup"
    aria-label="Dossier"
    class="max-h-72 overflow-y-auto rounded-lg border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest p-1"
  >
    <li>
      <button
        type="button"
        role="radio"
        aria-checked={selected === null}
        class="flex w-full items-center gap-2 rounded px-2 py-1 text-left {option(
          selected === null,
          false,
        )}"
        onclick={() => (selected = null)}
      >
        <i class="bx bx-home" aria-hidden="true"></i>
        <span>{rootLabel}</span>
      </button>
      <ul>
        {@render branch(childFolders(library, null), 1)}
      </ul>
    </li>
  </ul>
  {#if isCreating}
    <form
      class="flex flex-row items-center gap-2"
      onsubmit={(event) => {
        event.preventDefault()
        create()
      }}
    >
      <!-- svelte-ignore a11y_autofocus -->
      <input
        type="text"
        class={textInput}
        placeholder="Nom du nouveau dossier"
        aria-label="Nom du nouveau dossier"
        autofocus
        bind:value={newName}
        onkeydown={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault()
            event.stopPropagation()
            isCreating = false
          }
        }}
      />
      <button
        type="submit"
        class={iconButton}
        title="Créer le dossier"
        aria-label="Créer le dossier"
      >
        <i class="bx bx-check text-2xl"></i>
      </button>
      <button
        type="button"
        class={iconButton}
        title="Annuler"
        aria-label="Annuler"
        onclick={() => (isCreating = false)}
      >
        <i class="bx bx-x text-2xl"></i>
      </button>
    </form>
  {:else}
    <div class="flex flex-row items-center gap-3">
      <button
        type="button"
        class="{secondaryButton} text-sm py-1"
        onclick={() => (isCreating = true)}
      >
        <i class="bx bx-folder-plus" aria-hidden="true"></i> Nouveau dossier
      </button>
      <span class={quietText}>créé dans le dossier choisi</span>
    </div>
  {/if}
</div>
