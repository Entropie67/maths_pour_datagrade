import { orangeMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { sp } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import operation, { additionMultiplePosee } from '../../modules/operations'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const amcReady = true
export const amcType = 'AMCNum'

export const interactifReady = true

export const titre = 'Différencier les algorithmes des quatre opérations'
export const dateDePublication = '15/03/2026'
/**
 * Travailler en parallèle l'algorithme des quatre opérations à partir de données littérales,
 * en particulier pour différencier le positionnement de la virgule dans les différents types d'opérations.
 * @author Mireille Gain

 */
export const uuid = '69a83'

export const refs = {
  'fr-fr': ['6N2E-5'],
  'fr-ch': ['9R1NO7C-5', '9R2NO7C-5', '9R3NO7C-5'],
}

type OperationDisponible = {
  id: number
  expression: string
  reponse: string
  correction: string
}

export default class QuatreOperationsDecimaux extends Exercice {
  constructor() {
    super()
    this.consigne = ''
    this.spacing = 2
    this.spacingCorr = context.isHtml ? 2 : 1 // Important sinon les opérations posées ne sont pas jolies
    this.nbQuestions = 1
    this.sup = '0'
    this.besoinFormulaireTexte = [
      'Opérations proposées',
      [
        'Nombres séparés par des tirets :',
        '0 : Mélange',
        '1 : Addition',
        '2 : Soustraction',
        '3 : Multiplication',
        '4 : Division',
      ].join('\n'),
    ]
  }

  nouvelleVersion() {
    this.listeQuestions = []
    this.listeCorrections = []
    const operationsChoisies = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 0,
      max: 4,
      defaut: 0,
      melange: 0,
      nbQuestions: 0,
      shuffle: false,
      enleveDoublons: true,
    }) as number[]
    let indiceInteractif = 0
    for (
      let i = 0, a, b, c, d, e, f, g, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      let texte = ``
      let texteCorr = ``
      f = randint(2001, 3333) * 3
      g = randint(101, 999)
      c = choice([3, 4, 5, 6, 8])
      d = choice([10, 100, 1000])
      e = choice([10, 100], d)
      a = f / d
      b = g / e

      texte += `On sait que : $ ${sp(5)} a = ${texNombre(a)}~~, ${sp(10)} b = ${texNombre(b)}~~, ${sp(10)} c = ${texNombre(c)} $.<br>`
      const op1 = a > b ? a : b
      const op2 = a > b ? b : a
      const operationsDisponibles: OperationDisponible[] = [
        {
          id: 1,
          expression: 'a + b + c',
          reponse: texNombre(a + b + c),
          correction:
            additionMultiplePosee([a, b, c], {
              retenuesOn: true,
              calculer: true,
              display: 'inline-block',
            }) +
            `$${sp(10)}${texNombre(a)}+${texNombre(b)}+${texNombre(c)}=${miseEnEvidence(texNombre(arrondi(a + b + c)))}$<br>\n`,
        },
        {
          id: 2,
          expression: a > b ? 'a - b' : 'b - a',
          reponse: texNombre(op1 - op2),
          correction:
            sp(10) +
            operation({
              operande1: op1,
              operande2: op2,
              type: 'soustraction',
              display: 'inline-block',
              options: {
                colore: orangeMathalea,
                solution: true,
              },
            }) +
            sp(10) +
            'ou' +
            sp(10) +
            operation({
              operande1: op1,
              operande2: op2,
              type: 'soustraction',
              display: 'inline-block',
              methodeParCompensation: false,
              options: {
                colore: orangeMathalea,
                solution: true,
              },
            }) +
            `$${sp(10)}${texNombre(op1)}-${texNombre(op2)}=${miseEnEvidence(texNombre(arrondi(op1 - op2)))}$<br>\n`,
        },
        {
          id: 3,
          expression: 'a \\times b',
          reponse: texNombre(a * b),
          correction:
            operation({
              operande1: a,
              operande2: b,
              type: 'multiplication',
              display: 'inline-block',
              options: { solution: true, colore: orangeMathalea },
            }) +
            sp(10) +
            'ou' +
            sp(10) +
            operation({
              operande1: b,
              operande2: a,
              type: 'multiplication',
              display: 'inline-block',
              options: { solution: true, colore: orangeMathalea },
            }) +
            `$${sp(10)}${sp(10)} ${texNombre(a)} \\times ${texNombre(b)}=${miseEnEvidence(texNombre(arrondi(a * b)))}$<br>\n`,
        },
        {
          id: 4,
          expression: 'a \\div c',
          reponse: texNombre(a / c),
          correction:
            sp(10) +
            operation({
              operande1: arrondi(a, 6),
              operande2: c,
              type: 'division',
              display: 'inline-block',
              precision: 8,
              options: { solution: true, colore: orangeMathalea },
            }) +
            `$${sp(10)}${texNombre(a)} \\div ${texNombre(c)}=${miseEnEvidence(texNombre(arrondi(a / c)))}$<br>\n`,
        },
      ]
      const operationsDeLaQuestion = operationsChoisies
        .map((id) =>
          operationsDisponibles.find(
            (operationDisponible) => operationDisponible.id === id,
          ),
        )
        .filter(
          (operationDisponible): operationDisponible is OperationDisponible =>
            operationDisponible !== undefined,
        )

      const operationsEnonce = operationsDeLaQuestion
        .map(({ expression }) => expression)
        .join(`${sp(5)}; ${sp(5)}`)
      texte += `Poser et effectuer ${operationsDeLaQuestion.length === 1 ? "l'opération suivante" : 'les opérations suivantes'} : $${sp(5)}${operationsEnonce}$.<br>`

      for (const { expression, reponse } of operationsDeLaQuestion) {
        texte += this.interactif
          ? ajouteChampTexteMathLive(
              this,
              indiceInteractif,
              KeyboardType.clavierNumbers,
              {
                texteAvant: `$${sp(5)}${expression} =~$`,
              },
            )
          : ''
        handleAnswers(this, indiceInteractif, { reponse: { value: reponse } })
        indiceInteractif++
      }

      texteCorr += operationsDeLaQuestion
        .map(({ correction }) => correction)
        .join('')

      if (this.questionJamaisPosee(i, a, b, c, d, e, f, g)) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
