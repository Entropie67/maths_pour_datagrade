<script lang="ts">
  /**
   * Point d'entrée de la recherche sur la page d'accueil de la vue mobile :
   * un champ factice qui ouvre la recherche plein écran avec aperçu des
   * exercices (l'équivalent mobile de la modale Ctrl/Cmd+K).
   */
  type Props = {
    onOpen: () => void
  }

  const { onOpen }: Props = $props()
</script>

<button
  type="button"
  onclick={onOpen}
  class="w-full flex flex-row items-center gap-2 rounded-lg px-3 py-2 text-left
  border border-coopmaths-action dark:border-coopmathsdark-action
  bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark
  text-sm italic text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest"
>
  <i class="bx bx-search"></i>
  Thème, identifiant...
</button>
