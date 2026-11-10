import { choixDeroulant } from '../../lib/customElements/ListeDeroulanteElement'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'

import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'

export const titre = 'Connaitre les préfixes utilisés dans les unités'
export const interactifReady = true

export const dateDePublication = '17/09/2022'

/**
 * Associer les préfixes à leur opération correspondante
 * @author Rémi Angot

 */
export const uuid = '5d1e2'

export const refs = {
  'fr-fr': ['6M1autoA-1', 'BP2AutoT1', '6AutoL1'],
  'fr-2016': ['6N13-0', 'BP2AutoT1'],
  'fr-ch': ['9R1GM4A-2', '9R2GM4A-2', '9R3GM4A-2', 'PRQMG04A-1'],
}
export default class sensDesPrefixes extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 4

    this.sup = 1
    this.sup2 = 1
    this.besoinFormulaireNumerique = [
      'Type de questions',
      3,
      '1 : Donner la signification du préfixe\n2 : Donner le préfixe correspondant\n3 : Mélange',
    ]
    this.besoinFormulaire2Numerique = [
      'Choix des préfixes',
      2,
      '1 : De milli à kilo\n2 : De nano à téra',
    ]
  }

  nouvelleVersion() {
    this.consigne = 'Compléter '

    this.sup2 = parseInt(this.sup2)
    if (this.sup === 1) this.consigne += 'avec le calcul correspondant.'
    if (this.sup === 2) this.consigne += 'avec le préfixe correspondant.'
    if (this.sup === 3)
      this.consigne += 'avec le calcul ou le préfixe correspondant.'

    let typeQuestionsDisponibles
    if (this.sup === 1) {
      typeQuestionsDisponibles = ['OnPartDuPrefixe']
    } else if (this.sup === 2) {
      typeQuestionsDisponibles = ['OnPartDuCalcul']
    } else {
      typeQuestionsDisponibles = ['OnPartDuPrefixe', 'OnPartDuCalcul']
    }

    let listeDePrefixesDisponibles = [
      ['milli', '\\div 1\\,000', '\\times 10^{-3}'],
      ['centi', '\\div 100', '\\times 10^{-2}'],
      ['déci', '\\div 10', '\\times 10^{-1}'],
      ['déca', '\\times 10', '\\times 10'],
      ['hecto', '\\times 100', '\\times 10^{2}'],
      ['kilo', '\\times 1\\,000', '\\times 10^{3}'],
    ]
    if (this.sup2 === 2) {
      listeDePrefixesDisponibles = [
        ['nano', '\\div 1\\,000\\,000\\,000', '\\times 10^{-9}'],
        ['micro', '\\div 1\\,000\\,000', '\\times 10^{-6}'],
        ...listeDePrefixesDisponibles,
        ['Méga', '\\times 1\\,000\\,000', '\\times 10^{6}'],
        ['Giga', '\\times 1\\,000\\,000\\,000', '\\times 10^{9}'],
        ['Téra', '\\times 1\\,000\\,000\\,000~000', '\\times 10^{12}'],
      ]
    }
    const listeTypeQuestions = combinaisonListes(
      typeQuestionsDisponibles,
      this.nbQuestions,
    )
    const listePrefixes = combinaisonListes(
      listeDePrefixesDisponibles,
      this.nbQuestions,
    )

    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      // Boucle principale où i+1 correspond au numéro de la question
      const prefixe = listePrefixes[i][0]
      const calcul = listePrefixes[i][1]
      switch (listeTypeQuestions[i]) {
        case 'OnPartDuPrefixe':
          texte = `${prefixe} : $\\dotfill$`
          texteCorr = `${prefixe} : $${miseEnEvidence(calcul)}$`
          handleAnswers(
            this,
            i,
            { reponse: { value: prefixe } },
            { formatInteractif: 'liste-deroulante' },
          )
          if (this.interactif) {
            texte =
              `${prefixe} : ` +
              choixDeroulant(this, i, {
                choices: [
                  { label: 'Choisit le bon calcul', value: '' },
                  ...listeDePrefixesDisponibles.map((item) => ({
                    latex: item[1],
                    value: item[0],
                  })),
                ],
              })
          }
          break
        case 'OnPartDuCalcul':
        default:
          texte = `$${calcul}$ : $\\dotfill$`
          texteCorr = `$${calcul}$ : ${texteEnCouleurEtGras(prefixe)}`
          handleAnswers(
            this,
            i,
            { reponse: { value: prefixe } },
            { formatInteractif: 'liste-deroulante' },
          )
          if (this.interactif) {
            texte =
              `$${calcul}$ : ` +
              choixDeroulant(this, i, {
                choices: [
                  { label: 'Choisit le bon préfixe', value: '' },
                  ...listeDePrefixesDisponibles.map((item) => ({
                    label: item[0],
                    value: item[0],
                  })),
                ],
              })
          }
          break
      }
      if (this.questionJamaisPosee(i, prefixe)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
