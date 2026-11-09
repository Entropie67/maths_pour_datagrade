import ConstruireUnTriangleAvecCible from '../6e/_Construire_un_triangle_avec_cible'
export const titre = 'Construire un triangle'
export const interactifReady = false

/**
 * @author Jean-claude Lhote
 */
export const uuid = 'a808d'

export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export default class ConstruireUnTriangleAvecCible5eOld extends ConstruireUnTriangleAvecCible {
  constructor() {
    super()
    this.classe = 5
    this.sup3 = 10
    this.besoinFormulaire3Texte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets  :',
        '1 : Triangle avec 3 longueurs',
        '2 : Triangle rectangle avec 2 longueurs',
        '3 : Triangle isocèle avec 2 longueurs',
        '4 : Triangle rectangle et isocèle avec 1 longueur',
        '5 : Triangle équilatéral',
        '6 : Triangle avec 2 longueurs et 1 angle',
        '7 : Triangle avec 1 longueur et 2 angles adjacents',
        "8 : Triangle rectangle avec 1 longueur et l'hypoténuse",
        '9 : Triangle avec 1 longueur 1 angle adjacent et 1 angle opposé',
        '10 : Mélange',
      ].join('\n'),
    ]
  }
}
