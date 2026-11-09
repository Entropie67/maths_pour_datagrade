import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
export const titre = 'Placer la virgule dans un produit'
export const interactifReady = true

export const uuid = '25b8a'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora (reprise du fichier de Jean-claude Lhote 6ième)

*/

export default class PlaceVirguleProduitCM2 extends ExerciceSimple {
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
      coeff = 2
      facteur1 = 26
      facteur2 = 8
    } else {
      coeff = choice([2, 10])
      facteur1 = randint(1, 2) * 10 + randint(1, 9)
      facteur2 = randint(3, 9)
    }
    const resultatEntier = facteur1 * facteur2
    this.question =
      `Sachant que $${texNombre(facteur1, 0)}\\times ${texNombre(facteur2, 0)}=${texNombre(resultatEntier, 0)}$,<br>complète` +
      '.'
    this.question += ` : $${texNombre(facteur1, 0)}\\times${texNombre(facteur2 * coeff, 0)} =$`
    if (!this.interactif) {
      this.question += ' $\\ldots$'
    }
    this.canReponseACompleter = `$${texNombre(facteur1 / coeff, 3)}\\times ${texNombre(facteur2, 0)}=\\ldots$`
    this.reponse = texNombre(resultatEntier * coeff, 0)
    this.correction = `On utilise le résultat du calcul donné : <br>
    $\\begin{aligned}
    ${texNombre(facteur1, 0)}\\times${texNombre(facteur2 * coeff, 0)} &=${texNombre(facteur1, 0)}\\times (${texNombre(facteur2, 3)}\\times ${texNombre(coeff, 0)})\\\\
      &=(${texNombre(facteur1, 0)}\\times ${texNombre(facteur2, 0)})\\times ${texNombre(coeff, 3)}\\\\
      &=${texNombre(resultatEntier, 0)}\\times ${texNombre(coeff, 0)}\\\\
      &=${miseEnEvidence(texNombre(resultatEntier * coeff, 0))}
      \\end{aligned}$`
  }
}
