import { MathfieldElement } from 'mathlive'
import { texteApresChamp } from '../outils/outilString'
import { context } from '../../modules/context'
import {
  compteChampsDeReponse,
  pointsMaxDuBareme,
} from '../interactif/baremeExercice'
import { buildDataKeyboardFromStyle } from '../interactif/claviers/keyboard'
import { fonctionComparaison } from '../interactif/comparisonFunctions'
import { toutPourUnPoint } from '../interactif/fonctionsBaremes'
import { nommeChampsAutourDe } from '../interactif/nomAccessibleChamp'
import { setMathfield, setMathfieldListener } from '../interactif/setMathfield'
import { miseEnEvidence, texteEnCouleurEtGras } from '../outils/embellissements'
import type { IExercice } from '../types'
import type { AllChoicesType } from './ListeDeroulanteElement'
import ListeDeroulanteElement from './ListeDeroulanteElement'
import MathaleaCustomElement, {
  registerMathaleaCustomElement,
} from './MathaleaCustomElement'

export type TableauHybrideCell =
  | {
      type?: 'text'
      texte: string | number
      header?: boolean
      latex?: boolean
    }
  | {
      type: 'mathfield'
      id: string
      texteAvant?: string
      texteApres?: string
      keyboard?: string
      minWidth?: number
      value?: string | number
    }
  | {
      type: 'select'
      id: string
      choices: AllChoicesType
      choix0?: boolean
      value?: string | number
    }

export type TableauHybrideData = {
  rows: TableauHybrideCell[][]
}

export type TableauHybrideCreateOptions = {
  numeroExercice: number
  questionIndex: number
  tableau: TableauHybrideData
  id?: string
  interactivityOn?: boolean
  correctionOn?: boolean
}

type TableauHybrideVerificationResult = {
  isOk: boolean
  feedback: string
  score: { nbBonnesReponses: number; nbReponses: number }
}

function renderStaticCell(cell: TableauHybrideCell) {
  if (cell.type === 'mathfield' || cell.type === 'select') return ''
  const texte = String(cell.texte)
  return cell.latex ? `$${texte}$` : texte
}

function escapeHtml(value: string | number) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function latexCell(value: string | number) {
  return String(value)
    .replaceAll('\\', '\\textbackslash{}')
    .replaceAll('&', '\\&')
    .replaceAll('%', '\\%')
    .replaceAll('#', '\\#')
    .replaceAll('_', '\\_')
}

function staticHtmlValue(cell: TableauHybrideCell, correctionOn: boolean) {
  if (cell.type === 'mathfield') {
    if (cell.value == null) return correctionOn ? '' : '...'
    return correctionOn ? `$${miseEnEvidence(cell.value)}$` : '...'
  }
  if (cell.type === 'select') {
    if (cell.value == null) return correctionOn ? '' : '...'
    return correctionOn ? texteEnCouleurEtGras(cell.value) : '...'
  }
  return renderStaticCell(cell)
}

function staticLatexValue(cell: TableauHybrideCell, correctionOn: boolean) {
  if (cell.type === 'mathfield') {
    if (cell.value == null) return correctionOn ? '' : '...'
    return correctionOn ? `$${miseEnEvidence(cell.value)}$` : '...'
  }
  if (cell.type === 'select') {
    if (cell.value == null) return correctionOn ? '' : '...'
    return correctionOn ? texteEnCouleurEtGras(cell.value) : '...'
  }
  if (cell.type === 'text' && cell.latex) return `$${latexCell(cell.texte)}$`
  return latexCell(renderStaticCell(cell))
}

function tableHtml(tableau: TableauHybrideData, correctionOn = false) {
  return `<table class="tableauMathlive">${tableau.rows
    .map(
      (row) =>
        `<tr>${row
          .map((cell) => {
            const tag = cell.type === 'text' && cell.header ? 'th' : 'td'
            const value = staticHtmlValue(cell, correctionOn)
            const content =
              correctionOn &&
              (cell.type === 'mathfield' || cell.type === 'select')
                ? value
                : escapeHtml(value)
            return `<${tag}>${content}</${tag}>`
          })
          .join('')}</tr>`,
    )
    .join('')}</table>`
}

function tableLatex(tableau: TableauHybrideData, correctionOn = false) {
  const nbColonnes = Math.max(...tableau.rows.map((row) => row.length))
  const row = (cells: TableauHybrideCell[]) =>
    `${cells
      .map((cell) => staticLatexValue(cell, correctionOn))
      .join(' & ')} \\\\ \\hline`
  return [
    `\\begin{tabular}{|${'l|'.repeat(nbColonnes)}}`,
    '\\hline',
    ...tableau.rows.map(row),
    '\\end{tabular}',
  ].join('\n')
}
/**
 * @author Jean-Claude Lhote
 */
export class TableauHybrideElement extends MathaleaCustomElement {
  static readonly elementTag = 'tableau-hybride'
  private _data: TableauHybrideData = { rows: [] }

  static create({
    id,
    numeroExercice,
    questionIndex,
    tableau,
    interactivityOn = true,
    correctionOn = false,
  }: TableauHybrideCreateOptions) {
    const shouldRenderStatic = !interactivityOn || correctionOn
    if (context.isTypst) return tableHtml(tableau, correctionOn)
    if (!context.isHtml) return tableLatex(tableau, correctionOn)
    if (shouldRenderStatic) return tableHtml(tableau, correctionOn)
    return super.create({
      id:
        id ??
        `${TableauHybrideElement.elementTag}Ex${numeroExercice}Q${questionIndex}`,
      numeroExercice,
      questionIndex,
      tableau,
      interactivityOn,
      correctionOn,
    })
  }

  static get observedAttributes() {
    return ['tableau', 'interactivity-on', 'correction-on']
  }

  attributeChangedCallback(name: string) {
    if (name === 'interactivity-on') {
      this.hydrateCommonAttributes()
      this.onInteractivityChanged(this.interactivityOn)
      return
    }
    this.render()
  }

  connectedCallback() {
    this.hydrateCommonAttributes()
    this.render()
  }

  get value(): Record<string, string> {
    const values: Record<string, string> = {}
    this.querySelectorAll<MathfieldElement>('math-field[data-cell-id]').forEach(
      (field) => {
        const id = field.dataset.cellId
        if (id != null) values[id] = field.value
      },
    )
    this.querySelectorAll<ListeDeroulanteElement>(
      'liste-deroulante[data-cell-id]',
    ).forEach((select) => {
      const id = select.dataset.cellId
      if (id != null) values[id] = select.value
    })
    return values
  }

  update(values: Record<string, string> | string) {
    if (typeof values === 'string') {
      try {
        const parsedValues: unknown = JSON.parse(values)
        if (
          typeof parsedValues !== 'object' ||
          parsedValues == null ||
          Array.isArray(parsedValues)
        ) {
          return
        }
        values = parsedValues as Record<string, string>
      } catch {
        return
      }
    }
    Object.entries(values).forEach(([id, value]) => {
      const field = this.querySelector<MathfieldElement>(
        `math-field[data-cell-id="${CSS.escape(id)}"]`,
      )
      if (field != null) field.value = value
      const select = this.querySelector<ListeDeroulanteElement>(
        `liste-deroulante[data-cell-id="${CSS.escape(id)}"]`,
      )
      if (select != null) select.value = value
    })
  }

  set value(values: Record<string, string> | string) {
    this.update(values)
  }

  static verifQuestion(
    exercice: IExercice,
    questionIndex: number,
  ): TableauHybrideVerificationResult {
    const tableau = document.querySelector<TableauHybrideElement>(
      `${TableauHybrideElement.elementTag}[numero-exercice="${exercice.numeroExercice}"][question-index="${questionIndex}"]`,
    )
    const reponses = exercice.autoCorrection[questionIndex]?.valeur
    if (tableau == null || reponses == null) {
      return {
        isOk: false,
        feedback: 'erreur dans le programme',
        score: { nbBonnesReponses: 0, nbReponses: 1 },
      }
    }
    const bareme = reponses.bareme ?? toutPourUnPoint
    const results: number[] = []
    if (exercice.answers == null) exercice.answers = {}
    exercice.answers[tableau.id] = JSON.stringify(tableau.value)
    Object.entries(reponses)
      .filter(([key]) => /^L\d+C\d+$/.test(key))
      .forEach(([id, expected]) => {
        const expectedValue = (expected as { value?: string | number }).value
        if (expectedValue == null) {
          results.push(0)
          tableau.setCellState(id, false)
          return
        }
        const saisie = tableau.value[id] ?? ''
        const isSelect =
          tableau
            .querySelector(`[data-cell-id="${CSS.escape(id)}"]`)
            ?.tagName.toLowerCase() === 'liste-deroulante'
        const isOk = isSelect
          ? saisie === String(expectedValue)
          : fonctionComparaison(saisie, String(expectedValue)).isOk
        results.push(isOk ? 1 : 0)
        tableau.setCellState(id, isOk)
      })
    const [nbBonnesReponses, nbReponses] = bareme(results)
    tableau.interactivityOn = false
    return {
      isOk: nbBonnesReponses === nbReponses,
      feedback: '',
      score: { nbBonnesReponses, nbReponses },
    }
  }

  static pointsMaxQuestion(exercice: IExercice, questionIndex: number): number {
    const valeur = exercice.autoCorrection?.[questionIndex]?.valeur
    return pointsMaxDuBareme(
      valeur?.bareme,
      compteChampsDeReponse(valeur, (cle) => /^L\d+C\d+$/.test(cle)),
    )
  }

  protected onInteractivityChanged(isOn: boolean): void {
    this.querySelectorAll<MathfieldElement>('math-field').forEach((field) => {
      field.readOnly = !isOn
    })
    this.querySelectorAll<ListeDeroulanteElement>('liste-deroulante').forEach(
      (select) => {
        select.interactivityOn = isOn
      },
    )
  }

  private setCellState(id: string, isOk: boolean) {
    const cell = this.querySelector<HTMLElement>(
      `[data-result-cell-id="${CSS.escape(id)}"]`,
    )
    if (cell == null) return
    cell.textContent = isOk ? '😎' : '☹️'
  }

  render() {
    this.parseData()
    this.innerHTML = ''
    const table = document.createElement('table')
    table.className = 'tableauMathlive'
    const tbody = document.createElement('tbody')
    this._data.rows.forEach((row) => {
      const tr = document.createElement('tr')
      row.forEach((cell) => {
        const td = document.createElement(
          cell.type === 'text' && cell.header ? 'th' : 'td',
        )
        if (cell.type === 'mathfield') {
          if (cell.texteAvant != null) td.append(cell.texteAvant)
          const field = new MathfieldElement()
          field.classList.add('tableauMathlive')
          field.dataset.cellId = cell.id
          field.id = `champTexte${this.id}${cell.id}`
          field.setAttribute('virtual-keyboard-mode', 'manual')
          if (cell.keyboard != null) {
            field.setAttribute(
              'data-keyboard',
              buildDataKeyboardFromStyle(cell.keyboard).join(' '),
            )
          }
          if (cell.minWidth != null) field.style.minWidth = `${cell.minWidth}px`
          field.readOnly = !this.interactivityOn
          if (field.isConnected) {
            setMathfield(field)
          } else {
            field.addEventListener('mount', setMathfieldListener, {
              once: true,
            })
          }
          td.append(field)
          if (cell.texteApres != null) {
            td.insertAdjacentHTML('beforeend', texteApresChamp(cell.texteApres))
          }
          const result = document.createElement('span')
          result.dataset.resultCellId = cell.id
          result.style.marginLeft = '0.25rem'
          td.append(result)
        } else if (cell.type === 'select') {
          td.innerHTML = ListeDeroulanteElement.create({
            id: `${this.id}${cell.id}`,
            choices: cell.choices,
            choix0: cell.choix0,
            className: 'listeDeroulante',
          })
          const select = td.querySelector(
            'liste-deroulante',
          ) as ListeDeroulanteElement | null
          if (select != null) {
            select.dataset.cellId = cell.id
            ;(select as ListeDeroulanteElement).interactivityOn =
              this.interactivityOn
          }
          const result = document.createElement('span')
          result.dataset.resultCellId = cell.id
          result.style.marginLeft = '0.25rem'
          td.append(result)
        } else {
          td.innerHTML = renderStaticCell(cell)
        }
        tr.append(td)
      })
      tbody.append(tr)
    })
    table.append(tbody)
    this.append(table)
    const feedback = document.createElement('div')
    feedback.id = `feedback${this.id}`
    this.append(feedback)
    nommeChampsAutourDe(this)
  }

  private parseData() {
    const raw = this.getAttribute('tableau')
    if (raw == null) return
    try {
      this._data = JSON.parse(raw) as TableauHybrideData
    } catch (error) {
      window.notify('tableau-hybride : données JSON invalides', {
        raw,
        error,
      })
    }
  }
}

export function creeTableauHybrideElement(
  options: TableauHybrideCreateOptions,
) {
  return TableauHybrideElement.create(options)
}

registerMathaleaCustomElement(TableauHybrideElement)
