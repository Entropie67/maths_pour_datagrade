import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = 'a6a23'
export const refs = {
  'fr-fr': ['3AutoN07-3'],
  'fr-ch': ['10CTNO5A-5', '10LCNO5A-5', '10LSNO5A-5', '11CTNO3A-5', 'PRQNO07C-5'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = "Donner l'écriture scientifique d'un nombre"
export const dateDePublication = '06/06/2026'

/**
 * DNB Asie juin 2026 - Question 1
 * Écriture scientifique
 * @author Jean-Claude Lhote
 */
export default class AutoQ1Asiebrevet2026 extends ExerciceQcmA {
  private appliquerLesValeurs(n: number): void {
    this.enonce = `L'écriture scientifique du nombre $${texNombre(n, 0)}$ est :`
    const expo = Math.floor(Math.log10(n))
    const mantisse = n / Math.pow(10, expo)

    this.reponses = [
      `$${texNombre(mantisse, expo)} \\times 10^{${expo}}$`,
      `$${texNombre(mantisse * 10, expo - 1)} \\times 10^{${expo - 1}}$`,
      `$${texNombre(mantisse, expo)} \\times 10^{${-expo}}$`,
      `$${texNombre(mantisse * 1000, expo - 3)}\\times 10^{${expo - 3}}$`,
    ]

    this.correction = `$${texNombre(n, 0)}=${texNombre(mantisse, expo)} \\times ${texNombre(10 ** expo, 0)}=${miseEnEvidence(`${texNombre(mantisse, expo)}\\times 10^{${expo}}`)}$`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(45310)
  }

  versionAleatoire = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }
    const n = randint(10000, 999999)
    this.appliquerLesValeurs(n)
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
