import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import {
  ecritureAlgebrique,
  reduireAxPlusB,
  reduirePolynomeDegre3,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Déterminer un coefficient directeur'
export const interactifReady = true

export const uuid = 'evon2'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Éric Elter - Gilles Mora
 */
export default class coeffDirecteur extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const annee = 2026
    const a = this.canOfficielle ? 1 : this.quotaChoice('a', [-1, 1])
    const c = this.canOfficielle ? 1 : this.quotaChoice('c', [-1, 1])
    const b = this.canOfficielle ? c : this.quotaRandint('b', 1, 4) * c
    this.question = `Quel est le coefficient directeur de la tangente au point d'abscisse $${texNombre(annee, 0)}$ de la courbe d'équation $y=${reduirePolynomeDegre3(0, a, b, annee)}$ ?`
    this.correction = `Si $f$ est la fonction définie par $f(x)=${reduirePolynomeDegre3(0, a, b, annee)}$, le coefficient directeur de la tangente au point d'abscisse  $${texNombre(annee, 0)}$ est donné par le nombre dérivé  $f'(${texNombre(annee, 0)})$.<br>
              Comme $f'(x)=${reduireAxPlusB(2 * a, b)}$, $f'(${texNombre(annee)})=${texNombre(2 * a)}\\times ${texNombre(annee)}${ecritureAlgebrique(b)}= ${miseEnEvidence(`${texNombre(2 * a * annee + b, 0)}`)}$.
               `
    this.reponse = `${2 * annee * a + b}`
    if (this.interactif) {
      this.question += '<br>'
    }
  }
}
