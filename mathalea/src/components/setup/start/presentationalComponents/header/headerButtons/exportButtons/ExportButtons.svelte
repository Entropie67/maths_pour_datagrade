<script lang="ts">
  import AmcIcon from '../../../../../../../components/shared/icons/AmcIcon.svelte'
  import AnkiIcon from '../../../../../../../components/shared/icons/AnkiIcon.svelte'
  import MoodleIcon from '../../../../../../../components/shared/icons/MoodleIcon.svelte'
  import { buildMathAleaURL } from '../../../../../../../lib/components/urls'
  import { downloadFile } from '../../../../../../../lib/files'
  import { exportKutsum } from '../../../../../../../lib/kutsum'
  import { downloadReferentielSpreadsheet } from '../../../../../../../lib/referentielExport'
  import { globalOptions } from '../../../../../../../lib/stores/globalOptions'
  import type { VueType } from '../../../../../../../lib/VueType'
  import ButtonIconTooltip from '../../../../../../shared/forms/ButtonIconTooltip.svelte'
  import QcmCamIcon from '../../../../../../shared/icons/QcmCamIcon.svelte'
  import QuizzIcon from '../../../../../../shared/icons/QuizzIcon.svelte'
  import BasicInfoModal from '../../../../../../shared/modal/BasicInfoModal.svelte'

  export let handleExport: (vue: VueType) => void
  export let exportQcmCam: () => Promise<void>

  let showMoreModal = false
  let moreDialog: HTMLDialogElement
  let downloadContentDisplayed: 'success' | 'error' | 'none' = 'none'

  let showReferentielModal = false
  let referentielDialog: HTMLDialogElement
  let referentielExporting = false

  async function exportReferentiel(format: 'xlsx' | 'ods') {
    if (referentielExporting) return
    referentielExporting = true
    try {
      await downloadReferentielSpreadsheet(format)
      downloadContentDisplayed = 'success'
    } catch (error) {
      console.error('Export du référentiel impossible', error)
      downloadContentDisplayed = 'error'
    } finally {
      referentielExporting = false
      showReferentielModal = false
    }
  }

  function downloadRedirectFile() {
    const text = `<html><head><meta http-equiv="refresh" content="0;URL=${encodeURI(buildMathAleaURL({}).toString())}"></head></html>`
    downloadFile(text, 'mathAlea.html').then((returnString) => {
      downloadContentDisplayed = returnString
    })
  }

  $: if (moreDialog && showMoreModal) moreDialog.showModal()
  $: if (moreDialog && !showMoreModal) moreDialog.close()

  $: if (referentielDialog && showReferentielModal)
    referentielDialog.showModal()
  $: if (referentielDialog && !showReferentielModal) referentielDialog.close()

  function exportAndClose(vue: VueType) {
    showMoreModal = false
    handleExport(vue)
  }

  interface ExportOption {
    id: string
    label: string
    description: string
    icon?: string
    component?: any
    action: () => void
  }

  // Prototype : l'entrée n'apparaît que derrière `?beta=1`, tant que la
  // fiabilité de la lecture optique n'a pas été mesurée sur de vraies copies
  // scannées (voir la vue `Omr.svelte`, elle-même gardée par ce même
  // paramètre dans App.svelte).
  const optionOmr: ExportOption = {
    id: 'omr',
    label: 'Évaluation avec scan (bêta)',
    description:
      'Pour générer des sujets nominatifs et corriger les copies scannées par lecture optique, sans serveur',
    icon: 'bx bx-scan',
    action: () => exportAndClose('omr'),
  }

  // Prototype : l'entrée n'apparaît que derrière `?beta=1` tant que la
  // fonctionnalité est en cours de stabilisation.
  const optionQuizz: ExportOption = {
    id: 'quizz',
    label: 'Quizz (beta)',
    description:
      'Pour animer en classe un quiz façon Kahoot à partir des exercices QCM',
    component: QuizzIcon,
    action: () => exportAndClose('quizzconf'),
  }

  const baseExportOptions: ExportOption[] = [
    {
      id: 'latex2',
      label: 'PDF via LaTeX',
      description:
        'Nouvel éditeur pour générer un PDF à partir du moteur de composition LaTeX',
      icon: 'bx bx-code-alt',
      action: () => exportAndClose('tex'),
    },
    {
      id: 'parcours',
      label: 'Parcours pour l’application',
      description:
        'Pour préparer des parcours par paliers, avec objectifs, et les publier aux élèves qui utilisent l’application MathALÉA',
      icon: 'bx bx-layer',
      action: () => exportAndClose('parcours'),
    },
    {
      id: 'moodle',
      label: 'Moodle',
      description: 'Pour importer dans la plateforme Moodle ou ÉLÉA',
      component: MoodleIcon,
      action: () => exportAndClose('moodle'),
    },
    {
      id: 'alacarte',
      label: 'À la carte',
      description:
        "Pour créer un PDF personnalisé en associant des sélections d'exercices à des élèves",
      icon: 'bx bx-layout',
      action: () => exportAndClose('alacarte'),
    },
    {
      id: 'flashcards',
      label: 'Flash-cards',
      description:
        'Pour imprimer des cartes recto (question) / verso (réponse) à découper, idéal avec les exercices de course aux nombres',
      icon: 'bx bx-credit-card-front',
      action: () => exportAndClose('flashcards'),
    },
    {
      id: 'slides',
      label: 'Diaporama PDF',
      description:
        "Pour projeter un PDF au format d'un écran : une question en grand par page, puis les corrections",
      icon: 'bx bxs-slideshow',
      action: () => exportAndClose('slides'),
    },
    {
      id: 'qcmcam',
      label: 'QCM Cam',
      description: "La web'app pour sonder avec une webcam ou un smartphone",
      component: QcmCamIcon,
      action: () => {
        showMoreModal = false
        exportQcmCam()
      },
    },
    {
      id: 'amc',
      label: 'AMC',
      description:
        'Auto Multiple Choice - Pour la correction automatisée avec scan des copies',
      component: AmcIcon,
      action: () => exportAndClose('amc'),
    },
    {
      id: 'anki',
      label: 'Anki',
      description:
        'Pour les flashcards et apprentissage par répétition espacée',
      component: AnkiIcon,
      action: () => exportAndClose('anki'),
    },
    {
      id: 'latex',
      label: 'PDF via LaTeX (ancienne version)',
      description:
        'Pour générer un PDF à partir du moteur de composition LaTeX',
      icon: 'bx bx-code-alt',
      action: () => exportAndClose('latex'),
    },
    {
      id: 'kutsum',
      label: 'Kutsum',
      description: 'Pour créer des quiz interactifs sur Kutsum',
      icon: 'bx bx-game',
      action: () => {
        showMoreModal = false
        exportKutsum()
      },
    },
    {
      id: 'referentiel',
      label: 'Référentiel et liste des exercices',
      description:
        'Pour récupérer un classeur (ODS ou XLSX) avec le référentiel à jour (Niveaux › Thèmes › Sous-thèmes) et, dans un autre onglet, la liste de tous les exercices aléatoires avec leur titre',
      icon: 'bx bxs-spreadsheet',
      action: () => {
        showMoreModal = false
        showReferentielModal = true
      },
    },
  ]

  $: exportOptions = [
    ...baseExportOptions,
    ...($globalOptions.beta ? [optionQuizz, optionOmr] : []),
  ]
</script>

<ButtonIconTooltip
  icon="bx-slideshow text-3xl"
  tooltip="Diaporama"
  on:click={() => handleExport('diaporama')}
/>
<ButtonIconTooltip
  icon="bx-chalkboard text-3xl"
  tooltip="Vidéoprojection"
  on:click={() => handleExport('tbi')}
/>
<ButtonIconTooltip
  icon={'bx-link text-3xl'}
  cornerIcon="bxs-graduation"
  cornerIconClass="text-coopmaths-action dark:text-coopmathsdark-action"
  tooltip="Lien pour les élèves"
  on:click={() => handleExport('confeleve')}
/>
<ButtonIconTooltip
  icon="bx-printer text-3xl"
  tooltip="Impression"
  on:click={() => handleExport('typst')}
/>
<ButtonIconTooltip
  icon="bx-dots-horizontal-rounded text-3xl"
  tooltip="Plus d'exports"
  on:click={() => (showMoreModal = true)}
/>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<dialog
  bind:this={moreDialog}
  on:click|self={() => (showMoreModal = false)}
  on:close={() => (showMoreModal = false)}
  class="m-auto rounded-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto
    text-coopmaths-corpus dark:text-coopmathsdark-corpus
    bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
>
  <div class="relative">
    <button
      class="absolute top-0 right-0 text-coopmaths-corpus dark:text-coopmathsdark-corpus hover:text-coopmaths-action dark:hover:text-coopmathsdark-action"
      aria-label="Fermer"
      on:click={() => (showMoreModal = false)}
    >
      <i class="bx bx-x text-2xl"></i>
    </button>
    <h2
      class="text-2xl font-bold mb-6 text-coopmaths-struct dark:text-coopmathsdark-struct"
    >
      Autres exports
    </h2>
    <div class="grid grid-cols-1 gap-4">
      {#each exportOptions as option (option.id)}
        <button
          class="flex items-start gap-4 p-4 rounded-lg hover:bg-coopmaths-canvas-dark dark:hover:bg-coopmathsdark-canvas-dark transition-colors"
          on:click={option.action}
        >
          <div class="shrink-0 pt-1">
            {#if option.component}
              <svelte:component
                this={option.component}
                class="w-10 h-10 text-coopmaths-action dark:text-coopmathsdark-action"
              />
            {:else if option.icon}
              <i
                class="{option.icon} text-3xl text-coopmaths-action dark:text-coopmathsdark-action"
              ></i>
            {/if}
          </div>
          <div class="flex-1 text-left">
            <p
              class="font-semibold text-coopmaths-struct dark:text-coopmathsdark-struct mb-1"
            >
              {option.label}
            </p>
            <p
              class="text-sm text-coopmaths-corpus dark:text-coopmathsdark-corpus opacity-75"
            >
              {option.description}
            </p>
          </div>
          <div class="shrink-0 pt-1">
            <i
              class="bx bx-chevron-right text-2xl text-coopmaths-action dark:text-coopmathsdark-action opacity-50"
            ></i>
          </div>
        </button>
      {/each}

      <button
        class="flex items-start gap-4 p-4 rounded-lg hover:bg-coopmaths-canvas-dark dark:hover:bg-coopmathsdark-canvas-dark transition-colors"
        on:click={() => {
          showMoreModal = false
          downloadRedirectFile()
        }}
      >
        <div class="shrink-0 pt-1">
          <i
            class="bx bxs-file-export text-3xl text-coopmaths-action dark:text-coopmathsdark-action"
          ></i>
        </div>
        <div class="flex-1 text-left">
          <p
            class="font-semibold text-coopmaths-struct dark:text-coopmathsdark-struct mb-1"
          >
            Fichier de redirection
          </p>
          <p
            class="text-sm text-coopmaths-corpus dark:text-coopmathsdark-corpus opacity-75"
          >
            Téléchargez un fichier pour partager facilement cette configuration
          </p>
        </div>
        <div class="shrink-0 pt-1">
          <i
            class="bx bx-download text-2xl text-coopmaths-action dark:text-coopmathsdark-action"
          ></i>
        </div>
      </button>
    </div>
  </div>
</dialog>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<dialog
  bind:this={referentielDialog}
  on:click|self={() => (showReferentielModal = false)}
  on:close={() => (showReferentielModal = false)}
  class="m-auto rounded-xl p-8 w-full max-w-lg
    text-coopmaths-corpus dark:text-coopmathsdark-corpus
    bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
>
  <div class="relative">
    <button
      class="absolute top-0 right-0 text-coopmaths-corpus dark:text-coopmathsdark-corpus hover:text-coopmaths-action dark:hover:text-coopmathsdark-action"
      aria-label="Fermer"
      on:click={() => (showReferentielModal = false)}
    >
      <i class="bx bx-x text-2xl"></i>
    </button>
    <h2
      class="text-2xl font-bold mb-4 text-coopmaths-struct dark:text-coopmathsdark-struct"
    >
      Référentiel et liste des exercices
    </h2>
    <p
      class="text-sm text-coopmaths-corpus dark:text-coopmathsdark-corpus opacity-75 mb-6"
    >
      Le classeur contient deux onglets : le référentiel à jour (Niveaux ›
      Thèmes › Sous-thèmes) et la liste de tous les exercices aléatoires avec
      leur niveau, leur thème, leur sous-thème, leur identifiant et leur titre.
      Choisissez le format&nbsp;:
    </p>
    <div class="flex flex-row gap-4">
      <button
        class="flex-1 flex flex-col items-center gap-2 p-4 rounded-lg border border-coopmaths-action dark:border-coopmathsdark-action hover:bg-coopmaths-canvas-dark dark:hover:bg-coopmathsdark-canvas-dark transition-colors disabled:opacity-50"
        disabled={referentielExporting}
        on:click={() => exportReferentiel('ods')}
      >
        <i
          class="bx bxs-spreadsheet text-3xl text-coopmaths-action dark:text-coopmathsdark-action"
        ></i>
        <span class="font-semibold">Classeur ODS</span>
        <span class="text-xs opacity-75">LibreOffice Calc</span>
      </button>
      <button
        class="flex-1 flex flex-col items-center gap-2 p-4 rounded-lg border border-coopmaths-action dark:border-coopmathsdark-action hover:bg-coopmaths-canvas-dark dark:hover:bg-coopmathsdark-canvas-dark transition-colors disabled:opacity-50"
        disabled={referentielExporting}
        on:click={() => exportReferentiel('xlsx')}
      >
        <i
          class="bx bxs-spreadsheet text-3xl text-coopmaths-action dark:text-coopmathsdark-action"
        ></i>
        <span class="font-semibold">Classeur XLSX</span>
        <span class="text-xs opacity-75">Microsoft Excel</span>
      </button>
    </div>
    {#if referentielExporting}
      <p
        class="mt-4 text-sm text-coopmaths-corpus dark:text-coopmathsdark-corpus opacity-75"
      >
        Génération du classeur…
      </p>
    {/if}
  </div>
</dialog>

<BasicInfoModal
  bind:contentDisplayed={downloadContentDisplayed}
  successMessage="Téléchargement en cours"
  errorMessage="Erreur lors du téléchargement"
  displayDuration={3000}
/>
