<script lang="ts">
  /**
   * Versions d'un parcours de salon : copies horodatées gardées par le serveur
   * (une par heure au plus). Revenir à une version la réécrit dans le salon
   * comme une modification ordinaire ; l'état d'avant est gardé ici pour
   * pouvoir annuler (la copie suivante du serveur le remplace sinon).
   */
  import type { Parcours } from '../../../../lib/parcours/parcoursTypes'
  import { salonVersions } from '../../../../lib/parcours/salon/salonApi'
  import {
    parcoursIn,
    sameParcours,
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
    current: Parcours
    onrestore: (p: Parcours) => void
  } = $props()

  const link =
    'inline-flex items-center gap-1 text-sm font-semibold text-coopmaths-action dark:text-coopmathsdark-action hover:text-coopmaths-action-lightest dark:hover:text-coopmathsdark-action-lightest disabled:opacity-40'
  const quiet =
    'text-xs text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light'

  type Row = { le: string; parcours: Parcours | null }
  let rows: Row[] | null = $state(null)
  let error = $state('')
  let restored: string | null = $state(null)
  let before: Parcours | null = $state(null) // état remplacé par le dernier retour

  // Copies du plus récent au plus ancien ; on ne garde que celles où le
  // parcours change (les heures sans modification se ressemblent)
  async function load(salonId: string, id: string) {
    rows = null
    error = ''
    try {
      const dates = await salonVersions(salonId)
      const out: Row[] = []
      for (const le of dates.slice(0, 200)) {
        const parcours = parcoursIn(await versionDoc(salonId, le), id)
        if (!parcours) continue
        if (out.length && sameParcours(out[out.length - 1].parcours, parcours))
          out[out.length - 1] = { le, parcours } // même contenu : la plus ancienne
        else out.push({ le, parcours })
      }
      rows = out
    } catch (e) {
      error =
        e instanceof Error ? e.message : 'Les versions ne sont pas disponibles.'
    }
  }

  // Recharge pour un autre parcours, pas à chaque modification de celui-ci
  const id = $derived(current.id)
  $effect(() => {
    void load(salon, id)
  })
</script>

<div class="flex-1 min-h-0 overflow-y-auto flex flex-col gap-3 px-4 py-3">
  <p class={quiet}>
    Une copie par heure de modification, gardée par le serveur.
  </p>
  {#if before && restored}
    <div
      class="flex flex-row flex-wrap items-center gap-3 text-sm"
      role="status"
    >
      <span>Version rétablie ({versionDate(restored)}).</span>
      <button
        type="button"
        class={link}
        onclick={() => {
          if (before) onrestore(before)
          before = null
          restored = null
        }}>Annuler le retour</button
      >
    </div>
  {/if}
  {#if error}
    <p
      class="text-sm text-coopmaths-warn-dark dark:text-coopmathsdark-warn-dark"
    >
      {error}
    </p>
  {:else if rows === null}
    <p class={quiet}>Chargement des versions…</p>
  {:else}
    <ul class="flex flex-col gap-2" aria-label="Versions du parcours">
      {#each rows as r (r.le)}
        {@const same = sameParcours(r.parcours, current)}
        <li
          class="flex flex-row items-center gap-3 rounded-lg p-2 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark"
        >
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold">{versionDate(r.le)}</p>
            <p class="{quiet} truncate">
              {r.parcours ? versionSummary(r.parcours) : ''}
            </p>
          </div>
          {#if same}
            <span class={quiet}>Version actuelle</span>
          {:else}
            <button
              type="button"
              class="{link} shrink-0"
              onclick={() => {
                if (!r.parcours) return
                if (
                  !confirm(
                    `Revenir à cette version (${versionDate(r.le)}) ? Tous les membres du salon verront ce changement.`,
                  )
                )
                  return
                before = $state.snapshot(current) as Parcours
                restored = r.le
                onrestore({ ...r.parcours, id: current.id })
              }}>Revenir à cette version</button
            >
          {/if}
        </li>
      {:else}
        <li class={quiet}>
          Pas encore de version : la première copie est faite à la première
          modification.
        </li>
      {/each}
    </ul>
  {/if}
</div>
