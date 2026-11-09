<script lang="ts">
  import {
    parcoursOfClass,
    toPublish,
    type TeacherLibrary,
  } from '../../../lib/parcours/parcoursLibrary'

  /**
   * Ce que reçoit chaque classe, dans l'ordre vu par les élèves. Les parcours
   * se cochent dans la bibliothèque ; une classe retirée garde ses parcours
   * dans la bibliothèque.
   */
  let {
    library,
    onselect,
    onsetparcours,
    onmove,
    onadd,
    onrename,
    onremove,
  }: {
    library: TeacherLibrary
    onselect: (id: string) => void
    onsetparcours: (className: string, ids: string[]) => void
    onmove: (id: string, className: string, direction: -1 | 1) => void
    onadd: (name: string) => void
    onrename: (before: string, after: string) => void
    onremove: (name: string) => void
  } = $props()

  const quiet =
    'text-sm text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light'
  const link =
    'inline-flex items-center gap-1 text-sm font-semibold text-coopmaths-action dark:text-coopmathsdark-action hover:text-coopmaths-action-lightest dark:hover:text-coopmathsdark-action-lightest disabled:opacity-40'
  const field =
    'rounded-md border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest bg-coopmaths-canvas dark:bg-coopmathsdark-canvas px-3 py-2 text-coopmaths-corpus dark:text-coopmathsdark-corpus focus:outline-none focus:border-coopmaths-action dark:focus:border-coopmathsdark-action'
  const iconButton =
    'inline-flex items-center justify-center w-8 h-8 rounded-full text-coopmaths-action dark:text-coopmathsdark-action hover:bg-coopmaths-canvas-dark dark:hover:bg-coopmathsdark-canvas-dark disabled:opacity-30'

  let selected: string | null = $state(null)
  const current = $derived(
    library.classes.find((c) => c === selected) ?? library.classes[0],
  )
  let newClass = $state('')
  let renaming = $state('')
  let choosing = $state(false)
  let confirmRemove = $state(false)

  const byLevel = $derived.by(() => {
    const levels = [...new Set(library.entries.map((e) => e.parcours.niveau))]
    return levels.map((niveau) => ({
      niveau,
      entries: library.entries.filter((e) => e.parcours.niveau === niveau),
    }))
  })
</script>

<div class="grid grid-cols-1 md:grid-cols-[16rem_1fr] gap-6">
  <aside class="flex flex-col gap-2">
    <ul class="flex flex-col gap-1" role="tablist" aria-label="Classes">
      {#each library.classes as c (c)}
        {@const n = parcoursOfClass(library, c).length}
        <li>
          <button
            type="button"
            role="tab"
            aria-selected={c === current}
            class="w-full flex flex-row items-center justify-between rounded-lg px-3 py-2 text-left
            {c === current
              ? 'bg-coopmaths-action dark:bg-coopmathsdark-action text-coopmaths-canvas dark:text-coopmathsdark-canvas'
              : 'text-coopmaths-corpus dark:text-coopmathsdark-corpus hover:bg-coopmaths-canvas-dark dark:hover:bg-coopmathsdark-canvas-dark'}"
            onclick={() => {
              selected = c
              choosing = false
              confirmRemove = false
              renaming = ''
            }}
          >
            <span class="font-semibold">{c}</span>
            <span class="text-sm">{n} parcours</span>
          </button>
        </li>
      {/each}
    </ul>
    <form
      class="flex flex-row gap-2"
      onsubmit={(e) => {
        e.preventDefault()
        if (!newClass.trim()) return
        onadd(newClass.trim())
        selected = newClass.trim()
        newClass = ''
      }}
    >
      <input
        class="{field} min-w-0 flex-1"
        bind:value={newClass}
        aria-label="Nom de la nouvelle classe"
      />
      <button type="submit" class={link} disabled={!newClass.trim()}
        ><i class="bx bx-plus" aria-hidden="true"></i> Classe</button
      >
    </form>
  </aside>

  <section class="flex flex-col gap-3">
    {#if !current}
      <p class={quiet}>
        Ajoutez une classe : elle recevra les parcours que vous lui donnez, dans
        l’ordre choisi ici.
      </p>
    {:else}
      {@const list = parcoursOfClass(library, current)}
      <div class="flex flex-row flex-wrap items-center justify-between gap-3">
        {#if renaming}
          <form
            class="flex flex-row gap-2"
            onsubmit={(e) => {
              e.preventDefault()
              onrename(current, renaming)
              selected = renaming.trim()
              renaming = ''
            }}
          >
            <input
              class={field}
              bind:value={renaming}
              aria-label="Nouveau nom de {current}"
            />
            <button
              type="submit"
              class={link}
              disabled={!renaming.trim() ||
                library.classes.includes(renaming.trim())}>Renommer</button
            >
            <button type="button" class={link} onclick={() => (renaming = '')}
              >Annuler</button
            >
          </form>
        {:else}
          <h3
            class="text-xl font-bold text-coopmaths-struct dark:text-coopmathsdark-struct"
          >
            {current}
          </h3>
          <div class="flex flex-row gap-4">
            <button
              type="button"
              class={link}
              onclick={() => (renaming = current)}
              ><i class="bx bx-pencil" aria-hidden="true"></i> Renommer</button
            >
            <button
              type="button"
              class={link}
              onclick={() => (confirmRemove = true)}
              ><i class="bx bx-trash" aria-hidden="true"></i> Retirer</button
            >
          </div>
        {/if}
      </div>
      {#if confirmRemove}
        <div
          class="flex flex-row flex-wrap items-center gap-3 rounded-lg p-3 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark"
          role="alert"
        >
          <span class="text-coopmaths-corpus dark:text-coopmathsdark-corpus"
            >Retirer {current} ? Ses parcours restent dans la bibliothèque.</span
          >
          <button
            type="button"
            class={link}
            onclick={() => {
              onremove(current)
              confirmRemove = false
              selected = null
            }}>Retirer</button
          >
          <button
            type="button"
            class={link}
            onclick={() => (confirmRemove = false)}>Annuler</button
          >
        </div>
      {/if}
      {#if list.length}
        <ol class="flex flex-col gap-2">
          {#each list as e, i (e.parcours.id)}
            <li
              class="flex flex-row items-center gap-2 rounded-lg px-3 py-2 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark"
            >
              <span
                class="w-6 text-center font-bold text-coopmaths-struct dark:text-coopmathsdark-struct"
                >{i + 1}</span
              >
              <button
                type="button"
                class="min-w-0 flex-1 text-left"
                onclick={() => onselect(e.parcours.id)}
              >
                <span
                  class="font-semibold text-coopmaths-struct dark:text-coopmathsdark-struct"
                  >{e.parcours.titre || 'Sans titre'}</span
                >
                <span class="block {quiet}"
                  >{e.parcours.niveau} · {e.parcours.theme}{toPublish(e)
                    ? ' · pas encore publié'
                    : ''}</span
                >
              </button>
              <button
                type="button"
                class={iconButton}
                aria-label="Monter {e.parcours.titre}"
                disabled={i === 0}
                onclick={() => onmove(e.parcours.id, current, -1)}
              >
                <i class="bx bx-chevron-up text-xl" aria-hidden="true"></i>
              </button>
              <button
                type="button"
                class={iconButton}
                aria-label="Descendre {e.parcours.titre}"
                disabled={i === list.length - 1}
                onclick={() => onmove(e.parcours.id, current, 1)}
              >
                <i class="bx bx-chevron-down text-xl" aria-hidden="true"></i>
              </button>
            </li>
          {/each}
        </ol>
      {:else}
        <p class={quiet}>Aucun parcours pour le moment.</p>
      {/if}
      {#if choosing}
        <div
          class="flex flex-col gap-3 rounded-lg p-4 border border-coopmaths-action/40 dark:border-coopmathsdark-action/40"
        >
          {#each byLevel as g (g.niveau)}
            <div>
              <p
                class="font-semibold text-coopmaths-struct dark:text-coopmathsdark-struct"
              >
                {g.niveau || 'Sans niveau'}
              </p>
              <ul class="flex flex-col">
                {#each g.entries as e (e.parcours.id)}
                  <li>
                    <label
                      class="flex flex-row items-center gap-3 py-1 text-coopmaths-corpus dark:text-coopmathsdark-corpus"
                    >
                      <input
                        type="checkbox"
                        checked={e.classes.includes(current)}
                        onchange={(ev) => {
                          const ids = parcoursOfClass(library, current).map(
                            (x) => x.parcours.id,
                          )
                          onsetparcours(
                            current,
                            (ev.currentTarget as HTMLInputElement).checked
                              ? [...ids, e.parcours.id]
                              : ids.filter((id) => id !== e.parcours.id),
                          )
                        }}
                      />
                      {e.parcours.titre || 'Sans titre'}
                      <span class={quiet}>· {e.parcours.theme}</span>
                    </label>
                  </li>
                {/each}
              </ul>
            </div>
          {/each}
          <button
            type="button"
            class="{link} self-start"
            onclick={() => (choosing = false)}>Fermer</button
          >
        </div>
      {:else}
        <button
          type="button"
          class="{link} self-start"
          disabled={!library.entries.length}
          onclick={() => (choosing = true)}
        >
          <i class="bx bx-list-check text-lg" aria-hidden="true"></i> Choisir
          les parcours de {current}
        </button>
      {/if}
    {/if}
  </section>
</div>
