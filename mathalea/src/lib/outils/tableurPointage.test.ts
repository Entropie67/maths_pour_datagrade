import { afterEach, describe, expect, it, vi } from 'vitest'
import { installFormulaPointing } from './tableurPointage'

let cleanup = () => {}
afterEach(() => {
  cleanup()
  document.body.innerHTML = ''
})

function setup(value = '=') {
  document.body.innerHTML =
    '<input><div><table><tbody><tr><td data-x="1" data-y="1">B2</td><td data-x="1" data-y="5">B6</td><td data-x="2" data-y="2">C3</td></tr></tbody></table></div>'
  const input = document.querySelector('input')!
  const container = document.querySelector('div')!
  input.value = value
  input.focus()
  input.setSelectionRange(value.length, value.length)
  cleanup = installFormulaPointing(container, input)
  const cell = (name: string) =>
    Array.from(container.querySelectorAll('td')).find(
      (td) => td.textContent === name,
    )!
  const mouse = (type: string, name: string, shiftKey = false) =>
    cell(name).dispatchEvent(
      new MouseEvent(type, { bubbles: true, cancelable: true, shiftKey }),
    )
  const click = (name: string, shiftKey = false) => {
    mouse('mousedown', name, shiftKey)
    mouse('mouseup', name)
  }
  const key = (key: string) =>
    input.dispatchEvent(
      new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }),
    )
  return { input, container, click, mouse, key }
}

describe('pointage dans la barre de formule', () => {
  it('intercepte le clic et remplace la référence sans perdre le focus', () => {
    const { input, container, click } = setup('=SOMME(')
    const select = vi.fn()
    container.addEventListener('mousedown', select)
    click('B2')
    click('C3')
    expect(input.value).toBe('=SOMME(C3')
    expect(document.activeElement).toBe(input)
    expect(select).not.toHaveBeenCalled()
  })
  it('insère au curseur en conservant la suite de la formule', () => {
    const { input, click } = setup('=2+*3')
    input.setSelectionRange(3, 3)
    click('B2')
    expect(input.value).toBe('=2+B2*3')
  })
  it('reprend le comportement habituel après un opérande, une saisie ou une validation', () => {
    const { input, mouse, click, key } = setup('=B2*3')
    expect(mouse('mousedown', 'B2')).toBe(true)
    input.value = '='
    input.setSelectionRange(1, 1)
    click('B2')
    input.dispatchEvent(new Event('input'))
    expect(mouse('mousedown', 'C3')).toBe(true)
    input.value = '='
    input.setSelectionRange(1, 1)
    click('B2')
    key('Enter')
    input.blur()
    expect(mouse('mousedown', 'C3')).toBe(true)
  })
  it('construit une plage par glisser ou Maj+clic, dans les deux sens', () => {
    const { input, mouse, click } = setup()
    mouse('mousedown', 'B6')
    mouse('mousemove', 'B2')
    mouse('mouseup', 'B2')
    expect(input.value).toBe('=B2:B6')
    click('C3', true)
    expect(input.value).toBe('=B3:C6')
    click('B2')
    expect(input.value).toBe('=B2')
  })
  it('fait tourner les dollars sur les références et les plages', () => {
    const { input, click, key } = setup()
    click('B2')
    for (const ref of ['$B$2', 'B$2', '$B2', 'B2']) {
      key('F4')
      expect(input.value).toBe(`=${ref}`)
    }
    click('B6', true)
    key('F4')
    expect(input.value).toBe('=$B$2:$B$6')
    key('F4')
    expect(input.value).toBe('=B$2:B$6')
    click('C3')
    expect(input.value).toBe('=C3')
  })
  it('modifie aussi une référence tapée au milieu de la formule', () => {
    const { input, key } = setup('=B2+C3')
    input.setSelectionRange(2, 2)
    key('F4')
    expect(input.value).toBe('=$B$2+C3')
  })
  it('respecte les chaînes, les fonctions, les cellules en lecture seule et les autres feuilles', () => {
    const { input, mouse, key } = setup('="B2+"')
    input.setSelectionRange(5, 5)
    key('F4')
    expect(input.value).toBe('="B2+"')
    expect(mouse('mousedown', 'B2')).toBe(true)
    input.value = '=LOG10(2)'
    input.setSelectionRange(5, 5)
    key('F4')
    expect(input.value).toBe('=LOG10(2)')
    input.value = '='
    input.setSelectionRange(1, 1)
    input.readOnly = true
    expect(mouse('mousedown', 'B2')).toBe(true)
    key('F4')
    expect(input.value).toBe('=')
  })
  it('retire les gestionnaires, y compris pendant un glisser', () => {
    const { input, mouse } = setup()
    mouse('mousedown', 'B2')
    cleanup()
    mouse('mousemove', 'B6')
    mouse('mouseup', 'B6')
    expect(input.value).toBe('=B2')
    expect(mouse('mousedown', 'C3')).toBe(true)
  })
})
