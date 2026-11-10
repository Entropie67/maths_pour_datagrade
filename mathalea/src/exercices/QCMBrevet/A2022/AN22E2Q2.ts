import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import { nombreElementsDifferents } from '../../ExerciceQcm'
import ExerciceQcmA from '../../ExerciceQcmA'
export const uuid = '6a9db'
export const refs = {
  'fr-fr': ['4C2QCM-03'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Ratios (Juin 2022 Amérique du nord)'
export const dateDePublication = '07/11/2024'

/**
 *
 * @author Jean-Claude LHOTE
 * jean-claude.lhote@ac-nancy-metz.fr
 */
export default class AmeriqueNordJuin22Ex1Q2 extends ExerciceQcmA {
  private appliquerLesValeurs(nbVol: number, volume: number): void {
    this.reponses = [
      `$${texNombre(nbVol * Math.round(volume / (nbVol + 1)), 0)}$`,
      `$${texNombre(Math.round(volume / nbVol), 0)}$`,
      `$${texNombre(Math.round(volume / (nbVol + 1)), 0)}$`,
      `$${texNombre((nbVol - 2) * Math.round(volume / nbVol), 0)}$`,
    ]

    this.enonce = `Une boisson est composée de sirop et d'eau dans la proportion d'un volume de sirop pour $${nbVol}$ volumes d'eau (c'est à dire dans le ratio $1:${nbVol}$).<br>`
    this.enonce += `La quantité d'eau nécessaire pour préparer $${texNombre(volume)}$ mL de cette boisson est :`
    this.correction = `Pour préparer la boisson on utilise $1$ volume de sirop et $${nbVol}$ volumes d'eau, soit $${nbVol + 1}$ volumes de liquide.<br>`
    this.correction += `Pour $${texNombre(volume)}$ mL de boisson, le volume d'eau est donc :<br>
    $${nbVol}\\times \\dfrac{${texNombre(volume)}}{${nbVol + 1}}=${nbVol}\\times ${volume / (nbVol + 1)}$ soit $${miseEnEvidence(texNombre(nbVol * Math.round(volume / (nbVol + 1)), 0))}$ mL d'eau.<br>`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(7, 560)
  }

  versionAleatoire: () => void = () => {
    const n = 4
    do {
      const nbVol = randint(4, 10)
      const volume = nbVol * (nbVol + 1) * 10
      this.appliquerLesValeurs(nbVol, volume)
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
