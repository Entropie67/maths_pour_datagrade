<script lang="ts">
  import {
    calculatorHeightForWidth,
    TBI_CALCULATOR_MAX_W,
    TBI_CALCULATOR_MIN_W,
    type TbiCalculatorTool,
  } from '../../../lib/stores/tbiToolsStore'
  import { statsTbiCalculatorTracker } from '../../../modules/statsUtils'
  import TbiCalculatorBody from './TbiCalculatorBody.svelte'
  import TbiToolFrame from './TbiToolFrame.svelte'
  import type { TbiToolFrameProps } from './tbiTypes'

  /** Calculatrice de la vue TBI, dans la liste commune des outils */
  interface Props {
    tool: TbiCalculatorTool
    frame: TbiToolFrameProps
  }

  let { tool, frame }: Props = $props()

  const titles = {
    college: 'Calculatrice collège',
    lycee: 'Calculatrice lycée',
    calculette: 'Calculette',
  }

  /** Une iframe ne doit pas capter le pointeur pendant un geste */
  let isGesturing = $state(false)
</script>

<TbiToolFrame
  title={titles[tool.kind]}
  x={tool.x}
  y={tool.y}
  w={tool.w}
  h={tool.h}
  z={tool.z}
  minW={TBI_CALCULATOR_MIN_W}
  maxW={TBI_CALCULATOR_MAX_W}
  heightForWidth={(w) => calculatorHeightForWidth(tool.kind, w)}
  onGesture={(active) => (isGesturing = active)}
  {...frame}
  onCommit={(geometry) =>
    frame.onCommit({
      ...geometry,
      h: calculatorHeightForWidth(tool.kind, geometry.w),
    })}
>
  <TbiCalculatorBody
    kind={tool.kind}
    {isGesturing}
    onOpen={statsTbiCalculatorTracker}
  />
</TbiToolFrame>
