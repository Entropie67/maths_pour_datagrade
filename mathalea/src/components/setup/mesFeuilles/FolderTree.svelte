<script lang="ts">
  import {
    childFolders,
    folderPath,
    type FolderSet,
    type SheetFolder,
  } from '../../../lib/mesFeuilles/library'

  /**
   * Arborescence des dossiers d'une partie de « Mes sauvegardes » (colonne
   * de gauche) : navigation et cible du glisser-déposer.
   */
  interface Props {
    library: FolderSet
    /** Nom de la racine (« Mes feuilles », « Mes sélections ») */
    rootLabel: string
    rootIcon: string
    /** Nombre d'éléments d'un dossier et de ses sous-dossiers (`null` : tous) */
    count: (folderId: string | null) => number
    /** Dossier ouvert (`null` : la racine, `undefined` : aucun, pendant une recherche) */
    currentId: string | null | undefined
    onselect: (folderId: string | null) => void
    /** Le dossier peut-il recevoir l'élément glissé ? (`false` : rien n'est glissé) */
    canDrop: (folderId: string | null) => boolean
    ondrop: (folderId: string | null) => void
  }

  let {
    library,
    rootLabel,
    rootIcon,
    count,
    currentId,
    onselect,
    canDrop,
    ondrop,
  }: Props = $props()

  let expanded = $state(new Set<string>())
  let dropTarget: string | null | undefined = $state(undefined)

  // le chemin du dossier ouvert reste déplié
  $effect(() => {
    const path = folderPath(library, currentId ?? null)
    if (path.some((f) => !expanded.has(f.id))) {
      expanded = new Set([...expanded, ...path.map((f) => f.id)])
    }
  })

  function toggle(id: string) {
    const next = new Set(expanded)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    expanded = next
  }

  function dropHandlers(folderId: string | null) {
    return {
      ondragover: (event: DragEvent) => {
        if (!canDrop(folderId)) return
        event.preventDefault()
        if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
        dropTarget = folderId
      },
      ondragleave: () => {
        if (dropTarget === folderId) dropTarget = undefined
      },
      ondrop: (event: DragEvent) => {
        event.preventDefault()
        dropTarget = undefined
        if (canDrop(folderId)) ondrop(folderId)
      },
    }
  }

  function itemClass(folderId: string | null): string {
    if (dropTarget === folderId) {
      return 'ring-2 ring-coopmaths-action dark:ring-coopmathsdark-action bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark'
    }
    return currentId === folderId
      ? 'bg-coopmaths-action/15 dark:bg-coopmathsdark-action/20 font-semibold text-coopmaths-action dark:text-coopmathsdark-action'
      : 'hover:bg-coopmaths-canvas-dark dark:hover:bg-coopmathsdark-canvas-dark'
  }
</script>

{#snippet branch(folders: SheetFolder[], depth: number)}
  {#each folders as folder (folder.id)}
    {@const children = childFolders(library, folder.id)}
    {@const isOpen = expanded.has(folder.id)}
    <li>
      <div
        class="flex items-center gap-1 rounded pr-2 {itemClass(folder.id)}"
        style="padding-left: {depth * 1}rem"
        {...dropHandlers(folder.id)}
      >
        <button
          type="button"
          class="w-5 shrink-0 text-lg {children.length === 0
            ? 'invisible'
            : ''}"
          aria-label={isOpen ? 'Replier' : 'Déplier'}
          aria-expanded={isOpen}
          tabindex={children.length === 0 ? -1 : 0}
          onclick={() => toggle(folder.id)}
        >
          <i class="bx {isOpen ? 'bx-chevron-down' : 'bx-chevron-right'}"></i>
        </button>
        <button
          type="button"
          class="flex min-w-0 grow items-center gap-2 py-1 text-left"
          aria-current={currentId === folder.id ? 'page' : undefined}
          onclick={() => onselect(folder.id)}
        >
          <i
            class="bx {currentId === folder.id
              ? 'bxs-folder-open'
              : 'bx-folder'}"
            aria-hidden="true"
          ></i>
          <span class="truncate">{folder.name}</span>
          <span class="ml-auto text-xs opacity-60">{count(folder.id)}</span>
        </button>
      </div>
      {#if isOpen && children.length > 0}
        <ul>
          {@render branch(children, depth + 1)}
        </ul>
      {/if}
    </li>
  {/each}
{/snippet}

<nav aria-label="Dossiers de {rootLabel}">
  <ul class="flex flex-col gap-0.5 text-sm">
    <li>
      <div
        class="flex items-center gap-1 rounded pr-2 {itemClass(null)}"
        {...dropHandlers(null)}
      >
        <button
          type="button"
          class="flex min-w-0 grow items-center gap-2 py-1 pl-2 text-left"
          aria-current={currentId === null ? 'page' : undefined}
          onclick={() => onselect(null)}
        >
          <i class="bx {rootIcon}" aria-hidden="true"></i>
          <span class="truncate">{rootLabel}</span>
          <span class="ml-auto text-xs opacity-60">{count(null)}</span>
        </button>
      </div>
      <ul>
        {@render branch(childFolders(library, null), 1)}
      </ul>
    </li>
  </ul>
</nav>
