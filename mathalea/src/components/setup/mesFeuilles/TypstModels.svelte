<script lang="ts">
  import { onMount } from 'svelte'
  import {
    defaultTypstDocumentOptions,
    type TypstDocumentOptions,
  } from '../typst/buildTypstDocument'
  import { watchAutoSave } from '../../../lib/mesFeuilles/autoSave'
  import {
    addTypstModel,
    deleteTypstModel,
    loadPreferences,
    matchesTypstModel,
    renameTypstModel,
    setDefaultTypstModel,
    sortedTypstModels,
    typstModelOptions,
    updatePreferences,
    updateTypstModel,
    type Preferences,
    type TypstModelOptions,
  } from '../../../lib/mesFeuilles/preferences'
  import { onLibraryChange } from '../../../lib/mesFeuilles/storage'

  /**
   * Modèles de document de la vue Impression (« Mes sauvegardes ») : en-tête,
   * polices, mise en page, page de garde… enregistrés sous un nom, appliqués
   * d'un clic, et l'un d'eux choisi pour les nouvelles fiches.
   */
  interface Props {
    /** Réglages actuels du document */
    options: TypstDocumentOptions
    /** Applique les réglages d'un modèle au document */
    onApply: (options: TypstModelOptions) => void
  }

  let { options, onApply }: Props = $props()

  let preferences: Preferences = $state(loadPreferences())
  const models = $derived(sortedTypstModels(preferences))
  /** Modèle choisi dans la liste, `''` : réglages d'origine */
  let selectedId = $state(initialSelection(loadPreferences()))
  const selected = $derived(models.find((m) => m.id === selectedId))
  const isModified = $derived(
    selected !== undefined && !matchesTypstModel(options, selected),
  )
  const isDefault = $derived(
    selected !== undefined && preferences.defaultTypstModel.id === selected.id,
  )
  /** Saisie d'un nom : nouveau modèle ou renommage */
  let naming = $state<'' | 'new' | 'rename'>('')
  let nameValue = $state('')
  let isConfirmingDelete = $state(false)

  /** Modèle dont le document a les réglages, le modèle par défaut d'abord */
  function initialSelection(prefs: Preferences): string {
    const candidates = sortedTypstModels(prefs).sort(
      (a, b) =>
        Number(b.id === prefs.defaultTypstModel.id) -
        Number(a.id === prefs.defaultTypstModel.id),
    )
    return candidates.find((m) => matchesTypstModel(options, m))?.id ?? ''
  }

  onMount(() => {
    const stopSync = onLibraryChange(() => {
      preferences = loadPreferences()
      if (!preferences.typstModels.some((m) => m.id === selectedId)) {
        selectedId = ''
      }
    })
    // les modèles font partie du fichier de « Mes sauvegardes »
    const stopWatch = watchAutoSave()
    return () => {
      stopSync()
      stopWatch()
    }
  })

  function change(update: (prefs: Preferences) => Preferences) {
    preferences = updatePreferences(update)
  }

  function choose(id: string) {
    selectedId = id
    naming = ''
    isConfirmingDelete = false
    const model = models.find((m) => m.id === id)
    onApply(
      model === undefined
        ? typstModelOptions(defaultTypstDocumentOptions)
        : model.options,
    )
  }

  function startNaming(kind: 'new' | 'rename') {
    naming = kind
    isConfirmingDelete = false
    nameValue = kind === 'rename' && selected !== undefined ? selected.name : ''
  }

  function submitName(event: SubmitEvent) {
    event.preventDefault()
    if (naming === 'new') {
      let createdId = ''
      change((prefs) => {
        const result = addTypstModel(prefs, nameValue, $state.snapshot(options))
        createdId = result.model.id
        return result.preferences
      })
      selectedId = createdId
    } else if (naming === 'rename' && selected !== undefined) {
      const id = selected.id
      change((prefs) => renameTypstModel(prefs, id, nameValue))
    }
    naming = ''
  }

  function saveIntoSelected() {
    if (selected === undefined) return
    const id = selected.id
    change((prefs) => updateTypstModel(prefs, id, $state.snapshot(options)))
  }

  function toggleDefault() {
    if (selected === undefined) return
    const id = isDefault ? null : selected.id
    change((prefs) => setDefaultTypstModel(prefs, id))
  }

  function remove() {
    if (selected === undefined) return
    const id = selected.id
    change((prefs) => deleteTypstModel(prefs, id))
    selectedId = ''
    isConfirmingDelete = false
  }

  const smallButton =
    'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-coopmaths-action dark:text-coopmathsdark-action hover:bg-coopmaths-canvas-darkest dark:hover:bg-coopmathsdark-canvas-darkest disabled:opacity-40 disabled:cursor-not-allowed'
</script>

<div
  class="space-y-2 rounded-lg border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest p-2 text-sm"
>
  <label class="flex items-center justify-between gap-2">
    <span
      class="font-semibold"
      title="Réglages enregistrés dans « Mes sauvegardes » : en-tête, polices, mise en page, page de garde… Le titre de la fiche n’en fait pas partie."
    >
      Modèle
    </span>
    <select
      class="min-w-0 flex-1 rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
      value={selectedId}
      onchange={(event) => choose(event.currentTarget.value)}
    >
      <option value="">Réglages d’origine</option>
      {#each models as model (model.id)}
        <option value={model.id}>
          {model.name}{model.id === preferences.defaultTypstModel.id
            ? ' (nouvelles fiches)'
            : ''}
        </option>
      {/each}
    </select>
  </label>

  {#if isModified}
    <p
      class="flex flex-wrap items-center gap-x-2 text-xs text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light"
    >
      Réglages modifiés depuis le choix du modèle.
      <button type="button" class={smallButton} onclick={saveIntoSelected}>
        <i class="bx bx-save" aria-hidden="true"></i> Mettre à jour le modèle
      </button>
    </p>
  {/if}

  {#if naming !== ''}
    <form class="flex items-center gap-1" onsubmit={submitName}>
      <!-- svelte-ignore a11y_autofocus -->
      <input
        type="text"
        class="min-w-0 flex-1 rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 px-1 text-sm"
        placeholder="Nom du modèle"
        aria-label="Nom du modèle"
        maxlength="200"
        autofocus
        bind:value={nameValue}
        onkeydown={(event) => {
          if (event.key === 'Escape') naming = ''
        }}
      />
      <button
        type="submit"
        class={smallButton}
        disabled={nameValue.trim() === ''}
      >
        OK
      </button>
      <button type="button" class={smallButton} onclick={() => (naming = '')}>
        Annuler
      </button>
    </form>
  {:else if isConfirmingDelete && selected !== undefined}
    <p class="flex flex-wrap items-center gap-1 text-xs">
      Supprimer le modèle « {selected.name} » ?
      <button
        type="button"
        class="{smallButton} text-red-600 dark:text-red-400"
        onclick={remove}
      >
        Supprimer
      </button>
      <button
        type="button"
        class={smallButton}
        onclick={() => (isConfirmingDelete = false)}
      >
        Annuler
      </button>
    </p>
  {:else}
    <div class="flex flex-wrap items-center gap-1">
      <button
        type="button"
        class={smallButton}
        title="Enregistrer les réglages actuels du document comme un nouveau modèle"
        onclick={() => startNaming('new')}
      >
        <i class="bx bx-plus" aria-hidden="true"></i> Nouveau modèle
      </button>
      {#if selected !== undefined}
        <button
          type="button"
          class={smallButton}
          aria-pressed={isDefault}
          title={isDefault
            ? 'Ne plus utiliser ce modèle pour les nouvelles fiches'
            : 'Utiliser ce modèle pour les nouvelles fiches'}
          onclick={toggleDefault}
        >
          <i class="bx {isDefault ? 'bxs-star' : 'bx-star'}" aria-hidden="true"
          ></i>
          Par défaut
        </button>
        <button
          type="button"
          class={smallButton}
          title="Renommer le modèle"
          aria-label="Renommer le modèle"
          onclick={() => startNaming('rename')}
        >
          <i class="bx bx-rename" aria-hidden="true"></i>
        </button>
        <button
          type="button"
          class={smallButton}
          title="Supprimer le modèle"
          aria-label="Supprimer le modèle"
          onclick={() => {
            isConfirmingDelete = true
          }}
        >
          <i class="bx bx-trash" aria-hidden="true"></i>
        </button>
      {/if}
    </div>
  {/if}
</div>
