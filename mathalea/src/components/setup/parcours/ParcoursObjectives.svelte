<script lang="ts">
  import { downloadFile } from '../../../lib/files'
  import { timestampedName } from '../../../lib/parcours/parcoursFile'
  import {
    mergeObjectives,
    objectivesToCsv,
    readObjectives,
  } from '../../../lib/parcours/parcoursObjectives'
  import type {
    Objective,
    Parcours,
  } from '../../../lib/parcours/parcoursTypes'

  /**
   * Objectifs de l'enseignant : importés au fil de l'année (CSV, texte collé,
   * fichier d'un collègue), avec les exercices de la bibliothèque qui les
   * travaillent. Les objectifs du programme posés sur les exercices y entrent
   * d'eux-mêmes. Dans un salon, la liste est celle de l'équipe : on peut y
   * importer la sienne (`own`).
   */
  let {
    objectives,
    parcours,
    levels,
    own,
    onchange,
  }: {
    objectives: Objective[]
    parcours: Parcours[] // parcours dont on montre les exercices
    levels: string[]
    own?: Objective[] // objectifs de ce navigateur, à importer dans le salon
    onchange: (objectives: Objective[]) => void
  } = $props()

  const label =
    'block text-sm font-light text-coopmaths-struct dark:text-coopmathsdark-struct'
  const field =
    'w-full rounded-md border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest bg-coopmaths-canvas dark:bg-coopmathsdark-canvas px-3 py-2 text-coopmaths-corpus dark:text-coopmathsdark-corpus focus:outline-none focus:border-coopmaths-action dark:focus:border-coopmathsdark-action'
  const quiet =
    'text-sm text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light'
  const link =
    'inline-flex items-center gap-1 text-sm font-semibold text-coopmaths-action dark:text-coopmathsdark-action hover:text-coopmaths-action-lightest dark:hover:text-coopmathsdark-action-lightest disabled:opacity-40'

  let pasted = $state('')
  let level = $state('')
  let chapter = $state('')
  let message = $state('')
  let dragging = $state(false)
  let open: string | null = $state(null)
  let editing: { before: string; value: string } | null = $state(null)

  // Exercices de la bibliothèque qui travaillent chaque objectif
  const uses = $derived.by(() => {
    const m = new Map<string, { parcours: string; exercise: string }[]>()
    for (const p of parcours)
      for (const s of p.etapes)
        for (const o of s.objectifs ?? [])
          m.set(o, [
            ...(m.get(o) ?? []),
            {
              parcours: p.titre || 'Sans titre',
              exercise: s.id ?? s.titre,
            },
          ])
    return m
  })
  const grouped = $derived.by(() => {
    const rank = (n: string) =>
      levels.indexOf(n) === -1 ? levels.length : levels.indexOf(n)
    const lv = [...new Set(objectives.map((o) => o.niveau))].sort(
      (a, b) => rank(a) - rank(b),
    )
    return lv.map((niveau) => {
      const of = objectives.filter((o) => o.niveau === niveau)
      return {
        niveau,
        chapters: [...new Set(of.map((o) => o.theme))].map((theme) => ({
          theme,
          list: of.filter((o) => o.theme === theme),
        })),
      }
    })
  })

  // Objectifs de ce navigateur, d'un niveau ou de tous
  let ownLevel = $state('')
  const ownPicked = $derived(
    (own ?? []).filter((o) => !ownLevel || o.niveau === ownLevel),
  )
  const ownLevels = $derived(
    levels.filter((n) => (own ?? []).some((o) => o.niveau === n)),
  )
  function add(read: Objective[]) {
    const merged = mergeObjectives(objectives, read)
    const n = merged.length - objectives.length
    onchange(merged)
    message = `${n} objectif${n > 1 ? 's' : ''} ajouté${n > 1 ? 's' : ''}${read.length > n ? ` (${read.length - n} déjà présent${read.length - n > 1 ? 's' : ''})` : ''}.`
  }

  function importText(text: string) {
    try {
      add(readObjectives(text, level, chapter.trim()))
      pasted = ''
    } catch (e) {
      message = (e as Error).message
    }
  }

  async function importFile(file: File | undefined) {
    if (file) importText(await file.text())
  }

  function rename() {
    if (!editing) return
    const value = editing.value.trim()
    const before = editing.before
    if (
      value &&
      value !== before &&
      !objectives.some((o) => o.libelle === value)
    ) {
      onchange(
        objectives.map((o) =>
          o.libelle === before ? { ...o, libelle: value, code: undefined } : o,
        ),
      )
    }
    editing = null
  }
</script>

<div class="grid grid-cols-1 lg:grid-cols-[22rem_1fr] gap-6">
  <aside
    class="flex flex-col gap-3 rounded-xl p-4 h-fit transition-colors
    {dragging
      ? 'bg-coopmaths-action/10 dark:bg-coopmathsdark-action/10 ring-2 ring-coopmaths-action dark:ring-coopmathsdark-action'
      : 'bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark'}"
    ondragover={(e) => {
      e.preventDefault()
      dragging = true
    }}
    ondragleave={() => (dragging = false)}
    ondrop={(e) => {
      // Un fichier déposé ici est une liste d'objectifs, pas une bibliothèque
      e.preventDefault()
      e.stopPropagation()
      dragging = false
      importFile(e.dataTransfer?.files[0])
    }}
    aria-label="Importer des objectifs"
  >
    <h3 class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">
      Importer des objectifs
    </h3>
    <p class={quiet}>
      Un tableau CSV (colonnes code ; libellé ; niveau ; chapitre, en-tête
      facultatif), déposé ici ou choisi, ou une liste collée. Les objectifs déjà
      présents ne sont pas ajoutés deux fois : importez au fil de l’année.
    </p>
    <label
      class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 cursor-pointer border border-coopmaths-action dark:border-coopmathsdark-action text-coopmaths-action dark:text-coopmathsdark-action hover:bg-coopmaths-action hover:text-coopmaths-canvas dark:hover:bg-coopmathsdark-action dark:hover:text-coopmathsdark-canvas"
    >
      <i class="bx bx-file text-lg" aria-hidden="true"></i> Choisir un fichier
      (.csv, .txt, .json)
      <input
        type="file"
        accept=".csv,.txt,.json,text/csv,text/plain,application/json"
        class="hidden"
        onchange={(e) => {
          const input = e.currentTarget as HTMLInputElement
          importFile(input.files?.[0])
          input.value = ''
        }}
      />
    </label>
    <div class="grid grid-cols-2 gap-2">
      <label>
        <span class={label}>Niveau, s’il manque</span>
        <select class={field} bind:value={level}>
          <option value="">Aucun</option>
          {#each levels as n (n)}<option value={n}>{n}</option>{/each}
        </select>
      </label>
      <label>
        <span class={label}>Chapitre, s’il manque</span>
        <input class={field} bind:value={chapter} />
      </label>
    </div>
    <label>
      <span class={label}
        >Ou collez ici (une ligne par objectif, ou un tableau copié)</span
      >
      <textarea class={field} rows="5" bind:value={pasted}></textarea>
    </label>
    <button
      type="button"
      class="{link} self-start"
      disabled={!pasted.trim()}
      onclick={() => importText(pasted)}
    >
      <i class="bx bx-plus text-lg" aria-hidden="true"></i> Ajouter ces objectifs
    </button>
    {#if own?.length}
      <div
        class="flex flex-col gap-2 pt-3 border-t border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest"
      >
        <span class={label}>Mes objectifs (ce navigateur)</span>
        <div class="flex flex-row flex-wrap items-center gap-3">
          <select
            class="{field} w-auto"
            bind:value={ownLevel}
            aria-label="Niveau des objectifs à importer"
          >
            <option value="">Tous les niveaux</option>
            {#each ownLevels as n (n)}<option value={n}>{n}</option>{/each}
          </select>
          <button
            type="button"
            class={link}
            disabled={!ownPicked.length}
            onclick={() => add(ownPicked)}
          >
            <i class="bx bx-import text-lg" aria-hidden="true"></i> Importer ({ownPicked.length})
          </button>
        </div>
      </div>
    {/if}
    {#if message}<p class={quiet} role="status">{message}</p>{/if}
    {#if objectives.length}
      <button
        type="button"
        class="{link} self-start"
        onclick={() =>
          downloadFile(
            objectivesToCsv(objectives),
            timestampedName('objectifs-mathalea', 'csv'),
          )}
      >
        <i class="bx bx-export text-lg" aria-hidden="true"></i> Exporter la
        liste (CSV, {objectives.length})
      </button>
    {/if}
  </aside>

  <section class="flex flex-col gap-4">
    {#if !objectives.length}
      <p class={quiet}>
        Les exercices ajoutés à un parcours reçoivent l’objectif du programme
        sous lequel MathALÉA les range. Vos objectifs et ceux posés sur les
        exercices apparaissent ici, avec les exercices qui les travaillent.
      </p>
    {/if}
    {#each grouped as g (g.niveau)}
      <div>
        <h3
          class="text-lg font-bold text-coopmaths-struct dark:text-coopmathsdark-struct"
        >
          {g.niveau || 'Sans niveau'}
        </h3>
        {#each g.chapters as c (c.theme)}
          <h4
            class="mt-2 text-sm font-semibold text-coopmaths-struct-light dark:text-coopmathsdark-struct-light"
          >
            {c.theme || 'Sans chapitre'}
          </h4>
          <ul
            class="mt-1 flex flex-col divide-y divide-coopmaths-canvas-dark dark:divide-coopmathsdark-canvas-dark"
          >
            {#each c.list as o (o.libelle)}
              {@const u = uses.get(o.libelle) ?? []}
              <li class="py-2">
                {#if editing?.before === o.libelle}
                  <form
                    class="flex flex-row gap-2"
                    onsubmit={(e) => (e.preventDefault(), rename())}
                  >
                    <input
                      class={field}
                      bind:value={editing.value}
                      aria-label="Nouveau libellé"
                    />
                    <button type="submit" class={link}>Renommer</button>
                    <button
                      type="button"
                      class={link}
                      onclick={() => (editing = null)}>Annuler</button
                    >
                  </form>
                {:else}
                  <div class="flex flex-row items-center gap-3">
                    <button
                      type="button"
                      class="min-w-0 flex-1 text-left"
                      aria-expanded={open === o.libelle}
                      onclick={() =>
                        (open = open === o.libelle ? null : o.libelle)}
                    >
                      <span
                        class="text-coopmaths-corpus dark:text-coopmathsdark-corpus"
                        >{o.libelle}</span
                      >
                      <span class="block {quiet}"
                        >{[
                          o.code,
                          u.length
                            ? `${u.length} exercice${u.length > 1 ? 's' : ''}`
                            : 'Aucun exercice',
                        ]
                          .filter(Boolean)
                          .join(' · ')}</span
                      >
                    </button>
                    <button
                      type="button"
                      class={link}
                      onclick={() =>
                        (editing = { before: o.libelle, value: o.libelle })}
                      >Renommer</button
                    >
                    <button
                      type="button"
                      class={link}
                      onclick={() =>
                        onchange(
                          objectives.filter(
                            (x) => x.libelle !== o.libelle,
                          ),
                        )}>Retirer</button
                    >
                  </div>
                  {#if open === o.libelle && u.length}
                    <ul class="mt-1 pl-4 {quiet}">
                      {#each u as x, i (i)}<li>
                          <span class="font-semibold">{x.exercise}</span> · {x.parcours}
                        </li>{/each}
                    </ul>
                  {/if}
                {/if}
              </li>
            {/each}
          </ul>
        {/each}
      </div>
    {/each}
  </section>
</div>
