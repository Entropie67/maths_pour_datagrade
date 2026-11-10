import { get } from 'svelte/store'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  currentSessionStore,
  exercicesParams,
  tbiParamStore,
} from '../../src/lib/stores/generalStore'
import {
  openTbiDocuments,
  openTbiViewers,
  tbiDocumentViewers,
} from '../../src/lib/stores/tbiDocumentStore'
import { parseTbiLink } from '../../src/lib/tbiLink'
import {
  activeTbiTab,
  addTbiBoard,
  addTbiTab,
  applyTbiSharedState,
  ensureTbiBoard,
  setTbiTabBackground,
  setTbiTabGridSize,
  TBI_MAX_ZOOM,
  TBI_MIN_ZOOM,
  balanceColumnBreaks,
  decodeTbiParam,
  defaultTbiState,
  deleteTbiCard,
  encodeTbiParam,
  exportTbiSettings,
  getTbiSharedState,
  getTbiColumnGroups,
  loadTbiDraft,
  moveTbiCardInColumns,
  moveTbiTab,
  importTbiSettings,
  isTbiCardInteractive,
  moveCardToTab,
  reconcileTbiCards,
  removeTbiTab,
  renameTbiTab,
  activeTbiModalCard,
  reorderTbiCard,
  saveTbiDraft,
  setTbiActiveTab,
  setTbiCardCorrectionDetail,
  setTbiCardCorrectionMode,
  setTbiTabLayout,
  setTbiTabNbColumns,
  shuffleTbiCards,
  splitTbiTabByExercise,
  stepTbiActiveTab,
  tbiCardNumber,
  tbiState,
  tbiTabCardIndices,
  tbiTabLabel,
  toggleTbiCardCollapsed,
  chooseTbiCardCorrectionMode,
  enterTbiSeries,
  setTbiCardsCorrectionShown,
  toggleTbiCardCorrection,
  updateTbiBoard,
  zoomTbiCards,
  zoomAllCardsBy,
  nextTbiZoom,
  stepTbiCardsZoom,
  balanceTbiColumnsByHeight,
  areTbiCardsAtDefaultPlace,
  rescaleTbiFreeCards,
} from '../../src/lib/stores/tbiStore'
import {
  bringTbiToolToFront,
  isTbiToolShown,
  openTbiTool,
  resetTbiTools,
  shownTbiTools,
  TBI_SCOPE_ALL,
  tbiTools,
  toggleTbiToolPin,
} from '../../src/lib/stores/tbiToolsStore'

/** Rang de l'onglet de chaque exercice */
function tabRanks(): number[] {
  const { tabs, cards } = get(tbiState)
  return cards.map((card) => tabs.findIndex((tab) => tab.id === card.tabId))
}

/** Outils ouverts : type, portée (rang d'onglet ou 'all'), position */
function toolSummary() {
  const { tabs } = get(tbiState)
  return get(tbiTools).map((tool) => ({
    kind: tool.kind,
    scope:
      tool.scope === TBI_SCOPE_ALL
        ? 'all'
        : tabs.findIndex((tab) => tab.id === tool.scope),
    x: tool.x,
    y: tool.y,
  }))
}

describe('tbiStore', () => {
  beforeEach(() => {
    tbiState.set(defaultTbiState())
    exercicesParams.set([])
    resetTbiTools()
    window.sessionStorage.clear()
    // Node ≥ 23 expose un localStorage inutilisable sans --localstorage-file,
    // que vitest n'écrase pas : un stockage en mémoire pour ne pas en dépendre
    const store = new Map<string, string>()
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value)
      },
      removeItem: (key: string) => {
        store.delete(key)
      },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('isTbiCardInteractive suit le paramètre i, sauf pour un exercice interactif obligatoire', () => {
    const ordinaire = { interactifReady: true, interactifObligatoire: false }
    expect(isTbiCardInteractive(ordinaire, '1')).toBe(true)
    expect(isTbiCardInteractive(ordinaire, '0')).toBe(false)
    expect(isTbiCardInteractive(ordinaire)).toBe(false)
    expect(isTbiCardInteractive({ interactifReady: false }, '1')).toBe(false)
    const obligatoire = { interactifReady: true, interactifObligatoire: true }
    expect(isTbiCardInteractive(obligatoire, '1')).toBe(true)
    expect(isTbiCardInteractive(obligatoire, '0')).toBe(true)
  })

  it("reconcileTbiCards réinitialise une carte dont l'exercice a été remplacé", () => {
    reconcileTbiCards(['e1', 'e2', 'e3'])
    tbiState.update((state) => {
      state.cards[1].zoom = 2
      state.cards[1].x = 999
      state.cards[1].w = 900
      return state
    })
    // e2 est remplacé par e2bis à l'indice 1 : ne doit pas hériter du zoom/de la position d'e2
    reconcileTbiCards(['e1', 'e2bis', 'e3'])
    const state = get(tbiState)
    expect(state.cards[1].zoom).toBe(1)
    expect(state.cards[1].x).toBe(40 + (1 % 3) * 80)
    expect(state.cards[1].w).toBe(600)
    // les exercices inchangés conservent leur état
    expect(state.cards[0].uuid).toBe('e1')
    expect(state.cards[2].uuid).toBe('e3')
  })

  it("reorderTbiCard déplace l'exercice et son état de carte", () => {
    exercicesParams.set([{ uuid: 'a' }, { uuid: 'b' }, { uuid: 'c' }])
    reconcileTbiCards(['a', 'b', 'c'])
    tbiState.update((state) => {
      state.cards[2].zoom = 2
      return state
    })
    expect(reorderTbiCard(2, 0)).toBe(true)
    expect(get(exercicesParams).map((p) => p.uuid)).toEqual(['c', 'a', 'b'])
    expect(get(tbiState).cards[0].zoom).toBe(2)
    expect(reorderTbiCard(0, 5)).toBe(false)
  })

  it('déplace entre colonnes en conservant une colonne vide et les réglages', () => {
    exercicesParams.set([{ uuid: 'a' }, { uuid: 'b' }, { uuid: 'c' }])
    reconcileTbiCards(['a', 'b', 'c'])
    balanceColumnBreaks([0, 1, 2], 3)
    tbiState.update((state) => {
      state.cards[1].zoom = 2
      return state
    })
    expect(moveTbiCardInColumns(1, [[0], [], [1, 2]])).toBe(1)
    expect(getTbiColumnGroups([0, 1, 2], get(tbiState).cards, 3)).toEqual([
      [0],
      [],
      [1, 2],
    ])
    expect(get(tbiState).cards[1].zoom).toBe(2)
    applyTbiSharedState({ widgetVisible: true })
    expect(get(tbiState).cards[1].column).toBe(2)
    const encoded = encodeTbiParam(getTbiSharedState(get(tbiState)))
    tbiState.set(defaultTbiState())
    reconcileTbiCards(['a', 'b', 'c'])
    applyTbiSharedState(decodeTbiParam(encoded)!)
    expect(getTbiColumnGroups([0, 1, 2], get(tbiState).cards, 3)).toEqual([
      [0],
      [],
      [1, 2],
    ])
    expect(importTbiSettings(exportTbiSettings())).toBeTruthy()
    expect(getTbiColumnGroups([0, 1, 2], get(tbiState).cards, 3)).toEqual([
      [0],
      [],
      [1, 2],
    ])
    balanceColumnBreaks([0, 1, 2], 2)
    expect(get(tbiState).cards.every((card) => card.column === undefined)).toBe(
      true,
    )
  })

  it('réordonne dans un onglet aux indices non contigus sans déplacer les autres cartes entre elles', () => {
    exercicesParams.set(['a', 'b', 'c', 'd', 'e'].map((uuid) => ({ uuid })))
    reconcileTbiCards(['a', 'b', 'c', 'd', 'e'])
    expect(moveTbiCardInColumns(4, [[4, 0], [2]])).toBe(0)
    expect(get(exercicesParams).map((p) => p.uuid)).toEqual([
      'e',
      'a',
      'b',
      'c',
      'd',
    ])
    expect(getTbiColumnGroups([0, 1, 3], get(tbiState).cards, 2)).toEqual([
      [0, 1],
      [3],
    ])
    expect(moveTbiCardInColumns(0, [[1], [3, 0]])).toBe(3)
    expect(get(exercicesParams).map((p) => p.uuid)).toEqual([
      'a',
      'b',
      'c',
      'e',
      'd',
    ])
    expect(getTbiColumnGroups([0, 2, 3], get(tbiState).cards, 2)).toEqual([
      [0],
      [2, 3],
    ])
  })

  it('lit les anciens sauts et refuse une destination invalide', () => {
    exercicesParams.set([{ uuid: 'a' }, { uuid: 'b' }, { uuid: 'c' }])
    reconcileTbiCards(['a', 'b', 'c'])
    applyTbiSharedState(decodeTbiParam('c-3_b-1.2')!)
    expect(getTbiColumnGroups([0, 1, 2], get(tbiState).cards, 3)).toEqual([
      [0],
      [1],
      [2],
    ])
    expect(moveTbiCardInColumns(0, [[0, 0], [2]])).toBeNull()
    expect(moveTbiCardInColumns(0, [[1], [2]])).toBeNull()
    expect(get(exercicesParams).map((p) => p.uuid)).toEqual(['a', 'b', 'c'])
  })

  it('shuffleTbiCards applique la même permutation à exercicesParams et aux cartes', () => {
    exercicesParams.set([
      { uuid: 'a' },
      { uuid: 'b' },
      { uuid: 'c' },
      { uuid: 'd' },
      { uuid: 'e' },
    ])
    reconcileTbiCards(['a', 'b', 'c', 'd', 'e'])
    const labels = ['a', 'b', 'c', 'd', 'e']
    tbiState.update((state) => {
      state.cards.forEach((card, i) => {
        card.zoom = 1 + i / 10
      })
      return state
    })

    const order = shuffleTbiCards()
    expect(order).not.toBeNull()
    const uuids = get(exercicesParams).map((p) => p.uuid)
    const cards = get(tbiState).cards
    // c'est bien une permutation : aucun exercice perdu ni dupliqué
    expect([...uuids].sort()).toEqual(labels)
    expect(order).not.toEqual([0, 1, 2, 3, 4])
    // le zoom et l'uuid de chaque carte suivent son exercice
    order!.forEach((oldIndex, newIndex) => {
      expect(uuids[newIndex]).toBe(labels[oldIndex])
      expect(cards[newIndex].uuid).toBe(labels[oldIndex])
      expect(cards[newIndex].zoom).toBeCloseTo(1 + oldIndex / 10)
    })
  })

  it('shuffleTbiCards ne fait rien avec moins de deux exercices', () => {
    exercicesParams.set([{ uuid: 'a' }])
    reconcileTbiCards(['a'])
    expect(shuffleTbiCards()).toBeNull()
    expect(get(exercicesParams).map((p) => p.uuid)).toEqual(['a'])
  })

  it('toggleTbiCardCollapsed bascule le repli de la carte visée', () => {
    reconcileTbiCards(['e1', 'e2'])
    expect(get(tbiState).cards.map((c) => c.collapsed ?? false)).toEqual([
      false,
      false,
    ])
    toggleTbiCardCollapsed(1)
    expect(get(tbiState).cards.map((c) => c.collapsed ?? false)).toEqual([
      false,
      true,
    ])
    toggleTbiCardCollapsed(1)
    expect(get(tbiState).cards[1].collapsed).toBe(false)
    // indice hors bornes : sans effet, sans erreur
    expect(() => toggleTbiCardCollapsed(9)).not.toThrow()
  })

  it('balanceColumnBreaks répartit les sauts par nombre d’exercices et écrase les précédents', () => {
    reconcileTbiCards(['e1', 'e2', 'e3', 'e4', 'e5'])
    balanceColumnBreaks([0, 1, 2, 3, 4], 2)
    let state = get(tbiState)
    // 5 exercices sur 2 colonnes : 3 puis 2
    expect(state.cards.map((c) => c.colBreak)).toEqual([
      false,
      false,
      false,
      true,
      false,
    ])

    balanceColumnBreaks([0, 1, 2, 3, 4], 3)
    state = get(tbiState)
    expect(state.cards.map((c) => c.colBreak)).toEqual([
      false,
      false,
      true,
      true,
      false,
    ])

    // repasser à 1 colonne efface les sauts précédents
    balanceColumnBreaks([0, 1, 2, 3, 4], 1)
    state = get(tbiState)
    expect(state.cards.every((c) => !c.colBreak)).toBe(true)
  })

  it('le bouton de correction reprend le dernier mode choisi', () => {
    reconcileTbiCards(['e1'])
    // par défaut, question par question
    toggleTbiCardCorrection(0)
    expect(get(tbiState).cards[0].correctionMode).toBe('perQuestion')
    toggleTbiCardCorrection(0)
    expect(get(tbiState).cards[0].correctionMode).toBe('hidden')
    chooseTbiCardCorrectionMode(0, 'replace')
    // correction masquée : le choix est retenu, sans l'afficher
    expect(get(tbiState).cards[0].correctionMode).toBe('hidden')
    toggleTbiCardCorrection(0)
    expect(get(tbiState).cards[0].correctionMode).toBe('replace')
    chooseTbiCardCorrectionMode(0, 'perQuestion')
    expect(get(tbiState).cards[0].correctionMode).toBe('perQuestion')
  })

  describe('préférence de correction', () => {
    it('sert de point de départ aux exercices suivants, sans afficher la correction', () => {
      reconcileTbiCards(['e1'])
      chooseTbiCardCorrectionMode(0, 'replace')
      setTbiCardCorrectionDetail(0, 'minimal')
      // autre série, comme une séance suivante
      tbiState.set(defaultTbiState())
      reconcileTbiCards(['e2'])
      const [card] = get(tbiState).cards
      expect(card.correctionMode).toBe('hidden')
      expect(card.correctionDetail).toBe('minimal')
      toggleTbiCardCorrection(0)
      expect(get(tbiState).cards[0].correctionMode).toBe('replace')
    })

    it('ne retient que les choix du prof, pas ce que la vue affiche d’elle-même', () => {
      reconcileTbiCards(['e1', 'e2'])
      setTbiCardCorrectionMode(0, 'below')
      toggleTbiCardCorrection(1)
      expect(get(tbiState).cards[1].correctionMode).toBe('perQuestion')
    })

    it('ignore une préférence illisible ou inconnue', () => {
      window.localStorage.setItem('tbiCorrectionPreference', 'pas du json')
      reconcileTbiCards(['e1'])
      expect(get(tbiState).cards[0].correctionDetail).toBe('full')
      window.localStorage.setItem(
        'tbiCorrectionPreference',
        JSON.stringify({ mode: 'hidden', detail: 'autre' }),
      )
      reconcileTbiCards(['e1', 'e2'])
      expect(get(tbiState).cards[1].correctionDetail).toBe('full')
      toggleTbiCardCorrection(1)
      expect(get(tbiState).cards[1].correctionMode).toBe('perQuestion')
    })
  })

  describe('retour dans la vue', () => {
    /** Séance à deux onglets : exercices, outil, écriture */
    function liveSeries() {
      enterTbiSeries(['a', 'b', 'c'])
      const second = moveCardToTab(1, null) as string
      moveCardToTab(2, second)
      addTbiBoard(second)
      updateTbiBoard(second, (board) => ({
        ...board,
        strokes: [
          {
            tool: 'pen',
            color: 'blue',
            size: 4,
            points: [{ x: 0.1, y: 0.1 }],
          },
        ],
      }))
      openTbiTool('clock', { scope: second })
      tbiState.update((state) => {
        state.cards[1].zoom = 2
        state.cards[2].zoom = 1.5
        return state
      })
      return second
    }

    it('rien en mémoire : la vue s’ouvre d’après l’URL et les sauvegardes', () => {
      expect(enterTbiSeries(['a'])).toBe('opening')
      expect(get(tbiState).cards[0].uuid).toBe('a')
    })

    it('un exercice en commun : tout est gardé, chaque exercice retrouve sa carte', () => {
      const second = liveSeries()
      expect(enterTbiSeries(['b', 'c', 'd'])).toBe('kept')
      const { cards, tabs } = get(tbiState)
      expect(cards.map((card) => card.uuid)).toEqual(['b', 'c', 'd'])
      expect(cards.map((card) => card.zoom)).toEqual([2, 1.5, 1])
      expect(cards[0].tabId).toBe(second)
      expect(cards[1].tabId).toBe(second)
      expect(tabs.find((tab) => tab.id === second)?.board?.strokes).toHaveLength(
        1,
      )
      expect(get(tbiTools).map((tool) => tool.kind)).toEqual(['clock'])
    })

    it('garde aussi la même série et le lien vers sa séance', () => {
      liveSeries()
      currentSessionStore.set('seance1')
      expect(enterTbiSeries(['a', 'b', 'c'])).toBe('kept')
      expect(get(currentSessionStore)).toBe('seance1')
      currentSessionStore.set('')
    })

    it('retire un onglet vidé de ses exercices, sauf s’il y reste du contenu', () => {
      enterTbiSeries(['a', 'b', 'c'])
      const first = get(tbiState).tabs[0].id
      const second = moveCardToTab(1, null) as string
      const third = moveCardToTab(2, null) as string
      renameTbiTab(third, 'Calculs')
      setTbiActiveTab(second)
      enterTbiSeries(['a'])
      expect(get(tbiState).tabs.map((tab) => tab.id)).toEqual([first, third])
      expect(get(tbiState).activeTabId).toBe(third)
    })

    it('aucun exercice en commun : la nouvelle série part d’un tableau vide', () => {
      const second = liveSeries()
      tbiParamStore.set('m-tabs')
      currentSessionStore.set('seance1')
      window.sessionStorage.setItem('tbiDraft', '{}')
      expect(enterTbiSeries(['x', 'y'])).toBe('replaced')
      const { cards, tabs, activeTabId } = get(tbiState)
      expect(tabs).toHaveLength(1)
      expect(tabs[0].id).not.toBe(second)
      expect(tabs[0].board).toBeUndefined()
      expect(cards.map((card) => card.uuid)).toEqual(['x', 'y'])
      expect(cards.every((card) => card.tabId === activeTabId)).toBe(true)
      expect(cards.map((card) => card.zoom)).toEqual([1, 1])
      expect(get(tbiTools)).toEqual([])
      expect(get(tbiParamStore)).toBe('')
      expect(get(currentSessionStore)).toBe('')
      expect(window.sessionStorage.getItem('tbiDraft')).toBeNull()
    })

    it('tous les exercices retirés : le tableau est vide aussi', () => {
      liveSeries()
      expect(enterTbiSeries([])).toBe('replaced')
      expect(get(tbiState).tabs).toHaveLength(1)
      expect(get(tbiTools)).toEqual([])
    })

    it('une écriture sans exercice survit à l’arrivée des premiers exercices', () => {
      const [tab] = get(tbiState).tabs
      addTbiBoard(tab.id)
      expect(enterTbiSeries(['a'])).toBe('kept')
      expect(get(tbiState).tabs[0].board).toBeDefined()
      expect(get(tbiState).cards[0].tabId).toBe(tab.id)
    })
  })

  it("la correction d'un onglet n'ouvre aucun plein écran", () => {
    reconcileTbiCards(['e1', 'e2'])
    chooseTbiCardCorrectionMode(0, 'modal')
    setTbiCardsCorrectionShown([0, 1], true)
    expect(get(tbiState).cards.map((c) => c.correctionMode)).toEqual([
      'below',
      'below',
    ])
    setTbiCardsCorrectionShown([0, 1], false)
    expect(get(tbiState).cards.map((c) => c.correctionMode)).toEqual([
      'hidden',
      'hidden',
    ])
  })

  it('zoomTbiCards ne change que les exercices désignés', () => {
    reconcileTbiCards(['e1', 'e2'])
    zoomTbiCards([1], 0.25)
    expect(get(tbiState).cards.map((c) => c.zoom)).toEqual([1, 1.25])
  })

  it('zoomAllCardsBy fait varier et borne le zoom de tous les exercices', () => {
    reconcileTbiCards(['e1', 'e2', 'e3'])
    tbiState.update((state) => {
      state.cards[1].zoom = 2
      return state
    })
    zoomAllCardsBy(0.1)
    let state = get(tbiState)
    expect(state.cards.map((c) => c.zoom)).toEqual([1.1, 2.1, 1.1])
    zoomAllCardsBy(10)
    state = get(tbiState)
    expect(state.cards.every((c) => c.zoom === TBI_MAX_ZOOM)).toBe(true)
    zoomAllCardsBy(-10)
    state = get(tbiState)
    expect(state.cards.every((c) => c.zoom === TBI_MIN_ZOOM)).toBe(true)
  })

  it('encodeTbiParam / decodeTbiParam gèrent la correction de chaque exercice', () => {
    reconcileTbiCards(['e1', 'e2', 'e3'])
    expect(encodeTbiParam(getTbiSharedState(get(tbiState)))).toBe('')
    setTbiCardCorrectionMode(0, 'modal')
    setTbiCardCorrectionMode(2, 'replace')
    setTbiCardCorrectionDetail(2, 'minimal')
    const encoded = encodeTbiParam(getTbiSharedState(get(tbiState)))
    expect(encoded).toBe('co-m.h.r_cd-f.f.m')

    tbiState.set(defaultTbiState())
    activeTbiModalCard.set(null)
    reconcileTbiCards(['e1', 'e2', 'e3'])
    applyTbiSharedState(decodeTbiParam(encoded))
    const state = get(tbiState)
    expect(state.cards.map((c) => c.correctionMode)).toEqual([
      'modal',
      'hidden',
      'replace',
    ])
    expect(state.cards.map((c) => c.correctionDetail)).toEqual([
      'full',
      'full',
      'minimal',
    ])
    // la correction en plein écran restaurée est la correction active
    expect(get(activeTbiModalCard)).toBe(0)
  })

  it('une seule correction en plein écran à la fois', () => {
    reconcileTbiCards(['e1', 'e2'])
    setTbiCardCorrectionMode(0, 'modal')
    expect(get(activeTbiModalCard)).toBe(0)
    setTbiCardCorrectionMode(1, 'modal')
    expect(get(activeTbiModalCard)).toBe(1)
    // fermer la carte 0 (déjà inactive) ne ferme pas celle de la carte 1
    setTbiCardCorrectionMode(0, 'hidden')
    expect(get(activeTbiModalCard)).toBe(1)
    setTbiCardCorrectionMode(1, 'hidden')
    expect(get(activeTbiModalCard)).toBeNull()
    // plusieurs corrections en plein écran dans un lien : seule la première reste
    applyTbiSharedState({ corrections: ['modal', 'modal'] })
    expect(get(tbiState).cards.map((c) => c.correctionMode)).toEqual([
      'modal',
      'hidden',
    ])
  })

  it('enregistre les liens et vidéos ouverts, pas les fichiers', () => {
    exercicesParams.set([])
    reconcileTbiCards([])
    tbiDocumentViewers.set([])
    openTbiDocuments([new File(['x'], 'photo.png', { type: 'image/png' })])
    openTbiViewers([
      parseTbiLink('https://youtu.be/dQw4w9WgXcQ'),
      parseTbiLink('https://a.fr/sujet.pdf'),
      null,
    ])
    const file = JSON.parse(JSON.stringify(exportTbiSettings()))
    expect(file.exercices).toEqual([])
    expect(file.documents.map((d: { url: string }) => d.url)).toEqual([
      'https://youtu.be/dQw4w9WgXcQ',
      'https://a.fr/sujet.pdf',
    ])

    // séance rouverte dans une vue vide
    tbiDocumentViewers.set([])
    expect(importTbiSettings(file)).toBe(true)
    const viewers = get(tbiDocumentViewers)
    expect(viewers.map((v) => v.content?.type)).toEqual(['video', 'link'])
    expect(viewers[0]).toMatchObject({
      x: file.documents[0].x,
      w: file.documents[0].w,
      h: file.documents[0].h,
    })
  })

  it('garde les visualiseurs ouverts avec une séance enregistrée sans documents', () => {
    tbiDocumentViewers.set([])
    openTbiViewers([parseTbiLink('https://a.fr/sujet.pdf')])
    const file = JSON.parse(JSON.stringify(exportTbiSettings()))
    delete file.documents
    importTbiSettings(file)
    expect(get(tbiDocumentViewers)).toHaveLength(1)
  })

  it("importTbiSettings refuse un fichier qui n'est pas un fichier de réglages TBI", () => {
    reconcileTbiCards(['e1'])
    const before = JSON.stringify(get(tbiState))
    expect(importTbiSettings(null)).toBe(false)
    expect(importTbiSettings({ mode: 'free' })).toBe(false)
    expect(importTbiSettings({ type: 'autre' })).toBe(false)
    expect(JSON.stringify(get(tbiState))).toBe(before)
  })

  describe('taille et rangement', () => {
    it('A− et A+ suivent la grille des 25 %', () => {
      expect(nextTbiZoom(1, 1)).toBe(1.25)
      expect(nextTbiZoom(1.63, 1)).toBe(1.75)
      expect(nextTbiZoom(1.63, -1)).toBe(1.5)
      expect(nextTbiZoom(1.5, -1)).toBe(1.25)
      expect(nextTbiZoom(TBI_MAX_ZOOM, 1)).toBe(TBI_MAX_ZOOM)
      expect(nextTbiZoom(TBI_MIN_ZOOM, -1)).toBe(TBI_MIN_ZOOM)
    })

    it('donne la même taille aux exercices de l’onglet', () => {
      reconcileTbiCards(['e1', 'e2', 'e3'])
      zoomTbiCards([0], 0.5)
      stepTbiCardsZoom([0, 1], 1)
      expect(get(tbiState).cards.map((c) => c.zoom)).toEqual([1.75, 1.75, 1])
    })

    it('répartit les colonnes par la hauteur', () => {
      reconcileTbiCards(['e1', 'e2', 'e3', 'e4'])
      balanceTbiColumnsByHeight([0, 1, 2, 3], [600, 100, 100, 100], 2)
      expect(get(tbiState).cards.map((c) => c.colBreak)).toEqual([
        false,
        true,
        false,
        false,
      ])
    })

    it('reconnaît des cartes jamais déplacées', () => {
      reconcileTbiCards(['e1', 'e2'])
      expect(areTbiCardsAtDefaultPlace(get(tbiState), [0, 1])).toBe(true)
      tbiState.update((state) => {
        state.cards[1].x = 500
        return state
      })
      expect(areTbiCardsAtDefaultPlace(get(tbiState), [0, 1])).toBe(false)
    })

    it('reporte les cartes libres quand la largeur de l’écran change', () => {
      reconcileTbiCards(['e1'])
      tbiState.update((state) => {
        state.cards[0].x = 960
        state.cards[0].y = 200
        state.cards[0].w = 960
        return state
      })
      rescaleTbiFreeCards(1920, 960)
      expect(get(tbiState).cards[0]).toMatchObject({ x: 480, y: 100, w: 480 })
    })

    it('reporte une séance enregistrée sur un écran d’une autre largeur', () => {
      reconcileTbiCards(['e1'])
      const width = window.innerWidth
      importTbiSettings({
        type: exportTbiSettings().type,
        layout: {
          viewportWidth: width * 2,
          cards: [{ x: width, y: 400, w: 800, zoom: 1 }],
        },
      })
      expect(get(tbiState).cards[0]).toMatchObject({
        x: width / 2,
        y: 200,
        w: 400,
      })
    })
  })

  describe('fond et écriture', () => {
    it('un onglet d’exercices garde son nom et sa disposition avec un fond', () => {
      reconcileTbiCards(['e1', 'e2'])
      const { activeTabId } = get(tbiState)
      setTbiTabNbColumns(activeTabId, 2)
      setTbiTabBackground(activeTabId, 'grid')
      const [tab] = get(tbiState).tabs
      expect(tab.board?.background).toBe('grid')
      expect(tab.name).toBeNull()
      expect(tab.layout).toBe('columns')
      expect(tab.nbColumns).toBe(2)
    })

    it('écrire sur un onglet d’exercices ne change ni son nom ni sa disposition', () => {
      reconcileTbiCards(['e1'])
      const { activeTabId } = get(tbiState)
      ensureTbiBoard(activeTabId)
      const [tab] = get(tbiState).tabs
      expect(tab.board).toEqual({
        background: 'blank',
        gridSize: 1,
        strokes: [],
      })
      expect(tab.name).toBeNull()
      expect(tab.layout).toBe('columns')
    })

    it('borne la taille du quadrillage, et garde les traits', () => {
      const { activeTabId } = get(tbiState)
      setTbiTabBackground(activeTabId, 'dots')
      updateTbiBoard(activeTabId, (board) => ({
        ...board,
        strokes: [{ tool: 'pen', color: 'ink', size: 0.002, points: [0, 0] }],
      }))
      setTbiTabGridSize(activeTabId, 99)
      expect(get(tbiState).tabs[0].board?.gridSize).toBe(3)
      setTbiTabGridSize(activeTabId, 0)
      expect(get(tbiState).tabs[0].board?.gridSize).toBe(0.5)
      expect(get(tbiState).tabs[0].board?.strokes).toHaveLength(1)
    })
  })

  describe('onglets', () => {
    it('une séance a toujours un onglet, et les exercices arrivent dans l’onglet affiché', () => {
      reconcileTbiCards(['e1', 'e2'])
      expect(get(tbiState).tabs).toHaveLength(1)
      expect(tabRanks()).toEqual([0, 0])
      addTbiTab()
      reconcileTbiCards(['e1', 'e2', 'e3'])
      expect(get(tbiState).tabs).toHaveLength(2)
      expect(tabRanks()).toEqual([0, 0, 1])
    })

    it('un onglet peut rester vide', () => {
      reconcileTbiCards(['e1'])
      const empty = addTbiTab()
      expect(activeTbiTab(get(tbiState)).id).toBe(empty)
      expect(tbiTabCardIndices(get(tbiState), empty)).toEqual([])
      // déplacer le seul exercice d'un onglet ne supprime pas cet onglet
      moveCardToTab(0, empty)
      expect(get(tbiState).tabs).toHaveLength(2)
      expect(tabRanks()).toEqual([1])
    })

    it('déplace un exercice vers un nouvel onglet sans changer l’onglet affiché', () => {
      reconcileTbiCards(['e1', 'e2'])
      const active = get(tbiState).activeTabId
      const created = moveCardToTab(1, null)
      expect(created).not.toBe(active)
      expect(get(tbiState).activeTabId).toBe(active)
      expect(tabRanks()).toEqual([0, 1])
    })

    it('oublie la colonne d’un exercice qui change d’onglet', () => {
      reconcileTbiCards(['e1', 'e2'])
      tbiState.update((state) => {
        state.cards[1].column = 2
        state.cards[1].colBreak = true
        return state
      })
      moveCardToTab(1, addTbiTab())
      expect(get(tbiState).cards[1].column).toBeUndefined()
      expect(get(tbiState).cards[1].colBreak).toBe(false)
    })

    it('nomme un onglet : son nom, le titre de son premier exercice, ou par défaut', () => {
      reconcileTbiCards(['e1'])
      const titles = ['Calculer une somme']
      const [tab] = get(tbiState).tabs
      expect(tbiTabLabel(tab, get(tbiState), titles)).toBe('Calculer une somme')
      renameTbiTab(tab.id, '  Calculs  ')
      expect(tbiTabLabel(get(tbiState).tabs[0], get(tbiState), titles)).toBe(
        'Calculs',
      )
      // un nom vide rend le nom par défaut
      renameTbiTab(tab.id, ' ')
      expect(get(tbiState).tabs[0].name).toBeNull()
      addTbiTab()
      expect(tbiTabLabel(get(tbiState).tabs[1], get(tbiState), titles)).toBe(
        'Nouvel onglet',
      )
    })

    it('réordonne, parcourt et supprime les onglets', () => {
      const first = get(tbiState).tabs[0].id
      const second = addTbiTab()
      const third = addTbiTab()
      moveTbiTab(2, 0)
      expect(get(tbiState).tabs.map((t) => t.id)).toEqual([
        third,
        first,
        second,
      ])
      setTbiActiveTab(third)
      stepTbiActiveTab(-1)
      expect(get(tbiState).activeTabId).toBe(second)
      stepTbiActiveTab(1)
      expect(get(tbiState).activeTabId).toBe(third)
      // l'onglet affiché est supprimé : son voisin prend la place
      removeTbiTab(third)
      expect(get(tbiState).activeTabId).toBe(first)
      removeTbiTab(first)
      removeTbiTab(second)
      // il reste toujours un onglet
      expect(get(tbiState).tabs).toHaveLength(1)
      expect(get(tbiState).activeTabId).toBe(get(tbiState).tabs[0].id)
    })

    it('répartit les exercices d’un onglet dans un onglet chacun', () => {
      reconcileTbiCards(['e1', 'e2', 'e3'])
      splitTbiTabByExercise(get(tbiState).activeTabId)
      expect(get(tbiState).tabs).toHaveLength(3)
      expect(tabRanks()).toEqual([0, 1, 2])
    })

    it('numérote les exercices dans leur onglet', () => {
      reconcileTbiCards(['e1', 'e2', 'e3'])
      moveCardToTab(1, addTbiTab())
      const state = get(tbiState)
      expect([0, 1, 2].map((i) => tbiCardNumber(state, i))).toEqual([1, 1, 2])
    })

    it('mélange les seuls exercices de l’onglet affiché et ré-équilibre ses colonnes', () => {
      exercicesParams.set(['a', 'b', 'c', 'd', 'e'].map((uuid) => ({ uuid })))
      reconcileTbiCards(['a', 'b', 'c', 'd', 'e'])
      const other = addTbiTab()
      moveCardToTab(4, other)
      setTbiActiveTab(get(tbiState).tabs[0].id)
      setTbiTabNbColumns(get(tbiState).activeTabId, 2)
      tbiState.update((state) => {
        state.cards[0].colBreak = true
        state.cards[1].colBreak = true
        return state
      })
      const order = shuffleTbiCards()
      expect(order).not.toBeNull()
      // l'exercice de l'autre onglet ne bouge pas
      expect(order![4]).toBe(4)
      expect(get(exercicesParams)[4].uuid).toBe('e')
      // 4 exercices sur 2 colonnes : 2 puis 2
      expect(
        get(tbiState)
          .cards.slice(0, 4)
          .map((c) => c.colBreak),
      ).toEqual([false, false, true, false])
    })

    it('garde l’onglet quand on supprime son dernier exercice', () => {
      exercicesParams.set([{ uuid: 'a' }, { uuid: 'b' }])
      reconcileTbiCards(['a', 'b'])
      const other = addTbiTab()
      moveCardToTab(1, other)
      deleteTbiCard(1)
      expect(get(exercicesParams).map((p) => p.uuid)).toEqual(['a'])
      expect(get(tbiState).tabs).toHaveLength(2)
      expect(tbiTabCardIndices(get(tbiState), other)).toEqual([])
    })
  })

  describe('outils', () => {
    it("s'ouvrent sur une place libre, dans l'onglet affiché et au premier plan", () => {
      const clock = openTbiTool('clock')
      const light = openTbiTool('trafficLight')
      expect(clock.scope).toBe(get(tbiState).activeTabId)
      const apart =
        light.x + light.w <= clock.x ||
        clock.x + clock.w <= light.x ||
        light.y >= clock.y + clock.h ||
        clock.y >= light.y + light.h
      expect(apart).toBe(true)
      expect(light.z).toBeGreaterThan(clock.z)
      bringTbiToolToFront(clock.id)
      expect(get(tbiTools)[0].z).toBeGreaterThan(light.z)
    })

    it('plusieurs exemplaires du même outil sont possibles', () => {
      openTbiTool('clock')
      openTbiTool('clock')
      expect(get(tbiTools).filter((t) => t.kind === 'clock')).toHaveLength(2)
    })

    it("restent sur leur onglet, sauf s'ils sont épinglés", () => {
      const clock = openTbiTool('clock')
      const first = get(tbiState).activeTabId
      const second = addTbiTab()
      expect(shownTbiTools()).toHaveLength(0)
      // l'outil reste dans la liste : il n'est que masqué
      expect(get(tbiTools)).toHaveLength(1)
      expect(isTbiToolShown(get(tbiTools)[0], first)).toBe(true)
      setTbiActiveTab(first)
      toggleTbiToolPin(clock.id)
      setTbiActiveTab(second)
      expect(shownTbiTools()).toHaveLength(1)
      // désépinglé depuis cet onglet, il y reste
      toggleTbiToolPin(clock.id)
      expect(get(tbiTools)[0].scope).toBe(second)
    })

    it('ne tiennent pas compte des outils des autres onglets pour se placer', () => {
      const clock = openTbiTool('clock')
      addTbiTab()
      const other = openTbiTool('clock')
      expect({ x: other.x, y: other.y }).toEqual({ x: clock.x, y: clock.y })
    })
  })

  describe('anciens liens', () => {
    const open = (param: string, uuids = ['e1', 'e2', 'e3']) => {
      tbiState.set(defaultTbiState())
      resetTbiTools()
      reconcileTbiCards(uuids)
      applyTbiSharedState(decodeTbiParam(param))
    }

    it('sans paramètre : une colonne centrée, un seul onglet', () => {
      open('')
      const { tabs } = get(tbiState)
      expect(tabs).toHaveLength(1)
      expect(tabs[0]).toMatchObject({
        layout: 'columns',
        nbColumns: 1,
        singleColumnAlign: 'center',
      })
    })

    it('mode colonnes : un seul onglet qui reprend colonnes et alignement', () => {
      open('c-3_sc-right')
      const { tabs } = get(tbiState)
      expect(tabs).toHaveLength(1)
      expect(tabs[0]).toMatchObject({
        layout: 'columns',
        nbColumns: 3,
        singleColumnAlign: 'right',
      })
      expect(tabRanks()).toEqual([0, 0, 0])
    })

    it('mode libre : un seul onglet en disposition libre', () => {
      open('m-free')
      expect(get(tbiState).tabs).toHaveLength(1)
      expect(get(tbiState).tabs[0].layout).toBe('free')
    })

    it('mode onglets sans répartition : un onglet par exercice', () => {
      open('m-tabs')
      expect(get(tbiState).tabs).toHaveLength(3)
      expect(tabRanks()).toEqual([0, 1, 2])
    })

    it('mode onglets : répartition, dispositions et onglet affiché', () => {
      open('m-tabs_t-0.1.0_g-columns-3-right.free-2-center_at-1')
      const { tabs, activeTabId } = get(tbiState)
      expect(tabs).toHaveLength(2)
      expect(tabRanks()).toEqual([0, 1, 0])
      expect(tabs[0]).toMatchObject({
        layout: 'columns',
        nbColumns: 3,
        singleColumnAlign: 'right',
      })
      expect(tabs[1]).toMatchObject({ layout: 'free', nbColumns: 2 })
      expect(activeTabId).toBe(tabs[1].id)
    })

    it('mode onglets aux numéros à trous : les onglets sont resserrés', () => {
      open('m-tabs_t-0.2.5')
      expect(get(tbiState).tabs).toHaveLength(3)
      expect(tabRanks()).toEqual([0, 1, 2])
    })

    it('un ancien lien sans alignement dans ses dispositions reste valide', () => {
      open('m-tabs_t-0.0.1_g-columns-2.free-1')
      expect(get(tbiState).tabs[0]).toMatchObject({
        nbColumns: 2,
        singleColumnAlign: 'center',
      })
    })

    it('les widgets deviennent des outils épinglés sur tous les onglets, à leur place', () => {
      open('w-1_f-1_wp-120.80_fp-200.150')
      expect(toolSummary()).toEqual([
        { kind: 'clock', scope: 'all', x: 120, y: 80 },
        { kind: 'trafficLight', scope: 'all', x: 200, y: 150 },
      ])
    })

    it('reprend le tirage au sort et les calculatrices', () => {
      open('ta-1_tap-40.8_cc-1_cl-1_ct-1_ccp-10.20_clp-30.40_ctp-50.60')
      expect(toolSummary()).toEqual([
        { kind: 'studentPicker', scope: 'all', x: 40, y: 8 },
        { kind: 'college', scope: 'all', x: 10, y: 20 },
        { kind: 'lycee', scope: 'all', x: 30, y: 40 },
        { kind: 'calculette', scope: 'all', x: 50, y: 60 },
      ])
    })

    it('reprend le zoom écrit en dixièmes', () => {
      open('z-15.8.10')
      expect(get(tbiState).cards.map((c) => c.zoom)).toEqual([1.5, 0.8, 1])
    })

    it('ignore les valeurs invalides', () => {
      reconcileTbiCards(['e1', 'e2'])
      applyTbiSharedState({
        // @ts-expect-error valeur inconnue volontaire
        mode: 'pirouette',
        nbColumns: 42,
        // @ts-expect-error valeur inconnue volontaire
        singleColumnAlign: 'pirouette',
      })
      const { tabs } = get(tbiState)
      expect(tabs).toHaveLength(1)
      expect(tabs[0]).toMatchObject({
        layout: 'columns',
        nbColumns: 1,
        singleColumnAlign: 'center',
      })
      applyTbiSharedState({
        mode: 'tabs',
        tabs: [0, 0],
        // @ts-expect-error valeur inconnue volontaire
        tabConfigs: [{ layout: 'pirouette', nbColumns: 99 }],
      })
      expect(get(tbiState).tabs[0]).toMatchObject({
        layout: 'columns',
        nbColumns: 1,
      })
    })

    it('rouvre une séance enregistrée avant les onglets', () => {
      exercicesParams.set([
        { uuid: 'e1', id: 'e1' },
        { uuid: 'e2', id: 'e2' },
      ])
      reconcileTbiCards(['e1', 'e2'])
      const isImported = importTbiSettings({
        type: exportTbiSettings().type,
        version: 1,
        shared: {
          mode: 'tabs',
          tabs: [0, 1],
          tabConfigs: [
            { layout: 'columns', nbColumns: 2, singleColumnAlign: 'center' },
            { layout: 'free', nbColumns: 1, singleColumnAlign: 'center' },
          ],
          activeTab: 1,
          widgetVisible: true,
          widgetX: 12,
          widgetY: 34,
          trafficLightVisible: false,
        },
        layout: {
          cards: [
            { x: 100, y: 120, w: 800, zoom: 1.5 },
            { x: 10, y: 20, w: 400, zoom: 1 },
          ],
          widget: { x: 1, y: 2, zoom: 2 },
          trafficLight: { x: 3, y: 4, w: 200, h: 400, active: 'green' },
        },
        collapsed: [true, false],
        widgetMode: 'timer',
        cols: [1, 3],
        exercices: [],
      })
      expect(isImported).toBe(true)
      const state = get(tbiState)
      expect(state.tabs).toHaveLength(2)
      expect(state.activeTabId).toBe(state.tabs[1].id)
      expect(state.tabs[1].layout).toBe('free')
      expect(state.cards[0]).toMatchObject({
        x: 100,
        y: 120,
        w: 800,
        zoom: 1.5,
        collapsed: true,
      })
      // l'horloge est mise à l'échelle dans les anciennes sauvegardes
      expect(get(tbiTools)).toHaveLength(1)
      expect(get(tbiTools)[0]).toMatchObject({
        kind: 'clock',
        scope: TBI_SCOPE_ALL,
        x: 12,
        y: 34,
        w: 448,
        mode: 'timer',
      })
      // le feu fermé garde ses réglages pour sa prochaine ouverture
      expect(openTbiTool('trafficLight')).toMatchObject({
        w: 200,
        h: 400,
        active: 'green',
      })
      expect(get(exercicesParams)[1].cols).toBe(3)
    })
  })

  describe('lien de la séance', () => {
    const roundTrip = () => {
      const encoded = encodeTbiParam(getTbiSharedState(get(tbiState)))
      const uuids = get(tbiState).cards.map((card) => card.uuid ?? '')
      tbiState.set(defaultTbiState())
      resetTbiTools()
      reconcileTbiCards(uuids)
      applyTbiSharedState(decodeTbiParam(encoded))
      return encoded
    }

    it("une séance par défaut n'écrit rien dans l'URL", () => {
      reconcileTbiCards(['e1', 'e2'])
      expect(encodeTbiParam(getTbiSharedState(get(tbiState)))).toBe('')
    })

    it('un seul onglet garde la forme courte des anciens liens', () => {
      reconcileTbiCards(['e1'])
      const { activeTabId } = get(tbiState)
      setTbiTabNbColumns(activeTabId, 2)
      expect(encodeTbiParam(getTbiSharedState(get(tbiState)))).toBe('c-2')
      setTbiTabLayout(activeTabId, 'free')
      expect(encodeTbiParam(getTbiSharedState(get(tbiState)))).toBe(
        'm-free_c-2',
      )
    })

    it('restitue les onglets, leurs noms, leurs dispositions et l’onglet affiché', () => {
      reconcileTbiCards(['e1', 'e2', 'e3'])
      const first = get(tbiState).activeTabId
      renameTbiTab(first, 'Calculs : à côté_de-la.page')
      const second = addTbiTab()
      setTbiTabLayout(second, 'free')
      moveCardToTab(2, second)
      roundTrip()
      const { tabs, activeTabId } = get(tbiState)
      expect(tabs).toHaveLength(2)
      expect(tabs[0].name).toBe('Calculs : à côté_de-la.page')
      expect(tabs[1].name).toBeNull()
      expect(tabs[1].layout).toBe('free')
      expect(activeTabId).toBe(tabs[1].id)
      expect(tabRanks()).toEqual([0, 0, 1])
    })

    it('restitue les onglets vides, même sans aucun exercice', () => {
      addTbiTab()
      addTbiTab()
      const encoded = roundTrip()
      expect(encoded).toContain('m-tabs')
      expect(get(tbiState).tabs).toHaveLength(3)
      expect(activeTbiTab(get(tbiState)).id).toBe(get(tbiState).tabs[2].id)
    })

    it('restitue un onglet vide au milieu des autres', () => {
      reconcileTbiCards(['e1', 'e2'])
      const empty = addTbiTab()
      const last = addTbiTab()
      moveCardToTab(1, last)
      expect(tbiTabCardIndices(get(tbiState), empty)).toEqual([])
      roundTrip()
      expect(get(tbiState).tabs).toHaveLength(3)
      expect(tabRanks()).toEqual([0, 2])
    })

    it('restitue les outils de chaque onglet et ceux épinglés', () => {
      const clock = openTbiTool('clock', { position: { x: 100, y: 50 } })
      const second = addTbiTab()
      openTbiTool('trafficLight', { position: { x: 200, y: 60 } })
      expect(get(tbiTools)[1].scope).toBe(second)
      setTbiActiveTab(get(tbiState).tabs[0].id)
      openTbiTool('college', { position: { x: 300, y: 70 } })
      toggleTbiToolPin(clock.id)
      const encoded = roundTrip()
      expect(encoded).toContain('o-h-a-100-50.f-1-200-60.cc-0-300-70')
      expect(toolSummary()).toEqual([
        { kind: 'clock', scope: 'all', x: 100, y: 50 },
        { kind: 'trafficLight', scope: 1, x: 200, y: 60 },
        { kind: 'college', scope: 0, x: 300, y: 70 },
      ])
    })

    it('restitue le fond et sa taille, en signalant une écriture absente du lien', () => {
      addTbiBoard(get(tbiState).activeTabId)
      const tabId = get(tbiState).activeTabId
      updateTbiBoard(tabId, () => ({
        background: 'seyes',
        gridSize: 1.5,
        strokes: [{ tool: 'pen', color: 'ink', size: 0.002, points: [0, 0] }],
      }))
      const encoded = roundTrip()
      expect(encoded).toContain('bd-0-seyes-150-1')
      expect(decodeTbiParam(encoded).boards?.[0]?.hasInk).toBe(true)
      expect(get(tbiState).tabs[0].board).toEqual({
        background: 'seyes',
        gridSize: 1.5,
        strokes: [],
      })
      expect(get(tbiState).tabs[0].name).toBe('Tableau 1')
    })

    it('un fond seul n’annonce pas d’écriture manquante', () => {
      setTbiTabBackground(get(tbiState).activeTabId, 'grid')
      const encoded = roundTrip()
      expect(encoded).toContain('bd-0-grid-100-0')
      expect(decodeTbiParam(encoded).boards?.[0]?.hasInk).toBe(false)
    })

    it('garde des zooms au pourcentage près', () => {
      reconcileTbiCards(['e1', 'e2'])
      zoomTbiCards([0], 0.75)
      const encoded = roundTrip()
      expect(encoded).toBe('zp-175.100')
      expect(get(tbiState).cards.map((c) => c.zoom)).toEqual([1.75, 1])
    })
  })

  describe('séance enregistrée', () => {
    it('fait un aller-retour de tous les réglages', () => {
      exercicesParams.set([
        { uuid: 'e1', id: 'e1' },
        { uuid: 'e2', id: 'e2', cols: 3 },
      ])
      reconcileTbiCards(['e1', 'e2'])
      const first = get(tbiState).activeTabId
      setTbiTabLayout(first, 'free')
      tbiState.update((state) => {
        state.cards[0].x = 100
        state.cards[0].y = 120
        state.cards[0].w = 800
        state.cards[0].zoom = 1.4
        state.cards[0].collapsed = true
        state.cards[1].correctionMode = 'below'
        state.cards[1].correctionDetail = 'minimal'
        return state
      })
      openTbiTool('clock')
      addTbiBoard(first)
      updateTbiBoard(first, (board) => ({
        ...board,
        strokes: [
          {
            tool: 'pen',
            color: 'red',
            size: 0.002,
            points: [0.1, 0.2, 0.3, 0.4],
          },
        ],
      }))
      // le fichier doit survivre à une sérialisation JSON
      const file = JSON.parse(JSON.stringify(exportTbiSettings()))
      expect(file.exercices).toEqual([
        { uuid: 'e1', id: 'e1' },
        { uuid: 'e2', id: 'e2', cols: 3 },
      ])

      tbiState.set(defaultTbiState())
      resetTbiTools()
      exercicesParams.set([
        { uuid: 'e1', id: 'e1' },
        { uuid: 'e2', id: 'e2' },
      ])
      reconcileTbiCards(['e1', 'e2'])
      expect(importTbiSettings(file)).toBe(true)

      const state = get(tbiState)
      expect(state.tabs[0].layout).toBe('free')
      expect(state.cards[0]).toMatchObject({
        x: 100,
        y: 120,
        w: 800,
        zoom: 1.4,
        collapsed: true,
      })
      expect(state.cards[1].collapsed).toBe(false)
      expect(state.cards[1].correctionMode).toBe('below')
      expect(state.cards[1].correctionDetail).toBe('minimal')
      expect(state.tabs[0].board?.strokes).toHaveLength(1)
      expect(state.tabs[0].board?.strokes[0].color).toBe('red')
      expect(get(tbiTools).map((tool) => tool.kind)).toEqual(['clock'])
      expect(get(exercicesParams)[0].cols).toBeUndefined()
      expect(get(exercicesParams)[1].cols).toBe(3)
    })

    it('rouvre chaque document sur son onglet', () => {
      const first = get(tbiState).activeTabId
      openTbiViewers([parseTbiLink('https://a.fr/sujet.pdf')])
      const second = addTbiTab()
      openTbiViewers([parseTbiLink('https://a.fr/autre.pdf')])
      expect(get(tbiDocumentViewers).map((v) => v.scope)).toEqual([
        first,
        second,
      ])
      const file = JSON.parse(JSON.stringify(exportTbiSettings()))
      expect(file.documents.map((d: { scope: number }) => d.scope)).toEqual([
        0, 1,
      ])
      resetTbiTools()
      expect(importTbiSettings(file)).toBe(true)
      const { tabs } = get(tbiState)
      expect(get(tbiDocumentViewers).map((v) => v.scope)).toEqual([
        tabs[0].id,
        tabs[1].id,
      ])
    })
  })

  describe('brouillon', () => {
    it("retrouve l'écriture et les notes après un rechargement", () => {
      reconcileTbiCards(['e1'])
      const tabId = get(tbiState).activeTabId
      addTbiBoard(tabId)
      updateTbiBoard(tabId, (board) => ({
        ...board,
        strokes: [
          { tool: 'pen', color: 'ink', size: 0.002, points: [0.1, 0.2] },
        ],
      }))
      openTbiViewers([parseTbiLink('https://a.fr/sujet.pdf')])
      saveTbiDraft(['e1'])

      // rechargement : le lien redonne le Tableau, sans son écriture
      const shared = decodeTbiParam(
        encodeTbiParam(getTbiSharedState(get(tbiState))),
      )
      tbiState.set(defaultTbiState())
      resetTbiTools()
      reconcileTbiCards(['e1'])
      applyTbiSharedState(shared)
      expect(get(tbiState).tabs[0].board?.strokes).toEqual([])

      expect(loadTbiDraft(['e1'])).toBe(true)
      expect(get(tbiState).tabs[0].board?.strokes).toHaveLength(1)
      expect(get(tbiDocumentViewers)).toHaveLength(1)
    })

    it('ne reprend pas le brouillon d’une autre séance', () => {
      reconcileTbiCards(['e1'])
      saveTbiDraft(['e1'])
      expect(loadTbiDraft(['autre'])).toBe(false)
    })
  })
})
