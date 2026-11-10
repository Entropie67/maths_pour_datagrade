import { afterEach, describe, expect, it } from 'vitest'
import operation, { additionMultiplePosee } from './operations'
import { context } from './context'
import { mathalea2d } from './mathalea2d'

const previousContext = {
  isHtml: context.isHtml,
}

afterEach(() => {
  context.isHtml = previousContext.isHtml
})

describe('mathalea2d layout options', () => {
  it('serializes the default HTML layout as block', () => {
    context.isHtml = true

    expect(mathalea2d()).toContain('style="display: block;"')
    expect(mathalea2d()).toContain(
      'style="position: relative; display: inline-block"',
    )
  })

  it.each([
    ['block', 'display: block'],
    ['inline', 'display: inline'],
    ['inline-block', 'display: inline-block'],
  ] as const)('serializes display %s in HTML', (display, expectedStyle) => {
    context.isHtml = true

    expect(mathalea2d({ display })).toContain(`style="${expectedStyle};"`)
  })

  it('serializes centered HTML layout with automatic margins', () => {
    context.isHtml = true

    const html = mathalea2d({ center: true })

    expect(html).toContain('style="display: block; margin: auto;"')
    expect(html).toContain(
      'style="position: relative; display: inline-block"',
    )
  })

  it('serializes display and center together in HTML', () => {
    context.isHtml = true

    const html = mathalea2d({ display: 'inline-block', center: true })

    expect(html).toContain('style="display: inline-block; margin: auto;"')
  })

  it('treats omitted display like block for LaTeX line breaks', () => {
    context.isHtml = false

    expect(mathalea2d()).toBe(mathalea2d({ display: 'block' }))
    expect(mathalea2d()).toMatch(/\\\\$/)
  })

  it('keeps center independent from LaTeX line-break semantics', () => {
    context.isHtml = false

    expect(mathalea2d({ center: true })).toBe(
      mathalea2d({ display: 'block', center: true }),
    )
    expect(mathalea2d({ center: true })).toMatch(/\\\\$/)
  })

  it.each(['inline', 'inline-block'] as const)(
    'does not add a LaTeX line break for display %s',
    (display) => {
      context.isHtml = false

      expect(mathalea2d({ display })).not.toMatch(/\\\\$/)
    },
  )

  it('keeps centerLatex suppressing the trailing LaTeX line break', () => {
    context.isHtml = false

    expect(mathalea2d({ centerLatex: true })).not.toMatch(/\\\\$/)
  })
})

describe('operation layout options', () => {
  it('forwards display and center from operation', () => {
    context.isHtml = true

    const html = operation({
      operande1: 12,
      operande2: 3,
      type: 'addition',
      display: 'inline-block',
      center: true,
    })

    expect(html).toContain('style="display: inline-block; margin: auto;"')
  })

  it('forwards display and center from additionMultiplePosee', () => {
    context.isHtml = true

    const html = additionMultiplePosee([1, 2, 3], {
      display: 'inline',
      center: true,
    })

    expect(html).toContain('style="display: inline; margin: auto;"')
  })
})

const operationOptions: Parameters<typeof operation>[0] = {
  operande1: 1,
  operande2: 2,
  // @ts-expect-error style is not part of operation layout options anymore
  style: 'display: inline-block',
}
void operationOptions

const additionMultipleOptions: Parameters<typeof additionMultiplePosee>[1] = {
  // @ts-expect-error style is not part of additionMultiplePosee layout options anymore
  style: 'display: inline-block',
}
void additionMultipleOptions

const mathalea2dOptions: Parameters<typeof mathalea2d>[0] = {
  // @ts-expect-error style is not part of mathalea2d layout options anymore
  style: 'display: inline-block',
}
void mathalea2dOptions
