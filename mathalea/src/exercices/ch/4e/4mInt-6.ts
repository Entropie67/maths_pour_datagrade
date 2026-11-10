import {
    lireFormulaireComplexe,
    repartitionPonderee,
    serialiseFormulaireComplexe,
    valeursParDefaut,
    type FormulaireComplexe,
} from '../../../lib/formulaireComplexe'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import {
    analysePuissance,
    champExposantsComposes,
    champFamillesComposees,
    tirerFonctionComposee,
} from '../../../lib/mathFonctions/integralesComposees'
import { shuffle } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { listeQuestionsToContenu } from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre = 'Calculer des intégrales de fonctions composées'
export const dateDePublication = '14/09/2026'
export const uuid = 'b13e1'
export const interactifReady = true
export const refs = { 'fr-fr': [], 'fr-ch': ['4mInt-6'] }

const formulaire: FormulaireComplexe = {
  champs: [champFamillesComposees, champExposantsComposes],
}

/** @author Nathan Scheinmann */
export default class IntegralesComposees extends Exercice {
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
    // Mélanger les items tire au hasard ceux qui reçoivent les questions restantes.
    const familles = repartitionPonderee(
      shuffle(params.liste('familles')),
      this.nbQuestions,
      shuffle(params.declares('familles')),
    )
    const exposants = repartitionPonderee(
      shuffle(params.liste('exposants')),
      this.nbQuestions,
      shuffle(params.declares('exposants')),
    )
    for (let i = 0, essais = 0; i < this.nbQuestions && essais < 50; essais++) {
      const fonction = tirerFonctionComposee(familles[i], exposants[i])
      const { integrande, a, b, ua, ub } = fonction
      // Bornes en \frac : un \dfrac en indice d'intégrale est illisible.
      const [aBorne, bBorne] = [a, b].map((borne) =>
        String(borne).replace('\\dfrac', '\\frac'),
      )
      const analyse = analysePuissance(fonction, {
        sur: `\\left[${a};${b}\\right]`,
        positivite: fonction.positiviteBornes,
      })
      const resultat = analyse.alpha
        .produitFraction(analyse.valeur(ub).differenceFraction(analyse.valeur(ua)))
        .simplifie().texFractionSimplifiee
      if (!this.questionJamaisPosee(i, integrande, a, b)) continue
      let texte = `Calculer la valeur exacte de $I=\\displaystyle\\int_{${aBorne}}^{${bBorne}} ${integrande}\\,\\mathrm{d}x$.`
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
      this.listeCorrections[i] =
        `${analyse.texte}<br>` +
        `Ainsi, $I=\\left[${analyse.primitive}\\right]_{${aBorne}}^{${bBorne}}=F\\left(${b}\\right)-F\\left(${a}\\right)=${analyse.avecAlpha(`${analyse.valeurTex(ub)}-${analyse.valeurTex(ua)}`)}=${analyse.avecAlpha(`${analyse.valeur(ub).texFractionSimplifiee}-${analyse.valeur(ua).texFractionSimplifiee}`)}$.<br>` +
        `Finalement, $I=\\displaystyle ${miseEnEvidence(resultat)}$.`
      i++
    }
    listeQuestionsToContenu(this)
  }
}
