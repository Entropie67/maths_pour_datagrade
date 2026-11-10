<script lang="ts">
  import { ripple } from '../../../../lib/actions/ripple'

  export let isBackToTopButtonVisible = false
  export let backToTop: () => void
</script>

{#if isBackToTopButtonVisible}
  <button
    on:click={backToTop}
    type="button"
    use:ripple={'rgba(255, 255, 255, 0.4)'}
    class="fixed! bottom-5 right-5 rounded-full bg-transparent p-3 text-xl font-medium uppercase leading-tight text-coopmaths-action shadow-md transition duration-150 ease-in-out hover:text-coopmaths-action-lightest hover:shadow-lg focus:text-coopmaths-action-lightest focus:shadow-lg focus:outline-none focus:ring-0 active:text-coopmaths-action-lightest active:shadow-lg"
    id="btn-back-to-top"
    aria-label="Retour en haut"
  >
    <i class="bx bx-chevrons-up"></i>
  </button>
{/if}
