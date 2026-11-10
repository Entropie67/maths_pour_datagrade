import * as Blockly from 'blockly/core'
import * as En from 'blockly/msg/en'
import { ensureBlocklyBlocksInitialized } from '../../lib/blockly/blocks'
import {
  addBloklyEditor,
  BlocklyEditor,
  type BlocklyEditorOptions,
} from '../../lib/customElements/BlocklyEditor'
import {
  addScratchEditor,
  ScratchEditorElement,
  scratchWorkspaceXmlToArithmeticAst,
  type ScratchEditorOptions,
} from '../../lib/customElements/ScratchEditor'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteFeedback } from '../../lib/interactif/questionMathLive'
import {
  areArithmeticAstsEquivalent,
  arithmeticAstToLatex,
  arithmeticMismatchFeedback,
  blocklyWorkspaceToArithmeticAst,
  buildBlocklySaySolutionBlocks,
  describeArithmeticAstCorrection,
  generateArithmeticAst,
  type ArithmeticAst,
} from '../../lib/mathFonctions/expression'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Calculs numériques à représenter en code par blocs'
export const interactifReady = true
export const dateDePublication = '17/07/2026'

/**
 * Exercice pour manipuler les langages mathématiques et algorithmiques.
 * @author Jean-Claude Lhote
 */
export const uuid = 'c1f91'

export const refs = {
  'fr-fr': ['5I1C'],
  'fr-ch': [],
}

Blockly.setLocale(En as unknown as { [key: string]: string })

const toolbox: Blockly.utils.toolbox.ToolboxDefinition = {
  kind: 'flyoutToolbox',
  contents: [
    {
      kind: 'block',
      type: 'demarrer',
    },
    {
      kind: 'block',
      type: 'dire_2s',
    },
    {
      kind: 'block',
      type: 'operation',
    },
    {
      kind: 'block',
      type: 'textinput',
    },
  ],
}

const VERIFY_CALLBACK_NAME = '5I1C_AST_EQUIVALENCE'
const SCRATCH_VERIFY_CALLBACK_NAME = '5I1C_SCRATCH_AST_EQUIVALENCE'

/**
 * Compare le calcul codé par l'élève au calcul attendu et rédige le feedback.
 * `expectedRaw` contient `preferDivToFrac` pour afficher le calcul de l'élève
 * avec la même écriture des divisions que la question.
 */
function verifyArithmeticAst(
  studentAst: ArithmeticAst | null,
  expectedAst: ArithmeticAst | null,
  expectedRaw: unknown,
): { isOk: boolean; feedback: string } {
  if (studentAst == null) {
    return {
      isOk: false,
      feedback:
        "Impossible d'interpréter ta réponse par blocs en expression arithmétique, il semble que tu aies oublié de coder ta réponse.",
    }
  }
  if (expectedAst == null) {
    return {
      isOk: false,
      feedback: "Impossible d'interpréter la correction attendue par blocs.", // message à destination du concepteur de l'exo (pas de l'élève)
    }
  }
  if (areArithmeticAstsEquivalent(studentAst, expectedAst)) {
    return { isOk: true, feedback: 'Bravo !' }
  }
  let preferDivToFrac = true
  try {
    const parsed = JSON.parse(String(expectedRaw)) as {
      preferDivToFrac?: boolean
    }
    preferDivToFrac = parsed.preferDivToFrac ?? true
  } catch {
    // On garde l'écriture avec ÷
  }
  return {
    isOk: false,
    feedback: arithmeticMismatchFeedback(
      studentAst,
      expectedAst,
      preferDivToFrac,
    ),
  }
}

BlocklyEditor.registerVerificationCallback(
  VERIFY_CALLBACK_NAME,
  ({ studentJson, expectedSolution, expectedRaw }) =>
    verifyArithmeticAst(
      blocklyWorkspaceToArithmeticAst(studentJson),
      expectedSolution == null
        ? null
        : blocklyWorkspaceToArithmeticAst(expectedSolution),
      expectedRaw,
    ),
)

ScratchEditorElement.registerVerificationCallback(
  SCRATCH_VERIFY_CALLBACK_NAME,
  ({ studentValue, expectedRaw }) => {
    let expectedAst: ArithmeticAst | null = null
    try {
      const parsed = JSON.parse(String(expectedRaw)) as {
        solutionBlocks?: unknown
      }
      expectedAst = blocklyWorkspaceToArithmeticAst(parsed.solutionBlocks)
    } catch {
      expectedAst = null
    }
    return verifyArithmeticAst(
      scratchWorkspaceXmlToArithmeticAst(studentValue.workspaceXml ?? ''),
      expectedAst,
      expectedRaw,
    )
  },
)

export default class CalculerFormuleParBlockly extends Exercice {
  constructor() {
    super()
    this.interactifObligatoire = true
    this.nbQuestions = 2
    this.besoinFormulaireTexte = [
      "Types d'expressions",
      'Nombres séparés par des tirets :\n0: Mélange\n1: Une seule opération\n2:Deux opérations dont une prioritaire\n3: Trois opérations avec parenthèses\n4: Trois opérations sans parenthèses',
    ]
    this.sup = '0'
    this.besoinFormulaire2CaseACocher = [
      "Utiliser l'écriture fractionnaire pour les divisions",
      false,
    ]
    this.sup2 = false
    this.besoinFormulaire3CaseACocher = [
      'Autoriser les nombres négatifs',
      false,
    ]
    this.sup3 = false
    this.besoinFormulaire4CaseACocher = [
      'Toutes les opérations tombent justes',
      true,
    ]
    this.sup4 = true
    this.besoinFormulaire5Numerique = [
      'Éditeur de programmes',
      2,
      '1 : Scratch\n2 : Blockly',
    ]
    this.sup5 = 1
  }

  nouvelleVersion(_numeroExercice: number) {
    const listeTypesDeQuestion = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 4,
      melange: 0,
      nbQuestions: this.nbQuestions,
      shuffle: false,
      defaut: 0,
    }).map(Number)
    // Les anciens liens contiennent une case à cocher : false correspondait à Blockly
    const estScratch = ![2, '2', false, 'false'].includes(this.sup5)
    this.consigne = estScratch
      ? "Chaque programme devra dire le résultat du calcul lorsque l'utilisateur clique sur le drapeau."
      : 'Chaque programme devra dire le résultat du calcul au démarrage.'

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const requestedType = listeTypesDeQuestion[i]
      const operationCount: 1 | 2 | 3 =
        requestedType <= 1 ? 1 : requestedType === 2 ? 2 : 3
      const requireParentheses = requestedType === 3
      const expressionAst = generateArithmeticAst(requestedType, randint, {
        operationCount,
        requireParentheses,
        negativeAllowed: this.sup3,
        strictInteger: this.sup4,
      })
      const texteOperation = arithmeticAstToLatex(expressionAst, !this.sup2)
      const expressionJson = JSON.stringify(expressionAst)

      let texte = `$${miseEnEvidence(texteOperation, 'black')}$<br><br>`
      const solutionBlocks = buildBlocklySaySolutionBlocks(expressionAst)
      const explications = describeArithmeticAstCorrection(
        expressionAst,
        !this.sup2,
      ).join(context.isHtml ? '<br>' : ' ')
      const correctionEditorId = `${estScratch ? 'scratch-editor' : 'blockly-editor'}CorrEx${this.numeroExercice}Q${i}`
      const texteCorr = context.isHtml
        ? [
            `${explications}<br>La solution en blocs est :<br>`,
            estScratch
              ? addScratchEditor(this, i, {
                  id: correctionEditorId,
                  initialBlocks: solutionBlocks,
                  height: '250px',
                  width: '640px',
                  interactivityOn: false,
                  enableRun: false,
                  enableStop: false,
                })
              : BlocklyEditor.create({
                  id: correctionEditorId,
                  options: {
                    toolbox,
                    initialBlocks: solutionBlocks,
                    height: '80px',
                    width: '640px',
                    interactivityOn: false,
                  },
                }),
          ].join('')
        : `${explications} La solution en blocs correspond au calcul : $${texteOperation}$.`

      if (context.isHtml) {
        if (estScratch) {
          const scratchOptions: ScratchEditorOptions = {
            height: '250px',
            width: '640px',
            interactivityOn: true,
            verifyCallbackName: SCRATCH_VERIFY_CALLBACK_NAME,
          }
          texte += addScratchEditor(this, i, scratchOptions)
        } else {
          const options: BlocklyEditorOptions = {
            toolbox,
            solutionBlocks,
            verifyCallbackName: VERIFY_CALLBACK_NAME,
            height: '250px',
            interactivityOn: true,
            width: '640px',
          }
          texte += addBloklyEditor(this, i, options)
        }
        texte += `<div class="ml-2 py-2" id="resultatCheckEx${this.numeroExercice}Q${i}"></div>`
        texte += ajouteFeedback(this, i)

        handleAnswers(
          this,
          i,
          {
            reponse: {
              value: JSON.stringify({
                solutionBlocks,
                preferDivToFrac: !this.sup2,
              }),
            },
          },
          { formatInteractif: estScratch ? 'scratch-editor' : 'blockly-editor' },
        )
      }

      if (this.questionJamaisPosee(i, expressionJson)) {
        this.listeQuestions.push(texte)
        this.listeCorrections.push(texteCorr)
        i++
      }
      cpt++
    }

    listeQuestionsToContenu(this)
    ensureBlocklyBlocksInitialized()
  }
}
