<script lang="ts">
  import { tbiLabelHtml } from '../../../lib/tbiLabel'

  /** Nom d'onglet ou message, avec ses formules rendues par KaTeX */
  interface Props {
    text: string
    class?: string
  }

  let { text, class: className = '' }: Props = $props()
</script>

<!-- eslint-disable-next-line svelte/no-at-html-tags : tbiLabelHtml échappe le texte -->
<span class={className}>{@html tbiLabelHtml(text)}</span>
