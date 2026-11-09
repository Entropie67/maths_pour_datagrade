import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { prenomF } from '../../../lib/outils/Personne'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
import { deDevant, queDevant } from '../../../lib/outils/outilString'
export const titre = "Calculer l'âge d'un élève à partir d'un énoncé"
export const interactifReady = true

export const uuid = '13ewz'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2a2025CQ20 extends ExerciceCan {
  enonce(
    ecart?: number,
    somme?: number,
    prenom1?: string,
    prenom2?: string,
  ): void {
    if (ecart == null || somme == null || prenom1 == null || prenom2 == null) {
      ecart = randint(5, 20)
      // somme doit avoir même parité que ecart pour que les âges soient entiers
      do {
        somme = randint(20, 60)
      } while ((somme - ecart) % 2 !== 0)
      prenom1 = prenomF() as string
      prenom2 = prenomF() as string
      while (prenom2 === prenom1) {
        prenom2 = prenomF() as string
      }
    }

    // prenom1 est plus jeune de ecart ans que prenom2
    // prenom1 + prenom2 = somme
    // prenom1 + (prenom1 + ecart) = somme => 2×prenom1 = somme - ecart
    const age1 = (somme - ecart) / 2
    const age2 = age1 + ecart

    this.formatChampTexte = KeyboardType.clavierDeBase
    this.reponse = String(age1)

    this.question = `${prenom1} est $${ecart}$ ans plus jeune ${queDevant(prenom2)}.<br>
    Si on additionne leurs âges, on obtient $${somme}$.<br>
    Quel est l'âge ${deDevant(prenom1)} ?<br>`
    if (this.interactif) {
      this.optionsChampTexte = { texteApres: ' ans' }
    } else {
      this.question += '$\\ldots$ ans'
    }

    this.correction = `Soit $x$ l'âge ${deDevant(prenom1)}. Alors l'âge ${deDevant(prenom2)} est $x+${ecart}$.<br>
    $\\begin{aligned}
    x+(x+${ecart})&=${somme}\\\\
    2x+${ecart}&=${somme}\\\\
    2x&=${somme - ecart}\\\\
    x&=${miseEnEvidence(String(age1))}\\\\
    \\end{aligned}$<br>
    ${prenom1} a $${miseEnEvidence(age1)}$ ans (et ${prenom2} a $${age2}$ ans).`

    this.canEnonce = `${prenom1} est $${ecart}$ ans plus jeune ${queDevant(prenom2)}. <br>
    Si on additionne leurs âges on obtient ${somme}. <br>
    Quel est l'âge ${deDevant(prenom1)} ?`
    this.canReponseACompleter = '$\\ldots$ ans'
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(16, 30, 'Lisa', 'Kathy')
    else this.enonce()
  }
}
