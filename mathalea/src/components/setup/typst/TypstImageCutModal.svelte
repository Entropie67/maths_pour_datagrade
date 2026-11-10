<script lang="ts">
  import { onMount, untrack } from 'svelte'
  import { normalizeImageCuts } from './imageCuts'

  let {
    urls,
    initialCuts,
    title,
    onApply,
    onClose,
  }: {
    urls: string[]
    initialCuts: number[][]
    title: string
    onApply: (cuts: number[][]) => void
    onClose: () => void
  } = $props()
  let dialog: HTMLDialogElement
  let cuts = $state<number[][]>(untrack(() => normalizeImageCuts(initialCuts)))
  let loaded = $state<Record<number, boolean>>({})
  let failed = $state<Record<number, boolean>>({})
  let dragging: { image: number; cut: number } | null = null

  onMount(() => {
    dialog.showModal()
    return () => dialog.close()
  })

  function position(event: PointerEvent | MouseEvent, element: HTMLElement) {
    const rect = element.getBoundingClientRect()
    return Math.max(
      0.001,
      Math.min(0.999, (event.clientY - rect.top) / rect.height),
    )
  }
  function addCut(index: number, value: number) {
    cuts[index] = normalizeImageCuts([[...(cuts[index] ?? []), value]])[0]
  }
  function moveCut(index: number, cut: number, value: number) {
    const points = [...(cuts[index] ?? [])]
    points[cut] =
      Math.round(
        Math.max(
          (points[cut - 1] ?? 0) + 0.001,
          Math.min((points[cut + 1] ?? 1) - 0.001, value),
        ) * 10000,
      ) / 10000
    cuts[index] = points
  }
</script>

<dialog
  bind:this={dialog}
  onclose={onClose}
  aria-labelledby="image-cut-title"
  class="m-auto w-[min(900px,95vw)] max-h-[92vh] rounded-lg bg-white p-0 text-gray-900 shadow-xl backdrop:bg-black/50"
>
  <div class="flex max-h-[92vh] flex-col">
    <header class="shrink-0 border-b p-4">
      <h2 id="image-cut-title" class="text-lg font-semibold">
        Découper l'image — {title}
      </h2>
      <p class="mt-2 text-sm">
        Cliquer entre deux questions pour ajouter une coupure, puis déplacer la
        ligne pour l'ajuster. Les fragments passent à la page suivante si
        nécessaire, sans réduire le texte.
      </p>
    </header>
    <div class="min-h-0 overflow-y-auto p-4">
      {#each urls as url, index}
        <section class="mb-6">
          {#if urls.length > 1}<h3 class="mb-2 font-semibold">
              Image {index + 1}
            </h3>{/if}
          {#if failed[index]}
            <p role="alert">
              Impossible de charger cette image. Fermer puis réessayer.
            </p>
          {/if}
          <!-- Le bouton et les champs ci-dessous offrent la même action au clavier. -->
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div
            class="relative cursor-crosshair border border-gray-300 bg-white select-none touch-pan-y"
            onpointerdown={(event) => {
              if (
                !loaded[index] ||
                (event.target as HTMLElement).closest('button')
              )
                return
              addCut(index, position(event, event.currentTarget))
            }}
            onpointermove={(event) => {
              if (dragging?.image === index)
                moveCut(
                  index,
                  dragging.cut,
                  position(event, event.currentTarget),
                )
            }}
            onpointerup={() => {
              dragging = null
            }}
            onpointercancel={() => {
              dragging = null
            }}
          >
            <img
              src={url}
              alt="{title}, image {index + 1}"
              class="block h-auto w-full"
              draggable="false"
              onload={() => {
                loaded[index] = true
              }}
              onerror={() => {
                failed[index] = true
              }}
            />
            {#if loaded[index]}
              {#each cuts[index] ?? [] as cut, cutIndex}
                <button
                  type="button"
                  class="absolute left-0 z-10 h-5 w-full -translate-y-1/2 cursor-ns-resize touch-none border-0 bg-transparent p-0 focus:outline-2 focus:outline-blue-700"
                  style:top="{cut * 100}%"
                  aria-label="Déplacer la coupure {cutIndex +
                    1} de l'image {index + 1}"
                  onpointerdown={(event) => {
                    event.preventDefault()
                    dragging = { image: index, cut: cutIndex }
                    event.currentTarget.setPointerCapture(event.pointerId)
                  }}
                  onkeydown={(event) => {
                    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                      event.preventDefault()
                      moveCut(
                        index,
                        cutIndex,
                        cut + (event.key === 'ArrowUp' ? -0.001 : 0.001),
                      )
                    }
                  }}
                >
                  <span
                    class="absolute inset-x-0 top-1/2 border-t-2 border-dashed border-blue-600"
                  ></span>
                  <span
                    class="absolute right-0 top-1/2 -translate-y-1/2 rounded bg-blue-700 px-2 text-xs text-white"
                    >{cutIndex + 1} ↕</span
                  >
                </button>
              {/each}
            {/if}
          </div>
          <div class="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              class="rounded border px-3 py-1 text-sm"
              disabled={!loaded[index]}
              onclick={() => {
                const bounds = [0, ...(cuts[index] ?? []), 1]
                const start = bounds
                  .slice(0, -1)
                  .reduce(
                    (best, _, i) =>
                      bounds[i + 1] - bounds[i] >
                      bounds[best + 1] - bounds[best]
                        ? i
                        : best,
                    0,
                  )
                addCut(index, (bounds[start] + bounds[start + 1]) / 2)
              }}>Ajouter une coupure</button
            >
            {#each cuts[index] ?? [] as cut, cutIndex}
              <div
                class="flex items-center gap-1 rounded bg-blue-50 p-1 text-sm"
              >
                <label
                  >Coupure {cutIndex + 1}
                  <input
                    type="number"
                    class="w-20 rounded border bg-white px-1"
                    min="0.1"
                    max="99.9"
                    step="0.1"
                    value={Math.round(cut * 10000) / 100}
                    onchange={(event) => {
                      const value = event.currentTarget.valueAsNumber
                      if (Number.isFinite(value))
                        moveCut(index, cutIndex, value / 100)
                    }}
                  /> %
                </label>
                <button
                  type="button"
                  class="px-2"
                  aria-label="Supprimer la coupure {cutIndex +
                    1} de l'image {index + 1}"
                  onclick={() => {
                    cuts[index] = cuts[index].filter((_, i) => i !== cutIndex)
                  }}>×</button
                >
              </div>
            {/each}
          </div>
        </section>
      {/each}
      {#if urls.length === 0}<p role="alert">
          Aucune image disponible pour cette partie de l'exercice.
        </p>{/if}
    </div>
    <footer class="flex shrink-0 flex-wrap justify-end gap-3 border-t p-4">
      <button
        type="button"
        class="mr-auto rounded border px-3 py-2"
        onclick={() => {
          cuts = []
        }}>Retirer toutes les coupures</button
      >
      <button type="button" class="rounded border px-3 py-2" onclick={onClose}
        >Annuler</button
      >
      <button
        type="button"
        class="rounded bg-blue-700 px-4 py-2 text-white"
        disabled={urls.length === 0 || urls.some((_, index) => !loaded[index])}
        onclick={() =>
          onApply(
            normalizeImageCuts(
              Array.from({ length: urls.length }, (_, i) => cuts[i] ?? []),
            ),
          )}>Appliquer</button
      >
    </footer>
  </div>
</dialog>
