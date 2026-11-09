import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { toutPourUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import CoordonneesPointIntersectionAxeAbscissesDroite from '../can/2e/can2G30-08'
export const titre =
  'Calculer les coordonnées du point d’intersection entre l’axe des abscisses et une droite'
export const dateDePublication = '26/07/2025'
export const amcReady = true
export const interactifReady = true

/**
 * Clone de can2L03 pour les auto 1er
 * @author Gilles Mora
 */

export const dateDeModifImportante = '30/10/2026'

export const uuid = 'ef907'

export const refs = {
  'fr-fr': ['1A-F02-9', '2A-F2-3'],
  'fr-ch': ['1mQCM-5'],
}
export default class Auto1AF2a extends CoordonneesPointIntersectionAxeAbscissesDroite {
  nouvelleVersion() {
    this.formatInteractif = undefined
    super.nouvelleVersion()
    if (this.interactif && !this.versionQcm) {
      const [abscisse, ordonnee] = String(this.reponse).split(';')
      this.question =
        (this.question ?? '')
          .replace('Déterminer les coordonnées', 'Les coordonnées')
          .replace(/\.\s*$/, ' sont ') +
        remplisLesBlancs(
          this,
          0,
          '(%{champ1}\\,;\\,%{champ2})',
          KeyboardType.clavierDeBaseAvecFraction,
        ) +
        '.'
      this.formatInteractif = 'fill-in-the-blank'
      this.reponse = {
        bareme: toutPourUnPoint,
        champ1: { value: abscisse, options: { nombreDecimalSeulement: true } },
        champ2: { value: ordonnee, options: { nombreDecimalSeulement: true } },
      }
    }
  }

  constructor() {
    super()
    this.versionQcm = false
  }
}
