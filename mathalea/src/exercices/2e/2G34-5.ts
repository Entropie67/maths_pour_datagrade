import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { ecritureParentheseSiNegatif } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import {
  eqToLatex,
  printSystem,
  timesIfNotUn,
} from '../../lib/outils/systemeEquations'
import FractionEtendue from '../../modules/FractionEtendue'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'
export const titre =
  'Résoudre un système linéaire de deux équations à deux inconnues par comparaison'
export const interactifReady = true

export const dateDePublication = '08/04/2024'
export const uuid = '2991a'
export const refs = {
  'fr-ch': ['11LSFA4G-8'],
  'fr-fr': ['2G34-5'],
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
    this.sup = 3
    this.correctionDetailleeDisponible = true
    this.besoinFormulaireNumerique = [
      'Type de questions',
      3,
      '1 : Niveau 1\n2 : Niveau 2\n3 : Mélange',
    ]
  }

  nouvelleVersion() {
    if (this.nbQuestions === 1) {
      this.consigne =
        `Résoudre le système d'équations suivant par comparaison${sp()}:`
    } else {
      this.consigne =
        `Résoudre les systèmes d'équations suivants par comparaison${sp()}:`
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
        'Dans cet exercice, un système est donné à résoudre. Les solutions sont entières comprises entre -10 et 10.<br>Le niveau 1 correspond à des inconnues seulement dans les membres de gauche;<br>Le niveau 2 à des inconnues dans les deux membres, mais ordonnées;<br>Le niveau 3 à des inconnues dans le désordre dans les deux membres.'
      let texte = ''
      let texteCorr = ''
      const solX = new FractionEtendue(randint(-10, 10), 1)
      const solY = new FractionEtendue(randint(-10, 10, [solX.num]), 1)
      const eq1 = [1, 0, 0, 0, 0, solX.num]
      const eq2 = [0, 1, 0, 0, 0, solY.num]

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
        if (niveau === 'lv2') {
          vectEquiv = addCombLin(vectEquiv, vectX, randint(-10, 10, [0]))
          vectEquiv = addCombLin(vectEquiv, vectY, randint(-10, 10, [0]))
          vectEquiv = addCombLin(vectEquiv, vectConstant, randint(-20, 20, [0]))
        }
        return vectEquiv
      }

      let eqInt1: Array<number> = []
      let eqInt2: Array<number> = []
      let eqSimpl1: Array<number> = []
      let eqSimpl2: Array<number> = []
      const valComp = choice([0, 1])
      switch (listeTypeQuestions[i]) {
        case 'lv1':
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
          break
        case 'lv2':
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
            !(eqInt1[valComp] === eqInt2[valComp])
          )
          break
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
      const eqFinale1 = eqInt1Droite.concat(eqInt1Gauche)
      const eqFinale2 = eqInt2Droite.concat(eqInt2Gauche)
      const nomVal1 = nomVal12.concat(nomVal11)
      const nomVal2 = nomVal22.concat(nomVal21)
      texte =
        texte +
        ` $${printSystem(eqToLatex(eqFinale1, nomVal1, true), eqToLatex(eqFinale2, nomVal2, true))}$`
      if (this.correctionDetaillee) {
        texteCorr =
          texteCorr +
          'On résout ce système par comparaison car dans les deux équations, nous avons deux termes qui sont égaux. '
        texteCorr =
          texteCorr +
          `On égalise les membres de droite des deux équations pour obtenir l'équation à une inconnue \\[${eqToLatex([eqInt1[3], eqInt1[4], eqInt1[5], eqInt2[3], eqInt2[4], eqInt2[5]], listeVar, false)}\\]`
        texteCorr =
          texteCorr +
          `On résout l'équation et on obtient $${['x', 'y'][(valComp + 1) % 2]}=${[solX, solY][(valComp + 1) % 2].texFractionSimplifiee}$. `
        texteCorr =
          texteCorr +
          `On subsitue la valeur obtenue pour $${['x', 'y'][(valComp + 1) % 2]}$ dans la première équation pour déterminer la valeur de $${['x', 'y'][valComp]}\\,:$`
        let eqVarElim = eqInt1
        if (['x', 'y'][(valComp + 1) % 2] === 'x') {
          listeVar[3] = `${timesIfNotUn(eqVarElim[3])} ${ecritureParentheseSiNegatif(solX)}`
          eqVarElim = addCombLin(
            eqVarElim,
            [
              0,
              0,
              0,
              solX
                .multiplieEntier(eqVarElim[3])
                .ajouteEntier(-eqVarElim[3])
                .toNumber(),
              0,
              0,
            ],
            1,
          )
        } else {
          listeVar[4] = `${timesIfNotUn(eqVarElim[3])} ${ecritureParentheseSiNegatif(solY)}`
          eqVarElim = addCombLin(
            eqVarElim,
            [
              0,
              0,
              0,
              solY
                .multiplieEntier(eqVarElim[4])
                .ajouteEntier(-eqVarElim[4])
                .toNumber(),
              0,
              0,
            ],
            1,
          )
        }
        const newListeVar = ['x', 'y', '', '', '', '']
        texteCorr = texteCorr + `\\[${eqToLatex(eqInt1, listeVar, false)}`
        if (eqInt1[(valComp + 1) % 2] !== 1) {
          texteCorr =
            texteCorr + `\\implies ${eqToLatex(eqVarElim, newListeVar, false)}`
        }
        texteCorr = texteCorr + '\\]'
        texteCorr =
          texteCorr +
          `On résout l'équation et on obtient $${['x', 'y'][valComp]}=${[solX, solY][valComp].texFractionSimplifiee}$.`
        texteCorr =
          texteCorr +
          ` La solution du système est $${miseEnEvidence(`S=\\left\\{\\left(${solX.texFractionSimplifiee};${solY.texFractionSimplifiee}\\right)\\right\\}`)}$.`
      }
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
