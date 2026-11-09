<script lang="ts">
  /**
   * Tuile cliquable de la vue mobile.
   *
   * `size` vaut `large` pour les rubriques de premier niveau (Collège / Lycée)
   * et `normal` pour les niveaux, thèmes et sous-thèmes.
   *
   * Si `href` est fourni, la tuile s'affiche comme un lien externe (nouvel
   * onglet) plutôt que comme un bouton de navigation interne.
   */
  type Props = {
    title: string
    subtitle?: string
    icon?: string
    size?: 'large' | 'normal'
    href?: string
    onclick?: () => void
  }

  const {
    title,
    subtitle = '',
    icon = '',
    size = 'normal',
    href,
    onclick,
  }: Props = $props()

  const sharedClasses = $derived(`w-full flex flex-row items-center justify-between gap-3 text-left rounded-xl
  border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest
  bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark
  active:bg-coopmaths-canvas-darkest dark:active:bg-coopmathsdark-canvas-darkest
  transition-colors duration-150
  ${size === 'large' ? 'p-5' : 'px-4 py-3'}`)
</script>

{#snippet content()}
  <div class="flex flex-row items-center gap-3 min-w-0">
    {#if icon}
      <i
        class="bx {icon} shrink-0 text-coopmaths-action dark:text-coopmathsdark-action
        {size === 'large' ? 'text-4xl' : 'text-2xl'}"
      ></i>
    {/if}
    <div class="min-w-0">
      <div
        class="text-coopmaths-struct dark:text-coopmathsdark-struct font-bold
        {size === 'large' ? 'text-2xl' : 'text-base'}"
      >
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html title}
      </div>
      {#if subtitle}
        <div
          class="mt-0.5 text-sm font-light text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest"
        >
          <!-- eslint-disable-next-line svelte/no-at-html-tags -->
          {@html subtitle}
        </div>
      {/if}
    </div>
  </div>
  <i
    class="bx {href ? 'bx-link-external' : 'bx-chevron-right'} shrink-0 text-2xl text-coopmaths-action dark:text-coopmathsdark-action"
  ></i>
{/snippet}

{#if href}
  <a {href} target="_blank" rel="noopener noreferrer" class={sharedClasses}>
    {@render content()}
  </a>
{:else}
  <button type="button" {onclick} class={sharedClasses}>
    {@render content()}
  </button>
{/if}
