import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'

import ExerciceCan from '../../ExerciceCan'

export const titre = "Calculer une limite avec l'infini"
export const interactifReady = true

export const uuid = 'agjju'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/ export default class Can2026TermQ27 extends ExerciceCan {
  enonce(): void {
    this.formatChampTexte = KeyboardType.clavierEnsemble // Clavier mis à jour comme demandé
    this.reponse = '+\\infty'

    this.question = `$\\displaystyle\\lim_{x\\to ${texNombre(2026)}} \\dfrac{x^{${texNombre(2026)}}}{(${texNombre(2026)}-x)^2}$`

    this.correction = `$\\displaystyle\\lim_{x\\to ${texNombre(2026)}} x^{${texNombre(2026)}} = ${texNombre(2026)}^{${texNombre(2026)}} > 0$<br>`
    this.correction += `$\\displaystyle\\lim_{x\\to ${texNombre(2026)}} (${texNombre(2026)}-x)^2 = 0^+$ (car un carré est toujours positif ou nul).<br>`
    this.correction += `Par quotient, on en déduit que :<br>`
    this.correction += `$\\displaystyle\\lim_{x\\to ${texNombre(2026)}} \\dfrac{x^{${texNombre(2026)}}}{(${texNombre(2026)}-x)^2}=${miseEnEvidence('+\\infty')}$`

    if (this.interactif) {
      this.question += '$=$'
    } else {
      this.question += ' $=\\ldots$'
    }

    this.canEnonce = `$\\displaystyle\\lim_{x\\to ${texNombre(2026)}} \\dfrac{x^{${texNombre(2026)}}}{(${texNombre(2026)}-x)^2}=$`
  }

  nouvelleVersion(): void {
    this.enonce()
  }
}
