<script lang="ts">
  import {
    moveCardToTab,
    setTbiActiveTab,
    tbiState,
    activeTbiTab,
  } from '../../../../lib/stores/tbiStore'
  import { showTbiToast } from '../../../../lib/stores/tbiToastStore'
  import type { TbiItem, TbiTabEntry } from '../tbiTypes'
  import TbiColumnsLayout from './TbiColumnsLayout.svelte'
  import TbiFreeLayout from './TbiFreeLayout.svelte'

  /**
   * Exercices de l'onglet affiché, selon sa disposition. Les onglets eux-mêmes sont dans le bandeau (`TbiBar`).
   */
  interface Props {
    items: TbiItem[]
    tabEntries: TbiTabEntry[]
    /** Réordonnancement : déplace l'exercice de la position from à la position to */
    onMove?: (from: number, to: number, groups?: number[][]) => void
    /** Sauvegarde des positions (localStorage), pour la disposition libre */
    persistLayout?: () => void
    onDelete?: (paramsIndex: number) => void
  }

  let {
    items,
    tabEntries,
    onMove = () => {},
    persistLayout = () => {},
    onDelete,
  }: Props = $props()

  // copie : l'état est muté en place, un $derived de la même référence ne se
  // recalculerait pas
  let tab = $derived({ ...activeTbiTab($tbiState) })
  let activeItems = $derived(
    items.filter((item) => $tbiState.cards[item.paramsIndex]?.tabId === tab.id),
  )

  /** Le même nom d'onglet partout, et l'onglet à créer */
  const NEW_TAB = 'new'
  let moveTargets = $derived([
    ...tabEntries
      .filter((entry) => entry.id !== tab.id)
      .map((entry) => ({ value: entry.id, label: entry.label })),
    { value: NEW_TAB, label: 'Nouvel onglet' },
  ])

  /** L'exercice part, l'onglet affiché reste : un message propose de le suivre */
  function moveTo(paramsIndex: number, value: number | string) {
    const target = moveCardToTab(
      paramsIndex,
      value === NEW_TAB ? null : String(value),
    )
    if (target === null) return
    const label =
      tabEntries.find((entry) => entry.id === target)?.label ?? 'Nouvel onglet'
    showTbiToast(`Déplacé vers ${label}`, {
      label: 'Y aller',
      run: () => setTbiActiveTab(target),
    })
  }
</script>

<div
  id="tbi-tab-panel"
  class="relative z-10 w-full p-4"
  role="tabpanel"
  aria-labelledby="tbi-tab-{tab.id}"
>
  {#if tab.layout === 'free'}
    <TbiFreeLayout
      items={activeItems}
      {persistLayout}
      {moveTargets}
      onMoveTo={moveTo}
      {onDelete}
    />
  {:else}
    <TbiColumnsLayout
      items={activeItems}
      nbColumns={tab.nbColumns}
      singleColumnAlign={tab.singleColumnAlign}
      {onMove}
      withPadding={false}
      {moveTargets}
      onMoveTo={moveTo}
      {onDelete}
    />
  {/if}
</div>
