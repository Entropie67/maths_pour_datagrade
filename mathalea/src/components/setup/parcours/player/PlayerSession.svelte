<script lang="ts">
  /**
   * Séance de l'aperçu élève : les questions d'un palier (ou du parcours)
   * présentées et validées comme dans l'application MathALÉA (Seance.svelte) :
   * une page par question, par exercice ou tout sur une page ; correction
   * après chaque question, chaque page ou à la fin.
   */
  import { onDestroy, onMount, tick } from 'svelte'
  import {
    afficher,
    initialiser,
    monterClavier,
    preparerExercice,
    type ExercicePrepare,
    type ResultatVerification,
  } from '../../../../moteur'
  import {
    firstAttempts,
    fixOrder,
    onPaper,
    orderedQuestions,
    questionKey,
    score,
    sessionQuestions,
    type Session,
  } from '../../../../lib/parcours/parcoursPlayer'
  import PlayerQuestion from './PlayerQuestion.svelte'
  import {
    actionButton,
    badge,
    invertedButton,
    linkButton,
    rounded,
  } from './playerClasses'

  let {
    session = $bindable(),
    level = null,
    onleave,
    onfinish,
  }: {
    session: Session
    level?: { name: string; color: string | null } | null // palier en cours
    onleave: () => void
    onfinish: () => void
  } = $props()

  type Ref = { step: number; question: number; rank: number }

  const parcours = $derived(session.parcours)
  let exercises: Record<number, ExercicePrepare> = $state({})
  let ready = $state(false)
  let error = $state('')
  let keyboardHost: HTMLDivElement
  let keyboardHeight = $state(0)
  let answered = $state(false)
  let blocks: (PlayerQuestion | undefined)[] = $state([])
  let top: HTMLDivElement
  let unmountKeyboard: (() => void) | undefined
  let measure: ReturnType<typeof setInterval> | undefined

  const list: Ref[] = $derived(
    ready ? orderedQuestions(session).map((q, rank) => ({ ...q, rank })) : [],
  )
  const presentation = $derived(parcours.presentation)
  // Sans en-tête d'exercice, les questions s'enchaînent, numérotées 1, 2, 3…
  const noHeaders = $derived(!!parcours.enTetesMasques)
  const atEnd = $derived(parcours.correction === 'parcours')
  // Tentative soumise : toutes les questions sur une page, corrigées
  const review = $derived(atEnd && !!session.submitted)
  const pages: Ref[][] = $derived.by(() => {
    if (review) return list.length ? [list] : []
    if (presentation === 'une_question_par_page') return list.map((q) => [q])
    if (presentation === 'un_exo_par_page')
      return session.steps.map((e) => list.filter((q) => q.step === e))
    return list.length ? [list] : []
  })
  const page = $derived(
    Math.max(
      0,
      pages.findIndex((p) => p.some((q) => q.rank === session.position)),
    ),
  )
  const first = $derived(firstAttempts(session))
  const points = $derived([...first.values()].reduce((a, e) => a + score(e), 0))
  const single = $derived(presentation === 'une_question_par_page' && !review)
  // Validation question par question sur une page qui en contient plusieurs
  const perQuestion = $derived(
    parcours.correction === 'question' && !single && !review,
  )
  const last = $derived(page + 1 >= pages.length)
  const isInteractive = (q: Ref) =>
    !!exercises[q.step]?.questions[q.question]?.interactive
  const pageChecked = $derived(
    !!pages[page] &&
      pages[page].every(
        (q) => first.has(questionKey(q.step, q.question)) || !isInteractive(q),
      ),
  )
  const checkLabel = $derived(
    single
      ? 'Vérifier'
      : presentation === 'un_exo_par_page'
        ? 'Soumettre l’exercice'
        : 'Soumettre',
  )
  const nextLabel = $derived(
    last
      ? 'Voir le bilan'
      : presentation === 'une_question_par_page'
        ? 'Question suivante'
        : 'Exercice suivant',
  )

  function segmentState(ref: Ref, current: boolean) {
    const e = first.get(questionKey(ref.step, ref.question))
    if (e && !(atEnd && !session.submitted)) {
      const v = score(e)
      return v === 1
        ? 'bg-coopmaths-warn'
        : v > 0
          ? 'bg-coopmaths-action'
          : 'bg-red-600'
    }
    if (current) return 'bg-coopmaths-struct dark:bg-coopmathsdark-struct'
    if (
      e ||
      Object.keys(session.drafts[questionKey(ref.step, ref.question)] ?? {})
        .length
    )
      return 'bg-coopmaths-struct-light dark:bg-coopmathsdark-struct-light'
    return 'bg-coopmaths-canvas-darkest dark:bg-coopmathsdark-canvas-darkest'
  }

  function stepScore(step: number) {
    if (atEnd && !session.submitted) return ''
    const qs = list.filter((q) => q.step === step)
    const done = qs.filter((q) => first.has(questionKey(q.step, q.question)))
    if (!done.length) return ''
    return `${rounded(done.reduce((a, q) => a + score(first.get(questionKey(q.step, q.question))), 0))}/${qs.length}`
  }

  function saveAttempt(ref: Ref, r: ResultatVerification) {
    session.attempts.push({
      step: ref.step,
      question: ref.question,
      correct: r.juste,
      points: r.points,
      total: r.total,
      answers: r.reponses,
    })
    delete session.drafts[questionKey(ref.step, ref.question)]
  }

  async function goToPage(p: number) {
    if (!pages[p]) return
    session.position = pages[p][0].rank
    answered = false
    top?.scrollIntoView({ block: 'start' })
    await tick()
    if (single) blocks[0]?.focus()
  }

  function advance() {
    if (!last) void goToPage(page + 1)
    else onfinish()
  }

  // ---------- Garde-fou : réponses manquantes ou pas encore vérifiées ----------
  type Missing = { ref: Ref; reason: 'empty' | 'typed' }
  let warning: {
    missing: Missing[]
    label: string
    proceed: () => void
  } | null = $state(null)

  function stateOf(ref: Ref): 'checked' | 'typed' | 'empty' {
    const i = pages[page]?.findIndex((q) => q.rank === ref.rank) ?? -1
    if (i !== -1 && blocks[i]) return blocks[i]!.inputState()
    const key = questionKey(ref.step, ref.question)
    if (first.has(key)) return 'checked'
    return Object.keys(session.drafts[key] ?? {}).length ? 'typed' : 'empty'
  }

  const questionName = (ref: Ref) =>
    noHeaders
      ? `Question ${ref.rank + 1}`
      : `Ex ${session.steps.indexOf(ref.step) + 1} · Q${ref.question + 1}`

  function guard(
    refs: Ref[],
    requireCheck: boolean,
    label: string,
    proceed: () => void,
  ) {
    const missing: Missing[] = []
    for (const ref of refs) {
      if (!isInteractive(ref)) continue
      const s = stateOf(ref)
      if (s === 'empty') missing.push({ ref, reason: 'empty' })
      else if (s === 'typed' && requireCheck)
        missing.push({ ref, reason: 'typed' })
    }
    if (!missing.length) return proceed()
    warning = { missing, label, proceed }
  }

  async function goTo(ref: Ref) {
    warning = null
    const p = pages.findIndex((pg) => pg.some((q) => q.rank === ref.rank))
    if (p !== page) await goToPage(p)
    await tick()
    blocks[pages[p].findIndex((q) => q.rank === ref.rank)]?.focus(true)
  }

  function next() {
    if (perQuestion && !pageChecked)
      guard(pages[page], true, 'Continuer quand même', advance)
    else advance()
  }

  /** Entrée dans une question : ne révèle jamais une correction que le bouton ne révélerait pas */
  function onEnter(i: number) {
    if (review) return
    if (single && atEnd) {
      if (!last) void goToPage(page + 1)
    } else if (single) {
      if (pageChecked) next()
      else if (answered) void checkPage()
    } else blocks[i + 1]?.focus(true)
  }

  function checkPageGuarded() {
    if (single) void checkPage()
    else
      guard(pages[page], false, 'Soumettre quand même', () => void checkPage())
  }

  async function checkPage() {
    error = ''
    for (const block of blocks) {
      try {
        await block?.check()
      } catch (e) {
        error = `Une question ne peut pas être vérifiée (${(e as Error).message}).`
      }
    }
  }

  function submit() {
    session.submitted = true
    session.position = 0
    top?.scrollIntoView({ block: 'start' })
  }

  // Titres d'exercices : MathALÉA y met du LaTeX
  function latex(node: HTMLElement, text: string) {
    const render = (t: string) => {
      node.textContent = t
      void afficher(node)
    }
    render(text)
    return { update: render }
  }

  onMount(async () => {
    unmountKeyboard = monterClavier(keyboardHost)
    // Le clavier de MathALÉA est fixé en bas : la barre d'actions se place au-dessus
    measure = setInterval(() => {
      const keyboard = document.getElementById('mathalea-virtual-keyboard')
      const h = keyboard?.getBoundingClientRect().height ?? 0
      const shown =
        !!keyboard && h > 0 && getComputedStyle(keyboard).display !== 'none'
      const visible = shown
        ? Math.max(
            0,
            Math.round(innerHeight - keyboard!.getBoundingClientRect().top),
          )
        : 0
      keyboardHeight = visible > 8 ? visible : 0
    }, 150)
    try {
      await initialiser()
      for (const step of session.steps) {
        const s = parcours.etapes[step]
        const ex = await preparerExercice(
          {
            uuid: s.uuid,
            id: s.id,
            nbQuestions: s.nbQuestions,
            sup: s.sup,
            sup2: s.sup2,
            sup3: s.sup3,
            sup4: s.sup4,
            sup5: s.sup5,
            alea: session.seeds[step],
          },
          step,
        )
        exercises[step] = ex
        session.seeds[step] = ex.graine
        session.questionCounts[step] = ex.questions.length
        // Questions sans réponse à saisir : sur papier, hors du score
        ex.questions.forEach((q, i) => {
          const key = questionKey(step, i)
          if (!q.interactive)
            session.paper = {
              ...session.paper,
              [key]: session.paper?.[key] ?? false,
            }
        })
      }
      fixOrder(session)
      if (session.position >= sessionQuestions(session).length)
        session.position = 0
      ready = true
      await tick()
      if (single) blocks[0]?.focus()
    } catch (e) {
      error = `Impossible de préparer les exercices : ${(e as Error).message}`
    }
  })

  onDestroy(() => {
    clearInterval(measure)
    unmountKeyboard?.()
  })
</script>

<div class="flex flex-col min-h-full" bind:this={top}>
  <div
    class="flex flex-row items-center gap-2 px-4 py-2 border-b border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest"
  >
    <button
      type="button"
      class="inline-flex items-center justify-center w-9 h-9 rounded-full text-coopmaths-action dark:text-coopmathsdark-action hover:bg-coopmaths-canvas-dark dark:hover:bg-coopmathsdark-canvas-dark"
      aria-label="Quitter la séance"
      title="Quitter la séance"
      onclick={onleave}
    >
      <i aria-hidden="true" class="bx bx-x text-2xl"></i>
    </button>
    <p
      class="min-w-0 flex-1 flex flex-row items-center gap-2 font-bold text-coopmaths-struct dark:text-coopmathsdark-struct truncate"
    >
      {#if level?.color}
        <span
          aria-hidden="true"
          class="shrink-0 w-8 h-4 rounded border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest"
          style="background-color: {level.color}"
        ></span>
      {/if}
      {level?.name ?? parcours.titre}
    </p>
    <!-- Correction à la fin : aucun score avant la soumission -->
    {#if ready && !(atEnd && !session.submitted)}
      <span class={badge}
        >{rounded(points)}/{list.filter(
          (q) => !onPaper(session, q.step, q.question),
        ).length}</span
      >
    {/if}
  </div>

  {#if ready && single && pages.length > 1}
    <!-- Une question par page : barre de progression à segments -->
    <div class="px-4 pt-2 pb-2">
      <div
        class="flex flex-row items-center"
        role="tablist"
        aria-label="Questions"
      >
        {#each pages as p, i (i)}
          <button
            type="button"
            role="tab"
            aria-selected={i === page}
            aria-label="Question {i + 1}"
            class="flex-1 px-0.5 py-2"
            onclick={() => goToPage(i)}
          >
            <span
              class="block {i === page
                ? 'h-2.5'
                : 'h-1.5'} rounded-full {segmentState(p[0], i === page)}"
            ></span>
          </button>
        {/each}
      </div>
      <p
        class="text-sm font-light text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest"
      >
        Question {page + 1} sur {pages.length}
      </p>
    </div>
  {:else if ready && pages.length > 1}
    <!-- Onglets de la vue élève (Eleve.svelte) -->
    <div
      class="flex flex-row overflow-x-auto w-full mb-4 border-b-2 border-coopmaths-struct dark:border-coopmathsdark-struct"
      role="tablist"
      aria-label={noHeaders ? 'Pages' : 'Exercices'}
    >
      {#each pages as p, i (i)}
        <button
          type="button"
          role="tab"
          aria-selected={i === page}
          class="relative flex-1 {i === page
            ? 'border-b-4'
            : 'border-b-0'} border-coopmaths-struct dark:border-coopmathsdark-struct text-coopmaths-action dark:text-coopmathsdark-action"
          style="min-width: 2.75rem"
          onclick={() => goToPage(i)}
        >
          <div class="py-2 px-2 text-lg font-light whitespace-nowrap">
            {noHeaders ? 'Page' : 'Ex'}
            {i + 1}<span class="ml-1 text-sm font-bold"
              >{stepScore(p[0].step)}</span
            >
          </div>
        </button>
      {/each}
    </div>
  {/if}

  <div class="flex-1 px-4 pt-4 pb-6">
    {#if error}
      <p
        class="py-4 font-bold text-coopmaths-action dark:text-coopmathsdark-action"
        role="alert"
      >
        {error}
      </p>
    {/if}
    {#if !ready && !error}
      <p class="py-8 text-center" role="status">
        <i
          class="bx bx-loader-alt bx-spin text-3xl text-coopmaths-struct dark:text-coopmathsdark-struct"
          aria-label="Préparation des exercices"
        ></i>
      </p>
    {/if}
    {#if ready && pages[page]}
      {#key `${presentation}-${page}-${review}`}
        {#each pages[page] as ref, i (ref.rank)}
          {@const ex = exercises[ref.step]}
          {@const startsStep = i === 0 || pages[page][i - 1].step !== ref.step}
          {#if noHeaders}
            {#if !single}
              <div
                class="text-coopmaths-struct dark:text-coopmathsdark-struct pb-2"
                class:mt-6={i > 0}
              >
                <div
                  class="inline-flex items-center justify-center h-6 w-6 bg-coopmaths-struct text-coopmaths-canvas font-light text-lg"
                >
                  {ref.rank + 1}
                </div>
              </div>
            {/if}
          {:else if startsStep}
            <!-- En-tête d'exercice de la vue élève (HeaderExerciceVueEleve.svelte) -->
            <h3
              class="text-coopmaths-struct dark:text-coopmathsdark-struct pb-2 flex flex-row items-start"
              class:mt-6={i > 0}
            >
              <span
                class="inline-flex shrink-0 items-center justify-center h-6 w-6 bg-coopmaths-struct text-coopmaths-canvas font-light text-lg translate-y-1"
              >
                {session.steps.indexOf(ref.step) + 1}
              </span>
              <span
                class="font-light ml-2"
                style="font-size: 1.25rem; line-height: 1.3;"
              >
                {#if !parcours.etapes[ref.step].titreMasque}<span
                    use:latex={parcours.etapes[ref.step].titre || ex.titre}
                  ></span>{/if}
              </span>
            </h3>
          {/if}
          <PlayerQuestion
            bind:this={blocks[i]}
            bind:answered
            exercise={ex}
            question={ref.question}
            withContext={single || startsStep}
            checkOnMount={review}
            withButton={perQuestion}
            attempt={first.get(questionKey(ref.step, ref.question))}
            draft={session.drafts[questionKey(ref.step, ref.question)]}
            onchecked={(r) => saveAttempt(ref, r)}
            ondraft={(inputs) =>
              (session.drafts[questionKey(ref.step, ref.question)] = inputs)}
            onenter={perQuestion ? undefined : () => onEnter(i)}
            oninput={() => (warning = null)}
            correctionSeen={session.paper?.[
              questionKey(ref.step, ref.question)
            ] === true}
            onseecorrection={() =>
              (session.paper = {
                ...session.paper,
                [questionKey(ref.step, ref.question)]: true,
              })}
          />
        {/each}
      {/key}
    {/if}
  </div>

  {#if ready}
    <div
      class="sticky z-20 flex flex-col gap-3 px-4 py-3 border-t border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
      style="bottom: {keyboardHeight}px"
    >
      {#if warning}
        {@const empty = warning.missing.filter((m) => m.reason === 'empty')}
        {@const typed = warning.missing.filter((m) => m.reason === 'typed')}
        <div role="alert" class="flex flex-col gap-1 text-sm">
          <p
            class="text-base font-bold text-coopmaths-struct dark:text-coopmathsdark-struct"
          >
            {warning.label} ?
          </p>
          {#if empty.length}
            <p>
              {empty.length === 1
                ? 'Il reste une question sans réponse'
                : `Il reste ${empty.length} questions sans réponse`} :
              {empty.map((m) => questionName(m.ref)).join(', ')}.
            </p>
          {/if}
          {#if typed.length}
            <p>
              {typed.length === 1
                ? 'Une réponse n’est pas encore vérifiée'
                : `${typed.length} réponses ne sont pas encore vérifiées`} :
              {typed.map((m) => questionName(m.ref)).join(', ')}.
            </p>
          {/if}
        </div>
        <div class="flex flex-row gap-3">
          <button
            type="button"
            class="{actionButton} flex-1"
            onclick={() => goTo(warning!.missing[0].ref)}
          >
            Aller à {questionName(warning.missing[0].ref)}
          </button>
          <button
            type="button"
            class="{linkButton} flex-1"
            onclick={() => {
              const proceed = warning?.proceed
              warning = null
              proceed?.()
            }}>{warning.label}</button
          >
        </div>
      {:else}
        <div class="flex flex-row gap-3">
          {#if atEnd && !session.submitted}
            {#if last}
              <button
                type="button"
                class="{actionButton} flex-1"
                onclick={() =>
                  guard(list, false, 'Soumettre quand même', submit)}
              >
                Soumettre la tentative
              </button>
            {:else}
              <button
                type="button"
                class="{actionButton} flex-1"
                onclick={() => goToPage(page + 1)}
              >
                {presentation === 'une_question_par_page'
                  ? 'Question suivante'
                  : 'Exercice suivant'}
              </button>
            {/if}
          {:else if pageChecked || perQuestion}
            <button type="button" class="{actionButton} flex-1" onclick={next}>
              {nextLabel}
            </button>
          {:else}
            <button
              type="button"
              class="{invertedButton} flex-1"
              onclick={next}
            >
              {last ? 'Terminer' : 'Passer'}
            </button>
            <button
              type="button"
              class="{actionButton} flex-1"
              disabled={single && !answered}
              onclick={checkPageGuarded}
            >
              {checkLabel}
            </button>
          {/if}
        </div>
      {/if}
    </div>
  {/if}
  <div bind:this={keyboardHost}></div>
</div>
