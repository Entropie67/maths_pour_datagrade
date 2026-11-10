<script lang="ts">
  import { globalOptions } from '../../../lib/stores/globalOptions'

  /**
   * Passerelles entre les exports Typst (fiche à imprimer, flash-cards,
   * diaporama PDF, évaluation papier) : la vue courante est retirée de la
   * liste. Elles reprennent les exercices en place, sans repasser par la page
   * d'accueil.
   */

  type ExportView = 'typst' | 'flashcards' | 'i-have-who-has' | 'slides' | 'omr'

  const { current }: { current: ExportView } = $props()

  const VIEWS: {
    id: ExportView
    label: string
    icon: string
    title: string
  }[] = [
    {
      id: 'typst',
      label: 'Impression',
      icon: 'bx-printer',
      title: 'Fiche d’exercices à imprimer',
    },
    {
      id: 'flashcards',
      label: 'Flash-cards',
      icon: 'bx-credit-card-front',
      title: 'Cartes recto (question) / verso (réponse) à découper',
    },
    {
      id: 'i-have-who-has',
      label: 'J’ai… qui a… ?',
      icon: 'bx-group',
      title: 'Cartes en chaîne pour jouer en classe',
    },
    {
      id: 'slides',
      label: 'Diaporama PDF',
      icon: 'bxs-slideshow',
      title: 'PDF au format d’un écran : une question en grand par page',
    },
  ]

  // `omr` n'est pas dans la liste : l'évaluation papier reprend ces passerelles
  // pour revenir aux trois autres exports, mais ne s'y propose jamais
  // elle-même — c'est un prototype, on n'y envoie personne au détour d'un clic
  const others = VIEWS.filter((view) => view.id !== current)

  function goTo(view: ExportView) {
    globalOptions.update((options) => {
      options.v = view
      return options
    })
  }
</script>

<div
  class="flex flex-row flex-wrap items-center gap-x-4 gap-y-1"
  data-tour="export-view-links"
>
  {#each others as view (view.id)}
    <button
      type="button"
      title={view.title}
      class="flex items-center gap-1 text-sm text-coopmaths-action hover:text-coopmaths-action-lightest dark:text-coopmathsdark-action dark:hover:text-coopmathsdark-action-lightest"
      onclick={() => goTo(view.id)}
    >
      <i class="bx {view.icon} text-lg"></i>
      {view.label}
    </button>
  {/each}
</div>
