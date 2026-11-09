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
    samePrimitiveUpToConstant,
    seq,
} from '../../../lib/interactif/checks'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import { clavierFonctionComposee } from '../../../lib/mathFonctions/integralesComposees'
import {
    formulaireSansComposition,
    tirerFonctionSansComposition,
} from '../../../lib/mathFonctions/integralesSansComposition'
import { choice, shuffle } from '../../../lib/outils/arrayOutils'
import { ecritureAlgebrique } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre = 'Déterminer une primitive sans composition'
export const dateDePublication = '15/09/2026'
export const uuid = '97303'
export const interactifReady = true
export const refs = { 'fr-fr': [], 'fr-ch': ['4mInt-1'] }

/** @author Nathan Scheinmann */
export default class PrimitivesSansComposition extends Exercice {
  private readonly avecCondition: boolean
  private readonly formulaire: FormulaireComplexe

  constructor(avecCondition = false) {
    super()
    this.avecCondition = avecCondition
    this.formulaire = {
      champs: [
        ...formulaireSansComposition.champs,
        ...(avecCondition
          ? [
              {
                type: 'selection' as const,
                nom: 'condition',
                label: 'Forme de la condition',
                options: [
                  { valeur: 'valeur', label: 'Valeur de F en un point' },
                  { valeur: 'point', label: 'Point de la courbe de F' },
                  { valeur: 'melange', label: 'Mélange' },
                ],
                defaut: 'melange',
              },
            ]
          : []),
      ],
    }
    this.nbQuestions = 3
    this.spacingCorr = 3
    this.besoinFormulaireComplexe = this.formulaire
    this.sup = serialiseFormulaireComplexe(
      this.formulaire,
      valeursParDefaut(this.formulaire),
    )
  }

  nouvelleVersion() {
    const params = lireFormulaireComplexe(this.formulaire, this.sup)
    const familles = repartitionPonderee(
      shuffle(params.liste('familles')),
      this.nbQuestions,
      shuffle(params.declares('familles')),
    )
    for (let i = 0, essais = 0; i < this.nbQuestions && essais < 50; essais++) {
      const famille = familles[i]
      const {
        a,
        b,
        integrande,
        primitive,
        fa,
        fb,
        explication,
        domaineTex,
        echantillonnage,
      } = tirerFonctionSansComposition(famille, 'I')
      // Les primitives saisies sont validées sur l'intervalle I annoncé.
      const domaine = echantillonnage
      let reponse = primitive
      let condition = ''
      let resolution = ''
      if (this.avecCondition) {
        const auDebut = choice([true, false])
        const x0 = auDebut ? a : b
        const valeur = auDebut ? fa : fb
        const constante = randint(-5, 5)
        const y0 = valeur
          .sommeFraction(new FractionEtendue(constante, 1))
          .simplifie().texFractionSimplifiee
        const forme =
          params.selection('condition') === 'melange'
            ? choice(['valeur', 'point'])
            : params.selection('condition')
        reponse += constante === 0 ? '' : ecritureAlgebrique(constante)
        condition =
          forme === 'point'
            ? ` telle que la courbe représentative de $F$ passe par le point $A\\left(${x0};${y0}\\right)$`
            : ` telle que $F\\left(${x0}\\right)=${y0}$`
        resolution =
          (forme === 'point'
            ? `La courbe passe par $A\\left(${x0};${y0}\\right)$, donc on doit avoir :<br>$F\\left(${x0}\\right)=${y0}$.<br>`
            : '') +
          `On détermine maintenant la constante $C$ à l'aide de la condition. En remplaçant $x$ par $${x0}$, on obtient :<br>` +
          `$F\\left(${x0}\\right)=${valeur.texFractionSimplifiee}+C=${y0}$.<br>` +
          `On soustrait alors $${valeur.texFractionSimplifiee}$ aux deux membres :<br>` +
          `$C=${y0}-${valeur.signe < 0 ? `\\left(${valeur.texFractionSimplifiee}\\right)` : valeur.texFractionSimplifiee}=${constante}$.<br>`
      }
      if (!this.questionJamaisPosee(i, integrande, a, b, condition)) continue
      // Sur ℝ, on écrit f : ℝ → ℝ sans nommer l'intervalle.
      const surR = domaineTex === '\\mathbb{R}'
      const nomDomaine = surR ? '\\mathbb{R}' : 'I'
      let texte = `Soit $f\\colon ${nomDomaine}\\to\\mathbb{R}$ ${surR ? '' : `avec $I=${domaineTex}$ `}la fonction définie par $f(x)=${integrande}$. Déterminer une primitive $F$ de $f$${condition}.`
      if (this.interactif)
        texte +=
          '<br>' +
          ajouteChampTexteMathLive(this, i, clavierFonctionComposee(famille), {
            texteAvant: '$F(x)=$',
          })
      handleAnswers(this, i, {
        reponse: {
          value: reponse,
          compare: this.avecCondition
            ? seq([
                integrationConstantPresence({
                  constant: 'C',
                  expected: false,
                  feedbackKo:
                    'La condition détermine la constante : remplacer $C$ par sa valeur.',
                }),
                sameFunctionWithConstantFeedback({ domaine }),
              ])
            : seq([samePrimitiveUpToConstant({ domaine, constant: 'C' })]),
        },
      })
      this.listeQuestions[i] = texte
      this.listeCorrections[i] =
        explication +
        `On obtient donc toutes les primitives de $f$ sur $${nomDomaine}$ en ajoutant une constante réelle $C$ :<br>` +
        `$F(x)=${primitive}+C$.<br>` +
        resolution +
        (this.avecCondition
          ? `La primitive qui vérifie la condition est donc :<br>`
          : `On peut par exemple choisir $C=0$, ce qui donne :<br>`) +
        `$F(x)=${miseEnEvidence(reponse)}$.`
      i++
    }
    listeQuestionsToContenu(this)
  }
}
