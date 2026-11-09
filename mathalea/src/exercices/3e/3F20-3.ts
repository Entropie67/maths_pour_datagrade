import TracerDroite2nde from '../2e/2F21-3'
import { sp } from '../../lib/outils/outilString'

export const titre = 'Représenter graphiquement une fonction affine'
export const dateDePublication = '06/04/2024'
export const interactifReady = true
export const uuid = '20c65'
export const refs = {
  'fr-fr': ['3F20-3'],
  'fr-ch': ['1mF2-15', '10LCFA3D-1', '10LSFA3D-1', '11CTFA2C-1', '11LCFA2C-1', '11LSFA2C-1', 'PRQPF01B-9'],
}

export default class TracerDroite extends TracerDroite2nde {
  constructor() {
    super()
    this.level = 3
    this.consigne = `Représenter graphiquement la fonction affine définie par${sp()}:`
    this.besoinFormulaireTexte = [
      'Types de question ',
      'Nombres séparés par des tirets :\n1 : Valeurs entières\n2 : Valeurs entières et demis pour le coefficient directeur\n3 : Mélange des deux cas précédents',
    ]
  }
}
