import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceSimple from '../../ExerciceSimple'

import { texNombre } from '../../../lib/outils/texNombre'
export const titre = 'Calculer avec des puissances'
export const interactifReady = true

export const uuid = 'yy6xh'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Éric Elter - Gilles Mora
 */
export default class calculPuissances2026 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
  }

  nouvelleVersion() {
    const annee = 2026
    const choix = this.canOfficielle ? 1 : this.quotaRandint('choix', 1, 5)
    if (choix === 1) {
      this.reponse = 0
      this.question = `Calculer  $(-1)^{${texNombre(annee)}}+(-1)^{${texNombre(annee - 1)}}$.`
      this.correction = ` Si $n$ est pair, $(-1)^n=1$ et si $n$ est impair, $(-1)^n=-1$. <br>
        Ainsi, $(-1)^{${texNombre(annee)}}+(-1)^{${texNombre(annee - 1)}}=${annee % 2 === 0 ? '1' : '-1'}+${(annee - 1) % 2 === 0 ? '1' : '(-1)'}=${miseEnEvidence(this.reponse)}$.`
    } else if (choix === 2) {
      const valAnnee = annee % 2 === 0 ? 1 : -1
      const valAnneeMoins1 = (annee - 1) % 2 === 0 ? 1 : -1
      this.reponse = valAnnee / valAnneeMoins1
      this.question = `Calculer $\\dfrac{(-1)^{${texNombre(annee)}}}{(-1)^{${texNombre(annee - 1)}}}$.`
      this.correction = ` Si $n$ est pair, $(-1)^n=1$ et si $n$ est impair, $(-1)^n=-1$. <br>
          Ainsi, $\\dfrac{(-1)^{${texNombre(annee)}}}{(-1)^{${texNombre(annee - 1)}}}=\\dfrac{${valAnnee}}{${valAnneeMoins1 === -1 ? '(-1)' : valAnneeMoins1}}=${miseEnEvidence(this.reponse)}$.`
    } else if (choix === 3) {
      const valAnnee = annee % 2 === 0 ? 1 : -1
      const valAnneeMoins1 = (annee - 1) % 2 === 0 ? 1 : -1
      this.reponse = valAnnee * valAnneeMoins1
      this.question = `Calculer $(-1)^{${texNombre(annee)}}\\times(-1)^{${texNombre(annee - 1)}}$.`
      this.correction = ` Si $n$ est pair, $(-1)^n=1$ et si $n$ est impair, $(-1)^n=-1$. <br>
              Ainsi, $(-1)^{${texNombre(annee)}}\\times(-1)^{${texNombre(annee - 1)}}=${valAnnee === -1 ? '(-1)' : valAnnee}\\times ${valAnneeMoins1 === -1 ? '(-1)' : valAnneeMoins1}=${miseEnEvidence(this.reponse)}$.`
    } else if (choix === 4) {
      const valAnnee = annee % 2 === 0 ? 1 : -1
      const valAnneeMoins2 = (annee - 2) % 2 === 0 ? 1 : -1
      this.reponse = valAnnee + valAnneeMoins2
      this.question = `Calculer $(-1)^{${texNombre(annee)}}+(-1)^{${texNombre(annee - 2)}}$.`
      this.correction = ` Si $n$ est pair, $(-1)^n=1$ et si $n$ est impair, $(-1)^n=-1$. <br>
              Ainsi, $(-1)^{${texNombre(annee)}}+(-1)^{${texNombre(annee - 2)}}=${valAnnee === -1 ? '(-1)' : valAnnee}+${valAnneeMoins2 === -1 ? '(-1)' : valAnneeMoins2}=${miseEnEvidence(this.reponse)}$.`
    } else if (choix === 5) {
      const valAnnee = annee % 2 === 0 ? 1 : -1
      const valAnneeMoins2 = (annee - 2) % 2 === 0 ? 1 : -1
      this.reponse = valAnnee - valAnneeMoins2
      this.question = `Calculer $(-1)^{${texNombre(annee)}}-(-1)^{${texNombre(annee - 2)}}$.`
      this.correction = ` Si $n$ est pair, $(-1)^n=1$ et si $n$ est impair, $(-1)^n=-1$. <br>
              Ainsi, $(-1)^{${texNombre(annee)}}-(-1)^{${texNombre(annee - 2)}}=${valAnnee === -1 ? '(-1)' : valAnnee}-${valAnneeMoins2 === -1 ? '(-1)' : `${valAnneeMoins2}`}=${miseEnEvidence(this.reponse)}$.`
    }

    if (this.interactif) {
      this.question += '<br>'
    }
  }
}
