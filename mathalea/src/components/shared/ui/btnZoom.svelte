<script lang="ts">
  import {
    resizeQcmInputs,
    resizeTags,
    ZOOM_MIN,
  } from '../../../lib/components/sizeTools'
  import { mathaleaUpdateUrlFromExercicesParams } from '../../../lib/mathalea'
  import { exercicesParams } from '../../../lib/stores/generalStore'
  import { globalOptions } from '../../../lib/stores/globalOptions'

  export let size: 'xs' | 'sm' | 'md' | 'lg' | 'bx-sm md:bx-md' = 'sm'
  export let isBorderTransparent: boolean = false

  const urlParams = new URLSearchParams(window.location.search)
  const z = urlParams.get('z')
  let zoom: number = z ? Number.parseFloat(z) : 1

  function zoomMinus() {
    // zoom -= 0.1
    zoom = Math.max(ZOOM_MIN, Number.parseFloat((zoom - 0.1).toFixed(1)))
    updateSize()
  }

  function zoomPlus() {
    // zoom += 0.1
    zoom = Number.parseFloat((zoom + 0.1).toFixed(1))
    updateSize()
  }

  function updateSize() {
    globalOptions.update((params) => {
      params.z = zoom.toString()
      return params
    })
    // figures scratch
    const scratchDivs = document.getElementsByClassName('scratchblocks')
    for (const scratchDiv of scratchDivs) {
      const svgDivs = scratchDiv.getElementsByTagName('svg')
      resizeTags([...svgDivs], Number.parseFloat($globalOptions.z ?? '1'))
    }
    // QCM
    const checkboxes = document.querySelectorAll<HTMLElement>('[id^=checkEx')
    resizeQcmInputs([...checkboxes], Number.parseFloat($globalOptions.z ?? '1'))
    mathaleaUpdateUrlFromExercicesParams($exercicesParams)
    // Event pour apiGeom
    const zoomEvent = new CustomEvent('zoomChanged', {
      detail: { zoom: $globalOptions.z },
    })
    document.dispatchEvent(zoomEvent)
  }
</script>

<button
  type="button"
  on:click={zoomMinus}
  class="tooltip tooltip-left tooltip-neutral"
  data-tip="Réduire la taille du texte"
  aria-label="Réduire la taille du texte"
>
  <i
    aria-hidden="true"
    class="bx {size} rounded-full p-1 bx-minus border border-coopmaths-action hover:border-coopmaths-action-lightest bg-coopmaths-canvas dark:bg-coopmathsdark-canvas text-coopmaths-action dark:text-coopmathsdark-action hover:text-coopmaths-action-lightest dark:hover:text-coopmaths-action-lightest
    {isBorderTransparent ? 'lg:border-transparent' : ''}"
  ></i>
</button>
<button
  type="button"
  on:click={zoomPlus}
  class="tooltip tooltip-left tooltip-neutral"
  data-tip="Augmenter la taille du texte"
  aria-label="Augmenter la taille du texte"
>
  <i
    aria-hidden="true"
    class="bx {size} rounded-full p-1 bx-plus border border-coopmaths-action hover:border-coopmaths-action-lightest bg-coopmaths-canvas dark:bg-coopmathsdark-canvas text-coopmaths-action dark:text-coopmathsdark-action hover:text-coopmaths-action-lightest dark:hover:text-coopmaths-action-lightest
    {isBorderTransparent ? 'lg:border-transparent' : ''}"
  ></i>
</button>
