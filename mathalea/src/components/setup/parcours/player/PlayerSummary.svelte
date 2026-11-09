<script lang="ts">
  import { latexTitle } from '../../../../lib/parcours/latexTitle'
  /**
   * Bilan d'une séance de l'aperçu élève : score, pause de l'enseignant après
   * le palier, condition du palier suivant. Repris de l'application MathALÉA
   * (Bilan.svelte).
   */
  import type { Pause, Resource } from '../../../../lib/parcours/parcoursTypes'
  import {
    studentTitle,
    summary,
    type Session,
  } from '../../../../lib/parcours/parcoursPlayer'
  import {
    actionButton,
    groupedList,
    invertedButton,
    linkButton,
    quiet,
    rounded,
    scoreBadge,
  } from './playerClasses'

  let {
    session,
    level = null,
    onretry,
    onskipped,
    oncontinue,
    onclose,
  }: {
    session: Session
    /** Séance d'un palier : son nom, la pause de l'enseignant, et la suite */
    level?: {
      name: string
      pause?: Pause
      ressource?: Resource
      next: { name: string; open: boolean; condition: string } | null
    } | null
    onretry: () => void
    onskipped: () => void
    oncontinue: () => void
    onclose: () => void
  } = $props()

  const b = $derived(summary(session))
  const paper = $derived(b.byStep.reduce((a, e) => a + e.paper, 0))
  const seen = $derived(b.byStep.reduce((a, e) => a + e.seen, 0))
  const stepTitle = (i: number) => studentTitle(session.parcours.etapes[i], i)
</script>

<div class="flex flex-col gap-4 p-4">
  <div class="text-center py-4">
    {#if b.total > 0}
      <div
        class="font-light text-coopmaths-struct dark:text-coopmathsdark-struct"
        style="font-size: 3.5rem; line-height: 1"
      >
        {rounded(b.points)} / {b.total}
      </div>
      <div class="mt-2 {quiet}">
        {b.percentage} % · {b.correct} réponse{b.correct > 1 ? 's' : ''} correcte{b.correct >
        1
          ? 's'
          : ''}
        {#if b.skipped.length}· {b.skipped.length} passée{b.skipped.length > 1
            ? 's'
            : ''}{/if}
      </div>
    {:else}
      <div
        class="font-light text-coopmaths-struct dark:text-coopmathsdark-struct"
        style="font-size: 3.5rem; line-height: 1"
      >
        {seen} / {paper}
      </div>
      <div class="mt-2 {quiet}">
        correction{seen > 1 ? 's' : ''} vue{seen > 1 ? 's' : ''}
      </div>
    {/if}
    {#if level}<p
        class="mt-1 font-bold text-coopmaths-struct dark:text-coopmathsdark-struct"
      >
        Bilan : {level.name.toLowerCase()}
      </p>{/if}
  </div>

  {#if level?.pause && b.skipped.length === 0}
    <section
      class="flex flex-col gap-2 rounded-2xl p-4 border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest"
      aria-label="Pause"
    >
      <p
        class="flex flex-row items-center gap-2 font-bold text-coopmaths-struct dark:text-coopmathsdark-struct"
      >
        <i
          aria-hidden="true"
          class="bx bx-pause-circle text-xl text-coopmaths-action dark:text-coopmathsdark-action"
        ></i> Pause
      </p>
      <p
        class="whitespace-pre-line text-coopmaths-corpus dark:text-coopmathsdark-corpus"
      >
        {level.pause.texte}
      </p>
      {#if level.pause.ressource?.lien}
        <a
          class="{linkButton} w-full"
          href={level.pause.ressource.lien}
          target="_blank"
          rel="noopener"
        >
          <i aria-hidden="true" class="bx bx-link-external text-xl"></i>
          {level.pause.ressource.titre}
        </a>
      {/if}
    </section>
  {/if}

  <ul class={groupedList}>
    {#each b.byStep as e (e.step)}
      <li
        class="flex flex-row items-center justify-between gap-3 px-4 py-3 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark"
      >
        <span
          class="min-w-0 text-coopmaths-corpus dark:text-coopmathsdark-corpus"
          use:latexTitle={stepTitle(e.step)}
        ></span>
        {#if e.total > 0}
          <span class={scoreBadge((100 * e.points) / e.total)}
            >{rounded(e.points)}/{e.total}</span
          >
        {:else}
          <span class="shrink-0 whitespace-nowrap {quiet}"
            >{e.seen === e.paper ? 'Correction vue' : 'Sur papier'}</span
          >
        {/if}
      </li>
    {/each}
  </ul>

  <div class="flex flex-col gap-3">
    {#if b.skipped.length > 0}
      <button type="button" class="{actionButton} w-full" onclick={onskipped}>
        Répondre aux questions passées ({b.skipped.length})
      </button>
    {:else if level?.next?.open}
      <button type="button" class="{actionButton} w-full" onclick={oncontinue}
        >Continuer : {level.next.name.toLowerCase()}</button
      >
    {/if}
    {#if level?.next && !level.next.open && b.skipped.length === 0}
      <p
        class="text-sm text-center text-coopmaths-corpus dark:text-coopmathsdark-corpus"
        role="status"
      >
        <i
          aria-hidden="true"
          class="bx bx-lock-alt text-coopmaths-action dark:text-coopmathsdark-action"
        ></i>
        Pour ouvrir {level.next.name.toLowerCase()} : {level.next.condition}.
      </p>
      {#if level.ressource?.lien}
        <a
          class="{invertedButton} w-full"
          href={level.ressource.lien}
          target="_blank"
          rel="noopener"
        >
          <i aria-hidden="true" class="bx bx-book-open text-xl"></i> Pour revoir
          : {level.ressource.titre}
        </a>
      {/if}
    {/if}
    <button
      type="button"
      class="{b.skipped.length === 0 && !level?.next?.open
        ? actionButton
        : invertedButton} w-full"
      onclick={onretry}
    >
      {level ? `Refaire : ${level.name.toLowerCase()}` : 'Tout refaire'}
    </button>
    <button type="button" class="{invertedButton} w-full" onclick={onclose}
      >{level ? 'Voir la carte du parcours' : 'Retour au parcours'}</button
    >
  </div>
</div>
