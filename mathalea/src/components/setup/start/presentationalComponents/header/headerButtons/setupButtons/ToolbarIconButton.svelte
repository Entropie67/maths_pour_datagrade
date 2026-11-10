<script lang="ts">
  export let icon: string
  export let tooltip: string
</script>

<!--
  @component
  Bouton icône de la barre d'outils de la conception de document :
  orange comme les autres actions, avec un fond rond au survol.
 -->
<div class="tooltip tooltip-bottom tooltip-neutral" data-tip={tooltip}>
  <button
    type="button"
    aria-label={tooltip}
    class="flex items-center justify-center size-9 rounded-full transition-colors
      text-coopmaths-action dark:text-coopmathsdark-action
      hover:bg-coopmaths-action-100 dark:hover:bg-coopmathsdark-canvas-dark
      hover:text-coopmaths-action-dark dark:hover:text-coopmathsdark-action-lightest"
    on:click
  >
    <i aria-hidden="true" class="bx {icon} text-2xl"></i>
  </button>
</div>
