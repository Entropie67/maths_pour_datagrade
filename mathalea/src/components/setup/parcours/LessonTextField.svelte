<script lang="ts">
  import { tick } from 'svelte'
  // Texte d'une fiche : zone de saisie avec une petite barre (gras, italique,
  // liste, formule) qui entoure la sélection, comme dans un traitement de texte.
  let {
    label,
    value,
    rows = 3,
    hint = false,
    onchange,
  }: {
    label: string
    value: string
    rows?: number
    hint?: boolean // rappel de la syntaxe sous le champ
    onchange: (value: string) => void
  } = $props()

  let area: HTMLTextAreaElement | undefined = $state()

  /** Entoure la sélection (ou insère un modèle) puis replace le curseur */
  function wrap(before: string, after: string, placeholder: string) {
    if (!area) return
    const { selectionStart: a, selectionEnd: b } = area
    const inner = value.slice(a, b) || placeholder
    const next = value.slice(0, a) + before + inner + after + value.slice(b)
    onchange(next)
    // Dès que le champ a sa nouvelle valeur, avant toute autre frappe
    tick().then(() => {
      area?.focus()
      area?.setSelectionRange(
        a + before.length,
        a + before.length + inner.length,
      )
    })
  }
  /** Liste : un tiret au début de chaque ligne sélectionnée */
  function list() {
    if (!area) return
    const a = value.lastIndexOf('\n', area.selectionStart - 1) + 1
    const b = area.selectionEnd
    const lines = value.slice(a, b) || 'élément'
    const next =
      value.slice(0, a) +
      lines
        .split('\n')
        .map((l) => (l.startsWith('- ') ? l : `- ${l}`))
        .join('\n') +
      value.slice(b)
    onchange(next)
    tick().then(() => area?.focus())
  }

  const tool =
    'inline-flex items-center justify-center min-w-8 h-8 px-1.5 rounded text-coopmaths-action dark:text-coopmathsdark-action hover:bg-coopmaths-canvas-dark dark:hover:bg-coopmathsdark-canvas-dark'
</script>

<div class="flex flex-col gap-1">
  <div class="flex flex-row flex-wrap items-end justify-between gap-2">
    <span
      class="text-sm font-light text-coopmaths-struct dark:text-coopmathsdark-struct"
      >{label}</span
    >
    <div
      class="flex flex-row"
      role="toolbar"
      aria-label="Mise en forme : {label}"
    >
      <button
        type="button"
        class={tool}
        title="Gras"
        aria-label="Gras"
        onclick={() => wrap('**', '**', 'texte')}
        ><i class="bx bx-bold text-lg" aria-hidden="true"></i></button
      >
      <button
        type="button"
        class={tool}
        title="Italique"
        aria-label="Italique"
        onclick={() => wrap('*', '*', 'texte')}
        ><i class="bx bx-italic text-lg" aria-hidden="true"></i></button
      >
      <button
        type="button"
        class={tool}
        title="Liste"
        aria-label="Liste"
        onclick={list}
        ><i class="bx bx-list-ul text-lg" aria-hidden="true"></i></button
      >
      <button
        type="button"
        class="{tool} text-sm font-semibold"
        title="Formule dans la ligne"
        onclick={() => wrap('$', '$', 'x^2')}>$x$</button
      >
      <button
        type="button"
        class="{tool} text-sm font-semibold"
        title="Formule centrée"
        onclick={() => wrap('\n$$', '$$\n', '\\int_a^b f(x)\\,\\mathrm{d}x')}
        >$$</button
      >
    </div>
  </div>
  <textarea
    bind:this={area}
    aria-label={label}
    {rows}
    {value}
    oninput={(e) => onchange(e.currentTarget.value)}
    class="w-full rounded-md border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest bg-coopmaths-canvas dark:bg-coopmathsdark-canvas px-3 py-2 font-mono text-sm text-coopmaths-corpus dark:text-coopmathsdark-corpus focus:outline-none focus:border-coopmaths-action dark:focus:border-coopmathsdark-action"
  ></textarea>
  {#if hint}
    <span
      class="text-xs text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light"
      >**gras**, *italique*, lignes « - » pour une liste, ligne vide entre deux
      paragraphes, $formule$ ou $$formule centrée$$ (LaTeX)</span
    >
  {/if}
</div>
