import type { MathfieldElement } from 'mathlive'
import ListeDeroulanteElement from '../../../src/lib/customElements/ListeDeroulanteElement'
import { MySpreadsheetElement } from '../../../src/lib/customElements/MySpreadSheet'
import type {
  GoodAnswersFormulas,
  SheetTestDatas,
} from '../../../src/lib/types'

function createFakeMfe(
  id: string,
  champValues: Record<string, string> = {},
): MathfieldElement {
  const el = document.createElement('div') as unknown as MathfieldElement // A real MathfieldElement would require a lot of DOM logic (shadow DOM, renderMathInElement) which doesn't belong in a unit test simulator. We'd likely run into more JSDOM issues.
  el.id = id
  el.value = 'filled'
  el.readOnly = false
  el.getValue = () => 'filled'
  el.getPrompts = () => Object.keys(champValues)
  el.getPromptValue = (key: string) => champValues[key] ?? ''
  el.setPromptState = () => {}
  return el
}

/**
 * Injects minimal DOM elements for verifying a single mathlive/texte question.
 *
 * MathaleaCustomElement verifiers read the wrapper first, then the legacy
 * internal field id `champTexteEx${exIdx}Q${qIdx}`.
 */
export function injectMathLiveDOM(
  exerciceIndex: number,
  questionIndex: number,
  answer: string,
) {
  const inputId = `champTexteEx${exerciceIndex}Q${questionIndex}`
  const mathfieldWrapperId = `mathalea-mathfieldEx${exerciceIndex}Q${questionIndex}`
  const textfieldWrapperId = `mathalea-textfieldEx${exerciceIndex}Q${questionIndex}`
  const resultId = `resultatCheckEx${exerciceIndex}Q${questionIndex}`
  const feedbackId = `feedbackEx${exerciceIndex}Q${questionIndex}`

  document.getElementById(inputId)?.remove()
  document.getElementById(mathfieldWrapperId)?.remove()
  document.getElementById(textfieldWrapperId)?.remove()
  document.getElementById(resultId)?.remove()
  document.getElementById(feedbackId)?.remove()

  const mathfieldWrapper = document.createElement('mathalea-mathfield')
  mathfieldWrapper.id = mathfieldWrapperId
  mathfieldWrapper.setAttribute('mathfield-id', inputId)
  document.body.appendChild(mathfieldWrapper)

  const textfieldWrapper = document.createElement('mathalea-textfield')
  textfieldWrapper.id = textfieldWrapperId
  textfieldWrapper.setAttribute('input-id', inputId)
  document.body.appendChild(textfieldWrapper)

  const input = document.createElement('input') as HTMLInputElement & {
    getValue: () => string
  }
  input.id = inputId
  input.value = answer
  input.getValue = () => answer
  Object.defineProperty(input, 'readOnly', { value: false, writable: true })
  mathfieldWrapper.appendChild(input)

  const resultSpan = document.createElement('span')
  resultSpan.id = resultId
  document.body.appendChild(resultSpan)

  const feedbackDiv = document.createElement('div')
  feedbackDiv.id = feedbackId
  document.body.appendChild(feedbackDiv)
}

/**
 * Injects a math-field for custom corrections that rely on prompt values.
 * Used by exercises such as 5N11-3 that query `math-field#champTexteEx...`.
 */
export function injectCustomMathPromptDOM(
  exerciceIndex: number,
  questionIndex: number,
  promptValues: Record<string, string>,
) {
  const inputId = `champTexteEx${exerciceIndex}Q${questionIndex}`
  const resultId = `resultatCheckEx${exerciceIndex}Q${questionIndex}`
  const feedbackId = `feedbackEx${exerciceIndex}Q${questionIndex}`

  document.getElementById(inputId)?.remove()
  document.getElementById(resultId)?.remove()
  document.getElementById(feedbackId)?.remove()

  const mf = createFakeMfe(inputId, promptValues)
  document.body.appendChild(mf)

  const resultSpan = document.createElement('span')
  resultSpan.id = resultId
  document.body.appendChild(resultSpan)

  const feedbackDiv = document.createElement('div')
  feedbackDiv.id = feedbackId
  document.body.appendChild(feedbackDiv)
}

/**
 * Injects DOM for a fillInTheBlank question.
 * Creates a fake MathfieldElement with getPromptValue/setPromptState.
 */
export function injectFillInTheBlankDOM(
  exerciceIndex: number,
  questionIndex: number,
  champValues: Record<string, string>,
) {
  const inputId = `champTexteEx${exerciceIndex}Q${questionIndex}`
  const wrapperId = `fill-in-the-blankEx${exerciceIndex}Q${questionIndex}`
  const resultId = `resultatCheckEx${exerciceIndex}Q${questionIndex}`
  const feedbackId = `feedbackEx${exerciceIndex}Q${questionIndex}`

  document.getElementById(inputId)?.remove()
  document.getElementById(wrapperId)?.remove()
  document.getElementById(resultId)?.remove()
  document.getElementById(feedbackId)?.remove()

  const wrapper = document.createElement('fill-in-the-blank')
  wrapper.id = wrapperId
  wrapper.setAttribute('mathfield-id', inputId)
  document.body.appendChild(wrapper)

  const fakeMfe = createFakeMfe(inputId, champValues)
  wrapper.appendChild(fakeMfe)

  const resultSpan = document.createElement('span')
  resultSpan.id = resultId
  document.body.appendChild(resultSpan)

  const feedbackDiv = document.createElement('div')
  feedbackDiv.id = feedbackId
  document.body.appendChild(feedbackDiv)
}

/**
 * Injects DOM for a tableauMathlive question.
 * Each cell has its own input: champTexteEx{exIdx}Q{qIdx}L{row}C{col}
 * The tableau-mathlive verifier reads the wrapper, then queries the table and
 * math-field elements inside. We use a <table> with fake MathfieldElements.
 */
export function injectTableauMathliveDOM(
  exerciceIndex: number,
  questionIndex: number,
  cellValues: Record<string, string>,
) {
  const resultId = `resultatCheckEx${exerciceIndex}Q${questionIndex}`
  const feedbackId = `feedbackEx${exerciceIndex}Q${questionIndex}`
  const wrapperId = `tableau-mathliveEx${exerciceIndex}Q${questionIndex}`
  document.getElementById(resultId)?.remove()
  document.getElementById(feedbackId)?.remove()
  document.getElementById(wrapperId)?.remove()

  const tableId = `tabMathliveEx${exerciceIndex}Q${questionIndex}`
  document.getElementById(tableId)?.remove()
  const wrapper = document.createElement('tableau-mathlive')
  wrapper.id = wrapperId
  wrapper.setAttribute('table-id', tableId)
  document.body.appendChild(wrapper)
  const table = document.createElement('table')
  table.id = tableId
  wrapper.appendChild(table)
  const fakeInputs: MathfieldElement[] = []
  const originalQuerySelectorAll = table.querySelectorAll.bind(table)

  table.querySelectorAll = ((selectors: string) => {
    if (selectors === 'math-field') {
      return fakeInputs as unknown as NodeListOf<Element>
    }
    return originalQuerySelectorAll(selectors)
  }) as typeof table.querySelectorAll

  for (const [key, value] of Object.entries(cellValues)) {
    const cellId = `champTexteEx${exerciceIndex}Q${questionIndex}${key}`
    document.getElementById(cellId)?.remove()

    const input = createFakeMfe(cellId)
    input.value = value
    input.getValue = () => value
    table.appendChild(input)
    fakeInputs.push(input)

    const cellResultId = `resultatCheckEx${exerciceIndex}Q${questionIndex}${key}`
    document.getElementById(cellResultId)?.remove()
    const cellResult = document.createElement('span')
    cellResult.id = cellResultId
    table.appendChild(cellResult)
  }

  const resultSpan = document.createElement('span')
  resultSpan.id = resultId
  document.body.appendChild(resultSpan)

  const feedbackDiv = document.createElement('div')
  feedbackDiv.id = feedbackId
  document.body.appendChild(feedbackDiv)
}

/**
 * Injects DOM for QCM questions.
 * Checkboxes: #checkEx{exIdx}Q{qIdx}R{propIdx}
 * Labels: #labelEx{exIdx}Q{qIdx}R{propIdx}
 */
export function injectQcmDOM(
  exerciceIndex: number,
  questionIndex: number,
  propositions: { statut?: boolean | number | string }[],
  isRadio: boolean = false,
) {
  const resultId = `resultatCheckEx${exerciceIndex}Q${questionIndex}`
  document.getElementById(resultId)?.remove()

  for (let r = 0; r < propositions.length; r++) {
    const checkId = `checkEx${exerciceIndex}Q${questionIndex}R${r}`
    const labelId = `labelEx${exerciceIndex}Q${questionIndex}R${r}`
    document.getElementById(checkId)?.remove()
    document.getElementById(labelId)?.remove()

    const checkbox = document.createElement('input')
    checkbox.type = isRadio ? 'radio' : 'checkbox'
    checkbox.id = checkId
    checkbox.name = `checkEx${exerciceIndex}Q${questionIndex}`
    checkbox.checked = Boolean(propositions[r].statut)
    document.body.appendChild(checkbox)

    const label = document.createElement('label')
    label.id = labelId
    document.body.appendChild(label)

    const feedbackId = `feedbackEx${exerciceIndex}Q${questionIndex}R${r}`
    document.getElementById(feedbackId)?.remove()
    const feedbackDiv = document.createElement('div')
    feedbackDiv.id = feedbackId
    document.body.appendChild(feedbackDiv)
  }

  const globalFeedbackId = `feedbackEx${exerciceIndex}Q${questionIndex}`
  document.getElementById(globalFeedbackId)?.remove()
  const globalFeedback = document.createElement('div')
  globalFeedback.id = globalFeedbackId
  document.body.appendChild(globalFeedback)

  const resultSpan = document.createElement('span')
  resultSpan.id = resultId
  document.body.appendChild(resultSpan)
}

/**
 * Injects DOM for listeDeroulante questions.
 * Custom element <liste-deroulante> with id ex{exIdx}Q{qIdx}.
 */
export function injectListeDeroulanteDOM(
  exerciceIndex: number,
  questionIndex: number,
  selectedValue: string,
) {
  const selectId = `ex${exerciceIndex}Q${questionIndex}`
  const resultId = `resultatCheckEx${exerciceIndex}Q${questionIndex}`
  document.getElementById(selectId)?.remove()
  document.getElementById(resultId)?.remove()

  const fakeDropdown = document.createElement(
    'div',
  ) as unknown as ListeDeroulanteElement // A real ListeDeroulanteElement would require a lot of DOM logic (shadow DOM, show(), hide(), focus(), renderMathInElement) which doesn't belong in a unit test simulator. We'd likely run into more JSDOM issues.)
  fakeDropdown.id = selectId
  document.body.appendChild(fakeDropdown)
  fakeDropdown.value = selectedValue

  const resultSpan = document.createElement('span')
  resultSpan.id = resultId
  document.body.appendChild(resultSpan)
}

/**
 * Injects DOM for svg-selection questions.
 * verifQuestionSvgSelection() reads #svg-selectionEx{exIdx}Q{qIdx}.value and
 * writes feedback to #resultatCheckEx{exIdx}Q{qIdx}.
 */
export function injectSvgSelectionDOM(
  exerciceIndex: number,
  questionIndex: number,
  selectedValue: string,
) {
  const selectId = `svg-selectionEx${exerciceIndex}Q${questionIndex}`
  const resultId = `resultatCheckEx${exerciceIndex}Q${questionIndex}`
  document.getElementById(selectId)?.remove()
  document.getElementById(resultId)?.remove()

  const input = document.createElement('input')
  input.id = selectId
  input.value = selectedValue
  document.body.appendChild(input)

  const resultSpan = document.createElement('span')
  resultSpan.id = resultId
  document.body.appendChild(resultSpan)
}

/**
 * Injects DOM for custom interactive clock questions.
 * correctionInteractive() expects #clockEx{exIdx}Q{qIdx} with hour/minute attrs.
 */
export function injectInteractiveClockDOM(
  exerciceIndex: number,
  questionIndex: number,
  hour: string,
  minute: string,
) {
  const id = `interactive-clockEx${exerciceIndex}Q${questionIndex}`
  document.getElementById(id)?.remove()

  const wrapper = document.createElement('div')
  const clock = document.createElement('div') as HTMLElement & {
    isDynamic?: boolean
  }
  clock.id = id
  clock.setAttribute('hour', hour)
  clock.setAttribute('minute', minute)
  clock.isDynamic = true

  wrapper.appendChild(clock)
  document.body.appendChild(wrapper)
}

/**
 * Injects DOM for MetaInteractif2d questions.
 * Inputs are individual math-field-like elements:
 * #MetaInteractif2dEx{exIdx}Q{qIdx}field{n}
 */
export function injectMetaInteractif2dDOM(
  exerciceIndex: number,
  questionIndex: number,
  fieldValues: Record<string, string>,
) {
  const resultId = `resultatCheckEx${exerciceIndex}Q${questionIndex}`
  const feedbackId = `feedbackEx${exerciceIndex}Q${questionIndex}`

  document.getElementById(resultId)?.remove()
  document.getElementById(feedbackId)?.remove()

  for (const [fieldKey, value] of Object.entries(fieldValues)) {
    const index = fieldKey.replace('field', '')
    const inputId = `MetaInteractif2dEx${exerciceIndex}Q${questionIndex}field${index}`
    document.getElementById(inputId)?.remove()

    const input = createFakeMfe(inputId, {
      champ1: value,
    }) as unknown as MathfieldElement
    input.id = inputId
    document.body.appendChild(input)
  }

  const resultSpan = document.createElement('span')
  resultSpan.id = resultId
  document.body.appendChild(resultSpan)

  const feedbackDiv = document.createElement('div')
  feedbackDiv.id = feedbackId
  document.body.appendChild(feedbackDiv)
}

/**
 * Injects DOM for multiMathfield questions.
 * Creates a host element with the expected shadow DOM structure used by
 * MultiMathfieldElement.verifQuestion().
 */
export function injectMultiMathfieldDOM(
  exerciceIndex: number,
  questionIndex: number,
  fieldValues: Record<string, string>,
) {
  const multiId = `multiMathfieldEx${exerciceIndex}Q${questionIndex}`
  const resultId = `resultatCheckEx${exerciceIndex}Q${questionIndex}`
  const feedbackId = `feedbackEx${exerciceIndex}Q${questionIndex}`

  document.getElementById(multiId)?.remove()
  document.getElementById(resultId)?.remove()
  document.getElementById(feedbackId)?.remove()

  const host = document.createElement('div')
  host.id = multiId
  host.setAttribute(
    'data-template',
    Object.keys(fieldValues)
      .map((field) => `%{${field}}`)
      .join(' '),
  )
  const shadowRoot = host.attachShadow({ mode: 'open' })

  for (const [fieldKey, value] of Object.entries(fieldValues)) {
    const input = createFakeMfe(`${multiId}-${fieldKey}`)
    input.id = `${multiId}-${fieldKey}`
    input.setAttribute('data-name', fieldKey)
    input.value = value
    input.getValue = () => value
    shadowRoot.appendChild(input)

    const checkSpan = document.createElement('span')
    checkSpan.id = `check-${multiId}-${fieldKey}`
    shadowRoot.appendChild(checkSpan)
  }

  document.body.appendChild(host)

  const resultSpan = document.createElement('span')
  resultSpan.id = resultId
  document.body.appendChild(resultSpan)

  const feedbackDiv = document.createElement('div')
  feedbackDiv.id = feedbackId
  document.body.appendChild(feedbackDiv)
}

/**
 * Injects DOM for cliqueFigure questions.
 * Each clickable figure is represented by an element carrying its `etat`.
 */
export function injectCliqueFigureDOM(
  exerciceIndex: number,
  questionIndex: number,
  figures: Array<{ id: string; solution: boolean }>,
) {
  const resultId = `resultatCheckEx${exerciceIndex}Q${questionIndex}`
  document.getElementById(resultId)?.remove()

  for (const figure of figures) {
    document.getElementById(figure.id)?.remove()
    const el = document.createElement('div') as HTMLDivElement & {
      etat?: boolean
      hasMathaleaListener?: boolean
    }
    el.id = figure.id
    el.etat = figure.solution
    el.hasMathaleaListener = true
    document.body.appendChild(el)
  }

  const resultSpan = document.createElement('span')
  resultSpan.id = resultId
  document.body.appendChild(resultSpan)
}

/**
 * Injects DOM for dnd questions.
 * Creates the drop zone and pre-fills each rectangle with the expected label ids.
 */
export function injectDndDOM(
  exerciceIndex: number,
  questionIndex: number,
  valeur: Record<
    string,
    {
      value?: string | string[]
      options?: { multi?: boolean }
    }
  >,
) {
  const rectanglesId = `rectanglesEx${exerciceIndex}Q${questionIndex}`
  const resultId = `resultatCheckEx${exerciceIndex}Q${questionIndex}`
  const feedbackId = `feedbackEx${exerciceIndex}Q${questionIndex}`

  document.getElementById(rectanglesId)?.remove()
  document.getElementById(resultId)?.remove()
  document.getElementById(feedbackId)?.remove()

  const rectangles = document.createElement('div')
  rectangles.id = rectanglesId
  document.body.appendChild(rectangles)

  const rectangleEntries = Object.entries(valeur)
    .filter(([key]) => /^rectangle\d+$/.test(key))
    .sort((a, b) => {
      const na = Number(a[0].replace('rectangle', ''))
      const nb = Number(b[0].replace('rectangle', ''))
      return na - nb
    })

  for (const [key, answer] of rectangleEntries) {
    const rectangleNumber = key.replace('rectangle', '')
    const rectangle = document.createElement('div')
    rectangle.id = `rectangleEx${exerciceIndex}Q${questionIndex}R${rectangleNumber}`
    rectangle.classList.add('rectangleDND')
    rectangles.appendChild(rectangle)

    if (answer?.value == null) continue
    const expected = Array.isArray(answer.value)
      ? String(answer.value[0] ?? '')
      : String(answer.value)
    if (expected.length === 0) continue

    const ids =
      answer?.options?.multi === true ? expected.split('|') : [expected]
    for (const id of ids) {
      const label = document.createElement('div')
      label.id = `etiquetteEx${exerciceIndex}Q${questionIndex}I${id}`
      label.classList.add('etiquette', 'bg-gray-200')
      label.textContent = id
      label.innerText = id
      rectangle.appendChild(label)
    }
  }

  const resultSpan = document.createElement('span')
  resultSpan.id = resultId
  document.body.appendChild(resultSpan)

  const feedbackDiv = document.createElement('div')
  feedbackDiv.id = feedbackId
  document.body.appendChild(feedbackDiv)
}

function tableurRefToCoords(ref: string): { col: number; row: number } | null {
  const match = ref.toUpperCase().match(/^([A-Z]+)(\d+)$/)
  if (!match) return null
  let col = 0
  for (const char of match[1]) {
    col = col * 26 + (char.charCodeAt(0) - 64)
  }
  return { col: col - 1, row: Number(match[2]) - 1 }
}

function extractTableurMaxCoords(
  goodAnswers: GoodAnswersFormulas,
  testDatas: SheetTestDatas,
): { maxCol: number; maxRow: number } {
  let maxCol = 0
  let maxRow = 0
  const update = (ref: string) => {
    const coords = tableurRefToCoords(ref)
    if (!coords) return
    maxCol = Math.max(maxCol, coords.col)
    maxRow = Math.max(maxRow, coords.row)
  }

  for (const answer of goodAnswers) update(answer.ref)
  for (const test of testDatas) {
    if (test.ref.includes(':')) {
      const [start, end] = test.ref.split(':')
      update(start)
      update(end)
    } else {
      update(test.ref)
    }
  }

  return { maxCol: Math.max(maxCol, 3), maxRow: Math.max(maxRow, 3) }
}

/**
 * Injects a real my-spreadsheet custom element and pre-fills it with expected answers.
 * This allows verifQuestionTableur() to run as in production.
 */
export function injectTableurDOM(
  exerciceIndex: number,
  questionIndex: number,
  goodAnswers: GoodAnswersFormulas,
  testDatas: SheetTestDatas,
) {
  const sheetId = `sheet-Ex${exerciceIndex}Q${questionIndex}`
  document.getElementById(sheetId)?.remove()

  const { maxCol, maxRow } = extractTableurMaxCoords(goodAnswers, testDatas)
  const colCount = maxCol + 1
  const rowCount = maxRow + 1
  const data = Array.from({ length: rowCount }, () => Array(colCount).fill(''))
  const columns = Array.from({ length: colCount }, () => ({ width: 90 }))

  const sheet = MySpreadsheetElement.createEltToAppendToDom({
    id: sheetId,
    data,
    minDimensions: [colCount, rowCount],
    columns,
    interactif: false,
    showVerifyButton: false,
  })
  document.body.appendChild(sheet)

  for (const answer of goodAnswers) {
    const coords = tableurRefToCoords(answer.ref)
    if (!coords) continue
    if (answer.formula != null) {
      sheet.setCellFormula(coords.col, coords.row, answer.formula)
    } else if (answer.value !== undefined) {
      sheet.setCellValue(coords.col, coords.row, answer.value)
    }
  }
}

/**
 * Clears all injected DOM elements.
 */
export function clearDOM() {
  document.body.innerHTML = ''
}
