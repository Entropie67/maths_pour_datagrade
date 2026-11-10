<script lang="ts">
  import { TBI_BOARD_UNIT_DIVISOR, type TbiBoard } from '../../../lib/tbiBoard'

  /**
   * Fond d'un onglet, sous les exercices : il se voit dans les espaces libres et
   * défile avec le contenu. Il est porté par un élément à part, Chromium ne
   * peignant pas toujours un dégradé en arrière-plan d'un canvas.
   */
  interface Props {
    board: TbiBoard
  }

  let { board }: Props = $props()
</script>

<div
  class="tbi-background absolute inset-0 z-0 print-hidden bg-{board.background}"
  style:--unit="calc(100vw / {TBI_BOARD_UNIT_DIVISOR} * {board.gridSize})"
></div>

<style>
  .tbi-background {
    --line: color-mix(in srgb, var(--color-coopmaths-struct) 18%, transparent);
    --line-strong: color-mix(
      in srgb,
      var(--color-coopmaths-struct) 42%,
      transparent
    );
    background-color: var(--color-coopmaths-canvas);
  }
  :global(.dark) .tbi-background {
    --line: color-mix(
      in srgb,
      var(--color-coopmathsdark-struct) 20%,
      transparent
    );
    --line-strong: color-mix(
      in srgb,
      var(--color-coopmathsdark-struct) 45%,
      transparent
    );
    background-color: var(--color-coopmathsdark-canvas);
  }
  .bg-grid {
    background-image:
      linear-gradient(var(--line-strong) 1px, transparent 1px),
      linear-gradient(90deg, var(--line-strong) 1px, transparent 1px);
    background-size: var(--unit) var(--unit);
  }
  /* réglure Seyès : 4 interlignes par carreau, verticales tous les carreaux */
  .bg-seyes {
    background-image:
      linear-gradient(var(--line-strong) 1px, transparent 1px),
      linear-gradient(var(--line) 1px, transparent 1px),
      linear-gradient(90deg, var(--line-strong) 1px, transparent 1px);
    background-size:
      var(--unit) var(--unit),
      var(--unit) calc(var(--unit) / 4),
      var(--unit) var(--unit);
  }
  .bg-dots {
    background-image: radial-gradient(
      var(--line-strong) 1.5px,
      transparent 2px
    );
    background-size: var(--unit) var(--unit);
  }
</style>
