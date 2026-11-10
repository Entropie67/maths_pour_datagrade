import {
  lireFormulaireComplexe,
  serialiseFormulaireComplexe,
  valeursParDefaut,
  type FormulaireComplexe,
} from '../../lib/formulaireComplexe'
import PerimetreOuAireDeFiguresComposees, {
  type ReglagesFiguresComposees,
} from '../5e/5G2E-5'

export const titre = 'Calculer périmètre de figures composées'
export const dateDePublication = '27/07/2025'
export const dateDeModifImportante = '30/10/2026'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'

/**
 * Calculer périmètre de figures composées
 * @author Éric Elter (comme clone de 6M11-2 de Rémi Angot)
 */

export const uuid = 'c2746'

export const refs = {
  'fr-fr': ['6M1D'],
  'fr-2016': ['6M11-2a'],
  'fr-ch': ['NR'],
}

const formulaire: FormulaireComplexe = {
  champs: [
    {
      type: 'listePonderee',
      nom: 'figures',
      label: 'Types de figures (poids d’apparition)',
      items: [
        { nom: '1', label: 'Rectangle & triangle', poids: 0 },
        { nom: '2', label: 'Rectangle moins triangle', poids: 0 },
        { nom: '3', label: 'Rectangle moins deux triangles', poids: 0 },
        { nom: '4', label: 'Rectangle & demi-disque', poids: 1 },
        { nom: '5', label: 'Rectangle & disque', poids: 1 },
        { nom: '6', label: 'Rectangle & demi-disque & triangle', poids: 1 },
        { nom: '7', label: 'Rectangle & 2 demi-disques', poids: 0 },
      ],
    },
    {
      type: 'case',
      nom: 'ordreAleatoire',
      label: 'Ordre aléatoire des figures choisies',
      defaut: true,
    },
    {
      type: 'selection',
      nom: 'precision',
      label: 'Choix de la précision (pour les valeurs approchées)',
      options: [
        { valeur: '1', label: 'À l’unité' },
        { valeur: '2', label: 'Au dixième' },
      ],
      defaut: '1',
    },
    {
      type: 'case',
      nom: 'deuxValeurs',
      label: 'Accepter les deux valeurs approchées',
    },
    { type: 'case', nom: 'unites', label: 'Unités dans la correction' },
  ],
}

export default class PerimetreDeFiguresComposees extends PerimetreOuAireDeFiguresComposees {
  constructor() {
    super()
    this.besoinFormulaireTexte = false
    this.besoinFormulaire2CaseACocher = false
    this.besoinFormulaire3Numerique = false
    this.besoinFormulaire4Numerique = false
    this.besoinFormulaire5Numerique = false
    this.besoinFormulaireComplexe = formulaire
    this.sup = serialiseFormulaireComplexe(
      formulaire,
      valeursParDefaut(formulaire),
    )
  }

  protected lireReglages(): ReglagesFiguresComposees {
    const parametres = lireFormulaireComplexe(formulaire, this.sup)
    const figures = parametres.listeActive('figures')
    const retenues =
      figures.length > 0
        ? figures
        : parametres.declares('figures').filter((item) => item.poids > 0)
    return {
      // Un numéro de figure est répété autant de fois que son poids
      typesFigures: retenues
        .flatMap((item) => Array<string>(item.poids).fill(item.nom))
        .join('-'),
      ordreAleatoire: parametres.case('ordreAleatoire'),
      precision: Number(parametres.selection('precision')),
      demande: 1,
      deuxValeurs: parametres.case('deuxValeurs'),
      unitesCorrection: parametres.case('unites'),
      conclusionSansSymboles: true,
    }
  }
}
