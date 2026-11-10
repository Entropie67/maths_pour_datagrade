<script lang="ts">
  import { onDestroy } from 'svelte'
  export let blob: Blob | null = null

  let url: string | null = null

  // à chaque fois que le blob change, on régénère l’URL
  $: if (blob) {
    if (url) URL.revokeObjectURL(url) // nettoyer ancienne URL
    url = URL.createObjectURL(blob)
  }

  // libérer quand le composant est détruit
  onDestroy(() => {
    if (url) URL.revokeObjectURL(url)
  })
</script>

{#if url}
  <iframe src={url} class="w-full h-full border-0 rounded" title="Aperçu du PDF"
  ></iframe>
{:else}
  <p class="text-gray-500">Aucun PDF chargé.</p>
{/if}
