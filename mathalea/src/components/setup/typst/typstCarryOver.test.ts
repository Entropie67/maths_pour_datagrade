import { describe, expect, it } from 'vitest'
import {
  buildTypstDocument,
  defaultTypstDocumentOptions,
  harvestCarryOver,
  subjectEditorCode,
  swapExerciseFigures,
  type TypstCarryOver,
  type TypstExerciseInput,
} from './buildTypstDocument'
import { swapCarryOver } from './typstCarryOver'

const svg = '<svg width="60" height="30"><rect width="60" height="30"/></svg>'
const exercise = (
  questions: string[],
  corrections: string[] = [],
): TypstExerciseInput => ({
  ref: '5G3A-5',
  intro: '',
  questions,
  introCorrection: '',
  corrections,
  numbered: false,
})

function move(
  versions: TypstExerciseInput[][],
  carry: TypstCarryOver,
  a: number,
  b: number,
) {
  const remapped = swapCarryOver(
    swapExerciseFigures(carry, versions, defaultTypstDocumentOptions, a, b),
    a,
    b,
  )
  const reordered = versions.map((inputs) => {
    const copy = [...inputs]
    ;[copy[a - 1], copy[b - 1]] = [copy[b - 1], copy[a - 1]]
    return copy
  })
  return buildTypstDocument(
    reordered[0],
    { ...defaultTypstDocumentOptions, showExerciseTitles: true },
    remapped,
    reordered.slice(1),
  )
}

describe('déplacer un exercice Typst avec ses figures', () => {
  it('conserve les zooms, alignements et références avec des nombres de figures différents', () => {
    const versions = [
      [
        exercise([svg], [svg]),
        exercise([svg + svg + svg]),
        exercise(['Sans figure.']),
        exercise([svg]),
      ],
    ]
    const carry: TypstCarryOver = {
      figureZoom: { 1: 0.5, 2: 0.6, 3: 0.7, 4: 0.8, 5: 0.9, 6: 0.3 },
      figureAlign: { 1: 'left', 2: 'right', 4: 'left' },
      codeOverrides: { 1: '#fig-1' },
      codeOverridesCorrection: { 1: '#fig-2' },
      exerciseTitles: { 1: 'Triangle' },
    }
    const code = move(versions, carry, 1, 2)
    const restored = harvestCarryOver(code)
    expect(restored.figureZoom).toEqual({
      1: 0.7,
      2: 0.8,
      3: 0.9,
      4: 0.5,
      5: 0.6,
      6: 0.3,
    })
    expect(restored.figureAlign).toEqual({ 2: 'left', 4: 'left', 5: 'right' })
    expect(restored.codeOverrides).toEqual({ 2: '#fig-4' })
    expect(restored.codeOverridesCorrection).toEqual({ 2: '#fig-5' })
    expect(restored.exerciseTitles).toEqual({ 2: 'Triangle' })
    const reordered = [
      [versions[0][1], versions[0][0], ...versions[0].slice(2)],
    ]
    const reversed = harvestCarryOver(move(reordered, restored, 2, 1))
    expect(reversed.figureZoom).toEqual(carry.figureZoom)
    expect(reversed.codeOverrides).toEqual(carry.codeOverrides)
  })

  it('déplace une figure à travers un exercice sans figure', () => {
    const versions = [
      [exercise([svg]), exercise(['Sans figure.']), exercise([svg])],
    ]
    const code = move(versions, { figureZoom: { 1: 0.5, 2: 0.8 } }, 1, 2)
    expect(harvestCarryOver(code).figureZoom).toEqual({ 1: 0.5, 2: 0.8 })
  })

  it('respecte les figures propres aux sujets supplémentaires et leurs références locales', () => {
    const versions = [
      [exercise([svg]), exercise([svg + svg])],
      [exercise([svg + svg], [svg]), exercise([svg])],
    ]
    const code = move(
      versions,
      {
        figureZoom: { 1: 0.5, 2: 0.6, 3: 0.7, 4: 0.8, 6: 0.9, 7: 0.4 },
        figureAlign: { 4: 'right', 7: 'left' },
        versions: {
          1: {
            codeOverrides: { 1: '#fig-1 + fig-2' },
            codeOverridesCorrection: { 1: '#fig-3' },
          },
        },
      },
      1,
      2,
    )
    const restored = harvestCarryOver(code)
    expect(restored.figureZoom).toEqual({
      1: 0.6,
      2: 0.7,
      3: 0.5,
      4: 0.4,
      5: 0.8,
      6: 1,
      7: 0.9,
    })
    expect(restored.figureAlign).toMatchObject({ 4: 'left', 5: 'right' })
    expect(restored.versions?.[1].codeOverrides).toEqual({
      2: '#fig-2 + fig-3',
    })
    expect(restored.versions?.[1].codeOverridesCorrection).toEqual({
      2: '#fig-4',
    })
    expect(subjectEditorCode(code, 1)).toContain('#fig-5 + fig-6')
  })
})
