import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { arrondi } from '../../../lib/outils/nombres'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer des sommes contenant des puissances de $10$'
export const interactifReady = true

export const dateDePublication = '20/11/2022'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

 * Date de publication
*/

export const uuid = '864ba'

export const refs = {
  'fr-fr': ['can3C2-04', '2N41-flash1'],
  'fr-ch': [],
}
export default class CalculPuissance10B extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    let reponse, n1, n2, n3
    switch (this.quotaChoice('cas', [1, 2, 3])) {
      case 1:
        n1 = randint(2, 4)
        n2 = randint(-3, 0)
        n3 = randint(1, 6)
        reponse = arrondi(10 ** n1 + 10 ** n2, 3)
        this.question = `Calculer $10^{${n1}}+10^{${n2}}$.`
        this.correction = `$10^{${n1}}+10^{${n2}}=${texNombre(10 ** n1)} +${texNombre(10 ** n2, 3)}=${miseEnEvidence(texNombre(reponse, 3))}$`
        break

      case 2:
        n1 = randint(2, 4)
        n2 = randint(-3, 0)
        n3 = randint(-3, 3, 0)
        reponse = arrondi(10 ** n1 + 10 ** n2 + 10 ** n3, 3)
        this.question = `Calculer $10^{${n1}}+10^{${n2}}+10^{${n3}}$.`
        this.correction = `$10^{${n1}}+10^{${n2}}+10^{${n3}}=${texNombre(10 ** n1)} +${texNombre(10 ** n2, 3)}+${texNombre(10 ** n3, 3)}=${miseEnEvidence(texNombre(reponse, 3))}$`
        break

      case 3:
        n1 = randint(2, 4)
        n2 = randint(-3, 0)
        reponse = arrondi(10 ** n1 - 10 ** n2, 3)
        this.question = `Calculer $10^{${n1}}-10^{${n2}}$.`
        this.correction = `$10^{${n1}}-10^{${n2}}=${texNombre(10 ** n1)} -${texNombre(10 ** n2, 3)}=${miseEnEvidence(texNombre(reponse, 3))}$`
        break
    }
    this.reponse = reponse
  }
}
