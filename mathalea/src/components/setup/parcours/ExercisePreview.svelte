<script lang="ts">
  import { afficher, initialiser, preparerExercice } from '../../../moteur'
  import type { Step } from '../../../lib/parcours/parcoursTypes'

  /**
   * Aperçu d'un exercice avec ses réglages : les questions telles que l'élève
   * les verra dans l'application (même moteur), et une autre série au besoin.
   */
  let { step }: { step: Step } = $props()

  let box: HTMLDivElement | undefined = $state()
  let error = $state('')
  let draw = $state(0)
  // Numéro de champs propre à l'aperçu : il ne gêne aucun exercice affiché ailleurs
  const NUMBER = 950

  $effect(() => {
    const params = {
      uuid: step.uuid,
      id: step.id,
      nbQuestions: step.nbQuestions,
      sup: step.sup,
      sup2: step.sup2,
      sup3: step.sup3,
      sup4: step.sup4,
    }
    void draw
    const target = box
    if (!target) return
    let cancelled = false
    error = ''
    ;(async () => {
      try {
        await initialiser()
        const e = await preparerExercice(params, NUMBER)
        if (cancelled) return
        const context = e.questions[0]?.contexte ?? ''
        const numbered =
          e.questions.length > 1 && e.interne.listeAvecNumerotation !== false
        const tag = numbered ? 'ol' : 'ul'
        const classes = numbered ? 'list-decimal pl-6' : 'list-none'
        target.innerHTML = `${context ? `<div class="mb-2">${context}</div>` : ''}<${tag} class="${classes} flex flex-col gap-3">${e.questions
          .map((q) => `<li>${q.enonce}</li>`)
          .join('')}</${tag}>`
        await afficher(target)
      } catch (err) {
        if (!cancelled) error = `Aperçu impossible : ${(err as Error).message}`
      }
    })()
    return () => {
      cancelled = true
    }
  })
</script>

<div class="flex flex-col gap-2">
  <div class="flex flex-row items-center justify-between">
    <span
      class="text-sm font-semibold text-coopmaths-struct dark:text-coopmathsdark-struct"
      >Aperçu élève</span
    >
    <button
      type="button"
      class="inline-flex items-center gap-1 text-sm font-semibold text-coopmaths-action dark:text-coopmathsdark-action"
      onclick={() => draw++}
    >
      <i class="bx bx-refresh text-lg" aria-hidden="true"></i> Autres valeurs
    </button>
  </div>
  {#if error}<p
      class="text-sm text-coopmaths-warn-dark dark:text-coopmathsdark-warn-dark"
    >
      {error}
    </p>{/if}
  <div
    bind:this={box}
    class="rounded-lg p-4 bg-coopmaths-canvas dark:bg-coopmathsdark-canvas text-coopmaths-corpus dark:text-coopmathsdark-corpus overflow-x-auto"
  ></div>
</div>
