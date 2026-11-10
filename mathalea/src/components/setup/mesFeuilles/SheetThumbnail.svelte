<script lang="ts">
  import type { SheetPreview } from '../../../lib/mesFeuilles/library'
  import { previewObjectUrl } from '../../../lib/mesFeuilles/preview'
  import { loadPreview } from '../../../lib/mesFeuilles/storage'

  /**
   * Vignette d'une feuille : première page de son aperçu, affiché comme image
   * (une `<img>` n'exécute aucun script du SVG).
   */
  interface Props {
    sheetId: string
    /** Date de modification : un nouvel enregistrement recharge l'aperçu */
    version: string
    /** Toutes les pages (aperçu agrandi) au lieu de la première */
    allPages?: boolean
  }

  let { sheetId, version, allPages = false }: Props = $props()

  let preview: SheetPreview | undefined = $state()
  let src = $state('')
  let isLoading = $state(true)

  $effect(() => {
    // dépendances : la feuille et sa version
    const id = sheetId
    void version
    let objectUrl = ''
    let cancelled = false
    isLoading = true
    loadPreview(id)
      .then((loaded) => {
        if (cancelled) return
        preview = loaded
        if (loaded !== undefined) {
          objectUrl = previewObjectUrl(loaded)
          src = objectUrl
        } else {
          src = ''
        }
      })
      .catch(() => {
        if (!cancelled) src = ''
      })
      .finally(() => {
        if (!cancelled) isLoading = false
      })
    return () => {
      cancelled = true
      if (objectUrl !== '') URL.revokeObjectURL(objectUrl)
    }
  })
</script>

{#if src !== '' && preview !== undefined}
  {#if allPages}
    <img
      {src}
      alt="Aperçu de la feuille ({preview.pageCount} page{preview.pageCount > 1
        ? 's'
        : ''})"
      class="block w-full h-auto"
    />
  {:else}
    <div
      class="w-full overflow-hidden bg-white"
      style="aspect-ratio: {preview.pageWidth} / {preview.pageHeight}"
    >
      <img
        {src}
        alt="Première page de la feuille"
        class="block w-full h-auto"
      />
    </div>
  {/if}
{:else}
  <div
    class="flex w-full items-center justify-center bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest"
    style="aspect-ratio: 210 / 297"
  >
    {#if isLoading}
      <i class="bx bx-loader-alt bx-spin text-3xl" aria-hidden="true"></i>
    {:else}
      <span class="flex flex-col items-center gap-1 text-sm">
        <i class="bx bx-file text-4xl" aria-hidden="true"></i>
        Pas d’aperçu
      </span>
    {/if}
  </div>
{/if}
