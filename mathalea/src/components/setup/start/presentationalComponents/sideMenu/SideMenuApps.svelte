<script>
  import { getContext } from 'svelte'
  const context = getContext('thirdAppsChoiceContext')
  const toggleThirdAppsChoiceDialog =
    typeof context?.toggleThirdAppsChoiceDialog === 'function'
      ? context.toggleThirdAppsChoiceDialog
      : () => {}
</script>

<button
  type="button"
  class={`${$$props.class || ''} font-bold text-xl text-coopmaths-struct dark:text-coopmathsdark-struct`}
  on:click={toggleThirdAppsChoiceDialog}
>
  Applications tierces
</button>
