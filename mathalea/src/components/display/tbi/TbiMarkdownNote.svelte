<script lang="ts">
  import { onMount, tick, untrack } from 'svelte'
  import {
    applyNoteStyle,
    renderTbiNote,
    TBI_NOTE_COLORS,
    TBI_NOTE_SIZES,
    toggleLinePrefix,
    toggleMarker,
    type TbiNoteEdit,
  } from '../../../lib/tbiMarkdown'
  import {
    clampNoteFontSize,
    TBI_NOTE_FONT_SIZE_STEP,
    TBI_NOTE_MAX_FONT_SIZE,
    TBI_NOTE_MIN_FONT_SIZE,
  } from '../../../lib/tbiTextContent'

  interface Props {
    text: string
    fontSize: number
    /** Interface du visualiseur affichée (survol) : outils de la note visibles */
    showTools: boolean
    /** Note modifiée, à enregistrer dans le visualiseur */
    onChange: (patch: { text?: string; fontSize?: number }) => void
    /** Passage de l'édition à l'affichage et inversement */
    onEditingChange?: (editing: boolean) => void
  }

  let {
    text,
    fontSize,
    showTools,
    onChange,
    onEditingChange = () => {},
  }: Props = $props()

  // la note vit ici pendant la saisie : le visualiseur n'en reçoit que la copie
  let draft = $state(untrack(() => text))
  // une note vide s'ouvre en édition, une note enregistrée s'affiche
  let editing = $state(untrack(() => text === ''))
  let bodyWidth = $state(0)
  let textarea: HTMLTextAreaElement | undefined = $state()

  /** Sous cette largeur, l'aperçu en direct ne tient plus à côté de la saisie */
  const SPLIT_MIN_WIDTH = 620

  let rendered = $derived(renderTbiNote(draft))
  let isSplit = $derived(editing && bodyWidth >= SPLIT_MIN_WIDTH)

  /** Repasse en affichage : le visualiseur a perdu le focus */
  export function stopEditing() {
    if (editing) setEditing(false)
  }

  function setEditing(next: boolean) {
    editing = next
    onEditingChange(next)
    if (next) void tick().then(() => textarea?.focus({ preventScroll: true }))
  }

  onMount(() => {
    onEditingChange(editing)
    if (editing) textarea?.focus({ preventScroll: true })
  })

  function updateDraft(next: string) {
    draft = next
    onChange({ text: next })
  }

  /**
   * Applique une mise en forme à la sélection. `execCommand` est déprécié mais
   * reste le seul moyen de garder Ctrl+Z après une modification par le code.
   */
  function edit(
    compute: (t: string, start: number, end: number) => TbiNoteEdit,
  ) {
    if (!textarea) return
    const { selectionStart, selectionEnd } = textarea
    const result = compute(draft, selectionStart, selectionEnd)
    textarea.focus({ preventScroll: true })
    textarea.setSelectionRange(0, textarea.value.length)
    const isInserted =
      result.text !== '' &&
      document.execCommand('insertText', false, result.text)
    if (!isInserted) textarea.value = result.text
    textarea.setSelectionRange(result.start, result.end)
    updateDraft(result.text)
  }

  function onTextareaKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.stopPropagation()
      setEditing(false)
      return
    }
    if (!event.ctrlKey && !event.metaKey) return
    const key = event.key.toLowerCase()
    if (key === 'b') {
      event.preventDefault()
      edit((t, s, e) => toggleMarker(t, s, e, '**'))
    } else if (key === 'i') {
      event.preventDefault()
      edit((t, s, e) => toggleMarker(t, s, e, '*'))
    }
  }

  function zoomBy(delta: number) {
    onChange({ fontSize: clampNoteFontSize(fontSize + delta) })
  }

  const toolClass =
    'flex items-center justify-center min-w-11 h-11 px-1 rounded-lg shrink-0 text-coopmaths-corpus dark:text-coopmathsdark-corpus hover:bg-coopmaths-canvas-darkest dark:hover:bg-coopmathsdark-canvas-darkest disabled:opacity-40 disabled:hover:bg-transparent'
  const separatorClass =
    'w-px h-5 mx-1 shrink-0 bg-coopmaths-canvas-darkest dark:bg-coopmathsdark-canvas-darkest'
</script>

<div
  class="tbi-note-host flex flex-col flex-1 min-h-0 bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark text-coopmaths-corpus dark:text-coopmathsdark-corpus"
>
  <div bind:clientWidth={bodyWidth} class="flex flex-row flex-1 min-h-0 w-full">
    {#if editing}
      <textarea
        bind:this={textarea}
        value={draft}
        class="flex-1 min-w-0 h-full p-3 resize-none border-0 outline-none font-mono text-base bg-transparent text-inherit focus:ring-0"
        placeholder="Écrire la note en Markdown : **gras**, # Titre, - liste, $x^2$…"
        aria-label="Texte de la note, en Markdown"
        spellcheck="false"
        oninput={(event) => updateDraft(event.currentTarget.value)}
        onkeydown={onTextareaKeydown}
      ></textarea>
    {/if}
    {#if !editing || isSplit}
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="tbi-note flex-1 min-w-0 h-full overflow-auto p-3 {isSplit
          ? 'border-l border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest'
          : ''}"
        style="font-size: calc(1.5rem * {fontSize})"
        ondblclick={() => {
          if (!editing) setEditing(true)
        }}
      >
        {#if draft.trim() === ''}
          <p class="opacity-50 text-base">
            {editing
              ? 'L’aperçu de la note s’affiche ici.'
              : 'Note vide : double-cliquer pour écrire.'}
          </p>
        {:else}
          <!-- HTML produit par renderTbiNote, qui n'en laisse passer aucun du texte -->
          {@html rendered}
        {/if}
      </div>
    {/if}
  </div>

  <div
    class="flex flex-row flex-wrap items-center justify-center gap-x-0.5 gap-y-1 px-2 py-1 shrink-0 text-sm border-t border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest transition-opacity duration-150 {editing ||
    showTools
      ? ''
      : 'opacity-0 pointer-events-none'}"
  >
    {#if editing}
      <button
        type="button"
        class={toolClass}
        title="Titre"
        aria-label="Titre"
        onclick={() => edit((t, s, e) => toggleLinePrefix(t, s, e, '# '))}
      >
        <i class="bx bx-heading text-xl"></i>
      </button>
      <button
        type="button"
        class={toolClass}
        title="Gras (Ctrl+B)"
        aria-label="Gras"
        onclick={() => edit((t, s, e) => toggleMarker(t, s, e, '**'))}
      >
        <i class="bx bx-bold text-xl"></i>
      </button>
      <button
        type="button"
        class={toolClass}
        title="Italique (Ctrl+I)"
        aria-label="Italique"
        onclick={() => edit((t, s, e) => toggleMarker(t, s, e, '*'))}
      >
        <i class="bx bx-italic text-xl"></i>
      </button>
      <button
        type="button"
        class={toolClass}
        title="Liste"
        aria-label="Liste"
        onclick={() => edit((t, s, e) => toggleLinePrefix(t, s, e, '- '))}
      >
        <i class="bx bx-list-ul text-xl"></i>
      </button>
      <button
        type="button"
        class={toolClass}
        title="Formule"
        aria-label="Formule"
        onclick={() => edit((t, s, e) => toggleMarker(t, s, e, '$'))}
      >
        <i class="bx bx-math text-xl"></i>
      </button>
      <span class={separatorClass}></span>
      {#each TBI_NOTE_COLORS as color (color.name)}
        <button
          type="button"
          class="flex items-center justify-center w-11 h-11 shrink-0"
          title="Couleur : {color.label.toLowerCase()}"
          aria-label="Couleur : {color.label.toLowerCase()}"
          onclick={() => edit((t, s, e) => applyNoteStyle(t, s, e, color.name))}
        >
          <span
            class="tbi-note-{color.name} tbi-note-swatch block w-5 h-5 rounded-full border border-black/20"
          ></span>
        </button>
      {/each}
      <span class={separatorClass}></span>
      {#each TBI_NOTE_SIZES as size, index (size.name)}
        <button
          type="button"
          class={toolClass}
          title="Taille du texte sélectionné : {size.label.toLowerCase()}"
          aria-label="Taille du texte sélectionné : {size.label.toLowerCase()}"
          onclick={() => edit((t, s, e) => applyNoteStyle(t, s, e, size.name))}
        >
          <span style="font-size: {0.7 + index * 0.25}rem">T</span>
        </button>
      {/each}
      <span class={separatorClass}></span>
    {/if}
    <button
      type="button"
      class={toolClass}
      title="Réduire toute la note"
      aria-label="Réduire toute la note"
      disabled={fontSize <= TBI_NOTE_MIN_FONT_SIZE}
      onclick={() => zoomBy(-TBI_NOTE_FONT_SIZE_STEP)}
    >
      <i class="bx bx-font-size text-sm"></i>
    </button>
    <span class="w-12 text-center tabular-nums" aria-live="polite">
      {Math.round(fontSize * 100)}&nbsp;%
    </span>
    <button
      type="button"
      class={toolClass}
      title="Agrandir toute la note"
      aria-label="Agrandir toute la note"
      disabled={fontSize >= TBI_NOTE_MAX_FONT_SIZE}
      onclick={() => zoomBy(TBI_NOTE_FONT_SIZE_STEP)}
    >
      <i class="bx bx-font-size text-xl"></i>
    </button>
    <span class={separatorClass}></span>
    <button
      type="button"
      class={toolClass}
      title={editing ? 'Afficher la note (Échap)' : 'Modifier la note'}
      aria-label={editing ? 'Afficher la note' : 'Modifier la note'}
      onclick={() => setEditing(!editing)}
    >
      <i class="bx {editing ? 'bx-show' : 'bx-edit'} text-xl"></i>
    </button>
  </div>
</div>

<style>
  /* Le reset de Tailwind retire la mise en forme des titres, listes, liens… */
  .tbi-note {
    line-height: 1.4;
    overflow-wrap: anywhere;
  }
  .tbi-note :global(> * + *) {
    margin-top: 0.6em;
  }
  .tbi-note :global(:is(h1, h2, h3, h4, h5, h6)) {
    font-family: inherit;
    text-align: left;
  }
  .tbi-note :global(h1) {
    font-size: 1.8em;
    font-weight: 700;
    line-height: 1.2;
  }
  .tbi-note :global(h2) {
    font-size: 1.45em;
    font-weight: 700;
    line-height: 1.2;
  }
  .tbi-note :global(h3) {
    font-size: 1.2em;
    font-weight: 700;
  }
  .tbi-note :global(h4),
  .tbi-note :global(h5),
  .tbi-note :global(h6) {
    font-weight: 700;
  }
  .tbi-note :global(strong) {
    font-weight: 700;
  }
  .tbi-note :global(em) {
    font-style: italic;
  }
  .tbi-note :global(ul) {
    list-style: disc;
    padding-left: 1.4em;
  }
  .tbi-note :global(ol) {
    list-style: decimal;
    padding-left: 1.4em;
  }
  .tbi-note :global(a) {
    text-decoration: underline;
  }
  .tbi-note :global(blockquote) {
    padding-left: 0.8em;
    border-left: 0.2em solid currentColor;
    opacity: 0.85;
  }
  .tbi-note :global(code) {
    font-family: ui-monospace, monospace;
    font-size: 0.9em;
    padding: 0 0.2em;
    border-radius: 0.2em;
    background: rgb(127 127 127 / 0.15);
  }
  .tbi-note :global(pre) {
    padding: 0.5em;
    overflow-x: auto;
    border-radius: 0.3em;
    background: rgb(127 127 127 / 0.15);
  }
  .tbi-note :global(pre code) {
    padding: 0;
    background: none;
  }
  .tbi-note :global(table) {
    border-collapse: collapse;
  }
  .tbi-note :global(th),
  .tbi-note :global(td) {
    padding: 0.15em 0.5em;
    border: 1px solid currentColor;
  }
  .tbi-note :global(hr) {
    border-color: currentColor;
    opacity: 0.4;
  }
  .tbi-note :global(img) {
    display: inline-block;
    max-width: 100%;
  }

  .tbi-note-host :global(.tbi-note-petit) {
    font-size: 0.75em;
  }
  .tbi-note-host :global(.tbi-note-grand) {
    font-size: 1.5em;
  }
  .tbi-note-host :global(.tbi-note-enorme) {
    font-size: 2.25em;
  }

  /* Teintes lisibles sur le fond de la note, qui change avec le thème */
  .tbi-note-host :global(.tbi-note-rouge) {
    color: #dc2626;
  }
  .tbi-note-host :global(.tbi-note-orange) {
    color: #ea580c;
  }
  .tbi-note-host :global(.tbi-note-vert) {
    color: #15803d;
  }
  .tbi-note-host :global(.tbi-note-bleu) {
    color: #1d4ed8;
  }
  .tbi-note-host :global(.tbi-note-violet) {
    color: #7e22ce;
  }
  .tbi-note-host :global(.tbi-note-gris) {
    color: #6b7280;
  }
  :global(.dark) .tbi-note-host :global(.tbi-note-rouge) {
    color: #f87171;
  }
  :global(.dark) .tbi-note-host :global(.tbi-note-orange) {
    color: #fb923c;
  }
  :global(.dark) .tbi-note-host :global(.tbi-note-vert) {
    color: #4ade80;
  }
  :global(.dark) .tbi-note-host :global(.tbi-note-bleu) {
    color: #60a5fa;
  }
  :global(.dark) .tbi-note-host :global(.tbi-note-violet) {
    color: #c084fc;
  }
  :global(.dark) .tbi-note-host :global(.tbi-note-gris) {
    color: #9ca3af;
  }
  .tbi-note-swatch {
    background: currentColor;
  }
</style>
