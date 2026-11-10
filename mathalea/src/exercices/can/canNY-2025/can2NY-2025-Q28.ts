import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceSimple from '../../ExerciceSimple'

import { texNombre } from '../../../lib/outils/texNombre'
export const titre = 'Calculer avec des puissances'
export const interactifReady = true

export const uuid = '7977b'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Éric Elter - Gilles Mora
 */
export default class calculPuissances extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
  }

  nouvelleVersion() {
    const choix = this.quotaRandint('choix', 1, 5)
    if (choix === 1) {
      this.reponse = -1
      this.question = `Calculer  $(-1)^{${texNombre(2025)}}+(-1)^{${texNombre(2024)}}+(-1)^{${texNombre(2025)}}$.`
      this.correction = ` Si $n$ est pair, $(-1)^n=1$ et si $n$ est impair, $(-1)^n=-1$. <br>
        Ainsi, $(-1)^{${texNombre(2025)}}+(-1)^{${texNombre(2024)}}+(-1)^{${texNombre(2025)}}=-1+1-1=${miseEnEvidence('-1')}$.`
    } else if (choix === 2) {
      this.reponse = -1
      this.question = `Calculer $\\dfrac{(-1)^{${texNombre(2025)}}}{(-1)^{${texNombre(2024)}}}$.`
      this.correction = ` Si $n$ est pair, $(-1)^n=1$ et si $n$ est impair, $(-1)^n=-1$. <br>
          Ainsi, $\\dfrac{(-1)^{${texNombre(2025)}}}{(-1)^{${texNombre(2024)}}}=\\dfrac{-1}{1}=${miseEnEvidence('-1')}$.`
    } else if (choix === 3) {
      this.reponse = -1
      this.question = `Calculer $(-1)^{${texNombre(2025)}}\\times(-1)^{${texNombre(2024)}}$.`
      this.correction = ` Si $n$ est pair, $(-1)^n=1$ et si $n$ est impair, $(-1)^n=-1$. <br>
              Ainsi, $(-1)^{${texNombre(2025)}}\\times(-1)^{${texNombre(2024)}}=-1\\times 1=${miseEnEvidence('-1')}$.`
    } else if (choix === 4) {
      this.reponse = -2
      this.question = `Calculer $(-1)^{${texNombre(2025)}}+(-1)^{${texNombre(2023)}}$.`
      this.correction = ` Si $n$ est pair, $(-1)^n=1$ et si $n$ est impair, $(-1)^n=-1$. <br>
              Ainsi, $(-1)^{${texNombre(2025)}}+(-1)^{${texNombre(2024)}}=-1+(-1)=${miseEnEvidence('-2')}$.`
    } else if (choix === 5) {
      this.reponse = 0
      this.question = `Calculer $(-1)^{${texNombre(2025)}}-(-1)^{${texNombre(2023)}}$.`
      this.correction = ` Si $n$ est pair, $(-1)^n=1$ et si $n$ est impair, $(-1)^n=-1$. <br>
              Ainsi, $(-1)^{${texNombre(2025)}}-(-1)^{${texNombre(2024)}}=-1-(-1)=${miseEnEvidence('0')}$.`
    }

    if (this.interactif) {
      this.question += '<br>'
    }
  }
}
