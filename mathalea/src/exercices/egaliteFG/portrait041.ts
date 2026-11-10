import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Samira El Yacoubi'
export const dateDePublication = '17/07/2026'
export const uuid = 'e9f3b'
export const refs = {
  'fr-fr': ['Portraits-041'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait041 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Samira El Yacoubi'
    this.photoSrc = '/alea/images/egalite/el-yacoubi.webp'
    this.photoAlt = 'Portrait de Samira El Yacoubi'
    this.source = 'AEF Info'
    this.superPouvoir = 'Architecte de la simulation environnementale'
    this.ceQuElleFait = 'Elle développe des modèles informatiques pour prédire la diffusion des polluants dans l\'air urbain'
    this.leTrucStyle = 'Ses simulations aident les urbanistes à mieux concevoir les villes pour réduire l\'exposition des habitants à la pollution'
    this.parcours = 'Mathématiques et Informatique'
  }
}
