import { arc } from '../../lib/2d/Arc'
import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { codageSegments } from '../../lib/2d/CodageSegment'
import {
  assombrirOuEclaircir,
  colorToLatexOrHTML,
} from '../../lib/2d/colorToLatexOrHtml'
import {
  Droite,
  droiteHorizontaleParPoint,
  droiteVerticaleParPoint,
} from '../../lib/2d/droites'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { mediatrice } from '../../lib/2d/Mediatrice'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { barycentre, polygone } from '../../lib/2d/polygones'
import { representant } from '../../lib/2d/representantVecteur'
import { Segment, segment } from '../../lib/2d/segmentsVecteurs'
import {
  labelPoint,
  latexParCoordonnees,
  texteParPoint,
} from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { rotation, similitude, translation } from '../../lib/2d/transformations'
import {
  milieu,
  pointIntersectionDD,
  pointSurDroite,
} from '../../lib/2d/utilitairesPoint'
import { vecteur } from '../../lib/2d/Vecteur'
import { vide2d, type Vide2d } from '../../lib/2d/Vide2d'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { bleuMathalea, orangeMathalea } from '../../lib/colors'
import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { troisPointsProportionnels } from '../../lib/interactif/fonctionsBaremes'
import type { Valeur } from '../../lib/types'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { numAlpha } from '../../lib/outils/outilString'
import {
  rotationAnimee,
  symetrieAnimee,
  translationAnimee,
} from '../../modules/2dAnimation'
import { context } from '../../modules/context'
import { imagePointParTransformation } from '../../modules/imagePointParTransformation'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  egal,
  listeQuestionsToContenuSansNumero,
  randint,
} from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'

export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'
/**
 * Trouver l'image d'une figure par diverses transformations dans un pavage (7 motifs différents)
 * @author Jean-claude Lhote
 * Relecture : Novembre 2021 par EE
 */
export default class PavagesEtTransformations extends Exercice {
  level: number
  protected centralSymmetryCount = 3
  protected groupCentralSymmetryAnswers = false
  constructor() {
    super()
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.besoinFormulaireNumerique = [
      'Transformations',
      4,
      ' 1 : Symétries axiales\n 2 : Symétries centrales\n 3 : Translations\n 4 : Rotations\n 5 : Homothéties\n',
    ]
    this.listeAvecNumerotation = false
    this.besoinFormulaire2Texte = [
      'Choix des pavages',
      'Nombres séparés par des tirets :\nChoix entre 1 et 7\nChoix 8 pour un mélange de tous les pavages',
    ]
    this.sup2 = 1
    // this.sup = 1 // 1 pour symétrie axiale, 2 pour symétrie centrale, 3 pour translations, et 4 pour rotations ; paramètre fixé par les variantes respectives.
    this.sup = 1
    this.level = 6
  }

  protected chooseTiling(): number {
    switch (this.sup) {
      case 2:
      case 3:
        return randint(0, 7)
      default:
        return 0
    }
  }

  protected centralSymmetryField(index: number): string {
    return this.groupCentralSymmetryAnswers
      ? context.isAmc
        ? ''
        : `%{champ${index + 1}}`
      : ajouteChampTexteMathLive(this, index, KeyboardType.clavierNumbers)
  }

  nouvelleVersion(numeroExercice: number) {
    const objetsEnonce = []
    const objetsCorrection: NestedObjetMathalea2dArray = []
    if (this.level === 3) {
      this.besoinFormulaireNumerique = false
      this.besoinFormulaire2Texte = false
      this.sup = 4
    } else if (this.level === 4) {
      this.sup = 3
    } else if (this.level === 5) {
      this.sup = 2
    } else this.sup = 1
    // listes de pavages [nx,ny,xB,yB,xC,yC,xD,yD,zoom,angle]  : 0=carrés, 1=cerf-volant 2=quadri concave 3=quadri quelconque 4=parallélogrammes 5=triangles rectangles isocèles 6=triangles équilatéraux 7=losanges
    const paves = [
      [5, 5, 4, 0, 4, 4, 0, 4, 30, 0],
      [5, 5, 6, 0, 8, 8, 0, 6, 60, -9],
      [5, 5, 8, 0, 4, 4, 2, 8, 50, 0],
      [5, 5, 4, 0, 6, 4, 0, 6, 50, 11],
      [4, 6, 8, 0, 7, 4, -1, 4, 50, 0],
      [5, 5, 8, 0, 4, 4, 0, 8, 50, 0],
      [
        5,
        5,
        4,
        0,
        3,
        2 * Math.sin(Math.PI / 3),
        2,
        4 * Math.sin(Math.PI / 3),
        20,
        20,
      ],
      [4, 4, 3, 1, 4, 4, 1, 3, 20, -18],
    ]
    const quad = []
    const quadCorr = []
    let labelCentre1, labelCentre2, labelCentre3
    let quad1
    let quad2
    let quad3
    let mediatrice1,
      mediatrice2,
      mediatrice3,
      centre1,
      centre2,
      centre3,
      arc1,
      arc2,
      arc3,
      rayon11,
      rayon12,
      rayon21,
      rayon22,
      rayon31,
      rayon32
    let vecteur1: Segment | Vide2d = vide2d()
    let vecteur2: Segment | Vide2d = vide2d()
    let vecteur3: Segment | Vide2d = vide2d()
    let origine1, origine2, origine3, indexsym2, indexsym1, indexsym3
    let segCorr11: Segment | Vide2d = vide2d()
    let segCorr12: Segment | Vide2d = vide2d()
    let segCorr21: Segment | Vide2d = vide2d()
    let segCorr22: Segment | Vide2d = vide2d()
    let segCorr31: Segment | Vide2d = vide2d()
    let segCorr32: Segment | Vide2d = vide2d()
    let iB1, iB2, iB3, iC1, iA1, iD1
    let texte = ''
    let texteCorr = ''
    const tabfigA = []
    const tabfigB = []
    const tabfigC = []
    const tabfigD = []
    let pave = []
    const choixPave = this.chooseTiling()
    pave = paves[choixPave]
    let B, C, D
    const nx = pave[0]
    const ny = pave[1]
    let xB = pave[2]
    let yB = pave[3]
    let xC = pave[4]
    let yC = pave[5]
    let xD = pave[6]
    let yD = pave[7]
    const Zoom = pave[8]
    const Angle = pave[9]
    const A = pointAbstrait(0, 0)
    if (choixPave !== 0) {
      // } && choixPave !== 6 && choixPave !== 7) {
      B = similitude(pointAbstrait(xB, yB), A, Angle, 22 / Zoom)
      C = similitude(pointAbstrait(xC, yC), A, Angle, 22 / Zoom)
      D = similitude(pointAbstrait(xD, yD), A, Angle, 22 / Zoom)
      xB = B.x
      yB = B.y
      xC = C.x
      yC = C.y
      xD = D.x
      yD = D.y
    } else {
      B = pointAbstrait(xB, yB)
      C = pointAbstrait(xC, yC)
      D = pointAbstrait(xD, yD)
    }
    const xAI = xB + xC - xD
    const yAI = yB + yC - yD
    const I = milieu(B, C)
    const J = milieu(D, C)
    const xAJ = xC + xD - xB
    const yAJ = yC + yD - yB
    let xAxy, yAxy, numAxy
    let punto = [0, 0, 0]
    let trouver = false
    let indexA
    let numA
    let indexcentre1
    let xmil1 = 0
    let ymil1 = 0
    let indexD
    let numD
    let indexcentre2
    let xmil2 = 0
    let ymil2 = 0
    let indexC
    let numC
    let indexcentre3
    let xmil3 = 0
    let ymil3 = 0
    let num1
    let num2
    let num3
    let xc = 0
    let yc = 0
    let xb = 0
    let yb = 0
    let xa = 0
    let ya = 0
    let xV1 = 0
    let yV1 = 0
    let xV2 = 0
    let yV2 = 0
    let xV3 = 0
    let yV3 = 0
    const s0 = choice(['S', 'T', 'L', 'W', 'R', 'G', 'E', 'F', 'G', 'K'])
    const s1 = choice(['S', 'T', 'L', 'W', 'R', 'G', 'E', 'F', 'G', 'K'], [s0])
    const s2 = choice(
      ['S', 'T', 'L', 'W', 'R', 'G', 'E', 'F', 'G', 'K'],
      [s0, s1],
    )
    const Xmin = Math.min(-1, ny * xAJ)
    const Xmax = Math.max(nx * xAI + 1, nx * xAI + ny * xAJ + 1)
    const Ymin = Math.min(-1, nx * yAI)
    const Ymax = Math.max(nx * yAI + ny * yAJ + 1, ny * yAJ + 1)

    for (let y = 0; y < ny; y++) {
      // On initialise les tableaux avec les coordonnées des puntos de référence (A,B,C et D) de chaque translaté et son numéro dans le pavage.
      for (let x = 0; x < nx; x++) {
        xAxy = Math.round((x * xAI + y * xAJ) * 100) / 100
        yAxy = Math.round((x * yAI + y * yAJ) * 100) / 100
        numAxy = 2 * x + 4 * y * nx
        tabfigA.push([xAxy, yAxy, numAxy])
        quad[numAxy] = translation(polygone(A, B, C, D), vecteur(xAxy, yAxy))
        quadCorr[numAxy] = translation(
          polygone(A, B, C, D),
          vecteur(xAxy, yAxy),
        )
        tabfigB.push([
          xAxy + Math.round(xB * 100) / 100,
          yAxy + Math.round(yB * 100) / 100,
          numAxy + 1,
        ])
        quad[numAxy + 1] = translation(
          rotation(polygone(A, B, C, D), I, 180),
          vecteur(xAxy, yAxy),
        )
        quadCorr[numAxy + 1] = translation(
          rotation(polygone(A, B, C, D), I, 180),
          vecteur(xAxy, yAxy),
        )
        tabfigD.push([
          xAxy + Math.round(xD * 100) / 100,
          yAxy + Math.round(yD * 100) / 100,
          numAxy + 2 * nx,
        ])
        quad[numAxy + 2 * nx] = translation(
          rotation(polygone(A, B, C, D), J, 180),
          vecteur(xAxy, yAxy),
        )
        quadCorr[numAxy + 2 * nx] = translation(
          rotation(polygone(A, B, C, D), J, 180),
          vecteur(xAxy, yAxy),
        )
        tabfigC.push([
          xAxy + Math.round(xC * 100) / 100,
          yAxy + Math.round(yC * 100) / 100,
          numAxy + 2 * nx + 1,
        ])
        quad[numAxy + 2 * nx + 1] = translation(
          translation(polygone(A, B, C, D), vecteur(A, C)),
          vecteur(xAxy, yAxy),
        )
        quadCorr[numAxy + 2 * nx + 1] = translation(
          translation(polygone(A, B, C, D), vecteur(A, C)),
          vecteur(xAxy, yAxy),
        )
      }
    }
    for (let i = 0; i < quad.length; i++) {
      objetsEnonce.push(
        quad[i],
        texteParPoint(
          String(i),
          barycentre(quad[i], '', 'center'),
          0,
          'black',
          1,
          'milieu',
          false,
        ),
      )
      quadCorr[i].color = colorToLatexOrHTML(assombrirOuEclaircir('gray', 50))
      objetsCorrection.push(
        quadCorr[i],
        texteParPoint(
          String(i),
          barycentre(quad[i], '', 'center'),
          0,
          assombrirOuEclaircir('gray', 50),
          1,
          'milieu',
          false,
        ),
      )
    }

    // context.fenetreMathalea2d = [Xmin, Ymin, Xmax, Ymax]
    let trace, label, pt1, pt2
    let texteAMC1 = ''
    let texteAMC2 = ''
    let texteAMC3 = ''
    let consigneAMC = ''
    switch (parseInt(this.sup)) {
      case 1: // symétrie axiale
        // Première question : une figure type A par symétrie d'axe // à [BD] est une figure type A. le symétrique du sommet A est le sommet C
        indexA = randint(0, nx * ny - 1)
        numA = tabfigA[indexA][2]
        indexsym1 = randint(0, nx * ny - 1, [indexA]) // sert à choisir un axe [BD].
        xmil1 = tabfigD[indexsym1][0] // sert pour faire passer l'axe de symétrie.
        ymil1 = tabfigD[indexsym1][1]
        punto = imagePointParTransformation(
          2,
          [tabfigA[indexA][0], tabfigA[indexA][1]],
          [xmil1, ymil1],
        )
        trouver = false
        while (trouver === false) {
          for (let j = 0; j < nx * ny; j++) {
            if (
              egal(punto[0], tabfigC[j][0], 0.05) &&
              egal(punto[1], tabfigC[j][1], 0.05)
            ) {
              trouver = true
              num1 = tabfigA[j][2]
              xa = tabfigA[indexA][0]
              ya = tabfigA[indexA][1]
              mediatrice1 = mediatrice(
                pointAbstrait(xa, ya),
                pointAbstrait(punto[0], punto[1]),
                '',
                context.isAmc ? 'black' : 'green',
              ) as Droite
              mediatrice1.epaisseur = 2
              segCorr11 = segment(
                pointAbstrait(xa, ya),
                milieu(
                  pointAbstrait(xa, ya),
                  pointAbstrait(punto[0], punto[1]),
                ),
                context.isAmc ? 'black' : 'green',
              )
              segCorr12 = segment(
                pointAbstrait(punto[0], punto[1]),
                milieu(
                  pointAbstrait(xa, ya),
                  pointAbstrait(punto[0], punto[1]),
                ),
                context.isAmc ? 'black' : 'green',
              )
              segCorr11.epaisseur = 2
              segCorr11.pointilles = 2
              segCorr12.epaisseur = 2
              segCorr12.pointilles = 2
              objetsCorrection.push(
                codageAngleDroit(
                  pointSurDroite(mediatrice1, 1, ''),
                  milieu(
                    pointAbstrait(xa, ya),
                    pointAbstrait(punto[0], punto[1]),
                  ),
                  pointAbstrait(xa, ya),
                  context.isAmc ? 'black' : 'green',
                  0.8,
                  1,
                ),
              )
              quad[numA].couleurDeRemplissage = colorToLatexOrHTML(
                context.isAmc ? 'black' : 'green',
              )
              quad[numA].opaciteDeRemplissage = 0.6
              break
            }
          }
          if (trouver === false) {
            indexA = randint(0, nx * ny - 1)
            numA = tabfigA[indexA][2]
            indexsym1 = randint(0, nx * ny - 1, [indexA])
            xmil1 = tabfigD[indexsym1][0]
            ymil1 = tabfigD[indexsym1][1]
            punto = imagePointParTransformation(
              2,
              [tabfigA[indexA][0], tabfigA[indexA][1]],
              [xmil1, ymil1],
            )
          }
        }
        texteAMC1 =
          numAlpha(0) +
          ' Quel est le numéro de la figure symétrique de la figure ' +
          texteEnCouleurEtGras(`$${numA}$`, context.isAmc ? 'black' : 'green') +
          ` dans la symétrie d'axe  $${miseEnEvidence('(d_1)', context.isAmc ? 'black' : 'green')}$  ?` +
          ajouteChampTexteMathLive(this, 0, KeyboardType.clavierNumbers) +
          '<br>'
        texte += texteAMC1
        texteCorr +=
          numAlpha(0) +
          ' La figure symétrique de la figure ' +
          texteEnCouleurEtGras(`$${numA}$`, context.isAmc ? 'black' : 'green') +
          ` dans la symétrie d'axe  $${miseEnEvidence('(d_1)', context.isAmc ? 'black' : 'green')}$  porte le numéro $${miseEnEvidence(String(num1))}$.<br>`

        // Deuxième question : une figure type D par symétrie d'axe // à [AC] est une figure type B. le symétrique du sommet B est le sommet D
        indexD = randint(0, nx * ny - 1)
        numD = tabfigD[indexD][2]
        indexsym2 = randint(0, nx * ny - 1, [indexD]) // sert à choisir un axe [AC].
        xmil2 = tabfigA[indexsym2][0] // sert pour faire passer l'axe de symétrie.
        ymil2 = tabfigA[indexsym2][1]
        punto = imagePointParTransformation(
          1,
          [tabfigD[indexD][0], tabfigD[indexD][1]],
          [xmil2, ymil2],
        )
        trouver = false
        while (trouver === false) {
          for (let j = 0; j < nx * ny; j++) {
            if (
              egal(punto[0], tabfigB[j][0], 0.05) &&
              egal(punto[1], tabfigB[j][1], 0.05)
            ) {
              trouver = true
              num2 = tabfigB[j][2]
              xb = tabfigD[indexD][0]
              yb = tabfigD[indexD][1] - 4
              mediatrice2 = mediatrice(
                pointAbstrait(xb, yb + 4),
                pointAbstrait(punto[0], punto[1]),
                '',
                context.isAmc ? 'black' : 'red',
              ) as Droite
              mediatrice2.epaisseur = 2
              segCorr21 = segment(
                pointAbstrait(xb, yb + 4),
                milieu(
                  pointAbstrait(xb, yb + 4),
                  pointAbstrait(punto[0], punto[1]),
                ),
                context.isAmc ? 'black' : 'red',
              )
              segCorr22 = segment(
                pointAbstrait(punto[0], punto[1]),
                milieu(
                  pointAbstrait(xb, yb + 4),
                  pointAbstrait(punto[0], punto[1]),
                ),
                context.isAmc ? 'black' : 'red',
              )
              segCorr21.epaisseur = 2
              segCorr21.pointilles = 2
              segCorr22.epaisseur = 2
              segCorr22.pointilles = 2
              objetsCorrection.push(
                codageAngleDroit(
                  pointSurDroite(mediatrice2, 1, ''),
                  milieu(
                    pointAbstrait(xb, yb + 4),
                    pointAbstrait(punto[0], punto[1]),
                  ),
                  pointAbstrait(xb, yb + 4),
                  context.isAmc ? 'black' : 'red',
                  0.8,
                  1,
                ),
              )
              quad[numD].couleurDeRemplissage = colorToLatexOrHTML(
                context.isAmc ? 'black' : 'red',
              )
              quad[numD].opaciteDeRemplissage = 0.6

              break
            }
          }
          if (trouver === false) {
            indexD = randint(0, nx * ny - 1)
            numD = tabfigD[indexD][2]
            indexsym2 = randint(0, nx * ny - 1, [indexD]) // sert à choisir un axe [AC].
            xmil2 = tabfigA[indexsym2][0] // sert pour faire passer l'axe de symétrie.
            ymil2 = tabfigA[indexsym2][1]
            punto = imagePointParTransformation(
              1,
              [tabfigD[indexD][0], tabfigD[indexD][1]],
              [xmil2, ymil2],
            )
          }
        }
        texteAMC2 =
          numAlpha(1) +
          ' Quel est le numéro de la figure symétrique de la figure ' +
          texteEnCouleurEtGras(`$${numD}$`, context.isAmc ? 'black' : 'red') +
          ` dans la symétrie d'axe  $${miseEnEvidence('(d_2)', context.isAmc ? 'black' : 'red')}$  ?` +
          ajouteChampTexteMathLive(this, 1, KeyboardType.clavierNumbers) +
          '<br>'
        texte += '<br>' + texteAMC2
        texteCorr +=
          '<br>' +
          numAlpha(1) +
          ' La figure symétrique de la figure ' +
          texteEnCouleurEtGras(`$${numD}$`, context.isAmc ? 'black' : 'red') +
          ` dans la symétrie d'axe  $${miseEnEvidence('(d_2)', context.isAmc ? 'black' : 'red')}$  porte le numéro $${miseEnEvidence(String(num2))}$.<br>`

        // troisième question : une figure type D par symétrie d'axe // à [DC] est une figure type A. le symétrique du sommet D est le sommet A'
        indexC = randint(0, nx * ny - 1)
        numC = tabfigC[indexC][2]
        indexsym3 = randint(0, 4, Math.floor(indexC / 5)) * 5 // sert à choisir un axe [AC].
        xmil3 = tabfigC[indexsym3][0] // sert pour faire passer l'axe de symétrie.
        ymil3 = tabfigC[indexsym3][1]
        punto = imagePointParTransformation(
          3,
          [tabfigC[indexC][0], tabfigC[indexC][1]],
          [xmil3, ymil3],
        )
        trouver = false
        while (trouver === false) {
          for (let j = 0; j < nx * ny; j++) {
            if (
              egal(punto[0], tabfigC[j][0], 0.05) &&
              egal(punto[1], tabfigC[j][1], 0.05)
            ) {
              trouver = true
              num3 = tabfigB[j][2]
              xc = tabfigC[indexC][0]
              yc = tabfigC[indexC][1]
              mediatrice3 = mediatrice(
                pointAbstrait(xc, yc),
                pointAbstrait(punto[0], punto[1]),
                '',
                context.isAmc ? 'black' : bleuMathalea,
              ) as Droite
              mediatrice3.epaisseur = 2
              segCorr31 = segment(
                pointAbstrait(xc, yc),
                milieu(
                  pointAbstrait(xc, yc),
                  pointAbstrait(punto[0], punto[1]),
                ),
                context.isAmc ? 'black' : bleuMathalea,
              )
              segCorr32 = segment(
                pointAbstrait(punto[0], punto[1]),
                milieu(
                  pointAbstrait(xc, yc),
                  pointAbstrait(punto[0], punto[1]),
                ),
                context.isAmc ? 'black' : bleuMathalea,
              )
              segCorr31.epaisseur = 2
              segCorr31.pointilles = 2
              segCorr32.epaisseur = 2
              segCorr32.pointilles = 2
              objetsCorrection.push(
                codageAngleDroit(
                  pointSurDroite(mediatrice3, 1, ''),
                  milieu(
                    pointAbstrait(xc, yc),
                    pointAbstrait(punto[0], punto[1]),
                  ),
                  pointAbstrait(xc, yc),
                  context.isAmc ? 'black' : bleuMathalea,
                  0.8,
                  1,
                ),
              )
              quad[numC].couleurDeRemplissage = colorToLatexOrHTML(
                context.isAmc ? 'black' : bleuMathalea,
              )
              quad[numC].opaciteDeRemplissage = 0.6
              break
            }
          }
          if (trouver === false) {
            indexC = randint(0, nx * ny - 1)
            numC = tabfigC[indexC][2]
            const indexsym3 = randint(0, 4, Math.floor(indexC / 5)) * 5 // sert à choisir un axe [AC].
            xmil3 = tabfigC[indexsym3][0] // sert pour faire passer l'axe de symétrie.
            ymil3 = tabfigC[indexsym3][1]
            punto = imagePointParTransformation(
              3,
              [tabfigC[indexC][0], tabfigC[indexC][1]],
              [xmil3, ymil3],
            )
          }
        }
        texteAMC3 =
          numAlpha(2) +
          ' Quel est le numéro de la figure symétrique de la figure ' +
          texteEnCouleurEtGras(
            `$\\mathbf{${numC}}$`,
            context.isAmc ? 'black' : bleuMathalea,
          ) +
          ` dans la symétrie d'axe  $${miseEnEvidence('(d_3)', context.isAmc ? 'black' : bleuMathalea)}$  ?` +
          ajouteChampTexteMathLive(this, 2, KeyboardType.clavierNumbers) +
          '<br>'
        texte += '<br>' + texteAMC3
        texteCorr +=
          '<br>' +
          numAlpha(2) +
          ' La figure symétrique de la figure ' +
          texteEnCouleurEtGras(
            `$\\mathbf{${numC}}$`,
            context.isAmc ? 'black' : bleuMathalea,
          ) +
          ` dans la symétrie d'axe  $${miseEnEvidence('(d_3)', context.isAmc ? 'black' : bleuMathalea)}$  porte le numéro $${miseEnEvidence(String(num3))}$.<br>`
        if (
          mediatrice1 == null ||
          mediatrice2 == null ||
          mediatrice3 == null ||
          num1 == null ||
          num2 == null ||
          num3 == null
        ) {
          throw Error(
            'mediatrice1, mediatrice2 ou mediatrice3 ou num1, num2 ou num3 est null',
          )
        }
        objetsEnonce.push(mediatrice1, mediatrice2, mediatrice3)
        objetsCorrection.push(mediatrice1, mediatrice2, mediatrice3)
        if (context.isHtml)
          objetsCorrection.push(
            symetrieAnimee(
              quad[numA],
              mediatrice1,
              `id="anim${numeroExercice}A" dur ="2s" repeatcount="1"`,
            ),
            symetrieAnimee(
              quad[numD],
              mediatrice2,
              `id="anim${numeroExercice}B" dur="2s" repeatcount="1"`,
            ),
            symetrieAnimee(
              quad[numC],
              mediatrice3,
              `id="anim${numeroExercice}C" dur="2s" repeatcount="1"`,
            ),
          )

        pt1 = pointIntersectionDD(
          mediatrice1,
          droiteHorizontaleParPoint(
            pointAbstrait(
              context.fenetreMathalea2d[2],
              context.fenetreMathalea2d[3],
            ),
          ),
        )
        pt2 = pointIntersectionDD(
          mediatrice1,
          droiteVerticaleParPoint(
            pointAbstrait(
              context.fenetreMathalea2d[0],
              context.fenetreMathalea2d[1],
            ),
          ),
        )
        if (pt1.x > pt2.x) {
          objetsEnonce.push(
            latexParCoordonnees(
              '(d_1)',
              pt1.x,
              pt1.y - 2.5,
              context.isAmc ? 'black' : 'green',
              20,
              10,
              '',
              12,
            ),
          )
          objetsCorrection.push(
            latexParCoordonnees(
              '(d_1)',
              pt1.x,
              pt1.y - 2.5,
              context.isAmc ? 'black' : 'green',
              20,
              10,
              '',
              12,
            ),
          )
        } else {
          objetsEnonce.push(
            latexParCoordonnees(
              '(d_1)',
              pt2.x + 2.5,
              pt2.y,
              context.isAmc ? 'black' : 'green',
              20,
              10,
              '',
              12,
            ),
          )
          objetsCorrection.push(
            latexParCoordonnees(
              '(d_1)',
              pt2.x + 2.5,
              pt2.y,
              context.isAmc ? 'black' : 'green',
              20,
              10,
              '',
              12,
            ),
          )
        }

        pt1 = pointIntersectionDD(
          mediatrice2,
          droiteHorizontaleParPoint(
            pointAbstrait(
              context.fenetreMathalea2d[0],
              context.fenetreMathalea2d[1],
            ),
          ),
        )
        pt2 = pointIntersectionDD(
          mediatrice2,
          droiteVerticaleParPoint(
            pointAbstrait(
              context.fenetreMathalea2d[0],
              context.fenetreMathalea2d[1],
            ),
          ),
        )
        if (pt1.x > pt2.x) {
          objetsEnonce.push(
            latexParCoordonnees(
              '(d_2)',
              pt1.x,
              pt1.y + 2.5,
              context.isAmc ? 'black' : 'red',
              20,
              10,
              '',
              12,
            ),
          )
          objetsCorrection.push(
            latexParCoordonnees(
              '(d_2)',
              pt1.x,
              pt1.y + 2.5,
              context.isAmc ? 'black' : 'red',
              20,
              10,
              '',
              12,
            ),
          )
        } else if (pt1.x < pt2.x) {
          objetsEnonce.push(
            latexParCoordonnees(
              '(d_2)',
              pt2.x + 2.5,
              pt2.y,
              context.isAmc ? 'black' : 'red',
              20,
              10,
              '',
              12,
            ),
          )
          objetsCorrection.push(
            latexParCoordonnees(
              '(d_2)',
              pt2.x + 2.5,
              pt2.y,
              context.isAmc ? 'black' : 'red',
              20,
              10,
              '',
              12,
            ),
          )
        } else {
          objetsEnonce.push(
            latexParCoordonnees(
              '(d_2)',
              pt2.x + 3.5,
              pt2.y + 1,
              context.isAmc ? 'black' : 'red',
              20,
              10,
              '',
              12,
            ),
          )
          objetsCorrection.push(
            latexParCoordonnees(
              '(d_2)',
              pt2.x + 3.5,
              pt2.y + 1,
              context.isAmc ? 'black' : 'red',
              20,
              10,
              '',
              12,
            ),
          )
        }

        pt1 = pointIntersectionDD(
          mediatrice3,
          droiteVerticaleParPoint(
            pointAbstrait(
              context.fenetreMathalea2d[2],
              context.fenetreMathalea2d[3],
            ),
          ),
        )
        objetsEnonce.push(
          latexParCoordonnees(
            '(d_3)',
            pt1.x - 2,
            pt1.y + 1.5,
            context.isAmc ? 'black' : bleuMathalea,
            20,
            10,
            '',
            12,
          ),
        )
        objetsCorrection.push(
          latexParCoordonnees(
            '(d_3)',
            pt1.x - 2,
            pt1.y + 1.5,
            context.isAmc ? 'black' : bleuMathalea,
            20,
            10,
            '',
            12,
          ),
        )
        objetsCorrection.push(
          segCorr11,
          segCorr12,
          segCorr21,
          segCorr22,
          segCorr31,
          segCorr32,
        )
        objetsCorrection.push(
          codageSegments(
            'OO',
            context.isAmc ? 'black' : 'green',
            segCorr11,
            segCorr12,
          ),
        )
        objetsCorrection.push(
          codageSegments(
            'XX',
            context.isAmc ? 'black' : 'red',
            segCorr21,
            segCorr22,
          ),
        )
        objetsCorrection.push(
          codageSegments(
            '|||',
            context.isAmc ? 'black' : bleuMathalea,
            segCorr31,
            segCorr32,
          ),
        )
        consigneAMC = mathalea2d(
          Object.assign(
            {
              pixelsParCm: 15,
              scale: 0.3,
              optionsTikz: ['every node/.style={scale=0.6}'],
            },
            fixeBordures(objetsEnonce, {
              rxmin: -1,
              rxmax: 1,
              rymin: -1,
              rymax: 1,
            }),
          ),
          objetsEnonce,
        )
        texte += consigneAMC
        quad1 = translation(quad[num1], vecteur(0, 0))
        quad1.couleurDeRemplissage = colorToLatexOrHTML(
          context.isAmc ? 'black' : 'green',
        )
        quad1.opaciteDeRemplissage = 0.3
        quad2 = translation(quad[num2], vecteur(0, 0))
        quad2.couleurDeRemplissage = colorToLatexOrHTML(
          context.isAmc ? 'black' : 'red',
        )
        quad2.opaciteDeRemplissage = 0.3
        quad3 = translation(quad[num3], vecteur(0, 0))
        quad3.couleurDeRemplissage = colorToLatexOrHTML(
          context.isAmc ? 'black' : bleuMathalea,
        )
        quad3.opaciteDeRemplissage = 0.3
        objetsCorrection.push(
          quad[numA],
          quad[numD],
          quad[numC],
          quad1,
          quad2,
          quad3,
        )
        texteCorr += mathalea2d(
          {
            xmin: Xmin,
            xmax: Xmax,
            ymin: Ymin,
            ymax: Ymax,
            pixelsParCm: 15,
            scale: 0.3,
            optionsTikz: ['every node/.style={scale=0.6}'],
            mainlevee: false,
          },
          objetsCorrection,
        )

        break
      case 2: // symétrie centrale
        // Première question : une figure dans tabfigA, une symétrie par rapport au milieu d'un [B'C'], logiquement : l'image est dans tabfigB et B' est l'image de C !
        indexA = randint(0, nx * ny - 1)
        numA = tabfigA[indexA][2]
        indexcentre1 = randint(0, nx * ny - 1, indexA) // indexcentre1 est l'index du bloc de 4 figures A,B,C et D, il sert dans les 4 tableaux.

        // on calcule les coordonnées du milieu de [BC] on ajoute aux coordonnées du milieu de [BC] celles du vecteur BB'. (j'aurais pu réduire mais cela aurait rendu le calcul plus opaque)
        xmil1 = (xB + xC) / 2 + tabfigB[indexcentre1][0] - xB
        ymil1 = (yB + yC) / 2 + tabfigB[indexcentre1][1] - yB
        punto = imagePointParTransformation(
          7,
          [tabfigC[indexA][0], tabfigC[indexA][1]],
          [xmil1, ymil1],
        )
        trouver = false
        while (trouver === false) {
          for (let j = 0; j < nx * ny; j++) {
            if (
              egal(punto[0], tabfigB[j][0], 0.05) &&
              egal(punto[1], tabfigB[j][1], 0.05)
            ) {
              trouver = true
              num1 = tabfigB[j][2]
              xa = tabfigA[indexA][0]
              ya = tabfigA[indexA][1]
              centre1 = pointAbstrait(xmil1, ymil1, s0, 'left')
              quad[numA].couleurDeRemplissage = colorToLatexOrHTML(
                context.isAmc ? 'black' : 'green',
              )
              quad[numA].opaciteDeRemplissage = 0.6
              break
            }
          }
          if (trouver === false) {
            indexA = randint(0, nx * ny - 1)
            numA = tabfigA[indexA][2]
            indexcentre1 = randint(0, nx * ny - 1, indexA)
            xmil1 = (xB + xC) / 2 + tabfigB[indexcentre1][0] - xB
            ymil1 = (yB + yC) / 2 + tabfigB[indexcentre1][1] - yB
            punto = imagePointParTransformation(
              7,
              [tabfigC[indexA][0], tabfigC[indexA][1]],
              [xmil1, ymil1],
            )
          }
        }
        texteAMC1 =
          numAlpha(0) +
          texteEnCouleurEtGras(
            this.groupCentralSymmetryAnswers
              ? ` Donner le numéro de la figure symétrique de la figure $\\mathbf{${numA}}$ dans la symétrie de centre ${s0}.`
              : ` Quel est le numéro de la figure symétrique de la figure $\\mathbf{${numA}}$ dans la symétrie de centre ${s0} ?`,
            context.isAmc ? 'black' : 'green',
          ) +
          this.centralSymmetryField(0) +
          '<br>'
        texte += texteAMC1
        texteCorr =
          numAlpha(0) +
          texteEnCouleurEtGras(
            ` La figure symétrique de la figure $\\mathbf{${numA}}$ dans la symétrie de centre ${s0} porte le numéro $${miseEnEvidence(String(num1))}$.<br>`,
            context.isAmc ? 'black' : 'green',
          )
        // Deuxième question : une figure dans tabfigD, une symétrie par rapport au milieu d'un [C'D'], le résultat est une figure dans tabfigA et C' est l'image de D !
        indexD = randint(0, nx * ny - 1)
        numD = tabfigD[indexD][2]
        indexcentre2 = randint(0, nx * ny - 1, [indexD]) // indexcentre2 est l'index du bloc de 4 figures A,B,C et D, il sert dans les 4 tableaux.

        // on calcule les coordonnées du milieu de [DC] on ajoute aux coordonnées du milieu de [DC] celles du vecteur DD'.
        xmil2 = (xD + xC) / 2 + tabfigD[indexcentre2][0] - xD
        ymil2 = (yD + yC) / 2 + tabfigD[indexcentre2][1] - yD
        punto = imagePointParTransformation(
          7,
          [tabfigD[indexD][0], tabfigD[indexD][1]],
          [xmil2, ymil2],
        )
        trouver = false
        while (trouver === false) {
          for (let j = 0; j < nx * ny; j++) {
            if (
              egal(punto[0], tabfigC[j][0], 0.05) &&
              egal(punto[1], tabfigC[j][1], 0.05)
            ) {
              trouver = true
              num2 = tabfigA[j][2]
              xb = tabfigA[indexD][0]
              yb = tabfigA[indexD][1]
              centre2 = pointAbstrait(xmil2, ymil2, s1, 'left')
              quad[numD].couleurDeRemplissage = colorToLatexOrHTML(
                context.isAmc ? 'black' : 'red',
              )
              quad[numD].opaciteDeRemplissage = 0.6

              break
            }
          }
          if (trouver === false) {
            indexD = randint(0, nx * ny - 1)
            numD = tabfigD[indexD][2]
            indexcentre2 = randint(0, nx * ny - 1, [indexD])
            xmil2 = (xD + xC) / 2 + tabfigD[indexcentre2][0] - xD
            ymil2 = (yD + yC) / 2 + tabfigD[indexcentre2][1] - yD
            punto = imagePointParTransformation(
              7,
              [tabfigD[indexD][0], tabfigD[indexD][1]],
              [xmil2, ymil2],
            )
          }
        }
        if (this.centralSymmetryCount >= 2) {
          texteAMC2 =
            numAlpha(1) +
            texteEnCouleurEtGras(
              this.groupCentralSymmetryAnswers
                ? ` Donner le numéro de la figure symétrique de la figure $\\mathbf{${numD}}$ dans la symétrie de centre ${s1}.`
                : ` Quel est le numéro de la figure symétrique de la figure $\\mathbf{${numD}}$ dans la symétrie de centre ${s1} ?`,
              context.isAmc ? 'black' : 'red',
            ) +
            this.centralSymmetryField(1) +
            '<br>'
          texte += '<br>' + texteAMC2
          texteCorr +=
            numAlpha(1) +
            texteEnCouleurEtGras(
              ` La figure symétrique de la figure $\\mathbf{${numD}}$ dans la symétrie de centre ${s1} porte le numéro $${miseEnEvidence(String(num2))}$.<br>`,
              context.isAmc ? 'black' : 'red',
            )
        }
        // troisième question : une figure dans tabfigC, une symétrie par rapport au symétrique du milieu de [A'D'] par rapport au milieu de [C'D']... pas très clair
        // le résultat est une figure dans tabfigD et le point (C'+ vecteur AC) a pour image D' !
        indexC = randint(0, nx * ny - 1)
        numC = tabfigC[indexC][2]
        indexcentre3 = randint(0, nx * ny - 1, [indexC]) // indexcentre2 est l'index du bloc de 4 figures A,B,C et D, il sert dans les 4 tableaux.

        // on calcule les coordonnées du milieu du centre de symétrie : (C' + D + AC)/2=AC+AD/2 que l'on translate de CC' donc ça fait AC' + AD/2
        xmil3 = xD / 2 + tabfigC[indexcentre3][0]
        ymil3 = yD / 2 + tabfigC[indexcentre3][1]
        punto = imagePointParTransformation(
          7,
          [tabfigC[indexC][0] + xC, tabfigC[indexC][1] + yC],
          [xmil3, ymil3],
        ) // c'est le sommet C + AC qui a pour image D.
        trouver = false
        while (trouver === false) {
          for (let j = 0; j < nx * ny; j++) {
            if (
              egal(punto[0], tabfigD[j][0], 0.01) &&
              egal(punto[1], tabfigD[j][1], 0.01)
            ) {
              trouver = true
              num3 = tabfigD[j][2]
              xc = tabfigA[indexC][0]
              yc = tabfigA[indexC][1]
              centre3 = pointAbstrait(xmil3, ymil3, s2, 'left')
              quad[numC].couleurDeRemplissage = colorToLatexOrHTML(
                context.isAmc ? 'black' : bleuMathalea,
              )
              quad[numC].opaciteDeRemplissage = 0.6
              break
            }
          }
          if (trouver === false) {
            indexC = randint(0, nx * ny - 1)
            numC = tabfigC[indexC][2]
            indexcentre3 = randint(0, nx * ny - 1, [indexC])
            xmil3 = xD / 2 + tabfigC[indexcentre3][0]
            ymil3 = yD / 2 + tabfigC[indexcentre3][1]
            punto = imagePointParTransformation(
              7,
              [tabfigC[indexC][0] + xC, tabfigC[indexC][1] + yC],
              [xmil3, ymil3],
            )
          }
        }
        if (
          centre1 == null ||
          centre2 == null ||
          centre3 == null ||
          num1 == null ||
          num2 == null ||
          num3 == null
        ) {
          throw Error(
            'centre1, centre2 ou centre3 ou num1, num2 ou num3 est null',
          )
        }
        if (this.centralSymmetryCount >= 3) {
          texteAMC3 =
            numAlpha(2) +
            texteEnCouleurEtGras(
              this.groupCentralSymmetryAnswers
                ? ` Donner le numéro de la figure symétrique de la figure $\\mathbf{${numC}}$ dans la symétrie de centre ${s2}.`
                : ` Quel est le numéro de la figure symétrique de la figure $\\mathbf{${numC}}$ dans la symétrie de centre ${s2} ?`,
              context.isAmc ? 'black' : bleuMathalea,
            ) +
            this.centralSymmetryField(2) +
            '<br>'
          texte += '<br>' + texteAMC3
          texteCorr +=
            numAlpha(2) +
            texteEnCouleurEtGras(
              ` La figure symétrique de la figure $\\mathbf{${numC}}$ dans la symétrie de centre ${s2} porte le numéro $${miseEnEvidence(String(num3))}$.<br>`,
              context.isAmc ? 'black' : bleuMathalea,
            )
        }
        labelCentre1 = tracePoint(centre1, 'red')
        labelCentre1.epaisseur = 2
        labelCentre1.taille = 2
        labelCentre2 = tracePoint(centre2, 'red')
        labelCentre2.epaisseur = 2
        labelCentre2.taille = 2
        labelCentre3 = tracePoint(centre3, 'red')
        labelCentre3.epaisseur = 2
        labelCentre3.taille = 2

        // Les tirages restent identiques pour les variantes publiées.
        if (this.centralSymmetryCount < 2) {
          quad[numD].opaciteDeRemplissage = 0
        }
        if (this.centralSymmetryCount < 3) {
          quad[numC].opaciteDeRemplissage = 0
        }
        const centreTraces = [labelCentre1, labelCentre2, labelCentre3].slice(
          0,
          this.centralSymmetryCount,
        )
        const centreLabels = [centre1, centre2, centre3]
          .slice(0, this.centralSymmetryCount)
          .map((centre) => labelPoint(centre, 'red'))
        objetsEnonce.push(...centreTraces, ...centreLabels)
        objetsCorrection.push(...centreTraces, ...centreLabels)
        if (context.isHtml) {
          const figures = [numA, numD, numC]
          const centres = [centre1, centre2, centre3]
          for (let i = 0; i < this.centralSymmetryCount; i++) {
            objetsCorrection.push(
              rotationAnimee(
                quad[figures[i]],
                centres[i],
                180,
                `id="anim${numeroExercice}${'ABC'[i]}" dur="2s" repeatcount="1"`,
              ),
            )
          }
        }
        if (this.groupCentralSymmetryAnswers) {
          texte = addMultiMathfield(this, 0, {
            dataTemplate: texte,
            dataOptions: {},
          })
        }

        consigneAMC = mathalea2d(
          Object.assign(
            {
              pixelsParCm: 15,
              scale: 0.3,
              optionsTikz: ['every node/.style={scale=0.6}'],
            },
            fixeBordures(objetsEnonce, {
              rxmin: -1,
              rxmax: 1,
              rymin: -1,
              rymax: 1,
            }),
          ),
          objetsEnonce,
        )
        texte += consigneAMC
        quad1 = translation(quad[num1], vecteur(0, 0))
        quad1.couleurDeRemplissage = colorToLatexOrHTML(
          context.isAmc ? 'black' : 'green',
        )
        quad1.opaciteDeRemplissage = 0.3
        quad2 = translation(quad[num2], vecteur(0, 0))
        quad2.couleurDeRemplissage = colorToLatexOrHTML(
          context.isAmc ? 'black' : 'red',
        )
        quad2.opaciteDeRemplissage = 0.3
        quad3 = translation(quad[num3], vecteur(0, 0))
        quad3.couleurDeRemplissage = colorToLatexOrHTML(
          context.isAmc ? 'black' : bleuMathalea,
        )
        quad3.opaciteDeRemplissage = 0.3
        arc1 = arc(
          pointAbstrait(tabfigA[indexA][0], tabfigA[indexA][1]),
          centre1,
          180,
        )
        rayon11 = segment(
          pointAbstrait(tabfigA[indexA][0], tabfigA[indexA][1]),
          centre1,
        )
        rayon12 = rotation(rayon11, centre1, 180)
        rayon11.pointilles = 2
        rayon12.pointilles = 2
        arc1.pointilles = 2
        arc2 = arc(
          pointAbstrait(tabfigD[indexD][0], tabfigD[indexD][1]),
          centre2,
          180,
        )
        rayon21 = segment(
          pointAbstrait(tabfigD[indexD][0], tabfigD[indexD][1]),
          centre2,
        )
        rayon22 = rotation(rayon21, centre2, 180)
        rayon21.pointilles = 2
        rayon22.pointilles = 2
        arc2.pointilles = 2
        arc3 = arc(
          pointAbstrait(tabfigC[indexC][0], tabfigC[indexC][1]),
          centre3,
          180,
        )
        rayon31 = segment(
          pointAbstrait(tabfigC[indexC][0], tabfigC[indexC][1]),
          centre3,
        )
        rayon32 = rotation(rayon31, centre3, 180)
        rayon31.pointilles = 2
        rayon32.pointilles = 2
        arc3.pointilles = 2
        const count = this.centralSymmetryCount
        objetsCorrection.push(
          ...[quad1, quad2, quad3].slice(0, count),
          ...[arc1, arc2, arc3].slice(0, count),
          ...[rayon11, rayon12, rayon21, rayon22, rayon31, rayon32].slice(
            0,
            2 * count,
          ),
        )
        texteCorr += mathalea2d(
          {
            xmin: Xmin,
            xmax: Xmax,
            ymin: Ymin,
            ymax: Ymax,
            pixelsParCm: 15,
            scale: 0.3,
            optionsTikz: ['every node/.style={scale=0.6}'],
            mainlevee: false,
          },
          objetsCorrection,
        )

        break

      case 3: // translations
        // Première question : une figure dans tabfigA, l'image dans tabfigA...
        // On choisit deux figures de type B pour définir le vecteur de translation.
        indexA = randint(0, nx * ny - 1)
        numA = tabfigA[indexA][2]
        iB1 = randint(0, nx * ny - 1)
        iB2 = randint(0, nx * ny - 1, [iB1])
        xV1 = tabfigB[iB2][0] - tabfigB[iB1][0]
        yV1 = tabfigB[iB2][1] - tabfigB[iB1][1]
        punto = imagePointParTransformation(
          8,
          [tabfigA[indexA][0], tabfigA[indexA][1]],
          [0, 0],
          [xV1, yV1],
        )
        trouver = false
        while (trouver === false) {
          for (let j = 0; j < nx * ny; j++) {
            if (
              egal(punto[0], tabfigA[j][0], 0.05) &&
              egal(punto[1], tabfigA[j][1], 0.05)
            ) {
              trouver = true
              num1 = tabfigA[j][2]
              xa = tabfigA[indexA][0]
              ya = tabfigA[indexA][1]
              origine1 = pointAbstrait(tabfigB[iB1][0], tabfigB[iB1][1])
              vecteur1 = representant(
                vecteur(
                  origine1,
                  pointAbstrait(tabfigB[iB2][0], tabfigB[iB2][1]),
                ),
                origine1,
              )
              vecteur1.color = colorToLatexOrHTML(
                context.isAmc ? 'black' : 'green',
              )
              vecteur1.epaisseur = 2
              vecteur1.pointilles = 2
              quad[numA].couleurDeRemplissage = colorToLatexOrHTML(
                context.isAmc ? 'black' : 'green',
              )
              quad[numA].opaciteDeRemplissage = 0.6
              break
            }
          }
          if (trouver === false) {
            indexA = randint(0, nx * ny - 1)
            numA = tabfigA[indexA][2]
            iB1 = randint(0, nx * ny - 1)
            iB2 = randint(0, nx * ny - 1, [iB1])
            xV1 = tabfigB[iB2][0] - tabfigB[iB1][0]
            yV1 = tabfigB[iB2][1] - tabfigB[iB1][1]
            punto = imagePointParTransformation(
              8,
              [tabfigA[indexA][0], tabfigA[indexA][1]],
              [0, 0],
              [xV1, yV1],
            )
          }
        }
        texteAMC1 =
          numAlpha(0) +
          texteEnCouleurEtGras(
            ` Dans la translation qui transforme la figure $\\mathbf{${tabfigB[iB1][2]}}$ en la figure $\\mathbf{${tabfigB[iB2][2]}}$, quel est le numéro de l'image de la figure $\\mathbf{${numA}}$ ?`,
            context.isAmc ? 'black' : 'green',
          ) +
          ajouteChampTexteMathLive(this, 0, KeyboardType.clavierNumbers) +
          '<br>'
        texte += texteAMC1
        texteCorr =
          numAlpha(0) +
          texteEnCouleurEtGras(
            ` La figure image de la figure $\\mathbf{${numA}}$  dans la translation qui transforme la figure $\\mathbf{${tabfigB[iB1][2]}}$ en la figure $\\mathbf{${tabfigB[iB2][2]}}$ porte le numéro $${miseEnEvidence(String(num1))}$.<br>`,
            context.isAmc ? 'black' : 'green',
          )
        // Deuxième question : une figure dans tabfigD, l'image dans tabfigB...
        // On choisit une figure C et une figure A pour définir le vecteur de translation.
        indexD = randint(0, nx * ny - 1)
        numD = tabfigD[indexD][2]
        iC1 = randint(0, nx * ny - 1)
        iA1 = randint(0, nx * ny - 1, [iC1])
        xV2 = tabfigA[iA1][0] - tabfigC[iC1][0]
        yV2 = tabfigA[iA1][1] - tabfigC[iC1][1]
        punto = imagePointParTransformation(
          8,
          [tabfigD[indexD][0], tabfigD[indexD][1]],
          [0, 0],
          [xV2, yV2],
        )
        trouver = false
        while (trouver === false) {
          for (let j = 0; j < nx * ny; j++) {
            if (
              egal(punto[0], tabfigB[j][0], 0.05) &&
              egal(punto[1], tabfigB[j][1], 0.05)
            ) {
              trouver = true
              num2 = tabfigB[j][2]
              xb = tabfigD[indexD][0]
              yb = tabfigD[indexD][1]
              origine2 = pointAbstrait(tabfigC[iC1][0], tabfigC[iC1][1])
              vecteur2 = representant(
                vecteur(
                  origine2,
                  pointAbstrait(tabfigA[iA1][0], tabfigA[iA1][1]),
                ),
                origine2,
              )
              vecteur2.color = colorToLatexOrHTML(
                context.isAmc ? 'black' : 'red',
              )
              vecteur2.epaisseur = 2
              vecteur2.pointilles = 2
              quad[numD].couleurDeRemplissage = colorToLatexOrHTML(
                context.isAmc ? 'black' : 'red',
              )
              quad[numD].opaciteDeRemplissage = 0.6
              break
            }
          }
          if (trouver === false) {
            indexD = randint(0, nx * ny - 1)
            numD = tabfigD[indexD][2]
            iC1 = randint(0, nx * ny - 1)
            iA1 = randint(0, nx * ny - 1, [iC1])
            xV2 = tabfigA[iA1][0] - tabfigC[iC1][0]
            yV2 = tabfigA[iA1][1] - tabfigC[iC1][1]
            punto = imagePointParTransformation(
              8,
              [tabfigD[indexD][0], tabfigD[indexD][1]],
              [0, 0],
              [xV2, yV2],
            )
          }
        }
        texteAMC2 =
          numAlpha(1) +
          texteEnCouleurEtGras(
            ` Dans la translation qui transforme la figure $\\mathbf{${tabfigC[iC1][2]}}$ en la figure $\\mathbf{${tabfigA[iA1][2]}}$, quel est le numéro de l'image de la figure $\\mathbf{${numD}}$ ?`,
            context.isAmc ? 'black' : 'red',
          ) +
          ajouteChampTexteMathLive(this, 1, KeyboardType.clavierNumbers) +
          '<br>'
        texte += '<br>' + texteAMC2
        texteCorr +=
          numAlpha(1) +
          texteEnCouleurEtGras(
            ` La figure image de la figure $\\mathbf{${numD}}$  dans la translation qui transforme la figure $\\mathbf{${tabfigC[iC1][2]}}$ en la figure $\\mathbf{${tabfigA[iA1][2]}}$ porte le numéro $${miseEnEvidence(String(num2))}$.<br>`,
            context.isAmc ? 'black' : 'red',
          )

        // troisième question : une figure dans tabfigC, l'image dans tabfigA...
        // On choisit une figure D et une figure B pour définir le vecteur de translation.
        indexC = randint(0, nx * ny - 1)
        numC = tabfigC[indexC][2]
        iD1 = randint(0, nx * ny - 1)
        iB3 = randint(0, nx * ny - 1, [iD1])
        xV3 = tabfigA[iB3][0] - tabfigC[iD1][0]
        yV3 = tabfigA[iB3][1] - tabfigC[iD1][1]
        punto = imagePointParTransformation(
          8,
          [tabfigC[indexC][0], tabfigC[indexC][1]],
          [0, 0],
          [xV3, yV3],
        )
        trouver = false
        while (trouver === false) {
          for (let j = 0; j < nx * ny; j++) {
            if (
              egal(punto[0], tabfigA[j][0], 0.05) &&
              egal(punto[1], tabfigA[j][1], 0.05)
            ) {
              trouver = true
              num3 = tabfigA[j][2]
              xc = tabfigC[indexC][0]
              yc = tabfigC[indexC][1]
              origine3 = pointAbstrait(tabfigC[iD1][0], tabfigC[iD1][1])
              vecteur3 = representant(
                vecteur(
                  origine3,
                  pointAbstrait(tabfigA[iB3][0], tabfigA[iB3][1]),
                ),
                origine3,
              )
              vecteur3.color = colorToLatexOrHTML(
                context.isAmc ? 'black' : bleuMathalea,
              )
              vecteur3.epaisseur = 2
              vecteur3.pointilles = 2
              quad[numC].couleurDeRemplissage = colorToLatexOrHTML(
                context.isAmc ? 'black' : bleuMathalea,
              )
              quad[numC].opaciteDeRemplissage = 0.6
              break
            }
          }
          if (trouver === false) {
            indexC = randint(0, nx * ny - 1)
            numC = tabfigC[indexC][2]
            iD1 = randint(0, nx * ny - 1)
            iB3 = randint(0, nx * ny - 1, [iD1])
            xV3 = tabfigA[iB3][0] - tabfigC[iD1][0]
            yV3 = tabfigA[iB3][1] - tabfigC[iD1][1]
            punto = imagePointParTransformation(
              8,
              [tabfigC[indexC][0], tabfigC[indexC][1]],
              [0, 0],
              [xV3, yV3],
            )
          }
        }
        if (
          num1 == null ||
          num2 == null ||
          num3 == null ||
          vecteur1.x1 == null ||
          vecteur2.x1 == null ||
          vecteur3.x1 == null
        ) {
          throw Error('num1, num2 ou num3 est null')
        }
        texteAMC3 =
          numAlpha(2) +
          texteEnCouleurEtGras(
            ` Dans la translation qui transforme la figure $\\mathbf{${tabfigC[iD1][2]}}$ en la figure $\\mathbf{${tabfigA[iB3][2]}}$, quel est le numéro de l'image de la figure $\\mathbf{${numC}}$ ?`,
            context.isAmc ? 'black' : bleuMathalea,
          ) +
          ajouteChampTexteMathLive(this, 2, KeyboardType.clavierNumbers) +
          '<br>'
        texte += '<br>' + texteAMC3
        texteCorr +=
          numAlpha(2) +
          texteEnCouleurEtGras(
            ` La figure image de la figure $\\mathbf{${numC}}$  dans la translation qui transforme la figure $\\mathbf{${tabfigC[iD1][2]}}$ en la figure $\\mathbf{${tabfigA[iB3][2]}}$ porte le numéro $${miseEnEvidence(String(num3))}$.<br>`,
            context.isAmc ? 'black' : bleuMathalea,
          )

        objetsEnonce.push(vecteur1, vecteur2, vecteur3)
        objetsCorrection.push(vecteur1, vecteur2, vecteur3)
        if (context.isHtml)
          objetsCorrection.push(
            translationAnimee(
              [quad[numA]],
              vecteur(vecteur1.x2 - vecteur1.x1, vecteur1.y2 - vecteur1.y1),
              `id="anim${numeroExercice}A" dur="2s" repeatcount="1"`,
            ),
            translationAnimee(
              [quad[numD]],
              vecteur(vecteur2.x2 - vecteur2.x1, vecteur2.y2 - vecteur2.y1),
              `id="anim${numeroExercice}B" dur="2s" repeatcount="1"`,
            ),
            translationAnimee(
              [quad[numC]],
              vecteur(vecteur3.x2 - vecteur3.x1, vecteur3.y2 - vecteur3.y1),
              `id="anim${numeroExercice}C" dur="2s" repeatcount="1"`,
            ),
          )

        consigneAMC = mathalea2d(
          Object.assign(
            {
              pixelsParCm: 15,
              scale: 0.3,
              optionsTikz: ['every node/.style={scale=0.6}'],
            },
            fixeBordures(objetsEnonce, {
              rxmin: -1,
              rxmax: 1,
              rymin: -1,
              rymax: 1,
            }),
          ),
          objetsEnonce,
        )
        texte += consigneAMC
        quad1 = translation(quad[num1], vecteur(0, 0))
        quad1.couleurDeRemplissage = colorToLatexOrHTML(
          context.isAmc ? 'black' : 'green',
        )
        quad1.opaciteDeRemplissage = 0.3
        quad2 = translation(quad[num2], vecteur(0, 0))
        quad2.couleurDeRemplissage = colorToLatexOrHTML(
          context.isAmc ? 'black' : 'red',
        )
        quad2.opaciteDeRemplissage = 0.3
        quad3 = translation(quad[num3], vecteur(0, 0))
        quad3.couleurDeRemplissage = colorToLatexOrHTML(
          context.isAmc ? 'black' : bleuMathalea,
        )
        quad3.opaciteDeRemplissage = 0.3
        rayon11 = representant(
          vecteur(vecteur1.x2 - vecteur1.x1, vecteur1.y2 - vecteur1.y1),
          pointAbstrait(xa, ya),
        )
        rayon11.color = colorToLatexOrHTML(context.isAmc ? 'black' : 'green')
        rayon11.epaisseur = 2
        rayon21 = representant(
          vecteur(vecteur2.x2 - vecteur2.x1, vecteur2.y2 - vecteur2.y1),
          pointAbstrait(xb, yb),
        )
        rayon21.color = colorToLatexOrHTML(context.isAmc ? 'black' : 'red')
        rayon21.epaisseur = 2
        rayon31 = representant(
          vecteur(vecteur3.x2 - vecteur3.x1, vecteur3.y2 - vecteur3.y1),
          pointAbstrait(xc, yc),
        )
        rayon31.color = colorToLatexOrHTML(
          context.isAmc ? 'black' : bleuMathalea,
        )
        rayon31.epaisseur = 2
        objetsCorrection.push(quad1, quad2, quad3, rayon11, rayon21, rayon31)
        texteCorr += mathalea2d(
          {
            xmin: Xmin,
            xmax: Xmax,
            ymin: Ymin,
            ymax: Ymax,
            pixelsParCm: 15,
            scale: 0.3,
            optionsTikz: ['every node/.style={scale=0.6}'],
            mainlevee: false,
          },
          objetsCorrection,
        )

        break

      case 4: // rotations
        // première question : centre A, rotation de $90^\\circ$ sens anti-horaire, une figure de tabfigA donne une figure de tabfigD, le point B donne le point D.
        indexA = randint(0, nx * ny - 1)
        numA = tabfigA[indexA][2]
        indexcentre1 = randint(0, nx * ny - 1, [indexA])
        xmil1 = tabfigA[indexcentre1][0]
        ymil1 = tabfigA[indexcentre1][1]
        punto = imagePointParTransformation(
          6,
          [tabfigB[indexA][0], tabfigB[indexA][1]],
          [xmil1, ymil1],
        ) // le repère est direct, donc le sens de rotation est inversé...
        trouver = false
        while (trouver === false) {
          for (let j = 0; j < nx * ny; j++) {
            if (
              egal(punto[0], tabfigD[j][0], 0.1) &&
              egal(punto[1], tabfigD[j][1], 0.1)
            ) {
              trouver = true
              num1 = tabfigD[j][2]
              xa = tabfigA[indexA][0]
              ya = tabfigA[indexA][1]
              centre1 = pointAbstrait(xmil1, ymil1, s0, 'above left')
              quad[numA].couleurDeRemplissage = colorToLatexOrHTML(
                context.isAmc ? 'black' : 'green',
              )
              quad[numA].opaciteDeRemplissage = 0.6
              break
            }
          }
          if (trouver === false) {
            indexA = randint(0, nx * ny - 1)
            numA = tabfigA[indexA][2]
            indexcentre1 = randint(0, nx * ny - 1, [indexA])
            xmil1 = tabfigA[indexcentre1][0]
            ymil1 = tabfigA[indexcentre1][1]
            punto = imagePointParTransformation(
              6,
              [tabfigB[indexA][0], tabfigB[indexA][1]],
              [xmil1, ymil1],
            ) // le repère est direct, donc le sens de rotation est inversé...
          }
        }
        texteAMC1 =
          numAlpha(0) +
          ' Quel est le numéro de la figure image de la figure ' +
          texteEnCouleurEtGras(`$${numA}$`, context.isAmc ? 'black' : 'green') +
          ' dans la rotation de centre ' +
          texteEnCouleurEtGras(`${s0}`, context.isAmc ? 'black' : 'green') +
          " et d'angle $90^\\circ$ dans le sens des aiguilles d'une montre ?" +
          ajouteChampTexteMathLive(this, 0, KeyboardType.clavierNumbers) +
          '<br>'
        texte += texteAMC1
        texteCorr +=
          numAlpha(0) +
          ' La figure image de la figure ' +
          texteEnCouleurEtGras(`$${numA}$`, context.isAmc ? 'black' : 'green') +
          ' dans la rotation de centre ' +
          texteEnCouleurEtGras(`${s0}`, context.isAmc ? 'black' : 'green') +
          " et d'angle $90^\\circ$ dans le sens des aiguilles d'une montre porte le numéro " +
          texteEnCouleurEtGras(`$${num1}$`, orangeMathalea) +
          '.<br>'

        // deuxième question : centre B, rotation $90^\\circ$ sens horaire, une figure de tabfigD donne une figure de tabfigC
        indexD = randint(0, nx * ny - 1)
        numD = tabfigD[indexD][2]
        indexcentre2 = randint(0, nx * ny - 1, [indexD])
        xmil2 = tabfigB[indexcentre2][0]
        ymil2 = tabfigB[indexcentre2][1]
        punto = imagePointParTransformation(
          5,
          [tabfigD[indexD][0], tabfigD[indexD][1]],
          [xmil2, ymil2],
        ) // le repère est direct, donc le sens de rotation est inversé...
        trouver = false
        while (trouver === false) {
          for (let j = 0; j < nx * ny; j++) {
            if (
              egal(punto[0], 4 + tabfigC[j][0], 0.1) &&
              egal(punto[1], tabfigC[j][1], 0.1)
            ) {
              trouver = true
              num2 = tabfigC[j][2]
              xb = tabfigA[indexD][0]
              yb = tabfigA[indexD][1]
              centre2 = pointAbstrait(xmil2, ymil2, s1, 'above left')
              quad[numD].couleurDeRemplissage = colorToLatexOrHTML(
                context.isAmc ? 'black' : 'red',
              )
              quad[numD].opaciteDeRemplissage = 0.6
              break
            }
          }
          if (trouver === false) {
            indexD = randint(0, nx * ny - 1)
            numD = tabfigD[indexD][2]
            indexcentre2 = randint(0, nx * ny - 1, [indexD])
            xmil2 = tabfigB[indexcentre2][0]
            ymil2 = tabfigB[indexcentre2][1]
            punto = imagePointParTransformation(
              5,
              [tabfigD[indexD][0], tabfigD[indexD][1]],
              [xmil2, ymil2],
            ) // le repère est direct, donc le sens de rotation est inversé...
          }
        }
        texteAMC2 =
          numAlpha(1) +
          ' Quel est le numéro de la figure image de la figure ' +
          texteEnCouleurEtGras(`$${numD}$`, context.isAmc ? 'black' : 'red') +
          ' dans la rotation de centre ' +
          texteEnCouleurEtGras(`${s1}`, context.isAmc ? 'black' : 'red') +
          " et d'angle $90^\\circ$ dans le sens contraire des aiguilles d'une montre ?" +
          ajouteChampTexteMathLive(this, 1, KeyboardType.clavierNumbers) +
          '<br>'
        texte += '<br>' + texteAMC2
        texteCorr +=
          '<br>' +
          numAlpha(1) +
          ' La figure image de la figure ' +
          texteEnCouleurEtGras(`$${numD}$`, context.isAmc ? 'black' : 'red') +
          ' dans la rotation de centre ' +
          texteEnCouleurEtGras(`${s1}`, context.isAmc ? 'black' : 'red') +
          " et d'angle $90^\\circ$ dans le sens contraire des aiguilles d'une montre porte le numéro " +
          texteEnCouleurEtGras(`$${num2}$`, orangeMathalea) +
          '.<br>'

        // troisième question : centre B, rotation $90^\\circ$ sens anti-horaire, une figure de tabfigC donne une figure de tabfigD
        indexC = randint(0, nx * ny - 1)
        numC = tabfigC[indexC][2]
        indexcentre3 = randint(0, nx * ny - 1, [indexC])
        xmil3 = tabfigB[indexcentre3][0]
        ymil3 = tabfigB[indexcentre3][1]
        punto = imagePointParTransformation(
          6,
          [tabfigC[indexC][0], tabfigC[indexC][1]],
          [xmil3, ymil3],
        ) // le repère est direct, donc le sens de rotation est inversé...
        trouver = false
        while (trouver === false) {
          for (let j = 0; j < nx * ny; j++) {
            if (
              egal(punto[0], tabfigD[j][0], 0.1) &&
              egal(punto[1], 4 + tabfigD[j][1], 0.1)
            ) {
              trouver = true
              num3 = tabfigD[j][2]
              xc = tabfigA[indexC][0]
              yc = tabfigA[indexC][1]
              centre3 = pointAbstrait(xmil3, ymil3, s2, 'above left')
              quad[numC].couleurDeRemplissage = colorToLatexOrHTML(
                context.isAmc ? 'black' : bleuMathalea,
              )
              quad[numC].opaciteDeRemplissage = 0.6
              break
            }
          }
          if (trouver === false) {
            indexC = randint(0, nx * ny - 1)
            numC = tabfigC[indexC][2]
            indexcentre3 = randint(0, nx * ny - 1, [indexC])
            xmil3 = tabfigB[indexcentre3][0]
            ymil3 = tabfigB[indexcentre3][1]
            punto = imagePointParTransformation(
              6,
              [tabfigC[indexC][0], tabfigC[indexC][1]],
              [xmil3, ymil3],
            ) // le repère est direct, donc le sens de rotation est inversé...
          }
        }
        if (
          centre1 == null ||
          centre2 == null ||
          centre3 == null ||
          num1 == null ||
          num2 == null ||
          num3 == null
        ) {
          throw Error(
            'centre1, centre2 ou centre3 ou num1, num2 ou num3 est null',
          )
        }
        texteAMC3 =
          numAlpha(2) +
          ' Quel est le numéro de la figure image de la figure ' +
          texteEnCouleurEtGras(
            `$\\mathbf{${numC}}$`,
            context.isAmc ? 'black' : bleuMathalea,
          ) +
          ' dans la rotation de centre ' +
          texteEnCouleurEtGras(
            `${s2}`,
            context.isAmc ? 'black' : bleuMathalea,
          ) +
          " et d'angle $90^\\circ$ dans le sens des aiguilles d'une montre ?" +
          ajouteChampTexteMathLive(this, 2, KeyboardType.clavierNumbers) +
          '<br>'
        texte += '<br>' + texteAMC3
        texteCorr +=
          '<br>' +
          numAlpha(2) +
          ' La figure image de la figure ' +
          texteEnCouleurEtGras(
            `$\\mathbf{${numC}}$`,
            context.isAmc ? 'black' : bleuMathalea,
          ) +
          ' dans la rotation de centre ' +
          texteEnCouleurEtGras(
            `${s2}`,
            context.isAmc ? 'black' : bleuMathalea,
          ) +
          " et d'angle $90^\\circ$ dans le sens des aiguilles d'une montre porte le numéro " +
          texteEnCouleurEtGras(`$${num3}$`, orangeMathalea) +
          '.<br>'

        trace = tracePoint(centre1, context.isAmc ? 'black' : 'green')
        label = labelPoint(centre1, context.isAmc ? 'black' : 'green')
        trace.epaisseur = 2
        trace.taille = 4
        objetsEnonce.push(trace, label)
        objetsCorrection.push(trace, label)
        trace = tracePoint(centre2, context.isAmc ? 'black' : 'red')
        label = labelPoint(centre2, context.isAmc ? 'black' : 'red')
        trace.epaisseur = 2
        trace.taille = 4
        objetsEnonce.push(trace, label)
        objetsCorrection.push(trace, label)
        trace = tracePoint(centre3, context.isAmc ? 'black' : bleuMathalea)
        label = labelPoint(centre3, context.isAmc ? 'black' : bleuMathalea)
        trace.epaisseur = 2
        trace.taille = 4
        objetsEnonce.push(trace, label)
        objetsCorrection.push(trace, label)
        if (context.isHtml)
          objetsCorrection.push(
            rotationAnimee(
              quad[numA],
              centre1,
              -90,
              `id="anim${numeroExercice}A" dur ="2s" repeatcount="1"`,
            ),
            rotationAnimee(
              quad[numD],
              centre2,
              90,
              `id="anim${numeroExercice}B" dur="2s" repeatcount="1"`,
            ),
            rotationAnimee(
              quad[numC],
              centre3,
              -90,
              `id="anim${numeroExercice}C" dur="2s" repeatcount="1"`,
            ),
          )

        consigneAMC = mathalea2d(
          Object.assign(
            {
              pixelsParCm: 15,
              scale: 0.3,
              optionsTikz: ['every node/.style={scale=0.6}'],
            },
            fixeBordures(objetsEnonce, {
              rxmin: -1,
              rxmax: 1,
              rymin: -1,
              rymax: 1,
            }),
          ),
          objetsEnonce,
        )
        texte += consigneAMC
        quad1 = translation(quad[num1], vecteur(0, 0))
        quad1.couleurDeRemplissage = colorToLatexOrHTML(
          context.isAmc ? 'black' : 'green',
        )
        quad1.opaciteDeRemplissage = 0.3
        quad2 = translation(quad[num2], vecteur(0, 0))
        quad2.couleurDeRemplissage = colorToLatexOrHTML(
          context.isAmc ? 'black' : 'red',
        )
        quad2.opaciteDeRemplissage = 0.3
        quad3 = translation(quad[num3], vecteur(0, 0))
        quad3.couleurDeRemplissage = colorToLatexOrHTML(
          context.isAmc ? 'black' : bleuMathalea,
        )
        quad3.opaciteDeRemplissage = 0.3
        arc1 = arc(
          pointAbstrait(tabfigA[indexA][0], tabfigA[indexA][1]),
          centre1,
          -90,
        )
        rayon11 = segment(
          pointAbstrait(tabfigA[indexA][0], tabfigA[indexA][1]),
          centre1,
          context.isAmc ? 'black' : 'green',
        )
        rayon12 = rotation(rayon11, centre1, -90)
        rayon11.pointilles = 2
        rayon12.pointilles = 2
        rayon12.color = colorToLatexOrHTML(context.isAmc ? 'black' : 'green')
        arc1.pointilles = 2
        arc1.epaisseur = 2
        arc1.color = colorToLatexOrHTML(context.isAmc ? 'black' : 'green')
        arc2 = arc(
          pointAbstrait(tabfigD[indexD][0], tabfigD[indexD][1]),
          centre2,
          90,
        )
        rayon21 = segment(
          pointAbstrait(tabfigD[indexD][0], tabfigD[indexD][1]),
          centre2,
          context.isAmc ? 'black' : 'red',
        )
        rayon22 = rotation(rayon21, centre2, 90)
        rayon21.pointilles = 2
        rayon22.pointilles = 2
        rayon22.color = colorToLatexOrHTML(context.isAmc ? 'black' : 'red')
        arc2.pointilles = 2
        arc2.epaisseur = 2
        arc2.color = colorToLatexOrHTML(context.isAmc ? 'black' : 'red')
        arc3 = arc(
          pointAbstrait(tabfigC[indexC][0], tabfigC[indexC][1]),
          centre3,
          -90,
        )
        rayon31 = segment(
          pointAbstrait(tabfigC[indexC][0], tabfigC[indexC][1]),
          centre3,
          context.isAmc ? 'black' : bleuMathalea,
        )
        rayon32 = rotation(rayon31, centre3, -90)
        rayon31.pointilles = 2
        rayon32.pointilles = 2
        rayon32.color = colorToLatexOrHTML(
          context.isAmc ? 'black' : bleuMathalea,
        )
        arc3.pointilles = 2
        arc3.epaisseur = 2
        arc3.color = colorToLatexOrHTML(context.isAmc ? 'black' : bleuMathalea)
        objetsCorrection.push(
          quad1,
          quad2,
          quad3,
          arc1,
          arc2,
          arc3,
          rayon11,
          rayon12,
          rayon21,
          rayon22,
          rayon31,
          rayon32,
          codageAngleDroit(
            pointAbstrait(tabfigA[indexA][0], tabfigA[indexA][1]),
            centre1,
            rotation(
              pointAbstrait(tabfigA[indexA][0], tabfigA[indexA][1]),
              centre1,
              -90,
            ),
            context.isAmc ? 'black' : 'green',
            1,
            1,
          ),
          codageAngleDroit(
            pointAbstrait(tabfigD[indexD][0], tabfigD[indexD][1]),
            centre2,
            rotation(
              pointAbstrait(tabfigD[indexD][0], tabfigD[indexD][1]),
              centre2,
              90,
            ),
            context.isAmc ? 'black' : 'red',
            1,
            1,
          ),
          codageAngleDroit(
            pointAbstrait(tabfigC[indexC][0], tabfigC[indexC][1]),
            centre3,
            rotation(
              pointAbstrait(tabfigC[indexC][0], tabfigC[indexC][1]),
              centre3,
              -90,
            ),
            context.isAmc ? 'black' : bleuMathalea,
            1,
            1,
          ),
          codageSegments(
            '|||',
            context.isAmc ? 'black' : 'green',
            rayon11,
            rayon12,
          ),
          codageSegments(
            'OO',
            context.isAmc ? 'black' : 'red',
            rayon21,
            rayon22,
          ),
          codageSegments(
            'XXX',
            context.isAmc ? 'black' : bleuMathalea,
            rayon31,
            rayon32,
          ),
        )
        texteCorr += mathalea2d(
          Object.assign({}, fixeBordures(objetsCorrection), {
            pixelsParCm: 15,
            scale: 0.3,
            optionsTikz: ['every node/.style={scale=0.6}'],
          }),
          objetsCorrection,
        )
        break
    }
    if (this.groupCentralSymmetryAnswers) {
      const answers: Valeur = { bareme: troisPointsProportionnels }
      for (const [i, value] of [num1, num2, num3]
        .slice(0, this.centralSymmetryCount)
        .entries()) {
        answers[(['champ1', 'champ2', 'champ3'] as const)[i]] = {
          value: String(value),
        }
      }
      handleAnswers(this, 0, answers, { formatInteractif: 'multi-mathfield' })
    } else {
      handleAnswers(this, 0, { reponse: { value: String(num1) } })
      handleAnswers(this, 1, { reponse: { value: String(num2) } })
      handleAnswers(this, 2, { reponse: { value: String(num3) } })
    }
    if (context.isHtml) {
      texteCorr += '<br>'
      texteCorr += `<button class="btn ui labeled icon button"  style="margin:10px" onclick="document.getElementById('anim${numeroExercice}A').beginElement()"><i class="redo circle icon"></i>Relancer l'animation verte</button>`
      if (this.centralSymmetryCount >= 2) {
        texteCorr += `<button class="btn ui labeled icon button"  style="margin:10px" onclick="document.getElementById('anim${numeroExercice}B').beginElement()"><i class="redo circle icon"></i>Relancer l'animation rouge</button>`
      }
      if (this.centralSymmetryCount >= 3) {
        texteCorr += `<button class="btn ui labeled icon button"  style="margin:10px" onclick="document.getElementById('anim${numeroExercice}C').beginElement()"><i class="redo circle icon"></i>Relancer l'animation bleue</button>`
      }
    }
    this.listeQuestions.push(texte)
    this.listeCorrections.push(texteCorr)
    listeQuestionsToContenuSansNumero(this)
    if (context.isAmc) {
      this.autoCorrectionAMC[0] = {
        enonce: consigneAMC
          ?.replace(texteAMC1, '')
          .replace(texteAMC2, '')
          .replace(texteAMC3, ''),
        options: { multicols: true },
        propositions: [
          {
            type: 'AMCNum',

            propositions: [
              {
                texte: texteCorr,
                statut: '',
                reponse: {
                  texte: texteAMC1,
                  valeur: num1,
                  param: {
                    digits: 2,
                    decimals: 0,
                    signe: false,
                    approx: 0,
                  },
                },
              },
            ],
          },
          {
            type: 'AMCNum',
            propositions: [
              {
                texte: '',
                statut: '',
                reponse: {
                  texte: texteAMC2,
                  valeur: num2,
                  param: {
                    digits: 2,
                    decimals: 0,
                    signe: false,
                    approx: 0,
                  },
                },
              },
            ],
          },
          {
            type: 'AMCNum',
            propositions: [
              {
                texte: '',
                statut: '',
                reponse: {
                  texte: texteAMC3,
                  valeur: num3,
                  param: {
                    digits: 2,
                    decimals: 0,
                    signe: false,
                    approx: 0,
                  },
                },
              },
            ],
          },
        ],
      }
      if (this.groupCentralSymmetryAnswers) {
        this.autoCorrectionAMC[0].propositions =
          this.autoCorrectionAMC[0].propositions?.slice(
            0,
            this.centralSymmetryCount,
          )
      }
      this.questionsAMC[0] = amcConvert(this.autoCorrectionAMC[0])
    }
  }
}
