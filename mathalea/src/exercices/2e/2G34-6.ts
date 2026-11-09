import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiNegatif,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'
export const titre =
  'Résoudre un système linéaire de deux équations à deux inconnues par substitution'
export const interactifReady = true

export const dateDePublication = '08/04/2024'
export const uuid = '521b6'
export const refs = {
  'fr-ch': ['11LSFA4G-9'],
  'fr-fr': ['2G34-6'],
}
// export const dateDeModifImportante = '24/10/2021'

/**
 *
 * @author Nathan Scheinmann
 */

export default class systemeEquationsPremDegComp extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.sup = 1
    this.correctionDetailleeDisponible = true
    this.besoinFormulaireNumerique = [
      'Type de questions',
      1,
      '1 : Niveau 1\n2 : Niveau 2\n3 : Mélange',
    ]
  }

  nouvelleVersion() {
    if (this.nbQuestions === 1) {
      this.consigne = `Résoudre le système suivant par substitution${sp()}:`
    } else {
      this.consigne = `Résoudre les systèmes suivants par substitution${sp()}:`
    }

    let typeQuestionsDisponibles: ('lv1' | 'lv2')[]
    if (this.sup === 1) {
      typeQuestionsDisponibles = ['lv1']
    } else if (this.sup === 2) {
      typeQuestionsDisponibles = ['lv2']
    } else {
      typeQuestionsDisponibles = ['lv1', 'lv2']
    }
    const listeTypeQuestions = combinaisonListes(
      typeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      this.comment =
        'Dans cet exercice, un système est donné à résoudre. Les solutions sont entières comprises entre -10 et 10.<br>Le niveau 1 correspond à une substitution sans distributivité;<br>Le niveau 2 à une substitution avec distributivité.'
      let texte = ''
      let texteCorr = ''
      const solX = randint(-10, 10)
      const solY = randint(-10, 10, [solX])
      const eq1 = [1, 0, 0, 0, 0, solX]
      const eq2 = [0, 1, 0, 0, 0, solY]
      const vectX = [1, 0, 0, 1, 0, 0]
      const vectY = [0, 1, 0, 0, 1, 0]
      const vectConstant = [0, 0, 1, 0, 0, 1]
      const multCoeff = function (vect: Array<number>, coeff: number) {
        return vect.map(function (x: number) {
          return x * coeff
        })
      }
      const addCombLin = function (
        vect1: Array<number>,
        vect2: Array<number>,
        coeff: number,
      ) {
        return vect1.map(function (x: number, i: number) {
          return x + vect2[i] * coeff
        })
      }
      const eqEquiv = function (vect1: Array<number>, niveau: string) {
        let vectEquiv = vect1
        vectEquiv = multCoeff(vectEquiv, randint(-6, 6, [0]))
        if (niveau === 'lv2') {
          vectEquiv = addCombLin(vectEquiv, vectX, randint(-10, 10, [0]))
          vectEquiv = addCombLin(vectEquiv, vectY, randint(-10, 10, [0]))
          vectEquiv = addCombLin(vectEquiv, vectConstant, randint(-20, 20, [0]))
        }
        return vectEquiv
      }
      const eqToLatex = function (
        vect: Array<number>,
        nomVal: Array<string>,
        inSys: boolean,
      ) {
        let expr = ''
        let checkPreviousNull = true
        for (let i = 0; i < 3; i++) {
          if (vect.slice(0, 3).every((item) => item === 0) && i === 0) {
            expr = expr + '0'
          } else if (!(vect[i] === 0) && checkPreviousNull) {
            if (nomVal[i] === '') {
              expr = expr + `${texNombre(vect[i], 0)}${nomVal[i]}`
            } else {
              expr = expr + `${rienSi1(vect[i])}${nomVal[i]}`
            }
            checkPreviousNull = false
          } else if (!(vect[i] === 0) && !checkPreviousNull) {
            if (nomVal[i] === '') {
              expr = expr + `${ecritureAlgebrique(vect[i])}${nomVal[i]}`
            } else {
              expr = expr + `${ecritureAlgebriqueSauf1(vect[i])}${nomVal[i]}`
            }
            checkPreviousNull = false
          }
        }
        if (inSys === true) {
          expr = expr + ' &='
        } else {
          expr = expr + '='
        }
        checkPreviousNull = true
        for (let i = 3; i < 6; i++) {
          if (vect.slice(3).every((item) => item === 0) && i === 3) {
            expr = expr + '0'
          } else if (!(vect[i] === 0) && checkPreviousNull) {
            if (nomVal[i] === '') {
              expr = expr + `${texNombre(vect[i], 0)}${nomVal[i]}`
            } else {
              expr = expr + `${rienSi1(vect[i])}${nomVal[i]}`
            }
            checkPreviousNull = false
          } else if (!(vect[i] === 0) && !checkPreviousNull) {
            if (nomVal[i] === '') {
              expr = expr + `${ecritureAlgebrique(vect[i])}${nomVal[i]}`
            } else {
              expr = expr + `${ecritureAlgebriqueSauf1(vect[i])}${nomVal[i]}`
            }
            checkPreviousNull = false
          }
        }
        return expr
      }
      const printSystem = function (eq1: string, eq2: string) {
        let expr = ''
        expr =
          expr +
          `\\begin{cases}\\begin{aligned}${eq1}\\\\${eq2}\\end{aligned}\\end{cases}`
        return expr
      }
      const checkCoeff = function (eq: Array<number>, bound: number) {
        return eq.every((item) => Math.abs(item) < bound)
      }
      const checkArray = function (arr: number[]): [boolean, number, string] {
        const positionsToCheck = [0, 1, 3, 4]
        let vari = ''

        for (const pos of positionsToCheck) {
          if (arr[pos] === 1 || arr[pos] === -1) {
            if (pos === 0 || pos === 3) {
              vari = 'x'
            } else {
              vari = 'y'
            }
            return [true, pos, vari]
          }
        }

        return [false, 100, 'z']
      }
      let eqInt1: Array<number> = []
      let eqInt2: Array<number> = []
      let eqSimpl1: Array<number> = []
      let eqSimpl2: Array<number> = []
      const valComp = choice([0, 1])
      do {
        eqInt1 = addCombLin(eqEquiv(eq1, 'lv1'), eqEquiv(eq2, 'lv1'), 1)
        eqInt2 = addCombLin(eqEquiv(eq1, 'lv1'), eqEquiv(eq2, 'lv1'), 1)
        eqInt1 = addCombLin(
          eqInt1,
          [vectX, vectY][(valComp + 1) % 2],
          -eqInt1[(valComp + 1) % 2],
        )
        eqInt2 = addCombLin(
          eqInt2,
          [vectX, vectY][(valComp + 1) % 2],
          -eqInt2[(valComp + 1) % 2],
        )
        eqSimpl1 = addCombLin(eqInt1, vectX, -eqInt1[3])
        eqSimpl1 = addCombLin(eqSimpl1, vectY, -eqInt1[4])
        eqSimpl1 = addCombLin(eqSimpl1, vectConstant, -eqInt1[2])
        eqSimpl2 = addCombLin(eqInt2, vectX, -eqInt2[3])
        eqSimpl2 = addCombLin(eqSimpl2, vectY, -eqInt2[4])
        eqSimpl2 = addCombLin(eqSimpl2, vectConstant, -eqInt2[2])
      } while (
        eqSimpl1[0] * eqSimpl2[1] - eqSimpl1[1] * eqSimpl2[0] === 0 ||
        !(eqInt1[valComp] === 1) ||
        !(eqInt2[valComp] === 1) ||
        !checkCoeff(eqInt1, 20) ||
        !checkCoeff(eqInt2, 20)
      )
      // a function that checks that all the coeff are smaller than 10
      eqInt1 = multCoeff(eqInt1, randint(-4, 4, [-1, 0, 1]))
      const shuffleEq = function (eq: Array<number>) {
        const nRandomChoice = valComp
        let eqTemp = eq
        if (nRandomChoice === 0) {
          eqTemp = addCombLin(eqTemp, vectX, -eqTemp[0])
          eqTemp = addCombLin(eqTemp, vectY, -eqTemp[4])
          return eqTemp
        } else {
          eqTemp = addCombLin(eqTemp, vectX, -eqTemp[3])
          eqTemp = addCombLin(eqTemp, vectY, -eqTemp[1])
          return eqTemp
        }
      }
      switch (listeTypeQuestions[i]) {
        case 'lv1':
          break
        case 'lv2':
          eqInt1 = shuffleEq(eqInt1)
          eqInt2 = shuffleEq(eqInt2)
          break
      }
      const tempEq = [eqInt1, eqInt2]
      const randomChoice = choice([0, 1])
      eqInt1 = tempEq[randomChoice]
      eqInt2 = tempEq[(randomChoice + 1) % 2]
      let eqCan1 = addCombLin(eqInt1, vectX, -eqInt1[0])
      eqCan1 = addCombLin(eqCan1, vectY, -eqCan1[4])
      eqCan1 = addCombLin(eqCan1, vectConstant, -eqCan1[2])
      let eqCan2 = addCombLin(eqInt2, vectX, -eqInt2[0])
      eqCan2 = addCombLin(eqCan2, vectY, -eqCan2[4])
      eqCan2 = addCombLin(eqCan2, vectConstant, -eqCan2[2])
      const listeVar = ['x', 'y', '', 'x', 'y', '']
      texte =
        texte +
        `\\[${printSystem(eqToLatex(eqInt1, listeVar, true), eqToLatex(eqInt2, listeVar, true))}\\]`
      const checkEq1 = checkArray(eqInt1)
      const checkEq2 = checkArray(eqInt2)
      let varIsol = ''
      let varPasIsol = ''
      let eqIsol = ''
      let eqPasIsol = ''
      const isoleCoeff = function (eq: Array<number>, posIso: number) {
        let eqTemp = eq
        if (eq[posIso] === 1) {
          if (posIso === 0) {
            eqTemp = addCombLin(eqTemp, vectY, -eqTemp[1])
            eqTemp = addCombLin(eqTemp, vectConstant, -eqTemp[2])
          } else if (posIso === 1) {
            eqTemp = addCombLin(eqTemp, vectX, -eqTemp[0])
            eqTemp = addCombLin(eqTemp, vectConstant, -eqTemp[2])
          } else if (posIso === 3) {
            eqTemp = addCombLin(eqTemp, vectY, -eqTemp[4])
            eqTemp = addCombLin(eqTemp, vectConstant, -eqTemp[5])
          } else if (posIso === 4) {
            eqTemp = addCombLin(eqTemp, vectX, -eqTemp[3])
            eqTemp = addCombLin(eqTemp, vectConstant, -eqTemp[5])
          }
        } else if (eq[posIso] === -1) {
          if (posIso === 0) {
            eqTemp = addCombLin(eqTemp, vectY, -eqTemp[4])
            eqTemp = addCombLin(eqTemp, vectConstant, -eqTemp[5])
            eqTemp = addCombLin(eqTemp, vectX, -eqTemp[0])
          } else if (posIso === 1) {
            eqTemp = addCombLin(eqTemp, vectX, -eqTemp[3])
            eqTemp = addCombLin(eqTemp, vectConstant, -eqTemp[5])
            eqTemp = addCombLin(eqTemp, vectY, -eqTemp[1])
          } else if (posIso === 3) {
            eqTemp = addCombLin(eqTemp, vectY, -eqTemp[1])
            eqTemp = addCombLin(eqTemp, vectConstant, -eqTemp[2])
            eqTemp = addCombLin(eqTemp, vectX, -eqTemp[3])
          } else if (posIso === 4) {
            eqTemp = addCombLin(eqTemp, vectX, -eqTemp[0])
            eqTemp = addCombLin(eqTemp, vectConstant, -eqTemp[2])
            eqTemp = addCombLin(eqTemp, vectY, -eqTemp[4])
          }
        } else {
          console.error('Erreur dans la génération des équations')
        }
        return eqTemp
      }
      let eqPasIsolCoeff: number[] = []
      let eqIsolCoeff: number[] = []
      let coeffSub: number = 0
      let varSub: string = ''
      const listeVarSub: string[] = { ...listeVar }
      let coeffSubPos: number = 0
      const timesIfNotUn = function (valeur: number) {
        if (valeur === 1 || valeur === -1) {
          return ''
        } else {
          return '\\times'
        }
      }
      if (checkEq1[0]) {
        varIsol = checkEq1[2]
        varPasIsol = varIsol === 'y' ? 'x' : 'y'
        eqIsol = 'première'
        eqPasIsol = 'deuxième'
        eqPasIsolCoeff = eqInt2
        eqIsolCoeff = isoleCoeff(eqInt1, checkEq1[1])
        if (varIsol === 'y') {
          coeffSubPos = eqInt2[1] !== 0 ? 1 : 4
        } else {
          coeffSubPos = eqInt2[0] !== 0 ? 0 : 3
        }
        coeffSub = eqInt2[coeffSubPos]
      } else if (checkEq2[0]) {
        varIsol = checkEq2[2]
        varPasIsol = varIsol === 'y' ? 'x' : 'y'
        eqIsol = 'deuxième'
        eqPasIsol = 'première'
        eqPasIsolCoeff = eqInt1
        eqIsolCoeff = isoleCoeff(eqInt2, checkEq2[1])
        if (varIsol === 'y') {
          coeffSubPos = eqInt1[1] !== 0 ? 1 : 4
        } else {
          coeffSubPos = eqInt1[0] !== 0 ? 0 : 3
        }
        coeffSub = eqInt1[coeffSubPos]
      } else {
        console.error('Erreur dans la génération des équations')
      }
      const valIsol = varIsol === 'y' ? solY : solX
      const valPasIsol = varPasIsol === 'y' ? solY : solX
      const [left, right] = eqToLatex(eqIsolCoeff, listeVar, false).split('=')
      const longestSideExpr = left.length > right.length ? left : right
      varSub = timesIfNotUn(coeffSub) + `(${longestSideExpr})`
      listeVarSub[coeffSubPos] = varSub
      let eqSubReduit: number[] = []
      let eqSubReduitInt: number[] = []
      eqSubReduitInt = multCoeff(eqIsolCoeff, coeffSub)
      eqSubReduit[0] = 0
      eqSubReduit[1] = 0
      eqSubReduit[2] = 0
      if (coeffSubPos < 3) {
        eqSubReduit = addCombLin(eqPasIsolCoeff, eqSubReduitInt, -1)
        eqSubReduit = addCombLin(eqSubReduit, vectX, eqSubReduitInt[3])
        eqSubReduit = addCombLin(eqSubReduit, vectY, eqSubReduitInt[4])
        eqSubReduit = addCombLin(eqSubReduit, vectConstant, eqSubReduitInt[5])
      } else {
        eqSubReduit = addCombLin(eqPasIsolCoeff, eqSubReduitInt, 1)
        eqSubReduit = addCombLin(eqSubReduit, vectX, -eqSubReduitInt[0])
        eqSubReduit = addCombLin(eqSubReduit, vectY, -eqSubReduitInt[1])
      }

      switch (listeTypeQuestions[i]) {
        case 'lv1':
          break
        case 'lv2':
          texteCorr =
            texteCorr +
            `On isole la variable $${varIsol}$ dans la ${eqIsol} équation. On a le système équivalent${sp()}:`
          if (eqIsol === 'première') {
            texteCorr =
              texteCorr +
              `\\[${printSystem(eqToLatex(eqIsolCoeff, listeVar, true), eqToLatex(eqPasIsolCoeff, listeVar, true))}\\]`
          } else {
            texteCorr =
              texteCorr +
              `\\[${printSystem(eqToLatex(eqPasIsolCoeff, listeVar, true), eqToLatex(eqIsolCoeff, listeVar, true))}\\]`
          }
          break
      }
      texteCorr =
        texteCorr +
        `On substitue la variable $${varIsol}$ dans la ${eqPasIsol} équation. On a le système équivalent${sp()}:`
      if (eqIsol === 'première') {
        texteCorr =
          texteCorr +
          `\\[${printSystem(eqToLatex(eqIsolCoeff, listeVar, true), eqToLatex(eqPasIsolCoeff, listeVarSub, true))}\\]`
      } else {
        texteCorr =
          texteCorr +
          `\\[${printSystem(eqToLatex(eqPasIsolCoeff, listeVarSub, true), eqToLatex(eqIsolCoeff, listeVar, true))}\\]`
      }
      texteCorr = texteCorr + `On réduit la ${eqPasIsol} équation${sp()}:`
      if (eqIsol === 'première') {
        texteCorr =
          texteCorr +
          `\\[${printSystem(eqToLatex(eqIsolCoeff, listeVar, true), eqToLatex(eqSubReduit, listeVar, true))}\\]`
      } else {
        texteCorr =
          texteCorr +
          `\\[${printSystem(eqToLatex(eqSubReduit, listeVar, true), eqToLatex(eqIsolCoeff, listeVar, true))}\\]`
      }
      texteCorr =
        texteCorr +
        `On résout la ${eqPasIsol} équation pour obtenir la valeur de $${varPasIsol}=${String(valPasIsol)}$. On substitue dans la ${eqIsol} équation $${varPasIsol}$ par $${String(valPasIsol)}$, on obtient${sp()}:`
      if (varPasIsol === 'x') {
        if (eqIsolCoeff[3] !== 0) {
          listeVar[3] = `${timesIfNotUn(eqIsolCoeff[3])} ${ecritureParentheseSiNegatif(solX)}`
        } else {
          listeVar[0] = `${timesIfNotUn(eqIsolCoeff[0])} ${ecritureParentheseSiNegatif(solX)}`
        }
      } else {
        if (eqIsolCoeff[4] !== 0) {
          listeVar[4] = `${timesIfNotUn(eqIsolCoeff[4])} ${ecritureParentheseSiNegatif(solY)}`
        } else {
          listeVar[1] = `${timesIfNotUn(eqIsolCoeff[1])} ${ecritureParentheseSiNegatif(solY)}`
        }
      }
      texteCorr = texteCorr + `\\[${eqToLatex(eqIsolCoeff, listeVar, false)}\\]`
      texteCorr =
        texteCorr + `On réduit pour obtenir $${varIsol}=${String(valIsol)}$.`
      texteCorr =
        texteCorr +
        ` La solution du système est $${miseEnEvidence(`S=\\{(${texNombre(solX, 0)};${texNombre(solY, 1)})\\}`)}$.`
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
            champ1: { value: String(solX) },
            champ2: { value: String(solY) },
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
