import Decimal from 'decimal.js'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
import { puissanceEnProduit } from '../../lib/outils/puissance'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const dateDeModifImportante = '05/09/2025'
export const titre = "Donner l'écriture décimale d'une puissance de $10$"
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * Donner l'écriture décimale d'une puissance de 10
 * @author Rémi Angot
 */
export const uuid = '93df9'

export const refs = {
  'fr-fr': ['4C30-2', 'BP2AutoE7'],
  'fr-ch': ['10LCNO4C-2', '10LSNO4C-2', '9R1NO5A-5', '9R2NO5A-5', '9R3NO5A-5', 'PRQNO03B-5', 'PRQNO07A-8'],
}
export default class EcritureDecimalePuissanceDe10 extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      3,
      '1 : Exposants positifs\n2 : Exposants négatifs\n3 : Mélange',
    ]

    this.nbQuestions = 8

    this.sup = 3 // exposants positifs et négatifs par défaut
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions === 1
        ? "Donner l'écriture décimale du nombre suivant."
        : "Donner l'écriture décimale des nombres suivants."

    let listeTypeDeQuestions
    if (this.sup === 1) {
      listeTypeDeQuestions = combinaisonListes(['+'], this.nbQuestions)
    } else if (this.sup === 2) {
      listeTypeDeQuestions = combinaisonListes(['-'], this.nbQuestions)
    } else {
      listeTypeDeQuestions = combinaisonListes(['+', '-'], this.nbQuestions)
    }
    for (
      let i = 0, texte, texteCorr, n, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      switch (listeTypeDeQuestions[i]) {
        case '+':
          n = randint(1, 10)
          texte = this.interactif
            ? `$10^{${n}}${sp()}=$` +
              ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers)
            : `$10^{${n}}${sp()}=${sp()}\\dots$`
          handleAnswers(this, i, {
            reponse: {
              value: texNombre(Decimal.pow(10, n), n),
              options: { nombreDecimalSeulement: true },
            },
          })
          if (n < 2) {
            texteCorr = `$10^${n}=${miseEnEvidence(10 ** n)}$`
          } else {
            if (context.isHtml) {
              texteCorr = `$10^{${n}}=${puissanceEnProduit(10, n)}=${miseEnEvidence(texNombre(10 ** n, 0))}$`
            } else {
              texteCorr = `$10^{${n}}=${miseEnEvidence(texNombre(10 ** n, 0))}$`
            }
          }
          break
        case '-':
        default:
          n = randint(1, 10)
          texte = this.interactif
            ? `$10^{${-n}}${sp()}=$` +
              ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers)
            : `$10^{${-n}}${sp()}=${sp()}\\dots$`
          handleAnswers(this, i, {
            reponse: {
              value: texNombre(Decimal.pow(10, -n), n),
              options: { nombreDecimalSeulement: true },
            },
          })
          if (context.isHtml) {
            texteCorr = `$10^{${-n}}=\\dfrac{1}{10^{${n}}}=\\dfrac{1}{${puissanceEnProduit(10, n)}}=\\dfrac{1}{${texNombre(10 ** n, 0)}}=${miseEnEvidence(texNombre(Decimal.pow(10, -n), n))}$`
          } else {
            texteCorr = `$10^{${-n}}=\\dfrac{1}{10^{${n}}}=\\dfrac{1}{${texNombre(10 ** n, 0)}}=${miseEnEvidence(texNombre(Decimal.pow(10, -n), n))}$`
          }
          break
      }

      if (this.questionJamaisPosee(i, n, listeTypeDeQuestions[i])) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
