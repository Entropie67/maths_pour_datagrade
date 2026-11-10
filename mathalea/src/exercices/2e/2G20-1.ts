import { grille } from '../../lib/2d/Grille'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import {
  representant,
  representantNomme,
} from '../../lib/2d/representantVecteur'
import { Segment, segment } from '../../lib/2d/segmentsVecteurs'
import { labelPoint } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { translation } from '../../lib/2d/transformations'
import { vecteur } from '../../lib/2d/Vecteur'
import { bleuMathalea, orangeMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const interactifReady = true

export const titre = 'Déterminer graphiquement des images par des translations'
export const dateDePublication = '13/07/2023'
export const dateDeModifImportante = '15/10/2023'

/**
 * Images de points par des translations
 * @author Stéphan Grignon (modifié par EE pour une meilleure visibilité de la correction)
 */
export const uuid = 'd2b57'

export const refs = {
  'fr-fr': ['2G20-1'],
  'fr-ch': ['3G91-7'],
}

// Une fonction pour créer la liste des noms possibles pour un triangle
function allTrianglesNames(nomA: string, nomB: string, nomC: string): string[] {
  const nomsSommets = [nomA, nomB, nomC]
  const noms = []
  do {
    const premierSommet = nomsSommets[0]
    const deuxiemmeSommet = nomsSommets[1]
    const troisiemeSommet = nomsSommets[2]
    noms.push(
      premierSommet + deuxiemmeSommet + troisiemeSommet,
      premierSommet + troisiemeSommet + deuxiemmeSommet,
    )
    nomsSommets.shift()
    nomsSommets.push(premierSommet)
  } while (noms.length < 6)
  return noms
}

function coefDirVecteurEgaleA1(seg1: Segment, seg2: Segment, seg3: Segment) {
  // recherche si un des segments a pour coef directeur 1 ou -1 et possède un point sur la ligne d'en bas
  return (
    (seg1.extremite2.y - seg1.extremite1.y ===
      seg1.extremite2.x - seg1.extremite1.x ||
      seg2.extremite2.y - seg2.extremite1.y ===
        seg2.extremite2.x - seg2.extremite1.x ||
      seg3.extremite2.y - seg3.extremite1.y ===
        seg3.extremite2.x - seg3.extremite1.x) &&
    (seg1.extremite1.y === 0 ||
      seg2.extremite1.y === 0 ||
      seg3.extremite1.y === 0 ||
      seg1.extremite2.y === 0 ||
      seg2.extremite2.y === 0 ||
      seg3.extremite2.y === 0)
  )
}

function coefDirVecteurSegEgaleA1(seg1: Segment) {
  // recherche si un des segments a pour coef directeur 1 ou -1 et possède un point sur la ligne d'en bas
  return (
    seg1.extremite2.y - seg1.extremite1.y ===
    seg1.extremite2.x - seg1.extremite1.x
  )
}

function estEgalAUnAutreSegment(
  s: Segment,
  s1: Segment,
  s2: Segment,
  s3: Segment,
) {
  // recherche si le segment s est égal au segment s1, s2, ou s3
  return (
    (((s.extremite1.x === s1.extremite1.x &&
      s.extremite1.y === s1.extremite1.y) ||
      (s.extremite1.x === s1.extremite2.x &&
        s.extremite1.y === s1.extremite2.y)) &&
      ((s.extremite2.x === s1.extremite1.x &&
        s.extremite2.y === s1.extremite1.y) ||
        (s.extremite2.x === s1.extremite2.x &&
          s.extremite2.y === s1.extremite2.y))) ||
    (((s.extremite1.x === s2.extremite1.x &&
      s.extremite1.y === s2.extremite1.y) ||
      (s.extremite1.x === s2.extremite2.x &&
        s.extremite1.y === s2.extremite2.y)) &&
      ((s.extremite2.x === s2.extremite1.x &&
        s.extremite2.y === s2.extremite1.y) ||
        (s.extremite2.x === s2.extremite2.x &&
          s.extremite2.y === s2.extremite2.y))) ||
    (((s.extremite1.x === s3.extremite1.x &&
      s.extremite1.y === s3.extremite1.y) ||
      (s.extremite1.x === s3.extremite2.x &&
        s.extremite1.y === s3.extremite2.y)) &&
      ((s.extremite2.x === s3.extremite1.x &&
        s.extremite2.y === s3.extremite1.y) ||
        (s.extremite2.x === s3.extremite2.x &&
          s.extremite2.y === s3.extremite2.y)))
  )
}

export default class ImagePtParTranslation extends Exercice {
  classe: number
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Situations différentes ',
      "Nombres séparés par des tirets \n1 : À partir d'une point\n2 : À partir d'une segment\n3 : À partir d'un triangle\n4 : Mélange",
    ]

    this.nbQuestions = 2

    this.sup = '1'
    this.classe = 2
  }

  nouvelleVersion() {
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      defaut: 1,
      melange: 4,
      nbQuestions: this.nbQuestions,
      listeOfCase: ['point', 'segment', 'triangle'],
    })
    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      const objets = []
      const objetsCorr = []
      const A = pointAbstrait(0, 4, 'A', 'above')
      const B = pointAbstrait(2, 4, 'B', 'above')
      const C = pointAbstrait(4, 4, 'C', 'above')
      const D = pointAbstrait(6, 4, 'D', 'above')
      const E = pointAbstrait(8, 4, 'E', 'above')
      const F = pointAbstrait(10, 4, 'F', 'above')
      const G = pointAbstrait(0, 2, 'G', 'left')
      const H = pointAbstrait(2, 2, 'H', 'below left')
      const I = pointAbstrait(4, 2, 'I', 'below left')
      const J = pointAbstrait(6, 2, 'J', 'below left')
      const K = pointAbstrait(8, 2, 'K', 'below left')
      const L = pointAbstrait(10, 2, 'L', 'right')
      const M = pointAbstrait(0, 0, 'M', 'below')
      const N = pointAbstrait(2, 0, 'N', 'below')
      const O = pointAbstrait(4, 0, 'O', 'below')
      const P = pointAbstrait(6, 0, 'P', 'below')
      const Q = pointAbstrait(8, 0, 'Q', 'below')
      const R = pointAbstrait(10, 0, 'R', 'below')
      const CoorPt = [
        [0, 4],
        [2, 4],
        [4, 4],
        [6, 4],
        [8, 4],
        [10, 4],
        [0, 2],
        [2, 2],
        [4, 2],
        [6, 2],
        [8, 2],
        [10, 2],
        [0, 0],
        [2, 0],
        [4, 0],
        [6, 0],
        [8, 0],
        [10, 0],
      ]
      const NomPt = [
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
        'G',
        'H',
        'I',
        'J',
        'K',
        'L',
        'M',
        'N',
        'O',
        'P',
        'Q',
        'R',
      ]
      const Pt = [A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R]
      const PositionPt = tracePoint(
        A,
        B,
        C,
        D,
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
      )
      let LabelsPt = labelPoint(
        A,
        B,
        C,
        D,
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
      )
      const Grille = grille(0, 0, 10, 4)
      let xSOL = 100
      let xPtArrivSeg = 100
      let xPt2Triangle = 100
      let PtDepart
      switch (listeTypeDeQuestions[i]) {
        case 'point':
          {
            // À partir d'un point
            PtDepart = choice([
              A,
              B,
              C,
              D,
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
            ])
            let OrigVec = choice(
              [A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R],
              [PtDepart],
            )
            let ExtrVec = choice(
              [A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R],
              [PtDepart, OrigVec],
            )
            xSOL = PtDepart.x + ExtrVec.x - OrigVec.x
            let ySOL = PtDepart.y + ExtrVec.y - OrigVec.y
            while (xSOL < 0 || xSOL > 10 || ySOL < 0 || ySOL > 4) {
              OrigVec = choice(
                [A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R],
                [PtDepart],
              )
              ExtrVec = choice(
                [A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R],
                [PtDepart, OrigVec],
              )
              xSOL = PtDepart.x + ExtrVec.x - OrigVec.x
              ySOL = PtDepart.y + ExtrVec.y - OrigVec.y
            }
            const nomPD = PtDepart.nom
            const nomOR = OrigVec.nom
            const nomEXT = ExtrVec.nom
            const NomSOL =
              NomPt[
                CoorPt.findIndex(
                  (couple) => couple[0] === xSOL && couple[1] === ySOL,
                )
              ]
            const trPtDepart = tracePoint(PtDepart, bleuMathalea)
            trPtDepart.epaisseur = 2
            objets.push(PositionPt, LabelsPt, Grille)
            objets.push(trPtDepart)

            texte =
              this.classe === 2
                ? `Sans justifier, donner l'image du point $${nomPD}$ par la translation de vecteur $\\overrightarrow{${nomOR}${nomEXT}}$.`
                : `Sans justifier, donner l'image du point $${nomPD}$ par la translation qui transforme $${nomOR}$ en $${nomEXT}$.`
            texte += mathalea2d(
              {
                xmin: -1,
                ymin: -1,
                xmax: 12,
                ymax: 5,
                pixelsParCm: 20,
                scale: 0.5,
                zoom: 1.75,
              },
              objets,
            ) // On trace le graphique de la solution

            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.alphanumeric,
                {
                  texteAvant: `<br><br>L'image du point $${nomPD}$ est :`,
                  texteApres: '.',
                },
              )
            }

            const VecDepl = vecteur(
              ExtrVec.x - OrigVec.x,
              ExtrVec.y - OrigVec.y,
            ) // Crée le vecteur déplacement
            const VecDeplRep = representant(
              VecDepl,
              PtDepart,
              'green',
            ) as Segment // Trace le vecteur déplacement
            VecDeplRep.epaisseur = 2 // Variable qui grossit le tracé du vecteur
            VecDeplRep.styleExtremites = '->' // Donne l'extrémité du vecteur
            const nomVecDepl = representantNomme(
              VecDepl,
              PtDepart,
              nomOR + nomEXT,
              1,
              'green',
            ) // Affiche le nom du vecteur déplacement
            const PositionPtCorr = tracePoint(
              A,
              B,
              C,
              D,
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
              'lightgray',
            )
            const LabelsPtCorr = labelPoint(
              A,
              B,
              C,
              D,
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
              'lightgray',
            )
            objetsCorr.push(PositionPtCorr, LabelsPtCorr, Grille, VecDeplRep)
            if (this.classe === 2) objetsCorr.push(nomVecDepl)
            objetsCorr.push(labelPoint(OrigVec, ExtrVec, 'green'))
            objetsCorr.push(representant(VecDepl, OrigVec, 'green'))
            objetsCorr.push(labelPoint(PtDepart, bleuMathalea), trPtDepart)
            const ptSol = translation(PtDepart, VecDepl, NomSOL)
            ptSol.positionLabel =
              ptSol.y === 0 ? 'below' : ptSol.y === 4 ? 'above' : 'below left'
            const trPtSol = tracePoint(ptSol, orangeMathalea)
            trPtSol.epaisseur = 2
            objetsCorr.push(labelPoint(ptSol, orangeMathalea), trPtSol)
            texteCorr =
              this.classe === 2
                ? `Le point $${miseEnEvidence(NomSOL)}$ est l'image du point $${nomPD}$ par la translation de vecteur $\\overrightarrow{${nomOR}${nomEXT}}$.`
                : `Le point $${miseEnEvidence(NomSOL)}$ est l'image du point $${nomPD}$ par la translation qui transforme $${nomOR}$ en $${nomEXT}$.`
            texteCorr += mathalea2d(
              {
                xmin: -1,
                ymin: -1,
                xmax: 12,
                ymax: 5,
                pixelsParCm: 20,
                scale: 0.5,
                zoom: 1.75,
              },
              objetsCorr,
            ) // On trace le graphique de la solution
            handleAnswers(this, i, {
              reponse: {
                value: [NomSOL],
                options: { texteAvecCasse: true },
              },
            })
          }
          break

        case 'segment':
          {
            // À partir d'un segment
            const PtDepartSeg = choice([
              A,
              B,
              C,
              D,
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
            ])
            PtDepart = PtDepartSeg
            xPtArrivSeg = PtDepartSeg.x + choice([-2, 0, 2])
            let yPtArrivSeg = PtDepartSeg.y + choice([-2, 0, 2])
            while (
              xPtArrivSeg < 0 ||
              xPtArrivSeg > 10 ||
              yPtArrivSeg < 0 ||
              yPtArrivSeg > 4 ||
              (xPtArrivSeg === PtDepartSeg.x && yPtArrivSeg === PtDepartSeg.y)
            ) {
              xPtArrivSeg = PtDepartSeg.x + choice([-2, 0, 2])
              yPtArrivSeg = PtDepartSeg.y + choice([-2, 0, 2])
            }
            const Seg = segment(
              PtDepartSeg.x,
              PtDepartSeg.y,
              xPtArrivSeg,
              yPtArrivSeg,
              bleuMathalea,
            )
            Seg.epaisseur = 2 // Variable qui grossit le tracé du segment
            const nomPDSeg = PtDepartSeg.nom
            const nomPASeg =
              NomPt[
                CoorPt.findIndex(
                  (couple) =>
                    couple[0] === xPtArrivSeg && couple[1] === yPtArrivSeg,
                )
              ]
            const PtArrivSeg =
              Pt[
                CoorPt.findIndex(
                  (couple) =>
                    couple[0] === xPtArrivSeg && couple[1] === yPtArrivSeg,
                )
              ]
            let OrigVec = choice(
              [A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R],
              [PtDepartSeg, PtArrivSeg],
            )
            let ExtrVec = choice(
              [A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R],
              [PtDepartSeg, PtArrivSeg, OrigVec],
            )
            let xSOLPDSeg = PtDepartSeg.x + ExtrVec.x - OrigVec.x
            let ySOLPDSeg = PtDepartSeg.y + ExtrVec.y - OrigVec.y
            let xSOLPASeg = PtArrivSeg.x + ExtrVec.x - OrigVec.x
            let ySOLPASeg = PtArrivSeg.y + ExtrVec.y - OrigVec.y
            while (
              xSOLPDSeg < 0 ||
              xSOLPASeg < 0 ||
              ySOLPDSeg < 0 ||
              ySOLPASeg < 0 ||
              xSOLPDSeg > 10 ||
              xSOLPASeg > 10 ||
              ySOLPDSeg > 4 ||
              ySOLPASeg > 4
            ) {
              OrigVec = choice(
                [A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R],
                [PtDepartSeg, PtArrivSeg],
              )
              ExtrVec = choice(
                [A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R],
                [PtDepartSeg, PtArrivSeg, OrigVec],
              )
              xSOLPDSeg = PtDepartSeg.x + ExtrVec.x - OrigVec.x
              ySOLPDSeg = PtDepartSeg.y + ExtrVec.y - OrigVec.y
              xSOLPASeg = PtArrivSeg.x + ExtrVec.x - OrigVec.x
              ySOLPASeg = PtArrivSeg.y + ExtrVec.y - OrigVec.y
            }
            const nomOR = OrigVec.nom
            const nomEXT = ExtrVec.nom
            const nomSOLPDSeg =
              NomPt[
                CoorPt.findIndex(
                  (couple) =>
                    couple[0] === xSOLPDSeg && couple[1] === ySOLPDSeg,
                )
              ]
            const nomSOLPASeg =
              NomPt[
                CoorPt.findIndex(
                  (couple) =>
                    couple[0] === xSOLPASeg && couple[1] === ySOLPASeg,
                )
              ]
            const SegSOL = segment(
              xSOLPDSeg,
              ySOLPDSeg,
              xSOLPASeg,
              ySOLPASeg,
              orangeMathalea,
            )
            SegSOL.epaisseur = 2 // Variable qui grossit le tracé du vecteur

            const VecDepl = vecteur(
              ExtrVec.x - OrigVec.x,
              ExtrVec.y - OrigVec.y,
            ) // Crée le vecteur déplacement
            const VecDeplRep = representant(VecDepl, PtDepartSeg, 'green') // Trace le vecteur déplacement
            VecDeplRep.epaisseur = 2 // Variable qui grossit le tracé du vecteur
            VecDeplRep.styleExtremites = '->' // Donne l'extrémité du vecteur

            // Recherche du meilleur placement des points H à K pour éviter chevauchement
            let placementPoints
            if (coefDirVecteurSegEgaleA1(VecDeplRep)) {
              // placementPoints = VecDeplRep.extremite1.x - VecDeplRep.extremite2.x > 0 ? 'below right' : 'above left'
              placementPoints =
                VecDeplRep.extremite1.x - VecDeplRep.extremite2.x > 0
                  ? 'below'
                  : 'above'
            } else {
              // placementPoints = VecDeplRep.extremite1.x - VecDeplRep.extremite2.x > 0 ? 'above left' : 'below left'
              placementPoints =
                VecDeplRep.extremite1.x - VecDeplRep.extremite2.x > 0
                  ? 'above'
                  : 'below'
            }
            H.positionLabel = placementPoints
            I.positionLabel = placementPoints
            J.positionLabel = placementPoints
            K.positionLabel = placementPoints
            LabelsPt = labelPoint(
              A,
              B,
              C,
              D,
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
            )

            objets.push(PositionPt, LabelsPt, Grille, Seg)
            texte =
              this.classe === 3
                ? `Sans justifier, donner l'image du segment $[${nomPDSeg}${nomPASeg}]$ par la translation de vecteur $\\overrightarrow{${nomOR}${nomEXT}}$.`
                : `Sans justifier, donner l'image du segment $[${nomPDSeg}${nomPASeg}]$ par la translation qui transforme $${nomOR}$ en $${nomEXT}$.`
            texte += mathalea2d(
              {
                xmin: -1,
                ymin: -1,
                xmax: 12,
                ymax: 5,
                pixelsParCm: 20,
                scale: 0.5,
                zoom: 1.75,
              },
              objets,
            ) // On trace le graphique de la solution

            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.alphanumeric,
                {
                  texteAvant: `<br><br>L'image du segment $[${nomPDSeg}${nomPASeg}]$ est :`,
                  texteApres: '.',
                },
              )
            }

            const nomVecDepl = representantNomme(
              VecDepl,
              PtDepartSeg,
              nomOR + nomEXT,
              1,
              'green',
            ) // Affiche le nom du vecteur déplacement
            const PositionPtCorr = tracePoint(
              A,
              B,
              C,
              D,
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
              'lightgray',
            )
            const LabelsPtCorr = labelPoint(
              A,
              B,
              C,
              D,
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
              'lightgray',
            )
            objetsCorr.push(
              PositionPtCorr,
              LabelsPtCorr,
              Grille,
              VecDeplRep,
              Seg,
              SegSOL,
            )

            // Affichage du vecteur natif
            // Cas pour les 4èmes et cas pour les 2ndes, affichage du vecteur ou pas
            if (this.classe === 2) objetsCorr.push(nomVecDepl)

            // Cas où les vecteurs se confondent partiellement
            if (!VecDeplRep.estSecant(representant(VecDepl, OrigVec))) {
              objetsCorr.push(labelPoint(OrigVec, ExtrVec, 'green'))
              objetsCorr.push(representant(VecDepl, OrigVec, 'green'))
            }

            objetsCorr.push(
              labelPoint(PtDepartSeg, PtArrivSeg, bleuMathalea),
              tracePoint(PtDepartSeg, PtArrivSeg, bleuMathalea),
            )
            const ptSOLPDSeg = translation(PtDepartSeg, VecDepl, nomSOLPDSeg)
            ptSOLPDSeg.positionLabel =
              ptSOLPDSeg.y === 0
                ? 'below'
                : ptSOLPDSeg.y === 4
                  ? 'above'
                  : placementPoints
            const ptSOLPASeg = translation(PtArrivSeg, VecDepl, nomSOLPASeg)
            ptSOLPASeg.positionLabel =
              ptSOLPASeg.y === 0
                ? 'below'
                : ptSOLPASeg.y === 4
                  ? 'above'
                  : placementPoints

            objetsCorr.push(tracePoint(ptSOLPDSeg, orangeMathalea))
            objetsCorr.push(tracePoint(ptSOLPASeg, orangeMathalea))
            objetsCorr.push(labelPoint(ptSOLPDSeg, orangeMathalea))
            objetsCorr.push(labelPoint(ptSOLPASeg, orangeMathalea))

            texteCorr =
              this.classe === 3
                ? `Le segment $${miseEnEvidence(`[${nomSOLPDSeg}${nomSOLPASeg}]`)}$ est l'image du segment $[${nomPDSeg}${nomPASeg}]$ par la translation de vecteur $\\overrightarrow{${nomOR}${nomEXT}}$.`
                : `Le segment $${miseEnEvidence(`[${nomSOLPDSeg}${nomSOLPASeg}]`)}$ est l'image du segment $[${nomPDSeg}${nomPASeg}]$ par la translation qui transforme $${nomOR}$ en $${nomEXT}$.`
            texteCorr += mathalea2d(
              {
                xmin: -1,
                ymin: -1,
                xmax: 12,
                ymax: 5,
                pixelsParCm: 20,
                scale: 0.5,
                zoom: 1.75,
              },
              objetsCorr,
            ) // On trace le graphique de la solution
            const tousNomsSegments = [
              `[${nomSOLPDSeg}${nomSOLPASeg}]`,
              `[${nomSOLPASeg}${nomSOLPDSeg}]`,
            ]
            handleAnswers(this, i, {
              reponse: {
                value: tousNomsSegments.map(String),
                options: { texteAvecCasse: true },
              },
            })
          }
          break

        case 'triangle':
        default:
          {
            // À partir d'un triangle
            const Pt1Triangle = choice([
              A,
              B,
              C,
              D,
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
            ])
            PtDepart = Pt1Triangle
            xPt2Triangle = Pt1Triangle.x + choice([-2, 0, 2])
            let yPt2Triangle = Pt1Triangle.y + choice([-2, 0, 2])
            let xPt3Triangle: number = -1 // j'initialise avec une valeur bidon, c'est assigné dans le while.
            let yPt3Triangle: number = -1
            while (
              xPt2Triangle < 0 ||
              xPt2Triangle > 10 ||
              yPt2Triangle < 0 ||
              yPt2Triangle > 4 ||
              (xPt2Triangle === Pt1Triangle.x && yPt2Triangle === Pt1Triangle.y)
            ) {
              xPt2Triangle = Pt1Triangle.x + choice([-2, 0, 2])
              yPt2Triangle = Pt1Triangle.y + choice([-2, 0, 2])
            }
            if (xPt2Triangle === Pt1Triangle.x) {
              xPt3Triangle = xPt2Triangle + choice([-2, 2])
              yPt3Triangle = yPt2Triangle
            }
            if (yPt2Triangle === Pt1Triangle.y) {
              yPt3Triangle = yPt2Triangle + choice([-2, 2])
              xPt3Triangle = xPt2Triangle
            }
            if (
              xPt2Triangle !== Pt1Triangle.x &&
              yPt2Triangle !== Pt1Triangle.y
            ) {
              xPt3Triangle = choice([Pt1Triangle.x, xPt2Triangle])
              if (xPt3Triangle === Pt1Triangle.x) {
                yPt3Triangle = yPt2Triangle
              } else {
                yPt3Triangle = Pt1Triangle.y
              }
            }
            do {
              if (xPt2Triangle === Pt1Triangle.x) {
                xPt3Triangle = xPt2Triangle + choice([-2, 2])
                yPt3Triangle = yPt2Triangle
              }
              if (yPt2Triangle === Pt1Triangle.y) {
                yPt3Triangle = yPt2Triangle + choice([-2, 2])
                xPt3Triangle = xPt2Triangle
              }
              if (
                xPt2Triangle !== Pt1Triangle.x &&
                yPt2Triangle !== Pt1Triangle.y
              ) {
                xPt3Triangle = choice([Pt1Triangle.x, xPt2Triangle])
                if (xPt3Triangle === Pt1Triangle.x) {
                  yPt3Triangle = yPt2Triangle
                } else {
                  yPt3Triangle = Pt1Triangle.y
                }
              }
            } while (
              xPt3Triangle < 0 ||
              xPt3Triangle > 10 ||
              yPt3Triangle < 0 ||
              yPt3Triangle > 4
            )
            const nomPD1Tri = Pt1Triangle.nom
            const nomPD2Tri =
              NomPt[
                CoorPt.findIndex(
                  (couple) =>
                    couple[0] === xPt2Triangle && couple[1] === yPt2Triangle,
                )
              ]
            const Pt2Triangle =
              Pt[
                CoorPt.findIndex(
                  (couple) =>
                    couple[0] === xPt2Triangle && couple[1] === yPt2Triangle,
                )
              ]
            const nomPD3Tri =
              NomPt[
                CoorPt.findIndex(
                  (couple) =>
                    couple[0] === xPt3Triangle && couple[1] === yPt3Triangle,
                )
              ]
            const Pt3Triangle =
              Pt[
                CoorPt.findIndex(
                  (couple) =>
                    couple[0] === xPt3Triangle && couple[1] === yPt3Triangle,
                )
              ]
            let OrigVec = choice(
              [A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R],
              [Pt1Triangle, Pt2Triangle, Pt3Triangle],
            )
            let ExtrVec = choice(
              [A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R],
              [Pt1Triangle, Pt2Triangle, Pt3Triangle, OrigVec],
            )
            let xSOLPA1Tri = Pt1Triangle.x + ExtrVec.x - OrigVec.x
            let ySOLPA1Tri = Pt1Triangle.y + ExtrVec.y - OrigVec.y
            let xSOLPA2Tri = xPt2Triangle + ExtrVec.x - OrigVec.x
            let ySOLPA2Tri = yPt2Triangle + ExtrVec.y - OrigVec.y
            let xSOLPA3Tri = xPt3Triangle + ExtrVec.x - OrigVec.x
            let ySOLPA3Tri = yPt3Triangle + ExtrVec.y - OrigVec.y
            while (
              xSOLPA1Tri < 0 ||
              xSOLPA2Tri < 0 ||
              xSOLPA3Tri < 0 ||
              ySOLPA1Tri < 0 ||
              ySOLPA2Tri < 0 ||
              ySOLPA3Tri < 0 ||
              xSOLPA1Tri > 10 ||
              xSOLPA2Tri > 10 ||
              xSOLPA3Tri > 10 ||
              ySOLPA1Tri > 4 ||
              ySOLPA2Tri > 4 ||
              ySOLPA3Tri > 4
            ) {
              OrigVec = choice(
                [A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R],
                [Pt1Triangle, Pt2Triangle, Pt3Triangle],
              )
              ExtrVec = choice(
                [A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R],
                [Pt1Triangle, Pt2Triangle, Pt3Triangle, OrigVec],
              )
              xSOLPA1Tri = Pt1Triangle.x + ExtrVec.x - OrigVec.x
              ySOLPA1Tri = Pt1Triangle.y + ExtrVec.y - OrigVec.y
              xSOLPA2Tri = xPt2Triangle + ExtrVec.x - OrigVec.x
              ySOLPA2Tri = yPt2Triangle + ExtrVec.y - OrigVec.y
              xSOLPA3Tri = xPt3Triangle + ExtrVec.x - OrigVec.x
              ySOLPA3Tri = yPt3Triangle + ExtrVec.y - OrigVec.y
            }

            // Nom des points pertinents
            const nomOR = OrigVec.nom
            const nomEXT = ExtrVec.nom
            const nomSOLPA1Tri =
              NomPt[
                CoorPt.findIndex(
                  (couple) =>
                    couple[0] === xSOLPA1Tri && couple[1] === ySOLPA1Tri,
                )
              ]
            const nomSOLPA2Tri =
              NomPt[
                CoorPt.findIndex(
                  (couple) =>
                    couple[0] === xSOLPA2Tri && couple[1] === ySOLPA2Tri,
                )
              ]
            const nomSOLPA3Tri =
              NomPt[
                CoorPt.findIndex(
                  (couple) =>
                    couple[0] === xSOLPA3Tri && couple[1] === ySOLPA3Tri,
                )
              ]

            // Segments origines
            const Seg1 = segment(
              Pt1Triangle.x,
              Pt1Triangle.y,
              xPt2Triangle,
              yPt2Triangle,
              bleuMathalea,
            )
            Seg1.epaisseur = 2 // Variable qui grossit le tracé du segment
            const Seg2 = segment(
              Pt1Triangle.x,
              Pt1Triangle.y,
              xPt3Triangle,
              yPt3Triangle,
              bleuMathalea,
            )
            Seg2.epaisseur = 2 // Variable qui grossit le tracé du segment
            const Seg3 = segment(
              xPt2Triangle,
              yPt2Triangle,
              xPt3Triangle,
              yPt3Triangle,
              bleuMathalea,
            )
            Seg3.epaisseur = 2 // Variable qui grossit le tracé du segment

            // Segment images
            const SegSOL1 = segment(
              xSOLPA1Tri,
              ySOLPA1Tri,
              xSOLPA2Tri,
              ySOLPA2Tri,
              orangeMathalea,
            )
            SegSOL1.epaisseur = 2 // Variable qui grossit le tracé du segment
            const SegSOL2 = segment(
              xSOLPA1Tri,
              ySOLPA1Tri,
              xSOLPA3Tri,
              ySOLPA3Tri,
              orangeMathalea,
            )
            SegSOL2.epaisseur = 2 // Variable qui grossit le tracé du segment
            const SegSOL3 = segment(
              xSOLPA2Tri,
              ySOLPA2Tri,
              xSOLPA3Tri,
              ySOLPA3Tri,
              orangeMathalea,
            )
            SegSOL3.epaisseur = 2 // Variable qui grossit le tracé du segment

            // Recherche du meilleur placement des points G à L pour éviter chevauchement
            const placementPoints =
              coefDirVecteurEgaleA1(Seg1, Seg2, Seg3) ||
              coefDirVecteurEgaleA1(SegSOL1, SegSOL2, SegSOL3)
                ? 'below right'
                : 'below left'
            // G.positionLabel = placementPoints
            H.positionLabel = placementPoints
            I.positionLabel = placementPoints
            J.positionLabel = placementPoints
            K.positionLabel = placementPoints
            // L.positionLabel = placementPoints
            LabelsPt = labelPoint(
              A,
              B,
              C,
              D,
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
            )

            objets.push(PositionPt, LabelsPt, Grille, Seg1, Seg2, Seg3)

            // Cas pour les 4èmes et cas pour les 2ndes, vecteur ou pas
            texte =
              this.classe === 2
                ? `Sans justifier, donner l'image du triangle $${nomPD1Tri}${nomPD2Tri}${nomPD3Tri}$ par la translation de vecteur $\\overrightarrow{${nomOR}${nomEXT}}$.`
                : `Sans justifier, donner l'image du triangle $${nomPD1Tri}${nomPD2Tri}${nomPD3Tri}$ par la translation qui transforme $${nomOR}$ en $${nomEXT}$.`
            texte += mathalea2d(
              {
                xmin: -1,
                ymin: -1,
                xmax: 12,
                ymax: 5,
                pixelsParCm: 20,
                scale: 0.5,
                zoom: 1.75,
              },
              objets,
            ) // On trace le graphique de la solution

            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.alphanumeric,
                {
                  texteAvant: `<br><br>L'image du triangle $${nomPD1Tri}${nomPD2Tri}${nomPD3Tri}$ est :`,
                  texteApres: '.',
                },
              )
            }

            // Vecteur natif
            const VecDepl = vecteur(
              ExtrVec.x - OrigVec.x,
              ExtrVec.y - OrigVec.y,
            ) // Crée le vecteur déplacement

            // Vecteur issu d'un sommet du triangle (qui ne soit pas confondu avec un côté des deux triangles)
            const sommetsTriangle = [Pt1Triangle, Pt2Triangle, Pt3Triangle]
            let VecDeplRep = representant(VecDepl, Pt1Triangle, 'green') // Trace le vecteur déplacement
            let ee = 0
            while (
              estEgalAUnAutreSegment(VecDeplRep, SegSOL1, SegSOL2, SegSOL3) ||
              estEgalAUnAutreSegment(VecDeplRep, Seg1, Seg2, Seg3)
            ) {
              ee++
              VecDeplRep = representant(VecDepl, sommetsTriangle[ee], 'green')
            }
            VecDeplRep.epaisseur = 2 // Variable qui grossit le tracé du vecteur
            VecDeplRep.styleExtremites = '->' // Donne l'extrémité du vecteur
            const nomVecDepl = representantNomme(
              VecDepl,
              sommetsTriangle[ee],
              nomOR + nomEXT,
              1,
              'green',
            ) // Affiche le nom du vecteur déplacement

            // Les points de la grille correction
            const PositionPtCorr = tracePoint(
              A,
              B,
              C,
              D,
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
              'lightgray',
            )
            const LabelsPtCorr = labelPoint(
              A,
              B,
              C,
              D,
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
              'lightgray',
            )

            // Creation du debut de l'objet Correction
            objetsCorr.push(
              PositionPtCorr,
              LabelsPtCorr,
              Grille,
              VecDeplRep,
              SegSOL1,
              SegSOL2,
              SegSOL3,
              Seg1,
              Seg2,
              Seg3,
            )

            // Affichage du vecteur natif
            // Cas pour les 4èmes et cas pour les 2ndes, affichage du vecteur ou pas
            if (this.classe === 2) objetsCorr.push(nomVecDepl)

            // Cas où les vecteurs se confondent partiellement
            if (!VecDeplRep.estSecant(representant(VecDepl, OrigVec))) {
              objetsCorr.push(labelPoint(OrigVec, ExtrVec, 'green'))
              objetsCorr.push(representant(VecDepl, OrigVec, 'green'))
            }

            objetsCorr.push(
              labelPoint(Pt1Triangle, Pt2Triangle, Pt3Triangle, bleuMathalea),
              tracePoint(Pt1Triangle, Pt2Triangle, Pt3Triangle, bleuMathalea),
            )

            // Affichage des sommets du triangle image
            const Pt1TriangleSOL = translation(
              Pt1Triangle,
              VecDepl,
              nomSOLPA1Tri,
            )
            Pt1TriangleSOL.positionLabel =
              Pt1TriangleSOL.y === 0
                ? 'below'
                : Pt1TriangleSOL.y === 4
                  ? 'above'
                  : placementPoints
            objetsCorr.push(tracePoint(Pt1TriangleSOL, orangeMathalea))
            objetsCorr.push(labelPoint(Pt1TriangleSOL, orangeMathalea))
            const Pt2TriangleSOL = translation(
              Pt2Triangle,
              VecDepl,
              nomSOLPA2Tri,
            )
            Pt2TriangleSOL.positionLabel =
              Pt2TriangleSOL.y === 0
                ? 'below'
                : Pt2TriangleSOL.y === 4
                  ? 'above'
                  : placementPoints
            objetsCorr.push(tracePoint(Pt2TriangleSOL, orangeMathalea))
            objetsCorr.push(labelPoint(Pt2TriangleSOL, orangeMathalea))
            const Pt3TriangleSOL = translation(
              Pt3Triangle,
              VecDepl,
              nomSOLPA3Tri,
            )
            Pt3TriangleSOL.positionLabel =
              Pt3TriangleSOL.y === 0
                ? 'below'
                : Pt3TriangleSOL.y === 4
                  ? 'above'
                  : placementPoints
            objetsCorr.push(tracePoint(Pt3TriangleSOL, orangeMathalea))
            objetsCorr.push(labelPoint(Pt3TriangleSOL, orangeMathalea))

            texteCorr =
              this.classe === 2
                ? `Le triangle $${miseEnEvidence(`${nomSOLPA1Tri}${nomSOLPA2Tri}${nomSOLPA3Tri}`)}$ est l'image du triangle $${nomPD1Tri}${nomPD2Tri}${nomPD3Tri}$ par la translation de vecteur $\\overrightarrow{${nomOR}${nomEXT}}$.`
                : `Le triangle $${miseEnEvidence(`${nomSOLPA1Tri}${nomSOLPA2Tri}${nomSOLPA3Tri}`)}$ est l'image du triangle $${nomPD1Tri}${nomPD2Tri}${nomPD3Tri}$ par la translation qui transforme $${nomOR}$ en $${nomEXT}$.`
            texteCorr += mathalea2d(
              {
                xmin: -1,
                ymin: -1,
                xmax: 12,
                ymax: 5,
                pixelsParCm: 20,
                scale: 0.5,
                zoom: 1.75,
              },
              objetsCorr,
            ) // On trace le graphique de la solution

            handleAnswers(this, i, {
              reponse: {
                value: allTrianglesNames(
                  nomSOLPA1Tri,
                  nomSOLPA2Tri,
                  nomSOLPA3Tri,
                ).map(String),
                options: { texteAvecCasse: true },
              },
            })
          }
          break
      }
      if (
        this.questionJamaisPosee(
          i,
          xSOL,
          xPtArrivSeg,
          xPt2Triangle,
          PtDepart.nom,
        )
      ) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
