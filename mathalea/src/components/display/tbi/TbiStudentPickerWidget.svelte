<script lang="ts">
  import { onDestroy } from 'svelte'
  import { mathaleaGoToView } from '../../../lib/mathaleaUtils'
  import {
    addStudentClass,
    addStudentDraw,
    loadStudentClasses,
    parseStudentNames,
    pickStudentIndex,
    sortedStudentClasses,
    STUDENT_CLASSES_KEY,
    updateStudentClasses,
    type StudentClasses,
  } from '../../../lib/mesFeuilles/studentClasses'
  import { savesLocationStore } from '../../../lib/stores/generalStore'
  import {
    TBI_STUDENT_PICKER_MAX_H,
    TBI_STUDENT_PICKER_MAX_W,
    TBI_STUDENT_PICKER_MIN_H,
    TBI_STUDENT_PICKER_MIN_W,
    updateTbiTool,
    type TbiStudentPickerTool,
  } from '../../../lib/stores/tbiToolsStore'
  import TbiToolFrame from './TbiToolFrame.svelte'
  import type { TbiToolFrameProps } from './tbiTypes'
  import SheetDialog from '../../setup/mesFeuilles/SheetDialog.svelte'
  import {
    primaryButton,
    quietText,
    secondaryButton,
    textInput,
  } from '../../setup/mesFeuilles/styles'

  /**
   * Widget « Tirage au sort » de la vue TBI : tire au sort un élève de la
   * classe choisie, avec une animation d'afficheur à palettes (split-flap)
   * de 2 secondes. Les élèves les moins tirés sont favorisés (voir
   * `drawWeights`) ; les classes et leurs compteurs sont gardés dans « Mes
   * sauvegardes » > Mes réglages > Classes.
   */
  interface Props {
    tool: TbiStudentPickerTool
    /** Commandes communes aux outils (voir `TbiToolsLayer`) */
    frame: TbiToolFrameProps
  }

  let { tool, frame }: Props = $props()

  /** Durée de l'animation du tirage (ms) */
  const DRAW_DURATION = 2000
  /** Nombre de prénoms affichés pendant l'animation, le dernier compris */
  const DRAW_STEPS = 14
  /** Durée maximale d'un basculement de palette (ms) */
  const MAX_FLIP_MS = 420
  const PLACEHOLDER = '?'
  /** Bleus et orange de MathALÉA */
  const CONFETTI_COLORS = ['#216d9a', '#2c93cf', '#5faedd', '#f15929']

  /** Même style que le bouton « Vérifier la réponse » des exercices */
  const drawButtonClass =
    'inline-block min-h-12 px-6 py-2.5 bg-coopmaths-action dark:bg-coopmathsdark-action text-coopmaths-canvas dark:text-coopmathsdark-canvas font-semibold text-base leading-tight rounded-xl shadow-md transform hover:bg-coopmaths-action-lightest dark:hover:bg-coopmathsdark-action-lightest hover:shadow-lg focus-visible:bg-coopmaths-action-lightest dark:focus-visible:bg-coopmathsdark-action-lightest focus-visible:shadow-lg focus:outline-none focus:ring-0 active:bg-coopmaths-action-lightest dark:active:bg-coopmathsdark-action-lightest active:shadow-lg transition duration-150 ease-in-out disabled:opacity-50 disabled:pointer-events-none'
  const toolButtonClass =
    'inline-flex items-center justify-center w-11 h-11 rounded-lg text-coopmaths-struct dark:text-coopmathsdark-struct hover:bg-coopmaths-canvas-dark dark:hover:bg-coopmathsdark-canvas-dark disabled:opacity-40'

  let classes = $state<StudentClasses>(loadStudentClasses())
  const sortedClasses = $derived(sortedStudentClasses(classes))
  const selectedClass = $derived(
    sortedClasses.find((c) => c.id === tool.classId) ?? sortedClasses[0],
  )

  // ---------- Afficheur à palettes ----------

  /** Texte affiché, et celui qu'il remplace (moitié basse pendant la bascule) */
  let current = $state(PLACEHOLDER)
  let previous = $state(PLACEHOLDER)
  /** Incrémenté à chaque bascule, pour relancer les animations CSS */
  let flipId = $state(0)
  let flipMs = $state(MAX_FLIP_MS)
  let isRunning = $state(false)
  /** Dernier tirage, que l'on peut annuler (élève absent…) */
  let lastDraw = $state<{ classId: string; name: string } | null>(null)
  /** Incrémenté à chaque résultat, pour relancer l'animation de révélation */
  let revealId = $state(0)
  let confetti = $state<{ x: number; y: number; r: number; color: string }[]>(
    [],
  )
  let timers: ReturnType<typeof setTimeout>[] = []

  function flipTo(text: string, duration: number) {
    previous = current
    current = text
    flipMs = duration
    flipId++
  }

  function clearTimers() {
    for (const timer of timers) clearTimeout(timer)
    timers = []
  }

  /**
   * Délais entre deux prénoms : de plus en plus longs (décélération), leur
   * somme faisant `DRAW_DURATION`.
   */
  function drawDelays(): number[] {
    const raw = Array.from(
      { length: DRAW_STEPS },
      (_, k) => 1 + 9 * (k / (DRAW_STEPS - 1)) ** 3,
    )
    const total = raw.reduce((sum, d) => sum + d, 0)
    return raw.map((d) => (d / total) * DRAW_DURATION)
  }

  /** Prénoms qui défilent : jamais deux fois le même de suite, puis l'élève tiré */
  function drawSequence(names: string[], winner: string): string[] {
    const sequence: string[] = []
    let last = current
    for (let k = 0; k < DRAW_STEPS - 1; k++) {
      const others = names.filter(
        (name) => name !== last && (k < DRAW_STEPS - 2 || name !== winner),
      )
      const pool = others.length > 0 ? others : names
      last = pool[Math.floor(Math.random() * pool.length)]
      sequence.push(last)
    }
    sequence.push(winner)
    return sequence
  }

  function prefersReducedMotion(): boolean {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  }

  function draw() {
    const studentClass = selectedClass
    if (isRunning || studentClass === undefined) return
    const students = studentClass.students
    if (students.length === 0) return
    const winner = students[pickStudentIndex(students)].name
    clearTimers()
    isRunning = true
    lastDraw = null
    confetti = []
    const finish = () => {
      classes = updateStudentClasses((value) =>
        addStudentDraw(value, studentClass.id, winner),
      )
      lastDraw = { classId: studentClass.id, name: winner }
      isRunning = false
      celebrate()
    }
    if (prefersReducedMotion()) {
      flipTo(winner, 0)
      timers.push(setTimeout(finish, 300))
      return
    }
    const names = students.map((student) => student.name)
    const sequence = drawSequence(names, winner)
    const delays = drawDelays()
    let elapsed = 0
    sequence.forEach((name, k) => {
      const flip = Math.min(MAX_FLIP_MS, delays[k] * 0.9)
      timers.push(setTimeout(() => flipTo(name, flip), elapsed))
      elapsed += delays[k]
    })
    timers.push(setTimeout(finish, elapsed))
  }

  function celebrate() {
    revealId++
    confetti = Array.from({ length: 18 }, (_, i) => {
      const angle = (i / 18) * 2 * Math.PI + Math.random() * 0.3
      const distance = 70 + Math.random() * 60
      return {
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance * 0.7,
        r: Math.random() * 540 - 270,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      }
    })
  }

  /** Annule le dernier tirage (élève absent…) : son compteur est rétabli */
  function undoDraw() {
    const draw = lastDraw
    if (draw === null || isRunning) return
    classes = updateStudentClasses((value) =>
      addStudentDraw(value, draw.classId, draw.name, -1),
    )
    lastDraw = null
    confetti = []
    flipTo(PLACEHOLDER, MAX_FLIP_MS)
  }

  const lastDrawCount = $derived(
    lastDraw === null
      ? 0
      : (classes.classes
          .find((c) => c.id === lastDraw?.classId)
          ?.students.find((s) => s.name === lastDraw?.name)?.draws ?? 0),
  )

  function selectClass(id: string) {
    if (isRunning) return
    updateTbiTool(tool.id, { classId: id })
    frame.persistLayout?.()
    lastDraw = null
    confetti = []
    if (current !== PLACEHOLDER) flipTo(PLACEHOLDER, MAX_FLIP_MS)
  }

  // ---------- Création d'une classe ----------

  let isCreating = $state(false)
  let newName = $state('')
  let newStudents = $state('')
  const parsedStudents = $derived(parseStudentNames(newStudents))

  function openCreate() {
    newName = ''
    newStudents = ''
    isCreating = true
  }

  function createClass() {
    if (parsedStudents.length === 0) return
    let id = ''
    classes = updateStudentClasses((value) => {
      const added = addStudentClass(value, newName, parsedStudents)
      id = added.studentClass.id
      return added.classes
    })
    isCreating = false
    selectClass(id)
  }

  function manageClasses() {
    savesLocationStore.update((location) => ({
      ...location,
      panel: 'classes',
    }))
    mathaleaGoToView('mes-sauvegardes')
  }

  /** Classes modifiées dans un autre onglet (« Mes sauvegardes ») */
  function onStorage(event: StorageEvent) {
    if (event.key !== STUDENT_CLASSES_KEY && event.key !== null) return
    classes = loadStudentClasses()
  }

  onDestroy(clearTimers)
</script>

<svelte:window onstorage={onStorage} />

<TbiToolFrame
  title="Tirage au sort"
  x={tool.x}
  y={tool.y}
  w={tool.w}
  h={tool.h}
  z={tool.z}
  minW={TBI_STUDENT_PICKER_MIN_W}
  maxW={TBI_STUDENT_PICKER_MAX_W}
  minH={TBI_STUDENT_PICKER_MIN_H}
  maxH={TBI_STUDENT_PICKER_MAX_H}
  {...frame}
  bodyClass="!overflow-visible"
>
  <div class="w-full h-full flex flex-col gap-2 p-3">
    <div class="flex flex-row items-center gap-1.5 shrink-0">
      {#if sortedClasses.length > 0}
        <select
          class="min-w-0 flex-1 h-11 rounded-lg border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark px-2 text-base font-semibold text-coopmaths-struct dark:text-coopmathsdark-struct focus:border-coopmaths-struct dark:focus:border-coopmathsdark-struct focus:ring-0"
          aria-label="Classe"
          disabled={isRunning}
          value={selectedClass?.id}
          onchange={(event) => selectClass(event.currentTarget.value)}
        >
          {#each sortedClasses as studentClass (studentClass.id)}
            <option value={studentClass.id}
              >{studentClass.name} ({studentClass.students.length})</option
            >
          {/each}
        </select>
      {:else}
        <span
          class="flex-1 text-sm text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light"
          >Aucune classe</span
        >
      {/if}
      <button
        type="button"
        class={toolButtonClass}
        title="Créer une classe"
        aria-label="Créer une classe"
        disabled={isRunning}
        onclick={openCreate}
      >
        <i class="bx bx-plus text-lg"></i>
      </button>
      <button
        type="button"
        class={toolButtonClass}
        title="Gérer les classes et les compteurs (Mes sauvegardes)"
        aria-label="Gérer les classes"
        disabled={isRunning}
        onclick={manageClasses}
      >
        <i class="bx bx-list-ul text-lg"></i>
      </button>
    </div>

    {#if selectedClass === undefined}
      <div
        class="flex-1 min-h-0 flex flex-col items-center justify-center gap-3 text-center"
      >
        <i
          class="bx bx-group text-5xl text-coopmaths-struct dark:text-coopmathsdark-struct"
          aria-hidden="true"
        ></i>
        <p class="text-sm">Créer une classe pour tirer au sort un élève.</p>
        <button type="button" class={drawButtonClass} onclick={openCreate}>
          Créer une classe
        </button>
      </div>
    {:else}
      <div class="relative flex-1 min-h-0">
        <button
          type="button"
          class="board"
          class:running={isRunning}
          title={selectedClass.students.length === 0
            ? 'Cette classe n’a aucun élève'
            : 'Tirer au sort un élève'}
          aria-label="Tirer au sort un élève de {selectedClass.name}"
          disabled={isRunning || selectedClass.students.length === 0}
          onclick={draw}
        >
          <span
            class="flap-stack"
            class:revealed={lastDraw !== null}
            style="--flip-ms: {flipMs}ms"
          >
            <span class="half top">
              <span class="text" style="--len: {Math.max(current.length, 4)}"
                >{current}</span
              >
            </span>
            <span class="half bottom">
              <span class="text" style="--len: {Math.max(previous.length, 4)}"
                >{previous}</span
              >
            </span>
            {#key flipId}
              {#if flipId > 0 && flipMs > 0}
                <span class="half top flap-top" aria-hidden="true">
                  <span
                    class="text"
                    style="--len: {Math.max(previous.length, 4)}"
                    >{previous}</span
                  >
                </span>
                <span class="half bottom flap-bottom" aria-hidden="true">
                  <span
                    class="text"
                    style="--len: {Math.max(current.length, 4)}">{current}</span
                  >
                </span>
              {:else}
                <span class="half bottom" aria-hidden="true">
                  <span
                    class="text"
                    style="--len: {Math.max(current.length, 4)}">{current}</span
                  >
                </span>
              {/if}
            {/key}
            <span class="hinge" aria-hidden="true"></span>
          </span>
        </button>
        {#key revealId}
          {#each confetti as piece, i (i)}
            <span
              class="confetti"
              aria-hidden="true"
              style="--dx: {piece.x}px; --dy: {piece.y}px; --rot: {piece.r}deg; background: {piece.color}; animation-delay: {i *
                12}ms"
            ></span>
          {/each}
        {/key}
      </div>
      <p class="sr-only" aria-live="polite">
        {lastDraw === null ? '' : `Élève tiré au sort : ${lastDraw.name}`}
      </p>

      <div
        class="flex flex-row flex-wrap items-center justify-center gap-x-3 gap-y-1 shrink-0"
      >
        {#if lastDraw !== null && !isRunning}
          <span
            class="text-base text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light"
          >
            {lastDrawCount} tirage{lastDrawCount > 1 ? 's' : ''} pour {lastDraw.name}
          </span>
          <button
            type="button"
            class="min-h-11 px-2 text-base underline text-coopmaths-struct dark:text-coopmathsdark-struct"
            title="Élève absent ou tirage à refaire : le compteur est rétabli"
            onclick={undoDraw}
          >
            Annuler ce tirage
          </button>
        {/if}
        <button
          type="button"
          class={drawButtonClass}
          disabled={isRunning || selectedClass.students.length === 0}
          onclick={draw}
        >
          {lastDraw === null ? 'Tirer au sort' : 'Nouveau tirage'}
        </button>
      </div>
    {/if}
  </div>
</TbiToolFrame>

<SheetDialog
  open={isCreating}
  title="Créer une classe"
  onclose={() => (isCreating = false)}
>
  <form
    class="flex flex-col gap-4"
    onsubmit={(event) => {
      event.preventDefault()
      createClass()
    }}
  >
    <label class="flex flex-col gap-1 text-sm">
      Nom de la classe
      <!-- svelte-ignore a11y_autofocus -->
      <input
        type="text"
        class={textInput}
        maxlength="200"
        placeholder="5e B"
        autofocus
        bind:value={newName}
      />
    </label>
    <label class="flex flex-col gap-1 text-sm">
      Élèves
      <textarea
        class="{textInput} min-h-48 font-mono text-sm"
        placeholder={'Alice\nBastien\nChloé\n…'}
        bind:value={newStudents}
      ></textarea>
    </label>
    <p class={quietText}>
      Un élève par ligne, ou séparés par des virgules ou des points-virgules.
      {#if parsedStudents.length > 0}
        <strong
          >{parsedStudents.length} élève{parsedStudents.length > 1
            ? 's'
            : ''}.</strong
        >
      {/if}
      La classe est enregistrée dans ce navigateur, dans « Mes sauvegardes » &gt;
      Mes réglages &gt; Classes, où elle peut être modifiée.
    </p>
    <div class="flex flex-row justify-end gap-3">
      <button
        type="button"
        class={secondaryButton}
        onclick={() => (isCreating = false)}>Annuler</button
      >
      <button
        type="submit"
        class={primaryButton}
        disabled={parsedStudents.length === 0}
      >
        <i class="bx bx-check" aria-hidden="true"></i> Créer
      </button>
    </div>
  </form>
</SheetDialog>

<style>
  /* ---------- Afficheur à palettes ---------- */

  .board {
    --flap-top: var(--color-coopmaths-struct);
    --flap-bottom: var(--color-coopmaths-struct-dark);
    --flap-text: var(--color-coopmaths-canvas);
    --flap-revealed: var(--color-coopmaths-canvas);
    --flap-revealed-text: var(--color-coopmaths-struct);
    --flap-ring: var(--color-coopmaths-struct);
    position: absolute;
    inset: 0;
    display: block;
    width: 100%;
    container-type: size;
    border-radius: 0.5rem;
    perspective: 900px;
    cursor: pointer;
  }
  :global(.dark) .board {
    --flap-top: var(--color-coopmathsdark-canvas-dark);
    --flap-bottom: var(--color-coopmathsdark-canvas-darkest);
    --flap-text: var(--color-coopmathsdark-struct);
    --flap-revealed: var(--color-coopmathsdark-struct);
    --flap-revealed-text: var(--color-coopmathsdark-canvas);
    --flap-ring: var(--color-coopmathsdark-struct);
  }
  .board:disabled {
    cursor: default;
  }
  .board:focus-visible {
    outline: 2px solid var(--flap-ring);
    outline-offset: 3px;
  }

  .flap-stack {
    position: absolute;
    inset: 0;
    display: block;
    transform-style: preserve-3d;
    border-radius: 0.5rem;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.18);
    transition: box-shadow 200ms;
  }
  .board:hover:not(:disabled) .flap-stack {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
  }

  .half {
    position: absolute;
    left: 0;
    right: 0;
    height: 50%;
    overflow: hidden;
    backface-visibility: hidden;
  }
  .half.top {
    top: 0;
    border-radius: 0.5rem 0.5rem 0 0;
    background: var(--flap-top);
    transform-origin: 50% 100%;
  }
  .half.bottom {
    bottom: 0;
    border-radius: 0 0 0.5rem 0.5rem;
    background: var(--flap-bottom);
    transform-origin: 50% 0%;
  }

  .text {
    position: absolute;
    left: 0;
    right: 0;
    height: 200%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 4cqw;
    white-space: nowrap;
    font-weight: 700;
    line-height: 1;
    /* la taille suit le widget et la longueur du prénom */
    font-size: min(42cqh, calc(150cqw / var(--len)));
    color: var(--flap-text);
  }
  .top .text {
    top: 0;
  }
  .bottom .text {
    bottom: 0;
  }

  .flap-top {
    z-index: 2;
    animation: flap-top calc(var(--flip-ms) / 2) ease-in both;
  }
  .flap-bottom {
    z-index: 2;
    animation: flap-bottom calc(var(--flip-ms) / 2) ease-out
      calc(var(--flip-ms) / 2) both;
  }
  /* ombre portée par la palette qui bascule */
  .flap-top::after,
  .flap-bottom::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
  }
  .flap-top::after {
    background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.3));
    animation: fade-in calc(var(--flip-ms) / 2) ease-in both;
  }
  .flap-bottom::after {
    background: linear-gradient(0deg, transparent, rgba(0, 0, 0, 0.3));
    animation: fade-out calc(var(--flip-ms) / 2) ease-out
      calc(var(--flip-ms) / 2) both;
  }

  @keyframes flap-top {
    from {
      transform: rotateX(0deg);
    }
    to {
      transform: rotateX(-90deg);
    }
  }
  @keyframes flap-bottom {
    from {
      transform: rotateX(90deg);
    }
    to {
      transform: rotateX(0deg);
    }
  }
  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  @keyframes fade-out {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }

  .hinge {
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    height: 2px;
    transform: translateY(-1px) translateZ(1px);
    background: rgba(0, 0, 0, 0.25);
    z-index: 3;
  }

  /* ---------- Révélation : palette blanche, prénom en bleu ---------- */

  .revealed {
    animation: reveal 600ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
    box-shadow:
      0 0 0 3px var(--flap-ring),
      0 6px 18px rgba(0, 0, 0, 0.2);
  }
  .revealed .half.top,
  .revealed .half.bottom {
    background: var(--flap-revealed);
  }
  .revealed .text {
    color: var(--flap-revealed-text);
  }
  .revealed .hinge {
    background: rgba(0, 0, 0, 0.08);
  }

  @keyframes reveal {
    0% {
      transform: scale(1);
    }
    40% {
      transform: scale(1.05);
    }
    100% {
      transform: scale(1);
    }
  }

  .confetti {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 7px;
    height: 11px;
    border-radius: 2px;
    pointer-events: none;
    z-index: 5;
    animation: confetti 1100ms cubic-bezier(0.15, 0.7, 0.3, 1) both;
  }
  @keyframes confetti {
    0% {
      opacity: 1;
      transform: translate(-50%, -50%) rotate(0deg) scale(0.4);
    }
    70% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: translate(
          calc(-50% + var(--dx)),
          calc(-50% + var(--dy) + 30px)
        )
        rotate(var(--rot)) scale(1);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .revealed {
      animation: none;
    }
    .confetti {
      display: none;
    }
  }
</style>
