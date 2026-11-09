<script lang="ts">
  import type { ExerciceLayoutConfig } from '../../../lib/LatexTypes'

  /**
   * Réglages de mise en page d'un exercice.
   *
   * La vue Typst place ces contrôles sur l'aperçu ; ici la compilation est
   * distante, donc trop lente pour un aperçu interactif : on choisit
   * l'exercice dans une liste, et ses réglages s'affichent en dessous.
   */

  let {
    exercises,
    selected = $bindable(),
    config,
    onSet,
    supportsFraming = true,
  }: {
    /** Exercices de la fiche, dans leur ordre d'affichage */
    exercises: { titre: string; index: number }[]
    /** Index (0-based) de l'exercice réglé */
    selected: number
    /** Réglages de cet exercice ; les champs absents suivent l'exercice */
    config: ExerciceLayoutConfig
    /** Écrit (ou efface, si la valeur est `undefined`) un réglage */
    onSet: <K extends keyof ExerciceLayoutConfig>(
      key: K,
      value: ExerciceLayoutConfig[K] | undefined,
    ) => void
    /**
     * Les cadres de ProfMaquette imposent leur propre découpe et leur propre
     * regroupement : « insécable » et « fusionner » y sont sans effet.
     */
    supportsFraming?: boolean
  } = $props()

  /** Numérotations proposées pour les questions (`enumitem`) */
  const LABEL_OPTIONS: { value: string; label: string }[] = [
    { value: '', label: 'Par défaut (1. 2. 3.)' },
    { value: '\\arabic*)', label: '1) 2) 3)' },
    { value: '\\alph*)', label: 'a) b) c)' },
    { value: '\\alph*.', label: 'a. b. c.' },
    { value: '\\Alph*)', label: 'A) B) C)' },
    { value: '\\roman*)', label: 'i) ii) iii)' },
    { value: '\\Roman*)', label: 'I) II) III)' },
    { value: '$\\bullet$', label: 'Puces' },
    { value: '{}', label: 'Aucune' },
  ]

  /** Valeur d'un champ numérique, ou `undefined` s'il est laissé vide */
  function numberOrNothing(value: string): number | undefined {
    return value === '' ? undefined : Number(value)
  }

  /**
   * Valeur d'un champ numérique dont la case vide veut dire « auto », mais
   * dont le minimum réel n'est pas 0 (colonnes : 1 au moins). Le bouton de
   * décrément du champ doit pouvoir atteindre « auto » plutôt que de rester
   * bloqué sur `min` : le `min` HTML est donc mis à 0 (le champ décrémente
   * jusque-là), et toute valeur strictement inférieure au minimum réel
   * repasse à « auto » ici.
   */
  function numberOrAuto(value: string, min: number): number | undefined {
    if (value === '') return undefined
    const parsed = Number(value)
    return Number.isNaN(parsed) || parsed < min ? undefined : parsed
  }

  function title(exercise: { titre: string; index: number }): string {
    const name = exercise.titre.trim()
    return `${exercise.index + 1}. ${name === '' ? 'Exercice' : name}`
  }
</script>

<label class="flex flex-col gap-1 text-sm">
  Exercice réglé
  <select
    class="rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
    bind:value={selected}
  >
    {#each exercises as exercise}
      <option value={exercise.index}>{title(exercise)}</option>
    {/each}
  </select>
</label>

<div class="flex items-center justify-between gap-4 text-sm">
  <label for="tex-exo-cols">Colonnes de l'énoncé</label>
  <input
    id="tex-exo-cols"
    type="number"
    min="0"
    max="4"
    step="1"
    placeholder="auto"
    class="w-20 rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 pr-1 text-sm"
    value={config.cols ?? ''}
    onchange={(event) =>
      onSet('cols', numberOrAuto(event.currentTarget.value, 1))}
  />
</div>

<div class="flex items-center justify-between gap-4 text-sm">
  <label for="tex-exo-cols-corr">Colonnes de la correction</label>
  <input
    id="tex-exo-cols-corr"
    type="number"
    min="0"
    max="4"
    step="1"
    placeholder="auto"
    class="w-20 rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 pr-1 text-sm"
    value={config.cols_corr ?? ''}
    onchange={(event) =>
      onSet('cols_corr', numberOrAuto(event.currentTarget.value, 1))}
  />
</div>

<div class="flex items-center justify-between gap-4 text-sm">
  <label for="tex-exo-itemsep">Espace entre questions</label>
  <input
    id="tex-exo-itemsep"
    type="number"
    min="0"
    max="8"
    step="0.25"
    placeholder="auto"
    class="w-20 rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 pr-1 text-sm"
    value={config.itemsep ?? ''}
    onchange={(event) =>
      onSet('itemsep', numberOrNothing(event.currentTarget.value))}
  />
</div>

<label class="flex items-center justify-between gap-4 text-sm">
  Numérotation
  <select
    class="rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
    value={config.labels ?? ''}
    onchange={(event) =>
      onSet(
        'labels',
        event.currentTarget.value === '' ? undefined : event.currentTarget.value,
      )}
  >
    {#each LABEL_OPTIONS as option}
      <option value={option.value}>{option.label}</option>
    {/each}
  </select>
</label>

<div class="flex items-center justify-between gap-4 text-sm">
  <label for="tex-exo-stretch">Interligne</label>
  <input
    id="tex-exo-stretch"
    type="number"
    min="1"
    max="3"
    step="0.25"
    placeholder="1"
    class="w-16 rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
    value={config.baselinestretch ?? ''}
    onchange={(event) =>
      onSet('baselinestretch', numberOrNothing(event.currentTarget.value))}
  />
</div>

<div class="space-y-1.5">
  <label class="flex items-center justify-between gap-4 text-sm">
    Lignes pour écrire
    <select
      class="rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
      value={config.writingLines?.position ?? ''}
      onchange={(event) =>
        onSet(
          'writingLines',
          event.currentTarget.value === ''
            ? undefined
            : {
                position: event.currentTarget.value as 'fin' | 'question',
                count: config.writingLines?.count ?? 3,
              },
        )}
    >
      <option value="">Aucune</option>
      <option value="fin">À la fin de l'exercice</option>
      <option value="question">Après chaque question</option>
    </select>
  </label>
  {#if config.writingLines != null}
    {@const lines = config.writingLines}
    <div class="flex items-center justify-between gap-4 text-sm">
      <label for="tex-exo-lines-count">Nombre de lignes</label>
      <input
        id="tex-exo-lines-count"
        type="number"
        min="1"
        max="20"
        step="1"
        class="w-16 rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
        value={lines.count}
        onchange={(event) =>
          onSet('writingLines', {
            position: lines.position,
            count: Number(event.currentTarget.value),
          })}
      />
    </div>
  {/if}
</div>

<label class="flex items-center gap-2 text-sm cursor-pointer">
  <input
    type="checkbox"
    checked={config.pageBreakBefore === true}
    onchange={(event) =>
      onSet(
        'pageBreakBefore',
        event.currentTarget.checked ? true : undefined,
      )}
  />
  Saut de page avant
</label>

<label class="flex items-center gap-2 text-sm cursor-pointer">
  <input
    type="checkbox"
    checked={config.columnBreakBefore === true}
    onchange={(event) =>
      onSet(
        'columnBreakBefore',
        event.currentTarget.checked ? true : undefined,
      )}
  />
  Saut de colonne avant
</label>

{#if supportsFraming}
  <label class="flex items-center gap-2 text-sm cursor-pointer">
    <input
      type="checkbox"
      checked={config.unbreakable === true}
      onchange={(event) =>
        onSet('unbreakable', event.currentTarget.checked ? true : undefined)}
    />
    Ne pas couper entre deux pages
  </label>

  <label class="flex items-center gap-2 text-sm cursor-pointer">
    <input
      type="checkbox"
      disabled={selected === 0}
      checked={config.mergeWithPrevious === true}
      onchange={(event) =>
        onSet(
          'mergeWithPrevious',
          event.currentTarget.checked ? true : undefined,
        )}
    />
    Fusionner avec l'exercice précédent
  </label>
{:else}
  <p class="text-xs opacity-70">
    « Ne pas couper » et « fusionner » demandent un habillage Coopmaths ou
    Classique : les cadres de ProfMaquette imposent leur propre découpe.
  </p>
{/if}
