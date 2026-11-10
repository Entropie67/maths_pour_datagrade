import { codageMediatrice } from '../../lib/2d/CodageMediatrice'
import { codageMilieu } from '../../lib/2d/CodageMilieu'
import {
  dessousDessus,
  Droite,
  droite,
  droiteHorizontaleParPoint,
  droiteParPointEtPente,
  droiteVerticaleParPoint,
} from '../../lib/2d/droites'
import { grille, seyes } from '../../lib/2d/Grille'
import { pointAbstrait, type PointAbstrait } from '../../lib/2d/PointAbstrait'
import { nommePolygone, Polygone, polygone } from '../../lib/2d/polygones'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { labelPoint, texteParPoint } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import {
  homothetie,
  projectionOrtho,
  rotation,
  symetrieAxiale,
  translation,
} from '../../lib/2d/transformations'
import {
  longueur,
  norme,
  pointEstSur,
} from '../../lib/2d/utilitairesGeometriques'
import { pointSurDroite } from '../../lib/2d/utilitairesPoint'
import { aireTriangle } from '../../lib/2d/utilitairesTriangle'
import { vecteur, type Vecteur } from '../../lib/2d/Vecteur'
import { vide2d } from '../../lib/2d/Vide2d'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { bleuMathalea } from '../../lib/colors'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { creerNomDePolygone, numAlpha } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  contraindreValeur,
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const dateDeModifImportante = '14/11/2021'
export const amcReady = true
export const amcType = 'AMCOpen'
export const titre = 'Construire par symétrie...'

export type CentralSymmetryQuestion = {
  i: number
  points: PointAbstrait[]
  center: PointAbstrait
  bounds: { xmin: number; ymin: number; xmax: number; ymax: number }
}

function choisiPointDuBonCote(d: Droite, lieu = 'dessus') {
  if (d.b === 0) {
    // droite verticale
    const x =
      lieu === 'gauche' || lieu === 'dessous'
        ? randint(-8, -1)
        : lieu === 'sur'
          ? 0
          : randint(1, 8)
    const y = randint(-8, 8)
    return pointAbstrait(x, y)
  } else if (d.a === 0) {
    // droite horizontale
    const y =
      lieu === 'dessus' || lieu === 'droite'
        ? randint(1, 8)
        : lieu === 'sur'
          ? 0
          : randint(-8, -1)
    const x = randint(-8, 8)
    return pointAbstrait(x, y)
  } else {
    // droite oblique
    let x: number
    let y: number
    if (-d.b / d.a > 0) {
      // pente positive
      x = randint(-8, 6) // on évite de s'approcher trop du bord droit où il y aura moins de possibilités
      const y0 = -(d.a * x + d.c) / d.b
      y =
        lieu === 'dessus' || lieu === 'droite'
          ? randint(Math.ceil(y0), 8)
          : lieu === 'dessous' || lieu === 'gauche'
            ? randint(-8, Math.floor(y0))
            : (y = y0)
    } else {
      // pente négative
      x = randint(-6, 8) // on évite de s'approcher trop du bord droit où il y aura moins de possibilités
      const y0 = -(d.a * x + d.c) / d.b
      y =
        lieu === 'dessus' || lieu === 'droite'
          ? randint(Math.ceil(y0), 8)
          : lieu === 'dessous' || lieu === 'gauche'
            ? randint(-8, Math.floor(y0))
            : (y = y0)
    }
    return pointAbstrait(x, y)
  }
}

const couleursCodageCentrale = ['red', bleuMathalea, 'green', 'purple', 'brown']
const marquesCodageCentrale = ['|', '||', '|||', 'X', 'O']

/**
 * Choisit un point supplémentaire pour une symétrie centrale de centre `centre` :
 * ni aligné horizontalement ou verticalement avec les autres points, et à
 * distance suffisante du centre pour que le symétrique reste lisible.
 */
function choisiPointSupplementaire(
  centre: PointAbstrait,
  autres: PointAbstrait[],
  nom: string,
) {
  const tous = [centre, ...autres]
  let P = pointAbstrait(randint(-8, 8), randint(-8, 8), nom, 'above')
  for (let essai = 0; essai < 100; essai++) {
    P = pointAbstrait(
      randint(
        -8,
        8,
        tous.map((Q) => Math.round(Q.x)),
      ),
      randint(
        -8,
        8,
        tous.map((Q) => Math.round(Q.y)),
      ),
      nom,
      'above',
    )
    if (longueur(P, centre) >= 3) break
  }
  return P
}

function choisi3Points(d: Droite, lieu = ['dessus', 'dessous', 'sur']) {
  let A, B, C
  let pA, pB, pC
  let lAB, lAC, lBC
  let hA, hB, hC
  let count = 0
  let count3 = 0
  let trouves = false
  do {
    trouves = false
    // on vérifie que les points sont assez espacés les uns des autres.
    let trouveA = false
    do {
      // on vérifie que le point est du bon côté et à distance suffisante de la droite.
      if (lieu[0] === 'sur') A = pointSurDroite(d, randint(-6, 6), '')
      else A = choisiPointDuBonCote(d, lieu[0])
      pA = projectionOrtho(A, d)
      hA = longueur(A, pA)
      count++
    } while (
      ((hA < 2 && lieu[0] !== 'sur') || dessousDessus(d, A) !== lieu[0]) &&
      count < 100
    )
    if (count < 100) {
      trouveA = true
    }
    count = 0
    let trouveB = false
    do {
      // on vérifie que le point est du bon côté et à distance suffisante de la droite.
      if (lieu[1] === 'sur') B = pointSurDroite(d, randint(-6, 6), '')
      else
        B = pointAbstrait(
          randint(-8, 8, Math.round(A.x)),
          randint(-8, 8, Math.round(A.y)),
        )
      pB = projectionOrtho(B, d)
      hB = longueur(B, pB)
      count++
    } while (
      ((hB < 2 && lieu[1] !== 'sur') || dessousDessus(d, B) !== lieu[1]) &&
      count < 100
    )
    if (count < 100) {
      trouveB = true
    }
    count = 0
    let trouveC = false
    do {
      // on vérifie que le point est du bon côté et à distance suffisante de la droite.
      if (lieu[2] === 'sur') C = pointSurDroite(d, randint(-8, 8), '')
      else
        C = pointAbstrait(
          randint(-8, 8, [Math.round(A.x), Math.round(B.x)]),
          randint(-8, 8, [Math.round(A.y), Math.round(B.y)]),
        )
      pC = projectionOrtho(C, d)
      hC = longueur(C, pC)
      count++
    } while (
      ((hC < 2 && lieu[2] !== 'sur') || dessousDessus(d, C) !== lieu[2]) &&
      count < 100
    )
    if (count < 100) {
      trouveC = true
    }
    lAB = longueur(pA, pB)
    lAC = longueur(pA, pC)
    lBC = longueur(pB, pC)
    trouves = trouveA && trouveB && trouveC
    count3++
  } while (
    (lAB < 2 ||
      lAC < 2 ||
      lBC < 2 ||
      !trouves ||
      Number(aireTriangle(polygone(A, B, C))) < 5) &&
    count3 < 100
  )
  return [A, B, C] // Il y aura quand même trois points, même si ils ne conviennent pas au regard des contraintes
}

/**
 * @author Jean-claude Lhote  (Ajout AMC par Éric Elter, ES6 par Loïc Geeraerts)
 * Fonction générale pour les exercices de construction de symétriques (centrale/axiale et points/triangles)
 * Permet une sortie html/pdf sur petits carreaux/gros carreaux/papier blanc
 * Relecture : Novembre 2021 par EE
 */

export default class ConstruireParSymetrie extends Exercice {
  figure: boolean
  version: number
  /** Nombre de points à construire pour la symétrie centrale de points */
  protected nbPointsSymetrieCentrale = 3
  protected centralSymmetryInteractive?: (
    question: CentralSymmetryQuestion,
  ) => string
  constructor() {
    super()
    this.nbQuestions = 1

    this.sup = 1
    this.sup2 = 1
    this.sup3 = '0'
    this.sup4 = false
    this.figure = false
    this.version = 6

    this.besoinFormulaireNumerique = [
      'Type de questions',
      6,
      '1 : Axe horizontal ou vertical\n2 : Axe oblique à 45°\n3 : Axe avec une légère pente\n4 : Toutes les symétries axiales\n5 : Symétrie centrale\n6 : Mélange',
    ]
    this.besoinFormulaire2Numerique = [
      'Type de cahier',
      3,
      ' 1 : Cahier à petits carreaux\n 2 : Cahier à gros carreaux (Seyes)\n 3 : Feuille blanche',
    ]
    this.besoinFormulaire3Texte = [
      'Niveau de difficulté pour la symétrie axiale',
      "Nombres séparés par des tirets :\n1 : Tous les points du même côté de l'axe\n2 : Deux points du même côté et le troisième sur l'axe\n3 : Un point sur l'axe et un de chaque côté\n4 : Deux points d'un côté de l'axe et le troisième de l'autre côté\n0 : Mélange",
    ]
    this.besoinFormulaire4CaseACocher = [
      "Avec les quadrillages, décentrer l'axe ou le centre",
      false,
    ]
    this.comment =
      "Décentrer l'axe ou le centre, permt d'éviter les stratégies de comptage à partir du bord du quadrillage"
  }

  // La fonction qui suit va chercher 3 points au hasard placés par rapport à la droite d de la façon demandée
  // Elle va s'assurer que la distance entre les projetés n'est pas trop petite afin d'espacer les corrections
  // Si pour une raison ou une autre elle ne trouve pas de point convenable, un message dans la console le signale.
  nouvelleVersion() {
    if (this.version === 5) {
      this.sup = 5
      this.sup3 = '0'
    }
    const lieux = gestionnaireFormulaireTexte({
      saisie: this.sup3,
      min: 1,
      max: 4,
      melange: 0,
      nbQuestions: this.nbQuestions,
      defaut: 0,
    }).map((s) => Number(s) - 1)
    let positionLabelDroite
    this.sup = contraindreValeur(1, 6, this.sup, 6)
    let listeDeNomsDePolygones: string[] = []

    let typesDeQuestionsDisponibles: number[] = []
    switch (this.sup) {
      case 1:
        if (this.figure) {
          typesDeQuestionsDisponibles = [3]
        } else {
          typesDeQuestionsDisponibles = [0]
        }
        break
      case 2:
        if (this.figure) {
          typesDeQuestionsDisponibles = [4]
        } else {
          typesDeQuestionsDisponibles = [1]
        }
        break
      case 3:
        if (this.figure) {
          typesDeQuestionsDisponibles = [5]
        } else {
          typesDeQuestionsDisponibles = [2]
        }
        break
      case 4:
        if (this.figure) {
          typesDeQuestionsDisponibles = [3, 4, 5]
        } else {
          typesDeQuestionsDisponibles = [0, 1, 2]
        }
        break
      case 5:
        if (this.figure) {
          typesDeQuestionsDisponibles = [7]
        } else {
          typesDeQuestionsDisponibles = [6]
        }
        break
      case 6:
        if (this.figure) {
          typesDeQuestionsDisponibles = [3, 4, 5, 7]
        } else {
          typesDeQuestionsDisponibles = [0, 1, 2, 6]
        }
        break
    }
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    let Xmin, Xmax, Ymin, Ymax, sc
    if (this.sup2 === 2) sc = 0.8
    else sc = 0.5

    let A
    let AA
    let cA
    let sA
    let B: PointAbstrait
    let C
    let CC
    let cC
    let sC
    let sCE
    let D
    let DD
    let cD
    let sD
    let sDE
    let E
    let EE
    let cE
    let sE
    let sED
    let sEC
    let d
    let enonce: string
    let correction
    let g
    let carreaux
    let k // k sert pour la pente de la droite cas 45°
    let axeHorizontal = false
    const objetsEnonce = []
    const objetsCorrection = []
    let p1
    let p2
    let p1nom: string
    let pointsSymetrie: PointAbstrait[] = []
    for (
      let i = 0, cpt = 0, numQuestion: number;
      i < this.nbQuestions && cpt < 50;
    ) {
      const choixLieux = [
        choice([
          ['dessus', 'dessus', 'dessus'],
          ['dessous', 'dessous', 'dessous'],
        ]),
        choice([
          ['dessus', 'sur', 'dessus'],
          ['dessous', 'sur', 'dessous'],
        ]),
        choice([
          ['dessus', 'dessous', 'sur'],
          ['sur', 'dessous', 'dessus'],
          ['dessus', 'sur', 'dessous'],
        ]),
        choice([
          ['dessus', 'dessous', 'dessus'],
          ['dessus', 'dessus', 'dessous'],
        ]),
        choice([
          ['dessus', 'dessous', 'dessus'],
          ['dessus', 'dessus', 'dessous'],
          ['dessus', 'sur', 'dessus'],
          ['dessous', 'sur', 'dessus'],
          ['dessus', 'dessous', 'sur'],
          ['sur', 'dessous', 'dessus'],
          ['dessus', 'sur', 'dessous'],
          ['dessus', 'dessous', 'dessus'],
          ['dessus', 'dessus', 'dessous'],
        ]),
      ]
      let lieuxChoisis = choixLieux[lieux[i]].map((lieu) => lieu)
      listeDeNomsDePolygones = i % 3 === 0 ? ['PQXD'] : listeDeNomsDePolygones
      objetsEnonce.length = 0
      objetsCorrection.length = 0
      switch (listeTypeDeQuestions[i]) {
        case 0: // symétrie d'axe horizontal ou vertical de points
          p1nom = creerNomDePolygone(5, listeDeNomsDePolygones)
          listeDeNomsDePolygones.push(p1nom)
          axeHorizontal = choice([true, false]) // axeHorizontal = true axe horizontal sinon vertical
          A = pointAbstrait(0, 0)
          if (axeHorizontal) d = droiteHorizontaleParPoint(A)
          else d = droiteVerticaleParPoint(A)
          lieuxChoisis = lieuxChoisis.map((lieu) =>
            lieu
              .replace('dessus', axeHorizontal ? 'dessus' : 'droite')
              .replace('dessous', axeHorizontal ? 'dessous' : 'gauche'),
          )
          B = pointSurDroite(d, 6, '')
          d.epaisseur = 2
          ;[C, D, E] = choisi3Points(d, lieuxChoisis)
          C.nom = p1nom[2]
          C.positionLabel = 'above'
          D.nom = p1nom[3]
          D.positionLabel = 'above'
          E.nom = p1nom[4]
          E.positionLabel = 'above'
          CC = symetrieAxiale(C, d, `${p1nom[2]}'`, 'above')
          DD = symetrieAxiale(D, d, `${p1nom[3]}'`, 'above')
          EE = symetrieAxiale(E, d, `${p1nom[4]}'`, 'above')
          cC = pointEstSur(C, d) ? C : codageMediatrice(C, CC, 'red', '|')
          cD = pointEstSur(D, d)
            ? D
            : codageMediatrice(D, DD, bleuMathalea, 'X')
          cE = pointEstSur(E, d) ? E : codageMediatrice(E, EE, 'green', 'O')
          sC = pointEstSur(C, d) ? vide2d() : segment(C, CC)
          sD = pointEstSur(D, d) ? vide2d() : segment(D, DD)
          sE = pointEstSur(E, d) ? vide2d() : segment(E, EE)
          sCE = droite(CC, EE, '', 'gray')
          sCE.pointilles = 5
          sED = droite(EE, D, '', 'gray')
          sED.pointilles = 5
          sDE = droite(DD, E, '', 'gray')
          sDE.pointilles = 5
          sEC = droite(C, E, '', 'gray')
          sEC.pointilles = 5

          objetsCorrection.push(
            d,
            tracePoint(C, D, E, CC, DD, EE),
            labelPoint(C, D, E, CC, DD, EE),
            cC,
            cD,
            cE,
            sC,
            sD,
            sE,
            sED,
            sDE,
            sCE,
            sEC,
          )
          objetsEnonce.push(tracePoint(C, D, E), labelPoint(C, D, E), d)
          if (context.isHtml && !context.isTypst) {
            numQuestion = 0
            enonce =
              numAlpha(numQuestion) + ' Reproduire la figure ci-dessous.<br>'
          } else {
            numQuestion = -1
            enonce = ''
          }
          enonce +=
            numAlpha(numQuestion + 1) +
            ` Construire le point $${p1nom[2]}'$, symétrique de $${p1nom[2]}$ par rapport à la droite $(d)$.<br>`
          enonce +=
            numAlpha(numQuestion + 2) +
            ` Construire le point $${p1nom[3]}'$, symétrique de $${p1nom[3]}$ par rapport à la droite $(d)$.<br>`
          enonce +=
            numAlpha(numQuestion + 3) +
            ` Construire le point $${p1nom[4]}'$, symétrique de $${p1nom[4]}$ par rapport à la droite $(d)$.<br>`
          enonce += numAlpha(numQuestion + 4) + ' Coder la figure.<br><br>'
          Xmin = Math.floor(
            Math.min(A.x, B.x, C.x, D.x, E.x, EE.x, CC.x, DD.x) - 1,
          )
          Xmax = Math.ceil(
            Math.max(A.x, B.x, C.x, D.x, E.x, EE.x, CC.x, DD.x) + 1,
          )
          Ymin = Math.floor(
            Math.min(A.y, B.y, C.y, D.y, E.y, EE.y, CC.y, DD.y) - 1,
          )
          Ymax = Math.ceil(
            Math.max(A.y, B.y, C.y, D.y, E.y, EE.y, CC.y, DD.y) + 1,
          )

          // correction = 'Contrôler la figure en vérifiant que les segments en pointillés se coupent bien sur la droite $(d)$.<br><br>'
          // correction = 'Contrôler votre figure en vérifiant qu\'elle "ressemble" à la figure ci-dessous.<br><br>'

          break
        case 1: // symétries axiales d'axes à 45° de points (6ème)
          p1nom = creerNomDePolygone(5, listeDeNomsDePolygones)
          listeDeNomsDePolygones.push(p1nom)
          A = pointAbstrait(0, 0, `${p1nom[0]}`, 'above')
          k = choice([-1, 1])
          d = droiteParPointEtPente(A, k)
          B = pointSurDroite(d, 6, `${p1nom[1]}`, 'above')
          d.epaisseur = 2
          ;[C, D, E] = choisi3Points(d, lieuxChoisis)
          C.nom = p1nom[2]
          C.positionLabel = 'above'
          D.nom = p1nom[3]
          D.positionLabel = 'above'
          E.nom = p1nom[4]
          E.positionLabel = 'above'
          CC = symetrieAxiale(C, d, `${p1nom[2]}'`, 'above')
          DD = symetrieAxiale(D, d, `${p1nom[3]}'`, 'above')
          EE = symetrieAxiale(E, d, `${p1nom[4]}'`, 'above')
          cC = pointEstSur(C, d) ? C : codageMediatrice(C, CC, 'red', '|')
          cD = pointEstSur(D, d)
            ? D
            : codageMediatrice(D, DD, bleuMathalea, 'X')
          cE = pointEstSur(E, d) ? E : codageMediatrice(E, EE, 'green', 'O')
          sC = pointEstSur(C, d) ? vide2d() : segment(C, CC)
          sD = pointEstSur(D, d) ? vide2d() : segment(D, DD)
          sE = pointEstSur(E, d) ? vide2d() : segment(E, EE)
          sCE = droite(CC, EE, '', 'gray')
          sCE.pointilles = 5
          sED = droite(EE, D, '', 'gray')
          sED.pointilles = 5
          sDE = droite(DD, E, '', 'gray')
          sDE.pointilles = 5
          sEC = droite(C, E, '', 'gray')
          sEC.pointilles = 5
          objetsCorrection.push(
            d,
            tracePoint(C, D, E, CC, DD, EE),
            labelPoint(C, D, E, CC, DD, EE),
            cC,
            cD,
            cE,
            sC,
            sD,
            sE,
            sED,
            sDE,
            sCE,
            sEC,
          )
          objetsEnonce.push(tracePoint(C, D, E), labelPoint(C, D, E), d)
          if (context.isHtml && !context.isTypst) {
            numQuestion = 0
            enonce =
              numAlpha(numQuestion) + ' Reproduire la figure ci-dessous.<br>'
          } else {
            numQuestion = -1
            enonce = ''
          }
          enonce +=
            numAlpha(numQuestion + 1) +
            ` Construire le point $${p1nom[2]}'$, symétrique de $${p1nom[2]}$ par rapport à la droite $(d)$.<br>`
          enonce +=
            numAlpha(numQuestion + 2) +
            ` Construire le point $${p1nom[3]}'$, symétrique de $${p1nom[3]}$ par rapport à la droite $(d)$.<br>`
          enonce +=
            numAlpha(numQuestion + 3) +
            ` Construire le point $${p1nom[4]}'$, symétrique de $${p1nom[4]}$ par rapport à la droite $(d)$.<br>`
          enonce += numAlpha(numQuestion + 4) + ' Coder la figure.<br><br>'
          Xmin = Math.floor(
            Math.min(A.x, B.x, C.x, D.x, E.x, EE.x, CC.x, DD.x) - 1,
          )
          Xmax = Math.ceil(
            Math.max(A.x, B.x, C.x, D.x, E.x, EE.x, CC.x, DD.x) + 1,
          )
          Ymin = Math.floor(
            Math.min(A.y, B.y, C.y, D.y, E.y, EE.y, CC.y, DD.y) - 1,
          )
          Ymax = Math.ceil(
            Math.max(A.y, B.y, C.y, D.y, E.y, EE.y, CC.y, DD.y) + 1,
          )

          // correction = 'Contrôler la figure en vérifiant que les segments en pointillés se coupent bien sur la droite $(d)$.<br><br>'
          // correction = 'Contrôler votre figure en vérifiant qu\'elle "ressemble" à la figure ci-dessous.<br><br>'

          break
        case 2: // Axe de symétrie légèrement penché (utilisation du quadrillage plus complexe)
          p1nom = creerNomDePolygone(5, listeDeNomsDePolygones)
          listeDeNomsDePolygones.push(p1nom)
          A = pointAbstrait(0, randint(-1, 1), `${p1nom[0]}`, 'above')
          B = pointAbstrait(6, choice([-1, 1], [A.y]), `${p1nom[1]}`, 'above')
          d = droite(A, B)
          d.epaisseur = 2
          ;[C, D, E] = choisi3Points(d, lieuxChoisis)
          C.nom = p1nom[2]
          C.positionLabel = 'above'
          D.nom = p1nom[3]
          D.positionLabel = 'above'
          E.nom = p1nom[4]
          E.positionLabel = 'above'
          CC = symetrieAxiale(C, d, `${p1nom[2]}'`, 'above')
          DD = symetrieAxiale(D, d, `${p1nom[3]}'`, 'above')
          EE = symetrieAxiale(E, d, `${p1nom[4]}'`, 'above')
          cC = pointEstSur(C, d) ? C : codageMediatrice(C, CC, 'red', '|')
          cD = pointEstSur(D, d)
            ? D
            : codageMediatrice(D, DD, bleuMathalea, 'X')
          cE = pointEstSur(E, d) ? E : codageMediatrice(E, EE, 'green', 'O')
          sC = pointEstSur(C, d) ? vide2d() : segment(C, CC)
          sD = pointEstSur(D, d) ? vide2d() : segment(D, DD)
          sE = pointEstSur(E, d) ? vide2d() : segment(E, EE)
          sCE = segment(CC, EE, 'gray')
          sCE.pointilles = 5
          sED = segment(EE, D, 'gray')
          sED.pointilles = 5
          sDE = segment(DD, E, 'gray')
          sDE.pointilles = 5
          sEC = segment(C, E, 'gray')
          sEC.pointilles = 5

          objetsCorrection.push(
            d,
            tracePoint(C, D, E, CC, DD, EE),
            labelPoint(C, D, E, CC, DD, EE),
            cC,
            cD,
            cE,
            sC,
            sD,
            sE,
            sED,
            sDE,
            sCE,
            sEC,
          )
          objetsEnonce.push(tracePoint(C, D, E), labelPoint(C, D, E), d)
          if (context.isHtml && !context.isTypst) {
            numQuestion = 0
            enonce =
              numAlpha(numQuestion) + ' Reproduire la figure ci-dessous.<br>'
          } else {
            numQuestion = -1
            enonce = ''
          }
          enonce +=
            numAlpha(numQuestion + 1) +
            ` Construire le point $${p1nom[2]}'$, symétrique de $${p1nom[2]}$ par rapport à la droite $(d)$.<br>`
          enonce +=
            numAlpha(numQuestion + 2) +
            ` Construire le point $${p1nom[3]}'$, symétrique de $${p1nom[3]}$ par rapport à la droite $(d)$.<br>`
          enonce +=
            numAlpha(numQuestion + 3) +
            ` Construire le point $${p1nom[4]}'$, symétrique de $${p1nom[4]}$ par rapport à la droite $(d)$.<br>`
          enonce += numAlpha(numQuestion + 4) + ' Coder la figure.<br><br>'
          Xmin = Math.floor(
            Math.min(A.x, B.x, C.x, D.x, E.x, EE.x, CC.x, DD.x) - 1,
          )
          Xmax = Math.ceil(
            Math.max(A.x, B.x, C.x, D.x, E.x, EE.x, CC.x, DD.x) + 1,
          )
          Ymin = Math.floor(
            Math.min(A.y, B.y, C.y, D.y, E.y, EE.y, CC.y, DD.y) - 1,
          )
          Ymax = Math.ceil(
            Math.max(A.y, B.y, C.y, D.y, E.y, EE.y, CC.y, DD.y) + 1,
          )

          // correction = 'Contrôler la figure en vérifiant que les segments en pointillés se coupent bien sur la droite $(d)$.<br><br>'
          // correction = 'Contrôler votre figure en vérifiant qu\'elle "ressemble" à la figure ci-dessous.<br><br>'
          break

        case 3: // symétrie axiale (Axe vertical ou horizontal) d'un triangle
          p1nom = creerNomDePolygone(5, listeDeNomsDePolygones)
          listeDeNomsDePolygones.push(p1nom)
          A = pointAbstrait(0, 0, `${p1nom[0]}`, 'above')
          axeHorizontal = choice([true, false]) // si axeHorizontal est true alors d est horizontale sinon elle est verticale
          if (axeHorizontal) d = droiteHorizontaleParPoint(A)
          else d = droiteVerticaleParPoint(A)
          lieuxChoisis = lieuxChoisis.map((lieu) =>
            lieu
              .replace('dessus', axeHorizontal ? 'dessus' : 'droite')
              .replace('dessous', axeHorizontal ? 'dessous' : 'gauche'),
          )
          B = pointSurDroite(d, 6, `${p1nom[1]}`, 'above')
          d.epaisseur = 2
          ;[C, D, E] = choisi3Points(d, lieuxChoisis)
          C.nom = p1nom[2]
          C.positionLabel = 'above'
          D.nom = p1nom[3]
          D.positionLabel = 'above'
          E.nom = p1nom[4]
          E.positionLabel = 'above'
          p1 = polygone(C, D, E) as Polygone
          p2 = symetrieAxiale(p1, d) as Polygone
          p2.listePoints[0].nom = `${p1nom[2]}'`
          p2.listePoints[1].nom = `${p1nom[3]}'`
          p2.listePoints[2].nom = `${p1nom[4]}'`
          CC = nommePolygone(p1)
          DD = nommePolygone(p2)
          cC = pointEstSur(p1.listePoints[0], d)
            ? vide2d()
            : codageMediatrice(p1.listePoints[0], p2.listePoints[0], 'red', '|')
          cD = pointEstSur(p1.listePoints[1], d)
            ? vide2d()
            : codageMediatrice(
                p1.listePoints[1],
                p2.listePoints[1],
                bleuMathalea,
                'X',
              )
          cE = pointEstSur(p1.listePoints[2], d)
            ? vide2d()
            : codageMediatrice(
                p1.listePoints[2],
                p2.listePoints[2],
                'green',
                'O',
              )
          sC = pointEstSur(p1.listePoints[0], d)
            ? vide2d()
            : segment(p1.listePoints[0], p2.listePoints[0], 'red')
          sD = pointEstSur(p1.listePoints[1], d)
            ? vide2d()
            : segment(p1.listePoints[1], p2.listePoints[1], bleuMathalea)
          sE = pointEstSur(p1.listePoints[2], d)
            ? vide2d()
            : segment(p1.listePoints[2], p2.listePoints[2], 'green')

          sCE = droite(p1.listePoints[2], p1.listePoints[1], '', 'gray')
          sCE.pointilles = 5
          sED = droite(p2.listePoints[2], p2.listePoints[1], '', 'gray')
          sED.pointilles = 5
          objetsCorrection.push(
            d,
            cC,
            cD,
            cE,
            sC,
            sD,
            sE,
            CC,
            DD,
            p1,
            p2,
            sCE,
            sED,
          )
          objetsEnonce.push(CC, p1, d)
          if (context.isHtml && !context.isTypst) {
            numQuestion = 0
            enonce =
              numAlpha(numQuestion) + ' Reproduire la figure ci-dessous.<br>'
          } else {
            numQuestion = -1
            enonce = ''
          }
          enonce +=
            numAlpha(numQuestion + 1) +
            ` Construire le triangle  $${p1nom[2]}'${p1nom[3]}'${p1nom[4]}'$ symétrique de $${p1nom[2]}${p1nom[3]}${p1nom[4]}$ par rapport à la droite $(d)$.<br>`
          enonce += numAlpha(numQuestion + 2) + ' Coder la figure.<br><br>'
          Xmin = Math.floor(
            Math.min(
              A.x,
              B.x,
              C.x,
              D.x,
              p1.listePoints[0].x,
              p1.listePoints[1].x,
              p1.listePoints[2].x,
              p2.listePoints[0].x,
              p2.listePoints[1].x,
              p2.listePoints[2].x,
            ) - 1,
          )
          Xmax = Math.ceil(
            Math.max(
              A.x,
              B.x,
              C.x,
              D.x,
              p1.listePoints[0].x,
              p1.listePoints[1].x,
              p1.listePoints[2].x,
              p2.listePoints[0].x,
              p2.listePoints[1].x,
              p2.listePoints[2].x,
            ) + 1,
          )
          Ymin = Math.floor(
            Math.min(
              A.y,
              B.y,
              C.y,
              D.y,
              p1.listePoints[0].y,
              p1.listePoints[1].y,
              p1.listePoints[2].y,
              p2.listePoints[0].y,
              p2.listePoints[1].y,
              p2.listePoints[2].y,
            ) - 1,
          )
          Ymax = Math.ceil(
            Math.max(
              A.y,
              B.y,
              C.y,
              D.y,
              p1.listePoints[0].y,
              p1.listePoints[1].y,
              p1.listePoints[2].y,
              p2.listePoints[0].y,
              p2.listePoints[1].y,
              p2.listePoints[2].y,
            ) + 1,
          )
          // correction = 'Contrôler la figure en vérifiant que les segments en pointillés se coupent bien sur la droite $(d)$.<br><br>'
          // correction = 'Contrôler votre figure en vérifiant qu\'elle "ressemble" à la figure ci-dessous.<br><br>'

          break
        case 4: // symetrie axiale (Axe à 45°) d'un triangle
          p1nom = creerNomDePolygone(5, listeDeNomsDePolygones)
          listeDeNomsDePolygones.push(p1nom)
          A = pointAbstrait(0, 0, `${p1nom[0]}`, 'above')
          k = choice([-1, 1])
          d = droiteParPointEtPente(A, k)
          B = pointSurDroite(d, 6, `${p1nom[1]}`, 'above')
          /*           if (k === 2) {  // inutile ici  ? K sert à autre chose et vaut 1 ou -1
            A.positionLabel = 'above'
            B.positionLabel = 'above'
          }  */
          d.epaisseur = 2
          ;[C, D, E] = choisi3Points(d, lieuxChoisis)
          C.nom = p1nom[2]
          C.positionLabel = 'above'
          D.nom = p1nom[3]
          D.positionLabel = 'above'
          E.nom = p1nom[4]
          E.positionLabel = 'above'
          p1 = polygone(C, D, E) as Polygone
          p2 = symetrieAxiale(p1, d) as Polygone
          p2.listePoints[0].nom = `${p1nom[2]}'`
          p2.listePoints[1].nom = `${p1nom[3]}'`
          p2.listePoints[2].nom = `${p1nom[4]}'`
          CC = nommePolygone(p1)
          DD = nommePolygone(p2)
          cC = pointEstSur(p1.listePoints[0], d)
            ? vide2d()
            : codageMediatrice(p1.listePoints[0], p2.listePoints[0], 'red', '|')
          cD = pointEstSur(p1.listePoints[1], d)
            ? vide2d()
            : codageMediatrice(
                p1.listePoints[1],
                p2.listePoints[1],
                bleuMathalea,
                'X',
              )
          cE = pointEstSur(p1.listePoints[2], d)
            ? vide2d()
            : codageMediatrice(
                p1.listePoints[2],
                p2.listePoints[2],
                'green',
                'O',
              )
          sC = pointEstSur(p1.listePoints[0], d)
            ? vide2d()
            : segment(p1.listePoints[0], p2.listePoints[0], 'red')
          sD = pointEstSur(p1.listePoints[1], d)
            ? vide2d()
            : segment(p1.listePoints[1], p2.listePoints[1], bleuMathalea)
          sE = pointEstSur(p1.listePoints[2], d)
            ? vide2d()
            : segment(p1.listePoints[2], p2.listePoints[2], 'green')
          sCE = droite(p1.listePoints[2], p1.listePoints[1], '', 'gray')
          sCE.pointilles = 5
          sED = droite(p2.listePoints[2], p2.listePoints[1], '', 'gray')
          sED.pointilles = 5
          objetsCorrection.push(
            d,
            cC,
            cD,
            cE,
            sC,
            sD,
            sE,
            CC,
            DD,
            p1,
            p2,
            sCE,
            sED,
          )
          objetsEnonce.push(CC, p1, d)
          if (context.isHtml && !context.isTypst) {
            numQuestion = 0
            enonce =
              numAlpha(numQuestion) + ' Reproduire la figure ci-dessous.<br>'
          } else {
            numQuestion = -1
            enonce = ''
          }
          enonce +=
            numAlpha(numQuestion + 1) +
            ` Construire le triangle  $${p1nom[2]}'${p1nom[3]}'${p1nom[4]}'$ symétrique de $${p1nom[2]}${p1nom[3]}${p1nom[4]}$ par rapport à la droite $(d)$.<br>`
          enonce += numAlpha(numQuestion + 2) + ' Coder la figure.<br><br>'
          Xmin = Math.floor(
            Math.min(
              A.x,
              B.x,
              C.x,
              D.x,
              p1.listePoints[0].x,
              p1.listePoints[1].x,
              p1.listePoints[2].x,
              p2.listePoints[0].x,
              p2.listePoints[1].x,
              p2.listePoints[2].x,
            ) - 1,
          )
          Xmax = Math.ceil(
            Math.max(
              A.x,
              B.x,
              C.x,
              D.x,
              p1.listePoints[0].x,
              p1.listePoints[1].x,
              p1.listePoints[2].x,
              p2.listePoints[0].x,
              p2.listePoints[1].x,
              p2.listePoints[2].x,
            ) + 1,
          )
          Ymin = Math.floor(
            Math.min(
              A.y,
              B.y,
              C.y,
              D.y,
              p1.listePoints[0].y,
              p1.listePoints[1].y,
              p1.listePoints[2].y,
              p2.listePoints[0].y,
              p2.listePoints[1].y,
              p2.listePoints[2].y,
            ) - 1,
          )
          Ymax = Math.ceil(
            Math.max(
              A.y,
              B.y,
              C.y,
              D.y,
              p1.listePoints[0].y,
              p1.listePoints[1].y,
              p1.listePoints[2].y,
              p2.listePoints[0].y,
              p2.listePoints[1].y,
              p2.listePoints[2].y,
            ) + 1,
          )
          // correction = 'Contrôler la figure en vérifiant que les segments en pointillés se coupent bien sur la droite $(d)$.<br><br>'
          // correction = 'Contrôler votre figure en vérifiant qu\'elle "ressemble" à la figure ci-dessous.<br><br>'
          break
        case 5: // symetrie axiale Axe légèrement penché
          p1nom = creerNomDePolygone(5, listeDeNomsDePolygones)
          listeDeNomsDePolygones.push(p1nom)
          A = pointAbstrait(0, randint(-1, 1), `${p1nom[0]}`, 'above')
          B = pointAbstrait(6, choice([-1, 1], [A.y]), `${p1nom[1]}`, 'above')
          d = droite(A, B)
          d.epaisseur = 2
          ;[C, D, E] = choisi3Points(d, lieuxChoisis)
          C.nom = p1nom[2]
          C.positionLabel = 'above'
          D.nom = p1nom[3]
          D.positionLabel = 'above'
          E.nom = p1nom[4]
          E.positionLabel = 'above'
          p1 = polygone(C, D, E) as Polygone
          p2 = symetrieAxiale(p1, d) as Polygone
          p2.listePoints[0].nom = `${p1nom[2]}'`
          p2.listePoints[1].nom = `${p1nom[3]}'`
          p2.listePoints[2].nom = `${p1nom[4]}'`
          CC = nommePolygone(p1)
          DD = nommePolygone(p2)
          cC = pointEstSur(p1.listePoints[0], d)
            ? vide2d()
            : codageMediatrice(p1.listePoints[0], p2.listePoints[0], 'red', '|')
          cD = pointEstSur(p1.listePoints[1], d)
            ? vide2d()
            : codageMediatrice(
                p1.listePoints[1],
                p2.listePoints[1],
                bleuMathalea,
                'X',
              )
          cE = pointEstSur(p1.listePoints[2], d)
            ? vide2d()
            : codageMediatrice(
                p1.listePoints[2],
                p2.listePoints[2],
                'green',
                'O',
              )
          sC = pointEstSur(p1.listePoints[0], d)
            ? vide2d()
            : segment(p1.listePoints[0], p2.listePoints[0], 'red')
          sD = pointEstSur(p1.listePoints[1], d)
            ? vide2d()
            : segment(p1.listePoints[1], p2.listePoints[1], bleuMathalea)
          sE = pointEstSur(p1.listePoints[2], d)
            ? vide2d()
            : segment(p1.listePoints[2], p2.listePoints[2], 'green')
          sCE = droite(p1.listePoints[2], p1.listePoints[1], '', 'gray')
          sCE.pointilles = 5
          sED = droite(p2.listePoints[2], p2.listePoints[1], '', 'gray')
          sED.pointilles = 5
          //  inter = pointIntersectionDD(sCE, sED)
          objetsCorrection.push(
            d,
            cC,
            cD,
            cE,
            sC,
            sD,
            sE,
            CC,
            DD,
            p1,
            p2,
            sCE,
            sED,
          )
          objetsEnonce.push(CC, p1, d)
          if (context.isHtml && !context.isTypst) {
            numQuestion = 0
            enonce =
              numAlpha(numQuestion) + ' Reproduire la figure ci-dessous.<br>'
          } else {
            numQuestion = -1
            enonce = ''
          }
          enonce +=
            numAlpha(numQuestion + 1) +
            ` Construire le triangle  $${p1nom[2]}'${p1nom[3]}'${p1nom[4]}'$ symétrique de $${p1nom[2]}${p1nom[3]}${p1nom[4]}$ par rapport à la droite $(d)$.<br>`
          enonce += numAlpha(numQuestion + 2) + ' Coder la figure.<br><br>'
          Xmin = Math.floor(
            Math.min(
              A.x,
              B.x,
              C.x,
              D.x,
              p1.listePoints[0].x,
              p1.listePoints[1].x,
              p1.listePoints[2].x,
              p2.listePoints[0].x,
              p2.listePoints[1].x,
              p2.listePoints[2].x,
            ) - 1,
          )
          Xmax = Math.ceil(
            Math.max(
              A.x,
              B.x,
              C.x,
              D.x,
              p1.listePoints[0].x,
              p1.listePoints[1].x,
              p1.listePoints[2].x,
              p2.listePoints[0].x,
              p2.listePoints[1].x,
              p2.listePoints[2].x,
            ) + 1,
          )
          Ymin = Math.floor(
            Math.min(
              A.y,
              B.y,
              C.y,
              D.y,
              p1.listePoints[0].y,
              p1.listePoints[1].y,
              p1.listePoints[2].y,
              p2.listePoints[0].y,
              p2.listePoints[1].y,
              p2.listePoints[2].y,
            ) - 1,
          )
          Ymax = Math.ceil(
            Math.max(
              A.y,
              B.y,
              C.y,
              D.y,
              p1.listePoints[0].y,
              p1.listePoints[1].y,
              p1.listePoints[2].y,
              p2.listePoints[0].y,
              p2.listePoints[1].y,
              p2.listePoints[2].y,
            ) + 1,
          )

          // correction = 'Contrôler la figure en vérifiant que les segments en pointillés se coupent bien sur la droite $(d)$.<br><br>'
          // correction = 'Contrôler votre figure en vérifiant qu\'elle "ressemble" à la figure ci-dessous.<br><br>'
          break
        case 6: {
          // symétries centrales de points (3 par défaut)
          const nbPoints = this.nbPointsSymetrieCentrale
          p1nom = creerNomDePolygone(
            Math.max(5, nbPoints + 1),
            listeDeNomsDePolygones,
          )
          listeDeNomsDePolygones.push(p1nom)
          B = pointAbstrait(
            randint(-8, 8),
            randint(-3, 3),
            `${p1nom[1]}`,
            'above',
          )
          d = droiteParPointEtPente(B, 0)
          ;[A, C, D] = choisi3Points(
            d,
            choice([
              ['dessus', 'dessous', 'dessus'],
              ['dessous', 'dessus', 'dessous'],
            ]),
          )
          A.nom = p1nom[0]
          C.nom = p1nom[2]
          D.nom = p1nom[3]
          pointsSymetrie = [C, D, A].slice(0, nbPoints)
          // Au-delà de trois points, on en ajoute (sans toucher au tirage des trois premiers)
          while (pointsSymetrie.length < nbPoints) {
            pointsSymetrie.push(
              choisiPointSupplementaire(
                B,
                pointsSymetrie,
                [p1nom[4], p1nom[5]][pointsSymetrie.length - 3],
              ),
            )
          }
          const imagesSymetrie = pointsSymetrie.map((P) =>
            rotation(P, B, 180, `${P.nom}'`, 'above'),
          )
          pointsSymetrie.forEach((P) => {
            P.positionLabel = 'above'
          })
          const codagesMilieu = pointsSymetrie.map((P, index) =>
            codageMilieu(
              P,
              imagesSymetrie[index],
              couleursCodageCentrale[index],
              marquesCodageCentrale[index],
              false,
            ),
          )
          const segmentsSymetrie = pointsSymetrie.map((P, index) =>
            segment(P, imagesSymetrie[index]),
          )
          objetsCorrection.push(
            tracePoint(B, ...pointsSymetrie, ...imagesSymetrie),
            labelPoint(B, ...pointsSymetrie, ...imagesSymetrie),
            ...codagesMilieu,
            ...segmentsSymetrie,
          )
          objetsEnonce.push(
            tracePoint(B, ...pointsSymetrie),
            labelPoint(B, ...pointsSymetrie),
          )
          if (context.isHtml && !context.isTypst) {
            numQuestion = 0
            enonce =
              numAlpha(numQuestion) + ' Reproduire la figure ci-dessous.<br>'
          } else {
            numQuestion = -1
            enonce = ''
          }
          pointsSymetrie.forEach((P, index) => {
            enonce +=
              numAlpha(numQuestion + 1 + index) +
              ` Construire le point $${P.nom}'$ symétrique de $${P.nom}$ par rapport au point $${p1nom[1]}$.<br>`
          })
          enonce +=
            numAlpha(numQuestion + 1 + nbPoints) + ' Coder la figure.<br><br>'
          const tousLesPoints = [B, ...pointsSymetrie, ...imagesSymetrie]
          Xmin = Math.floor(Math.min(...tousLesPoints.map((P) => P.x)) - 1)
          Xmax = Math.ceil(Math.max(...tousLesPoints.map((P) => P.x)) + 1)
          Ymin = Math.floor(Math.min(...tousLesPoints.map((P) => P.y)) - 1)
          Ymax = Math.ceil(Math.max(...tousLesPoints.map((P) => P.y)) + 1)
          break
        }
        case 7: // Symétrie centrale de triangle
        default:
          p1nom = creerNomDePolygone(5, listeDeNomsDePolygones)
          listeDeNomsDePolygones.push(p1nom)
          B = pointAbstrait(
            randint(-8, 8),
            randint(-3, 3),
            `${p1nom[1]}`,
            'above',
          )
          d = droiteParPointEtPente(B, 0)
          ;[A, C, D] = choisi3Points(
            d,
            choice([
              ['dessus', 'dessous', 'dessus'],
              ['dessous', 'dessus', 'dessous'],
            ]),
          )
          A.nom = p1nom[0]
          A.positionLabel = 'above'
          C.nom = p1nom[2]
          C.positionLabel = 'above'
          D.nom = p1nom[3]
          D.positionLabel = 'above'
          p1 = polygone(A, C, D)
          p2 = rotation(p1, B, 180)
          p2.listePoints[0].nom = `${p1nom[0]}'`
          p2.listePoints[1].nom = `${p1nom[2]}'`
          p2.listePoints[2].nom = `${p1nom[3]}'`
          CC = nommePolygone(p1)
          DD = nommePolygone(p2)
          cC = codageMilieu(
            p1.listePoints[0],
            p2.listePoints[0],
            'red',
            '|',
            false,
          )
          cD = codageMilieu(
            p1.listePoints[1],
            p2.listePoints[1],
            bleuMathalea,
            'X',
            false,
          )
          cA = codageMilieu(
            p1.listePoints[2],
            p2.listePoints[2],
            'green',
            'O',
            false,
          )
          sA = segment(p1.listePoints[0], p2.listePoints[0], 'red')
          sC = segment(p1.listePoints[1], p2.listePoints[1], bleuMathalea)
          sD = segment(p1.listePoints[2], p2.listePoints[2], 'green')

          objetsCorrection.push(
            tracePoint(B),
            labelPoint(B),
            cC,
            cD,
            cA,
            sC,
            sD,
            sA,
            DD,
            CC,
            p1,
            p2,
          )
          objetsEnonce.push(tracePoint(B), labelPoint(B), CC, p1)
          if (context.isHtml && !context.isTypst) {
            numQuestion = 0
            enonce =
              numAlpha(numQuestion) + ' Reproduire la figure ci-dessous.<br>'
          } else {
            numQuestion = -1
            enonce = ''
          }
          enonce +=
            numAlpha(numQuestion + 1) +
            ` Construire le triangle  $${p1nom[0]}'${p1nom[2]}'${p1nom[3]}'$ symétrique de $${p1nom[0]}${p1nom[2]}${p1nom[3]}$ par rapport au point $${p1nom[1]}$.<br>`
          enonce += numAlpha(numQuestion + 2) + ' Coder la figure.<br><br>'
          Xmin = Math.floor(
            Math.min(
              A.x,
              B.x,
              C.x,
              D.x,
              p1.listePoints[0].x,
              p1.listePoints[1].x,
              p1.listePoints[2].x,
              p2.listePoints[0].x,
              p2.listePoints[1].x,
              p2.listePoints[2].x,
            ) - 1,
          )
          Xmax = Math.ceil(
            Math.max(
              A.x,
              B.x,
              C.x,
              D.x,
              p1.listePoints[0].x,
              p1.listePoints[1].x,
              p1.listePoints[2].x,
              p2.listePoints[0].x,
              p2.listePoints[1].x,
              p2.listePoints[2].x,
            ) + 1,
          )
          Ymin = Math.floor(
            Math.min(
              A.y,
              B.y,
              C.y,
              D.y,
              p1.listePoints[0].y,
              p1.listePoints[1].y,
              p1.listePoints[2].y,
              p2.listePoints[0].y,
              p2.listePoints[1].y,
              p2.listePoints[2].y,
            ) - 1,
          )
          Ymax = Math.ceil(
            Math.max(
              A.y,
              B.y,
              C.y,
              D.y,
              p1.listePoints[0].y,
              p1.listePoints[1].y,
              p1.listePoints[2].y,
              p2.listePoints[0].y,
              p2.listePoints[1].y,
              p2.listePoints[2].y,
            ) + 1,
          )
          break
      }
      if (listeTypeDeQuestions[i] < 6) {
        positionLabelDroite = translation(
          pointSurDroite(d, d.b === 0 ? Ymin + 1 : Xmin + 1, ''),
          homothetie(
            vecteur(d.a, d.b),
            A,
            0.5 / norme(vecteur(d.a, d.b)),
          ) as Vecteur,
        )
        objetsEnonce.push(
          texteParPoint(
            '(d)',
            positionLabelDroite,
            0,
            'black',
            1.5,
            'milieu',
            true,
          ),
        )
        objetsCorrection.push(
          texteParPoint(
            '(d)',
            positionLabelDroite,
            0,
            'black',
            1.5,
            'milieu',
            true,
          ),
        )
      }
      if (this.sup4 && this.sup2 !== 3) {
        // listeTypeDeQuestions[i] voir case au-dessus seuls 1 et 3 sont à axe horizontal ou vertical
        const DeltaX = randint(1, 3)
        const DeltaY = randint(1, 3, [DeltaX])
        if (listeTypeDeQuestions[i] === 0 || listeTypeDeQuestions[i] === 3) {
          if (choice([0, 1]) === 0) {
            if (!axeHorizontal) {
              Xmin = Xmin - DeltaX
            } else {
              Ymin = Ymin - DeltaY
            }
          } else {
            if (!axeHorizontal) {
              Xmax = Xmax + DeltaX
            } else {
              Ymax = Ymax + DeltaY
            }
          }
        } else {
          if (choice([0, 1]) === 0) {
            Xmin = Xmin - DeltaX
          } else {
            Xmax = Xmax + DeltaX
          }
          if (choice([0, 1]) === 0) {
            Ymin = Ymin - DeltaY
          } else {
            Ymax = Ymax + DeltaY
          }
        }
      }
      const params = {
        xmin: Xmin,
        ymin: Ymin,
        xmax: Xmax,
        ymax: Ymax,
        pixelsParCm: 20,
        scale: sc,
      }
      if (this.sup2 < 3) g = grille(Xmin, Ymin, Xmax, Ymax, 'gray', 0.7)
      else g = vide2d()
      if (this.sup2 === 2) {
        k = 0.8
        carreaux = seyes(Xmin, Ymin, Xmax, Ymax)
      } else {
        k = 0.5
        carreaux = vide2d()
      }
      enonce += mathalea2d(params, g, carreaux, ...objetsEnonce)
      correction = mathalea2d(params, g, carreaux, ...objetsCorrection)

      if (context.isAmc) {
        this.autoCorrectionAMC[i] = {
          enonce,
          propositions: [
            {
              texte: correction,
              statut: 3, // (ici c'est le nombre de lignes du cadre pour la réponse de l'élève sur AMC)
              sanscadre: true, // EE : ce champ est facultatif et permet (si true) de cacher le cadre et les lignes acceptant la réponse de l'élève
            },
          ],
        }
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      }

      if (this.questionJamaisPosee(i, Xmin, Xmax, Ymin, Ymax)) {
        // Si la question n'a jamais été posée, on en créé une autre
        if (
          listeTypeDeQuestions[i] === 6 &&
          context.isHtml &&
          !context.isTypst &&
          !context.isAmc &&
          this.interactif &&
          this.centralSymmetryInteractive
        ) {
          enonce = this.centralSymmetryInteractive({
            i,
            points: pointsSymetrie,
            center: B,
            bounds: params,
          })
        }
        this.listeQuestions[i] = enonce
        this.listeCorrections[i] = correction
        i++
      }
      cpt++
    }

    listeQuestionsToContenu(this)
  }
}
