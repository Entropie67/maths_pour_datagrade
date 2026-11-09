import Decimal from 'decimal.js'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = ''
export const interactifReady = true

export const uuid = 'fgfq3'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can32026Q26 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  enonce(decimalValue?: number, a?: number, b?: number, operation?: '+' | '-') {
    let decimal: Decimal

    if (decimalValue == null || a == null || b == null || operation == null) {
      // Version aléatoire
      // Nombre décimal : partie entière de 10 à 99, partie décimale,01 à,99
      const partieEntiere = randint(10, 99)
      const partieDecimale = randint(1, 99)
      // Création directe du Decimal avec la bonne valeur
      decimal = new Decimal(partieEntiere).add(
        new Decimal(partieDecimale).div(100),
      )

      // Deux nombres qui s'additionnent ou se soustraient pour donner 100
      operation = choice(['+', '-'])

      if (operation === '-') {
        a = randint(101, 109)
        b = a - 100
      } else {
        a = randint(91, 99)
        b = 100 - a
      }
    } else {
      decimal = new Decimal(decimalValue)
    }

    // Calcul de la réponse avec Decimal (méthodes d'instance)
    const resultatOperation = operation === '-' ? a - b : a + b
    const reponse = decimal.mul(resultatOperation)

    this.reponse = reponse

    const operateurSymbole = operation === '-' ? '-' : '+'

    this.question = `
$${texNombre(decimal)}\\times ${a}${operateurSymbole}${texNombre(decimal)}\\times ${b}$`
    if (this.interactif) {
      this.question += ' $=$'
    }
    this.correction = `On factorise par $${texNombre(decimal)}$ :<br>
$\\begin{aligned}
${texNombre(decimal)}\\times ${a}${operateurSymbole}${texNombre(decimal)}\\times ${b}
&=${texNombre(decimal)}\\times(${a}${operateurSymbole}${b})\\\\
&=${texNombre(decimal)}\\times ${resultatOperation}\\\\
&=${miseEnEvidence(texNombre(reponse))}
\\end{aligned}$`
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(21.74, 103, 3, '-')
    else this.enonce()
  }
}
