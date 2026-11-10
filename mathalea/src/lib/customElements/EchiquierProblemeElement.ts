import { context } from '../../modules/context'
import { uniformiseResults } from '../interactif/gestionInteractif'
import type { IExercice } from '../types'
import {
  ListeDeroulanteElement,
  type AllChoiceType,
  type AllChoicesType,
} from './ListeDeroulanteElement'
import MathaleaCustomElement, {
  registerMathaleaCustomElement,
} from './MathaleaCustomElement'

export type EchiquierProblemeStructure = 'ligne' | 'colonne'
export type EchiquierProblemeOperation =
  'addition' | 'soustraction' | 'multiplication' | 'division'
export type EchiquierProblemeCellFillMode =
  'automatic' | 'student' | 'correction'
export type EchiquierProblemeSimplificationMode = 'none' | 'grey'
export type EchiquierProblemeCellKind = 'given' | 'computed'

export type EchiquierProblemeCell = {
  row: string
  column: string
  value: string
  kind?: EchiquierProblemeCellKind
}

export type EchiquierProblemeValue = {
  rowHeaders: string[]
  columnHeaders: string[]
  cellValues?: Record<string, string>
  greyedRows?: string[]
  greyedColumns?: string[]
  structure?: EchiquierProblemeStructure | ''
  operation?: EchiquierProblemeOperation | ''
}

export type EchiquierProblemeAnswer = {
  expectedRows: string[]
  expectedColumns: string[]
  cells: EchiquierProblemeCell[]
  rowChoices: string[]
  columnChoices: string[]
  cellChoices?: AllChoicesType
  expectedGreyedRows?: string[]
  expectedGreyedColumns?: string[]
  expectedStructure?: EchiquierProblemeStructure
  expectedOperation?: EchiquierProblemeOperation
}

export type EchiquierProblemeOptions = EchiquierProblemeAnswer & {
  id?: string
  cellFillMode?: EchiquierProblemeCellFillMode
  simplificationMode?: EchiquierProblemeSimplificationMode
  interactivityOn?: boolean
}

type EchiquierProblemeCreateOptions = EchiquierProblemeOptions & {
  numeroExercice?: number
  questionIndex?: number
}

const EMPTY_VALUE: EchiquierProblemeValue = {
  rowHeaders: [''],
  columnHeaders: [''],
  cellValues: {},
  greyedRows: [],
  greyedColumns: [],
  structure: '',
  operation: '',
}

function cellKey(rowIndex: number, columnIndex: number): string {
  return `${rowIndex}:${columnIndex}`
}

function parseJsonAttribute<T>(
  element: HTMLElement,
  name: string,
  fallback: T,
): T {
  const raw = element.getAttribute(name)
  if (raw == null || raw.trim() === '') return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function normalizeList(values: string[]): string[] {
  return values.map((value) => value.trim()).filter((value) => value.length > 0)
}

function sameSet(actual: string[], expected: string[]): boolean {
  const normalizedActual = normalizeList(actual).sort()
  const normalizedExpected = normalizeList(expected).sort()
  return (
    normalizedActual.length === normalizedExpected.length &&
    normalizedActual.every(
      (value, index) => value === normalizedExpected[index],
    )
  )
}

export function addEchiquierProbleme(
  exercice: IExercice,
  questionIndex: number,
  options: EchiquierProblemeOptions,
): string {
  return EchiquierProblemeElement.create({
    ...options,
    numeroExercice: exercice.numeroExercice ?? 0,
    questionIndex,
    interactivityOn: exercice.interactif && (options.interactivityOn ?? true),
  })
}
/**
 * @author Jean-Claude Lhote
 */
export class EchiquierProblemeElement extends MathaleaCustomElement {
  static readonly elementTag = 'echiquier-probleme'

  static create({
    id,
    numeroExercice = 0,
    questionIndex = 0,
    interactivityOn = true,
    expectedRows,
    expectedColumns,
    cells,
    rowChoices,
    columnChoices,
    cellChoices,
    cellFillMode = 'automatic',
    simplificationMode = 'none',
    expectedGreyedRows,
    expectedGreyedColumns,
    expectedStructure,
    expectedOperation,
  }: EchiquierProblemeCreateOptions): string {
    const options: EchiquierProblemeOptions = {
      expectedRows,
      expectedColumns,
      cells,
      rowChoices,
      columnChoices,
      cellChoices,
      cellFillMode,
      simplificationMode,
      expectedGreyedRows,
      expectedGreyedColumns,
      expectedStructure,
      expectedOperation,
      interactivityOn,
      id,
    }
    if (context.isTypst) {
      return `<mathalea-typst>${this.renderTypstFromOptions(options)}</mathalea-typst>`
    }
    if (!context.isHtml) return this.renderLatexFromOptions(options)
    const computedId =
      id ??
      `${EchiquierProblemeElement.elementTag}Ex${numeroExercice}Q${questionIndex}`
    const attrs = this.buildAttributes({
      id: computedId,
      dataQuestionIndex: questionIndex,
      interactivityOn,
      expectedRows,
      expectedColumns,
      cells,
      rowChoices,
      columnChoices,
      cellChoices,
      cellFillMode,
      simplificationMode,
      expectedGreyedRows,
      expectedGreyedColumns,
      expectedStructure,
      expectedOperation,
    })
    return `<${EchiquierProblemeElement.elementTag}${attrs}></${EchiquierProblemeElement.elementTag}><span id="resultatCheckEx${numeroExercice}Q${questionIndex}"></span><div id="feedbackEx${numeroExercice}Q${questionIndex}"></div>`
  }

  private static renderLatexFromOptions(
    options: EchiquierProblemeOptions,
  ): string {
    const correction = options.cellFillMode === 'correction'
    const columns = [''].concat(options.expectedColumns)
    const rows = options.expectedRows.map((row) =>
      [row].concat(
        options.expectedColumns.map((column) =>
          correction
            ? this.cellValueFromOptions(options, row, column) || ''
            : '...',
        ),
      ),
    )
    const allRows = [columns, ...rows]
    const columnSpec = `|${Array(columns.length).fill('c|').join('')}`
    return [
      '\\begin{center}',
      `\\begin{tabular}{${columnSpec}}`,
      '\\hline',
      allRows
        .map(
          (row) =>
            `${row.map((cell) => this.escapeLatex(cell)).join(' & ')} \\\\ \\hline`,
        )
        .join('\n'),
      '\\end{tabular}',
      '\\end{center}',
    ].join('\n')
  }

  private static renderTypstFromOptions(
    options: EchiquierProblemeOptions,
  ): string {
    const correction = options.cellFillMode === 'correction'
    const header = [''].concat(options.expectedColumns)
    const rows = options.expectedRows.map((row) =>
      [row].concat(
        options.expectedColumns.map((column) =>
          correction
            ? this.cellValueFromOptions(options, row, column) || ''
            : '...',
        ),
      ),
    )
    const cells = [header, ...rows]
      .flatMap((row) => row.map((cell) => `[${this.escapeTypst(cell)}]`))
      .join(', ')
    return `#table(columns: ${header.length}, align: (x, _) => if x == 0 { left } else { center }, stroke: 0.5pt, inset: 4pt, ${cells})`
  }

  private static cellValueFromOptions(
    options: EchiquierProblemeOptions,
    row: string,
    column: string,
  ): string {
    return (
      options.cells.find((cell) => cell.row === row && cell.column === column)
        ?.value ?? ''
    )
  }

  private static escapeLatex(value: string): string {
    return value
      .replaceAll('\\', '\\textbackslash{}')
      .replaceAll('&', '\\&')
      .replaceAll('%', '\\%')
      .replaceAll('$', '\\$')
      .replaceAll('#', '\\#')
      .replaceAll('_', '\\_')
      .replaceAll('{', '\\{')
      .replaceAll('}', '\\}')
  }

  private static escapeTypst(value: string): string {
    return value.replaceAll('\\', '\\\\').replaceAll(']', '\\]')
  }

  static verifQuestion(
    exercice: IExercice,
    questionIndex: number,
  ): {
    isOk: boolean
    feedback: string
    score: { nbBonnesReponses: number; nbReponses: number }
  } {
    const elementId = `${EchiquierProblemeElement.elementTag}Ex${exercice.numeroExercice}Q${questionIndex}`
    const escapedElementId =
      typeof CSS !== 'undefined' && CSS.escape != null
        ? CSS.escape(elementId)
        : elementId
    const element =
      (document.querySelector(
        `#${escapedElementId}`,
      ) as EchiquierProblemeElement | null) ??
      (document.querySelector(
        `${EchiquierProblemeElement.elementTag}[data-question-index="${questionIndex}"]`,
      ) as EchiquierProblemeElement | null)
    if (element == null) {
      window.notify('Échiquier du problème introuvable.', {
        exercice: exercice.id,
        questionIndex,
      })
      return uniformiseResults('KO')
    }

    const expected = element.answer
    const value = element.value
    const checks = [
      {
        ok: sameSet(value.rowHeaders, expected.expectedRows),
        message: 'les grandeurs',
      },
      {
        ok: sameSet(value.columnHeaders, expected.expectedColumns),
        message: 'les objets',
      },
    ]
    if (element.cellFillMode === 'student') {
      checks.push({
        ok: element.hasExpectedCellValues(),
        message: 'les données du tableau',
      })
    }
    if (element.simplificationMode === 'grey') {
      checks.push({
        ok:
          sameSet(value.greyedRows ?? [], expected.expectedGreyedRows ?? []) &&
          sameSet(
            value.greyedColumns ?? [],
            expected.expectedGreyedColumns ?? [],
          ),
        message: 'les éléments grisés',
      })
    }
    if (
      expected.expectedStructure != null ||
      expected.expectedOperation != null
    ) {
      checks.push({
        ok:
          (expected.expectedStructure == null ||
            value.structure === expected.expectedStructure) &&
          (expected.expectedOperation == null ||
            value.operation === expected.expectedOperation),
        message: "le type d'échiquier et l'opération",
      })
    }

    const nbBonnesReponses = checks.filter(({ ok }) => ok).length
    const nbReponses = checks.length
    const isOk = nbBonnesReponses === nbReponses
    const feedback = isOk
      ? 'L’échiquier est correctement construit.'
      : `À revoir : ${checks
          .filter(({ ok }) => !ok)
          .map(({ message }) => message)
          .join(', ')}.`

    if (exercice.answers === undefined) exercice.answers = {}
    exercice.answers[element.id] = JSON.stringify(value)
    element.interactivityOn = false
    element.setValidationState(checks)

    const span = document.getElementById(
      `resultatCheckEx${exercice.numeroExercice}Q${questionIndex}`,
    )
    if (span != null) {
      span.innerHTML = isOk ? '😎' : '☹️'
      ;(span as HTMLElement).style.fontSize = 'large'
    }
    const feedbackElement = document.getElementById(
      `feedbackEx${exercice.numeroExercice}Q${questionIndex}`,
    )
    if (feedbackElement != null) feedbackElement.textContent = feedback

    return {
      isOk,
      feedback,
      score: { nbBonnesReponses, nbReponses },
    }
  }

  static pointsMaxQuestion(exercice: IExercice, questionIndex: number): number {
    const options = this.getPointsMaxOptions(exercice, questionIndex)
    if (options == null) return 2
    return this.pointsMaxFromOptions(options)
  }

  private static getPointsMaxOptions(
    exercice: IExercice,
    questionIndex: number,
  ): Partial<EchiquierProblemeOptions> | null {
    const raw = exercice.autoCorrection?.[questionIndex]?.valeur?.reponse?.value
    const optionsFromAnswer = this.parseOptionsFromAnswer(raw)
    const optionsFromHtml = this.parseOptionsFromQuestionHtml(
      exercice.listeQuestions?.[questionIndex],
    )
    if (optionsFromAnswer == null && optionsFromHtml == null) return null
    return {
      ...(optionsFromAnswer ?? {}),
      ...(optionsFromHtml ?? {}),
    }
  }

  private static parseOptionsFromAnswer(
    raw: unknown,
  ): Partial<EchiquierProblemeOptions> | null {
    if (typeof raw !== 'string') return null
    try {
      return JSON.parse(raw) as Partial<EchiquierProblemeOptions>
    } catch {
      return null
    }
  }

  private static parseOptionsFromQuestionHtml(
    questionHtml: string | undefined,
  ): Partial<EchiquierProblemeOptions> | null {
    if (questionHtml == null) return null
    const tagMatch = questionHtml.match(/<echiquier-probleme\b([^>]*)>/i)
    if (tagMatch == null) return null
    const attrs = tagMatch[1]
    const readAttribute = (name: string): string | undefined => {
      const escapedName = name.replaceAll('-', '\\-')
      const attrMatch = attrs.match(
        new RegExp(`\\s${escapedName}="([^"]*)"`, 'i'),
      )
      return attrMatch?.[1]
    }
    const options: Partial<EchiquierProblemeOptions> = {}
    const cellFillMode = readAttribute('cell-fill-mode')
    const simplificationMode = readAttribute('simplification-mode')
    const expectedStructure = readAttribute('expected-structure')
    const expectedOperation = readAttribute('expected-operation')
    if (cellFillMode != null)
      options.cellFillMode = cellFillMode as EchiquierProblemeCellFillMode
    if (simplificationMode != null)
      options.simplificationMode =
        simplificationMode as EchiquierProblemeSimplificationMode
    if (expectedStructure != null)
      options.expectedStructure =
        expectedStructure as EchiquierProblemeStructure
    if (expectedOperation != null)
      options.expectedOperation =
        expectedOperation as EchiquierProblemeOperation
    return options
  }

  private static pointsMaxFromOptions(
    options: Partial<EchiquierProblemeOptions>,
  ): number {
    return (
      2 +
      (options.cellFillMode === 'student' ? 1 : 0) +
      (options.simplificationMode === 'grey' ? 1 : 0) +
      (options.expectedStructure == null && options.expectedOperation == null
        ? 0
        : 1)
    )
  }

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  get answer(): EchiquierProblemeAnswer {
    return {
      expectedRows: parseJsonAttribute(this, 'expected-rows', []),
      expectedColumns: parseJsonAttribute(this, 'expected-columns', []),
      cells: parseJsonAttribute(this, 'cells', []),
      rowChoices: parseJsonAttribute(this, 'row-choices', []),
      columnChoices: parseJsonAttribute(this, 'column-choices', []),
      cellChoices: parseJsonAttribute(this, 'cell-choices', undefined),
      expectedGreyedRows: parseJsonAttribute(this, 'expected-greyed-rows', []),
      expectedGreyedColumns: parseJsonAttribute(
        this,
        'expected-greyed-columns',
        [],
      ),
      expectedStructure:
        (this.getAttribute(
          'expected-structure',
        ) as EchiquierProblemeStructure | null) ?? undefined,
      expectedOperation:
        (this.getAttribute(
          'expected-operation',
        ) as EchiquierProblemeOperation | null) ?? undefined,
    }
  }

  get cellFillMode(): EchiquierProblemeCellFillMode {
    return (
      (this.getAttribute(
        'cell-fill-mode',
      ) as EchiquierProblemeCellFillMode | null) ?? 'automatic'
    )
  }

  get simplificationMode(): EchiquierProblemeSimplificationMode {
    return (
      (this.getAttribute(
        'simplification-mode',
      ) as EchiquierProblemeSimplificationMode | null) ?? 'none'
    )
  }

  get shouldRenderCorrection(): boolean {
    return this.cellFillMode === 'correction'
  }

  get shouldRenderStatic(): boolean {
    return !this.interactivityOn || this.shouldRenderCorrection
  }

  get value(): EchiquierProblemeValue {
    return (super.value as EchiquierProblemeValue | null) ?? EMPTY_VALUE
  }

  set value(nextValue: EchiquierProblemeValue | string) {
    const parsed =
      typeof nextValue === 'string'
        ? this.parseValue(nextValue)
        : this.normalizeValue(nextValue)
    super.value = parsed
    this.render()
  }

  connectedCallback() {
    this.hydrateCommonAttributes()
    if (super.value == null) super.value = EMPTY_VALUE
    this.render()
  }

  render(): string | void {
    if (!context.isHtml || this.shadowRoot == null) return ''
    this.shadowRoot.innerHTML = ''
    this.shadowRoot.append(this.createStyle(), this.createRoot())
    this.onInteractivityChanged(this.interactivityOn)
  }

  protected onInteractivityChanged(isOn: boolean): void {
    if (this.shadowRoot == null) return
    this.shadowRoot
      .querySelectorAll<HTMLButtonElement | HTMLSelectElement>('button, select')
      .forEach((control) => {
        control.disabled = !isOn
      })
    this.shadowRoot
      .querySelectorAll<ListeDeroulanteElement>(
        ListeDeroulanteElement.elementTag,
      )
      .forEach((control) => {
        control.interactivityOn = isOn
      })
  }

  private parseValue(raw: string): EchiquierProblemeValue {
    try {
      return this.normalizeValue(JSON.parse(raw) as EchiquierProblemeValue)
    } catch {
      return EMPTY_VALUE
    }
  }

  private normalizeValue(
    value: EchiquierProblemeValue,
  ): EchiquierProblemeValue {
    return {
      rowHeaders: value.rowHeaders.length > 0 ? value.rowHeaders : [''],
      columnHeaders:
        value.columnHeaders.length > 0 ? value.columnHeaders : [''],
      cellValues: value.cellValues ?? {},
      greyedRows: value.greyedRows ?? [],
      greyedColumns: value.greyedColumns ?? [],
      structure: value.structure ?? '',
      operation: value.operation ?? '',
    }
  }

  private update(nextValue: EchiquierProblemeValue): void {
    super.value = this.normalizeValue(nextValue)
    this.render()
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }))
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }))
  }

  private get displayRowHeaders(): string[] {
    return this.shouldRenderStatic
      ? this.answer.expectedRows
      : this.value.rowHeaders
  }

  private get displayColumnHeaders(): string[] {
    return this.shouldRenderStatic
      ? this.answer.expectedColumns
      : this.value.columnHeaders
  }

  private get displayStructure(): EchiquierProblemeStructure | '' {
    return this.shouldRenderCorrection
      ? (this.answer.expectedStructure ?? '')
      : (this.value.structure ?? '')
  }

  private get displayOperation(): EchiquierProblemeOperation | '' {
    return this.shouldRenderCorrection
      ? (this.answer.expectedOperation ?? '')
      : (this.value.operation ?? '')
  }

  private createRoot(): HTMLElement {
    const root = document.createElement('div')
    root.className = 'echiquier'
    if (!this.shouldRenderStatic) root.append(this.createControls())
    root.append(this.createTable(), this.createAnalysis())
    return root
  }

  private createControls(): HTMLElement {
    const controls = document.createElement('div')
    controls.className = 'controls'
    controls.append(
      this.createButton('Ajouter une ligne', () =>
        this.update({
          ...this.value,
          rowHeaders: [...this.value.rowHeaders, ''],
        }),
      ),
      this.createButton('Retirer une ligne', () =>
        this.update({
          ...this.value,
          rowHeaders: this.value.rowHeaders.slice(0, -1),
        }),
      ),
      this.createButton('Ajouter une colonne', () =>
        this.update({
          ...this.value,
          columnHeaders: [...this.value.columnHeaders, ''],
        }),
      ),
      this.createButton('Retirer une colonne', () =>
        this.update({
          ...this.value,
          columnHeaders: this.value.columnHeaders.slice(0, -1),
        }),
      ),
    )
    return controls
  }

  private createAnalysis(): HTMLElement {
    const analysis = document.createElement('div')
    analysis.className = 'analysis'
    if (this.shouldRenderStatic) {
      analysis.append(
        this.createStaticAnalysisItem(
          "Type d'échiquier",
          this.shouldRenderCorrection
            ? this.structureLabel(this.displayStructure)
            : '...',
        ),
        this.createStaticAnalysisItem(
          'Opération',
          this.shouldRenderCorrection
            ? this.operationLabel(this.displayOperation)
            : '...',
        ),
      )
      return analysis
    }
    analysis.append(
      this.createSelect({
        label: "Type d'échiquier",
        value: this.displayStructure,
        choices: [
          { value: 'ligne', label: 'en ligne' },
          { value: 'colonne', label: 'en colonne' },
        ],
        onChange: (structure) =>
          this.update({
            ...this.value,
            structure: structure as EchiquierProblemeStructure | '',
          }),
      }),
      this.createSelect({
        label: 'Opération',
        value: this.displayOperation,
        choices: [
          { value: 'addition', label: 'addition' },
          { value: 'soustraction', label: 'soustraction' },
          { value: 'multiplication', label: 'multiplication' },
          { value: 'division', label: 'division' },
        ],
        onChange: (operation) =>
          this.update({
            ...this.value,
            operation: operation as EchiquierProblemeOperation | '',
          }),
      }),
    )
    return analysis
  }

  private createTable(): HTMLTableElement {
    const table = document.createElement('table')
    const thead = document.createElement('thead')
    const headerRow = document.createElement('tr')
    headerRow.append(document.createElement('th'))
    const rowHeaders = this.displayRowHeaders
    const columnHeaders = this.displayColumnHeaders
    columnHeaders.forEach((column, index) => {
      const th = document.createElement('th')
      th.classList.toggle('greyed', this.isGreyedColumn(column))
      const header = document.createElement('div')
      header.className = 'header-control'
      if (this.shouldRenderStatic) {
        header.classList.add('static-header')
        header.textContent = column
      } else {
        header.append(
          this.createHeaderSelect(column, this.answer.columnChoices, (next) => {
            const columnHeaders = [...this.value.columnHeaders]
            const previous = columnHeaders[index]
            columnHeaders[index] = next
            this.update({
              ...this.value,
              columnHeaders,
              greyedColumns: (this.value.greyedColumns ?? []).filter(
                (column) => column !== previous,
              ),
            })
          }),
        )
        if (this.simplificationMode === 'grey') {
          header.append(
            this.createGreyButton(
              this.isGreyedColumn(column),
              () => this.toggleGreyedColumn(column),
              column === '',
            ),
          )
        }
      }
      th.append(header)
      headerRow.append(th)
    })
    thead.append(headerRow)
    const tbody = document.createElement('tbody')
    rowHeaders.forEach((row, rowIndex) => {
      const tr = document.createElement('tr')
      tr.classList.toggle('greyed', this.isGreyedRow(row))
      const th = document.createElement('th')
      th.classList.toggle('greyed', this.isGreyedRow(row))
      const header = document.createElement('div')
      header.className = 'header-control'
      if (this.shouldRenderStatic) {
        header.classList.add('static-header')
        header.textContent = row
      } else {
        header.append(
          this.createHeaderSelect(row, this.answer.rowChoices, (next) => {
            const rowHeaders = [...this.value.rowHeaders]
            const previous = rowHeaders[rowIndex]
            rowHeaders[rowIndex] = next
            this.update({
              ...this.value,
              rowHeaders,
              greyedRows: (this.value.greyedRows ?? []).filter(
                (row) => row !== previous,
              ),
            })
          }),
        )
        if (this.simplificationMode === 'grey') {
          header.append(
            this.createGreyButton(
              this.isGreyedRow(row),
              () => this.toggleGreyedRow(row),
              row === '',
            ),
          )
        }
      }
      th.append(header)
      tr.append(th)
      columnHeaders.forEach((column, columnIndex) => {
        const td = document.createElement('td')
        const expectedCell = this.findCell(row, column)
        td.classList.toggle('computed', expectedCell?.kind === 'computed')
        td.classList.toggle(
          'greyed',
          this.isGreyedRow(row) || this.isGreyedColumn(column),
        )
        if (this.shouldRenderCorrection) {
          td.textContent = this.cellValue(row, column)
        } else if (this.shouldRenderStatic) {
          td.textContent = '...'
        } else if (this.cellFillMode === 'student') {
          td.append(
            this.createCellSelect(
              this.value.cellValues?.[cellKey(rowIndex, columnIndex)] ?? '',
              (next) => {
                this.update({
                  ...this.value,
                  cellValues: {
                    ...(this.value.cellValues ?? {}),
                    [cellKey(rowIndex, columnIndex)]: next,
                  },
                })
              },
            ),
          )
        } else {
          td.textContent = this.cellValue(row, column)
        }
        tr.append(td)
      })
      tbody.append(tr)
    })
    table.append(thead, tbody)
    return table
  }

  private createHeaderSelect(
    value: string,
    choices: string[],
    onChange: (value: string) => void,
  ): HTMLSelectElement {
    const select = document.createElement('select')
    select.append(new Option('Choisir', ''))
    choices.forEach((choice) => select.append(new Option(choice, choice)))
    select.value = value
    select.addEventListener('change', () => onChange(select.value))
    return select
  }

  private createCellSelect(
    value: string,
    onChange: (value: string) => void,
  ): HTMLElement {
    if (this.hasRichCellChoices) {
      const liste = document.createElement(
        ListeDeroulanteElement.elementTag,
      ) as ListeDeroulanteElement
      liste.choices = [
        { label: 'Choisir', value: '' },
        ...this.cellChoices,
      ] as AllChoicesType
      liste.value = value
      liste.interactivityOn = this.interactivityOn
      liste.addEventListener('value-changed', () => onChange(liste.value))
      return liste
    }
    const select = document.createElement('select')
    select.append(new Option('Choisir', ''))
    this.cellChoices.forEach((choice) => {
      const value = this.cellChoiceValue(choice)
      select.append(new Option(this.cellChoiceLabel(choice), value))
    })
    select.value = value
    select.addEventListener('change', () => onChange(select.value))
    return select
  }

  private createSelect({
    label,
    value,
    choices,
    onChange,
  }: {
    label: string
    value: string
    choices: { value: string; label: string }[]
    onChange: (value: string) => void
  }): HTMLLabelElement {
    const wrapper = document.createElement('label')
    wrapper.textContent = label
    const select = document.createElement('select')
    select.append(new Option('Choisir', ''))
    choices.forEach((choice) =>
      select.append(new Option(choice.label, choice.value)),
    )
    select.value = value
    select.addEventListener('change', () => onChange(select.value))
    wrapper.append(select)
    return wrapper
  }

  private createStaticAnalysisItem(
    label: string,
    value: string,
  ): HTMLSpanElement {
    const wrapper = document.createElement('span')
    wrapper.className = 'analysis-static-item'
    const labelElement = document.createElement('span')
    labelElement.className = 'analysis-static-label'
    labelElement.textContent = `${label} :`
    const valueElement = document.createElement('span')
    valueElement.className = 'analysis-static-value'
    valueElement.textContent = value || '...'
    wrapper.append(labelElement, valueElement)
    return wrapper
  }

  private structureLabel(value: EchiquierProblemeStructure | ''): string {
    return (
      {
        ligne: 'en ligne',
        colonne: 'en colonne',
        '': '',
      } satisfies Record<EchiquierProblemeStructure | '', string>
    )[value]
  }

  private operationLabel(value: EchiquierProblemeOperation | ''): string {
    return (
      {
        addition: 'addition',
        soustraction: 'soustraction',
        multiplication: 'multiplication',
        division: 'division',
        '': '',
      } satisfies Record<EchiquierProblemeOperation | '', string>
    )[value]
  }

  private createButton(label: string, onClick: () => void): HTMLButtonElement {
    const button = document.createElement('button')
    button.type = 'button'
    button.textContent = label
    button.addEventListener('click', () => {
      if (!this.interactivityOn) return
      onClick()
    })
    return button
  }

  private createGreyButton(
    isGreyed: boolean,
    onClick: () => void,
    disabled: boolean,
  ): HTMLButtonElement {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'grey-toggle'
    button.textContent = isGreyed ? 'Réactiver' : 'Griser'
    button.disabled = disabled
    button.addEventListener('click', () => {
      if (!this.interactivityOn || disabled) return
      onClick()
    })
    return button
  }

  private cellValue(row: string, column: string): string {
    if (row === '' || column === '') return ''
    return this.findCell(row, column)?.value ?? ''
  }

  private findCell(row: string, column: string): EchiquierProblemeCell | null {
    if (row === '' || column === '') return null
    return (
      this.answer.cells.find(
        (cell) => cell.row === row && cell.column === column,
      ) ?? null
    )
  }

  private isGreyedRow(row: string): boolean {
    const greyedRows = this.shouldRenderCorrection
      ? (this.answer.expectedGreyedRows ?? [])
      : (this.value.greyedRows ?? [])
    return row !== '' && greyedRows.includes(row)
  }

  private isGreyedColumn(column: string): boolean {
    const greyedColumns = this.shouldRenderCorrection
      ? (this.answer.expectedGreyedColumns ?? [])
      : (this.value.greyedColumns ?? [])
    return column !== '' && greyedColumns.includes(column)
  }

  private toggleGreyedRow(row: string): void {
    if (row === '') return
    const greyedRows = new Set(this.value.greyedRows ?? [])
    if (greyedRows.has(row)) greyedRows.delete(row)
    else greyedRows.add(row)
    this.update({
      ...this.value,
      greyedRows: [...greyedRows],
    })
  }

  private toggleGreyedColumn(column: string): void {
    if (column === '') return
    const greyedColumns = new Set(this.value.greyedColumns ?? [])
    if (greyedColumns.has(column)) greyedColumns.delete(column)
    else greyedColumns.add(column)
    this.update({
      ...this.value,
      greyedColumns: [...greyedColumns],
    })
  }

  private get cellChoices(): AllChoicesType {
    const choices =
      this.answer.cellChoices ?? this.answer.cells.map((cell) => cell.value)
    const byValue = new Map<string, AllChoiceType>()
    choices.forEach((choice) => {
      const normalized =
        typeof choice === 'string'
          ? choice.trim()
          : { ...choice, value: choice.value.trim() }
      const value = this.cellChoiceValue(normalized)
      if (value.length > 0 && !byValue.has(value))
        byValue.set(value, normalized)
    })
    return [...byValue.values()]
  }

  private get hasRichCellChoices(): boolean {
    return this.cellChoices.some((choice) => typeof choice !== 'string')
  }

  private cellChoiceValue(choice: AllChoiceType): string {
    return typeof choice === 'string' ? choice : choice.value
  }

  private cellChoiceLabel(choice: AllChoiceType): string {
    if (typeof choice === 'string') return choice
    return choice.label ?? choice.value
  }

  private hasExpectedCellValues(): boolean {
    return this.value.rowHeaders.every((row, rowIndex) =>
      this.value.columnHeaders.every((column, columnIndex) => {
        const expectedValue = this.cellValue(row, column)
        const actualValue =
          this.value.cellValues?.[cellKey(rowIndex, columnIndex)] ?? ''
        return actualValue === expectedValue
      }),
    )
  }

  private setValidationState(checks: { ok: boolean; message: string }[]): void {
    this.dataset.validation = checks.every(({ ok }) => ok) ? 'ok' : 'ko'
  }

  protected renderLatex(): string {
    return EchiquierProblemeElement.renderLatexFromOptions({
      ...this.answer,
      cellFillMode: this.cellFillMode,
      simplificationMode: this.simplificationMode,
      interactivityOn: this.interactivityOn,
    })
  }

  protected renderTypst(): string {
    return EchiquierProblemeElement.renderTypstFromOptions({
      ...this.answer,
      cellFillMode: this.cellFillMode,
      simplificationMode: this.simplificationMode,
      interactivityOn: this.interactivityOn,
    })
  }

  private createStyle(): HTMLStyleElement {
    const style = document.createElement('style')
    style.textContent = `
      :host {
        display: block;
        margin: 1rem 0;
      }
      .echiquier {
        display: grid;
        gap: 0.75rem;
        max-width: 100%;
        overflow-x: auto;
      }
      .controls,
      .analysis {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        align-items: center;
      }
      button,
      select {
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        background: #fff;
        color: #0f172a;
        font: inherit;
      }
      button {
        padding: 0.35rem 0.55rem;
        cursor: pointer;
      }
      button.grey-toggle {
        white-space: nowrap;
        padding: 0.25rem 0.4rem;
        font-size: 0.85rem;
      }
      button:hover:not(:disabled),
      select:hover:not(:disabled) {
        border-color: #2563eb;
      }
      button:disabled,
      select:disabled {
        cursor: not-allowed;
        opacity: 0.65;
      }
      label {
        display: inline-flex;
        gap: 0.35rem;
        align-items: center;
      }
      .analysis-static-item {
        display: inline-flex;
        gap: 0.35rem;
        align-items: baseline;
      }
      .analysis-static-label {
        font-weight: 600;
      }
      .analysis-static-value {
        color: #0f172a;
      }
      .header-control {
        display: flex;
        gap: 0.35rem;
        align-items: center;
      }
      .header-control.static-header {
        justify-content: center;
      }
      table {
        border-collapse: collapse;
        width: max-content;
        min-width: min(100%, 28rem);
      }
      th,
      td {
        border: 1px solid #94a3b8;
        min-width: 9rem;
        height: 3rem;
        padding: 0.4rem;
        text-align: center;
        vertical-align: middle;
      }
      th {
        background: #f8fafc;
        font-weight: 600;
      }
      td {
        background: #fff;
      }
      td.computed {
        box-shadow: inset 0 0 0 2px #bfdbfe;
      }
      th.greyed,
      td.greyed,
      tr.greyed td {
        background: #e5e7eb;
        color: #64748b;
      }
      td.greyed select,
      th.greyed select {
        color: #64748b;
      }
      th:first-child {
        min-width: 11rem;
      }
      th select {
        width: 100%;
      }
    `
    return style
  }
}

registerMathaleaCustomElement(EchiquierProblemeElement)
