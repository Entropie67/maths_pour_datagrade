<script lang="ts">
  import { afterUpdate, beforeUpdate, onDestroy, onMount } from 'svelte'
  import { get } from 'svelte/store'
  import Latex from '../../../lib/Latex'
  import { type LatexFileInfos } from '../../../lib/LatexTypes'
  import { mathaleaGetExercicesFromParams } from '../../../lib/mathalea.js'
  import { mathaleaGoToView } from '../../../lib/mathaleaUtils'
  import { darkMode, exercicesParams } from '../../../lib/stores/generalStore'
  import { referentielLocale } from '../../../lib/stores/languagesStore'
  import { type IExercice, type IExerciceStatique } from '../../../lib/types'
  import Footer from '../../Footer.svelte'
  import ButtonCompileLatexToPdf from '../../shared/forms/ButtonCompileLatexToPDF.svelte'
  import ButtonTextAction from '../../shared/forms/ButtonTextAction.svelte'
  import FormConfigGlobal from '../../shared/forms/FormConfigGlobal.svelte'
  import FormConfigIndividual from '../../shared/forms/FormConfigIndividual.svelte'
  import InputNumber from '../../shared/forms/InputNumber.svelte'
  import InputText from '../../shared/forms/InputText.svelte'
  import NavBar from '../../shared/header/NavBar.svelte'
  import ImageCarousel from '../../shared/ui/ImageCarousel.svelte'
  import SimpleCard from '../../shared/ui/SimpleCard.svelte'
  import ExamTemplateConfig from './ExamTemplateConfig.svelte'
  import ExosGroupingDragDrop from './ExosGroupingDragDrop.svelte'
  import FormConfigSection from './FormConfigSection.svelte'
  import { decodeBase64, encodeBase64 } from './LatexConfig'
  import PdfResult from './PdfResult.svelte'

  let showAdvanced = false // toggle pour les paramètres avancés

  const url = new URL(window.location.href)
  const decoded = decodeBase64(
    url.searchParams.get('pdfParam') || '',
  ) as Partial<LatexFileInfos>

  /**
   * Toutes les variables configurables par l'interface WEB
   * qui adaptent la sortie PDF
   */
  let latexFileInfos: LatexFileInfos = {
    title: '',
    reference: '',
    subtitle: '',
    style: 'ProfMaquette',
    fontOption: 'StandardFont',
    tailleFontOption: 12,
    dysTailleFontOption: 14,
    correctionOption: 'AvecCorrection',
    qrcodeOption: 'SansQrcode',
    typeFiche: 'Fiche',
    durationCanOption: '9 min',
    titleOption: 'SansTitre',
    nbVersions: 1,
    exos: {}, // tu peux garder vide par défaut
    exosGrouping: '', // tu peux garder vide par défaut
    modele: undefined, // tu peux garder undefined par défaut
    ...decoded, // ⚡ écrase les valeurs par défaut si présente
  }

  let pdfParam = encodeBase64(latexFileInfos)

  url.searchParams.set('pdfParam', pdfParam)

  const imgStylePartialUrls = {
    Coopmaths: 'images/exports/export-coopmaths',
    Classique: 'images/exports/export-classique',
    ProfMaquette: 'images/exports/export-profmaquette',
    ProfMaquetteQrcode: 'images/exports/export-profmaquette-qrcode',
    Can: 'images/exports/export-can',
  }

  $: carouselImages = [
    {
      src: `${imgStylePartialUrls[latexFileInfos.style]}-thumb1.png`,
      alt: `${latexFileInfos.style} image-1`,
    },
    {
      src: `${imgStylePartialUrls[latexFileInfos.style]}-thumb2.png`,
      alt: `${latexFileInfos.style} image-2`,
    },
  ]

  let exercices: (IExercice | IExerciceStatique)[]
  let isExerciceStaticInTheList = false
  let promise: Promise<void>
  let activeTab: 'general' | 'advanced' | 'global' | 'grouped' | 'model' =
    'general'

  const latex = new Latex()

  async function initExercices(indexesToLoad?: number[]) {
    log('initExercices')
    const interfaceParams = get(exercicesParams)
    interfaceParams.forEach((e) => {
      e.interactif = '0'
    })
    exercices = await mathaleaGetExercicesFromParams(interfaceParams)
    latex.addExercices(
      exercices.filter(
        (ex, index) =>
          ex.typeExercice !== 'html' &&
          (!indexesToLoad || indexesToLoad.includes(index)),
      ),
    )
    isExerciceStaticInTheList = latex.isExerciceStaticInTheList()
  }

  async function updateLatexWithAbortController() {
    const clone = UpdateController.update()
    if (clone.signal?.aborted) {
      return Promise.reject(
        new DOMException(
          'Aborted in updateLatexWithAbortController',
          'AbortError',
        ),
      )
    }

    return new Promise<void>(async (resolve, reject) => {
      // Listen for abort event on signal
      const rej = () => {
        log('reject')
        clone.signal?.removeEventListener('abort', rej)
        reject(
          new DOMException(
            'Aborted in updateLatexWithAbortController',
            'AbortError',
          ),
        )
      }
      clone.signal?.addEventListener('abort', rej)
      // Something fake async
      await updateLatex(clone)
        .then(() => {
          clone.signal?.removeEventListener('abort', rej)
          log('Promise resolu')
          resolve()
        })
        .catch((err) => {
          reject(new DOMException(`Aborted : ${err.message}`, 'AbortError'))
        })
    })
  }

  async function updateLatex(clone: LatexFileInfos) {
    try {
      log('updateLatex')
      // await new Promise((resolve) => setTimeout(resolve, 10000))
      await latex.getFile(clone)
      log('fin updateLatex')
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        // nouvelle demande de fichier LATEX demandée
        throw error
      }
      console.error('Erreur lors de la création du code LaTeX :', error)
    }
  }

  class UpdateController {
    static controller: AbortController | undefined
    static update() {
      if (UpdateController.controller === undefined) {
        UpdateController.controller = new AbortController()
      } else {
        UpdateController.controller.abort()
        UpdateController.controller = new AbortController()
      }
      const clone = structuredClone(latexFileInfos)
      clone.signal = UpdateController.controller.signal
      return clone
    }
  }

  const debug = url.searchParams.get('log') === '5' || true
  function log(str: string) {
    if (debug) {
      console.info(str)
    }
  }

  $: {
    if (latex.exercices.length > 0) {
      log('update')
      latexFileInfos = {
        ...latexFileInfos,
        exos: {
          ...latexFileInfos.exos,
          // les blocrep sont déjà des sous-objets clonés quand tu les modifies
        },
      }
      console.log('latexFileInfos', latexFileInfos)
      const newPdfParam = encodeBase64(latexFileInfos)
      if (newPdfParam !== pdfParam) {
        pdfParam = newPdfParam
        url.searchParams.set('pdfParam', pdfParam)
        history.replaceState(null, '', url) // change l’URL sans recharger

        promise = updateLatexWithAbortController().catch((err) => {
          if (err.name === 'AbortError') {
            log('Promise Aborted')
          } else {
            log('Promise Rejected')
          }
        })
      }
    }
  }

  async function forceUpdate() {
    log('forceUpdate')
    latexFileInfos.title = latexFileInfos.title
  }

  onMount(async () => {
    await initExercices()
    promise = updateLatexWithAbortController().catch((err) => {
      if (err.name === 'AbortError') {
        log('Promise Aborted')
      } else {
        log('Promise Rejected')
      }
    })
    document.addEventListener('updateAsyncEx', forceUpdate)
  })

  onDestroy(async () => {
    document.removeEventListener('updateAsyncEx', forceUpdate)
  })

  beforeUpdate(async () => {
    // console.log('beforeUpdate')
  })

  afterUpdate(async () => {
    // console.log('afterUpdate')
  })
</script>

<main
  class="bg-coopmaths-canvas dark:bg-coopmathsdark-canvas
   text-coopmaths-corpus dark:text-coopmathsdark-corpus
  {$darkMode.isActive ? 'dark' : ''}"
>
  <NavBar
    subtitle="PDF"
    subtitleType="export"
    handleLanguage={() => {}}
    locale={$referentielLocale}
  />
  <section class="px-4 py-0 bg-coopmaths-canvas dark:bg-coopmathsdark-canvas">
    <!-- Titre toujours en pleine largeur -->
    <h1
      class="w-full text-center md:text-left text-coopmaths-struct
             dark:text-coopmathsdark-struct text-2xl md:text-4xl font-bold mb-6"
    >
      Visualisation du PDF
      <button
        class="mx-2 tooltip tooltip-left tooltip-neutral"
        data-tip="Changer les paramètres du PDF"
        type="button"
        aria-label="Changer les paramètres du PDF"
        on:click={() => {
          showAdvanced = !showAdvanced
        }}
      >
        <i
          aria-hidden="true"
          class="text-coopmaths-action hover:text-coopmaths-action-lightest
                 dark:text-coopmathsdark-action dark:hover:text-coopmathsdark-action-lightest
                 bx bx-slider"
        ></i>
      </button>
    </h1>

    <!-- Grille responsive uniquement pour le contenu -->
    <div
      class={showAdvanced
        ? 'grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3 items-stretch'
        : ''}
    >
      {#if showAdvanced}
        <!-- Colonne configuration -->
        <div class="flex flex-col space-y-8">
          <!-- Barre d’onglets -->
          <div class="flex space-x-4 border-b border-gray-600 mb-4">
            <button
              class="pb-2 px-2 -mb-px text-sm font-medium transition-colors duration-200"
              class:text-blue-500={activeTab === 'general'}
              class:border-b-2={activeTab === 'general'}
              class:border-blue-500={activeTab === 'general'}
              class:text-gray-400={activeTab !== 'general'}
              class:hover:text-gray-200={activeTab !== 'general'}
              on:click={() => (activeTab = 'general')}
            >
              Général
            </button>
            {#if latexFileInfos.style === 'ProfMaquette'}
              <button
                class="pb-2 px-2 -mb-px text-sm font-medium transition-colors duration-200"
                class:text-blue-500={activeTab === 'global'}
                class:border-b-2={activeTab === 'global'}
                class:border-blue-500={activeTab === 'global'}
                class:text-gray-400={activeTab !== 'global'}
                class:hover:text-gray-200={activeTab !== 'global'}
                on:click={() => (activeTab = 'global')}
              >
                Global
              </button>

              <button
                class="pb-2 px-2 -mb-px text-sm font-medium transition-colors duration-200"
                class:text-blue-500={activeTab === 'advanced'}
                class:border-b-2={activeTab === 'advanced'}
                class:border-blue-500={activeTab === 'advanced'}
                class:text-gray-400={activeTab !== 'advanced'}
                class:hover:text-gray-200={activeTab !== 'advanced'}
                on:click={() => (activeTab = 'advanced')}
              >
                Avancé
              </button>

              <button
                class="pb-2 px-2 -mb-px text-sm font-medium transition-colors duration-200"
                class:text-blue-500={activeTab === 'grouped'}
                class:border-b-2={activeTab === 'grouped'}
                class:border-blue-500={activeTab === 'grouped'}
                class:text-gray-400={activeTab !== 'grouped'}
                class:hover:text-gray-200={activeTab !== 'grouped'}
                on:click={() => (activeTab = 'grouped')}
              >
                Groupe
              </button>

              <button
                class="pb-2 px-2 -mb-px text-sm font-medium transition-colors duration-200"
                class:text-blue-500={activeTab === 'model'}
                class:border-b-2={activeTab === 'model'}
                class:border-blue-500={activeTab === 'model'}
                class:text-gray-400={activeTab !== 'model'}
                class:hover:text-gray-200={activeTab !== 'model'}
                on:click={() => (activeTab = 'model')}
              >
                Modèle
              </button>
            {/if}
          </div>

          <!-- les onglets -->
          {#if activeTab === 'general'}
            <div
              class="mb-6 border rounded-lg p-4 bg-gray-50 mx-auto h-[70vh] overflow-y-auto"
            >
              <div
                class="mb-4 flex flex-col md:flex-row w-full justify-between rounded-lg
                    bg-coopmaths-canvas-dark shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),
                    0_10px_20px_-2px_rgba(0,0,0,0.04)]
                    dark:bg-coopmathsdark-canvas-dark"
              >
                <div class="flex flex-col py-4 pl-16 w-2/3">
                  <FormConfigSection {latex} bind:latexFileInfos {promise} />
                </div>
                <!-- Carousel de vignette pour les aperçus -->
                <div class="flex justify-center w-full md:w-1/3">
                  <div class="relative w-2/3 md:w-full max-w-[200px]">
                    <ImageCarousel images={carouselImages} interval={3000} />
                  </div>
                </div>
              </div>

              <SimpleCard icon={''} title={'Éléments de titres'} class="mb-4">
                <InputText
                  inputID="pdf-titre-input"
                  placeholder="Titre"
                  bind:value={latexFileInfos.title}
                  showTitle={false}
                />
                <InputText
                  inputID="pdf-reference-input"
                  placeholder="Référence"
                  bind:value={latexFileInfos.reference}
                  showTitle={false}
                />
                <InputText
                  inputID="pdf-subtitle-input"
                  placeholder="Sous-titre"
                  bind:value={latexFileInfos.subtitle}
                  showTitle={false}
                />
              </SimpleCard>

              <SimpleCard
                icon={''}
                title={'Nombre de versions des exercices'}
                class="mb-4"
              >
                <InputNumber
                  id="pdf-nb-versions"
                  min={1}
                  max={50}
                  bind:value={latexFileInfos.nbVersions}
                />
              </SimpleCard>

              <SimpleCard title={''} icon={''} class="mb-4">
                <ButtonTextAction
                  class="px-2 py-1 rounded-md"
                  id="vueLatex"
                  on:click={() => {
                    mathaleaGoToView('latex')
                  }}
                  text="Basculer vers la vue Latex"
                />

                <ButtonCompileLatexToPdf
                  class="px-4 rounded-lg flex gap-3 bg-coopmaths-action justify-center hover:bg-coopmaths-action-lightest dark:bg-coopmathsdark-action dark:hover:bg-coopmathsdark-action-lightest text-white"
                  {latex}
                  {latexFileInfos}
                  id="1"
                />
              </SimpleCard>
            </div>
          {/if}
          {#if activeTab === 'global' && latexFileInfos.style === 'ProfMaquette'}
            <div
              class="flex flex-col md:flex-row w-full justify-between rounded-lg
                  bg-coopmaths-canvas-dark shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),
                  0_10px_20px_-2px_rgba(0,0,0,0.04)]
                  dark:bg-coopmathsdark-canvas-dark"
            >
              <div
                class="mb-6 border rounded-lg p-4 bg-gray-50 mx-auto h-[70vh] overflow-y-auto"
              >
                <FormConfigGlobal bind:latexFileInfos {latex} />
              </div>
            </div>
          {/if}
          {#if activeTab === 'advanced' && latexFileInfos.style === 'ProfMaquette'}
            <div
              class="flex flex-col md:flex-row w-full justify-between rounded-lg
                    bg-coopmaths-canvas-dark shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),
                    0_10px_20px_-2px_rgba(0,0,0,0.04)]
                    dark:bg-coopmathsdark-canvas-dark"
            >
              <div
                class="mb-6 border rounded-lg p-4 bg-gray-50 mx-auto h-[70vh] overflow-y-auto"
              >
                <FormConfigIndividual bind:latexFileInfos {latex} />
              </div>
            </div>
          {/if}
          {#if activeTab === 'grouped' && latexFileInfos.style === 'ProfMaquette'}
            <div
              class="flex flex-col md:flex-row w-full justify-between rounded-lg
                    bg-coopmaths-canvas-dark shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),
                    0_10px_20px_-2px_rgba(0,0,0,0.04)]
                    dark:bg-coopmathsdark-canvas-dark"
            >
              <div
                class="mb-6 border rounded-lg p-4 bg-gray-50 mx-auto h-[70vh] overflow-y-auto"
              >
                <SimpleCard title="Assemblage des exercices" class="mb-4">
                  <ExosGroupingDragDrop {exercices} bind:latexFileInfos />
                </SimpleCard>
              </div>
            </div>
          {/if}
          {#if activeTab === 'model' && latexFileInfos.style === 'ProfMaquette'}
            <div
              class="flex flex-col md:flex-row w-full justify-between rounded-lg
                    bg-coopmaths-canvas-dark shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),
                    0_10px_20px_-2px_rgba(0,0,0,0.04)]
                    dark:bg-coopmathsdark-canvas-dark"
            >
              <div
                class="mb-6 border rounded-lg p-4 bg-gray-50 mx-auto h-[70vh] overflow-y-auto"
              >
                <SimpleCard title="Modèle" class="mb-4">
                  <ExamTemplateConfig {exercices} bind:latexFileInfos />
                </SimpleCard>
              </div>
            </div>
          {/if}
        </div>
      {/if}
      <!-- Colonne rendu PDF -->
      <div
        class="shadow-md bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark
              text-coopmaths-corpus dark:text-coopmathsdark-corpus
              w-full overflow-y-auto overflow-x-scroll text-xs
              min-h-[70vh]
              {showAdvanced
          ? 'col-span-1 md:col-span-1 xl:col-span-2 h-full'
          : 'h-[70vh]'}"
      >
        {#await promise}
          <p>Chargement en cours...</p>
        {:then}
          <PdfResult
            {latex}
            {latexFileInfos}
            autoStart={!showAdvanced}
            pdfViewerDisplay={true}
          />
        {/await}
      </div>
    </div>
  </section>

  <footer>
    <Footer />
  </footer>
</main>

<style>
  footer {
    margin-top: auto;
  }
</style>
