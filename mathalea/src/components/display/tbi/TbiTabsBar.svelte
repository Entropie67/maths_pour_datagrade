<script lang="ts">
  import { tick } from 'svelte'
  import { dismissable, portalToMain } from '../../../lib/components/tbiPopup'
  import {
    addTbiTab,
    moveTbiTab,
    renameTbiTab,
    setTbiActiveTab,
  } from '../../../lib/stores/tbiStore'
  import { tbiDropTabId } from '../../../lib/tbiControls'
  import { tbiLabelPlain } from '../../../lib/tbiLabel'
  import TbiMathText from './TbiMathText.svelte'
  import type { TbiTabEntry } from './tbiTypes'
  import { tbiButton, tbiMenuRow, tbiPanel } from './tbiUi'

  /**
   * Onglets de la séance, dans le bandeau. Toucher affiche, double-toucher
   * renomme, glisser réordonne ; un exercice glissé sur un onglet y est déplacé
   * (voir les dispositions). Flèches, Début et Fin les parcourent au clavier.
   */
  interface Props {
    entries: TbiTabEntry[]
    activeId: string
    onDuplicate: (tabId: string) => void
    onDelete: (tabId: string) => void
  }

  let { entries, activeId, onDuplicate, onDelete }: Props = $props()

  /** Délai (ms) entre deux touchers pour un double-toucher */
  const DOUBLE_TAP_DELAY = 400
  /** Déplacement (px) à partir duquel un toucher devient un glisser */
  const DRAG_THRESHOLD = 10

  let renamingId = $state<string | null>(null)
  let draftName = $state('')
  let menuTabId = $state<string | null>(null)
  let menuAnchor = $state({ left: 0, bottom: 0 })
  let menuButton: HTMLElement | undefined = $state()
  let strip: HTMLElement | undefined = $state()
  let lastTap = { id: '', at: 0 }
  let dragIndex = $state<number | null>(null)
  let dropIndex = $state<number | null>(null)
  let justDragged = false

  async function startRenaming(entry: TbiTabEntry) {
    menuTabId = null
    renamingId = entry.id
    draftName = entry.label
    await tick()
    const input = strip?.querySelector<HTMLInputElement>('input')
    input?.focus()
    input?.select()
  }

  function finishRenaming(save: boolean) {
    if (renamingId === null) return
    if (save) renameTbiTab(renamingId, draftName)
    renamingId = null
  }

  function onTabClick(entry: TbiTabEntry) {
    if (justDragged) {
      justDragged = false
      return
    }
    const now = Date.now()
    const isDoubleTap =
      lastTap.id === entry.id && now - lastTap.at < DOUBLE_TAP_DELAY
    lastTap = { id: entry.id, at: now }
    setTbiActiveTab(entry.id)
    if (isDoubleTap) void startRenaming(entry)
  }

  function onTabKeydown(event: KeyboardEvent, index: number) {
    let next: number | null = null
    if (event.key === 'ArrowRight') next = (index + 1) % entries.length
    if (event.key === 'ArrowLeft') {
      next = (index - 1 + entries.length) % entries.length
    }
    if (event.key === 'Home') next = 0
    if (event.key === 'End') next = entries.length - 1
    if (event.key === 'F2') {
      event.preventDefault()
      void startRenaming(entries[index])
      return
    }
    if (next === null) return
    event.preventDefault()
    setTbiActiveTab(entries[next].id)
    strip?.querySelectorAll<HTMLElement>('[role="tab"]')[next]?.focus()
  }

  /** Rang d'insertion sous le pointeur, d'après la place de chaque onglet */
  function indexAt(x: number): number {
    const tabs = strip?.querySelectorAll<HTMLElement>('[data-tbi-tab-id]') ?? []
    let index = 0
    tabs.forEach((tab, i) => {
      const rect = tab.getBoundingClientRect()
      if (x > rect.left + rect.width / 2) index = i
    })
    return index
  }

  function onTabPointerDown(event: PointerEvent, index: number) {
    if (event.button !== 0) return
    const startX = event.clientX
    const pointerId = event.pointerId

    function move(moveEvent: PointerEvent) {
      if (moveEvent.pointerId !== pointerId) return
      if (
        dragIndex === null &&
        Math.abs(moveEvent.clientX - startX) < DRAG_THRESHOLD
      ) {
        return
      }
      dragIndex = index
      dropIndex = indexAt(moveEvent.clientX)
    }

    function end(endEvent: PointerEvent) {
      if (endEvent.pointerId !== pointerId) return
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', end)
      window.removeEventListener('pointercancel', end)
      if (dragIndex !== null && dropIndex !== null) {
        justDragged = true
        moveTbiTab(dragIndex, dropIndex)
      }
      dragIndex = null
      dropIndex = null
    }

    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', end)
    window.addEventListener('pointercancel', end)
  }

  function openMenu(event: MouseEvent, tabId: string) {
    event.stopPropagation()
    if (menuTabId === tabId) {
      menuTabId = null
      return
    }
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    menuAnchor = {
      left: Math.max(8, rect.left),
      bottom: window.innerHeight - rect.top + 12,
    }
    menuButton = event.currentTarget as HTMLElement
    menuTabId = tabId
  }

  const menuEntry = $derived(entries.find((entry) => entry.id === menuTabId))

  // l'onglet affiché reste visible quand ils ne tiennent pas tous dans le bandeau
  $effect(() => {
    strip
      ?.querySelector(`[data-tbi-tab-id="${activeId}"]`)
      ?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
  })
</script>

<!-- le « + » reste à part : il ne défile jamais avec les onglets -->
<div class="flex flex-row items-center gap-1 flex-1 min-w-36">
  <div
    bind:this={strip}
    class="flex flex-row items-center gap-1 min-w-0 overflow-x-auto"
    role="tablist"
    aria-label="Onglets de la séance"
  >
    {#each entries as entry, index (entry.id)}
      {@const isActive = entry.id === activeId}
      <div
        data-tbi-tab-id={entry.id}
        class="relative flex flex-row items-center min-w-24 max-w-72 rounded-xl {$tbiDropTabId ===
        entry.id
          ? 'outline-3 outline-coopmaths-struct dark:outline-coopmathsdark-struct'
          : ''} {dragIndex === index ? 'opacity-50' : ''} {dropIndex ===
          index && dragIndex !== index
          ? 'tbi-drop-before'
          : ''}"
      >
        {#if renamingId === entry.id}
          <input
            class="h-12 w-52 px-3 rounded-xl border-2 text-lg font-semibold border-coopmaths-struct dark:border-coopmathsdark-struct bg-coopmaths-canvas dark:bg-coopmathsdark-canvas text-coopmaths-corpus dark:text-coopmathsdark-corpus"
            aria-label="Nom de l'onglet"
            bind:value={draftName}
            onblur={() => finishRenaming(true)}
            onkeydown={(event) => {
              event.stopPropagation()
              if (event.key === 'Enter') finishRenaming(true)
              if (event.key === 'Escape') finishRenaming(false)
            }}
          />
        {:else}
          <button
            type="button"
            id="tbi-tab-{entry.id}"
            role="tab"
            aria-selected={isActive}
            aria-controls="tbi-tab-panel"
            tabindex={isActive ? 0 : -1}
            class="{tbiButton(
              isActive,
              isActive ? 'pl-4 pr-11' : 'px-4',
            )} !shrink w-full min-w-0 select-none"
            style="touch-action: none"
            title={`${tbiLabelPlain(entry.label)}. Toucher deux fois pour renommer, glisser pour déplacer.`}
            onpointerdown={(event) => onTabPointerDown(event, index)}
            onclick={() => onTabClick(entry)}
            onkeydown={(event) => onTabKeydown(event, index)}
          >
            <TbiMathText class="truncate" text={entry.label} />
          </button>
          {#if isActive}
            <button
              type="button"
              class="absolute right-0 top-0 flex items-center justify-center w-11 h-12 rounded-r-xl text-2xl text-coopmaths-canvas dark:text-coopmathsdark-canvas hover:bg-black/15"
              title="Options de l'onglet"
              aria-label={`Options de l'onglet ${tbiLabelPlain(entry.label)}`}
              aria-expanded={menuTabId === entry.id}
              onclick={(event) => openMenu(event, entry.id)}
            >
              <i class="bx bx-chevron-up"></i>
            </button>
          {/if}
        {/if}
      </div>
    {/each}
  </div>
  <button
    type="button"
    class={tbiButton(false, '')}
    title="Nouvel onglet"
    aria-label="Nouvel onglet"
    onclick={() => addTbiTab()}
  >
    <i class="bx bx-plus text-2xl"></i>
  </button>
</div>

{#if menuEntry}
  <div
    use:portalToMain
    use:dismissable={{
      onDismiss: () => (menuTabId = null),
      ignore: () => [menuButton],
    }}
    data-tbi-chrome
    data-tbi-panel
    role="dialog"
    aria-label={`Options de l'onglet ${tbiLabelPlain(menuEntry.label)}`}
    class="{tbiPanel} fixed z-[55] w-72 p-2"
    style:left="{menuAnchor.left}px"
    style:bottom="{menuAnchor.bottom}px"
  >
    <button
      type="button"
      class={tbiMenuRow}
      onclick={() => startRenaming(menuEntry)}
    >
      Renommer
      <i class="bx bx-edit-alt text-2xl"></i>
    </button>
    <button
      type="button"
      class={tbiMenuRow}
      onclick={() => {
        const { id } = menuEntry
        menuTabId = null
        onDuplicate(id)
      }}
    >
      Dupliquer
      <i class="bx bx-duplicate text-2xl"></i>
    </button>
    <div
      class="h-px my-1 bg-coopmaths-canvas-darkest dark:bg-coopmathsdark-canvas-darkest"
    ></div>
    <button
      type="button"
      class="{tbiMenuRow} text-red-700 dark:text-red-400"
      onclick={() => {
        const { id } = menuEntry
        menuTabId = null
        onDelete(id)
      }}
    >
      Supprimer l'onglet
      <i class="bx bx-trash text-2xl"></i>
    </button>
  </div>
{/if}

<style>
  .tbi-drop-before::before {
    content: '';
    position: absolute;
    left: -4px;
    top: 4px;
    bottom: 4px;
    width: 4px;
    border-radius: 2px;
    background: var(--color-coopmaths-struct);
  }
</style>
