import { beforeEach, describe, expect, it } from 'vitest'
import Exercice from '../../src/exercices/Exercice'
import ExempleRelierEtiquettes from '../../src/exercices/modèlesExos/ExempleRelierEtiquettes'
import {
  listOfCustomElements,
  mathaleaCustomElementsRegistry,
} from '../../src/lib/customElements/MathaleaCustomElement'
import {
  addRelierEtiquettes,
  parseLiens,
  RelierEtiquettesElement,
  toLatex,
  toTypst,
  type RelierEtiquettesConfig,
} from '../../src/lib/customElements/RelierEtiquettesElement'
import {
  exerciceInteractif,
  handleAnswers,
} from '../../src/lib/interactif/gestionInteractif'
import { mathaleaHandleExerciceSimple } from '../../src/lib/mathalea'
import {
  context,
  setOutputHtml,
  setOutputLatex,
} from '../../src/modules/context'

const gauche = ['positif', 'négatif']
const droite = ['$n \\geqslant 0$', '$n \\leqslant 0$']
const liensAttendus = [
  { gauche: 'G0', droite: 'D0' },
  { gauche: 'G1', droite: 'D1' },
]

const config: RelierEtiquettesConfig = {
  gauche: [
    { id: 'G0', texte: 'positif' },
    { id: 'G1', texte: 'négatif' },
  ],
  droite: [
    { id: 'D0', texte: '$n \\geqslant 0$' },
    { id: 'D1', texte: '$n \\leqslant 0$' },
  ],
  liens: liensAttendus,
  multiple: false,
}

function afficheQuestion(exercice: Exercice): RelierEtiquettesElement {
  document.body.innerHTML = addRelierEtiquettes(exercice, 0, {
    gauche,
    droite,
  })
  return document.querySelector('relier-etiquettes') as RelierEtiquettesElement
}

function clique(element: RelierEtiquettesElement, cote: string, id: string) {
  const bouton = element.querySelector<HTMLButtonElement>(
    `.relier-etiquettes__etiquette[data-cote="${cote}"][data-etiquette="${id}"]`,
  )!
  // detail: 0 → activation au clavier, chemin de code indépendant du pointeur.
  bouton.dispatchEvent(new MouseEvent('click', { detail: 0 }))
}

describe('RelierEtiquettesElement', () => {
  let exercice: Exercice

  beforeEach(() => {
    setOutputHtml()
    document.body.innerHTML = ''
    exercice = new Exercice()
    exercice.numeroExercice = 3
    exercice.nbQuestions = 1
    exercice.interactif = true
  })

  it('enregistre le tag dans les registres MathALÉA', () => {
    expect(customElements.get('relier-etiquettes')).toBe(
      RelierEtiquettesElement,
    )
    expect(listOfCustomElements).toContain('relier-etiquettes')
    expect(mathaleaCustomElementsRegistry.get('relier-etiquettes')).toBe(
      RelierEtiquettesElement,
    )
  })

  it('crée les conteneurs de résultat et de feedback', () => {
    const html = addRelierEtiquettes(exercice, 0, { gauche, droite })

    expect(html).toContain('<relier-etiquettes')
    expect(html).toContain('id="relier-etiquettesEx3Q0"')
    expect(html).toContain('id="resultatCheckEx3Q0"')
    expect(html).toContain('id="feedbackEx3Q0"')
  })

  it("n'ajoute pas de conteneur de résultat quand l'interactivité est coupée", () => {
    const html = addRelierEtiquettes(exercice, 0, {
      gauche,
      droite,
      interactivityOn: false,
    })

    expect(html).toContain('<relier-etiquettes')
    expect(html).not.toContain('resultatCheckEx3Q0')
  })

  it('construit une étiquette par contenu, réparties en deux colonnes', () => {
    const element = afficheQuestion(exercice)

    expect(
      element.querySelectorAll('.relier-etiquettes__etiquette'),
    ).toHaveLength(4)
    expect(
      element.querySelectorAll(
        '.relier-etiquettes__colonne--gauche .relier-etiquettes__etiquette',
      ),
    ).toHaveLength(2)
    expect(
      element.querySelector('[data-cote="droite"][data-etiquette="D0"]')
        ?.textContent,
    ).toBe('$n \\geqslant 0$')
  })

  it('relie deux étiquettes en deux clics et bascule le lien au clic suivant', () => {
    const element = afficheQuestion(exercice)

    clique(element, 'gauche', 'G0')
    clique(element, 'droite', 'D1')
    expect(element.value).toBe(JSON.stringify([{ gauche: 'G0', droite: 'D1' }]))

    clique(element, 'gauche', 'G0')
    clique(element, 'droite', 'D1')
    expect(element.value).toBe('[]')
  })

  it('remplace le lien existant hors mode multiple', () => {
    const element = afficheQuestion(exercice)

    clique(element, 'gauche', 'G0')
    clique(element, 'droite', 'D0')
    clique(element, 'gauche', 'G0')
    clique(element, 'droite', 'D1')

    expect(element.value).toBe(JSON.stringify([{ gauche: 'G0', droite: 'D1' }]))
  })

  it('restaure une copie avec le setter value et ignore les identifiants inconnus', () => {
    const element = afficheQuestion(exercice)

    element.value = JSON.stringify([
      ...liensAttendus,
      { gauche: 'G9', droite: 'D9' },
    ])

    expect(element.value).toBe(JSON.stringify(liensAttendus))
  })

  it('corrige la question, stocke la réponse et devient inerte', () => {
    handleAnswers(
      exercice,
      0,
      { reponse: { value: JSON.stringify(liensAttendus) } },
      { formatInteractif: 'relier-etiquettes' },
    )
    const element = afficheQuestion(exercice)
    clique(element, 'gauche', 'G0')
    clique(element, 'droite', 'D0')
    clique(element, 'gauche', 'G1')
    clique(element, 'droite', 'D1')

    const resultat = exerciceInteractif(
      exercice,
      document.createElement('div'),
      document.createElement('button'),
    )

    expect(resultat).toEqual({
      numberOfPoints: 2,
      numberOfQuestions: 2,
      perQuestionIsOk: [true],
    })
    expect(document.querySelector('#resultatCheckEx3Q0')?.innerHTML).toBe('😎')
    expect(exercice.answers?.['relier-etiquettesEx3Q0']).toBe(
      JSON.stringify(liensAttendus),
    )
    expect(element.interactivityOn).toBe(false)
    expect(
      element.querySelector<HTMLButtonElement>('.relier-etiquettes__etiquette')
        ?.disabled,
    ).toBe(true)
  })

  it('compte les liens justes quand la réponse est incomplète', () => {
    handleAnswers(
      exercice,
      0,
      { reponse: { value: JSON.stringify(liensAttendus) } },
      { formatInteractif: 'relier-etiquettes' },
    )
    const element = afficheQuestion(exercice)
    clique(element, 'gauche', 'G0')
    clique(element, 'droite', 'D0')

    const resultat = exerciceInteractif(
      exercice,
      document.createElement('div'),
      document.createElement('button'),
    )

    expect(resultat).toEqual({
      numberOfPoints: 1,
      numberOfQuestions: 2,
      perQuestionIsOk: [false],
    })
    expect(document.querySelector('#resultatCheckEx3Q0')?.innerHTML).toBe('☹️')
  })

  it('formate la réponse de l’élève pour les corrections de la CAN', () => {
    const questionHtml = addRelierEtiquettes(exercice, 0, { gauche, droite })

    expect(
      RelierEtiquettesElement.formatStudentAnswer(
        JSON.stringify([{ gauche: 'G0', droite: 'D1' }]),
        questionHtml,
      ),
    ).toBe('positif ↔ $n \\leqslant 0$')
    expect(RelierEtiquettesElement.formatStudentAnswer('[]')).toBe('aucun lien')
  })
})

describe('relier-etiquettes dans un exercice de type simple', () => {
  beforeEach(() => {
    setOutputHtml()
    document.body.innerHTML = ''
  })

  it('renumérote les identifiants et n’ajoute pas de champ MathLive', () => {
    const exercice = new ExempleRelierEtiquettes()
    exercice.nbQuestions = 2
    mathaleaHandleExerciceSimple(exercice, true, 0)

    expect(exercice.listeQuestions).toHaveLength(2)
    expect(exercice.listeQuestions[0]).toContain('id="relier-etiquettesEx0Q0"')
    expect(exercice.listeQuestions[0]).toContain('id="resultatCheckEx0Q0"')
    expect(exercice.listeQuestions[1]).toContain('id="relier-etiquettesEx0Q1"')
    expect(exercice.listeQuestions[1]).toContain('id="resultatCheckEx0Q1"')
    expect(exercice.listeQuestions.join('')).not.toContain('<math-field')
    expect(exercice.autoCorrection[1].formatInteractif).toBe(
      'relier-etiquettes',
    )
    expect(
      parseLiens(exercice.autoCorrection[1].valeur?.reponse?.value),
    ).toHaveLength(3)
  })
})

describe('Exports imprimés de relier-etiquettes', () => {
  beforeEach(() => {
    setOutputHtml()
  })

  it('produit un tikzpicture avec une étiquette par contenu et un trait par lien', () => {
    const latex = toLatex(config)

    expect(latex).toContain('\\begin{tikzpicture}')
    expect(latex).toContain('(relierG0) at (0,0) {positif}')
    expect(latex).toContain('(relierD1) at (7.2,-2.3) {$n \\leqslant 0$}')
    expect(latex.match(/\\draw\[line width=1pt/g)).toHaveLength(2)
    expect(latex).toContain('(relierG0.east) -- (relierD0.west)')
  })

  it('produit un dessin Typst autonome avec les mêmes couleurs', () => {
    const typst = toTypst(config)

    expect(typst).toContain('#block(width: 295pt')
    expect(typst.match(/#place\(top \+ left, dx: /g)).toHaveLength(8)
    expect(typst).toContain('$n >= 0$')
    expect(typst).toContain('rgb("#2563eb")')
    expect(typst).not.toContain('#import')
  })

  it('rend le LaTeX quand le contexte de sortie n’est pas HTML', () => {
    setOutputLatex()
    const latex = RelierEtiquettesElement.create({
      numeroExercice: 3,
      questionIndex: 0,
      gauche,
      droite,
    })
    setOutputHtml()

    expect(latex).toContain('\\begin{tikzpicture}')
    expect(latex).not.toContain('<relier-etiquettes')
  })

  it('insère le marqueur Typst pendant un export Typst', () => {
    context.isTypst = true
    const sortie = RelierEtiquettesElement.create({
      numeroExercice: 3,
      questionIndex: 0,
      gauche,
      droite,
      liens: liensAttendus,
    })
    context.isTypst = false

    expect(sortie.startsWith('<mathalea-typst>')).toBe(true)
    expect(sortie).toContain('line(start:')
  })
})
