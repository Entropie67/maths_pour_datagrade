<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import {
    TBI_TRAFFIC_LIGHT_MAX_H,
    TBI_TRAFFIC_LIGHT_MAX_W,
    TBI_TRAFFIC_LIGHT_MIN_H,
    TBI_TRAFFIC_LIGHT_MIN_W,
    updateTbiTool,
    type TbiTrafficLightColor,
    type TbiTrafficLightTool,
  } from '../../../lib/stores/tbiToolsStore'
  import TbiToolFrame from './TbiToolFrame.svelte'
  import type { TbiToolFrameProps } from './tbiTypes'

  interface Props {
    tool: TbiTrafficLightTool
    /** Commandes communes aux outils (voir `TbiToolsLayer`) */
    frame: TbiToolFrameProps
  }

  let { tool, frame }: Props = $props()

  const colors: TbiTrafficLightColor[] = ['red', 'orange', 'green']

  const lightColor: Record<TbiTrafficLightColor, string> = {
    red: '#ef4444',
    orange: '#f59e0b',
    green: '#22c55e',
  }

  const lightLabel: Record<TbiTrafficLightColor, string> = {
    red: 'Rouge',
    orange: 'Orange',
    green: 'Vert',
  }

  let active = $derived(tool.active)

  function setActive(color: TbiTrafficLightColor) {
    updateTbiTool(tool.id, { active: color })
  }

  /**
   * Diamètre (px) des feux, recalculé à chaque redimensionnement du widget
   * pour occuper l'espace disponible tout en restant toujours parfaitement
   * ronds (contrairement à un simple `aspect-square` en flexbox, qui peut
   * être écrasé par la contrainte de largeur et donner un ovale).
   */
  let slotsEl: HTMLElement
  let diameter = $state(40)
  let resizeObserver: ResizeObserver | undefined

  function recomputeDiameter() {
    if (!slotsEl) return
    const rowGap = parseFloat(getComputedStyle(slotsEl).rowGap || '0') || 0
    const cellHeight =
      (slotsEl.clientHeight - rowGap * (colors.length - 1)) / colors.length
    diameter = Math.max(0, Math.floor(Math.min(slotsEl.clientWidth, cellHeight)) - 6)
  }

  onMount(() => {
    resizeObserver = new ResizeObserver(recomputeDiameter)
    resizeObserver.observe(slotsEl)
    recomputeDiameter()
  })

  onDestroy(() => {
    resizeObserver?.disconnect()
  })

  function lightStyle(color: TbiTrafficLightColor): string {
    const c = lightColor[color]
    const base = `width: ${diameter}px; height: ${diameter}px; border-radius: 9999px;`
    if (active === color) {
      const glow = Math.round(diameter * 0.45)
      return (
        base +
        `background: radial-gradient(circle at 33% 28%, ${c}f2, ${c} 68%);` +
        `box-shadow: 0 0 ${glow}px ${c}b3, 0 0 ${Math.round(diameter * 0.15)}px ${c} inset;` +
        `border: 2px solid rgba(255, 255, 255, 0.55);`
      )
    }
    return base + `background: ${c}26; border: 1px solid ${c}59;`
  }
</script>

<TbiToolFrame
  title="Feu tricolore"
  x={tool.x}
  y={tool.y}
  w={tool.w}
  h={tool.h}
  z={tool.z}
  minW={TBI_TRAFFIC_LIGHT_MIN_W}
  maxW={TBI_TRAFFIC_LIGHT_MAX_W}
  minH={TBI_TRAFFIC_LIGHT_MIN_H}
  maxH={TBI_TRAFFIC_LIGHT_MAX_H}
  {...frame}
  bodyClass="!bg-neutral-900"
>
  <div
    bind:this={slotsEl}
    class="w-full h-full flex flex-col items-stretch justify-around gap-1 p-2 overflow-hidden"
  >
    {#each colors as color (color)}
      <div class="flex-1 min-h-0 flex items-center justify-center">
        <button
          type="button"
          class="relative shrink-0 transition-[background,box-shadow] duration-150"
          style={lightStyle(color)}
          title={lightLabel[color]}
          aria-label="Feu {lightLabel[color]}"
          aria-pressed={active === color}
          onclick={() => setActive(color)}
        ></button>
      </div>
    {/each}
  </div>
</TbiToolFrame>
