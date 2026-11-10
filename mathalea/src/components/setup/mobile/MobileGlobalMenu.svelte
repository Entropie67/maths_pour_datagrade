<script lang="ts">
  import { darkMode } from '../../../lib/stores/generalStore'
  import type { VueType } from '../../../lib/VueType'
  import MobileMenuAction from './MobileMenuAction.svelte'
  import MobileOverlay from './MobileOverlay.svelte'

  /**
   * Menu général de la vue mobile : il recouvre les exercices et regroupe les
   * actions qui portent sur l'ensemble de la sélection.
   */
  type Props = {
    isAllInteractive: boolean
    hasExercises: boolean
    newDataForAll: () => void
    setAllInteractive: (isAllInteractive: boolean) => void
    trash: () => void
    handleExport: (vue: VueType) => void
    openReorder: () => void
    useDesktopView: () => void
    onclose: () => void
  }

  const {
    isAllInteractive,
    hasExercises,
    newDataForAll,
    setAllInteractive,
    trash,
    handleExport,
    openReorder,
    useDesktopView,
    onclose,
  }: Props = $props()

  function run(action: () => void) {
    action()
    onclose()
  }
</script>

<MobileOverlay title="Menu" {onclose}>
  <MobileMenuAction
    icon="bx-refresh"
    label="Nouvelles données"
    description="Régénère tous les exercices"
    disabled={!hasExercises}
    onclick={() => run(newDataForAll)}
  />
  <MobileMenuAction
    icon={isAllInteractive ? 'bx-toggle-right' : 'bx-toggle-left'}
    label={isAllInteractive
      ? "Désactiver l'interactivité"
      : "Activer l'interactivité"}
    description="Sur tous les exercices"
    disabled={!hasExercises}
    onclick={() => run(() => setAllInteractive(!isAllInteractive))}
  />
  <MobileMenuAction
    icon="bx-sort"
    label="Réordonner les exercices"
    disabled={!hasExercises}
    onclick={() => run(openReorder)}
  />
  <MobileMenuAction
    icon="bx-printer"
    label="Impression"
    description="Mise en page pour l'impression et le PDF"
    disabled={!hasExercises}
    onclick={() => run(() => handleExport('typst'))}
  />
  <MobileMenuAction
    icon="bx-link"
    label="Créer un lien élève"
    description="Pour partager la sélection avec les élèves"
    disabled={!hasExercises}
    onclick={() => run(() => handleExport('confeleve'))}
  />
  <MobileMenuAction
    icon="bx-trash"
    label="Tout effacer"
    description="Vide la sélection et revient à l'accueil"
    disabled={!hasExercises}
    onclick={() => run(trash)}
  />
  <MobileMenuAction
    icon={$darkMode.isActive ? 'bx-sun' : 'bx-moon'}
    label={$darkMode.isActive ? 'Thème clair' : 'Thème sombre'}
    onclick={() => ($darkMode.isActive = !$darkMode.isActive)}
  />
  <MobileMenuAction
    icon="bx-desktop"
    label="Afficher comme sur un ordinateur"
    description="Bascule vers la mise en page bureau"
    onclick={() => run(useDesktopView)}
  />
</MobileOverlay>
