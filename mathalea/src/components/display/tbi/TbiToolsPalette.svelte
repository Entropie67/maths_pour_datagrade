<script lang="ts">
  import { dismissable } from '../../../lib/components/tbiPopup'
  import {
    openTbiDocuments,
    openTbiViewers,
  } from '../../../lib/stores/tbiDocumentStore'
  import {
    openTbiTool,
    type TbiSimpleToolKind,
  } from '../../../lib/stores/tbiToolsStore'
  import { supportedFiles, TBI_DOCUMENT_ACCEPT } from '../../../lib/tbiDocument'
  import { newTbiNote } from '../../../lib/tbiTextContent'
  import { tbiLabelPlain } from '../../../lib/tbiLabel'
  import TbiMathText from './TbiMathText.svelte'
  import { tbiPanel } from './tbiUi'

  /** Palette des outils, libellés, à la place d'une rangée d'icônes */
  interface Props {
    title: string
    trigger?: HTMLElement
    onClose: () => void
    class?: string
  }

  let { title, trigger, onClose, class: className = '' }: Props = $props()

  const simpleTools: {
    kind: TbiSimpleToolKind
    label: string
    icon: string
  }[] = [
    { kind: 'clock', label: 'Minuteur et horloge', icon: 'bx-time-five' },
    { kind: 'trafficLight', label: 'Feu tricolore', icon: 'bxs-traffic' },
    { kind: 'studentPicker', label: 'Tirage au sort', icon: 'bx-user-voice' },
    { kind: 'calculette', label: 'Calculette', icon: 'bx-dialpad-alt' },
    { kind: 'college', label: 'Calculatrice collège', icon: 'bxs-calculator' },
    { kind: 'lycee', label: 'Calculatrice lycée', icon: 'bx-calculator' },
  ]

  let documentInput: HTMLInputElement

  function onDocumentsChosen() {
    const files = supportedFiles(documentInput.files)
    // même fichier choisi deux fois de suite : l'événement doit se redéclencher
    documentInput.value = ''
    openTbiDocuments(files)
    onClose()
  }

  function open(action: () => void) {
    action()
    onClose()
  }

  const itemClass =
    'flex flex-col items-center justify-center gap-1 h-24 px-1 rounded-xl text-center text-base font-semibold leading-tight transition-colors'
  const itemIdle =
    'bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark hover:bg-coopmaths-canvas-darkest dark:hover:bg-coopmathsdark-canvas-darkest'
</script>

<div
  use:dismissable={{ onDismiss: onClose, ignore: () => [trigger] }}
  data-tbi-chrome
  data-tbi-panel
  role="dialog"
  aria-label={tbiLabelPlain(title)}
  class="{tbiPanel} absolute bottom-full mb-2 w-[34rem] max-w-[calc(100vw-1.5rem)] p-3 {className}"
>
  <h2 class="mb-2 text-lg font-bold"><TbiMathText text={title} /></h2>
  <div class="grid grid-cols-3 gap-2">
    {#each simpleTools as tool (tool.kind)}
      <button
        type="button"
        class="{itemClass} {itemIdle}"
        onclick={() => open(() => openTbiTool(tool.kind))}
      >
        <i class="bx {tool.icon} text-3xl"></i>
        {tool.label}
      </button>
    {/each}
    <button
      type="button"
      class="{itemClass} {itemIdle}"
      onclick={() => open(() => openTbiViewers([newTbiNote()]))}
    >
      <i class="bx bx-note text-3xl"></i>
      Note
    </button>
    <button
      type="button"
      class="{itemClass} {itemIdle}"
      title="PDF, image, note, figure ApiGeom ou JSXGraph"
      onclick={() => documentInput.click()}
    >
      <i class="bx bx-file text-3xl"></i>
      Document
    </button>
    <button
      type="button"
      class="{itemClass} {itemIdle}"
      title="PDF, image, vidéo, figure GeoGebra, page web"
      onclick={() => open(() => openTbiViewers([null]))}
    >
      <i class="bx bx-link text-3xl"></i>
      Lien
    </button>
  </div>
  <p
    class="mt-2 text-sm text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light"
  >
    Astuce : vous pouvez aussi déposer un fichier ou coller un lien n'importe
    où.
  </p>
  <input
    bind:this={documentInput}
    type="file"
    multiple
    accept={TBI_DOCUMENT_ACCEPT}
    class="hidden"
    onchange={onDocumentsChosen}
  />
</div>
