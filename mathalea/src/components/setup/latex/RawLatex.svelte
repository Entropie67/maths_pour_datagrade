<script lang="ts">
  import { onMount } from 'svelte'
  import Latex from '../../../lib/Latex'
  import { mathaleaGetExercicesFromParams } from '../../../lib/mathalea'
  import { exercicesParams } from '../../../lib/stores/generalStore'
  import type { LatexFileInfos } from '../../../lib/LatexTypes'

  let content = $state('')
  let loading = $state(true)

  onMount(async () => {
    const params = $exercicesParams
    // We need to fetch the exercises content
    const exercises = await mathaleaGetExercicesFromParams(params)
    const latex = new Latex()
    // Filter out html-only exercises as they don't have latex content
    latex.addExercices(exercises.filter((ex) => ex.typeExercice !== 'html'))

    const latexFileInfos: LatexFileInfos = {
      title: '',
      reference: '',
      subtitle: '',
      style: 'Coopmaths',
      fontOption: 'StandardFont',
      tailleFontOption: 12,
      dysTailleFontOption: 14,
      correctionOption: 'AvecCorrection',
      qrcodeOption: 'SansQrcode',
      typeFiche: 'Fiche',
      durationCanOption: '9 min',
      titleOption: 'SansTitre',
      nbVersions: 1,
      exos: {},
    }

    const result = await latex.getFile(latexFileInfos)
    content = result.latexWithoutPreamble
    loading = false
  })
</script>

{#if loading}
  <pre>Loading...</pre>
{:else}
  <pre>{content}</pre>
{/if}

<style>
  pre {
    white-space: pre-wrap;
    word-wrap: break-word;
    font-family: monospace;
    padding: 1rem;
    margin: 0;
  }
</style>
