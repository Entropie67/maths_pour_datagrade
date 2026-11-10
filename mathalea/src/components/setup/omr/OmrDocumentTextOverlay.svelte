<script lang="ts">
  let {
    widgets,
    header,
    footerText,
    onSaveHeader,
    onSaveFooter,
  }: {
    widgets: { kind: 'header' | 'footer'; left: number; top: number }[]
    header: { title: string; subtitle: string; headerLine: string }
    footerText: string
    onSaveHeader: (value: typeof header) => void
    onSaveFooter: (value: string) => void
  } = $props()

  let ouvert = $state<'header' | 'footer' | null>(null)
  let brouillon = $state({ title: '', subtitle: '', headerLine: '' })
  let pied = $state('')
  const champs = [
    { name: 'title', label: 'Titre' },
    { name: 'subtitle', label: 'Sous-titre (niveau, classe…)' },
    { name: 'headerLine', label: 'Ligne d’en-tête' },
  ] as const

  function ouvrir(kind: 'header' | 'footer') {
    ouvert = ouvert === kind ? null : kind
    brouillon = { ...header }
    pied = footerText
  }
</script>

{#each widgets as widget (widget.kind)}
  <div
    class="absolute z-20 -translate-y-1/2"
    style="left: {widget.left}%; top: {widget.top}%;"
  >
    <button
      type="button"
      class="flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border border-[#b9d4f1] bg-white text-[#145a9d] shadow hover:bg-[#e3eefa]"
      aria-label={widget.kind === 'header'
        ? 'Modifier l’en-tête'
        : 'Modifier le pied de page'}
      aria-expanded={ouvert === widget.kind}
      data-testid="omr-overlay-{widget.kind}"
      onclick={() => ouvrir(widget.kind)}><i class="bx bx-edit"></i></button
    >
    {#if ouvert === widget.kind}
      <form
        class="absolute left-4 z-30 w-72 space-y-2 rounded border border-[#b9d4f1] bg-coopmaths-canvas p-3 text-xs text-coopmaths-corpus shadow-lg dark:bg-coopmathsdark-canvas dark:text-coopmathsdark-corpus"
        class:bottom-0={widget.kind === 'footer'}
        class:top-0={widget.kind === 'header'}
        onsubmit={(event) => {
          event.preventDefault()
          if (widget.kind === 'header') onSaveHeader({ ...brouillon })
          else onSaveFooter(pied)
          ouvert = null
        }}
      >
        {#if widget.kind === 'header'}
          {#each champs as champ (champ.name)}
            <label class="block space-y-1">
              <span>{champ.label}</span>
              <input
                class="w-full rounded border border-gray-300 bg-transparent px-2 py-1"
                bind:value={brouillon[champ.name]}
                onkeydown={(event) => {
                  if (event.key === 'Escape') ouvert = null
                }}
              />
            </label>
          {/each}
        {:else}
          <label class="block space-y-1">
            <span>Texte du pied de page</span>
            <input
              class="w-full rounded border border-gray-300 bg-transparent px-2 py-1"
              bind:value={pied}
              onkeydown={(event) => {
                if (event.key === 'Escape') ouvert = null
              }}
            />
          </label>
        {/if}
        <div class="flex justify-end gap-2">
          <button
            type="button"
            class="px-2 py-1"
            onclick={() => (ouvert = null)}>Annuler</button
          >
          <button
            type="submit"
            class="rounded bg-coopmaths-action px-2 py-1 text-white"
            >Enregistrer</button
          >
        </div>
      </form>
    {/if}
  </div>
{/each}
