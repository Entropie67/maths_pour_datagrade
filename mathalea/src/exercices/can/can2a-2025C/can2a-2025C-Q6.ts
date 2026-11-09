import Decimal from 'decimal.js'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceCan from '../../ExerciceCan'
export const titre = "Calculer une fraction d'un nombre décimal"
export const interactifReady = true

export const uuid = '1ggdz'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2a2025CQ6 extends ExerciceCan {
  enonce(diviseur?: number, nombre?: Decimal): void {
    if (diviseur == null || nombre == null) {
      diviseur = this.quotaChoice('diviseur', [3, 4, 5])
      // On génère un nombre dont la division tombe juste
      const partieEntiere = this.quotaRandint('partieEntiere', 2, 15) * diviseur
      const partieDecimale =
        this.quotaRandint('partieDecimale', 1, 9) * diviseur
      nombre = new Decimal(partieEntiere).add(
        new Decimal(partieDecimale).div(100),
      )
    }

    const resultat = nombre.div(diviseur)
    const noms: Record<number, string> = {
      3: 'tiers',
      4: 'quart',
      5: 'cinquième',
    }
    const nom = noms[diviseur] || `${diviseur}e`

    this.formatChampTexte = KeyboardType.clavierDeBase
    this.reponse = texNombre(resultat, 4)
    this.question = `Quel est le ${nom} de $${texNombre(nombre, 2)}$ ?<br>`
    this.correction = `Le ${nom} de $${texNombre(nombre, 2)}$ est $\\dfrac{${texNombre(nombre, 2)}}{${diviseur}}=${miseEnEvidence(texNombre(resultat, 4))}$.`
    this.canEnonce = `Quel est le ${nom} de $${texNombre(nombre, 2)}$ ?`
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(5, new Decimal(35.15))
    else this.enonce()
  }
}
