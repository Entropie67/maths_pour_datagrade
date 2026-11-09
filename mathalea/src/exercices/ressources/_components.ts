import { getUniqueStringBasedOnTimeStamp } from '../../lib/components/time'
export function createButon({ title = 'Valider' }: { title?: string } = {}) {
  const button = document.createElement('button')
  button.textContent = title
  button.setAttribute(
    'id',
    'html-insert-button' + getUniqueStringBasedOnTimeStamp('-'),
  )
  // button.classList.add('text-coopmaths-canvas', 'dark:text-coopmathsdark-canvas', 'bg-coopmaths-action', 'dark:bg-coopmathsdark-action', 'hover:bg-coopmaths-action-lightest', 'dark:hover:bg-coopmathsdark-action-lightest', 'p-2')
  return button
}

export function createTextInput({
  placeholder = '',
  autoCorrect = true,
}: { placeholder?: string; autoCorrect?: boolean } = {}) {
  const input = document.createElement('input')
  input.setAttribute('placeholder', placeholder)
  input.setAttribute(
    'id',
    'html-insert-text-input' + getUniqueStringBasedOnTimeStamp('-'),
  )
  input.classList.add(
    'm-2',
    'p-2',
    'border-2',
    'border-coopmaths-action',
    'dark:border-coopmathsdark-action',
    'focus:border-coopmaths-action-lightest',
    'dark:focus:border-coopmathsdark-action-lightest',
    'focus:outline-0',
    'focus:ring-0',
    'focus:border-1',
    'bg-coopmaths-canvas',
    'dark:bg-coopmathsdark-canvas',
    'text-coopmaths-corpus-light',
    'dark:text-coopmathsdark-corpus-light',
  )
  input.setAttribute('autocorrect', autoCorrect ? 'on' : 'off')
  input.setAttribute('spellcheck', autoCorrect ? 'true' : 'false')
  return input
}

export function createIButton({
  tooltip = '',
  direction,
}: { tooltip?: string; direction?: 'top' | 'bottom' | 'left' | 'right' } = {}) {
  // <i class="bx bx-sm px-2 bx-zoom-out hover:text-coopmaths-action-lightest text-coopmaths-action dark:text-coopmathsdark-action dark:hover:text-coopmathsdark-action-lightest" />
  const i = document.createElement('i')
  i.setAttribute(
    'id',
    'html-insert-info' + getUniqueStringBasedOnTimeStamp('-'),
  )
  i.classList.add('bx', 'bx-sm', 'bx-info-circle')
  i.setAttribute('aria-hidden', 'true')
  const button = document.createElement('button')
  button.appendChild(i)
  button.setAttribute('data-tip', tooltip)
  button.setAttribute('aria-label', tooltip || 'Information')
  button.classList.add(
    'tooltip',
    'before:whitespace-pre-wrap',
    'before:content-[attr(data-tip)]',
    'before:text-left',
  )
  if (direction !== undefined) {
    button.classList.add(`tooltip-${direction}`)
  }
  return button
}
