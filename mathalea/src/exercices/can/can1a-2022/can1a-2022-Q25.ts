import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import {
  ecritureAlgebrique,
  reduireAxPlusB,
  rienSi1,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import FractionEtendue from '../../../modules/FractionEtendue'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre =
  "Calculer l'abscisse d'un point d'une droite à partir de son ordonnée"
export const interactifReady = true

export const uuid = 'dfyhs'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can1a2022Q25 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsDeComparaison = {
      nombreDecimalSeulement: true,
      fractionEgale: true,
    }
  }

  enonce(m?: number, p?: number, ordonnee?: number) {
    if (m == null || p == null || ordonnee == null) {
      m = randint(1, 5)
      p = randint(-10, 10, 0)
      ordonnee = randint(-5, 5)
    }

    const reponse = new FractionEtendue(ordonnee - p, m)

    this.question = `$M$ est un point d'ordonnée $${ordonnee}$ de la droite d'équation $y=${reduireAxPlusB(m, p)}$.<br>`

    if (this.interactif) {
      this.optionsChampTexte = {
        texteAvant: `$M($`,
        texteApres: `$;${ordonnee})$`,
      }
    } else {
      this.question += `${sp(5)}Compléter $M(\\ldots$ ; $${ordonnee})$`
    }

    this.correction = `L'abscisse $x_M$ du point $M$ vérifie l'égalité : $${rienSi1(m)}x_M${ecritureAlgebrique(p)}=${ordonnee}$.<br>
Ainsi, $x_M=${reponse.texFraction}${reponse.texSimplificationAvecEtapes()}$.<br>
$x_M=${miseEnEvidence(reponse.texFractionSimplifiee)}$.`
    this.reponse = reponse
    this.canEnonce = `$M$ est un point d'ordonnée $${ordonnee}$ de la droite d'équation $y=${reduireAxPlusB(m, p)}$.`
    this.canReponseACompleter = ` $M(\\ldots\\,;\\,${ordonnee})$`
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(3, -3, 9)
    else this.enonce()
  }
}
