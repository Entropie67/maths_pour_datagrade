<script lang="ts">
  import {
    buildImagesUrlsList,
    getLogoCanUrls,
    doesLatexNeedsPics,
    getExosContentList,
    getPicsNames,
  } from '../../../lib/Latex'
  import { type latexFileType } from '../../../lib/LatexTypes'

  import ProfMaquette from '../../../lib/latex/ProfMaquette.sty?raw'
  import type { IExercice, IExerciceStatique } from '../../../lib/types'

  export let disabled: boolean
  export let exercices: (IExercice | IExerciceStatique)[]
  export let latexFile: latexFileType
  /** Libellé du bouton */
  export let text: string = 'Aller sur Overleaf'
  /** Icône (boxicons) affichée avant le libellé, ex. `bx-link-external` */
  export let icon: string = ''
  /** Classes du bouton lui-même (le style par défaut est conservé si omis) */
  export let buttonClass: string =
    'px-2 py-1 rounded-md text-coopmaths-canvas dark:text-coopmathsdark-canvas bg-coopmaths-action hover:bg-coopmaths-action-lightest dark:bg-coopmathsdark-action dark:hover:bg-coopmathsdark-action-lightest'

  let textForOverleafInput: HTMLInputElement
  let textForProfMaquette: string = ''
  let imagesUrls = [] as string[]

  /**
   * Construction du matériel nécessaire au téléversement vers Overleaf :
   * -- constitution des URLs pour le téléchargement des images (elles doivent pointer vers un serveur)
   * -- encodage du contenu du code LaTeX de la feuille d'exercices
   */
  async function copyDocumentToOverleaf() {
    const picsWanted = doesLatexNeedsPics(latexFile.contents)
    const exosContentList = getExosContentList(exercices)
    const picsNames = getPicsNames(exosContentList)
    imagesUrls = picsWanted
      ? [
          ...buildImagesUrlsList(exosContentList, picsNames),
          ...getLogoCanUrls(latexFile.latexWithPreamble),
        ]
      : []
    textForProfMaquette = latexFile.latexWithPreamble.includes('ProfMaquette')
      ? 'data:text/plain;base64,' +
        btoa(unescape(encodeURIComponent(ProfMaquette)))
      : ''
    textForOverleafInput.value =
      'data:text/plain;base64,' +
      btoa(unescape(encodeURIComponent(latexFile.latexWithPreamble)))
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
  method="POST"
  action="https://www.overleaf.com/docs"
  target="_blank"
>
  {#each imagesUrls as imageUrl}
    <input
      type="hidden"
      name="snip_uri[]"
      value={imageUrl}
      autocomplete="off"
    />
    <input
      type="hidden"
      name="snip_name[]"
      value={imageUrl.split('/')[imageUrl.split('/').length - 1]}
      autocomplete="off"
    />
  {/each}
  {#if textForProfMaquette.length > 0}
    <input
      type="hidden"
      name="snip_uri[]"
      value={textForProfMaquette}
      autocomplete="off"
    />
    <input
      type="hidden"
      name="snip_name[]"
      value="ProfMaquette.sty"
      autocomplete="off"
    />
  {/if}
  <input
    type="hidden"
    name="snip_uri[]"
    bind:this={textForOverleafInput}
    autocomplete="off"
  />
  <input
    type="hidden"
    name="snip_name[]"
    value="coopmath.tex"
    autocomplete="off"
  />
  <input type="hidden" name="engine" value="lualatex" autocomplete="off" />
  <button
    id="btn_overleaf"
    type="submit"
    {disabled}
    on:click={copyDocumentToOverleaf}
    class="{buttonClass} inline-flex items-center justify-center gap-2 {disabled
      ? 'cursor-not-allowed opacity-60'
      : ''}"
  >
    {#if icon !== ''}
      <i class="bx {icon} shrink-0"></i>
    {/if}
    {text}
  </button>
</form>
