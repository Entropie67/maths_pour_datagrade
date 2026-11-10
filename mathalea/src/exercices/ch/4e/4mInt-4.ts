import {
    lireFormulaireComplexe,
    repartitionPonderee,
    serialiseFormulaireComplexe,
    valeursParDefaut,
    type FormulaireComplexe,
} from '../../../lib/formulaireComplexe'
import {
    integrationConstantPresence,
    sameFunctionWithConstantFeedback,
    seq,
} from '../../../lib/interactif/checks'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import {
    analysePuissance,
    champExposantsComposes,
    champFamillesComposees,
    clavierFonctionComposee,
    tirerFonctionComposee,
} from '../../../lib/mathFonctions/integralesComposees'
import { choice, shuffle } from '../../../lib/outils/arrayOutils'
import { ecritureAlgebrique } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre =
  "Déterminer la primitive d'une fonction composée vérifiant une condition"
export const dateDePublication = '15/09/2026'
export const uuid = 'dcf2d'
export const interactifReady = true
export const refs = { 'fr-fr': [], 'fr-ch': ['4mInt-4'] }

const formulaire: FormulaireComplexe = {
  champs: [
    champFamillesComposees,
    champExposantsComposes,
    {
      type: 'selection',
      nom: 'condition',
      label: 'Forme de la condition',
      options: [
        { valeur: 'valeur', label: 'Valeur de F en un point' },
        { valeur: 'point', label: 'Point de la courbe de F' },
        { valeur: 'melange', label: 'Mélange' },
      ],
      defaut: 'melange',
    },
  ],
}

/** @author Nathan Scheinmann */
export default class PrimitivesComposeesCondition extends Exercice {
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
    const typeCondition = params.selection('condition')
    for (let i = 0, essais = 0; i < this.nbQuestions && essais < 50; essais++) {
      const fonction = tirerFonctionComposee(familles[i], exposants[i])
      // Sur ℝ, on écrit f : ℝ → ℝ sans nommer l'intervalle.
      const surR = fonction.domaineTex === '\\mathbb{R}'
      const nomDomaine = surR ? '\\mathbb{R}' : 'I'
      const analyse = analysePuissance(fonction, {
        sur: nomDomaine,
        positivite: fonction.positiviteDomaine,
        nom: 'f',
      })
      // La condition porte sur une borne où u est une puissance den-ième : F(c) reste rationnel.
      const auDebut = choice([true, false])
      const cTex = String(auDebut ? fonction.a : fonction.b)
      const uc = auDebut ? fonction.ua : fonction.ub
      const constante = randint(-5, 5)
      const valeurPrimitive = analyse.alpha
        .produitFraction(analyse.valeur(uc))
        .simplifie()
      const y0 = valeurPrimitive
        .sommeFraction(new FractionEtendue(constante, 1))
        .simplifie().texFractionSimplifiee
      const forme =
        typeCondition === 'melange'
          ? choice(['valeur', 'point'])
          : typeCondition
      const reponse = `${analyse.primitive}${constante === 0 ? '' : ecritureAlgebrique(constante)}`
      if (!this.questionJamaisPosee(i, fonction.integrande, cTex, y0)) continue
      let texte =
        `Soit $f\\colon ${nomDomaine}\\to\\mathbb{R}$ ${surR ? '' : `avec $I=${fonction.domaineTex}$ `}la fonction définie par $f(x)=${fonction.integrande}$. Déterminer une primitive $F$ de $f$ ` +
        (forme === 'point'
          ? `telle que la courbe représentative de $F$ passe par le point $A\\left(${cTex};${y0}\\right)$.`
          : `telle que $F\\left(${cTex}\\right)=${y0}$.`)
      if (this.interactif)
        texte +=
          '<br>' +
          ajouteChampTexteMathLive(
            this,
            i,
            clavierFonctionComposee(fonction.famille),
            { texteAvant: '$F(x)=$' },
          )
      handleAnswers(this, i, {
        reponse: {
          value: reponse,
          compare: seq([
            integrationConstantPresence({
              constant: 'C',
              expected: false,
              feedbackKo:
                'La condition détermine la constante : la réponse ne doit plus contenir $C$.',
            }),
            sameFunctionWithConstantFeedback({
              domaine: fonction.echantillonnage,
            }),
          ]),
        },
      })
      const facteur =
        analyse.alpha.valeurDecimale === 1
          ? ''
          : analyse.alpha.valeurDecimale === -1
            ? '-'
            : `${analyse.alpha.texFractionSimplifiee}\\times `
      const valeurTex = valeurPrimitive.texFractionSimplifiee
      this.listeQuestions[i] = texte
      this.listeCorrections[i] =
        `${analyse.texte}<br>` +
        `Les primitives de $f$ sur $${nomDomaine}$ sont donc les fonctions $F(x)=${analyse.primitive}+C$, où $C$ est une constante réelle.<br>` +
        (forme === 'point'
          ? `La courbe de $F$ passe par $A\\left(${cTex};${y0}\\right)$ si et seulement si $F\\left(${cTex}\\right)=${y0}$.<br>`
          : '') +
        `Comme $u\\left(${cTex}\\right)=${uc}$, on a $F\\left(${cTex}\\right)=${facteur}${analyse.valeurTex(uc)}+C=${valeurTex}+C$.<br>` +
        `Ainsi, $${valeurTex}+C=${y0}\\iff C=${constante}$.<br>` +
        `Finalement, $F(x)=${miseEnEvidence(reponse)}$.`
      i++
    }
    listeQuestionsToContenu(this)
  }
}
