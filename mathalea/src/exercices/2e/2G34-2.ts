import {
  choixDeroulant,
  listeDeroulanteToQcm,
} from '../../lib/customElements/ListeDeroulanteElement'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiNegatif,
  rienSi1,
} from '../../lib/outils/ecritures'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
export const titre =
  'Tester si un couple de points vérifie un système de deux équations à deux inconnues.'
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'
export const dateDePublication = '28/03/2024'
export const uuid = 'ccb71'
export const refs = {
  'fr-ch': ['11LSFA4G-1'],
  'fr-fr': ['2G34-2'],
}

/**
 *
 * @author Nathan Scheinmann
 */

export default class systemeEquationsPremDegSol extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.sup = 3
    this.correctionDetailleeDisponible = true
    this.besoinFormulaireNumerique = [
      'Type de questions',
      3,
      '1 : Niveau 1\n2 : Niveau 2\n3 : Mélange',
    ]
  }

  nouvelleVersion() {
    this.consigne =
      "Déterminer si le couple proposé est solution du système d'équations."

    let typeQuestionsDisponibles: (
      | 'lv1E1Ne2'
      | 'lv1Ne1E2'
      | 'lv1E1E2'
      | 'lv1Ne1Ne2'
      | 'lv2E1Ne2'
      | 'lv2Ne1E2'
      | 'lv2E1E2'
      | 'lv2Ne1Ne2'
    )[]
    if (this.sup === 1) {
      typeQuestionsDisponibles = [
        'lv1E1Ne2',
        'lv1Ne1E2',
        'lv1E1E2',
        'lv1Ne1Ne2',
      ]
    } else if (this.sup === 2) {
      typeQuestionsDisponibles = [
        'lv2E1Ne2',
        'lv2Ne1E2',
        'lv2E1E2',
        'lv2Ne1Ne2',
      ]
    } else {
      typeQuestionsDisponibles = [
        'lv1E1Ne2',
        'lv1Ne1E2',
        'lv1E1E2',
        'lv1Ne1Ne2',
        'lv2E1Ne2',
        'lv2Ne1E2',
        'lv2E1E2',
        'lv2Ne1Ne2',
      ]
    }

    const listeTypeQuestions = combinaisonListes(
      typeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      this.comment =
        "Dans cet exercice, l'élève doit vérifier si un couple est solution d'un système d'équations. Les solutions sont entières comprises entre -10 et 10.<br>Le niveau 1 correspond à des inconnues seulement dans les membres de gauche;<br>Le niveau 2 à des inconnues dans les deux membres, mais ordonnées."
      let texte = ''
      let texteCorr = ''
      this.autoCorrection[i] = {}
      const choix = [
        { label: 'Chosir une des réponses suivantes :', value: '' },
        {
          label:
            'Seulement la première équation du système est vérifiée, donc non.',
          value: 'E1Ne2',
        },
        {
          label:
            'Seulement la deuxième équation du système est vérifiée, donc non.',
          value: 'Ne1E2',
        },
        {
          label:
            "Aucune des deux équations du système n'est vérifiée, donc non.",
          value: 'Ne1Ne2',
        },
        {
          label: 'Les deux équations du système sont vérifiées, donc oui.',
          value: 'E1E2',
        },
      ]

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
      // error http://localhost:5173/alea/?uuid=5179b&n=3&d=10&s=4&alea=u0c8&cd=1
      // http://localhost:5173/alea/?uuid=5179b&n=1&d=10&s=4&alea=PAwM&cd=1
      const eqEquiv = function (vect1: Array<number>, niveau: string) {
        let vectEquiv = vect1
        vectEquiv = multCoeff(vectEquiv, randint(-6, 6, [0]))
        if (niveau === 'lv2' || niveau === 'lv3') {
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
        typeEq: number = 0,
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
          if (typeEq === 0) {
            expr = expr + ' &='
          } else if (typeEq === 1) {
            expr = expr + ' &\\stackrel{?}{=}'
          } else {
            expr = expr + '&\\neq'
          }
        } else {
          if (typeEq === 0) {
            expr = expr + ' ='
          } else if (typeEq === 1) {
            expr = expr + ' \\stackrel{?}{=}'
          } else {
            expr = expr + '\\neq'
          }
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
      const verifEq = function (
        vect1: Array<number>,
        solX: number,
        solY: number,
      ) {
        const mdd = vect1[0] * solX + vect1[1] * solY + vect1[2]
        const mdg = vect1[3] * solX + vect1[4] * solY + vect1[5]
        return [mdd, mdg]
      }
      const solEq = function (
        vect1: Array<number>,
        sol: number,
        variable: string,
      ) {
        if (variable === 'x') {
          return (
            (sol * vect1[0] + vect1[2] - sol * vect1[3] - vect1[5]) /
            (vect1[4] - vect1[1])
          )
        } else {
          return (
            (sol * vect1[1] + vect1[2] - sol * vect1[4] - vect1[5]) /
            (vect1[3] - vect1[0])
          )
        }
      }
      let eqInt1: Array<number> = []
      let eqInt2: Array<number> = []
      let eqSimpl1 = []
      let eqSimpl2 = []
      let solPropX = 0
      let solPropY = 0
      do {
        switch (listeTypeQuestions[i]) {
          case 'lv1E1Ne2':
            do {
              eqInt1 = addCombLin(eqEquiv(eq1, 'lv1'), eqEquiv(eq2, 'lv1'), 1)
              eqInt2 = addCombLin(eqEquiv(eq1, 'lv1'), eqEquiv(eq2, 'lv1'), 1)
              solPropX = choice([-5, 5], [solX])
              solPropY = solEq(eqInt1, solPropX, 'x')
            } while (Number.isInteger(solPropY) === false)
            break
          case 'lv1Ne1E2':
            do {
              eqInt1 = addCombLin(eqEquiv(eq1, 'lv1'), eqEquiv(eq2, 'lv1'), 1)
              eqInt2 = addCombLin(eqEquiv(eq1, 'lv1'), eqEquiv(eq2, 'lv1'), 1)
              solPropY = choice([-5, 5], [solY])
              solPropX = solEq(eqInt2, solPropY, 'y')
            } while (Number.isInteger(solPropX) === false)
            break
          case 'lv1E1E2':
            eqInt1 = addCombLin(eqEquiv(eq1, 'lv1'), eqEquiv(eq2, 'lv1'), 1)
            eqInt2 = addCombLin(eqEquiv(eq1, 'lv1'), eqEquiv(eq2, 'lv1'), 1)
            solPropX = solX
            solPropY = solY
            break
          case 'lv1Ne1Ne2':
            eqInt1 = addCombLin(eqEquiv(eq1, 'lv1'), eqEquiv(eq2, 'lv1'), 1)
            eqInt2 = addCombLin(eqEquiv(eq1, 'lv1'), eqEquiv(eq2, 'lv1'), 1)
            solPropX = choice([-solX, solX + 1, solX - 1], [solX])
            solPropY = choice([-solY, solY + 1, solY - 1], [solY])
            break
          case 'lv2E1Ne2':
            do {
              eqInt1 = addCombLin(eqEquiv(eq1, 'lv2'), eqEquiv(eq2, 'lv2'), 1)
              eqInt2 = addCombLin(eqEquiv(eq1, 'lv2'), eqEquiv(eq2, 'lv2'), 1)
              solPropX = choice([-5, 5], [solX])
              solPropY = solEq(eqInt1, solPropX, 'x')
            } while (Number.isInteger(solPropY) === false)
            break
          case 'lv2Ne1E2':
            do {
              eqInt1 = addCombLin(eqEquiv(eq1, 'lv2'), eqEquiv(eq2, 'lv2'), 1)
              eqInt2 = addCombLin(eqEquiv(eq1, 'lv2'), eqEquiv(eq2, 'lv2'), 1)
              solPropY = choice([-5, 5], [solY])
              solPropX = solEq(eqInt2, solPropY, 'y')
            } while (Number.isInteger(solPropX) === false)
            break
          case 'lv2E1E2':
            eqInt1 = addCombLin(eqEquiv(eq1, 'lv2'), eqEquiv(eq2, 'lv2'), 1)
            eqInt2 = addCombLin(eqEquiv(eq1, 'lv2'), eqEquiv(eq2, 'lv2'), 1)
            solPropX = solX
            solPropY = solY
            break
          case 'lv2Ne1Ne2':
            eqInt1 = addCombLin(eqEquiv(eq1, 'lv2'), eqEquiv(eq2, 'lv2'), 1)
            eqInt2 = addCombLin(eqEquiv(eq1, 'lv2'), eqEquiv(eq2, 'lv2'), 1)
            solPropX = choice([-solX, solX + 1, solX - 1], [solX])
            solPropY = choice([-solY, solY + 1, solY - 1], [solY])
            break
        }
        eqSimpl1 = addCombLin(eqInt1, vectX, -eqInt1[3])
        eqSimpl1 = addCombLin(eqSimpl1, vectY, -eqInt1[4])
        eqSimpl1 = addCombLin(eqSimpl1, vectConstant, -eqInt1[2])
        eqSimpl2 = addCombLin(eqInt2, vectX, -eqInt2[3])
        eqSimpl2 = addCombLin(eqSimpl2, vectY, -eqInt2[4])
        eqSimpl2 = addCombLin(eqSimpl2, vectConstant, -eqInt2[2])
      } while (eqSimpl1[0] * eqSimpl2[1] - eqSimpl1[1] * eqSimpl2[0] === 0)

      const eqInt1Droite = eqInt1.slice(0, 3)
      const eqInt1Gauche = eqInt1.slice(3)
      const eqInt2Droite = eqInt2.slice(0, 3)
      const eqInt2Gauche = eqInt2.slice(3)
      const listeVar = ['x', 'y', '', 'x', 'y', '']
      const isUn = function (valeur: number) {
        if (valeur === 1 || valeur === -1) {
          return ''
        } else {
          return '\\times'
        }
      }
      const listeVal1 = [
        `${isUn(eqInt1[0])} ${ecritureParentheseSiNegatif(solPropX)}`,
        `${isUn(eqInt1[1])}  ${ecritureParentheseSiNegatif(solPropY)}`,
        '',
        `${isUn(eqInt1[3])}  ${ecritureParentheseSiNegatif(solPropX)}`,
        `${isUn(eqInt1[4])}  ${ecritureParentheseSiNegatif(solPropY)}`,
        '',
      ]
      const listeVal2 = [
        `${isUn(eqInt2[0])} ${ecritureParentheseSiNegatif(solPropX)}`,
        `${isUn(eqInt2[1])}  ${ecritureParentheseSiNegatif(solPropY)}`,
        '',
        `${isUn(eqInt2[3])}  ${ecritureParentheseSiNegatif(solPropX)}`,
        `${isUn(eqInt2[4])}  ${ecritureParentheseSiNegatif(solPropY)}`,
        '',
      ]
      const nomVal11 = ['x', 'y', '']
      const nomVal12 = ['x', 'y', '']
      const nomVal21 = ['x', 'y', '']
      const nomVal22 = ['x', 'y', '']
      const eqFinale1 = eqInt1Droite.concat(eqInt1Gauche)
      const eqFinale2 = eqInt2Droite.concat(eqInt2Gauche)
      const nomVal1 = nomVal12.concat(nomVal11)
      const nomVal2 = nomVal22.concat(nomVal21)
      texte =
        texte +
        ` Le couple $(${texNombre(solPropX, 0)};${texNombre(solPropY, 0)})$ est-il solution du système $${printSystem(eqToLatex(eqFinale1, nomVal1, true), eqToLatex(eqFinale2, nomVal2, true))}$ ?`
      if (this.correctionDetaillee) {
        texteCorr =
          texteCorr +
          `On substitue le couple $(${texNombre(solPropX, 0)}\\,;\\,${texNombre(solPropY, 0)})$ dans les équations du système :<br> \\[\\begin{cases}\\begin{aligned}${eqToLatex(eqFinale1, listeVal1, true, 1)}\\\\${eqToLatex(eqFinale2, listeVal2, true, 1)}\\end{aligned}\\end{cases}\\] On réduit les membres de gauche et de droite des deux équations
        \\[\\begin{cases}\\begin{aligned}${eqToLatex([0, 0, verifEq(eqFinale1, solPropX, solPropY)[0], 0, 0, verifEq(eqFinale1, solPropX, solPropY)[1]], listeVar, true, 1)}\\\\${eqToLatex([0, 0, verifEq(eqFinale2, solPropX, solPropY)[0], 0, 0, verifEq(eqFinale2, solPropX, solPropY)[1]], listeVar, true, 1)}\\end{aligned}\\end{cases}\\]`
      }
      // Les suffixes des types de questions ont été passés comme values des choix. C'est ce qu'on passe à handleAnswers.
      const rep = listeTypeQuestions[i].substring(3)

      texteCorr =
        texteCorr +
        `<br> ${texteEnCouleurEtGras(`${choix.find((el) => el.value === rep)?.label ?? ''}`)}`
      if (this.interactif) {
        texte =
          texte + choixDeroulant(this, i, { choices: choix, choix0: false })
        handleAnswers(
          this,
          i,
          { reponse: { value: rep, options: { texteSansCasse: true } } },
          { formatInteractif: 'liste-deroulante' },
        )
      } else {
        const options = { ordered: true, vertical: true }
        listeDeroulanteToQcm(this, i, choix, rep, options, texteCorr)
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
