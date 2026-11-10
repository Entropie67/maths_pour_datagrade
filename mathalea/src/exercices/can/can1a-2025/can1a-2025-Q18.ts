import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { ecritureAlgebrique, rienSi1 } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
import { sp } from '../../../lib/outils/outilString'
export const titre = "Trouver l'extremum à partir d'une forme canonique"
export const interactifReady = true

export const uuid = '83800'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2025N5Q18 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.canOfficielle = true
  }

  nouvelleVersion() {
    const a = this.canOfficielle ? -4 : randint(-5, 5, 0)
    const alpha = this.canOfficielle ? 3 : randint(-5, 5, 0)
    const beta = this.canOfficielle ? 12 : randint(-15, 15, 0)
    this.reponse = beta
    this.question = `Quel est l'extremum sur $\\mathbb{R}$ de  $x\\longmapsto ${rienSi1(a)}(x${ecritureAlgebrique(-alpha)})^2${ecritureAlgebrique(beta)}$${sp()}?  `
    if (this.interactif) {
      this.question += '<br>'
    }
    this.correction = `On reconnaît la forme canonique d'une fonction polynôme du second degré${sp()}:$[f(x)=a(x-\\alpha)^2+\\beta]$ où $\\beta$ est l'extremum.<br>
    L'extremum de $f$ est $${miseEnEvidence(beta)}$.`
  }
}
