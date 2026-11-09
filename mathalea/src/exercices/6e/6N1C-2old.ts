import { droiteGraduee } from '../../lib/2d/DroiteGraduee'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { labelPoint, latex2d } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { bleuMathalea, orangeMathalea } from '../../lib/colors'
import {
  addPointsCliquables,
  type PointCliquableData,
} from '../../lib/customElements/PointsCliquablesElement'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { combinaisonListes, shuffle } from '../../lib/outils/arrayOutils'
import { lettreIndiceeDepuisChiffre } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { egal, listeQuestionsToContenu, randint } from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'

export const dateDeModifImportante = '16/09/2024'
export const titre = "Placer un point d'abscisse entière (grands nombres)"
export const interactifReady = true
export const amcReady = true
export const amcType = 'AMCOpen'
/**
 * Placer un point d'abscisse entière
 * @author Jean-claude Lhote et Rémi Angot
 * Relecture : Novembre 2021 par EE
 * Correction : Problème de score 19/10/22 par Rémi ANGOT
 */
export const uuid = '4f2a3'

// déréférencé car inutile
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

export default class PlacerUnPointAbscisseEntiere2d extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      4,
      '1 : Ordre de grandeur : milliers\n2 : Ordre de grandeur : dizaines de mille\n3 : Ordre de grandeur : centaines de mille\n4 : Mélange',
    ]

    this.nbQuestions = 5

    this.sup = 1
  }

  nouvelleVersion() {
    if (this.interactif) {
      this.consigne = 'Placer un point sur un axe gradué.'
    } else {
      this.consigne = 'Placer trois points sur un axe gradué.'
    }
    // numeroExercice est 0 pour l'exercice 1
    let typesDeQuestions

    if (this.sup === 4) {
      typesDeQuestions = combinaisonListes([1, 2, 3], this.nbQuestions)
    } else {
      typesDeQuestions = combinaisonListes([this.sup], this.nbQuestions)
    }
    const tailleUnite = 4
    const d = []
    let abscisse = []
    this.contenu = this.consigne
    for (
      let i = 0,
        abs0,
        l1,
        l2,
        l3,
        x1,
        x2,
        x3,
        x11,
        x22,
        x33,
        A,
        B,
        C,
        traceA,
        traceB,
        traceC,
        labels,
        pas1,
        texte = '',
        texteCorr = '';
      i < this.nbQuestions;
      i++
    ) {
      l1 = lettreIndiceeDepuisChiffre(i * 3 + 1)
      l2 = lettreIndiceeDepuisChiffre(i * 3 + 2)
      l3 = lettreIndiceeDepuisChiffre(i * 3 + 3)
      switch (typesDeQuestions[i]) {
        case 1: // Placer des entiers sur un axe (milliers)
          abs0 = randint(1, 9) * 1000
          pas1 = 1000
          break

        case 2: // Placer des entiers sur un axe (dizaines de mille)
          abs0 = randint(5, 15) * 10000
          pas1 = 10000
          break

        case 3: // Placer des entiers sur un axe (centaines de mille)
        default:
          abs0 = randint(35, 85) * 100000
          pas1 = 100000
          break
      }
      x1 = randint(0, 2) + randint(1, 9) / 10
      x2 = randint(3, 4) + randint(1, 9) / 10
      x3 = randint(5, 6) + randint(1, 9) / 10
      x11 = abs0 + x1 * pas1
      x22 = abs0 + x2 * pas1
      x33 = abs0 + x3 * pas1
      abscisse = shuffle([
        [x1, x11],
        [x2, x22],
        [x3, x33],
      ])
      d[2 * i] = droiteGraduee({
        Unite: 4,
        Min: 0,
        Max: 7.1,
        axeStyle: '->',
        pointTaille: 5,
        pointStyle: 'x',
        labelsPrincipaux: false,
        thickSec: true,
        step1: 10,
        labelListe: [
          [0, `${texNombre(abs0, 0)}`],
          [1, `${texNombre(abs0 + pas1)}`],
        ],
      })
      d[2 * i + 1] = droiteGraduee({
        Unite: 4,
        Min: 0,
        Max: 7.1,
        axeStyle: '->',
        pointTaille: 5,
        pointStyle: 'x',
        labelsPrincipaux: false,
        labelListe: [
          [x1, `\\boldsymbol{${texNombre(x11, 0)}}`],
          [x2, `\\boldsymbol{${texNombre(x22, 0)}}`],
          [x3, `\\boldsymbol{${texNombre(x33, 0)}}`],
        ],
        labelColor: orangeMathalea,
        thickSec: true,
        step1: 10,
        labelCustomDistance: 1.5,
      })
      const label1 = latex2d(`${texNombre(abs0, 0)}`, 0, -0.7, {
        letterSize: 'scriptsize',
      })
      const label2 = latex2d(`${texNombre(abs0 + pas1, 0)}`, 4, -0.7, {
        letterSize: 'scriptsize',
      })

      const mesObjets: NestedObjetMathalea2dArray = [d[2 * i]]
      if (this.interactif) {
        texte = `Placer le point $${l1}\\left(${texNombre(abscisse[0][1])}\\right).$`
      } else {
        texte = `Placer les points $${l1}\\left(${texNombre(abscisse[0][1])}\\right)$, $~${l2}\\left(${texNombre(abscisse[1][1])}\\right)$ et $~${l3}\\left(${texNombre(abscisse[2][1])}\\right)$.`
      }
      const pointsCliquables: PointCliquableData[] = []
      const pointsAttendus: PointCliquableData[] = []
      if (this.interactif) {
        for (let indicePoint = 0; indicePoint < 70; indicePoint++) {
          const point = {
            x: (indicePoint / 10) * tailleUnite,
            y: 0,
            id: `P${indicePoint}`,
            etat: false,
          }
          pointsCliquables.push(point)
          pointsAttendus.push({
            ...point,
            etat: egal((indicePoint * pas1) / 10 + abs0, abscisse[0][1]),
          })
        }
      }
      const figureId = `figEx${this.numeroExercice}Q${i}`
      texte +=
        (context.isHtml ? '' : '\\\\') +
        mathalea2d(
          {
            xmin: -2,
            ymin: -1,
            xmax: 30,
            ymax: 1,
            pixelsParCm: 20,
            scale: 0.5,
            id: figureId,
          },
          ...mesObjets,
        )
      if (this.interactif) {
        texte += addPointsCliquables({
          numeroExercice: this.numeroExercice ?? 0,
          questionIndex: i,
          figureId,
          points: pointsCliquables,
          pixelsParCm: 20,
          radius: tailleUnite / 25,
          width: 3,
          size: 5,
          color: bleuMathalea,
        })
        handleAnswers(
          this,
          i,
          { reponse: { value: JSON.stringify(pointsAttendus) } },
          { formatInteractif: 'points-cliquables' },
        )
      }

      A = pointAbstrait(abscisse[0][0] * tailleUnite, 0, l1)
      traceA = tracePoint(A, orangeMathalea)
      traceA.epaisseur = 2
      traceA.taille = 3
      labels = labelPoint(A)
      if (!this.interactif) {
        A.nom = lettreIndiceeDepuisChiffre(i * 3 + 1)
        B = pointAbstrait(abscisse[1][0] * tailleUnite, 0, l2)
        traceB = tracePoint(B, orangeMathalea)
        traceB.epaisseur = 2
        traceB.taille = 3
        C = pointAbstrait(abscisse[2][0] * tailleUnite, 0, l3)
        traceC = tracePoint(C, orangeMathalea)
        traceC.epaisseur = 2
        traceC.taille = 3
        labels = labelPoint(A, B, C)
      }
      if (this.interactif) {
        texteCorr = mathalea2d(
          Object.assign(
            { pixelsParCm: 20, scale: 0.5 },
            fixeBordures([d[2 * i + 1], traceA, labels]),
          ),
          d[2 * i + 1],
          traceA,
          labels,
        )
      } else {
        texteCorr = mathalea2d(
          Object.assign(
            { pixelsParCm: 20, scale: 0.5 },
            fixeBordures([
              d[2 * i + 1],
              traceA,
              traceB!,
              traceC!,
              labels,
              label1,
              label2,
            ]),
          ),
          d[2 * i + 1],
          traceA,
          traceB!,
          traceC!,
          labels,
          label1,
          label2,
        )
      }
      if (context.isAmc) {
        this.autoCorrectionAMC[i] = {
          enonce: texte + '<br>',
          propositions: [
            {
              texte: texteCorr,
              statut: 3, // OBLIGATOIRE (ici c'est le nombre de lignes du cadre pour la réponse de l'élève sur AMC)
              sanscadre: true,
            },
          ],
        }
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      }

      this.listeQuestions.push(texte)
      this.listeCorrections.push(texteCorr)
    }
    listeQuestionsToContenu(this)
  }
}
