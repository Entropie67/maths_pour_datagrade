import katex from 'katex'
import { orangeMathalea } from '../../colors'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../outils/embellissements'
import { internalPositionsFromFleches } from './latexExport'
import type {
  ActiveCellInfo,
  CelluleFleche,
  CelluleSigne,
  LigneSigne,
  LigneValeur,
  LigneVariation,
  TableauSVConfig,
  TableauSVValue,
  ToolbarMode,
} from './types'

function markerClass(j: number, N: number): string {
  if (j <= 0 || j >= N - 1) return ''
  return 'tab-sv__cell--marker'
}

type MarkerKind = 'simple' | 'double'

function markerKindFromValue(
  value: string | undefined,
): MarkerKind | undefined {
  if (value === '|') return 'simple'
  if (value === '||') return 'double'
  return undefined
}

/** Dérive le type de barre directement depuis le symbole de la cellule config. */
function markerKindFromSymbol(sym: string): MarkerKind | undefined {
  if (sym === '|' || sym === '|0') return 'simple'
  if (sym === '||' || sym === '||0') return 'double'
  return undefined
}

function markerCellId(cellId: string): string {
  return `${cellId}B`
}

const SIGNE_DISPLAY: Record<string, string> = {
  '+': '+',
  '-': '−',
  '0': '0',
  '|': '',
  '||': '',
  '|0': '0',
  '||0': '0',
  '': '',
}

function renderLatex(latex: string): string {
  if (!latex) return ''
  try {
    return katex.renderToString(latex, {
      throwOnError: false,
      displayMode: false,
    })
  } catch {
    return latex
  }
}

function renderMaybeHighlightedLatex(latex: string, highlight?: boolean): string {
  return renderLatex(highlight && latex !== '' ? miseEnEvidence(latex) : latex)
}

function renderSign(
  element: HTMLElement,
  value: string,
  highlight?: boolean,
): void {
  const display = SIGNE_DISPLAY[value] ?? value
  if (highlight && display !== '') {
    element.innerHTML = texteEnCouleurEtGras(display)
  } else {
    element.textContent = display
  }
}

export interface RenderResult {
  root: HTMLElement
  /** Conteneur direct du tableau (enfant de root, avant les contrôles de colonnes). */
  main: HTMLElement
  cells: Map<string, HTMLElement>
}

export interface RenderOptions {
  config: TableauSVConfig
  state: TableauSVValue
  readonly: boolean
  onCellActivate: (info: ActiveCellInfo, cellEl: HTMLElement) => void
}

/**
 * Structure des colonnes (même pour toutes les lignes) :
 * - 1 colonne label
 * - 2N-1 colonnes contenu : index pairs = antécédents (étroits), index impairs = intervalles (larges)
 */
export function renderTableau(opts: RenderOptions): RenderResult {
  const { config, state, readonly, onCellActivate } = opts
  const cells = new Map<string, HTMLElement>()
  const root = document.createElement('div')
  root.classList.add('tab-sv')
  if (config.couleur !== undefined) {
    root.style.setProperty('--tab-sv-border', config.couleur)
    root.style.color = config.couleur
  }
  const main = document.createElement('div')
  main.classList.add('tab-sv__main')
  root.appendChild(main)

  const N = config.colonnes.length
  const nbContentCols = 2 * N - 1

  const table = document.createElement('table')
  table.classList.add('tab-sv__table')

  // colgroup pour les largeurs
  const colgroup = document.createElement('colgroup')
  const colLabel = document.createElement('col')
  colLabel.classList.add('tab-sv__col--label')
  colgroup.appendChild(colLabel)
  for (let k = 0; k < nbContentCols; k++) {
    const col = document.createElement('col')
    col.classList.add(
      k % 2 === 0 ? 'tab-sv__col--antecedent' : 'tab-sv__col--intervalle',
    )
    colgroup.appendChild(col)
  }
  table.appendChild(colgroup)

  // Ligne d'en-tête : variable + antécédents + cellules vides pour intervalles
  const header = document.createElement('tr')
  header.classList.add('tab-sv__row', 'tab-sv__row--header')
  const labelCell = document.createElement('th')
  labelCell.classList.add('tab-sv__label')
  labelCell.innerHTML = renderLatex(config.variableName ?? 'x')
  header.appendChild(labelCell)

  for (let k = 0; k < nbContentCols; k++) {
    if (k % 2 === 0) {
      const j = k / 2
      const cellId = `L0C${j}`
      const td = createValueCell({
        cellId,
        latex: state[cellId] ?? config.colonnes[j].valeur,
        highlight: config.colonnes[j].highlight,
        editable: !!config.colonnes[j].editable && !readonly,
        mode: 'valeur',
        onCellActivate,
        ligneIndex: 0,
        cellIndex: j,
        clavier: config.colonnes[j].clavier,
      })
      td.classList.add('tab-sv__antecedent')
      cells.set(cellId, td)
      header.appendChild(td)
    } else {
      const spacer = document.createElement('td')
      spacer.classList.add('tab-sv__cell', 'tab-sv__cell--header-spacer')
      header.appendChild(spacer)
    }
  }
  table.appendChild(header)

  // Lignes de contenu
  config.lignes.forEach((ligne, i) => {
    const ligneIndex = i + 1
    const tr = document.createElement('tr')
    tr.classList.add('tab-sv__row', `tab-sv__row--${ligne.type}`)

    const labelCellId = `L${ligneIndex}label`
    const labelTd = document.createElement('th')
    labelTd.classList.add('tab-sv__label')
    labelTd.dataset.cellId = labelCellId
    labelTd.innerHTML = renderLatex(state[labelCellId] ?? ligne.label)
    if (!!ligne.labelEditable && !readonly) {
      labelTd.classList.add('tab-sv__cell--editable')
      labelTd.setAttribute('tabindex', '0')
      labelTd.setAttribute('role', 'button')
      attachActivate(labelTd, onCellActivate, {
        cellId: labelCellId,
        mode: 'valeur',
        ligneIndex,
        cellIndex: -1,
      })
    }
    cells.set(labelCellId, labelTd)
    tr.appendChild(labelTd)

    if (ligne.type === 'signe') {
      renderLigneSigne({
        ligne,
        ligneIndex,
        tr,
        state,
        readonly,
        onCellActivate,
        cells,
      })
    } else if (ligne.type === 'variation') {
      renderLigneVariation({
        ligne,
        ligneIndex,
        N,
        tr,
        state,
        readonly,
        onCellActivate,
        cells,
      })
    } else {
      renderLigneValeur({
        ligne,
        ligneIndex,
        nbContentCols,
        tr,
        state,
        readonly,
        onCellActivate,
        cells,
      })
    }
    table.appendChild(tr)
  })

  main.appendChild(table)
  return { root, main, cells }
}

function addMarkerClass(
  cell: HTMLElement,
  markerClassName: string,
  markerKind?: MarkerKind,
) {
  if (markerClassName === '' || markerKind == null) return
  cell.classList.add(markerClassName)
  if (markerKind === 'double') cell.classList.add('tab-sv__cell--marker-double')
}

// ── Rendu ligne de signes ──────────────────────────────────────────────────

function renderLigneSigne(args: {
  ligne: LigneSigne
  ligneIndex: number
  tr: HTMLElement
  state: TableauSVValue
  readonly: boolean
  onCellActivate: (info: ActiveCellInfo, cellEl: HTMLElement) => void
  cells: Map<string, HTMLElement>
}) {
  const { ligne, ligneIndex, tr, state, readonly, onCellActivate, cells } = args
  const N = (ligne.cellules.length + 1) / 2
  ligne.cellules.forEach((cellule, j) => {
    const cellId = `L${ligneIndex}C${j}`
    const value = (state[cellId] ?? cellule.symbole) as CelluleSigne['symbole']
    const isAntecedentCol = j % 2 === 0
    const td = document.createElement('td')
    td.classList.add('tab-sv__cell', 'tab-sv__cell--signe')
    if (isAntecedentCol) {
      td.classList.add('tab-sv__cell--antecedent-col')
      const markerId = markerCellId(cellId)
      const markerState = state[markerId]
      // Barre : depuis l'état explicite si positionné, sinon depuis le symbole de la config.
      const markerKind =
        markerState != null
          ? markerKindFromValue(markerState)
          : markerKindFromSymbol(cellule.symbole)
      addMarkerClass(td, markerClass(j / 2, N), markerKind)
    }
    td.dataset.cellId = cellId
    renderSign(td, value, cellule.highlight)
    if (!!cellule.editable && !readonly) {
      td.classList.add('tab-sv__cell--editable')
      td.setAttribute('tabindex', '0')
      td.setAttribute('role', 'button')
      const markerId = isAntecedentCol ? markerCellId(cellId) : undefined
      attachActivate(td, onCellActivate, {
        cellId,
        mode: isAntecedentCol ? 'signeBarree' : 'signe',
        ligneIndex,
        cellIndex: j,
        secondaryCellId: isAntecedentCol ? markerId : undefined,
      })
    }
    cells.set(cellId, td)
    if (isAntecedentCol) {
      cells.set(markerCellId(cellId), td)
    }
    tr.appendChild(td)
  })
}

// ── Rendu ligne de variations ──────────────────────────────────────────────

function renderLigneVariation(args: {
  ligne: LigneVariation
  ligneIndex: number
  N: number
  tr: HTMLElement
  state: TableauSVValue
  readonly: boolean
  onCellActivate: (info: ActiveCellInfo, cellEl: HTMLElement) => void
  cells: Map<string, HTMLElement>
}) {
  const { ligne, ligneIndex, N, tr, state, readonly, onCellActivate, cells } =
    args

  // Position haut/bas de chaque valeur, calculée à partir des flèches actuelles
  const currentFleches = ligne.fleches.map((f, j) => {
    const flecheId = `L${ligneIndex}C${N + j}`
    const sens = (state[flecheId] ?? f.sens) as CelluleFleche['sens']
    return { sens }
  })
  const positions = internalPositionsFromFleches(N, currentFleches)

  for (let j = 0; j < N; j++) {
    const valId = `L${ligneIndex}C${j}`
    const droiteId = `${valId}R`
    const marker = markerClass(j, N)
    const markerId = markerCellId(valId)

    const configVal = ligne.valeurs[j]

    // Barre effective : depuis l'état si positionné, sinon '||' par défaut quand
    // latexDroite est défini dans la config, sinon undefined.
    const markerStateVal = state[markerId]
    const effectiveMarkerKind: MarkerKind | undefined =
      markerStateVal !== undefined
        ? markerKindFromValue(markerStateVal)
        : configVal.latexDroite !== undefined ? 'double' : undefined

    // Affichage double uniquement avec la barre double (||).
    const hasDouble = effectiveMarkerKind === 'double'

    if (hasDouble) {
      // ── Cellule double (limite gauche + limite droite) ──────────────────
      const latexG = state[valId] ?? configVal.latex
      const latexD = state[droiteId] ?? configVal.latexDroite ?? ''
      const posGauche = positions[j] ?? 'bas'
      // Position droite : début de la flèche sortante (opposé de la direction)
      const sensSortant = j < currentFleches.length ? currentFleches[j].sens : ''
      const posDroite: 'haut' | 'bas' =
        sensSortant === 'haut' ? 'bas'
        : sensSortant === 'bas' ? 'haut'
        : posGauche

      const tdVal = document.createElement('td')
      tdVal.classList.add(
        'tab-sv__cell',
        'tab-sv__cell--var-valeur',
        'tab-sv__cell--var-double',
      )
      addMarkerClass(tdVal, marker, effectiveMarkerKind)
      tdVal.dataset.cellId = valId

      // Wrapper flex interne — ne pas mettre display:flex sur le <td> lui-même
      // pour préserver le contexte table (bordures, hauteur de ligne).
      const inner = document.createElement('div')
      inner.classList.add('tab-sv__var-double-inner')

      const spanG = document.createElement('span')
      spanG.classList.add(
        'tab-sv__var-half',
        'tab-sv__var-half--gauche',
        posGauche === 'haut' ? 'tab-sv__cell--var-top' : 'tab-sv__cell--var-bottom',
      )
      spanG.innerHTML = renderMaybeHighlightedLatex(latexG, configVal.highlight)
      if (!!configVal.editable && !readonly) {
        spanG.classList.add('tab-sv__cell--editable')
        spanG.setAttribute('tabindex', '0')
        spanG.setAttribute('role', 'button')
        attachActivate(spanG, onCellActivate, {
          cellId: valId,
          mode: 'valeurDroite',
          ligneIndex,
          cellIndex: j,
          clavier: configVal.clavier,
        })
      }

      const spanD = document.createElement('span')
      spanD.classList.add(
        'tab-sv__var-half',
        'tab-sv__var-half--droite',
        posDroite === 'haut' ? 'tab-sv__cell--var-top' : 'tab-sv__cell--var-bottom',
      )
      spanD.innerHTML = renderMaybeHighlightedLatex(latexD, configVal.highlight)
      if (!!configVal.editable && !readonly) {
        spanD.classList.add('tab-sv__cell--editable')
        spanD.setAttribute('tabindex', '0')
        spanD.setAttribute('role', 'button')
        attachActivate(spanD, onCellActivate, {
          cellId: droiteId,
          mode: 'valeurDroite',
          ligneIndex,
          cellIndex: j,
          clavier: configVal.clavier,
        })
      }

      inner.appendChild(spanG)
      if (!readonly) {
        const barBtn = document.createElement('button')
        barBtn.type = 'button'
        barBtn.classList.add('tab-sv__var-bar-btn')
        barBtn.setAttribute('aria-label', 'modifier la barre')
        attachActivate(barBtn, onCellActivate, {
          cellId: markerId,
          mode: 'barre',
          ligneIndex,
          cellIndex: j,
        })
        inner.appendChild(barBtn)
      }
      inner.appendChild(spanD)
      tdVal.appendChild(inner)
      cells.set(valId, tdVal)
      cells.set(droiteId, tdVal)
      cells.set(markerId, tdVal)
      tr.appendChild(tdVal)
    } else {
      // ── Cellule simple ──────────────────────────────────────────────────
      const latex = state[valId] ?? configVal.latex
      const position = positions[j] ?? 'bas'
      const tdVal = document.createElement('td')
      tdVal.classList.add(
        'tab-sv__cell',
        'tab-sv__cell--var-valeur',
        position === 'haut'
          ? 'tab-sv__cell--var-top'
          : 'tab-sv__cell--var-bottom',
      )
      addMarkerClass(tdVal, marker, effectiveMarkerKind)
      tdVal.dataset.cellId = valId
      tdVal.innerHTML = renderMaybeHighlightedLatex(latex, configVal.highlight)
      const markerEditable = marker !== '' && !readonly
      const valueEditable = !!configVal.editable && !readonly
      if (valueEditable || markerEditable) {
        tdVal.classList.add('tab-sv__cell--editable')
        tdVal.setAttribute('tabindex', '0')
        tdVal.setAttribute('role', 'button')
        attachActivate(tdVal, onCellActivate, {
          cellId: valueEditable ? valId : markerId,
          mode: valueEditable ? 'valeurBarree' : 'barre',
          ligneIndex,
          cellIndex: j,
          secondaryCellId: valueEditable ? markerId : undefined,
          clavier: valueEditable ? configVal.clavier : undefined,
        })
      }
      cells.set(valId, tdVal)
      cells.set(markerId, tdVal)
      tr.appendChild(tdVal)
    }

    // Cellule flèche (colonne intervalle), sauf après la dernière valeur
    if (j < N - 1) {
      const flecheIndex = N + j
      const flecheId = `L${ligneIndex}C${flecheIndex}`
      const sens = (state[flecheId] ??
        ligne.fleches[j].sens) as CelluleFleche['sens']
      const tdF = document.createElement('td')
      tdF.classList.add('tab-sv__cell', 'tab-sv__cell--var-fleche')
      tdF.dataset.cellId = flecheId
      tdF.appendChild(makeFlecheSvg(sens))
      if (ligne.fleches[j].highlight) tdF.style.color = orangeMathalea
      if (!!ligne.fleches[j].editable && !readonly) {
        tdF.classList.add('tab-sv__cell--editable')
        tdF.setAttribute('tabindex', '0')
        tdF.setAttribute('role', 'button')
        attachActivate(tdF, onCellActivate, {
          cellId: flecheId,
          mode: 'variation',
          ligneIndex,
          cellIndex: flecheIndex,
        })
      }
      cells.set(flecheId, tdF)
      tr.appendChild(tdF)
    }
  }
}

// ── Rendu ligne de valeurs ─────────────────────────────────────────────────

function renderLigneValeur(args: {
  ligne: LigneValeur
  ligneIndex: number
  nbContentCols: number
  tr: HTMLElement
  state: TableauSVValue
  readonly: boolean
  onCellActivate: (info: ActiveCellInfo, cellEl: HTMLElement) => void
  cells: Map<string, HTMLElement>
}) {
  const {
    ligne,
    ligneIndex,
    nbContentCols,
    tr,
    state,
    readonly,
    onCellActivate,
    cells,
  } = args
  for (let k = 0; k < nbContentCols; k++) {
    if (k % 2 === 0) {
      const j = k / 2
      const N = (nbContentCols + 1) / 2
      const cellId = `L${ligneIndex}C${j}`
      const value = state[cellId] ?? ligne.valeurs[j]?.latex ?? ''
      const td = createValueCell({
        cellId,
        latex: value,
        highlight: ligne.valeurs[j]?.highlight,
        editable: !!ligne.valeurs[j]?.editable && !readonly,
        mode: 'valeur',
        onCellActivate,
        ligneIndex,
        cellIndex: j,
        clavier: ligne.valeurs[j]?.clavier,
      })
      cells.set(cellId, td)
      tr.appendChild(td)
    } else {
      const spacer = document.createElement('td')
      spacer.classList.add('tab-sv__cell', 'tab-sv__cell--spacer')
      tr.appendChild(spacer)
    }
  }
}

// ── Helpers de création de cellules ───────────────────────────────────────

function createValueCell(args: {
  cellId: string
  latex: string
  highlight?: boolean
  editable: boolean
  mode: ToolbarMode
  onCellActivate: (info: ActiveCellInfo, cellEl: HTMLElement) => void
  ligneIndex: number
  cellIndex: number
  clavier?: string
}): HTMLElement {
  const td = document.createElement('td')
  td.classList.add('tab-sv__cell', 'tab-sv__cell--valeur')
  td.dataset.cellId = args.cellId
  td.innerHTML = renderMaybeHighlightedLatex(args.latex, args.highlight)
  if (args.editable) {
    td.classList.add('tab-sv__cell--editable')
    td.setAttribute('tabindex', '0')
    td.setAttribute('role', 'button')
    attachActivate(td, args.onCellActivate, {
      cellId: args.cellId,
      mode: args.mode,
      ligneIndex: args.ligneIndex,
      cellIndex: args.cellIndex,
      clavier: args.clavier,
    })
  }
  return td
}

/**
 * Crée le SVG d'une flèche de variation.
 *
 * Pour ↗/↘ : viewBox rectangulaire large (200×60) avec xMidYMid meet.
 * La flèche reste bien diagonale quelle que soit la largeur de la cellule,
 * car le rapport largeur/hauteur du viewBox est proche de celui des cellules.
 */
function makeFlecheSvg(sens: CelluleFleche['sens']): SVGSVGElement {
  const NS = 'http://www.w3.org/2000/svg'
  const svg = document.createElementNS(NS, 'svg')
  svg.classList.add('tab-sv__fleche-svg')
  svg.setAttribute('viewBox', '0 0 200 60')

  if (sens === 'interdite') {
    svg.setAttribute('viewBox', '0 0 20 1')
    svg.setAttribute('preserveAspectRatio', 'none')
    for (const x of [7, 13]) {
      const line = document.createElementNS(NS, 'line')
      line.setAttribute('x1', String(x))
      line.setAttribute('y1', '0')
      line.setAttribute('x2', String(x))
      line.setAttribute('y2', '1')
      line.setAttribute('stroke', 'currentColor')
      line.setAttribute('stroke-width', '1.8')
      svg.appendChild(line)
    }
  } else if (sens === 'bas' || sens === 'haut') {
    const isUp = sens === 'haut'
    const path = document.createElementNS(NS, 'path')
    path.setAttribute('d', isUp ? 'M 16 51 L 172 11' : 'M 16 9 L 172 49')
    path.setAttribute('fill', 'none')
    path.setAttribute('stroke', 'currentColor')
    path.setAttribute('stroke-width', '2.4')
    path.setAttribute('stroke-linecap', 'round')
    path.setAttribute('stroke-linejoin', 'round')
    svg.appendChild(path)

    const head = document.createElementNS(NS, 'path')
    head.setAttribute(
      'd',
      isUp ? 'M 172 11 L 153 7 L 168 24 Z' : 'M 172 49 L 153 53 L 168 36 Z',
    )
    head.setAttribute('fill', 'currentColor')
    svg.appendChild(head)
  }
  // sens === '' : SVG vide (aucun contenu)

  return svg
}

function attachActivate(
  el: HTMLElement,
  cb: (info: ActiveCellInfo, cellEl: HTMLElement) => void,
  info: ActiveCellInfo,
) {
  el.addEventListener('click', (event: Event) => {
    event.preventDefault()
    cb(info, el)
  })
  el.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      cb(info, el)
    }
  })
}

/**
 * Met à jour visuellement une cellule déjà rendue.
 * Pour les flèches de variation, recrée l'SVG.
 */
export function updateCellDisplay(
  cellEl: HTMLElement,
  mode: ToolbarMode,
  newValue: string,
) {
  if (mode === 'signe' || mode === 'signeBarree') {
    cellEl.textContent = SIGNE_DISPLAY[newValue] ?? newValue
  } else if (mode === 'variation') {
    cellEl.innerHTML = ''
    cellEl.appendChild(makeFlecheSvg(newValue as CelluleFleche['sens']))
  } else {
    cellEl.innerHTML = renderLatex(newValue)
  }
}
