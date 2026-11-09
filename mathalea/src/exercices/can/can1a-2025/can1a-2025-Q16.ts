import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = "Calculer la raison d'une suite géométrique"
export const interactifReady = true

export const uuid = '45e51'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2025N5Q16 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsChampTexte = {
      texteAvant: ' Sa raison $q$ est ',
      texteApres: '.',
    }
    this.canOfficielle = true
    this.optionsDeComparaison = {
      fractionEgale: true,
      nombreDecimalSeulement: true,
    }
  }

  nouvelleVersion() {
    const indice = this.canOfficielle ? 1 : randint(2, 8)
    const terme = this.canOfficielle ? 9 : randint(5, 8)
    const coeff = this.canOfficielle ? 2 : randint(2, 5)
    this.reponse = 1 / coeff
    this.optionsDeComparaison = {
      fractionEgale: true,
      nombreDecimalSeulement: coeff !== 3,
    }
    this.question = `La suite $(u_n)$ est géométrique telle que  $u_{${indice}}= ${terme * coeff}$ et $u_{${indice + 1}}= ${terme}$.<br>`
    if (!this.interactif) {
      this.question += 'Sa raison $q$ est $\\ldots$'
    }
    this.correction = `On passe de $u_{${indice}}$ à $u_{${indice + 1}}$ en divisant par $${coeff}$, c'est-à-dire en multipliant par $\\dfrac{1}{${coeff}}$.<br>
    La raison de la suite est donc $${miseEnEvidence(coeff === 3 ? '\\dfrac{1}{3}' : texNombre(1 / coeff))}$.`
    this.canEnonce = `La suite $(u_n)$ est géométrique telle que  $u_{${indice}}= ${terme * coeff}$ et $u_{${indice + 1}}= ${terme}$.`
    this.canReponseACompleter = 'Sa raison $q$ est $\\ldots$ '
  }
}
