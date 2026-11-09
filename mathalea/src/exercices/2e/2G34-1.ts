/**
 * ⚠️ Cet exercice est utilisé dans le test : tests/e2e/tests/interactivity/liste-deroulante.test.ts ⚠️
 */

import { choixDeroulant } from '../../lib/customElements/ListeDeroulanteElement'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  rienSi1,
} from '../../lib/outils/ecritures'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
export const titre =
  "Déterminer la position relative de deux droites à l'aide de leur équation et en déduire le nombre de solution d'un système d'équations"
export const interactifReady = true

export const dateDePublication = '08/04/2024'
export const uuid = '2eee3'
export const refs = {
  'fr-ch': ['1mF2-8', '11LSFA4G-2'],
  'fr-fr': ['2G34-1'],
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
    // this.besoinFormulaireNumerique = ['Type de questions', 1, '1 : Niveau 1\n2 : Niveau 2\n3 : Mélange']
  }

  nouvelleVersion() {
    if (this.nbQuestions === 1) {
      this.consigne =
        `Déterminer la position relative des droites et en déduire le nombre de solutions du système d'équations${sp()}:`
    } else {
      this.consigne =
        `Déterminer la position relative des droites et en déduire le nombre de solutions des systèmes d'équations${sp()}:`
    }

    const typeQuestionsDisponibles = ['unique', 'unique', 'inf', 'aucune']
    const listeTypeQuestions = combinaisonListes(
      typeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      this.comment =
        'Dans cet exercice, un système est donné à résoudre. Les solutions sont entières comprises entre -10 et 10.<br>Le niveau 1 correspond à des inconnues seulement dans les membres de gauche;<br>Le niveau 2 à des inconnues dans les deux membres, mais ordonnées;<br>Le niveau 3 à des inconnues dans le désordre dans les deux membres.'
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
      const divCoeff = function (vect: Array<number>, coeff: number) {
        return vect.map(function (x: number) {
          return x / coeff
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
      let eqInt1: Array<number> = []
      let eqInt2: Array<number> = []
      let eqSimpl1: Array<number> = []
      let eqSimpl2: Array<number> = []
      const valComp = 1
      switch (listeTypeQuestions[i]) {
        case 'aucune':
          do {
            eqInt1 = addCombLin(eqEquiv(eq1, 'lv1'), eqEquiv(eq2, 'lv1'), 1)
            eqInt1 = addCombLin(
              eqInt1,
              [vectX, vectY][(valComp + 1) % 2],
              -eqInt1[(valComp + 1) % 2],
            )
            eqInt2 = eqInt1
            eqInt2 = multCoeff(eqInt2, randint(-4, 4, [0]))
            eqInt2 = addCombLin(
              eqInt2,
              choice([
                [0, 0, 0, 0, 0, 1],
                [0, 0, 1, 0, 0, 0],
              ]),
              randint(-10, 10, [0]),
            )
            eqSimpl1 = addCombLin(eqInt1, vectX, -eqInt1[1])
            eqSimpl1 = addCombLin(eqSimpl1, vectY, -eqInt1[4])
            eqSimpl1 = addCombLin(eqSimpl1, vectConstant, -eqInt1[2])
            eqSimpl2 = addCombLin(eqInt2, vectX, -eqInt2[1])
            eqSimpl2 = addCombLin(eqSimpl2, vectY, -eqInt2[4])
            eqSimpl2 = addCombLin(eqSimpl2, vectConstant, -eqInt2[2])
          } while (!(eqInt1[valComp] === 1))
          break
        case 'unique':
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
            !(eqInt2[valComp] === 1)
          )
          eqInt1 = multCoeff(eqInt1, randint(-4, 4, [0]))
          break
        case 'inf':
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
            !(eqSimpl1[0] * eqSimpl2[1] - eqSimpl1[1] * eqSimpl2[0] === 0) ||
            (!(eqInt1[valComp] === 1) && !(eqInt2[valComp] === 1))
          )
          break
      }
      const tempEq = [eqInt1, eqInt2]
      const randomChoice = choice([0, 1])
      eqInt1 = tempEq[randomChoice]
      eqInt2 = tempEq[(randomChoice + 1) % 2]
      const shuffleEq = function (eq: Array<number>) {
        const nRandomChoice = choice([0, 1])
        if (nRandomChoice === 0) {
          return eq
        } else {
          let eqTemp = eq
          eqTemp = addCombLin(eqTemp, vectX, -eqTemp[3])
          eqTemp = addCombLin(eqTemp, vectY, -eqTemp[1])
          return eqTemp
        }
      }
      eqInt1 = shuffleEq(eqInt1)
      eqInt2 = shuffleEq(eqInt2)
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
      texteCorr =
        texteCorr +
        `On commence par écrire les deux équations sous la forme de droite $y=ax+b$ en utilisant les opérations d'équivalence. On obtient le système équivalent suivant${sp()}:`
      texteCorr =
        texteCorr +
        `\\[${printSystem(eqToLatex(eqCan1, listeVar, true), eqToLatex(eqCan2, listeVar, true))}\\]`
      if (eqCan1[1] !== 1 || eqCan2[1] !== 1) {
        texteCorr =
          texteCorr +
          `et le système suivant en divisant par le coefficient de $y$${sp()}:`
        texteCorr =
          texteCorr +
          `\\[${printSystem(eqToLatex(divCoeff(eqCan1, eqCan1[1]), listeVar, true), eqToLatex(divCoeff(eqCan2, eqCan2[1]), listeVar, true))}\\]`
      }
      switch (listeTypeQuestions[i]) {
        case 'aucune':
          texteCorr =
            texteCorr +
            "Les deux droites ont la même pente et n'ont pas la même ordonnée à l'origine, elles sont parallèles et distinctes."
          break
        case 'unique':
          texteCorr =
            texteCorr +
            "Les deux droites ne sont ni parallèles ni confondues, car elles n'ont pas la même pente. Elles sont sécantes en un point."
          break
        case 'inf':
          texteCorr =
            texteCorr +
            'Les deux droites sont confondues, elles sont représentées par la même équation.'
          break
      }
      const choix = [
        { label: `Choisir une des réponses suivantes${sp()}:`, value: '' },
        { label: 'admet une unique solution', value: 'unique' },
        { label: "n'admet pas de solution", value: 'aucune' },
        { label: 'admet une infinité de solutions', value: 'inf' },
      ]
      const rep = listeTypeQuestions[i]
      texteCorr =
        texteCorr + ` Ainsi, le système ${texteEnCouleurEtGras(`${rep}`)}.`
      if (this.interactif) {
        texte +=
          '<br>' +
          "Le système d'équations" +
          choixDeroulant(this, i, { choices: choix }) +
          '.'
        handleAnswers(
          this,
          i,
          {
            bareme: (listePoints: number[]) => [
              Math.min(listePoints[0], listePoints[1]),
              1,
            ],
            reponse: { value: rep, options: { texteSansCasse: true } },
          },
          { formatInteractif: 'liste-deroulante' },
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
