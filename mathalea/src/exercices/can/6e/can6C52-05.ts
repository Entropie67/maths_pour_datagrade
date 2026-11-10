import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import { fraction } from '../../../modules/fractions'
import Exercice from '../../Exercice'

export const titre = 'Comparer un entier et une fraction'
export const interactifReady = true

export const dateDePublication = '21/06/2026'
/**
 * @author Jean-Claude Lhote
 */

export const uuid = '16c8f'

export const refs = {
  'fr-fr': ['can6C52-05'],
  'fr-ch': [],
}
export default class ComparerFractionEtEntier extends Exercice {
  level: number
  constructor() {
    super()
    this.level = 6
    this.spacingCorr = 2.5
    this.nbQuestions = 1
    this.optionsDeComparaison = { texteSansCasse: true }
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions > 1
        ? 'Pour chaque question, recopier le plus grand des deux nombres.'
        : 'Recopier le plus grand des deux nombres.'

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const signe = this.level === 6 ? 1 : -1
      const denominateur = choice([5, 6, 7, 8, 9])
      const entier = choice([1, 2, 3, 4]) * signe
      const delta = choice([-1, 1])
      const laFraction = fraction(
        entier * denominateur + delta * signe,
        denominateur,
      )

      let texte = choice([true, false])
        ? `$${entier}$ ou $${laFraction.texFSD}$`
        : `$${laFraction.texFSD}$ ou $${entier}$`

      this.question = 'Recopier le plus grand des deux nombres : <br>'
      this.question += choice([true, false])
        ? `$${entier}$ ou $${laFraction.texFSD}$`
        : `$${laFraction.texFSD}$ ou $${entier}$`
      texte += ajouteChampTexteMathLive(
        this,
        i,
        KeyboardType.clavierDeBaseAvecFraction,
      )
      handleAnswers(this, i, {
        reponse: {
          value: delta * signe > 0 ? laFraction.texFSD : String(entier),
        },
      })
      const fractionEntier = fraction(
        entier * denominateur,
        denominateur,
      ).texFSD
      this.correction = `$${entier} = ${fractionEntier}$ et $${laFraction.texFSD}${delta * signe > 0 ? '>' : '<'} ${fractionEntier}$.<br>
        donc $${miseEnEvidence(delta * signe > 0 ? laFraction.texFSD : entier)} > ${delta * signe > 0 ? entier : laFraction.texFSD}$.`
      this.reponse = delta * signe > 0 ? laFraction.texFSD : String(entier)
      this.canEnonce = 'Entourer le plus grand des deux nombres.'
      this.canReponseACompleter = choice([true, false])
        ? `$${entier}$ ou $${laFraction.texFSD}$`
        : `$${laFraction.texFSD}$ ou $${entier}$`
      if (this.questionJamaisPosee(i, entier, denominateur, delta)) {
        this.listeCorrections[i] = this.correction
        this.listeCanEnonces[i] = this.canEnonce
        this.listeCanReponsesACompleter[i] = this.canReponseACompleter
        if (context.isHtml) {
          this.listeQuestions[i] = texte
        } else {
          this.listeQuestions[i] = this.canReponseACompleter
        }
        i++
      }
      cpt++
    }
  }
}
