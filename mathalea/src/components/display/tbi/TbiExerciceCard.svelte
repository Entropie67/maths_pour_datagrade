<script lang="ts">
  import seedrandom from 'seedrandom'
  import { onDestroy, onMount, tick } from 'svelte'
  import { SvelteSet } from 'svelte/reactivity'
  import ExerciceSimple from '../../../exercices/ExerciceSimple'
  import {
    mathaleaFormatExercice,
    mathaleaHandleExerciceSimple,
    mathaleaHandleSup,
    mathaleaRenderDiv,
    mathaleaUpdateUrlFromExercicesParams,
  } from '../../../lib/mathalea'
  import { afficheAlerteUniteManquante } from '../../../lib/interactif/afficheScore'
  import {
    exerciceAUneUniteManquante,
    exerciceContientCliqueFigure,
    exerciceInteractif,
    prepareExerciceCliqueFigure,
  } from '../../../lib/interactif/gestionInteractif'
  import { exercicesParams } from '../../../lib/stores/generalStore'
  import {
    activeTbiModalCard,
    TBI_MAX_ZOOM,
    TBI_MIN_QUESTION_SPACING,
    TBI_MIN_ZOOM,
    chooseTbiCardCorrectionMode,
    isTbiCardInteractive,
    setTbiCardCorrectionDetail,
    setTbiCardCorrectionMode,
    tbiCardLastCorrectionMode,
    tbiCardNumber,
    tbiState,
    stepTbiCardsZoom,
  } from '../../../lib/stores/tbiStore'
  import { showTbiToast } from '../../../lib/stores/tbiToastStore'
  import { fitZoom } from '../../../lib/components/tbiFit'
  import type { IExercice } from '../../../lib/types'
  import { loadMathLive } from '../../../modules/loaders'
  import {
    getShortAnswer,
    minimalCorrection,
  } from '../../setup/typst/minimalCorrection'
  import Settings from '../../shared/exercice/exerciceMathalea/exerciceMathaleaVueProf/presentationalComponents/Settings.svelte'
  import { countMathField } from '../../shared/exercice/countMathField'
  import BasicClassicModal from '../../shared/modal/BasicClassicModal.svelte'
  import TbiCardRail from './TbiCardRail.svelte'
  import { tbiButton, tbiSegment, tbiSegmentButton } from './tbiUi'
  import type { TbiCorrectionDetail, TbiCorrectionMode } from './tbiTypes'

  interface Props {
    exercise: IExercice
    paramsIndex: number
    /** Onglets vers lesquels déplacer l'exercice */
    moveTargets?: { value: number | string; label: string }[]
    onMoveTo?: (paramsIndex: number, value: number | string) => void
    /** Replier la carte (disposition libre) */
    onCollapse?: (paramsIndex: number) => void
    /** Demande de suppression, traitée par la vue TBI */
    onDelete?: (paramsIndex: number) => void
  }

  let {
    exercise,
    paramsIndex,
    moveTargets = [],
    onMoveTo,
    onCollapse,
    onDelete,
  }: Props = $props()

  // Réglages de correction portés par tbiState (et non par la carte) pour
  // être partagés dans l'URL et conservés dans la séance enregistrée.
  let correctionMode: TbiCorrectionMode = $derived(
    $tbiState.cards[paramsIndex]?.correctionMode ?? 'hidden',
  )
  let correctionDetail: TbiCorrectionDetail = $derived(
    $tbiState.cards[paramsIndex]?.correctionDetail ?? 'full',
  )
  let lastCorrectionMode = $derived(
    tbiCardLastCorrectionMode($tbiState.cards[paramsIndex]),
  )
  let isSettingsModalDisplayed = $state(false)
  /**
   * Questions dont la correction est révélée une à une, en touchant leur
   * numéro : le prof corrige au rythme de la classe. Propre à l'affichage en
   * cours, oublié à la prochaine version de l'exercice.
   */
  const revealedQuestions = new SvelteSet<number>()

  function toggleRevealedQuestion(index: number) {
    if (revealedQuestions.has(index)) revealedQuestions.delete(index)
    else revealedQuestions.add(index)
  }

  const correctionModes: {
    value: Exclude<TbiCorrectionMode, 'hidden'>
    label: string
  }[] = [
    { value: 'below', label: "Sous l'énoncé" },
    { value: 'perQuestion', label: 'Question par question' },
    { value: 'replace', label: "À la place de l'énoncé" },
    { value: 'modal', label: 'Plein écran' },
  ]

  const isCorrectionShown = $derived(
    correctionMode !== 'hidden' || revealedQuestions.size > 0,
  )

  /** Bouton de correction : le dernier mode choisi, ou masquer ce qui est affiché */
  function toggleCorrection() {
    if (isCorrectionShown) {
      revealedQuestions.clear()
      setCorrectionMode('hidden')
    } else {
      setCorrectionMode(lastCorrectionMode)
    }
  }
  /** Zoom propre à la correction en plein écran, indépendant du zoom de la carte */
  let modalZoom = $state(1.2)

  function setCorrectionMode(mode: TbiCorrectionMode) {
    setTbiCardCorrectionMode(paramsIndex, mode)
    if (mode === 'modal') modalZoom = Math.max(zoom, 1.2)
  }

  /** Correction en plein écran : sa taille remplit la fenêtre */
  let modalEl: HTMLDialogElement | undefined = $state()
  let modalContentEl: HTMLElement | undefined = $state()

  /** Colonnes de la correction en plein écran, quand elle est longue */
  let modalCols = $state(1)
  const MODAL_MIN_ZOOM = 1.25
  const MODAL_MAX_COLS = 3

  /**
   * Une correction courte grandit jusqu'à remplir l'écran. Une correction
   * longue passe sur plusieurs colonnes plutôt que de devenir illisible ; au
   * besoin, le reste se fait défiler.
   */
  async function fitModal() {
    await tick()
    for (let n = 1; n <= MODAL_MAX_COLS; n++) {
      modalCols = n
      modalZoom = await fitZoom({
        start: Math.max(modalZoom, MODAL_MIN_ZOOM),
        bounds: { min: MODAL_MIN_ZOOM, max: TBI_MAX_ZOOM },
        apply: (next) => (modalZoom = next),
        measure: () => ({
          content: modalContentEl?.getBoundingClientRect().height ?? 0,
          available: modalEl
            ? modalEl.clientHeight - (modalContentEl?.offsetTop ?? 0) - 32
            : 0,
        }),
      })
      const available = modalEl
        ? modalEl.clientHeight - (modalContentEl?.offsetTop ?? 0) - 32
        : 0
      const height = modalContentEl?.getBoundingClientRect().height ?? 0
      if (height <= available || !modalContentEl) break
    }
  }

  $effect(() => {
    if (correctionMode === 'modal' && modalContentEl) {
      void correctionDetail
      void fitModal()
    }
  })

  /**
   * Correction telle qu'affichée : entière, ou réduite à ses réponses mises
   * en évidence en orange (`minimalCorrection` la rend inchangée quand elle
   * n'en contient aucune), comme le réglage « Correction minimale » de la
   * vue Typst.
   */
  function displayedCorrection(correction: string, index: number): string {
    return correctionDetail === 'minimal'
      ? minimalCorrection(correction, getShortAnswer(exercise, index))
      : correction
  }

  function zoomModalBy(delta: number) {
    modalZoom = Math.min(
      TBI_MAX_ZOOM,
      Math.max(TBI_MIN_ZOOM, modalZoom + delta),
    )
  }

  // ouvrir la correction en plein écran d'une autre carte ferme celle-ci
  $effect(() => {
    if (correctionMode === 'modal' && $activeTbiModalCard !== paramsIndex) {
      setTbiCardCorrectionMode(paramsIndex, 'hidden')
    }
  })
  /** Incrémenté à chaque régénération pour ré-injecter le HTML */
  let version = $state(0)

  /*
   * `exercise` est un objet mutable, pas un $state : ce qui en dépend est recalé
   * sur `version` après une régénération.
   */
  const hasCorrections = $derived(
    version >= 0 && exercise.listeCorrections.length > 0,
  )
  const hasNewData = $derived(version >= 0 && !exercise.pasDeVersionAleatoire)
  const nbQuestions = $derived(
    version >= 0 && exercise.nbQuestionsModifiable
      ? exercise.nbQuestions
      : undefined,
  )
  /**
   * « Question par question » suppose une correction par question : sinon, une
   * partie de la correction ne serait jamais affichée.
   */
  const shownCorrectionMode: TbiCorrectionMode = $derived(
    version >= 0 &&
      correctionMode === 'perQuestion' &&
      (exercise.listeCorrections.length !== exercise.listeQuestions.length ||
        Boolean(exercise.consigneCorrection))
      ? 'below'
      : correctionMode,
  )

  /**
   * Version interactive de l'exercice, activée à la demande depuis la carte
   * (la vue TBI est non interactive par défaut). Portée par le paramètre `i`
   * de l'URL, comme dans la vue prof : la graine ne change pas, l'énoncé
   * reste donc le même que celui projeté. Un exercice `interactifObligatoire`
   * l'est toujours et n'a pas de bouton de bascule.
   */
  let isInteractif = $derived(
    isTbiCardInteractive(exercise, $exercicesParams[paramsIndex]?.interactif),
  )
  let isExerciceChecked = $state(false)
  let divScore: HTMLDivElement | undefined = $state()
  let buttonScore: HTMLButtonElement | undefined = $state()
  const interactifReady = $derived(
    Boolean(exercise.interactifReady) && !exercise.interactifObligatoire,
  )

  let zoom = $derived($tbiState.cards[paramsIndex]?.zoom ?? 1)
  let cardNumber = $derived(tbiCardNumber($tbiState, paramsIndex))
  /**
   * Nombre de colonnes de la liste de questions de cet exercice (réparties en
   * colonnes CSS à l'intérieur de la carte). Même réglage que le bouton
   * « colonnes » de la vue prof : sérialisé dans l'URL via `cols`.
   */
  let cols = $derived($exercicesParams[paramsIndex]?.cols ?? 1)
  let questionSpacing = $derived(
    $tbiState.cards[paramsIndex]?.questionSpacing ?? 1,
  )

  function setCols(next: number) {
    const clamped = Math.min(4, Math.max(1, next))
    exercicesParams.update((list) => {
      const params = list[paramsIndex]
      if (params) params.cols = clamped === 1 ? undefined : clamped
      return list
    })
    mathaleaUpdateUrlFromExercicesParams()
  }

  function setQuestionSpacing(next: number) {
    tbiState.update((state) => {
      const cardState = state.cards[paramsIndex]
      if (cardState) {
        cardState.questionSpacing = Math.max(TBI_MIN_QUESTION_SPACING, next)
      }
      return state
    })
  }

  let settingsExist = $derived(
    exercise.nbQuestionsModifiable ||
      exercise.correctionDetailleeDisponible ||
      Boolean(exercise.seed) ||
      Boolean(exercise.besoinFormulaireCaseACocher) ||
      Boolean(exercise.besoinFormulaireNumerique) ||
      Boolean(exercise.besoinFormulaireTexte) ||
      Boolean(exercise.besoinFormulaire2CaseACocher) ||
      Boolean(exercise.besoinFormulaire2Numerique) ||
      Boolean(exercise.besoinFormulaire2Texte) ||
      Boolean(exercise.besoinFormulaire3CaseACocher) ||
      Boolean(exercise.besoinFormulaire3Numerique) ||
      Boolean(exercise.besoinFormulaire3Texte) ||
      Boolean(exercise.besoinFormulaire4CaseACocher) ||
      Boolean(exercise.besoinFormulaire4Numerique) ||
      Boolean(exercise.besoinFormulaire4Texte) ||
      Boolean(exercise.besoinFormulaire5CaseACocher) ||
      Boolean(exercise.besoinFormulaire5Numerique) ||
      Boolean(exercise.besoinFormulaire5Texte) ||
      Boolean(exercise.besoinFormulaireNombresCategories) ||
      Boolean(exercise.besoinFormulaireComplexe),
  )

  /**
   * Action de rendu : typeset KaTeX + redimensionnement des figures via
   * mathaleaRenderDiv. Le contenu est ré-injecté par un {#key version} et
   * l'action se ré-exécute au changement de zoom.
   */
  function renderMath(node: HTMLElement, currentZoom: number) {
    mathaleaRenderDiv(node, currentZoom)
    notifyApigeomZoom(node, currentZoom)
    return {
      update(newZoom: number) {
        mathaleaRenderDiv(node, newZoom)
        notifyApigeomZoom(node, newZoom)
      },
    }
  }

  /**
   * apiGeom gère son propre dimensionnement et ne fait pas partie des SVG
   * redimensionnés par resizeContent(). Le conteneur dans le détail de
   * l'événement permet de ne modifier que les figures de cette carte : deux
   * cartes TBI peuvent avoir des zooms différents.
   */
  function notifyApigeomZoom(container: HTMLElement, currentZoom: number) {
    document.dispatchEvent(
      new CustomEvent('zoomChanged', {
        detail: { zoom: currentZoom, container },
      }),
    )
  }

  function openDialog(node: HTMLDialogElement) {
    node.showModal()
    return {
      destroy() {
        node.close()
      },
    }
  }

  async function updateDisplay() {
    if (exercise.seed === undefined) {
      exercise.applyNewSeed?.()
    }
    seedrandom(exercise.seed, { global: true })
    exercise.numeroExercice = paramsIndex
    exercise.interactif = isInteractif
    isExerciceChecked = false
    revealedQuestions.clear()
    if (divScore) divScore.innerHTML = ''
    if (exercise.typeExercice === 'simple') {
      mathaleaHandleExerciceSimple(exercise, isInteractif, paramsIndex)
    } else if (typeof exercise.nouvelleVersionWrapper === 'function') {
      exercise.nouvelleVersionWrapper(paramsIndex)
    }
    exercicesParams.update((list) => {
      if (list[paramsIndex] && list[paramsIndex].alea !== exercise.seed) {
        list[paramsIndex].alea = exercise.seed
      }
      return list
    })
    mathaleaUpdateUrlFromExercicesParams()
    version += 1
    await tick()
    if (isInteractif) await prepareInteractif()
  }

  /** Charge MathLive et prépare les champs de réponse une fois l'énoncé injecté */
  async function prepareInteractif() {
    await loadMathLive()
    if (exerciceContientCliqueFigure(exercise)) {
      prepareExerciceCliqueFigure(exercise)
    }
  }

  async function toggleInteractif() {
    const next = !isInteractif
    exercicesParams.update((list) => {
      if (list[paramsIndex]) list[paramsIndex].interactif = next ? '1' : '0'
      return list
    })
    if (next) {
      // les champs de réponse tiennent lieu d'énoncé : on masque la correction
      // jusqu'à la vérification
      setTbiCardCorrectionMode(paramsIndex, 'hidden')
    }
    await updateDisplay()
  }

  /**
   * Note les réponses saisies puis affiche la correction après chaque
   * question, comme la vue prof après un clic sur « Vérifier ».
   */
  function verifExercice() {
    if (!divScore || !buttonScore) return
    exercise.nbTentativesVerification =
      (exercise.nbTentativesVerification ?? 0) + 1
    if (
      exercise.nbTentativesVerification === 1 &&
      exerciceAUneUniteManquante(exercise)
    ) {
      afficheAlerteUniteManquante(divScore)
      return
    }
    exerciceInteractif(exercise, divScore, buttonScore)
    isExerciceChecked = true
    if (correctionMode === 'hidden') {
      setCorrectionMode('perQuestion')
    }
  }

  async function newData() {
    if (typeof exercise.applyNewSeed === 'function') {
      exercise.applyNewSeed()
    }
    // la correction affichée concernait l'ancienne version
    setTbiCardCorrectionMode(paramsIndex, 'hidden')
    await updateDisplay()
  }

  /** Nouvelles données de cette carte seule : on peut se raviser */
  async function newDataWithUndo() {
    const previousSeed = exercise.seed
    await newData()
    showTbiToast('Nouvelles données', {
      label: 'Annuler',
      run: () => restoreSeed(previousSeed),
    })
  }

  async function restoreSeed(seed: string | undefined) {
    exercise.seed = seed
    await updateDisplay()
  }

  /** Annulation de « Nouvelles données » : les graines de l'onglet sont rétablies */
  function onRestoreSeeds(event: Event) {
    const seeds = (event as CustomEvent<Map<number, string | undefined>>).detail
    if (seeds.has(paramsIndex)) void restoreSeed(seeds.get(paramsIndex))
  }

  /**
   * Certains exercices (ex. « Sélection d'automatismes ») chargent leurs
   * modules de façon asynchrone : `nouvelleVersionWrapper` remplit d'abord
   * `listeQuestions` avec des placeholders « chargement... » puis, une fois
   * les modules téléchargés, régénère l'exercice et notifie via l'événement
   * `updateAsyncEx`. Sans ce listener, la carte reste bloquée sur
   * « chargement... » car `version` n'est jamais réincrémenté.
   */
  function forceUpdate(event?: Event) {
    if (
      event instanceof CustomEvent &&
      event.detail?.exercise &&
      event.detail.exercise !== exercise
    )
      return
    version += 1
  }

  function handleNewSettings(event: CustomEvent) {
    applySettings(event.detail)
  }

  function applySettings(detail: CustomEvent['detail']) {
    exercicesParams.update((list) => {
      const interfaceParams = list[paramsIndex]
      if (!interfaceParams) return list
      if (detail.nbQuestions) {
        exercise.nbQuestions = detail.nbQuestions
        interfaceParams.nbQuestions = exercise.nbQuestions
      }
      if (detail.duration) {
        exercise.duration = detail.duration
        interfaceParams.duration = exercise.duration
      }
      for (const supName of ['sup', 'sup2', 'sup3', 'sup4', 'sup5'] as const) {
        if (detail[supName] !== undefined) {
          exercise[supName] = detail[supName]
          interfaceParams[supName] = mathaleaHandleSup(exercise[supName])
        }
      }
      if (
        detail.versionQcm !== undefined &&
        exercise instanceof ExerciceSimple
      ) {
        exercise.versionQcm = detail.versionQcm
        interfaceParams.versionQcm = exercise.versionQcm ? '1' : '0'
      }
      if (detail.alea !== undefined) {
        exercise.seed = detail.alea
        interfaceParams.alea = exercise.seed
      }
      if (detail.correctionDetaillee !== undefined) {
        exercise.correctionDetaillee = detail.correctionDetaillee
        interfaceParams.cd = exercise.correctionDetaillee ? '1' : '0'
      }
      return list
    })
    updateDisplay()
  }

  /**
   * Un custom element de l'énoncé (le paramétrage de P011 par exemple) peut
   * demander de nouveaux réglages en émettant l'événement DOM `settings`,
   * avec le même `detail` que la fenêtre de réglages.
   */
  function ecouteReglagesDeLEnonce(node: HTMLElement) {
    const ecouteur = (event: Event) => handleNewSettings(event as CustomEvent)
    node.addEventListener('settings', ecouteur)
    return {
      destroy() {
        node.removeEventListener('settings', ecouteur)
      },
    }
  }

  function zoomBy(delta: number) {
    tbiState.update((state) => {
      const cardState = state.cards[paramsIndex]
      if (cardState) {
        cardState.zoom = Math.min(
          TBI_MAX_ZOOM,
          Math.max(TBI_MIN_ZOOM, cardState.zoom + delta),
        )
      }
      return state
    })
  }

  function onNewDataRequest(event: Event) {
    const indices = (event as CustomEvent<number[]>).detail
    if (indices.includes(paramsIndex)) void newData()
  }

  onMount(() => {
    document.addEventListener('tbiNewData', onNewDataRequest)
    document.addEventListener('tbiRestoreSeeds', onRestoreSeeds)
    document.addEventListener('updateAsyncEx', forceUpdate)
    updateDisplay()
  })

  onDestroy(() => {
    document.removeEventListener('tbiNewData', onNewDataRequest)
    document.removeEventListener('tbiRestoreSeeds', onRestoreSeeds)
    document.removeEventListener('updateAsyncEx', forceUpdate)
  })
</script>

<section
  class="relative w-full min-h-52 rounded-lg border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest bg-coopmaths-canvas dark:bg-coopmathsdark-canvas shadow-sm"
  data-tbi-card-content
>
  <!--
    Vue TBI : on n'affiche ni la référence ni le titre de l'exercice, seulement
    son numéro (1-based) dans un rectangle bleuMathalea placé dans une marge à
    gauche, vers le haut de la carte.
  -->
  <div
    class="absolute left-0 top-3 z-10 min-w-9 rounded-r-md bg-coopmaths-struct dark:bg-coopmathsdark-struct px-3 py-1.5 text-center text-lg font-bold leading-none text-coopmaths-canvas dark:text-coopmathsdark-canvas shadow"
    aria-label="Exercice numéro {cardNumber}"
  >
    {cardNumber}
  </div>
  <!-- hors du {#key version} : son panneau reste ouvert quand l'exercice se régénère -->
  <TbiCardRail
    number={cardNumber}
    hasCorrection={hasCorrections &&
      (!isInteractif || isExerciceChecked || correctionMode !== 'hidden')}
    {isCorrectionShown}
    onToggleCorrection={toggleCorrection}
    correctionMode={correctionMode === 'hidden'
      ? lastCorrectionMode
      : correctionMode}
    {correctionModes}
    onCorrectionMode={(mode) => chooseTbiCardCorrectionMode(paramsIndex, mode)}
    {correctionDetail}
    onCorrectionDetail={(detail) =>
      setTbiCardCorrectionDetail(paramsIndex, detail)}
    newDataExists={hasNewData}
    onNewData={newDataWithUndo}
    {nbQuestions}
    onNbQuestions={(value) => applySettings({ nbQuestions: value })}
    {settingsExist}
    onSettings={() => (isSettingsModalDisplayed = true)}
    {interactifReady}
    {isInteractif}
    onToggleInteractif={toggleInteractif}
    {zoom}
    onZoomIn={() => stepTbiCardsZoom([paramsIndex], 1)}
    onZoomOut={() => stepTbiCardsZoom([paramsIndex], -1)}
    {cols}
    onCols={setCols}
    {questionSpacing}
    onQuestionSpacing={setQuestionSpacing}
    onCollapse={onCollapse ? () => onCollapse(paramsIndex) : undefined}
    {moveTargets}
    onMoveTo={(value) => onMoveTo?.(paramsIndex, value)}
    onDelete={onDelete ? () => onDelete(paramsIndex) : undefined}
  />
  {#key version}
    <article
      class="pl-14 pr-3 pt-3 pb-3 text-coopmaths-corpus dark:text-coopmathsdark-corpus"
      use:ecouteReglagesDeLEnonce
    >
      {#if correctionMode !== 'replace'}
        <div use:renderMath={zoom}>
          {#if exercise.consigne && exercise.consigne.length > 0}
            <!--
              overflow-hidden : certains contenus (tableau de numération
              « glisse-nombre ») se rendent à une largeur fixe pensée pour la
              vue prof et débordent du cadre de la carte TBI. On rogne ce qui
              dépasse plutôt que de laisser la figure sortir du cadre.
            -->
            <p class="mt-2 mb-2 overflow-hidden">
              <!-- eslint-disable-next-line svelte/no-at-html-tags -->
              {@html mathaleaFormatExercice(exercise.consigne)}
            </p>
          {/if}
          {#if exercise.introduction}
            <p class="mt-2 mb-2 overflow-hidden">
              <!-- eslint-disable-next-line svelte/no-at-html-tags -->
              {@html exercise.introduction}
            </p>
          {/if}
          <ul
            style="columns: {cols}"
            class="{exercise.listeQuestions.length === 1 ||
            !exercise.listeAvecNumerotation
              ? 'list-none'
              : 'numbered-list'} w-full list-inside marker:text-coopmaths-struct dark:marker:text-coopmathsdark-struct marker:font-bold"
          >
            {#each exercise.listeQuestions as question, i (i)}
              <div
                style="break-inside: avoid; padding-top: {i === 0
                  ? 0.25
                  : 0}rem; padding-bottom: {i ===
                exercise.listeQuestions.length - 1
                  ? 0.25
                  : questionSpacing * 0.5}rem"
              >
                <li
                  id="exercice{paramsIndex}Q{i}"
                  class="overflow-x-auto overflow-y-hidden py-2 -my-2"
                  style="line-height: {exercise.spacing || 1}"
                >
                  {#if exercise.listeQuestions.length > 1 && exercise.listeAvecNumerotation && !isInteractif && exercise.listeCorrections[i]}
                    <!-- par-dessus le numéro : le toucher révèle cette question seule -->
                    <button
                      type="button"
                      class="tbi-question-number"
                      aria-label="Afficher la correction de la question {i + 1}"
                      aria-pressed={revealedQuestions.has(i)}
                      title="Afficher la correction de cette question"
                      onclick={() => toggleRevealedQuestion(i)}
                    ></button>
                  {/if}
                  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                  {@html mathaleaFormatExercice(question)}
                </li>
                {#if (shownCorrectionMode === 'perQuestion' || revealedQuestions.has(i)) && exercise.listeCorrections[i]}
                  <!--
                    Recalé sur `correctionDetail` : le passage de la correction
                    complète à la correction minimale change le HTML injecté,
                    l'action de rendu (typesetting KaTeX) doit donc être
                    ré-exécutée sur le nouveau contenu.
                  -->
                  {#key correctionDetail}
                    <div
                      class="relative border-l-coopmaths-struct dark:border-l-coopmathsdark-struct border-l-[3px] mt-6 mb-4 py-2 pl-4"
                      use:renderMath={zoom}
                    >
                      <div
                        class="absolute flex flex-row py-[1.5px] px-3 rounded-t-md justify-center items-center -left-0.75 -top-3.75 bg-coopmaths-struct dark:bg-coopmathsdark-struct font-semibold text-xs text-coopmaths-canvas dark:text-coopmathsdark-canvas"
                      >
                        Correction
                      </div>
                      <div
                        class="overflow-x-auto"
                        style="line-height: {exercise.spacingCorr || 1}"
                      >
                        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                        {@html mathaleaFormatExercice(
                          displayedCorrection(exercise.listeCorrections[i], i),
                        )}
                      </div>
                    </div>
                  {/key}
                {/if}
              </div>
            {/each}
          </ul>
        </div>
      {/if}
      {#if shownCorrectionMode === 'below' || shownCorrectionMode === 'replace'}
        {#key correctionDetail}
          <div
            class="relative border-l-coopmaths-struct dark:border-l-coopmathsdark-struct border-l-[3px] mt-6 py-2 pl-4"
            use:renderMath={zoom}
          >
            <div
              class="absolute flex flex-row py-[1.5px] px-3 rounded-t-md justify-center items-center -left-0.75 -top-3.75 bg-coopmaths-struct dark:bg-coopmathsdark-struct font-semibold text-xs text-coopmaths-canvas dark:text-coopmathsdark-canvas"
            >
              Correction
            </div>
            {#if exercise.consigneCorrection && exercise.consigneCorrection.length > 0}
              <p class="mb-2 font-light">
                <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                {@html exercise.consigneCorrection}
              </p>
            {/if}
            <ul
              class="{exercise.listeCorrections.length === 1 ||
              !exercise.listeAvecNumerotation
                ? 'list-none'
                : 'numbered-list'} w-full list-inside marker:text-coopmaths-struct dark:marker:text-coopmathsdark-struct marker:font-bold"
            >
              {#each exercise.listeCorrections as correction, i (i)}
                <div>
                  <li
                    class="py-1 overflow-x-auto"
                    style="line-height: {exercise.spacingCorr || 1}"
                  >
                    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                    {@html mathaleaFormatExercice(
                      displayedCorrection(correction, i),
                    )}
                  </li>
                </div>
              {/each}
            </ul>
          </div>
        {/key}
      {/if}
    </article>

    {#if isInteractif && correctionMode !== 'replace'}
      <div class="flex flex-row items-center gap-4 pl-14 pb-3">
        {#if !isExerciceChecked}
          <!-- id cliqué en fin de partie par les composants de jeu (labyrinthe, Juniper Green) -->
          <button
            id="buttonScoreEx{paramsIndex}"
            type="submit"
            bind:this={buttonScore}
            class="inline-flex items-center min-h-12 px-6 rounded-xl shadow-md text-lg font-semibold text-coopmaths-canvas dark:text-coopmathsdark-canvas bg-coopmaths-action hover:bg-coopmaths-action-lightest dark:bg-coopmathsdark-action dark:hover:bg-coopmathsdark-action-lightest"
            onclick={verifExercice}
          >
            Vérifier {countMathField(exercise) > 1
              ? 'les réponses'
              : 'la réponse'}
          </button>
        {/if}
        <div bind:this={divScore}></div>
      </div>
    {/if}

    {#if correctionMode === 'modal'}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
      <dialog
        bind:this={modalEl}
        class="m-0 w-screen h-screen max-w-none max-h-none p-6 overflow-y-auto
          text-coopmaths-corpus dark:text-coopmathsdark-corpus
          bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
        use:openDialog
        onclick={(event) => {
          if (event.target === event.currentTarget) setCorrectionMode('hidden')
        }}
        onclose={() => setCorrectionMode('hidden')}
      >
        <div class="flex flex-row flex-wrap items-center gap-2 mb-4 text-lg">
          <h2
            class="flex-1 text-2xl font-bold text-coopmaths-struct dark:text-coopmathsdark-struct"
          >
            Correction de l'exercice {cardNumber}
          </h2>
          <!-- le menu de la carte est masqué derrière la fenêtre : le détail reste réglable ici -->
          <div class={tbiSegment} aria-label="Détail de la correction">
            <button
              type="button"
              class={tbiSegmentButton(correctionDetail === 'full')}
              aria-pressed={correctionDetail === 'full'}
              title="Afficher la correction entière"
              onclick={() => setTbiCardCorrectionDetail(paramsIndex, 'full')}
            >
              Complète
            </button>
            <button
              type="button"
              class={tbiSegmentButton(correctionDetail === 'minimal')}
              aria-pressed={correctionDetail === 'minimal'}
              title="Quand une correction met sa réponse en évidence, n'afficher que cette réponse"
              onclick={() => setTbiCardCorrectionDetail(paramsIndex, 'minimal')}
            >
              Minimale
            </button>
          </div>
          <button
            type="button"
            class={tbiButton(false, 'text-xl')}
            title="Réduire"
            aria-label="Réduire la correction"
            onclick={() => zoomModalBy(-0.25)}
          >
            A−
          </button>
          <span class="w-20 text-center font-bold tabular-nums"
            >{Math.round(modalZoom * 100)}&nbsp;%</span
          >
          <button
            type="button"
            class={tbiButton(false, 'text-xl')}
            title="Agrandir"
            aria-label="Agrandir la correction"
            onclick={() => zoomModalBy(0.25)}
          >
            A+
          </button>
          <button
            type="button"
            class={tbiButton(false, '')}
            title="Fermer"
            aria-label="Fermer la correction"
            onclick={() => setCorrectionMode('hidden')}
          >
            <i class="bx bx-x text-3xl"></i>
          </button>
        </div>
        {#key correctionDetail}
          <div bind:this={modalContentEl} use:renderMath={modalZoom}>
            <div style="columns: {modalCols}; column-gap: 3rem">
              {#if exercise.consigneCorrection && exercise.consigneCorrection.length > 0}
                <p class="mb-2 font-light">
                  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                  {@html exercise.consigneCorrection}
                </p>
              {/if}
              <ul
                class="{exercise.listeCorrections.length === 1 ||
                !exercise.listeAvecNumerotation
                  ? 'list-none'
                  : 'numbered-list'} w-full list-inside marker:text-coopmaths-struct dark:marker:text-coopmathsdark-struct marker:font-bold"
              >
                {#each exercise.listeCorrections as correction, i (i)}
                  <div style="break-inside: avoid">
                    <li
                      class="py-1"
                      style="line-height: {exercise.spacingCorr || 1}"
                    >
                      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                      {@html mathaleaFormatExercice(
                        displayedCorrection(correction, i),
                      )}
                    </li>
                  </div>
                {/each}
              </ul>
            </div>
          </div>
        {/key}
      </dialog>
    {/if}
  {/key}

  {#if isSettingsModalDisplayed}
    <BasicClassicModal bind:isDisplayed={isSettingsModalDisplayed}>
      <span slot="header"
        >{exercise.id?.replace('.js', '').replace('.ts', '') ?? ''}</span
      >
      <div slot="content" class="text-left">
        <Settings
          exercice={exercise}
          exerciceIndex={paramsIndex}
          inModal={true}
          on:settings={handleNewSettings}
          on:clickSettings={() => (isSettingsModalDisplayed = false)}
        />
      </div>
    </BasicClassicModal>
  {/if}
</section>

<style>
  :global(.dark) section :global(.numbered-list > div > li::before) {
    color: var(--color-coopmathsdark-struct);
  }
  /*
   * Le zoom de la carte agrandit la police, pas les marges fixes en rem de
   * app.css : le repère « a) » (en dehors de la liste) dépasserait alors de
   * la marge et serait rogné par le overflow de la question. La marge suit
   * donc la taille du texte.
   */
  section :global(ol.alpha),
  section :global(ol.Alpha),
  section :global(ol.nombres) {
    margin-left: max(1.5rem, 1.25em);
  }
  /* Zone tactile posée sur le numéro de la question, sans changer la mise en page */
  .tbi-question-number {
    position: absolute;
    left: 0;
    top: 0.25rem;
    width: 2.25em;
    height: 1.6em;
    border-radius: 0.375rem;
    cursor: pointer;
  }
  .tbi-question-number:hover,
  .tbi-question-number[aria-pressed='true'] {
    background: color-mix(
      in srgb,
      var(--color-coopmaths-struct) 18%,
      transparent
    );
  }
</style>
