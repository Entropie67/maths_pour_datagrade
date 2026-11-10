<script lang="ts">
  import { EditorView, keymap } from '@codemirror/view'
  import { EditorState } from '@codemirror/state'
  import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
  import { search, searchKeymap } from '@codemirror/search'
  import { StreamLanguage } from '@codemirror/language'
  import { stex } from '@codemirror/legacy-modes/mode/stex'
  import { oneDark } from '@codemirror/theme-one-dark'

  import { onDestroy, onMount, tick } from 'svelte'
  import { tweened, type Tweened } from 'svelte/motion'
  import type Latex from '../../../lib/Latex'
  import {
    buildImagesUrlsList,
    getLogoCanUrls,
    doesLatexNeedsPics,
    getExosContentList,
    getPicsNames,
  } from '../../../lib/Latex'
  import { type LatexFileInfos } from '../../../lib/LatexTypes'
  import ButtonTextAction from './ButtonTextAction.svelte'
  import PdFviewer from './PDFviewer.svelte'

  export let latex: Latex
  export let latexFileInfos: LatexFileInfos
  export let id: string

  let pdfBlob: Blob | null = null
  let clockAbled: boolean = false
  let downloadFilename: string | null = null
  let editorView: EditorView | null = null

  let idkey = id || '0'

  const original = 1 * 60 // TYPE NUMBER OF SECONDS HERE
  const timer: Tweened<number> = tweened(original)

  onMount(() => {
    window.addEventListener('keydown', handleKeyDown)
  })
  onDestroy(() => {
    window.removeEventListener('keydown', handleKeyDown)
    editorView?.destroy()
    editorView = null
  })
  function handleKeyDown(event: KeyboardEvent) {
    const isSaveShortcut = (event.ctrlKey || event.metaKey) && event.key === 's'
    if (isSaveShortcut) {
      event.preventDefault()
      compileToPDF()
    }
  }

  function initEditor(content: string) {
    const container = document.getElementById(`editor${idkey}`)
    if (!container) return
    editorView?.destroy()
    editorView = new EditorView({
      state: EditorState.create({
        doc: content,
        extensions: [
          history(),
          StreamLanguage.define(stex),
          oneDark,
          search({ top: true }),
          keymap.of([...defaultKeymap, ...historyKeymap, ...searchKeymap]),
          EditorView.theme({ '&': { height: '100%' }, '.cm-scroller': { overflow: 'auto' } }),
        ],
      }),
      parent: container,
    })
  }

  async function downloadAndExtractPDF(blob: Blob, filename: string) {
    pdfBlob = blob
    downloadFilename = filename
  }

  function generateFilename(prefix = 'latex', ext = 'pdf') {
    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
    const time = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
    return `${prefix}_${date}_${time}.${ext}`
  }

  async function compileToPDF() {
    if (!editorView) return
    const t = editorView.state.doc.toString()

    const formData = new FormData()
    formData.append('name', 'document.tex')
    formData.append('originalname', 'document.tex')
    formData.append('file', new Blob([t]), 'document.tex')

    const contents = await latex.getContents(latexFileInfos)
    const picsWanted = doesLatexNeedsPics(contents)
    const exosContentList = getExosContentList(latex.exercices)
    const picsNames = getPicsNames(exosContentList)
    const imagesUrls: string[] = picsWanted
      ? [
          ...buildImagesUrlsList(exosContentList, picsNames),
          ...getLogoCanUrls(t),
        ]
      : []

    for (let im = 0; im < imagesUrls.length; im++) {
      const imaUrl = imagesUrls[im].replace(
        'https://coopmaths.fr',
        window.location.origin,
      )
      const visual = await fetch(imaUrl)
      const blob = await visual.blob()
      formData.append('name', imaUrl.split('/').slice(-1)[0])
      formData.append('originalname', imaUrl.split('/').slice(-1)[0])
      formData.append('file', blob, imaUrl.split('/').slice(-1)[0])
    }

    timer.set(original)
    clockAbled = true
    const timeValue = setInterval(() => {
      if ($timer > 0) {
        $timer--
      } else {
        clearInterval(timeValue)
      }
    }, 1000)

    let resultReq = ''

    await fetch('https://latexcompiler.duckdns.org/generate', {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(60 * 1000),
    })
      .then((res: Response) => {
        if (res.status === 200) {
          resultReq = 'OK'
        } else {
          resultReq = 'KO'
        }
        return res.blob()
      })
      .then((blob) => {
        clockAbled = false
        return downloadAndExtractPDF(blob, generateFilename('document', 'pdf'))
      })
      .catch((err) => {
        clockAbled = false
        console.error('Error occured' + err)
        resultReq = 'KO'
      })
  }

  /**
   * Affiche ou ferme si déjà ouvert le code Latex dans une boite de dialogue
   */
  async function dialogToDisplayToggle() {
    const dialog = document.getElementById(
      `editorLatex${idkey}`,
    ) as HTMLDialogElement
    if (dialog.open) {
      clockAbled = false
      pdfBlob = null
      dialog.close()
    } else {
      const { latexWithPreamble } = await latex.getFile(latexFileInfos)

      const contents = await latex.getContents(latexFileInfos)
      const picsWanted = doesLatexNeedsPics(contents)
      const exosContentList = getExosContentList(latex.exercices)
      const picsNames = getPicsNames(exosContentList)
      const imagesUrls: string[] = picsWanted
        ? buildImagesUrlsList(exosContentList, picsNames)
        : []

      const imageLatex = document.getElementById('imagesLatex') as HTMLElement
      imageLatex.innerHTML = "Nombre d'images: " + imagesUrls.length
      dialog.showModal()
      await tick()

      initEditor(latexWithPreamble)
      compileToPDF()
    }
  }
</script>

<!--
  @component
  Bouton déclenchant l'exportation vers OverLeaf

  ### Paramètres

  * `latex` : code latex du document
  * `latexFileInfos` : objet contenant les éléments de mise en forme du fichier
  * `disabled` : flag permettant de désactiver le bouton

  ### Exemple
  ```tsx
  <ButtonOverleaf
    {latex}
    latexFileInfos={{ title, reference, subtitle, style, nbVersions }}
    disabled={false}
  />
  ```
 -->

<form
  class={`${$$props.class || 'flex flex-col md:flex-row mx-4 pb-4 md:pb-8 md:space-x-4 space-y-3 justify-center md:justify-start items-center'}`}
  target="_blank"
>
  <button
    id="btn_overleaf"
    type="submit"
    on:click|preventDefault={dialogToDisplayToggle}
    class="px-2 py-1 rounded-md text-coopmaths-canvas dark:text-coopmathsdark-canvas bg-coopmaths-action hover:bg-coopmaths-action-lightest dark:bg-coopmathsdark-action dark:hover:bg-coopmathsdark-action-lightest"
  >
    Compiler et obtenir le PDF
  </button>
</form>

<dialog
  class="fixed rounded-xl p-6 bg-coopmaths-canvas text-coopmaths-corpus left-[2%] top-[2%] w-[96%] h-[96%] dark:bg-coopmathsdark-canvas-dark dark:text-coopmathsdark-corpus-light shadow-lg"
  id="editorLatex{idkey}"
>
  <div class="mt-3 text-center">
    <div class="text-3xl font-medium text-coopmaths-warn-dark">
      <span class="header">
        <div class="absolute top-2 right-3">
          <button
            type="button"
            aria-label="Fermer l'éditeur"
            on:click={() => {
              dialogToDisplayToggle()
            }}
          >
            <i
              class="text-coopmaths-action hover:text-coopmaths-action-lightest dark:text-coopmathsdark-action dark:hover:text-coopmathsdark-action-lightest text-xl bx bx-x"
            ></i>
          </button>
        </div>
      </span>
    </div>
    <div class="font-light">
      <div class="flex h-[80vh] flex-row max-md:portrait:flex-col">
        <div id="editor{idkey}" class="flex flex-grow flex-1 text-left overflow-auto"></div>
        <div class="bg-gray-100 flex flex-grow flex-1">
          {#if clockAbled}
            <div class="loader">
              <span
                ><progress value={$timer / original}></progress>{$timer.toFixed(
                  0,
                )}s</span
              >
            </div>
          {/if}
          <div class="bg-gray-100 flex flex-grow flex-1 flex-col">
            {#if pdfBlob}
              {#if downloadFilename}
                <div class="m-2">
                  <a
                    href={URL.createObjectURL(pdfBlob)}
                    download={downloadFilename}
                    class="px-3 py-1 rounded bg-coopmaths-action text-white hover:bg-coopmaths-action-lightest"
                  >
                    Télécharger {downloadFilename}
                  </a>
                </div>
              {/if}
              <div class="flex-1 overflow-auto m-2">
                <PdFviewer blob={pdfBlob} />
              </div>
            {/if}
          </div>
        </div>
      </div>
      <div id="imagesLatex"></div>
      <ButtonTextAction
        disabled={clockAbled}
        class="px-2 py-1 rounded-md"
        text="Compiler en PDF"
        on:click={compileToPDF}
      />
      <form id="form{idkey}"></form>
    </div>
  </div>
</dialog>
