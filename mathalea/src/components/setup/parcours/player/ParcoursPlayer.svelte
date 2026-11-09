<script lang="ts">
  import { latexTitle } from '../../../../lib/parcours/latexTitle'
  /**
   * Aperçu élève d'un parcours, joué dans le navigateur comme dans
   * l'application MathALÉA : carte du parcours (paliers ou ceintures, leurs
   * conditions et pauses), séances, bilans. Les résultats restent en mémoire
   * et repartent de zéro quand les exercices ou les paliers changent.
   */
  import { untrack } from 'svelte'
  import { openingLabel } from '../../../../lib/parcours/parcoursOpening'
  import {
    DIFFICULTIES,
    beltColor,
    levelName,
    type Lesson,
    type Parcours,
  } from '../../../../lib/parcours/parcoursTypes'
  import {
    finishSession,
    levelCondition,
    levelStates,
    newSession,
    studentTitle,
    type Session,
    type StepResult,
  } from '../../../../lib/parcours/parcoursPlayer'
  import LessonPreview from '../LessonPreview.svelte'
  import PlayerSession from './PlayerSession.svelte'
  import PlayerSummary from './PlayerSummary.svelte'
  import {
    actionButton,
    groupedList,
    invertedButton,
    linkButton,
    quiet,
    rounded,
    scoreBadge,
  } from './playerClasses'

  let { parcours }: { parcours: Parcours } = $props()

  let results: Record<number, StepResult> = $state({})
  let screen: 'map' | 'session' | 'summary' | 'lesson' = $state('map')
  // Fiche ouverte, et palier à commencer ensuite (fiche montrée d'office)
  let lesson = $state<{ fiche: Lesson; then: number | null } | null>(null)
  let lessonsSeen: number[] = $state([])
  let session = $state<Session | null>(null)
  let sessionLevel = $state(-1) // palier de la séance (-1 : tout le parcours)
  let allOpen = $state(false) // l'enseignant ouvre tous les paliers pour les essayer

  // Exercices ou paliers modifiés : les résultats ne correspondent plus
  const structure = $derived(
    JSON.stringify([
      parcours.etapes.map((s) => [
        s.uuid,
        s.nbQuestions,
        s.sup,
        s.sup2,
        s.sup3,
        s.sup4,
      ]),
      parcours.paliers?.map((l) => [l.nb, l.acces, l.seuil]),
    ]),
  )
  let lastStructure = untrack(() => structure)
  $effect(() => {
    if (structure === lastStructure) return
    lastStructure = structure
    results = {}
    lessonsSeen = []
  })
  // Séance en cours sur une ancienne version du parcours
  const outdated = $derived(
    !!session &&
      JSON.stringify(session.parcours) !==
        JSON.stringify($state.snapshot(parcours)),
  )

  const withLevels = $derived((parcours.paliers?.length ?? 0) > 1)
  const levels = $derived(levelStates(parcours, results))
  const isOpen = (k: number) => allOpen || levels[k]?.open
  const questions = $derived(
    parcours.etapes.reduce((a, s) => a + (s.nbQuestions ?? 0), 0),
  )
  // Palier à faire : le premier ouvert pas terminé, sinon le premier à revoir
  const current = $derived.by(() => {
    const k = levels.findIndex((x, i) => isOpen(i) && !x.finished)
    return k !== -1 ? k : levels.findIndex((x, i) => isOpen(i) && x.toReview)
  })
  const levelInfo = (k: number) =>
    withLevels
      ? {
          name: levelName(parcours, k),
          color: parcours.style === 'ceintures' ? beltColor(parcours, k) : null,
        }
      : null

  function showLesson(fiche: Lesson, then: number | null = null) {
    lesson = { fiche, then }
    screen = 'lesson'
  }

  function start(k: number, steps?: number[]) {
    // Fiche « à lire avant » : montrée d'office la première fois
    const fiche = levels[k]?.fiche
    if (fiche?.avant && !lessonsSeen.includes(k)) {
      lessonsSeen = [...lessonsSeen, k]
      return showLesson(fiche, k)
    }
    sessionLevel = withLevels ? k : -1
    session = newSession(
      $state.snapshot(parcours) as Parcours,
      steps ?? levels[k].steps,
    )
    screen = 'session'
  }

  function finish() {
    if (!session) return
    results = finishSession(results, $state.snapshot(session) as Session)
    screen = 'summary'
  }

  const summaryLevel = $derived.by(() => {
    if (sessionLevel < 0) return null
    const k = sessionLevel
    const x = levels[k]
    const next = levels[k + 1]
    return {
      name: levelName(parcours, k),
      pause: x?.pause,
      ressource: x?.ressource,
      next: next
        ? {
            name: levelName(parcours, k + 1),
            open: isOpen(k + 1),
            condition: levelCondition(next, x, openingLabel),
          }
        : null,
    }
  })

  function status(k: number) {
    const x = levels[k]
    if (!isOpen(k) && x.beforeOpening)
      return {
        icon: 'bx-calendar',
        text: `À partir du ${openingLabel(x.opening!)}`,
      }
    if (!isOpen(k))
      return {
        icon: 'bx-lock-alt',
        text: `Au moins ${x.threshold} % à : ${levelName(parcours, k - 1).toLowerCase()}`,
      }
    if (x.finished && x.toReview)
      return { icon: 'bx-revision', text: `À revoir · ${x.percentage} %` }
    if (x.finished)
      return { icon: 'bx-check-circle', text: `Réussi · ${x.percentage} %` }
    if (x.done)
      return {
        icon: 'bx-adjust',
        text: `${x.done} exercice${x.done > 1 ? 's' : ''} sur ${x.steps.length}`,
      }
    if (k > 0 && x.access === 'libre' && current !== -1 && k > current)
      return { icon: 'bx-lock-open-alt', text: 'Ouvert à tout moment' }
    return { icon: 'bx-circle', text: 'À faire' }
  }

  function buttonLabel(k: number) {
    const x = levels[k]
    const it = parcours.style === 'ceintures' ? 'cette ceinture' : 'ce palier'
    if (x.finished) return `Refaire ${it}`
    return k === 0 ? 'Commencer' : `Commencer ${it}`
  }

  const visible = (steps: number[]) =>
    steps.filter((i) => !parcours.etapes[i].titreMasque)
  const objectivesOf = (steps: number[]) => [
    ...new Set(steps.flatMap((i) => parcours.etapes[i].objectifs ?? [])),
  ]
</script>

{#snippet stepLines(steps: number[])}
  {#if visible(steps).length}
    <ul class="flex flex-col gap-1">
      {#each visible(steps) as i (i)}
        {@const r = results[i]}
        <li class="flex flex-row items-center justify-between gap-3 text-sm">
          <span
            class="min-w-0 text-coopmaths-corpus dark:text-coopmathsdark-corpus"
            use:latexTitle={studentTitle(parcours.etapes[i], i)}
          ></span>
          {#if r && r.total > 0}<span
              class={scoreBadge((100 * r.points) / r.total)}
              >{rounded(r.points)}/{r.total}</span
            >{/if}
        </li>
      {/each}
    </ul>
  {/if}
{/snippet}

<div
  class="flex flex-col min-h-full bg-coopmaths-canvas dark:bg-coopmathsdark-canvas text-coopmaths-corpus dark:text-coopmathsdark-corpus"
>
  {#if outdated && screen !== 'map'}
    <p
      class="flex flex-row flex-wrap items-center gap-2 px-4 py-2 text-sm bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark"
      role="status"
    >
      <i
        class="bx bx-refresh text-lg text-coopmaths-action dark:text-coopmathsdark-action"
        aria-hidden="true"
      ></i>
      Le parcours a changé depuis le début de cette séance.
      <button
        type="button"
        class="font-semibold text-coopmaths-action dark:text-coopmathsdark-action"
        onclick={() => {
          session = null
          screen = 'map'
        }}>Revenir à la carte</button
      >
    </p>
  {/if}

  {#if screen === 'lesson' && lesson}
    <div class="flex flex-col gap-4 p-4">
      <div class="flex flex-row items-center gap-2">
        <button
          type="button"
          class="inline-flex items-center justify-center w-9 h-9 rounded-full text-coopmaths-action dark:text-coopmathsdark-action hover:bg-coopmaths-canvas-dark dark:hover:bg-coopmathsdark-canvas-dark"
          aria-label="Fermer la fiche"
          onclick={() => (screen = 'map')}
        >
          <i aria-hidden="true" class="bx bx-x text-2xl"></i>
        </button>
        <span
          class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct"
          >{lesson.fiche.titre || 'Fiche'}</span
        >
      </div>
      <LessonPreview lesson={lesson.fiche} />
      {#if lesson.then !== null}
        <button
          type="button"
          class="{actionButton} w-full"
          onclick={() => start(lesson!.then!)}>Commencer l’entraînement</button
        >
      {/if}
    </div>
  {:else if screen === 'session' && session}
    {#key session}
      <PlayerSession
        bind:session
        level={levelInfo(sessionLevel)}
        onleave={() => (screen = 'map')}
        onfinish={finish}
      />
    {/key}
  {:else if screen === 'summary' && session}
    <PlayerSummary
      {session}
      level={summaryLevel}
      onretry={() => start(Math.max(0, sessionLevel), session!.steps)}
      onskipped={() => {
        session!.position = 0
        screen = 'session'
      }}
      oncontinue={() => start(sessionLevel + 1)}
      onclose={() => (screen = 'map')}
    />
  {:else}
    <div class="flex flex-col gap-4 p-4">
      <div class="flex flex-row items-start gap-3">
        <i
          class="bx {parcours.icone} text-3xl text-coopmaths-struct dark:text-coopmathsdark-struct"
          aria-hidden="true"
        ></i>
        <div class="min-w-0">
          <h2
            class="text-xl font-bold text-coopmaths-struct dark:text-coopmathsdark-struct"
          >
            {parcours.titre || 'Sans titre'}
          </h2>
          {#if parcours.objectif}<p class="font-light">
              {parcours.objectif}
            </p>{/if}
          {#if parcours.descriptionEleves}<p
              class="mt-2 whitespace-pre-line font-light"
            >
              {parcours.descriptionEleves}
            </p>{/if}
          <p class="mt-1 {quiet}">
            {[
              parcours.niveau,
              DIFFICULTIES[parcours.difficulte - 1],
              withLevels
                ? `${levels.length} ${parcours.style === 'ceintures' ? 'ceintures' : 'paliers'}`
                : '',
              `${questions} questions`,
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>
      </div>

      {#if !parcours.etapes.length}
        <p class={quiet}>Ajoutez des exercices pour essayer le parcours.</p>
      {:else if withLevels}
        <label class="flex flex-row items-center gap-2 {quiet}">
          <input type="checkbox" bind:checked={allOpen} />
          {parcours.style === 'ceintures'
            ? 'Ouvrir toutes les ceintures pour les essayer'
            : 'Ouvrir tous les paliers pour les essayer'}
        </label>
        <ol class="flex flex-col" aria-label="Paliers">
          {#each levels as x, k (k)}
            {@const s = status(k)}
            {@const objectives = objectivesOf(x.steps)}
            {#if k > 0}<li
                aria-hidden="true"
                class="self-center w-1 h-4 rounded-full bg-coopmaths-canvas-darkest dark:bg-coopmathsdark-canvas-darkest"
              ></li>{/if}
            <li>
              <section
                class="flex flex-col gap-3 rounded-2xl p-4 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark
                {k === current
                  ? 'border-2 border-coopmaths-action dark:border-coopmathsdark-action'
                  : ''}"
                aria-label={levelName(parcours, k)}
              >
                <div class="flex flex-row items-center gap-3">
                  {#if parcours.style === 'ceintures'}
                    <span
                      aria-hidden="true"
                      class="shrink-0 w-10 h-5 rounded {isOpen(k)
                        ? ''
                        : 'opacity-40'} border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest"
                      style="background-color: {beltColor(parcours, k)}"
                    ></span>
                  {:else}
                    <span
                      aria-hidden="true"
                      class="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full text-lg font-bold
                      {isOpen(k)
                        ? 'bg-coopmaths-struct dark:bg-coopmathsdark-struct text-coopmaths-canvas dark:text-coopmathsdark-canvas'
                        : 'bg-coopmaths-canvas-darkest dark:bg-coopmathsdark-canvas-darkest text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest'}"
                      >{k + 1}</span
                    >
                  {/if}
                  <div class="min-w-0 flex-1">
                    <h3
                      class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct"
                    >
                      {levelName(parcours, k)}{x.titre ? ` · ${x.titre}` : ''}
                    </h3>
                    <p class="flex flex-row items-center gap-1 text-sm">
                      <i
                        aria-hidden="true"
                        class="bx {s.icon} text-base text-coopmaths-action dark:text-coopmathsdark-action"
                      ></i>{s.text}
                    </p>
                  </div>
                </div>
                {#if isOpen(k)}
                  {#if objectives.length}
                    <p class={quiet}>
                      {objectives.length > 1 ? 'Objectifs' : 'Objectif'} : {objectives.join(
                        ' ; ',
                      )}
                    </p>
                  {/if}
                  {@render stepLines(x.steps)}
                  {#if x.fiche}
                    <button
                      type="button"
                      class="{linkButton} w-full"
                      onclick={() => showLesson(x.fiche!)}
                    >
                      <i aria-hidden="true" class="bx bx-book-reader text-xl"
                      ></i>
                      Fiche : {x.fiche.titre}
                    </button>
                  {/if}
                  {#if x.ressource?.lien}
                    <a
                      class="{x.toReview ? invertedButton : linkButton} w-full"
                      href={x.ressource.lien}
                      target="_blank"
                      rel="noopener"
                    >
                      <i aria-hidden="true" class="bx bx-book-open text-xl"></i>
                      Pour revoir : {x.ressource.titre}
                    </a>
                  {/if}
                  {#if x.steps.length}
                    <button
                      type="button"
                      class="{k === current ? actionButton : linkButton} w-full"
                      onclick={() => start(k)}>{buttonLabel(k)}</button
                    >
                  {/if}
                {:else}
                  <p class={quiet}>
                    {x.steps.length} exercice{x.steps.length > 1
                      ? 's'
                      : ''}{objectives.length
                      ? ` · ${objectives.join(' ; ')}`
                      : ''}
                  </p>
                {/if}
              </section>
            </li>
            {#if x.pause?.texte}
              <li
                aria-hidden="true"
                class="self-center w-1 h-4 rounded-full bg-coopmaths-canvas-darkest dark:bg-coopmathsdark-canvas-darkest"
              ></li>
              <li>
                <section
                  class="flex flex-col gap-2 rounded-2xl p-4 border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest"
                  aria-label="Pause"
                >
                  <p
                    class="flex flex-row items-center gap-2 font-bold text-coopmaths-struct dark:text-coopmathsdark-struct"
                  >
                    <i
                      aria-hidden="true"
                      class="bx {x.finished
                        ? 'bx-pause-circle'
                        : 'bx-lock-alt'} text-xl text-coopmaths-action dark:text-coopmathsdark-action"
                    ></i>
                    Pause
                  </p>
                  {#if x.finished || allOpen}
                    <p class="whitespace-pre-line">{x.pause.texte}</p>
                  {:else}
                    <p class={quiet}>
                      Après : {levelName(parcours, k).toLowerCase()}
                    </p>
                  {/if}
                </section>
              </li>
            {/if}
          {/each}
        </ol>
      {:else}
        <ul class={groupedList}>
          {#each parcours.etapes as s, i (i)}
            {@const r = results[i]}
            <li
              class="flex flex-row items-center justify-between gap-3 px-4 py-3 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark"
            >
              <span class="min-w-0" use:latexTitle={studentTitle(s, i)}></span>
              {#if r && r.total > 0}<span
                  class={scoreBadge((100 * r.points) / r.total)}
                  >{rounded(r.points)}/{r.total}</span
                >{/if}
            </li>
          {/each}
        </ul>
        {#if parcours.fiche}
          <button
            type="button"
            class="{linkButton} w-full"
            onclick={() => showLesson(parcours.fiche!)}
          >
            <i aria-hidden="true" class="bx bx-book-reader text-xl"></i>
            Fiche : {parcours.fiche.titre}
          </button>
        {/if}
        <button
          type="button"
          class="{actionButton} w-full"
          onclick={() => start(0)}
          >{Object.keys(results).length ? 'Tout refaire' : 'Commencer'}</button
        >
      {/if}
      {#if Object.keys(results).length}
        <button
          type="button"
          class="{linkButton} self-center"
          onclick={() => (results = {})}
          ><i class="bx bx-reset" aria-hidden="true"></i> Effacer les résultats de
          l’aperçu</button
        >
      {/if}
    </div>
  {/if}
</div>
