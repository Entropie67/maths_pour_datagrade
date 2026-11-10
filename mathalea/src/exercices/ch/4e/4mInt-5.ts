import {
    lireFormulaireComplexe,
    repartitionPonderee,
    serialiseFormulaireComplexe,
    valeursParDefaut,
} from '../../../lib/formulaireComplexe'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import {
    formulaireSansComposition,
    tirerFonctionSansComposition,
} from '../../../lib/mathFonctions/integralesSansComposition'
import { shuffle } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { listeQuestionsToContenu } from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre = 'Calculer des intégrales sans composition'
export const dateDePublication = '15/09/2026'
export const uuid = '7d5ee'
export const interactifReady = true
export const refs = { 'fr-fr': [], 'fr-ch': ['4mInt-5'] }

const formulaire = formulaireSansComposition

/** @author Nathan Scheinmann */
export default class IntegralesSansComposition extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.spacingCorr = 3
    this.besoinFormulaireComplexe = formulaire
    this.sup = serialiseFormulaireComplexe(
      formulaire,
      valeursParDefaut(formulaire),
    )
  }

  nouvelleVersion() {
    const params = lireFormulaireComplexe(formulaire, this.sup)
    const familles = repartitionPonderee(
      shuffle(params.liste('familles')),
      this.nbQuestions,
      shuffle(params.declares('familles')),
    )
    for (let i = 0, essais = 0; i < this.nbQuestions && essais < 50; essais++) {
      const famille = familles[i]
      const { a, b, integrande, primitive, fa, fb, explication } =
        tirerFonctionSansComposition(famille)
      if (!this.questionJamaisPosee(i, integrande, a, b)) continue
      const resultat = fb
        .differenceFraction(fa)
        .simplifie().texFractionSimplifiee
      let texte = `Calculer la valeur exacte de $I=\\displaystyle\\int_{${a}}^{${b}} ${integrande}\\,\\mathrm{d}x$.`
      if (this.interactif)
        texte +=
          '<br>' +
          ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierFonctionsTerminales,
            { texteAvant: '$I=$' },
          )
      handleAnswers(this, i, { reponse: { value: resultat } })
      this.listeQuestions[i] = texte
      const faTex = fa.texFractionSimplifiee
      this.listeCorrections[i] =
        explication +
        `On obtient ainsi une primitive sur $[${a};${b}]$ :<br>` +
        `$F(x)=${primitive}$.<br>` +
        `Il reste à l'évaluer aux deux bornes, puis à soustraire la valeur à la borne inférieure de celle à la borne supérieure :<br>` +
        `$I=\\left[${primitive}\\right]_{${a}}^{${b}}=F\\left(${b}\\right)-F\\left(${a}\\right)=${fb.texFractionSimplifiee}-${fa.signe < 0 ? `\\left(${faTex}\\right)` : faTex}$.<br>` +
        `On obtient finalement :<br>` +
        `$I=${miseEnEvidence(resultat)}$.`
      i++
    }
    listeQuestionsToContenu(this)
  }
}
