<script lang="ts">
  import {
    addLevel,
    addSteps,
    canNudge,
    missing,
    moveStep,
    nudgeStep,
    removeLevel,
    removeStep,
    splitIntoLevels,
    studentPreviewUrl,
    withoutLevels,
  } from '../../../lib/parcours/parcoursEditing'
  import {
    dayOfOpening,
    isDay,
    openingOfDay,
  } from '../../../lib/parcours/parcoursOpening'
  import { decrireExercice, type DescriptionExercice } from '../../../moteur'
  import {
    menuPathFor,
    officialChapters,
    type OfficialChapter,
    type ReferentialExercise,
  } from '../../../lib/parcours/parcoursReferential'
  import { onMount, tick, untrack } from 'svelte'
  import type { InterfaceParams } from '../../../lib/types'
  import TypstAddExerciseModal from '../typst/addExercise/TypstAddExerciseModal.svelte'
  import { downloadFile } from '../../../lib/files'
  import {
    createLessonFile,
    emptyLesson,
    lessonFileName,
    lessonProblems,
    readLessonFile,
  } from '../../../lib/parcours/lessonFile'
  import ExercisePreview from './ExercisePreview.svelte'
  import LessonEditor from './LessonEditor.svelte'
  import ExerciseSettings from './ExerciseSettings.svelte'
  import {
    DEFAULT_THRESHOLD,
    DIFFICULTIES,
    PRESENTATION_LABELS,
    beltColor,
    levelGroups,
    levelName,
    BELTS,
    ICONS,
    referentialLevel,
    suggestedIcon,
    validationLabels,
    type Lesson,
    type LevelStyle,
    type Objective,
    type Parcours,
    type Presentation,
    type Step,
    type Validation,
  } from '../../../lib/parcours/parcoursTypes'
  import type { EditorCollab } from '../../../lib/parcours/salon/salonPresence'
  import { latexTitle } from '../../../lib/parcours/latexTitle'
  import SalonMark from './salon/SalonMark.svelte'

  /**
   * Éditeur d'un parcours de l'application MathALÉA : chaque modification est
   * enregistrée aussitôt (onchange). Les exercices viennent du référentiel
   * (recherche) ou de la feuille composée sur le site ; ils se glissent d'un
   * palier à l'autre.
   */
  let {
    parcours,
    levels,
    chapters,
    objectives,
    tags,
    index,
    sheetCount,
    fromSite,
    onchange,
    onaddsheet,
    onduplicate,
    ondelete,
    onpreview,
    onobjectives,
    collab,
  }: {
    parcours: Parcours
    levels: string[]
    chapters: { ofLevel: string[]; others: string[] }
    objectives: Objective[]
    tags: Map<string, string[]> // objectifs déjà posés sur un exercice (mêmes réglages)
    index: Map<string, ReferentialExercise> | null
    sheetCount: number // exercices interactifs de la feuille en cours sur le site
    fromSite: (params: InterfaceParams) => Step | null // null : exercice non interactif
    onchange: (p: Parcours) => void
    onaddsheet: (level: number) => void
    onduplicate: () => void
    ondelete: () => void
    onpreview?: () => void // ouvre l'aperçu élève à côté de l'éditeur
    onobjectives?: () => void // onglet Objectifs, pour importer ceux du niveau
    collab?: EditorCollab // parcours d'un salon : verrous et commentaires
  } = $props()

  // Repères des éléments d'un parcours de salon (présence, verrous, commentaires)
  const mark = (el: string) => (collab ? el : undefined)

  const label =
    'block text-sm font-light text-coopmaths-struct dark:text-coopmathsdark-struct'
  const field =
    'w-full rounded-md border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest bg-coopmaths-canvas dark:bg-coopmathsdark-canvas px-3 py-2 text-coopmaths-corpus dark:text-coopmathsdark-corpus focus:outline-none focus:border-coopmaths-action dark:focus:border-coopmathsdark-action'
  const quiet =
    'text-sm text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light'
  const link =
    'inline-flex items-center gap-1 text-sm font-semibold text-coopmaths-action dark:text-coopmathsdark-action hover:text-coopmaths-action-lightest dark:hover:text-coopmathsdark-action-lightest'
  const chip = (on: boolean) =>
    `inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm border transition-colors ${
      on
        ? 'bg-coopmaths-action dark:bg-coopmathsdark-action border-coopmaths-action dark:border-coopmathsdark-action text-coopmaths-canvas dark:text-coopmathsdark-canvas'
        : 'border-coopmaths-action dark:border-coopmathsdark-action text-coopmaths-action dark:text-coopmathsdark-action hover:bg-coopmaths-canvas-dark dark:hover:bg-coopmathsdark-canvas-dark'
    }`
  const iconButton =
    'inline-flex items-center justify-center w-8 h-8 rounded-full text-coopmaths-action dark:text-coopmathsdark-action hover:bg-coopmaths-canvas-dark dark:hover:bg-coopmathsdark-canvas-dark disabled:opacity-30 disabled:hover:bg-transparent'

  const update = (change: (p: Parcours) => void) => {
    const next = structuredClone($state.snapshot(parcours)) as Parcours
    change(next)
    onchange(next)
  }
  const set = (next: Parcours) => onchange(next)

  // Auteurs : saisie libre (la virgule finale reste tapable), la liste suit
  let authorsInput = $state(untrack(() => (parcours.auteurs ?? []).join(', ')))
  let authorsFor = untrack(() => parcours.id)
  $effect(() => {
    if (parcours.id === authorsFor) return
    authorsFor = parcours.id
    authorsInput = (parcours.auteurs ?? []).join(', ')
  })
  const setAuthors = (p: Parcours) => {
    const list = [
      ...new Set(
        authorsInput
          .split(/[,;]/)
          .map((a) => a.trim())
          .filter(Boolean),
      ),
    ]
    if (list.length) p.auteurs = list
    else delete p.auteurs
  }

  // Fiches de cours : une par palier (sans paliers, celle du parcours)
  let lessonOpen: number | null = $state(null)
  let lessonNotice: { level: number; text: string } | null = $state(null)
  const lessonOf = (p: Parcours, k: number) =>
    (p.paliers?.length ?? 0) > 1
      ? (p.paliers![k]?.fiche ?? (k === 0 ? p.fiche : undefined))
      : p.fiche
  /** Pose (ou retire) la fiche du palier k ; celle du parcours sans paliers */
  function setLesson(k: number, lesson: Lesson | undefined) {
    update((p) => {
      const levels = (p.paliers?.length ?? 0) > 1
      if (levels && !(k === 0 && p.fiche && !p.paliers![0].fiche)) {
        if (lesson) p.paliers![k].fiche = lesson
        else delete p.paliers![k].fiche
      } else if (lesson) p.fiche = lesson
      else delete p.fiche
    })
  }
  async function importLesson(k: number, file: File | undefined) {
    if (!file) return
    try {
      const lesson = readLessonFile(await file.text())
      setLesson(k, lesson)
      lessonNotice = { level: k, text: `Fiche « ${lesson.titre} » ajoutée.` }
    } catch (e) {
      lessonNotice = { level: k, text: (e as Error).message }
    }
  }
  async function exportLesson(k: number) {
    const lesson = lessonOf(parcours, k)
    if (!lesson) return
    const ok =
      (await downloadFile(createLessonFile(lesson), lessonFileName(lesson))) ===
      'success'
    lessonNotice = {
      level: k,
      text: ok
        ? `${lessonFileName(lesson)} enregistré.`
        : 'Le fichier n’a pas pu être enregistré.',
    }
  }

  // Chapitre hors des listes : saisi à la main
  const OTHER_CHAPTER = '\u0000autre'
  let customChapter = $state(false)
  let iconsOpen = $state(false)

  /** Chapitre : l'icône suit tant que l'enseignant n'en a pas choisi une autre */
  function setTheme(theme: string) {
    update((p) => {
      const auto =
        p.icone === 'bx-book-content' || p.icone === suggestedIcon(p.theme)
      p.theme = theme
      if (auto) p.icone = suggestedIcon(theme)
    })
  }

  const groups = $derived(levelGroups(parcours))
  const withLevels = $derived((parcours.paliers?.length ?? 0) > 1)
  const todo = $derived(missing(parcours))
  const questions = $derived(
    parcours.etapes.reduce((a, s) => a + (s.nbQuestions ?? 0), 0),
  )

  // ---------- Exercices : navigateur (niveau, chapitre, réglages, aperçu) ----------
  let pickerLevel: number | null = $state(null)
  let refused = $state('')

  // Chapitres du site pour le niveau : proposés en pastilles, et chemin d'arrivée de la fenêtre d'ajout
  let official: Record<string, OfficialChapter[]> = $state({})
  onMount(async () => {
    official = await officialChapters()
  })
  const levelChapters = $derived(
    official[referentialLevel(parcours.niveau)] ?? [],
  )
  // Chapitre du référentiel où s'ouvre la fenêtre d'ajout : même nom, sinon
  // un nom proche (accents, majuscules, nom partiel)
  const plain = (t: string) =>
    t
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim()
  const chapterCode = $derived.by(() => {
    const theme = plain(parcours.theme)
    if (!theme) return undefined
    return (
      levelChapters.find((c) => plain(c.name) === theme) ??
      levelChapters.find(
        (c) => plain(c.name).includes(theme) || theme.includes(plain(c.name)),
      )
    )?.code
  })
  const ownChapters = $derived(
    [...chapters.ofLevel, ...chapters.others].filter(
      (c) => !levelChapters.some((o) => o.name === c),
    ),
  )
  // Exercices déjà dans le parcours, comptés sur les aperçus de la fenêtre d'ajout
  const selection = $derived(
    parcours.etapes.map((e) => ({ uuid: e.uuid, id: e.id }) as InterfaceParams),
  )

  /** Exercice choisi dans la fenêtre d'ajout du site : seuls les interactifs vont dans l'application */
  function addFromSite(params: InterfaceParams) {
    const step = fromSite(params)
    if (!step) {
      refused = `${params.id ?? params.uuid} n’est pas interactif : l’application ne propose que des exercices interactifs.`
      return
    }
    refused = ''
    set(addSteps(parcours, [step], pickerLevel ?? 0))
  }

  // Réglages d'un exercice du parcours : description lue par le moteur à l'ouverture
  const descriptions: Record<string, DescriptionExercice | null> = $state({})
  async function describe(uuid: string) {
    if (uuid in descriptions) return
    try {
      descriptions[uuid] = await decrireExercice(uuid)
    } catch {
      descriptions[uuid] = null
    }
  }

  // ---------- Glisser-déposer ----------
  let dragged: number | null = $state(null)
  let target: { level: number; position: number } | null = $state(null)

  function overRow(event: DragEvent, i: number) {
    if (dragged === null) return
    event.preventDefault()
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    const level = groups.findIndex((g) => g.includes(i))
    const position =
      groups[level].indexOf(i) +
      (event.clientY > rect.top + rect.height / 2 ? 1 : 0)
    target = { level, position }
  }

  function overLevel(event: DragEvent, k: number) {
    if (dragged === null) return
    event.preventDefault()
    if (!groups[k].length) target = { level: k, position: 0 }
  }

  function drop(event: DragEvent) {
    event.preventDefault()
    if (dragged !== null && target) {
      const from = groups.findIndex((g) => g.includes(dragged!))
      const fromPosition = groups[from].indexOf(dragged)
      // Même palier, plus bas : la place libérée décale la cible d'un rang
      const position =
        target.level === from && target.position > fromPosition
          ? target.position - 1
          : target.position
      set(moveStep(parcours, dragged, target.level, position))
    }
    dragged = null
    target = null
  }

  const before = (i: number) => {
    if (!target || dragged === null) return false
    const level = groups.findIndex((g) => g.includes(i))
    return target.level === level && groups[level][target.position] === i
  }
  const afterLast = (k: number) =>
    !!target &&
    dragged !== null &&
    target.level === k &&
    target.position === groups[k].length &&
    groups[k].length > 0

  // ---------- Objectifs d'un exercice ----------
  // Seulement ceux de la liste de l'enseignant pour le niveau (onglet Objectifs)
  const levelObjectives = $derived(
    objectives.filter((o) => o.niveau === parcours.niveau),
  )
  /** Objectifs par chapitre, celui du parcours d'abord */
  function objectiveGroups(list: Objective[]) {
    const themes = [...new Set(list.map((o) => o.theme))].sort(
      (a, b) =>
        Number(b === parcours.theme.trim()) -
        Number(a === parcours.theme.trim()),
    )
    return themes.map((theme) => ({
      theme,
      list: list.filter((o) => o.theme === theme),
    }))
  }

  function addObjective(i: number, value: string) {
    update((p) => {
      const s = p.etapes[i]
      if (!(s.objectifs ?? []).includes(value))
        s.objectifs = [...(s.objectifs ?? []), value]
    })
  }

  function removeObjective(i: number, o: string) {
    update((p) => {
      p.etapes[i].objectifs = (p.etapes[i].objectifs ?? []).filter(
        (x) => x !== o,
      )
    })
  }

  /** Organisation : liste simple, paliers numérotés ou ceintures */
  function organise(choice: 'liste' | 'paliers') {
    if (choice === 'liste') return set(withoutLevels(parcours))
    if (withLevels) return
    set(
      parcours.etapes.length > 1
        ? splitIntoLevels(parcours)
        : addLevel(parcours),
    )
  }
  const organisation = $derived(withLevels ? 'paliers' : 'liste')

  /** Présentation des paliers aux élèves, choisie en fin de création */
  function setStyle(style: LevelStyle) {
    update((p) => {
      if (style === 'ceintures') p.style = 'ceintures'
      else {
        delete p.style
        delete p.premiereCeinture
      }
    })
  }

  let openStep: number | null = $state(null)
  /** Élément amené au milieu de l'écran (ouvert depuis un commentaire) */
  const scrollToElement = (el: string) =>
    void tick().then(() =>
      document
        .querySelector(`[data-element="${CSS.escape(el)}"]`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
    )
  /** Élément d'un commentaire : un exercice s'ouvre avec ses réglages et son aperçu */
  export function reveal(el: string) {
    const i = parcours.etapes.findIndex((s) => `etape:${s.cle}` === el)
    if (i !== -1) {
      openStep = i
      void describe(parcours.etapes[i].uuid)
    }
    scrollToElement(el)
  }
  const preview = (steps: Step[]) =>
    window.open(
      studentPreviewUrl(window.location.href, steps),
      '_blank',
      'noopener',
    )
</script>

{#snippet collabMark(el: string)}
  {#if collab}<SalonMark {collab} element={el} />{/if}
{/snippet}

{#snippet stepRow(i: number)}
  {@const s = parcours.etapes[i]}
  {@const known = index?.get(s.uuid)}
  <li
    data-element={mark(`etape:${s.cle}`)}
    class="group group/collab relative rounded-lg bg-coopmaths-canvas dark:bg-coopmathsdark-canvas border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest
    {before(i)
      ? 'shadow-[0_-3px_0_0] shadow-coopmaths-action dark:shadow-coopmathsdark-action'
      : ''}
    {dragged === i ? 'opacity-40' : ''}"
    draggable="true"
    ondragstart={(e) => {
      dragged = i
      e.dataTransfer?.setData('text/plain', String(i))
    }}
    ondragend={() => {
      dragged = null
      target = null
    }}
    ondragover={(e) => overRow(e, i)}
    ondrop={drop}
  >
    {@render collabMark(`etape:${s.cle}`)}
    <div class="flex flex-row items-center gap-2 px-2 py-2">
      <i
        class="bx bx-grid-vertical text-xl cursor-grab text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest"
        aria-hidden="true"
      ></i>
      <div class="flex flex-col">
        <button
          type="button"
          class={iconButton}
          aria-label="Monter l’exercice {s.id}"
          disabled={!canNudge(parcours, i, -1)}
          onclick={() => set(nudgeStep(parcours, i, -1))}
        >
          <i class="bx bx-chevron-up text-xl" aria-hidden="true"></i>
        </button>
        <button
          type="button"
          class={iconButton}
          aria-label="Descendre l’exercice {s.id}"
          disabled={!canNudge(parcours, i, 1)}
          onclick={() => set(nudgeStep(parcours, i, 1))}
        >
          <i class="bx bx-chevron-down text-xl" aria-hidden="true"></i>
        </button>
      </div>
      <button
        type="button"
        class="min-w-0 flex-1 text-left"
        aria-expanded={openStep === i}
        onclick={() => {
          openStep = openStep === i ? null : i
          if (openStep === i) void describe(s.uuid)
        }}
      >
        <span
          class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct"
          >{s.id ?? s.uuid}</span
        >
        <span
          class="ml-2 text-coopmaths-corpus dark:text-coopmathsdark-corpus"
          use:latexTitle={s.titreMasque ? `Exercice ${i + 1}` : s.titre}
        ></span>
        <span class="block {quiet} truncate">
          {s.nbQuestions ?? '?'} question{(s.nbQuestions ?? 0) > 1 ? 's' : ''}{s
            .objectifs?.length
            ? ` · ${s.objectifs.join(' ; ')}`
            : ''}
        </span>
      </button>
      <label class="flex items-center gap-1 {quiet}">
        <input
          type="number"
          min="1"
          max="50"
          class="w-16 rounded-md border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest bg-coopmaths-canvas dark:bg-coopmathsdark-canvas px-2 py-1 text-coopmaths-corpus dark:text-coopmathsdark-corpus"
          value={s.nbQuestions ?? 3}
          aria-label="Nombre de questions de l’exercice {s.id}"
          onchange={(e) => {
            const n = Math.max(
              1,
              Math.min(
                50,
                Number((e.currentTarget as HTMLInputElement).value) || 1,
              ),
            )
            update((p) => (p.etapes[i].nbQuestions = n))
          }}
        />
        <span class="hidden md:inline">questions</span>
      </label>
      <button
        type="button"
        class={iconButton}
        title="Essayer comme un élève"
        aria-label="Essayer l’exercice {s.id} comme un élève"
        onclick={() => preview([s])}
      >
        <i class="bx bx-show text-xl" aria-hidden="true"></i>
      </button>
      <button
        type="button"
        class={iconButton}
        aria-label="Retirer l’exercice {s.id}"
        onclick={() => set(removeStep(parcours, i))}
      >
        <i class="bx bx-x text-2xl" aria-hidden="true"></i>
      </button>
    </div>
    {#if openStep === i}
      <div
        class="flex flex-col gap-3 px-4 pb-4 pt-1 border-t border-coopmaths-canvas-dark dark:border-coopmathsdark-canvas-dark"
      >
        <div class="flex flex-row items-end gap-2">
          <label class="flex-1">
            <span class={label}>Titre vu par les élèves</span>
            <input
              class={field}
              value={s.titre}
              disabled={s.titreMasque}
              onchange={(e) =>
                update(
                  (p) =>
                    (p.etapes[i].titre = (
                      e.currentTarget as HTMLInputElement
                    ).value),
                )}
            />
          </label>
          <label class="flex items-center gap-2 pb-2 {quiet}">
            <input
              type="checkbox"
              checked={s.titreMasque === true}
              onchange={(e) =>
                update(
                  (p) =>
                    (p.etapes[i].titreMasque =
                      (e.currentTarget as HTMLInputElement).checked ||
                      undefined),
                )}
            />
            Masquer (« Exercice {i + 1} »)
          </label>
        </div>
        <div>
          <span class={label}>Objectifs</span>
          <div class="flex flex-row flex-wrap items-center gap-2 mt-1">
            {#each s.objectifs ?? [] as o (o)}
              <span
                class="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark text-coopmaths-corpus dark:text-coopmathsdark-corpus"
              >
                {o}
                <button
                  type="button"
                  class="text-coopmaths-action dark:text-coopmathsdark-action"
                  aria-label="Retirer l’objectif {o}"
                  onclick={() => removeObjective(i, o)}
                >
                  <i class="bx bx-x" aria-hidden="true"></i>
                </button>
              </span>
            {/each}
          </div>
          {@render objectivePicker(i)}
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ExerciseSettings
            step={s}
            description={descriptions[s.uuid] ?? null}
            onchange={(next) => update((p) => (p.etapes[i] = next))}
          />
          <ExercisePreview step={s} />
        </div>
      </div>
    {/if}
  </li>
{/snippet}

{#snippet objectivePicker(i: number)}
  {@const s = parcours.etapes[i]}
  {@const known = index?.get(s.uuid)}
  {@const free = levelObjectives.filter(
    (o) => !(s.objectifs ?? []).includes(o.libelle),
  )}
  {#if free.length}
    <select
      class="{field} mt-2"
      value=""
      aria-label="Ajouter un objectif à l’exercice {s.id}"
      onchange={(e) => {
        const v = (e.currentTarget as HTMLSelectElement).value
        ;(e.currentTarget as HTMLSelectElement).value = ''
        if (v) addObjective(i, v)
      }}
    >
      <option value="" disabled>Ajouter un objectif…</option>
      {#if known?.objective && free.some((o) => o.libelle === known.objective!.libelle)}
        <option value={known.objective.libelle}
          >Proposé : {known.objective.libelle}</option
        >
      {/if}
      {#each objectiveGroups(free) as g (g.theme)}
        <optgroup label={g.theme || 'Sans chapitre'}>
          {#each g.list as o (o.libelle)}<option value={o.libelle}
              >{o.code ? `${o.code} · ` : ''}{o.libelle}</option
            >{/each}
        </optgroup>
      {/each}
    </select>
  {:else if !levelObjectives.length}
    <p class="{quiet} mt-2">
      Aucun objectif pour {parcours.niveau || 'ce niveau'}.
      {#if onobjectives}<button
          type="button"
          class={link}
          onclick={onobjectives}>Importer des objectifs</button
        >{/if}
    </p>
  {/if}
{/snippet}

{#snippet lessonRow(k: number)}
  {@const lesson = lessonOf(parcours, k)}
  {@const problems = lesson ? lessonProblems(lesson) : []}
  <div class="flex flex-col gap-3" id="fiche-{k}">
    <div class="flex flex-row flex-wrap items-center gap-x-5 gap-y-2">
      {#if lesson}
        <button
          type="button"
          class={link}
          aria-expanded={lessonOpen === k}
          onclick={() => (lessonOpen = lessonOpen === k ? null : k)}
        >
          <i class="bx bx-book-reader text-lg" aria-hidden="true"></i>
          Fiche : {lesson.titre || 'sans titre'}
          <i
            class="bx {lessonOpen === k ? 'bx-chevron-up' : 'bx-chevron-down'}"
            aria-hidden="true"
          ></i>
        </button>
        <span class={quiet}
          >{lesson.blocs.length} bloc{lesson.blocs.length > 1
            ? 's'
            : ''}{lesson.avant ? ' · montrée avant l’entraînement' : ''}</span
        >
        {#if problems.length}
          <span
            class="text-sm text-coopmaths-warn-dark dark:text-coopmathsdark-warn-dark"
            ><i class="bx bx-error-circle" aria-hidden="true"></i>
            {problems.length} point{problems.length > 1 ? 's' : ''} à compléter</span
          >
        {/if}
        <button type="button" class={link} onclick={() => exportLesson(k)}
          ><i class="bx bx-download text-lg" aria-hidden="true"></i> Télécharger</button
        >
        <button
          type="button"
          class={link}
          onclick={() => {
            setLesson(k, undefined)
            lessonOpen = null
          }}>Retirer la fiche</button
        >
      {:else}
        <button
          type="button"
          class={link}
          onclick={() => {
            setLesson(k, emptyLesson())
            lessonOpen = k
          }}
          ><i class="bx bx-book-reader text-lg" aria-hidden="true"></i> Ajouter une
          fiche de cours</button
        >
        <label class="{link} cursor-pointer">
          <i class="bx bx-import text-lg" aria-hidden="true"></i> Importer une
          fiche
          <input
            type="file"
            accept=".json,application/json"
            class="hidden"
            onchange={(e) => {
              importLesson(k, e.currentTarget.files?.[0])
              e.currentTarget.value = ''
            }}
          />
        </label>
      {/if}
      {#if lessonNotice?.level === k}
        <span class={quiet} role="status">{lessonNotice.text}</span>
      {/if}
    </div>
    {#if lesson && lessonOpen === k}
      <!-- Plein écran : les blocs et l'aperçu côte à côte -->
      <div
        class="fixed inset-0 z-40 overflow-y-auto bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
        role="dialog"
        aria-modal="true"
        aria-label="Fiche : {withLevels
          ? levelName(parcours, k).toLowerCase()
          : parcours.titre}"
        tabindex="-1"
        onkeydown={(e) => e.key === 'Escape' && (lessonOpen = null)}
      >
        <div
          class="sticky top-0 z-10 flex flex-row flex-wrap items-center justify-between gap-3 px-4 md:px-8 py-3 border-b border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
        >
          <span
            class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct"
            >{parcours.titre || 'Parcours'}{withLevels
              ? ` · ${levelName(parcours, k)}`
              : ''}</span
          >
          <div class="flex flex-row flex-wrap items-center gap-4">
            <button type="button" class={link} onclick={() => exportLesson(k)}
              ><i class="bx bx-download text-lg" aria-hidden="true"></i> Télécharger
              la fiche</button
            >
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-lg px-4 py-2 font-semibold bg-coopmaths-action dark:bg-coopmathsdark-action text-coopmaths-canvas dark:text-coopmathsdark-canvas hover:bg-coopmaths-action-lightest dark:hover:bg-coopmathsdark-action-lightest"
              onclick={() => (lessonOpen = null)}
              ><i class="bx bx-check" aria-hidden="true"></i> Fermer</button
            >
          </div>
        </div>
        <div class="max-w-screen-xl mx-auto px-4 md:px-8 py-6">
          {#if lessonNotice?.level === k}
            <p class="{quiet} mb-3" role="status">{lessonNotice.text}</p>
          {/if}
          <LessonEditor {lesson} onchange={(l) => setLesson(k, l)} />
        </div>
      </div>
    {/if}
  </div>
{/snippet}

{#snippet addButtons(k: number)}
  <div class="flex flex-row flex-wrap items-center gap-x-5 gap-y-2">
    <button type="button" class={link} onclick={() => (pickerLevel = k)}>
      <i class="bx bx-plus-circle text-lg" aria-hidden="true"></i> Ajouter des
      exercices{withLevels
        ? ` à : ${levelName(parcours, k).toLowerCase()}`
        : ''}
    </button>
    {#if refused && pickerLevel === null}<span
        class="text-sm text-coopmaths-warn-dark dark:text-coopmathsdark-warn-dark"
        role="status">{refused}</span
      >{/if}
    {#if sheetCount}
      <button type="button" class={link} onclick={() => onaddsheet(k)}>
        <i class="bx bx-import text-lg" aria-hidden="true"></i> Ajouter la
        feuille en cours du site ({sheetCount})
      </button>
    {/if}
  </div>
{/snippet}

<svelte:window onclick={() => (iconsOpen = false)} />

<div class="flex flex-col gap-6">
  <!-- Le parcours -->
  <section
    id="parcours-haut"
    data-element={mark('entete')}
    class="group/collab relative scroll-mt-24 grid grid-cols-2 md:grid-cols-4 gap-4"
    aria-label="Parcours"
  >
    {@render collabMark('entete')}
    <label class="col-span-2 md:col-span-4">
      <span class={label}>Titre</span>
      <input
        class="{field} text-lg font-bold"
        value={parcours.titre}
        oninput={(e) =>
          update(
            (p) => (p.titre = (e.currentTarget as HTMLInputElement).value),
          )}
      />
    </label>
    <label>
      <span class={label}>Niveau</span>
      <select
        class={field}
        value={parcours.niveau}
        onchange={(e) =>
          update(
            (p) => (p.niveau = (e.currentTarget as HTMLSelectElement).value),
          )}
      >
        <option value="" disabled>Choisir</option>
        <!-- Niveau de l'autre référentiel (parcours venu de France ou de Suisse) : gardé en tête -->
        {#each parcours.niveau && !levels.includes(parcours.niveau) ? [parcours.niveau, ...levels] : levels as n (n)}<option
            value={n}>{n}</option
          >{/each}
      </select>
    </label>
    <label>
      <span class={label}>Type</span>
      <select
        class={field}
        value={String(parcours.difficulte)}
        onchange={(e) =>
          update(
            (p) =>
              (p.difficulte = Number(
                (e.currentTarget as HTMLSelectElement).value,
              ) as 1 | 2 | 3),
          )}
      >
        {#each DIFFICULTIES as d, k (d)}<option value={String(k + 1)}
            >{d}</option
          >{/each}
      </select>
    </label>
    <div class="col-span-2 flex flex-row items-end gap-2">
      <label class="min-w-0 flex-1">
        <span class={label}>Chapitre</span>
        {#if customChapter}
          <input
            class={field}
            value={parcours.theme}
            placeholder="Nom du chapitre"
            oninput={(e) =>
              setTheme((e.currentTarget as HTMLInputElement).value)}
          />
        {:else}
          <select
            class={field}
            value={parcours.theme.trim()}
            onchange={(e) => {
              const v = (e.currentTarget as HTMLSelectElement).value
              if (v === OTHER_CHAPTER) {
                customChapter = true
                setTheme('')
              } else setTheme(v)
            }}
          >
            <option value="" disabled>Choisir</option>
            {#if levelChapters.length}
              <optgroup label="Chapitres de MathALÉA en {parcours.niveau}">
                {#each levelChapters as c (c.code)}<option value={c.name}
                    >{c.name}</option
                  >{/each}
              </optgroup>
            {/if}
            {#if ownChapters.length}
              <optgroup label="Vos chapitres">
                {#each ownChapters as c (c)}<option value={c}>{c}</option
                  >{/each}
              </optgroup>
            {/if}
            <option value={OTHER_CHAPTER}>Autre chapitre…</option>
          </select>
        {/if}
      </label>
      {#if customChapter}
        <button
          type="button"
          class={iconButton}
          title="Choisir dans la liste"
          aria-label="Choisir le chapitre dans la liste"
          onclick={() => (customChapter = false)}
          ><i class="bx bx-list-ul text-xl" aria-hidden="true"></i></button
        >
      {/if}
      <div class="relative">
        <span class={label}>Icône</span>
        <button
          type="button"
          class="{field} inline-flex items-center gap-1"
          aria-haspopup="listbox"
          aria-expanded={iconsOpen}
          aria-label="Icône du parcours : {ICONS.find(
            (i) => i.icon === parcours.icone,
          )?.nom ?? 'autre'}"
          onclick={(e) => {
            e.stopPropagation()
            iconsOpen = !iconsOpen
          }}
        >
          <i class="bx {parcours.icone} text-xl" aria-hidden="true"></i>
          <i class="bx bx-chevron-down" aria-hidden="true"></i>
        </button>
        {#if iconsOpen}
          <div
            class="absolute right-0 z-30 mt-1 grid grid-cols-4 gap-1 w-64 p-2 rounded-lg shadow-lg border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
            role="listbox"
            aria-label="Icônes"
          >
            {#each ICONS as i (i.icon)}
              <button
                type="button"
                role="option"
                aria-selected={parcours.icone === i.icon}
                title={i.nom}
                class="flex flex-col items-center gap-0.5 rounded-md p-1.5 text-xs {parcours.icone ===
                i.icon
                  ? 'bg-coopmaths-action dark:bg-coopmathsdark-action text-coopmaths-canvas dark:text-coopmathsdark-canvas'
                  : 'text-coopmaths-corpus dark:text-coopmathsdark-corpus hover:bg-coopmaths-canvas-dark dark:hover:bg-coopmathsdark-canvas-dark'}"
                onclick={() => {
                  update((p) => (p.icone = i.icon))
                  iconsOpen = false
                }}
              >
                <i class="bx {i.icon} text-2xl" aria-hidden="true"></i>
                {i.nom}
              </button>
            {/each}
          </div>
        {/if}
      </div>
    </div>
    <label class="col-span-2 md:col-span-4">
      <span class={label}>But du parcours (vu par les élèves)</span>
      <input
        class={field}
        value={parcours.objectif}
        oninput={(e) =>
          update(
            (p) => (p.objectif = (e.currentTarget as HTMLInputElement).value),
          )}
      />
    </label>
    <details
      class="col-span-2 md:col-span-4"
      open={!!(
        parcours.auteurs?.length ||
        parcours.descriptionEleves ||
        parcours.descriptionEnseignant
      )}
    >
      <summary class="{link} cursor-pointer">Auteurs et descriptions</summary>
      <div class="flex flex-col gap-4 mt-3">
        <label>
          <span class={label}>Auteurs (séparés par des virgules)</span>
          <input
            class={field}
            bind:value={authorsInput}
            oninput={() => update(setAuthors)}
          />
        </label>
        {#each [{ key: 'descriptionEleves', text: 'Description pour les élèves' }, { key: 'descriptionEnseignant', text: 'Description pour les enseignants (usage, prérequis, déroulé)' }] as d (d.key)}
          <label>
            <span class={label}>{d.text}</span>
            <textarea
              class={field}
              rows="3"
              value={parcours[
                d.key as 'descriptionEleves' | 'descriptionEnseignant'
              ] ?? ''}
              oninput={(e) => {
                const text = e.currentTarget.value
                update((p) => {
                  if (text.trim())
                    p[d.key as 'descriptionEleves' | 'descriptionEnseignant'] =
                      text
                  else
                    delete p[
                      d.key as 'descriptionEleves' | 'descriptionEnseignant'
                    ]
                })
              }}
            ></textarea>
          </label>
        {/each}
      </div>
    </details>
  </section>

  <!-- Exercices et paliers -->
  <section
    class="flex flex-col gap-3"
    ondragover={(e) => dragged !== null && e.preventDefault()}
    ondrop={drop}
    aria-label="Exercices"
  >
    <div class="flex flex-row flex-wrap items-baseline justify-between gap-2">
      <h3
        class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct"
      >
        Exercices <span class="font-normal {quiet}"
          >{parcours.etapes.length} · {questions} questions</span
        >
      </h3>
      {#if parcours.etapes.length && onpreview}
        <button type="button" class={link} onclick={onpreview}
          ><i class="bx bx-show text-lg" aria-hidden="true"></i> Essayer comme un
          élève</button
        >
      {/if}
    </div>
    <div class="flex flex-row flex-wrap items-center gap-3">
      <span class={quiet}>Organisation</span>
      <div
        class="flex flex-row rounded-lg overflow-hidden border border-coopmaths-action dark:border-coopmathsdark-action"
        role="radiogroup"
        aria-label="Organisation des exercices"
      >
        {#each [['liste', 'Libre', 'bx-list-ul'], ['paliers', 'Par paliers', 'bx-layer']] as [value, text, icon] (value)}
          <button
            type="button"
            role="radio"
            aria-checked={organisation === value}
            class="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-semibold
            {organisation === value
              ? 'bg-coopmaths-action dark:bg-coopmathsdark-action text-coopmaths-canvas dark:text-coopmathsdark-canvas'
              : 'text-coopmaths-action dark:text-coopmathsdark-action hover:bg-coopmaths-canvas-dark dark:hover:bg-coopmathsdark-canvas-dark'}"
            onclick={() => organise(value as 'liste' | 'paliers')}
          >
            <i class="bx {icon}" aria-hidden="true"></i>{text}
          </button>
        {/each}
      </div>
      <span class={quiet}>
        {organisation === 'liste'
          ? 'Les élèves font tous les exercices à la suite.'
          : 'Chaque palier se fait en une séance ; le suivant s’ouvre à la réussite choisie. Paliers numérotés ou ceintures : en bas de la page.'}
      </span>
    </div>

    {#each groups as g, k (k)}
      {@const level = parcours.paliers?.[k]}
      <div
        id="palier-{k}"
        class="scroll-mt-24 flex flex-col gap-3 {withLevels
          ? 'rounded-xl p-4 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark'
          : ''}"
        ondragover={(e) => overLevel(e, k)}
        role="group"
        aria-label={withLevels ? `Palier ${k + 1}` : 'Exercices du parcours'}
      >
        {#if withLevels && level}
          <div
            data-element={mark(`palier:${k}`)}
            class="group/collab relative flex flex-row flex-wrap items-end gap-3"
          >
            {@render collabMark(`palier:${k}`)}
            {#if parcours.style === 'ceintures'}
              <span
                class="shrink-0 inline-block w-9 h-4 rounded-sm ring-1 ring-coopmaths-canvas-darkest dark:ring-coopmathsdark-canvas-darkest mb-3"
                style="background-color: {beltColor(parcours, k)}"
                aria-hidden="true"
              ></span>
            {:else}
              <span
                class="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-full font-bold bg-coopmaths-struct dark:bg-coopmathsdark-struct text-coopmaths-canvas dark:text-coopmathsdark-canvas"
                aria-hidden="true">{k + 1}</span
              >
            {/if}
            <label class="flex-1 min-w-48">
              <span class="{label} font-semibold"
                >{levelName(parcours, k)} · titre vu par les élèves</span
              >
              <input
                class={field}
                value={level.titre}
                oninput={(e) =>
                  update(
                    (p) =>
                      (p.paliers![k].titre = (
                        e.currentTarget as HTMLInputElement
                      ).value),
                  )}
              />
            </label>
            {#if k > 0}
              <label>
                <span class={label}>Pour y accéder</span>
                <select
                  class={field}
                  aria-label="Accès à : {levelName(parcours, k).toLowerCase()}"
                  value={level.acces === 'seuil'
                    ? String(level.seuil ?? DEFAULT_THRESHOLD)
                    : 'libre'}
                  onchange={(e) => {
                    const v = (e.currentTarget as HTMLSelectElement).value
                    update((p) => {
                      p.paliers![k].acces = v === 'libre' ? 'libre' : 'seuil'
                      p.paliers![k].seuil =
                        v === 'libre' ? undefined : Number(v)
                    })
                  }}
                >
                  {#each [50, 60, 70, 80, 90, 100] as n (n)}<option
                      value={String(n)}
                      >Au moins {n} % à : {levelName(
                        parcours,
                        k - 1,
                      ).toLowerCase()}</option
                    >{/each}
                  <option value="libre">Ouvert à tout moment</option>
                </select>
              </label>
            {/if}
            <label>
              <span class={label}>À partir d'une date</span>
              <input
                type="date"
                class={field}
                title="Le palier s'ouvre ce jour-là à 8 h, à votre heure, même si le seuil est atteint"
                aria-label="Date d'ouverture de : {levelName(
                  parcours,
                  k,
                ).toLowerCase()}"
                value={level.ouverture ? dayOfOpening(level.ouverture) : ''}
                onchange={(e) => {
                  const v = (e.currentTarget as HTMLInputElement).value
                  update((p) => {
                    p.paliers![k].ouverture = isDay(v)
                      ? openingOfDay(v)
                      : undefined
                  })
                }}
              />
            </label>
            <button
              type="button"
              class={iconButton}
              aria-label="Supprimer le palier {k + 1}"
              title="Supprimer le palier (ses exercices rejoignent le palier voisin)"
              onclick={() => set(removeLevel(parcours, k))}
            >
              <i class="bx bx-trash text-xl" aria-hidden="true"></i>
            </button>
          </div>
        {/if}
        {#if g.length}
          <ul class="flex flex-col gap-2">
            {#each g as i (collab ? (parcours.etapes[i].cle ?? i) : parcours.etapes[i])}{@render stepRow(
                i,
              )}{/each}
            {#if afterLast(k)}<li
                class="h-1 rounded bg-coopmaths-action dark:bg-coopmathsdark-action"
                aria-hidden="true"
              ></li>{/if}
          </ul>
        {:else}
          <p
            class="rounded-lg border-2 border-dashed px-4 py-5 text-center {quiet}
            {target?.level === k
              ? 'border-coopmaths-action dark:border-coopmathsdark-action'
              : 'border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest'}"
          >
            {withLevels
              ? 'Glissez des exercices ici, ou ajoutez-en.'
              : 'Ajoutez des exercices.'}
          </p>
        {/if}
        {#if withLevels && level}
          <details class="group/ressource" open={!!level.ressource}>
            <summary class="{link} cursor-pointer list-none"
              ><i class="bx bx-book-open text-lg" aria-hidden="true"></i>
              Ressource pour revoir{level.ressource
                ? ` : ${level.ressource.titre}`
                : ''}</summary
            >
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
              <label>
                <span class={label}>Titre vu par les élèves</span>
                <input
                  class={field}
                  value={level.ressource?.titre ?? ''}
                  onchange={(e) =>
                    update(
                      (p) =>
                        (p.paliers![k].ressource = {
                          titre: (e.currentTarget as HTMLInputElement).value,
                          lien: p.paliers![k].ressource?.lien ?? '',
                        }),
                    )}
                />
              </label>
              <label>
                <span class={label}>Lien (PDF, vidéo sur votre drive)</span>
                <input
                  class={field}
                  type="url"
                  value={level.ressource?.lien ?? ''}
                  onchange={(e) =>
                    update(
                      (p) =>
                        (p.paliers![k].ressource = {
                          titre: p.paliers![k].ressource?.titre ?? '',
                          lien: (e.currentTarget as HTMLInputElement).value,
                        }),
                    )}
                />
              </label>
            </div>
            {#if level.ressource}
              <button
                type="button"
                class="{link} mt-2"
                onclick={() => update((p) => delete p.paliers![k].ressource)}
                >Retirer la ressource</button
              >
            {/if}
          </details>
        {/if}
        {@render lessonRow(k)}
        {@render addButtons(k)}
      </div>
      {#if withLevels && level}
        <div
          id="pause-{k}"
          data-element={mark(`pause:${k}`)}
          class="group/collab relative scroll-mt-24 flex flex-col gap-2 rounded-xl px-4 py-3 border border-dashed border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest"
        >
          {@render collabMark(`pause:${k}`)}
          {#if level.pause}
            <label>
              <span class="{label} flex items-center gap-1"
                ><i
                  class="bx bx-pause-circle text-lg text-coopmaths-action dark:text-coopmathsdark-action"
                  aria-hidden="true"
                ></i>
                Pause après le palier {k + 1} (point de cours, consigne, encouragement)</span
              >
              <textarea
                class={field}
                rows="3"
                value={level.pause.texte}
                oninput={(e) =>
                  update(
                    (p) =>
                      (p.paliers![k].pause!.texte = (
                        e.currentTarget as HTMLTextAreaElement
                      ).value),
                  )}
              ></textarea>
            </label>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
              <label>
                <span class={label}>Document lié : titre (facultatif)</span>
                <input
                  class={field}
                  value={level.pause.ressource?.titre ?? ''}
                  onchange={(e) =>
                    update(
                      (p) =>
                        (p.paliers![k].pause!.ressource = {
                          titre: (e.currentTarget as HTMLInputElement).value,
                          lien: p.paliers![k].pause!.ressource?.lien ?? '',
                        }),
                    )}
                />
              </label>
              <label>
                <span class={label}>Document lié : lien (facultatif)</span>
                <input
                  class={field}
                  type="url"
                  value={level.pause.ressource?.lien ?? ''}
                  onchange={(e) =>
                    update(
                      (p) =>
                        (p.paliers![k].pause!.ressource = {
                          titre: p.paliers![k].pause!.ressource?.titre ?? '',
                          lien: (e.currentTarget as HTMLInputElement).value,
                        }),
                    )}
                />
              </label>
            </div>
            <button
              type="button"
              class="{link} self-start"
              onclick={() => update((p) => delete p.paliers![k].pause)}
              >Retirer la pause</button
            >
          {:else}
            <button
              type="button"
              class="{link} self-start"
              onclick={() =>
                update((p) => (p.paliers![k].pause = { texte: '' }))}
            >
              <i class="bx bx-pause-circle text-lg" aria-hidden="true"></i>
              Ajouter une pause après le palier {k + 1}
            </button>
          {/if}
        </div>
      {/if}
    {/each}
    {#if withLevels}
      <button
        type="button"
        class="{link} self-start"
        onclick={() => set(addLevel(parcours))}
      >
        <i class="bx bx-plus text-lg" aria-hidden="true"></i> Ajouter {parcours.style ===
        'ceintures'
          ? `la ${levelName(parcours, groups.length).toLowerCase()}`
          : 'un palier'}
      </button>
    {/if}
  </section>

  <!-- Pour les élèves : présentation des paliers, pages et validation -->
  <section
    data-element={mark('eleves')}
    class="group/collab relative grid grid-cols-1 md:grid-cols-2 gap-4"
    aria-label="Pour les élèves"
  >
    {@render collabMark('eleves')}
    <h3
      class="md:col-span-2 font-bold text-coopmaths-struct dark:text-coopmathsdark-struct"
    >
      Pour les élèves
    </h3>
    {#if withLevels}
      <div class="md:col-span-2 flex flex-row flex-wrap items-center gap-3">
        <span class={quiet}>Les paliers sont présentés</span>
        <div
          class="flex flex-row rounded-lg overflow-hidden border border-coopmaths-action dark:border-coopmathsdark-action"
          role="radiogroup"
          aria-label="Présentation des paliers"
        >
          {#each [['paliers', 'Numérotés', 'bx-layer'], ['ceintures', 'En ceintures', 'bx-medal']] as [value, text, icon] (value)}
            {@const on = (parcours.style ?? 'paliers') === value}
            <button
              type="button"
              role="radio"
              aria-checked={on}
              class="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-semibold
              {on
                ? 'bg-coopmaths-action dark:bg-coopmathsdark-action text-coopmaths-canvas dark:text-coopmathsdark-canvas'
                : 'text-coopmaths-action dark:text-coopmathsdark-action hover:bg-coopmaths-canvas-dark dark:hover:bg-coopmathsdark-canvas-dark'}"
              onclick={() => setStyle(value as LevelStyle)}
            >
              <i class="bx {icon}" aria-hidden="true"></i>{text}
            </button>
          {/each}
        </div>
        {#if parcours.style === 'ceintures'}
          <label class="flex flex-row items-center gap-2 {quiet}">
            Première ceinture
            <select
              class="rounded-md border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest bg-coopmaths-canvas dark:bg-coopmathsdark-canvas px-2 py-1 text-coopmaths-corpus dark:text-coopmathsdark-corpus"
              value={String(parcours.premiereCeinture ?? 0)}
              onchange={(e) => {
                const r = Number((e.currentTarget as HTMLSelectElement).value)
                update((p) => {
                  if (r) p.premiereCeinture = r
                  else delete p.premiereCeinture
                })
              }}
            >
              {#each BELTS as b, r (b.nom)}<option value={String(r)}
                  >{b.nom}</option
                >{/each}
            </select>
          </label>
          <span class="flex flex-row items-center gap-1" aria-hidden="true">
            {#each groups as _, k (k)}
              <span
                class="inline-block w-5 h-2.5 rounded-sm ring-1 ring-black/20"
                style="background-color: {beltColor(parcours, k)}"
                title={levelName(parcours, k)}
              ></span>
            {/each}
          </span>
        {/if}
      </div>
    {/if}
    <label>
      <span class={label}>Pages</span>
      <select
        class={field}
        value={parcours.presentation}
        onchange={(e) =>
          update(
            (p) =>
              (p.presentation = (e.currentTarget as HTMLSelectElement)
                .value as Presentation),
          )}
      >
        {#each Object.entries(PRESENTATION_LABELS) as [value, text] (value)}<option
            {value}>{text}</option
          >{/each}
      </select>
    </label>
    <label>
      <span class={label}>Validation et correction</span>
      <select
        class={field}
        value={parcours.correction}
        onchange={(e) =>
          update(
            (p) =>
              (p.correction = (e.currentTarget as HTMLSelectElement)
                .value as Validation),
          )}
      >
        {#each Object.entries(validationLabels(parcours)) as [value, text] (value)}<option
            {value}>{text}</option
          >{/each}
      </select>
    </label>
    <label class="flex items-center gap-2 {quiet}">
      <input
        type="checkbox"
        checked={!parcours.enTetesMasques}
        onchange={(e) =>
          update(
            (p) =>
              (p.enTetesMasques = !(e.currentTarget as HTMLInputElement)
                .checked),
          )}
      />
      Afficher les exercices (numéro et titre) ; sinon, les questions s’enchaînent
    </label>
    <label class="flex items-center gap-2 {quiet}">
      <input
        type="checkbox"
        disabled={parcours.presentation === 'un_exo_par_page'}
        checked={!!parcours.melanger}
        onchange={(e) =>
          update(
            (p) => (p.melanger = (e.currentTarget as HTMLInputElement).checked),
          )}
      />
      {parcours.presentation === 'un_exo_par_page'
        ? 'Mélanger les questions (sans effet avec une page par exercice)'
        : 'Mélanger les questions (ordre propre à chaque élève)'}
    </label>
  </section>

  <footer
    class="flex flex-row flex-wrap items-center justify-between gap-3 border-t border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest pt-4"
  >
    <p class={quiet} role="status">
      {#if todo.length}
        <i
          class="bx bx-error-circle text-coopmaths-warn-dark dark:text-coopmathsdark-warn-dark"
          aria-hidden="true"
        ></i>
        À compléter avant la publication : {todo.join(', ')}.
      {:else}
        <i
          class="bx bx-check-circle text-coopmaths-action dark:text-coopmathsdark-action"
          aria-hidden="true"
        ></i>
        Prêt · V{parcours.version} · enregistré dans ce navigateur
      {/if}
    </p>
    <div class="flex flex-row gap-5">
      <button type="button" class={link} onclick={onduplicate}
        ><i class="bx bx-copy text-lg" aria-hidden="true"></i> Dupliquer</button
      >
      <button type="button" class={link} onclick={ondelete}
        ><i class="bx bx-trash text-lg" aria-hidden="true"></i> Supprimer</button
      >
    </div>
  </footer>
</div>

{#if pickerLevel !== null}
  <TypstAddExerciseModal
    onAdd={addFromSite}
    onClose={() => (pickerLevel = null)}
    initialPath={menuPathFor(parcours.niveau, chapterCode)}
    fullScreen
    settingsOpen
    target={withLevels
      ? `${parcours.style === 'ceintures' ? 'la' : 'le'} ${levelName(parcours, pickerLevel).toLowerCase()}`
      : 'ce parcours'}
    {selection}
  />
{/if}
