import {
  lireFormulaireComplexe,
  serialiseFormulaireComplexe,
  valeursParDefaut,
  type FormulaireComplexe,
} from '../../lib/formulaireComplexe'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Trouver double, moitié, tiers, triple, quart, quadruple'
export const amcReady = true
export const interactifReady = true

export const amcType = 'AMCNum'

/**
 * Calculer le double, le triple ou le quadruple d'un nombre, calculer la moitié
 * d'un nombre pair, le tiers d'un multiple de 3 ou le quart d'un multiple de 4.
 * @author Rémi Angot

 */
export const dateDeModifImportante = '10/09/2026'

export const uuid = '26a94'

export const refs = {
  'fr-fr': ['6P3autoA-3', '6AutoP1-2'],
  'fr-2016': ['CM014'],
  'fr-ch': ['9R1FA1D-3', '9R2FA1D-3', '9R3FA1D-3'],
}

/**
 * Chaque question tire un type de calcul dans la liste ci-dessous. L'enseignant
 * choisit les types travaillés et leur poids d'apparition.
 */
const formulaire: FormulaireComplexe = {
  champs: [
    {
      type: 'listePonderee',
      nom: 'typesQuestions',
      label: 'Types de calculs (poids d’apparition)',
      items: [
        { nom: 'double', label: 'Double', poids: 1 },
        { nom: 'moitie', label: 'Moitié', poids: 1 },
        { nom: 'triple', label: 'Triple', poids: 1 },
        { nom: 'tiers', label: 'Tiers', poids: 1 },
        { nom: 'quadruple', label: 'Quadruple', poids: 0 },
        { nom: 'quart', label: 'Quart', poids: 0 },
      ],
    },
  ],
}

export default class DoubleMoitieTiersTriple extends Exercice {
  constructor() {
    super()

    this.consigne = 'Calculer.'

    this.nbCols = 2
    this.nbColsCorr = 2

    this.besoinFormulaireComplexe = formulaire
    this.sup = serialiseFormulaireComplexe(
      formulaire,
      valeursParDefaut(formulaire),
    )
  }

  nouvelleVersion() {
    const params = lireFormulaireComplexe(formulaire, this.sup)
    // Un type de calcul par question, réparti selon les poids choisis puis mélangé.
    const listeTypeDeQuestions = params.repartition(
      'typesQuestions',
      this.nbQuestions,
    )
    for (
      let i = 0, texte = '', texteCorr = '', a = 0, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      switch (listeTypeDeQuestions[i]) {
        case 'double':
          a = randint(2, 9)
          texte = `$\\text{Le double de }${a}$`
          texteCorr = `$\\text{Le double de }${a} \\text{ est } ${miseEnEvidence(a * 2)}$`
          handleAnswers(this, i, { reponse: { value: a * 2 } })
          if (this.interactif)
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierNumbers,
            )
          break
        case 'moitie':
          a = randint(2, 9) * 2
          texte = `$\\text{La moitié de }${a * 2}$`
          texteCorr = `$\\text{La moitié de }${a * 2} \\text{ est } ${miseEnEvidence(a)}$`
          handleAnswers(this, i, { reponse: { value: a } })
          if (this.interactif)
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierNumbers,
            )
          break
        case 'triple':
          a = randint(2, 9)
          texte = `$\\text{Le triple de }${a}$`
          texteCorr = `$\\text{Le triple de }${a} \\text{ est } ${miseEnEvidence(a * 3)}$`
          handleAnswers(this, i, { reponse: { value: a * 3 } })
          if (this.interactif)
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierNumbers,
            )
          break
        case 'tiers':
          a = randint(2, 9)
          texte = `$\\text{Le tiers de }${a * 3}$`
          texteCorr = `$\\text{Le tiers de }${a * 3} \\text{ est } ${miseEnEvidence(a)}$`
          handleAnswers(this, i, { reponse: { value: a } })
          if (this.interactif)
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierNumbers,
            )
          break
        case 'quadruple':
          a = randint(2, 9)
          texte = `$\\text{Le quadruple de }${a}$`
          texteCorr = `$\\text{Le quadruple de }${a} \\text{ est } ${miseEnEvidence(a * 4)}$`
          handleAnswers(this, i, { reponse: { value: a * 4 } })
          if (this.interactif)
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierNumbers,
            )
          break
        case 'quart':
          a = randint(2, 9)
          texte = `$\\text{Le quart de }${a * 4}$`
          texteCorr = `$\\text{Le quart de }${a * 4} \\text{ est } ${miseEnEvidence(a)}$`
          handleAnswers(this, i, { reponse: { value: a } })
          if (this.interactif)
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierNumbers,
            )
          break
      }

      if (this.listeQuestions.indexOf(texte) === -1) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr + '.'
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
