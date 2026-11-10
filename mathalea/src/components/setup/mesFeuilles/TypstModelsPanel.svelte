<script lang="ts">
  import {
    describeTypstModel,
    deleteTypstModel,
    duplicateTypstModel,
    patchTypstModel,
    renameTypstModel,
    setDefaultTypstModel,
    sortedTypstModels,
    type Preferences,
    type TypstModel,
    type TypstModelOptions,
  } from '../../../lib/mesFeuilles/preferences'
  import { normalize } from '../../../lib/mesFeuilles/library'
  import SheetDialog from './SheetDialog.svelte'
  import TypstModelEditor from './TypstModelEditor.svelte'
  import {
    dangerButton,
    iconButton,
    primaryButton,
    quietText,
    secondaryButton,
    textInput,
  } from './styles'

  /**
   * Modèles de document de la vue Impression, dans « Mes sauvegardes » : les
   * réglages (polices, mise en page, en-tête…) enregistrés sous un nom depuis
   * le volet « Réglages du document ». Modifier, renommer, dupliquer,
   * supprimer, et choisir celui des nouvelles fiches.
   */
  interface Props {
    preferences: Preferences
    /** Recherche de la vue (noms des modèles) */
    search: string
    /** Applique une modification aux réglages enregistrés */
    onchange: (update: (preferences: Preferences) => Preferences) => void
    formatDate: (iso: string) => string
  }

  let { preferences, search, onchange, formatDate }: Props = $props()

  const models = $derived.by(() => {
    const words = normalize(search)
      .split(' ')
      .filter((word) => word !== '')
    return sortedTypstModels(preferences).filter((model) => {
      const text = normalize(model.name)
      return words.every((word) => text.includes(word))
    })
  })
  const total = $derived(preferences.typstModels.length)

  let editing = $state<TypstModel | null>(null)
  let deleting = $state<TypstModel | null>(null)
  let renamingId = $state('')
  let renameValue = $state('')

  function startRename(model: TypstModel) {
    renamingId = model.id
    renameValue = model.name
  }

  function commitRename(model: TypstModel) {
    if (renamingId === '') return
    const value = renameValue
    renamingId = ''
    if (value.trim() === '' || value === model.name) return
    onchange((prefs) => renameTypstModel(prefs, model.id, value))
  }

  function saveEdit(
    model: TypstModel,
    name: string,
    changes: TypstModelOptions,
  ) {
    editing = null
    onchange((prefs) => {
      const patched = patchTypstModel(prefs, model.id, changes)
      return name.trim() === '' || name === model.name
        ? patched
        : renameTypstModel(patched, model.id, name)
    })
  }

  function toggleDefault(model: TypstModel) {
    const isDefault = preferences.defaultTypstModel.id === model.id
    onchange((prefs) =>
      setDefaultTypstModel(prefs, isDefault ? null : model.id),
    )
  }

  function confirmDelete() {
    const model = deleting
    deleting = null
    if (model !== null) onchange((prefs) => deleteTypstModel(prefs, model.id))
  }
</script>

<div class="flex flex-row flex-wrap items-center gap-3">
  <h2
    class="text-xl font-bold text-coopmaths-struct dark:text-coopmathsdark-struct"
  >
    <i class="bx bx-palette" aria-hidden="true"></i> Modèles de document
  </h2>
  <span class={quietText}>{total} modèle{total > 1 ? 's' : ''}</span>
</div>
<p class={quietText}>
  Réglages de la vue Impression (polices, mise en page, en-tête, page de garde…)
  à appliquer d’un clic. Pour en créer un, ouvrez la vue Impression : volet «
  Réglages du document » › « Nouveau modèle ». Le modèle par défaut sert de
  point de départ aux nouvelles fiches.
</p>

{#if total === 0}
  <div
    class="flex flex-col items-start gap-2 max-w-2xl rounded-xl px-6 py-5 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark"
  >
    <p class="font-semibold">Aucun modèle de document pour l’instant.</p>
    <p class={quietText}>
      Réglez une fiche dans la vue Impression, puis cliquez sur « Nouveau modèle
      » pour garder ses réglages.
    </p>
  </div>
{:else if models.length === 0}
  <p class={quietText}>Aucun modèle ne correspond à la recherche.</p>
{:else}
  <ul class="flex flex-col gap-2">
    {#each models as model (model.id)}
      {@const isDefault = preferences.defaultTypstModel.id === model.id}
      <li
        class="flex flex-row flex-wrap items-center gap-3 rounded-lg border px-4 py-3 border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest"
      >
        <button
          type="button"
          class={iconButton}
          aria-pressed={isDefault}
          title={isDefault
            ? 'Modèle des nouvelles fiches : cliquer pour ne plus l’utiliser'
            : 'Utiliser ce modèle pour les nouvelles fiches'}
          aria-label={isDefault
            ? `Ne plus utiliser « ${model.name} » pour les nouvelles fiches`
            : `Utiliser « ${model.name} » pour les nouvelles fiches`}
          onclick={() => toggleDefault(model)}
        >
          <i class="bx {isDefault ? 'bxs-star' : 'bx-star'} text-2xl"></i>
        </button>
        <div class="flex min-w-0 flex-1 flex-col gap-0.5">
          {#if renamingId === model.id}
            <!-- svelte-ignore a11y_autofocus -->
            <input
              type="text"
              class="{textInput} py-1"
              aria-label="Nouveau nom"
              maxlength="200"
              autofocus
              bind:value={renameValue}
              onkeydown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  commitRename(model)
                } else if (event.key === 'Escape') {
                  event.preventDefault()
                  renamingId = ''
                }
              }}
              onblur={() => commitRename(model)}
            />
          {:else}
            <span class="font-semibold truncate" title={model.name}>
              {model.name}
              {#if isDefault}
                <span
                  class="ml-1 rounded px-1.5 py-0.5 text-xs font-normal bg-coopmaths-action/15 dark:bg-coopmathsdark-action/20 text-coopmaths-action dark:text-coopmathsdark-action"
                >
                  nouvelles fiches
                </span>
              {/if}
            </span>
          {/if}
          <span class="{quietText} truncate" title={describeTypstModel(model)}>
            {describeTypstModel(model) || 'Réglages de la vue Impression'}
          </span>
          <span class={quietText}>Modifié le {formatDate(model.updatedAt)}</span
          >
        </div>
        <button
          type="button"
          class="{primaryButton} px-3 py-1 text-sm"
          title="Modifier les réglages de ce modèle"
          onclick={() => (editing = model)}
        >
          <i class="bx bx-edit" aria-hidden="true"></i> Modifier
        </button>
        <span class="flex flex-row">
          <button
            type="button"
            class={iconButton}
            title="Renommer"
            aria-label="Renommer {model.name}"
            onclick={() => startRename(model)}
          >
            <i class="bx bx-rename text-lg"></i>
          </button>
          <button
            type="button"
            class={iconButton}
            title="Dupliquer"
            aria-label="Dupliquer {model.name}"
            onclick={() =>
              onchange(
                (prefs) => duplicateTypstModel(prefs, model.id).preferences,
              )}
          >
            <i class="bx bx-duplicate text-lg"></i>
          </button>
          <button
            type="button"
            class={iconButton}
            title="Supprimer"
            aria-label="Supprimer {model.name}"
            onclick={() => (deleting = model)}
          >
            <i class="bx bx-trash text-lg"></i>
          </button>
        </span>
      </li>
    {/each}
  </ul>
{/if}

<SheetDialog
  open={editing !== null}
  title="Modifier le modèle « {editing?.name ?? ''} »"
  width="max-w-2xl"
  onclose={() => (editing = null)}
>
  {#if editing !== null}
    {@const model = editing}
    <TypstModelEditor
      {model}
      onsave={(name, changes) => saveEdit(model, name, changes)}
      oncancel={() => (editing = null)}
    />
  {/if}
</SheetDialog>

<SheetDialog
  open={deleting !== null}
  title="Supprimer le modèle ?"
  onclose={() => (deleting = null)}
>
  <div class="flex flex-col gap-4">
    <p>
      Le modèle « {deleting?.name ?? ''} » sera supprimé de ce navigateur. Les fiches
      qui l’ont utilisé ne changent pas.
      {#if deleting !== null && preferences.defaultTypstModel.id === deleting.id}
        Les nouvelles fiches repartiront des réglages d’origine de MathALÉA.
      {/if}
    </p>
    <div class="flex flex-row justify-end gap-3">
      <button
        type="button"
        class={secondaryButton}
        onclick={() => (deleting = null)}>Annuler</button
      >
      <button type="button" class={dangerButton} onclick={confirmDelete}>
        <i class="bx bx-trash" aria-hidden="true"></i> Supprimer
      </button>
    </div>
  </div>
</SheetDialog>
