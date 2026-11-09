import {
    lireFormulaireComplexe,
    repartitionPonderee,
    serialiseFormulaireComplexe,
    valeursParDefaut,
    type FormulaireComplexe,
} from '../../../lib/formulaireComplexe'
import { samePrimitiveUpToConstant, seq } from '../../../lib/interactif/checks'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import {
    analysePuissance,
    champExposantsComposes,
    champFamillesComposees,
    clavierFonctionComposee,
    tirerFonctionComposee,
} from '../../../lib/mathFonctions/integralesComposees'
import { shuffle } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { listeQuestionsToContenu } from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre = "Déterminer une primitive d'une fonction composée"
export const dateDePublication = '15/09/2026'
export const uuid = '290c1'
export const interactifReady = true
export const refs = { 'fr-fr': [], 'fr-ch': ['4mInt-2'] }

const formulaire: FormulaireComplexe = {
  champs: [champFamillesComposees, champExposantsComposes],
}

/** @author Nathan Scheinmann */
export default class PrimitivesComposees extends Exercice {
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
      const analyse = analysePuissance(fonction, {
        sur: 'I',
        positivite: fonction.positiviteDomaine,
        nom: 'f',
      })
      if (!this.questionJamaisPosee(i, fonction.integrande)) continue
      let texte = `Déterminer une primitive $F$ de la fonction $f$ définie sur $I=${fonction.domaineTex}$ par $f(x)=${fonction.integrande}$.`
      if (this.interactif)
        texte +=
          '<br>' +
          ajouteChampTexteMathLive(
            this,
            i,
            clavierFonctionComposee(fonction.famille),
            { texteAvant: '$F(x)=$' },
          )
      // Toute primitive est acceptée : la saisie doit différer de la réponse d'une constante.
      handleAnswers(this, i, {
        reponse: {
          value: analyse.primitive,
          compare: seq([
            samePrimitiveUpToConstant({
              domaine: fonction.echantillonnage,
              constant: 'C',
            }),
          ]),
        },
      })
      this.listeQuestions[i] = texte
      this.listeCorrections[i] =
        `${analyse.texte}<br>` +
        `Les primitives de $f$ sur $I$ sont les fonctions $x\\mapsto ${analyse.primitive}+C$, où $C$ est une constante réelle.<br>` +
        `En particulier, on peut prendre $F(x)=${miseEnEvidence(analyse.primitive)}$.`
      i++
    }
    listeQuestionsToContenu(this)
  }
}
