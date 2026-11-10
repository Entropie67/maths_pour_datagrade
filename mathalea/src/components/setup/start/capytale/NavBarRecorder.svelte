<script lang="ts">
  import { tick } from 'svelte'
  import ButtonIconTooltip from '../../../shared/forms/ButtonIconTooltip.svelte'
  import ButtonTextAction from '../../../shared/forms/ButtonTextAction.svelte'
  import InputText from '../../../shared/forms/InputText.svelte'
  import BasicClassicModal from '../../../shared/modal/BasicClassicModal.svelte'
  import ModalLanguageChoice from '../../../shared/modal/ModalLanguageChoice.svelte'
  import LanguageDropdown from '../../../shared/ui/LanguageDropdown.svelte'
  import LanguageIcon from '../../../shared/ui/LanguageIcon.svelte'
  import ButtonsDeck from '../../../shared/ui/ButtonsDeck.svelte'
  import { languages } from '../../../../lib/components/languagesUtils'
  import { pointsMaxTotal } from '../../../../lib/stores/generalStore'
  import type { Language } from '../../../../lib/types/languages'

  export let zoomUpdate: (plusMinus: '+' | '-') => void
  export let newDataForAll: () => void
  export let trash: () => void
  export let buildUrlAndOpenItInNewTab: (type: 'usual' | 'eleve') => void
  export let showSettingsDialog: () => void
  export let importExercises: (urlFeuilleEleve: string) => void
  export let isExercisesListEmpty: boolean
  export let isCapytale: boolean
  export let handleRecorder: () => void
  export let locale: Language
  export let handleLanguage: (lang: string) => void
  export let isFlowmath: boolean
  export let openCapytaleViewInNewTab: (
    view: 'typst' | 'diaporama' | 'tbi',
  ) => void

  let urlFeuilleEleve: string = ''
  let showLanguageChoiceModal: boolean = false
  let showImportModal: boolean = false
  const importInputId = 'importUrlFeuilleEleveInput'

  function openImportModal() {
    urlFeuilleEleve = ''
    showImportModal = true
    tick().then(() => document.getElementById(importInputId)?.focus())
  }

  function validateImport() {
    if (urlFeuilleEleve === '') return
    importExercises(urlFeuilleEleve)
    showImportModal = false
  }

  // Un texte collé est importé immédiatement : seule une saisie manuelle,
  // lettre par lettre, attend la validation par bouton.
  function handleImportPaste(event: ClipboardEvent) {
    const pastedText = event.clipboardData?.getData('text').trim()
    if (!pastedText) return
    urlFeuilleEleve = pastedText
    importExercises(pastedText)
    showImportModal = false
  }
</script>

<nav
  class="flex justify-between items-start w-full p-4
    flex-col md:flex-row
    mx-auto md:space-x-6
    bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
>
  <div
    class="flex flex-row justify-start
    md:items-end
    space-x-0 md:space-x-2"
  >
    <div
      class="font-logo9 tracking-tighter font-black
      text-5xl md:text-4xl
      text-coopmaths-struct dark:text-coopmathsdark-struct"
    >
      <img
        src="assets/images/axiomaths/liu-compas.png"
        alt=""
        aria-hidden="true"
        class="inline-block h-10 w-auto mr-1 -mt-1 align-middle"
      />
      AxioMaths
    </div>
    <!-- AxioMaths (DataGrade) est propulsé par MathALÉA : mention et lien conservés (AGPL-3.0) -->
    <div
      class="flex flex-row font-light text-sm
      text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest"
    >
      <span class="font-light font-sans mr-1 tracking-normal"> propulsé par </span>
      <a
        href="https://coopmaths.fr/alea/"
        target="_blank"
        rel="noreferrer"
        class="font-extrabold font-logo9 tracking-tighter
          text-coopmaths-action dark:text-coopmathsdark-action
          hover:text-coopmaths-action-lightest dark:hover:text-coopmathsdark-action-lightest"
      >
        MathALÉA
      </a>
    </div>
  </div>
  {#if isFlowmath}
    <div class="flex flex-row items-center space-x-2 ml-4">
      <div class="hidden md:block">
        <LanguageDropdown {locale} {handleLanguage} />
      </div>
      <div class="md:hidden">
        <button
          type="button"
          aria-label="Langue du référentiel : {languages[locale].short}"
          aria-haspopup="dialog"
          on:click={() => {
            showLanguageChoiceModal = !showLanguageChoiceModal
          }}
        >
          <LanguageIcon {locale} />
        </button>
      </div>
    </div>
  {/if}
  <div class="w-full flex flex-row">
    <ButtonsDeck class="mt-4 md:mt-0">
      <div
        slot="setup-buttons"
        class="flex flex-row justify-center items-center space-x-4"
      >
        <ButtonIconTooltip
          icon="bx-zoom-out text-3xl"
          tooltip="Réduire la taille du texte"
          on:click={() => zoomUpdate('-')}
        />
        <ButtonIconTooltip
          icon="bx-zoom-in text-3xl"
          tooltip="Augmenter la taille du texte"
          on:click={() => zoomUpdate('+')}
        />
        <ButtonIconTooltip
          icon="bx-refresh text-3xl"
          tooltip="Nouveaux énoncés"
          on:click={newDataForAll}
        />
        <ButtonIconTooltip
          icon="bx-trash text-3xl"
          tooltip="Supprimer tous les exercicess"
          on:click={trash}
        />
      </div>
      <div slot="input" class="flex flex-row items-center space-x-4">
        <ButtonIconTooltip
          icon="bx-import text-3xl"
          tooltip="Importer les exercices d'une feuille élève"
          on:click={openImportModal}
        />
      </div>
      <div slot="export-buttons" class="relative">
        <div class="flex flex-row justify-center items-center space-x-4">
          {#if !isCapytale}
            <ButtonTextAction
              class="text-sm py-1 px-2 rounded-md h-7"
              text="Valider"
              disabled={isExercisesListEmpty}
              on:click={handleRecorder}
            />
          {/if}
          {#if isCapytale}
            <ButtonIconTooltip
              icon="bx-cog text-3xl"
              tooltip="Régler l'affichage du mode élève"
              disabled={isExercisesListEmpty}
              on:click={showSettingsDialog}
            />
          {/if}
          {#if isCapytale}
            <div>
              <ButtonIconTooltip
                icon="bx-slideshow text-3xl"
                tooltip="Diaporama"
                disabled={isExercisesListEmpty}
                on:click={() => openCapytaleViewInNewTab('diaporama')}
              />
            </div>
          {/if}
          {#if isCapytale}
            <div>
              <ButtonIconTooltip
                icon="bx-chalkboard text-3xl"
                tooltip="Vidéoprojection"
                disabled={isExercisesListEmpty}
                on:click={() => openCapytaleViewInNewTab('tbi')}
              />
            </div>
          {/if}
          {#if isCapytale}
            <div>
              <ButtonIconTooltip
                icon="bx-printer text-3xl"
                tooltip="Imprimer"
                disabled={isExercisesListEmpty}
                on:click={() => openCapytaleViewInNewTab('typst')}
              />
            </div>
          {/if}
          <div>
            <ButtonIconTooltip
              icon="bx-log-out bx-rotate-180"
              tooltip="Rejoindre MathALÉA pour plus d'options"
              class="text-3xl"
              disabled={isExercisesListEmpty}
              on:click={() => {
                buildUrlAndOpenItInNewTab('usual')
              }}
            />
          </div>
        </div>
        {#if isCapytale && !isExercisesListEmpty && $pointsMaxTotal > 0}
          <div
            id="pointsMaxTotal"
            class="absolute top-full right-0 mt-1 text-sm font-semibold whitespace-nowrap
              text-coopmaths-struct dark:text-coopmathsdark-struct"
          >
            <span
              class="font-black text-coopmaths-action dark:text-coopmathsdark-action"
              >Total</span
            >
            : {$pointsMaxTotal}
            {$pointsMaxTotal > 1 ? 'points' : 'point'}
          </div>
        {/if}
      </div>
    </ButtonsDeck>
  </div>
</nav>
{#if isFlowmath}
  <ModalLanguageChoice bind:showLanguageChoiceModal {locale} {handleLanguage} />
{/if}
<BasicClassicModal bind:isDisplayed={showImportModal}>
  <svelte:fragment slot="header">
    Importer les exercices d'une feuille élève de coopmaths.fr/alea
  </svelte:fragment>
  <svelte:fragment slot="content">
    <InputText
      inputID={importInputId}
      title="Lien de la feuille élève"
      placeholder="Lien"
      bind:value={urlFeuilleEleve}
      on:paste={(event) => handleImportPaste(event.detail)}
    />
  </svelte:fragment>
  <svelte:fragment slot="footer">
    <ButtonTextAction
      class="text-sm py-1 px-2 rounded-md h-7"
      text="Importer"
      disabled={urlFeuilleEleve === ''}
      on:click={validateImport}
    />
  </svelte:fragment>
</BasicClassicModal>
