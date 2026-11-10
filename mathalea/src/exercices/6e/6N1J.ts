import RangerOrdreCroissantDecroissant from './6N0A-10'
import { gestionnaireFormulaireTexte } from '../../modules/outils'
export const titre = 'Ranger des nombres décimaux'
export const dateDePublication = '13/05/2025'
export const interactifReady = true

/**
 * * Ranger une liste de nombres décimaux
 * @author Éric Elter
 */

export const dateDeModifImportante = '19/09/2026'

export const uuid = 'd93f6'

export const refs = {
  'fr-fr': ['6N1J'],
  'fr-2016': ['6N31-7'],
  'fr-ch': ['PR-45', '9R1NO2D-5', '9R2NO2D-5', '9R3NO2D-5', 'PRQNO05A-10', 'PRQNO05B-2'],
}

export default class RangerOrdreCroissantDecroissantDecimaux extends RangerOrdreCroissantDecroissant {
  constructor() {
    super()
    this.besoinFormulaire2Texte = [
      'Type de nombres',
      [
        'Nombres séparés par des tirets :',
        '1 : Entiers',
        '2 : Au dixième',
        '3 : Au centième',
        '4 : Au millième',
        '5 : Mélange',
      ].join('\n'),
    ]
    this.besoinFormulaire3CaseACocher = [
      'Tous les nombres ont la même partie entière',
      true,
    ]
    this.sup = 1
    this.sup2 = '5'
    this.comment =
      'Le type de nombres permet de sélectionner et de panacher des entiers ou des nombres au dixième, au centième ou au millième.'
    this.correctionDetailleeDisponible = true
  }

  nouvelleVersion() {
    const saisieTypesDeNombres = this.sup2
    const typesDeNombres = gestionnaireFormulaireTexte({
      max: 4,
      defaut: 5,
      melange: 5,
      nbQuestions: 6,
      saisie: this.sup2,
    }).map(Number)
    const memePartieEntiere = this.sup3
    const ancienneSup4 = this.sup4
    const anciensTypesDeNombres = this.typesDeNombres

    // La classe parente utilise 0 pour représenter les entiers dans ce
    // paramétrage interne ; les autres valeurs correspondent aux précisions.
    this.typesDeNombres = typesDeNombres.map((type) => type - 1)
    this.sup2 = '1'
    this.sup3 = typesDeNombres.some((type) => type !== 1)
    this.sup4 = memePartieEntiere

    super.nouvelleVersion()

    this.typesDeNombres = anciensTypesDeNombres
    this.sup2 = saisieTypesDeNombres
    this.sup3 = memePartieEntiere
    this.sup4 = ancienneSup4
  }
}
