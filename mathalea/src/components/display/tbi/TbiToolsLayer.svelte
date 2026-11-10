<script lang="ts">
  import { showTbiToast } from '../../../lib/stores/tbiToastStore'
  import {
    bringTbiToolToFront,
    isCalculatorKind,
    isTbiToolShown,
    removeTbiTool,
    TBI_SCOPE_ALL,
    tbiActiveScope,
    tbiTools,
    toggleTbiToolPin,
    updateTbiTool,
    type TbiCalculatorTool,
    type TbiTool,
  } from '../../../lib/stores/tbiToolsStore'
  import { tbiControlsVisible } from '../../../lib/tbiControls'
  import TbiCalculatorToolComponent from './TbiCalculatorTool.svelte'
  import TbiClockWidget from './TbiClockWidget.svelte'
  import TbiDocumentWidget from './TbiDocumentWidget.svelte'
  import TbiStudentPickerWidget from './TbiStudentPickerWidget.svelte'
  import TbiTrafficLightWidget from './TbiTrafficLightWidget.svelte'
  import type { TbiToolFrameProps } from './tbiTypes'

  /**
   * Tous les outils de la séance. Un outil d'un autre onglet reste monté et
   * simplement masqué : un minuteur continue de tourner, une NumWorks garde ses
   * calculs (un `{#if}` rechargerait son iframe).
   */
  interface Props {
    /** Sauvegarde des positions et des tailles (localStorage) */
    persistLayout: () => void
    /** Nom de l'onglet affiché, pour les messages */
    tabLabel: string
  }

  let { persistLayout, tabLabel }: Props = $props()

  /** Ce qu'on perdrait à fermer cet outil : on peut alors se raviser */
  function closingMessage(tool: TbiTool): string | null {
    if (tool.kind === 'clock') {
      if (tool.timerEndAt !== null) return 'Minuteur fermé'
      if (tool.stopwatchStartAt !== null) return 'Chronomètre fermé'
      return null
    }
    if (tool.kind !== 'document' || tool.content === null) return null
    return tool.content.type === 'markdown' ? 'Note fermée' : 'Document fermé'
  }

  function close(tool: TbiTool) {
    const message = closingMessage(tool)
    removeTbiTool(tool.id)
    if (message !== null) {
      showTbiToast(message, {
        label: 'Annuler',
        run: () => tbiTools.update((tools) => [...tools, tool]),
      })
    }
  }

  function togglePin(tool: TbiTool) {
    toggleTbiToolPin(tool.id)
    showTbiToast(
      tool.scope === TBI_SCOPE_ALL
        ? `Affiché seulement sur ${tabLabel}`
        : 'Affiché sur tous les onglets',
    )
  }

  function frameOf(tool: TbiTool): TbiToolFrameProps {
    return {
      chromeVisible: $tbiControlsVisible,
      hidden: !isTbiToolShown(tool, $tbiActiveScope),
      pinned: tool.scope === TBI_SCOPE_ALL,
      onTogglePin: () => togglePin(tool),
      onCommit: (geometry) => {
        updateTbiTool(tool.id, geometry)
        persistLayout()
      },
      onClose: () => close(tool),
      onFront: () => bringTbiToolToFront(tool.id),
      persistLayout,
    }
  }
</script>

<!-- le conteneur porte le plan des outils ; leur ordre entre eux (z-index de
chacun) est celui dans lequel ils ont été touchés -->
<div class="fixed inset-0 z-40 pointer-events-none print-hidden">
  {#each $tbiTools as tool (tool.id)}
    {#if tool.kind === 'document'}
      <TbiDocumentWidget viewer={tool} frame={frameOf(tool)} />
    {:else if tool.kind === 'clock'}
      <TbiClockWidget {tool} frame={frameOf(tool)} />
    {:else if tool.kind === 'trafficLight'}
      <TbiTrafficLightWidget {tool} frame={frameOf(tool)} />
    {:else if tool.kind === 'studentPicker'}
      <TbiStudentPickerWidget {tool} frame={frameOf(tool)} />
    {:else if isCalculatorKind(tool.kind)}
      <TbiCalculatorToolComponent
        tool={tool as TbiCalculatorTool}
        frame={frameOf(tool)}
      />
    {/if}
  {/each}
</div>
