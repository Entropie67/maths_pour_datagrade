import { sameSet, seq } from '../../../lib/interactif/checks'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import EquationSecondDegre from '../../../modules/EquationSecondDegre'
import FractionEtendue from '../../../modules/FractionEtendue'
import {
    gestionnaireFormulaireTexte,
    listeQuestionsToContenu,
    randint,
} from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre = 'Résoudre une équation bicarrée'
export const dateDePublication = '11/11/2024'
export const interactifReady = true
export const interactifType = 'mathLive'
export const uuid = '89034'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['1mCL4-4'],
}

/**
 * Résolution d'équation bicarrée
 *  Note : tout est prêt pour le cube, il suffit juste d'avoir une méthode texRacineCubique() dans FractionEtendue
 * @author Nathan Scheinmann
 */

export default class ExerciceEquationSecondDegre extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Type de solutions',
      '1 : Entier\n2 : Fraction (au moins une)\n3 : Mélange',
    ]
    // this.besoinFormulaire2Texte = ['Type de bicarrée', '1 : Carré\n2 : Cube\n3 : Irrationnel\n4 : Mélange']

    this.sup = 3
    this.sup2 = 3
    this.nbQuestions = 3
    this.correctionDetailleeDisponible = true
    this.correctionDetaillee = true
  }

  nouvelleVersion() {
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 2,
      melange: 3,
      defaut: 3,
      listeOfCase: ['entier', 'fraction'],
      shuffle: true,
      nbQuestions: this.nbQuestions,
    })
    const choixBicarre = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      min: 1,
      max: 1,
      melange: 2,
      defaut: 2,
      listeOfCase: ['carre'],
      nbQuestions: this.nbQuestions,
      shuffle: true,
    })
    if (this.nbQuestions === 1) {
      this.consigne =
        "Résoudre, dans $\\mathbb{R}$, l'équation suivante en utilisant un changement de variable puis la formule du deuxième degré."
    } else {
      this.consigne =
        'Résoudre, dans $\\mathbb{R}$, les équations suivantes en utilisant un changement de variable puis la formule du deuxième degré.'
    }
    if (this.interactif) {
      this.consigne +=
        " Entrer les solutions sous forme d'un ensemble en séparant chaque élément par un point-virgule. Si une équation n'a pas de solution, saisir l'ensemble vide."
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
        { variable: 'x', format: 'melangeComplique' },
      )
      let a: FractionEtendue
      let b: FractionEtendue
      let c: FractionEtendue
      let s1: FractionEtendue
      let s2: FractionEtendue
      const ensembleDeSolutions: FractionEtendue[] = []
      if (listeTypeDeQuestions[i] === 'entier') {
        do {
          s1 = new FractionEtendue(randint(-5, 20, [0]), 1)
          s2 = new FractionEtendue(randint(-5, 20, [0]), 1)
          const coeffLead = new FractionEtendue(randint(-5, 6, [0]), 1)
          equation = EquationSecondDegre.aPartirDesSolutions(
            s1,
            s2,
            coeffLead,
            { variable: 'x', format: 'reduit' as string },
          )
        } while (s1.num === s2.num && s1.den === s2.den)
      } else if (listeTypeDeQuestions[i] === 'fraction') {
        do {
          s1 = new FractionEtendue(randint(-5, 10, [0]), randint(1, 10, [0]))
          s2 = new FractionEtendue(randint(1, 10, [0]), randint(1, 10, [0]))
          const coeffLead = new FractionEtendue(
            randint(-4, 4, [0]),
            randint(1, 3, [0]),
          )
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
        // Tant que b^2-4ac n'est pas un carré parfait
        do {
          a = new FractionEtendue(randint(-10, 10, [0]), 1)
          b = new FractionEtendue(randint(-10, 10, [0]), 1)
          c = new FractionEtendue(randint(-10, 10, [0]), 1)
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
      // substitute x^2 par x^4
      let eqBic = equation.equationTex
      if (choixBicarre[i] === 'carre') {
        eqBic = eqBic.replace(/x/g, 'x^2')
        eqBic = eqBic.replace(/x\^2\^2/g, 'x^4')
      } else if (choixBicarre[i] === 'cube') {
        eqBic = eqBic.replace(/x/g, 'x^3')
        eqBic = eqBic.replace(/x\^3\^2/g, 'x^6')
      }
      texte += `$${eqBic}$`
      if (this.correctionDetaillee) {
        // same equation as equation but with y instead of x
        const equationY = EquationSecondDegre.aPartirDesCoefficients(
          equation.coefficients[0],
          equation.coefficients[1],
          equation.coefficients[2],
          new FractionEtendue(0, 1),
          new FractionEtendue(0, 1),
          new FractionEtendue(0, 1),
          { variable: 'y', format: 'reduit' },
        )
        texteCorr += `Les exposants de $x$ sont tous pairs, on peut donc poser $y=x^${choixBicarre[i] === 'carre' ? 2 : 3}$ (on a donc $y^2 = x^${choixBicarre[i] === 'carre' ? 4 : 6}$). L'équation précédente devient $${equationY.equationTex}$. <br> On la résout avec la formule du deuxième degré.<br>`
        texteCorr += `${equationY.correctionDetailleeTex
          .replace(
            miseEnEvidence(equationY.ensembleDeSolutionsTex),
            equationY.ensembleDeSolutionsTex,
          )
          .replace(/S ?=/g, 'S_{y}=')}<br>`
        texteCorr += `On remplace $y$ par $x^${choixBicarre[i] === 'carre' ? 2 : 3}$ pour obtenir les solutions de l'équation initiale.`
      }
      if (choixBicarre[i] === 'carre') {
        texteCorr += '<br>'
        // Si Δ = 0, la racine double figure deux fois dans la liste.
        const solutionsY = equation.solutionsListeTex.filter(
          (s, j, liste) => liste.indexOf(s) === j,
        )
        for (let j = 0; j < solutionsY.length; j++) {
          if (solutionsY[j].split('-').length === 1) {
            let solution = new FractionEtendue(0, 1)
            let numDen1 = [0, 1]
            if (!solutionsY[j].includes('\\dfrac')) {
              numDen1 = [Number(solutionsY[j]), Number('1')]
            } else {
              // numDen1 = solutionsY[j]
              //   .match(/\\dfrac{(\d+)}{(\d+)}/)
              //   ?.slice(1)

              // EE : Modif pour pouvoir gérer : \dfrac{2\,078\,461}{461\,880}
              const match = solutionsY[j].match(
                /\\dfrac{([\d\\,]+)}{([\d\\,]+)}/,
              )
              if (match) {
                numDen1 = match
                  .slice(1)
                  .map((s) => Number(s.replace(/\\,/g, '')))
              }
            }
            solution = new FractionEtendue(
              Number(numDen1[0]),
              Number(numDen1[1]),
            )
            texteCorr += `Pour $y=${solutionsY[j]}\\,$:<br>`
            texteCorr += `$\\begin{aligned}
              &x^2=${solutionsY[j]}\\\\
              \\iff&x=\\sqrt{${solution.texFractionSimplifiee}} \\text{ ou } x=-\\sqrt{${solution.texFractionSimplifiee}}\\\\`
            if (
              `\\sqrt{${solution.texFractionSimplifiee}}` !==
              solution.texRacineCarree()
            ) {
              texteCorr += `\\iff&x=${solution.texRacineCarree()} \\text{ ou } x=-${solution.texRacineCarree()}\\\\`
            }
            ensembleDeSolutions.push(solution)
            texteCorr += '\\end{aligned}$<br>'
          } else {
            texteCorr += `Pour $y=${solutionsY[j]}\\,$:<br>`
            texteCorr += `$x^2=${solutionsY[j]}$ n'a pas de solution dans $\\mathbb{R}$, donc $y=${solutionsY[j]}$ ne donne aucune solution à l'équation initiale.<br>`
          }
        }
      }
      // Le calcul des réponses ne dépend pas de l'affichage de la correction détaillée.
      const racines = ensembleDeSolutions
        .sort((a, b) => a.valeurDecimale - b.valeurDecimale)
        .map((x) => x.texRacineCarree())
      const solutions = [...racines]
        .reverse()
        .map((x) => `-${x}`)
        .concat(racines)
      const ensembleSol =
        solutions.length === 0
          ? '\\emptyset'
          : `\\left\\{${solutions.join(';\\,')}\\right\\}`
      if (!this.correctionDetaillee) texteCorr = ''
      texteCorr += `L'ensemble des solutions de l'équation initiale est $S=${miseEnEvidence(ensembleSol)}$.`
      if (this.interactif) {
        texte +=
          '<br>' +
          ajouteChampTexteMathLive(this, i, KeyboardType.clavierEnsemble, {
            texteAvant: '$S=$',
          })
      }
      handleAnswers(this, i, {
        reponse: { value: ensembleSol, compare: seq([sameSet()]) },
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
