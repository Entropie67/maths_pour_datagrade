import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Résoudre une équation'
export const interactifReady = true

export const uuid = 'ae01d'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2025N5Q19 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierEnsemble
    this.optionsChampTexte = { texteAvant: '<br>$S=$ {', texteApres: '}' }
    this.canOfficielle = true
    this.optionsDeComparaison = { suiteDeNombres: true }
  }

  nouvelleVersion() {
    const a = this.canOfficielle ? 20 : randint(1, 9, 2) * 10

    this.reponse = `${-a};${a}`
    this.question = `Solution(s) de l'équation  $x^2-${texNombre(a ** 2, 0)}=0$`

    this.correction = `Puisque $${texNombre(a ** 2)}>0$, l'équation a deux solutions :  $-\\sqrt{${texNombre(a ** 2, 0)}}$ et $\\sqrt{${texNombre(a ** 2, 0)}}$, soit $${-a}$ et $${a}$.<br>
    Ainsi, $S=\\{${miseEnEvidence(`${-a};${a}`)}\\}$.`
  }
}
