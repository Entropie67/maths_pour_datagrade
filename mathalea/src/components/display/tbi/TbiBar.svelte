<script lang="ts">
  import { mathaleaGoToView } from '../../../lib/mathaleaUtils'
  import {
    currentSessionStore,
    darkMode,
  } from '../../../lib/stores/generalStore'
  import { dismissable } from '../../../lib/components/tbiPopup'
  import {
    activeTbiTab,
    balanceColumnBreaks,
    exportTbiSession,
    setTbiCardsCorrectionShown,
    stepTbiCardsZoom,
    setTbiTabLayout,
    setTbiTabNbColumns,
    setTbiTabSingleColumnAlign,
    splitTbiTabByExercise,
    tbiState,
    tbiTabCardIndices,
    type TbiSingleColumnAlign,
  } from '../../../lib/stores/tbiStore'
  import { showTbiToast } from '../../../lib/stores/tbiToastStore'
  import {
    isTbiToolShown,
    tbiActiveScope,
    tbiTools,
  } from '../../../lib/stores/tbiToolsStore'
  import {
    setTbiBarMirrored,
    tbiBarMirrored,
    tbiControlsVisible,
    tbiEditing,
    tbiFullscreen,
    tbiOpenPanel,
    tbiWriting,
    toggleTbiFullscreen,
  } from '../../../lib/tbiControls'
  import SaveSessionButton from '../../setup/mesFeuilles/SaveSessionButton.svelte'
  import TbiBackgroundPicker from './TbiBackgroundPicker.svelte'
  import TbiBoardControls from './TbiBoardControls.svelte'
  import TbiScrollControls from './TbiScrollControls.svelte'
  import TbiTabsBar from './TbiTabsBar.svelte'
  import TbiTimerChips from './TbiTimerChips.svelte'
  import TbiToolsPalette from './TbiToolsPalette.svelte'
  import type { TbiTabEntry } from './tbiTypes'
  import {
    tbiButton,
    tbiMenuLabel,
    tbiMenuRow,
    tbiPanel,
    tbiPrimaryButton,
    tbiSegment,
    tbiSegmentButton,
    tbiSeparator,
  } from './tbiUi'

  /**
   * Bandeau bas de la vue TBI, seule zone de commandes de la séance : en bas,
   * à portée de main sur un grand tableau, de hauteur fixe. Groupes : onglets,
   * classe, taille, outils, écriture, mise en page, séance, fenêtre. Pendant
   * l'écriture et la mise en page, leurs commandes remplacent ces groupes ; les
   * onglets restent toujours accessibles.
   */
  type Props = {
    tabEntries: TbiTabEntry[]
    onAddExercise: () => void
    onShuffle: () => void
    /** Nouvelles données pour les exercices affichés (traité par `Tbi.svelte`) */
    onNewData: (paramsIndices: number[]) => void
    onDuplicateTab: (tabId: string) => void
    onDeleteTab: (tabId: string) => void
    /** Ajuste la taille des exercices affichés à l'écran */
    onFit: () => void
    /** Range les exercices en disposition libre */
    onArrange: () => void
    /** Répartit les colonnes d'après la hauteur des exercices */
    onBalance: () => void
  }

  const {
    tabEntries,
    onAddExercise,
    onShuffle,
    onNewData,
    onDuplicateTab,
    onDeleteTab,
    onFit,
    onArrange,
    onBalance,
  }: Props = $props()

  // copie : l'état est muté en place, un $derived de la même référence ne se
  // recalculerait pas pour ses consommateurs
  const tab = $derived({ ...activeTbiTab($tbiState) })
  const tabLabel = $derived(
    tabEntries.find((entry) => entry.id === tab.id)?.label ?? '',
  )
  const shownIndices = $derived(tbiTabCardIndices($tbiState, tab.id))
  const hasItems = $derived(shownIndices.length > 0)
  const isFree = $derived(tab.layout === 'free')

  function setColumns(n: number) {
    setTbiTabLayout(tab.id, 'columns')
    setTbiTabNbColumns(tab.id, n)
    balanceColumnBreaks(shownIndices, n)
  }

  function splitByExercise() {
    if (shownIndices.length < 2) {
      showTbiToast("Cet onglet ne contient qu'un exercice")
      return
    }
    splitTbiTabByExercise(tab.id)
    showTbiToast('Un onglet par exercice')
  }

  const aligns: { value: TbiSingleColumnAlign; label: string }[] = [
    { value: 'left', label: 'Gauche' },
    { value: 'center', label: 'Centre' },
    { value: 'right', label: 'Droite' },
    { value: 'full', label: 'Large' },
  ]

  /** Correction de tous les exercices affichés */
  const isCorrectionShown = $derived(
    shownIndices.length > 0 &&
      shownIndices.every(
        (i) => ($tbiState.cards[i]?.correctionMode ?? 'hidden') !== 'hidden',
      ),
  )

  /** Taille commune des exercices affichés */
  const zoomPercent = $derived(
    Math.round(($tbiState.cards[shownIndices[0]]?.zoom ?? 1) * 100),
  )

  /** Outils affichés sur cet onglet, indiqués sur le bouton de la palette */
  const openToolsCount = $derived(
    $tbiTools.filter((tool) => isTbiToolShown(tool, $tbiActiveScope)).length,
  )

  /** Contenu à enregistrer : une séance vide n'a rien à garder */
  const hasContent = $derived(
    $tbiState.cards.length > 0 ||
      $tbiTools.length > 0 ||
      $tbiState.tabs.some((candidate) => candidate.board),
  )

  /**
   * Écriture, note ou document de l'ordinateur hors de toute séance : le
   * brouillon les garde le temps de cet onglet du navigateur, pas davantage.
   */
  const hasUnsavedWork = $derived(
    $currentSessionStore === '' &&
      ($tbiState.tabs.some(
        (candidate) => (candidate.board?.strokes.length ?? 0) > 0,
      ) ||
        $tbiTools.some(
          (tool) => tool.kind === 'document' && tool.content !== null,
        )),
  )

  let toolsButton: HTMLButtonElement | undefined = $state()
  let sessionButton: HTMLButtonElement | undefined = $state()

  function togglePanel(panel: 'tools' | 'session') {
    tbiOpenPanel.update((current) => (current === panel ? null : panel))
  }

  const label = 'hidden @min-[104rem]:inline'
</script>

<div
  data-tbi-chrome
  role="toolbar"
  aria-label="Commandes de la séance"
  class="@container fixed left-2 right-2 bottom-2 z-50 h-[72px] flex {$tbiBarMirrored
    ? 'flex-row-reverse'
    : 'flex-row'} items-center gap-1 px-2 rounded-2xl text-lg border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest bg-coopmaths-canvas dark:bg-coopmathsdark-canvas shadow-2xl print-hidden transition-opacity duration-200 {$tbiControlsVisible
    ? ''
    : 'opacity-0 pointer-events-none'}"
>
  <TbiTabsBar
    entries={tabEntries}
    activeId={tab.id}
    onDuplicate={onDuplicateTab}
    onDelete={onDeleteTab}
  />

  {#if $tbiEditing}
    <div class={tbiSegment} aria-label="Disposition">
      {#each [1, 2, 3, 4] as n (n)}
        <button
          type="button"
          class={tbiSegmentButton(!isFree && tab.nbColumns === n)}
          aria-pressed={!isFree && tab.nbColumns === n}
          aria-label="{n} colonne{n > 1 ? 's' : ''}"
          onclick={() => setColumns(n)}
        >
          {n}
        </button>
      {/each}
      <button
        type="button"
        class={tbiSegmentButton(isFree)}
        aria-pressed={isFree}
        onclick={() => {
          setTbiTabLayout(tab.id, 'free')
          onArrange()
        }}
      >
        Libre
      </button>
    </div>
    {#if !isFree && tab.nbColumns === 1}
      <div class={tbiSegment} aria-label="Alignement de la colonne">
        {#each aligns as align (align.value)}
          <button
            type="button"
            class={tbiSegmentButton(tab.singleColumnAlign === align.value)}
            aria-pressed={tab.singleColumnAlign === align.value}
            onclick={() => setTbiTabSingleColumnAlign(tab.id, align.value)}
          >
            {align.label}
          </button>
        {/each}
      </div>
    {/if}
    {#if isFree}
      <button type="button" class={tbiButton()} onclick={onArrange}>
        Ranger
      </button>
    {:else if tab.nbColumns > 1}
      <button
        type="button"
        class={tbiButton()}
        title="Répartir les colonnes d'après la hauteur des exercices"
        onclick={onBalance}
      >
        Équilibrer
      </button>
    {/if}
    <button type="button" class={tbiButton()} onclick={splitByExercise}>
      Un onglet par exercice
    </button>
    <span class={tbiSeparator}></span>
    <button
      type="button"
      class={tbiPrimaryButton}
      onclick={() => tbiEditing.set(false)}
    >
      Terminer
    </button>
  {:else if $tbiWriting}
    <TbiTimerChips />
    {#if tab.board}
      <TbiBoardControls tabId={tab.id} board={tab.board} labelClass={label} />
    {/if}
    <TbiScrollControls />
    <span class={tbiSeparator}></span>
    <button
      type="button"
      class={tbiPrimaryButton}
      onclick={() => tbiWriting.set(false)}
    >
      Terminer
    </button>
  {:else}
    <TbiTimerChips />
    {#if hasItems}
      <button
        type="button"
        class={tbiButton()}
        title="Nouvelles données"
        aria-label="Nouvelles données"
        onclick={() => onNewData(shownIndices)}
      >
        <i class="bx bx-refresh text-2xl"></i>
        <span class={label}>Nouvelles données</span>
      </button>
      <button
        type="button"
        class={tbiButton(isCorrectionShown)}
        title="Afficher ou masquer la correction"
        aria-label="Correction"
        aria-pressed={isCorrectionShown}
        onclick={() =>
          setTbiCardsCorrectionShown(shownIndices, !isCorrectionShown)}
      >
        <i class="bx {isCorrectionShown ? 'bx-hide' : 'bx-show'} text-2xl"></i>
        <span class={label}>Correction</span>
      </button>
      <span class={tbiSeparator}></span>
      <button
        type="button"
        class={tbiButton(false, 'text-xl')}
        title="Réduire le texte"
        aria-label="Réduire le texte"
        onclick={() => stepTbiCardsZoom(shownIndices, -1)}
      >
        A−
      </button>
      <span
        class="w-20 shrink-0 text-center font-bold tabular-nums text-coopmaths-corpus dark:text-coopmathsdark-corpus"
        >{zoomPercent}&nbsp;%</span
      >
      <button
        type="button"
        class={tbiButton(false, 'text-xl')}
        title="Agrandir le texte"
        aria-label="Agrandir le texte"
        onclick={() => stepTbiCardsZoom(shownIndices, 1)}
      >
        A+
      </button>
      <button
        type="button"
        class={tbiButton()}
        title="Ajuster la taille à l'écran"
        aria-label="Ajuster à l'écran"
        onclick={onFit}
      >
        <i class="bx bx-expand text-2xl"></i>
        <span class={label}>Ajuster</span>
      </button>
      <span class={tbiSeparator}></span>
    {/if}
    <div class="relative">
      <button
        bind:this={toolsButton}
        type="button"
        class={tbiButton($tbiOpenPanel === 'tools')}
        title="Outils"
        aria-label="Outils"
        aria-expanded={$tbiOpenPanel === 'tools'}
        onclick={() => togglePanel('tools')}
      >
        <i class="bx bx-grid-alt text-2xl"></i>
        <span class={label}>Outils</span>
        {#if openToolsCount > 0}
          <span class="font-bold tabular-nums">· {openToolsCount}</span>
        {/if}
      </button>
      {#if $tbiOpenPanel === 'tools'}
        <TbiToolsPalette
          title={`Ouvrir dans « ${tabLabel} »`}
          trigger={toolsButton}
          class={$tbiBarMirrored ? 'left-0' : 'right-0'}
          onClose={() => tbiOpenPanel.set(null)}
        />
      {/if}
    </div>
    <button
      type="button"
      class={tbiButton()}
      title="Écrire sur l'écran, y compris par-dessus les exercices (E)"
      aria-label="Écrire"
      onclick={() => tbiWriting.set(true)}
    >
      <i class="bx bx-pencil text-2xl"></i>
      <span class={label}>Écrire</span>
    </button>
    {#if hasItems}
      <button
        type="button"
        class={tbiButton()}
        title="Mise en page"
        aria-label="Mise en page"
        onclick={() => tbiEditing.set(true)}
      >
        <i class="bx bx-columns text-2xl"></i>
        <span class={label}>Mise en page</span>
      </button>
    {/if}
    <button
      type="button"
      class={tbiPrimaryButton}
      title="Ajouter un exercice"
      aria-label="Ajouter un exercice"
      onclick={onAddExercise}
    >
      <i class="bx bx-plus text-2xl"></i>
      <span class={label}>Exercice</span>
    </button>
    <div class="relative">
      <button
        bind:this={sessionButton}
        type="button"
        class="{tbiButton($tbiOpenPanel === 'session', '')} relative"
        title="Séance"
        aria-label="Séance"
        aria-expanded={$tbiOpenPanel === 'session'}
        onclick={() => togglePanel('session')}
      >
        <i class="bx bx-dots-horizontal-rounded text-2xl"></i>
        {#if hasUnsavedWork}
          <span
            class="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-coopmaths-struct dark:bg-coopmathsdark-struct"
            title="Non enregistré dans une séance"
          ></span>
        {/if}
      </button>
      {#if $tbiOpenPanel === 'session'}
        <div
          use:dismissable={{
            onDismiss: () => tbiOpenPanel.set(null),
            ignore: () => [sessionButton],
          }}
          data-tbi-chrome
          data-tbi-panel
          role="dialog"
          aria-label="Séance"
          class="{tbiPanel} absolute bottom-full {$tbiBarMirrored
            ? 'left-0'
            : 'right-0'} mb-2 w-[32rem] max-w-[calc(100vw-1.5rem)] max-h-[calc(100vh-6rem)] overflow-y-auto p-2"
        >
          {#if hasUnsavedWork}
            <p
              class="px-3 py-2 text-base text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light"
            >
              Écriture, notes et documents ne sont pas encore enregistrés dans
              une séance.
            </p>
          {/if}
          <SaveSessionButton
            getState={exportTbiSession}
            buttonClass={tbiMenuRow}
            showLabels
            {hasContent}
          />
          {#if shownIndices.length > 1 && !isFree}
            <button
              type="button"
              class={tbiMenuRow}
              onclick={() => {
                tbiOpenPanel.set(null)
                onShuffle()
              }}
            >
              Mélanger l'ordre
              <i class="bx bx-shuffle text-2xl"></i>
            </button>
          {/if}
          <div
            class="h-px my-1 bg-coopmaths-canvas-darkest dark:bg-coopmathsdark-canvas-darkest"
          ></div>
          <div class={tbiMenuLabel}>Affichage</div>
          <div class="px-3 pb-2">
            <TbiBackgroundPicker tabId={tab.id} board={tab.board} />
          </div>
          <div class="{tbiMenuRow} hover:!bg-transparent">
            Commandes
            <span class={tbiSegment}>
              <button
                type="button"
                class={tbiSegmentButton($tbiBarMirrored)}
                aria-pressed={$tbiBarMirrored}
                title="Onglets à droite, commandes à gauche"
                onclick={() => setTbiBarMirrored(true)}
              >
                À gauche
              </button>
              <button
                type="button"
                class={tbiSegmentButton(!$tbiBarMirrored)}
                aria-pressed={!$tbiBarMirrored}
                title="Onglets à gauche, commandes à droite"
                onclick={() => setTbiBarMirrored(false)}
              >
                À droite
              </button>
            </span>
          </div>
          <div class="{tbiMenuRow} hover:!bg-transparent">
            Thème
            <span class={tbiSegment}>
              <button
                type="button"
                class={tbiSegmentButton(!$darkMode.isActive)}
                aria-pressed={!$darkMode.isActive}
                onclick={() => ($darkMode.isActive = false)}
              >
                Clair
              </button>
              <button
                type="button"
                class={tbiSegmentButton($darkMode.isActive)}
                aria-pressed={$darkMode.isActive}
                onclick={() => ($darkMode.isActive = true)}
              >
                Sombre
              </button>
            </span>
          </div>
          <div
            class="px-3 pt-2 pb-1 text-sm text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light"
          >
            Raccourcis : Page préc. et Page suiv. pour les onglets, C pour la
            correction, N pour de nouvelles données, E pour écrire, F pour le
            plein écran.
          </div>
        </div>
      {/if}
    </div>
    <TbiScrollControls />
    <span class={tbiSeparator}></span>
    <button
      type="button"
      class={tbiButton($tbiFullscreen, '')}
      title={$tbiFullscreen ? 'Quitter le plein écran (F)' : 'Plein écran (F)'}
      aria-label="Plein écran"
      aria-pressed={$tbiFullscreen}
      onclick={toggleTbiFullscreen}
    >
      <i
        class="bx {$tbiFullscreen
          ? 'bx-exit-fullscreen'
          : 'bx-fullscreen'} text-2xl"
      ></i>
    </button>
    <button
      type="button"
      class={tbiButton(false, '')}
      title="Quitter la vue"
      aria-label="Quitter la vue"
      onclick={() => mathaleaGoToView('')}
    >
      <i class="bx bx-x text-3xl"></i>
    </button>
  {/if}
</div>
