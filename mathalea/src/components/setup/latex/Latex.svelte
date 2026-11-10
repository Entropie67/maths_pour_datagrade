<script lang="ts">
  import { afterUpdate, beforeUpdate, onDestroy, onMount, tick } from 'svelte'
  import { get } from 'svelte/store'
  import {
    downloadFile,
    downloadTexWithImagesZip,
    downloadZip,
  } from '../../../lib/files'
  import Latex, {
    doesLatexNeedsPics,
    getExosContentList,
    getPicsNames,
    makeImageFilesUrls,
    getLogoCanUrls,
  } from '../../../lib/Latex'
  import {
    type Exo,
    type LatexFileInfos,
    type latexFileType,
    type picFile,
  } from '../../../lib/LatexTypes'
  import {
    mathaleaGetExercicesFromParams,
    mathaleaRenderDiv,
    mathaleaUpdateUrlFromExercicesParams,
  } from '../../../lib/mathalea.js'
  import { mathaleaGoToView } from '../../../lib/mathaleaUtils'
  import { darkMode, exercicesParams } from '../../../lib/stores/generalStore'
  import { referentielLocale } from '../../../lib/stores/languagesStore'
  import type { IExercice, IExerciceStatique } from '../../../lib/types'
  import Footer from '../../Footer.svelte'
  import ButtonActionInfo from '../../shared/forms/ButtonActionInfo.svelte'
  import ButtonCompileLatexToPDF from '../../shared/forms/ButtonCompileLatexToPDF.svelte'
  import ButtonOverleaf from '../../shared/forms/ButtonOverleaf.svelte'
  import ButtonTextAction from '../../shared/forms/ButtonTextAction.svelte'
  import CheckboxWithLabel from '../../shared/forms/CheckboxWithLabel.svelte'
  import InputNumber from '../../shared/forms/InputNumber.svelte'
  import InputText from '../../shared/forms/InputText.svelte'
  import NavBar from '../../shared/header/NavBar.svelte'
  import BasicClassicModal from '../../shared/modal/BasicClassicModal.svelte'
  import ImageCarousel from '../../shared/ui/ImageCarousel.svelte'
  import SimpleCard from '../../shared/ui/SimpleCard.svelte'
  import FormConfigSection from './FormConfigSection.svelte'
  import { decodeBase64, encodeBase64 } from './LatexConfig'

  let url = new URL(window.location.href)
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
    withReferences: false,
    subtitle: '',
    style: 'Coopmaths',
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
    ...decoded, // ⚡ écrase les valeurs par défaut si présente
  }

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

  let dialogLua: HTMLDialogElement
  let exercices: (IExercice | IExerciceStatique)[]
  let latexFile: latexFileType = {
    contents: { preamble: '', intro: '', content: '', contentCorr: '' },
    latexWithoutPreamble: '',
    latexWithPreamble: '',
  }

  let picsWanted: boolean
  let messageForCopyPasteModal: string
  let picsNames: picFile[][] = []
  let exosContentList: Exo[] = []
  let divText: HTMLDivElement
  let promise: Promise<void>
  let isDownloadPicsModalDisplayed = false
  let pdfParam = ''
  let isInlinePreviewVisible = false
  let isCodeExpanded = false
  let previewContainer: HTMLDivElement
  let editedLatexWithPreamble = ''
  let restoreParamsInput: HTMLInputElement

  const latex = new Latex()

  async function initExercices() {
    // console.log('initExercices')
    const interfaceParams = get(exercicesParams)
    interfaceParams.forEach((e) => {
      e.interactif = '0'
    })
    mathaleaUpdateUrlFromExercicesParams(interfaceParams)
    exercices = await mathaleaGetExercicesFromParams(interfaceParams)
    latex.addExercices(exercices.filter((ex) => ex.typeExercice !== 'html'))
    latexFile.contents = await latex.getContents(latexFileInfos)
    picsWanted = doesLatexNeedsPics(latexFile.contents)
    messageForCopyPasteModal = buildMessageForCopyPaste(picsWanted)
    url = new URL(window.location.href)
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
      latexFile = await latex.getFile(clone)
      log('fin updateLatex')
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        // nouvelle demande de fichier LATEX demandée
        throw error
      }
      console.error('Erreur lors de la création du code LaTeX :', error)
      latexFile.latexWithoutPreamble = '% Erreur à signaler'
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

  const debug = false
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

      pdfParam = encodeBase64(latexFileInfos)
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

  async function forceUpdate() {
    log('forceUpdate')
    latexFileInfos.title = latexFileInfos.title
  }

  onMount(async () => {
    // console.log('onMount')
    promise = initExercices()
      .then(() => updateLatexWithAbortController())
      .catch((err) => {
        if (err.name === 'AbortError') {
          log('Promise Aborted')
        } else {
          log('Promise Rejected')
        }
      })
    document.addEventListener('updateAsyncEx', forceUpdate)
    mathaleaRenderDiv(divText)
    // console.log('fin onMount')
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

  /**
   * Gérer le téléchargement des images dans une archive `images.zip` lors du clic sur le bouton du modal
   * @author sylvain
   */
  async function handleActionFromDownloadPicsModal() {
    // console.log('handleActionFromDownloadPicsModal')
    const imagesFilesUrls = [
      ...makeImageFilesUrls(exercices),
      ...getLogoCanUrls(latexFile.contents.preamble),
    ]
    await downloadZip(imagesFilesUrls, 'images.zip')
    isDownloadPicsModalDisplayed = false
  }

  /**
   * Gérer l'affichage du modal : on donne la liste des images par exercice
   */
  function handleDownloadPicsModalDisplay() {
    // console.log('handleDownloadPicsModalDisplay')
    exosContentList = getExosContentList(exercices)
    picsNames = getPicsNames(exosContentList)
    isDownloadPicsModalDisplayed = true
  }

  async function handleDownloadLatexMaterial() {
    await promise
    const latexForDownload: latexFileType = editedLatexWithPreamble
      ? {
          ...latexFile,
          latexWithPreamble: latexForCopyWithPreamble,
          latexWithoutPreamble: latexForCopyWithoutPreamble,
        }
      : latexFile

    const picsWantedForDownload =
      picsWanted || /\\includegraphics/.test(latexForDownload.latexWithPreamble)

    if (picsWantedForDownload) {
      await downloadTexWithImagesZip('coopmaths', latexForDownload, exercices)
    } else {
      downloadFile(latexForDownload.latexWithPreamble, 'coopmaths.tex')
    }
  }

  /**
   * Construction d'un message contextualisé indiquant le besoin de télécharger les images si besoin
   */
  export function buildMessageForCopyPaste(picsWanted: boolean) {
    if (picsWanted) {
      return `<p>Le code LaTeX a été copié dans le presse-papier.</p>
      <p class="font-bold text-coopmaths-warn-darkest">Ne pas oublier de télécharger les figures !</p>`
    } else {
      return 'Le code LaTeX a été copié dans le presse-papier.'
    }
  }

  async function openInlinePreviewAndScroll() {
    isInlinePreviewVisible = true
    await tick()
    previewContainer?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function handleLaunchPreview() {
    void openInlinePreviewAndScroll()
  }

  function handleClosePreview() {
    isInlinePreviewVisible = false
  }

  function toggleCodePreview() {
    isCodeExpanded = !isCodeExpanded
  }

  function extractLatexWithoutPreamble(latexWithPreamble: string): string {
    const bodyMatch = latexWithPreamble.match(
      /\\begin\{document\}([\s\S]*?)\\end\{document\}/,
    )
    if (bodyMatch?.[1] !== undefined) {
      return bodyMatch[1].trim()
    }
    return latexWithPreamble
  }

  function handleLatexEditorChange(
    event: CustomEvent<{ latexWithPreamble: string }>,
  ) {
    editedLatexWithPreamble = event.detail.latexWithPreamble
  }

  function getExportableParams() {
    const { signal, ...exportableInfos } = latexFileInfos
    return exportableInfos
  }

  function handleSaveParams() {
    const payload = {
      type: 'mathalea-latex-params',
      version: 1,
      savedAt: new Date().toISOString(),
      params: getExportableParams(),
    }
    const jsonContent = JSON.stringify(payload, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json' })
    const blobUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = 'mathalea-latex-params.json'
    link.click()
    URL.revokeObjectURL(blobUrl)
  }

  function handleRestoreParamsClick() {
    restoreParamsInput?.click()
  }

  async function handleRestoreParamsUpload(event: Event) {
    const input = event.currentTarget as HTMLInputElement
    const file = input.files?.[0]
    if (!file) {
      return
    }

    try {
      const rawText = await file.text()
      const parsed = JSON.parse(rawText)
      const restoredParams =
        parsed && typeof parsed === 'object' && 'params' in parsed
          ? parsed.params
          : parsed

      if (!restoredParams || typeof restoredParams !== 'object') {
        throw new Error('Format JSON invalide')
      }

      latexFileInfos = {
        ...latexFileInfos,
        ...(restoredParams as Partial<LatexFileInfos>),
      }
      editedLatexWithPreamble = ''
    } catch (error) {
      console.error('Impossible de restaurer les paramètres :', error)
      window.alert('Le fichier JSON de paramètres est invalide.')
    } finally {
      input.value = ''
    }
  }

  $: latexForCopyWithPreamble =
    editedLatexWithPreamble || latexFile.latexWithPreamble
  $: latexForCopyWithoutPreamble = editedLatexWithPreamble
    ? extractLatexWithoutPreamble(editedLatexWithPreamble)
    : latexFile.latexWithoutPreamble
</script>

<main
  class="bg-coopmaths-canvas dark:bg-coopmathsdark-canvas {$darkMode.isActive
    ? 'dark'
    : ''}"
>
  <NavBar
    subtitle="LaTeX"
    subtitleType="export"
    handleLanguage={() => {}}
    locale={$referentielLocale}
  />

  <section
    class="px-4 py-0 md:py-10 bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
  >
    <h1
      class="mb-4 text-center md:text-left text-coopmaths-struct dark:text-coopmathsdark-struct text-2xl md:text-4xl font-bold"
    >
      Paramétrage
    </h1>
    <div
      class="grid grid-cols-1 grid-rows-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
    >
      <div
        class="flex flex-col w-full md:flex-row justify-between rounded-lg bg-coopmaths-canvas-dark shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] dark:bg-coopmathsdark-canvas-dark"
      >
        <div
          class="flex flex-col py-4 pl-16 w-2/3 text-coopmaths-corpus dark:text-coopmathsdark-corpus"
        >
          <FormConfigSection {latex} bind:latexFileInfos {promise} />
        </div>
        <!-- Carousel de vignette pour les aperçus -->
        <div class="flex justify-center w-full md:w-1/3">
          <div class="relative w-2/3 md:w-full">
            <ImageCarousel images={carouselImages} interval={3000} />
          </div>
        </div>
      </div>

      <SimpleCard icon={''} title={'Éléments de titres'}>
        <div class="flex flex-col w-full justify-start items-start space-y-2">
          <InputText
            inputID="export-latex-titre-input"
            placeholder={latexFileInfos.style === 'Can'
              ? 'Course aux nombres'
              : 'Titre'}
            bind:value={latexFileInfos.title}
            showTitle={false}
            classAddenda="placeholder:opacity-40"
          />
          <InputText
            inputID="export-latex-reference-input"
            placeholder={latexFileInfos.style === 'Coopmaths' ||
            latexFileInfos.style === 'ProfMaquetteQrcode' ||
            latexFileInfos.style === 'ProfMaquette'
              ? 'Référence'
              : 'Haut de page gauche'}
            bind:value={latexFileInfos.reference}
            isDisabled={latexFileInfos.style === 'Can'}
            showTitle={false}
            classAddenda="placeholder:opacity-40"
          />
          <InputText
            inputID="export-latex-soustitre-input"
            placeholder={latexFileInfos.style === 'Coopmaths' ||
            latexFileInfos.style === 'ProfMaquetteQrcode' ||
            latexFileInfos.style === 'ProfMaquette'
              ? 'Sous-titre / Chapitre'
              : 'Pied de page droit'}
            bind:value={latexFileInfos.subtitle}
            isDisabled={latexFileInfos.style === 'Can'}
            showTitle={false}
            classAddenda="placeholder:opacity-40"
          />
          <CheckboxWithLabel
            id="export-latex-with-references-checkbox"
            label="Afficher les références des exercices"
            isChecked={latexFileInfos.withReferences ?? false}
            on:change={(event) => {
              latexFileInfos.withReferences = event.detail as boolean
            }}
          />
        </div>
      </SimpleCard>
      <SimpleCard icon={''} title={'Nombre de versions des exercices'}>
        <span class="w-30">
          <InputNumber
            id="export-latex-nb-versions-input"
            min={1}
            max={50}
            bind:value={latexFileInfos.nbVersions}
          />
        </span>
        <div class="mt-3 flex flex-col w-full gap-2">
          <ButtonTextAction
            class="px-2 py-1 rounded-md"
            id="saveLatexParams"
            on:click={handleSaveParams}
            text="Sauvegarder les paramètres"
          />
          <ButtonTextAction
            class="px-2 py-1 rounded-md"
            id="restoreLatexParams"
            on:click={handleRestoreParamsClick}
            text="Restaurer les paramètres"
          />
          <input
            bind:this={restoreParamsInput}
            id="restoreLatexParamsInput"
            type="file"
            accept="application/json,.json"
            class="hidden"
            on:change={handleRestoreParamsUpload}
          />
        </div>
      </SimpleCard>
    </div>
    <h1
      class="mt-12 md:mt-8 text-center md:text-left text-coopmaths-struct dark:text-coopmathsdark-struct text-2xl md:text-4xl font-bold"
    >
      Prévisualisation PDF
    </h1>
    <div
      bind:this={previewContainer}
      class="my-6 rounded-lg bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark p-4 shadow-md"
    >
      {#await promise}
        <p class="text-sm text-coopmaths-corpus dark:text-coopmathsdark-corpus">
          Chargement de la prévisualisation...
        </p>
      {:then}
        <div class="flex items-center justify-end mb-3">
          {#if !isInlinePreviewVisible}
            <ButtonTextAction
              class="px-2 py-1 rounded-md"
              id="launchInlinePreview"
              on:click={handleLaunchPreview}
              text="Lancer la prévisualisation"
            />
          {:else}
            <ButtonTextAction
              class="px-2 py-1 rounded-md"
              id="closeInlinePreview"
              on:click={handleClosePreview}
              text="Fermer la prévisualisation"
            />
          {/if}
        </div>
        <div
          class="w-full rounded-md overflow-hidden border border-coopmaths-canvas-light dark:border-coopmathsdark-canvas-light {isInlinePreviewVisible
            ? 'bg-transparent h-auto min-h-105'
            : 'bg-white h-20 min-h-20'}"
        >
          {#if isInlinePreviewVisible}
            <ButtonCompileLatexToPDF
              class="w-full"
              {latex}
              {latexFileInfos}
              id="preview"
              inlinePreview={true}
              autoCompileOnInit={true}
              initialLatexWithPreamble={editedLatexWithPreamble}
              on:latexChange={handleLatexEditorChange}
            />
          {/if}
        </div>
      {/await}
    </div>
    <div bind:this={divText}>
      <h1
        class="mt-12 mb-4 text-center md:text-left text-coopmaths-struct dark:text-coopmathsdark-struct text-2xl md:text-4xl font-bold"
      >
        Exportation
      </h1>
      <div class="pl-4">
        <div
          class="text-coopmaths-struct-light dark:text-coopmathsdark-struct-light md:text-2xl font-bold pb-2"
        >
          Que faire du code $\LaTeX$ ?
        </div>
        <div
          class="grid grid-cols-1 grid-rows-1 md:grid-cols-2 xl:grid-cols-2 gap-8"
        >
          <SimpleCard title={'Compiler le code pour avoir un fichier PDF'}>
            <div>
              Je souhaite obtenir un fichier PDF à partir du code $\LaTeX$.
              J'essaie le nouveau compilateur en ligne (serveur TexLive.net) qui
              ne nécessite pas d'avoir un compte.
            </div>
            <div slot="button1">
              {#await promise}
                <p>Chargement en cours...</p>
              {:then}
                <div>
                  <ButtonCompileLatexToPDF
                    class="flex w-full flex-col justify-center"
                    {latex}
                    {latexFileInfos}
                    id="0"
                    redirectToInlinePreview={true}
                    on:openInlinePreview={openInlinePreviewAndScroll}
                  />
                </div>
              {/await}
            </div>
          </SimpleCard>
          <SimpleCard title={'Obtenir un PDF'}>
            <div>
              Je souhaite obtenir un fichier PDF à partir du code $\LaTeX$. Je
              vais être redirigé(e) vers le site OverLeaf (qui nécessite d'avoir
              un compte) pour compiler le code en ligne.
            </div>
            <div slot="button1">
              {#await promise}
                <p>Chargement en cours...</p>
              {:then}
                <div>
                  <ButtonOverleaf
                    class="flex w-full flex-col justify-center"
                    {latexFile}
                    {exercices}
                    disabled={false}
                  />
                </div>
              {/await}
            </div>
          </SimpleCard>
          <SimpleCard title={'Copier le code'} icon={'bx-copy-alt'}>
            <div>
              Je souhaite copier le code $\LaTeX$ pour le coller dans un autre
              logiciel.
            </div>
            <div slot="button1">
              {#await promise}
                <p>Chargement en cours...</p>
              {:then}
                <div>
                  <ButtonActionInfo
                    action="copy"
                    textToCopy={latexForCopyWithoutPreamble}
                    text="Code seul"
                    successMessage={messageForCopyPasteModal}
                    errorMessage="Impossible de copier le code LaTeX dans le presse-papier"
                    class="px-2 py-1 rounded-md"
                  />
                </div>
              {/await}
            </div>
            <div slot="button2">
              {#await promise}
                <p></p>
              {:then}
                <div>
                  <ButtonActionInfo
                    action="copy"
                    textToCopy={latexForCopyWithPreamble}
                    text="Code + préambule"
                    successMessage={messageForCopyPasteModal}
                    errorMessage="Impossible de copier le code LaTeX dans le presse-papier"
                    class="px-2 py-1 rounded-md"
                  />
                </div>
              {/await}
            </div>
          </SimpleCard>
          <SimpleCard title={'Télécharger le code'} icon={'bx-download'}>
            <div>Je souhaite télécharger le matériel sur mon ordinateur.</div>
            <div slot="button1">
              <ButtonTextAction
                class="px-2 py-1 rounded-md"
                id="downloadFullArchive"
                on:click={handleDownloadLatexMaterial}
                text={picsWanted ? 'Archive complète' : 'Fichier LaTeX complet'}
              />
            </div>
            <div slot="button2">
              {#if picsWanted}
                <div>
                  <ButtonTextAction
                    class="inline-block px-2 py-1 rounded-md"
                    id="downloadPicsButton"
                    on:click={handleDownloadPicsModalDisplay}
                    text="Uniquement les figures"
                  />
                </div>
              {/if}
            </div>
          </SimpleCard>
          <SimpleCard title={'Basculer vers la vue PDF'} icon={'bx-download'}>
            <div>Je souhaite basculer vers la vue PDF.</div>
            <div slot="button1">
              <ButtonTextAction
                class="px-2 py-1 rounded-md"
                id="vuePDF"
                on:click={() => {
                  mathaleaGoToView('pdf')
                }}
                text="Basculer sur la vue PDF"
              />
            </div>
          </SimpleCard>
        </div>
        <BasicClassicModal
          bind:isDisplayed={isDownloadPicsModalDisplayed}
          icon="bx-code"
        >
          <span slot="header"></span>
          <div slot="content" class="flex flex-col justify-start items-start">
            Voici ce dont vous aurez besoin :
            {#if getLogoCanUrls(latexFile.contents.preamble).length > 0}
              <ul
                class="flex flex-col justify-start items-start list-disc pl-6"
              >
                <li>Page de garde :</li>
                <ul
                  class="flex flex-col justify-start items-start list-none pl-4"
                >
                  <li class="font-mono text-sm">logoCan</li>
                </ul>
              </ul>
            {/if}
            {#each exosContentList as exo, i (exo)}
              <ul
                class="flex flex-col justify-start items-start list-disc pl-6"
              >
                <!-- <li class={picsNames[i].length > 0 ? "container" : "hidden"}>Exercice {i + 1} (<span class="text-italic">{exo.groups.title}</span>) :</li> -->
                {#if picsNames[i].length !== 0}
                  <li>
                    Exercice {i + 1} (<span class="text-italic"
                      >{exo.title}</span
                    >) :
                  </li>
                  <ul
                    class="flex flex-col justify-start items-start list-none pl-4"
                  >
                    {#each picsNames[i] as img}
                      <li class="font-mono text-sm">{img.name}</li>
                    {/each}
                  </ul>
                {/if}
              </ul>
            {/each}
          </div>
          <div slot="footer">
            <ButtonTextAction
              text="Télécharger les figures"
              on:click={handleActionFromDownloadPicsModal}
            />
          </div>
        </BasicClassicModal>
      </div>
    </div>

    <dialog
      bind:this={dialogLua}
      class="rounded-xl bg-coopmaths-canvas text-coopmaths-corpus dark:bg-coopmathsdark-canvas-dark dark:text-coopmathsdark-corpus-light font-light shadow-lg p-6"
    >
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html messageForCopyPasteModal}
      {#if latexFileInfos.style === 'ProfMaquette'}
        <p class="mt-4">
          Il faut mettre à jour votre distribution LaTeX pour avoir la dernière
          version du package <em
            class="text-coopmaths-warn-darkest dark:text-coopmathsdark-warn-darkest font-bold"
            >ProfMaquette</em
          >.
        </p>
      {:else}
        <p class="mt-4">
          Il faudra utiliser <em
            class="text-coopmaths-warn-darkest dark:text-coopmathsdark-warn-darkest font-bold"
            >LuaLaTeX</em
          > pour compiler le document.
        </p>
      {/if}
    </dialog>

    <h1
      class="mt-12 md:mt-8 text-center md:text-left text-coopmaths-struct dark:text-coopmathsdark-struct text-2xl md:text-4xl font-bold"
    >
      Code
    </h1>
    <div class="mt-6 mb-10 flex justify-start">
      <ButtonTextAction
        class="px-2 py-1 rounded-md"
        id="toggleLatexCodeVisibility"
        on:click={toggleCodePreview}
        text={isCodeExpanded
          ? 'Masquer le code LaTeX'
          : 'Afficher le code LaTeX'}
      />
    </div>
    {#if isCodeExpanded}
      <pre
        class="mb-10 shadow-md bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark text-coopmaths-corpus dark:text-coopmathsdark-corpus p-4 w-full overflow-y-auto overflow-x-scroll text-xs">
        {#await promise}
          <p>Chargement en cours...</p>
        {:then}
          {latexForCopyWithoutPreamble}
        {/await}
      </pre>
    {/if}
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
