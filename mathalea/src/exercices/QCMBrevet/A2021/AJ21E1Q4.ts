import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence, texteEnCouleurEtGras } from '../../../lib/outils/embellissements'
import { rangeMinMax } from '../../../lib/outils/nombres'
import { texNombre } from '../../../lib/outils/texNombre'
import { nombreElementsDifferents } from '../../ExerciceQcm'
import ExerciceQcmA from '../../ExerciceQcmA'

export const uuid = 'ae6d3'
export const refs = {
  'fr-fr': ['3L1QCM-09'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Équation type $x^2=a$ (06/2021 Asie)'
export const dateDePublication = '09/11/2024'
/**
 *
 * @author Jean-Claude LHOTE
 * jean-claude.lhote@ac-nancy-metz.fr
 */

export default class AsieJuin21Exo1Q4 extends ExerciceQcmA {
  private appliquerLesValeurs(a: number): void {
    this.reponses = [
      `$${texNombre(-a, 1)}$ et $${texNombre(a, 1)}$`,
      `$${texNombre(-2 * a * a, 2)}$ et $${texNombre(2 * a * a, 2)}$`,
      `$${texNombre((-a * a) / 2, 3)}$ et $${texNombre((a * a) / 2, 3)}$`,
    ]
    this.enonce = `Les solutions de l'équation $x^2=${texNombre(a ** 2, 2)}$ sont :`
    this.correction = `Nous cherchons les nombres dont le carré vaut $${texNombre(a ** 2, 2)}$.<br>
    Il y a $-\\sqrt{${texNombre(a ** 2, 2)}}$ et $\\sqrt{${texNombre(a ** 2, 2)}}$.<br>Soit $${miseEnEvidence(texNombre(-a, 1))}$ ${texteEnCouleurEtGras('et')} $${miseEnEvidence(texNombre(a, 1))}$.`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(4)
  }

  versionAleatoire: () => void = () => {
    const n = 3
    do {
      const a = choice(
        rangeMinMax(3, 9).concat(rangeMinMax(3, 9).map((n) => n / 10)),
      )
      this.appliquerLesValeurs(a)
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
