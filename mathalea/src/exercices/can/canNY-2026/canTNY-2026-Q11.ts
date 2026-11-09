import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { rienSi1 } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import FractionEtendue from '../../../modules/FractionEtendue'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Calculer un antécédent'
export const interactifReady = true

export const uuid = '4vfug'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Éric Elter - Gilles Mora
 */
export default class calcAntecedent2026 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    // this.optionsDeComparaison = { fractionEgale: true }
  }

  nouvelleVersion() {
    const annee = 2026
    const a = this.canOfficielle ? 3 : this.quotaRandint('a', -5, 5, [0])
    const ant = this.canOfficielle
      ? annee
      : this.quotaRandint('ant', 2020, 2030)
    this.question = `Déterminer l'antécédent de $${texNombre(ant)}$ par la fonction $f$ définie par : $f(x)=${rienSi1(a)}x+${texNombre(annee, 0)}$.`
    this.reponse = new FractionEtendue(ant - annee, a).simplifie().texFSD
    this.correction = `L'antécédent est la solution de l'équation $${rienSi1(a)}x+${texNombre(annee, 0)}=${texNombre(ant)}$.<br>
    Il s'agit de $${miseEnEvidence(this.reponse)}$.`
    if (this.interactif) {
      this.question += '<br>'
    }

    this.canReponseACompleter = '$f(x)=\\ldots$'
  }
}
