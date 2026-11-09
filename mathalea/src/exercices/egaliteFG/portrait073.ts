import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Sibylle Marcotte'
export const dateDePublication = '17/07/2026'
export const uuid = 'f622d'
export const refs = {
  'fr-fr': ['Portraits-073'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait073 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Sibylle Marcotte'
    this.photoSrc = '/alea/images/egalite/marcotte.png'
    this.photoAlt = 'Portrait de Sibylle Marcotte'
    this.source = 'CNRS INSMI'
    this.superPouvoir = 'Mécanicienne des réseaux de neurones'
    this.ceQuElleFait = 'Explique l\'apprentissage des IA'
    this.leTrucStyle = 'Ouvre le capot des modèles complexes'
    this.parcours = 'Mathématiques'
  }
}
