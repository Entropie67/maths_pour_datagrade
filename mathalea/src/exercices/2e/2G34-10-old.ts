import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { Droite, droite, droiteAvecNomLatex } from '../../lib/2d/droites'
import { PointAbstrait } from '../../lib/2d/PointAbstrait'
import { repere } from '../../lib/2d/reperes'
import { texteParPosition } from '../../lib/2d/textes'
import { pointIntersectionDD } from '../../lib/2d/utilitairesPoint'
import { bleuMathalea } from '../../lib/colors'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { eqToLatex, printSystem } from '../../lib/outils/systemeEquations'
import FractionEtendue from '../../modules/FractionEtendue'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
export const titre = "[Ancien] Déterminer le point d'intersection de droites"
export const interactifReady = true

export const dateDePublication = '20/04/2024'
/**
 *
 * @author Nathan Scheinmann
 */

export const uuid = '8ff15'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class IntersectionDroites extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 1
    this.sup = 1
    this.sup2 = 1
    this.correctionDetailleeDisponible = true
    this.correctionDetailleeDisponible = true
    this.besoinFormulaireNumerique = [
      'Nombre de droites',
      3,
      '1 : Deux droites \n2 : Trois droites\n3 :Mélange',
    ]
    this.besoinFormulaire2Numerique = [
      "PointAbstrait d'intersection",
      3,
      '1 : Sur le graphique \n2 : Au moins un en dehors du graphique \n3 :Mélange',
    ]
    // this.besoinFormulaireNumerique = ['Type de questions', 1, '1 : Niveau 1\n2 : Niveau 2\n3 : Mélange']
  }

  nouvelleVersion() {
    let typeDeQuestionsDisponibles: (
      'deuxDroitesSG' | 'troisDroitesSG' | 'deuxDroitesHG' | 'troisDroitesHG'
    )[]
    if (this.sup === 1 && this.sup2 === 1) {
      typeDeQuestionsDisponibles = ['deuxDroitesSG']
    } else if (this.sup === 1 && this.sup2 === 2) {
      typeDeQuestionsDisponibles = ['deuxDroitesHG']
    } else if (this.sup === 2 && this.sup2 === 1) {
      typeDeQuestionsDisponibles = ['troisDroitesSG']
    } else if (this.sup === 2 && this.sup2 === 2) {
      typeDeQuestionsDisponibles = ['troisDroitesHG']
    } else if (this.sup === 3 && this.sup2 === 1) {
      typeDeQuestionsDisponibles = ['deuxDroitesSG', 'troisDroitesSG']
    } else if (this.sup === 1 && this.sup2 === 3) {
      typeDeQuestionsDisponibles = ['deuxDroitesSG', 'deuxDroitesHG']
    } else {
      typeDeQuestionsDisponibles = [
        'deuxDroitesSG',
        'deuxDroitesHG',
        'troisDroitesSG',
        'troisDroitesHG',
      ]
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
    // const listeTypeDeQuestions = combinaisonListes(typesDeQuestionsDisponibles, this.nbQuestions)
    for (
      let i = 0, vari, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      // on rajoute les variables dont on a besoin
      vari = ['x', 'y', '', 'x', 'y', '']
      let c = new Droite(0, 1, 0, 'black', 'black')
      let c2 = new Droite(0, 1, 0, 'black', 'black')
      let c3 = new Droite(0, 1, 0, 'black', 'black')
      let a: number = 0
      let b: number = 0
      let d: number = 0
      let a2: number = 0
      let b2: number = 0
      let d2: number = 0
      let a3: number = 0
      let b3: number = 0
      let d3: number = 0
      let aFrac: Array<number> = []
      let a2Frac: Array<number> = []
      let a3Frac: Array<number> = []
      let pAproxInt12 = new PointAbstrait(0, 0)
      let pAproxInt13 = new PointAbstrait(0, 0)
      let pAproxInt23 = new PointAbstrait(0, 0)
      switch (listeTypeQuestions[i]) {
        case 'deuxDroitesSG':
        case 'troisDroitesSG':
          do {
            do {
              b = randint(-5, 5) // ordonnée à l'origine
              aFrac = choice(listeFractions)
              a = aFrac[0] * choice([-1, 1]) //
              d = aFrac[1] //
              b2 = randint(-5, 5) // ordonnée à l'origine
              a2Frac = choice(listeFractions)
              a2 = a2Frac[0] * choice([-1, 1]) //
              d2 = a2Frac[1] //
              b3 = randint(-5, 5) // ordonnée à l'origine
              a3Frac = choice(listeFractions)
              a3 = a3Frac[0] * choice([-1, 1]) //
              d3 = a3Frac[1]
            } while ( //
              Math.abs(a2 / d2 - a / d) < 0.5 ||
              Math.abs(a3 / d3 - a / d) < 0.5 ||
              Math.abs(a2 / d2 - a3 / d3) < 0.5
            )
            c = droite(a / d, -1, b)
            c.color = colorToLatexOrHTML('red')
            c.epaisseur = 1
            c2 = droite(a2 / d2, -1, b2)
            c2.color = colorToLatexOrHTML('red')
            c2.epaisseur = 1
            c3 = droite(a3 / d3, -1, b3)
            c3.color = colorToLatexOrHTML('red')
            c3.epaisseur = 1
            pAproxInt12 = pointIntersectionDD(c, c2)
            pAproxInt13 = pointIntersectionDD(c, c3)
            pAproxInt23 = pointIntersectionDD(c2, c3)
          } while (
            !(
              Math.abs(a2 / d2 - a / d) < 0.5 ||
              Math.abs(a3 / d3 - a / d) < 0.5 ||
              Math.abs(a2 / d2 - a3 / d3) < 0.5 ||
              (inGraph(pAproxInt12) &&
                inGraph(pAproxInt13) &&
                inGraph(pAproxInt23))
            ) ||
            coordEntieres(pAproxInt12) ||
            coordEntieres(pAproxInt13) ||
            coordEntieres(pAproxInt23)
          )
          break
        case 'deuxDroitesHG':
        case 'troisDroitesHG':
          do {
            a = randint(-5, 5, [0]) // numérateur coefficient directeur non nul
            b = randint(-5, 5) // ordonnée à l'origine
            aFrac = choice(listeFractions)
            a = aFrac[0] * choice([-1, 1]) //
            d = aFrac[1] //
            a2 = randint(-5, 5, [0]) // numérateut coefficient directeur non nul
            b2 = randint(-5, 5) // ordonnée à l'origine
            a2Frac = choice(listeFractions)
            a2 = a2Frac[0] * choice([-1, 1]) //
            d2 = a2Frac[1] //
            a3 = randint(-5, 5, [0]) // numérateut coefficient directeur non nul
            b3 = randint(-5, 5) // ordonnée à l'origine
            a3Frac = choice(listeFractions)
            a3 = a3Frac[0] * choice([-1, 1]) //
            d3 = a3Frac[1] //
            if (
              Math.abs(a2 / d2 - a / d) < 0.5 ||
              Math.abs(a3 / d3 - a / d) < 0.5 ||
              Math.abs(a2 / d2 - a3 / d3) < 0.5
            )
              continue
            c = droite(a / d, -1, b)
            c.color = colorToLatexOrHTML('red')
            c.epaisseur = 1
            c2 = droite(a2 / d2, -1, b2)
            c2.color = colorToLatexOrHTML('red')
            c2.epaisseur = 1
            c3 = droite(a3 / d3, -1, b3)
            c3.color = colorToLatexOrHTML('red')
            c3.epaisseur = 1
            pAproxInt12 = pointIntersectionDD(c, c2)
            pAproxInt13 = pointIntersectionDD(c, c3)
            pAproxInt23 = pointIntersectionDD(c2, c3)
          } while (
            Math.abs(a2 / d2 - a / d) < 0.5 ||
            Math.abs(a3 / d3 - a / d) < 0.5 ||
            Math.abs(a2 / d2 - a3 / d3) < 0.5 ||
            inGraph(pAproxInt12) ||
            coordEntieres(pAproxInt12) ||
            coordEntieres(pAproxInt13) ||
            coordEntieres(pAproxInt23)
          )
          break
      }

      const droite1 = droiteAvecNomLatex(c, '(d_1)', 'red')
      const droite2 = droiteAvecNomLatex(c2, '(d_2)', 'green')
      const droite3 = droiteAvecNomLatex(c3, '(d_3)', bleuMathalea)
      const droiteFrac1 = [new FractionEtendue(a, d), new FractionEtendue(b, 1)]
      const droiteFrac2 = [
        new FractionEtendue(a2, d2),
        new FractionEtendue(b2, 1),
      ]
      const droiteFrac3 = [
        new FractionEtendue(a3, d3),
        new FractionEtendue(b3, 1),
      ]
      const eqD1ListeString = [0, 1, 0, droiteFrac1[0], 0, droiteFrac1[1]]
      const eqD2ListeString = [0, 1, 0, droiteFrac2[0], 0, droiteFrac2[1]]
      const eqD3ListeString = [0, 1, 0, droiteFrac3[0], 0, droiteFrac3[1]]
      const pi12 = pointIntersectionExactDD(droiteFrac1, droiteFrac2)
      const pi13 = pointIntersectionExactDD(droiteFrac1, droiteFrac3)
      const pi23 = pointIntersectionExactDD(droiteFrac2, droiteFrac3)
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
        "Déterminer les points d'intersection des droites suivantes.<br><br>"
      switch (listeTypeQuestions[i]) {
        case 'deuxDroitesSG':
        case 'deuxDroitesHG':
          texte += mathalea2d(
            {
              xmin: -8,
              ymin: -6,
              xmax: 8,
              ymax: 6,
              pixelsParCm: 25,
              scale: 0.5,
              display: 'block',
            },
            r,
            droite1,
            droite2,
            o,
          ) // On trace le graphique
          break
        case 'troisDroitesSG':
        case 'troisDroitesHG':
          texte += mathalea2d(
            {
              xmin: -8,
              ymin: -6,
              xmax: 8,
              ymax: 6,
              pixelsParCm: 25,
              scale: 0.5,
              display: 'block',
            },
            r,
            droite1,
            droite2,
            droite3,
            o,
          ) // On trace le graphique
          break
      }
      switch (listeTypeQuestions[i]) {
        case 'deuxDroitesSG':
        case 'deuxDroitesHG':
          if (this.interactif) {
            texte +=
              "<br> Le point d'intersection des droites $d_1$ et $d_2$ est le point" +
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
          break
        case 'troisDroitesSG':
        case 'troisDroitesHG':
          if (this.interactif) {
            texte +=
              "Le point d'intersection des droites sont" +
              remplisLesBlancs(
                this,
                i,
                'I(d_1;d_2)=(%{champ1};%{champ2})\\quad I(d_1;d_3)=(%{champ3};%{champ4})\\quad I(d_2;d_3)=(%{champ5};%{champ6})',
              )
            handleAnswers(
              this,
              i,
              {
                bareme: (listePoints: number[]) => [
                  Math.min(listePoints[0], listePoints[1]) +
                    Math.min(listePoints[2], listePoints[3]) +
                    Math.min(listePoints[4], listePoints[5]),
                  3,
                ],
                champ1: { value: pi12[0].texFractionSimplifiee },
                champ2: { value: pi12[1].texFractionSimplifiee },
                champ3: { value: pi13[0].texFractionSimplifiee },
                champ4: { value: pi13[1].texFractionSimplifiee },
                champ5: { value: pi23[0].texFractionSimplifiee },
                champ6: { value: pi23[1].texFractionSimplifiee },
              },
              { formatInteractif: 'fillInTheBlank' },
            )
          }
          break
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
      if (
        listeTypeQuestions[i] === 'troisDroitesSG' ||
        listeTypeQuestions[i] === 'troisDroitesHG'
      ) {
        if (this.correctionDetaillee) {
          texteCorr += `L'équation de la droite $d_3$ est donnée par \\[${eqToLatex([0, 0, 1, droiteFrac3[0], 0, droiteFrac3[1]], ['x', 'y', 'd_3(x)', 'x', 'y', ''], false)}\\] <br> Afin de déterminer le point d'intersection des droites $d_1$ et $d_3$, on résout le système d'équations suivant: \\[ ${printSystem(eqToLatex(eqD1ListeString, vari, true), eqToLatex(eqD3ListeString, vari, true))}\\] On obtient que l`
        } else {
          texteCorr += '<br>L'
        }
        texteCorr += `e point d'intersection des droites $d_1$ et $d_3$ vaut $${miseEnEvidence(`\\left(${pi13[0].texFractionSimplifiee};${pi13[1].texFractionSimplifiee}\\right)`)}$.<br>`
        if (this.correctionDetaillee) {
          texteCorr += `<br> Afin de déterminer le point d'intersection des droites $d_1$ et $d_3$, on résout le système d'équations suivant: \\[ ${printSystem(eqToLatex(eqD2ListeString, vari, true), eqToLatex(eqD3ListeString, vari, true))}\\] On obtient que l`
        } else {
          texteCorr += '<br>L'
        }
        texteCorr += `e point d'intersection des droites $d_2$ et $d_3$ vaut $${miseEnEvidence(`\\left(${pi23[0].texFractionSimplifiee};${pi23[1].texFractionSimplifiee}\\right)`)}$.`
      }

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
