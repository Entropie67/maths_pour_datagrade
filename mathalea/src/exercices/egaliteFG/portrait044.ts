import PortraitExercice from './_PortraitExercice'
import { sp } from '../../lib/outils/outilString'

export const titre = 'Portrait : Virginie Fauvel'
export const dateDePublication = '17/07/2026'
export const uuid = '8e0a6'
export const refs = {
  'fr-fr': ['Portraits-044'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait044 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Virginie Fauvel'
    this.photoSrc = '/alea/images/egalite/fauvel.png'
    this.photoAlt = 'Portrait de Virginie Fauvel'
    this.source = 'Harvest'
    this.superPouvoir = 'Architecte de banques numériques'
    this.ceQuElleFait = 'Modernise les services bancaires'
    this.leTrucStyle = `A lancé les premières banques 100${sp()}% en ligne`
    this.parcours = 'Informatique'
  }
}
