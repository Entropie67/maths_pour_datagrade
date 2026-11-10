import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { Droite, droite, droiteAvecNomLatex } from '../../lib/2d/droites'
import { PointAbstrait } from '../../lib/2d/PointAbstrait'
import { repere } from '../../lib/2d/reperes'
import { texteParPosition } from '../../lib/2d/textes'
import { pointIntersectionDD } from '../../lib/2d/utilitairesPoint'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { eqToLatex, printSystem } from '../../lib/outils/systemeEquations'
import FractionEtendue from '../../modules/FractionEtendue'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  "Déterminer le point d'intersection de deux droites données graphiquement"
export const interactifReady = true

export const dateDePublication = '20/04/2024'
export const dateDeModifImportante = '13/02/2026'

/**
 * Déterminer le point d'intersection de deux droites données graphiquement
 * @author Nathan Scheinmann
 */

export const uuid = 'a1b2c'
export const refs = {
  'fr-fr': ['2G34-10'],
  'fr-ch': ['1mF2-10', '1mSE-2', '11LSFA4G-4'],
}

export default class IntersectionDeuxDroites extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 1
    this.sup = 1
    this.correctionDetailleeDisponible = true
    this.besoinFormulaireNumerique = [
      "Position du point d'intersection",
      3,
      '1 : Sur le graphique\n2 : En dehors du graphique\n3 : Mélange',
    ]
  }

  nouvelleVersion() {
    let typeDeQuestionsDisponibles: ('deuxDroitesSG' | 'deuxDroitesHG')[]
    if (this.sup === 1) {
      typeDeQuestionsDisponibles = ['deuxDroitesSG']
    } else if (this.sup === 2) {
      typeDeQuestionsDisponibles = ['deuxDroitesHG']
    } else {
      typeDeQuestionsDisponibles = ['deuxDroitesSG', 'deuxDroitesHG']
    }

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

    const inGraph = function (
      p: PointAbstrait,
      xMin = -8,
      xMax = 8,
      yMin = -6,
      yMax = 6,
    ) {
      return p.x >= xMin && p.x <= xMax && p.y >= yMin && p.y <= yMax
    }

    const coordEntieres = function (p: PointAbstrait) {
      return p.x % 1 === 0 && p.y % 1 === 0
    }

    const listeTypeQuestions = combinaisonListes(
      typeDeQuestionsDisponibles,
      this.nbQuestions,
    )

    const o = texteParPosition(
      'O',
      -0.3,
      -0.3,
      undefined,
      'black',
      undefined,
      'milieu',
      undefined,
      1,
    )

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

    for (
      let i = 0, vari, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      vari = ['x', 'y', '', 'x', 'y', '']
      let c = new Droite(0, 1, 0, 'black', 'black')
      let c2 = new Droite(0, 1, 0, 'black', 'black')
      let a: number = 0
      let b: number = 0
      let d: number = 0
      let a2: number = 0
      let b2: number = 0
      let d2: number = 0
      let aFrac: Array<number> = []
      let a2Frac: Array<number> = []
      let pAproxInt12 = new PointAbstrait(0, 0)

      switch (listeTypeQuestions[i]) {
        case 'deuxDroitesSG':
          do {
            do {
              b = randint(-5, 5)
              aFrac = choice(listeFractions)
              a = aFrac[0] * choice([-1, 1])
              d = aFrac[1]
              b2 = randint(-5, 5)
              a2Frac = choice(listeFractions)
              a2 = a2Frac[0] * choice([-1, 1])
              d2 = a2Frac[1]
            } while (Math.abs(a2 / d2 - a / d) < 0.5)
            c = droite(a / d, -1, b)
            c.color = colorToLatexOrHTML('red')
            c.epaisseur = 1
            c2 = droite(a2 / d2, -1, b2)
            c2.color = colorToLatexOrHTML('red')
            c2.epaisseur = 1
            pAproxInt12 = pointIntersectionDD(c, c2)
          } while (
            !(Math.abs(a2 / d2 - a / d) < 0.5 || inGraph(pAproxInt12)) ||
            coordEntieres(pAproxInt12)
          )
          break
        case 'deuxDroitesHG':
          do {
            aFrac = choice(listeFractions)
            a = aFrac[0] * choice([-1, 1])
            d = aFrac[1]
            b = randint(-5, 5)
            a2Frac = choice(listeFractions)
            a2 = a2Frac[0] * choice([-1, 1])
            d2 = a2Frac[1]
            b2 = randint(-5, 5)
            if (Math.abs(a2 / d2 - a / d) < 0.5) continue
            c = droite(a / d, -1, b)
            c.color = colorToLatexOrHTML('red')
            c.epaisseur = 1
            c2 = droite(a2 / d2, -1, b2)
            c2.color = colorToLatexOrHTML('red')
            c2.epaisseur = 1
            pAproxInt12 = pointIntersectionDD(c, c2)
          } while (
            Math.abs(a2 / d2 - a / d) < 0.5 ||
            inGraph(pAproxInt12) ||
            coordEntieres(pAproxInt12)
          )
          break
      }

      const droite1 = droiteAvecNomLatex(c, '(d_1)', 'red')
      const droite2 = droiteAvecNomLatex(c2, '(d_2)', 'green')
      const droiteFrac1 = [new FractionEtendue(a, d), new FractionEtendue(b, 1)]
      const droiteFrac2 = [
        new FractionEtendue(a2, d2),
        new FractionEtendue(b2, 1),
      ]
      const eqD1ListeString = [0, 1, 0, droiteFrac1[0], 0, droiteFrac1[1]]
      const eqD2ListeString = [0, 1, 0, droiteFrac2[0], 0, droiteFrac2[1]]
      const pi12 = pointIntersectionExactDD(droiteFrac1, droiteFrac2)

      const r = repere({
        xMin: -8,
        xMax: 8,
        xUnite: 1,
        yMin: -6,
        yMax: 6,
        yUnite: 1,
        thickHauteur: 0.1,
        thickEpaisseur: 1,
        xLabelMin: -7,
        xLabelMax: 7,
        yLabelMax: 5,
        yLabelMin: -5,
        axeXStyle: '->',
        axeYStyle: '->',
        yLabelDistance: 1,
        axesEpaisseur: 1,
        yLabelEcart: 0.6,
        grilleSecondaire: true,
        grilleSecondaireYDistance: 1,
        grilleSecondaireXDistance: 1,
        grilleSecondaireYMin: -6,
        grilleSecondaireYMax: 6,
        grilleSecondaireXMin: -8,
        grilleSecondaireXMax: 8,
      })

      texte =
        "Déterminer le point d'intersection des droites suivantes.<br><br>"
      texte += mathalea2d(
        {
          xmin: -8,
          ymin: -6,
          xmax: 8,
          ymax: 6,
          pixelsParCm: 25,
          scale: 0.5,
        },
        r,
        droite1,
        droite2,
        o,
      )

      if (this.interactif) {
        texte +=
          "<br> Le point d'intersection des droites $d_1$ et $d_2$ est le point" +
          remplisLesBlancs(this, i, '(%{champ1};%{champ2}).')
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
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
