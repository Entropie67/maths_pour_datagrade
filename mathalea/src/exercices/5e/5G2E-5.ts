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
import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { texTexte } from '../../lib/format/texTexte'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { toutAUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
} from '../../lib/outils/embellissements'
import { arrondi, troncature } from '../../lib/outils/nombres'
import { sp } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
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
export const dateDeModifImportante = '30/10/2026'
/**
 * Il faut calculer le périmètre et/ou l'aire par addition ou soustraction d'aires
 *
 * @author Rémi Angot
 * Ajout de this.sup4 et correction coquilles sur aire et puis aussi sur précision au dixième par Éric Elter le 25/07/2023
 * Ajout de la possibilité de demander un découpage au lieu de calculer des périmètres ou des aires par Guillaume Valmont le 28/10/2023
 * Modification du paramètre de choix pour mettre mélange en 0 et ajouter un cas par Jean-claude Lhote
 */
export const uuid = '6999f'

export const refs = {
  'fr-fr': ['5G2E-5', 'BP2AutoV5'],
  'fr-2016': ['6M11-2', '5M11-5', 'BP2AutoV5'],
  'fr-ch': ['9R1GM2E-3', '9R2GM2E-3', '9R3GM2E-3', '10CTGM1C-4', '10LCGM1C-4', '10LSGM1C-4', 'PRQMG01C-2'],
}

function valeursApprochees(inputValue: number, sup3: number): [number, number] {
  // Calculer la valeur approchée
  const valeurAEncadrer = arrondi(inputValue, sup3 - 1)

  // Initialiser le tableau valeurApprochee
  const valeurApprochee: [number, number] = [0, 0]

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

export type ReglagesFiguresComposees = {
  typesFigures: string
  ordreAleatoire: boolean
  /** 1 : à l'unité, 2 : au dixième */
  precision: number
  /** 1 : périmètre, 2 : aire, 3 : les deux, 4 : découpage */
  demande: number
  deuxValeurs: boolean
  /** Écrire les unités dans les calculs de la correction */
  unitesCorrection: boolean
  /** Phrases de conclusion en toutes lettres (« d'environ 58 cm »), sans signe ≈ */
  conclusionSansSymboles: boolean
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
    this.besoinFormulaire5Numerique = [
      'Options de correction',
      4,
      '1 : Sans unités dans les calculs, une valeur approchée\n2 : Avec unités dans les calculs, une valeur approchée\n3 : Sans unités dans les calculs, deux valeurs approchées\n4 : Avec unités dans les calculs, deux valeurs approchées',
    ]
    this.spacing = 2
    this.spacingCorr = 2
    this.nbQuestions = 2

    this.sup = '0'
    this.sup2 = true
    this.sup3 = 1
    this.sup4 = 3
    this.sup5 = 1
  }

  /**
   * Réglages lus dans les formulaires historiques (sup à sup5).
   * Une classe fille peut la surcharger si ses réglages sont stockés autrement.
   */
  protected lireReglages(): ReglagesFiguresComposees {
    return {
      typesFigures: this.sup,
      ordreAleatoire: this.sup2,
      precision: contraindreValeur(1, 2, this.sup3, 1),
      demande: this.sup4,
      deuxValeurs:
        this.sup5 === true || this.sup5 === 'true' || Number(this.sup5) >= 3,
      unitesCorrection: Number(this.sup5) === 2 || Number(this.sup5) === 4,
      conclusionSansSymboles: false,
    }
  }

  nouvelleVersion() {
    const {
      typesFigures,
      ordreAleatoire,
      precision,
      demande,
      deuxValeurs,
      unitesCorrection,
      conclusionSansSymboles,
    } = this.lireReglages()
    // Phrase de conclusion sans signe mathématique (valeurs approchées)
    const conclusionTexte = (
      grandeur: 'perimetre' | 'aire',
      valeurExacte: number,
    ) => {
      const unite = grandeur === 'aire' ? 'cm$^2$' : 'cm'
      const valeur = (v: number) =>
        `$${miseEnEvidence(`${texNombre(v, 2)}${sp()}${texTexte('cm')}${grandeur === 'aire' ? '^2' : ''}`)}$`
      const precisionTexte = precision === 1 ? unite : `dixième de ${unite}`
      if (deuxValeurs) {
        const [valeurMin, valeurMax] = valeursApprochees(
          valeurExacte,
          precision,
        )
        return `Une valeur approchée au ${precisionTexte} est donc de ${valeur(valeurMin)} ou de ${valeur(valeurMax)}.<br>`
      }
      const valeurArrondie = arrondi(valeurExacte, precision - 1)
      return grandeur === 'aire'
        ? `L'aire de la figure, arrondie au ${precisionTexte} près, est donc d'environ ${valeur(valeurArrondie)}.<br>`
        : `Le périmètre de la figure, arrondi au ${precisionTexte} près, est donc d'environ ${valeur(valeurArrondie)}.<br>`
    }
    const singulierPluriel =
      this.nbQuestions === 1 ? 'la figure suivante' : 'les figures suivantes'
    const singulierPluriel2 =
      this.nbQuestions === 1 ? 'de la figure suivante' : 'des figures suivantes'
    switch (demande) {
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
      shuffle: ordreAleatoire,
      saisie: typesFigures,
    }).map(Number)

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      let perimetreReponses: [number, number] = [0, 0]
      let aireReponses: [number, number] = [0, 0]
      let texte, texteCorr, perimetre, aire
      if (demande === 4) {
        this.nbCols = 2
        this.nbColsCorr = 2
      }
      const questions: string[] = []
      const reponses: [number, number][] = []

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
          if (demande === 4) {
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

          if (demande === 4) {
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
            texteCorr += `On peut découper cette figure en un rectangle de $${texNombre(L1, 1)}\\text{ cm}$ par $${texNombre(l1, 1)}\\text{ cm}$
            et un triangle rectangle dont les côtés de l'angle droit mesurent respectivement $${texNombre(L2, 1)}\\text{ cm}$
            et $${texNombre(l1, 1)}\\text{ cm}$.<br>`
          } else {
            texteCorr = `La figure est composée d'un rectangle de $${texNombre(L1, 1)}\\text{ cm}$ par $${texNombre(l1, 1)}\\text{ cm}$`
            texteCorr += ` et d'un triangle rectangle dont les côtés de l'angle droit mesurent respectivement $${texNombre(L2, 1)}\\text{ cm}$ et $${texNombre(l1, 1)}\\text{ cm}$.<br>`
            texteCorr +=
              demande !== 2
                ? `$\\mathcal{P}=${texNombre(L1 + L2, 1)}${unitesCorrection ? '\\text{ cm}' : ''}+${texNombre(hyp, 1)}${unitesCorrection ? '\\text{ cm}' : ''}+${texNombre(L1, 1)}${unitesCorrection ? '\\text{ cm}' : ''}+${texNombre(l1, 1)}${unitesCorrection ? '\\text{ cm}' : ''}=${unitesCorrection ? miseEnEvidence(`${texNombre(L1 + L2 + hyp + L1 + l1, 1)}${sp()}${texTexte('cm')}`) : texNombre(L1 + L2 + hyp + L1 + l1, 1)}$<br>${unitesCorrection ? '' : `Le périmètre est $${miseEnEvidence(`${texNombre(L1 + L2 + hyp + L1 + l1, 1)}\\text{ cm}`)}$.<br>`}`
                : ''
            texteCorr +=
              demande !== 1
                ? `$\\mathcal{A}=(${texNombre(L1, 1)}${unitesCorrection ? '\\text{ cm}' : ''}\\times${texNombre(l1, 1)}${unitesCorrection ? '\\text{ cm}' : ''})+(${texNombre(L2, 1)}${unitesCorrection ? '\\text{ cm}' : ''}\\times${texNombre(l1, 1)}${unitesCorrection ? '\\text{ cm}' : ''}\\div2)=${texNombre(L1 * l1, 2)}${unitesCorrection ? '\\text{ cm}^2' : ''}+${texNombre((L2 * l1) / 2, 2)}${unitesCorrection ? '\\text{ cm}^2' : ''}=${unitesCorrection ? miseEnEvidence(`${texNombre(L1 * l1 + (L2 * l1) / 2, 2)}${sp()}${texTexte('cm')}^2`) : texNombre(L1 * l1 + (L2 * l1) / 2, 2)}$<br>${unitesCorrection ? '' : `L'aire est $${miseEnEvidence(`${texNombre(L1 * l1 + (L2 * l1) / 2, 2)}\\text{ cm}^2`)}$.<br>`}`
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
          if (demande === 4) {
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

          if (demande === 4) {
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
            texteCorr = `La figure est un carré de côté $${texNombre(c, 1)}\\text{ cm}$ auquel il faut enlever un triangle rectangle dont les côtés de l'angle droit mesurent respectivement $${texNombre(c1, 1)}\\text{ cm}$ et $${texNombre(c2, 1)}\\text{ cm}$.<br>`
            texteCorr +=
              demande !== 2
                ? `$\\mathcal{P}=${texNombre(c, 1)}${unitesCorrection ? '\\text{ cm}' : ''}+${texNombre(c, 1)}${unitesCorrection ? '\\text{ cm}' : ''}+${texNombre(c, 1)}${unitesCorrection ? '\\text{ cm}' : ''}+${texNombre(c1, 1)}${unitesCorrection ? '\\text{ cm}' : ''}+${texNombre(c2, 1)}${unitesCorrection ? '\\text{ cm}' : ''}=${unitesCorrection ? miseEnEvidence(`${texNombre(3 * c + c1 + c2, 1)}${sp()}${texTexte('cm')}`) : texNombre(3 * c + c1 + c2, 1)}$<br>${unitesCorrection ? '' : `Le périmètre est $${miseEnEvidence(`${texNombre(3 * c + c1 + c2, 1)}\\text{ cm}`)}$.<br>`}`
                : ''
            texteCorr +=
              demande !== 1
                ? `$\\mathcal{A}=(${texNombre(c, 1)}${unitesCorrection ? '\\text{ cm}' : ''}\\times${texNombre(c, 1)}${unitesCorrection ? '\\text{ cm}' : ''})-(${texNombre(c1, 1)}${unitesCorrection ? '\\text{ cm}' : ''}\\times${texNombre(c2, 1)}${unitesCorrection ? '\\text{ cm}' : ''}\\div2)=${unitesCorrection ? miseEnEvidence(`${texNombre(c ** 2 - (c1 * c2) / 2, 2)}${sp()}${texTexte('cm')}^2`) : texNombre(c ** 2 - (c1 * c2) / 2, 2)}$<br>${unitesCorrection ? '' : `L'aire est $${miseEnEvidence(`${texNombre(c ** 2 - (c1 * c2) / 2, 2)}\\text{ cm}^2`)}$.<br>`}`
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
            placeLatexSurSegment(` ${texNombre(h1, 1)}\\text{ cm}`, S, N, {
              letterSize: 'small',
            }),
            placeLatexSurSegment(` ${texNombre(h2, 1)}\\text{ cm}`, O, S, {
              letterSize: 'small',
            }),
            placeLatexSurSegment(` ${texNombre(com1, 1)}\\text{ cm}`, H, S, {
              letterSize: 'small',
            }),
          )
          objetsCorrection.push(
            ...contourFigure,
            ...decoupages2,
            ...codagesSansDecoupage,
            ...codagesDecoupages2,
          )
          if (demande === 4) {
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

          if (demande === 4) {
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
            texteCorr = `La figure est un carré de côté $${texNombre(c, 1)}\\text{ cm}$ auquel il faut enlever un triangle de $${texNombre(c, 1)}\\text{ cm}$ de base et $${texNombre(h, 1)}\\text{ cm}$ de hauteur.<br>`
            texteCorr +=
              demande !== 2
                ? `$\\mathcal{P}=${texNombre(c, 1)}${unitesCorrection ? '\\text{ cm}' : ''}+${texNombre(c, 1)}${unitesCorrection ? '\\text{ cm}' : ''}+${texNombre(c, 1)}${unitesCorrection ? '\\text{ cm}' : ''}+${texNombre(h1, 1)}${unitesCorrection ? '\\text{ cm}' : ''}+${texNombre(h2, 1)}${unitesCorrection ? '\\text{ cm}' : ''}=${unitesCorrection ? miseEnEvidence(`${texNombre(3 * c + h1 + h2, 1)}${sp()}${texTexte('cm')}`) : texNombre(3 * c + h1 + h2, 1)}$<br>${unitesCorrection ? '' : `Le périmètre est $${miseEnEvidence(`${texNombre(3 * c + h1 + h2, 1)}\\text{ cm}`)}$.<br>`}`
                : ''
            texteCorr +=
              demande !== 1
                ? `$\\mathcal{A}=(${texNombre(c, 1)}${unitesCorrection ? '\\text{ cm}' : ''}\\times${texNombre(c, 1)}${unitesCorrection ? '\\text{ cm}' : ''})-(${texNombre(c, 1)}${unitesCorrection ? '\\text{ cm}' : ''}\\times${texNombre(h, 1)}${unitesCorrection ? '\\text{ cm}' : ''}\\div2)=${texNombre(c * c, 2)}${unitesCorrection ? '\\text{ cm}^2' : ''}-${texNombre((c * h) / 2, 2)}${unitesCorrection ? '\\text{ cm}^2' : ''}=${unitesCorrection ? miseEnEvidence(`${texNombre(c ** 2 - (c * h) / 2, 2)}${sp()}${texTexte('cm')}^2`) : texNombre(c ** 2 - (c * h) / 2, 2)}$<br>${unitesCorrection ? '' : `L'aire est $${miseEnEvidence(`${texNombre(c ** 2 - (c * h) / 2, 2)}\\text{ cm}^2`)}$.<br>`}`
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
          const perimetreValue = L1 + L2 + L1 + (L2 * Math.PI) / 2
          const aireValue = L1 * L2 + ((L2 / 2) * (L2 / 2) * Math.PI) / 2
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
          if (demande === 4) {
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
          if (demande === 4) {
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
            const perimetreValMin = arrondi(perimetreValue, precision - 1)
            const perimetreValMax = troncature(
              perimetreValue + 10 ** (-precision + 1),
              precision - 1,
            )
            const aireValMin = arrondi(aireValue, precision - 1)
            const aireValMax = troncature(
              aireValue + 10 ** (-precision + 1),
              precision - 1,
            )

            texteCorr = `La figure est composée d'un rectangle de $${texNombre(L1, 1)}\\text{ cm}$ par $${texNombre(L2, 1)}\\text{ cm}$`
            texteCorr += ` et d'un demi-disque de rayon $${texNombre(L2 / 2, 1)}\\text{ cm}$.<br>`
            texteCorr +=
              demande !== 2
                ? `$\\mathcal{P}=${texNombre(L1, 1)}${unitesCorrection ? '\\text{ cm}' : ''}+${texNombre(L2, 1)}${unitesCorrection ? '\\text{ cm}' : ''}+${texNombre(L1, 1)}${unitesCorrection ? '\\text{ cm}' : ''}+(${texNombre(L2, 1)}${unitesCorrection ? '\\text{ cm}' : ''}\\times \\pi \\div 2) \\approx ${texNombre(troncature(perimetreValue, 3), 3)}${unitesCorrection ? `${sp()}${texTexte('cm')}` : ''}$<br>${unitesCorrection ? '' : `Le périmètre est d'environ $${texNombre(troncature(perimetreValue, 3), 3)}\\text{ cm}$.<br>`}`
                : ''
            texteCorr +=
              demande !== 1
                ? `$\\mathcal{A}=(${texNombre(L1, 1)}${unitesCorrection ? '\\text{ cm}' : ''}\\times${texNombre(L2, 1)}${unitesCorrection ? '\\text{ cm}' : ''})+(${texNombre(L2 / 2, 1)}${unitesCorrection ? '\\text{ cm}' : ''}\\times${texNombre(L2 / 2, 1)}${unitesCorrection ? '\\text{ cm}' : ''}\\times\\pi \\div 2) \\approx ${texNombre(troncature(aireValue, 3), 3)}${unitesCorrection ? `${sp()}${texTexte('cm')}^2` : ''}$<br>${unitesCorrection ? '' : `L'aire est d'environ $${texNombre(troncature(aireValue, 3), 3)}\\text{ cm}^2$.<br>`}`
                : ''
            texteCorr +=
              demande !== 2
                ? conclusionSansSymboles
                  ? conclusionTexte('perimetre', perimetreValue)
                  : deuxValeurs
                    ? `Une valeur approchée ${precision === 1 ? 'au cm' : 'au dixième de cm'} est donc $\\mathcal{P}\\approx ${miseEnEvidence(`${texNombre(perimetreValMin, 1)}${sp()}${texTexte('cm')}`)}$ ou $\\mathcal{P}\\approx ${miseEnEvidence(`${texNombre(perimetreValMax, 1)}${sp()}${texTexte('cm')}`)}$.<br>`
                    : `Le périmètre de la figure, arrondi au ${precision === 1 ? 'cm' : 'dixième de cm'} près, est donc $\\mathcal{P}\\approx ${miseEnEvidence(`${texNombre(perimetreValMin, 1)}${sp()}${texTexte('cm')}`)}$.<br>`
                : ''
            texteCorr +=
              demande !== 1
                ? conclusionSansSymboles
                  ? conclusionTexte('aire', aireValue)
                  : deuxValeurs
                    ? `Une valeur approchée ${precision === 1 ? 'au cm$^2$' : 'au dixième de cm$^2$'} est donc $\\mathcal{A}\\approx ${miseEnEvidence(`${texNombre(aireValMin, 2)}${sp()}${texTexte('cm')}^2`)}$ ou $\\mathcal{A}\\approx ${miseEnEvidence(`${texNombre(aireValMax, 2)}${sp()}${texTexte('cm')}^2`)}$.<br>`
                    : `L'aire de la figure, arrondie au ${precision === 1 ? 'cm$^2$' : 'dixième de cm$^2$'} près, est donc $\\mathcal{A}\\approx ${miseEnEvidence(`${texNombre(aireValMin, 2)}${sp()}${texTexte('cm')}^2`)}$.<br>`
                : ''
          }

          const perimetreValuesApp = valeursApprochees(
            perimetreValue,
            precision,
          )
          const aireValuesApp = valeursApprochees(aireValue, precision)
          perimetreReponses = deuxValeurs
            ? perimetreValuesApp
            : [
                arrondi(perimetreValue, precision - 1),
                arrondi(perimetreValue, precision - 1),
              ]
          aireReponses = deuxValeurs
            ? aireValuesApp
            : [
                arrondi(aireValue, precision - 1),
                arrondi(aireValue, precision - 1),
              ]
          break
        }
        case 5: {
          // 'rectangle_cercle': {
          let L1 = randint(5, 8)
          let L2 = randint(L1 - 2, L1 - 1)
          L1 = L1 + randint(1, 9, [1, 3, 5, 7, 9]) / 10
          L2 = L2 + randint(1, 9, [1, 3, 5, 7, 9]) / 10
          const perimetreValue = L1 + L1 + L2 * Math.PI
          const aireValue = L1 * L2 + (L2 / 2) * (L2 / 2) * Math.PI
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
          if (demande === 4) {
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
          if (demande === 4) {
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
            const perimetreValMin = arrondi(perimetreValue, precision - 1)
            const perimetreValMax = troncature(
              perimetreValue + 10 ** (-precision + 1),
              precision - 1,
            )
            const aireValMin = arrondi(aireValue, precision - 1)
            const aireValMax = troncature(
              aireValue + 10 ** (-precision + 1),
              precision - 1,
            )

            texteCorr = `La figure est composée d'un rectangle de $${texNombre(L1, 1)}\\text{ cm}$ par $${texNombre(L2, 1)}\\text{ cm}$`
            texteCorr += ` et de deux demi-disques de rayon $${texNombre(L2 / 2, 1)}\\text{ cm}$.<br>`
            texteCorr +=
              demande !== 2
                ? `$\\mathcal{P}=${texNombre(L1, 1)}${unitesCorrection ? '\\text{ cm}' : ''}+${texNombre(L1, 1)}${unitesCorrection ? '\\text{ cm}' : ''}+(${texNombre(L2, 1)}${unitesCorrection ? '\\text{ cm}' : ''}\\times \\pi) \\approx ${texNombre(troncature(perimetreValue, 3), 3)}${unitesCorrection ? `${sp()}${texTexte('cm')}` : ''}$<br>${unitesCorrection ? '' : `Le périmètre est d'environ $${texNombre(troncature(perimetreValue, 3), 3)}\\text{ cm}$.<br>`}`
                : ''
            texteCorr +=
              demande !== 1
                ? `$\\mathcal{A}=(${texNombre(L1, 1)}${unitesCorrection ? '\\text{ cm}' : ''}\\times${texNombre(L2, 1)}${unitesCorrection ? '\\text{ cm}' : ''})+(${texNombre(L2 / 2, 1)}${unitesCorrection ? '\\text{ cm}' : ''}\\times${texNombre(L2 / 2, 1)}${unitesCorrection ? '\\text{ cm}' : ''}\\times\\pi)\\approx ${texNombre(troncature(aireValue, 3), 3)}${unitesCorrection ? `${sp()}${texTexte('cm')}^2` : ''}$<br>${unitesCorrection ? '' : `L'aire est d'environ $${texNombre(troncature(aireValue, 3), 3)}\\text{ cm}^2$.<br>`}`
                : ''
            texteCorr +=
              demande !== 2
                ? conclusionSansSymboles
                  ? conclusionTexte('perimetre', perimetreValue)
                  : deuxValeurs
                    ? `Une valeur approchée ${precision === 1 ? 'au cm' : 'au dixième de cm'} est donc $\\mathcal{P}\\approx ${miseEnEvidence(`${texNombre(perimetreValMin, 1)}${sp()}${texTexte('cm')}`)}$ ou $\\mathcal{P}\\approx ${miseEnEvidence(`${texNombre(perimetreValMax, 1)}${sp()}${texTexte('cm')}`)}$.<br>`
                    : `Le périmètre de la figure, arrondi au ${precision === 1 ? 'cm' : 'dixième de cm'} près, est donc $\\mathcal{P}\\approx ${miseEnEvidence(`${texNombre(perimetreValMin, 1)}${sp()}${texTexte('cm')}`)}$.<br>`
                : ''
            texteCorr +=
              demande !== 1
                ? conclusionSansSymboles
                  ? conclusionTexte('aire', aireValue)
                  : deuxValeurs
                    ? `Une valeur approchée ${precision === 1 ? 'au cm$^2$' : 'au dixième de cm$^2$'} est donc $\\mathcal{A}\\approx ${miseEnEvidence(`${texNombre(aireValMin, 1)}${sp()}${texTexte('cm')}^2`)}$ ou $\\mathcal{A}\\approx ${miseEnEvidence(`${texNombre(aireValMax, 1)}${sp()}${texTexte('cm')}^2`)}$.<br>`
                    : `La valeur approchée ${precision === 1 ? 'au cm$^2$' : 'au dixième de cm$^2$'} est donc $\\mathcal{A}\\approx ${miseEnEvidence(`${texNombre(aireValMin, 1)}${sp()}${texTexte('cm')}^2`)}$.<br>`
                : ''
          }
          const perimetreValuesApp = valeursApprochees(
            perimetreValue,
            precision,
          )
          const aireValuesApp = valeursApprochees(aireValue, precision)
          perimetreReponses = deuxValeurs
            ? perimetreValuesApp
            : [
                arrondi(perimetreValue, precision - 1),
                arrondi(perimetreValue, precision - 1),
              ]
          aireReponses = deuxValeurs
            ? aireValuesApp
            : [
                arrondi(aireValue, precision - 1),
                arrondi(aireValue, precision - 1),
              ]
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
          const perimetreValue = L1 + L2 + hyp + L1 + (l1 * Math.PI) / 2
          const aireValue =
            L1 * l1 + (L2 * l1) / 2 + ((l1 / 2) * (l1 / 2) * Math.PI) / 2
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
          if (demande === 4) {
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
          if (demande === 4) {
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
            const perimetreValMin = arrondi(perimetreValue, precision - 1)
            const perimetreValMax = troncature(
              perimetreValue + 10 ** (-precision + 1),
              precision - 1,
            )
            const aireValMin = arrondi(aireValue, precision - 1)
            const aireValMax = troncature(
              aireValue + 10 ** (-precision + 1),
              precision - 1,
            )

            texteCorr = `La figure est composée d'un rectangle de $${texNombre(L1, 1)}\\text{ cm}$ par $${texNombre(l1, 1)}\\text{ cm}$, `
            texteCorr += `d'un triangle rectangle dont les côtés de l'angle droit mesurent respectivement $${texNombre(L2, 1)}\\text{ cm}$ et $${texNombre(l1, 1)}\\text{ cm}$ `
            texteCorr += `et d'un demi-disque de rayon $${texNombre(l1 / 2, 1)}\\text{ cm}$.<br>`
            texteCorr +=
              demande !== 2
                ? `$\\mathcal{P}=${texNombre(L1, 1)}${unitesCorrection ? '\\text{ cm}' : ''}+${texNombre(L1 + L2, 1)}${unitesCorrection ? '\\text{ cm}' : ''}+(${texNombre(l1, 1)}${unitesCorrection ? '\\text{ cm}' : ''}\\times \\pi \\div 2)+${texNombre(hyp, 1)}${unitesCorrection ? '\\text{ cm}' : ''}\\approx${texNombre(troncature(perimetreValue, 3), 3)}${unitesCorrection ? `${sp()}${texTexte('cm')}` : ''}$<br>${unitesCorrection ? '' : `Le périmètre est d'environ $${texNombre(troncature(perimetreValue, 3), 3)}\\text{ cm}$.<br>`}`
                : ''
            texteCorr +=
              demande !== 1
                ? `$\\mathcal{A}=(${texNombre(L1, 1)}${unitesCorrection ? '\\text{ cm}' : ''}\\times${texNombre(l1, 1)}${unitesCorrection ? '\\text{ cm}' : ''})+(${texNombre(L2, 1)}${unitesCorrection ? '\\text{ cm}' : ''}\\times${texNombre(l1, 1)}${unitesCorrection ? '\\text{ cm}' : ''} \\div 2) + (\\pi \\times(${texNombre(l1, 1)}${unitesCorrection ? '\\text{ cm}' : ''} \\div 2)^2\\div2)\\approx${texNombre(troncature(aireValue, 3), 2)}${unitesCorrection ? `${sp()}${texTexte('cm')}^2` : ''}$<br>${unitesCorrection ? '' : `L'aire est d'environ $${texNombre(troncature(aireValue, 3), 2)}\\text{ cm}^2$.<br>`}`
                : ''
            texteCorr +=
              demande !== 2
                ? conclusionSansSymboles
                  ? conclusionTexte('perimetre', perimetreValue)
                  : deuxValeurs
                    ? `Une valeur approchée ${precision === 1 ? 'au cm' : 'au dixième de cm'} est donc $\\mathcal{P}\\approx ${miseEnEvidence(`${texNombre(perimetreValMin, 1)}${sp()}${texTexte('cm')}`)}$ ou $\\mathcal{P}\\approx ${miseEnEvidence(`${texNombre(perimetreValMax, 1)}${sp()}${texTexte('cm')}`)}$.<br>`
                    : `Le périmètre de la figure, arrondi au ${precision === 1 ? 'cm' : 'dixième de cm'} près, est donc $\\mathcal{P}\\approx ${miseEnEvidence(`${texNombre(perimetreValMin, 1)}${sp()}${texTexte('cm')}`)}$.<br>`
                : ''
            texteCorr +=
              demande !== 1
                ? conclusionSansSymboles
                  ? conclusionTexte('aire', aireValue)
                  : deuxValeurs
                    ? `Une valeur approchée ${precision === 1 ? 'au cm$^2$' : 'au dixième de cm$^2$'} est donc $\\mathcal{A}\\approx ${miseEnEvidence(`${texNombre(aireValMin, 2)}${sp()}${texTexte('cm')}^2`)}$ ou $\\mathcal{A}\\approx ${miseEnEvidence(`${texNombre(aireValMax, 2)}${sp()}${texTexte('cm')}^2`)}$.<br>`
                    : `L'aire de la figure, arrondie au ${precision === 1 ? 'cm$^2$' : 'dixième de cm$^2$'} près, est donc $\\mathcal{A}\\approx ${miseEnEvidence(`${texNombre(aireValMin, 2)}${sp()}${texTexte('cm')}^2`)}$.<br>`
                : ''
          }
          const perimetreValuesApp = valeursApprochees(
            perimetreValue,
            precision,
          )
          const aireValuesApp = valeursApprochees(aireValue, precision)
          perimetreReponses = deuxValeurs
            ? perimetreValuesApp
            : [
                arrondi(perimetreValue, precision - 1),
                arrondi(perimetreValue, precision - 1),
              ]
          aireReponses = deuxValeurs
            ? aireValuesApp
            : [
                arrondi(aireValue, precision - 1),
                arrondi(aireValue, precision - 1),
              ]
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
          const perimetreValue = L1 + L1 + L2 * Math.PI
          const aireValue = L1 * L2
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
          if (demande === 4) {
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
          if (demande === 4) {
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
            const perimetreValMin = arrondi(perimetreValue, precision - 1)
            const perimetreValMax = troncature(
              perimetreValue + 10 ** (-precision + 1),
              precision - 1,
            )
            const aireValMin = arrondi(aireValue, precision - 1)
            const aireValMax = troncature(
              aireValue + 10 ** (-precision + 1),
              precision - 1,
            )

            texteCorr = `La figure est composée d'un rectangle de $${texNombre(L1, 1)}\\text{ cm}$ par $${texNombre(L2, 1)}\\text{ cm}$`
            texteCorr += ` duquel on a découpé un demi-disque de rayon $${texNombre(L2 / 2, 1)}\\text{ cm}$ dans sa largeur pour le recoller sur sa longueur.<br>`
            texteCorr +=
              demande !== 2
                ? `$\\mathcal{P}=${texNombre(L1, 1)}${unitesCorrection ? '\\text{ cm}' : ''}+${texNombre(L2, 1)}${unitesCorrection ? '\\text{ cm}' : ''}+${texNombre(L1, 1)}${unitesCorrection ? '\\text{ cm}' : ''}-${texNombre(L2, 1)}${unitesCorrection ? '\\text{ cm}' : ''}+${texNombre(L2, 1)}${unitesCorrection ? '\\text{ cm}' : ''}\\times \\pi \\approx ${texNombre(troncature(perimetreValue, 3), 3)}${unitesCorrection ? `\\text{ cm}` : ''}$<br>${unitesCorrection ? '' : `Le périmètre est d'environ $${texNombre(troncature(perimetreValue, 3), 3)}\\text{ cm}$.<br>`}`
                : ''
            texteCorr +=
              demande !== 1
                ? `$\\mathcal{A}=${texNombre(L1, 1)}${unitesCorrection ? '\\text{ cm}' : ''}\\times${texNombre(L2, 1)}${unitesCorrection ? '\\text{ cm}' : ''} = ${texNombre(troncature(aireValue, 3), 3)}${unitesCorrection ? `\\text{ cm}^2` : ''}$<br>${unitesCorrection ? '' : `L'aire est $${texNombre(troncature(aireValue, 3), 3)}\\text{ cm}^2$.<br>`}`
                : ''
            texteCorr +=
              demande !== 2
                ? conclusionSansSymboles
                  ? conclusionTexte('perimetre', perimetreValue)
                  : deuxValeurs
                    ? `Une valeur approchée ${precision === 1 ? 'au $\\text{cm}$' : 'au dixième de $\\text{cm}$'} est donc $\\mathcal{P}\\approx ${miseEnEvidence(`${texNombre(perimetreValMin, 1)}\\text{ cm}`)}$ ou $\\mathcal{P}\\approx ${miseEnEvidence(`${texNombre(perimetreValMax, 1)}\\text{ cm}`)}$.<br>`
                    : `La valeur approchée ${precision === 1 ? 'au $\\text{cm}$' : 'au dixième de $\\text{cm}$'} est donc $\\mathcal{P}\\approx ${miseEnEvidence(`${texNombre(perimetreValMin, 1)}\\text{ cm}`)}$.<br>`
                : ''
            texteCorr +=
              demande !== 1
                ? conclusionSansSymboles
                  ? conclusionTexte('aire', aireValue)
                  : deuxValeurs
                    ? `Une valeur approchée ${precision === 1 ? 'au $\\text{cm}^2$' : 'au dixième de $\\text{cm}^2$'} est donc $\\mathcal{A}\\approx ${miseEnEvidence(`${texNombre(aireValMin, 2)}\\text{ cm}^2`)}$ ou $\\mathcal{A}\\approx ${miseEnEvidence(`${texNombre(aireValMax, 2)}\\text{ cm}^2`)}$.<br>`
                    : `La valeur approchée ${precision === 1 ? 'au $\\text{cm}^2$' : 'au dixième de $\\text{cm}^2$'} est donc $\\mathcal{A}\\approx ${miseEnEvidence(`${texNombre(aireValMin, 2)}\\text{ cm}^2`)}$.<br>`
                : ''
          }

          const perimetreValuesApp = valeursApprochees(
            perimetreValue,
            precision,
          )
          const aireValuesApp = valeursApprochees(aireValue, precision)
          perimetreReponses = deuxValeurs
            ? perimetreValuesApp
            : [
                arrondi(perimetreValue, precision - 1),
                arrondi(perimetreValue, precision - 1),
              ]
          aireReponses = deuxValeurs
            ? aireValuesApp
            : [
                arrondi(aireValue, precision - 1),
                arrondi(aireValue, precision - 1),
              ]
          break
        }
      }
      if (demande === 1 || demande === 3) {
        questions.push(
          `Périmètre ${
            typesDeQuestions[i] > 3
              ? `(valeur approchée au ${precision === 2 ? 'dixième de' : ''} cm près)`
              : ''
          } : `,
        )
        reponses.push(perimetreReponses)
      }
      if (demande === 2 || demande === 3) {
        questions.push(
          `Aire ${
            typesDeQuestions[i] > 3
              ? `(valeur approchée au ${precision === 2 ? 'dixième de' : ''} cm$^2$ près)`
              : ''
          } : `,
        )
        reponses.push(aireReponses)
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
                  statut: demande !== 3 ? 3 : 6,
                  pointilles: false,
                },
              ],
            },
          ],
        }
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        if (demande === 1 || demande === 3) {
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
        if (demande === 2 || demande === 3) {
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
      }

      if (this.questionJamaisPosee(i, perimetreReponses[0], aireReponses[0])) {
        if (demande !== 4) {
          const dataTemplate = questions
            .map((question, index) => `${question} %{champ${index + 1}}`)
            .join('\n')
          const dataOptions = Object.fromEntries(
            questions.map((_, index) => [
              `champ${index + 1}`,
              {
                keyboard: questions[index].includes('Périmètre')
                  ? KeyboardType.longueur
                  : KeyboardType.aire,
                ldots: true,
                texteApres:
                  '<em style="margin-left: 0.5rem;">(Une unité est attendue.)</em>',
              },
            ]),
          )
          texte += addMultiMathfield(this, i, {
            dataOptions,
            dataTemplate,
          })
        }

        if (!context.isAmc && demande !== 4) {
          handleAnswers(
            this,
            i,
            {
              bareme: toutAUnPoint,
              ...Object.fromEntries(
                questions.map((_, index) => [
                  `champ${index + 1}`,
                  {
                    value: reponses[index].map(
                      (v) =>
                        new Grandeur(
                          v,
                          questions[index].includes('Périmètre')
                            ? 'cm'
                            : 'cm^2',
                        ),
                    ),
                    options: { unite: true },
                  },
                ]),
              ),
            },
            { formatInteractif: 'multi-mathfield' },
          )
        }
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
    }

    listeQuestionsToContenu(this)
  }
}
