type Cell = { col: number; row: number }

/** Signale les tentatives de modification sans empêcher la sélection ni la copie. */
export function installReadOnlyFeedback(
  host: HTMLElement,
  fullyReadOnly: boolean,
  selectedCell: () => Cell | null,
  isReadOnly: (col: number, row: number) => boolean,
): () => void {
  const document = host.ownerDocument
  const status = document.createElement('div')
  status.className = 'tableur-lecture-seule-feedback'
  status.setAttribute('role', 'status')
  status.style.cssText = 'font-size:0.9rem;margin-top:0.25rem;color:#92400e;'
  status.hidden = true
  host.appendChild(status)

  let badge: HTMLElement | null = null
  if (fullyReadOnly) {
    badge = document.createElement('div')
    badge.className = 'tableur-lecture-seule'
    badge.textContent = '🔒 Tableur en lecture seule.'
    badge.style.cssText = 'font-size:0.85rem;margin-bottom:0.25rem;'
    host.insertBefore(badge, host.firstChild)
    host.tabIndex = 0
    host.querySelector('table')?.setAttribute('aria-readonly', 'true')
  }
  const lockedTarget = (target: EventTarget | null) => {
    if (!(target instanceof Element) || !host.contains(target)) return false
    const cell = target.closest<HTMLElement>('td[data-x][data-y]')
    if (cell) return isReadOnly(Number(cell.dataset.x), Number(cell.dataset.y))
    if (target.closest('.barre-formule-nom, button')) return false
    const selected = selectedCell()
    return (
      fullyReadOnly ||
      (selected != null && isReadOnly(selected.col, selected.row))
    )
  }
  const notify = (event: Event) => {
    if (!lockedTarget(event.target)) return
    event.preventDefault()
    event.stopPropagation()
    status.textContent = fullyReadOnly
      ? 'Ce tableur est en lecture seule. Saisir la réponse sous le tableau.'
      : 'Cette cellule est en lecture seule. Sélectionner une cellule modifiable.'
    status.hidden = false
  }
  const keydown = (event: KeyboardEvent) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return
    if (
      event.key.length === 1 ||
      ['Backspace', 'Delete', 'Enter', 'F2'].includes(event.key)
    )
      notify(event)
  }
  const focus = (event: MouseEvent) => {
    if (
      fullyReadOnly &&
      (event.target as Element).closest('td[data-x][data-y]')
    ) {
      host.focus({ preventScroll: true })
    }
  }
  document.addEventListener('keydown', keydown, true)
  host.addEventListener('mousedown', focus, true)
  host.addEventListener('dblclick', notify, true)
  host.addEventListener('paste', notify, true)
  host.addEventListener('beforeinput', notify, true)
  return () => {
    document.removeEventListener('keydown', keydown, true)
    host.removeEventListener('mousedown', focus, true)
    host.removeEventListener('dblclick', notify, true)
    host.removeEventListener('paste', notify, true)
    host.removeEventListener('beforeinput', notify, true)
    status.remove()
    badge?.remove()
    if (fullyReadOnly) host.removeAttribute('tabindex')
  }
}
