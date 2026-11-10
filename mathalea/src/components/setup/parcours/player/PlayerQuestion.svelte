<script lang="ts">
  /**
   * Une question dans l'aperçu élève : affichage, brouillon, vérification,
   * correction. Repris de l'application MathALÉA (BlocQuestion.svelte), dont
   * la mise en forme vient de Question.svelte (vue élève du site).
   */
  import { onDestroy, onMount, tick } from 'svelte'
  import {
    afficher,
    ajusterFigures,
    ecrireReponses,
    verifier,
    type ExercicePrepare,
    type ResultatVerification,
  } from '../../../../moteur'
  import type { Attempt } from '../../../../lib/parcours/parcoursPlayer'
  import { invertedButton, linkButton } from './playerClasses'

  let {
    exercise,
    question,
    withContext,
    checkOnMount = false,
    withButton = false,
    attempt,
    draft,
    onchecked,
    ondraft,
    onenter,
    oninput,
    correctionSeen = false,
    onseecorrection,
    answered = $bindable(false),
  }: {
    exercise: ExercicePrepare
    question: number
    withContext: boolean
    checkOnMount?: boolean // tentative soumise : vérifiée dès l'affichage
    withButton?: boolean // bouton « Vérifier » sous la question
    attempt: Attempt | undefined
    draft: Record<string, string> | undefined
    onchecked: (r: ResultatVerification) => void
    ondraft: (inputs: Record<string, string>) => void
    onenter?: () => void
    oninput?: () => void
    correctionSeen?: boolean // question sans réponse à saisir : correction déjà ouverte
    onseecorrection?: () => void
    answered?: boolean
  } = $props()

  let zone: HTMLDivElement
  let correctionZone: HTMLDivElement | undefined = $state()
  let result: ResultatVerification | null = $state(null)
  // Question à faire sur papier : l'élève ouvre la correction lui-même
  let seen = $state(false)
  let error = $state('')
  let timer: ReturnType<typeof setTimeout> | undefined
  let pending = false
  const q = $derived(exercise.questions[question])
  // Case vide qui fait partie de la bonne réponse (moteurs récents seulement)
  const emptyAccepted = $derived(
    (q as { videAccepte?: boolean }).videAccepte === true,
  )

  // Champ placé dans une figure (MetaInteractif2d) : la réponse est le trou champ1
  const FIGURE_FIELD = /^(MetaInteractif2dEx\d+Q\d+)field\d+$/
  type PromptField = HTMLElement & {
    value?: string
    getPromptValue?: (p: string) => string
    getPrompts?: () => string[]
  }

  function holeOf(field: PromptField) {
    if (field.isConnected && typeof field.getPromptValue === 'function')
      return field.getPromptValue('champ1') ?? ''
    return (
      /\\placeholder\[champ1\](?:\[[^\]]*\])*\{([^{}]*)\}/.exec(
        field.value ?? '',
      )?.[1] ?? ''
    )
  }

  /** Champ à trous dont aucun trou n'est rempli : sa valeur LaTeX n'est jamais vide */
  function emptyHoles(field: PromptField) {
    const holes = field.isConnected ? (field.getPrompts?.() ?? []) : []
    return (
      holes.length > 0 && holes.every((t) => !field.getPromptValue?.(t)?.trim())
    )
  }

  // Éléments de réponse qui ne sont ni un champ ni une case
  const ANSWER_ELEMENTS =
    'liste-deroulante[id], multi-mathfield[id], drag-and-drop[id], svg-selection[id]'
  const READ = new Set([
    'MATH-FIELD',
    'INPUT',
    'TEXTAREA',
    'SELECT',
    'LISTE-DEROULANTE',
    'MULTI-MATHFIELD',
    'DRAG-AND-DROP',
    'SVG-SELECTION',
    'MATHALEA-QCM',
  ])
  const ANSWER_ID = /Ex\d+[QF]\d+/
  const FEEDBACK_ID = /^(resultatCheck|feedback)/

  // Toucher une figure, un point… : ces réponses ne se lisent pas toutes, le toucher suffit
  let touched = false
  function onInteraction(e: Event) {
    if (result) return
    const path = e
      .composedPath()
      .filter((n): n is Element => n instanceof Element)
    if (path.some((n) => READ.has(n.tagName))) return
    if (!path.some((n) => ANSWER_ID.test(n.id) && !FEEDBACK_ID.test(n.id)))
      return
    touched = true
    setTimeout(() => zone?.isConnected && onInput(new Event('input')))
  }

  function filled(v: unknown): boolean {
    if (typeof v === 'string') {
      if (v.trim() === '') return false
      try {
        const x: unknown = JSON.parse(v)
        if (x !== null && typeof x === 'object') return filled(x)
      } catch {
        /* texte simple */
      }
      return true
    }
    if (Array.isArray(v)) return v.some(filled)
    if (v !== null && typeof v === 'object')
      return Object.values(v).some(filled)
    return v != null
  }

  function readInputs(): Record<string, string> {
    const inputs: Record<string, string> = {}
    const figures: Record<string, Record<string, string>> = {}
    for (const element of zone.querySelectorAll<
      HTMLElement & { value?: unknown }
    >(ANSWER_ELEMENTS)) {
      const v = element.value
      if ((typeof v === 'string' && filled(v)) || (typeof v === 'number' && v))
        inputs[element.id] = String(v)
    }
    for (const field of zone.querySelectorAll<HTMLElement>(
      'math-field[id], input[id]',
    )) {
      const figure = FIGURE_FIELD.exec(field.id)
      if (figure) {
        const v = holeOf(field as PromptField)
        if (v.trim() !== '') (figures[figure[1]] ??= {})[field.id] = v
      } else if (
        field instanceof HTMLInputElement &&
        field.type === 'checkbox'
      ) {
        if (field.checked) inputs[field.id] = '1'
      } else {
        const v = (field as HTMLInputElement).value
        if (
          typeof v === 'string' &&
          v.trim() !== '' &&
          !emptyHoles(field as PromptField)
        )
          inputs[field.id] = v
      }
    }
    for (const [key, values] of Object.entries(figures))
      inputs[key] = JSON.stringify(values)
    return inputs
  }

  // Glisser-déposer : aucune saisie n'est signalée, on relit après le dépôt
  function onDrop() {
    setTimeout(() => zone?.isConnected && onInput(new Event('input')))
  }

  // Dans un trou, MathLive n'envoie pas « input » : on relit juste après
  function onHoleInput(e: Event) {
    const type = e.type === 'beforeinput' ? 'input' : 'change'
    setTimeout(() => zone?.isConnected && onInput(new Event(type)))
  }

  function onInput(e: Event) {
    if (result) return
    const target = e.target
    if (
      target instanceof HTMLElement &&
      !target.id &&
      ANSWER_ID.test(target.parentElement?.closest('[id]')?.id ?? '')
    )
      touched = true
    answered = touched || emptyAccepted || Object.keys(readInputs()).length > 0
    if (e.type === 'input') oninput?.()
    clearTimeout(timer)
    pending = true
    timer = setTimeout(sendDraft, 350)
  }

  function sendDraft() {
    clearTimeout(timer)
    if (!pending || result) return
    pending = false
    ondraft(readInputs())
  }

  function onKey(e: KeyboardEvent) {
    if (e.key !== 'Enter') return
    e.preventDefault()
    if (onenter) onenter()
    else if (!result && answered) void check()
  }

  async function seeCorrection() {
    seen = true
    onseecorrection?.()
    await showCorrection()
  }

  async function showCorrection() {
    // Message de retour écrit à la vérification : ses formules ne sont pas encore rendues
    for (const feedback of zone.querySelectorAll<HTMLElement>(
      '[id^="feedbackEx"]',
    ))
      if (feedback.textContent?.includes('$')) await afficher(feedback)
    await tick()
    if (correctionZone) {
      correctionZone.innerHTML = q.correction
      await afficher(correctionZone)
    }
  }

  export function focus(scroll = false) {
    if (scroll) zone?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    requestAnimationFrame(() => {
      if (!zone?.isConnected) return
      const fields = [
        ...zone.querySelectorAll<HTMLElement>(
          'math-field, input:not([type=checkbox]), multi-mathfield',
        ),
      ]
        .flatMap((c) =>
          c.tagName === 'MULTI-MATHFIELD'
            ? [
                ...(c.shadowRoot?.querySelectorAll<HTMLElement>('math-field') ??
                  []),
              ]
            : [c],
        )
        .filter((c) => c.isConnected)
      const empty = fields.find((c) => !(c as HTMLInputElement).value?.trim())
      try {
        ;(empty ?? fields[0])?.focus({ preventScroll: !scroll })
      } catch {
        /* champ en cours de remplacement */
      }
    })
  }

  /** État de la question pour le garde-fou de la séance */
  export const inputState = (): 'checked' | 'typed' | 'empty' =>
    result
      ? 'checked'
      : touched || emptyAccepted || Object.keys(readInputs()).length
        ? 'typed'
        : 'empty'

  export async function check() {
    if (result || !q.interactive) return
    ;(document.activeElement as HTMLElement | null)?.blur?.()
    clearTimeout(timer)
    pending = false
    result = verifier(exercise, question)
    onchecked(result)
    await showCorrection()
  }

  onMount(async () => {
    zone.innerHTML =
      (withContext && q.contexte.trim()
        ? `<div class="mb-4">${q.contexte}</div>`
        : '') + `<div>${q.enonce}</div>`
    await afficher(zone)
    if (attempt) {
      // Déjà vérifiée : réponse, smiley et correction reviennent
      await ecrireReponses(attempt.answers)
      await tick()
      try {
        verifier(exercise, question)
      } catch {
        /* rien */
      }
      result = {
        juste: attempt.correct,
        points: attempt.points,
        total: attempt.total,
        retour: '',
        reponses: attempt.answers,
      }
      await showCorrection()
      return
    }
    if (draft && Object.keys(draft).length) {
      await ecrireReponses(draft)
      await tick()
      answered = emptyAccepted || Object.keys(readInputs()).length > 0
    } else if (emptyAccepted) answered = true
    if (!q.interactive && correctionSeen) {
      seen = true
      await showCorrection()
    }
    if (checkOnMount) {
      try {
        await check()
      } catch (e) {
        error = `Cette question ne peut pas être vérifiée (${(e as Error).message}).`
      }
    }
  })

  const onResize = () => {
    if (zone) ajusterFigures(zone)
    if (correctionZone) ajusterFigures(correctionZone)
  }
  onMount(() => {
    const z = zone
    z.addEventListener('selection-change', onHoleInput)
    for (const type of ['drop', 'dragend', 'touchend'])
      z.addEventListener(type, onDrop)
    for (const type of ['click', 'pointerup', 'keyup'])
      z.addEventListener(type, onInteraction)
    const observer = new ResizeObserver(onResize)
    observer.observe(z)
    return () => {
      observer.disconnect()
      z.removeEventListener('selection-change', onHoleInput)
      for (const type of ['drop', 'dragend', 'touchend'])
        z.removeEventListener(type, onDrop)
      for (const type of ['click', 'pointerup', 'keyup'])
        z.removeEventListener(type, onInteraction)
    }
  })

  // Question quittée avant le délai : le brouillon part quand même, après le démontage
  onDestroy(() => {
    clearTimeout(timer)
    if (!pending || result) return
    const inputs = readInputs()
    queueMicrotask(() => ondraft(inputs))
  })
</script>

<div class="max-w-full grid grid-cols-1 auto-cols-min gap-4 mb-3 lg:mb-4">
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    bind:this={zone}
    class="question-eleve text-coopmaths-corpus dark:text-coopmathsdark-corpus"
    oninput={onInput}
    onchange={onInput}
    onbeforeinput={onHoleInput}
    onkeydown={onKey}
  ></div>
  {#if withButton && !result && q.interactive}
    <div>
      <button
        type="button"
        class={invertedButton}
        style="min-width: 9rem"
        disabled={!answered}
        onclick={async () => {
          try {
            await check()
          } catch (e) {
            error = `Cette question ne peut pas être vérifiée (${(e as Error).message}).`
          }
        }}
      >
        <i aria-hidden="true" class="bx bx-check-circle text-base"></i>
        Vérifier
      </button>
    </div>
  {/if}
  {#if !q.interactive && !seen}
    <div>
      <button type="button" class="{linkButton} -ml-3" onclick={seeCorrection}>
        <i aria-hidden="true" class="bx bx-show text-base"></i>
        Voir la correction
      </button>
    </div>
  {/if}
  {#if error}
    <p
      class="font-bold text-coopmaths-action dark:text-coopmathsdark-action"
      role="alert"
    >
      {error}
    </p>
  {/if}
  {#if result && result.total > 1}
    <span
      class="text-sm font-bold text-coopmaths-struct dark:text-coopmathsdark-struct"
    >
      Score : {result.points} / {result.total}
    </span>
  {/if}
</div>

{#if result || seen}
  <!-- Bloc Correction de la vue élève -->
  <div
    class="relative self-start border-l-coopmaths-struct dark:border-l-coopmathsdark-struct border-l-[3px] text-coopmaths-corpus dark:text-coopmathsdark-corpus mt-6 mb-4 ml-0 py-2 pl-4"
  >
    <div
      class="overflow-x-auto overflow-y-hidden py-1"
      bind:this={correctionZone}
    ></div>
    <div
      class="absolute flex flex-row py-[1.5px] px-3 rounded-t-md justify-center items-center -left-0.75 -top-3.75 bg-coopmaths-struct dark:bg-coopmathsdark-struct font-semibold text-xs text-coopmaths-canvas dark:text-coopmathsdark-canvas"
    >
      Correction
    </div>
    <div
      class="absolute border-coopmaths-struct dark:border-coopmathsdark-struct bottom-0 left-0 border-b-[3px] w-4"
    ></div>
  </div>
{/if}
