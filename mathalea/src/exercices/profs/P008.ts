import { orangeMathalea } from '../../lib/colors'
import { context } from '../../modules/context'
import operation from '../../modules/operations'
import Exercice from '../Exercice'
export const titre = 'Poser des opérations'

export const refs = {
  'fr-fr': ['P008'],
  'fr-ch': [],
}
export const uuid = '691a6'

/**
 * Permet de poser des opérations (addition, soustraction, multiplication, division euclidienne et division décimale)
 * @author Jean-claude Lhote
 */
export default class OperationsPosees extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Opération',
      6,
      '1 : Addition\n2 : Soustraction par compensation\n3 : Multiplication\n4 : Division euclidienne\n5 : Division décimale\n6 : Soustraction par emprunt',
    ]
    this.besoinFormulaire2Texte = [
      'Deux nombres séparés par un tiret(séparateur décimal = le point)',
      '',
    ]
    this.besoinFormulaire3Numerique = [
      'Nombre de chiffres après la virgule pour le quotient (5 maximum)',
      5,
    ]

    this.spacing = 2
    this.spacingCorr = context.isHtml ? 2 : 1 // Important sinon opidiv n'est pas joli
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.sup = 1
    this.sup2 = '1234.5-789.2'
    this.sup3 = 0
  }

  nouvelleVersion() {
    const nombres = [1234.5, 789.2]
    let operandes = String(this.sup2).split('-')
    if (operandes.length !== 2) {
      operandes = ['1234.5', '789.2']
    }

    nombres[0] = parseFloat(operandes[0])
    nombres[1] = parseFloat(operandes[1])
    if (isNaN(nombres[0])) {
      nombres[0] = 1234.5
    }
    if (isNaN(nombres[1]) || (this.sup === 4 && nombres[1] === 0)) {
      // division euclidienne par 0 impossible
      nombres[1] = 789.2
    }
    if (this.sup3 < 0 || this.sup3 > 5 || isNaN(this.sup3)) {
      this.sup3 = 0
    }

    const a = nombres[0]
    const b = nombres[1]
    switch (parseInt(this.sup)) {
      case 1: // addition
        this.contenu = operation({
          operande1: a,
          operande2: b,
          type: 'addition',
          options: { solution: true, colore: orangeMathalea },
        })
        break
      case 2: // soustraction par compensation
        this.contenu = operation({
          operande1: a,
          operande2: b,
          type: 'soustraction',
          options: { solution: true, colore: orangeMathalea },
        })
        break
      case 3: // multiplication
        this.contenu = operation({
          operande1: a,
          operande2: b,
          type: 'multiplication',
          options: { solution: true, colore: orangeMathalea },
        })
        break
      case 4: // division euclidienne
        this.contenu = operation({
          operande1: a,
          operande2: b,
          type: 'divisionE',
          precision: 0,
          options: { solution: true, colore: orangeMathalea },
        })
        break
      case 6: // soustraction par emprunt
        this.contenu = operation({
          operande1: a,
          operande2: b,
          type: 'soustraction',
          methodeParCompensation: false,
          options: { solution: true, colore: orangeMathalea },
        })
        break
      case 5: // division
      default:
        this.contenu = operation({
          operande1: a,
          operande2: b,
          type: 'division',
          precision: this.sup3,
          options: { solution: true, colore: orangeMathalea },
        })
        break
    }
    this.listeQuestions[0] = this.contenu
  }
}
