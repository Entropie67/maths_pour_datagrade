<script lang="ts">
  //
  //
  // /!\ Il reste à traiter ReferentielEnding.svelte qui contient encore des accès au generalStore
  //     Il faut faire remonter les demandes à Start.svelte pour qu'il reste le seul avec ces accès
  //        et faire en sorte que ReferentielEnding.svelte ne gère que de l'affichage en bon presentationalComponent
  // /!\ Chip.svelte, SearchInput.svelte et Filtres.svelte contiennet encore des createEventDispatcher, dans l'idéal il
  //     faudrait plutôtqu'ils fassent remonter les changements jusqu'à SideMenu.svelte via une {function} pour qu'ils
  //     les fassent redescendre ensuite par des {attributs}
  //
  import {
    afterUpdate,
    beforeUpdate,
    onDestroy,
    onMount,
    setContext,
    tick,
  } from 'svelte'
  import { get } from 'svelte/store'
  import { saveFormatNumerique } from '../../../lib/stores/storage'
  import { qcmCamExportAll } from '../../../../src/lib/qcmCam'
  import appsTierce from '../../../json/referentielAppsTierce.json'
  import {
    buildCapytalePreviewURL,
    buildMathAleaURL,
  } from '../../../lib/components/urls'
  import { downloadFile } from '../../../lib/files'
  import handleCapytale from '../../../lib/handleCapytale'
  import { sendActivityParams } from '../../../lib/handleRecorder'
  import { usesHostActivityProtocol } from '../../../lib/recorder'
  import {
    getExercisesFromExercicesParams,
    mathaleaHandleExerciceSimple,
    mathaleaUpdateExercicesParamsFromUrl,
    mathaleaUpdateUrlFromExercicesParams,
  } from '../../../lib/mathalea'
  import { hasSeenTour, startTour } from '../../../lib/onboarding/tour'
  import { canOptions } from '../../../lib/stores/canStore'
  import {
    darkMode,
    exercicesParams,
    interactiviteParExercice,
    previousView,
  } from '../../../lib/stores/generalStore'
  import { globalOptions } from '../../../lib/stores/globalOptions'
  import {
    getLang,
    localisedIDToUuid,
    referentielLocale,
  } from '../../../lib/stores/languagesStore'
  import type {
    InterfaceGlobalOptions,
    InterfaceParams,
  } from '../../../lib/types'
  import { interactivityTypeToCustomElementFormat } from '../../../lib/types'
  import type { CanOptions } from '../../../lib/types/can'
  import type { Language } from '../../../lib/types/languages'
  import { ALLOWED_LANGUAGES, isLanguage } from '../../../lib/types/languages'
  import { type AppTierceGroup } from '../../../lib/types/referentiels'
  import type { VueType } from '../../../lib/VueType'
  import Footer from '../../Footer.svelte'
  import Keyboard from '../../keyboard/Keyboard.svelte'
  import { SM_BREAKPOINT } from '../../keyboard/lib/sizes'
  import BasicClassicModal from '../../shared/modal/BasicClassicModal.svelte'
  import Sidenav from '../../shared/sidenav/Sidenav.svelte'
  import MobileView from '../mobile/MobileView.svelte'
  import TypstAddExerciseModal from '../typst/addExercise/TypstAddExerciseModal.svelte'
  import ButtonBackToTop from './presentationalComponents/ButtonBackToTop.svelte'
  import MobileCarouselCards from './presentationalComponents/carousel/MobileCarouselCards.svelte'
  import Exercices from './presentationalComponents/Exercices.svelte'
  import Header from './presentationalComponents/header/Header.svelte'
  import SideMenuWrapper from './presentationalComponents/header/SideMenuWrapper.svelte'
  import ModalCapytalSettings from './presentationalComponents/modalCapytalSettings/ModalCapytalSettings.svelte'
  import ModalThirdApps from './presentationalComponents/ModalThirdApps.svelte'
  import Placeholder from './presentationalComponents/Placeholder.svelte'
  import SideMenu from './presentationalComponents/sideMenu/SideMenu.svelte'

  const lang = getLang()
  let isNavBarVisible: boolean = true
  let innerWidth = window.innerWidth
  let isBackToTopButtonVisible = false
  let selectedThirdApps: string[]
  let thirdAppsChoiceModal: BasicClassicModal | undefined
  let showThirdAppsChoiceDialog = false
  let isMd: boolean
  let isMobileViewUsed: boolean = false
  // Bascule manuelle depuis le menu général de la vue mobile (« Afficher comme
  // sur un ordinateur ») : force la vue bureau tant que la page n'est pas rechargée.
  let forceDesktopView: boolean = false
  let localeValue: Language = get(referentielLocale)
  let isSidenavOpened: boolean = true

  const unsubscribeToReferentielLocale = referentielLocale.subscribe(
    (value) => {
      localeValue = value
    },
  )

  let debug = false
  function log(str: string) {
    if (debug || window.logDebug > 1) {
      console.info(str)
    }
  }

  beforeUpdate(() => {
    log('Start.svelte beforeUpdate')
  })

  afterUpdate(() => {
    log('Start.svelte afterUpdate')
  })

  onMount(async () => {
    log('Start.svelte onMount')
    await tick() // globalOptions n'est pas encore initialisé si on n'attend pas
    if ($globalOptions.recorder === 'capytale') {
      handleCapytale()
    }
    addScrollListener()
    maybeStartOnboardingTour()
    log('Fin Start.svelte onMount')
  })

  // Ne se déclenche qu'une fois par poste (localStorage), et uniquement sur
  // la page d'accueil « vierge » en mode bureau (pas dans Capytale/Moodle,
  // pas si des exercices sont déjà chargés depuis une URL partagée).
  // Pas non plus en localhost (hors navigateur piloté par un test e2e) : la
  // visite guidée s'y déclencherait à chaque rechargement pendant le
  // développement, tant que le localStorage n'a pas encore mémorisé qu'elle a
  // été vue.
  let onboardingTourTriggered = false
  function maybeStartOnboardingTour() {
    if (
      onboardingTourTriggered ||
      hasSeenTour() ||
      $globalOptions.recorder ||
      !isMd ||
      $exercicesParams.length !== 0 ||
      (window.location.hostname === 'localhost' && !navigator.webdriver)
    ) {
      return
    }
    onboardingTourTriggered = true
    setTimeout(startTour, 400)
  }

  onDestroy(() => {
    log('Start.svelte destroyed')
    unsubscribeToReferentielLocale()
  })

  // Spécifique à Capytale
  let isSettingsDialogDisplayed = false
  type ExternalCapytaleView = 'typst' | 'diaporama' | 'tbi'

  /**
   * Les exports de Capytale doivent rester hors de son iframe : changer `v`
   * ici ferait enregistrer cette vue comme celle de l'activité Capytale.
   */
  function openCapytaleViewInNewTab(view: ExternalCapytaleView) {
    window
      .open(buildMathAleaURL({ view, recorder: true }).toString(), '_blank')
      ?.focus()
  }

  // Gestion de la graine
  function buildUrlAndOpenItInNewTab(status: 'eleve' | 'usual') {
    const view =
      status === 'eleve' ? ($canOptions.isChoosen ? 'can' : 'eleve') : undefined
    const url = buildCapytalePreviewURL(view)
    window.open(url, '_blank')?.focus()
  }

  function toggleCan() {
    if ($canOptions.isChoosen) {
      $globalOptions.setInteractive = '1'
    }
  }

  function showSettingsDialog() {
    isSettingsDialogDisplayed = true
  }

  const handleLanguage = (lang: string) => {
    let selectedLanguage: Language = ALLOWED_LANGUAGES[0]
    // on se déplace circulairement dans le tableau allowedLanguages
    // idée prise ici :https://dev.to/turneremma21/circular-access-of-array-in-javascript-j52
    if (isLanguage(lang)) {
      selectedLanguage = lang
    } else {
      window.notify(`${lang} is not allowed as language.`, {})
    }

    referentielLocale.set(selectedLanguage)
    const currentRefToUuid = localisedIDToUuid[get(referentielLocale)]
    exercicesParams.update((list) => {
      for (let i = 0; i < list.length; i++) {
        const localeID = (
          Object.keys(currentRefToUuid) as (keyof typeof currentRefToUuid)[]
        ).find((key) => {
          return currentRefToUuid[key] === list[i].uuid
        })
        const frenchID = (
          Object.keys(
            localisedIDToUuid['fr-FR'],
          ) as (keyof (typeof localisedIDToUuid)['fr-FR'])[]
        ).find((key) => {
          return localisedIDToUuid['fr-FR'][key] === list[i].uuid
        })
        list[i].id =
          localeID !== undefined && localeID.length !== 0 ? localeID : frenchID
      }
      return list
    })
    const event = new window.Event('languageHasChanged', {
      bubbles: true,
    })
    document.dispatchEvent(event)
    mathaleaUpdateUrlFromExercicesParams()
  }

  $: {
    isNavBarVisible = $globalOptions.v !== 'l'
    updateSelectedThirdApps()
    isMd = innerWidth >= SM_BREAKPOINT
    // La vue mobile dédiée remplace la vue par défaut sur téléphone, sauf dans
    // les intégrations (Capytale, Moodle…) qui ont leur propre barre d'outils,
    // ou si l'utilisateur a demandé la vue bureau depuis le menu général.
    isMobileViewUsed = !isMd && !$globalOptions.recorder && !forceDesktopView
  }

  function addScrollListener() {
    function updateBackToTopButtonVisibility() {
      isBackToTopButtonVisible =
        document.body.scrollTop > 500 ||
        document.documentElement.scrollTop > 500
    }
    window.addEventListener('scroll', () => updateBackToTopButtonVisibility())
  }

  /* MGu empeche le zoom sur double touch sur IPAD */
  document.addEventListener('gesturestart', function (e) {
    e.preventDefault()
  })

  /* Pour que les apps puissent fermer la sidenav */
  window.addEventListener('message', (event) => {
    if (event.data?.type === 'closeSidenav') {
      if (isSidenavOpened) toggleSidenav(false)
    }
  })

  function updateSelectedThirdApps() {
    const appsTierceReferentielArray: AppTierceGroup[] =
      Object.values(appsTierce)
    const uuidList: string[] = $exercicesParams.map(
      (exerciceParams) => exerciceParams.uuid,
    )
    selectedThirdApps = []
    for (const group of appsTierceReferentielArray) {
      for (const app of group.liste) {
        if (uuidList.includes(app.uuid)) {
          selectedThirdApps.push(app.uuid)
        }
      }
    }
  }

  function zoomUpdate(plusMinus: '+' | '-') {
    let zoom = Number($globalOptions.z)
    if (plusMinus === '+') zoom = Number.parseFloat((zoom + 0.1).toFixed(1))
    if (plusMinus === '-') zoom = Number.parseFloat((zoom - 0.1).toFixed(1))
    globalOptions.update((params) => {
      params.z = zoom.toString()
      return params
    })
  }

  function setAllInteractive(isAllInteractive: boolean) {
    let eventName: string
    if (isAllInteractive) {
      $globalOptions.setInteractive = '1'
      eventName = 'setAllInteractif'
    } else {
      $globalOptions.setInteractive = '0'
      eventName = 'removeAllInteractif'
    }
    const event = new window.Event(eventName, { bubbles: true })
    document.dispatchEvent(event)
    saveFormatNumerique(isAllInteractive)
    mathaleaUpdateUrlFromExercicesParams()
    if (isAllInteractive) {
      const sansVersionInteractive = listeExercicesSansVersionInteractive()
      if (sansVersionInteractive.length > 0) {
        modeModaleSansVersionInteractive = 'numerique'
        exercicesSansVersionInteractive = sansVersionInteractive
        showSansVersionInteractiveModal = true
      }
    }
  }

  /**
   * Modale prévenant que des exercices n'ont pas de version interactive :
   * ils restent en version papier (bascule Numérique) ou ne donnent lieu à
   * aucune note (Capytale, toujours en mode numérique).
   */
  let showSansVersionInteractiveModal = false
  let modeModaleSansVersionInteractive: 'numerique' | 'capytale' = 'numerique'
  let exercicesSansVersionInteractive: { id: string; titre: string }[] = []
  const exercicesSansNoteDejaSignales = new Set<string>()

  function listeExercicesSansVersionInteractive() {
    const parId = new Map<string, string>()
    $exercicesParams.forEach((_, i) => {
      const info = $interactiviteParExercice[i]
      if (info && !info.interactifReady) parId.set(info.id, info.titre)
    })
    return [...parId].map(([id, titre]) => ({ id, titre }))
  }

  /**
   * Sous Capytale, ouvre la modale quand un exercice non noté apparaît (une
   * seule fois par exercice) et y liste tous ceux de l'activité.
   */
  function signaleExercicesSansNote() {
    const sansNote = listeExercicesSansVersionInteractive()
    const nouveaux = sansNote.filter(
      ({ id }) => !exercicesSansNoteDejaSignales.has(id),
    )
    if (nouveaux.length === 0) return
    nouveaux.forEach(({ id }) => exercicesSansNoteDejaSignales.add(id))
    exercicesSansVersionInteractive = sansNote
    modeModaleSansVersionInteractive = 'capytale'
    showSansVersionInteractiveModal = true
  }
  $: if ($globalOptions.recorder === 'capytale') {
    // dépendances explicites : la liste et ses capacités interactives
    void [$exercicesParams, $interactiviteParExercice]
    signaleExercicesSansNote()
  }

  function newDataForAll() {
    const newDataForAll = new window.Event('newDataForAll', { bubbles: true })
    document.dispatchEvent(newDataForAll)
  }

  function trash() {
    exercicesParams.set([])
    toggleSidenav(true)
  }

  function handleExport(vue: VueType) {
    $previousView = ''
    globalOptions.update((params) => {
      params.v = vue
      return params
    })
  }

  function addExercise(uuid: string, id: string) {
    const newExercise: InterfaceParams = { uuid, id }
    if (
      $globalOptions.recorder === 'capytale' ||
      $globalOptions.setInteractive === '1'
    ) {
      newExercise.interactif = '1'
    }
    exercicesParams.update((list) => [...list, newExercise])
  }

  /** Modale « Ajouter un exercice » (Ctrl/Cmd+K), même modale que la vue Typst */
  let isAddExerciseModalOpen = false

  function addExerciseFromModal(params: InterfaceParams) {
    if (
      $globalOptions.recorder === 'capytale' ||
      $globalOptions.setInteractive === '1'
    ) {
      params = { ...params, interactif: '1' }
    }
    exercicesParams.update((list) => [...list, params])
  }

  function handleGlobalKeydown(event: KeyboardEvent) {
    if (
      (event.ctrlKey || event.metaKey) &&
      !event.shiftKey &&
      !event.altKey &&
      event.key.toLowerCase() === 'k'
    ) {
      event.preventDefault()
      isAddExerciseModalOpen = true
    }
  }

  function backToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function importExercises(urlFeuilleEleve: string) {
    const tempRecorder = $globalOptions.recorder
    let url = urlFeuilleEleve.replace('&v=confeleve', '')
    url = url.replace('&v=eleve', '&recorder=' + $globalOptions.recorder)
    if (url.includes('v=can')) {
      $canOptions.isChoosen = true
    }
    url = url.replace('&v=can', '&recorder=' + $globalOptions.recorder)
    // presMode|setInteractive|isSolutionAccessible|isInteractiveFree|oneShot|twoColumns|isTitleDisplayed|isReferenceDisplayed
    if (url.includes('coopmaths.fr/alea') || url.includes('mathalea.fr/alea')) {
      const options = mathaleaUpdateExercicesParamsFromUrl(url)
      if (options !== null) {
        // On utilise update() pour fusionner les options au lieu de les remplacer complètement
        // On force presMode à 'un_exo_par_page' lors de l'import
        globalOptions.update((current) => {
          return {
            ...current,
            ...options,
            recorder: tempRecorder,
            presMode: 'un_exo_par_page',
            title: '',
          }
        })
      } else {
        alert('URL non valide !')
      }
    }
  }

  /**
   * Gestion des référentiels
   */
  // Contexte pour le modal des apps tierces
  setContext('thirdAppsChoiceContext', {
    toggleThirdAppsChoiceDialog: () => {
      showThirdAppsChoiceDialog = !showThirdAppsChoiceDialog
      if (showThirdAppsChoiceDialog === false && thirdAppsChoiceModal) {
        thirdAppsChoiceModal.closeModal()
      }
    },
  })

  function updateParams(params: {
    globalOptions: InterfaceGlobalOptions
    canOptions: CanOptions
  }) {
    // MGu d'après bugsnag, il arrive que params.canOptions soit null!
    if (params.canOptions) canOptions.set(params.canOptions)
    if (params.globalOptions) globalOptions.set(params.globalOptions) // en dernier car c'est sa modification qui déclenche la mise à jour de l'url dans App.svelte qui prévient ensuite Capytale d'une mise à jour
  }

  function toggleSidenav(forceOpening: boolean): void {
    if (forceOpening) {
      isSidenavOpened = true
    } else {
      isSidenavOpened = !isSidenavOpened
    }
  }

  let showQcmCamExportModal = false
  let qcmCamFilename = 'questions.txt'
  let qcmCamContent = ''

  function downloadQcmCam() {
    const filename = qcmCamFilename.trim()
    if (!filename) return
    downloadFile(
      qcmCamContent,
      /\.txt$/i.test(filename) ? filename : `${filename}.txt`,
    )
    showQcmCamExportModal = false
  }

  async function exportQcmCam(): Promise<void> {
    const exercises = await getExercisesFromExercicesParams()
    const exercisesQcms = exercises.filter((exercise, index) => {
      if (exercise.typeExercice === 'simple') {
        mathaleaHandleExerciceSimple(exercise, exercise.interactif, index)
      } else {
        exercise.nouvelleVersion()
      }
      const questionsQcm = exercise.autoCorrection.filter(
        (el) =>
          interactivityTypeToCustomElementFormat(el.formatInteractif) ===
          'mathalea-qcm',
      ).length
      return questionsQcm !== 0
    })

    if (exercisesQcms.length === 0) {
      alert(
        "Il n'y a pas encore d'export vers QCM Cam pour les exercices sélectionnés",
      )
      return
    }
    const content = qcmCamExportAll(exercisesQcms)
    if (content === '{}') {
      alert(
        "Il n'y a pas encore d'export vers QCM Cam pour les exercices sélectionnés",
      )
      return
    }
    qcmCamContent = content
    showQcmCamExportModal = true
  }
</script>

<svelte:window bind:innerWidth onkeydown={handleGlobalKeydown} />
{#if $globalOptions.v === '' || $globalOptions.v === undefined || $globalOptions.v === 'l'}
  <div
    class="{$darkMode.isActive
      ? 'dark'
      : ''} relative flex w-screen {isMobileViewUsed
      ? 'min-h-screen'
      : 'h-screen'} bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
    id="startComponent"
  >
    <div class="flex-1 flex flex-col w-full md:overflow-hidden">
      {#if isMobileViewUsed}
        <!-- ====================================================================================
                  VUE MOBILE (téléphone)
========================================================================================= -->
        <MobileView
          {newDataForAll}
          {setAllInteractive}
          {trash}
          {handleExport}
          useDesktopView={() => (forceDesktopView = true)}
        />
      {:else}
        <Header
          {isNavBarVisible}
          isExerciseDisplayed={$exercicesParams.length !== 0}
          {zoomUpdate}
          {setAllInteractive}
          {newDataForAll}
          {trash}
          {handleExport}
          {openCapytaleViewInNewTab}
          handleRecorder={sendActivityParams}
          locale={localeValue}
          {handleLanguage}
          isCapytale={$globalOptions.recorder === 'capytale'}
          isRecorder={!!$globalOptions.recorder}
          {buildUrlAndOpenItInNewTab}
          {showSettingsDialog}
          {importExercises}
          isExercisesListEmpty={$exercicesParams.length === 0}
          {isSidenavOpened}
          {toggleSidenav}
          {exportQcmCam}
          {isMd}
          isFlowmath={usesHostActivityProtocol($globalOptions.recorder)}
        />
        {#if isMd}
          <!-- ====================================================================================
                    MODE NORMAL
  ========================================================================================= -->
          <!-- Menu choix + Exos en mode non-smartphone -->
          <div
            class="relative flex w-full h-full bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
          >
            {#if $globalOptions.recorder}
              <SideMenuWrapper
                isRecorder={$globalOptions.recorder === 'capytale'}
                {isSidenavOpened}
                {toggleSidenav}
                {isMd}
              />
            {/if}
            <Sidenav isOpen={isSidenavOpened} width={400}>
              <div
                class="w-full bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
              >
                <SideMenu {addExercise} />
              </div>
            </Sidenav>
            <!-- Affichage exercices -->
            <main
              id="exercisesPart"
              class="absolute right-0 top-0 flex flex-col w-full h-full px-6 overflow-x-auto overflow-y-auto
            transition-[padding-left] duration-300
            bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
              style="padding-left: {$globalOptions.recorder
                ? isSidenavOpened
                  ? '425px'
                  : '25px'
                : isSidenavOpened
                  ? '400px'
                  : '0px'}"
            >
              <!-- MGu si la vue n'est pas START, le composant va être detruit et ici ca empeche de charger des exos inutilement-->
              {#if $exercicesParams.length !== 0 && ($globalOptions.v === '' || $globalOptions.v === undefined || $globalOptions.v === 'l')}
                <Exercices exercicesParams={$exercicesParams} {toggleSidenav} />
              {:else}
                <Placeholder text="Sélectionner les exercices" />
              {/if}
            </main>
          </div>
        {:else}
          <!-- ====================================================================================
                  MODE SMARTPHONE
========================================================================================= -->
          <div
            class="flex flex-col h-full justify-between bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
          >
            <!-- Menu choix en mode smartphone -->
            <div>
              {#if lang === 'fr-FR'}
                <MobileCarouselCards />
              {/if}
              <div
                class="w-full flex flex-col bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark border-t border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest"
              >
                <button
                  type="button"
                  class="group w-full flex flex-row justify-between items-center p-4"
                  aria-expanded={isSidenavOpened}
                  aria-controls="choiceMenuWrapper"
                  on:click={() => (isSidenavOpened = !isSidenavOpened)}
                >
                  <div
                    class="text-lg font-bold text-coopmaths-action dark:text-coopmathsdark-action hover:text-coopmaths-action-lightest hover:dark:text-coopmathsdark-action-lightest"
                  >
                    Choix des exercices
                  </div>
                  <i
                    class="bx bxs-up-arrow text-lg text-coopmaths-action dark:text-coopmathsdark-action hover:text-coopmaths-action-lightest hover:dark:text-coopmathsdark-action-lightest transition-transform duration-300 {isSidenavOpened
                      ? 'rotate-0'
                      : 'rotate-180'}"
                  ></i>
                </button>
                {#if isSidenavOpened}
                  <div
                    id="choiceMenuWrapper"
                    class="w-full overflow-y-visible overscroll-contain bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
                  >
                    <SideMenu {addExercise} />
                  </div>
                {/if}
              </div>
              <!-- Affichage exercices en mode smartphone -->
              <main
                id="exercisesPart"
                class="flex w-full px-6 bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
              >
                {#if $exercicesParams.length !== 0}
                  <Exercices
                    exercicesParams={$exercicesParams}
                    {toggleSidenav}
                  />
                {:else}
                  <Placeholder text="Sélectionner les exercices" />
                {/if}
              </main>
            </div>
            <Footer />
          </div>
        {/if}
      {/if}
    </div>
    <Keyboard />
  </div>
  <ButtonBackToTop {isBackToTopButtonVisible} {backToTop} />
  <ModalThirdApps
    {thirdAppsChoiceModal}
    {showThirdAppsChoiceDialog}
    appsTierceInExercisesList={selectedThirdApps}
  />
  <ModalCapytalSettings
    bind:isSettingsDialogDisplayed
    globalOptions={$globalOptions}
    canOptions={$canOptions}
    {toggleCan}
    {buildUrlAndOpenItInNewTab}
    {updateParams}
  />
  {#if isAddExerciseModalOpen}
    <TypstAddExerciseModal
      onAdd={addExerciseFromModal}
      onClose={() => (isAddExerciseModalOpen = false)}
    />
  {/if}
{/if}

<BasicClassicModal
  bind:isDisplayed={showSansVersionInteractiveModal}
  icon="bx-error"
>
  <span slot="header"
    >{exercicesSansVersionInteractive.length > 1
      ? 'Exercices sans version interactive'
      : 'Exercice sans version interactive'}</span
  >
  <div slot="content" class="text-left">
    <p class="mb-2">
      {#if exercicesSansVersionInteractive.length > 1}
        {#if modeModaleSansVersionInteractive === 'capytale'}
          Les exercices suivants n'ont pas de version interactive. Vous pouvez
          les conserver dans l'activité, mais ils ne donneront lieu à aucune
          note :
        {:else}
          Les exercices suivants n'ont pas de version interactive et resteront
          en version papier :
        {/if}
      {:else if modeModaleSansVersionInteractive === 'capytale'}
        L'exercice suivant n'a pas de version interactive. Vous pouvez le
        conserver dans l'activité, mais il ne donnera lieu à aucune note :
      {:else}
        L'exercice suivant n'a pas de version interactive et restera en version
        papier :
      {/if}
    </p>
    <ul class="list-disc pl-6">
      {#each exercicesSansVersionInteractive as exercice (exercice.id)}
        <li><strong>{exercice.id}</strong> – {exercice.titre}</li>
      {/each}
    </ul>
  </div>
  <div slot="footer" class="flex justify-center">
    <button
      type="button"
      class="btn btn-primary"
      on:click={() => (showSansVersionInteractiveModal = false)}>Compris</button
    >
  </div>
</BasicClassicModal>

<BasicClassicModal bind:isDisplayed={showQcmCamExportModal}>
  <span slot="header">Exporter vers QCM Cam</span>
  <form slot="content" on:submit|preventDefault={downloadQcmCam}>
    <label for="qcmcam-filename" class="mb-2 block">Nom du fichier</label>
    <input
      id="qcmcam-filename"
      type="text"
      bind:value={qcmCamFilename}
      required
      class="w-full rounded border p-2"
      aria-describedby="qcmcam-filename-help"
    />
    <p id="qcmcam-filename-help" class="mt-2 text-sm">
      L’extension .txt sera ajoutée si nécessaire.
    </p>
    <div class="mt-6 flex justify-center gap-3">
      <button
        type="button"
        class="btn btn-ghost"
        on:click={() => (showQcmCamExportModal = false)}>Annuler</button
      >
      <button
        type="submit"
        class="btn btn-primary"
        disabled={!qcmCamFilename.trim()}>Télécharger</button
      >
    </div>
  </form>
</BasicClassicModal>

<style>
  :root {
    scrollbar-color: #aaaaaa transparent;
  }
  /* Webkit scrollbar styling for Chrome/Safari */
  ::-webkit-scrollbar {
    width: 5px;
    height: 5px;
  }
  ::-webkit-scrollbar-thumb {
    background: #cccccc;
    border-radius: 10px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #dddddd;
  }
  ::-webkit-scrollbar-track {
    background: #ffffff;
    border-radius: 10px;
    box-shadow: inset 7px 10px 12px #f0f0f0;
  }
</style>
