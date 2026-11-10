<script lang="ts">
  import { languages } from '../../../lib/components/languagesUtils'
  import { mathaleaGoToView } from '../../../lib/mathaleaUtils'
  import { isInIframe } from '../../../lib/stores/generalStore'
  import { globalOptions } from '../../../lib/stores/globalOptions'
  import {
    VUES_WITH_LANG_STATUS_ONLY,
    type Language,
  } from '../../../lib/types/languages'
  import ButtonIcon from '../forms/ButtonIcon.svelte'
  import ButtonToggleDarkMode from '../forms/ButtonToggleDarkMode.svelte'
  import HelpPopup from '../modal/HelpPopup.svelte'
  import ModalLanguageChoice from '../modal/ModalLanguageChoice.svelte'
  import LanguageDropdown from '../ui/LanguageDropdown.svelte'
  import LanguageIcon from '../ui/LanguageIcon.svelte'
  import LanguageStatus from '../ui/LanguageStatus.svelte'
  import NavBarSubtitle from './NavBarSubtitle.svelte'

  export let title: string = 'AxioMaths'
  export let subtitle: string = ''
  export let subtitleType: 'export' | 'design' = 'export'
  export let locale: Language
  export let handleLanguage: (lang: string) => void
  /** Permet de masquer le choix de la langue du référentiel (vue mobile). */
  export let showLanguage: boolean = true
  /** Si fourni, affiche un bouton « Vidéoprojection » à droite de « Mes sauvegardes ». */
  export let onTbi: (() => void) | undefined = undefined

  let showLanguageChoiceModal: boolean = false
  let showHelpPopup: boolean = false
</script>

<!--
  @component
  Barre de titre pour une section du site positionnée en haut dans la page.
  Contient un titre pour l'endroit du site (MathALÉA, etc.),
  un sous titre pour indiquer la section (export, ), un bouton pour gérer le mode sombre et éventuellement
  un bouton pour fermer (c'est-à-dire revenir à la page d'accueil de la section.)

  ### Paramètres

  * `title` : le titre de la page (`MathALÉA` par défaut)
  * `subtitle` : son sous-titre
  * `subTItleType` : mot indiquant le type de la section pour décider de l'affichage (seulelemnt deux mode `export` et `design`)

  ### Exemple

  ```tsx
    <NavBarV2 subtitle="Conception de document" subtitleType="design" />
  ```
 -->

<nav
  class="p-4
  md:h-[120px]
  bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
>
  <!-- container -->
  <div
    class="flex flex-row justify-between items-start w-full mx-auto
    space-x-0 md:space-x-6"
  >
    <div
      class="flex justify-start flex-col
      space-x-0 md:space-x-2"
    >
      <div
        class="flex align-middle
        flex-col md:flex-row"
      >
        <div>
          <div
            on:click={() => mathaleaGoToView('')}
            on:keydown={() => mathaleaGoToView('')}
            role="link"
            tabindex="0"
            class="relative inline-flex font-logo9 tracking-tighter font-black
            text-3xl md:text-6xl
            {subtitleType === 'design'
              ? 'text-coopmaths-struct dark:text-coopmathsdark-struct'
              : `cursor-pointer
                text-coopmaths-action dark:text-coopmathsdark-action
                hover:text-coopmaths-action-lightest dark:hover:text-coopmathsdark-action-lightest`}"
          >
            <img
              src="assets/images/axiomaths/liu-aplus.png"
              alt=""
              aria-hidden="true"
              class="inline-block h-9 md:h-14 w-auto mr-1 -mt-1 align-middle"
            />
            {title}
          </div>
          <!-- AxioMaths (DataGrade) est propulsé par MathALÉA : mention et lien conservés (AGPL-3.0) -->
          <div
            class="absolute ml-3 -mt-1 font-light text-sm whitespace-nowrap
              text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest"
          >
            <span class="font-light font-sans tracking-normal">propulsé par</span>
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
        <NavBarSubtitle {subtitle} type={subtitleType} />
      </div>
    </div>
    <div
      class="flex flex-row items-center space-x-4 pt-2
      pr-0 md:pr-4"
    >
      {#if !showLanguage}
        <!-- rien : le choix de la langue est masqué -->
      {:else if $globalOptions.v && VUES_WITH_LANG_STATUS_ONLY.includes($globalOptions.v)}
        <LanguageStatus {locale} />
      {:else}
        <!-- Menu déroulant en mode desktop -->
        <div class="hidden md:block">
          <LanguageDropdown {locale} {handleLanguage} />
        </div>
        <!-- En mode smartphone bouton commandant un dialogue -->
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
      {/if}
      {#if !$isInIframe && $globalOptions.v !== 'mes-sauvegardes'}
        <ButtonIcon
          icon="bx-folder-open text-2xl"
          ariaLabel="Mes sauvegardes"
          title="Mes sauvegardes"
          on:click={() => mathaleaGoToView('mes-sauvegardes')}
        />
      {/if}
      {#if onTbi}
        <ButtonIcon
          icon="bx-chalkboard text-2xl"
          ariaLabel="Vidéoprojection"
          title="Vidéoprojection"
          on:click={onTbi}
        />
      {/if}
      <ButtonToggleDarkMode />
      <ButtonIcon
        icon="bx-help-circle text-2xl"
        ariaLabel="Aide"
        title="Aide"
        dataTour="help-button"
        on:click={() => (showHelpPopup = true)}
      />
      {#if $globalOptions.v !== '' && subtitleType !== 'design'}
        <ButtonIcon
          icon="bx-x"
          class="text-3xl"
          ariaLabel="Retour à l'accueil"
          on:click={() => {
            mathaleaGoToView('')
          }}
        />
      {/if}
    </div>
  </div>
</nav>
<ModalLanguageChoice bind:showLanguageChoiceModal {locale} {handleLanguage} />
<HelpPopup bind:isDisplayed={showHelpPopup} />
