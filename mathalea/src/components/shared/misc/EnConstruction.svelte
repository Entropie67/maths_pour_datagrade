<script lang="ts">
  import { darkMode } from '../../../lib/stores/generalStore'

  /**
   * Page « En construction… » : masque temporairement une fonctionnalité en
   * phase de test (gate beta). Volontairement discrète : aucune indication
   * sur le mécanisme d'accès réservé aux développeurs.
   */
  export let feature: string = ''
</script>

<main
  class="{$darkMode.isActive
    ? 'dark'
    : ''} flex flex-col min-h-screen items-center justify-center gap-6 px-6 text-center
  bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
>
  <i
    class="bx bx-hard-hat text-7xl text-coopmaths-struct dark:text-coopmathsdark-struct"
  ></i>
  <h1
    class="text-3xl font-extrabold text-coopmaths-struct dark:text-coopmathsdark-struct"
  >
    En construction…
  </h1>
  <p
    class="text-lg font-light text-coopmaths-corpus dark:text-coopmathsdark-corpus"
  >
    {#if feature.length > 0}
      La fonctionnalité « {feature} » n'est pas encore disponible.
    {:else}
      Cette fonctionnalité n'est pas encore disponible.
    {/if}
  </p>
</main>
