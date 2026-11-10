<script lang="ts">
  import { tick } from 'svelte'
  import { mathaleaRenderDiv } from '../../../lib/mathalea'
  import { normalize } from '../../../lib/mesFeuilles/library'
  import { slideshowUrl } from '../../../lib/mesFeuilles/slideshowLink'
  import {
    renameSlideshow,
    type SlideshowHistoryEntry,
  } from '../../../lib/mesFeuilles/slideshowHistory'
  import SheetDialog from './SheetDialog.svelte'
  import {
    dangerButton,
    iconButton,
    primaryButton,
    quietText,
    secondaryButton,
    textInput,
  } from './styles'

  /**
   * Historique des diaporamas, dans « Mes sauvegardes » : les diaporamas lancés
   * depuis cet ordinateur, avec leurs réglages et leurs exercices (graines
   * comprises). Rouvrir dans le diaporama pour le modifier ou le relancer,
   * renommer, supprimer.
   */
  interface Props {
    items: SlideshowHistoryEntry[]
    /** Recherche de la vue (titres et exercices) */
    search: string
    /** Enregistre l'historique modifié */
    onchange: (items: SlideshowHistoryEntry[]) => void
    formatDate: (iso: string) => string
  }

  let { items, search, onchange, formatDate }: Props = $props()

  const shown = $derived.by(() => {
    const words = normalize(search)
      .split(' ')
      .filter((word) => word !== '')
    return items.filter((item) => {
      const text = normalize(
        `${item.title} ${item.summary.exercisesTooltip ?? item.summary.exercises}`,
      )
      return words.every((word) => text.includes(word))
    })
  })

  let container: HTMLDivElement | undefined = $state()
  let deleting = $state<SlideshowHistoryEntry | null>(null)
  let isClearing = $state(false)
  let renamingId = $state('')
  let renameValue = $state('')

  // les titres des exercices peuvent contenir des formules
  $effect(() => {
    void shown
    const div = container
    if (div === undefined) return
    tick().then(() => mathaleaRenderDiv(div))
  })

  function open(item: SlideshowHistoryEntry) {
    window.location.assign(slideshowUrl(item).href)
  }

  function startRename(item: SlideshowHistoryEntry) {
    renamingId = item.id
    renameValue = item.title
  }

  function commitRename(item: SlideshowHistoryEntry) {
    if (renamingId === '') return
    const value = renameValue.trim()
    renamingId = ''
    if (value === '' || value === item.title) return
    onchange(renameSlideshow(items, item.id, value))
  }

  function confirmDelete() {
    const item = deleting
    deleting = null
    if (item !== null) onchange(items.filter((entry) => entry.id !== item.id))
  }

  function confirmClear() {
    isClearing = false
    onchange([])
  }
</script>

<div class="flex flex-row flex-wrap items-center gap-3">
  <h2
    class="text-xl font-bold text-coopmaths-struct dark:text-coopmathsdark-struct"
  >
    <i class="bx bx-slideshow" aria-hidden="true"></i> Historique des diaporamas
  </h2>
  <span class={quietText}>
    {items.length} diaporama{items.length > 1 ? 's' : ''}
  </span>
  <span class="grow"></span>
  {#if items.length > 0}
    <button
      type="button"
      class="{secondaryButton} py-1 text-sm"
      onclick={() => (isClearing = true)}
    >
      <i class="bx bx-trash-alt" aria-hidden="true"></i> Effacer l’historique
    </button>
  {/if}
</div>
<p class={quietText}>
  Les diaporamas lancés depuis cet ordinateur, avec leurs réglages et leurs
  exercices (mêmes questions qu’au lancement).
</p>

{#if items.length === 0}
  <div
    class="flex flex-col items-start gap-2 max-w-2xl rounded-xl px-6 py-5 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark"
  >
    <p class="font-semibold">Aucun diaporama dans l’historique.</p>
    <p class={quietText}>
      Un diaporama y est ajouté chaque fois que vous le lancez.
    </p>
  </div>
{:else if shown.length === 0}
  <p class={quietText}>Aucun diaporama ne correspond à la recherche.</p>
{:else}
  <div class="flex flex-col gap-2" bind:this={container}>
    {#each shown as item (item.id)}
      <article
        class="flex flex-row flex-wrap items-start gap-3 rounded-lg border px-4 py-3 border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest"
      >
        <i
          class="bx bx-slideshow mt-1 text-2xl text-coopmaths-action dark:text-coopmathsdark-action"
          aria-hidden="true"
        ></i>
        <div class="flex min-w-0 flex-1 flex-col gap-0.5">
          {#if renamingId === item.id}
            <!-- svelte-ignore a11y_autofocus -->
            <input
              type="text"
              class="{textInput} py-1"
              aria-label="Nouveau titre"
              maxlength="200"
              autofocus
              bind:value={renameValue}
              onkeydown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  commitRename(item)
                } else if (event.key === 'Escape') {
                  event.preventDefault()
                  renamingId = ''
                }
              }}
              onblur={() => commitRename(item)}
            />
          {:else}
            <h3 class="font-semibold" title={item.title}>{item.title}</h3>
          {/if}
          <span class="text-sm" title={item.summary.exercisesTooltip}>
            {item.summary.exercises}
          </span>
          {#if item.summary.settings !== ''}
            <span class={quietText}>{item.summary.settings}</span>
          {/if}
          <span class={quietText}>
            Créé le {formatDate(item.createdAt)} · dernière utilisation le {formatDate(
              item.lastUsedAt,
            )}
          </span>
        </div>
        <button
          type="button"
          class="{primaryButton} px-3 py-1 text-sm"
          title="Rouvrir dans le diaporama pour le modifier ou le lancer"
          onclick={() => open(item)}
        >
          <i class="bx bx-edit" aria-hidden="true"></i> Modifier
        </button>
        <span class="flex flex-row">
          <button
            type="button"
            class={iconButton}
            title="Renommer"
            aria-label="Renommer {item.title}"
            onclick={() => startRename(item)}
          >
            <i class="bx bx-rename text-lg"></i>
          </button>
          <button
            type="button"
            class={iconButton}
            title="Supprimer"
            aria-label="Supprimer {item.title}"
            onclick={() => (deleting = item)}
          >
            <i class="bx bx-trash text-lg"></i>
          </button>
        </span>
      </article>
    {/each}
  </div>
{/if}

<SheetDialog
  open={deleting !== null}
  title="Supprimer ce diaporama ?"
  onclose={() => (deleting = null)}
>
  <div class="flex flex-col gap-4">
    <p>
      Le diaporama « {deleting?.title ?? ''} » sera retiré de l’historique de ce navigateur.
    </p>
    <div class="flex flex-row justify-end gap-3">
      <button
        type="button"
        class={secondaryButton}
        onclick={() => (deleting = null)}>Annuler</button
      >
      <button type="button" class={dangerButton} onclick={confirmDelete}>
        <i class="bx bx-trash" aria-hidden="true"></i> Supprimer
      </button>
    </div>
  </div>
</SheetDialog>

<SheetDialog
  open={isClearing}
  title="Effacer l’historique ?"
  onclose={() => (isClearing = false)}
>
  <div class="flex flex-col gap-4">
    <p>
      Les {items.length} diaporamas de l’historique seront supprimés de ce navigateur.
      Cette action est définitive, sauf si vous avez exporté vos sauvegardes.
    </p>
    <div class="flex flex-row justify-end gap-3">
      <button
        type="button"
        class={secondaryButton}
        onclick={() => (isClearing = false)}>Annuler</button
      >
      <button type="button" class={dangerButton} onclick={confirmClear}>
        <i class="bx bx-trash" aria-hidden="true"></i> Tout effacer
      </button>
    </div>
  </div>
</SheetDialog>
