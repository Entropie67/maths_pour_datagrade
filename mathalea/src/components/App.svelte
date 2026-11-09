<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import type { Unsubscriber } from 'svelte/store'
  import { checkBrowserVersion } from '../lib/components/browserVersion'
  import { fetchServerVersion } from '../lib/components/version'
  import {
    mathaleaUpdateExercicesParamsFromUrl,
    mathaleaUpdateUrlFromExercicesParams,
  } from '../lib/mathalea'
  import { canOptions } from '../lib/stores/canStore'
  import {
    darkMode,
    exercicesParams,
    freezeUrl,
    isInIframe,
  } from '../lib/stores/generalStore'
  import { globalOptions } from '../lib/stores/globalOptions'
  import { updateReferentielLocaleFromURL } from '../lib/stores/languagesStore'
  import { vendor } from '../lib/stores/vendorStore'
  import type { CanSolutionsMode } from '../lib/types/can'
  import { context } from '../modules/context'
  import { statsPageTracker } from '../modules/statsUtils'

  import { decodeQuizzParams } from '../lib/quizz/quizzParams'
  import type { InterfaceGlobalOptions } from '../lib/types'
  import CheckTest from './devtools/CheckTest.svelte'
  import Can from './display/can/Can.svelte'
  import Eleve from './display/eleve/Eleve.svelte'
  import Quizz from './display/quizz/Quizz.svelte'
  import QuizzMulti from './display/quizz/multi/QuizzMulti.svelte'
  import Tbi from './display/tbi/Tbi.svelte'
  import Alacarte from './setup/alacarte/Alacarte.svelte'
  import Amc from './setup/amc/Amc.svelte'
  import Anki from './setup/anki/Anki.svelte'
  import ConfigEleve from './setup/configEleve/ConfigEleve.svelte'
  import Diaporama from './setup/diaporama/Diaporama.svelte'
  import Flashcards from './setup/flashcards/Flashcards.svelte'
  import IHaveWhoHas from './setup/iHaveWhoHas/IHaveWhoHas.svelte'
  import Latex from './setup/latex/Latex.svelte'
  import Pdf from './setup/latex/Pdf.svelte'
  import RawLatex from './setup/latex/RawLatex.svelte'
  import MesSauvegardes from './setup/mesFeuilles/MesSauvegardes.svelte'
  import Moodle from './setup/moodle/Moodle.svelte'
  import Omr from './setup/omr/Omr.svelte'
  import Parcours from './setup/parcours/Parcours.svelte'
  import QuizzConf from './setup/quizz/QuizzConf.svelte'
  import Relecture from './setup/relecture/Relecture.svelte'
  import Slides from './setup/slides/Slides.svelte'
  import Start from './setup/start/Start.svelte'
  import Tex from './setup/tex/Tex.svelte'
  import Tools from './setup/tools/Tools.svelte'
  import Typst from './setup/typst/Typst.svelte'
  import EnConstruction from './shared/misc/EnConstruction.svelte'
  import CapytaleConnectionLostModal from './shared/modal/CapytaleConnectionLostModal.svelte'
  import Popup from './shared/modal/Popup.svelte'

  let showPopup = false
  let popupMessage = ''
  let globalOptionsUnsubscriber: Unsubscriber
  let exercicesParamsUnsubscriber: Unsubscriber

  function handlePopupClose() {
    // console.log('Popup has been closed');
    showPopup = false
  }

  onMount(() => {
    updateParams()
    addEventListener('popstate', updateParams)
    globalOptionsUnsubscriber = globalOptions.subscribe(() => {
      updateContext() // Si on attend les 500 ms de mise à jour de l'url, la sortie LaTeX sera chargée avant la mise à jour du contexte et on se retrouvera avec du svg dans le LaTeX
      updateVendor() // Par prévention, on met aussi à jour le vendor
      mathaleaUpdateUrlFromExercicesParams()
    })
    exercicesParamsUnsubscriber = exercicesParams.subscribe(() => {
      mathaleaUpdateUrlFromExercicesParams()
    })

    const version = checkBrowserVersion()
    if (version.popupMessage.length > 0) {
      showPopup = true
      popupMessage = version.popupMessage
    }
  })

  onDestroy(() => {
    removeEventListener('popstate', updateParams)
    globalOptionsUnsubscriber()
    exercicesParamsUnsubscriber()
  })

  // charge le numéro de version du serveur
  fetchServerVersion()

  // Gestion des recorders (Moodle, Capytale, etc. )
  // Lorsque la page d'accueil est dans un iFrame, l'URL est bloquée et les boutons d'exports cachés
  const url = new URL(window.location.href)
  const recorder = url.searchParams.get('recorder')
  if (recorder !== null) {
    isInIframe.set(true)
    freezeUrl.set(true)
  } else {
    isInIframe.set(false)
  }

  // le plus tôt possible, on met à jour la vue
  // const view = url.searchParams.get('v') ?? ''
  // const v = convertVueType(view) ?? ''
  // globalOptions.update((options) => {
  //   options.v = v
  //   return options
  // })

  // Gestion des paramètres de la CAN
  const canDuration = url.searchParams.get('canD')
  if (canDuration !== null) {
    $canOptions.durationInMinutes = parseInt(canDuration)
  }
  const canSub = url.searchParams.get('canT')
  if (canSub !== null) {
    $canOptions.subTitle = canSub
  }
  const canSolAccess = url.searchParams.get('canSA')
  if (canSolAccess !== null) {
    $canOptions.solutionsAccess = canSolAccess === '1'
  }
  const canSolMode = url.searchParams.get('canSM')
  if (canSolMode !== null) {
    $canOptions.solutionsMode = canSolMode as CanSolutionsMode
  }
  const canIsInteractive = url.searchParams.get('canI')
  if (canIsInteractive !== null) {
    $canOptions.isInteractive = canIsInteractive === '1'
  }
  const canPerQuestion = parseInt(url.searchParams.get('canQ') ?? '')
  if (Number.isFinite(canPerQuestion) && canPerQuestion > 0) {
    $canOptions.timerMode = 'question'
    $canOptions.durationPerQuestionInSeconds = canPerQuestion
  }
  if (url.searchParams.get('canFB') === '1') {
    $canOptions.feedbackMode = 'each'
  }

  function updateParams() {
    updateParamsFromUrl()
    updateContext()
    updateVendor()
    statsPageTracker()
  }

  /**
   * Vue quizz multi-joueurs (V2) ? Vrai si l'URL porte un rôle explicite
   * (manager/player) ou si les réglages du quizz indiquent le mode multi.
   */
  function isMultiQuizz(options: InterfaceGlobalOptions): boolean {
    if (options.v !== 'quizz') return false
    if (options.quizzRole != null) return true
    return decodeQuizzParams(options.quizzParam).mode === 'multi'
  }

  function updateParamsFromUrl() {
    updateReferentielLocaleFromURL()
    const urlOptions = mathaleaUpdateExercicesParamsFromUrl()
    if (JSON.stringify($globalOptions) !== JSON.stringify(urlOptions)) {
      globalOptions.set(urlOptions)
    }
  }

  function updateContext() {
    context.isDiaporama = $globalOptions.v === 'diaporama'
    if (
      $globalOptions.v === 'latex' ||
      $globalOptions.v === 'pdf' ||
      $globalOptions.v === 'tex' ||
      $globalOptions.v === 'raw'
    ) {
      context.isHtml = false
    } else {
      context.isHtml = true
    }
    if ($globalOptions.v === 'confeleve') {
      context.isHtml = false
    }
    if ($globalOptions.v === 'alacarte') {
      context.isHtml = false
    }
    if ($globalOptions.v === 'amc') {
      context.isAmc = true
      context.isHtml = false
    } else {
      context.isAmc = false
    }
    context.vue = ''
    if ($globalOptions.v === 'diaporama') context.vue = 'diap' // for compatibility
    if ($globalOptions.v === 'typst') context.vue = 'typst'
    if (
      $globalOptions.v === 'latex' ||
      $globalOptions.v === 'raw' ||
      $globalOptions.v === 'tex'
    )
      context.vue = 'latex' // for compatibility
    if ($globalOptions.v === 'can') context.vue = 'can' // for compatibility
    // lorsque l'éditeur sera intégré à la v3, il faudra mettre à true cette propriété pour l'editeur
    context.isInEditor = false
  }

  function updateVendor() {
    // initialisation du vendor pour l'intégration de la bannière dans la vue élève
    if ($globalOptions.v === 'myriade') {
      $vendor.product = {
        name: 'indices',
        logoPath: 'assets/images/vendors/bordas/myriade-bordas-logo.png',
      }
    }
    if ($globalOptions.v === 'indices') {
      $vendor.product = {
        name: 'indices',
        logoPath: 'assets/images/vendors/bordas/indices-bordas-logo.png',
      }
    }
    if ($globalOptions.v === 'indice') {
      $vendor.product = {
        name: 'indice',
        logoPath: 'assets/images/vendors/bordas/indice-bordas-logo.png',
      }
    }
  }

  function isDevMode() {
    return window.location.href.startsWith('http://localhost')
  }
</script>

<div
  class=" {$darkMode.isActive
    ? 'dark'
    : ''} subpixel-antialiased bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
  id="appComponent"
>
  {#if showPopup}
    <Popup
      message={popupMessage}
      visible={showPopup}
      onClose={handlePopupClose}
    />
  {:else if $globalOptions.v === 'diaporama' || $globalOptions.v === 'overview'}
    <Diaporama />
  {:else if $globalOptions.v === 'can'}
    <Can />
  {:else if $globalOptions.v === 'eleve' || $globalOptions.v === 'indices' || $globalOptions.v === 'myriade' || $globalOptions.v === 'indice'}
    <Eleve />
  {:else if $globalOptions.v === 'latex'}
    <Latex />
  {:else if $globalOptions.v === 'raw'}
    <RawLatex />
  {:else if $globalOptions.v === 'alacarte'}
    <Alacarte />
  {:else if $globalOptions.v === 'confeleve'}
    <ConfigEleve />
  {:else if $globalOptions.v === 'amc'}
    <Amc />
  {:else if $globalOptions.v === 'moodle'}
    <Moodle />
  {:else if $globalOptions.v === 'anki'}
    <Anki />
  {:else if $globalOptions.v === 'pdf'}
    <Pdf />
  {:else if $globalOptions.v === 'tools'}
    <Tools />
  {:else if $globalOptions.v === 'typst'}
    <Typst />
  {:else if $globalOptions.v === 'tex'}
    <Tex />
  {:else if $globalOptions.v === 'flashcards'}
    <Flashcards />
  {:else if $globalOptions.v === 'i-have-who-has'}
    <IHaveWhoHas />
  {:else if $globalOptions.v === 'slides'}
    <Slides />
  {:else if $globalOptions.v === 'tbi'}
    <Tbi />
  {:else if $globalOptions.v === 'quizzconf'}
    <!-- PHASE-BETA-QUIZZ : pour ouvrir la vue à tous, supprimer ce bloc
         {#if}…{/if} (et l'import de EnConstruction) en ne gardant que QuizzConf -->
    {#if !$globalOptions.beta}
      <EnConstruction feature="Quizz" />
    {:else}
      <QuizzConf />
    {/if}
  {:else if $globalOptions.v === 'quizz'}
    {#if isMultiQuizz($globalOptions)}
      <QuizzMulti />
    {:else}
      <Quizz />
    {/if}
  {:else if $globalOptions.v === 'parcours'}
    <Parcours />
  {:else if $globalOptions.v === 'omr'}
    <!-- Prototype : la vue reste derrière `?beta=1` tant que la fiabilité de
         lecture n'a pas été mesurée sur de vraies copies scannées -->
    {#if !$globalOptions.beta}
      <EnConstruction feature="Évaluation papier" />
    {:else}
      <Omr />
    {/if}
  {:else if $globalOptions.v === 'check-test'}
    <CheckTest />
  {:else if $globalOptions.v === 'relecture'}
    <Relecture />
  {:else if $globalOptions.v === 'mes-sauvegardes'}
    <MesSauvegardes />
  {:else if $globalOptions.v !== undefined}
    <Start />
  {/if}
  {#if $globalOptions.recorder === 'capytale'}
    <!-- Bloque la copie tant que la sauvegarde vers Capytale n'est pas possible -->
    <CapytaleConnectionLostModal />
  {/if}
</div>

{#if isDevMode()}
  <dialog
    id="notifDialog"
    class="rounded-xl p-6 bg-coopmaths-canvas text-coopmaths-corpus dark:bg-coopmathsdark-canvas-dark dark:text-coopmathsdark-corpus-light shadow-lg"
  ></dialog>
{/if}
