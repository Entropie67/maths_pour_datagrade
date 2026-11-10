type Cell = { col: number; row: number }

function cellRef({ col, row }: Cell): string {
  let letters = ''
  for (let n = col + 1; n > 0; n = Math.floor((n - 1) / 26)) {
    letters = String.fromCharCode(65 + ((n - 1) % 26)) + letters
  }
  return `${letters}${row + 1}`
}

/** Garde la saisie dans la barre pendant le pointage, avant les événements du tableur. */
export function installFormulaPointing(
  container: HTMLElement,
  input: HTMLInputElement,
): () => void {
  let inserted: { start: number; end: number; anchor: Cell } | null = null
  let dragging = false
  const document = input.ownerDocument
  const reset = () => {
    inserted = null
  }
  const cellAt = (target: EventTarget | null): Cell | null => {
    const td =
      target instanceof Element
        ? target.closest<HTMLElement>('td[data-x][data-y]')
        : null
    if (!td || !container.contains(td)) return null
    return { col: Number(td.dataset.x), row: Number(td.dataset.y) }
  }
  const reusable = () =>
    inserted != null &&
    input.selectionStart === inserted.end &&
    input.selectionEnd === inserted.end
  const insideString = (position: number) =>
    (input.value.slice(0, position).match(/"/g)?.length ?? 0) % 2 === 1
  const canPoint = () => {
    if (
      input.readOnly ||
      document.activeElement !== input ||
      !input.value.startsWith('=')
    )
      return false
    if (reusable()) return true
    const position = input.selectionStart ?? 0
    const prefix = input.value.slice(0, position).trimEnd()
    return !insideString(position) && /[=+\-*/^(;,]$/.test(prefix)
  }
  const insert = (anchor: Cell, end: Cell) => {
    if (!inserted) return
    const first = {
      col: Math.min(anchor.col, end.col),
      row: Math.min(anchor.row, end.row),
    }
    const last = {
      col: Math.max(anchor.col, end.col),
      row: Math.max(anchor.row, end.row),
    }
    const reference =
      cellRef(first) +
      (first.col === last.col && first.row === last.row
        ? ''
        : `:${cellRef(last)}`)
    input.setRangeText(reference, inserted.start, inserted.end, 'end')
    inserted.end = inserted.start + reference.length
  }
  const stop = (event: Event) => {
    event.preventDefault()
    event.stopPropagation()
  }
  const move = (event: MouseEvent) => {
    if (!dragging || !inserted) return
    const cell = cellAt(event.target)
    if (cell) insert(inserted.anchor, cell)
    stop(event)
  }
  const up = (event: MouseEvent) => {
    move(event)
    dragging = false
    document.removeEventListener('mousemove', move, true)
    document.removeEventListener('mouseup', up, true)
  }
  const down = (event: MouseEvent) => {
    if (event.button !== 0 || !canPoint()) return
    const cell = cellAt(event.target)
    if (!cell) return
    if (!reusable()) {
      inserted = {
        start: input.selectionStart ?? 0,
        end: input.selectionEnd ?? 0,
        anchor: cell,
      }
    } else if (!event.shiftKey) {
      inserted!.anchor = cell
    }
    insert(inserted!.anchor, cell)
    dragging = true
    stop(event)
    document.addEventListener('mousemove', move, true)
    document.addEventListener('mouseup', up, true)
  }
  const keydown = (event: KeyboardEvent) => {
    if (event.key !== 'F4') {
      if (!['Shift', 'Control', 'Alt', 'Meta'].includes(event.key)) reset()
      return
    }
    if (input.readOnly || !input.value.startsWith('=') || event.isComposing)
      return
    const start = input.selectionStart ?? 0
    const end = input.selectionEnd ?? start
    const reference = Array.from(
      input.value.matchAll(
        /\$?[A-Za-z]+\$?[1-9]\d*(?::\$?[A-Za-z]+\$?[1-9]\d*)?/g,
      ),
    ).find((match) => {
      const index = match.index!
      return (
        start >= index &&
        end <= index + match[0].length &&
        !insideString(index) &&
        !/[\w$.]/.test(input.value[index - 1] ?? '') &&
        !/[\w$(]/.test(input.value[index + match[0].length] ?? '')
      )
    })
    if (!reference) return
    stop(event)
    const cycled = reference[0].replace(
      /(\$?)([A-Za-z]+)(\$?)(\d+)/g,
      (_, col, letters, row, number) => {
        // Libre → absolue → ligne bloquée → colonne bloquée → libre.
        const nextCol = !col
        const nextRow = (!col && !row) || Boolean(col && row)
        return `${nextCol ? '$' : ''}${letters}${nextRow ? '$' : ''}${number}`
      },
    )
    const wasReusable = reusable()
    input.setRangeText(
      cycled,
      reference.index,
      reference.index! + reference[0].length,
      'end',
    )
    if (wasReusable && inserted)
      inserted.end += cycled.length - reference[0].length
    else reset()
  }
  container.addEventListener('mousedown', down, true)
  input.addEventListener('input', reset)
  input.addEventListener('blur', reset)
  input.addEventListener('mousedown', reset)
  input.addEventListener('keydown', keydown)
  return () => {
    container.removeEventListener('mousedown', down, true)
    document.removeEventListener('mousemove', move, true)
    document.removeEventListener('mouseup', up, true)
    input.removeEventListener('input', reset)
    input.removeEventListener('blur', reset)
    input.removeEventListener('mousedown', reset)
    input.removeEventListener('keydown', keydown)
  }
}
