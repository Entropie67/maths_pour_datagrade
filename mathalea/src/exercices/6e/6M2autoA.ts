import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { arc } from '../../lib/2d/Arc'
import { codageSegment } from '../../lib/2d/CodageSegment'
import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { droite, droiteParPointEtPente } from '../../lib/2d/droites'
import type { ISegment } from '../../lib/2d/Interfaces'
import type { PointAbstrait } from '../../lib/2d/PointAbstrait'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { segment } from '../../lib/2d/segmentsVecteurs'
import {
  homothetie,
  projectionOrtho,
  rotation,
  translation,
} from '../../lib/2d/transformations'
import {
  estDansQuadrilatere,
  estDansTriangle,
  longueur,
} from '../../lib/2d/utilitairesGeometriques'
import {
  milieu,
  pointIntersectionDD,
  pointSurSegment,
} from '../../lib/2d/utilitairesPoint'
import { vecteur } from '../../lib/2d/Vecteur'
import { bleuMathalea, orangeMathalea } from '../../lib/colors'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { arrondi } from '../../lib/outils/nombres'
import { numAlpha } from '../../lib/outils/outilString'
import { translationPuisRotationAnimees } from '../../modules/2dAnimation'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'

export const dateDePublication = '08/06/2022'
export const dateDeModifImportante = '22/01/2025'
export const titre = 'Comparer périmètres et/ou aires de figures'
export const interactifReady = true

/**
 * Comparer aires et/ou périmètres de figures avec ceux d'un rectangle référence
 * @author Éric Elter
 */
export const uuid = '95313'

export const refs = {
  'fr-fr': ['6M2autoA', '6AutoA1'],
  'fr-2016': ['6M21'],
  'fr-ch': ['9R1GM2A-3', '9R2GM2A-3', '9R3GM2A-3'],
}

/** Retourne un nombre décimal entre a et b, sans être trop près de a et de b
 * @param {number} a borne inférieure
 * @param {number} b borne supérieure
 * @author Éric Elter
 * @returns {number}
 */
function entreDeux(a: number, b: number) {
  if (a < b) return arrondi(a + ((b - a) * randint(10, 90)) / 100, 2)
  else return arrondi(b + ((a - b) * randint(10, 90)) / 100, 2)
}

/**
 * Retourne la correction de la comparaison des périmètres
 * @param {boolean} coloriePlusGrand true si le périmètre de la figure coloriée est plus grand que celui du rectangle hachuré
 * @param {string} comparePerimetre 'grand' ou 'petit', selon la question posée
 * @returns {string}
 */
function correctionPerimetre(
  coloriePlusGrand: boolean,
  comparePerimetre: string,
) {
  const explication = `Il faut parcourir ${coloriePlusGrand ? 'plus' : 'moins'} de chemin pour effectuer le tour de la figure coloriée que le tour du rectangle hachuré.`
  const reponseEstColoriee = coloriePlusGrand === (comparePerimetre === 'grand')
  const reponse = reponseEstColoriee
    ? `${texteEnCouleurEtGras('La figure coloriée')} a un périmètre plus ${comparePerimetre} que celui du rectangle hachuré`
    : `${texteEnCouleurEtGras('Le rectangle hachuré')} a un périmètre plus ${comparePerimetre} que celui de la figure coloriée`
  return `${explication} Conclusion : ${reponse}.`
}

export default class CompareAireEtPerimetreAvecRectangle extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Type de figures',
      `Nombres séparés par des tirets :
  1 : Polygone inscrit dans un rectangle
  2 : Rectangle inscrit dans un polygone
  3 : Rectangle avec deux demi-disques alternés qui s'emboitent
  4 : Rectangle avec deux demi-disques alternés qui ne s'emboitent pas
  5 : Rectangle avec deux demi-disques en plus
  6 : Rectangle avec deux demi-disques en moins
  7 : Quadrilatère inscrit dans un rectangle
  8 : Rectangle inscrit dans un quadrilatère
  9 : Rectangle avec deux triangles alternés qui s'emboîtent
  10 : Rectangle avec deux triangles alternés qui ne s'emboîtent pas
  11 : Rectangle avec deux triangles en plus
  12 : Rectangle avec deux triangles en moins
  13 : Mélange `,
    ]
    this.besoinFormulaire2Numerique = [
      'Périmètres et/ou aires',
      4,
      "1 : Que des périmètres\n2 : Que des aires\n3 : Les deux\n4 : L'un ou l'autre au hasard des questions",
    ]

    this.nbQuestions = 3
    this.sup = 13
    this.sup2 = 3
  }

  nouvelleVersion() {
    const typesDeProblemes = gestionnaireFormulaireTexte({
      max: 12,
      defaut: 13,
      melange: 13,
      nbQuestions: this.nbQuestions,
      saisie: this.sup,
    })

    const color = combinaisonListes(
      ['red', bleuMathalea, 'green', 'gray', 'pink', orangeMathalea],
      this.nbQuestions,
    )

    let aireOuPerimetre = 'Les deux'
    if (this.sup2 === 1) aireOuPerimetre = 'Perimetre'
    else if (this.sup2 === 2) aireOuPerimetre = 'Aire'

    let compteurInteractif = 0
    for (let q = 0, cpt = 0; q < this.nbQuestions && cpt < 50;) {
      compteurInteractif = this.sup2 === 3 ? 2 * q : q
      let choixFigAire2:
        | [PointAbstrait, PointAbstrait][]
        | [PointAbstrait, PointAbstrait, number][] = []
      let objets: NestedObjetMathalea2dArray = []
      const A = pointAbstrait(0, 0)
      const B = pointAbstrait(randint(5, 10), 0)
      const C = pointAbstrait(B.x, randint(5, 10, B.x))
      const D = pointAbstrait(0, C.y)
      const rect = polygone([A, B, C, D])
      rect.hachures = 'north east lines'
      rect.pointilles = 2
      let reponseAire1 = false
      let reponseAire2 = false
      let reponseAire3 = false
      const comparePerimetre = choice(['grand', 'petit']) // ToDo : Appliquer la même chose pour les aires
      if (this.sup2 === 4) aireOuPerimetre = choice(['Aire', 'Perimetre'])
      let texte = ''
      let texteCorr = ''
      switch (typesDeProblemes[q]) {
        case 1:
          {
            // Polygone inscrit dans rectangle
            const E = A
            const G = pointAbstrait(entreDeux((A.x + B.x) / 2, B.x), A.y)
            const F = pointAbstrait(
              entreDeux(E.x, G.x),
              entreDeux(A.y, A.y + (D.y + A.y) / 2),
            )
            const H = pointAbstrait(
              entreDeux(G.x, B.x),
              entreDeux(A.y, A.y + (D.y + A.y) / 2),
            )
            const I = B
            const J = pointAbstrait(entreDeux(H.x, B.x), entreDeux(H.y, C.y))
            const K = pointAbstrait(B.x, entreDeux(J.y, C.y))
            const L = pointAbstrait(
              entreDeux(A.x + (A.x + B.x) / 2, B.x),
              entreDeux(K.y, C.y),
            )
            const M = C
            const N = pointAbstrait(
              entreDeux(A.x + (A.x + B.x) / 2, L.x),
              entreDeux(L.y, D.y),
            )
            const O = pointAbstrait(entreDeux(D.x, N.x), D.y)
            const P = pointAbstrait(
              entreDeux(D.x, O.x),
              entreDeux(D.y, A.y + (D.y + A.y) / 2),
            )
            const Q = D
            const R = pointAbstrait(
              entreDeux(A.x, P.x),
              entreDeux(P.y, A.y + (D.y + A.y) / 2),
            )
            const T = pointAbstrait(
              entreDeux(A.x, F.x),
              entreDeux(F.y, A.y + (D.y + A.y) / 2),
            )
            const S = pointAbstrait(A.x, entreDeux(R.y, T.y))

            const poly = polygone(
              E,
              F,
              G,
              H,
              I,
              J,
              K,
              L,
              M,
              N,
              O,
              P,
              Q,
              R,
              S,
              T,
            )
            poly.couleurDeRemplissage = colorToLatexOrHTML(color[q])
            poly.opaciteDeRemplissage = 0.5
            objets.push(poly, rect)
            // objets.push(rect)

            texte = mathalea2d(
              {
                xmin: -0.5,
                ymin: -0.5,
                xmax: B.x + 0.5,
                ymax: C.y + 0.5,
                pixelsParCm: 30,
                scale: 0.7,
                mainlevee: false,
                optionsTikz: ['baseline=(current bounding box.north)'],
              },
              objets,
            )
            // Correction
            texteCorr = this.sup2 === 3 ? numAlpha(0) : ''
            texteCorr +=
              this.sup2 === 1 || this.sup2 === 3 || aireOuPerimetre !== 'Aire'
                ? correctionPerimetre(true, comparePerimetre)
                : ''
            texteCorr += this.sup2 === 3 ? '<br>' + numAlpha(1) : ''
            texteCorr +=
              this.sup2 === 2 ||
              this.sup2 === 3 ||
              aireOuPerimetre !== 'Perimetre'
                ? `Le rectangle hachuré couvre plus de surface que la figure coloriée. Conclusion : ${texteEnCouleurEtGras('Le rectangle hachuré')} a une aire plus grande que celle de la figure coloriée.`
                : ''
            // QCM interactif
            if (this.interactif) {
              reponseAire1 = true
            }
          }
          break
        case 2:
          {
            // Rectangle inscrit dans polygone
            const E = A
            const G = pointAbstrait(entreDeux((A.x + B.x) / 2, B.x), A.y)
            const F = pointAbstrait(
              entreDeux(E.x, G.x),
              entreDeux(A.y, A.y - (D.y + A.y) / 2),
            )
            const H = pointAbstrait(
              entreDeux(G.x, B.x),
              entreDeux(A.y, A.y - (D.y + A.y) / 2),
            )
            const I = B
            const J = pointAbstrait(
              entreDeux(B.x, B.x + (A.x + B.x) / 2),
              entreDeux(I.y, (I.y + C.y) / 2),
            )
            const K = pointAbstrait(B.x, entreDeux(B.y, C.y))
            const L = pointAbstrait(entreDeux(B.x, J.x), C.y)
            const N = pointAbstrait(entreDeux(D.x, (C.x + D.x) / 2), C.y)
            const M = pointAbstrait(
              entreDeux(N.x, L.x),
              entreDeux(D.y, D.y + (D.y + A.y) / 2),
            )
            const O = pointAbstrait(
              entreDeux(D.x, N.x),
              entreDeux(D.y, D.y + (D.y + A.y) / 2),
            )
            const P = pointAbstrait(entreDeux(A.x - (A.x + B.x) / 2, A.x), D.y)
            const Q = pointAbstrait(A.x, entreDeux(A.y, D.y))
            const R = pointAbstrait(
              entreDeux(A.x - (A.x + B.x) / 2, A.x),
              entreDeux(Q.y, A.y),
            )
            const poly = polygone(E, F, G, H, I, J, K, L, M, N, O, P, Q, R)
            poly.couleurDeRemplissage = colorToLatexOrHTML(color[q])
            poly.opaciteDeRemplissage = 0.5
            objets.push(poly, rect)
            texte = mathalea2d(
              {
                xmin: Math.min(P.x, R.x) - 0.5,
                ymin: Math.min(F.y, H.y) - 0.5,
                xmax: Math.max(J.x, L.x) + 0.5,
                ymax: Math.max(M.y, O.y) + 0.5,
                pixelsParCm: 30,
                scale: 0.7,
                mainlevee: false,
                optionsTikz: ['baseline=(current bounding box.north)'],
              },
              objets,
            )
            // Correction
            texteCorr = this.sup2 === 3 ? numAlpha(0) : ''
            texteCorr +=
              this.sup2 === 1 || this.sup2 === 3 || aireOuPerimetre !== 'Aire'
                ? correctionPerimetre(true, comparePerimetre)
                : ''
            texteCorr += this.sup2 === 3 ? '<br>' + numAlpha(1) : ''
            texteCorr +=
              this.sup2 === 2 ||
              this.sup2 === 3 ||
              aireOuPerimetre !== 'Perimetre'
                ? `Le rectangle hachuré couvre moins de surface que la figure coloriée. Conclusion : ${texteEnCouleurEtGras('La figure coloriée')} a une aire plus grande que celle du rectangle hachuré.`
                : ''
            // QCM interactif
            if (this.interactif) {
              reponseAire2 = true
            }
          }
          break
        case 3:
          {
            // Deux demi-disques alternés qui s'emboîtent
            const E = pointAbstrait(entreDeux(A.x, A.x + (B.x - A.x) / 3), A.y)
            const F = pointAbstrait(
              entreDeux(B.x, A.x + (2 * (B.x - A.x)) / 3),
              A.y,
            )
            const G = pointAbstrait(B.x, entreDeux(B.y, B.y + (C.y - B.y) / 3))
            const H = pointAbstrait(
              B.x,
              entreDeux(C.y, B.y + (2 * (C.y - B.y)) / 3),
            )
            const I = pointAbstrait(
              entreDeux(B.x, A.x + (2 * (B.x - A.x)) / 3),
              D.y,
            )
            const J = pointAbstrait(entreDeux(A.x, A.x + (B.x - A.x) / 3), D.y)
            const K = pointAbstrait(
              A.x,
              entreDeux(C.y, B.y + (2 * (C.y - B.y)) / 3),
            )
            const L = pointAbstrait(A.x, entreDeux(B.y, B.y + (C.y - B.y) / 3))
            const poly = polygone(A, B, C, D)
            poly.couleurDeRemplissage = colorToLatexOrHTML(color[q])
            poly.opaciteDeRemplissage = 0.5
            poly.color = colorToLatexOrHTML('none')
            objets.push(poly)
            const rayonOuCote = arrondi(
              Math.min(
                longueur(E, F),
                longueur(G, H),
                longueur(I, J),
                longueur(K, L),
              ) / 2,
            )
            let M = translation(E, vecteur(rayonOuCote, 0))
            const N = translation(G, vecteur(0, rayonOuCote))
            let O = translation(I, vecteur(-rayonOuCote, 0))
            const P = translation(K, vecteur(0, -rayonOuCote))
            const paramsEnonce = {
              xmin: -0.5,
              ymin: -0.5,
              xmax: B.x + 0.5,
              ymax: C.y + 0.5,
              pixelsParCm: 30,
              scale: 0.7,
              mainlevee: false,
              optionsTikz: ['baseline=(current bounding box.north)'],
            }
            const choixFig = randint(0, 3)
            let pt1: PointAbstrait
            let pt2: PointAbstrait
            switch (choixFig) {
              case 0:
                pt1 = M
                pt2 = E
                paramsEnonce.ymin = -0.5 - rayonOuCote
                break
              case 1:
                pt1 = N
                pt2 = G
                paramsEnonce.xmax = rayonOuCote + B.x + 0.5
                break
              case 2:
                pt1 = O
                pt2 = I
                paramsEnonce.ymax = rayonOuCote + C.y + 0.5
                break
              case 3:
              default:
                pt1 = P
                pt2 = K
                paramsEnonce.xmin = -0.5 - rayonOuCote
                break
            }

            const figAire1 = arc(pt2, pt1, 180, false, color[q], 'black', 0.5)
            const choixFig2 = randint(0, 3, [choixFig])
            choixFigAire2 = [
              [E, M],
              [G, N],
              [I, O],
              [K, P],
            ]
            if (choixFig2 === 1) paramsEnonce.xmax = rayonOuCote + B.x + 0.5
            if (choixFig2 === 3) paramsEnonce.xmin = -0.5 - rayonOuCote

            const figAire2 = arc(
              choixFigAire2[choixFig2][0],
              choixFigAire2[choixFig2][1],
              -180,
              false,
              'white',
              'black',
              1.1,
            )
            M = rotation(pt2, pt1, 60)
            const NN = segment(M, pt1, 'black')
            N.epaisseur = 2
            O = rotation(
              choixFigAire2[choixFig2][0],
              choixFigAire2[choixFig2][1],
              -60,
            )
            const PP = segment(O, choixFigAire2[choixFig2][1], 'black')
            P.epaisseur = 2
            objets.push(
              figAire1,
              figAire2,
              rect,
              NN,
              codageSegment(M, pt1, '|||'),
              PP,
              codageSegment(O, choixFigAire2[choixFig2][1], '|||'),
            )
            texte = mathalea2d(paramsEnonce, objets)
            // Correction
            texteCorr = this.sup2 === 3 ? numAlpha(0) : ''
            texteCorr +=
              this.sup2 === 1 || this.sup2 === 3 || aireOuPerimetre !== 'Aire'
                ? correctionPerimetre(true, comparePerimetre)
                : ''
            texteCorr += this.sup2 === 3 ? '<br>' + numAlpha(1) : ''
            texteCorr +=
              this.sup2 === 2 ||
              this.sup2 === 3 ||
              aireOuPerimetre !== 'Perimetre'
                ? `Le rectangle hachuré couvre autant de surface que la figure coloriée. Conclusion : ${texteEnCouleurEtGras("Autant l'un que l'autre")}, la figure coloriée a une aire égale à celle du rectangle hachuré.`
                : ''
            if (
              this.sup2 === 2 ||
              this.sup2 === 3 ||
              aireOuPerimetre !== 'Perimetre'
            ) {
              objets = []
              const figAire1 = arc(pt2, pt1, 180, false, 'white', 'black', 1.1)
              const figAireCorr = arc(
                pt2,
                pt1,
                180,
                false,
                color[q],
                'black',
                0.5,
              )
              let angleCorr =
                choixFig2 - choixFig < 0
                  ? choixFig2 - choixFig + 4
                  : choixFig2 - choixFig
              angleCorr = angleCorr === 1 ? 90 : angleCorr === 2 ? 0 : -90
              const figAireCorr2 = arc(
                rotation(
                  choixFigAire2[choixFig2][0],
                  choixFigAire2[choixFig2][1],
                  angleCorr,
                ),
                choixFigAire2[choixFig2][1],
                -180,
                false,
                color[q],
                'black',
                0.5,
              )
              objets.push(
                poly,
                figAire1,
                figAire2,
                rect,
                N,
                codageSegment(M, pt1, '|||'),
                P,
                codageSegment(O, choixFigAire2[choixFig2][1], '|||'),
              )
              if (context.isHtml)
                objets.push(
                  translationPuisRotationAnimees(
                    String(q),
                    figAireCorr,
                    vecteur(pt1, choixFigAire2[choixFig2][1]),
                    figAireCorr2,
                    choixFigAire2[choixFig2][1],
                    -angleCorr,
                  ),
                )
              paramsEnonce.ymin =
                choixFig2 === 0 ? -0.5 - rayonOuCote : paramsEnonce.ymin
              paramsEnonce.ymax =
                choixFig2 === 2 ? rayonOuCote + C.y + 0.5 : paramsEnonce.ymax
              texteCorr += '<br>' + mathalea2d(paramsEnonce, objets)
              if (context.isHtml) {
                texteCorr += `<br><button class="btn ui labeled icon button"  style="margin:10px" onclick="document.getElementById('${figAireCorr.id}').style.visibility = 'visible',document.getElementById('${figAireCorr2.id}').style.visibility = 'hidden',
              setTimeout(function() {document.getElementById('${figAireCorr.id}').style.visibility = 'hidden'}, 5000),
              setTimeout(function() {document.getElementById('${figAireCorr2.id}').style.visibility = 'visible'}, 5000),document.getElementById('translat${q}').beginElement()"><i class="redo circle icon"></i>Relancer l'animation de la comparaison d'aires </button>`
              }
            }
            // QCM interactif
            if (this.interactif) {
              reponseAire3 = true
            }
          }
          break
        case 4:
          {
            // Deux demi-disques alternés qui ne s'emboîtent pas
            const E = pointAbstrait(entreDeux(A.x, A.x + (B.x - A.x) / 3), A.y)
            const F = pointAbstrait(
              entreDeux(B.x, A.x + (2 * (B.x - A.x)) / 3),
              A.y,
            )
            const G = pointAbstrait(B.x, entreDeux(B.y, B.y + (C.y - B.y) / 3))
            const H = pointAbstrait(
              B.x,
              entreDeux(C.y, B.y + (2 * (C.y - B.y)) / 3),
            )
            const I = pointAbstrait(
              entreDeux(B.x, A.x + (2 * (B.x - A.x)) / 3),
              D.y,
            )
            const J = pointAbstrait(entreDeux(A.x, A.x + (B.x - A.x) / 3), D.y)
            const K = pointAbstrait(
              A.x,
              entreDeux(C.y, B.y + (2 * (C.y - B.y)) / 3),
            )
            const L = pointAbstrait(A.x, entreDeux(B.y, B.y + (C.y - B.y) / 3))
            const poly = polygone(A, B, C, D)
            poly.couleurDeRemplissage = colorToLatexOrHTML(color[q])
            poly.opaciteDeRemplissage = 0.5
            poly.color = colorToLatexOrHTML('none')
            objets.push(poly)
            const aleaDemiDisque = choice([true, false])
            const aleaRayon = randint(2, 3)
            let rayonOuCote = arrondi(
              Math.min(
                longueur(E, F),
                longueur(G, H),
                longueur(I, J),
                longueur(K, L),
              ) / 2,
            )
            rayonOuCote = aleaDemiDisque ? rayonOuCote : rayonOuCote / aleaRayon
            const M = translation(E, vecteur(rayonOuCote, 0))
            const N = translation(G, vecteur(0, rayonOuCote))
            const O = translation(I, vecteur(-rayonOuCote, 0))
            const P = translation(K, vecteur(0, -rayonOuCote))
            const paramsEnonce = {
              xmin: -0.5,
              ymin: -0.5,
              xmax: B.x + 0.5,
              ymax: C.y + 0.5,
              pixelsParCm: 30,
              scale: 0.7,
              mainlevee: false,
              optionsTikz: ['baseline=(current bounding box.north)'],
            }
            const choixFig = randint(0, 3)
            let pt1: PointAbstrait
            let pt2: PointAbstrait
            switch (choixFig) {
              case 0:
                pt1 = M
                pt2 = E
                paramsEnonce.ymin = -0.5 - rayonOuCote
                break
              case 1:
                pt1 = N
                pt2 = G
                paramsEnonce.xmax = rayonOuCote + B.x + 0.5
                break
              case 2:
                pt1 = O
                pt2 = I
                paramsEnonce.ymax = rayonOuCote + C.y + 0.5
                break
              case 3:
              default:
                pt1 = P
                pt2 = K
                paramsEnonce.xmin = -0.5 - rayonOuCote
                break
            }
            let figAire1 = arc(pt2, pt1, 180, false, color[q], 'black', 0.5)
            const choixFig2 = randint(0, 3, [choixFig])
            choixFigAire2 = [
              [E, M],
              [G, N],
              [I, O],
              [K, P],
            ]
            paramsEnonce.xmax =
              choixFig2 === 1 ? rayonOuCote + B.x + 0.5 : paramsEnonce.xmax
            paramsEnonce.xmin =
              choixFig2 === 3 ? -0.5 - rayonOuCote : paramsEnonce.xmin
            const figAire2 = arc(
              aleaDemiDisque
                ? homothetie(
                    choixFigAire2[choixFig2][1],
                    choixFigAire2[choixFig2][0],
                    1 / aleaRayon,
                  )
                : choixFigAire2[choixFig2][0],
              aleaDemiDisque
                ? choixFigAire2[choixFig2][1]
                : homothetie(
                    choixFigAire2[choixFig2][1],
                    choixFigAire2[choixFig2][0],
                    aleaRayon,
                  ),
              -180,
              false,
              'white',
              'black',
              1.1,
            )
            objets.push(figAire1, figAire2, rect)
            texte = mathalea2d(paramsEnonce, objets)
            // Correction
            texteCorr = this.sup2 === 3 ? numAlpha(0) : ''
            texteCorr +=
              this.sup2 === 1 || this.sup2 === 3 || aireOuPerimetre !== 'Aire'
                ? correctionPerimetre(true, comparePerimetre)
                : ''
            texteCorr += this.sup2 === 3 ? '<br>' + numAlpha(1) : ''
            texteCorr += aleaDemiDisque
              ? this.sup2 === 2 ||
                this.sup2 === 3 ||
                aireOuPerimetre !== 'Perimetre'
                ? `Le rectangle hachuré couvre moins de surface que la figure coloriée. Conclusion : ${texteEnCouleurEtGras('La figure coloriée')} a une aire plus grande que celle du rectangle hachuré.`
                : ''
              : this.sup2 === 2 ||
                  this.sup2 === 3 ||
                  aireOuPerimetre !== 'Perimetre'
                ? `Le rectangle hachuré couvre plus de surface que la figure coloriée. Conclusion : ${texteEnCouleurEtGras('Le rectangle hachuré')} a une aire plus grande que celle de la figure coloriée.`
                : ''
            if (
              this.sup2 === 2 ||
              this.sup2 === 3 ||
              aireOuPerimetre !== 'Perimetre'
            ) {
              objets = []
              figAire1 = arc(pt2, pt1, 180, false, 'white', 'black', 1.1)
              const figAireCorr = arc(
                pt2,
                pt1,
                180,
                false,
                color[q],
                'black',
                0.5,
              )
              let angleCorr =
                choixFig2 - choixFig < 0
                  ? choixFig2 - choixFig + 4
                  : choixFig2 - choixFig
              angleCorr = angleCorr === 1 ? 90 : angleCorr === 2 ? 0 : -90
              const figAireCorr2 = arc(
                rotation(
                  choixFigAire2[choixFig2][0],
                  choixFigAire2[choixFig2][1],
                  angleCorr,
                ),
                choixFigAire2[choixFig2][1],
                -180,
                false,
                color[q],
                'black',
                0.5,
              )
              objets.push(poly, figAire1, figAire2, rect)
              if (context.isHtml)
                objets.push(
                  translationPuisRotationAnimees(
                    String(q),
                    figAireCorr,
                    vecteur(pt1, choixFigAire2[choixFig2][1]),
                    figAireCorr2,
                    choixFigAire2[choixFig2][1],
                    -angleCorr,
                  ),
                )
              paramsEnonce.ymin =
                choixFig2 === 0 ? -0.5 - rayonOuCote : paramsEnonce.ymin
              paramsEnonce.ymax =
                choixFig2 === 2 ? rayonOuCote + C.y + 0.5 : paramsEnonce.ymax
              texteCorr += '<br>' + mathalea2d(paramsEnonce, objets)
              if (context.isHtml) {
                texteCorr += `<br><button class="btn ui labeled icon button"  style="margin:10px" onclick="document.getElementById('${figAireCorr.id}').style.visibility = 'visible',document.getElementById('${figAireCorr2.id}').style.visibility = 'hidden',
              setTimeout(function() {document.getElementById('${figAireCorr.id}').style.visibility = 'hidden'}, 5000),
              setTimeout(function() {document.getElementById('${figAireCorr2.id}').style.visibility = 'visible'}, 5000),document.getElementById('translat${q}').beginElement()"><i class="redo circle icon"></i>Relancer l'animation de la comparaison d'aires </button>`
              }
            }
            // QCM interactif
            if (this.interactif) {
              reponseAire1 = !aleaDemiDisque
              reponseAire2 = aleaDemiDisque
            }
          }
          break
        case 5:
          {
            // Deux demi-disques en plus
            const E = pointAbstrait(entreDeux(A.x, A.x + (B.x - A.x) / 3), A.y)
            const F = pointAbstrait(
              entreDeux(B.x, A.x + (2 * (B.x - A.x)) / 3),
              A.y,
            )
            const G = pointAbstrait(B.x, entreDeux(B.y, B.y + (C.y - B.y) / 3))
            const H = pointAbstrait(
              B.x,
              entreDeux(C.y, B.y + (2 * (C.y - B.y)) / 3),
            )
            const I = pointAbstrait(
              entreDeux(B.x, A.x + (2 * (B.x - A.x)) / 3),
              D.y,
            )
            const J = pointAbstrait(entreDeux(A.x, A.x + (B.x - A.x) / 3), D.y)
            const K = pointAbstrait(
              A.x,
              entreDeux(C.y, B.y + (2 * (C.y - B.y)) / 3),
            )
            const L = pointAbstrait(A.x, entreDeux(B.y, B.y + (C.y - B.y) / 3))
            const poly = polygone(A, B, C, D)
            poly.couleurDeRemplissage = colorToLatexOrHTML(color[q])
            poly.opaciteDeRemplissage = 0.5
            poly.color = colorToLatexOrHTML('none')
            objets.push(poly)
            const rayonOuCote = arrondi(
              Math.min(
                longueur(E, F),
                longueur(G, H),
                longueur(I, J),
                longueur(K, L),
              ) / 2,
            )
            let M = translation(E, vecteur(rayonOuCote, 0))
            const N = translation(G, vecteur(0, rayonOuCote))
            let O = translation(I, vecteur(-rayonOuCote, 0))
            const P = translation(K, vecteur(0, -rayonOuCote))
            const paramsEnonce = {
              xmin: -0.5,
              ymin: -0.5,
              xmax: B.x + 0.5,
              ymax: C.y + 0.5,
              pixelsParCm: 30,
              scale: 0.7,
              mainlevee: false,
              optionsTikz: ['baseline=(current bounding box.north)'],
            }
            const choixFig = randint(0, 3)
            let pt1: PointAbstrait
            let pt2: PointAbstrait
            switch (choixFig) {
              case 0:
                pt1 = M
                pt2 = E
                paramsEnonce.ymin = -0.5 - rayonOuCote
                break
              case 1:
                pt1 = N
                pt2 = G
                paramsEnonce.xmax = rayonOuCote + B.x + 0.5
                break
              case 2:
                pt1 = O
                pt2 = I
                paramsEnonce.ymax = rayonOuCote + C.y + 0.5
                break
              case 3:
              default:
                pt1 = P
                pt2 = K
                paramsEnonce.xmin = -0.5 - rayonOuCote
                break
            }
            const figAire1 = arc(pt2, pt1, 180, false, color[q], 'black', 0.5)
            const choixFig2 = randint(0, 3, [choixFig])
            choixFigAire2 = [
              [E, M],
              [G, N],
              [I, O],
              [K, P],
            ]
            paramsEnonce.ymin =
              choixFig2 === 0 ? -0.5 - rayonOuCote : paramsEnonce.ymin
            paramsEnonce.xmax =
              choixFig2 === 1 ? rayonOuCote + B.x + 0.5 : paramsEnonce.xmax
            paramsEnonce.ymax =
              choixFig2 === 2 ? rayonOuCote + C.y + 0.5 : paramsEnonce.ymax
            paramsEnonce.xmin =
              choixFig2 === 3 ? -0.5 - rayonOuCote : paramsEnonce.xmin

            const figAire2 = arc(
              choixFigAire2[choixFig2][0],
              choixFigAire2[choixFig2][1],
              180,
              false,
              color[q],
              'black',
              0.5,
            )
            M = rotation(pt2, pt1, 60)
            const NN = segment(M, pt1, 'black')
            N.epaisseur = 2
            O = rotation(
              choixFigAire2[choixFig2][0],
              choixFigAire2[choixFig2][1],
              60,
            )
            const PP = segment(O, choixFigAire2[choixFig2][1], 'black')
            P.epaisseur = 2
            objets.push(
              figAire1,
              figAire2,
              rect,
              NN,
              codageSegment(M, pt1, '|||'),
              PP,
              codageSegment(O, choixFigAire2[choixFig2][1], '|||'),
            )
            texte = mathalea2d(paramsEnonce, objets)
            // Correction
            texteCorr = this.sup2 === 3 ? numAlpha(0) : ''
            texteCorr +=
              this.sup2 === 1 || this.sup2 === 3 || aireOuPerimetre !== 'Aire'
                ? correctionPerimetre(true, comparePerimetre)
                : ''
            texteCorr += this.sup2 === 3 ? '<br>' + numAlpha(1) : ''
            texteCorr +=
              this.sup2 === 2 ||
              this.sup2 === 3 ||
              aireOuPerimetre !== 'Perimetre'
                ? `Le rectangle hachuré couvre moins de surface que la figure coloriée. Conclusion : ${texteEnCouleurEtGras('La figure coloriée')} a une aire plus grande que celle du rectangle hachuré.`
                : ''
            // QCM interactif
            if (this.interactif) {
              reponseAire2 = true
            }
          }
          break
        case 6:
          {
            // Deux demi-disques en moins
            const E = pointAbstrait(entreDeux(A.x, A.x + (B.x - A.x) / 3), A.y)
            const F = pointAbstrait(
              entreDeux(B.x, A.x + (2 * (B.x - A.x)) / 3),
              A.y,
            )
            const G = pointAbstrait(B.x, entreDeux(B.y, B.y + (C.y - B.y) / 3))
            const H = pointAbstrait(
              B.x,
              entreDeux(C.y, B.y + (2 * (C.y - B.y)) / 3),
            )
            const I = pointAbstrait(
              entreDeux(B.x, A.x + (2 * (B.x - A.x)) / 3),
              D.y,
            )
            const J = pointAbstrait(entreDeux(A.x, A.x + (B.x - A.x) / 3), D.y)
            const K = pointAbstrait(
              A.x,
              entreDeux(C.y, B.y + (2 * (C.y - B.y)) / 3),
            )
            const L = pointAbstrait(A.x, entreDeux(B.y, B.y + (C.y - B.y) / 3))
            const poly = polygone(A, B, C, D)
            poly.couleurDeRemplissage = colorToLatexOrHTML(color[q])
            poly.opaciteDeRemplissage = 0.5
            poly.color = colorToLatexOrHTML('none')
            objets.push(poly)
            const rayonOuCote = arrondi(
              Math.min(
                longueur(E, F),
                longueur(G, H),
                longueur(I, J),
                longueur(K, L),
              ) / 2,
            )
            let M = translation(E, vecteur(rayonOuCote, 0))
            const N = translation(G, vecteur(0, rayonOuCote))
            let O = translation(I, vecteur(-rayonOuCote, 0))
            const P = translation(K, vecteur(0, -rayonOuCote))
            const paramsEnonce = {
              xmin: -0.5,
              ymin: -0.5,
              xmax: B.x + 0.5,
              ymax: C.y + 0.5,
              pixelsParCm: 30,
              scale: 0.7,
              mainlevee: false,
              optionsTikz: ['baseline=(current bounding box.north)'],
            }
            const choixFig = randint(0, 3)
            let pt1: PointAbstrait
            let pt2: PointAbstrait
            switch (choixFig) {
              case 0:
                pt1 = M
                pt2 = E
                paramsEnonce.ymin = -0.5 - rayonOuCote
                break
              case 1:
                pt1 = N
                pt2 = G
                paramsEnonce.xmax = rayonOuCote + B.x + 0.5
                break
              case 2:
                pt1 = O
                pt2 = I
                paramsEnonce.ymax = rayonOuCote + C.y + 0.5
                break
              case 3:
              default:
                pt1 = P
                pt2 = K
                paramsEnonce.xmin = -0.5 - rayonOuCote
                break
            }
            const figAire1 = arc(pt2, pt1, -180, false, 'white', 'black', 1.1)
            const choixFig2 = randint(0, 3, [choixFig])
            choixFigAire2 = [
              [E, M],
              [G, N],
              [I, O],
              [K, P],
            ]
            paramsEnonce.ymin =
              choixFig2 === 0 ? -0.5 - rayonOuCote : paramsEnonce.ymin
            paramsEnonce.xmax =
              choixFig2 === 1 ? rayonOuCote + B.x + 0.5 : paramsEnonce.xmax
            paramsEnonce.ymax =
              choixFig2 === 2 ? rayonOuCote + C.y + 0.5 : paramsEnonce.ymax
            paramsEnonce.xmin =
              choixFig2 === 3 ? -0.5 - rayonOuCote : paramsEnonce.xmin

            const figAire2 = arc(
              choixFigAire2[choixFig2][0],
              choixFigAire2[choixFig2][1],
              -180,
              false,
              'white',
              'black',
              1.1,
            )
            M = rotation(pt2, pt1, -60)
            const NN = segment(M, pt1, 'black')
            N.epaisseur = 2
            O = rotation(
              choixFigAire2[choixFig2][0],
              choixFigAire2[choixFig2][1],
              -60,
            )
            const PP = segment(O, choixFigAire2[choixFig2][1], 'black')
            P.epaisseur = 2
            objets.push(
              figAire1,
              figAire2,
              rect,
              NN,
              codageSegment(M, pt1, '|||'),
              PP,
              codageSegment(O, choixFigAire2[choixFig2][1], '|||'),
            )
            texte = mathalea2d(paramsEnonce, objets)
            // Correction
            texteCorr = this.sup2 === 3 ? numAlpha(0) : ''
            texteCorr +=
              this.sup2 === 1 || this.sup2 === 3 || aireOuPerimetre !== 'Aire'
                ? correctionPerimetre(true, comparePerimetre)
                : ''
            texteCorr += this.sup2 === 3 ? '<br>' + numAlpha(1) : ''
            texteCorr +=
              this.sup2 === 2 ||
              this.sup2 === 3 ||
              aireOuPerimetre !== 'Perimetre'
                ? `Le rectangle hachuré couvre plus de surface que la figure coloriée. Conclusion : ${texteEnCouleurEtGras('Le rectangle hachuré')} a une aire plus grande que celle de la figure coloriée.`
                : ''
            // QCM interactif
            if (this.interactif) {
              reponseAire1 = true
            }
          }
          break
        case 7:
          {
            // Un quadrilatère inscrit dans le rectangle
            const E = pointAbstrait(entreDeux(A.x, B.x), A.y)
            const F = pointAbstrait(B.x, entreDeux(B.y, C.y))
            const G = pointAbstrait(entreDeux(A.x, B.x), C.y)
            const H = pointAbstrait(A.x, entreDeux(B.y, C.y))
            const poly = polygone(E, F, G, H)
            poly.couleurDeRemplissage = colorToLatexOrHTML(color[q])
            poly.opaciteDeRemplissage = 0.5
            objets.push(poly, rect)
            const paramsEnonce = {
              xmin: -0.5,
              ymin: -0.5,
              xmax: B.x + 0.5,
              ymax: C.y + 0.5,
              pixelsParCm: 30,
              scale: 0.7,
              mainlevee: false,
              optionsTikz: ['baseline=(current bounding box.north)'],
            }
            texte = mathalea2d(paramsEnonce, objets)
            // Correction
            texteCorr = this.sup2 === 3 ? numAlpha(0) : ''
            texteCorr +=
              this.sup2 === 1 || this.sup2 === 3 || aireOuPerimetre !== 'Aire'
                ? correctionPerimetre(false, comparePerimetre)
                : ''
            texteCorr += this.sup2 === 3 ? '<br>' + numAlpha(1) : ''
            texteCorr +=
              this.sup2 === 2 ||
              this.sup2 === 3 ||
              aireOuPerimetre !== 'Perimetre'
                ? `Le rectangle hachuré couvre plus de surface que la figure coloriée. Conclusion : ${texteEnCouleurEtGras('Le rectangle hachuré')} a une aire plus grande que celle de la figure coloriée.`
                : ''
            // QCM interactif
            if (this.interactif) {
              reponseAire1 = true
            }
          }
          break
        case 8:
          {
            // Le rectangle inscrit dans un quadrilatère
            const aleaPente = choice([0, 0.5])
            const d1 = droiteParPointEtPente(
              A,
              -(aleaPente + randint(10, 50) / 100),
            )
            const d2 = droiteParPointEtPente(
              B,
              -(aleaPente - randint(50, 90) / 100),
            )
            const d3 = droiteParPointEtPente(
              C,
              -(aleaPente + randint(10, 50) / 100),
            )
            const d4 = droiteParPointEtPente(
              D,
              -(aleaPente - randint(50, 90) / 100),
            )
            const E = pointIntersectionDD(d1, d2)
            const F = pointIntersectionDD(d2, d3)
            const G = pointIntersectionDD(d3, d4)
            const H = pointIntersectionDD(d4, d1)
            const poly = polygone(E, F, G, H)
            poly.couleurDeRemplissage = colorToLatexOrHTML(color[q])
            poly.opaciteDeRemplissage = 0.5
            objets.push(poly, rect)
            const paramsEnonce = {
              xmin: H.x - 0.5,
              ymin: E.y - 0.5,
              xmax: F.x + 0.5,
              ymax: G.y + 0.5,
              pixelsParCm: 30,
              scale: 0.7,
              mainlevee: false,
              optionsTikz: ['baseline=(current bounding box.north)'],
            }
            texte = mathalea2d(paramsEnonce, objets)
            // Correction
            texteCorr = this.sup2 === 3 ? numAlpha(0) : ''
            texteCorr +=
              this.sup2 === 1 || this.sup2 === 3 || aireOuPerimetre !== 'Aire'
                ? correctionPerimetre(true, comparePerimetre)
                : ''
            texteCorr += this.sup2 === 3 ? '<br>' + numAlpha(1) : ''
            texteCorr +=
              this.sup2 === 2 ||
              this.sup2 === 3 ||
              aireOuPerimetre !== 'Perimetre'
                ? `Le rectangle hachuré couvre moins de surface que la figure coloriée. Conclusion : ${texteEnCouleurEtGras('La figure coloriée')} a une aire plus grande que celle du rectangle hachuré.`
                : ''
            // QCM interactif
            if (this.interactif) {
              reponseAire2 = true
            }
          }
          break
        case 9:
          {
            // Deux triangles alternés qui s'emboîtent
            const E = pointAbstrait(entreDeux(A.x, A.x + (B.x - A.x) / 3), A.y)
            const F = pointAbstrait(
              entreDeux(B.x, A.x + (2 * (B.x - A.x)) / 3),
              A.y,
            )
            const G = pointAbstrait(B.x, entreDeux(B.y, B.y + (C.y - B.y) / 3))
            const H = pointAbstrait(
              B.x,
              entreDeux(C.y, B.y + (2 * (C.y - B.y)) / 3),
            )
            const I = pointAbstrait(
              entreDeux(B.x, A.x + (2 * (B.x - A.x)) / 3),
              D.y,
            )
            const J = pointAbstrait(entreDeux(A.x, A.x + (B.x - A.x) / 3), D.y)
            const K = pointAbstrait(
              A.x,
              entreDeux(C.y, B.y + (2 * (C.y - B.y)) / 3),
            )
            const L = pointAbstrait(A.x, entreDeux(B.y, B.y + (C.y - B.y) / 3))
            const poly = polygone(A, B, C, D)
            poly.couleurDeRemplissage = colorToLatexOrHTML(color[q])
            poly.opaciteDeRemplissage = 0.5
            poly.color = colorToLatexOrHTML('none')
            objets.push(poly)
            const rayonOuCote = Math.min(
              longueur(E, F),
              longueur(G, H),
              longueur(I, J),
              longueur(K, L),
            )
            const M = translation(E, vecteur(rayonOuCote, 0))
            const N = translation(G, vecteur(0, rayonOuCote))
            const O = translation(I, vecteur(-rayonOuCote, 0))
            const P = translation(K, vecteur(0, -rayonOuCote))
            const paramsEnonce = {
              xmin: -0.5,
              ymin: -0.5,
              xmax: B.x + 0.5,
              ymax: C.y + 0.5,
              pixelsParCm: 30,
              scale: 0.7,
              mainlevee: false,
              optionsTikz: ['baseline=(current bounding box.north)'],
            }
            const aleaLongueur = choice([-1, 1])
            const choixFig = randint(0, 3)
            let pt1: PointAbstrait
            let pt2: PointAbstrait
            switch (choixFig) {
              case 0:
                pt1 = M
                pt2 = E
                paramsEnonce.ymin = -0.5 - rayonOuCote - aleaLongueur
                break
              case 1:
                pt1 = N
                pt2 = G
                paramsEnonce.xmax = rayonOuCote + aleaLongueur + B.x + 0.5
                break
              case 2:
                pt1 = O
                pt2 = I
                paramsEnonce.ymax = rayonOuCote + aleaLongueur + C.y + 0.5
                break
              case 3:
              default:
                pt1 = P
                pt2 = K
                paramsEnonce.xmin = -0.5 - rayonOuCote - aleaLongueur
                break
            }
            const aleaAngle = choice([40, 50, 70, 80])
            const Q = pointSurSegment(pt2, pt1, rayonOuCote + aleaLongueur)
            const R = rotation(Q, pt2, -aleaAngle)
            let figAire1 = polygone(pt2, pt1, R)
            figAire1.color = colorToLatexOrHTML('none')
            figAire1.couleurDeRemplissage = colorToLatexOrHTML(color[q])
            figAire1.opaciteDeRemplissage = 0.5
            const choixFig2 = randint(0, 3, [choixFig])
            choixFigAire2 = [
              [E, M],
              [G, N],
              [I, O],
              [K, P],
            ]
            paramsEnonce.xmax =
              choixFig2 === 1 ? rayonOuCote + B.x + 0.5 : paramsEnonce.xmax
            paramsEnonce.xmin =
              choixFig2 === 3 ? -0.5 - rayonOuCote : paramsEnonce.xmin
            const S = pointSurSegment(
              choixFigAire2[choixFig2][1],
              choixFigAire2[choixFig2][0],
              rayonOuCote + aleaLongueur,
            )
            const T = rotation(S, choixFigAire2[choixFig2][1], -aleaAngle)
            const figAire2 = polygone(
              choixFigAire2[choixFig2][0],
              choixFigAire2[choixFig2][1],
              T,
            )
            figAire2.color = colorToLatexOrHTML('none')
            figAire2.couleurDeRemplissage = colorToLatexOrHTML('white')
            figAire2.opaciteDeRemplissage = 1.1
            objets.push(
              figAire1,
              figAire2,
              segment(pt2, R),
              segment(pt1, R),
              codageSegment(pt2, R, '|||'),
              codageSegment(pt2, pt1, 'OO'),
              codageSegment(pt1, R, 'XX'),
              rect,
            )
            objets.push(
              segment(choixFigAire2[choixFig2][0], T),
              segment(choixFigAire2[choixFig2][1], T),
              codageSegment(choixFigAire2[choixFig2][1], T, '|||'),
              codageSegment(
                choixFigAire2[choixFig2][1],
                choixFigAire2[choixFig2][0],
                'OO',
              ),
              codageSegment(choixFigAire2[choixFig2][0], T, 'XX'),
            )
            texte = mathalea2d(paramsEnonce, objets)
            // Correction
            texteCorr = this.sup2 === 3 ? numAlpha(0) : ''
            texteCorr +=
              this.sup2 === 1 || this.sup2 === 3 || aireOuPerimetre !== 'Aire'
                ? correctionPerimetre(true, comparePerimetre)
                : ''
            texteCorr += this.sup2 === 3 ? '<br>' + numAlpha(1) : ''
            texteCorr +=
              this.sup2 === 2 ||
              this.sup2 === 3 ||
              aireOuPerimetre !== 'Perimetre'
                ? `Le rectangle hachuré couvre autant de surface que la figure coloriée. Conclusion : ${texteEnCouleurEtGras("Autant l'un que l'autre")}, la figure coloriée a une aire égale à celle du rectangle hachuré.`
                : ''
            objets = []
            if (
              this.sup2 === 2 ||
              this.sup2 === 3 ||
              aireOuPerimetre !== 'Perimetre'
            ) {
              figAire1 = polygone(pt2, pt1, R)
              figAire1.color = colorToLatexOrHTML('none')
              figAire1.couleurDeRemplissage = colorToLatexOrHTML('white')
              figAire1.opaciteDeRemplissage = 1.1
              const figAireCorr = polygone(pt2, pt1, R)
              figAireCorr.couleurDeRemplissage = colorToLatexOrHTML(color[q])
              figAireCorr.opaciteDeRemplissage = 0.5
              let angleCorr =
                choixFig2 - choixFig < 0
                  ? choixFig2 - choixFig + 4
                  : choixFig2 - choixFig
              angleCorr = angleCorr === 1 ? 90 : angleCorr === 2 ? 0 : -90
              const figAireCorr2 = rotation(
                figAire2,
                choixFigAire2[choixFig2][0],
                angleCorr,
              )
              figAireCorr2.couleurDeRemplissage = colorToLatexOrHTML(color[q])
              figAireCorr2.opaciteDeRemplissage = 0.5
              objets.push(
                poly,
                figAire1,
                figAire2,
                segment(pt2, R),
                segment(pt1, R),
                codageSegment(pt2, R, '|||'),
                codageSegment(pt2, pt1, 'OO'),
                codageSegment(pt1, R, 'XX'),
                rect,
              )
              objets.push(
                segment(choixFigAire2[choixFig2][0], T),
                segment(choixFigAire2[choixFig2][1], T),
                codageSegment(choixFigAire2[choixFig2][1], T, '|||'),
                codageSegment(
                  choixFigAire2[choixFig2][1],
                  choixFigAire2[choixFig2][0],
                  'OO',
                ),
                codageSegment(choixFigAire2[choixFig2][0], T, 'XX'),
              )
              if (context.isHtml)
                objets.push(
                  translationPuisRotationAnimees(
                    String(q),
                    figAireCorr,
                    vecteur(pt1, choixFigAire2[choixFig2][0]),
                    figAireCorr2,
                    choixFigAire2[choixFig2][0],
                    -angleCorr,
                  ),
                )
              paramsEnonce.ymin =
                choixFig2 === 0 ? -0.5 - rayonOuCote : paramsEnonce.ymin
              paramsEnonce.ymax =
                choixFig2 === 2 ? rayonOuCote + C.y + 0.5 : paramsEnonce.ymax
              texteCorr += '<br>' + mathalea2d(paramsEnonce, objets)
              if (context.isHtml) {
                texteCorr += `<br><button class="btn ui labeled icon button"  style="margin:10px" onclick="document.getElementById('${figAireCorr.id}').style.visibility = 'visible',document.getElementById('${figAireCorr2.id}').style.visibility = 'hidden',
              setTimeout(function() {document.getElementById('${figAireCorr.id}').style.visibility = 'hidden'}, 5000),
              setTimeout(function() {document.getElementById('${figAireCorr2.id}').style.visibility = 'visible'}, 5000),document.getElementById('translat${q}').beginElement()"><i class="redo circle icon"></i>Relancer l'animation de la comparaison d'aires </button>`
              }
            }
            // QCM interactif
            if (this.interactif) {
              reponseAire3 = true
            }
          }
          break
        case 10:
          {
            // Deux triangles alternés qui ne s'emboîtent pas
            const E = pointAbstrait(entreDeux(A.x, A.x + (B.x - A.x) / 3), A.y)
            const F = pointAbstrait(
              entreDeux(B.x, A.x + (2 * (B.x - A.x)) / 3),
              A.y,
            )
            const G = pointAbstrait(B.x, entreDeux(B.y, B.y + (C.y - B.y) / 3))
            const H = pointAbstrait(
              B.x,
              entreDeux(C.y, B.y + (2 * (C.y - B.y)) / 3),
            )
            const I = pointAbstrait(
              entreDeux(B.x, A.x + (2 * (B.x - A.x)) / 3),
              D.y,
            )
            const J = pointAbstrait(entreDeux(A.x, A.x + (B.x - A.x) / 3), D.y)
            const K = pointAbstrait(
              A.x,
              entreDeux(C.y, B.y + (2 * (C.y - B.y)) / 3),
            )
            const L = pointAbstrait(A.x, entreDeux(B.y, B.y + (C.y - B.y) / 3))
            const poly = polygone(A, B, C, D)
            poly.couleurDeRemplissage = colorToLatexOrHTML(color[q])
            poly.opaciteDeRemplissage = 0.5
            poly.color = colorToLatexOrHTML('none')
            objets.push(poly)
            const rayonOuCote = Math.min(
              longueur(E, F),
              longueur(G, H),
              longueur(I, J),
              longueur(K, L),
            )
            const M = translation(E, vecteur(rayonOuCote, 0))
            const N = translation(G, vecteur(0, rayonOuCote))
            const O = translation(I, vecteur(-rayonOuCote, 0))
            const P = translation(K, vecteur(0, -rayonOuCote))
            const paramsEnonce = {
              xmin: -0.5,
              ymin: -0.5,
              xmax: B.x + 0.5,
              ymax: C.y + 0.5,
              pixelsParCm: 30,
              scale: 0.7,
              mainlevee: false,
              optionsTikz: ['baseline=(current bounding box.north)'],
            }
            const aleaLongueur = choice([-1, 1])
            const choixFig = randint(0, 3)
            let pt1: PointAbstrait
            let pt2: PointAbstrait
            switch (choixFig) {
              case 0:
                pt1 = M
                pt2 = E
                paramsEnonce.ymin = -0.5 - rayonOuCote - aleaLongueur
                break
              case 1:
                pt1 = N
                pt2 = G
                paramsEnonce.xmax = rayonOuCote + aleaLongueur + B.x + 0.5
                break
              case 2:
                pt1 = O
                pt2 = I
                paramsEnonce.ymax = rayonOuCote + aleaLongueur + C.y + 0.5
                break
              case 3:
              default:
                pt1 = P
                pt2 = K
                paramsEnonce.xmin = -0.5 - rayonOuCote - aleaLongueur
                break
            }
            const aleaAngle = choice([40, 50, 70, 80])
            const Q = pointSurSegment(pt2, pt1, rayonOuCote + aleaLongueur)
            const R = rotation(Q, pt2, -aleaAngle)
            let figAire1 = polygone(pt2, pt1, R)
            figAire1.color = colorToLatexOrHTML('none')
            figAire1.couleurDeRemplissage = colorToLatexOrHTML(color[q])
            figAire1.opaciteDeRemplissage = 0.5
            const choixFig2 = randint(0, 3, [choixFig])
            const hauteur = longueur(R, projectionOrtho(R, droite(pt1, pt2))) // Longueur de la hauteur issue de R dans figAire1
            choixFigAire2 = [
              [
                E,
                M,
                arrondi(
                  Math.min(
                    hauteur / longueur(B, C),
                    longueur(E, B) / longueur(E, M),
                  ),
                ),
              ], // Le dernier nombre est le rapport homothétique maximal pour ne pas que le triangle sorte du triangle.
              [
                G,
                N,
                arrondi(
                  Math.min(
                    hauteur / longueur(A, B),
                    longueur(G, C) / longueur(G, N),
                  ),
                ),
              ],
              [
                I,
                O,
                arrondi(
                  Math.min(
                    hauteur / longueur(B, C),
                    longueur(I, D) / longueur(I, O),
                  ),
                ),
              ],
              [
                K,
                P,
                arrondi(
                  Math.min(
                    hauteur / longueur(A, B),
                    longueur(K, A) / longueur(K, P),
                  ),
                ),
              ],
            ]
            if (choixFig2 === 1) paramsEnonce.xmax = rayonOuCote + B.x + 0.5
            if (choixFig2 === 3) paramsEnonce.xmin = -0.5 - rayonOuCote
            const S = pointSurSegment(
              choixFigAire2[choixFig2][1],
              choixFigAire2[choixFig2][0],
              rayonOuCote + aleaLongueur,
            )
            const T = rotation(S, choixFigAire2[choixFig2][1], -aleaAngle)
            let figAire2 = polygone(
              choixFigAire2[choixFig2][0],
              choixFigAire2[choixFig2][1],
              T,
            )
            const aleaRapportHomothetie = choice([
              0.7,
              0.8,
              arrondi(Math.min(1.2, choixFigAire2[choixFig2][2] - 0.01)),
              Math.min(1.3, arrondi(choixFigAire2[choixFig2][2] - 0.01)),
            ])
            figAire2 = homothetie(
              figAire2,
              choixFigAire2[choixFig2][0],
              aleaRapportHomothetie,
            )
            figAire2.color = colorToLatexOrHTML('none')
            figAire2.couleurDeRemplissage = colorToLatexOrHTML('white')
            figAire2.opaciteDeRemplissage = 1.1
            objets.push(
              figAire1,
              figAire2,
              segment(pt2, R),
              segment(pt1, R),
              rect,
            )
            objets.push(
              homothetie(
                segment(choixFigAire2[choixFig2][0], T) as ISegment,
                choixFigAire2[choixFig2][0],
                aleaRapportHomothetie,
              ),
              homothetie(
                segment(choixFigAire2[choixFig2][1], T) as ISegment,
                choixFigAire2[choixFig2][0],
                aleaRapportHomothetie,
              ),
            )
            texte = mathalea2d(paramsEnonce, objets)
            // Correction
            texteCorr = this.sup2 === 3 ? numAlpha(0) : ''
            texteCorr +=
              this.sup2 === 1 || this.sup2 === 3 || aireOuPerimetre !== 'Aire'
                ? correctionPerimetre(true, comparePerimetre)
                : ''
            texteCorr += this.sup2 === 3 ? '<br>' + numAlpha(1) : ''
            texteCorr +=
              aleaRapportHomothetie < 1
                ? this.sup2 === 2 ||
                  this.sup2 === 3 ||
                  aireOuPerimetre !== 'Perimetre'
                  ? `Le rectangle hachuré couvre moins de surface que la figure coloriée. Conclusion : ${texteEnCouleurEtGras('La figure coloriée')} a une aire plus grande que celle du rectangle hachuré.`
                  : ''
                : this.sup2 === 2 ||
                    this.sup2 === 3 ||
                    aireOuPerimetre !== 'Perimetre'
                  ? `Le rectangle hachuré couvre plus de surface que la figure coloriée. Conclusion : ${texteEnCouleurEtGras('Le rectangle hachuré')} a une aire plus grande que celle de la figure coloriée.`
                  : ''
            if (
              this.sup2 === 2 ||
              this.sup2 === 3 ||
              aireOuPerimetre !== 'Perimetre'
            ) {
              objets = []
              figAire1 = polygone(pt2, pt1, R)
              figAire1.color = colorToLatexOrHTML('none')
              figAire1.couleurDeRemplissage = colorToLatexOrHTML('white')
              figAire1.opaciteDeRemplissage = 1.1
              const figAireCorr = polygone(pt2, pt1, R)
              figAireCorr.couleurDeRemplissage = colorToLatexOrHTML(color[q])
              figAireCorr.opaciteDeRemplissage = 0.5
              const figAire2Corr = homothetie(
                figAire2,
                choixFigAire2[choixFig2][0],
                1 / aleaRapportHomothetie,
              )
              let angleCorr =
                choixFig2 - choixFig < 0
                  ? choixFig2 - choixFig + 4
                  : choixFig2 - choixFig
              angleCorr = angleCorr === 1 ? 90 : angleCorr === 2 ? 0 : -90
              const figAireCorr2 = rotation(
                figAire2Corr,
                choixFigAire2[choixFig2][0],
                angleCorr,
              )
              figAireCorr2.couleurDeRemplissage = colorToLatexOrHTML(color[q])
              figAireCorr2.opaciteDeRemplissage = 0.5
              objets.push(
                poly,
                figAire1,
                figAire2,
                segment(pt2, R),
                segment(pt1, R),
                rect,
              )
              objets.push(
                homothetie(
                  segment(choixFigAire2[choixFig2][0], T) as ISegment,
                  choixFigAire2[choixFig2][0],
                  aleaRapportHomothetie,
                ),
                homothetie(
                  segment(choixFigAire2[choixFig2][1], T) as ISegment,
                  choixFigAire2[choixFig2][0],
                  aleaRapportHomothetie,
                ),
              )
              if (context.isHtml)
                objets.push(
                  translationPuisRotationAnimees(
                    String(q),
                    figAireCorr,
                    vecteur(pt1, choixFigAire2[choixFig2][0]),
                    figAireCorr2,
                    choixFigAire2[choixFig2][0],
                    -angleCorr,
                  ),
                )
              paramsEnonce.ymin =
                choixFig2 === 0 ? -0.5 - rayonOuCote : paramsEnonce.ymin
              paramsEnonce.ymax =
                choixFig2 === 2 ? rayonOuCote + C.y + 0.5 : paramsEnonce.ymax
              texteCorr += '<br>' + mathalea2d(paramsEnonce, objets)
              if (context.isHtml) {
                texteCorr += `<br><button class="btn ui labeled icon button"  style="margin:10px" onclick="document.getElementById('${figAireCorr.id}').style.visibility = 'visible',document.getElementById('${figAireCorr2.id}').style.visibility = 'hidden',
              setTimeout(function() {document.getElementById('${figAireCorr.id}').style.visibility = 'hidden'}, 5000),
              setTimeout(function() {document.getElementById('${figAireCorr2.id}').style.visibility = 'visible'}, 5000),document.getElementById('translat${q}').beginElement()"><i class="redo circle icon"></i>Relancer l'animation de la comparaison d'aires </button>`
              }
            }
            // QCM interactif
            if (this.interactif) {
              reponseAire1 = !(aleaRapportHomothetie < 1)
              reponseAire2 = aleaRapportHomothetie < 1
            }
          }
          break
        case 11:
          {
            // Deux triangles en plus
            const E = pointAbstrait(entreDeux(A.x, A.x + (B.x - A.x) / 3), A.y)
            const F = pointAbstrait(
              entreDeux(B.x, A.x + (2 * (B.x - A.x)) / 3),
              A.y,
            )
            const G = pointAbstrait(B.x, entreDeux(B.y, B.y + (C.y - B.y) / 3))
            const H = pointAbstrait(
              B.x,
              entreDeux(C.y, B.y + (2 * (C.y - B.y)) / 3),
            )
            const I = pointAbstrait(
              entreDeux(B.x, A.x + (2 * (B.x - A.x)) / 3),
              D.y,
            )
            const J = pointAbstrait(entreDeux(A.x, A.x + (B.x - A.x) / 3), D.y)
            const K = pointAbstrait(
              A.x,
              entreDeux(C.y, B.y + (2 * (C.y - B.y)) / 3),
            )
            const L = pointAbstrait(A.x, entreDeux(B.y, B.y + (C.y - B.y) / 3))
            const poly = polygone(A, B, C, D)
            poly.couleurDeRemplissage = colorToLatexOrHTML(color[q])
            poly.opaciteDeRemplissage = 0.5
            poly.color = colorToLatexOrHTML('none')
            objets.push(poly)
            const rayonOuCote = Math.min(
              longueur(E, F),
              longueur(G, H),
              longueur(I, J),
              longueur(K, L),
            )
            const M = translation(E, vecteur(rayonOuCote, 0))
            const N = translation(G, vecteur(0, rayonOuCote))
            const O = translation(I, vecteur(-rayonOuCote, 0))
            const P = translation(K, vecteur(0, -rayonOuCote))
            const paramsEnonce = {
              xmin: -0.5,
              ymin: -0.5,
              xmax: B.x + 0.5,
              ymax: C.y + 0.5,
              pixelsParCm: 30,
              scale: 0.7,
              mainlevee: false,
              optionsTikz: ['baseline=(current bounding box.north)'],
            }
            const aleaLongueur = choice([-1, 1])
            const choixFig = randint(0, 3)
            let pt1: PointAbstrait
            let pt2: PointAbstrait
            switch (choixFig) {
              case 0:
                pt1 = M
                pt2 = E
                paramsEnonce.ymin = -0.5 - rayonOuCote - aleaLongueur
                break
              case 1:
                pt1 = N
                pt2 = G
                paramsEnonce.xmax = rayonOuCote + aleaLongueur + B.x + 0.5
                break
              case 2:
                pt1 = O
                pt2 = I
                paramsEnonce.ymax = rayonOuCote + aleaLongueur + C.y + 0.5
                break
              case 3:
              default:
                pt1 = P
                pt2 = K
                paramsEnonce.xmin = -0.5 - rayonOuCote - aleaLongueur
                break
            }
            const aleaAngle = choice([40, 50, 70, 80, 100, 110])
            const Q = pointSurSegment(pt2, pt1, rayonOuCote + aleaLongueur)
            const R = rotation(Q, pt2, -aleaAngle)
            switch (choixFig) {
              case 0:
              case 2:
                paramsEnonce.xmin = -0.5 + Math.min(A.x, R.x)
                paramsEnonce.xmax = 0.5 + Math.max(B.x, R.x)
                break
              case 1:
              case 3:
                paramsEnonce.ymin = -0.5 + Math.min(A.y, R.y)
                paramsEnonce.ymax = 0.5 + Math.max(D.y, R.y)
                break
            }
            const figAire1 = polygone(pt2, pt1, R)
            figAire1.color = colorToLatexOrHTML('none')
            figAire1.couleurDeRemplissage = colorToLatexOrHTML(color[q])
            figAire1.opaciteDeRemplissage = 0.5
            const choixFig2 = randint(0, 3, [choixFig])
            choixFigAire2 = [
              [E, M],
              [G, N],
              [I, O],
              [K, P],
            ]
            const S = pointSurSegment(
              choixFigAire2[choixFig2][1],
              choixFigAire2[choixFig2][0],
              rayonOuCote + aleaLongueur,
            )
            const T = rotation(S, choixFigAire2[choixFig2][1], aleaAngle)
            switch (choixFig2) {
              case 0:
                paramsEnonce.xmin = -0.5 + Math.min(A.x, T.x, R.x)
                paramsEnonce.xmax = 0.5 + Math.max(B.x, T.x, R.x)
                paramsEnonce.ymin = -0.5 - rayonOuCote - aleaLongueur
                break
              case 1:
                paramsEnonce.ymin = -0.5 + Math.min(A.y, T.y, R.y)
                paramsEnonce.ymax = 0.5 + Math.max(D.y, T.y, R.y)
                paramsEnonce.xmax = rayonOuCote + aleaLongueur + B.x + 0.5
                break
              case 2:
                paramsEnonce.xmin = -0.5 + Math.min(A.x, T.x, R.x)
                paramsEnonce.xmax = 0.5 + Math.max(B.x, T.x, R.x)
                paramsEnonce.ymax = rayonOuCote + aleaLongueur + C.y + 0.5
                break
              case 3:
                paramsEnonce.ymin = -0.5 + Math.min(A.y, T.y, R.y)
                paramsEnonce.ymax = 0.5 + Math.max(D.y, T.y, R.y)
                paramsEnonce.xmin = -0.5 - rayonOuCote - aleaLongueur
                break
            }
            const figAire2 = polygone(
              choixFigAire2[choixFig2][0],
              choixFigAire2[choixFig2][1],
              T,
            )
            figAire2.color = colorToLatexOrHTML('none')
            figAire2.couleurDeRemplissage = colorToLatexOrHTML(color[q])
            figAire2.opaciteDeRemplissage = 0.5
            objets.push(
              figAire1,
              figAire2,
              segment(pt2, R),
              segment(pt1, R),
              codageSegment(pt2, R, '|||'),
              codageSegment(pt2, pt1, 'OO'),
              codageSegment(pt1, R, 'XX'),
              rect,
            )
            objets.push(
              segment(choixFigAire2[choixFig2][0], T),
              segment(choixFigAire2[choixFig2][1], T),
              codageSegment(choixFigAire2[choixFig2][1], T, '|||'),
              codageSegment(
                choixFigAire2[choixFig2][1],
                choixFigAire2[choixFig2][0],
                'OO',
              ),
              codageSegment(choixFigAire2[choixFig2][0], T, 'XX'),
            )
            texte = mathalea2d(paramsEnonce, objets)
            // Correction
            texteCorr = this.sup2 === 3 ? numAlpha(0) : ''
            texteCorr +=
              this.sup2 === 1 || this.sup2 === 3 || aireOuPerimetre !== 'Aire'
                ? correctionPerimetre(true, comparePerimetre)
                : ''
            texteCorr += this.sup2 === 3 ? '<br>' + numAlpha(1) : ''
            texteCorr +=
              this.sup2 === 2 ||
              this.sup2 === 3 ||
              aireOuPerimetre !== 'Perimetre'
                ? `Le rectangle hachuré couvre moins de surface que la figure coloriée. Conclusion : ${texteEnCouleurEtGras('La figure coloriée')} a une aire plus grande que celle du rectangle hachuré.`
                : ''
            // QCM interactif
            if (this.interactif) {
              reponseAire2 = true
            }
          }
          break
        case 12:
          {
            // Deux triangles en moins
            const E = pointAbstrait(entreDeux(A.x, A.x + (B.x - A.x) / 3), A.y)
            const F = pointAbstrait(
              entreDeux(B.x, A.x + (2 * (B.x - A.x)) / 3),
              A.y,
            )
            const G = pointAbstrait(B.x, entreDeux(B.y, B.y + (C.y - B.y) / 3))
            const H = pointAbstrait(
              B.x,
              entreDeux(C.y, B.y + (2 * (C.y - B.y)) / 3),
            )
            const I = pointAbstrait(
              entreDeux(B.x, A.x + (2 * (B.x - A.x)) / 3),
              D.y,
            )
            const J = pointAbstrait(entreDeux(A.x, A.x + (B.x - A.x) / 3), D.y)
            const K = pointAbstrait(
              A.x,
              entreDeux(C.y, B.y + (2 * (C.y - B.y)) / 3),
            )
            const L = pointAbstrait(A.x, entreDeux(B.y, B.y + (C.y - B.y) / 3))
            const poly = polygone(A, B, C, D)
            poly.couleurDeRemplissage = colorToLatexOrHTML(color[q])
            poly.opaciteDeRemplissage = 1.1
            poly.color = colorToLatexOrHTML('none')
            objets.push(poly)
            const rayonOuCote = Math.min(
              longueur(E, F),
              longueur(G, H),
              longueur(I, J),
              longueur(K, L),
            )
            const M = translation(E, vecteur(rayonOuCote, 0))
            const N = translation(G, vecteur(0, rayonOuCote))
            const O = translation(I, vecteur(-rayonOuCote, 0))
            const P = translation(K, vecteur(0, -rayonOuCote))
            const paramsEnonce = {
              xmin: -0.5,
              ymin: -0.5,
              xmax: B.x + 0.5,
              ymax: C.y + 0.5,
              pixelsParCm: 30,
              scale: 0.7,
              mainlevee: false,
              optionsTikz: ['baseline=(current bounding box.north)'],
            }
            const aleaLongueur = -1
            const choixFig = randint(0, 3)
            let pt1: PointAbstrait
            let pt2: PointAbstrait
            switch (choixFig) {
              case 0:
                pt1 = M
                pt2 = E
                break
              case 1:
                pt1 = N
                pt2 = G
                break
              case 2:
                pt1 = O
                pt2 = I
                break
              case 3:
              default:
                pt1 = P
                pt2 = K
                break
            }
            let aleaAngle = choice([40, 50, 70, 80, 100, 110])
            const Q = pointSurSegment(pt2, pt1, rayonOuCote + aleaLongueur)
            let R = rotation(Q, pt2, aleaAngle)
            if (!estDansQuadrilatere(R, A, B, C, D)) {
              aleaAngle = 180 - aleaAngle
              R = rotation(Q, pt2, aleaAngle)
            }
            const figAire1 = polygone(pt2, pt1, R)
            figAire1.color = colorToLatexOrHTML('none')
            figAire1.couleurDeRemplissage = colorToLatexOrHTML('white')
            figAire1.opaciteDeRemplissage = 1.1
            const choixFig2 = randint(0, 3, [choixFig])
            choixFigAire2 = [
              [E, M],
              [G, N],
              [I, O],
              [K, P],
            ]
            let S = pointSurSegment(
              choixFigAire2[choixFig2][0],
              choixFigAire2[choixFig2][1],
              rayonOuCote + aleaLongueur,
            )
            let T = rotation(S, choixFigAire2[choixFig2][0], aleaAngle)
            if (
              !estDansQuadrilatere(T, A, B, C, D) ||
              estDansTriangle(T, pt2, pt1, R) ||
              estDansTriangle(
                R,
                choixFigAire2[choixFig2][0],
                choixFigAire2[choixFig2][1],
                T,
              )
            ) {
              // Si les triangles se croisent, on crée le symétrique du premier par rapport au centre du rectangle.
              S = milieu(A, C)
              choixFigAire2[choixFig2][1] = homothetie(pt1, S, -1)
              choixFigAire2[choixFig2][0] = homothetie(pt2, S, -1)
              T = homothetie(R, S, -1)
            }
            const figAire2 = polygone(
              choixFigAire2[choixFig2][0],
              choixFigAire2[choixFig2][1],
              T,
            )
            figAire2.color = colorToLatexOrHTML('none')
            figAire2.couleurDeRemplissage = colorToLatexOrHTML('white')
            figAire2.opaciteDeRemplissage = 1.1
            objets.push(
              figAire1,
              figAire2,
              segment(pt2, R),
              segment(pt1, R),
              codageSegment(pt2, R, '|||'),
              codageSegment(pt2, pt1, 'OO'),
              codageSegment(pt1, R, 'XX'),
              rect,
            )
            objets.push(
              segment(choixFigAire2[choixFig2][0], T),
              segment(choixFigAire2[choixFig2][1], T),
              codageSegment(choixFigAire2[choixFig2][1], T, 'XX'),
              codageSegment(
                choixFigAire2[choixFig2][1],
                choixFigAire2[choixFig2][0],
                'OO',
              ),
              codageSegment(choixFigAire2[choixFig2][0], T, '|||'),
            )
            texte = mathalea2d(paramsEnonce, objets)
            // Correction
            texteCorr = this.sup2 === 3 ? numAlpha(0) : ''
            texteCorr +=
              this.sup2 === 1 || this.sup2 === 3 || aireOuPerimetre !== 'Aire'
                ? correctionPerimetre(true, comparePerimetre)
                : ''
            texteCorr += this.sup2 === 3 ? '<br>' + numAlpha(1) : ''
            texteCorr +=
              this.sup2 === 2 ||
              this.sup2 === 3 ||
              aireOuPerimetre !== 'Perimetre'
                ? `Le rectangle hachuré couvre plus de surface que la figure coloriée. Conclusion : ${texteEnCouleurEtGras('Le rectangle hachuré')} a une aire plus grande que celle de la figure coloriée.`
                : ''
            // QCM interactif
            if (this.interactif) {
              reponseAire1 = true
            }
          }
          break
      }
      // Gestion des QCM interactifs
      let monQcmPerimetre: { texte: string; texteCorr: string } | undefined
      let monQcmAire: { texte: string; texteCorr: string } | undefined
      if (this.interactif) {
        // Le type 7 est le seul où le périmètre de la figure coloriée est plus petit que celui du rectangle
        const coloriePlusGrand = typesDeProblemes[q] !== 7
        const reponsePerimetreEstColoriee =
          coloriePlusGrand === (comparePerimetre === 'grand')
        if (this.sup2 === 1 || this.sup2 === 3 || aireOuPerimetre !== 'Aire') {
          this.autoCorrection[compteurInteractif] = {
            enonce: 'Peu importe',
            propositions: [
              {
                texte: 'Le rectangle hachuré',
                statut: !reponsePerimetreEstColoriee, // true ou false pour indiquer si c'est une bonne réponse (true)
                feedback: '',
              },
              {
                texte: 'La figure coloriée',
                statut: reponsePerimetreEstColoriee, // true ou false pour indiquer si c'est une bonne réponse (true)
                feedback: '',
              },
              {
                texte: "Autant l'un que l'autre",
                statut: false, // true ou false pour indiquer si c'est une bonne réponse (true)
                feedback: '',
              },
            ],
          }
          monQcmPerimetre = propositionsQcm(this, compteurInteractif)
          compteurInteractif++
        }
        if (
          this.sup2 === 2 ||
          this.sup2 === 3 ||
          aireOuPerimetre !== 'Perimetre'
        ) {
          this.autoCorrection[compteurInteractif] = {
            enonce: 'Peu importe',
            propositions: [
              {
                texte: 'Le rectangle hachuré',
                statut: reponseAire1, // true ou false pour indiquer si c'est une bonne réponse (true)
                feedback: '',
              },
              {
                texte: 'La figure coloriée',
                statut: reponseAire2, // true ou false pour indiquer si c'est une bonne réponse (true)
                feedback: '',
              },
              {
                texte: "Autant l'un que l'autre",
                statut: reponseAire3, // true ou false pour indiquer si c'est une bonne réponse (true)
                feedback: '',
              },
            ],
          }
          monQcmAire = propositionsQcm(this, compteurInteractif)
          compteurInteractif++
        }
      }
      // Gestion des énoncés
      if (this.sup2 === 3) texte += numAlpha(0)
      if (this.sup2 === 1 || this.sup2 === 3 || aireOuPerimetre !== 'Aire') {
        texte += `Entre le rectangle hachuré et la figure coloriée, lequel a le plus ${comparePerimetre} périmètre ?`
        if (this.interactif) {
          texte += monQcmPerimetre!.texte
        }
      }
      if (this.sup2 === 3) texte += '<br>' + numAlpha(1)
      if (
        this.sup2 === 2 ||
        this.sup2 === 3 ||
        aireOuPerimetre !== 'Perimetre'
      ) {
        texte +=
          'Entre le rectangle hachuré et la figure coloriée, lequel a la plus grande aire ?'
        if (this.interactif) {
          texte += monQcmAire!.texte
        }
      }
      if (this.questionJamaisPosee(q, A.x, A.y, B.x, B.y, C.x, C.y, D.x, D.y)) {
        this.listeQuestions[q] = texte ?? ''
        this.listeCorrections[q] = texteCorr ?? ''

        q++
      }
      cpt++
    }
    listeQuestionsToContenu(this) // On envoie l'exercice à la fonction de mise en page
  }
}
