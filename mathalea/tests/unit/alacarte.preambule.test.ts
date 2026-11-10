import { describe, expect, it } from 'vitest'
import Exercice from '../../src/exercices/Exercice'
import { generateLatex } from '../../src/lib/alacarte'

class ExerciceAccolade extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    this.listeQuestions = [
      '\\begin{tikzpicture}\\draw[decorate,decoration={brace,amplitude=10pt}] (0,0) -- (3,0);\\end{tikzpicture}',
      'Calculer $\\num{12345}$ et placer \\tkzText',
    ]
    this.listeCorrections = ['Correction', 'Correction']
  }
}

describe('LaTeX de la page « à la carte »', () => {
  const exo = new ExerciceAccolade()
  exo.nouvelleVersion()
  const latex = generateLatex(
    { items: { a: 'x' }, documents: [{ title: 'DS', items: ['a'] }] },
    { a: [exo] },
  )
  const preambule = latex.slice(0, latex.indexOf('\\begin{document}'))

  it('charge les bibliothèques TikZ et packages nécessaires au contenu', () => {
    expect(latex).toContain('decoration={brace,')
    expect(preambule).toContain('\\usetikzlibrary {decorations.pathreplacing}')
    expect(preambule).toContain('\\usepackage{tkz-euclide}')
    expect(preambule).toContain('\\usepackage{siunitx}')
  })

  it("n'a qu'un seul chargement de xcolor et le titre est substitué", () => {
    expect(preambule.match(/\{xcolor\}/g)).toHaveLength(1)
    expect(preambule).toContain('\\fancyhead[C]{Évaluation à la carte}')
  })
})
