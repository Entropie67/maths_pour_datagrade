<script lang="ts">
  /**
   * Parcours supprimés d'un salon, retrouvés dans les copies horodatées du
   * serveur (dernière version connue de chacun). Chargés à la demande.
   */
  import type { Parcours } from '../../../../lib/parcours/parcoursTypes'
  import { salonVersions } from '../../../../lib/parcours/salon/salonApi'
  import {
    deletedParcours,
    versionDate,
    versionDoc,
    versionSummary,
  } from '../../../../lib/parcours/salon/salonVersions'

  let {
    salon,
    current,
    onrestore,
  }: {
    salon: string
    current: Parcours[] // parcours actuels du salon
    onrestore: (p: Parcours) => void
  } = $props()

  const link =
    'inline-flex items-center gap-1 text-sm font-semibold text-coopmaths-action dark:text-coopmathsdark-action hover:text-coopmaths-action-lightest dark:hover:text-coopmathsdark-action-lightest disabled:opacity-40'
  const quiet =
    'text-sm text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light'

  let open = $state(false)
  let copies: { le: string; doc: import('yjs').Doc }[] | null = $state(null)
  let error = $state('')
  const found = $derived(copies ? deletedParcours(copies, current) : [])

  async function load() {
    error = ''
    try {
      const dates = (await salonVersions(salon)).slice(0, 200)
      copies = await Promise.all(
        dates.map(async (le) => ({ le, doc: await versionDoc(salon, le) })),
      )
    } catch (e) {
      error =
        e instanceof Error ? e.message : 'Les versions ne sont pas disponibles.'
    }
  }
</script>

<div class="flex flex-col gap-2">
  <button
    type="button"
    class="{link} self-start font-normal"
    aria-expanded={open}
    onclick={() => {
      open = !open
      if (open && !copies) void load()
    }}
    ><i class="bx bx-history" aria-hidden="true"></i> Parcours supprimés</button
  >
  {#if open}
    {#if error}
      <p
        class="text-sm text-coopmaths-warn-dark dark:text-coopmathsdark-warn-dark"
      >
        {error}
      </p>
    {:else if !copies}
      <p class={quiet}>Recherche dans les versions…</p>
    {:else}
      <ul class="flex flex-col gap-2" aria-label="Parcours supprimés du salon">
        {#each found as f (f.parcours.id)}
          <li class="flex flex-row flex-wrap items-center gap-x-4 gap-y-1">
            <span class="text-sm">{versionSummary(f.parcours)}</span>
            <span class={quiet}>dernière version : {versionDate(f.le)}</span>
            <button
              type="button"
              class={link}
              onclick={() => onrestore(f.parcours)}
              >Rétablir dans le salon</button
            >
          </li>
        {:else}
          <li class={quiet}>
            Aucun parcours supprimé dans les versions gardées.
          </li>
        {/each}
      </ul>
    {/if}
  {/if}
</div>
