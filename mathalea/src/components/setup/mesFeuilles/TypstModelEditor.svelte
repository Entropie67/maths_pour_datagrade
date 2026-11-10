<script lang="ts">
  import {
    defaultTypstDocumentOptions,
    HEADER_STYLES,
    MATH_FONTS,
    TEXT_FONTS,
    type TypstDocumentOptions,
  } from '../typst/buildTypstDocument'
  import type {
    TypstModel,
    TypstModelOptions,
  } from '../../../lib/mesFeuilles/preferences'
  import {
    primaryButton,
    quietText,
    secondaryButton,
    textInput,
  } from './styles'

  /**
   * Modification d'un modèle de document : les réglages les plus courants (le
   * nom, les polices, la mise en page, l'en-tête, le pied de page). Les autres
   * réglages du modèle sont gardés tels quels ; pour les changer tous, ouvrir
   * la vue Impression, appliquer le modèle puis « Mettre à jour le modèle ».
   */
  interface Props {
    model: TypstModel
    onsave: (name: string, changes: TypstModelOptions) => void
    oncancel: () => void
  }

  let { model, onsave, oncancel }: Props = $props()

  const HEADER_STYLE_LABELS: Record<(typeof HEADER_STYLES)[number], string> = {
    epure: 'Épuré',
    cartouche: 'Cartouche',
    cadre: 'Cadre',
    aucun: 'Aucun',
  }

  /**
   * Valeur du modèle, ou valeur d'origine de MathALÉA s'il n'en règle pas. Le
   * formulaire est recréé à chaque ouverture : le modèle n'est lu qu'au début.
   */
  function initial<K extends keyof TypstDocumentOptions>(
    key: K,
  ): TypstDocumentOptions[K] {
    // svelte-ignore state_referenced_locally
    const value = (model.options as Partial<TypstDocumentOptions>)[key]
    return value === undefined ? defaultTypstDocumentOptions[key] : value
  }

  const start = {
    // svelte-ignore state_referenced_locally
    name: model.name,
    font: initial('font'),
    mathFont: initial('mathFont'),
    fontSize: initial('fontSize'),
    lineSpacing: initial('lineSpacing'),
    pageFormat: initial('pageFormat'),
    orientation: initial('orientation'),
    columns: initial('columns'),
    headerStyle: initial('headerStyle'),
    headerLine: initial('headerLine'),
    showFooter: initial('showFooter'),
    footerText: initial('footerText'),
    showCorrections: initial('showCorrections'),
    boldQuestionNumbers: initial('boldQuestionNumbers'),
  }

  let name = $state(start.name)
  let font = $state(start.font)
  let mathFont = $state(start.mathFont)
  let fontSize: number | null = $state(start.fontSize)
  let lineSpacing: number | null = $state(start.lineSpacing)
  let pageFormat = $state(start.pageFormat)
  let orientation = $state(start.orientation)
  let columns = $state(start.columns)
  let headerStyle = $state(start.headerStyle)
  let headerLine = $state(start.headerLine)
  let showFooter = $state(start.showFooter)
  let footerText = $state(start.footerText)
  let showCorrections = $state(start.showCorrections)
  let boldQuestionNumbers = $state(start.boldQuestionNumbers)

  /** Valeur numérique saisie, ramenée dans des bornes raisonnables */
  function bounded(
    value: number | null,
    fallback: number,
    min: number,
    max: number,
  ) {
    return value === null || !Number.isFinite(value)
      ? fallback
      : Math.min(max, Math.max(min, value))
  }

  function submit(event: SubmitEvent) {
    event.preventDefault()
    const current = {
      font,
      mathFont,
      fontSize: bounded(fontSize, start.fontSize, 6, 30),
      lineSpacing: bounded(lineSpacing, start.lineSpacing, 0.3, 3),
      pageFormat,
      orientation,
      columns,
      headerStyle,
      headerLine,
      showFooter,
      footerText,
      showCorrections,
      boldQuestionNumbers,
    }
    // seuls les réglages modifiés sont écrits : un réglage que le modèle ne
    // fixait pas continue de laisser le document tel qu'il est
    const changes: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(current)) {
      if (value !== (start as Record<string, unknown>)[key]) {
        changes[key] = value
      }
    }
    onsave(name, changes as TypstModelOptions)
  }

  const field = 'flex flex-col gap-1 text-sm'
  const checkbox =
    'flex flex-row items-center gap-2 text-sm cursor-pointer select-none'
</script>

<form class="flex flex-col gap-5" onsubmit={submit}>
  <label class={field}>
    <span class="font-semibold">Nom du modèle</span>
    <!-- svelte-ignore a11y_autofocus -->
    <input
      type="text"
      class={textInput}
      maxlength="200"
      required
      autofocus
      bind:value={name}
    />
  </label>

  <fieldset class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
    <legend
      class="mb-2 font-semibold text-coopmaths-struct dark:text-coopmathsdark-struct"
    >
      Texte
    </legend>
    <label class={field}>
      Police du texte
      <select class={textInput} bind:value={font}>
        {#each TEXT_FONTS as option (option)}
          <option value={option}>{option}</option>
        {/each}
      </select>
    </label>
    <label class={field}>
      Police des maths
      <select class={textInput} bind:value={mathFont}>
        {#each MATH_FONTS as option (option)}
          <option value={option}>{option}</option>
        {/each}
      </select>
    </label>
    <label class={field}>
      Taille du texte (points)
      <input
        type="number"
        class={textInput}
        min="6"
        max="30"
        step="0.5"
        bind:value={fontSize}
      />
    </label>
    <label class={field}>
      Interligne (em)
      <input
        type="number"
        class={textInput}
        min="0.3"
        max="3"
        step="0.05"
        bind:value={lineSpacing}
      />
    </label>
    <label class={checkbox}>
      <input
        type="checkbox"
        class="size-4 rounded accent-coopmaths-action"
        bind:checked={boldQuestionNumbers}
      />
      Numéros des questions en gras
    </label>
  </fieldset>

  <fieldset class="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-3">
    <legend
      class="mb-2 font-semibold text-coopmaths-struct dark:text-coopmathsdark-struct"
    >
      Page
    </legend>
    <label class={field}>
      Format
      <select class={textInput} bind:value={pageFormat}>
        <option value="a4">A4</option>
        <option value="a5">A5</option>
      </select>
    </label>
    <label class={field}>
      Orientation
      <select class={textInput} bind:value={orientation}>
        <option value="portrait">Portrait</option>
        <option value="landscape">Paysage</option>
      </select>
    </label>
    <label class={field}>
      Colonnes
      <select class={textInput} bind:value={columns}>
        <option value={1}>1</option>
        <option value={2}>2</option>
        <option value={3}>3</option>
      </select>
    </label>
  </fieldset>

  <fieldset class="flex flex-col gap-3">
    <legend
      class="mb-2 font-semibold text-coopmaths-struct dark:text-coopmathsdark-struct"
    >
      En-tête, pied de page et correction
    </legend>
    <label class={field}>
      Style de l’en-tête
      <select class={textInput} bind:value={headerStyle}>
        {#each HEADER_STYLES as option (option)}
          <option value={option}>{HEADER_STYLE_LABELS[option]}</option>
        {/each}
      </select>
    </label>
    {#if headerStyle !== 'aucun'}
      <label class={field}>
        Ligne d’en-tête
        <input type="text" class={textInput} bind:value={headerLine} />
      </label>
    {/if}
    <label class={checkbox}>
      <input
        type="checkbox"
        class="size-4 rounded accent-coopmaths-action"
        bind:checked={showFooter}
      />
      Pied de page
    </label>
    {#if showFooter}
      <label class={field}>
        Texte du pied de page
        <input type="text" class={textInput} bind:value={footerText} />
      </label>
    {/if}
    <label class={checkbox}>
      <input
        type="checkbox"
        class="size-4 rounded accent-coopmaths-action"
        bind:checked={showCorrections}
      />
      Afficher la correction
    </label>
  </fieldset>

  <p class={quietText}>
    Les autres réglages du modèle (page de garde, badges, lignes de réponse…) ne
    changent pas. Le titre de la fiche n’en fait pas partie.
  </p>

  <div class="flex flex-row justify-end gap-3">
    <button type="button" class={secondaryButton} onclick={oncancel}>
      Annuler
    </button>
    <button type="submit" class={primaryButton} disabled={name.trim() === ''}>
      <i class="bx bx-check" aria-hidden="true"></i> Enregistrer
    </button>
  </div>
</form>
