import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { reduireAxPlusB, rienSi1 } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer avec les chiffres (relatifs)'
export const interactifReady = true

export const uuid = '71793'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Éric Elter - Gilles Mora

*/
export default class calcAvecChiffresRel extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple' // Cette ligne est très importante pour faire faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecVariable
    this.optionsDeComparaison = { fonction: true }
  }

  nouvelleVersion() {
    const a = this.quotaRandint('a', -2, 2, [0])
    this.reponse = `${reduireAxPlusB(a, 0)}`
    this.question = `Soit $f$ la fonction linéaire vérifiant $f(${texNombre(2025, 0)})=${texNombre(a * 2025, 0)}$.<br>
    Compléter : $f(x)=$ `
    this.correction = `Une fonction linéaire est une fonction de la forme $f(x)=ax$.<br>
    Comme $f(${texNombre(2025)})=${texNombre(a * 2025, 0)}$, on a $${texNombre(a * 2025, 0)}=a\\times ${texNombre(2025, 0)}$, soit $a=${a}$.<br>
    On obtient donc : $f(x)=${miseEnEvidence(`${rienSi1(a)}x`)}$.`

    if (!this.interactif) {
      this.question += '$\\ldots$'
    }
    this.canEnonce = `Soit $f$ la fonction linéaire vérifiant $f(${texNombre(2025, 0)})=${texNombre(a * 2025, 0)}$.`
    this.canReponseACompleter = '$f(x)=\\ldots$'
  }
}
