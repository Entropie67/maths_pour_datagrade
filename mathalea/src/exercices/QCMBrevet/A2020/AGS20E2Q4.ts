import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import { nombreElementsDifferents } from '../../ExerciceQcm'
import ExerciceQcmA from '../../ExerciceQcmA'
export const uuid = '73aff'
export const refs = {
  'fr-fr': ['3C1QCM-06'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Notation scientifique (09/2020 Antilles-Guyane)'
export const dateDePublication = '09/11/2024'

/**
 *
 * @author Jean-Claude LHOTE
 * jean-claude.lhote@ac-nancy-metz.fr
 */
export default class AntillesSep20Ex2Q4 extends ExerciceQcmA {
  private appliquerLesValeurs(mantisse: number, exposant: number): void {
    const a = mantisse * 10 ** exposant
    this.reponses = [
      `$${texNombre(mantisse, 1)}\\times 10^{${exposant}}$`,
      `$${texNombre(mantisse * 10, 0)}\\times 10^{${exposant - 1}}$`,
      `$${texNombre(mantisse * 10, 0)}\\times 10^{${1 - exposant}}$`,
      `$${texNombre(mantisse, 1)}\\times 10^{${-exposant}}$`,
    ]
    this.enonce = `La notation scientifique de $${texNombre(a, 0)}$ est :`
    this.correction = `$${texNombre(a, 0)}=${texNombre(mantisse, 1)}\\times ${texNombre(10 ** exposant, 0)}=${miseEnEvidence(`${texNombre(mantisse, 1)}\\times 10^{${exposant}}`)}$`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(1.5, 9)
  }

  versionAleatoire: () => void = () => {
    const n = 4
    do {
      const mantisse = randint(11, 99) / 10
      const exposant = randint(3, 12)
      this.appliquerLesValeurs(mantisse, exposant)
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
