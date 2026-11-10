import { arc } from '../../lib/2d/Arc'
import { codageSegments } from '../../lib/2d/CodageSegment'
import { grille } from '../../lib/2d/Grille'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { tracePoint } from '../../lib/2d/TracePoint'
import { vecteur } from '../../lib/2d/Vecteur'
import { vide2d } from '../../lib/2d/Vide2d'
import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { droite } from '../../lib/2d/droites'
import {
  barycentre,
  nommePolygone,
  Polygone,
  polygone,
} from '../../lib/2d/polygones'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { labelPoint } from '../../lib/2d/textes'
import { rotation } from '../../lib/2d/transformations'
import { angleOriente } from '../../lib/2d/utilitairesGeometriques'
import {
  milieu,
  pointIntersectionDD,
  pointSurSegment,
} from '../../lib/2d/utilitairesPoint'
import { aireTriangle } from '../../lib/2d/utilitairesTriangle'
import { bleuMathalea } from '../../lib/colors'
import { texteGras } from '../../lib/format/style'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { texteEnCouleur } from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { rotationAnimee, translationAnimee } from '../../modules/2dAnimation'
import type {
  RotationAnimee,
  TranslationAnimee,
} from '../../modules/2dAnimation'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'
export const interactifReady = true

export const titre =
  'Reconnaître des triangles égaux dans différentes configurations'

/**
 * Reconnaître des triangles égaux
 * @author Jean-claude Lhote et Sébastien Lozano (Rendu QCM et interactif par EE)
 */
export const uuid = '91513'

export const refs = {
  'fr-fr': ['3G23'],
  'fr-ch': ['11LCES1A-6', '11LSES1A-6'],
}
export default class TrianglesEgaux extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
  }

  nouvelleVersion() {
    let texte = ''
    let texteCorr = ''
    let trouve = false
    let aireABC
    let A
    let B
    let C
    let M
    let p: Polygone
    let q: Polygone
    let r
    let s
    let X
    let G
    let Gq
    let nom1
    let grid
    let probleme = false
    let figures: {
      enonce: string
      fig: string
      corr_animmee_sol1: string
      corr_animmee_sol2: string
    } = {
      enonce: '',
      fig: '',
      corr_animmee_sol1: '',
      corr_animmee_sol2: '',
    }
    // on génère le triangle ABC avec une contrainte sur son aire
    A = pointAbstrait(choice([0, 3]), choice([0, 3]), 'A') // le point A !
    B = pointAbstrait(choice([6, 9]), choice([6, 9]), 'B') // le point B !
    C = rotation(B, A, 90, 'C') // le point C à partir de B par rotation autour de A!
    p = polygone(A, B, C) // on trace le polygone ABC
    let compteur2 = 0
    let compteur = 0
    let dOne = droite(A, B)
    let dTwo = droite(C, B)
    let dThree = droite(A, C)
    let dFour = droite(B, C)
    do {
      probleme = false
      trouve = false
      compteur = 0
      while (!trouve && compteur < 100) {
        A = pointAbstrait(choice([0, 3]), choice([0, 3]), 'A') // le point A !
        B = pointAbstrait(choice([6, 9]), choice([6, 9]), 'B') // le point B !
        C = rotation(B, A, 90, 'C') // le point C à partir de B par rotation autour de A!
        C.x += choice([0, 3, 6]) // on décale l'abscise de C de 0, 3 ou 6 !
        C.y += choice([-3, 0, 3]) // on décale l'abscise de C de -3, 0 ou 3 !
        p = polygone(A, B, C) // on trace le polygone ABC
        aireABC = Number(aireTriangle(p)) // Je savais bien que cette formule servirait un jour !
        if (aireABC < 11 && aireABC > 5) {
          trouve = true
        }
        compteur++
      }
      if (compteur >= 100) {
        throw new Error(
          'Trop de tentatives pour générer un triangle ABC avec une aire entre 5 et 11',
        )
      }
      G = barycentre(p) // le barycentre de ABC
      const angleChoisi1 = choice([0, 90, 270])
      p = rotation(p, G, angleChoisi1) // on tourne ABC de façon aléatoire autour de son barycentre
      p.couleurDeRemplissage = colorToLatexOrHTML('gray') // remplissage de ABC
      p.opaciteDeRemplissage = 0.2 // 0.5;//remplissage de ABC
      nom1 = nommePolygone(p, 'ABC', 0.4) // on  nomme ABC en plaçant A,B et C à 0,4
      grid = grille(-3, -3, 27, 18, 'gray', 0.4, 1) // on trace une grille
      M = pointAbstrait(9, 12) // un point M fixe pour tourner autour
      q = rotation(p, M, 90) // on fait tourner ABC autour de M de 90°

      // on a besoin de récupérer le polygone non tracé
      Gq = barycentre(q) // on construit son barycentre

      // let angleChoisi2 = 270;
      const angleChoisi2 = choice<0 | 90 | 180 | 270>([0, 90, 180, 270])
      r = rotation(q, Gq, angleChoisi2) // on fait tourner q encore autour de son barycentre
      X = milieu(r.listePoints[0], r.listePoints[1]) // on place le milieu des deux premiers points de la figure obtenue qui sont les images des points A et B initiaux
      s = rotation(r, X, 180) // on fait topurner r autour du milieu des deux extremites du plus grand côté
      r.couleurDeRemplissage = colorToLatexOrHTML('red') // solution 1 en rouge
      r.opaciteDeRemplissage = 0.2 // 0.5; //
      s.couleurDeRemplissage = colorToLatexOrHTML(bleuMathalea) // solution 2 en bleu
      s.opaciteDeRemplissage = 0.2 // 0.5; //

      // mes ajouts par rapport à la figure de JC
      // on fixe une place pour D et E
      const D = r.listePoints[0]
      D.nom = 'D'
      const E = r.listePoints[1]
      E.nom = 'E'
      // on crée un tableau avec les noms proposé pour les points
      let tabPointsNames = ['F', 'G', 'H', 'I']
      // on mélange le tableau
      tabPointsNames = shuffle(tabPointsNames)
      // on place les deux solutions
      const I = r.listePoints[2]
      // I.nom='I';
      I.nom = tabPointsNames[0]
      const I1 = rotation(I, X, 180)
      // I1.nom='I1';
      I1.nom = tabPointsNames[1]
      // on place les mauvaises solutions
      const F = pointAbstrait(I1.x + 1, I1.y + 1)
      // F.nom='F';
      F.nom = tabPointsNames[2]
      const L = pointAbstrait(I.x - 1, I.y - 3)
      // L.nom='L';
      L.nom = tabPointsNames[3]
      // on trace le segment [DE] en pointillés pour que la figure soit plus lisible
      const sgmt_DE = segment(D, E, bleuMathalea)
      sgmt_DE.pointilles = 5
      sgmt_DE.epaisseur = 1.5

      // on prépare la fenetre mathalea2d
      const fenetreMathalea2D = {
        xmin: -3,
        ymin: -3,
        xmax: 27,
        ymax: 18,
        pixelsParCm: 20,
        scale: 0.5,
      }

      // on prépare les corrections

      dOne = droite(p.listePoints[1], E)
      dTwo = droite(D, p.listePoints[0])
      dThree = droite(E, p.listePoints[0])
      dFour = droite(p.listePoints[1], D)

      if (
        arrondi(dOne.pente, 8) === arrondi(dTwo.pente, 8) ||
        arrondi(dThree.pente, 8) === arrondi(dFour.pente, 8)
      ) {
        probleme = true
        continue // pas la peine de construire, il y a un centre de rotation qui n'éxiste pas
      } else {
        probleme = false
      }
      const centre_rot = {
        sol1: pointIntersectionDD(dOne, dTwo),
        sol2: pointIntersectionDD(dThree, dFour),
      }
      const vect_trans = {
        sol1: vecteur(p.listePoints[1], E),
        sol2: vecteur(p.listePoints[1], D),
      }
      const transformationAnimee: {
        sol1: RotationAnimee | TranslationAnimee | null
        sol2: RotationAnimee | TranslationAnimee | null
      } = {
        sol1: null,
        sol2: null,
      }
      // pour construire les droites et les centres passant par les centres de rotations
      let d, d1, d2, d3, d4, d5, J1, J2
      switch (angleChoisi2) {
        case 0:
          transformationAnimee.sol1 = rotationAnimee(
            p,
            M,
            90,
            'begin="0s" dur="4s" repeatCount="indefinite"',
          )
          // transformationAnimee.nature_sol1=`rotation`;
          // la 1ere compo
          d = droite(M, Gq)
          d1 = rotation(d, M, -45)
          d2 = rotation(d, Gq, 0)
          J1 = pointIntersectionDD(d1, d2) // centre de la composée, ici l'angle vaut 90

          // 2eme compo
          d3 = droite(J1, X)
          d4 = rotation(d3, J1, -45)
          d5 = rotation(d3, X, 90)
          J2 = pointIntersectionDD(d4, d5) // centre après la seconde composition angle 270 à 2pi près
          transformationAnimee.sol2 = rotationAnimee(
            p,
            J2,
            -90,
            'begin="0s" dur="4s" repeatCount="indefinite"',
          )
          // transformationAnimee.nature_sol2=`rotation`;
          break
        case 90:
          transformationAnimee.sol1 = rotationAnimee(
            p,
            centre_rot.sol1,
            180,
            'begin="0s" dur="4s" repeatCount="indefinite"',
          )
          // transformationAnimee.nature_sol1=`rotation`;
          transformationAnimee.sol2 = translationAnimee(
            [p],
            vect_trans.sol2,
            'begin="0s" dur="4s" repeatCount="indefinite"',
          )
          // transformationAnimee.nature_sol2=`translation`;
          break
        case 180:
          // la 1ere compo
          d = droite(M, Gq)
          d1 = rotation(d, M, -45)
          d2 = rotation(d, Gq, 90)
          J1 = pointIntersectionDD(d1, d2) // centre de la composée, ici l'angle vaut 270 à 2pi près

          // 2eme compo
          d3 = droite(J1, X)
          d4 = rotation(d3, J1, -135)
          d5 = rotation(d3, X, 90)
          J2 = pointIntersectionDD(d4, d5) // centre après la seconde composition angle 450 à 2pi près
          transformationAnimee.sol1 = rotationAnimee(
            p,
            J1,
            -90,
            'begin="0s" dur="4s" repeatCount="indefinite"',
          )
          // transformationAnimee.nature_sol1=`rotation`;
          transformationAnimee.sol2 = rotationAnimee(
            p,
            J2,
            90,
            'begin="0s" dur="4s" repeatCount="indefinite"',
          )
          // transformationAnimee.nature_sol2=`rotation`;
          break
        case 270:
          transformationAnimee.sol1 = translationAnimee(
            [p],
            vect_trans.sol1,
            'begin="0s" dur="4s" repeatCount="indefinite"',
          )
          // transformationAnimee.nature_sol1=`translation`;
          transformationAnimee.sol2 = rotationAnimee(
            p,
            centre_rot.sol2,
            180,
            'begin="0s" dur="4s" repeatCount="indefinite"',
          )
          // transformationAnimee.nature_sol2=`rotation`;
          break
      }
      // DE = AB
      const seg_DE_corr = segment(D, E, bleuMathalea)
      seg_DE_corr.epaisseur = 2
      const seg_AB_corr = segment(
        p.listePoints[0],
        p.listePoints[1],
        bleuMathalea,
      )
      seg_AB_corr.epaisseur = 2
      // DI = AC ou EI1 = AC
      const seg_DI_corr = segment(D, I, 'red')
      const seg_EI1_corr = segment(E, I1, 'red')
      seg_DI_corr.epaisseur = 2
      seg_EI1_corr.epaisseur = 2
      const seg_AC_corr = segment(p.listePoints[0], p.listePoints[2], 'red')
      seg_AC_corr.epaisseur = 2
      // EI = BC ou DI1 = BC
      const seg_EI_corr = segment(E, I, 'green')
      const seg_DI1_corr = segment(D, I1, 'green')
      seg_EI_corr.epaisseur = 2
      seg_DI1_corr.epaisseur = 2
      const seg_BC_corr = segment(p.listePoints[1], p.listePoints[2], 'green')
      seg_BC_corr.epaisseur = 2
      // angle ABC = DEI ou ABC = EDI1
      const ang_ABC = angleOriente(
        p.listePoints[0],
        p.listePoints[1],
        p.listePoints[2],
      )
      const ang_DEI = angleOriente(D, E, I)
      const ang_EDI1 = angleOriente(E, D, I1)
      // angle BCA = EID ou  BCA = DI1E
      const ang_BCA = angleOriente(
        p.listePoints[1],
        p.listePoints[2],
        p.listePoints[0],
      )
      const ang_EID = angleOriente(E, I, D)
      const ang_EI1D = angleOriente(E, I1, D)
      // angle CAB = IDE ou CAB = I1ED
      const ang_CAB = angleOriente(
        p.listePoints[2],
        p.listePoints[0],
        p.listePoints[1],
      )
      const ang_IDE = angleOriente(I, D, E)
      const ang_I1ED = angleOriente(I1, E, D)

      const codages_correction = {
        sol1: [
          // les segments
          seg_AB_corr,
          seg_DE_corr,
          codageSegments(
            '×',
            bleuMathalea,
            p.listePoints[0],
            p.listePoints[1],
            D,
            E,
          ),
          seg_AC_corr,
          seg_DI_corr,
          codageSegments('||', 'red', p.listePoints[0], p.listePoints[2], D, I),
          seg_BC_corr,
          seg_EI_corr,
          codageSegments(
            'O',
            'green',
            p.listePoints[1],
            p.listePoints[2],
            I,
            E,
          ),
          // les angles
          arc(
            pointSurSegment(p.listePoints[1], p.listePoints[0], 0.8),
            p.listePoints[1],
            ang_ABC,
            true,
            'red',
          ),
          arc(pointSurSegment(E, D, 0.8), E, ang_DEI, true, 'red'),
          arc(
            pointSurSegment(p.listePoints[2], p.listePoints[1], 0.8),
            p.listePoints[2],
            ang_BCA,
            true,
            bleuMathalea,
          ),
          arc(pointSurSegment(I, E, 0.8), I, ang_EID, true, bleuMathalea),
          arc(
            pointSurSegment(p.listePoints[0], p.listePoints[2], 0.8),
            p.listePoints[0],
            ang_CAB,
            true,
            'green',
          ),
          arc(pointSurSegment(D, I, 0.8), D, ang_IDE, true, 'green'),
        ],
        sol2: [
          // les segments
          seg_AB_corr,
          seg_DE_corr,
          codageSegments(
            '×',
            bleuMathalea,
            p.listePoints[0],
            p.listePoints[1],
            D,
            E,
          ),
          seg_BC_corr,
          seg_DI1_corr,
          codageSegments(
            'O',
            'green',
            p.listePoints[1],
            p.listePoints[2],
            D,
            I1,
          ),
          seg_AC_corr,
          seg_EI1_corr,
          codageSegments(
            '||',
            'red',
            p.listePoints[0],
            p.listePoints[2],
            E,
            I1,
          ),
          // les angles
          arc(
            pointSurSegment(p.listePoints[1], p.listePoints[0], 0.8),
            p.listePoints[1],
            ang_ABC,
            true,
            'red',
          ),
          arc(pointSurSegment(D, E, 0.8), D, ang_EDI1, true, 'red'),
          arc(
            pointSurSegment(p.listePoints[2], p.listePoints[1], 0.8),
            p.listePoints[2],
            ang_BCA,
            true,
            bleuMathalea,
          ),
          arc(pointSurSegment(I1, E, 0.8), I1, ang_EI1D, true, bleuMathalea),
          arc(
            pointSurSegment(p.listePoints[0], p.listePoints[2], 0.8),
            p.listePoints[0],
            ang_CAB,
            true,
            'green',
          ),
          arc(pointSurSegment(E, I1, 0.8), E, ang_I1ED, true, 'green'),
        ],
      }

      // on crée un objet pour stocker les figures et les corrections
      figures = {
        enonce: `
                        Où placer le point $M$ pour que les triangles $ABC$ et $DEM$ soient égaux ?<br>`,
        fig: `
                    ${mathalea2d(
                      fenetreMathalea2D,
                      p,
                      nom1,
                      grid,
                      tracePoint(D, E, I, I1, F, L),
                      labelPoint(D, E, I, I1, F, L),
                      sgmt_DE,
                    )}`,
        corr_animmee_sol1: `
                        Les triangles $ABC$ et $DE${I.nom}$ ont les mêmes longueurs et les mêmes angles.<br>
                         ${texteEnCouleur(`Donc le point $${I.nom}$ est un point qui convient.`)}<br>
                        ${mathalea2d(
                          fenetreMathalea2D,
                          p,
                          nom1,
                          grid,
                          // tracePoint(D,E,I,I1,F,L),
                          tracePoint(I1, F, L),
                          // labelPoint(D,E,I,I1,F,L),
                          labelPoint(I1, F, L),
                          nommePolygone(r, 'DE' + I.nom, 0.4),
                          // sgmt_DE,
                          r,
                          !context.isHtml
                            ? vide2d()
                            : transformationAnimee.sol1,
                          codages_correction.sol1,
                        )}`,
        corr_animmee_sol2: `
                        Les triangles $ABC$ et $DE${I1.nom}$ ont les mêmes longueurs et les mêmes angles.<br>
                         ${texteEnCouleur(`Donc le point $${I1.nom}$ est un point qui convient.`)}<br>
                        ${mathalea2d(
                          fenetreMathalea2D,
                          p,
                          nom1,
                          grid,
                          tracePoint(I, F, L),
                          labelPoint(I, F, L),
                          nommePolygone(s, 'DE' + I1.nom, 0.4),
                          s,
                          !context.isHtml
                            ? vide2d()
                            : transformationAnimee.sol2,
                          codages_correction.sol2,
                        )}`,
      }
      texte = `${figures.enonce}`

      this.autoCorrection[0] = {}
      this.autoCorrection[0].options = { ordered: true }
      this.autoCorrection[0].propositions = [
        {
          texte: 'en $F$',
          statut: I.nom === 'F' || I1.nom === 'F',
        },
        {
          texte: 'en $G$',
          statut: I.nom === 'G' || I1.nom === 'G',
        },
        {
          texte: 'en $H$',
          statut: I.nom === 'H' || I1.nom === 'H',
        },
        {
          texte: 'en $I$',
          statut: I.nom === 'I' || I1.nom === 'I',
        },
      ]
      compteur2++
    } while (probleme && compteur2 < 20)
    if (compteur2 >= 20) {
      throw new Error(
        'Trop de tentatives pour avoir des droites définissant les centres de rotation valides',
      )
    }
    texte += propositionsQcm(this, 0).texte
    texte += `${figures.fig}`
    texteCorr += `${texteGras('Première solution')}<br>${figures.corr_animmee_sol1}<br><br>`
    texteCorr += `${texteGras('Seconde solution')}<br>${figures.corr_animmee_sol2}`

    this.listeQuestions[0] = texte
    this.listeCorrections[0] = texteCorr
    listeQuestionsToContenu(this)
  }
}
