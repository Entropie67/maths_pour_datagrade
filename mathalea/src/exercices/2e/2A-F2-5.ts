import AntecedentParCalcul from '../3e/3F23-1'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { listeQuestionsToContenu } from '../../modules/outils'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'
export const titre = 'Déterminer un antécédent par une fonction affine'
export const interactifReady = true

export const dateDeModifImportante = '15/09/2026'

export const uuid = '97300'

export const refs = {
  'fr-fr': ['2A-F2-5', '1A-F02-22'],
  'fr-ch': [],
}
/**
 * Clone de 3F23-1 pour l'automatisme 2A-F2-5 : en question ouverte avec une option QCM, avec
 * les cas 1 (ax+b petits relatifs), 3 (a(x+b)+c) et 4 (a(bx+c)+dx+e) actifs
 * (poids 1 chacun) — le cas 2 (ax+b grands relatifs) est désactivé.
 * @author Gilles Mora
 */
export default class Automatisme2AF25 extends AntecedentParCalcul {
  nouvelleVersion() {
    super.nouvelleVersion()
    if (!this.sup2) {
      this.consigne =
        this.nbQuestions === 1
          ? 'Répondre à la question suivante avec une valeur exacte simplifiée.'
          : 'Répondre aux questions suivantes avec une valeur exacte simplifiée.'
      if (this.interactif) {
        for (const correction of this.autoCorrection) {
          const reponse = correction.valeur?.reponse
          if (reponse && typeof reponse.value === 'string') {
            reponse.options = reponse.value.includes('frac')
              ? { fractionIrreductible: true, nombreDecimalSeulement: true }
              : { nombreDecimalSeulement: true }
            reponse.compare = (saisie, attendu, options) => {
              const egaliteExacte = fonctionComparaison(saisie, attendu)
              return egaliteExacte.isOk
                ? fonctionComparaison(saisie, attendu, options)
                : egaliteExacte
            }
          }
        }
        this.listeQuestions = this.listeQuestions.map(
          (question) =>
            question.replace(
              /^Déterminer l'antécédent de \$(.*?)\$ par la fonction \$f\$ définie par (\$.*?\$)\.\s*<br>/,
              (_, image, expression) =>
                `On considère la fonction $f$ définie par ${expression}.<br>L'antécédent de $${image}$ par la fonction $f$ est `,
            ) + '.',
        )
      }
      listeQuestionsToContenu(this)
    }
  }

  constructor() {
    super()
    this.conclusionAntecedent = (image, antecedent) =>
      `<br>L'antécédent de $${image}$ par la fonction $f$ est $${miseEnEvidence(antecedent.simplifie().texFSD)}$.`
    this.sup2 = false
    this.besoinFormulaire2CaseACocher = ['Version QCM', false]
    this.sup = '1-3'
  }
}
