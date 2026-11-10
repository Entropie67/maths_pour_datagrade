<script lang="ts">
  import { darkMode } from '../../../lib/stores/generalStore'
</script>

<!-- Le nom décrit l'action, donc il change avec le mode courant -->
<button
  type="button"
  aria-label={$darkMode.isActive
    ? 'Activer le mode clair'
    : 'Activer le mode sombre'}
  class="text-coopmaths-action dark:text-coopmathsdark-action
          hover:text-coopmaths-action-lightest dark:hover:text-coopmathsdark-action-lightest"
  on:click={() => ($darkMode.isActive = !$darkMode.isActive)}
>
  {#if $darkMode.isActive}
    <i class="bx bx-sm bx-sun" aria-hidden="true"></i>
  {:else}
    <i class="bx bx-sm bx-moon" aria-hidden="true"></i>
  {/if}
</button>
