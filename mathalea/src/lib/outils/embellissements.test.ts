import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { htmlToTypst } from '../../components/setup/typst/latexToTypst'
import { context } from '../../modules/context'
import { bleuMathalea, orangeMathalea } from '../colors'
import { texteEnCarte } from './embellissements'

const previousContext = {
  isHtml: context.isHtml,
  isTypst: context.isTypst,
}

beforeEach(() => {
  context.isHtml = true
  context.isTypst = true
})

afterEach(() => {
  context.isHtml = previousContext.isHtml
  context.isTypst = previousContext.isTypst
})

describe('texteEnCarte', () => {
  it('produit une boîte Typst native pour une plaque', () => {
    const typst = htmlToTypst(texteEnCarte('25'))

    expect(typst).toContain('#box(width: 32pt, height: 30pt')
    expect(typst).toContain(`fill: rgb("${bleuMathalea}")`)
    expect(typst).toContain('#raw("25")')
  })

  it('distingue visuellement une carte cible', () => {
    const typst = htmlToTypst(texteEnCarte('7', true))

    expect(typst).toContain('#box(width: 24pt, height: 28pt')
    expect(typst).toContain(`fill: rgb("${orangeMathalea}")`)
  })
})
