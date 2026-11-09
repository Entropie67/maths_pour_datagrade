<script lang="ts">
  import type Figure from 'apigeom/src/Figure'
  import type { SaveJson } from 'apigeom/src/elements/interfaces'
  import { onMount } from 'svelte'
  import { enableFigureUiRecovery } from '../../../lib/apigeom/recoverFigureUi'
  import { setTbiFigureSourceReader } from '../../../lib/stores/tbiDocumentStore'
  import {
    apigeomViewport,
    withoutApigeomViewport,
  } from '../../../lib/tbiTextContent'

  interface Props {
    /** Visualiseur de la figure : la séance y lit son état au moment d'enregistrer */
    viewerId: number
    /** JSON déjà vérifié par `apigeomFigureError` */
    source: string
  }

  let { viewerId, source }: Props = $props()

  let container: HTMLDivElement
  let errorMessage = $state('')
  let showToolbar = $state(false)

  let figure: Figure | undefined
  let parsed: Record<string, unknown> = {}

  /** La figure occupe tout le cadre, tous ses éléments restant visibles */
  function fitToFrame() {
    if (!figure) return
    const current = figure
    // les outils affichés occupent la gauche du cadre
    const left =
      current.divFigure.getBoundingClientRect().left -
      container.getBoundingClientRect().left
    const width = container.clientWidth - (showToolbar ? left : 0)
    const height = container.clientHeight
    if (width <= 0 || height <= 0) return
    const viewport = apigeomViewport(parsed, width, height)
    current.batchViewport(() => {
      current.width = width
      current.height = height
      if (viewport) {
        current.pixelsPerUnit = viewport.pixelsPerUnit
        current.xMin = viewport.xMin
        current.yMin = viewport.yMin
      }
    })
  }

  function setToolbarVisible(visible: boolean) {
    showToolbar = visible
    if (!figure) return
    figure.divButtons.style.display = visible ? 'grid' : 'none'
    fitToFrame()
  }

  onMount(() => {
    let isDestroyed = false
    const observer = new ResizeObserver(fitToFrame)
    void (async () => {
      try {
        // chargée à la demande, comme dans les exercices qui l'utilisent
        const { default: FigureClass } = await import('apigeom')
        if (isDestroyed) return
        parsed = JSON.parse(source)
        const created = new FigureClass({
          width: Math.max(1, container.clientWidth),
          height: Math.max(1, container.clientHeight),
          scaleDimensions: false,
          isDynamic: true,
        })
        const viewport = apigeomViewport(
          parsed,
          container.clientWidth,
          container.clientHeight,
        )
        created.loadJson(
          (viewport
            ? withoutApigeomViewport(parsed)
            : parsed) as unknown as SaveJson,
          true,
        )
        created.setContainer(container)
        enableFigureUiRecovery(created)
        created.divUserMessage.style.display = 'none'
        created.buttons.get('DRAG')?.click()
        figure = created
        // points déplacés, curseurs, constructions : la séance garde la figure
        // telle qu'elle est à l'écran, pas le fichier d'origine
        setTbiFigureSourceReader(viewerId, () => created.json)
        setToolbarVisible(false)
        fitToFrame()
        observer.observe(container)
      } catch (error) {
        console.error('Ouverture de la figure ApiGeom impossible', error)
        errorMessage = 'Cette figure ApiGeom ne peut pas être affichée.'
      }
    })()
    return () => {
      isDestroyed = true
      setTbiFigureSourceReader(viewerId, null)
      observer.disconnect()
      figure?.destroy()
      figure = undefined
    }
  })
</script>

<div class="relative flex-1 min-h-0 bg-white text-black overflow-hidden">
  <div
    bind:this={container}
    class="tbi-apigeom absolute inset-0 overflow-auto"
  ></div>
  {#if errorMessage}
    <p
      class="absolute inset-x-0 top-1/2 -translate-y-1/2 px-4 text-center text-sm text-coopmaths-warn-dark"
    >
      {errorMessage}
    </p>
  {:else}
    <button
      type="button"
      class="absolute right-2 bottom-2 flex items-center justify-center w-11 h-11 rounded-full shadow-md {showToolbar
        ? 'bg-coopmaths-struct text-coopmaths-canvas'
        : 'bg-coopmaths-canvas text-coopmaths-corpus'}"
      title={showToolbar ? 'Masquer les outils' : 'Afficher les outils'}
      aria-label={showToolbar ? 'Masquer les outils' : 'Afficher les outils'}
      aria-pressed={showToolbar}
      onclick={() => setToolbarVisible(!showToolbar)}
    >
      <i class="bx bx-wrench text-xl"></i>
    </button>
  {/if}
</div>
