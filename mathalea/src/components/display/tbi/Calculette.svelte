<script lang="ts">
  import {
    calculetteKeyFromKeyboard,
    initialCalculetteState,
    pressCalculetteKey,
    type CalculetteKey,
  } from '../../../lib/calculette'

  /**
   * Calculatrice très basique (quatre opérations sans priorité : le 2e
   * opérateur effectue le calcul en cours et poursuit sur une nouvelle ligne
   * avec le résultat ; virgule décimale, valeur approchée du résultat). Tout
   * est dimensionné en
   * unités de conteneur (cqw) : le rendu suit la largeur du widget.
   */
  interface Key {
    key: CalculetteKey
    label: string
    aria: string
    kind: 'digit' | 'operator' | 'clear' | 'equals'
    wide?: boolean
  }

  const keys: Key[] = [
    { key: 'tout-effacer', label: 'AC', aria: 'Tout effacer', kind: 'clear', wide: true },
    { key: 'effacer', label: '⌫', aria: 'Effacer', kind: 'clear' },
    { key: '÷', label: '÷', aria: 'Diviser', kind: 'operator' },
    { key: '7', label: '7', aria: '7', kind: 'digit' },
    { key: '8', label: '8', aria: '8', kind: 'digit' },
    { key: '9', label: '9', aria: '9', kind: 'digit' },
    { key: '×', label: '×', aria: 'Multiplier', kind: 'operator' },
    { key: '4', label: '4', aria: '4', kind: 'digit' },
    { key: '5', label: '5', aria: '5', kind: 'digit' },
    { key: '6', label: '6', aria: '6', kind: 'digit' },
    { key: '−', label: '−', aria: 'Soustraire', kind: 'operator' },
    { key: '1', label: '1', aria: '1', kind: 'digit' },
    { key: '2', label: '2', aria: '2', kind: 'digit' },
    { key: '3', label: '3', aria: '3', kind: 'digit' },
    { key: '+', label: '+', aria: 'Additionner', kind: 'operator' },
    { key: '0', label: '0', aria: '0', kind: 'digit' },
    { key: ',', label: ',', aria: 'Virgule', kind: 'digit' },
    { key: '=', label: '=', aria: 'Égal', kind: 'equals', wide: true },
  ]

  let state = $state(initialCalculetteState)
  let rootEl: HTMLElement
  let expressionEl: HTMLElement

  function press(key: CalculetteKey) {
    state = pressCalculetteKey(state, key)
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.ctrlKey || event.metaKey || event.altKey) return
    const key = calculetteKeyFromKeyboard(event.key)
    if (key === null) return
    event.preventDefault()
    press(key)
  }

  // les touches ne prennent pas le focus : il reste sur la calculatrice, qui
  // reçoit ainsi le clavier physique
  function onKeypadPointerDown(event: PointerEvent) {
    event.preventDefault()
    rootEl.focus()
  }

  // un long calcul reste lisible : l'écran montre toujours la fin de la saisie
  $effect(() => {
    void state.expression
    void state.previous
    expressionEl.scrollLeft = expressionEl.scrollWidth
  })
</script>

<div class="calculette">
  <!-- le clavier physique n'est capté que lorsque la calculette a le focus -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions, a11y_no_noninteractive_tabindex -->
  <div
    bind:this={rootEl}
    class="body"
    role="application"
    aria-label="Calculette"
    tabindex="0"
    onkeydown={onKeydown}
  >
    <div class="brand">MathALÉA</div>
    <div class="screen">
      <div class="previous">{state.previous ?? ''}</div>
      <div bind:this={expressionEl} class="expression">{state.expression}</div>
      <div class="result" role="status">
        {state.error ? 'Erreur' : (state.result ?? '')}
      </div>
    </div>
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="keypad" onpointerdown={onKeypadPointerDown}>
      {#each keys as { key, label, aria, kind, wide } (key)}
        <button
          type="button"
          tabindex="-1"
          class="key {kind}"
          class:wide
          aria-label={aria}
          onclick={() => press(key)}
        >
          {label}
        </button>
      {/each}
    </div>
  </div>
</div>

<style>
  .calculette {
    container-type: size;
    width: 100%;
    height: 100%;
  }

  .body {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 3.5cqw;
    padding: 6cqw 7cqw 7cqw;
    background: linear-gradient(180deg, #343a41 0%, #262b31 100%);
    color: #e9ecef;
    font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
    user-select: none;
    outline: none;
  }

  .brand {
    text-align: center;
    font-size: 4.6cqw;
    font-weight: 600;
    letter-spacing: 0.35em;
    padding-left: 0.35em;
    color: #aab4be;
  }

  .screen {
    flex: none;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    box-sizing: border-box;
    height: 33cqw;
    padding: 2.5cqw 4cqw;
    border-radius: 3cqw;
    background: #c8d1c3;
    color: #1f2429;
    box-shadow:
      inset 0 0.6cqw 1.6cqw rgba(0, 0, 0, 0.35),
      0 0 0 1.2cqw #1c2025;
    margin: 0.6cqw;
  }

  .previous {
    min-height: 1.3em;
    overflow: hidden;
    white-space: nowrap;
    text-align: right;
    font-size: 4.4cqw;
    line-height: 1.3;
    color: rgba(31, 36, 41, 0.6);
    font-variant-numeric: tabular-nums;
  }

  .expression {
    overflow: hidden;
    white-space: nowrap;
    font-size: 6.4cqw;
    line-height: 1.3;
    font-variant-numeric: tabular-nums;
  }

  .result {
    min-height: 1.3em;
    text-align: right;
    font-size: 9cqw;
    font-weight: 600;
    line-height: 1.3;
    white-space: nowrap;
    overflow: hidden;
    font-variant-numeric: tabular-nums;
    border-top: 0.4cqw solid rgba(31, 36, 41, 0.35);
  }

  .keypad {
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-auto-rows: 1fr;
    gap: 3cqw;
  }

  .key {
    min-width: 0;
    border: none;
    border-radius: 3.2cqw;
    font: inherit;
    font-size: 6.6cqw;
    font-weight: 600;
    line-height: 1;
    cursor: pointer;
    box-shadow:
      0 0.8cqw 0 rgba(0, 0, 0, 0.45),
      inset 0 0.4cqw 0 rgba(255, 255, 255, 0.25);
    transition:
      transform 60ms,
      box-shadow 60ms,
      filter 120ms;
  }

  .key:hover {
    filter: brightness(1.08);
  }

  .key:active {
    transform: translateY(0.6cqw);
    box-shadow:
      0 0.2cqw 0 rgba(0, 0, 0, 0.45),
      inset 0 0.4cqw 0 rgba(255, 255, 255, 0.25);
  }

  .key.wide {
    grid-column: span 2;
  }

  .key.digit {
    background: #e9ecef;
    color: #1f2429;
  }

  .key.operator {
    background: #216d9a;
    color: #fff;
    font-size: 7.6cqw;
  }

  .key.clear {
    background: #6a7c8d;
    color: #fff;
    font-size: 5.6cqw;
  }

  .key.equals {
    background: #f15929;
    color: #fff;
    font-size: 7.6cqw;
  }
</style>
