import jspreadsheet from 'jspreadsheet-ce'
import 'jspreadsheet-ce/src/jspreadsheet.css'
import { context } from '../../modules/context'
import { randint } from '../../modules/outils'
import { toutPourUnPoint } from '../interactif/fonctionsBaremes'
import { formuleAnglaise } from '../outils/tableurFormules'
import { installFormulaPointing } from '../outils/tableurPointage'
import { installReadOnlyFeedback } from '../outils/tableurLectureSeule'
import type { GoodAnswersFormulas, IExercice, SheetTestDatas } from '../types'
import MathaleaCustomElement, {
  registerMathaleaCustomElement,
} from './MathaleaCustomElement'

type SpreadsheetStyle = Record<string, string>
type SpreadsheetData = (string | number)[][]
type SpreadsheetLatexCell = { t?: number; v?: unknown; s?: string }
type SpreadsheetLatexData =
  | Array<Record<number, SpreadsheetLatexCell>>
  | Record<number, Record<number, SpreadsheetLatexCell>>
type SpreadsheetLatexStyles = Record<string, { bg?: string }>
type SpreadsheetLatexOptions = {
  formule?: boolean
  formuleTexte?: string
  formuleCellule?: string
  firstColHeaderWidth?: string
}

export type MySpreadsheetOptions = {
  id?: string
  data?: SpreadsheetData
  minDimensions?: [number, number]
  style?: unknown
  columns?: unknown[]
  latexData?: SpreadsheetLatexData
  latexStyles?: SpreadsheetLatexStyles
  latexOptions?: SpreadsheetLatexOptions
  interactif?: boolean
  showVerifyButton?: boolean
  nbLignesCachees?: number
  nbColonnesCachees?: number
  readOnlyCells?: string[]
  barreFormule?: boolean
  arrondiAffichage?: boolean
}

export type MySpreadsheetCreateOptions = MySpreadsheetOptions & {
  numeroExercice?: number
  questionIndex?: number
}

export type AddSheetOptions = Omit<
  MySpreadsheetOptions,
  | 'id'
  | 'data'
  | 'minDimensions'
  | 'columns'
  | 'interactif'
  | 'showVerifyButton'
> & {
  id?: string
  data: (string | number)[][]
  minDimensions: [number, number]
  columns: unknown[]
  interactif: boolean
  showVerifyButton: boolean
}

export type RenderSheetMarkupOptions = {
  id?: string
  numeroExercice?: number
  questionIndex?: number
  data?: (string | number)[][]
  minDimensions?: [number, number]
  style?: unknown
  columns?: unknown[]
  latexData?: SpreadsheetLatexData
  latexStyles?: SpreadsheetLatexStyles
  latexOptions?: SpreadsheetLatexOptions
  interactif?: boolean
  showVerifyButton?: boolean
  nbLignesCachees?: number
  nbColonnesCachees?: number
  readOnlyCells?: string[]
  barreFormule?: boolean
  arrondiAffichage?: boolean
  appendFeedbackBlocks?: boolean
}

type SpreadsheetLike = {
  getValueFromCoords: (
    column: number,
    row: number,
    processed: boolean,
  ) => unknown
  setValueFromCoords: (
    column: number,
    row: number,
    value: string | number,
    force: boolean,
  ) => void
  getData: () => (string | number)[][]
  setData: (data: unknown[]) => void
  setStyle: (style: SpreadsheetStyle) => void
  setReadOnly: (cellRef: string, value: boolean) => void
  isReadOnly: (column: number, row: number) => boolean
  showRow: (rowIndex: number) => void
  hideRow: (rowIndex: number) => void
  showColumn: (colIndex: number) => void
  hideColumn: (colIndex: number) => void
  minDimensions?: [number, number]
  style?: Record<string, unknown>
  columns?: unknown[]
}
/**
 * @author Jean-Claude Lhote
 */
export class MySpreadsheetElement extends MathaleaCustomElement {
  static readonly elementTag = 'my-spreadsheet'

  static getDefaultSheetId(
    numeroExercice: number,
    questionIndex: number,
  ): string {
    return `${MySpreadsheetElement.elementTag}Ex${numeroExercice}Q${questionIndex}`
  }

  static getLegacySheetId(
    numeroExercice: number,
    questionIndex: number,
  ): string {
    return `sheet-Ex${numeroExercice}Q${questionIndex}`
  }

  static findSheetElement(
    numeroExercice: number,
    questionIndex: number,
  ): MySpreadsheetElement | null {
    const defaultId = this.getDefaultSheetId(numeroExercice, questionIndex)
    const byDefaultId = document.getElementById(
      defaultId,
    ) as MySpreadsheetElement | null
    if (byDefaultId) return byDefaultId

    const legacyId = this.getLegacySheetId(numeroExercice, questionIndex)
    return document.getElementById(legacyId) as MySpreadsheetElement | null
  }

  static formatStudentAnswer(rawAnswer: string, questionHtml?: string): string {
    const studentData = this.parse2DArray(rawAnswer)
    if (studentData == null) return rawAnswer

    const initialData = this.extractInitialDataFromQuestionHtml(questionHtml)
    const changes = this.extractChangedCells(initialData, studentData)
    if (changes.length === 0) return 'aucune'

    return changes
      .map(({ cellRef, value }) => `${cellRef}: ${this.formatCellValue(value)}`)
      .join('<br>')
  }

  private static extractInitialDataFromQuestionHtml(
    questionHtml?: string,
  ): unknown[][] {
    if (typeof questionHtml !== 'string') return []
    const tagMatch = questionHtml.match(/<my-spreadsheet\b[^>]*>/i)
    if (!tagMatch) return []
    const dataAttrMatch = tagMatch[0].match(/\sdata="([^"]*)"/i)
    if (!dataAttrMatch) return []

    const dataAttr = this.decodeHtmlEntities(dataAttrMatch[1])
    const parsed = this.parse2DArray(dataAttr)
    return parsed ?? []
  }

  private static parse2DArray(rawValue: string): unknown[][] | null {
    try {
      const parsed: unknown = JSON.parse(rawValue)
      if (!Array.isArray(parsed)) return null
      return parsed.map((row) => (Array.isArray(row) ? row : []))
    } catch {
      return null
    }
  }

  private static extractChangedCells(
    initialData: unknown[][],
    studentData: unknown[][],
  ): Array<{ cellRef: string; value: unknown }> {
    const maxRows = Math.max(initialData.length, studentData.length)
    const changes: Array<{ cellRef: string; value: unknown }> = []

    for (let row = 0; row < maxRows; row++) {
      const initialRow = initialData[row] ?? []
      const studentRow = studentData[row] ?? []
      const maxCols = Math.max(initialRow.length, studentRow.length)
      for (let col = 0; col < maxCols; col++) {
        const initialValue = initialRow[col]
        const studentValue = studentRow[col]
        const normalizedInitial = this.normalizeCellValue(initialValue)
        const normalizedStudent = this.normalizeCellValue(studentValue)

        // Dans CAN, on veut surtout lister ce que l'élève a effectivement saisi.
        if (normalizedStudent === '') continue
        if (normalizedStudent === normalizedInitial) continue

        changes.push({
          cellRef: `${this.columnIndexToLetters(col)}${row + 1}`,
          value: studentValue,
        })
      }
    }

    return changes
  }

  private static normalizeCellValue(value: unknown): string {
    if (value == null) return ''
    return String(value).trim()
  }

  private static formatCellValue(value: unknown): string {
    if (typeof value === 'number') return `${value}`
    return JSON.stringify(String(value ?? ''))
  }

  private static columnIndexToLetters(index: number): string {
    let n = index + 1
    let letters = ''
    while (n > 0) {
      const rem = (n - 1) % 26
      letters = String.fromCharCode(65 + rem) + letters
      n = Math.floor((n - 1) / 26)
    }
    return letters
  }

  private static decodeHtmlEntities(value: string): string {
    return value
      .replaceAll('&quot;', '"')
      .replaceAll('&amp;', '&')
      .replaceAll('&lt;', '<')
      .replaceAll('&gt;', '>')
  }

  private static toCellRef(colIndex: number, rowIndex: number): string {
    return `${this.columnIndexToLetters(colIndex)}${rowIndex + 1}`
  }

  static create({
    id,
    numeroExercice,
    questionIndex,
    data = [],
    minDimensions = [5, 5],
    style,
    columns = [],
    latexData,
    latexStyles,
    latexOptions,
    interactif = false,
    showVerifyButton,
    nbLignesCachees,
    nbColonnesCachees,
    readOnlyCells,
    barreFormule,
    arrondiAffichage,
  }: MySpreadsheetCreateOptions = {}): string {
    const computedId =
      id ??
      `${MySpreadsheetElement.elementTag}Ex${numeroExercice ?? 0}Q${questionIndex ?? 0}`
    return super.create({
      id: computedId,
      data,
      minDimensions,
      style,
      columns,
      latexData,
      latexStyles,
      latexOptions,
      interactif,
      showVerifyButton,
      nbLignesCachees,
      nbColonnesCachees,
      readOnlyCells:
        readOnlyCells && readOnlyCells.length > 0 ? readOnlyCells : undefined,
      barreFormule,
      arrondiAffichage,
    })
  }

  /**
   * Compare deux valeurs de cellules en tolérant les écarts d'arrondi des
   * nombres à virgule flottante (`37*(1+13/100)` et `37*113/100`).
   */
  private static memesValeurs(a: unknown, b: unknown): boolean {
    if (a === b) return true
    const x = typeof a === 'string' && a.trim() !== '' ? Number(a) : a
    const y = typeof b === 'string' && b.trim() !== '' ? Number(b) : b
    if (typeof x !== 'number' || typeof y !== 'number') return false
    if (Number.isNaN(x) || Number.isNaN(y)) return false
    return Math.abs(x - y) <= 1e-9 * Math.max(1, Math.abs(x), Math.abs(y))
  }

  static compareSheetFunction(
    exercice: IExercice,
    question: number,
    goodAnswers: GoodAnswersFormulas,
    sheetTestDatas: SheetTestDatas,
    userSheet: MySpreadsheetElement,
  ): { isOk: boolean; messages: string } {
    const userData = userSheet.getData()
    const messages: string[] = []
    let testFormulas = true
    let goodFormulas = 0

    goodAnswers.forEach((cellData) => {
      const cellRef = cellData.ref
      const col = cellRef.charCodeAt(0) - 65
      const row = parseInt(cellRef.slice(1)) - 1
      if (cellData.formula && cellData.value === undefined) {
        const userFormula = userSheet.getCellFormula(col, row)
        if (!userFormula.startsWith('=')) {
          messages.push(
            `La cellule ${cellRef} devrait contenir une formule mais elle ne contient pas de formule.<br>`,
          )
          testFormulas = false
          const style: Record<string, string> = {}
          style[cellRef] =
            'background-color: #ffcccc; border: 2px solid #ff0000; border-radius: 8px; padding: 4px;'
          userSheet.setCellStyle(style)
          return
        }
        if (
          String(userFormula).toUpperCase() === cellData.formula.toUpperCase()
        ) {
          const style: Record<string, string> = {}
          style[cellRef] =
            'background-color: #ccffcc; border: 2px solid #008000; border-radius: 8px; padding: 4px;'
          userSheet.setCellStyle(style)
          goodFormulas++
        }
      } else if (cellData.value !== undefined) {
        const userValue = userSheet.getCellValue(col, row)
        if (MySpreadsheetElement.memesValeurs(userValue, cellData.value)) {
          const style: Record<string, string> = {}
          style[cellRef] =
            'background-color: #ccffcc; border: 2px solid #008000; border-radius: 8px; padding: 4px;'
          userSheet.setCellStyle(style)
          goodFormulas++
        }
      } else {
        window.notify(
          `compareSheetFunction: cellData invalide ${JSON.stringify(
            cellData,
          )} pour la question ${question} de l'exercice ${exercice.id}`,
          { exercice, question, cellData },
        )
      }
    })

    if (testFormulas && goodFormulas === goodAnswers.length) {
      return {
        isOk: true,
        messages:
          goodAnswers.length === 1
            ? '✅ La saisie est correcte !'
            : '✅ Toutes les saisies sont correctes !',
      }
    }

    let maxMessages = ''

    const testSheetForGoodAnswers = MySpreadsheetElement.createEltToAppendToDom(
      {
        data: userData,
        minDimensions: userSheet.getMinDimensions(),
        style: userSheet.getStyle(),
        columns: userSheet.getColumns(),
        interactif: false,
        id: 'testSheet',
      },
    )

    const testSheetForUserResponses =
      MySpreadsheetElement.createEltToAppendToDom({
        data: userData,
        minDimensions: userSheet.getMinDimensions(),
        style: userSheet.getStyle(),
        columns: userSheet.getColumns(),
        interactif: false,
        id: 'testSheetUser',
      })

    testSheetForGoodAnswers.style.position = 'absolute'
    testSheetForGoodAnswers.style.left = '-9999px'
    document.body.appendChild(testSheetForGoodAnswers)

    goodAnswers.forEach((cellData) => {
      const cellRef = cellData.ref
      const col = cellRef.charCodeAt(0) - 65
      const row = parseInt(cellRef.slice(1)) - 1
      if (cellData.formula) {
        testSheetForGoodAnswers.setCellFormula(col, row, cellData.formula)
      } else if (cellData.value !== undefined) {
        testSheetForGoodAnswers.setCellValue(col, row, cellData.value)
      }
    })

    testSheetForUserResponses.style.position = 'absolute'
    testSheetForUserResponses.style.left = '-5999px'
    document.body.appendChild(testSheetForUserResponses)

    const messagesPerTest: string[][] = []
    goodAnswers.forEach(() => {
      messagesPerTest.push([])
    })

    goodAnswers.forEach((cellData, answerIndex) => {
      const cellRef = cellData.ref
      const col = cellRef.charCodeAt(0) - 65
      const row = parseInt(cellRef.slice(1)) - 1

      sheetTestDatas.forEach((testData) => {
        const testCellRef = testData.ref
        if (testCellRef.includes(':')) {
          const [startRef, endRef] = testCellRef.split(':')
          const startCol = startRef.charCodeAt(0) - 65
          const startRow = parseInt(startRef.slice(1)) - 1
          const endCol = endRef.charCodeAt(0) - 65
          const endRow = parseInt(endRef.slice(1)) - 1
          for (let r = startRow; r <= endRow; r++) {
            for (let c = startCol; c <= endCol; c++) {
              const [min, max] = testData.rangeValues
              const randomValue = randint(min, max)
              testSheetForGoodAnswers.setCellValue(c, r, randomValue)
              testSheetForUserResponses.setCellValue(c, r, randomValue)
            }
          }
          const goodAnswerValue = testSheetForGoodAnswers.getCellValue(col, row)
          const userAnswerValue = testSheetForUserResponses.getCellValue(
            col,
            row,
          )
          if (
            !MySpreadsheetElement.memesValeurs(goodAnswerValue, userAnswerValue)
          ) {
            const style: Record<string, string> = {}
            style[cellRef] =
              'background-color: #ffcccc; border: 2px solid #ff0000; border-radius: 8px; padding: 4px;'
            userSheet.setCellStyle(style)
            messagesPerTest[answerIndex].push(
              `La saisie de la cellule ${cellRef} [${userSheet.getCellFormula(col, row)}] est incorrecte .<br>`,
            )
          }
        } else {
          const testCol = testCellRef.charCodeAt(0) - 65
          const testRow = parseInt(testCellRef.slice(1)) - 1
          const [min, max] = testData.rangeValues
          const randomValue = randint(min, max)
          testSheetForGoodAnswers.setCellValue(testCol, testRow, randomValue)
          testSheetForUserResponses.setCellValue(testCol, testRow, randomValue)
          const goodAnswerValue = testSheetForGoodAnswers.getCellValue(col, row)
          const userAnswerValue = testSheetForUserResponses.getCellValue(
            col,
            row,
          )
          if (
            !MySpreadsheetElement.memesValeurs(goodAnswerValue, userAnswerValue)
          ) {
            const style: Record<string, string> = {}
            style[cellRef] =
              'background-color: #ffcccc; border: 2px solid #ff0000; border-radius: 8px; padding: 4px;'
            userSheet.setCellStyle(style)
            messagesPerTest[answerIndex].push(
              `La saisie de la cellule ${cellRef} [${userSheet.getCellFormula(col, row)}] est incorrecte .<br>`,
            )
          }
        }
      })
    })

    messages.push(...messagesPerTest.flat())
    maxMessages = messages.sort((a, b) => b.length - a.length)[0] ?? ''

    document.body.removeChild(testSheetForGoodAnswers)
    document.body.removeChild(testSheetForUserResponses)

    const feedback =
      maxMessages.length === 0
        ? '✅ Toutes les saisies sont correctes !'
        : '❌ Des erreurs ont été détectées.'

    return {
      isOk: maxMessages.length === 0,
      messages: maxMessages + feedback,
    }
  }

  static verifQuestion(
    exercice: IExercice,
    questionIndex: number,
  ): {
    isOk: boolean
    feedback: string
    score: { nbBonnesReponses: number; nbReponses: number }
  } {
    if (exercice.autoCorrection[questionIndex]?.valeur == null) {
      throw Error(
        `verifQuestionMathlive appelé sur une question sans réponse: ${JSON.stringify(
          {
            exercice,
            question: questionIndex,
            autoCorrection: exercice.autoCorrection[questionIndex],
          },
        )}`,
      )
    }

    if (exercice.answers === undefined) exercice.answers = {}
    const reponses = exercice.autoCorrection[questionIndex].valeur
    if (reponses == null) {
      window.notify(
        `verifQuestionTableur: reponses est null pour la question ${questionIndex} de l'exercice ${exercice.id}`,
        { exercice, questionIndex },
      )
      return {
        isOk: false,
        feedback: 'erreur dans le programme',
        score: { nbBonnesReponses: 0, nbReponses: 1 },
      }
    }
    const bareme: (arg: number[]) => [number, number] =
      reponses.bareme ?? toutPourUnPoint
    const sheetAnswer = reponses.sheetAnswer
    if (sheetAnswer == null) {
      window.notify(
        `verifQuestionTableur: sheetAnswer est null pour la question ${questionIndex} de l'exercice ${exercice.id}`,
        { exercice, questionIndex },
      )
      return {
        isOk: false,
        feedback: 'erreur dans le programme',
        score: { nbBonnesReponses: 0, nbReponses: 1 },
      }
    }

    const numeroExercice = exercice.numeroExercice ?? 0
    let result: string[] = []
    const goodAnswersFormulas = sheetAnswer.goodAnswerFormulas
    const sheetTestDatas = sheetAnswer.sheetTestDatas

    const sheetElement = this.findSheetElement(numeroExercice, questionIndex)
    sheetElement!.interactivityOn = false
    if (!sheetElement) {
      console.error(
        `${this.getDefaultSheetId(numeroExercice, questionIndex)} not found`,
      )
      result = goodAnswersFormulas.map(() => 'KO')
      return {
        isOk: false,
        feedback: 'erreur dans le programme',
        score: { nbBonnesReponses: 0, nbReponses: result.length },
      }
    }

    if (sheetElement.isMounted()) {
      exercice.answers[this.getDefaultSheetId(numeroExercice, questionIndex)] =
        JSON.stringify(sheetElement.getData())
      const spanResultat = document.querySelector(
        `#resultatCheckEx${numeroExercice}Q${questionIndex}`,
      )
      const divFeedback = document.querySelector<HTMLElement>(
        `#feedbackEx${numeroExercice}Q${questionIndex}`,
      )
      const { isOk, messages } = this.compareSheetFunction(
        exercice,
        questionIndex,
        goodAnswersFormulas,
        sheetTestDatas,
        sheetElement,
      )
      if (messages.length > 0 && spanResultat && divFeedback) {
        divFeedback.innerHTML = messages
        if (!isOk) {
          spanResultat.innerHTML = '☹️'
          result = goodAnswersFormulas.map(() => 'KO')
        } else {
          spanResultat.innerHTML = '😎'
          result = goodAnswersFormulas.map(() => 'OK')
        }
      }
    } else {
      console.error(
        `${this.getDefaultSheetId(numeroExercice, questionIndex)} is not mounted`,
      )
      result = goodAnswersFormulas.map(() => 'KO')
    }

    const [nbBonnesReponses, nbReponses] = bareme(
      result.map((res) => (res === 'OK' ? 1 : 0)),
    )
    return {
      isOk: nbBonnesReponses === nbReponses,
      feedback: '',
      score: { nbBonnesReponses, nbReponses },
    }
  }

  private _spreadsheet: SpreadsheetLike | null = null
  private _cleanupFormulaPointing: (() => void) | null = null
  private _cleanupReadOnlyFeedback: (() => void) | null = null
  private _buttonListener?: EventListener
  private _customListeners: { [eventName: string]: EventListener } = {}
  private showVerifyButton: boolean = true
  private _readOnlyCursorObserver: MutationObserver | null = null
  private _barreFormuleObserver: ResizeObserver | null = null

  private normalizeData(value: unknown): SpreadsheetData {
    if (!Array.isArray(value)) return []
    return value.map((row) => {
      if (!Array.isArray(row)) return []
      return row.map((cell) => {
        if (typeof cell === 'string' || typeof cell === 'number') return cell
        return cell == null ? '' : String(cell)
      })
    })
  }

  private parseDataValue(value: unknown): SpreadsheetData {
    if (typeof value === 'string') {
      try {
        return this.normalizeData(JSON.parse(value))
      } catch {
        return []
      }
    }
    return this.normalizeData(value)
  }

  private applyReadOnlyCursor(container: HTMLElement) {
    const applyCursor = () => {
      const cells = container.querySelectorAll('td')
      cells.forEach((cell) => {
        ;(cell as HTMLElement).style.cursor = 'not-allowed'
      })
    }

    applyCursor()
    this._readOnlyCursorObserver?.disconnect()
    this._readOnlyCursorObserver = new MutationObserver(() => {
      applyCursor()
    })
    this._readOnlyCursorObserver.observe(container, {
      childList: true,
      subtree: true,
    })
  }

  private get spreadsheet(): SpreadsheetLike {
    if (this._spreadsheet == null) {
      throw new Error('Spreadsheet is not mounted yet.')
    }
    return this._spreadsheet
  }

  constructor() {
    super()
    this._spreadsheet = null
  }

  /**
   * Ajoute un listener sur l'élément et le mémorise pour suppression ultérieure
   */
  public addListener(eventName: string, callback: EventListener) {
    this.addEventListener(eventName, callback)
    this._customListeners[eventName] = callback
  }

  /**
   * Méthode statique pour créer et configurer un MySpreadsheetElement
   */
  static createEltToAppendToDom({
    id,
    data = [],
    minDimensions = [5, 5],
    style = {},
    columns = [],
    interactif = false,
    showVerifyButton = true,
    readOnlyCells = [],
    barreFormule = false,
    arrondiAffichage = false,
  }: {
    id?: string
    data?: (string | number)[][]
    minDimensions?: [number, number]
    style?: Record<string, unknown>
    columns?: unknown[]
    interactif?: boolean
    showVerifyButton?: boolean
    readOnlyCells?: string[]
    barreFormule?: boolean
    arrondiAffichage?: boolean
  } = {}) {
    const elt = document.createElement(
      MySpreadsheetElement.elementTag,
    ) as MySpreadsheetElement
    if (id) elt.id = id
    elt.setAttribute('data', JSON.stringify(data))
    elt.setAttribute('min-dimensions', JSON.stringify(minDimensions))
    elt.setAttribute('style', JSON.stringify(style))
    elt.setAttribute('columns', JSON.stringify(columns))
    elt.setAttribute('interactif', interactif ? 'true' : 'false')
    if (readOnlyCells.length > 0) {
      elt.setAttribute('readonly-cells', JSON.stringify(readOnlyCells))
    }
    if (barreFormule) {
      elt.setAttribute('barre-formule', 'true')
    }
    if (arrondiAffichage) {
      elt.setAttribute('arrondi-affichage', 'true')
    }
    if (showVerifyButton !== undefined) {
      elt.setAttribute(
        'show-verify-button',
        showVerifyButton ? 'true' : 'false',
      )
    }
    return elt
  }

  connectedCallback() {
    this.hydrateCommonAttributes()
    this.innerHTML = '<div></div>'
    const container = (this.firstElementChild ??
      document.createElement('div')) as HTMLDivElement
    const barreFormule = this.getAttribute('barre-formule') === 'true'
    const arrondiAffichage = this.getAttribute('arrondi-affichage') === 'true'

    let data: (number | string)[][] = []
    let minDimensions: [number, number] = [5, 5]
    let style: Record<string, unknown> = {}
    let columns: unknown[] = []
    let nbLignesCachees = 0
    let nbColonnesCachees = 0
    let readOnlyCells: string[] = []
    const shouldBeReadOnly = !this.interactivityOn
    try {
      if (this.getAttribute('data'))
        data = JSON.parse(this.getAttribute('data') ?? '') as (
          string | number
        )[][]
    } catch {
      // Attribut data invalide, on conserve la valeur par défaut.
    }
    try {
      if (this.getAttribute('min-dimensions')) {
        const parsed = JSON.parse(this.getAttribute('min-dimensions') ?? '')
        if (Array.isArray(parsed) && parsed.length >= 2) {
          minDimensions = [Number(parsed[0]), Number(parsed[1])]
        }
      }
    } catch {
      // Attribut min-dimensions invalide, on conserve la valeur par défaut.
    }
    try {
      if (this.getAttribute('style'))
        style = JSON.parse(this.getAttribute('style') ?? '')
    } catch {
      // Attribut style invalide, on conserve la valeur par défaut.
    }
    try {
      if (this.getAttribute('columns'))
        columns = JSON.parse(this.getAttribute('columns') ?? '[]')
    } catch {
      // Attribut columns invalide, on conserve la valeur par défaut.
    }
    try {
      if (this.getAttribute('nb-lignes-cachees'))
        nbLignesCachees = Number(this.getAttribute('nb-lignes-cachees') ?? '0')
    } catch {
      // Attribut nb-lignes-cachees invalide, on conserve la valeur par défaut.
    }
    try {
      if (this.getAttribute('nb-colonnes-cachees'))
        nbColonnesCachees = Number(
          this.getAttribute('nb-colonnes-cachees') ?? '0',
        )
    } catch {
      // Attribut nb-colonnes-cachees invalide, on conserve la valeur par défaut.
    }
    try {
      if (this.getAttribute('readonly-cells'))
        readOnlyCells = JSON.parse(this.getAttribute('readonly-cells') ?? '[]')
    } catch {
      // Attribut readonly-cells invalide, on conserve la valeur par défaut.
    }
    const expandReadOnlyCells = (cells: string[]) => {
      const toIndex = (letters: string) => {
        let index = 0
        for (const char of letters.toUpperCase()) {
          index = index * 26 + (char.charCodeAt(0) - 64)
        }
        return index - 1
      }
      const toLetters = (index: number) => {
        let n = index + 1
        let letters = ''
        while (n > 0) {
          const rem = (n - 1) % 26
          letters = String.fromCharCode(65 + rem) + letters
          n = Math.floor((n - 1) / 26)
        }
        return letters
      }
      const parseRef = (ref: string) => {
        const match = ref.toUpperCase().match(/^([A-Z]+)(\d+)$/)
        if (!match) return null
        return { col: toIndex(match[1]), row: Number(match[2]) - 1 }
      }
      const expanded: string[] = []
      cells.forEach((cellRef) => {
        const trimmed = cellRef.trim()
        if (!trimmed) return
        if (!trimmed.includes(':')) {
          const parsed = parseRef(trimmed)
          if (parsed) expanded.push(trimmed.toUpperCase())
          return
        }
        const [startRef, endRef] = trimmed.split(':')
        const start = parseRef(startRef)
        const end = parseRef(endRef)
        if (!start || !end) return
        const colStart = Math.min(start.col, end.col)
        const colEnd = Math.max(start.col, end.col)
        const rowStart = Math.min(start.row, end.row)
        const rowEnd = Math.max(start.row, end.row)
        for (let row = rowStart; row <= rowEnd; row++) {
          for (let col = colStart; col <= colEnd; col++) {
            expanded.push(`${toLetters(col)}${row + 1}`)
          }
        }
      })
      return expanded
    }
    // Barre de formule (comme dans Excel) : cellule sélectionnée + contenu brut
    let selectedCell: { col: number; row: number } | null = null
    let nameBox: HTMLInputElement | null = null
    let formulaInput: HTMLInputElement | null = null
    let boutons: (HTMLButtonElement | null)[] = []
    let validePourSelection: () => void = () => {}
    const activeBouton = (b: HTMLButtonElement, actif: boolean) => {
      b.disabled = !actif
      b.style.opacity = actif ? '1' : '0.4'
      b.style.cursor = actif ? 'pointer' : 'not-allowed'
    }
    const refreshFormulaBar = () => {
      if (!nameBox || !formulaInput) return
      if (selectedCell == null || this._spreadsheet == null) {
        nameBox.value = ''
        formulaInput.value = ''
        formulaInput.readOnly = true
        boutons.forEach((b) => b && activeBouton(b, false))
        return
      }
      const { col, row } = selectedCell
      nameBox.value = MySpreadsheetElement.toCellRef(col, row)
      const raw = this._spreadsheet.getValueFromCoords(col, row, false)
      formulaInput.value = raw == null ? '' : String(raw)
      formulaInput.readOnly =
        shouldBeReadOnly || this._spreadsheet.isReadOnly(col, row)
      boutons.forEach((b) => b && activeBouton(b, !formulaInput!.readOnly))
    }
    if (barreFormule) {
      this.insertBefore(this.createFormulaBar(), container)
      nameBox = this.querySelector<HTMLInputElement>('.barre-formule-nom')
      formulaInput = this.querySelector<HTMLInputElement>(
        '.barre-formule-saisie',
      )
      const boutonValider = this.querySelector<HTMLButtonElement>(
        '.barre-formule-valider',
      )
      const boutonAnnuler = this.querySelector<HTMLButtonElement>(
        '.barre-formule-annuler',
      )
      // Reporte la saisie de la barre dans la cellule sélectionnée
      const valideSaisie = () => {
        if (selectedCell == null || formulaInput == null) return
        if (shouldBeReadOnly || this._spreadsheet == null) return
        const { col, row } = selectedCell
        if (this._spreadsheet.isReadOnly(col, row)) return
        const actuel = this._spreadsheet.getValueFromCoords(col, row, false)
        const saisie = formulaInput.value.trim()
        if (saisie === (actuel == null ? '' : String(actuel))) return
        this._spreadsheet.setValueFromCoords(col, row, saisie, true)
      }
      validePourSelection = valideSaisie
      const annuleSaisie = () => refreshFormulaBar()
      const termineSaisie = () => {
        valideSaisie()
        formulaInput?.blur()
      }
      const termineAnnulation = () => {
        annuleSaisie()
        formulaInput?.blur()
      }
      if (formulaInput) {
        this._cleanupFormulaPointing?.()
        this._cleanupFormulaPointing = installFormulaPointing(
          container,
          formulaInput,
        )
      }
      formulaInput?.addEventListener('blur', valideSaisie)
      // Les touches tapées dans la barre ne doivent pas atteindre les
      // gestionnaires clavier de jspreadsheet (Entrée, flèches, Suppr…)
      ;['keydown', 'keyup', 'keypress'].forEach((type) => {
        formulaInput?.addEventListener(type, (e) => e.stopPropagation())
      })
      formulaInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          e.preventDefault()
          termineAnnulation()
        } else if (e.key === 'Enter' && !e.isComposing) {
          e.preventDefault()
          termineSaisie()
        }
      })
      // mousedown : garde le focus dans le champ et la saisie intacte avant la validation
      boutonValider?.addEventListener('mousedown', (e) => e.preventDefault())
      boutonValider?.addEventListener('click', termineSaisie)
      boutonAnnuler?.addEventListener('mousedown', (e) => e.preventDefault())
      boutonAnnuler?.addEventListener('click', termineAnnulation)
      boutons = [boutonValider, boutonAnnuler]
      refreshFormulaBar()
    }
    // Masque les écarts d'arrondi (0.1+0.2) et les décimales infinies des formules
    const arrondiLesFormules = () => {
      if (!arrondiAffichage || this._spreadsheet == null) return
      container.querySelectorAll<HTMLElement>('td[data-x]').forEach((td) => {
        const col = Number(td.dataset.x)
        const row = Number(td.dataset.y)
        const brut = this._spreadsheet?.getValueFromCoords(col, row, false)
        if (typeof brut !== 'string' || !brut.startsWith('=')) return
        const calculee = String(
          this._spreadsheet?.getValueFromCoords(col, row, true) ?? '',
        )
        const nombre = Number(calculee)
        if (calculee === 'NaN') {
          td.textContent = '#VALUE!'
        } else if (calculee.trim() !== '' && Number.isFinite(nombre)) {
          td.textContent = String(Math.round(nombre * 1e9) / 1e9)
        }
      })
    }
    this._spreadsheet = jspreadsheet(container, {
      tabs: false,
      toolbar: false,
      // Accepte les noms français des fonctions (=RACINE(A1), =somme(A1;B1))
      onbeforeformula: (_worksheet, expression) => {
        const traduite = formuleAnglaise(expression)
        return traduite === expression ? undefined : traduite
      },
      onselection: (_worksheet, col, row) => {
        // une saisie en cours dans la barre est validée avant de changer de cellule
        validePourSelection()
        selectedCell = { col, row }
        refreshFormulaBar()
      },
      onload: () => {
        arrondiLesFormules()
      },
      onafterchanges: () => {
        refreshFormulaBar()
        arrondiLesFormules()
      },
      worksheets: [
        {
          data,
          minDimensions,
          tableOverflow: true,
          tableHeight: '300px',
          style: style as Record<string, string>,
          columns: columns as never,
        },
      ],
    })[0] as unknown as SpreadsheetLike
    const spreadsheet = this.spreadsheet
    arrondiLesFormules()
    // La barre de formule ne dépasse pas la largeur du tableau
    const barre = this.querySelector<HTMLElement>('.barre-formule')
    const contenuTableau = container.querySelector<HTMLElement>('.jss_content')
    if (barre && contenuTableau) {
      const ajusteLargeur = () => {
        barre.style.width = `${contenuTableau.offsetWidth}px`
        barre.style.maxWidth = '100%'
      }
      ajusteLargeur()
      this._barreFormuleObserver?.disconnect()
      this._barreFormuleObserver = new ResizeObserver(ajusteLargeur)
      this._barreFormuleObserver.observe(contenuTableau)
    }
    container.addEventListener('contextmenu', (e) => {
      e.preventDefault()
      e.stopPropagation()
    })
    if (readOnlyCells.length > 0) {
      expandReadOnlyCells(readOnlyCells).forEach((cellRef) => {
        spreadsheet.setReadOnly(cellRef, true)
      })
    }
    if (shouldBeReadOnly) {
      const colCount = Math.max(
        minDimensions[0] ?? 0,
        ...data.map((row) => row.length),
      )
      const rowCount = Math.max(minDimensions[1] ?? 0, data.length)
      for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
        for (let colIndex = 0; colIndex < colCount; colIndex++) {
          spreadsheet.setReadOnly(
            MySpreadsheetElement.toCellRef(colIndex, rowIndex),
            true,
          )
        }
      }

      this.applyReadOnlyCursor(container)
    }
    for (let i = 0; i < nbLignesCachees; i++) {
      this.hideRow(i)
    }
    for (let j = 0; j < nbColonnesCachees; j++) {
      this.hideColumn(j)
    }
    let numeroExercice = 0
    let question = 0
    const idMatch = this.id.match(/(?:sheet-|my-spreadsheet)Ex(\d+)Q(\d+)$/)
    if (idMatch) {
      numeroExercice = Number(idMatch[1])
      question = Number(idMatch[2])
    }

    const feedBackElt = document.createElement('div')
    feedBackElt.id = 'message-faux'
    container.appendChild(feedBackElt)
    const resultCheck = document.createElement('span')
    resultCheck.id = `resultatCheckEx${numeroExercice}Q${question}`
    // espace vertical entre le tableau, le smiley et le texte de feedback
    resultCheck.className = 'resultat-check-tableur'
    resultCheck.style.cssText = 'margin:0.5rem 0;'
    if (!document.getElementById('style-resultat-check-tableur')) {
      const style = document.createElement('style')
      style.id = 'style-resultat-check-tableur'
      // pas d'espace tant que le smiley et le feedback ne sont pas affichés
      style.textContent =
        '.resultat-check-tableur{display:block}.resultat-check-tableur:empty,.feedback-tableur:empty{display:none}'
      document.head.appendChild(style)
    }
    container.appendChild(resultCheck)
    const divFeedback = document.createElement('div')
    divFeedback.id = `feedbackEx${numeroExercice}Q${question}`
    divFeedback.className =
      'feedback-tableur italic text-coopmaths-warn-darkest dark:text-coopmathsdark-warn-darkest'
    divFeedback.style.cssText = 'padding-bottom:0.5rem;'
    container.appendChild(divFeedback)

    if (this.getAttribute('show-verify-button') === 'false') {
      this.showVerifyButton = false
    }
    const bouton = document.createElement('button')
    bouton.id = 'runCode'
    bouton.textContent = 'Vérifier'
    bouton.style.boxSizing = 'border-box'
    bouton.style.position = 'relative'
    bouton.style.zIndex = '10'
    bouton.style.marginTop = '10px'
    // Styles personnalisés
    bouton.style.backgroundColor = '#2b6cb0' // Bleu coopmaths
    bouton.style.color = 'white' // Texte blanc
    bouton.style.border = 'none' // Pas de bordure
    bouton.style.borderRadius = '6px' // Bords arrondis
    bouton.style.padding = '8px 20px' // Espacement interne
    bouton.style.fontSize = '1rem' // Taille du texte
    bouton.style.fontWeight = 'bold' // Texte en gras
    bouton.style.cursor = 'pointer' // Curseur main au survol
    bouton.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)' // Ombre légère

    // Effet au survol
    bouton.onmouseover = () => {
      bouton.style.backgroundColor = '#174ea6'
    }
    bouton.onmouseout = () => {
      bouton.style.backgroundColor = '#2b6cb0'
    }
    bouton.style.display =
      this.getAttribute('interactif') === 'true' ||
      this.showVerifyButton === false ||
      shouldBeReadOnly
        ? 'none'
        : 'block'
    container.appendChild(bouton)
    if (idMatch) {
      const numeroExercice = Number(idMatch[1])
      const question = Number(idMatch[2])
      if (this.showVerifyButton) {
        this._setupButton(bouton, numeroExercice, question)
      }
    }
    arrondiLesFormules()
    const fullyReadOnly =
      shouldBeReadOnly ||
      (data.every((row, y) =>
        row.every((_, x) => spreadsheet.isReadOnly(x, y)),
      ) &&
        Array.from({ length: minDimensions[1] }, (_, y) =>
          Array.from({ length: minDimensions[0] }, (_, x) =>
            spreadsheet.isReadOnly(x, y),
          ).every(Boolean),
        ).every(Boolean))
    this._cleanupReadOnlyFeedback?.()
    this._cleanupReadOnlyFeedback = installReadOnlyFeedback(
      this,
      fullyReadOnly,
      () => selectedCell,
      (col, row) => spreadsheet.isReadOnly(col, row),
    )
    this.dispatchEvent(new CustomEvent('spreadsheet-ready'))
  }

  private createFormulaBar(): HTMLDivElement {
    const bar = document.createElement('div')
    bar.className = 'barre-formule'
    bar.style.cssText =
      'display:flex;align-items:center;gap:6px;margin-bottom:4px;font-size:0.95rem;'
    const nameBox = document.createElement('input')
    nameBox.type = 'text'
    nameBox.className = 'barre-formule-nom'
    nameBox.readOnly = true
    nameBox.setAttribute('aria-label', 'Cellule sélectionnée')
    nameBox.style.cssText =
      'width:4.5em;text-align:center;border:1px solid #9ca3af;border-radius:4px;padding:3px 6px;background:#f3f4f6;color:#111827;'
    const fx = document.createElement('span')
    fx.textContent = 'fx'
    fx.setAttribute('aria-hidden', 'true')
    fx.style.cssText = 'font-style:italic;font-weight:bold;color:#4b5563;'
    const formulaInput = document.createElement('input')
    formulaInput.type = 'text'
    formulaInput.className = 'barre-formule-saisie'
    formulaInput.setAttribute(
      'aria-label',
      'Formule de la cellule sélectionnée',
    )
    formulaInput.autocomplete = 'off'
    formulaInput.spellcheck = false
    formulaInput.style.cssText =
      'flex:1;min-width:0;border:1px solid #9ca3af;border-radius:4px;padding:3px 6px;font-family:monospace;background:#ffffff;color:#111827;'
    const bouton = (
      classe: string,
      texte: string,
      titre: string,
      couleur: string,
    ) => {
      const b = document.createElement('button')
      b.type = 'button'
      b.className = classe
      b.textContent = texte
      b.title = titre
      b.setAttribute('aria-label', titre)
      b.disabled = true
      b.style.cssText = `width:1.9em;height:1.9em;border:1px solid #9ca3af;border-radius:4px;background:#ffffff;color:${couleur};font-weight:bold;line-height:1;cursor:pointer;`
      return b
    }
    bar.append(
      nameBox,
      bouton(
        'barre-formule-annuler',
        '✗',
        'Annuler la modification',
        '#b91c1c',
      ),
      bouton('barre-formule-valider', '✓', 'Valider la formule', '#15803d'),
      fx,
      formulaInput,
    )
    return bar
  }

  disconnectedCallback() {
    this._cleanupReadOnlyFeedback?.()
    this._cleanupReadOnlyFeedback = null
    this._cleanupFormulaPointing?.()
    this._cleanupFormulaPointing = null
    this._readOnlyCursorObserver?.disconnect()
    this._readOnlyCursorObserver = null
    this._barreFormuleObserver?.disconnect()
    this._barreFormuleObserver = null

    if (this._spreadsheet) {
      this._spreadsheet = null
    }
    // Retire le listener personnalisé
    const bouton = this.querySelector('#runCode')
    if (bouton && this._buttonListener) {
      bouton.removeEventListener('click', this._buttonListener)
    }
    // Retire tous les listeners ajoutés via addListener
    Object.entries(this._customListeners).forEach(([eventName, callback]) => {
      this.removeEventListener(eventName, callback)
    })
    this._customListeners = {}
  }

  _setupButton(
    bouton: HTMLButtonElement,
    numeroExercice: number,
    question: number,
  ) {
    const eventName = `checkEx${numeroExercice}Q${question}`
    this._buttonListener = () => {
      this.dispatchEvent(
        new CustomEvent(eventName, { detail: { sheet: this } }),
      )
    }
    bouton.addEventListener('click', this._buttonListener)
  }

  getCellValue(column: number, row: number) {
    return this.spreadsheet.getValueFromCoords(column, row, true)
  }

  getCellFormula(column: number, row: number) {
    return String(
      this.spreadsheet.getValueFromCoords(column, row, false),
    ).toUpperCase()
  }

  getData() {
    // Retourne les données de la première worksheet
    return this.spreadsheet.getData() ?? []
  }

  public get value(): SpreadsheetData {
    if (this.isMounted()) {
      return this.normalizeData(this.getData())
    }

    const dataAttr = this.getAttribute('data')
    if (dataAttr == null) return []
    return this.parseDataValue(dataAttr)
  }

  public update(nextValue: unknown) {
    const parsed = this.parseDataValue(nextValue)

    if (this.isMounted()) {
      this.setData(parsed)
    } else {
      this.setAttribute('data', JSON.stringify(parsed))
    }
  }

  public set value(nextValue: unknown) {
    this.update(nextValue)
  }

  public getValue(): SpreadsheetData {
    return this.value
  }

  setCellValue(column: number, row: number, value: string | number) {
    this.spreadsheet.setValueFromCoords(column, row, value, true)
  }

  setCellFormula(column: number, row: number, formula: string) {
    if (!formula.startsWith('=')) formula = '=' + formula.toUpperCase()
    this.spreadsheet.setValueFromCoords(column, row, formula, true)
  }

  setData(data: unknown[]) {
    this.spreadsheet.setData(data)
  }

  isMounted() {
    return this._spreadsheet !== null
  }

  getMinDimensions() {
    return this.spreadsheet.minDimensions ?? [5, 5]
  }

  getStyle(): Record<string, unknown> {
    return this.spreadsheet.style ?? {}
  }

  setCellStyle(style: SpreadsheetStyle) {
    this.spreadsheet.setStyle(style)
  }

  getColumns(): unknown[] {
    return this.spreadsheet.columns ?? []
  }

  showRow(rowIndex: number) {
    this.spreadsheet.showRow(rowIndex)
  }

  hideRow(rowIndex: number) {
    this.spreadsheet.hideRow(rowIndex)
  }

  showColumn(colIndex: number) {
    this.spreadsheet.showColumn(colIndex)
  }

  hideColumn(colIndex: number) {
    this.spreadsheet.hideColumn(colIndex)
  }

  protected renderLatex(): string {
    const parseJsonAttribute = <T>(attributeName: string): T | null => {
      const raw = this.getAttribute(attributeName)
      if (raw == null) return null
      try {
        return JSON.parse(raw) as T
      } catch {
        return null
      }
    }

    const parsedData = this.parseDataValue(this.getAttribute('data') ?? '[]')
    const latexDataAttr = parseJsonAttribute<SpreadsheetLatexData>('latex-data')
    const latexStyles =
      parseJsonAttribute<SpreadsheetLatexStyles>('latex-styles') ?? {}
    const latexOptions =
      parseJsonAttribute<SpreadsheetLatexOptions>('latex-options') ?? {}

    let minDimensions: [number, number] = [5, 5]
    try {
      const raw = this.getAttribute('min-dimensions')
      if (raw != null) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length >= 2) {
          minDimensions = [Number(parsed[0]), Number(parsed[1])]
        }
      }
    } catch {
      // Si l'attribut est invalide, on garde la valeur par défaut.
    }

    const rowCountFromLatexData = latexDataAttr
      ? Array.isArray(latexDataAttr)
        ? latexDataAttr.length
        : Object.keys(latexDataAttr).length
      : 0

    const colCountFromLatexData = latexDataAttr
      ? (() => {
          const rows = Array.isArray(latexDataAttr)
            ? latexDataAttr
            : Object.values(latexDataAttr)
          return rows.reduce((max, row) => {
            const cols = Object.keys(row ?? {})
              .map((key) => Number(key))
              .filter((value) => Number.isFinite(value) && value >= 0)
            const rowMax = cols.length > 0 ? Math.max(...cols) + 1 : 0
            return Math.max(max, rowMax)
          }, 0)
        })()
      : 0

    const rowNbr = Math.max(
      minDimensions[1] ?? 0,
      parsedData.length,
      rowCountFromLatexData,
    )
    const colNbr = Math.max(
      minDimensions[0] ?? 0,
      ...parsedData.map((row) => row.length),
      colCountFromLatexData,
    )

    const generatedLatexData: Array<
      Record<number, { t?: number; v?: unknown; s?: string }>
    > = []
    for (let rowIndex = 0; rowIndex < rowNbr; rowIndex++) {
      const row: Record<number, { t?: number; v?: unknown; s?: string }> = {}
      for (let colIndex = 0; colIndex < colNbr; colIndex++) {
        const value = parsedData[rowIndex]?.[colIndex] ?? ''
        row[colIndex] = {
          t: typeof value === 'number' ? 2 : 1,
          v: value,
        }
      }
      generatedLatexData.push(row)
    }

    const dataForLatex = latexDataAttr ?? generatedLatexData
    return createTableurLatex(
      rowNbr,
      colNbr,
      dataForLatex,
      latexStyles,
      latexOptions,
    )
  }
}

export function addSheet(
  exercice: IExercice,
  questionIndex: number,
  options: AddSheetOptions,
): string
export function addSheet(
  exercice: IExercice,
  questionIndex: number,
  options: AddSheetOptions,
): string {
  return renderSheetMarkup({
    ...options,
    numeroExercice: exercice.numeroExercice,
    questionIndex,
    appendFeedbackBlocks: options.interactif,
  })
}

export function renderSheetMarkup({
  id,
  numeroExercice,
  questionIndex,
  data = [],
  minDimensions = [5, 5],
  style,
  columns = [],
  latexData,
  latexStyles,
  latexOptions,
  interactif = false,
  showVerifyButton = false,
  nbLignesCachees,
  nbColonnesCachees,
  readOnlyCells,
  barreFormule,
  arrondiAffichage,
  appendFeedbackBlocks,
}: RenderSheetMarkupOptions): string {
  const computedId =
    id ??
    (numeroExercice != null && questionIndex != null
      ? MySpreadsheetElement.getDefaultSheetId(numeroExercice, questionIndex)
      : undefined)

  const sheetElement = MySpreadsheetElement.createEltToAppendToDom({
    id: computedId,
    data,
    minDimensions,
    style: style as Record<string, unknown> | undefined,
    columns,
    interactif,
    showVerifyButton,
    readOnlyCells,
    barreFormule,
    arrondiAffichage,
  })

  if (nbColonnesCachees != null) {
    sheetElement.setAttribute('nb-colonnes-cachees', String(nbColonnesCachees))
  }
  if (nbLignesCachees != null) {
    sheetElement.setAttribute('nb-lignes-cachees', String(nbLignesCachees))
  }
  if (latexData != null) {
    sheetElement.setAttribute('latex-data', JSON.stringify(latexData))
  }
  if (latexStyles != null) {
    sheetElement.setAttribute('latex-styles', JSON.stringify(latexStyles))
  }
  if (latexOptions != null) {
    sheetElement.setAttribute('latex-options', JSON.stringify(latexOptions))
  }

  if (context.isHtml && !context.isTypst) {
    const shouldAppendFeedback = appendFeedbackBlocks ?? interactif
    return (
      sheetElement.outerHTML +
      (shouldAppendFeedback && numeroExercice != null && questionIndex != null
        ? `<div class="resultat-check-tableur ml-2 py-2" id="resultatCheckEx${numeroExercice}Q${questionIndex}"></div>
<div class="feedback-tableur ml-2 py-2 italic text-coopmaths-warn-darkest dark:text-coopmathsdark-warn-darkest" id="feedbackEx${numeroExercice}Q${questionIndex}"></div>`
        : '')
    )
  }

  return sheetElement.render() ?? ''
}

export function createTableurLatex(
  rowNbr: number,
  colNbr: number,
  data: SpreadsheetLatexData,
  styles: SpreadsheetLatexStyles,
  options: SpreadsheetLatexOptions = {},
) {
  let output = context.isTypst ? '' : '\\begin{minipage}{0.9\\linewidth}\n'
  output += `\\begin{tabularx}{${context.isTypst ? '0.9\\linewidth' : '\\linewidth'}}
  {|>{\\cellcolor{lightgray}}c|
  ${options.firstColHeaderWidth ? `>{\\centering \\arraybackslash}p{${options.firstColHeaderWidth}}|` : '>{\\centering \\arraybackslash}X|'}
  *{${colNbr - 1}}{>{\\centering \\arraybackslash}X|}}\\hline\n`

  if (options.formule && !context.isTypst) {
    output += `\\multicolumn{1}{|l}{${options.formuleCellule}}&\\multicolumn{1}{r|}{$\\nabla$}&\\multicolumn{${colNbr - 1}}{l|}{${options.formuleTexte}}\\\\ \\hline\n`
  }

  output += '\\rowcolor{lightgray} &'
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  for (let colIndex = 0; colIndex < colNbr - 1; colIndex++) {
    output += `\\textbf{\\sffamily ${alphabet[colIndex]}}  & `
  }
  output += `\\textbf{\\sffamily ${alphabet[colNbr - 1]}} \\\\ \\hline\n`

  for (let rowIndex = 0; rowIndex < rowNbr; rowIndex++) {
    const rowData =
      (Array.isArray(data) ? data[rowIndex] : data[rowIndex]) || {}
    output += `\\textbf{\\sffamily ${rowIndex + 1}} &`
    for (let colIndex = 0; colIndex < colNbr; colIndex++) {
      const cell = rowData[colIndex] || {}
      const styleCell = styles[cell.s ?? ''] || {}
      let color = ''
      if (
        (!context.isHtml || context.isTypst) &&
        styleCell.bg?.startsWith('#')
      ) {
        color = `\\cellcolor[HTML]{${styleCell.bg.replace('#', '')}}`
      } else if (styleCell.bg) {
        color = `\\cellcolor{${styleCell.bg}}`
      }
      if (cell?.t === 1) {
        const texte = cell.v || ''
        output += `\\raggedright\\arraybackslash ${color} ${context.isTypst ? `\\text{${texte}}` : texte}  &`
      } else if (cell?.t === 2) {
        output += `\\raggedleft\\arraybackslash ${color} ${cell.v || ''}  &`
      } else if (cell?.t === 3) {
        output += `\\centering\\arraybackslash ${color} ${cell.v ? 'VRAI' : 'FAUX'}  &`
      } else {
        output += `${color} ${cell.v || ''}  &`
      }
    }
    output = output.slice(0, -1)
    output += '\\\\ \\hline\n'
  }
  output += '\\end{tabularx}\n'
  if (!context.isTypst) output += '\\end{minipage}\n'

  return context.isTypst ? `$${output}$` : output
}

registerMathaleaCustomElement(MySpreadsheetElement)
