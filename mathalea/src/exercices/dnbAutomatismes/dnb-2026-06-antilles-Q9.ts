import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import ExerciceCan from '../ExerciceCan'

export const uuid = 'ff7e8'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['11CTFA1A-7', '11LCFA1A-7', '11LSFA1A-7', 'PRQPF03C-6'],
}
export const interactifReady = true

export const titre = "Calculer une durée à partir d'une vitesse moyenne"
export const dateDePublication = '06/06/2026'

/**
 * DNB Antilles juin 2026 - Question 9
 * Couples (vitesse en km/h, distance en km) choisis pour donner une durée entière en minutes.
 * @author Rémi Angot
 */
export default class AutoQ9Antillesbrevet2026 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.optionsChampTexte = { texteApres: ' min' }
  }

  enonce(vitesse?: number, distance?: number) {
    if (vitesse == null || distance == null) {
      // Les vitesses divisent 60 pour que 1/vitesse heure soit un nombre entier de minutes.
      ;[vitesse, distance] = choice([
        [20, 15],
        [20, 5],
        [20, 8],
        [30, 12],
        [30, 18],
        [15, 10],
        [12, 3],
        [10, 4],
      ])
    }
    const uneFractionEnMinutes = 60 / vitesse
    const dureeEnMinutes = distance * uneFractionEnMinutes

    this.reponse = dureeEnMinutes
    this.question = `Un vélo roule à la vitesse moyenne de $${vitesse}~\\text{km/h}$.<br>
Quelle est la durée d'un trajet de $${distance}~\\text{km}$ ?`
    if (this.interactif) this.question += '<br>'

    this.correction = `Si on note $v$ la vitesse moyenne, $d$ la distance parcourue et $t$ le temps de parcours, on a :<br>
$v=\\dfrac{d}{t}$ donc $vt=d$ puis $t=\\dfrac{d}{v}=\\dfrac{${distance}}{${vitesse}}$ en heure.<br>
$\\dfrac{1}{${vitesse}}~\\text{h}=${uneFractionEnMinutes}~\\text{min}$ donc $\\dfrac{${distance}}{${vitesse}}~\\text{h}=${distance}\\times ${uneFractionEnMinutes}~\\text{min}=${dureeEnMinutes}~\\text{min}$.<br>
Le trajet dure donc $${miseEnEvidence(`${dureeEnMinutes}`)}$ min.`
  }

  nouvelleVersion() {
    if (this.canOfficielle) {
      this.enonce(20, 15)
    } else {
      this.enonce()
    }
  }
}
