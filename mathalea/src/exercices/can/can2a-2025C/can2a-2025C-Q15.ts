import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { ecritureParentheseSiNegatif } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre =
  'Calculer avec le vocabulaire : carré, triple, double, etc.'
export const interactifReady = true

export const uuid = '1zcj3'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2a2025CQ15 extends ExerciceCan {
  enonce(cas?: number, n?: number): void {
    if (cas == null || n == null) {
      cas = choice([1, 2, 3, 4])
      n = randint(-6, -2)
    }

    let question: string
    let resultat: number
    let explication: string

    switch (cas) {
      case 1: // carré du triple
        {
          const triple = 3 * n
          resultat = triple * triple
          question = `Quel est le carré du triple de $${n}$ ?`
          explication = `Le triple de $${n}$ est $3\\times ${ecritureParentheseSiNegatif(n)}=${triple}$.<br>
          Le carré de $${triple}$ est $${ecritureParentheseSiNegatif(triple)}^2=${miseEnEvidence(String(resultat))}$.`
        }
        break
      case 2: // triple du carré
        {
          const carre = n * n
          resultat = 3 * carre
          question = `Quel est le triple du carré de $${n}$ ?`
          explication = `Le carré de $${n}$ est $${ecritureParentheseSiNegatif(n)}^2=${carre}$.<br>
          Le triple de $${carre}$ est $3\\times ${carre}=${miseEnEvidence(String(resultat))}$.`
        }
        break
      case 3: // carré du double
        {
          const double = 2 * n
          resultat = double * double
          question = `Quel est le carré du double de $${n}$ ?`
          explication = `Le double de $${n}$ est $2\\times ${ecritureParentheseSiNegatif(n)}=${double}$.<br>
          Le carré de $${double}$ est $${ecritureParentheseSiNegatif(double)}^2=${miseEnEvidence(String(resultat))}$.`
        }
        break
      case 4: // double du carré
      default:
        {
          const carre = n * n
          resultat = 2 * carre
          question = `Quel est le double du carré de $${n}$ ?`
          explication = `Le carré de $${n}$ est $${ecritureParentheseSiNegatif(n)}^2=${carre}$.<br>
          Le double de $${carre}$ est $2\\times ${carre}=${miseEnEvidence(String(resultat))}$.`
        }
        break
    }

    this.formatChampTexte = KeyboardType.clavierDeBase
    this.reponse = String(resultat)
    this.question = question + '<br>'
    if (!this.interactif) {
      this.question += '$\\ldots$'
    }
    this.correction = explication
    this.canEnonce = question
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(1, -3)
    else this.enonce()
  }
}
