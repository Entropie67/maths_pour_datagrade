import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

import Decimal from 'decimal.js'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'

export const titre = 'Placer la virgule dans un produit'
export const interactifReady = true

export const uuid = '050b3'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Jean-claude Lhote

*/

export default class PlaceVirguleProduit extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1

    this.canOfficielle = false
  }

  nouvelleVersion() {
    let coeff: number
    let facteur1: number
    let facteur2: number
    if (this.canOfficielle) {
      coeff = 10
      facteur1 = 24
      facteur2 = 7
    } else {
      coeff = choice([10, 100, 1000])
      facteur1 = randint(2, 5) * 10 + randint(1, 9)
      facteur2 = randint(3, 9)
    }
    const resultatEntier = facteur1 * facteur2
    this.question = `Sachant que $${texNombre(facteur1, 0)}\\times ${texNombre(facteur2, 0)}=${texNombre(resultatEntier, 0)}$, complète :`
    this.question += `  $${texNombre(facteur1 / coeff, 3)}\\times ${texNombre(facteur2, 0)}=$`
    if (!this.interactif) {
      this.question += ' $\\ldots$'
    }
    this.canEnonce = `Sachant que $${texNombre(facteur1, 0)}\\times ${texNombre(facteur2, 0)}=${texNombre(resultatEntier, 0)}$, complète :`
    this.canReponseACompleter = `$${texNombre(facteur1 / coeff, 3)}\\times ${texNombre(facteur2, 0)}=\\ldots$`
    this.reponse = texNombre(resultatEntier / coeff, 3)
    const coeffInverse = new Decimal(1).div(coeff)
    this.correction = `On utilise le résultat du calcul donné : <br>
    $\\begin{aligned}
      ${texNombre(facteur1 / coeff, 3)}\\times ${texNombre(facteur2, 0)}&=(${texNombre(facteur1, 0)}\\times ${texNombre(coeffInverse, 3)})\\times ${texNombre(facteur2, 0)}\\\\
      &=${texNombre(facteur1, 0)}\\times ${texNombre(facteur2, 0)}\\times ${texNombre(coeffInverse, 3)}\\\\
      &=${texNombre(resultatEntier, 0)}\\times ${texNombre(coeffInverse, 3)}\\\\
      &=${miseEnEvidence(texNombre(resultatEntier / coeff, 3))}
      \\end{aligned}$`
  }
}
