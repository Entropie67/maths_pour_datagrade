import { afterEach, describe, expect, it } from 'vitest'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { diagrammeCirculaire } from './diagrammes'

const isHtmlInitial = context.isHtml

afterEach(() => {
  context.isHtml = isHtmlInitial
})

describe('diagrammeCirculaire', () => {
  it('ne produit pas de couleur de hachures vide dans la légende LaTeX', () => {
    context.isHtml = false
    const diagramme = diagrammeCirculaire({
      effectifs: [70, 30],
      labels: ['cuivre', 'zinc'],
      visibles: [true, true],
      remplissage: [true, true],
    })

    const latex = mathalea2d({}, diagramme)

    expect(latex).not.toContain('pattern color = ,')
    expect(latex).not.toContain('pattern = ]')
  })
})
