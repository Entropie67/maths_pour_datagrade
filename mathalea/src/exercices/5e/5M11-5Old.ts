/**
 * ⚠️ Cet exercice est utilisé dans le test : tests/e2e/tests/interactivity/mathLive.2inputs.test.ts ⚠️
 * Il faudra y penser quand on supprimera 5M11-5-old.ts et 6M1D-old.ts et 6M1D-1-old.ts
 */

import { arc } from '../../lib/2d/Arc'
import { cercle } from '../../lib/2d/cercle'
import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { codageSegments } from '../../lib/2d/CodageSegment'
import { droite, droiteParPointEtPerpendiculaire } from '../../lib/2d/droites'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { placeLatexSurSegment } from '../../lib/2d/placeLatexSurSegment'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygoneAvecNom } from '../../lib/2d/polygones'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { tracePoint } from '../../lib/2d/TracePoint'
import {
  pointIntersectionCC,
  pointIntersectionDD,
  pointSurCercle,
} from '../../lib/2d/utilitairesPoint'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { bleuMathalea } from '../../lib/colors'
import { texTexte } from '../../lib/format/texTexte'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arrondi, troncature } from '../../lib/outils/nombres'
import { sp } from '../../lib/outils/outilString'
import { stringNombre, texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import Grandeur from '../../modules/Grandeur'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  contraindreValeur,
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'

export const titre = 'Calculer périmètre et aire de figures composées'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'
export const dateDeModifImportante = '31/03/2026'
/**
 * Il faut calculer le périmètre et/ou l'aire par addition ou soustraction d'aires
 *
 * @author Rémi Angot
 * Ajout de this.sup4 et correction coquilles sur aire et puis aussi sur précision au dixième par Éric Elter le 25/07/2023
 * Ajout de la possibilité de demander un découpage au lieu de calculer des périmètres ou des aires par Guillaume Valmont le 28/10/2023
 * Modification du paramètre de choix pour mettre mélange en 0 et ajouter un cas par Jean-claude Lhote
 */
export const uuid = '5999e'

export const refs = {
  'fr-fr': [],
  'fr-2016': [],
  'fr-ch': [],
}

function valeursApprochees(inputValue: number, sup3: number): number[] {
  // Calculer la valeur approchée
  const valeurAEncadrer = arrondi(inputValue, sup3 - 1)

  // Initialiser le tableau valeurApprochee
  const valeurApprochee: number[] = []

  if (inputValue > valeurAEncadrer) {
    valeurApprochee[0] = valeurAEncadrer
    valeurApprochee[1] = arrondi(
      valeurAEncadrer + (sup3 === 1 ? 1 : 0.1),
      sup3 - 1,
    )
  } else {
    valeurApprochee[0] = arrondi(
      valeurAEncadrer - (sup3 === 1 ? 1 : 0.1),
      sup3 - 1,
    )
    valeurApprochee[1] = valeurAEncadrer
  }

  // Retourner le tableau
  return valeurApprochee
}

export default class PerimetreOuAireDeFiguresComposees extends Exercice {
  besoinFormulaire3Numerique: boolean | [string, number, string]
  besoinFormulaire4Numerique: boolean | [string, number, string]
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Types de figures',
      'Nombres séparés par des tirets :\n1 : Rectangle & triangle\n2 : Rectangle moins triangle\n3 : Rectangle moins deux triangles\n4 : Rectangle & demi-disque\n5 : Rectangle & disque \n6 : Rectangle & demi-disque & triangle\n7 : Rectangle & 2 demi-disques\n0 : Mélange',
    ]
    this.besoinFormulaire2CaseACocher = ['Ordre aléatoire des figures choisies']
    this.besoinFormulaire3Numerique = [
      'Choix de la précision (pour les valeurs approchées)',
      2,
      "1 : À l'unité\n 2 : Au dixième",
    ]
    // this.besoinFormulaire4Numerique = ['Choix de la demande ', 3, '1 : Que le périmètre\n 2 : Que l\'aire\n3 : Périmètre et aire\n4 : Découpage']
    this.besoinFormulaire4Numerique = [
      'Choix de la demande ',
      3,
      "1 : Que le périmètre\n 2 : Que l'aire\n3 : Périmètre et aire",
    ]
    this.spacing = 2
    this.spacingCorr = 2
    this.nbQuestions = 2

    this.sup = '0'
    this.sup2 = true
    this.sup3 = 1
    this.sup4 = 3
  }

  nouvelleVersion() {
    const singulierPluriel =
      this.nbQuestions === 1 ? 'la figure suivante' : 'les figures suivantes'
    const singulierPluriel2 =
      this.nbQuestions === 1 ? 'de la figure suivante' : 'des figures suivantes'
    this.sup3 = contraindreValeur(1, 2, this.sup3, 1)
    switch (this.sup4) {
      case 4:
        this.consigne = `Décomposer ${singulierPluriel} en plusieurs figures simples.`
        break
      case 3:
        this.consigne = `Calculer le périmètre et l'aire ${singulierPluriel2}.`
        break
      case 2:
        this.consigne = `Calculer l'aire ${singulierPluriel2}.`
        break
      default:
        this.consigne = `Calculer le périmètre ${singulierPluriel2}.`
        break
    }

    const tripletsPythagoriciens = [
      [3, 4, 5],
      [6, 8, 10],
      [8, 15, 17],
      [10, 24, 26],
      [5, 12, 13],
      [12, 16, 20],
      [20, 21, 29],
      [48, 55, 73],
      [28, 45, 53],
      [36, 77, 85],
      [39, 80, 89],
    ]

    const typesDeQuestions = gestionnaireFormulaireTexte({
      max: 7,
      defaut: 0,
      melange: 0,
      nbQuestions: this.nbQuestions,
      shuffle: this.sup2,
      saisie: this.sup,
    }).map(Number)

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      let perimetreReponses: number[] = []
      let aireReponses: number[] = []
      let texte, texteCorr, perimetre, aire
      if (this.sup4 === 4) {
        this.nbCols = 2
        this.nbColsCorr = 2
      }
      const contourFigure = []
      const decoupages = []
      const codagesSansDecoupage: NestedObjetMathalea2dArray = []
      const codagesDecoupage = []
      const labelsSansDecoupage: NestedObjetMathalea2dArray = []
      const labelsAvecDecoupage = []
      const objetsEnonce = []
      const objetsCorrection = []
      switch (typesDeQuestions[i]) {
        case 1: {
          // 'rectangle_triangle': {
          const triplet = choice(tripletsPythagoriciens)
          const adjust = triplet[2] > 50 ? 0.1 : randint(2, 3) / 10
          const partieDecimale1 = adjust - 1
          const l1 = triplet[0] * (1 + partieDecimale1)
          const L2 = triplet[1] * (1 + partieDecimale1)
          const hyp = triplet[2] * (1 + partieDecimale1)
          const L1 =
            randint(Math.ceil(l1) + 1, Math.ceil(l1) + 4) + randint(1, 9) / 10
          const zoom = randint(10, 14) / (L1 + L2)
          const A = pointAbstrait(0, 0, 'A')
          const B = pointAbstrait(0, l1 * zoom, 'B')
          const C = pointAbstrait(L1 * zoom, l1 * zoom, 'C')
          const D = pointAbstrait((L1 + L2) * zoom, l1 * zoom, 'D')
          const E = pointAbstrait(L1 * zoom, 0, 'E')
          const p1 = polygoneAvecNom(A, B, C, D, E)
          p1[0].epaisseur = 2
          contourFigure.push(p1[0])
          codagesDecoupage.push(
            codageAngleDroit(B, C, E),
            codageAngleDroit(C, E, A),
            codageSegments('/', 'black', A, B, C, E),
            codageSegments('//', 'black', B, C, A, E),
            codageAngleDroit(E, C, D, bleuMathalea),
          )
          codagesSansDecoupage.push(
            codageAngleDroit(A, B, C),
            codageAngleDroit(E, A, B),
          )
          const CE = segment(C, E)
          CE.pointilles = 5
          decoupages.push(CE)
          labelsSansDecoupage.push(
            placeLatexSurSegment(`${texNombre(hyp, 1)}\\text{ cm}`, D, E, {
              letterSize: 'small',
            }),
            placeLatexSurSegment(`${texNombre(l1, 1)}\\text{ cm}`, A, B, {
              letterSize: 'small',
            }),
            placeLatexSurSegment(`${texNombre(L1, 1)}\\text{ cm}`, E, A, {
              letterSize: 'small',
            }),
            placeLatexSurSegment(`${texNombre(L1 + L2, 1)}\\text{ cm}`, B, D, {
              letterSize: 'small',
            }),
          )
          labelsAvecDecoupage.push(
            placeLatexSurSegment(`${texNombre(hyp, 1)}\\text{ cm}`, D, E, {
              letterSize: 'small',
            }),
            placeLatexSurSegment(`${texNombre(l1, 1)}\\text{ cm}`, A, B, {
              letterSize: 'small',
            }),
            placeLatexSurSegment(`${texNombre(L1, 1)}\\text{ cm}`, E, A, {
              letterSize: 'small',
            }),
            placeLatexSurSegment(`${texNombre(L2, 1)}\\text{ cm}`, C, D, {
              letterSize: 'small',
            }),
          )
          if (this.sup4 === 4) {
            objetsEnonce.push(...contourFigure, ...codagesSansDecoupage)
            objetsCorrection.push(
              ...contourFigure,
              ...decoupages,
              ...codagesSansDecoupage,
              ...codagesDecoupage,
            )
          } else {
            objetsEnonce.push(
              ...contourFigure,
              ...decoupages,
              ...codagesSansDecoupage,
              ...codagesDecoupage,
              ...labelsAvecDecoupage,
            )
          }
          texte = mathalea2d(
            Object.assign(
              {
                scale: 0.7,
                pixelsParCm: 20,
                zoom: 1,
                optionsTikz: 'baseline=(current bounding box.north)',
                display: 'block',
              } as const,
              fixeBordures([A, B, C, D, E, pointAbstrait(C.x, C.y + 0.5)], {
                rxmin: -1.2,
                rymin: -1.2,
              }),
            ),
            objetsEnonce,
          )

          if (this.sup4 === 4) {
            texteCorr = mathalea2d(
              Object.assign(
                {
                  scale: 0.7,
                  pixelsParCm: 20,
                  zoom: 1,
                  optionsTikz: 'baseline=(current bounding box.north)',
                  display: 'block',
                } as const,
                fixeBordures(
                  [
                    A,
                    B,
                    C,
                    D,
                    E,
                    pointAbstrait(C.x, C.y + 0.2),
                    labelsAvecDecoupage,
                  ],
                  { rxmin: -1, rymin: -1 },
                ),
              ),
              objetsCorrection,
            )
            texteCorr += `On peut découper cette figure en un rectangle de $${texNombre(L1, 1)}$ cm par $${texNombre(l1, 1)}$ cm
            et un triangle rectangle dont les côtés de l'angle droit mesurent respectivement $${texNombre(L2, 1)}$ cm
            et $${texNombre(l1, 1)}$ cm.<br>`
          } else {
            texteCorr = `La figure est composée d'un rectangle de $${texNombre(L1, 1)}$ cm par $${texNombre(l1, 1)}$ cm`
            texteCorr += ` et d'un triangle rectangle dont les côtés de l'angle droit mesurent respectivement $${texNombre(L2, 1)}$ cm et $${texNombre(l1, 1)}$ cm.<br>`
            texteCorr +=
              this.sup4 !== 2
                ? `$\\mathcal{P}=${texNombre(L1 + L2, 1)}+${texNombre(hyp, 1)}+${texNombre(L1, 1)}+${texNombre(l1, 1)}=${miseEnEvidence(texNombre(L1 + L2 + hyp + L1 + l1, 1))}${sp()}${texTexte('cm')}$<br>`
                : ''
            texteCorr +=
              this.sup4 !== 1
                ? `$\\mathcal{A}=(${texNombre(L1, 1)}\\times${texNombre(l1, 1)})+(${texNombre(L2, 1)}\\times${texNombre(l1, 1)}\\div2)=${texNombre(L1 * l1, 2)}+${texNombre((L2 * l1) / 2, 2)}=${miseEnEvidence(texNombre(L1 * l1 + (L2 * l1) / 2, 2))}${sp()}${texTexte('cm')}^2$`
                : ''
          }
          perimetre = arrondi(L1 + L2 + hyp + L1 + l1, 1)
          aire = arrondi(L1 * l1 + (L2 * l1) / 2, 2)
          perimetreReponses = [perimetre, perimetre]
          aireReponses = [aire, aire]
          break
        }
        case 2: {
          // 'rectangle_moins_triangle': {
          const triplet = choice(tripletsPythagoriciens)
          const adjust = triplet[2] > 50 ? 0.1 : randint(2, 3) / 10
          const c1 = triplet[0] * adjust
          const c2 = triplet[1] * adjust
          const c = triplet[2] * adjust
          const zoom = randint(8, 12) / c
          const M = pointAbstrait(0, 0, 'M')
          const N = pointAbstrait(0, c * zoom, 'N')
          const O = pointAbstrait(c * zoom, c * zoom, 'O')
          const P = pointAbstrait(c * zoom, 0, 'P')
          const S = pointIntersectionCC(
            cercle(N, c1 * zoom),
            cercle(O, c2 * zoom),
            'S',
            2,
          )
          const p2 = polygoneAvecNom(M, N, S, O, P)
          p2[0].epaisseur = 2
          contourFigure.push(p2[0])
          const NO = segment(N, O)
          NO.pointilles = 5
          decoupages.push(NO)
          codagesSansDecoupage.push(
            codageAngleDroit(N, S, O),
            codageAngleDroit(O, P, M),
            codageAngleDroit(P, M, N),
            codageSegments('//', 'black', M, N, M, P, O, P),
          )
          codagesDecoupage.push(
            codageAngleDroit(M, N, O),
            codageAngleDroit(N, O, P),
          )
          labelsSansDecoupage.push(
            placeLatexSurSegment(`${texNombre(c, 1)}\\text{ cm}`, P, M, {
              letterSize: 'small',
            }),
            placeLatexSurSegment(`${texNombre(c1, 1)}\\text{ cm}`, S, N, {
              letterSize: 'small',
            }),
            placeLatexSurSegment(`${texNombre(c2, 1)}\\text{ cm}`, O, S, {
              letterSize: 'small',
            }),
          )
          labelsAvecDecoupage.push(...labelsSansDecoupage)
          if (this.sup4 === 4) {
            objetsEnonce.push(...contourFigure, ...codagesSansDecoupage)
            objetsCorrection.push(
              ...contourFigure,
              ...decoupages,
              ...codagesSansDecoupage,
              ...codagesDecoupage,
            )
          } else {
            objetsEnonce.push(
              ...contourFigure,
              ...decoupages,
              ...codagesSansDecoupage,
              ...codagesDecoupage,
              ...labelsAvecDecoupage,
            )
          }
          texte = mathalea2d(
            Object.assign(
              {
                scale: 0.7,
                pixelsParCm: 20,
                zoom: 1,
                optionsTikz: 'baseline=(current bounding box.north)',
                display: 'block',
              } as const,
              fixeBordures([M, N, S, O, P, pointAbstrait(N.x, N.y + 0.5)], {
                rxmin: -1,
                rymin: -1.2,
              }),
            ),
            objetsEnonce,
          )

          if (this.sup4 === 4) {
            texteCorr = mathalea2d(
              Object.assign(
                {
                  scale: 0.7,
                  pixelsParCm: 20,
                  zoom: 1,
                  optionsTikz: 'baseline=(current bounding box.north)',
                  display: 'block',
                } as const,
                fixeBordures([M, N, S, O, P, pointAbstrait(N.x, N.y + 0.5)], {
                  rxmin: -1,
                  rymin: -1.2,
                }),
              ),
              objetsCorrection,
            )
            texteCorr +=
              'La figure est un carré auquel il faut enlever un triangle rectangle.'
          } else {
            texteCorr = `La figure est un carré de côté $${texNombre(c, 1)}$ cm auquel il faut enlever un triangle rectangle dont les côtés de l'angle droit mesurent respectivement $${texNombre(c1, 1)}$ cm et $${texNombre(c2, 1)}$ cm.<br>`
            texteCorr +=
              this.sup4 !== 2
                ? `$\\mathcal{P}=${texNombre(c, 1)}+${texNombre(c, 1)}+${texNombre(c, 1)}+${texNombre(c1, 1)}+${texNombre(c2, 1)}=${miseEnEvidence(texNombre(3 * c + c1 + c2, 1))}${sp()}${texTexte('cm')}$<br>`
                : ''
            texteCorr +=
              this.sup4 !== 1
                ? `$\\mathcal{A}=(${texNombre(c, 1)}\\times${texNombre(c, 1)})-(${texNombre(c1, 1)}\\times${texNombre(c2, 1)}\\div2)=${miseEnEvidence(texNombre(c ** 2 - (c1 * c2) / 2, 2))}${sp()}${texTexte('cm')}^2$<br>`
                : ''
          }
          perimetre = arrondi(3 * c + c1 + c2, 1)
          aire = arrondi(c ** 2 - (c1 * c2) / 2, 2)
          perimetreReponses = [perimetre, perimetre]
          aireReponses = [aire, aire]
          break
        }
        case 3: {
          // 'rectangle_moins_deux_triangles': {
          const deuxtripletsPythagoriciens = [
            [
              [8, 6, 10],
              [8, 15, 17],
            ],
            [
              [20, 48, 52],
              [20, 21, 29],
            ],
            [
              [12, 5, 13],
              [12, 16, 20],
            ],
            [
              [20, 21, 29],
              [5 * 4, 12 * 4, 13 * 4],
            ],
            [
              [20, 21, 29],
              [3 * 7, 4 * 7, 5 * 7],
            ],
            [
              [48, 55, 73],
              [4 * 12, 3 * 12, 5 * 12],
            ],
            [
              [28, 45, 53],
              [4 * 7, 3 * 7, 5 * 7],
            ],
            [
              [36, 77, 85],
              [4 * 9, 3 * 9, 5 * 9],
            ],
            [
              [39, 80, 89],
              [3 * 13, 4 * 13, 5 * 13],
            ],
          ]
          const [triplet1, triplet2] = choice(deuxtripletsPythagoriciens)
          const adjust =
            triplet1[1] + triplet2[1] > 50 ? 0.1 : randint(3, 4) / 10
          const com1 = triplet1[0] * adjust
          const c1 = triplet1[1] * adjust
          const h1 = triplet1[2] * adjust
          const c2 = triplet2[1] * adjust
          const h2 = triplet2[2] * adjust
          const zoom = randint(8, 12) / (c1 + c2)
          const h = com1
          const c = c1 + c2
          const M = pointAbstrait(0, 0, 'M')
          const N = pointAbstrait(0, c * zoom, 'N')
          const O = pointAbstrait(c * zoom, c * zoom, 'O')
          const P = pointAbstrait(c * zoom, 0, 'P')
          const S = pointIntersectionCC(
            cercle(N, h1 * zoom),
            cercle(O, h2 * zoom),
            'S',
            2,
          )
          const T = pointIntersectionDD(
            droite(M, N),
            droiteParPointEtPerpendiculaire(S, droite(M, N)),
          )
          const U = pointIntersectionDD(
            droite(O, P),
            droiteParPointEtPerpendiculaire(S, droite(M, N)),
          )
          const H = pointIntersectionDD(
            droite(N, O),
            droiteParPointEtPerpendiculaire(S, droite(N, O)),
          )
          const p2 = polygoneAvecNom(M, N, S, O, P)
          p2[0].epaisseur = 2
          contourFigure.push(p2[0])
          const HS = segment(H, S)
          HS.pointilles = 5
          const NO = segment(N, O)
          NO.pointilles = 5
          const TU = segment(T, U)
          TU.pointilles = 5
          decoupages.push(HS, NO)
          const decoupages2 = [TU]
          codagesSansDecoupage.push(
            codageAngleDroit(O, P, M),
            codageAngleDroit(P, M, N),
          )
          codagesDecoupage.push(
            codageAngleDroit(M, N, O),
            codageAngleDroit(N, O, P),
            codageAngleDroit(N, H, S),
            codageAngleDroit(S, H, O, bleuMathalea),
            codageSegments('//', 'black', M, N, M, P, O, P),
          )
          const codagesDecoupages2 = [
            codageAngleDroit(M, T, S),
            codageAngleDroit(N, T, S),
            codageAngleDroit(P, U, S),
            codageAngleDroit(O, U, S),
            codageSegments('//', 'black', M, T, P, U),
            codageSegments('/', 'black', T, N, U, O),
            codageSegments('///', 'black', M, P, T, U),
          ]
          labelsAvecDecoupage.push(
            placeLatexSurSegment(`${texNombre(c, 1)}\\text{ cm}`, P, M, {
              letterSize: 'small',
            }),
            placeLatexSurSegment(`  ${texNombre(h1, 1)}\\text{ cm}`, S, N, {
              letterSize: 'small',
            }),
            placeLatexSurSegment(`  ${texNombre(h2, 1)}\\text{ cm}`, O, S, {
              letterSize: 'small',
            }),
            placeLatexSurSegment(`  ${texNombre(com1, 1)}\\text{ cm}`, H, S, {
              letterSize: 'small',
            }),
          )
          objetsCorrection.push(
            ...contourFigure,
            ...decoupages2,
            ...codagesSansDecoupage,
            ...codagesDecoupages2,
          )
          if (this.sup4 === 4) {
            objetsEnonce.push(
              ...contourFigure,
              ...codagesSansDecoupage,
              ...labelsSansDecoupage,
            )
          } else {
            objetsEnonce.push(
              ...contourFigure,
              ...decoupages,
              ...codagesSansDecoupage,
              ...codagesDecoupage,
              ...labelsAvecDecoupage,
            )
          }
          texte = mathalea2d(
            Object.assign(
              {
                scale: 0.7,
                pixelsParCm: 20,
                zoom: 1,
                optionsTikz: 'baseline=(current bounding box.north)',
                display: 'block',
              } as const,
              fixeBordures([M, N, S, O, P, pointAbstrait(N.x, N.y + 0.5)], {
                rxmin: -1,
                rymin: -1,
              }),
            ),
            objetsEnonce,
          )

          if (this.sup4 === 4) {
            texteCorr = mathalea2d(
              Object.assign(
                {
                  scale: 0.7,
                  pixelsParCm: 20,
                  zoom: 1,
                  optionsTikz: 'baseline=(current bounding box.north)',
                  display: 'block',
                } as const,
                fixeBordures([M, N, S, O, P, pointAbstrait(N.x, N.y + 0.5)], {
                  rxmin: -1,
                  rymin: -1,
                }),
              ),
              objetsCorrection,
            )
            texteCorr += `La figure est composée d'un rectangle et deux triangles rectangles.<br>`
          } else {
            texteCorr = `La figure est un carré de côté $${texNombre(c, 1)}$ cm auquel il faut enlever un triangle de $${texNombre(c, 1)}$ cm de base et $${texNombre(h, 1)}$ cm de hauteur.<br>`
            texteCorr +=
              this.sup4 !== 2
                ? `$\\mathcal{P}=${texNombre(c, 1)}+${texNombre(c, 1)}+${texNombre(c, 1)}+${texNombre(h1, 1)}+${texNombre(h2, 1)}=${miseEnEvidence(texNombre(3 * c + h1 + h2, 1))}${sp()}${texTexte('cm')}$<br>`
                : ''
            texteCorr +=
              this.sup4 !== 1
                ? `$\\mathcal{A}=(${texNombre(c, 1)}\\times${texNombre(c, 1)})-(${texNombre(c, 1)}\\times${texNombre(h, 1)}\\div2)=${texNombre(c * c, 2)}-${texNombre((c * h) / 2, 2)}=${miseEnEvidence(texNombre(c ** 2 - (c * h) / 2, 2))}${sp()}${texTexte('cm')}^2$<br>`
                : ''
          }
          perimetre = arrondi(3 * c + h1 + h2, 1)
          aire = arrondi(c ** 2 - (c * h) / 2, 2)
          perimetreReponses = [perimetre, perimetre]
          aireReponses = [aire, aire]
          break
        }
        case 4: {
          // 'rectangle_demi_cercle': {
          let L1 = randint(4, 8)
          let L2 = randint(3, L1 - 1)
          L1 = L1 + randint(1, 9) / 10
          // L2 = L2 + (randint(1, 9) / 10)
          L2 = L2 + randint(1, 4) / 5
          const zoom = randint(6, 8) / L2
          const A = pointAbstrait(0, 0, 'A')
          const B = pointAbstrait(0, L2 * zoom, 'B')
          const C = pointAbstrait(L1 * zoom, L2 * zoom, 'C')
          const D = pointAbstrait(L1 * zoom, 0, 'D')
          const E = pointAbstrait(L1 * zoom, L2 * zoom * 0.5, 'E')
          const R = pointSurCercle(cercle(E, (zoom * L2) / 2), -5, 'R')
          const AB = segment(A, B)
          AB.epaisseur = 2
          const BC = segment(B, C)
          BC.epaisseur = 2
          const AD = segment(A, D)
          AD.epaisseur = 2
          contourFigure.push(AB, BC, AD)
          const demicercle = arc(D, E, 180, false, 'none')
          demicercle.epaisseur = 2
          contourFigure.push(demicercle)
          codagesSansDecoupage.push(
            codageAngleDroit(A, B, C),
            codageAngleDroit(D, A, B),
            codageSegments('/', 'black', A, B),
            codageSegments('///', 'black', A, D, C, B),
            tracePoint(C, D),
          )
          codagesDecoupage.push(
            codageAngleDroit(B, C, D),
            codageAngleDroit(A, D, C),
            codageSegments('//', 'black', E, R, E, D, E, C),
          )
          const CD = segment(C, D)
          CD.pointilles = 5
          const ER = segment(E, R)
          ER.pointilles = 5
          decoupages.push(CD, ER)
          // labelsSansDecoupage.push(texteSurSeg(A, B, stringNombre(L2, 1) + ' cm'), texteSurSeg(A, D, stringNombre(L1, 1) + ' cm'))
          labelsAvecDecoupage.push(
            placeLatexSurSegment(`  ${texNombre(L2, 1)}\\text{ cm}`, A, B, {
              letterSize: 'small',
            }),
            placeLatexSurSegment(`  ${texNombre(L1, 1)}\\text{ cm}`, A, D, {
              letterSize: 'small',
            }),
            placeLatexSurSegment(`  ${texNombre(L2 / 2, 1)}\\text{ cm}`, E, R, {
              letterSize: 'small',
            }),
          )
          if (this.sup4 === 4) {
            objetsEnonce.push(...contourFigure, ...codagesSansDecoupage)
            objetsCorrection.push(
              ...contourFigure,
              ...decoupages,
              ...codagesSansDecoupage,
              ...codagesDecoupage,
            )
          } else {
            objetsEnonce.push(
              ...contourFigure,
              ...decoupages,
              ...codagesSansDecoupage,
              ...codagesDecoupage,
              ...labelsAvecDecoupage,
            )
          }
          texte = mathalea2d(
            Object.assign(
              {
                scale: 0.7,
                pixelsParCm: 20,
                zoom: 1,
                optionsTikz: 'baseline=(current bounding box.north)',
                display: 'block',
              } as const,
              fixeBordures(
                [A, B, C, D, E, demicercle, pointAbstrait(C.x, C.y + 0.2)],
                {
                  rxmin: -1.2,
                  rymin: -1.2,
                },
              ),
            ),
            objetsEnonce,
          )
          if (this.sup4 === 4) {
            texteCorr = mathalea2d(
              Object.assign(
                {
                  scale: 0.7,
                  pixelsParCm: 20,
                  zoom: 1,
                  optionsTikz: 'baseline=(current bounding box.north)',
                  display: 'block',
                } as const,
                fixeBordures(
                  [A, B, C, D, E, demicercle, pointAbstrait(C.x, C.y + 0.2)],
                  {
                    rxmin: -1,
                    rymin: -1.2,
                  },
                ),
              ),
              objetsCorrection,
            )
            texteCorr +=
              "La figure est composée d'un rectangle et d'un demi-disque."
          } else {
            texteCorr = `La figure est composée d'un rectangle de $${texNombre(L1, 1)}$ cm par $${texNombre(L2, 1)}$ cm`
            texteCorr += ` et d'un demi-disque de rayon $${texNombre(L2 / 2, 1)}$ cm.<br>`
            texteCorr +=
              this.sup4 !== 2
                ? `$\\mathcal{P}=${texNombre(L1, 1)}+${texNombre(L2, 1)}+${texNombre(L1, 1)}+(${texNombre(L2, 1)}\\times \\pi \\div 2) \\approx ${texNombre(troncature(L1 + L2 + L1 + (L2 * Math.PI) / 2, 3), 3)}${sp()}${texTexte('cm')}$<br>`
                : ''
            texteCorr +=
              this.sup4 !== 1
                ? `$\\mathcal{A}=(${texNombre(L1, 1)}\\times${texNombre(L2, 1)})+(${texNombre(L2 / 2, 1)}\\times${texNombre(L2 / 2, 1)}\\times\\pi \\div 2) \\approx ${texNombre(troncature(L1 * L2 + ((L2 / 2) * (L2 / 2) * Math.PI) / 2, 3), 3)}${sp()}${texTexte('cm')}^2$<br>`
                : ''
            texteCorr +=
              this.sup4 !== 2
                ? `Une valeur approchée ${this.sup3 === 1 ? 'au cm' : 'au dixième de cm'} est donc $\\mathcal{P}\\approx ${miseEnEvidence(texNombre(troncature(L1 + L2 + L1 + (L2 * Math.PI) / 2, this.sup3 - 1), 1))}${sp()}${texTexte('cm')}$ ou $\\mathcal{P}\\approx ${miseEnEvidence(texNombre(troncature(L1 + L2 + L1 + (L2 * Math.PI) / 2 + 10 ** (-this.sup3 + 1), this.sup3 - 1), 1))}${sp()}${texTexte('cm')}$.<br>`
                : ''
            texteCorr +=
              this.sup4 !== 1
                ? `Une valeur approchée ${this.sup3 === 1 ? 'au cm$^2$' : 'au dixième de cm$^2$'} est donc $\\mathcal{A}\\approx ${miseEnEvidence(texNombre(troncature(L1 * L2 + ((L2 / 2) * (L2 / 2) * Math.PI) / 2, this.sup3 - 1), 2))}${sp()}${texTexte('cm')}^2$ ou $\\mathcal{A}\\approx ${miseEnEvidence(texNombre(troncature(L1 * L2 + ((L2 / 2) * (L2 / 2) * Math.PI) / 2 + 10 ** (-this.sup3 + 1), this.sup3 - 1), 2))}${sp()}${texTexte('cm')}^2$.<br>`
                : ''
          }

          perimetreReponses = valeursApprochees(
            L1 + L2 + L1 + (L2 * Math.PI) / 2,
            this.sup3,
          )
          aireReponses = valeursApprochees(
            L1 * L2 + ((L2 / 2) * (L2 / 2) * Math.PI) / 2,
            this.sup3,
          )
          break
        }
        case 5: {
          // 'rectangle_cercle': {
          let L1 = randint(5, 8)
          let L2 = randint(L1 - 2, L1 - 1)
          L1 = L1 + randint(1, 9, [1, 3, 5, 7, 9]) / 10
          L2 = L2 + randint(1, 9, [1, 3, 5, 7, 9]) / 10
          const zoom = randint(6, 8) / L2
          const A = pointAbstrait(0, 0, 'A')
          const B = pointAbstrait(0, L2 * zoom, 'B')
          const C = pointAbstrait(L1 * zoom, L2 * zoom, 'C')
          const D = pointAbstrait(L1 * zoom, 0, 'D')
          const E = pointAbstrait(L1 * zoom, L2 * zoom * 0.5, 'E')
          const F = pointAbstrait(0, L2 * zoom * 0.5, 'F')
          const R = pointSurCercle(cercle(E, (zoom * L2) / 2), -5, 'R')
          const S = pointSurCercle(cercle(F, (zoom * L2) / 2), -185, 'R')
          const demicercle = arc(D, E, 180, false, 'none')
          const demicercle2 = arc(B, F, 180, false, 'none')
          demicercle.epaisseur = 2
          demicercle2.epaisseur = 2
          const BC = segment(B, C)
          BC.epaisseur = 2
          const AD = segment(A, D)
          AD.epaisseur = 2
          contourFigure.push(BC, AD, demicercle, demicercle2)
          codagesDecoupage.push(
            codageSegments('/', 'black', A, D, C, B),
            tracePoint(A, B, C, D),
            codageAngleDroit(A, B, C),
            codageAngleDroit(B, C, D),
            codageAngleDroit(D, A, B),
            codageAngleDroit(A, D, C),
            codageSegments('//', 'black', E, R, E, D, E, C, F, S, F, A, F, B),
          )
          const CD = segment(C, D)
          CD.pointilles = 5
          const AB = segment(A, B)
          AB.pointilles = 5
          const ER = segment(E, R)
          ER.pointilles = 5
          const FS = segment(F, S)
          FS.pointilles = 5
          decoupages.push(CD, AB, ER, FS)
          labelsAvecDecoupage.push(
            placeLatexSurSegment(`${texNombre(L2 / 2, 1)}\\text{ cm}`, E, R, {
              letterSize: 'small',
            }),
            placeLatexSurSegment(`${texNombre(L1, 1)}\\text{ cm}`, D, A, {
              letterSize: 'small',
            }),
          )
          if (this.sup4 === 4) {
            objetsEnonce.push(
              ...contourFigure,
              ...codagesSansDecoupage,
              ...labelsSansDecoupage,
            )
            objetsCorrection.push(
              ...contourFigure,
              ...decoupages,
              ...codagesSansDecoupage,
              ...codagesDecoupage,
            )
          } else {
            objetsEnonce.push(
              ...contourFigure,
              ...decoupages,
              ...codagesSansDecoupage,
              ...codagesDecoupage,
              ...labelsAvecDecoupage,
            )
          }
          texte = mathalea2d(
            Object.assign(
              {
                scale: 0.7,
                pixelsParCm: 20,
                zoom: 1,
                optionsTikz: 'baseline=(current bounding box.north)',
                display: 'block',
              } as const,
              fixeBordures(
                [
                  A,
                  B,
                  C,
                  D,
                  E,
                  demicercle,
                  demicercle2,
                  pointAbstrait(C.x, C.y + 0.2),
                ],
                {
                  rxmin: -1,
                  rymin: -1.2,
                },
              ),
            ),
            objetsEnonce,
          )
          if (this.sup4 === 4) {
            texteCorr = mathalea2d(
              Object.assign(
                {
                  scale: 0.7,
                  pixelsParCm: 20,
                  zoom: 1,
                  optionsTikz: 'baseline=(current bounding box.north)',
                  display: 'block',
                } as const,
                fixeBordures(
                  [
                    A,
                    B,
                    C,
                    D,
                    E,
                    demicercle,
                    demicercle2,
                    pointAbstrait(C.x, C.y + 0.2),
                  ],
                  {
                    rxmin: -1,
                    rymin: -1.2,
                  },
                ),
              ),
              objetsCorrection,
            )
            texteCorr += `La figure est composée d'un rectangle
            et de deux demi-disques.<br>`
          } else {
            texteCorr = `La figure est composée d'un rectangle de $${texNombre(L1, 1)}$ cm par $${texNombre(L2, 1)}$ cm`
            texteCorr += ` et de deux demi-disques de rayon $${texNombre(L2 / 2, 1)}$ cm.<br>`
            texteCorr +=
              this.sup4 !== 2
                ? `$\\mathcal{P}=${texNombre(L1, 1)}+${texNombre(L1, 1)}+(${texNombre(L2, 1)}\\times \\pi) \\approx ${texNombre(L1 + L1 + L2 * Math.PI, 3)}${sp()}${texTexte('cm')}$<br>`
                : ''
            texteCorr +=
              this.sup4 !== 1
                ? `$\\mathcal{A}=(${texNombre(L1, 1)}\\times${texNombre(L2, 1)})+(${texNombre(L2 / 2, 1)}\\times${texNombre(L2 / 2, 1)}\\times\\pi)\\approx ${texNombre(L1 * L2 + (L2 / 2) * (L2 / 2) * Math.PI, 3)}${sp()}${texTexte('cm')}^2$<br>`
                : ''
            texteCorr +=
              this.sup4 !== 2
                ? `Une valeur approchée ${this.sup3 === 1 ? 'au cm' : 'au dixième de cm'} est donc $\\mathcal{P}\\approx ${miseEnEvidence(texNombre(troncature(L1 + L1 + L2 * Math.PI, this.sup3 - 1), 1))}${sp()}${texTexte('cm')}$ ou $\\mathcal{P}\\approx ${miseEnEvidence(texNombre(troncature(L1 + L1 + L2 * Math.PI + 10 ** (-this.sup3 + 1), this.sup3 - 1), 1))}${sp()}${texTexte('cm')}$.<br>`
                : ''
            texteCorr +=
              this.sup4 !== 1
                ? `Une valeur approchée ${this.sup3 === 1 ? 'au cm$^2$' : 'au dixième de cm$^2$'} est donc $\\mathcal{A}\\approx ${miseEnEvidence(texNombre(troncature(L1 * L2 + (L2 / 2) * (L2 / 2) * Math.PI, this.sup3 - 1), 1))}${sp()}${texTexte('cm')}^2$ ou $\\mathcal{A}\\approx ${miseEnEvidence(texNombre(troncature(L1 * L2 + (L2 / 2) * (L2 / 2) * Math.PI + 10 ** (-this.sup3 + 1), this.sup3 - 1), 1))}${sp()}${texTexte('cm')}^2$.<br>`
                : ''
          }
          perimetreReponses = valeursApprochees(
            L1 + L1 + L2 * Math.PI,
            this.sup3,
          )
          aireReponses = valeursApprochees(
            L1 * L2 + (L2 / 2) * (L2 / 2) * Math.PI,
            this.sup3,
          )
          break
        }
        case 6: {
          // 'rectangle_triangle_demi_disque': {
          const triplet = choice(tripletsPythagoriciens)
          const adjust =
            triplet[2] > 50
              ? randint(2, 4, [3]) / 10
              : triplet[2] > 10
                ? randint(6, 8, [7]) / 10
                : randint(10, 12, [11]) / 10
          const l1 = triplet[0] * adjust
          const L2 = triplet[1] * adjust
          const hyp = triplet[2] * adjust
          const L1 =
            randint(Math.ceil(l1) + 1, Math.ceil(l1) + 4) + randint(1, 9) / 10
          const zoom = randint(14, 18) / (L1 + L2)
          const A = pointAbstrait(0, 0, 'A')
          const B = pointAbstrait(0, l1 * zoom, 'B')
          const C = pointAbstrait(L1 * zoom, l1 * zoom, 'C')
          const D = pointAbstrait((L1 + L2) * zoom, l1 * zoom, 'D')
          const E = pointAbstrait(L1 * zoom, 0, 'E')
          const F = pointAbstrait(0, l1 * zoom * 0.5, 'E')
          const R = pointSurCercle(cercle(F, (zoom * l1) / 2), 185, 'R')
          const demicercle = arc(B, F, 180, false, 'none')
          demicercle.epaisseur = 2
          const AE = segment(A, E)
          AE.epaisseur = 2
          const DE = segment(D, E)
          DE.epaisseur = 2
          const BD = segment(B, D)
          BD.epaisseur = 2
          contourFigure.push(demicercle, AE, DE, BD)
          codagesDecoupage.push(
            codageAngleDroit(A, B, C),
            codageAngleDroit(B, C, E),
            codageAngleDroit(C, E, A),
            codageAngleDroit(E, A, B),
            codageSegments('//', 'black', F, R, F, A, F, B),
            codageSegments('/', 'black', A, E, C, B),
            codageAngleDroit(D, C, E, bleuMathalea),
          )
          const FR = segment(F, R)
          FR.pointilles = 5
          const AB = segment(A, B)
          AB.pointilles = 5
          const CE = segment(C, E)
          CE.pointilles = 5
          decoupages.push(FR, AB, CE)
          labelsAvecDecoupage.push(
            placeLatexSurSegment(`${texNombre(l1 / 2, 1)}\\text{ cm}`, F, R, {
              letterSize: 'small',
            }),
            placeLatexSurSegment(`${texNombre(hyp, 1)}\\text{ cm}`, D, E, {
              letterSize: 'small',
            }),
            placeLatexSurSegment(`${texNombre(l1, 1)}\\text{ cm}`, E, C, {
              letterSize: 'small',
            }),
            placeLatexSurSegment(`${texNombre(L1, 1)}\\text{ cm}`, E, A, {
              letterSize: 'small',
            }),
            placeLatexSurSegment(`${texNombre(L2, 1)}\\text{ cm}`, C, D, {
              letterSize: 'small',
            }),
          )
          if (this.sup4 === 4) {
            objetsEnonce.push(...contourFigure, ...codagesSansDecoupage)
            objetsCorrection.push(
              ...contourFigure,
              ...decoupages,
              ...codagesSansDecoupage,
              ...codagesDecoupage,
            )
          } else {
            objetsEnonce.push(
              ...contourFigure,
              ...decoupages,
              ...codagesSansDecoupage,
              ...codagesDecoupage,
              ...labelsAvecDecoupage,
            )
          }
          texte = mathalea2d(
            Object.assign(
              {
                scale: 0.7,
                pixelsParCm: 20,
                zoom: 1,
                optionsTikz: 'baseline=(current bounding box.north)',
                display: 'block',
              } as const,
              fixeBordures(
                [demicercle, A, B, C, D, E, pointAbstrait(C.x, C.y + 0.6)],
                {
                  rxmin: -1,
                  rymin: -1.2,
                },
              ),
            ),
            objetsEnonce,
          )
          if (this.sup4 === 4) {
            texteCorr = mathalea2d(
              Object.assign(
                {
                  scale: 0.7,
                  pixelsParCm: 20,
                  zoom: 1,
                  optionsTikz: 'baseline=(current bounding box.north)',
                  display: 'block',
                } as const,
                fixeBordures(
                  [demicercle, A, B, C, D, E, pointAbstrait(C.x, C.y + 0.2)],
                  {
                    rxmin: -1,
                    rymin: -1.2,
                  },
                ),
              ),
              objetsCorrection,
            )
            texteCorr += `La figure est composée d'un rectangle, d'un triangle rectangle et d'un demi-disque.<br>`
          } else {
            texteCorr = `La figure est composée d'un rectangle de $${texNombre(L1, 1)}$ cm par $${texNombre(l1, 1)}$ cm, `
            texteCorr += `d'un triangle rectangle dont les côtés de l'angle droit mesurent respectivement $${texNombre(L2, 1)}$ cm et $${texNombre(l1, 1)}$ cm `
            texteCorr += `et d'un demi-disque de rayon $${texNombre(l1 / 2, 1)}\\text{ cm}$.<br>`
            texteCorr +=
              this.sup4 !== 2
                ? `$\\mathcal{P}=${texNombre(L1, 1)}+${texNombre(L1 + L2, 1)}+(${texNombre(l1, 1)}\\times \\pi \\div 2)+${texNombre(hyp, 1)}\\approx${texNombre(troncature(L1 + L1 + hyp + L2 + (l1 * Math.PI) / 2, 3), 3)}${sp()}${texTexte('cm')}$<br>`
                : ''
            texteCorr +=
              this.sup4 !== 1
                ? `$\\mathcal{A}=(${texNombre(L1, 1)}\\times${texNombre(l1, 1)})+(${texNombre(L2, 1)}\\times${texNombre(l1, 1)} \\div 2) + (\\pi \\times(${texNombre(l1, 1)} \\div 2)^2\\div2)\\approx${texNombre(troncature(L1 * l1 + (L2 * l1) / 2 + ((l1 / 2) * (l1 / 2) * Math.PI) / 2, 3), 2)}${sp()}${texTexte('cm')}^2$<br>`
                : ''
            texteCorr +=
              this.sup4 !== 2
                ? `Une valeur approchée ${this.sup3 === 1 ? 'au cm' : 'au dixième de cm'} est donc $\\mathcal{P}\\approx ${miseEnEvidence(texNombre(troncature(L1 + L2 + hyp + L1 + (l1 * Math.PI) / 2, this.sup3 - 1), 1))}${sp()}${texTexte('cm')}$ ou $\\mathcal{P}\\approx ${miseEnEvidence(texNombre(troncature(L1 + L2 + hyp + L1 + (l1 * Math.PI) / 2 + 10 ** (-this.sup3 + 1), this.sup3 - 1), 1))}${sp()}${texTexte('cm')}$.<br>`
                : ''
            texteCorr +=
              this.sup4 !== 1
                ? `Une valeur approchée ${this.sup3 === 1 ? 'au cm$^2$' : 'au dixième de cm$^2$'} est donc $\\mathcal{A}\\approx ${miseEnEvidence(texNombre(troncature(L1 * l1 + ((l1 / 2) * (l1 / 2) * Math.PI) / 2 + (L2 * l1) / 2, this.sup3 - 1), 2))}${sp()}${texTexte('cm')}^2$ ou $\\mathcal{A}\\approx ${miseEnEvidence(texNombre(troncature(L1 * l1 + ((l1 / 2) * (l1 / 2) * Math.PI) / 2 + (L2 * l1) / 2 + 10 ** (-this.sup3 + 1), this.sup3 - 1), 2))}${sp()}${texTexte('cm')}^2$.<br>`
                : ''
          }
          // perimetre = arrondi(L1 + L2 + hyp + L1 + l1 * Math.PI / 2, this.sup3 - 1)
          // aire = arrondi(L1 * l1 + (L2 * l1) / 2 + (l1 / 2) * (l1 / 2) * Math.PI / 2, this.sup3 - 1)
          perimetreReponses = valeursApprochees(
            L1 + L2 + hyp + L1 + (l1 * Math.PI) / 2,
            this.sup3,
          )
          aireReponses = valeursApprochees(
            L1 * l1 + (L2 * l1) / 2 + ((l1 / 2) * (l1 / 2) * Math.PI) / 2,
            this.sup3,
          )
          break
        }
        case 7:
        default: {
          // 'Rectangle + un demidisque rentrant et un autre sortant
          // 'rectangle_demi_cercle': {
          let L1 = randint(4, 8)
          let L2 = randint(3, L1 - 1)
          L1 = L1 + 2 + randint(1, 9) / 10
          // L2 = L2 + (randint(1, 9) / 10)
          L2 = L2 + randint(1, 4) / 5
          const zoom = 7 / L2
          const A = pointAbstrait(0, 0, 'A')
          const B = pointAbstrait(0, L2 * zoom, 'B')
          const BB = pointAbstrait(L2 * zoom, L2 * zoom, 'BB')
          const C = pointAbstrait(L1 * zoom, L2 * zoom, 'C')
          const D = pointAbstrait(L1 * zoom, 0, 'D')
          const E = pointAbstrait(L1 * zoom, L2 * zoom * 0.5, 'E')
          const R = pointSurCercle(cercle(E, (zoom * L2) / 2), -175, 'R')
          const F = pointAbstrait((L2 * zoom) / 2, L2 * zoom, 'F')
          const S = pointSurCercle(cercle(F, (zoom * L2) / 2), 95, 'S')
          const demicercle2 = arc(B, F, -180, false, 'none')
          const AB = segment(A, B)
          AB.epaisseur = 2
          const BBC = segment(BB, C)
          BBC.epaisseur = 2
          const AD = segment(A, D)
          AD.epaisseur = 2
          contourFigure.push(AB, BBC, AD)
          const demicercle = arc(D, E, -180, false, 'none')
          demicercle2.epaisseur = 2
          demicercle.epaisseur = 2
          contourFigure.push(demicercle, demicercle2)
          codagesSansDecoupage.push(codageAngleDroit(D, A, B))
          codagesDecoupage.push(
            codageAngleDroit(A, B, C),
            codageAngleDroit(B, C, D),
            codageAngleDroit(A, D, C),
            codageSegments('//', 'black', E, R, E, D, E, C, B, F, F, BB, F, S),
          )
          const BBB = segment(B, BB)
          BBB.pointilles = 5
          const CD = segment(C, D)
          CD.pointilles = 5
          const ER = segment(E, R)
          ER.pointilles = 5

          const FS = segment(F, S)
          FS.pointilles = 5
          decoupages.push(CD, ER, FS, BBB)
          // labelsSansDecoupage.push(texteSurSeg(A, B, stringNombre(L2, 1) + ' cm'), texteSurSeg(A, D, stringNombre(L1, 1) + ' cm'))
          labelsAvecDecoupage.push(
            placeLatexSurSegment(`${texNombre(L2, 1)}\\text{ cm}`, A, B, {
              letterSize: 'small',
            }),
            placeLatexSurSegment(`${texNombre(L1, 1)}\\text{ cm}`, D, A, {
              letterSize: 'small',
            }),
            placeLatexSurSegment(`${texNombre(L2 / 2, 1)}\\text{ cm}`, E, R, {
              letterSize: 'small',
            }),
          )
          if (this.sup4 === 4) {
            objetsEnonce.push(...contourFigure, ...codagesSansDecoupage)
            objetsCorrection.push(
              ...contourFigure,
              ...decoupages,
              ...codagesSansDecoupage,
              ...codagesDecoupage,
            )
          } else {
            objetsEnonce.push(
              ...contourFigure,
              ...decoupages,
              ...codagesSansDecoupage,
              ...codagesDecoupage,
              ...labelsAvecDecoupage,
            )
          }
          texte = mathalea2d(
            Object.assign(
              {
                scale: 0.7,
                pixelsParCm: 20,
                zoom: 1,
                optionsTikz: 'baseline=(current bounding box.north)',
                display: 'block',
              } as const,
              fixeBordures(
                [
                  A,
                  B,
                  C,
                  D,
                  E,
                  demicercle,
                  demicercle2,
                  pointAbstrait(C.x, C.y + 0.2),
                ],
                {
                  rxmin: -1.2,
                  rymin: -1.2,
                },
              ),
            ),
            objetsEnonce,
          )
          if (this.sup4 === 4) {
            texteCorr = mathalea2d(
              Object.assign(
                {
                  scale: 0.7,
                  pixelsParCm: 20,
                  zoom: 1,
                  optionsTikz: 'baseline=(current bounding box.north)',
                  display: 'block',
                } as const,
                fixeBordures(
                  [
                    A,
                    B,
                    C,
                    D,
                    E,
                    demicercle,
                    demicercle2,
                    pointAbstrait(C.x, C.y + 0.2),
                  ],
                  {
                    rxmin: -1,
                    rymin: -1.2,
                  },
                ),
              ),
              objetsCorrection,
            )
            texteCorr +=
              "La figure est composée d'un rectangle privé d'un demi-disque dans sa largeur que l'on a ajouté dans sa longueur."
          } else {
            texteCorr = `La figure est composée d'un rectangle de $${texNombre(L1, 1)}\\text{ cm}$ par $${texNombre(L2, 1)}\\text{ cm}$`
            texteCorr += ` duquel on a découpé un demi-disque de rayon $${texNombre(L2 / 2, 1)}\\text{ cm}$ dans sa largeur pour le recoller sur sa longueur.<br>`
            texteCorr +=
              this.sup4 !== 2
                ? `$\\mathcal{P}=${texNombre(L1, 1)}+${texNombre(L2, 1)}+${texNombre(L1, 1)}-${texNombre(L2, 1)}+${texNombre(L2, 1)}\\times \\pi \\approx ${texNombre(troncature(2 * L1 + L2 * Math.PI, 3), 3)}\\text{ cm}$<br>`
                : ''
            texteCorr +=
              this.sup4 !== 1
                ? `$\\mathcal{A}=${texNombre(L1, 1)}\\times${texNombre(L2, 1)} = ${texNombre(troncature(L1 * L2, 3), 3)}\\text{ cm}^2$<br>`
                : ''
            texteCorr +=
              this.sup4 !== 2
                ? `Une valeur approchée ${this.sup3 === 1 ? 'au $\\text{cm}$' : 'au dixième de $\\text{cm}$'} est donc $\\mathcal{P}\\approx ${miseEnEvidence(texNombre(troncature(2 * L1 + L2 * Math.PI, this.sup3 - 1), 1))}\\text{ cm}$ ou $\\mathcal{P}\\approx ${miseEnEvidence(texNombre(troncature(2 * L1 + L2 * Math.PI + 10 ** (-this.sup3 + 1), this.sup3 - 1), 1))}\\text{ cm}$.<br>`
                : ''
            texteCorr +=
              this.sup4 !== 1
                ? `Une valeur approchée ${this.sup3 === 1 ? 'au $\\text{cm}^2$' : 'au dixième de $\\text{cm}^2$'} est donc $\\mathcal{A}\\approx ${miseEnEvidence(texNombre(troncature(L1 * L2, this.sup3 - 1), 2))}\\text{ cm}^2$ ou $\\mathcal{A}\\approx ${miseEnEvidence(texNombre(troncature(L1 * L2 + 10 ** (-this.sup3 + 1), this.sup3 - 1), 2))}\\text{ cm}^2$.<br>`
                : ''
          }

          perimetreReponses = valeursApprochees(
            L1 + L1 + L2 * Math.PI,
            this.sup3,
          )
          aireReponses = valeursApprochees(L1 * L2, this.sup3)
          break
        }
      }
      if (this.sup4 === 1 || this.sup4 === 3 || this.sup4 === 4) {
        texte += ajouteChampTexteMathLive(
          this,
          i * (this.sup4 === 3 ? 2 : 1),
          KeyboardType.longueur,
          {
            texteAvant:
              'Périmètre ' +
              (typesDeQuestions[i] > 3
                ? `(valeur approchée au ${this.sup3 === 2 ? 'dixième de' : ''} cm près)`
                : '') +
              ' : ',
            texteApres: '<em class="ml-2">(Une unité est attendue.)</em>',
          },
        )
      }
      if (this.sup4 === 2 || this.sup4 === 3 || this.sup4 === 4) {
        texte += ajouteChampTexteMathLive(
          this,
          (this.sup4 === 3 ? 1 : 0) + i * (this.sup4 === 3 ? 2 : 1),
          KeyboardType.aire,
          {
            texteAvant:
              '<br>Aire ' +
              (typesDeQuestions[i] > 3
                ? `(valeur approchée au ${this.sup3 === 2 ? 'dixième de' : ''} cm$^2$ près)`
                : '') +
              ' : ',
            texteApres: '<em class="ml-2">(Une unité est attendue.)</em>',
          },
        )
      }
      if (context.isAmc) {
        this.autoCorrectionAMC[i] = {
          enonce: this.consigne + '\\\\' + texte,
          options: {
            multicols: true,
            barreseparation: false,
            numerotationEnonce: true,
          },
          propositions: [
            {
              type: 'AMCOpen',
              propositions: [
                {
                  enonce: 'Indiquer ci-dessous les calculs : <br>',
                  numQuestionVisible: false,
                  texte: texteCorr,
                  statut: this.sup4 !== 3 ? 3 : 6,
                  pointilles: false,
                },
              ],
            },
          ],
        }
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        if (this.sup4 === 1 || this.sup4 === 3) {
          this.autoCorrectionAMC[i].propositions!.push({
            type: 'AMCNum',
            propositions: [
              {
                texte: '',
                reponse: {
                  valeur: [Math.floor(perimetreReponses[0])],
                  texte:
                    'Périmètre en cm ' +
                    (typesDeQuestions[i] > 3
                      ? "(valeur approchée à l'unité)"
                      : '') +
                    ' : ',
                  alignement: 'center',
                  param: {
                    digits: 3,
                    decimals: typesDeQuestions[i] > 3 ? 0 : 1,
                    signe: false,
                    aussiCorrect: Math.ceil(perimetreReponses[1]),
                  },
                },
              },
            ],
          })
        }
        if (this.sup4 === 2 || this.sup4 === 3) {
          this.autoCorrectionAMC[i].propositions!.push({
            type: 'AMCNum',
            propositions: [
              {
                texte: '',
                reponse: {
                  valeur: [Math.floor(aireReponses[0])],
                  texte:
                    'Aire en $\\text{cm}^2$ ' +
                    (typesDeQuestions[i] > 3
                      ? "(valeur approchée à l'unité)"
                      : '') +
                    ' : ',
                  alignement: 'center',
                  param: {
                    digits: 3,
                    decimals: typesDeQuestions[i] > 3 ? 0 : 1,
                    signe: false,
                    aussiCorrect: Math.ceil(aireReponses[0]),
                  },
                },
              },
            ],
          })
        }
      } else {
        if (this.sup4 === 1 || this.sup4 === 3)
          handleAnswers(this, i * (this.sup4 === 3 ? 2 : 1), {
            reponse: {
              value: [
                new Grandeur(perimetreReponses[0], 'cm'),
                new Grandeur(perimetreReponses[1], 'cm'),
              ],
              options: { unite: true, precisionUnite: this.sup3 - 1 },
            },
          })
        if (this.sup4 === 2 || this.sup4 === 3)
          handleAnswers(
            this,
            (this.sup4 === 3 ? 1 : 0) + i * (this.sup4 === 3 ? 2 : 1),
            {
              reponse: {
                value: [
                  new Grandeur(aireReponses[0], 'cm^2'),
                  new Grandeur(aireReponses[1], 'cm^2'),
                ],
                options: { unite: true, precisionUnite: this.sup3 - 1 },
              },
            },
          )
      }
      if (this.questionJamaisPosee(i, perimetreReponses[0], aireReponses[0])) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
    }

    listeQuestionsToContenu(this)
  }
}
