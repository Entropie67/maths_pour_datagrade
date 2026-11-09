import TriangleEquilateral from '../4e/4G22-0'

export const titre =
  'Calculer dans un triangle équilatéral (longueur, hauteur, aire)'
export const dateDePublication = '12/12/2025'
export const interactifReady = true

export const uuid = 'b18ea'

export const refs = {
  'fr-fr': ['2G11-5'],
  'fr-ch': ['10LCGM3A-9', '10LSGM3A-9', '11CTGM2A-9'],
}
export default class TriangleEquilateral2e extends TriangleEquilateral {
  declare niveau: number
  declare sup: number
  declare sup2: number
  declare sup3: boolean

  constructor() {
    super()
    this.niveau = 2
    this.sup = 3
    this.besoinFormulaireTexte = [
      'Type de questions',
      "Nombres séparés par des tirets\n1 : Calcul de la hauteur\n2 : Calcul de l'aire\n3 : Calcul du côté",
    ]
    this.besoinFormulaire2Numerique = [
      'Type de réponse attendue',
      3,
      '1 : Valeur exacte\n2 : Valeur approchée par excès ou par défaut à 0,1 cm près\n3 : Valeur arrondie à 0,1 cm près',
    ]
    this.sup2 = 1
    this.besoinFormulaire3CaseACocher = ['Avec figure', true]
    this.sup3 = true
    this.nbQuestions = 1
  }
}
