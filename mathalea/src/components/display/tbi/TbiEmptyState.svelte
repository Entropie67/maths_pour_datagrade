<script lang="ts">
  import { mathaleaGoToView } from '../../../lib/mathaleaUtils'
  import { savesLocationStore } from '../../../lib/stores/generalStore'
  import TbiMathText from './TbiMathText.svelte'

  /** Écran d'un onglet sans contenu : ce que le prof peut y faire */
  interface Props {
    title: string
    onAddExercise: () => void
    /** Écrire tout de suite : l'onglet devient un Tableau */
    onWrite: () => void
    onOpenTools: () => void
  }

  let { title, onAddExercise, onWrite, onOpenTools }: Props = $props()

  function openSessions() {
    savesLocationStore.set({ space: 'seances', folderId: null })
    mathaleaGoToView('mes-sauvegardes')
  }

  const actionClass =
    'flex flex-col items-center justify-center gap-2 w-56 h-36 rounded-2xl text-lg font-bold transition-[filter] hover:brightness-95'
  const secondaryClass = `${actionClass} bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark text-coopmaths-corpus dark:text-coopmathsdark-corpus`
</script>

<div
  class="relative z-10 min-h-[calc(100vh-6rem)] flex flex-col items-center justify-center gap-2 px-4 text-center"
>
  <h2
    class="text-4xl font-extrabold text-coopmaths-corpus dark:text-coopmathsdark-corpus"
  >
    <TbiMathText text={title} />
  </h2>
  <p
    class="mb-6 text-lg text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light"
  >
    Cet onglet est vide. Vous pouvez aussi y déposer un fichier ou coller un
    lien.
  </p>
  <div class="flex flex-row flex-wrap justify-center gap-3">
    <button
      type="button"
      class="{actionClass} bg-coopmaths-action dark:bg-coopmathsdark-action text-coopmaths-canvas dark:text-coopmathsdark-canvas"
      onclick={onAddExercise}
    >
      <i class="bx bx-plus text-4xl"></i>
      Ajouter un exercice
    </button>
    <button type="button" class={secondaryClass} onclick={onWrite}>
      <i class="bx bx-pencil text-4xl"></i>
      Écrire au tableau
    </button>
    <button type="button" class={secondaryClass} onclick={onOpenTools}>
      <i class="bx bx-grid-alt text-4xl"></i>
      Ouvrir un outil
    </button>
    <button type="button" class={secondaryClass} onclick={openSessions}>
      <i class="bx bx-folder-open text-4xl"></i>
      Rouvrir une séance
    </button>
  </div>
</div>
