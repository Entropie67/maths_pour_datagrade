import { gestionnaireFormulaireTexte } from '../../modules/outils'
import ConstruireUnTriangle from './6G6A-1'
export const titre =
  'Construire un triangle particulier avec les instruments et auto-vérification'
export const interactifReady = false
export const dateDePublication = '17/12/2022'

/**
 * Construire un triangle quelconque avec les instruments et auto-vérification
 *
 * @author Mickael Guironnet
 */
export const uuid = 'e1e64'

export const refs = {
  'fr-fr': ['6G6A-4'],
  'fr-2016': ['6G21-3'],
  'fr-ch': ['9R1ES2B-5', '9R2ES2B-5', '9R3ES2B-5', 'PRQES02A-8', 'PRQES04B-7'],
}
export default class ConstruireUnTriangleParticulier extends ConstruireUnTriangle {
  constructor() {
    super()

    // Même numérotation que l'ancien menu numérique pour rester compatible avec les anciens liens :
    // les numéros 3, 9, 10 et 11 (anciens mélanges) ne sont plus proposés mais restent acceptés
    this.besoinFormulaireNumerique = false
    this.besoinFormulaireTexte = [
      'Type de constructions',
      'Nombres séparés par des tirets :\n1 : Trois longueurs\n2 : Angle droit et deux longueurs\n4 : Trois longueurs avec auto-vérification\n5 : Isocèle avec deux longueurs avec auto-vérification\n6 : Rectangle avec deux longueurs dont hypoténuse avec auto-vérification\n7 : Rectangle avec deux longueurs sans hypoténuse avec auto-vérification\n8 : Equilatéral avec auto-vérification',
    ]
    this.sup = '5-6-7-8'
    this.nbQuestions = 6
  }

  typesDeQuestionsDisponibles(): number[] {
    // Pour chaque numéro de la saisie, les types de questions de ConstruireUnTriangle correspondants
    const typesParNumero: Record<number, number[]> = {
      1: [1],
      2: [2],
      3: [1, 2],
      4: [3],
      5: [4],
      6: [5],
      7: [6],
      8: [7],
      9: [4, 5, 6, 7],
      10: [3, 4, 5, 6, 7],
      11: [3, 4, 7],
    }
    const numeros = gestionnaireFormulaireTexte({
      saisie: this.sup,
      max: 11,
      defaut: 9, // équivaut à 5-6-7-8
      nbQuestions: 0,
      melange: 0,
      shuffle: false,
      enleveDoublons: true,
    })
    return [
      ...new Set(numeros.flatMap((numero) => typesParNumero[Number(numero)])),
    ]
  }
}
