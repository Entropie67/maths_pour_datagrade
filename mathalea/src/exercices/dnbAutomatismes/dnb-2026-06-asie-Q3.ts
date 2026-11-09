import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = 'ac923'
export const refs = {
  'fr-fr': ['3AutoM07-2'],
  'fr-ch': ['9R1GM3B-2', '9R2GM3B-2', '9R3GM3B-2', 'PRQMG02A-7'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = "Calculer le volume d'un pavé droit"
export const dateDePublication = '10/08/2026'

/**
 * DNB Asie juin 2026 - Question 3
 * Calcul du volume d'un pavé droit
 * @author Jean-Claude Lhote
 */
export default class AutoQ3Asiebrevet2026 extends ExerciceQcmA {
  private appliquerLesValeurs(
    lo: number,
    loD: number,
    la: number,
    h: number,
  ): void {
    const long = lo + loD / 10
    this.enonce = `Un pavé droit a pour dimensions : $${texNombre(long, 1)}\\text{ cm}$ de long, $${texNombre(la, 1)}\\text{ cm}$ de large, $${texNombre(h, 1)}\\text{ cm}$ de haut. Le volume de ce pavé
est de :`

    this.reponses = [
      `$${texNombre(long * la * h, 1)}\\text{ cm}^3$`,
      `$${texNombre(lo * la * h + loD / 10, 1)}\\text{ cm}^3$`,
      `$${texNombre(lo + loD / 10 + la + h, 1)}\\text{ cm}^3$`,
      `$${texNombre((long * la - 1) * h, 1)}\\text{ cm}^3$`,
    ]

    this.correction = `$\\mathcal{V}=${texNombre(long, 1)}\\text{ cm}\\times${texNombre(la, 0)}\\text{ cm}\\times${texNombre(h, 0)}\\text{ cm}=${miseEnEvidence(`${texNombre(long * la * h, 1)}\\text{ cm}^3`)}$`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(4, 5, 4, 10)
  }

  versionAleatoire = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }
    const lo = randint(2, 4) * 2
    const loD = 5
    const la = randint(2, 5) * 2
    const h = randint(1, 2) * 10
    this.appliquerLesValeurs(lo, loD, la, h)
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
