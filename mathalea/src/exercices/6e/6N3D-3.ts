import { droiteGraduee } from '../../lib/2d/DroiteGraduee'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { labelPoint } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { bleuMathalea } from '../../lib/colors'
import {
  addPointsCliquables,
  type PointCliquableData,
} from '../../lib/customElements/PointsCliquablesElement'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { lettreIndiceeDepuisChiffre } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'
export const titre =
  'Placer un point sur une droite graduée (abscisses fractionnaires niv 2)'
export const interactifReady = true
export const amcReady = true
export const amcType = 'AMCOpen'
export const dateDePublication = '11/05/2023'
export const dateDeModificationImportante = '07/07/2026'

/**
 * Description didactique de l'exercice :
 * Cherche des abscisses sous forme de fractions avec possibilté d'avoir des fractions simplifiées
 * @author Mickael Guironnet
 * Refactorisation de l'exercice pour le rendre interactif, réécriture en typescript lintage  @author Jean-Claude Lhote
 * Référence CM2N2E-3
 * publié le 10/05/2023
 */

export const uuid = 'a2582'

export const refs = {
  'fr-fr': ['CM2N2E-3'],
  'fr-2016': ['6G24-4'],
  'fr-ch': ['9R1NO4B-8', '9R2NO4B-8', '9R3NO4B-8', 'PRQNO04B-8'],
}
export default class PlacerPointsAbscissesFractionnairesComplexes extends Exercice {
  niveau: number = 6
  constructor() {
    super()
    this.consigne = ''
    this.niveau = 6
    this.nbQuestions = 5
    this.nbCols = 1 // Uniquement pour la sortie LaTeX
    this.nbColsCorr = 1 // Uniquement pour la sortie LaTeX
    this.sup = 1 // Niveau de difficulté
    this.sup2 = true // avec des fractions simplifiées
    this.sup3 = false // valeurs positives si false sinon valeurs positives et négatives
    this.video = '' // Id YouTube ou url
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté :',
      3,
      '1 : Graduation en 1/4, 1/6, 1/8, 1/9, 1/10\n2 : Graduation en 1/12, 1/14, 1/16, 1/18 et 1/20\n3 : Mélange',
    ]
    this.besoinFormulaire2CaseACocher = ['Avec des fractions simplifiées', true]
    // this.besoinFormulaire3CaseACocher = ['Avec des valeurs négatives', false] // faire un clone en 5e avec ce formulaire
  }

  nouvelleVersion() {
    this.sup = parseInt(this.sup)
    this.sup2 = this.niveau === 6 ? false : this.sup2
    this.listeQuestions = [] // Liste de questions
    this.listeCorrections = [] // Liste de questions corrigées
    this.autoCorrection = []

    let typeDeQuestions
    if (this.sup > 2) {
      typeDeQuestions = combinaisonListes([0, 1], this.nbQuestions)
    } else {
      typeDeQuestions = combinaisonListes(
        [parseInt(this.sup) - 1],
        this.nbQuestions,
      )
    }
    const data: {
      [key: number]: { id: number; den: number[]; max: number; min: number }
    } = {
      4: {
        id: 4,
        den: [2, 4],
        max: !this.sup3 ? 8 : 4,
        min: !this.sup3 ? 0 : -4,
      },
      6: {
        id: 6,
        den: [2, 3, 6],
        max: !this.sup3 ? 6 : 3,
        min: !this.sup3 ? 0 : -3,
      },
      8: {
        id: 8,
        den: [2, 4, 8],
        max: !this.sup3 ? 4 : 2,
        min: !this.sup3 ? 0 : -2,
      },
      9: {
        id: 9,
        den: [3, 9],
        max: !this.sup3 ? 4 : 2,
        min: !this.sup3 ? 0 : -2,
      },
      10: {
        id: 10,
        den: [2, 5, 10],
        max: !this.sup3 ? 4 : 2,
        min: !this.sup3 ? 0 : -2,
      },
      12: {
        id: 12,
        den: [2, 3, 4, 6, 12],
        max: !this.sup3 ? 3 : 2,
        min: !this.sup3 ? 0 : -1,
      },
      14: {
        id: 14,
        den: [2, 7, 14],
        max: !this.sup3 ? 2 : 1,
        min: !this.sup3 ? 0 : -1,
      },
      15: {
        id: 15,
        den: [3, 5, 15],
        max: !this.sup3 ? 2 : 1,
        min: !this.sup3 ? 0 : -1,
      },
      16: {
        id: 16,
        den: [2, 4, 8, 16],
        max: !this.sup3 ? 1 : 1,
        min: !this.sup3 ? 0 : -1,
      },
      18: {
        id: 18,
        den: [2, 3, 6, 9, 18],
        max: !this.sup3 ? 1 : 1,
        min: !this.sup3 ? 0 : -1,
      },
      20: {
        id: 20,
        den: [2, 4, 5, 10, 20],
        max: !this.sup3 ? 1 : 1,
        min: !this.sup3 ? 0 : -1,
      },
    }
    const tableDisponibles = [
      [4, 6, 8, 9, 10],
      [12, 14, 15, 16, 18, 20],
    ]

    const tableUtilisées: number[][] = [[], []]
    const fractionsUtilisees = [] // Pour s'assurer de ne pas poser 2 fois la même question
    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
      cpt++
    ) {
      if (
        tableDisponibles[typeDeQuestions[i]].length ===
        tableUtilisées[typeDeQuestions[i]].length
      ) {
        tableUtilisées[typeDeQuestions[i]] = []
      }
      const tab = choice(
        tableDisponibles[typeDeQuestions[i]],
        tableUtilisées[typeDeQuestions[i]],
      )
      tableUtilisées[typeDeQuestions[i]].push(tab)

      let num2 = 0,
        num3 = 0,
        den2 = 0,
        den3 = 0
      const den1 = !this.sup2 ? data[tab].id : choice(data[tab].den)
      const num1 = trouveNumérateur(den1, data[tab].min, data[tab].max)
      const texFraction = new FractionEtendue(num1, den1).texFraction
      if (this.interactif) {
        texte = `Placer le point $${lettreIndiceeDepuisChiffre(i + 1)}\\left(${texFraction}\\right).$`
      } else {
        den2 = !this.sup2 ? data[tab].id : choice(data[tab].den, den1)
        num2 = trouveNumérateur(den2, data[tab].min, data[tab].max, [
          { num: num1, den: den1 },
        ])
        const texFraction2 = new FractionEtendue(num2, den2).texFraction
        den3 = !this.sup2
          ? data[tab].id
          : choice(
              data[tab].den,
              data[tab].den.length > 2 ? [den1, den2] : [den1],
            )
        num3 = trouveNumérateur(den3, data[tab].min, data[tab].max, [
          { num: num1, den: den1 },
          { num: num2, den: den2 },
        ])
        const texFraction3 = new FractionEtendue(num3, den3).texFraction
        texte = `Placer les points $${lettreIndiceeDepuisChiffre(i * 3 + 1)}\\left(${texFraction}\\right)$, $~${lettreIndiceeDepuisChiffre(i * 3 + 2)}\\left(${texFraction2}\\right)$ et $~${lettreIndiceeDepuisChiffre(i * 3 + 3)}\\left(${texFraction3}\\right)$.`
      }
      const origine = data[tab].min
      const tailleUnite = 20 / (data[tab].max - data[tab].min)
      const d = droiteGraduee({
        Min: data[tab].min,
        Max: data[tab].max,
        Unite: tailleUnite,
        thickSec: true,
        thickSecDist: 1 / data[tab].id,
        thickEpaisseur: 3,
      })
      const mesObjets: NestedObjetMathalea2dArray = [d]
      const pointsCliquables: PointCliquableData[] = []
      const pointsAttendus: PointCliquableData[] = []
      if (this.interactif) {
        for (
          let indicePoint = 0;
          indicePoint < 1 + data[tab].id * (data[tab].max - data[tab].min);
          indicePoint++
        ) {
          const point = {
            x: (indicePoint / data[tab].id) * tailleUnite,
            y: 0,
            id: `P${indicePoint}`,
            etat: false,
          }
          pointsCliquables.push(point)
          pointsAttendus.push({
            ...point,
            etat:
              Math.abs(indicePoint / data[tab].id + origine - num1 / den1) <
              0.5 / data[tab].id,
          })
        }
      }
      const figureId = `figEx${this.numeroExercice}Q${i}`
      texte +=
        '<br>' +
        mathalea2d(
          {
            xmin: -0.2,
            xmax: (data[tab].max - data[tab].min) * tailleUnite + 1,
            ymin: -1,
            ymax: 2.5,
            scale: 0.6,
            id: figureId,
          },
          mesObjets,
        )
      if (this.interactif && context.isHtml) {
        texte += addPointsCliquables({
          numeroExercice: this.numeroExercice ?? 0,
          questionIndex: i,
          figureId,
          points: pointsCliquables,
          pixelsParCm: 20,
          radius: tailleUnite / data[tab].id / 2,
          width: 5,
          size: 8,
          color: bleuMathalea,
        })
        handleAnswers(
          this,
          i,
          { reponse: { value: JSON.stringify(pointsAttendus) } },
          { formatInteractif: 'points-cliquables' },
        )
      }

      let A, B, C, traceB, traceC, labels
      if (context.isHtml) {
        A = pointAbstrait(
          (num1 / den1 - origine) * tailleUnite,
          0,
          `$${lettreIndiceeDepuisChiffre(i + 1)}$`,
        )
      } else {
        A = pointAbstrait(
          (num1 / den1 - origine) * tailleUnite,
          0,
          lettreIndiceeDepuisChiffre(i + 1),
        )
      }
      const traceA = tracePoint(A, bleuMathalea)
      traceA.epaisseur = this.interactif ? 3 : 2
      traceA.taille = this.interactif ? 5 : 3
      labels = labelPoint(A)
      if (!this.interactif) {
        if (context.isHtml) {
          A.nom = `$${lettreIndiceeDepuisChiffre(i * 3 + 1)}$`
          B = pointAbstrait(
            (num2 / den2 - origine) * tailleUnite,
            0,
            `$${lettreIndiceeDepuisChiffre(i * 3 + 2)}$`,
          )
        } else {
          A.nom = lettreIndiceeDepuisChiffre(i * 3 + 1)
          B = pointAbstrait(
            (num2 / den2 - origine) * tailleUnite,
            0,
            lettreIndiceeDepuisChiffre(i * 3 + 2),
          )
        }
        traceB = tracePoint(B, bleuMathalea)
        traceB.epaisseur = 2
        traceB.taille = 3
        if (context.isHtml) {
          C = pointAbstrait(
            (num3 / den3 - origine) * tailleUnite,
            0,
            `$${lettreIndiceeDepuisChiffre(i * 3 + 3)}$`,
          )
        } else {
          C = pointAbstrait(
            (num3 / den3 - origine) * tailleUnite,
            0,
            lettreIndiceeDepuisChiffre(i * 3 + 3),
          )
        }
        traceC = tracePoint(C, bleuMathalea)
        traceC.epaisseur = 2
        traceC.taille = 3
        labels = labelPoint(A, B, C)
      }
      const mesObjetsCorr: NestedObjetMathalea2dArray = [d, traceA, labels]
      if (traceB) mesObjetsCorr.push(traceB)
      if (traceC) mesObjetsCorr.push(traceC)
      if (!context.isHtml) {
        A.positionLabel = 'above = 0.2'
        if (B) B.positionLabel = 'above = 0.2'
        if (C) C.positionLabel = 'above = 0.2'
      }
      if (this.interactif) {
        texteCorr = `$${lettreIndiceeDepuisChiffre(i + 1)}\\left(${texFraction}\\right).$`
        texteCorr +=
          '<br>' +
          mathalea2d(
            {
              xmin: -0.2,
              xmax: (data[tab].max - data[tab].min) * tailleUnite + 1,
              ymin: -1,
              ymax: 3.5,
              scale: 0.6,
            },
            mesObjetsCorr,
          )
      } else {
        const texFraction2 = new FractionEtendue(num2, den2).texFraction
        const texFraction3 = new FractionEtendue(num3, den3).texFraction
        texteCorr = `$${lettreIndiceeDepuisChiffre(i * 3 + 1)}\\left(${texFraction}\\right)$, $~${lettreIndiceeDepuisChiffre(i * 3 + 2)}\\left(${texFraction2}\\right)$ et $~${lettreIndiceeDepuisChiffre(i * 3 + 3)}\\left(${texFraction3}\\right)$`
        texteCorr +=
          '<br>' +
          mathalea2d(
            {
              xmin: -0.2,
              xmax: (data[tab].max - data[tab].min) * tailleUnite + 1,
              ymin: -1,
              ymax: 2.25,
              scale: 1,
            },
            mesObjetsCorr,
          )
      }

      if (!isArrayInArray(fractionsUtilisees, [num1, den1])) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions.push(texte)
        this.listeCorrections.push(texteCorr)
        fractionsUtilisees[i] = [num1, den1]

        if (context.isAmc) {
          this.autoCorrectionAMC[i] = {
            enonce: texte + '\n',
            propositions: [
              {
                texte: texteCorr,
                statut: 5,
                sanscadre: true,
                pointilles: true,
                feedback: '',
              },
            ],
          }
        }

        i++
      }
    }

    listeQuestionsToContenu(this)
  }
}

/**
 * Vérifie la présence d'un tableau dans un tableau de tableau
 * @param {array} arr
 * @param {array} item
 * @returns {boolean}
 */
function isArrayInArray(arr: number[][], item: number[]): boolean {
  const itemAsString = JSON.stringify(item)
  const contains = arr.some(function (ele) {
    return JSON.stringify(ele) === itemAsString
  })
  return contains
}

function trouveNumérateur(
  den: number,
  min: number,
  max: number,
  fractionsAEviter: { num: number; den: number }[] = [],
) {
  const isNombreEntier = function (nu: number, de: number) {
    if (nu % de === 0) return true
    return false
  }

  let trouve = false
  let num = 0
  let i = 0
  while (!trouve && i < 10) {
    num = randint(min * den, den * max)

    // on veut éviter l'entier
    let k = 0
    while (isNombreEntier(num, den) && k < 5) {
      num = randint(min * den, den * max)
      k++
    }

    // on veut éviter d'être trop proche d'un autre point
    trouve = true
    for (const fraction of fractionsAEviter) {
      if (Math.abs(fraction.num / fraction.den - num / den) < 2 / den) {
        trouve = false
        break
      }
    }
    i++
  }
  return num
}
