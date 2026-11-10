<script lang="ts">
  import { onMount } from 'svelte'
  import type { Writable } from 'svelte/store'
  import {
    calculatorHeightForWidth,
    calculatorStateOf,
    type CalculatorsState,
    TBI_CALCULATOR_MAX_W,
    TBI_CALCULATOR_MIN_W,
    type TbiCalculatorKind,
  } from '../../../lib/stores/tbiStore'
  import TbiCalculatorBody from './TbiCalculatorBody.svelte'
  import TbiToolFrame from './TbiToolFrame.svelte'
  import type { TbiToolGeometry } from './tbiTypes'

  /**
   * Calculatrice de la vue élève : un exemplaire de chaque modèle, sans onglets.
   * La vue TBI a sa propre liste d'outils (voir `TbiToolsLayer`).
   */
  interface Props {
    kind: TbiCalculatorKind
    /** Store portant l'état des calculatrices */
    store: Writable<CalculatorsState>
    /** Signalement statistique de l'ouverture */
    onOpen: (kind: TbiCalculatorKind) => void
    /** Masque le widget sans le démonter, pour conserver l'état de la calculatrice */
    hidden?: boolean
  }

  let { kind, store, onOpen, hidden = false }: Props = $props()

  const titles: Record<TbiCalculatorKind, string> = {
    college: 'Calculatrice collège',
    lycee: 'Calculatrice lycée',
    calculette: 'Calculette',
  }
  const defaultX: Record<TbiCalculatorKind, number> = {
    college: 500,
    lycee: 780,
    calculette: 220,
  }

  /** Une iframe ne doit pas capter le pointeur pendant un geste */
  let isGesturing = $state(false)

  // copie superficielle : calculatorStateOf renvoie la même référence mutée
  // en place, ce qui empêcherait $derived de détecter un changement
  let calc = $derived({ ...calculatorStateOf($store, kind) })

  function close() {
    store.update((state) => {
      calculatorStateOf(state, kind).visible = false
      return state
    })
  }

  function commit(geometry: TbiToolGeometry) {
    store.update((state) => {
      const c = calculatorStateOf(state, kind)
      c.x = geometry.x
      c.y = geometry.y
      c.w = geometry.w
      c.h = calculatorHeightForWidth(kind, geometry.w)
      return state
    })
  }

  function bringToFront() {
    store.update((state) => {
      const others = [
        state.collegeCalculator,
        state.lyceeCalculator,
        state.calculette,
      ]
      calculatorStateOf(state, kind).z =
        Math.max(...others.map((calculator) => calculator.z)) + 1
      return state
    })
  }

  onMount(() => {
    store.update((state) => {
      const c = calculatorStateOf(state, kind)
      if (c.x === 0 && c.y === 0) {
        c.x = defaultX[kind]
        c.y = 16
      }
      return state
    })
  })
</script>

<TbiToolFrame
  title={titles[kind]}
  x={calc.x}
  y={calc.y}
  w={calc.w}
  h={calc.h}
  z={40 + calc.z}
  minW={TBI_CALCULATOR_MIN_W}
  maxW={TBI_CALCULATOR_MAX_W}
  heightForWidth={(w) => calculatorHeightForWidth(kind, w)}
  bottomReserve={0}
  {hidden}
  onCommit={commit}
  onClose={close}
  onFront={bringToFront}
  onGesture={(active) => (isGesturing = active)}
>
  <TbiCalculatorBody {kind} {isGesturing} {onOpen} />
</TbiToolFrame>
