import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import {
  combinaisonListes,
  shuffle2tableaux,
} from '../../lib/outils/arrayOutils'
import { ecritureParentheseSiNegatif } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { ppcm } from '../../lib/outils/primalite'
import {
  addCombLin,
  eqToLatex,
  multCoeff,
  printSystem,
  timesIfNotUn,
} from '../../lib/outils/systemeEquations'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'
export const titre =
  'Résoudre un système linéaire de deux équations à deux inconnues par combinaison linéaire'
export const interactifReady = true

export const dateDePublication = '21/03/2024'
export const uuid = '5179b'
export const refs = {
  'fr-ch': ['11LSFA4G-7'],
  'fr-fr': ['2G34-4'],
}
// export const dateDeModifImportante = '24/10/2021'

/**
 *
 * @author Nathan Scheinmann
 */

export default class systemeEquationsPremDeg extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.sup = 4
    this.sup2 = false
    this.sup3 = false
    this.correctionDetailleeDisponible = true
    this.besoinFormulaireNumerique = [
      'Type de questions',
      4,
      '1 : Niveau 1\n2 : Niveau 2\n3 : Niveau 3\n4 : Mélange',
    ]
  }

  nouvelleVersion() {
    if (this.nbQuestions === 1) {
      this.consigne =
        `Résoudre le système d'équations suivant par combinaison linéaire${sp()}:`
    } else {
      this.consigne =
        `Résoudre les systèmes d'équations suivants par combinaison linéaire${sp()}:`
    }

    this.besoinFormulaire2CaseACocher = ['Solution contenant des fractions']
    let typeQuestionsDisponibles: ('lv1' | 'lv2' | 'lv3')[]
    if (this.sup === 1) {
      typeQuestionsDisponibles = ['lv1']
    } else if (this.sup === 2) {
      typeQuestionsDisponibles = ['lv2']
    } else if (this.sup === 3) {
      typeQuestionsDisponibles = ['lv3']
    } else {
      typeQuestionsDisponibles = ['lv1', 'lv2', 'lv3']
    }

    const listeTypeQuestions = combinaisonListes(
      typeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      this.comment =
        'Dans cet exercice, un système est donné à résoudre. Les solutions sont entières comprises entre -10 et 10.<br>Le niveau 1 correspond à des inconnues seulement dans les membres de gauche;<br>Le niveau 2 à des inconnues dans les deux membres, mais ordonnées;<br>Le niveau 3 à des inconnues dans le désordre dans les deux membres.'
      let texte = ''
      let texteCorr = ''
      let solX: FractionEtendue
      let solY: FractionEtendue
      let eq1: Array<number> = [0, 0, 0, 0, 0, 0]
      let eq2: Array<number> = [0, 0, 0, 0, 0, 0]
      if (this.sup2) {
        do {
          solX = new FractionEtendue(
            randint(-6, 6, [0]),
            randint(-6, 6, [0, 1]),
          )
          solY = new FractionEtendue(
            randint(-6, 6, [0]),
            randint(-6, 6, [0, 1]),
          )
        } while (solX.simplifie().den === 1 || solY.simplifie().den === 1)
        eq1 = [solX.den, 0, 0, 0, 0, solX.num]
        eq2 = [0, solY.den, 0, 0, 0, solY.num]
      } else {
        solX = new FractionEtendue(randint(-10, 10), 1)
        solY = new FractionEtendue(randint(-10, 10, [solX.num]), 1)
        eq1 = [1, 0, 0, 0, 0, solX.num]
        eq2 = [0, 1, 0, 0, 0, solY.num]
      }
      const vectX = [1, 0, 0, 1, 0, 0]
      const vectY = [0, 1, 0, 0, 1, 0]
      const vectConstant = [0, 0, 1, 0, 0, 1]

      // error http://localhost:5173/alea/?uuid=5179b&n=3&d=10&s=4&alea=u0c8&cd=1
      // http://localhost:5173/alea/?uuid=5179b&n=1&d=10&s=4&alea=PAwM&cd=1
      const eqEquiv = function (
        vect1: Array<number | FractionEtendue>,
        niveau: string,
      ) {
        let vectEquiv = vect1
        vectEquiv = multCoeff(vectEquiv, randint(-6, 6, [0]))
        if (niveau === 'lv2' || niveau === 'lv3') {
          vectEquiv = addCombLin(vectEquiv, vectX, randint(-10, 10, [0]))
          vectEquiv = addCombLin(vectEquiv, vectY, randint(-10, 10, [0]))
          vectEquiv = addCombLin(vectEquiv, vectConstant, randint(-20, 20, [0]))
        }
        return vectEquiv
      }

      let eqInt1: Array<number | FractionEtendue> = []
      let eqInt2: Array<number | FractionEtendue> = []
      let eqSimpl1: Array<number | FractionEtendue> = []
      let eqSimpl2: Array<number | FractionEtendue> = []
      switch (listeTypeQuestions[i]) {
        case 'lv1':
          eqInt1 = addCombLin(eqEquiv(eq1, 'lv1'), eqEquiv(eq2, 'lv1'), 1)
          eqInt2 = addCombLin(eqEquiv(eq1, 'lv1'), eqEquiv(eq2, 'lv1'), 1)
          break
        case 'lv2':
          eqInt1 = addCombLin(eqEquiv(eq1, 'lv2'), eqEquiv(eq2, 'lv2'), 1)
          eqInt2 = addCombLin(eqEquiv(eq1, 'lv2'), eqEquiv(eq2, 'lv2'), 1)
          break
        case 'lv3':
          eqInt1 = addCombLin(eqEquiv(eq1, 'lv3'), eqEquiv(eq2, 'lv3'), 1)
          eqInt2 = addCombLin(eqEquiv(eq1, 'lv3'), eqEquiv(eq2, 'lv3'), 1)
          break
      }
      eqSimpl1 = addCombLin(eqInt1, vectX, -eqInt1[3])
      eqSimpl1 = addCombLin(eqSimpl1, vectY, -eqInt1[4])
      eqSimpl1 = addCombLin(eqSimpl1, vectConstant, -eqInt1[2])
      eqSimpl2 = addCombLin(eqInt2, vectX, -eqInt2[3])
      eqSimpl2 = addCombLin(eqSimpl2, vectY, -eqInt2[4])
      eqSimpl2 = addCombLin(eqSimpl2, vectConstant, -eqInt2[2])
      while (
        Number(eqSimpl1[0]) * Number(eqSimpl2[1]) -
          Number(eqSimpl1[1]) * Number(eqSimpl2[0]) ===
        0
      ) {
        switch (listeTypeQuestions[i]) {
          case 'lv1':
            eqInt1 = addCombLin(eqEquiv(eq1, 'lv1'), eqEquiv(eq2, 'lv1'), 1)
            eqInt2 = addCombLin(eqEquiv(eq1, 'lv1'), eqEquiv(eq2, 'lv1'), 1)
            break
          case 'lv2':
            eqInt1 = addCombLin(eqEquiv(eq1, 'lv2'), eqEquiv(eq2, 'lv2'), 1)
            eqInt2 = addCombLin(eqEquiv(eq1, 'lv2'), eqEquiv(eq2, 'lv2'), 1)
            break
          case 'lv3':
            eqInt1 = addCombLin(eqEquiv(eq1, 'lv3'), eqEquiv(eq2, 'lv3'), 1)
            eqInt2 = addCombLin(eqEquiv(eq1, 'lv3'), eqEquiv(eq2, 'lv3'), 1)
            break
        }
        eqSimpl1 = addCombLin(eqInt1, vectX, -eqInt1[3])
        eqSimpl1 = addCombLin(eqSimpl1, vectY, -eqInt1[4])
        eqSimpl1 = addCombLin(eqSimpl1, vectConstant, -eqInt1[2])
        eqSimpl2 = addCombLin(eqInt2, vectX, -eqInt2[3])
        eqSimpl2 = addCombLin(eqSimpl2, vectY, -eqInt2[4])
        eqSimpl2 = addCombLin(eqSimpl2, vectConstant, -eqInt2[2])
      }
      const eqInt1Droite = eqInt1.slice(0, 3)
      const eqInt1Gauche = eqInt1.slice(3)
      const eqInt2Droite = eqInt2.slice(0, 3)
      const eqInt2Gauche = eqInt2.slice(3)
      const listeVar = ['x', 'y', '', 'x', 'y', '']
      const nomVal11 = ['x', 'y', '']
      const nomVal12 = ['x', 'y', '']
      const nomVal21 = ['x', 'y', '']
      const nomVal22 = ['x', 'y', '']
      switch (listeTypeQuestions[i]) {
        case 'lv1':
        case 'lv2':
          break
        case 'lv3':
          shuffle2tableaux(eqInt1Gauche, nomVal11)
          shuffle2tableaux(eqInt1Droite, nomVal12)
          shuffle2tableaux(eqInt2Gauche, nomVal21)
          shuffle2tableaux(eqInt2Droite, nomVal22)
          break
      }
      const eqFinale1 = eqInt1Droite.concat(eqInt1Gauche)
      const eqFinale2 = eqInt2Droite.concat(eqInt2Gauche)
      const nomVal1 = nomVal12.concat(nomVal11)
      const nomVal2 = nomVal22.concat(nomVal21)
      const mX = ppcm(
        Math.abs(Number(eqSimpl1[0])),
        Math.abs(Number(eqSimpl2[0])),
      )
      const mY = ppcm(
        Math.abs(Number(eqSimpl1[1])),
        Math.abs(Number(eqSimpl2[1])),
      )
      let varElim = ''
      let coeffElim = 0
      let coeffEq: Array<number> = []
      const eqSimpl1Abs = [
        Math.abs(Number(eqSimpl1[0])),
        Math.abs(Number(eqSimpl1[1])),
      ]
      const eqSimpl2Abs = [
        Math.abs(Number(eqSimpl2[0])),
        Math.abs(Number(eqSimpl2[1])),
      ]
      if (
        (mX === eqSimpl1Abs[0] || mX === eqSimpl2Abs[0]) &&
        (mY === eqSimpl1Abs[1] || mY === eqSimpl2Abs[1])
      ) {
        if (mY === eqSimpl1Abs[1] && mY === eqSimpl2Abs[1]) {
          varElim = 'y'
          coeffElim = mY
          coeffEq = [Number(eqSimpl1[1]), Number(eqSimpl2[1])]
        } else if (mX === eqSimpl1Abs[0] && mX === eqSimpl2Abs[0]) {
          varElim = 'x'
          coeffElim = mX
          coeffEq = [Number(eqSimpl1[0]), Number(eqSimpl2[0])]
        } else if (Math.abs(mX) <= Math.abs(mY)) {
          varElim = 'x'
          coeffElim = mX
          coeffEq = [Number(eqSimpl1[0]), Number(eqSimpl2[0])]
        } else {
          varElim = 'y'
          coeffElim = mY
          coeffEq = [Number(eqSimpl1[1]), Number(eqSimpl2[1])]
        }
      } else if (mX === eqSimpl1Abs[0] || mX === eqSimpl2Abs[0]) {
        varElim = 'x'
        coeffElim = mX
        coeffEq = [Number(eqSimpl1[0]), Number(eqSimpl2[0])]
      } else if (mY === eqSimpl1Abs[1] || mX === eqSimpl2Abs[1]) {
        varElim = 'y'
        coeffElim = mY
        coeffEq = [Number(eqSimpl1[1]), Number(eqSimpl2[1])]
      } else {
        if (Math.abs(mX) <= Math.abs(mY)) {
          varElim = 'x'
          coeffElim = mX
          coeffEq = [Number(eqSimpl1[0]), Number(eqSimpl2[0])]
        } else {
          varElim = 'y'
          coeffElim = mY
          coeffEq = [Number(eqSimpl1[1]), Number(eqSimpl2[1])]
        }
      }
      const varPasElim = varElim === 'x' ? 'y' : 'x'
      const indexVarPasElim = varPasElim === 'x' ? 0 : 1
      const indexVarElim = varElim === 'x' ? 0 : 1
      let eqVarElim: Array<number> = []
      texte =
        texte +
        ` $${printSystem(eqToLatex(eqFinale1, nomVal1, true), eqToLatex(eqFinale2, nomVal2, true))}$`
      if (this.correctionDetaillee) {
        texteCorr =
          texteCorr +
          'On résout ce système en utilisant la méthode de combinaison linéaire. '
        switch (listeTypeQuestions[i]) {
          case 'lv2':
          case 'lv3':
            texteCorr =
              texteCorr +
              'On commence par réunir les inconnues dans les membres de gauche et les termes constants dans les membres de droite.<br>'
            texteCorr =
              texteCorr +
              `On obtient alors le système équivalent suivant${sp()}: \\[${printSystem(eqToLatex(eqSimpl1, listeVar, true), eqToLatex(eqSimpl2, listeVar, true))}\\]`
            break
          case 'lv1':
            break
        }
        if (!(coeffElim / coeffEq[0] === 1 || -coeffElim / coeffEq[1] === 1)) {
          texteCorr =
            texteCorr +
            `On multiplie la première équation par $${texNombre(coeffElim / coeffEq[0], 0)}$ et la deuxième par $${texNombre(-coeffElim / coeffEq[1], 0)}$ pour obtenir des coefficients opposé devant $${varElim}$.<br>`
          texteCorr =
            texteCorr +
            `On obtient alors le système équivalent suivant${sp()}: \\[${printSystem(eqToLatex(multCoeff(eqSimpl1, coeffElim / coeffEq[0]), listeVar, true), eqToLatex(multCoeff(eqSimpl2, -coeffElim / coeffEq[1]), listeVar, true))}\\]`
        } else if (
          coeffElim / coeffEq[0] === 1 &&
          !(-coeffElim / coeffEq[1] === 1)
        ) {
          texteCorr =
            texteCorr +
            `On multiplie la deuxième équation par $${texNombre(-coeffElim / coeffEq[1], 0)}$ pour obtenir des coefficients opposé devant $${varElim}$.<br>`
          texteCorr =
            texteCorr +
            `On obtient alors le système équivalent suivant${sp()}: \\[${printSystem(eqToLatex(multCoeff(eqSimpl1, coeffElim / coeffEq[0]), listeVar, true), eqToLatex(multCoeff(eqSimpl2, -coeffElim / coeffEq[1]), listeVar, true))}\\]`
        } else if (
          !(coeffElim / coeffEq[0] === 1) &&
          -coeffElim / coeffEq[1] === 1
        ) {
          texteCorr =
            texteCorr +
            `On multiplie la première équation par $${texNombre(coeffElim / coeffEq[0], 0)}$ pour obtenir des coefficients opposé devant $${varElim}$.<br>`
          texteCorr =
            texteCorr +
            `On obtient alors le système équivalent suivant${sp()}: \\[${printSystem(eqToLatex(multCoeff(eqSimpl1, coeffElim / coeffEq[0]), listeVar, true), eqToLatex(multCoeff(eqSimpl2, -coeffElim / coeffEq[1]), listeVar, true))}\\]`
        } else {
          texteCorr =
            texteCorr +
            `Les coefficients devant $${varElim}$ sont déjà opposés. `
        }
        texteCorr =
          texteCorr +
          `On additionne les deux equations pour élimer l'inconnue $${varElim}$ dans la deuxième équation. `
        texteCorr =
          texteCorr +
          `On obtient alors le système équivalent suivant${sp()}: \\[${printSystem(eqToLatex(multCoeff(eqSimpl1, coeffElim / coeffEq[0]), listeVar, true), eqToLatex(addCombLin(multCoeff(eqSimpl1, coeffElim / coeffEq[0]), multCoeff(eqSimpl2, -coeffElim / coeffEq[1]), 1), listeVar, true))}\\]`
        texteCorr =
          texteCorr +
          `On obtient que $${varPasElim} = ${new FractionEtendue(Number(addCombLin(multCoeff(eqSimpl1, coeffElim / coeffEq[0]), multCoeff(eqSimpl2, -coeffElim / coeffEq[1]), 1)[5]), Number(addCombLin(multCoeff(eqSimpl1, coeffElim / coeffEq[0]), multCoeff(eqSimpl2, -coeffElim / coeffEq[1]), 1)[indexVarPasElim])).texFractionSimplifiee}$.<br>`
        texteCorr =
          texteCorr +
          `On subsitue la valeur obtenue pour $${varPasElim}$ dans l'équation restante pour déterminer la valeur de $${varElim}\\,:$`
        eqVarElim = multCoeff(eqSimpl1, coeffElim / coeffEq[0]).map(Number)
        if (varPasElim === 'x') {
          listeVar[0] = `${timesIfNotUn(eqVarElim[0])} ${ecritureParentheseSiNegatif(solX)}`
          eqVarElim = addCombLin(
            eqVarElim,
            [-eqVarElim[0], 0, solX.multiplieEntier(eqVarElim[0]), 0, 0, 0],
            1,
          ).map(Number)
        } else {
          listeVar[1] = `${timesIfNotUn(eqVarElim[1])} ${ecritureParentheseSiNegatif(solY)}`
          eqVarElim = addCombLin(
            eqVarElim,
            [0, -eqVarElim[1], solY.multiplieEntier(eqVarElim[1]), 0, 0, 0],
            1,
          ).map(Number)
        }
        texteCorr =
          texteCorr +
          `\\[${eqToLatex(multCoeff(eqSimpl1, coeffElim / coeffEq[0]), listeVar, false)}\\implies ${eqToLatex(eqVarElim, listeVar, false)}\\]`
        texteCorr =
          texteCorr +
          `On résout l'équation et on obtient $${varElim}=${[solX.texFractionSimplifiee, solY.texFractionSimplifiee][indexVarElim]}$. `
      }

      texteCorr =
        texteCorr +
        `La solution du système est $${miseEnEvidence(`S=\\left\\{\\left(${solX.texFractionSimplifiee};${solY.texFractionSimplifiee}\\right)\\right\\}`)}$.`
      if (this.interactif) {
        texte +=
          '<br>' + remplisLesBlancs(this, i, 'S=\\{(%{champ1};%{champ2})\\}')
        handleAnswers(
          this,
          i,
          {
            bareme: (listePoints: number[]) => [
              Math.min(listePoints[0], listePoints[1]),
              1,
            ],
            champ1: { value: solX.texFractionSimplifiee },
            champ2: { value: solY.texFractionSimplifiee },
          },
          { formatInteractif: 'fillInTheBlank' },
        )
      }
      if (this.questionJamaisPosee(i, solX, solY)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
