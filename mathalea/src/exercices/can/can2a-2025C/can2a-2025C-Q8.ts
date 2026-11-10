import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Convertir une durée en minutes'
export const interactifReady = true

export const uuid = 'h278j'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2a2025CQ8 extends ExerciceCan {
  enonce(h?: number, m?: number): void {
    if (h == null || m == null) {
      h = this.quotaRandint('h', 2, 4)
      m = this.quotaChoice('m', [25, 35, 45, 55])
    }

    const resultat = h * 60 + m
    const mTxt = String(m)

    this.formatChampTexte = KeyboardType.clavierDeBase
    this.reponse = String(resultat)
    this.question = `Convertir $${h}$ h $${mTxt}$ en minutes.<br>`
    if (this.interactif) {
      this.optionsChampTexte = { texteApres: ' min' }
    } else {
      this.question += '$\\ldots$ min'
    }
    this.correction = `$${h}$ h $${mTxt} =${h}\\times 60+${m}=${h * 60}+${m}=${miseEnEvidence(String(resultat))}$ min.`
    this.canEnonce = `Convertir $${h}$ h $${mTxt}$ en minutes.`
    this.canReponseACompleter = '$\\ldots$ min'
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(3, 45)
    else this.enonce()
  }
}
