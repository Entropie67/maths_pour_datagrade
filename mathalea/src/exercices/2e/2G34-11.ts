import { droite } from '../../lib/2d/droites'
import { PointAbstrait, pointAbstrait } from '../../lib/2d/PointAbstrait'
import {
  pointIntersectionDD,
  pointSurDroite,
} from '../../lib/2d/utilitairesPoint'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
export const titre =
  "Déterminer le point d'intersection de deux droites données par des points"
export const interactifReady = true

export const dateDePublication = '20/04/2024'
/**
 *
 * @author Nathan Scheinmann
 */

export const uuid = '4b211'
export const refs = {
  'fr-fr': ['2G34-11'],
  'fr-ch': ['1mF2-11', '11LSFA4G-5'],
}
export default class IntersectionDroitesPoints extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 1
    this.correctionDetaillee = true
    this.correctionDetailleeDisponible = true
    // this.besoinFormulaireNumerique = ['Type de questions', 1, '1 : Niveau 1\n2 : Niveau 2\n3 : Mélange']
  }

  nouvelleVersion() {
    const pointIntersectionExactDD = function (
      d1: Array<FractionEtendue>,
      d2: Array<FractionEtendue>,
    ) {
      const x = d2[1]
        .differenceFraction(d1[1])
        .diviseFraction(d1[0].differenceFraction(d2[0]))
        .simplifie()
      const y = d1[0].produitFraction(x).sommeFraction(d1[1]).simplifie()
      return [x, y]
    }
    const eqToLatex = function (
      vect: Array<number | FractionEtendue>,
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
    const coordEntieres = function (p: PointAbstrait) {
      return p.x % 1 === 0 && p.y % 1 === 0
    }
    const listeFractions = [
      [1, 3],
      [2, 3],
      [3, 7],
      [2, 7],
      [4, 3],
      [3, 5],
      [4, 7],
      [1, 5],
      [4, 5],
      [3, 4],
      [1, 4],
      [2, 5],
      [5, 3],
      [6, 5],
      [1, 6],
      [5, 6],
      [1, 7],
    ]
    // const listeTypeDeQuestions = combinaisonListes(typesDeQuestionsDisponibles, this.nbQuestions)
    for (
      let i = 0,
        droiteFrac1,
        droiteFrac2,
        c,
        c2,
        c3,
        pi12,
        aFrac,
        a2Frac,
        a3Frac,
        vari,
        eqD1ListeString,
        eqD2ListeString,
        p1x,
        p2x,
        p3x,
        p4x,
        p1y,
        p2y,
        p3y,
        p4y,
        texte,
        texteCorr,
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      // on rajoute les variables dont on a besoin
      vari = ['x', 'y', '', 'x', 'y', '']
      let a = 0
      let b = 0
      let d = 0
      let a2 = 0
      let b2 = 0
      let d2 = 0
      let a3 = 0
      let b3 = 0
      let d3 = 0
      let pAproxInt12 = pointAbstrait(0, 0)
      let pAproxInt13 = pointAbstrait(0, 0)
      let pAproxInt23 = pointAbstrait(0, 0)
      do {
        do {
          a = randint(-8, 8, [0]) // numérateut coefficient directeur non nul
          b = randint(-8, 8) // ordonnée à l'origine
          aFrac = choice(listeFractions)
          a = aFrac[0] * choice([-1, 1]) //
          d = aFrac[1] //
          a2 = randint(-8, 8, [0]) // numérateut coefficient directeur non nul
          b2 = randint(-8, 8) // ordonnée à l'origine
          a2Frac = choice(listeFractions)
          a2 = a2Frac[0] * choice([-1, 1]) //
          d2 = a2Frac[1] //
          a3 = randint(-8, 8, [0]) // numérateut coefficient directeur non nul
          b3 = randint(-8, 8) // ordonnée à l'origine
          a3Frac = choice(listeFractions)
          a3 = a3Frac[0] * choice([-1, 1]) //
          d3 = a3Frac[1] //
          c = droite(a / d, -1, b)
          c2 = droite(a2 / d2, -1, b2)
          c3 = droite(a3 / d3, -1, b3)
          c3.epaisseur = 2
        } while (a2 / d2 === a / d || a3 / d3 === a / d || a2 / d2 === a3 / d3)
        pAproxInt12 = pointIntersectionDD(c, c2)
        pAproxInt13 = pointIntersectionDD(c, c3)
        pAproxInt23 = pointIntersectionDD(c2, c3)
      } while (
        coordEntieres(pAproxInt12) ||
        coordEntieres(pAproxInt13) ||
        coordEntieres(pAproxInt23)
      )
      do {
        p1x = randint(-10, 10)
        p1y = pointSurDroite(c, p1x, '').y
        p2x = randint(-10, 10, [p1x])
        p2y = pointSurDroite(c, p2x, '').y
        p3x = randint(-10, 10)
        p3y = pointSurDroite(c2, p3x, '').y
        p4x = randint(-10, 10, [p3x])
        p4y = pointSurDroite(c2, p4x, '').y
      } while (p1y % 1 !== 0 || p2y % 1 !== 0 || p3y % 1 !== 0 || p4y % 1 !== 0)

      droiteFrac1 = [new FractionEtendue(a, d), new FractionEtendue(b, 1)]
      droiteFrac2 = [new FractionEtendue(a2, d2), new FractionEtendue(b2, 1)]
      eqD1ListeString = [0, 1, 0, droiteFrac1[0], 0, droiteFrac1[1]]
      eqD2ListeString = [0, 1, 0, droiteFrac2[0], 0, droiteFrac2[1]]
      pi12 = pointIntersectionExactDD(droiteFrac1, droiteFrac2)
      texte = `Soient les points $A(${p1x};${p1y}),\\,B(${p2x};${p2y}), \\;C(${p3x};${p3y})$ et $D(${p4x};${p4y})$. Déterminer, s'il existe, le point d'intersection entre la droite $(AB)$ et la droite $(CD)$.`
      if (this.interactif) {
        texte +=
          "<br> Le point d'intersection des droites $(AB)$ et $(CD)$ est le point" +
          remplisLesBlancs(this, i, '(%{champ1};%{champ2})')
        handleAnswers(
          this,
          i,
          {
            bareme: (listePoints: number[]) => [
              Math.min(listePoints[0], listePoints[1]),
              1,
            ],
            champ1: { value: pi12[0].texFractionSimplifiee },
            champ2: { value: pi12[1].texFractionSimplifiee },
          },
          { formatInteractif: 'fillInTheBlank' },
        )
      }
      texteCorr = ''
      if (this.correctionDetaillee) {
        texteCorr =
          texteCorr +
          `Les équations des droites $d_1$ et $d_2$ sont \\[${eqToLatex([0, 0, 1, droiteFrac1[0], 0, droiteFrac1[1]], ['x', 'y', 'd_1(x)', 'x', 'y', ''], false)} \\quad ${eqToLatex([0, 0, 1, droiteFrac2[0], 0, droiteFrac2[1]], ['x', 'y', 'd_2(x)', 'x', 'y', ''], false)}\\]
        On résout le système d'équations suivant pour déterminer le point d'intersection des droites $d_1$ et $d_2$: \\[${printSystem(eqToLatex(eqD1ListeString, vari, true), eqToLatex(eqD2ListeString, vari, true))}\\]<br> Ainsi, l`
      } else {
        texteCorr += '<br>L'
      }
      texteCorr =
        texteCorr +
        `e point d'intersection des droites $d_1$ et $d_2$ vaut $${miseEnEvidence(`\\left(${pi12[0].texFractionSimplifiee};${pi12[1].texFractionSimplifiee}\\right)`)}.$<br>`

      if (this.listeQuestions.indexOf(texte) === -1) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
