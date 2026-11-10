import { afterEach, describe, expect, it } from 'vitest'
import { installReadOnlyFeedback } from './tableurLectureSeule'

let cleanup = () => {}
afterEach(() => {
  cleanup()
  document.body.innerHTML = ''
})

function setup(fullyReadOnly = true) {
  document.body.innerHTML =
    '<div id="sheet"><input class="barre-formule-saisie" readonly><table><tbody><tr><td data-x="0" data-y="0">A1</td><td data-x="1" data-y="0">B1</td></tr></tbody></table></div><input id="answer">'
  const host = document.querySelector<HTMLElement>('#sheet')!
  let selected = { col: 0, row: 0 }
  cleanup = installReadOnlyFeedback(
    host,
    fullyReadOnly,
    () => selected,
    (col) => fullyReadOnly || col === 0,
  )
  const status = host.querySelector<HTMLElement>('[role="status"]')!
  const key = (target: Element, key: string, ctrlKey = false) =>
    target.dispatchEvent(
      new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        key,
        ctrlKey,
      }),
    )
  return {
    host,
    status,
    key,
    select: (col: number) => {
      selected = { col, row: 0 }
    },
  }
}

describe('tableur en lecture seule', () => {
  it('affiche un cadenas accessible et permet de sélectionner une cellule', () => {
    const { host, status } = setup()
    expect(host.querySelector('.tableur-lecture-seule')?.textContent).toContain(
      '🔒',
    )
    expect(host.querySelector('table')?.getAttribute('aria-readonly')).toBe(
      'true',
    )
    expect(host.tabIndex).toBe(0)
    expect(
      host
        .querySelector('td')!
        .dispatchEvent(
          new MouseEvent('mousedown', { bubbles: true, cancelable: true }),
        ),
    ).toBe(true)
    expect(document.activeElement).toBe(host)
    expect(status.hidden).toBe(true)
  })
  it('bloque la saisie et annonce pourquoi, y compris dans la barre de formule', () => {
    const { host, status, key } = setup()
    for (const target of [host, host.querySelector('input')!]) {
      for (const character of ['a', 'Delete', 'Backspace', 'Enter', 'F2'])
        expect(key(target, character)).toBe(false)
    }
    expect(status.hidden).toBe(false)
    expect(status.textContent).toContain('Saisir la réponse sous le tableau.')
  })
  it('signale aussi le double clic, le collage et la saisie mobile', () => {
    const { host, status } = setup()
    for (const type of ['dblclick', 'paste', 'beforeinput']) {
      expect(
        host
          .querySelector('td')!
          .dispatchEvent(new Event(type, { bubbles: true, cancelable: true })),
      ).toBe(false)
    }
    expect(status.hidden).toBe(false)
  })
  it('laisse passer navigation, copie et saisie dans la réponse extérieure', () => {
    const { host, status, key } = setup()
    for (const character of ['ArrowDown', 'Tab', 'Escape'])
      expect(key(host, character)).toBe(true)
    expect(key(host, 'c', true)).toBe(true)
    expect(key(document.querySelector('#answer')!, 'a')).toBe(true)
    expect(status.hidden).toBe(true)
  })
  it('distingue les cellules protégées des cellules modifiables', () => {
    const { host, status, key, select } = setup(false)
    expect(host.querySelector('.tableur-lecture-seule')).toBeNull()
    expect(key(host.querySelector('input')!, 'a')).toBe(false)
    expect(status.textContent).toContain('Cette cellule')
    select(1)
    expect(key(host.querySelector('input')!, 'a')).toBe(true)
    expect(
      host
        .querySelectorAll('td')[1]
        .dispatchEvent(
          new Event('dblclick', { bubbles: true, cancelable: true }),
        ),
    ).toBe(true)
  })
  it('retire les événements et les indications quand le tableur est démonté', () => {
    const { host, key } = setup()
    cleanup()
    expect(key(host, 'a')).toBe(true)
    expect(host.querySelector('[role="status"]')).toBeNull()
    expect(host.hasAttribute('tabindex')).toBe(false)
  })
})
