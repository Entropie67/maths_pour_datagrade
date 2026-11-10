<script lang="ts">
  import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
  import { StreamLanguage } from '@codemirror/language'
  import { stex } from '@codemirror/legacy-modes/mode/stex'
  import { search, searchKeymap } from '@codemirror/search'
  import { EditorState } from '@codemirror/state'
  import { oneDark } from '@codemirror/theme-one-dark'
  import { EditorView, keymap } from '@codemirror/view'
  import { createEventDispatcher } from 'svelte'

  import { onDestroy, onMount, tick } from 'svelte'
  import { tweened, type Tweened } from 'svelte/motion'
  import type Latex from '../../../lib/Latex'
  import {
    buildImagesUrlsList,
    doesLatexNeedsPics,
    getExosContentList,
    getPicsNames,
  } from '../../../lib/Latex'
  import { type LatexFileInfos } from '../../../lib/LatexTypes'
  import ButtonTextAction from './ButtonTextAction.svelte'

  export let latex: Latex
  export let latexFileInfos: LatexFileInfos
  export let id: string
  export let inlinePreview: boolean = false
  export let autoCompileOnInit: boolean = false
  export let redirectToInlinePreview: boolean = false
  export let initialLatexWithPreamble: string = ''

  const dispatch = createEventDispatcher()

  let clockAbled: boolean = false
  let editorView: EditorView | null = null

  let idkey = id || '0'

  const original = 1 * 60 // TYPE NUMBER OF SECONDS HERE
  const timer: Tweened<number> = tweened(original)
  const defaultengine = 'lualatex'
  const defaultreturn = 'pdfjs'

  onMount(async () => {
    if (!inlinePreview && !redirectToInlinePreview) {
      window.addEventListener('keydown', handleKeyDown)
      return
    }

    if (redirectToInlinePreview) {
      return
    }

    const { latexWithPreamble } = await latex.getFile(latexFileInfos)
    await tick()
    initEditor(latexWithPreamble)
    resetIframe()
    updateImagesCounter()
    if (autoCompileOnInit) {
      await tick()
      await compileToPDF()
    }
  })
  onDestroy(() => {
    if (!inlinePreview && !redirectToInlinePreview) {
      window.removeEventListener('keydown', handleKeyDown)
    }
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
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              dispatch('latexChange', {
                latexWithPreamble: update.state.doc.toString(),
              })
            }
          }),
          EditorView.theme({
            '&': { height: '100%' },
            '.cm-scroller': { overflow: 'auto' },
          }),
        ],
      }),
      parent: container,
    })
    dispatch('latexChange', { latexWithPreamble: content })
  }

  // ------ dont need to modify code below

  function addinput(f: HTMLFormElement, n: string, v: string) {
    const inp = document.createElement('input')
    inp.setAttribute('type', 'text')
    inp.setAttribute('name', n)
    inp.value = encodeURIComponent(v)
    f.appendChild(inp)
  }

  function addinputnoenc(f: HTMLFormElement, n: string, v: string) {
    const inp = document.createElement('input')
    inp.setAttribute('type', 'text')
    inp.setAttribute('name', n)
    inp.value = v
    f.appendChild(inp)
  }

  function addtextarea(f: HTMLFormElement, n: string, v: string) {
    const inp = document.createElement('textarea')
    inp.setAttribute('type', 'text')
    inp.setAttribute('name', n)
    inp.textContent = v
    f.appendChild(inp)
  }

  function submitFormToIframe(formData: FormData) {
    const form = document.getElementById(`form${idkey}`) as HTMLFormElement
    form.innerHTML = ''
    form.action = 'https://texlive.net/cgi-bin/latexcgi'
    form.method = 'POST'
    form.target = `pre0ifr${idkey}`
    form.enctype = 'multipart/form-data'

    for (const [name, value] of formData.entries()) {
      if (name === 'filecontents[]') {
        addtextarea(form, name, value.toString())
      } else if (name === 'filename[]') {
        addinputnoenc(form, name, value.toString())
      } else {
        addinput(form, name, value.toString())
      }
    }
    form.style.display = 'none'
    form.submit()
  }

  function resetIframe(): HTMLElement {
    const iframe = document.getElementById(`pre0ifr${idkey}`) as HTMLElement
    const parent = iframe.parentElement
    parent?.removeChild(iframe)
    const iframe2 = document.createElement('iframe')
    iframe2.setAttribute('title', 'output')
    iframe2.setAttribute('width', '100%')
    iframe2.setAttribute('height', '100%')
    iframe2.setAttribute('id', `pre0ifr${idkey}`)
    iframe2.setAttribute('name', `pre0ifr${idkey}`)
    parent?.appendChild(iframe2)
    return iframe2
  }

  async function compileToPDF() {
    if (!editorView) return
    const t = editorView.state.doc.toString()

    const iframe2 = resetIframe()

    const formData = new FormData()
    formData.append('filecontents[]', t)
    formData.append('filename[]', 'document.tex')
    formData.append('engine', defaultengine)
    formData.append('return', defaultreturn)

    const contents = await latex.getContents(latexFileInfos)
    const picsWanted = doesLatexNeedsPics(contents)
    const exosContentList = getExosContentList(latex.exercices)
    const picsNames = getPicsNames(exosContentList)
    const imagesUrls: string[] = picsWanted
      ? buildImagesUrlsList(exosContentList, picsNames)
      : []

    for (let im = 0; im < imagesUrls.length; im++) {
      const imaUrl = imagesUrls[im].replace(
        'https://coopmaths.fr',
        window.location.origin,
      )
      const visual = await fetch(imaUrl)
      const blob = await visual.blob()
      const stringfile = await blob.text()
      formData.append('filecontents[]', stringfile)
      formData.append('filename[]', imaUrl.split('/').slice(-1)[0])
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

    iframe2.addEventListener('load', function (this) {
      clockAbled = false
      clearInterval(timeValue)
      timer.set(original)
    })

    submitFormToIframe(formData)
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
      dialog.close()
    } else {
      const latexWithPreamble =
        initialLatexWithPreamble ||
        (await latex.getFile(latexFileInfos)).latexWithPreamble

      const contents = await latex.getContents(latexFileInfos)
      const picsWanted = doesLatexNeedsPics(contents)
      const exosContentList = getExosContentList(latex.exercices)
      const picsNames = getPicsNames(exosContentList)
      const imagesUrls: string[] = picsWanted
        ? buildImagesUrlsList(exosContentList, picsNames)
        : []

      const imageLatex = document.getElementById(
        `imagesLatex${idkey}`,
      ) as HTMLElement
      imageLatex.innerHTML = "Nombre d'images: " + imagesUrls.length
      dialog.showModal()
      await tick()

      initEditor(latexWithPreamble)
      resetIframe()
      compileToPDF()
    }
  }

  function updateImagesCounter() {
    const exosContentList = getExosContentList(latex.exercices)
    const picsNames = getPicsNames(exosContentList)
    const imagesUrls: string[] = doesLatexNeedsPics({
      content: exosContentList.map((exo) => exo.content || '').join(' '),
      contentCorr: exosContentList
        .map((exo) => exo.contentCorr || '')
        .join(' '),
    })
      ? buildImagesUrlsList(exosContentList, picsNames)
      : []

    const imageLatex = document.getElementById(
      `imagesLatex${idkey}`,
    ) as HTMLElement
    if (imageLatex) {
      imageLatex.innerHTML = "Nombre d'images: " + imagesUrls.length
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

{#if !inlinePreview}
  <div
    class={`${$$props.class || 'flex flex-col md:flex-row mx-4 pb-4 md:pb-8 md:space-x-4 space-y-3 justify-center md:justify-start items-center'}`}
  >
    <button
      id="btn_overleaf"
      type="button"
      on:click={() => {
        if (redirectToInlinePreview) {
          dispatch('openInlinePreview')
        } else {
          dialogToDisplayToggle()
        }
      }}
      class="px-2 py-1 rounded-md text-coopmaths-canvas dark:text-coopmathsdark-canvas bg-coopmaths-action hover:bg-coopmaths-action-lightest dark:bg-coopmathsdark-action dark:hover:bg-coopmathsdark-action-lightest"
    >
      Compiler et obtenir le PDF
    </button>
  </div>

  {#if !redirectToInlinePreview}
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
                aria-label="Close editor"
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
            <div
              id="editor{idkey}"
              class="flex grow flex-1 text-left overflow-auto"
            ></div>
            <div class="bg-gray-100 flex grow flex-1">
              {#if clockAbled}
                <div class="loader">
                  <span
                    ><progress value={$timer / original}
                    ></progress>{$timer.toFixed(0)}s</span
                  >
                </div>
              {/if}
              <iframe
                title="output"
                width="100%"
                height="100%"
                id="pre0ifr{idkey}"
                name="pre0ifr{idkey}"
              ></iframe>
            </div>
          </div>
          <div id="imagesLatex{idkey}"></div>
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
  {/if}
{:else}
  <div class="font-light">
    <div class="flex h-[80vh] flex-row max-md:portrait:flex-col">
      <div
        id="editor{idkey}"
        class="flex grow flex-1 text-left overflow-auto"
      ></div>
      <div class="bg-gray-100 flex grow flex-1">
        {#if clockAbled}
          <div class="loader">
            <span
              ><progress value={$timer / original}></progress>{$timer.toFixed(
                0,
              )}s</span
            >
          </div>
        {/if}
        <iframe
          title="output"
          width="100%"
          height="100%"
          id="pre0ifr{idkey}"
          name="pre0ifr{idkey}"
        ></iframe>
      </div>
    </div>
    <div id="imagesLatex{idkey}"></div>
    <ButtonTextAction
      disabled={clockAbled}
      class="px-2 py-1 rounded-md"
      text="Compiler en PDF"
      on:click={compileToPDF}
    />
    <form id="form{idkey}"></form>
  </div>
{/if}
