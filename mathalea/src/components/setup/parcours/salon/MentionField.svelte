<script lang="ts">
  /**
   * Champ de saisie d'un commentaire ou d'un message du salon : « @ » propose
   * les membres du salon (flèches, Entrée ou Tab pour choisir, Échap pour
   * fermer). Ctrl+Entrée envoie un commentaire ; Entrée envoie un message
   * d'une ligne.
   */
  import { tick } from 'svelte'
  import {
    insertMention,
    mentionQuery,
    suggestMembers,
  } from '../../../../lib/parcours/salon/mentions'

  let {
    value = $bindable(''),
    names,
    label,
    multiline = true,
    rows = 2,
    autofocus = false,
    fieldClass,
    onsubmit,
    onescape,
  }: {
    value?: string
    names: string[]
    label: string
    multiline?: boolean
    rows?: number
    autofocus?: boolean
    fieldClass: string
    onsubmit: () => void
    onescape?: () => void
  } = $props()

  let field: HTMLTextAreaElement | HTMLInputElement | undefined = $state()
  let query = $state<{ start: number; query: string } | null>(null)
  let active = $state(0)
  const suggestions = $derived(
    query ? suggestMembers(query.query, names) : [],
  )
  const listId = `mentions-${Math.random().toString(36).slice(2, 8)}`

  function follow() {
    if (!field) return
    query = mentionQuery(value, field.selectionStart ?? value.length)
    active = 0
  }

  async function choose(name: string) {
    if (!field || !query) return
    const r = insertMention(
      value,
      query.start,
      field.selectionStart ?? value.length,
      name,
    )
    value = r.text
    query = null
    await tick()
    field.focus()
    field.setSelectionRange(r.caret, r.caret)
  }

  function keydown(e: KeyboardEvent) {
    if (suggestions.length) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        const n = suggestions.length
        active = (active + (e.key === 'ArrowDown' ? 1 : n - 1)) % n
        return
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault()
        void choose(suggestions[active])
        return
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        query = null
        return
      }
    }
    if (e.key === 'Escape') onescape?.()
    if (e.key === 'Enter' && (!multiline || e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      onsubmit()
    }
  }
</script>

<div class="relative w-full">
  {#if suggestions.length}
    <ul
      id={listId}
      role="listbox"
      aria-label="Membres du salon"
      class="absolute z-10 bottom-full mb-1 left-0 min-w-48 max-w-full rounded-md border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest bg-coopmaths-canvas dark:bg-coopmathsdark-canvas shadow-lg py-1"
    >
      {#each suggestions as name, k (name)}
        <li
          role="option"
          aria-selected={k === active}
          class="px-3 py-1 text-sm cursor-pointer {k === active
            ? 'bg-coopmaths-canvas-darkest dark:bg-coopmathsdark-canvas-darkest'
            : ''}"
          onmousedown={(e) => {
            // Le champ garde le focus : le choix se fait au clic
            e.preventDefault()
            void choose(name)
          }}
          onmouseenter={() => (active = k)}
        >
          @{name}
        </li>
      {/each}
    </ul>
  {/if}
  {#if multiline}
    <!-- svelte-ignore a11y_autofocus -->
    <textarea
      bind:this={field}
      class={fieldClass}
      {rows}
      aria-label={label}
      aria-autocomplete="list"
      aria-controls={suggestions.length ? listId : undefined}
      {autofocus}
      bind:value
      oninput={follow}
      onclick={follow}
      onkeydown={keydown}
      onblur={() => (query = null)}
    ></textarea>
  {:else}
    <!-- svelte-ignore a11y_autofocus -->
    <input
      bind:this={field}
      class={fieldClass}
      aria-label={label}
      aria-autocomplete="list"
      aria-controls={suggestions.length ? listId : undefined}
      {autofocus}
      bind:value
      oninput={follow}
      onclick={follow}
      onkeydown={keydown}
      onblur={() => (query = null)}
    />
  {/if}
</div>
