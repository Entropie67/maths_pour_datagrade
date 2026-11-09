import AppliquerPourcentage from '../6e/6N3Q'
export const titre = 'Appliquer un pourcentage (calculs simples)'
export const dateDePublication = '19/06/2022'
export const amcReady = true
export const amcType = 'AMCNum'
export const interactifReady = true

/**
 * Clone de 6N33-1 pour les 1er
 * @author Rémi Angot
 */

export const uuid = '5199b'

export const refs = {
  'fr-fr': ['5P1B-3'],
  'fr-2016': ['5P14-2'],
  'fr-ch': ['NR'],
}
export default class AppliquerPourcentage1 extends AppliquerPourcentage {
  protected pourcentagesHorsMelange = [80]

  constructor() {
    super()
    this.sup = 1
    this.besoinFormulaire2Texte = [
      'Choix des pourcentages',
      `Nombres séparés par des tirets
1 : 10%
2 : 20%
3 : 25%
4 : 30%
5 : 40%
6 : 50%
7 : 60%
8 : 75%
9 : 90%
10 : Mélange (sans le 80%)
11 : 80%`,
    ]
  }
}
