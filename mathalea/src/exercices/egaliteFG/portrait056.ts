import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Raphaèle Herbin'
export const dateDePublication = '17/07/2026'
export const uuid = '788bd'
export const refs = {
  'fr-fr': ['Portraits-056'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait056 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Raphaèle Herbin'
    this.photoSrc = '/alea/images/egalite/herbin.jpg'
    this.photoAlt = 'Portrait de Raphaèle Herbin'
    this.source = 'CNRS'
    this.superPouvoir = 'Simulatrice de fluides dangereux'
    this.ceQuElleFait = 'Simule incendies et explosions par maths'
    this.leTrucStyle = 'Sécurise le nucléaire sans vrais tests'
    this.parcours = 'Mathématiques'
  }
}
