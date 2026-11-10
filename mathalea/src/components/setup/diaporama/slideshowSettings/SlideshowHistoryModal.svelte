<script lang="ts">
  import { onMount, tick } from 'svelte'
  import { mathaleaRenderDiv } from '../../../../lib/mathalea'
  import { watchAutoSave } from '../../../../lib/mesFeuilles/autoSave'
  import { newId } from '../../../../lib/mesFeuilles/library'
  import {
    buildSlideshowSignature,
    defaultSlideshowTitle,
    loadSlideshowHistory,
    mergeSlideshowHistory,
    readSlideshowEntries,
    renameSlideshow,
    saveSlideshowHistory,
    type SlideshowHistoryEntry,
  } from '../../../../lib/mesFeuilles/slideshowHistory'
  import { exercicesParams } from '../../../../lib/stores/generalStore'
  import { globalOptions } from '../../../../lib/stores/globalOptions'
  import { isLocalStorageAvailable } from '../../../../lib/stores/storage'
  import type { IExercice, InterfaceParams } from '../../../../lib/types'
  import ButtonIconTooltip from '../../../shared/forms/ButtonIconTooltip.svelte'
  import BasicClassicModal from '../../../shared/modal/BasicClassicModal.svelte'
  import type { SlideshowHistoryOptions } from '../types'

  type SlideshowHistoryItem = SlideshowHistoryEntry

  export let exercises: IExercice[]
  export let isOpen: boolean
  export let startSlideshow: () => void
  export let applySlideshowFromHistory: (
    item: {
      options: SlideshowHistoryOptions
      exercicesParams: InterfaceParams[]
    },
    autoStart: boolean,
  ) => Promise<void>

  let historyListContainer: HTMLDivElement
  let historyFileInput: HTMLInputElement
  let storageAvailable = false
  let historyItems: SlideshowHistoryItem[] = []
  let draftTitle: string | null = null
  let activeHistoryId: string | null = null
  let expandedHistoryIds = new Set<string>()

  $: if (isOpen && historyListContainer) {
    tick().then(() => {
      mathaleaRenderDiv(historyListContainer)
    })
  }

  $: if (isOpen && historyListContainer && expandedHistoryIds.size > 0) {
    tick().then(() => {
      mathaleaRenderDiv(historyListContainer)
    })
  }

  onMount(() => {
    storageAvailable = isLocalStorageAvailable()
    if (storageAvailable) {
      historyItems = loadSlideshowHistory()
    }
    // l'historique fait partie du fichier de « Mes sauvegardes »
    return watchAutoSave()
  })

  export function saveCurrentSlideshow(titleOverride?: string) {
    if (!storageAvailable) return
    const options = buildCurrentOptions()
    const params = ($exercicesParams ?? []).map((param) => ({ ...param }))
    const signature = buildSlideshowSignature(options, params)
    const now = new Date().toISOString()
    const summary = buildSummary(options)
    const explicitTitle = titleOverride?.trim()
    const draft = draftTitle?.trim()
    let title = explicitTitle || draft || ''

    let existingIndex = historyItems.findIndex(
      (item) => item.id === activeHistoryId && item.signature === signature,
    )
    if (existingIndex < 0) {
      existingIndex = historyItems.findIndex(
        (item) => item.signature === signature,
      )
    }

    if (existingIndex >= 0) {
      const existing = historyItems[existingIndex]
      const nextTitle = title.length > 0 ? title : existing.title
      historyItems[existingIndex] = {
        ...existing,
        lastUsedAt: now,
        updatedAt: nextTitle === existing.title ? existing.updatedAt : now,
        options,
        exercicesParams: params,
        signature,
        summary,
        title: nextTitle,
      }
      activeHistoryId = existing.id
    } else {
      if (title.length === 0) title = defaultSlideshowTitle()
      const newItem: SlideshowHistoryItem = {
        id: newId(),
        title,
        createdAt: now,
        lastUsedAt: now,
        updatedAt: now,
        signature,
        options,
        exercicesParams: params,
        summary,
      }
      historyItems = [newItem, ...historyItems]
      activeHistoryId = newItem.id
    }

    draftTitle = null
    writeHistory(historyItems)
  }

  function buildCurrentOptions(): SlideshowHistoryOptions {
    return {
      nbVues: $globalOptions.nbVues ?? 1,
      flow: ($globalOptions.flow ?? 0) as 0 | 1 | 2,
      screenBetweenSlides: !!$globalOptions.screenBetweenSlides,
      sound: $globalOptions.sound ?? 0,
      shuffle: !!$globalOptions.shuffle,
      manualMode: !!$globalOptions.manualMode,
      pauseAfterEachQuestion: !!$globalOptions.pauseAfterEachQuestion,
      isImagesOnSides: !!$globalOptions.isImagesOnSides,
      select: $globalOptions.select ? [...$globalOptions.select] : undefined,
      order: $globalOptions.order ? [...$globalOptions.order] : undefined,
      durationGlobal: $globalOptions.durationGlobal ?? undefined,
      durationCorrection: $globalOptions.durationCorrection ?? undefined,
    }
  }

  function writeHistory(items: SlideshowHistoryItem[]) {
    historyItems = saveSlideshowHistory(items)
  }

  function handleClearAllHistory() {
    const shouldClear = window.confirm(
      "Effacer tout l'historique des diaporamas ? Cette action est irréversible.",
    )
    if (!shouldClear) return
    historyItems = []
    activeHistoryId = null
    expandedHistoryIds.clear()
    writeHistory(historyItems)
  }

  function buildExercisesSummary(
    selectedExercises: IExercice[],
    totalQuestions: number,
  ) {
    const titles = selectedExercises
      .map((exercise) => exercise.titre || exercise.id || exercise.uuid)
      .filter((title) => title && title.length > 0)
    const exerciseCount = selectedExercises.length
    const questionLabel = totalQuestions > 1 ? 'questions' : 'question'
    const exerciseLabel = exerciseCount > 1 ? 'exercices' : 'exercice'
    const displayedTitles = titles.slice(0, 3)
    const isTruncated = titles.length > displayedTitles.length
    const titlesText = displayedTitles.join(' · ')
    const summaryLine =
      titlesText.length > 0
        ? `${exerciseCount} ${exerciseLabel} : ${titlesText}${isTruncated ? ' …' : ''} (${totalQuestions} ${questionLabel})`
        : `${exerciseCount} ${exerciseLabel} (${totalQuestions} ${questionLabel})`
    return {
      text: summaryLine,
      tooltip: isTruncated ? titles.join(' · ') : undefined,
      truncated: isTruncated,
    }
  }

  function buildSettingsSummary(options: SlideshowHistoryOptions) {
    const parts = []
    const vuesLabel = options.nbVues > 1 ? 'vues' : 'vue'
    parts.push(`${options.nbVues} ${vuesLabel}`)
    if (options.flow === 1) parts.push('question puis correction')
    if (options.flow === 2) parts.push('question avec correction')
    if (options.flow === 0) parts.push('question seule')
    parts.push(options.shuffle ? 'ordre aléatoire' : 'ordre fixe')
    if (options.screenBetweenSlides) parts.push('écran inter-diapo')
    if (options.pauseAfterEachQuestion) parts.push('pause')
    if (options.manualMode) parts.push('mode manuel')
    if (!options.manualMode && options.durationGlobal) {
      parts.push(`durée globale ${options.durationGlobal}s`)
    }
    if (
      !options.manualMode &&
      options.flow !== 0 &&
      options.durationCorrection
    ) {
      parts.push(`correction ${options.durationCorrection}s`)
    }
    if (options.isImagesOnSides) parts.push('images sur les côtés')
    return parts.join(' · ')
  }

  function buildSummary(options: SlideshowHistoryOptions) {
    const params = $exercicesParams ?? []
    const selectedIndexes =
      options.select && options.select.length > 0
        ? new Set(options.select)
        : null
    const selectedExercises = exercises.filter((_, index) =>
      selectedIndexes ? selectedIndexes.has(index) : true,
    )
    const totalQuestions = params.reduce((total, param, index) => {
      if (selectedIndexes && !selectedIndexes.has(index)) return total
      const fallbackCount = exercises[index]?.listeQuestions?.length ?? 0
      const paramCount =
        param.nbQuestions === undefined || param.nbQuestions === 0
          ? fallbackCount
          : param.nbQuestions
      return total + paramCount
    }, 0)
    const exercisesSummary = buildExercisesSummary(
      selectedExercises,
      totalQuestions,
    )
    return {
      exercises: exercisesSummary.text,
      exercisesTooltip: exercisesSummary.tooltip,
      exercisesTruncated: exercisesSummary.truncated,
      settings: buildSettingsSummary(options),
    }
  }

  function formatDate(isoDate: string) {
    const date = new Date(isoDate)
    return date.toLocaleString('fr-FR')
  }

  async function handleHistoryLaunch(item: SlideshowHistoryItem) {
    activeHistoryId = item.id
    draftTitle = null
    await applySlideshowFromHistory(item, false)
    await tick()
    isOpen = false
    saveCurrentSlideshow()
    startSlideshow()
  }

  async function handleHistoryEdit(item: SlideshowHistoryItem) {
    draftTitle = `${item.title} Copie`
    activeHistoryId = null
    await applySlideshowFromHistory(item, false)
    isOpen = false
  }

  function handleHistoryRename(item: SlideshowHistoryItem) {
    const newTitle = window.prompt('Nouveau titre du diaporama', item.title)
    if (!newTitle) return
    const renamed = renameSlideshow(historyItems, item.id, newTitle)
    if (renamed.every((entry, i) => entry === historyItems[i])) return
    writeHistory(renamed)
  }

  function handleHistoryDelete(item: SlideshowHistoryItem) {
    const shouldDelete = window.confirm(
      `Supprimer le diaporama "${item.title}" de l'historique ?`,
    )
    if (!shouldDelete) return
    historyItems = historyItems.filter((entry) => entry.id !== item.id)
    if (activeHistoryId === item.id) activeHistoryId = null
    expandedHistoryIds.delete(item.id)
    writeHistory(historyItems)
  }

  function toggleHistoryItem(itemId: string) {
    if (expandedHistoryIds.has(itemId)) {
      expandedHistoryIds.delete(itemId)
    } else {
      expandedHistoryIds.add(itemId)
    }
    expandedHistoryIds = new Set(expandedHistoryIds)
    tick().then(() => {
      if (historyListContainer) {
        mathaleaRenderDiv(historyListContainer)
      }
    })
  }

  function handleExportHistory() {
    const payload = JSON.stringify(historyItems, null, 2)
    const blob = new Blob([payload], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'historique-diaporama-mathalea.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  function handleImportHistory(event: Event) {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result))
        if (!Array.isArray(parsed)) return
        writeHistory(
          mergeSlideshowHistory(historyItems, readSlideshowEntries(parsed))
            .items,
        )
      } catch (error) {
        // ignore invalid file
      }
      target.value = ''
    }
    reader.readAsText(file)
  }
</script>

<BasicClassicModal bind:isDisplayed={isOpen}>
  <div slot="header">Historique des diaporamas</div>
  <div slot="content">
    {#if !storageAvailable}
      <div class="text-sm opacity-80">
        Le stockage local n'est pas disponible dans ce navigateur.
      </div>
    {:else if historyItems.length === 0}
      <div class="text-sm opacity-80">Aucun diaporama enregistré.</div>
    {:else}
      <div
        class="flex flex-col gap-4 text-left max-h-[60vh] overflow-y-auto pr-4"
        bind:this={historyListContainer}
      >
        {#each historyItems as item}
          <div
            class="rounded-lg border border-coopmaths-struct-light dark:border-coopmathsdark-struct-light
              bg-coopmaths-canvas dark:bg-coopmathsdark-canvas p-3"
          >
            <div class="flex flex-col gap-2">
              <div
                class="flex flex-col md:flex-row md:items-start md:justify-between gap-3"
              >
                <div class="flex-1">
                  <div class="text-lg font-semibold">{item.title}</div>
                  <div class="text-xs opacity-70">
                    <div>Créé le {formatDate(item.createdAt)}</div>
                    <div>
                      Dernière utilisation {formatDate(item.lastUsedAt)}
                    </div>
                  </div>
                </div>
                <div class="flex flex-wrap gap-2 justify-start md:justify-end">
                  <button
                    type="button"
                    class="inline-flex items-center justify-center rounded-lg px-3 py-1 text-sm
                      text-coopmaths-canvas dark:text-coopmathsdark-canvas
                      bg-coopmaths-action dark:bg-coopmathsdark-action
                      hover:bg-coopmaths-action-lightest dark:hover:bg-coopmathsdark-action-lightest"
                    on:click={() => handleHistoryLaunch(item)}
                  >
                    Lancer
                  </button>
                  <button
                    type="button"
                    class="inline-flex items-center justify-center rounded-lg px-3 py-1 text-sm
                      border border-coopmaths-action dark:border-coopmathsdark-action
                      text-coopmaths-action dark:text-coopmathsdark-action
                      bg-coopmaths-canvas dark:bg-coopmathsdark-canvas
                      hover:bg-coopmaths-action dark:hover:bg-coopmathsdark-action
                      hover:text-coopmaths-canvas dark:hover:text-coopmathsdark-canvas"
                    on:click={() => handleHistoryEdit(item)}
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    class="inline-flex items-center justify-center rounded-lg px-3 py-1 text-sm
                      border border-coopmaths-action dark:border-coopmathsdark-action
                      text-coopmaths-action dark:text-coopmathsdark-action
                      bg-coopmaths-canvas dark:bg-coopmathsdark-canvas
                      hover:bg-coopmaths-action dark:hover:bg-coopmathsdark-action
                      hover:text-coopmaths-canvas dark:hover:text-coopmathsdark-canvas"
                    on:click={() => handleHistoryRename(item)}
                  >
                    Renommer
                  </button>
                  <button
                    type="button"
                    class="inline-flex items-center justify-center rounded-lg px-3 py-1 text-sm
                      border border-coopmaths-action dark:border-coopmathsdark-action
                      text-coopmaths-action dark:text-coopmathsdark-action
                      bg-coopmaths-canvas dark:bg-coopmathsdark-canvas
                      hover:bg-coopmaths-action dark:hover:bg-coopmathsdark-action
                      hover:text-coopmaths-canvas dark:hover:text-coopmathsdark-canvas"
                    on:click={() => handleHistoryDelete(item)}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
              <div class="text-sm opacity-80">
                {#if item.summary.exercisesTruncated}
                  <button
                    type="button"
                    class="flex items-start gap-2 text-left"
                    on:click={() => toggleHistoryItem(item.id)}
                  >
                    <span class="text-base leading-5">
                      {expandedHistoryIds.has(item.id) ? '▾' : '▸'}
                    </span>
                    {#if expandedHistoryIds.has(item.id)}
                      <span class="whitespace-pre-wrap">
                        {item.summary.exercisesTooltip}
                      </span>
                    {:else}
                      <span
                        class="[display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical] overflow-hidden"
                      >
                        {item.summary.exercises}
                      </span>
                    {/if}
                  </button>
                {:else}
                  <div class="flex items-start gap-2">
                    <span class="text-base leading-5">▾</span>
                    <span
                      class="[display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical] overflow-hidden"
                    >
                      {item.summary.exercises}
                    </span>
                  </div>
                {/if}
                <div>{item.summary.settings}</div>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
  <div slot="footer" class="flex items-center justify-center gap-4">
    <div class="flex items-center gap-2">
      <ButtonIconTooltip
        icon="bx-save text-2xl"
        tooltip="Sauvegarder l'historique"
        disabled={historyItems.length === 0}
        on:click={handleExportHistory}
      />
      <ButtonIconTooltip
        icon="bx-folder-open text-2xl"
        tooltip="Charger un historique"
        on:click={() => historyFileInput?.click()}
      />
      <ButtonIconTooltip
        icon="bx-trash text-2xl"
        tooltip="Effacer tout l'historique"
        disabled={historyItems.length === 0}
        on:click={handleClearAllHistory}
      />
      <ButtonIconTooltip
        icon="bx-x text-2xl"
        tooltip="Fermer"
        on:click={() => {
          isOpen = false
        }}
      />
      <input
        type="file"
        accept="application/json"
        bind:this={historyFileInput}
        class="hidden"
        on:change={handleImportHistory}
      />
    </div>
  </div>
</BasicClassicModal>
