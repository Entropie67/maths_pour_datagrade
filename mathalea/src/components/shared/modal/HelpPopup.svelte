<script lang="ts">
  import { tick } from 'svelte'
  import { startTour } from '../../../lib/onboarding/tour'
  import { startTypstTour } from '../../../lib/onboarding/typstTour'
  import { mathaleaGoToView } from '../../../lib/mathaleaUtils'
  import { globalOptions } from '../../../lib/stores/globalOptions'
  import {
    texShortcutsOpen,
    typstShortcutsOpen,
  } from '../../../lib/stores/generalStore'
  import BasicClassicModal from './BasicClassicModal.svelte'

  export let isDisplayed: boolean // à bind avec le parent

  /** La vue Typst a sa propre visite guidée, déjà sur place */
  $: isTypstView = $globalOptions.v === 'typst'
  /** Les vues Typst et LaTeX ont un éditeur de code et ses raccourcis */
  $: isEditorView = isTypstView || $globalOptions.v === 'tex'

  /** Ouvre la modale des raccourcis clavier de l'éditeur de code */
  function openEditorShortcuts() {
    isDisplayed = false
    if (isTypstView) typstShortcutsOpen.set(true)
    else texShortcutsOpen.set(true)
  }

  /**
   * La visite guidée générale porte sur la page d'accueil&nbsp;: si on la
   * relance depuis une autre vue (export LaTeX, AMC…), on y retourne
   * d'abord. Depuis la vue Typst, sa propre visite se relance sur place.
   */
  async function replayTour() {
    isDisplayed = false
    if (isTypstView) {
      await tick()
      startTypstTour()
    } else if ($globalOptions.v !== '') {
      mathaleaGoToView('')
      await tick()
      setTimeout(startTour, 300)
    } else {
      await tick()
      startTour()
    }
  }
</script>

<BasicClassicModal icon="bx-help-circle" bind:isDisplayed>
  <svelte:fragment slot="header">Aide</svelte:fragment>
  <svelte:fragment slot="content">
    <div
      class="flex flex-col gap-4 text-coopmaths-corpus dark:text-coopmathsdark-corpus"
    >
      <p>
        {#if isTypstView}
          Retrouvez la présentation de la vue Typst&nbsp;: modes d'affichage,
          palette de mise en page sur l'aperçu, réglages du document et export.
        {:else if $globalOptions.v === 'tex'}
          Retrouvez la présentation de la vue LaTeX&nbsp;: modes d'affichage,
          réglages du document, compilation et export, ainsi que les raccourcis
          clavier de l'éditeur de code.
        {:else}
          Retrouvez la présentation de la page d'accueil&nbsp;: recherche d'un
          exercice, ajout à la feuille et réglage des paramètres.
        {/if}
      </p>
      <div class="self-center flex flex-wrap justify-center gap-3">
        <button
          type="button"
          on:click={replayTour}
          class="inline-flex items-center gap-2 px-4 py-2 rounded-md font-semibold
            bg-coopmaths-action dark:bg-coopmathsdark-action
            text-coopmaths-canvas dark:text-coopmathsdark-canvas
            hover:bg-coopmaths-action-lightest dark:hover:bg-coopmathsdark-action-lightest"
        >
          <i class="bx bx-refresh text-xl"></i>
          Relancer la visite guidée
        </button>
        {#if isEditorView}
          <button
            type="button"
            on:click={openEditorShortcuts}
            class="inline-flex items-center gap-2 px-4 py-2 rounded-md font-semibold
              border border-coopmaths-action dark:border-coopmathsdark-action
              text-coopmaths-action dark:text-coopmathsdark-action
              hover:bg-coopmaths-action hover:text-coopmaths-canvas
              dark:hover:bg-coopmathsdark-action dark:hover:text-coopmathsdark-canvas"
          >
            <i class="bx bx-help-circle text-xl"></i>
            Raccourcis clavier
          </button>
        {/if}
      </div>
      {#if isTypstView}
        <a
          href="https://coopmaths.fr/www/aide/typst"
          target="_blank"
          rel="noreferrer"
          class="inline-flex items-center justify-center gap-2
            text-coopmaths-action dark:text-coopmathsdark-action
            hover:text-coopmaths-action-lightest dark:hover:text-coopmathsdark-action-lightest"
        >
          <i class="bx bx-book-open text-xl"></i>
          En savoir plus sur le langage Typst
        </a>
      {/if}
      <a
        href="https://forge.apps.education.fr/coopmaths/mathalea/-/wikis/1.-Utilisation-de-MathAL%C3%89A/1.1-Documentation-g%C3%A9n%C3%A9rale/Tutos-destin%C3%A9s-aux-utilisateurs-de-MathALEA?redirected_from=Tutos-destin%C3%A9s-aux-utilisateurs-de-MathALEA"
        target="_blank"
        rel="noreferrer"
        class="inline-flex items-center justify-center gap-2
          text-coopmaths-action dark:text-coopmathsdark-action
          hover:text-coopmaths-action-lightest dark:hover:text-coopmathsdark-action-lightest"
      >
        <i class="bx bx-book text-xl"></i>
        Tutoriels d'utilisation
      </a>
      <a
        href="https://podeduc.apps.education.fr/coopmaths/"
        target="_blank"
        rel="noreferrer"
        class="inline-flex items-center justify-center gap-2
          text-coopmaths-action dark:text-coopmathsdark-action
          hover:text-coopmaths-action-lightest dark:hover:text-coopmathsdark-action-lightest"
      >
        <i class="bx bx-video text-xl"></i>
        Vidéos tutorielles
      </a>
      <a
        href="https://coopmaths.fr/www/contribuer"
        target="_blank"
        rel="noreferrer"
        class="inline-flex items-center justify-center gap-2
          text-coopmaths-action dark:text-coopmathsdark-action
          hover:text-coopmaths-action-lightest dark:hover:text-coopmathsdark-action-lightest"
      >
        <i class="bx bx-heart text-xl"></i>
        Contribuer à MathALÉA
      </a>
      <a
        href="mailto:contact@coopmaths.fr"
        class="inline-flex items-center justify-center gap-2
          text-coopmaths-action dark:text-coopmathsdark-action
          hover:text-coopmaths-action-lightest dark:hover:text-coopmathsdark-action-lightest"
      >
        <i class="bx bx-envelope text-xl"></i>
        Nous contacter
      </a>
    </div>
  </svelte:fragment>
</BasicClassicModal>
