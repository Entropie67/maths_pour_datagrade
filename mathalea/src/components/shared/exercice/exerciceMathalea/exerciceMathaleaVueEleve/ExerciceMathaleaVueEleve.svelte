<script lang="ts">
  import seedrandom from 'seedrandom'
  import { afterUpdate, beforeUpdate, onDestroy, onMount } from 'svelte'
  import { get } from 'svelte/store'
  import {
    ecouteSolveursTermines,
    tousLesSolveursSontTermines,
  } from '../../../../../lib/customElements/solveurTermine'
  import type TypeExercice from '../../../../../exercices/Exercice'
  import { sendToCapytaleSaveStudentAssignment } from '../../../../../lib/handleCapytale'
  import {
    afficheAlerteUniteManquante,
    afficheScore,
  } from '../../../../../lib/interactif/afficheScore'
  import {
    exerciceAUneUniteManquante,
    exerciceContientCliqueFigure,
    exerciceInteractif,
    prepareExerciceCliqueFigure,
    verifQuestionExercice,
    type ResultOfQuestionInteractive,
  } from '../../../../../lib/interactif/gestionInteractif'
  import { pointsMaxExercice } from '../../../../../lib/interactif/baremeExercice'
  import { decodeAnswers } from '../../../../../lib/lms/answersCodec'
  import {
    mathaleaFormatExercice,
    mathaleaGenerateSeed,
    mathaleaHandleExerciceSimple,
    mathaleaHandleSup,
    mathaleaRenderDiv,
    mathaleaUpdateUrlFromExercicesParams,
  } from '../../../../../lib/mathalea'
  import { mathaleaWriteStudentPreviousAnswers } from '../../../../../lib/mathaleaUtils'
  import { usesHostActivityProtocol } from '../../../../../lib/recorder'
  import {
    isSeedBlockedForCorrection,
    rememberSeedServedWithoutCorrection,
  } from '../../../../../lib/stores/correctionGuard'
  import {
    capytaleStudentAssignment,
    exercicesParams,
    isMenuNeededForExercises,
    pointsMaxParExercice,
    resultsByExercice,
  } from '../../../../../lib/stores/generalStore'
  import { globalOptions } from '../../../../../lib/stores/globalOptions'
  import { isLocalStorageAvailable } from '../../../../../lib/stores/storage'
  import type {
    InterfaceGlobalOptions,
    InterfaceParams,
    InterfaceResultExercice,
  } from '../../../../../lib/types'
  import { loadMathLive } from '../../../../../modules/loaders'
  import { statsTracker } from '../../../../../modules/statsUtils'
  import { countMathField } from '../../countMathField'
  import HeaderExerciceVueEleve from '../../presentationalComponents/shared/HeaderExerciceVueEleve.svelte'
  import ExerciceVueEleveButtons from './presentationalComponents/ExerciceVueEleveButtons.svelte'
  import Question from './presentationalComponents/Question.svelte'
  import {
    countCorrectionSteps,
    revealNextCorrection,
  } from './presentationalComponents/progressiveCorrection'
  export let exercise: TypeExercice
  export let exerciseIndex: number
  export let indiceLastExercice: number
  export let isCorrectionVisible: boolean = false

  let divExercice: HTMLDivElement
  let divScore: HTMLDivElement
  let buttonScore: HTMLButtonElement
  let isInteractif =
    exercise.interactifObligatoire ||
    (exercise.interactif && exercise?.interactifReady)

  /*
   * MGu Attention interfaceParams est un objet qui est une copie du store,
   * donc le mettre à jour directement met à jour le store sans le signaler au subscriber
   * DE PLUS, si on change l'ordre des exercices OU si on supprime un exercice, exerciseIndex
   * va devenir faux mais cela n'est pas génant car l'exercice va être destroy...
   * Cependant, avant un DESTROY, il y aura un beforeupdate et un afterupdate, donc cette variable
   * peut devenir UNDEFINED ou ERRONEE
   */
  let interfaceParams: InterfaceParams | undefined =
    get(exercicesParams)[exerciseIndex]
  let columnsCount = interfaceParams?.cols || 1

  let debug = new URL(window.location.href).searchParams.get('log') === '6'
  function log(str: string, level: number = 3) {
    if (debug || window.logDebug >= level) {
      console.info(str)
    }
  }

  const subscribeExercicesParamsStore = exercicesParams.subscribe((value) => {
    log('new interface:' + JSON.stringify(interfaceParams))
    if (value[exerciseIndex] !== interfaceParams) {
      // MGu c'est une comparaison par référence
      log('new interfaceParams subscribe:' + JSON.stringify(interfaceParams))
      interfaceParams = value[exerciseIndex]
    }
    if (
      exercise.interactifObligatoire &&
      interfaceParams &&
      interfaceParams.interactif !== '1'
    ) {
      exercise.interactif = true
      interfaceParams.interactif = '1'
      exercicesParams.update((params) => params)
    }
  })

  // une variable locale car si on modifie isCorrectionVisible, parfois elle devient undefined
  let isCorrectVisible = isCorrectionVisible
  // résultat (correct/incorrect) de chaque question, utilisé pour n'afficher la correction que sous les questions fausses
  let questionsIsOk: boolean[] = []

  // Vérification question par question (option `isCheckPerQuestion`) :
  // chaque question a son bouton « Vérifier » et son score, l'exercice cumule.
  let questionsChecked: boolean[] = []
  let questionsScore: (ResultOfQuestionInteractive['score'] | undefined)[] = []
  let questionsUniteSignalee: boolean[] = []
  let isStatsTracked = false

  /**
   * La vérification question par question n'a de sens que pour un exercice
   * interactif dont chaque question a sa propre entrée dans `autoCorrection`.
   * Sinon (une seule question, ou énoncé unique portant plusieurs champs)
   * on garde le bouton unique de l'exercice.
   */
  function isVerificationParQuestion(
    options: InterfaceGlobalOptions,
    interactif: boolean | undefined,
    exo: TypeExercice,
  ): boolean {
    return (
      options.isCheckPerQuestion === true &&
      interactif === true &&
      options.presMode !== 'recto' &&
      options.presMode !== 'verso' &&
      exo.listeQuestions.length > 1 &&
      exo.autoCorrection.length === exo.listeQuestions.length
    )
  }
  $: isCheckPerQuestion = isVerificationParQuestion(
    $globalOptions,
    isInteractif,
    exercise,
  )
  $: isProgressiveCorrection =
    $globalOptions.isCheckPerQuestion === true &&
    !isInteractif &&
    $globalOptions.isSolutionAccessible === true &&
    $globalOptions.presMode !== 'recto' &&
    $globalOptions.presMode !== 'verso' &&
    (!usesHostActivityProtocol($globalOptions.recorder) ||
      boutonCorrectionUrlFlag)

  // Le pas à pas n'a de sens qu'avec au moins deux volets (questions ou sous-questions)
  $: hasSeveralCorrectionSteps = isProgressiveCorrection
    ? countCorrectionSteps(
        exercise.listeQuestions.map((q) => mathaleaFormatExercice(q)),
        exercise.listeCorrections.map((c) => mathaleaFormatExercice(c ?? '')),
      ) > 1
    : false

  let correctionProgressionComplete = false
  $: correctionVersion = [
    exercise.key,
    exercise.seed,
    isProgressiveCorrection,
    isCorrectVisible,
  ].join(':')
  $: {
    correctionVersion
    correctionProgressionComplete = false
  }

  function showNextCorrection() {
    correctionProgressionComplete = !revealNextCorrection(divExercice)
  }

  function rememberCorrectionRevealed() {
    if (isLocalStorageAvailable() && exercise.id !== undefined) {
      window.localStorage.setItem(`${exercise.id}|${exercise.seed}`, 'true')
    }
  }

  function areAllQuestionsChecked(checked: boolean[]): boolean {
    return exercise.autoCorrection.every(
      (autoCorrection, i) => autoCorrection == null || checked[i],
    )
  }
  $: isAllChecked =
    isCheckPerQuestion && areAllQuestionsChecked(questionsChecked)

  // URL-driven display toggles (only used for FlowMath recorder)
  let boutonValidationUrlFlag = true
  let boutonCorrectionUrlFlag = true
  let boutonInteractiviteUrlFlag = true

  let title: string
  $: {
    // `exercise.id` vaut le nom du fichier quand l'exercice n'a pas de
    // référence : seule la référence des paramètres est affichée.
    const reference = interfaceParams?.id ?? ''
    if (
      $globalOptions.isTitleDisplayed &&
      $globalOptions.isReferenceDisplayed
    ) {
      title = reference ? `${reference} - ${exercise.titre}` : exercise.titre
    } else if ($globalOptions.isTitleDisplayed) {
      title = exercise.titre
    } else if ($globalOptions.isReferenceDisplayed) {
      title = reference
    } else {
      title = ''
    }
  }

  let numberOfAnswerFields: number = 0
  let lastRenderedSignature = ''
  let lastCheckedSignature = ''

  /**
   * Action Svelte pour la consigne et l'introduction : injecte le contenu HTML
   * puis déclenche le rendu KaTeX. Contrairement à `{@html}`, le nœud reste sous
   * le contrôle exclusif de l'action, donc une réécriture identique de
   * `exercise.consigne` par `nouvelleVersion()` (qui invaliderait `{@html}` et
   * effacerait le KaTeX déjà rendu sans repasser par `mathaleaRenderDiv`) est
   * ré-appliquée proprement via `update`.
   */
  function renderHtmlContent(node: HTMLElement, html: string) {
    const apply = (contenu: string) => {
      node.innerHTML = contenu ?? ''
      mathaleaRenderDiv(node, -1)
    }
    apply(html)
    return {
      update: apply,
    }
  }

  function getRenderSignature() {
    const questionsSignature = exercise.listeQuestions.join('||')
    const correctionsSignature =
      isCorrectVisible || isProgressiveCorrection
        ? exercise.listeCorrections.join('||')
        : ''

    return [
      exercise.key ?? '',
      exercise.seed ?? '',
      exercise.numeroExercice ?? '',
      isInteractif ? '1' : '0',
      isCorrectVisible ? '1' : '0',
      isProgressiveCorrection ? '1' : '0',
      questionsSignature,
      correctionsSignature,
    ].join('::')
  }

  /**
   * Signature des questions déjà vérifiées : quand elle change, le feedback et
   * la correction affichés sous ces questions doivent passer par KaTeX.
   */
  function getCheckedSignature() {
    return questionsChecked.map((checked) => (checked ? '1' : '0')).join('')
  }

  async function forceUpdate() {
    if (exercise == null) return
    exercise.numeroExercice = exerciseIndex
  }

  async function updateAnswers() {
    if ($globalOptions.done === '1' && $globalOptions.recorder !== 'capytale') {
      const q1 = document.querySelector<HTMLElement>(
        '#exercice' + exercise.numeroExercice + 'Q0',
      )
      if (q1?.innerText === 'chargement...') return // en attente du chargement de l'exercice
      const fields = document.querySelectorAll('math-field')
      fields.forEach((field) => {
        field.setAttribute('disabled', 'true')
      })
      const url = new URL(window.location.href)
      // Pour Moodle, les réponses sont dans l'URL, compressées ou en JSON brut
      const answers = url.searchParams.get('answers')
      const objAnswers = answers ? await decodeAnswers(answers) : undefined
      mathaleaUpdateUrlFromExercicesParams()
      Promise.all(mathaleaWriteStudentPreviousAnswers(objAnswers)).then(() => {
        // une fois que les réponses sont chargées et on en est sûr, on clique...
        if (buttonScore) {
          exercise.isDone = true
          buttonScore.click()
        }
      })
    }
  }

  onDestroy(() => {
    log('ondestroy' + exercise.id)
    // Détruit l'objet exercice pour libérer la mémoire
    exercise.reinit() // MGu nécessaire pour supprimer les listeners
    subscribeExercicesParamsStore()
  })

  onMount(async () => {
    log('onMount:' + exercise.id + ', v:' + $globalOptions.v)

    // Lien « sans correction visible » : si l'élève a déjà reçu cet énoncé sans
    // pouvoir consulter la correction (puis a modifié l'URL pour réactiver
    // l'accès aux corrections), on rebat une nouvelle graine afin qu'il ne
    // retrouve jamais la correction exacte de la copie rendue. La mémorisation
    // des graines servies sans correction se fait dans
    // updateInterfaceParamsAndReLoadExerciseIfNeed().
    if (
      $globalOptions.isSolutionAccessible &&
      $globalOptions.presMode !== 'recto' &&
      $globalOptions.presMode !== 'verso' &&
      isSeedBlockedForCorrection(exercise.id, exercise.seed)
    ) {
      exercise.seed = generateFreshSeed()
    }

    // Check boutonValidation mode after component is mounted
    if (usesHostActivityProtocol($globalOptions.recorder)) {
      try {
        const urlParams = new URLSearchParams(window.location.search)
        boutonValidationUrlFlag = urlParams.get('boutonValidation') !== 'false'
        boutonCorrectionUrlFlag = urlParams.get('boutonCorrection') !== 'false'
        boutonInteractiviteUrlFlag =
          urlParams.get('boutonInteractivite') !== 'false'
      } catch (e) {
        console.warn('Could not check FlowMath button flags:', e)
      }
    }

    document.addEventListener('newDataForAll', newData)
    document.addEventListener('setAllInteractif', setAllInteractif)
    document.addEventListener('removeAllInteractif', removeAllInteractif)
    document.addEventListener('updateAsyncEx', forceUpdate)

    if (
      $globalOptions.setInteractive === '1' &&
      isInteractif === false &&
      exercise?.interactifReady
    ) {
      setAllInteractif()
    } else if (
      $globalOptions.setInteractive === '0' &&
      isInteractif === true &&
      exercise?.interactifReady
    ) {
      removeAllInteractif()
    } else {
      updateInterfaceParamsAndReLoadExerciseIfNeed()
    }
    log('End onMount:' + exercise.id + ', v:' + $globalOptions.v)
  })

  beforeUpdate(async () => {
    log('beforeUpdate:' + exercise.id + ', v:' + $globalOptions.v)
  })

  function generateFreshSeed(): string {
    if (!exercise?.id || !isLocalStorageAvailable())
      return mathaleaGenerateSeed()

    let seed
    let safety = 0
    do {
      seed = mathaleaGenerateSeed()
      safety++
    } while (
      (window.localStorage.getItem(`${exercise.id}|${seed}`) !== null ||
        isSeedBlockedForCorrection(exercise.id, seed)) &&
      safety < 20
    )
    return seed
  }

  afterUpdate(async () => {
    log('afterUpdate:' + exercise.id + ', v:' + $globalOptions.v)
    const starttime = window.performance.now()
    if (exercise && divExercice) {
      const renderSignature = getRenderSignature()
      const shouldRenderContent = renderSignature !== lastRenderedSignature
      const checkedSignature = getCheckedSignature()
      const shouldRenderChecked = checkedSignature !== lastCheckedSignature
      lastCheckedSignature = checkedSignature
      let time = window.performance.now()
      if (shouldRenderContent) {
        mathaleaRenderDiv(divExercice)
        lastRenderedSignature = renderSignature
        time = window.performance.now()
        log('duration mathaleaRenderDiv:' + (time - starttime))
      } else if (shouldRenderChecked) {
        // pas de loadMathLive ici : les champs existent déjà
        mathaleaRenderDiv(divExercice)
      }
      adjustMathalea2dFiguresWidth()
      time = window.performance.now()
      log('duration adjustMathalea2dFiguresWidth:' + (time - starttime))
      if (shouldRenderContent && exercise.interactif) {
        log('loadMathLive')
        loadMathLive(divExercice)
        log('end loadMathLive')
        time = window.performance.now()
        log('duration loadMathLive:' + (time - starttime))
        if (exerciceContientCliqueFigure(exercise) && !isCorrectVisible) {
          prepareExerciceCliqueFigure(exercise)
        }
        time = window.performance.now()
        log('duration prepareExerciceCliqueFigure:' + (time - starttime))
      }
      if (shouldRenderContent) {
        updateAnswers()
        time = window.performance.now()
        log('duration updateAnswers:' + (time - starttime))
      }
    }
    log(
      'afterUpdate:n° ' +
        exerciseIndex +
        ', id: ' +
        exercise.id +
        ', v:' +
        $globalOptions.v +
        ', d:' +
        (window.performance.now() - starttime),
      2,
    )
  })

  async function newData() {
    log('newData:' + exercise.id + ', v:' + $globalOptions.v)
    exercise.isDone = false
    if (isCorrectVisible) switchCorrectionVisible(false)
    questionsIsOk = []
    questionsChecked = []
    questionsScore = []
    questionsUniteSignalee = []
    isStatsTracked = false
    exercise.answers = {}
    exercise.seed = generateFreshSeed()
    if (buttonScore?.dataset?.capytaleLoadAnswers === '1') {
      // si les données ont été chargées par Capytale, on remet à 0
      buttonScore.dataset.capytaleLoadAnswers = '0'
    }
    if (divScore) {
      divScore.innerHTML = ''
    }
    if (buttonScore) {
      buttonScore.classList.remove(
        'cursor-not-allowed',
        'opacity-50',
        'pointer-events-none',
      )
    }
    updateInterfaceParamsAndReLoadExerciseIfNeed()
  }

  async function setAllInteractif() {
    if (exercise?.interactifReady && !isInteractif) {
      isInteractif = true
      if (
        isLocalStorageAvailable() &&
        exercise.id &&
        exercise.seed &&
        window.localStorage.getItem(`${exercise.id}|${exercise.seed}`)
      ) {
        newData()
      } else {
        updateInterfaceParamsAndReLoadExerciseIfNeed()
      }
    }
  }
  async function removeAllInteractif() {
    if (
      exercise?.interactifReady &&
      isInteractif &&
      !exercise.interactifObligatoire
    ) {
      isInteractif = false
      updateInterfaceParamsAndReLoadExerciseIfNeed()
    }
  }

  async function updateInterfaceParamsAndReLoadExerciseIfNeed(
    reloadExercise: boolean = true,
  ) {
    log(
      'updateInterfaceParamsAndReLoadExercisesIfNeed:' +
        exercise.id +
        ', v:' +
        $globalOptions.v,
    )
    if (exercise.interactifObligatoire) isInteractif = true
    if (reloadExercise && exercise.typeExercice === 'simple') {
      if (exercise.seed === undefined) exercise.seed = generateFreshSeed()
      seedrandom(exercise.seed, { global: true })
      mathaleaHandleExerciceSimple(exercise, !!isInteractif, exerciseIndex)
    }
    exercise.interactif = isInteractif
    if (interfaceParams) {
      log(
        'updateDisplay: before interfaceParams for index ' +
          exerciseIndex +
          ': ' +
          JSON.stringify(interfaceParams),
      )
      let changed = false

      if (interfaceParams.alea !== exercise.seed) {
        interfaceParams.alea = exercise.seed
        changed = true
      }

      if (
        typeof exercise.sup5 === 'string' &&
        interfaceParams.sup5 !== mathaleaHandleSup(exercise.sup5)
      ) {
        interfaceParams.sup5 = mathaleaHandleSup(exercise.sup5)
        changed = true
      }

      const interactifValue = isInteractif ? '1' : '0'
      if (interfaceParams.interactif !== interactifValue) {
        interfaceParams.interactif = interactifValue
        changed = true
      }

      if (columnsCount > 1) {
        if (interfaceParams.cols !== columnsCount) {
          interfaceParams.cols = columnsCount
          changed = true
        }
      } else if (columnsCount <= 1) {
        if (interfaceParams.cols !== undefined) {
          interfaceParams.cols = undefined
          changed = true
        }
      }
      if (changed) {
        log(
          'updateDisplay: updating interfaceParams for index ' +
            exerciseIndex +
            ': ' +
            JSON.stringify(interfaceParams),
          2,
        )
        exercicesParams.update((l: InterfaceParams[]) => {
          if (interfaceParams) {
            l[exerciseIndex] = interfaceParams
          }
          return l
        })
      }
    }

    exercise.numeroExercice = exerciseIndex
    if (
      reloadExercise &&
      exercise !== undefined &&
      exercise.typeExercice !== 'simple' &&
      typeof exercise.nouvelleVersionWrapper === 'function'
    ) {
      if (exercise.seed === undefined) exercise.seed = generateFreshSeed()
      log('nouvelleVersionWrapper:' + exercise.id + ', v:' + $globalOptions.v)
      seedrandom(exercise.seed, { global: true })
      exercise.nouvelleVersionWrapper(exerciseIndex)
    }
    // Mémorise tout énoncé affiché à l'élève sans accès à la correction, pour
    // lui en interdire la correction plus tard s'il force l'URL
    // (cf. src/lib/stores/correctionGuard.ts).
    if (
      !$globalOptions.isSolutionAccessible &&
      $globalOptions.presMode !== 'recto' &&
      $globalOptions.presMode !== 'verso'
    ) {
      rememberSeedServedWithoutCorrection(exercise.id, exercise.seed)
    }

    numberOfAnswerFields = countMathField(exercise)
    log('numberOfAnswerFields:' + numberOfAnswerFields)
    refreshPointsMax()
    mathaleaUpdateUrlFromExercicesParams()
  }

  /**
   * Mémorise le nombre de points maximum de l'exercice, pour que le score
   * maximal envoyé au recorder couvre aussi les exercices pas encore soumis.
   * À appeler après chaque (re)génération des questions, qui remplit
   * `autoCorrection`.
   */
  function refreshPointsMax() {
    const nouveauPointsMax = isInteractif ? pointsMaxExercice(exercise) : 0
    pointsMaxParExercice.update((liste) => {
      if (liste[exerciseIndex] === nouveauPointsMax) return liste
      const nouvelleListe = [...liste]
      nouvelleListe[exerciseIndex] = nouveauPointsMax
      return nouvelleListe
    })
  }

  function getCapytaleSerializableAnswers(
    sourceAnswers: Record<string, string> | undefined,
  ) {
    if (sourceAnswers == null) return sourceAnswers
    const serializableAnswers = { ...sourceAnswers }
    const qcmCustomKeys = Object.keys(sourceAnswers).filter((key) =>
      key.startsWith('mathalea-qcmEx'),
    )
    for (const customKey of qcmCustomKeys) {
      const legacyPrefix = customKey.replace('mathalea-qcm', '')
      for (const key of Object.keys(serializableAnswers)) {
        if (key === legacyPrefix || key.startsWith(`${legacyPrefix}R`)) {
          delete serializableAnswers[key]
        }
      }
    }
    const dragAndDropCustomKeys = Object.keys(sourceAnswers).filter((key) =>
      key.startsWith('drag-and-dropEx'),
    )
    for (const customKey of dragAndDropCustomKeys) {
      const legacyPrefix = customKey.replace('drag-and-drop', '')
      for (const key of Object.keys(serializableAnswers)) {
        if (
          key === legacyPrefix ||
          key.startsWith(`rectangleDND${legacyPrefix}`) ||
          key.startsWith(`texteDND${legacyPrefix}`)
        ) {
          delete serializableAnswers[key]
        }
      }
    }
    const cliqueFigureCustomKeys = Object.keys(sourceAnswers).filter((key) =>
      key.startsWith('clique-figureEx'),
    )
    for (const customKey of cliqueFigureCustomKeys) {
      const legacySuffix = customKey.replace('clique-figure', '')
      for (const key of Object.keys(serializableAnswers)) {
        if (key.startsWith('cliquefigure') && key.endsWith(legacySuffix)) {
          delete serializableAnswers[key]
        }
      }
    }
    return serializableAnswers
  }

  /**
   * Enregistre le score de l'exercice (meilleur score, résultats transmis
   * à Moodle ou Capytale) une fois qu'il a été calculé.
   */
  function enregistreScore(numberOfPoints: number, numberOfQuestions: number) {
    if (exercise.numeroExercice == null) return
    const previousBestScore = interfaceParams?.bestScore ?? 0
    const isThisTryBetter = numberOfPoints >= previousBestScore
    if (
      buttonScore?.dataset.capytaleLoadAnswers === '1' &&
      previousBestScore !== numberOfPoints
    ) {
      // ICI les réponses ont été chargées par Capytale et
      //  le score ne peut pas être inferieur à best score,
      //  car c'est de la restitution de la meilleure copie
      // donc si on est ici dans ce IF, c'est un bug du moteur à faire vite remonter
      const newStudentAssignement = get(capytaleStudentAssignment) || []
      const previousResultatByExercice =
        newStudentAssignement[exercise.numeroExercice as number]
      if (exercise?.checkSum !== previousResultatByExercice?.checkSum) {
        window.notify(
          `Exercice ${exercise.numeroExercice} a changé, passé de ${previousBestScore} à ${numberOfPoints}. Checksum différent avant ${previousResultatByExercice?.checkSum} et maintenant ${exercise?.checkSum}.`,
          {
            exo: exercise,
            globalOptions: get(globalOptions),
            exercicesParams: get(exercicesParams),
            resultsByExercice: get(resultsByExercice),
          },
        )
      }

      window.notify(
        `Le score de l'exercice ${exercise.numeroExercice} est incorrect, checksum(${exercise?.checkSum === previousResultatByExercice?.checkSum}), passé de ${previousBestScore} à ${numberOfPoints}. Merci de le signaler au support.`,
        {
          exo: exercise,
          globalOptions: get(globalOptions),
          exercicesParams: get(exercicesParams),
          resultsByExercice: get(resultsByExercice),
        },
      )
    }

    let bestScore = previousBestScore
    // On ne met à jour resultsByExercice que si le score est meilleur
    if (isThisTryBetter) {
      bestScore = numberOfPoints
      exercicesParams.update((l: InterfaceParams[]) => {
        l[exercise.numeroExercice as number].bestScore = bestScore
        return l
      })
      resultsByExercice.update((l: InterfaceResultExercice[]) => {
        l[exercise.numeroExercice as number] = {
          uuid: exercise.uuid,
          title: exercise.titre,
          indice: exercise.numeroExercice as number,
          state: 'done',
          alea: exercise.seed,
          answers: getCapytaleSerializableAnswers(exercise.answers),
          numberOfPoints,
          numberOfQuestions,
          bestScore,
          checkSum: exercise.checkSum,
        }
        return l
      })
    }

    if ($globalOptions.recorder === 'moodle') {
      const url = new URL(window.location.href)
      const iframe = url.searchParams.get('iframe')
      console.info({
        resultsByExercice: $resultsByExercice,
        action: 'mathalea:score',
        iframe,
      })
      window.parent.postMessage(
        {
          resultsByExercice: $resultsByExercice,
          action: 'mathalea:score',
          iframe,
        },
        '*',
      )
    } else if ($globalOptions.recorder === 'capytale') {
      if (buttonScore?.dataset.capytaleLoadAnswers === '1') {
        console.info(
          'Les réponses ont été chargées par Capytale donc on ne les renvoie pas à nouveau',
        )
        return
      }
      if (isThisTryBetter) {
        sendToCapytaleSaveStudentAssignment({
          indiceExercice: exerciseIndex,
        })
      }
    }
  }

  /**
   * Vérifie une question (sans enregistrer le score) et mémorise son résultat.
   * Les champs de la question sont verrouillés par sa vérification.
   */
  function verifieUneQuestion(questionIndex: number) {
    if (questionsChecked[questionIndex]) return
    if (!isStatsTracked && exercise.isDone !== true) {
      statsTracker(
        exercise,
        $globalOptions.recorder ?? '',
        $globalOptions.v ?? '',
        buttonScore?.dataset?.capytaleLoadAnswers === '1' ? 'review' : '',
      )
      isStatsTracked = true
    }
    exercise.answers ??= {}
    const result = verifQuestionExercice(exercise, questionIndex)
    questionsScore[questionIndex] = result?.score ?? {
      nbBonnesReponses: 0,
      nbReponses: 0,
    }
    questionsIsOk[questionIndex] = result?.isOk ?? false
    questionsChecked[questionIndex] = true
  }

  /**
   * Met à jour l'affichage après la vérification d'une ou plusieurs questions.
   * Chaque question affiche son propre résultat (smiley, feedback, correction),
   * mais le score de l'exercice n'est calculé, affiché et transmis (onglet,
   * Moodle, Capytale) que lorsque toutes les questions sont vérifiées : c'est
   * alors l'équivalent du bouton unique de l'exercice.
   */
  function metsAJourApresVerificationParQuestion() {
    questionsChecked = [...questionsChecked]
    questionsScore = [...questionsScore]
    questionsIsOk = [...questionsIsOk]
    if (!areAllQuestionsChecked(questionsChecked)) return
    let nbBonnesReponses = 0
    let nbReponsesTotal = 0
    for (const score of questionsScore) {
      if (score == null) continue
      nbBonnesReponses += score.nbBonnesReponses
      nbReponsesTotal += score.nbReponses
    }
    const { numberOfPoints, numberOfQuestions } = afficheScore(
      exercise,
      nbBonnesReponses,
      nbReponsesTotal - nbBonnesReponses,
      divScore,
    )
    exercise.isDone = true
    if ($globalOptions.isSolutionAccessible) isCorrectVisible = true
    enregistreScore(numberOfPoints, numberOfQuestions)
  }

  /** Bouton « Vérifier » d'une question (option `isCheckPerQuestion`) */
  function verifQuestionVueEleve(questionIndex: number) {
    if (exercise.numeroExercice == null || questionsChecked[questionIndex])
      return
    if (
      !questionsUniteSignalee[questionIndex] &&
      exerciceAUneUniteManquante(exercise, questionIndex)
    ) {
      questionsUniteSignalee[questionIndex] = true
      const divAlerte = document.getElementById(
        `alerteUniteEx${exerciseIndex}Q${questionIndex}`,
      ) as HTMLDivElement | null
      afficheAlerteUniteManquante(divAlerte ?? undefined)
      return
    }
    verifieUneQuestion(questionIndex)
    metsAJourApresVerificationParQuestion()
  }

  /**
   * Lorsque tous les solveurs de l'exercice sont terminés, l'élève n'a plus
   * rien à saisir : l'exercice est vérifié sans clic sur le bouton.
   */
  function verifieSiSolveursTermines(conteneur: HTMLElement) {
    if (
      !isInteractif ||
      isCorrectVisible ||
      isAllChecked ||
      exercise.isDone === true ||
      !tousLesSolveursSontTermines(exercise, conteneur)
    )
      return
    verifExerciceVueEleve()
  }

  async function verifExerciceVueEleve() {
    log('verifExerciceVueEleve')
    exercise.nbTentativesVerification =
      (exercise.nbTentativesVerification ?? 0) + 1
    // Avec la vérification question par question, seules les questions
    // restantes comptent : les autres ont déjà été corrigées.
    const isUniteManquante = isCheckPerQuestion
      ? exercise.autoCorrection.some(
          (autoCorrection, i) =>
            autoCorrection != null &&
            !questionsChecked[i] &&
            exerciceAUneUniteManquante(exercise, i),
        )
      : exerciceAUneUniteManquante(exercise)
    if (exercise.nbTentativesVerification === 1 && isUniteManquante) {
      afficheAlerteUniteManquante(divScore)
      return
    }
    if (isCheckPerQuestion) {
      // Bouton « Tout vérifier » : on vérifie les questions restantes
      if (exercise.numeroExercice == null) return
      for (let i = 0; i < exercise.autoCorrection.length; i++) {
        if (exercise.autoCorrection[i] != null) verifieUneQuestion(i)
      }
      metsAJourApresVerificationParQuestion()
      return
    }
    if (exercise.numeroExercice != null && !(exercise.isDone === true))
      statsTracker(
        exercise,
        $globalOptions.recorder ?? '',
        $globalOptions.v ?? '',
        buttonScore?.dataset?.capytaleLoadAnswers === '1' ? 'review' : '',
      )
    exercise.isDone = true

    if (exercise.numeroExercice != null) {
      const { numberOfPoints, numberOfQuestions, perQuestionIsOk } =
        exerciceInteractif(exercise, divScore, buttonScore)
      questionsIsOk = perQuestionIsOk

      if ($globalOptions.isSolutionAccessible) {
        isCorrectVisible = true
      }

      enregistreScore(numberOfPoints, numberOfQuestions)
    }
  }

  /**
   * Recherche toutes les figures ayant la classe `mathalea2d` et réduit leur largeur à 95% de la valeur
   * maximale du div reperé par l'ID `consigne<X>-0` où `X` est l'indice de l'exercice
   * @author sylvain
   */
  function adjustMathalea2dFiguresWidth() {
    const mathalea2dFigures: NodeListOf<SVGElement> | undefined =
      divExercice?.querySelectorAll<SVGElement>('.mathalea2d')
    if (!mathalea2dFigures || mathalea2dFigures.length === 0) return

    const zoom = Number($globalOptions.z ?? 1)
    log('zoom:' + zoom)
    if (mathalea2dFigures.length !== 0) {
      for (let k = 0; k < mathalea2dFigures.length; k++) {
        /* Mickael:
          Ne surtout pas mettre la référence de l'exercice dans la requête suivante,
          car dans svelte, la référence est liée au dernier exercice chargé, ce qui bug!
          */
        const consigneDiv = divExercice
          ?.querySelector('article')
          ?.querySelector('[id^="consigne"]')
        if (
          consigneDiv &&
          mathalea2dFigures[k].clientWidth > consigneDiv.clientWidth
        ) {
          const coef =
            (consigneDiv.clientWidth * 0.95) / mathalea2dFigures[k].clientWidth

          const width = mathalea2dFigures[k].getAttribute('width')
          const height = mathalea2dFigures[k].getAttribute('height')
          if (!mathalea2dFigures[k].dataset.widthInitiale && width != null)
            mathalea2dFigures[k].dataset.widthInitiale = width
          if (!mathalea2dFigures[k].dataset.heightInitiale && height != null)
            mathalea2dFigures[k].dataset.heightInitiale = height
          const newHeight = (
            Number(mathalea2dFigures[k].dataset.heightInitiale) *
            zoom *
            coef
          ).toString()
          const newWidth = (
            Number(mathalea2dFigures[k].dataset.widthInitiale) *
            zoom *
            coef
          ).toString()
          if (width !== newWidth) {
            mathalea2dFigures[k].setAttribute('width', newWidth)
          }
          if (height !== newHeight) {
            mathalea2dFigures[k].setAttribute('height', newHeight)
          }

          if (
            mathalea2dFigures[k] != null &&
            mathalea2dFigures[k].parentElement !== null
          ) {
            const eltsInFigures =
              mathalea2dFigures[k].parentElement?.querySelectorAll<HTMLElement>(
                'div.divLatex',
              ) || []
            for (const elt of eltsInFigures) {
              const e = elt
              const initialTop = Number(e.dataset.top) ?? 0
              const initialLeft = Number(e.dataset.left) ?? 0
              e.style.setProperty(
                'top',
                (initialTop * coef * zoom).toString() + 'px',
              )
              e.style.setProperty(
                'left',
                (initialLeft * coef * zoom).toString() + 'px',
              )
            }
          }
        }
      }
    }
  }

  // pour recalculer les tailles lors d'un changement de dimension de la fenêtre
  window.onresize = () => {
    adjustMathalea2dFiguresWidth()
  }

  function switchCorrectionVisible(newdata: boolean = true) {
    isCorrectVisible = !isCorrectVisible
    if (
      isCorrectVisible &&
      isLocalStorageAvailable() &&
      exercise.id !== undefined
    ) {
      window.localStorage.setItem(`${exercise.id}|${exercise.seed}`, 'true')
    }
    if (
      newdata &&
      !$globalOptions.oneShot &&
      exercise.interactif &&
      !isCorrectVisible &&
      !exercise.isDone
    ) {
      newData()
    }
  }

  function switchInteractif() {
    if (exercise.interactifObligatoire) {
      isInteractif = true
      exercise.interactif = true
      updateInterfaceParamsAndReLoadExerciseIfNeed()
      return
    }
    if (isCorrectVisible) switchCorrectionVisible()
    isInteractif = !isInteractif
    exercise.interactif = isInteractif
    if (
      isInteractif &&
      isLocalStorageAvailable() &&
      exercise.id &&
      exercise.seed &&
      window.localStorage.getItem(`${exercise.id}|${exercise.seed}`)
    ) {
      newData()
    } else {
      updateInterfaceParamsAndReLoadExerciseIfNeed()
    }
  }

  function columnsCountUpdate(plusMinus: '+' | '-') {
    if (plusMinus === '+') columnsCount++
    if (plusMinus === '-') columnsCount--
    updateInterfaceParamsAndReLoadExerciseIfNeed(false)
  }
</script>

<div class="z-0 flex-1 w-full mb-4 lg:mb-6" bind:this={divExercice}>
  {#if $globalOptions.presMode !== 'recto' && $globalOptions.presMode !== 'verso'}
    <HeaderExerciceVueEleve
      {title}
      indiceExercice={exerciseIndex}
      showNumber={indiceLastExercice > 0 &&
        $globalOptions.presMode !== 'un_exo_par_page'}
      isMenuNeededForExercises={$isMenuNeededForExercises}
      presMode={$globalOptions.presMode}
      seed={exercise.seed}
      zoom={$globalOptions.z ?? 1}
    />
  {/if}

  <div class="flex flex-col-reverse lg:flex-row">
    <div
      class="flex flex-col justify-start items-start w-full"
      id="exercice{exerciseIndex}"
    >
      <ExerciceVueEleveButtons
        globalOptions={$globalOptions}
        {indiceLastExercice}
        {exercise}
        isCorrectionVisible={isCorrectVisible}
        {newData}
        {switchCorrectionVisible}
        {isInteractif}
        {switchInteractif}
        showStepCorrectionButton={hasSeveralCorrectionSteps && !isCorrectVisible}
        {correctionProgressionComplete}
        {showNextCorrection}
        {columnsCount}
        {columnsCountUpdate}
        showCorrectionButton={usesHostActivityProtocol($globalOptions.recorder)
          ? boutonCorrectionUrlFlag
          : true}
        showInteractivityButton={usesHostActivityProtocol(
          $globalOptions.recorder,
        )
          ? boutonInteractiviteUrlFlag
          : true}
        showNewDataButton={!exercise.pasDeVersionAleatoire}
      />
      <article
        use:ecouteSolveursTermines={verifieSiSolveursTermines}
        class=" {$isMenuNeededForExercises
          ? 'text-2xl'
          : 'text-base'} relative w-full"
        style="font-size: {(
          $globalOptions.z || 1
        ).toString()}rem;  line-height: calc({$globalOptions.z || 1});"
      >
        <div class="flex flex-col w-full mt-2 lg:mt-0 mb-2">
          {#key exercise.key}
            {#if typeof exercise.consigne !== 'undefined' && exercise.consigne.length !== 0}
              <div>
                <p
                  class="mt-2 mb-2 ml-2 lg:mx-6 text-coopmaths-corpus dark:text-coopmathsdark-corpus"
                  use:renderHtmlContent={exercise.consigne}
                ></p>
              </div>
            {/if}
            {#if exercise.introduction}
              <div>
                <p
                  class="mt-2 mb-2 ml-2 lg:mx-6 text-coopmaths-corpus dark:text-coopmathsdark-corpus"
                  use:renderHtmlContent={exercise.introduction}
                ></p>
              </div>
            {/if}
          {/key}
        </div>
        <div
          style="columns: {window.innerWidth > 1000
            ? columnsCount.toString()
            : '1'}"
        >
          <ul
            class="{exercise.listeQuestions.length === 1 ||
            !exercise.listeAvecNumerotation
              ? 'list-none'
              : 'list-decimal'} list-inside mx-2 lg:mx-6 marker:text-coopmaths-struct dark:marker:text-coopmathsdark-struct marker:font-bold"
          >
            <!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
            {#each exercise.listeQuestions as question, questionIndex (exercise.key + '_' + exerciseIndex + '_' + questionIndex)}
              <Question
                {exercise}
                {questionIndex}
                {exerciseIndex}
                isCorrectionVisible={isCorrectVisible ||
                  ($globalOptions.isSolutionAccessible === true &&
                    questionsChecked[questionIndex] === true)}
                {isProgressiveCorrection}
                onCorrectionReveal={rememberCorrectionRevealed}
                isQuestionCorrect={questionsIsOk[questionIndex]}
                hideCorrectionOnSuccess={$globalOptions.isCorrectionOnlyOnError}
                isCheckable={isCheckPerQuestion &&
                  exercise.autoCorrection[questionIndex] != null}
                isChecked={questionsChecked[questionIndex] === true}
                score={questionsScore[questionIndex]}
                onCheck={() => verifQuestionVueEleve(questionIndex)}
                isCheckButtonHidden={$globalOptions.recorder === 'flowmath' &&
                  !boutonValidationUrlFlag}
              />
            {/each}
            <div bind:this={divScore} id="divScoreEx{exerciseIndex}"></div>
          </ul>
        </div>
      </article>
      {#if isInteractif && !isCorrectVisible && !isAllChecked}
        <button
          type="submit"
          bind:this={buttonScore}
          on:click={verifExerciceVueEleve}
          id="buttonScoreEx{exerciseIndex}"
          class={`inline-block px-6 py-2.5 mr-10 my-5 ml-6
                  bg-coopmaths-action dark:bg-coopmathsdark-action
                  text-coopmaths-canvas dark:text-coopmathsdark-canvas
                  font-medium text-xs leading-tight uppercase rounded shadow-md
                  transform hover:bg-coopmaths-action-lightest dark:hover:bg-coopmathsdark-action-lightest
                  hover:shadow-lg focus:bg-coopmaths-action-lightest dark:focus:bg-coopmathsdark-action-lightest
                  focus:shadow-lg focus:outline-none focus:ring-0
                  active:bg-coopmaths-action-lightest dark:active:bg-coopmathsdark-action-lightest
                  active:shadow-lg transition duration-150 ease-in-out checkReponses`}
          class:hidden={usesHostActivityProtocol($globalOptions.recorder) &&
            !boutonValidationUrlFlag}
          hidden={usesHostActivityProtocol($globalOptions.recorder) &&
            !boutonValidationUrlFlag}
        >
          {#if isCheckPerQuestion}
            Tout vérifier
          {:else}
            Vérifier {numberOfAnswerFields > 1 ? 'les réponses' : 'la réponse'}
          {/if}
        </button>
      {:else if !exercise.interactifReady && !isCorrectVisible && $globalOptions.isSolutionAccessible && $globalOptions.recorder === undefined && $globalOptions.presMode !== 'recto' && $globalOptions.presMode !== 'verso' && exercise.listeQuestions.length > 0}
        <p
          class="flex items-start gap-2 ml-6 my-5 text-sm text-coopmaths-struct dark:text-coopmathsdark-struct"
        >
          <i class="bx bx-pencil mt-0.5" aria-hidden="true"></i>
          <span>
            Cet exercice n'est pas interactif. Faites-le au brouillon, puis
            comparez votre travail avec la correction.
          </span>
        </p>
      {/if}
    </div>
  </div>
</div>
