<script lang="ts">
  import type { Stars } from '../../../lib/mesFeuilles/library'

  /**
   * De 0 à 3 étoiles. Cliquer sur l'étoile de la note actuelle la retire
   * (une note de 1 redevient 0).
   */
  interface Props {
    value: Stars
    onchange: (value: Stars) => void
    /** Nom de l'élément noté, pour les lecteurs d'écran */
    label: string
    size?: string
  }

  let { value, onchange, label, size = 'text-xl' }: Props = $props()

  let hovered = $state<Stars>(0)
  const shown = $derived(hovered > 0 ? hovered : value)
  const values: Stars[] = [1, 2, 3]
</script>

<div
  class="inline-flex flex-row items-center"
  role="group"
  aria-label="Étoiles de {label}"
  onmouseleave={() => (hovered = 0)}
>
  {#each values as star (star)}
    <button
      type="button"
      class="leading-none p-0.5 {star <= shown
        ? 'text-amber-500 dark:text-amber-400'
        : 'text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest'} hover:scale-110 transition-transform"
      title={star === value
        ? 'Retirer les étoiles'
        : `${star} étoile${star > 1 ? 's' : ''}`}
      aria-label="{star} étoile{star > 1 ? 's' : ''}"
      aria-pressed={star <= value}
      onmouseenter={() => (hovered = star)}
      onclick={() => onchange(star === value ? 0 : star)}
    >
      <i class="bx {star <= shown ? 'bxs-star' : 'bx-star'} {size}"></i>
    </button>
  {/each}
</div>
