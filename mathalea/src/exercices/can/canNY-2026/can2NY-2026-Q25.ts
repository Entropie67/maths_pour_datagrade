import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { reduireAxPlusB, rienSi1 } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import FractionEtendue from '../../../modules/FractionEtendue'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Déterminer un antécédent'

export const uuid = 'fj2ix'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author GM+EE

*/
export default class diviseur extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple' // Cette ligne est très importante pour faire faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
  }

  nouvelleVersion() {
    const annee = 2026
    const a = this.canOfficielle ? 2 : this.quotaRandint('a', -5, 5, [0])
    const b = this.canOfficielle
      ? annee - 1
      : this.quotaRandint('b', annee - 3, annee + 3, [annee])
    this.reponse = new FractionEtendue(annee - b, a).texFraction
    this.question = `Déterminer l'antécédent de $${texNombre(annee)}$ par la fonction $f$ définie par : $f(x)=${reduireAxPlusB(a, b)}$. `
    this.correction = `On obtient l'antécédent de $${texNombre(annee)}$ en résolvant l'équation $f(x)=${texNombre(annee)}$.<br>
      $\\begin{aligned}
      ${reduireAxPlusB(a, b)}&=${texNombre(annee, 0)}\\\\
      ${rienSi1(a)}x&=${texNombre(annee - b, 0)}\\\\
      x&=${miseEnEvidence(new FractionEtendue(annee - b, a).simplifie().texFraction)}
      \\end{aligned}$`

    if (this.interactif) {
      this.question += '<br>'
    }
  }
}
