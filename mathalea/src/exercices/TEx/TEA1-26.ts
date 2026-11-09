import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { toutAUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Déterminer les restes d’une somme et d’une différence dans une division euclidienne'
export const dateDePublication = '11/10/2026'
export const uuid = '1fdd9'
export const interactifReady = true
export const refs = { 'fr-fr': ['TEA1-26'], 'fr-ch': [] }

/** @author Stéphane Guyon */
export default class RestesSommeDifference extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.nbQuestionsModifiable = true
  }

  nouvelleVersion(): void {
    for (
      let i = 0, attempts = 0;
      i < this.nbQuestions && attempts < 50;
      attempts++
    ) {
      const divisor = randint(3, 12)
      const remainderA = randint(1, divisor - 1)
      // La somme doit nécessiter de retirer le diviseur pour obtenir le reste.
      const remainderB = randint(divisor - remainderA, divisor - 1)
      if (!this.questionJamaisPosee(i, divisor, remainderA, remainderB))
        continue

      const sum = remainderA + remainderB
      const difference = remainderA - remainderB
      const sumRemainder = sum % divisor
      const differenceRemainder = (difference + divisor) % divisor
      let statement = `Soient $a$ et $b$ deux entiers relatifs. Le reste de la division euclidienne de $a$ par $${divisor}$ est $${remainderA}$ ; le reste de la division euclidienne de $b$ par $${divisor}$ est $${remainderB}$.<br><br>`
      const template = [
        `1. Déterminer le reste de la division euclidienne de $a+b$ par $${divisor}$. $r=$ %{champ1}`,
        `2. Déterminer le reste de la division euclidienne de $a-b$ par $${divisor}$. $r=$ %{champ2}`,
      ].join('\n')
      statement += addMultiMathfield(this, i, {
        dataTemplate: template,
        dataOptions: {
          champ1: { keyboard: KeyboardType.clavierNumbers, ldots: true },
          champ2: { keyboard: KeyboardType.clavierNumbers, ldots: true },
        },
      })
      this.listeQuestions[i] = statement
      handleAnswers(
        this,
        i,
        {
          champ1: { value: sumRemainder },
          champ2: { value: differenceRemainder },
          bareme: toutAUnPoint,
        },
        { formatInteractif: 'multi-mathfield' },
      )

      const sumAdjustment = `<br>Comme $${sum}\\geqslant ${divisor}$, cette écriture ne donne pas encore un reste inférieur au diviseur. On écrit $${sum}=${divisor}+${sumRemainder}$, d’où :<br>$a+b=${divisor}(k+k'+1)+${sumRemainder}$`
      const differenceTerm = difference < 0 ? `${difference}` : `+${difference}`
      const differenceAdjustment =
        difference < 0
          ? `<br>Le nombre $${difference}$ est négatif et ne peut donc pas être un reste. On écrit $${difference}=-${divisor}+${differenceRemainder}$, d’où :<br>$a-b=${divisor}(k-k'-1)+${differenceRemainder}$`
          : ''
      this.listeCorrections[i] =
        `Il existe deux entiers relatifs $k$ et $k'$ tels que $a=${divisor}k+${remainderA}$ et $b=${divisor}k'+${remainderB}$.<br>
        Pour identifier une division euclidienne par $${divisor}$, il faut une écriture de la forme $${divisor}q+r$, avec $q\\in\\mathbb{Z}$ et $0\\leqslant r<${divisor}$.<br><br>
        1. En additionnant les deux égalités, on obtient :<br>
        $a+b=${divisor}k+${remainderA}+${divisor}k'+${remainderB}=${divisor}(k+k')+${sum}$
        ${sumAdjustment}<br>
        Le quotient $k+k'+1$ est un entier relatif et $0\\leqslant ${sumRemainder}<${divisor}$. Par unicité de la division euclidienne, le reste de la division de $a+b$ par $${divisor}$ est donc $${miseEnEvidence(sumRemainder)}$.<br><br>
        2. En soustrayant les deux égalités, on obtient :<br>
        $a-b=${divisor}k+${remainderA}-(${divisor}k'+${remainderB})=${divisor}(k-k')${differenceTerm}$
        ${differenceAdjustment}<br>
        Le quotient $k-k'${difference < 0 ? '-1' : ''}$ est un entier relatif et $0\\leqslant ${differenceRemainder}<${divisor}$. Par unicité de la division euclidienne, le reste de la division de $a-b$ par $${divisor}$ est donc $${miseEnEvidence(differenceRemainder)}$.`
      i++
    }
    listeQuestionsToContenu(this)
  }
}
