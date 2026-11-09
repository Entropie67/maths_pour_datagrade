import Decimal from 'decimal.js'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Écrire un pourcentage sous forme décimale'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '30/10/2026'
/**
 * Réciproque de can5P2-02 (écrire un décimal sous la forme d'un pourcentage)
 * @author Gilles Mora
 */
export const uuid = '73ce3'

export const refs = {
  'fr-fr': ['can5P2-04'],
  'fr-ch': ['NR'],
}
export default class ÉcrirePourcentageDecimal extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.versionQcmDisponible = true
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  nouvelleVersion() {
    // Pourcentage entier (45 %), à un chiffre après la virgule (4,5 %) ou à deux (0,45 %)
    let pourc: Decimal
    switch (this.quotaChoice('typeDeQuestions', ['a', 'b', 'c'])) {
      case 'a':
        pourc = new Decimal(randint(10, 99))
        break
      case 'b':
        pourc = new Decimal(
          randint(1, 99, [10, 20, 30, 40, 50, 60, 70, 80, 90]),
        ).div(10)
        break
      default:
        pourc = new Decimal(
          randint(1, 99, [10, 20, 30, 40, 50, 60, 70, 80, 90]),
        ).div(100)
        break
    }

    this.question = this.versionQcm
      ? `$${texNombre(pourc)}\\,\\%$ est égal à : `
      : `Compléter avec un nombre décimal.<br> $${texNombre(pourc)}\\,\\%=$`
    if (!this.interactif && !this.versionQcm) {
      this.question += `${sp(1)}$\\ldots\\ldots\\ldots$`
    }
    this.correction = `$${texNombre(pourc)}\\,\\%=\\dfrac{${texNombre(pourc)}}{100}=${miseEnEvidence(texNombre(pourc.div(100)))}$`
    this.reponse = this.versionQcm
      ? `$${texNombre(pourc.div(100))}$`
      : pourc.div(100)
    this.canEnonce = 'Compléter avec un nombre décimal.'
    this.canReponseACompleter = `$${texNombre(pourc)}\\,\\%=\\ldots$`
    this.distracteurs = [
      `$${texNombre(pourc)}$`, // Erreur : oubli de diviser par 100
      `$${texNombre(pourc.div(10))}$`, // Erreur : division par 10 au lieu de 100
      `$${texNombre(pourc.mul(100))}$`, // Erreur : multiplication par 100 au lieu de division
    ]
  }
}
