<script lang="ts">
  // Aperçu d'une fiche telle que l'élève la lit dans l'application : exemples
  // dévoilés étape par étape, questions « À toi » avec retour immédiat.
  import { blockProblem } from '../../../lib/parcours/lessonFile'
  import { richText, richTitle } from '../../../lib/parcours/lessonText'
  import type { Lesson } from '../../../lib/parcours/parcoursTypes'
  import LessonGraph from './LessonGraph.svelte'

  let {
    lesson,
    active = null,
    onselect,
  }: {
    lesson: Lesson
    active?: number | null // bloc ouvert dans l'éditeur : l'aperçu le montre
    onselect?: (k: number) => void // toucher un bloc l'ouvre dans l'éditeur
  } = $props()

  let root: HTMLElement | undefined = $state()
  $effect(() => {
    if (active === null) return
    root
      ?.querySelector(`[data-bloc="${active}"]`)
      ?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  })

  const label =
    'text-sm font-bold text-coopmaths-struct-light dark:text-coopmathsdark-struct-light'
  const box =
    'flex flex-col gap-3 rounded-2xl p-4 border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest'
  const choice =
    'flex flex-row items-center justify-between gap-2 w-full px-4 py-3 text-left border-b last:border-b-0 border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest'
  const verdict = (ok: boolean) =>
    `shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
      ok
        ? 'bg-coopmaths-action dark:bg-coopmathsdark-action text-coopmaths-canvas dark:text-coopmathsdark-canvas'
        : 'bg-coopmaths-warn-dark dark:bg-coopmathsdark-warn-dark text-coopmaths-canvas dark:text-coopmathsdark-canvas'
    }`
  const link =
    'self-start text-sm font-semibold text-coopmaths-action dark:text-coopmathsdark-action'

  let steps: Record<number, number> = $state({})
  let picked: Record<number, number> = $state({})
  let typed: Record<number, string> = $state({})
  let checked: Record<number, boolean> = $state({})
  const readNumber = (t: string) =>
    Number(t.trim().replace(/\s/g, '').replace(',', '.').replace('−', '-'))
  const right = (expected: number, t: string) =>
    t.trim() !== '' &&
    Math.abs(readNumber(t) - expected) <= 1e-6 * Math.max(1, Math.abs(expected))
</script>

<article
  bind:this={root}
  class="flex flex-col gap-5 text-coopmaths-corpus dark:text-coopmathsdark-corpus"
  aria-label="Aperçu de la fiche"
>
  <h2
    class="text-xl font-bold text-coopmaths-struct dark:text-coopmathsdark-struct"
  >
    {lesson.titre || 'Sans titre'}
  </h2>
  {#each lesson.blocs as block, i (i)}
    {@const problem = blockProblem(block)}
    <div
      class="relative rounded-2xl {problem
        ? 'ring-2 ring-coopmaths-warn-dark dark:ring-coopmathsdark-warn-dark ring-offset-4 ring-offset-coopmaths-canvas dark:ring-offset-coopmathsdark-canvas'
        : ''}"
      onfocusin={() => onselect?.(i)}
      onpointerdown={() => onselect?.(i)}
      role="presentation"
      data-bloc={i}
    >
      {#if block.type === 'texte'}
        <div class="leading-relaxed flex flex-col gap-2">
          {@html richText(block.texte)}
        </div>
      {:else if block.type === 'retenir'}
        <section
          class="flex flex-col gap-2 rounded-2xl p-4 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark"
        >
          <h3 class={label}>{@html richTitle(block.titre || 'À retenir')}</h3>
          <div class="leading-relaxed flex flex-col gap-2">
            {@html richText(block.texte)}
          </div>
        </section>
      {:else if block.type === 'exemple'}
        {@const seen = steps[i] ?? 0}
        <section class={box}>
          <h3 class={label}>{@html richTitle(block.titre || 'Exemple')}</h3>
          <div class="leading-relaxed">{@html richText(block.enonce)}</div>
          {#each block.etapes.slice(0, seen) as e, k (k)}
            <div
              class="leading-relaxed border-l-4 border-coopmaths-struct-light dark:border-coopmathsdark-struct-light pl-4"
            >
              {@html richText(e)}
            </div>
          {/each}
          {#if seen < block.etapes.length}
            <button
              type="button"
              class={link}
              onclick={() => (steps[i] = seen + 1)}
              >{seen === 0
                ? 'Voir la première étape'
                : 'Étape suivante'}</button
            >
          {:else if block.etapes.length}
            <button type="button" class={link} onclick={() => (steps[i] = 0)}
              >Recommencer</button
            >
          {/if}
        </section>
      {:else if block.type === 'question'}
        <section class={box}>
          <h3 class={label}>À toi</h3>
          <div class="leading-relaxed">{@html richText(block.enonce)}</div>
          {#if block.choix}
            <div
              class="flex flex-col rounded-xl overflow-hidden border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest"
              role="radiogroup"
              aria-label="Réponses proposées"
            >
              {#each block.choix as c, k (k)}
                <button
                  type="button"
                  role="radio"
                  aria-checked={picked[i] === k}
                  class={choice}
                  onclick={() => (picked[i] = k)}
                >
                  <span>{@html richText(c)}</span>
                  {#if picked[i] === k}
                    <span class={verdict(k === block.bonne)}
                      >{k === block.bonne ? 'Correcte' : 'Incorrecte'}</span
                    >
                  {/if}
                </button>
              {/each}
            </div>
            {#if picked[i] !== undefined}
              <div class="leading-relaxed" aria-live="polite">
                {@html richText(block.explication)}
              </div>
            {/if}
          {:else if block.reponse !== undefined}
            {@const expected = block.reponse}
            <form
              class="flex flex-row items-end gap-3"
              onsubmit={(e) => {
                e.preventDefault()
                checked[i] = true
              }}
            >
              <label class="flex-1 flex flex-col gap-1 text-sm font-light">
                Ta réponse
                <input
                  type="text"
                  inputmode="decimal"
                  autocomplete="off"
                  bind:value={typed[i]}
                  oninput={() => (checked[i] = false)}
                  class="block w-full text-base border h-10 px-2 rounded-lg border-coopmaths-action dark:border-coopmathsdark-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas focus:outline-0"
                />
              </label>
              <button
                type="submit"
                class="h-10 px-4 rounded-lg font-semibold border border-coopmaths-action dark:border-coopmathsdark-action text-coopmaths-action dark:text-coopmathsdark-action"
                >Vérifier</button
              >
            </form>
            {#if checked[i]}
              {@const ok = right(expected, typed[i] ?? '')}
              <div class="flex flex-col gap-2" aria-live="polite">
                <span class="self-start {verdict(ok)}"
                  >{ok ? 'Correcte' : 'Incorrecte'}</span
                >
                <div class="leading-relaxed">
                  {@html richText(block.explication)}
                </div>
              </div>
            {/if}
          {/if}
        </section>
      {:else if block.type === 'graphique'}
        <LessonGraph graph={block} />
      {:else if block.type === 'image'}
        <figure class="flex flex-col gap-2 m-0">
          {#if block.src}
            <img
              src={block.src}
              alt={block.alt}
              class="w-full h-auto rounded-xl"
            />
          {/if}
          {#if block.legende}
            <figcaption
              class="text-sm font-light text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light"
            >
              {@html richText(block.legende)}
            </figcaption>
          {/if}
        </figure>
      {:else if block.type === 'lien'}
        <a
          href={block.lien || undefined}
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center justify-center gap-2 w-full min-h-11 rounded-lg font-semibold border border-coopmaths-action dark:border-coopmathsdark-action text-coopmaths-action dark:text-coopmathsdark-action"
        >
          <i class="bx bx-link-external" aria-hidden="true"></i>
          {block.titre || 'Lien'}
        </a>
      {/if}
      {#if problem}
        <p
          class="mt-2 text-sm text-coopmaths-warn-dark dark:text-coopmathsdark-warn-dark"
        >
          <i class="bx bx-error-circle" aria-hidden="true"></i>
          {problem}
        </p>
      {/if}
    </div>
  {/each}
</article>
