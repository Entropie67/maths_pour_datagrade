import Transformations from './_Transformations'
export const titre = "Trouver l'image d'un point par une symétrie axiale"
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'

/**
 * Transformations : trouvers un point numéroté par une des transformations du plan. Fonction générale utilisée sur tous les niveaux
 * @author Jean-claude Lhote

 * Pas de version LaTeX
 * Relecture : Novembre 2021 par EE
 */
export const uuid = 'e9d29'

export const refs = {
  'fr-fr': ['6G7B'],
  'fr-2016': ['6G24'],
  'fr-ch': ['NR'],
}
export default class Transformations6e extends Transformations {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Choix des transformations',
      'Nombres séparés par des tirets  : \n1 : Symétrie oblique (Diagonale 1)\n2 : Symétrie oblique (Diagonale 2)\n3 : Symétrie horizontale\n4 : Symétrie verticale',
    ]

    this.sup = 1
  }
}
