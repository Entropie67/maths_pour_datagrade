<script lang="ts">
  /**
   * Logo « LaTeX » (le a relevé, le E abaissé), pour reconnaître d'un coup
   * d'œil une feuille de la vue LaTeX parmi celles de la vue Impression.
   * Le mot reste du texte : lecteurs d'écran et mode sombre le gèrent.
   */
  interface Props {
    /** Fond blanc arrondi, lisible sur la vignette d'une feuille */
    badge?: boolean
    class?: string
  }

  let { badge = false, class: className = '' }: Props = $props()
</script>

<span
  class="latex-logo {badge
    ? 'rounded-md bg-white px-1.5 py-0.5 text-sm text-black shadow ring-1 ring-black/20'
    : ''} {className}"
  role="img"
  aria-label="LaTeX"
  title="Feuille de la vue LaTeX"
>
  <span aria-hidden="true"
    >L<span class="a">a</span>T<span class="e">e</span>X</span
  >
</span>

<style>
  .latex-logo {
    display: inline-block;
    font-family:
      'Latin Modern Roman', 'Computer Modern', 'CMU Serif', Georgia,
      'Times New Roman', serif;
    font-weight: 600;
    line-height: 1;
    white-space: nowrap;
  }
  .a {
    font-size: 0.75em;
    vertical-align: 0.22em;
    margin-left: -0.36em;
    margin-right: -0.15em;
  }
  .e {
    vertical-align: -0.22em;
    margin-left: -0.1667em;
    margin-right: -0.125em;
  }
</style>
