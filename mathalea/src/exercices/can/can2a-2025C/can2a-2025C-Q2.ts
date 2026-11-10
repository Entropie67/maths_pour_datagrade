import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Calculer une somme de quatre entiers'
export const interactifReady = true

export const uuid = 'wskav'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2a2025CQ2 extends ExerciceCan {
  enonce(a?: number, b?: number, c?: number, d?: number): void {
    if (a == null || b == null || c == null || d == null) {
      // a + c = cible1 (nombre rond), b + d = cible2 (nombre rond)
      // Aucun des 4 nombres ne doit être multiple de 10
      const cible1 = this.quotaChoice('cible1', [150, 200, 250, 300])
      const cible2 = this.quotaRandint('cible2', 3, 6) * 10
      let partA: number
      let partC: number
      do {
        partA = randint(101, cible1 - 11)
        partC = cible1 - partA
      } while (partA % 10 === 0 || partC % 10 === 0 || partC < 2)
      a = partA
      c = partC
      let partB: number
      let partD: number
      do {
        partB = randint(11, cible2 - 2)
        partD = cible2 - partB
      } while (partB % 10 === 0 || partD % 10 === 0 || partD < 2)
      b = partB
      d = partD
    }

    const sommeAC = a + c
    const sommeBD = b + d
    const resultat = a + b + c + d

    this.formatChampTexte = KeyboardType.clavierDeBase
    this.reponse = String(resultat)
    this.question = `$${a}+${b}+${c}+${d}=$`
    if (!this.interactif) {
      this.question += ' $\\ldots$'
    }
    this.correction = `On regroupe astucieusement :<br>
    $\\underbrace{${a}+${c}}_{${sommeAC}}+\\underbrace{${b}+${d}}_{${sommeBD}}=${sommeAC}+${sommeBD}=${miseEnEvidence(String(resultat))}$`
    this.canEnonce = `$${a}+${b}+${c}+${d}=$`
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(134, 23, 16, 17)
    else this.enonce()
  }
}
