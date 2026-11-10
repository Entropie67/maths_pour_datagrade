import type { MathfieldElement } from 'mathlive'
import { describe, expect, it, vi } from 'vitest'
import { handleMathfieldPowerKeydown } from './mathfieldPowerKey'

function keydown(key: string, code: string, options: KeyboardEventInit = {}) {
  const event = new KeyboardEvent('keydown', {
    key,
    code,
    cancelable: true,
    ...options,
  })
  const executeCommand = vi.fn()
  const mf = {
    isSelectionEditable: true,
    mode: 'math',
    executeCommand,
  } as unknown as MathfieldElement
  handleMathfieldPowerKeydown(event, mf)
  return { event, executeCommand }
}

describe('touche puissance des champs MathLive', () => {
  it.each([
    ['^', 'Slash'],
    ['^', 'Digit6'],
  ])('insère une puissance avec %s sur %s', (key, code) => {
    const { event, executeCommand } = keydown(key, code)
    expect(event.defaultPrevented).toBe(true)
    expect(executeCommand).toHaveBeenCalledWith('moveToSuperscript')
  })

  it('laisse le système composer la touche morte ^ sans ajouter de puissance', () => {
    const { event, executeCommand } = keydown('Dead', 'BracketLeft')
    expect(event.defaultPrevented).toBe(false)
    expect(executeCommand).not.toHaveBeenCalled()
  })

  it('empêche MathLive de traiter la touche morte ^ comme un raccourci', () => {
    const event = new KeyboardEvent('keydown', {
      key: 'Dead',
      code: 'BracketLeft',
      cancelable: true,
    })
    const stopPropagation = vi.spyOn(event, 'stopPropagation')
    handleMathfieldPowerKeydown(event, {
      isSelectionEditable: true,
      mode: 'math',
      executeCommand: vi.fn(),
    } as unknown as MathfieldElement)
    expect(stopPropagation).toHaveBeenCalled()
  })

  it.each([
    ['/', 'Slash', {}],
    ['Dead', 'BracketLeft', { shiftKey: true }],
    ['^', 'Slash', { ctrlKey: true }],
  ])('préserve les autres raccourcis (%s)', (key, code, options) => {
    const { event, executeCommand } = keydown(key, code, options)
    expect(event.defaultPrevented).toBe(false)
    expect(executeCommand).not.toHaveBeenCalled()
  })
})
