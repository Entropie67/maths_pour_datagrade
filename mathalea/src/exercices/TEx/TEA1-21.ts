import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { createQuestion } from '../../lib/interactif/createQuestion'
import { toutPourUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Déterminer le quotient et le reste de la division euclidienne d’un entier et de son opposé'
export const dateDePublication = '07/10/2026'
export const uuid = '92eec'
export const interactifReady = true
export const refs = { 'fr-fr': ['TEA1-21'], 'fr-ch': [] }

/** @author Stéphane Guyon */
export default class DivisionEuclidienneOppose extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.nbQuestionsModifiable = true
  }

  nouvelleVersion(): void {
    this.consigne = ''
    for (
      let exercice = 0, tentatives = 0;
      exercice < this.nbQuestions && tentatives < 50;
      tentatives++
    ) {
      const b = randint(12, 30)
      const q = randint(15, 50)
      const r = randint(1, b - 1)
      const resteDonne = b + r
      const a = b * q + resteDonne
      if (!this.questionJamaisPosee(exercice, a, b)) continue
      const quotientPositif = q + 1
      const quotientNegatif = -quotientPositif - 1
      const resteNegatif = b - r
      const correctionPositive = `Dans la division euclidienne de $${texNombre(a)}$ par $${texNombre(b)}$, le reste doit vérifier $0\\leqslant r<${texNombre(b)}$. Le nombre $${texNombre(resteDonne)}$ ne peut donc pas être le reste de cette division, car il est supérieur au diviseur $${texNombre(b)}$.<br>
    $\\begin{aligned}
    ${texNombre(a)}&=${texNombre(b)}\\times ${texNombre(q)}+${texNombre(resteDonne)} &&\\text{mais } ${texNombre(resteDonne)}>${texNombre(b)}\\\\
    ${texNombre(a)}&=${texNombre(b)}\\times ${texNombre(q)}+${texNombre(b)}+${texNombre(r)}\\\\
    ${texNombre(a)}&=${texNombre(b)}\\times (${texNombre(q)}+1)+${texNombre(r)}\\\\
    ${texNombre(a)}&=${texNombre(b)}\\times ${texNombre(quotientPositif)}+${texNombre(r)}
    \\end{aligned}$<br>
    Comme $0\\leqslant ${texNombre(r)}<${texNombre(b)}$, il s’agit bien de la division euclidienne de $${texNombre(a)}$ par $${texNombre(b)}$.<br>
    Le quotient est donc $q=${miseEnEvidence(texNombre(quotientPositif))}$ et le reste est $r=${miseEnEvidence(texNombre(r))}$.`
      const correctionNegative = `En prenant l’opposé de l’égalité de l’énoncé, on a :<br>
    $\\begin{aligned}
    ${texNombre(-a)}&=${texNombre(b)}\\times (${texNombre(-q)})-${texNombre(resteDonne)} &&\\text{mais } -${texNombre(resteDonne)}<0\\\\
    ${texNombre(-a)}&=${texNombre(b)}\\times (${texNombre(-q)})-${texNombre(b)}-${texNombre(r)}\\\\
    ${texNombre(-a)}&=${texNombre(b)}\\times (${texNombre(-q)}-1)-${texNombre(r)}\\\\
    ${texNombre(-a)}&=${texNombre(b)}\\times (${texNombre(-quotientPositif)})-${texNombre(r)}\\\\
    ${texNombre(-a)}&=${texNombre(b)}\\times (${texNombre(-quotientPositif)})\\underbrace{-${texNombre(b)}+${texNombre(b)}}_{=0}-${texNombre(r)}\\\\
    ${texNombre(-a)}&=${texNombre(b)}\\times (${texNombre(quotientNegatif)})+${texNombre(resteNegatif)}
    \\end{aligned}$<br>
    Comme $0\\leqslant ${texNombre(resteNegatif)}<${texNombre(b)}$, il s’agit bien de la division euclidienne de $${texNombre(-a)}$ par $${texNombre(b)}$.<br>
    Le quotient est donc $q=${miseEnEvidence(texNombre(quotientNegatif))}$ et le reste est $r=${miseEnEvidence(texNombre(resteNegatif))}$.`
      const champs = {
        keyboard: KeyboardType.clavierDeBase,
      }
      createQuestion(this, exercice, {
        question: `Sachant que $${texNombre(a)}=${texNombre(q)}\\times ${texNombre(b)}+${texNombre(resteDonne)}$, en déduire le quotient $q$ et le reste $r$ des divisions euclidiennes suivantes.`,
        // Chaque question vaut un point, quel que soit le tirage.
        bareme: toutPourUnPoint,
        subQuestions: [
          {
            question: `Division euclidienne de $${texNombre(a)}$ par $${texNombre(b)}$.<br>$q=$ %{0}$\\quad r=$ %{1}`,
            answer: [{ value: quotientPositif }, { value: r }],
            field: [champs, champs],
            correction: correctionPositive,
          },
          {
            question: `Division euclidienne de $${texNombre(-a)}$ par $${texNombre(b)}$.<br>$q=$ %{0}$\\quad r=$ %{1}`,
            answer: [{ value: quotientNegatif }, { value: resteNegatif }],
            field: [champs, champs],
            correction: correctionNegative,
          },
        ],
      })
      exercice++
    }
    listeQuestionsToContenu(this)
  }
}
