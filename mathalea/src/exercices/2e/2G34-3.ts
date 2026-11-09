import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import { ecritureParentheseSiNegatif } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import {
  eqToLatex,
  printSystem,
  timesIfNotUn,
} from '../../lib/outils/systemeEquations'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'
export const titre = "Déterminer le point d'intersection de deux droites"
export const interactifReady = true

export const dateDePublication = '08/04/2024'
export const uuid = '1b828'
export const refs = {
  'fr-ch': ['1mF2-9', '11LSFA4G-6'],
  'fr-fr': ['2G34-3'],
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
    this.consigne =
      `Déterminer le point d'intersection des droites suivantes${sp()}:`

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
      const droite1 = 2 * i + 1
      const droite2 = 2 * i + 2
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
      const valComp = 1

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

      const eqInt1Droite = eqInt1.slice(0, 3)
      const eqInt1Gauche = eqInt1.slice(3)
      const eqInt2Droite = eqInt2.slice(0, 3)
      const eqInt2Gauche = eqInt2.slice(3)
      const listeVar = ['x', 'y', '', 'x', 'y', '']
      const eqFinale1 = eqInt1Droite.concat(eqInt1Gauche)
      const eqFinale2 = eqInt2Droite.concat(eqInt2Gauche)
      texte =
        texte +
        `La droite $d_${String(droite1)}$ d'équation $${eqToLatex(eqInt1, listeVar, false)}$ et la droite $d_${String(droite2)}$ d'équation $${eqToLatex(eqInt2, listeVar, false)}$. `
      const listeVarPoint = ['x_A', 'y_A', '', 'x_A', 'y_A', '']
      if (this.correctionDetaillee) {
        texteCorr =
          texteCorr +
          `S'il existe, on note $(x_A; y_A)$ le point d'intersection des deux droites. On obtient le système suivant qu'on résout par substitution${sp()}: `
        texteCorr =
          texteCorr +
          `\\[${printSystem(eqToLatex(eqFinale1, listeVarPoint, true), eqToLatex(eqFinale2, listeVarPoint, true))}\\]`
        texteCorr =
          texteCorr +
          `On égalise les membres de droite des deux équations pour obtenir l'équation à une inconnue \\[${eqToLatex([eqInt1[3], eqInt1[4], eqInt1[5], eqInt2[3], eqInt2[4], eqInt2[5]], listeVarPoint, false)}\\]`
        texteCorr =
          texteCorr +
          `On résout l'équation et on obtient $${listeVarPoint[(valComp + 1) % 2]}=${texNombre([solX, solY][(valComp + 1) % 2], 0)}$. `
        texteCorr =
          texteCorr +
          `On subsitue la valeur obtenue pour $${listeVarPoint[(valComp + 1) % 2]}$ dans la première équation pour déterminer la valeur de $${listeVarPoint[valComp]}\\,:$`
        let eqVarElim = eqInt1
        if (listeVarPoint[(valComp + 1) % 2] === 'x_A') {
          listeVarPoint[3] = `${timesIfNotUn(eqVarElim[3])} ${ecritureParentheseSiNegatif(solX)}`
          eqVarElim = addCombLin(
            eqVarElim,
            [0, 0, 0, eqVarElim[3] * solX - eqVarElim[3], 0, 0],
            1,
          )
        } else {
          listeVarPoint[4] = `${timesIfNotUn(eqVarElim[4])} ${ecritureParentheseSiNegatif(solY)}`
          eqVarElim = addCombLin(
            eqVarElim,
            [0, 0, 0, eqVarElim[4] * solY - eqVarElim[4], 0, 0],
            1,
          )
        }
        const newListeVar = ['x_A', 'y_A', '', '', '', '']
        texteCorr = texteCorr + `\\[${eqToLatex(eqInt1, listeVarPoint, false)}`
        if (eqInt1[(valComp + 1) % 2] !== 1) {
          texteCorr =
            texteCorr + `\\implies ${eqToLatex(eqVarElim, newListeVar, false)}`
        }
        texteCorr = texteCorr + '\\]'
        texteCorr =
          texteCorr +
          `On résout l'équation et on obtient $${listeVarPoint[valComp]}=${texNombre([solX, solY][valComp], 0)}$.`
        texteCorr =
          texteCorr +
          ` La solution du système est $S=\\{(${texNombre(solX, 0)};${texNombre(solY, 1)})\\}$.`
      }
      texteCorr =
        texteCorr +
        `<br>Le point d'intersection des droites $d_${String(droite1)}$ et $d_${String(droite2)}$ est $${miseEnEvidence(`(${texNombre(solX, 0)};${texNombre(solY, 1)})`)}$.`
      if (this.interactif) {
        texte +=
          `<br> Le point d'intersection des droites $d_${String(droite1)}$ et $d_${String(droite2)}$ est le point ` +
          remplisLesBlancs(this, i, '(%{champ1};%{champ2})')
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
