<script lang="ts">
  import type { DescriptionExercice, ParametreExercice } from '../../../moteur'
  import type { Step } from '../../../lib/parcours/parcoursTypes'

  /**
   * Réglages d'un exercice (nombre de questions, paramètres sup à sup4), comme
   * le formulaire du site et l'éditeur de l'application. La valeur par défaut
   * n'est pas stockée : l'exercice suit ses évolutions.
   */
  let {
    step,
    description,
    onchange,
  }: {
    step: Step
    description: DescriptionExercice | null
    onchange: (s: Step) => void
  } = $props()

  const label = 'text-sm text-coopmaths-struct dark:text-coopmathsdark-struct'
  const help =
    'text-xs text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light'
  const field =
    'rounded-md border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest bg-coopmaths-canvas dark:bg-coopmathsdark-canvas px-2 py-1 text-coopmaths-corpus dark:text-coopmathsdark-corpus focus:outline-none focus:border-coopmaths-action dark:focus:border-coopmathsdark-action'

  const value = (p: ParametreExercice) => String(step[p.cle] ?? p.defaut)
  function write(p: ParametreExercice, v: string) {
    const next = { ...step }
    if (v === p.defaut) delete next[p.cle]
    else next[p.cle] = v
    onchange(next)
  }
  const chosen = (p: ParametreExercice) => value(p).split('-').filter(Boolean)
  function toggle(p: ParametreExercice, v: string) {
    const now = chosen(p)
    const next = now.includes(v) ? now.filter((x) => x !== v) : [...now, v]
    if (next.length) write(p, next.join('-'))
  }
</script>

<div class="flex flex-col gap-3">
  {#if description?.nbQuestionsModifiable !== false}
    <label class="flex flex-row items-center justify-between gap-3 {label}">
      Nombre de questions
      <input
        type="number"
        min="1"
        max="50"
        class="w-20 {field}"
        value={step.nbQuestions ?? description?.nbQuestions ?? 3}
        onchange={(e) =>
          onchange({
            ...step,
            nbQuestions: Math.max(
              1,
              Math.min(
                50,
                Number((e.currentTarget as HTMLInputElement).value) || 1,
              ),
            ),
          })}
      />
    </label>
  {/if}
  {#each description?.parametres ?? [] as p (p.cle)}
    {#if p.type === 'case'}
      <label class="flex flex-row items-center justify-between gap-3 {label}">
        {p.titre}
        <input
          type="checkbox"
          checked={value(p) === 'true'}
          onchange={(e) =>
            write(p, String((e.currentTarget as HTMLInputElement).checked))}
        />
      </label>
    {:else if p.type === 'liste'}
      <label class="flex flex-col gap-1 {label}">
        {p.titre}
        <select
          class="w-full {field}"
          value={value(p)}
          onchange={(e) =>
            write(p, (e.currentTarget as HTMLSelectElement).value)}
        >
          {#each p.options ?? [] as o (o.valeur)}<option value={o.valeur}
              >{o.libelle}</option
            >{/each}
        </select>
      </label>
    {:else if p.type === 'nombre'}
      <label class="flex flex-col gap-1 {label}">
        <span class="flex flex-row items-center justify-between gap-3">
          {p.titre}
          <input
            type="number"
            min="1"
            max={p.max}
            class="w-20 {field}"
            value={value(p)}
            onchange={(e) =>
              write(p, (e.currentTarget as HTMLInputElement).value)}
          />
        </span>
        {#if p.aide}<span class={help}>{p.aide}</span>{/if}
      </label>
    {:else if p.options?.length}
      <fieldset class="flex flex-col gap-1">
        <legend class={label}>{p.titre}</legend>
        <div class="flex flex-row flex-wrap gap-2 pt-1">
          {#each p.options as o (o.valeur)}
            {@const on = chosen(p).includes(o.valeur)}
            <button
              type="button"
              role="checkbox"
              aria-checked={on}
              class="rounded-full px-3 py-1 text-sm border border-coopmaths-action dark:border-coopmathsdark-action
              {on
                ? 'bg-coopmaths-action dark:bg-coopmathsdark-action text-coopmaths-canvas dark:text-coopmathsdark-canvas'
                : 'text-coopmaths-action dark:text-coopmathsdark-action'}"
              onclick={() => toggle(p, o.valeur)}>{o.libelle}</button
            >
          {/each}
        </div>
      </fieldset>
    {:else}
      <label class="flex flex-col gap-1 {label}">
        {p.titre}
        <input
          class="w-full {field}"
          value={value(p)}
          onchange={(e) =>
            write(p, (e.currentTarget as HTMLInputElement).value)}
        />
        {#if p.aide}<span class={help}>{p.aide}</span>{/if}
      </label>
    {/if}
  {/each}
</div>
