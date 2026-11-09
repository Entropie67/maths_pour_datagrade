<script lang="ts">
  import { onMount } from 'svelte'
  import type { LatexFileInfos } from '../../../lib/LatexTypes'
  import {
    isIExercice,
    type IExercice,
    type IExerciceStatique,
  } from '../../../lib/types'

  import Latex from '../../../lib/Latex'
  import { mathaleaGetExercicesFromParams } from '../../../lib/mathalea'
  import { exercicesParams } from '../../../lib/stores/generalStore'
  import { context } from '../../../modules/context'
  import PdfResult from './PdfResult.svelte'

  export let indiceExercice: number
  export let onClose: () => void

  let dialog: HTMLDialogElement

  /**
   *
   */
  /**
   * Toutes les variables configurables par l'interface WEB
   * qui adaptent la sortie PDF
   */
  let latexFileInfos: LatexFileInfos = {
    title: '',
    reference: '',
    subtitle: '',
    style: 'ProfMaquette',
    fontOption: 'StandardFont',
    tailleFontOption: 12,
    dysTailleFontOption: 14,
    correctionOption: 'AvecCorrection',
    qrcodeOption: 'SansQrcode',
    typeFiche: 'Fiche',
    durationCanOption: '9 min',
    titleOption: 'SansTitre',
    nbVersions: 1,
    exos: {}, // tu peux garder vide par défaut
  }

  let exercice: IExercice | IExerciceStatique | undefined

  const latex = new Latex()
  let ready = false

  onMount(async () => {
    const exoParam = $exercicesParams[indiceExercice]
    if (!exoParam) return
    const exercices = await mathaleaGetExercicesFromParams([exoParam])
    if (!exercices || exercices.length === 0) return
    exercice = exercices[0]
    if (isIExercice(exercice)) {
      exercice.seed = exoParam.alea
      exercice.interactif = false
    }
    latex.addExercices([exercice])
    ready = true
    context.isHtml = false
    dialog.showModal()
  })

  function close() {
    dialog.close()
    context.isHtml = true
    onClose()
  }
</script>

<dialog bind:this={dialog} class="rounded-xl p-6 shadow-xl w-[400px] m-auto">
  <!-- Bouton fermer -->
  <button
    type="button"
    aria-label="Fermer"
    class="absolute top-2 right-2 p-1 rounded
           text-gray-500 hover:text-gray-800
           dark:text-gray-400 dark:hover:text-gray-200"
    on:click={close}
  >
    <i class="bx bx-x text-2xl"></i>
  </button>

  <h2 class="text-lg font-semibold mb-4">Générer le PDF</h2>

  <div class="flex justify-center">
    {#if ready}
      <PdfResult
        {latex}
        {latexFileInfos}
        autoStart={true}
        pdfViewerDisplay={false}
      />
    {:else}
      <div class="py-6 text-sm text-gray-500">…</div>
    {/if}
  </div>
</dialog>
