import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { combinaisonListes } from '../../../lib/outils/arrayOutils'
import { extraireRacineCarree } from '../../../lib/outils/calculs'
import {
    miseEnEvidence,
    texteEnCouleurEtGras,
} from '../../../lib/outils/embellissements'
import EquationSecondDegre from '../../../modules/EquationSecondDegre'
import FractionEtendue from '../../../modules/FractionEtendue'
import {
    gestionnaireFormulaireTexte,
    listeQuestionsToContenu,
    randint,
} from '../../../modules/outils'
import Exercice from '../../Exercice'

import { bleuMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'

export const titre =
  "Résoudre une équation à l'aide de la méthode de complétion du carré"
export const dateDePublication = '31/10/2024'
export const interactifReady = false

export const uuid = '7f0dc'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}

/**
 * @author Nathan Scheinmann
 */

export default class ExerciceEquationSecondDegre extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Type des solutions',
      '1 : Au moins une fractionnaire\n2 : Irrationnelles\n3 : Mélange',
    ]
    this.besoinFormulaire2CaseACocher = ['Coefficient dominant égal à 1', false]
    this.sup = 3
    this.sup2 = false
    this.nbQuestions = 3
    this.correctionDetailleeDisponible = true
    this.correctionDetaillee = true
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 2,
      melange: 3,
      defaut: 3,
      listeOfCase: ['fraction', 'irrationnel'],
      nbQuestions: this.nbQuestions,
      shuffle: true,
    })
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )

    if (this.nbQuestions === 1) {
      this.consigne =
        "Résoudre l'équation suivante en utilisant la méthode de complétion du carré."
    } else {
      this.consigne =
        'Résoudre les équations suivantes en utilisant la méthode de complétion du carré.'
    }
    if (this.interactif) {
      this.consigne +=
        " Entrer l'ensemble des solutions en séparant chaque élément par un point-virgule. Si une équation n'a pas de solution, saisir l'ensemble vide."
    }

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let equation = new EquationSecondDegre(
        new FractionEtendue(1, 1),
        new FractionEtendue(1, 1),
        new FractionEtendue(1, 1),
        new FractionEtendue(0, 1),
        new FractionEtendue(0, 1),
        new FractionEtendue(0, 1),
        { variable: 'x', format: 'reduit' },
      )
      let a: FractionEtendue
      let b: FractionEtendue
      let c: FractionEtendue
      let s1: FractionEtendue
      let s2: FractionEtendue
      if (listeTypeDeQuestions[i] === 'fraction') {
        do {
          s1 = new FractionEtendue(randint(-5, 5, [0]), randint(1, 5, [0, 4]))
          s2 = new FractionEtendue(randint(-5, 5, [0]), randint(1, 5, [0, 4]))
          let coeffLead: FractionEtendue
          if (this.sup2 === false) {
            coeffLead = new FractionEtendue(randint(-5, 5, [0]), 1)
          } else {
            coeffLead = new FractionEtendue(1, 1)
          }
          equation = EquationSecondDegre.aPartirDesSolutions(
            s1,
            s2,
            coeffLead,
            { variable: 'x', format: 'reduit' as string },
          )
        } while (
          (s1.denIrred === 1 && s2.denIrred === 1) ||
          (s1.den === s2.den && s1.num === s2.num)
        )
      } else if (listeTypeDeQuestions[i] === 'irrationnel') {
        do {
          if (this.sup2 === false) {
            a = new FractionEtendue(randint(-6, 6, [0]), 1)
          } else {
            a = new FractionEtendue(1, 1)
          }
          b = new FractionEtendue(randint(-6, 6, [0]), 1)
          c = new FractionEtendue(randint(-6, 6, [0]), 1)
          equation = EquationSecondDegre.aPartirDesCoefficients(
            a,
            b,
            c,
            new FractionEtendue(0, 1),
            new FractionEtendue(0, 1),
            new FractionEtendue(0, 1),
            { variable: 'x', format: 'reduit' as string },
          )
        } while (
          equation.delta.estParfaite === true ||
          equation.delta.num === 0 ||
          equation.delta.signe === -1
        )
      }
      texte += `$${equation.equationTex}$`
      const coefficientsEqReduite = equation.coefficientsEqReduite
      // Define the normalized coefficients using temporary variables
      const normalizedCoeff0 = coefficientsEqReduite[0]
        .diviseFraction(coefficientsEqReduite[0])
        .simplifie()
      const normalizedCoeff1 = coefficientsEqReduite[1]
        .diviseFraction(coefficientsEqReduite[0])
        .simplifie()
      const normalizedCoeff2 = coefficientsEqReduite[2]
        .diviseFraction(coefficientsEqReduite[0])
        .simplifie()

      // Pass the normalized coefficients into the function
      const eqCoeffDom1 = EquationSecondDegre.aPartirDesCoefficients(
        normalizedCoeff0,
        normalizedCoeff1,
        normalizedCoeff2,
        new FractionEtendue(0, 1),
        new FractionEtendue(0, 1),
        new FractionEtendue(0, 1),
        { variable: 'x', format: 'reduit' as string },
      )
      const eqCoeffDom1SansConstant =
        EquationSecondDegre.aPartirDesCoefficients(
          normalizedCoeff0,
          normalizedCoeff1,
          new FractionEtendue(0, 1),
          new FractionEtendue(0, 1),
          new FractionEtendue(0, 1),
          new FractionEtendue(0, 1),
          { variable: 'x', format: 'reduit' as string },
        )
      const termeCompletion = eqCoeffDom1.coefficientsEqReduite[1]
        .entierDivise(2)
        .produitFraction(eqCoeffDom1.coefficientsEqReduite[1].entierDivise(2))
        .simplifie()
      let termeCompletionCarreRacine =
        eqCoeffDom1.coefficientsEqReduite[1].entierDivise(2)
      if (this.correctionDetaillee) {
        if (coefficientsEqReduite[0].texFraction !== '1') {
          // texteCorr += `On applique la méthode de la complétion du carré pour résoudre l'équation \\[${equation.printToLatexMDG()}=0.\\]`
          texteCorr += `On divise l'équation par $${coefficientsEqReduite[0].texFraction}$, le coefficient dominant, pour obtenir une équation équivalente de la forme \\[${eqCoeffDom1.printToLatexMDG({ indice: -1, couleur: bleuMathalea })}=0.\\]`
        }

        texteCorr += `On isole les termes contenant des inconnus du terme constant \\[${miseEnEvidence(eqCoeffDom1SansConstant.printToLatexMDG(), 'red')}=${normalizedCoeff2.oppose().texFractionSimplifiee}\\]`
        texteCorr += `On ne considère à présent que le membre de droite et on complète le carré, c'est-à-dire qu'on souhaite compléter $${eqCoeffDom1SansConstant.printToLatexMDG({ indice: 1, couleur: bleuMathalea })}$ pour obtenir la première ou la deuxième identité remarquable. Puisque le coefficient devant $${eqCoeffDom1SansConstant.variable}$ est ${eqCoeffDom1SansConstant.coefficients[1].signe < 0 ? 'négatif' : 'positif'}, on va compléter le carré pour obtenir la ${eqCoeffDom1SansConstant.coefficients[1].signe < 0 ? 'deuxième' : 'première'} identité. `
        texteCorr += `On complète l'identité avec le carré du ${texteEnCouleurEtGras('coefficient de $x$', bleuMathalea)} divisé par $2$, c'est-à-dire \\[\\left(\\dfrac{${miseEnEvidence(`${eqCoeffDom1.coefficientsEqReduite[1].texFractionSimplifiee}`, bleuMathalea)}}{2}\\right)^2=\\left(${eqCoeffDom1.coefficientsEqReduite[1].entierDivise(2).texFractionSimplifiee}\\right)^2=${miseEnEvidence(termeCompletion.texFractionSimplifiee, 'green')}.\\]`
        texteCorr += `En effet, \\[${miseEnEvidence(eqCoeffDom1SansConstant.printToLatexMDG(), 'red')}+${miseEnEvidence(termeCompletion.texFractionSimplifiee, 'green')}=\\left(${eqCoeffDom1.variable}^2${eqCoeffDom1.coefficients[1].signe < 0 ? '-' : '+'}${termeCompletion.texRacineCarree()}\\right)^2\\]`
      }

      texteCorr += '$\\begin{aligned}'
      texteCorr += `&\\phantom{\\iff}${equation.printToLatexMDG()}=0\\quad\\text{équation initiale}\\\\`
      if (coefficientsEqReduite[0].texFractionSimplifiee !== '1') {
        texteCorr += `&\\iff ${eqCoeffDom1.printToLatexMDG()}=0 \\quad \\text{équation équivalente avec coefficient dominant égal à 1}\\\\`
      }
      texteCorr += `&\\iff${miseEnEvidence(eqCoeffDom1SansConstant.printToLatexMDG(), 'red')}=${normalizedCoeff2.oppose().texFractionSimplifiee}\\quad\\text{isoler les termes avec les inconnues}\\\\`
      const partieEq3 = normalizedCoeff2.simplifie()
      let reponse1 = ''
      let reponse2 = ''

      texteCorr += `&\\iff ${miseEnEvidence(eqCoeffDom1SansConstant.printToLatexMDG(), 'red')}\\,${miseEnEvidence(termeCompletion.simplifie().texFractionSignee, 'green')}=${normalizedCoeff2.oppose().texFractionSimplifiee}\\,${miseEnEvidence(termeCompletion.simplifie().texFractionSignee, 'green')}\\quad\\text{compléter le carré par } ${miseEnEvidence(termeCompletion.texFSD, 'green')}\\\\`
      texteCorr += `&\\iff \\left(${eqCoeffDom1.variable}${eqCoeffDom1.coefficients[1].signe < 0 ? '-' : '+'}${termeCompletion.texRacineCarree()}\\right)^2=${normalizedCoeff2.oppose().texFractionSimplifiee}\\,${termeCompletion.simplifie().texFractionSignee}\\quad\\text{factoriser en utilisant la ${eqCoeffDom1.coefficients[1].signe < 0 ? 'deuxième' : 'première'} identité}\\\\`
      texteCorr += `&\\iff \\left(${eqCoeffDom1.variable}${eqCoeffDom1.coefficients[1].signe < 0 ? '-' : '+'}${termeCompletion.texRacineCarree()}\\right)^2=${termeCompletion.oppose().sommeFraction(partieEq3).simplifie().oppose().texFractionSimplifiee}\\quad\\text{réduire}\\\\`
      texteCorr += `&\\iff \\left(${eqCoeffDom1.variable}${eqCoeffDom1.coefficients[1].signe < 0 ? '-' : '+'}${termeCompletion.texRacineCarree()}\\right)=\\pm\\sqrt{${termeCompletion.oppose().sommeFraction(partieEq3).oppose().texFractionSimplifiee}}\\quad\\text{prendre la racine carrée des deux membres}\\\\`
      texteCorr += `&\\iff \\left(${eqCoeffDom1.variable}${eqCoeffDom1.coefficients[1].signe < 0 ? '-' : '+'}${termeCompletion.texRacineCarree()}\\right)=${termeCompletion.oppose().sommeFraction(partieEq3).oppose().texRacineCarree()}\\text{ ou } \\left(${eqCoeffDom1.variable}${eqCoeffDom1.coefficients[1].signe < 0 ? '-' : '+'}${termeCompletion.texRacineCarree()}\\right)=-${termeCompletion.oppose().sommeFraction(partieEq3).oppose().texRacineCarree()}\\\\`
      if (
        termeCompletion.oppose().sommeFraction(partieEq3).oppose().estParfaite
      ) {
        const racineIdentite = new FractionEtendue(
          extraireRacineCarree(
            termeCompletion.oppose().sommeFraction(partieEq3).oppose().num,
          )[0],
          extraireRacineCarree(
            termeCompletion.oppose().sommeFraction(partieEq3).oppose().den,
          )[0],
        )
        if (eqCoeffDom1.coefficients[1].signe < 0) {
          termeCompletionCarreRacine = termeCompletionCarreRacine.oppose()
        }
        const racine1 = termeCompletionCarreRacine
          .sommeFraction(racineIdentite.oppose())
          .simplifie()
        const racine2 = termeCompletionCarreRacine
          .sommeFraction(racineIdentite)
          .simplifie()
        texteCorr += `&\\iff ${eqCoeffDom1.variable}=${eqCoeffDom1.coefficients[1].signe < 0 ? '' : '-'}${termeCompletion.texRacineCarree()}+${termeCompletion.oppose().sommeFraction(partieEq3).oppose().texRacineCarree()} \\text{ ou } ${eqCoeffDom1.variable}=${eqCoeffDom1.coefficients[1].signe < 0 ? '' : '-'}${termeCompletion.texRacineCarree()}-${termeCompletion.oppose().sommeFraction(partieEq3).oppose().texRacineCarree()}\\\\`
        texteCorr += `&\\iff ${eqCoeffDom1.variable}=${racine2.texFractionSimplifiee}\\, \\text{ ou }\\,${eqCoeffDom1.variable}=${racine1.texFractionSimplifiee}\\quad\\text{réduire}\\\\`
        texteCorr += `&\\text{Il s'ensuit que } S=\\left\\{${miseEnEvidence(racine1.texFractionSimplifiee)};${miseEnEvidence(racine2.texFractionSimplifiee)}\\right\\}`
        reponse1 = racine1.texFractionSimplifiee
        reponse2 = racine2.texFractionSimplifiee
      } else {
        const racine1 = `${eqCoeffDom1.coefficients[1].signe < 0 ? '' : '-'}${termeCompletion.texRacineCarree()}-${termeCompletion.oppose().sommeFraction(partieEq3).oppose().texRacineCarree()}`
        const racine2 = `${eqCoeffDom1.coefficients[1].signe < 0 ? '' : '-'}${termeCompletion.texRacineCarree()}+${termeCompletion.oppose().sommeFraction(partieEq3).oppose().texRacineCarree()}`
        texteCorr += `&\\iff ${eqCoeffDom1.variable}=${racine2} \\,\\text{ ou }\\,${eqCoeffDom1.variable}=${racine1}\\\\`
        texteCorr += `&\\text{Il s'ensuit que } S=\\left\\{${miseEnEvidence(racine1)};${miseEnEvidence(racine2)}\\right\\}`
        reponse1 = racine1
        reponse2 = racine2
      }

      texteCorr += '\\end{aligned}$'
      texte += ajouteChampTexteMathLive(
        this,
        2 * i,
        KeyboardType.clavierFullOperations,
        {
          texteAvant:
            "<br><br> Donner sous forme d'un entier ou d'une fraction irréductible le nombre qui permet de compléter le carré :",
        },
      )
      handleAnswers(this, 2 * i, {
        reponse: {
          value: termeCompletion.texFractionSimplifiee,
          options: { fractionIrreductible: true },
        },
      })
      texte +=
        '<br><br>' +
        ajouteChampTexteMathLive(
          this,
          2 * i + 1,
          KeyboardType.clavierFullOperations,
          {
            texteAvant:
              "Donner l'ensemble des solutions en séparant chaque solution par un point-virgule $S=$",
          },
        )
      handleAnswers(this, 2 * i + 1, {
        reponse: {
          value: `\\{${reponse1};${reponse2}\\}`,
          options: { ensembleDeNombres: true },
        },
      })
      if (
        this.questionJamaisPosee(
          i,
          equation.ensembleDeSolutionsTex,
          equation.equationTex,
        )
      ) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
