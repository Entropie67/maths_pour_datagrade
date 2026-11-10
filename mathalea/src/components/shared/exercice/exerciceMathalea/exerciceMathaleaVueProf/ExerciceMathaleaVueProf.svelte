<script lang="ts">
  import seedrandom from 'seedrandom'
  import {
    afterUpdate,
    beforeUpdate,
    getContext,
    onDestroy,
    onMount,
    tick,
  } from 'svelte'
  import { get } from 'svelte/store'
  import {
    ecouteSolveursTermines,
    tousLesSolveursSontTermines,
  } from '../../../../../lib/customElements/solveurTermine'
  import ExerciceSimple from '../../../../../exercices/ExerciceSimple'
  import {
    exercisesUuidRanking,
    uuidCount,
  } from '../../../../../lib/components/counts'
  import { afficheAlerteUniteManquante } from '../../../../../lib/interactif/afficheScore'
  import {
    normaliseCoeffBareme,
    pointsMaxExercice,
  } from '../../../../../lib/interactif/baremeExercice'
  import {
    exerciceAUneUniteManquante,
    exerciceContientCliqueFigure,
    exerciceInteractif,
    prepareExerciceCliqueFigure,
  } from '../../../../../lib/interactif/gestionInteractif'
  import {
    mathaleaFormatExercice,
    mathaleaGenerateSeed,
    mathaleaHandleExerciceSimple,
    mathaleaHandleSup,
    mathaleaRenderDiv,
    mathaleaUpdateUrlFromExercicesParams,
    renderDiv,
  } from '../../../../../lib/mathalea'
  import {
    isSeedBlockedForCorrection,
    pickSeedNotServedWithoutCorrection,
  } from '../../../../../lib/stores/correctionGuard'
  import {
    changes,
    exercicesParams,
    pointsMaxParExercice,
    interactiviteParExercice,
    resultsByExercice,
  } from '../../../../../lib/stores/generalStore'
  import { globalOptions } from '../../../../../lib/stores/globalOptions'
  import { isLocalStorageAvailable } from '../../../../../lib/stores/storage'
  import type {
    IExercice,
    IExerciceSimple,
    InterfaceParams,
  } from '../../../../../lib/types'
  import type { HeaderProps } from '../../../../../lib/types/ui'
  import { loadMathLive } from '../../../../../modules/loaders'
  import ButtonTextAction from '../../../forms/ButtonTextAction.svelte'
  import BasicClassicModal from '../../../modal/BasicClassicModal.svelte'
  import { countMathField } from '../../countMathField'
  import HeaderExerciceVueProf from '../../shared/headerExerciceVueProf/HeaderExerciceVueProf.svelte'
  import Settings from './presentationalComponents/Settings.svelte'

  let isIndiceModalDisplayed = false
  let isTipAvailable: boolean

  export let exercise: IExercice | IExerciceSimple
  export let exerciseIndex: number
  export let indiceLastExercice: number
  export let isCorrectionVisible = false
  export let toggleSidenav: (open: boolean) => void

  let divExercice: HTMLDivElement
  let divScore: HTMLDivElement
  let buttonScore: HTMLButtonElement
  // L'état du rendu reste impératif pour ne pas relancer afterUpdate en le
  // publiant. La révision invalide aussi les anciens callbacks afterUpdate.
  const rendering = { revision: 0, destroyed: false }

  function invalidateRendering() {
    rendering.revision++
    divExercice?.setAttribute('data-exercise-render-state', 'loading')
    buttonScore?.toggleAttribute('disabled', true)
  }

  function isCurrentRendering(revision: number, renderedExercise: IExercice) {
    return (
      !rendering.destroyed &&
      revision === rendering.revision &&
      renderedExercise === exercise &&
      divExercice?.isConnected
    )
  }
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
  let exercicesNumber: number = get(exercicesParams).length

  let id: string =
    interfaceParams && interfaceParams.id ? interfaceParams.id : ''

  const subscribeExercicesParamsStore = exercicesParams.subscribe((value) => {
    log('new interface')
    if (value[exerciseIndex] !== interfaceParams) {
      // MGu c'est une comparaison par référence
      log('new interfaceParams subscribe:' + JSON.stringify(interfaceParams))
      interfaceParams = value[exerciseIndex]
    }
    if (exercicesNumber !== value.length) {
      exercicesNumber = value.length
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

  let columnsCount = interfaceParams.cols || 1
  let isVisible = true
  let isContentVisible = true
  // Dans la vue mobile, les paramètres sont masqués tant qu'ils n'ont pas été
  // demandés depuis le menu de l'exercice : ils occuperaient tout l'écran.
  const isMobileView = getContext('mobileView') === true
  let isSettingsVisible = !isMobileView
  let isInteractif = exercise.interactif || exercise.interactifObligatoire
  // Relecture (`&cor` en local) : la correction est affichée dès le départ,
  // sauf pour un exercice interactif dont la correction suit la vérification.
  if (get(globalOptions).cor && !isInteractif) isCorrectionVisible = true
  const interactifReady = exercise.interactifReady
  const exerciceHasNoSettingsExceptBareme =
    !exercise.nbQuestionsModifiable &&
    !exercise.correctionDetailleeDisponible &&
    !!exercise.pasDeVersionAleatoire &&
    !exercise.besoinFormulaireCaseACocher &&
    !exercise.besoinFormulaireNumerique &&
    !exercise.besoinFormulaireTexte &&
    !exercise.besoinFormulaire2CaseACocher &&
    !exercise.besoinFormulaire2Numerique &&
    !exercise.besoinFormulaire2Texte &&
    !exercise.besoinFormulaire3CaseACocher &&
    !exercise.besoinFormulaire3Numerique &&
    !exercise.besoinFormulaire3Texte &&
    !exercise.besoinFormulaire4CaseACocher &&
    !exercise.besoinFormulaire4Numerique &&
    !exercise.besoinFormulaire4Texte &&
    !exercise.besoinFormulaire5CaseACocher &&
    !exercise.besoinFormulaire5Numerique &&
    !exercise.besoinFormulaire5Texte &&
    !(exercise.tip && exercise.tip.length > 0)
  /** Nombre de points maximum de l'exercice, hors coefficient de barème. */
  let pointsMax = 0
  // Un exercice interactif garde le réglage de son barème, même s'il n'a
  // aucun autre paramètre.
  $: exerciceHasNoSettings =
    exerciceHasNoSettingsExceptBareme && !(isInteractif && pointsMax > 0)
  isTipAvailable = exercise.tipAvailable !== false
  let isExerciceChecked = false
  const generateTitleAddendum = (): string => {
    const ranks = exercisesUuidRanking(get(exercicesParams))
    const counts = uuidCount(get(exercicesParams))
    if (
      interfaceParams &&
      interfaceParams.uuid &&
      counts[interfaceParams.uuid] > 1
    ) {
      return '|' + ranks[exerciseIndex]
    } else {
      return ''
    }
  }
  let headerProps: HeaderProps = {
    title: '',
    id,
    indiceExercice: exerciseIndex,
    indiceLastExercice,
    isInteractif,
    interactifReady,
    isSettingsVisible,
  }

  $: {
    if (isContentVisible && isInteractif && buttonScore) initButtonScore()
    if (!isInteractif && divScore) divScore.innerHTML = ''
    headerProps.settingsReady = !exerciceHasNoSettings
    headerProps.randomReady = !exercise.pasDeVersionAleatoire
    headerProps.isSortable = true
    headerProps.isDeletable = true
    headerProps.isHidable = true
    headerProps.id = id
    headerProps.isInteractif = isInteractif
    headerProps.correctionExists = exercise.listeCorrections.length > 0
    headerProps.title = exercise.titre + generateTitleAddendum()
    headerProps.indiceExercice = exerciseIndex
    headerProps.indiceLastExercice = exercicesNumber
    headerProps.isSettingsVisible = isSettingsVisible
    headerProps.isCorrectionVisible = isCorrectionVisible
    headerProps = headerProps
    isCorrectionVisible = isCorrectionVisible // MGU pour déclencher le reactive
  }

  let numberOfAnswerFields: number = 0

  // on détecte les changements dans la liste des exercices
  // afin de mettre à jour le titre
  const unsubscribeToChangesStore = changes.subscribe(() => {
    headerProps.title = exercise.titre + generateTitleAddendum()
  })

  async function forceUpdate(event?: Event) {
    if (
      event instanceof CustomEvent &&
      event.detail?.exercise &&
      event.detail.exercise !== exercise
    )
      return
    if (exercise == null) return
    invalidateRendering()
    exercise.numeroExercice = exerciseIndex
    // Les générateurs asynchrones modifient l'objet sans remplacer sa référence.
    exercise = exercise
    // Les sélecteurs d'automatismes figent leurs références dans `sup5` une
    // fois leurs imports asynchrones terminés. Les recopier immédiatement dans
    // les paramètres rend la liste disponible pour l'URL ou Capytale.
    const params = interfaceParams
    if (typeof exercise.sup5 === 'string' && params) {
      const sup5 = mathaleaHandleSup(exercise.sup5)
      if (params.sup5 !== sup5) {
        params.sup5 = sup5
        exercicesParams.update((params) => params)
      }
    }
    await adjustMathalea2dFiguresWidth()
  }

  function log(str: string) {
    const debug = new URL(window.location.href).searchParams.get('log') === '1'
    if (debug) {
      console.info(exerciseIndex, exercise.id)
      console.info(str)
    }
  }

  /**
   * Met à jour le nombre de points maximum affiché dans les paramètres.
   * À appeler après chaque (re)génération des questions, qui remplit
   * `autoCorrection`.
   */
  function refreshPointsMax() {
    const nouveauPointsMax = isInteractif ? pointsMaxExercice(exercise) : 0
    if (pointsMax !== nouveauPointsMax) pointsMax = nouveauPointsMax
    pointsMaxParExercice.update((liste) => {
      if (liste[exerciseIndex] === nouveauPointsMax) return liste
      const nouvelleListe = [...liste]
      nouvelleListe[exerciseIndex] = nouveauPointsMax
      return nouvelleListe
    })
  }

  /**
   * Signale ce que l'exercice permet en matière d'interactivité, pour que le
   * sélecteur Papier / Numérique et la modale des exercices sans version
   * interactive s'appuient dessus.
   */
  function refreshInteractivite() {
    const nouvelleInfo = {
      id: exercise.id ?? '',
      titre: exercise.titre,
      interactifReady: Boolean(exercise.interactifReady),
      interactifObligatoire: Boolean(exercise.interactifObligatoire),
    }
    interactiviteParExercice.update((liste) => {
      const info = liste[exerciseIndex]
      if (
        info &&
        info.id === nouvelleInfo.id &&
        info.titre === nouvelleInfo.titre &&
        info.interactifReady === nouvelleInfo.interactifReady &&
        info.interactifObligatoire === nouvelleInfo.interactifObligatoire
      )
        return liste
      const nouvelleListe = [...liste]
      nouvelleListe[exerciseIndex] = nouvelleInfo
      return nouvelleListe
    })
  }

  beforeUpdate(async () => {
    invalidateRendering()
    log('beforeUpdate:' + exercise.id)
    if (numberOfAnswerFields !== countMathField(exercise)) {
      numberOfAnswerFields = countMathField(exercise)
    }
    refreshPointsMax()
    refreshInteractivite()
    if (get(exercicesParams)[exerciseIndex] !== interfaceParams) {
      // interface à changer car un exercice a été supprimé au-dessus...
      interfaceParams = get(exercicesParams)[exerciseIndex]
      log('new interfaceParams beforeUpdate:' + JSON.stringify(interfaceParams))
      // obliger de charger l'exercice car son numéro à changer, et il faut gérer les id correctement des HTMLElements
      await updateDisplay()
    }
  })

  /**
   * Fonction appelée lorsque le listener détecte `languageHasChanged`.
   * Elle change la variable `interfaceParams` et surtout met à jour `id`
   * qui est succeptible de changer avec la langue.
   * @author sylvain
   */
  const updateExerciceAfterLanguageChange = () => {
    if ($exercicesParams.length !== 0) {
      interfaceParams = get(exercicesParams)[exerciseIndex]
      id = get(exercicesParams)[exerciseIndex].id || ''
    }
  }

  onMount(async () => {
    log('onMount:' + exercise.id)

    // Garde-fou « lien sans correction visible » : un élève peut atteindre la
    // vue prof (où la correction est toujours accessible) en retirant
    // `v=eleve` de l'URL. Si la graine courante fait partie des énoncés qu'il a
    // déjà reçus sans correction, on la rebat pour qu'il ne retrouve pas la
    // correction exacte de la copie rendue. cf. src/lib/stores/correctionGuard.ts
    if (
      $globalOptions.presMode !== 'recto' &&
      $globalOptions.presMode !== 'verso' &&
      isSeedBlockedForCorrection(exercise.id, exercise.seed)
    ) {
      exercise.seed = pickSeedNotServedWithoutCorrection(
        exercise.id,
        mathaleaGenerateSeed,
      )
    }

    document.addEventListener('newDataForAll', newData)
    document.addEventListener('setAllInteractif', setAllInteractif)
    document.addEventListener('removeAllInteractif', removeAllInteractif)
    document.addEventListener('updateAsyncEx', forceUpdate)
    document.addEventListener(
      'languageHasChanged',
      updateExerciceAfterLanguageChange,
    )
    await updateDisplay()
  })

  onDestroy(() => {
    rendering.destroyed = true
    invalidateRendering()
    log('ondestroy' + exercise.id)
    // Détruit l'objet exercice pour libérer la mémoire
    exercise.reinit() // MGu nécessaire pour supprimer les listeners
    exercise.destroy()
    for (const prop of Object.keys(exercise)) {
      Reflect.deleteProperty(exercise, prop)
    }
    document.removeEventListener('newDataForAll', newData)
    document.removeEventListener('setAllInteractif', setAllInteractif)
    document.removeEventListener('removeAllInteractif', removeAllInteractif)
    document.removeEventListener('updateAsyncEx', forceUpdate)
    document.removeEventListener(
      'languageHasChanged',
      updateExerciceAfterLanguageChange,
    )
    unsubscribeToChangesStore()
    subscribeExercicesParamsStore()
  })

  afterUpdate(async () => {
    log('afterUpdate:' + exercise.id)
    const revision = rendering.revision
    const renderedExercise = exercise
    if (exercise) {
      await tick()
      if (
        !isCurrentRendering(revision, renderedExercise) ||
        exercise.generationStatus === 'loading'
      )
        return
      mathaleaRenderDiv(divExercice)
      if (isInteractif) {
        await loadMathLive()
        if (!isCurrentRendering(revision, renderedExercise)) return
        if (exerciceContientCliqueFigure(exercise) && !isCorrectionVisible) {
          prepareExerciceCliqueFigure(exercise)
        }
        // Ne pas être noté sur un exercice dont on a déjà vu la correction
        if (
          isLocalStorageAvailable() &&
          exercise.id !== undefined &&
          exercise.seed !== undefined &&
          window.localStorage.getItem(`${exercise.id}|${exercise.seed}`) !=
            null &&
          isContentVisible &&
          !isCorrectionVisible
        ) {
          await newData()
          return
        }
      }
      if (exerciceHasNoSettings) {
        isSettingsVisible = false
      }
      await tick()
      if (isCurrentRendering(revision, renderedExercise)) {
        const state = exercise.generationStatus ?? 'ready'
        divExercice.setAttribute('data-exercise-render-state', state)
        divExercice.setAttribute(
          'data-exercise-render-revision',
          String(revision),
        )
        divExercice.setAttribute('data-exercise-seed', exercise.seed ?? '')
        divExercice.setAttribute(
          'data-exercise-interactive',
          isInteractif ? '1' : '0',
        )
        buttonScore?.toggleAttribute('disabled', state !== 'ready')
      }
    }
  })

  async function newData() {
    log('newData' + exercise.id)
    if (Object.prototype.hasOwnProperty.call(exercise, 'listeQuestions')) {
      if (isCorrectionVisible && isInteractif) isCorrectionVisible = false
      isExerciceChecked = false
      if (
        exercise !== undefined &&
        typeof exercise?.applyNewSeed === 'function'
      ) {
        exercise.applyNewSeed()
      }
      if (buttonScore) initButtonScore()
      if (divScore) divScore.innerHTML = ''
      if (
        isLocalStorageAvailable() &&
        exercise.id !== undefined &&
        isCorrectionVisible
      ) {
        window.localStorage.setItem(`${exercise.id}|${exercise.seed}`, 'true')
      }
      await updateDisplay()
    }
  }

  async function setAllInteractif() {
    if (exercise?.interactifReady) isInteractif = true
    await updateDisplay()
  }
  async function removeAllInteractif() {
    if (exercise?.interactifReady && !exercise.interactifObligatoire)
      isInteractif = false
    await updateDisplay()
  }

  function handleNewSettings(event: CustomEvent) {
    log('handleNewSettings:' + JSON.stringify(event.detail))
    if (!interfaceParams) {
      return
    }
    if (event.detail.nbQuestions) {
      exercise.nbQuestions = event.detail.nbQuestions
      interfaceParams.nbQuestions = exercise.nbQuestions
    }
    if (event.detail.duration) {
      exercise.duration = event.detail.duration
      interfaceParams.duration = exercise.duration
    }
    if (event.detail.sup !== undefined) {
      exercise.sup = event.detail.sup
      interfaceParams.sup = mathaleaHandleSup(exercise.sup)
    }
    if (event.detail.sup2 !== undefined) {
      exercise.sup2 = event.detail.sup2
      interfaceParams.sup2 = mathaleaHandleSup(exercise.sup2)
    }
    if (event.detail.sup3 !== undefined) {
      exercise.sup3 = event.detail.sup3
      interfaceParams.sup3 = mathaleaHandleSup(exercise.sup3)
    }
    if (event.detail.sup4 !== undefined) {
      exercise.sup4 = event.detail.sup4
      interfaceParams.sup4 = mathaleaHandleSup(exercise.sup4)
    }
    if (event.detail.sup5 !== undefined) {
      exercise.sup5 = event.detail.sup5
      interfaceParams.sup5 = mathaleaHandleSup(exercise.sup5)
    }
    if (
      event.detail.versionQcm !== undefined &&
      exercise instanceof ExerciceSimple
    ) {
      exercise.versionQcm = event.detail.versionQcm
      interfaceParams.versionQcm = exercise.versionQcm ? '1' : '0'
    }
    if (event.detail.alea !== undefined) {
      exercise.seed = event.detail.alea
      interfaceParams.alea = exercise.seed
    }
    if (event.detail.correctionDetaillee !== undefined) {
      exercise.correctionDetaillee = event.detail.correctionDetaillee
      interfaceParams.cd = exercise.correctionDetaillee ? '1' : '0'
    }
    if (event.detail.tipAvailable !== undefined) {
      exercise.tipAvailable = event.detail.tipAvailable
      isTipAvailable = event.detail.tipAvailable
      interfaceParams.tip = exercise.tipAvailable ? '1' : '0'
    }
    if (event.detail.calculatrices !== undefined) {
      exercise.calculatrices = event.detail.calculatrices
      interfaceParams.calc = exercise.calculatrices
    }
    if (event.detail.coeffBareme !== undefined) {
      exercise.coeffBareme = normaliseCoeffBareme(event.detail.coeffBareme)
      interfaceParams.coeffBareme = exercise.coeffBareme
    }
    exercicesParams.update((list) => {
      // interfaceParams a été mis à jour donc le store est à jour
      return list
    })
    if (isExerciceChecked) {
      // Si on change des réglages alors qu'on a déjà une note à l'exercice
      // alors on part sur de nouvelles données ainsi on efface le score et les réponses proposées
      isExerciceChecked = false
      newData()
    } else {
      updateDisplay()
    }
  }

  /**
   * Un custom element de l'énoncé (le sélecteur des questions de cours par
   * exemple) peut demander de nouveaux réglages en émettant l'événement DOM
   * `settings`, avec le même `detail` que le panneau latéral.
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

  async function updateDisplay(withNewVersion = true) {
    invalidateRendering()
    log('updateDisplay:' + exercise.id)
    if (
      exercise === null ||
      interfaceParams === undefined ||
      exercise.uuid !== interfaceParams.uuid
    ) {
      return
    }
    if (exercise.interactifObligatoire) isInteractif = true
    if (
      exercise.seed === undefined &&
      typeof exercise.applyNewSeed === 'function'
    ) {
      exercise.applyNewSeed()
    }
    seedrandom(exercise.seed, { global: true })
    if (exercise.typeExercice === 'simple' && withNewVersion) {
      mathaleaHandleExerciceSimple(
        exercise,
        Boolean(isInteractif),
        exerciseIndex,
      )
    }
    exercise.interactif = isInteractif
    if (interfaceParams.alea !== exercise.seed && exercise.seed !== undefined) {
      // on met à jour le storer seulement si besoin
      interfaceParams.alea = exercise.seed
      log('interfaceParams.alea updated' + interfaceParams.alea)
      exercicesParams.update((list) => {
        // interfaceParams a été mis à jour donc le store est à jour
        return list
      })
    }
    if (interfaceParams.interactif !== (isInteractif ? '1' : '0')) {
      // on met à jour le storer seulement si besoin
      interfaceParams.interactif = isInteractif ? '1' : '0'
      log('interfaceParams.interactif updated' + interfaceParams.interactif)
      exercicesParams.update((list) => {
        // interfaceParams a été mis à jour donc le store est à jour
        return list
      })
    }
    if (interfaceParams.cols !== columnsCount) {
      // on met à jour le storer seulement si besoin
      if (columnsCount === 1 && interfaceParams.cols !== undefined) {
        interfaceParams.cols = undefined
        log('interfaceParams.cols updated' + interfaceParams.cols)
        exercicesParams.update((list) => {
          // interfaceParams a été mis à jour donc le store est à jour
          return list
        })
      } else if (columnsCount > 1 && interfaceParams.cols !== columnsCount) {
        interfaceParams.cols = columnsCount
        log('interfaceParams.cols updated' + interfaceParams.cols)
        exercicesParams.update((list) => {
          // interfaceParams a été mis à jour donc le store est à jour
          return list
        })
      }
    }
    exercise.numeroExercice = exerciseIndex
    if (
      exercise.typeExercice !== 'simple' &&
      typeof exercise.nouvelleVersionWrapper === 'function' &&
      withNewVersion
    ) {
      exercise.nouvelleVersionWrapper(exerciseIndex)
    }
    // La génération modifie les listes en place : notifier Svelte une fois
    // qu'elles sont remplies, même si aucun autre réglage n'a changé.
    exercise = exercise
    refreshPointsMax()
    mathaleaUpdateUrlFromExercicesParams()
    await adjustMathalea2dFiguresWidth()
  }

  /**
   * Lorsque tous les solveurs de l'exercice sont terminés, l'élève n'a plus
   * rien à saisir : l'exercice est vérifié sans clic sur le bouton.
   */
  function verifieSiSolveursTermines(conteneur: HTMLElement) {
    if (
      !isInteractif ||
      isCorrectionVisible ||
      isExerciceChecked ||
      !tousLesSolveursSontTermines(exercise, conteneur)
    )
      return
    verifExercice()
  }

  function verifExercice() {
    if (divExercice?.dataset.exerciseRenderState !== 'ready') return
    exercise.nbTentativesVerification =
      (exercise.nbTentativesVerification ?? 0) + 1
    if (
      exercise.nbTentativesVerification === 1 &&
      exerciceAUneUniteManquante(exercise)
    ) {
      afficheAlerteUniteManquante(divScore)
      return
    }
    isCorrectionVisible = true
    isExerciceChecked = true
    resultsByExercice.update((l) => {
      const indice = exercise.numeroExercice ?? 0
      const result = {
        ...exerciceInteractif(exercise, divScore, buttonScore),
        indice,
      }
      if (result != null) {
        l[indice] = result
      }
      return l
    })
  }

  function initButtonScore() {
    buttonScore.classList.remove(...buttonScore.classList)
    buttonScore.classList.add(
      'inline-flex',
      'self-start',
      'w-auto',
      'px-6',
      'py-2.5',
      'ml-6',
      'bg-coopmaths-action',
      'dark:bg-coopmathsdark-action',
      'text-coopmaths-canvas',
      'dark:text-coopmathsdark-canvas',
      'font-medium',
      'text-xs',
      'leading-tight',
      'uppercase',
      'rounded',
      'shadow-md',
      'transform',
      'hover:bg-coopmaths-action-lightest',
      'dark:hover:bg-coopmathsdark-action-lightest',
      'hover:shadow-lg',
      'focus:bg-coopmaths-action-lightest',
      'dark:focus:bg-coopmathsdark-action-lightest',
      'focus:shadow-lg',
      'focus:outline-none',
      'focus:ring-0',
      'active:bg-coopmaths-action-lightest',
      'dark:active:bg-coopmathsdark-action-lightest',
      'active:shadow-lg',
      'transition',
      'duration-150',
      'ease-in-out',
      'checkReponses',
    )
  }

  /**
   * Recherche toutes les figures ayant la classe `mathalea2d` et réduit leur largeur à 95% de la valeur
   * maximale du div reperé par l'ID `consigne<X>-0` où `X` est l'indice de l'exercice
   * @param {boolean} initialDimensionsAreNeeded si `true`, les valeurs initiales sont rechargées ()`false` par défaut)
   * @author sylvain
   */
  async function adjustMathalea2dFiguresWidth(
    initialDimensionsAreNeeded: boolean = false,
  ) {
    await tick()
    const mathalea2dFigures =
      document?.querySelectorAll<SVGElement>('.mathalea2d')
    if (
      mathalea2dFigures !== null &&
      mathalea2dFigures !== undefined &&
      mathalea2dFigures.length !== 0
    ) {
      for (let k = 0; k < mathalea2dFigures.length; k++) {
        if (initialDimensionsAreNeeded) {
          // réinitialisation
          const initialWidth = mathalea2dFigures[k].getAttribute(
            'data-width-initiale',
          )
          const initialHeight = mathalea2dFigures[k].getAttribute(
            'data-height-initiale',
          )
          mathalea2dFigures[k].setAttribute('width', initialWidth ?? '0')
          mathalea2dFigures[k].setAttribute('height', initialHeight ?? '0')
          // les éléments Katex des figures SVG
          if (
            mathalea2dFigures[k] != null &&
            mathalea2dFigures[k].parentElement != null
          ) {
            const eltsInFigures =
              mathalea2dFigures[k].parentElement?.querySelectorAll<HTMLElement>(
                'div.divLatex',
              ) || []
            for (const elt of eltsInFigures) {
              const e = elt
              e.style.setProperty('top', e.dataset.top + 'px')
              e.style.setProperty('left', e.dataset.left + 'px')
            }
          }
        }
        const consigneDiv = mathalea2dFigures[k].closest('[id^="consigne"]')
        if (
          consigneDiv &&
          mathalea2dFigures[k].clientWidth > consigneDiv.clientWidth
        ) {
          const coef =
            (consigneDiv.clientWidth * 0.95) / mathalea2dFigures[k].clientWidth
          const width = mathalea2dFigures[k].getAttribute('width')
          const height = mathalea2dFigures[k].getAttribute('height')
          if (!mathalea2dFigures[k].dataset.widthInitiale && width != null) {
            mathalea2dFigures[k].dataset.widthInitiale = width
          }
          if (!mathalea2dFigures[k].dataset.heightInitiale && height != null) {
            mathalea2dFigures[k].dataset.heightInitiale = height
          }
          mathalea2dFigures[k].setAttribute(
            'height',
            (
              Number(mathalea2dFigures[k].dataset.heightInitiale) * coef
            ).toString(),
          )
          mathalea2dFigures[k].setAttribute(
            'width',
            (
              Number(mathalea2dFigures[k].dataset.widthInitiale) * coef
            ).toString(),
          )

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
              e.style.setProperty('top', (initialTop * coef).toString() + 'px')
              e.style.setProperty(
                'left',
                (initialLeft * coef).toString() + 'px',
              )
            }
          }
        }
      }
    }
  }
  // pour recalculer les tailles lors d'un changement de dimension de la fenêtre
  window.onresize = async () => {
    await adjustMathalea2dFiguresWidth(true)
  }

  async function handleExerciseRemoved(event: CustomEvent) {
    if ($exercicesParams.length === 0) {
      toggleSidenav(true)
    }
    await updateDisplay()
  }

  /**
   * Applique l'affichage ou le masquage de la correction.
   * Utilisée par la barre de titre (vue bureau) et par les boutons placés
   * sous l'exercice (vue mobile).
   */
  async function applyCorrectionVisibility(
    nextIsCorrectionVisible: boolean,
    nextIsContentVisible: boolean = true,
  ) {
    isContentVisible = nextIsContentVisible
    isCorrectionVisible = nextIsCorrectionVisible
    if (
      isLocalStorageAvailable() &&
      exercise.id !== undefined &&
      isCorrectionVisible
    ) {
      window.localStorage.setItem(`${exercise.id}|${exercise.seed}`, 'true')
    }
    if (
      nextIsCorrectionVisible &&
      !isExerciceChecked &&
      isInteractif &&
      !exercise.interactifObligatoire
    ) {
      // On ne désactive l'interactivité que si on affiche la correction
      // d'un exercice interactif pas encore vérifié (contournement de la
      // vérification) : la masquer, ou la (re)montrer après vérification,
      // ne doit pas changer l'état d'interactivité.
      isInteractif = false
      exercise.interactif = isInteractif
      await updateDisplay()
    }
    await adjustMathalea2dFiguresWidth()
  }
</script>

<div
  class="z-0 flex-1"
  bind:this={divExercice}
  data-exercise-index={exerciseIndex}
  data-exercise-render-state="loading"
>
  <HeaderExerciceVueProf
    {...headerProps}
    on:clickVisible={(event) => {
      isVisible = event.detail.isVisible
    }}
    on:clickSettings={(event) =>
      (isSettingsVisible = event.detail.isSettingsVisible)}
    on:clickCorrection={async (event) =>
      await applyCorrectionVisibility(
        event.detail.isCorrectionVisible,
        event.detail.isContentVisible,
      )}
    on:clickInteractif={async (event) => {
      isInteractif = exercise.interactifObligatoire
        ? true
        : event.detail.isInteractif
      exercise.interactif = isInteractif
      exercicesParams.update((params) => {
        params[exerciseIndex].interactif = isInteractif ? '1' : '0'
        return params
      })
      await updateDisplay()
    }}
    on:clickNewData={newData}
    interactifObligatoire={exercise.interactifObligatoire}
    interactifReady={Boolean(
      exercise?.interactifReady &&
      !isCorrectionVisible &&
      headerProps?.interactifReady,
    )}
    on:exerciseRemoved={handleExerciseRemoved}
  />

  {#if isVisible}
    <div class="flex flex-col-reverse lg:flex-row w-full">
      <div
        class="flex flex-col justify-start items-stretch relative {isSettingsVisible
          ? 'w-full lg:w-3/4'
          : 'w-full'} duration-500"
        id="exercice{exerciseIndex}"
      >
        <div
          class="print-hidden hidden md:flex flex-row justify-start text-coopmaths-struct dark:text-coopmathsdark-struct text-xs mt-2 pl-0 md:pl-2"
        >
          <button
            class={columnsCount > 1 ? 'visible' : 'invisible'}
            type="button"
            aria-label="Diminuer le nombre de colonnes"
            title="Diminuer le nombre de colonnes"
            on:click={() => {
              columnsCount--
              updateDisplay(false)
            }}
          >
            <i
              class=" text-coopmaths-action hover:text-coopmaths-action-darkest dark:text-coopmathsdark-action dark:hover:text-coopmathsdark-action-darkest bx ml-2 bx-xs bx-minus"
            ></i>
          </button>
          <i class="bx ml-1 bx-xs bx-columns"></i>
          <button
            type="button"
            aria-label="Augmenter le nombre de colonnes"
            title="Augmenter le nombre de colonnes"
            on:click={() => {
              columnsCount++
              updateDisplay(false)
            }}
          >
            <i
              class="text-coopmaths-action hover:text-coopmaths-action-darkest dark:text-coopmathsdark-action dark:hover:text-coopmathsdark-action-darkest bx ml-1 bx-xs bx-plus"
            ></i>
          </button>
        </div>
        <article
          use:ecouteSolveursTermines={verifieSiSolveursTermines}
          class="lg:text-base relative w-full max-w-none"
          style="font-size: {(
            $globalOptions.z || 1
          ).toString()}rem; line-height: calc({$globalOptions.z || 1});"
          use:ecouteReglagesDeLEnonce
        >
          {#if exercise.tip && exercise.tip.length > 0 && isTipAvailable}
            <div class="ml-2 lg:ml-5 mt-4">
              <ButtonTextAction
                text="Indice"
                icon="bx-help-circle"
                class="py-[2px] px-2 text-[0.7rem]"
                inverted={true}
                on:click={() => {
                  isIndiceModalDisplayed = true
                }}
              />
            </div>
            <BasicClassicModal
              bind:isDisplayed={isIndiceModalDisplayed}
              icon="bx-help-circle"
            >
              <span slot="header">Indice</span>
              <!-- eslint-disable-next-line svelte/no-at-html-tags -->
              <div slot="content" class="text-left">{@html exercise.tip}</div>
            </BasicClassicModal>
          {/if}
          <div class="mt-6 mb-4 w-full max-w-none">
            {#key exercise.key + '-' + exerciseIndex}
              {#if typeof exercise.consigne !== 'undefined' && exercise.consigne.length !== 0}
                <div>
                  <p
                    class="mt-2 mb-2 ml-2 lg:mx-5 text-coopmaths-corpus dark:text-coopmathsdark-corpus"
                  >
                    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                    {@html mathaleaFormatExercice(exercise.consigne)}
                  </p>
                </div>
              {/if}
              {#if exercise.introduction}
                <div>
                  <p
                    class="mt-2 mb-2 ml-2 lg:mx-5 text-coopmaths-corpus dark:text-coopmathsdark-corpus"
                  >
                    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                    {@html exercise.introduction}
                  </p>
                </div>
              {/if}
            {/key}
          </div>
          <div
            style="columns: {columnsCount.toString()}"
            class="mt-4 lg:mt-6 mb-5 w-full max-w-none"
          >
            <ul
              class="{exercise.listeQuestions.length === 1 ||
              !exercise.listeAvecNumerotation
                ? 'list-none'
                : 'numbered-list'} w-full max-w-none list-inside mb-2 mx-0 marker:text-coopmaths-struct dark:marker:text-coopmathsdark-struct marker:font-bold"
            >
              {#each exercise.listeQuestions as item, i (exercise.key + '-' + exerciseIndex + '-' + i)}
                <div
                  style="break-inside:avoid"
                  id="consigne{exerciseIndex}-{i}"
                  class="w-full max-w-none grid grid-cols-1 auto-cols-min gap-1 lg:gap-4 mb-2 lg:mb-4 text-coopmaths-corpus dark:text-coopmathsdark-corpus"
                >
                  <li
                    id="exercice{exerciseIndex}Q{i}"
                    style="line-height: {exercise.spacing || 1}"
                  >
                    {#if exercise.questionRefs?.[i]}
                      <span
                        class="text-xs font-mono text-coopmaths-struct dark:text-coopmathsdark-struct mr-2"
                        >{exercise.questionRefs[i]}</span
                      ><br />
                    {/if}
                    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                    {@html mathaleaFormatExercice(item)}
                  </li>
                  {#if isCorrectionVisible}
                    <!-- EE : remplacement de ce class pour celui du dessous class="relative border-l-coopmaths-struct dark:border-l-coopmathsdark-struct border-l-[3px] text-coopmaths-corpus dark:text-coopmathsdark-corpus mt-6 lg:mt-2 mb-6 py-2 pl-4"  -->
                    <div
                      class="relative text-coopmaths-corpus dark:text-coopmathsdark-corpus py-2 pl-[calc(1rem+3px)] mt-6 md:mt-4"
                      id="correction-exo{exerciseIndex}-Q{i}"
                      use:renderDiv={exercise.listeCorrections[i]}
                    >
                      <div
                        class={exercise.consigneCorrection.length !== 0
                          ? 'container bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark px-4 py-2 mr-2 ml-6 mb-2 font-light relative w-2/3'
                          : 'hidden'}
                      >
                        <div
                          class="{exercise.consigneCorrection.length !== 0
                            ? 'container'
                            : 'hidden'} absolute top-4 -left-4"
                        >
                          <i
                            class="bx bx-bulb scale-200 text-coopmaths-warn-dark dark:text-coopmathsdark-warn-dark"
                          ></i>
                        </div>
                        <div class="">
                          <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                          {@html exercise.consigneCorrection}
                        </div>
                      </div>
                      <div
                        class="w-full max-w-none overflow-x-scroll overflow-y-hidden md:overflow-x-auto py-1"
                        style="line-height: {exercise.spacingCorr ||
                          1}; break-inside:avoid"
                      >
                        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                        {@html mathaleaFormatExercice(
                          exercise.listeCorrections[i],
                        )}
                      </div>
                      <!-- Avant le commit du 28/03/23, il y avait une mise en page plus complexe
                      et cela posait problème au changement des paramètres avec la correction visible -->
                      <!-- <div class="absolute border-coopmaths-struct dark:border-coopmathsdark-struct top-0 left-0 border-b-[3px] w-10" /> -->
                      <div
                        class="absolute flex flex-row py-[1.5px] px-3 rounded-t-md justify-center items-center left-0 -top-3.75 bg-coopmaths-struct dark:bg-coopmathsdark-struct font-semibold text-xs text-coopmaths-canvas dark:text-coopmathsdark-canvas"
                      >
                        Correction
                      </div>
                      <!-- Barre verticale et petit trait du bas dessinés par un seul
                      élément : avec une bordure gauche sur le conteneur, Firefox
                      les décalait en affichage sur plusieurs colonnes (#9832) -->
                      <div
                        class="absolute border-coopmaths-struct dark:border-coopmathsdark-struct inset-y-0 left-0 border-l-[3px] border-b-[3px] w-4"
                      ></div>
                    </div>
                  {/if}
                </div>
              {/each}
            </ul>
          </div>
        </article>

        {#if isInteractif && interactifReady && !isCorrectionVisible && isContentVisible}
          <button
            id="verif{exerciseIndex}"
            type="submit"
            disabled
            on:click={verifExercice}
            bind:this={buttonScore}
            >Vérifier {numberOfAnswerFields > 1
              ? 'les réponses'
              : 'la réponse'}</button
          >
        {/if}
        <div bind:this={divScore}></div>
        {#if isMobileView}
          <!-- Actions les plus courantes, répétées sous l'exercice pour rester
               à portée de pouce sans remonter jusqu'à la barre de titre -->
          <div
            class="print-hidden flex flex-row flex-wrap items-center gap-2 mt-4 mb-8 ml-6"
          >
            {#if exercise.listeCorrections.length > 0 && !isInteractif}
              <ButtonTextAction
                text={isCorrectionVisible
                  ? 'Masquer la correction'
                  : 'Afficher la correction'}
                icon={isCorrectionVisible ? 'bx-hide' : 'bx-check-circle'}
                inverted={true}
                class="py-2 px-3 text-xs rounded"
                on:click={() => applyCorrectionVisibility(!isCorrectionVisible)}
              />
            {/if}
            {#if !exercise.pasDeVersionAleatoire}
              <ButtonTextAction
                text="Nouvelles données"
                icon="bx-refresh"
                inverted={!(isInteractif && isExerciceChecked)}
                class={isInteractif && isExerciceChecked
                  ? 'py-2 px-3 text-xs font-medium shadow-md rounded'
                  : 'py-2 px-3 text-xs rounded'}
                on:click={newData}
              />
            {/if}
          </div>
        {/if}
      </div>
      <Settings
        exercice={exercise}
        bind:isVisible={isSettingsVisible}
        exerciceIndex={exerciseIndex}
        isInteractif={Boolean(isInteractif)}
        {pointsMax}
        isCalculatriceProposee={true}
        on:settings={handleNewSettings}
      />
    </div>
  {/if}
</div>

<style>
  li {
    break-inside: avoid;
  }
</style>
