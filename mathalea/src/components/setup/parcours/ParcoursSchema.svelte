<script lang="ts">
  import { missing } from '../../../lib/parcours/parcoursEditing'
  import {
    beltColor,
    levelGroups,
    levelName,
    type Parcours,
  } from '../../../lib/parcours/parcoursTypes'

  /**
   * Plan du parcours à côté de l'éditeur : paliers (ou ceintures), nombre
   * d'exercices, condition d'accès, pauses et fiches. Un clic amène à la
   * partie de l'éditeur.
   */
  let {
    parcours,
    onfocus,
  }: { parcours: Parcours; onfocus: (anchor: string) => void } = $props()

  const groups = $derived(levelGroups(parcours))
  const withLevels = $derived((parcours.paliers?.length ?? 0) > 1)
  const todo = $derived(missing(parcours))
  const quiet =
    'text-xs text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light'
  const item =
    'w-full min-w-0 flex flex-col rounded-md px-2 py-1.5 text-left hover:bg-coopmaths-canvas-dark dark:hover:bg-coopmathsdark-canvas-dark'
</script>

<nav class="flex flex-col gap-1 min-w-0 text-sm" aria-label="Plan du parcours">
  <button type="button" class={item} onclick={() => onfocus('parcours-haut')}>
    <span
      class="font-bold truncate text-coopmaths-struct dark:text-coopmathsdark-struct"
      >{parcours.titre || 'Sans titre'}</span
    >
  </button>
  {#each groups as g, k (k)}
    {@const level = parcours.paliers?.[k]}
    {@const lesson = withLevels
      ? (level?.fiche ?? (k === 0 ? parcours.fiche : undefined))
      : parcours.fiche}
    <button type="button" class={item} onclick={() => onfocus(`palier-${k}`)}>
      <span
        class="flex flex-row items-center gap-2 font-semibold text-coopmaths-struct dark:text-coopmathsdark-struct"
      >
        {#if withLevels && parcours.style === 'ceintures'}
          <span
            class="shrink-0 inline-block w-4 h-2 rounded-sm ring-1 ring-coopmaths-canvas-darkest dark:ring-coopmathsdark-canvas-darkest"
            style="background-color: {beltColor(parcours, k)}"
            aria-hidden="true"
          ></span>
        {/if}
        <span class="truncate"
          >{withLevels
            ? level?.titre || levelName(parcours, k)
            : 'Exercices'}</span
        >
      </span>
      <span
        class="{quiet} {g.length
          ? ''
          : 'text-coopmaths-warn-dark dark:text-coopmathsdark-warn-dark'}"
      >
        {g.length} exercice{g.length > 1 ? 's' : ''}{withLevels &&
        k > 0 &&
        level?.acces === 'seuil'
          ? ` · ${level.seuil ?? 80} %`
          : ''}{level?.ouverture ? ' · date' : ''}{lesson ? ' · fiche' : ''}
      </span>
    </button>
    {#if withLevels && level?.pause}
      <button
        type="button"
        class="{item} pl-6 {quiet}"
        onclick={() => onfocus(`pause-${k}`)}
      >
        <span class="flex flex-row items-center gap-1"
          ><i class="bx bx-pause-circle" aria-hidden="true"></i> Pause</span
        >
      </button>
    {/if}
  {/each}
  {#if todo.length}
    <p class="mt-2 px-2 {quiet}">
      <i
        class="bx bx-error-circle text-coopmaths-warn-dark dark:text-coopmathsdark-warn-dark"
        aria-hidden="true"
      ></i>
      À compléter : {todo.join(', ')}.
    </p>
  {/if}
</nav>
