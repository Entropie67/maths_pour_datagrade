import { beforeAll, describe, expect, it } from 'vitest'

// L'import des customElements les enregistre dans mathaleaCustomElementsRegistry
// (comme le fait le chargement d'un exercice qui les utilise).
import '../../src/lib/apigeom/apigeom-figure'
import '../../src/lib/customElements/BlocklyEditor'
import '../../src/lib/customElements/CalculatorElement'
import '../../src/lib/customElements/CliqueFigureElement'
import '../../src/lib/customElements/demi_droite_interactive'
import '../../src/lib/customElements/DiagramBarAssessmentElement'
import '../../src/lib/customElements/DiagramBuilderElement'
import '../../src/lib/customElements/DiagramCartesianAssessmentElement'
import '../../src/lib/customElements/DiagramHistogramAssessmentElement'
import '../../src/lib/customElements/DecompositionFacteursPremiersElement'
import '../../src/lib/customElements/DiagramPieAssessmentElement'
import '../../src/lib/customElements/DomReadyAction'
import '../../src/lib/customElements/DragAndDropElement'
import '../../src/lib/customElements/EchiquierProblemeElement'
import '../../src/lib/customElements/EnsembleIntervallesDroiteElement'
import '../../src/lib/customElements/EtoileCalculsElement'
import '../../src/lib/customElements/ElementIepEditeur'
import '../../src/lib/customElements/FillInTheBlank'
import '../../src/lib/customElements/FractionCliquableElement'
import '../../src/lib/customElements/GuideAne'
import handleInteractiveClock from '../../src/lib/customElements/InteractiveClock'
import '../../src/lib/customElements/IntervalleDroiteElement'
import '../../src/lib/customElements/GrimukuGrilleElement'
import '../../src/lib/customElements/KenKenGrilleElement'
import '../../src/lib/customElements/KillerSudokuGrilleElement'
import '../../src/lib/customElements/PyramideNombresElement'
import '../../src/lib/customElements/LabyrintheBlockly'
import '../../src/lib/customElements/ListeDeroulanteElement'
import '../../src/lib/customElements/MathaleaMathfield'
import '../../src/lib/customElements/MathaleaCouteauSuisse'
import '../../src/lib/customElements/MathaleaBranchingQcm'
import '../../src/lib/customElements/MathaleaCompteEstBonElement'
import '../../src/lib/customElements/MathaleaLabyrintheElement'
import '../../src/lib/customElements/MathaleaQcm'
import '../../src/lib/customElements/MathaleaSolveurElement'
import '../../src/lib/customElements/MathaleaTextfield'
import '../../src/lib/customElements/MetaCustomElement'
import '../../src/lib/customElements/MetaInteractif2dElement'
import '../../src/lib/customElements/MultiMathfield'
import '../../src/lib/customElements/MySpreadSheet'
import '../../src/lib/customElements/ObjetsCliquablesElement'
import '../../src/lib/customElements/PointsCliquablesElement'
import { PossibleMultiLinesAnswerElement } from '../../src/lib/customElements/PossibleMultiLinesAnswerElement'
import '../../src/lib/customElements/RelierEtiquettesElement'
import '../../src/lib/customElements/ScratchEditor'
import '../../src/lib/customElements/SvgSelectionElement'
import '../../src/lib/customElements/TableauHybride'
import '../../src/lib/customElements/TableauMathlive'
import '../../src/lib/customElements/TableauSignesVariationsElement'
import '../../src/lib/customElements/TablesEffaceesGrilleElement'
import '../../src/lib/customElements/TrigoCircleSelectionElement'
import '../../src/lib/customElements/TraceurDeCourbe'
import '../../src/lib/customElements/CubeStackEditorElement'
import '../../src/lib/customElements/SchemaEnBarreElement'
import '../../src/lib/customElements/Shape2DGridEditorElement'

import {
  cleanFillInTheBlanks,
  formatStudentAnswer,
  stripInteractiveWidgets,
} from '../../src/lib/components/canSolutions'
import { addMultiMathfield } from '../../src/lib/customElements/MultiMathfield'
import {
  listOfCustomElements,
  mathaleaCustomElementsRegistry,
} from '../../src/lib/customElements/MathaleaCustomElement'
import type { IExercice } from '../../src/lib/types'
import { context } from '../../src/modules/context'

beforeAll(() => {
  handleInteractiveClock()
})

describe('mathaleaCustomElementsRegistry', () => {
  it('contient tous les customElements de listOfCustomElements', () => {
    for (const tag of listOfCustomElements) {
      expect(mathaleaCustomElementsRegistry.has(tag), tag).toBe(true)
    }
  })
})

describe('formatStudentAnswer', () => {
  it("affiche « aucune » si l'élève n'a pas répondu", () => {
    expect(formatStudentAnswer('<math-field></math-field>', '')).toBe('aucune')
  })

  it('affiche la réponse brute pour un QCM', () => {
    const question = '<input type="checkbox" id="checkEx0Q0R0">'
    expect(formatStudentAnswer(question, '50 g ; 500 g')).toBe('50 g ; 500 g')
  })

  it('entoure de dollars la réponse LaTeX sans dollars pour un QCM', () => {
    const question = '<input type="checkbox" id="checkEx0Q0R0">'
    expect(formatStudentAnswer(question, '\\dfrac{1}{2}')).toBe(
      '$\\dfrac{1}{2}$',
    )
  })

  it("formate la réponse JSON d'une horloge interactive", () => {
    const question = '<interactive-clock id="interactive-clockEx0Q0" hour="3"/>'
    expect(
      formatStudentAnswer(question, '{"hour":5,"minute":30,"second":0}'),
    ).toBe('$5$ h $30$')
  })

  it("affiche la réponse brute d'une liste déroulante", () => {
    const question =
      '<liste-deroulante id="liste-deroulanteEx0Q0"></liste-deroulante>'
    expect(formatStudentAnswer(question, 'une infinité de solutions')).toBe(
      'une infinité de solutions',
    )
  })

  it('formate la réponse %{champ:"valeur"} d\'un multi-mathfield', () => {
    const question =
      '<multi-mathfield id="multi-mathfieldEx0Q0"></multi-mathfield>'
    expect(
      formatStudentAnswer(question, 'a) %{rep1:"3"} b) %{rep2:"x+1"}'),
    ).toBe('a) $3$ b) $x+1$')
  })

  it("formate la value JSON d'un multi-mathfield", () => {
    const question =
      '<multi-mathfield id="multi-mathfieldEx0Q0"></multi-mathfield>'
    expect(formatStudentAnswer(question, '{"rep1":"3","rep2":"x+1"}')).toBe(
      '$3$ ; $x+1$',
    )
  })

  it("n'affiche que la dernière ligne d'un possible-multi-lines-answer", () => {
    context.isHtml = true
    const question = PossibleMultiLinesAnswerElement.create({
      numeroExercice: 0,
      questionIndex: 0,
      prefix: 'A =',
    })
    expect(formatStudentAnswer(question, '["1+2\\times3","1+6","7"]')).toBe(
      '$7$',
    )
    expect(formatStudentAnswer(question, '7')).toBe('$7$')
  })

  it("formate l'historique d'un compte est bon", () => {
    const question =
      '<mathalea-compte-est-bon tirage="[25,3,10,7,50,100]" avec-division="true"></mathalea-compte-est-bon>'
    const answer = JSON.stringify({
      version: 1,
      operations: [
        { resultId: 'r0', leftId: 'p0', rightId: 'p1', operator: '*' },
        { resultId: 'r1', leftId: 'r0', rightId: 'p2', operator: '+' },
      ],
      finalId: 'r1',
      selectedIds: ['r1'],
    })

    expect(formatStudentAnswer(question, answer)).toBe(
      '$25 \\times 3 = 75$<br>$75 + 10 = 85$<br>Résultat proposé : $85$.',
    )
  })

  it("affiche la réponse brute d'un champ texte", () => {
    const question = '<input id="champTexteEx0Q0">'
    expect(formatStudentAnswer(question, 'douze')).toBe('douze')
  })

  it("énumère les valeurs d'un MetaInteractif2d", () => {
    const question =
      '<meta-interactif-2d><math-field class="metaInteractif2d"></math-field></meta-interactif-2d>'
    expect(formatStudentAnswer(question, '{"champ1":"5","champ2":"7"}')).toBe(
      '$5$ et $7$',
    )
  })

  it('entoure de dollars la réponse mathfield par défaut', () => {
    expect(formatStudentAnswer('<math-field></math-field>', '45')).toBe('$45$')
  })

  it('matérialise les trous vides des fillInTheBlanks', () => {
    expect(
      formatStudentAnswer(
        '<math-field></math-field>',
        '2+\\placeholder[champ1]{}',
      ),
    ).toBe('$2+{...}$')
  })
})

describe('stripInteractiveWidgets', () => {
  it("retire l'horloge interactive de la question", () => {
    const question =
      'Quelle heure est-il ? <interactive-clock id="interactive-clockEx0Q0" hour="3"/>'
    expect(stripInteractiveWidgets(question)).toBe('Quelle heure est-il ? ')
  })

  it('laisse la liste déroulante affichée mais désactivée dans la question', () => {
    const question =
      'Cette équation <liste-deroulante id="liste-deroulanteEx0Q0"></liste-deroulante>'
    expect(stripInteractiveWidgets(question)).toBe(
      'Cette équation <liste-deroulante id="liste-deroulanteEx0Q0" interactivity-on="false"></liste-deroulante>',
    )
  })

  it('retire les <select> historiques', () => {
    const question =
      'Choisir <select id="ex0Q0"><option>a</option></select> puis valider'
    expect(stripInteractiveWidgets(question)).toBe('Choisir  puis valider')
  })

  it('remplace les mathfields par des pointillés', () => {
    const question =
      'La moitié de 90 est <math-field id="champTexteEx0Q0"></math-field>.'
    expect(stripInteractiveWidgets(question)).toBe('La moitié de 90 est  ... .')
  })

  it('remplace les champs libres des multi-mathfields par des pointillés', () => {
    const question =
      'Calculer <multi-mathfield id="multi-mathfieldEx0Q0" data-template="a) %{field0}" data-options="%7B%22field0%22%3A%7B%22ldots%22%3Atrue%7D%7D"></multi-mathfield>'
    const result = stripInteractiveWidgets(question)
    expect(result).toContain('a)</span>  ... ')
    expect(result).not.toContain('multi-mathfield')
  })

  it('rend les listes deroulantes des multi-mathfields en QCM statique', () => {
    const question =
      'Choisir <multi-mathfield id="multi-mathfieldEx0Q0" data-template="%{field0}" data-options="%7B%22field0%22%3A%7B%22choices%22%3A%5B%7B%22label%22%3A%22Choisir%E2%80%A6%22%2C%22value%22%3A%22%22%7D%2C%7B%22label%22%3A%22Oui%22%2C%22value%22%3A%22oui%22%7D%2C%7B%22label%22%3A%22Non%22%2C%22value%22%3A%22non%22%7D%5D%7D%7D"></multi-mathfield>'
    const result = stripInteractiveWidgets(question)
    expect(result).toContain(
      'Choisir <span class="mx-2" style="display:inline-flex;flex-direction:column;',
    )
    expect(result).toContain('<input type="radio" disabled')
    expect(result).toContain('<label id="labelEx0Q0R0"')
    expect(result).toContain('>Oui</label>')
    expect(result).toContain('>Non</label>')
    expect(result).not.toContain('Choisir…')
    expect(result).not.toContain(' ... ')
  })

  it('rend les qcm des multi-mathfields en version statique', () => {
    const question =
      'Répondre <multi-mathfield id="multi-mathfieldEx0Q0" data-template="%{field0}" data-options="%7B%22field0%22%3A%7B%22qcm%22%3A%5B%7B%22label%22%3A%22Vrai%22%2C%22value%22%3A%22vrai%22%7D%2C%7B%22label%22%3A%22Faux%22%2C%22value%22%3A%22faux%22%7D%5D%2C%22vertical%22%3Atrue%7D%7D"></multi-mathfield>'
    const result = stripInteractiveWidgets(question)
    expect(result).toContain(
      '<span class="mx-2" style="display:inline-flex;flex-direction:column;',
    )
    expect(result).toContain(
      '<span class="ex0" style="display:inline-flex;align-items:center;',
    )
    expect(result).toContain('>Vrai</label>')
    expect(result).toContain('>Faux</label>')
    expect(result).not.toContain(' ... ')
  })

  it('conserve le mathfield des fillInTheBlanks en nettoyant les placeholders', () => {
    const question =
      'Compléter <math-field readonly>2+\\placeholder[champ1]{}</math-field>'
    expect(stripInteractiveWidgets(question)).toBe(
      'Compléter <math-field readonly>2+{...}</math-field>',
    )
  })
})

describe('addMultiMathfield', () => {
  it.each([
    { label: 'hors interactif HTML', interactif: false, isTypst: false },
    { label: 'en rendu Typst', interactif: true, isTypst: true },
  ])('rend les qcm imbriques en statique $label', ({ interactif, isTypst }) => {
    context.isHtml = true
    context.isAmc = false
    context.isTypst = isTypst
    const exercice = {
      interactif,
      numeroExercice: 0,
    } as IExercice

    const result = addMultiMathfield(exercice, 0, {
      dataTemplate: 'c) Réponse : %{champ3}',
      dataOptions: {
        champ3: {
          qcm: [
            { label: 'Oui', value: 'oui' },
            { label: 'Non', value: 'non' },
          ],
        },
      },
    })

    expect(result).toContain('<input type="radio" disabled')
    expect(result).toContain('<label id="labelEx0Q0R0"')
    expect(result).toContain('>Oui</label>')
    expect(result).toContain('>Non</label>')
    expect(result).not.toContain(' ... ')
    expect(result).not.toContain('ldots')
    expect(result).not.toContain('multi-mathfield')
    context.isTypst = false
  })
})

describe('cleanFillInTheBlanks', () => {
  it('retire les commandes \\placeholder et matérialise les trous vides', () => {
    expect(cleanFillInTheBlanks('\\placeholder[champ1]{}+1')).toBe('{...}+1')
  })
})
