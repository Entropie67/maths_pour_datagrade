import { afficheCoteSegment } from '../../lib/2d/AfficheCoteSegment'
import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import {
  droite,
  droiteParPointEtParallele,
  droiteParPointEtPerpendiculaire,
} from '../../lib/2d/droites'
import { grille, seyes } from '../../lib/2d/Grille'
import { PointAbstrait, pointAbstrait } from '../../lib/2d/PointAbstrait'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { labelPoint } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { rotation } from '../../lib/2d/transformations'
import { longueur } from '../../lib/2d/utilitairesGeometriques'
import {
  pointIntersectionDD,
  pointSurDroite,
} from '../../lib/2d/utilitairesPoint'
import { vide2d } from '../../lib/2d/Vide2d'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { bleuMathalea } from '../../lib/colors'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { texteEnCouleur } from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { numAlpha } from '../../lib/outils/outilString'
import { stringNombre, texNombre } from '../../lib/outils/texNombre'
import Alea2iep from '../../modules/Alea2iep'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const dateDeModifImportante = '17/02/2025'
export const amcReady = true
export const amcType = 'AMCOpen'
export const titre = 'Tracer des parallèles et des perpendiculaires'

/**
 * Fonction générale pour exercices de constructions de parallèles et perpendiculaires
 * Animation de la correction ajoutée le 16/04/2021
 * @author Jean-claude Lhote  (AMC par Éric Elter en septembre 2021, ES6 par Loïc Geeraerts)
 */

export const uuid = 'd14bc'

export const refs = {
  'fr-fr': ['CM2G2B-2'],
  'fr-2016': ['6G12-1'],
  'fr-ch': ['9R1ES1B-5', '9R2ES1B-5', '9R3ES1B-5', 'PRQES01A-2', 'PRQES04A-2'],
}
export default class ParalleleEtPerpendiculaires extends Exercice {
  type: number
  constructor() {
    super()
    // Déclaré explicitement pour le contrôle des corrections minimales : tracé de parallèles et de perpendiculaires : construction, pas de réponse courte.
    this.reponseCourteDisponible = false
    this.nbQuestions = 1

    this.sup = 1
    this.type = 3
    this.besoinFormulaire2CaseACocher = ['Avec auto-correction']
    this.sup2 = true

    this.besoinFormulaireNumerique = [
      'Type de cahier',
      3,
      ' 1 : Cahier à petits carreaux\n 2 : Cahier à gros carreaux (Seyes)\n 3 : Feuille blanche',
    ]
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = [this.type] // Le choix 1 ou 2 ou 3 : 1=perpendiculaires, 2=parallèles, 3=des perpendiculaires et des paralèlles
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    let Xmin = 0
    let Xmax = 0
    let Ymin = 0
    let Ymax = 0
    const ppc = 20
    let sc
    let anim

    const hasAutoCorrection = this.sup2

    let A: PointAbstrait
    let B: PointAbstrait
    let C: PointAbstrait
    let D: PointAbstrait
    let xE
    let E
    let F
    let BB: PointAbstrait
    let CC: PointAbstrait
    let DD: PointAbstrait
    let EE: PointAbstrait
    let FF: PointAbstrait
    let d
    let s1
    let s2
    let enonce
    let correction
    let dB
    let dC
    let dD
    let dE
    let g
    let lC
    let lD
    let lE
    let cB
    let cC
    let cD
    let cE
    let cF
    let cG
    let carreaux
    let k
    const objetsEnonce = []
    const objetsCorrection = []

    let p
    let longueurAEE = 0
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      anim = new Alea2iep()
      anim.equerreZoom(150)
      objetsEnonce.length = 0
      objetsCorrection.length = 0
      correction = ''
      if (this.sup === 2) {
        k = 0.8
      } else {
        k = 0.5
      }
      // if (this.sup === 3) { this.sup2 = false } // Pour obliger à enlever l'auto-correction sur papier blanc, car elle est alors impossible. Pb néanmoins avec la case à cocher qui ni bouge pas (Pb soulevé dans le Slack)
      do {
        switch (listeTypeDeQuestions[i]) {
          case 1:
            A = pointAbstrait(0, 0, 'A', 'above left')
            B = pointAbstrait(
              10,
              randint(-4, 4, [-1, 0, 1]),
              'B',
              'above right',
            )
            d = droite(A, B)
            C = pointAbstrait(randint(2, 3), randint(3, 4), 'C', 'above left')
            D = pointAbstrait(randint(7, 8), randint(-7, -6), 'D')
            dB = droiteParPointEtPerpendiculaire(B, d)
            xE = 11
            E = pointSurDroite(dB, 11, 'E', 'left')
            while (!Number.isInteger(E.y)) {
              xE++
              E = pointSurDroite(dB, xE, 'E', 'left')
            }
            F = pointAbstrait(E.x, B.y)
            s1 = segment(B, F, 'red')
            s1.epaisseur = 2
            s1.pointilles = 5
            s2 = segment(F, E, bleuMathalea)
            s2.epaisseur = 2
            s2.pointilles = 5
            dC = droiteParPointEtPerpendiculaire(C, d)
            dD = droiteParPointEtPerpendiculaire(D, d)
            BB = rotation(A, B, 90)
            CC = pointIntersectionDD(dC, d, 'M', 'below right')
            DD = pointIntersectionDD(dD, d, 'N', 'above left')
            if (longueur(CC, A) < 1 || longueur(DD, A) < 1) continue
            lC = arrondi(longueur(CC, A) * k, 1)
            lD = arrondi(longueur(DD, A) * k, 1)
            cB = codageAngleDroit(A, B, BB)
            cC = codageAngleDroit(C, CC, B)
            cD = codageAngleDroit(D, DD, B)
            if (hasAutoCorrection) {
              objetsCorrection.push(
                s1,
                s2,
                dC,
                dD,
                dB,
                cB,
                cC,
                cD,
                d,
                tracePoint(A, B, C, D, E, CC, DD),
                labelPoint(A, B, C, D, E, CC, DD),
                afficheCoteSegment(
                  segment(A, CC),
                  `${stringNombre(lC)} cm`,
                  0.5,
                  'red',
                  1,
                  0.5,
                  'red',
                ),
                afficheCoteSegment(
                  segment(A, DD),
                  `${stringNombre(lD)} cm`,
                  -0.5,
                  'red',
                  1,
                  -0.5,
                  'red',
                ),
              )
            } else {
              objetsCorrection.push(
                dC,
                dD,
                dB,
                cB,
                cC,
                cD,
                d,
                tracePoint(A, B, C, D, CC, DD),
                labelPoint(A, B, C, D, CC, DD),
              )
            }
            objetsEnonce.push(tracePoint(A, B, C, D), labelPoint(A, B, C, D), d)
            if (context.isHtml)
              enonce = numAlpha(0) + ' Reproduire la figure ci-dessous.<br>'
            else
              enonce =
                numAlpha(0) +
                ' Utiliser un crayon à papier afin de pouvoir gommer si besoin.<br>'
            enonce +=
              numAlpha(1) +
              ' Tracer la droite perpendiculaire à $(AB)$ passant par $B$.<br>'
            enonce +=
              numAlpha(2) +
              " Tracer la droite perpendiculaire à $(AB)$ passant par $C$ et nommer $M$ le point d'intersection de cette droite avec la droite $(AB)$.<br>"
            enonce +=
              numAlpha(3) +
              " Tracer la droite perpendiculaire à $(AB)$ passant par $D$ et nommer $N$ le point d'intersection de cette droite avec la droite $(AB)$.<br>"
            if (hasAutoCorrection) {
              enonce +=
                numAlpha(4) +
                " Mesurer ensuite les distances $AM$ et $AN$. Pour l'auto-correction comparer ces mesures avec celles données dans la correction<br>"

              correction = `En auto-correction, on peut vérifier que : $AM \\approx ${texNombre(
                lC,
              )}\\text{ cm}$ et $AN \\approx ${texNombre(lD)}\\text{ cm}$.<br>`
              correction +=
                this.sup < 3
                  ? 'Pour la perpendiculaire en $B$, contrôle la position du point $E$.<br>'
                  : '<br>'
            }
            Xmin = Math.floor(Math.min(A.x, B.x, C.x, D.x, E.x, CC.x, DD.x) - 1)
            Xmax = Math.ceil(Math.max(A.x, B.x, C.x, D.x, E.x, CC.x, DD.x) + 1)
            Ymin = Math.floor(Math.min(A.y, B.y, C.y, D.y, E.y, CC.y, DD.y) - 1)
            Ymax = Math.ceil(Math.max(A.y, B.y, C.y, D.y, E.y, CC.y, DD.y) + 1)
            anim.recadre(Xmin - 3, Ymax)
            anim.pointsCreer(A, B, C, D)
            anim.regleDroite(A, B)
            anim.perpendiculaireRegleEquerre2points3epoint(A, B, B)
            anim.perpendiculaireRegleEquerre2points3epoint(A, B, C)
            anim.perpendiculaireRegleEquerre2points3epoint(A, B, D)
            break
          case 2:
            A = pointAbstrait(2, 0, 'A', 'below left')
            B = pointAbstrait(12, randint(-4, 4, 0), 'B')
            d = droite(A, B)
            C = pointAbstrait(0, randint(3, 4), 'C', 'above')
            D = pointAbstrait(
              randint(7, 8),
              randint(-7, -6),
              'D',
              'below right',
            )
            E = pointAbstrait(randint(4, 5), randint(5, 6), 'E', 'below right')
            F = pointAbstrait(2, -3, 'F', 'left')

            dE = droiteParPointEtParallele(E, d)
            dC = droiteParPointEtParallele(C, d)
            dD = droiteParPointEtParallele(D, d)
            p = droite(A, F)
            CC = pointIntersectionDD(dC, p, 'M', 'above left')
            DD = pointIntersectionDD(dD, p, 'N', 'above left')
            EE = pointIntersectionDD(dE, p, 'O', 'above left')
            if (
              longueur(CC, A) < 1 ||
              longueur(DD, A) < 1 ||
              longueur(EE, A) < 1
            )
              continue
            lC = arrondi(longueur(CC, A) * k, 1)
            lD = arrondi(longueur(DD, A) * k, 1)
            lE = arrondi(longueur(EE, A) * k, 1)
            if (hasAutoCorrection) {
              objetsCorrection.push(
                dC,
                dD,
                dE,
                d,
                p,
                tracePoint(A, B, C, D, E, F),
                labelPoint(A, B, C, D, E, F, CC, DD, EE),
                afficheCoteSegment(
                  segment(A, CC),
                  `${stringNombre(lC)} cm`,
                  0.2,
                  'red',
                  1,
                  0.5,
                  'red',
                ),
                afficheCoteSegment(
                  segment(DD, A),
                  `${stringNombre(lD)} cm`,
                  -0.2,
                  'green',
                  1,
                  -0.5,
                  'green',
                ),
                afficheCoteSegment(
                  segment(A, EE),
                  `${stringNombre(lE)} cm`,
                  -0.2,
                  bleuMathalea,
                  1,
                  -0.5,
                  bleuMathalea,
                ),
              )
            } else {
              objetsCorrection.push(
                dC,
                dD,
                dE,
                d,
                p,
                tracePoint(A, B, C, D, F),
                labelPoint(A, B, C, D, E, F, CC, DD, EE),
              )
            }
            objetsEnonce.push(
              tracePoint(A, B, C, D, E, F),
              labelPoint(A, B, C, D, E, F),
              d,
              p,
            )

            if (context.isHtml)
              enonce = numAlpha(0) + ' Reproduire la figure ci-dessous.<br>'
            else
              enonce =
                numAlpha(0) +
                ' Utiliser un crayon à papier afin de pouvoir gommer si besoin.<br>'
            enonce +=
              numAlpha(1) +
              " Tracer la droite parallèle à $(AB)$ passant par $C$ et nommer $M$, le point d'intersection de cette droite avec la droite $(AF)$.<br>"
            enonce +=
              numAlpha(2) +
              " Tracer la droite parallèle à $(AB)$ passant par $D$ et nommer $N$, le point d'intersection de cette droite avec la droite $(AF)$.<br>"
            enonce +=
              numAlpha(3) +
              " Tracer la droite parallèle à $(AB)$ passant par $E$ et nommer $O$, le point d'intersection de cette droite avec la droite $(AF)$.<br>"
            if (hasAutoCorrection) {
              enonce +=
                numAlpha(4) +
                " Mesurer les distances $AM$, $AN$ et $AO$. Pour l'auto-correction, comparer ces mesures avec celles données par l'ordinateur dans la correction."

              correction = `En auto-correction, on peut vérifier que : $AM \\approx ${texNombre(
                lC,
              )}\\text{ cm}$, $AN \\approx ${texNombre(
                lD,
              )}\\text{ cm}$ et $AO \\approx${texNombre(lE)}\\text{ cm}$.<br>`
            }
            Xmin = Math.floor(
              Math.min(A.x, B.x, C.x, D.x, E.x, F.x, EE.x, CC.x, DD.x) - 1,
            )
            Xmax = Math.ceil(
              Math.max(A.x, B.x, C.x, D.x, E.x, F.x, EE.x, CC.x, DD.x) + 1,
            )
            Ymin = Math.floor(
              Math.min(A.y, B.y, C.y, D.y, E.y, F.y, EE.y, CC.y, DD.y) - 1,
            )
            Ymax = Math.ceil(
              Math.max(A.y, B.y, C.y, D.y, E.y, F.y, EE.y, CC.y, DD.y) + 1,
            )
            anim.recadre(Xmin - 3, Ymax)
            anim.pointsCreer(A, B, C, D, E)
            anim.regleDroite(A, B)
            anim.paralleleRegleEquerre2points3epoint(A, B, C)
            anim.paralleleRegleEquerre2points3epoint(A, B, D)
            anim.paralleleRegleEquerre2points3epoint(A, B, E)

            break
          case 3:
          default:
            A = pointAbstrait(0, 0, 'A', 'above left')
            B = pointAbstrait(
              10,
              randint(-4, 4, [-1, 0, 1]),
              'B',
              'above right',
            )
            d = droite(A, B)
            C = pointAbstrait(randint(2, 3), randint(3, 4), 'C', 'above left')
            D = pointAbstrait(randint(7, 8), randint(-7, -6), 'D')
            dB = droiteParPointEtPerpendiculaire(B, d)
            xE = 11
            E = pointSurDroite(dB, 11, 'E', 'left')
            while (!Number.isInteger(E.y)) {
              xE++
              E = pointSurDroite(dB, xE, 'E', 'left')
            }
            F = pointAbstrait(E.x, B.y)
            dE = droiteParPointEtParallele(E, d)
            dD = droiteParPointEtParallele(D, d)
            dC = droiteParPointEtPerpendiculaire(C, d)
            BB = rotation(A, B, 90)
            CC = pointIntersectionDD(dC, d, 'M', 'below right')
            DD = pointIntersectionDD(dD, dB, 'N', 'above left')
            EE = pointIntersectionDD(dC, dE, 'O', 'above left')
            if (
              longueur(CC, A) < 1 ||
              longueur(DD, A) < 1 ||
              longueur(EE, A) < 1
            )
              continue
            longueurAEE = longueur(EE, A)
            FF = pointIntersectionDD(dD, dC)

            lC = arrondi(longueur(CC, A) * k, 1)
            lD = arrondi(longueur(DD, A) * k, 1)
            lE = arrondi(longueur(EE, A) * k, 1)
            cB = codageAngleDroit(A, B, BB)
            cC = codageAngleDroit(C, CC, B)
            cD = codageAngleDroit(D, DD, B, 'red')
            cE = codageAngleDroit(B, E, EE, 'red')
            cF = codageAngleDroit(C, EE, E, 'red')
            cG =
              FF.x === D.x && FF.y === D.y
                ? codageAngleDroit(C, FF, DD, 'red')
                : codageAngleDroit(C, FF, D, 'red')
            if (hasAutoCorrection) {
              objetsCorrection.push(
                dC,
                dD,
                dB,
                dE,
                cB,
                cC,
                cD,
                cE,
                cF,
                cG,
                d,
                tracePoint(A, B, C, D, E, CC, DD, EE),
                labelPoint(A, B, C, D, E, CC, DD, EE),
                afficheCoteSegment(
                  segment(A, CC),
                  `${stringNombre(lC)} cm`,
                  0.5,
                  'red',
                  1,
                  0.5,
                  'red',
                ),
                afficheCoteSegment(
                  segment(A, DD),
                  `${stringNombre(lD)} cm`,
                  0,
                  bleuMathalea,
                  1,
                  -0.5,
                  bleuMathalea,
                ),
                afficheCoteSegment(
                  segment(A, EE),
                  `${stringNombre(lE)} cm`,
                  0,
                  'green',
                  1,
                  -0.5,
                  'green',
                ),
              )
            } else {
              objetsCorrection.push(
                dC,
                dD,
                dB,
                dE,
                cB,
                cC,
                cD,
                cE,
                cF,
                cG,
                d,
                tracePoint(A, B, C, D, E, CC, DD, EE),
                labelPoint(A, B, C, D, E, CC, DD, EE),
              )
            }
            objetsEnonce.push(
              tracePoint(A, B, C, D, E),
              labelPoint(A, B, C, D, E),
              d,
            )
            if (context.isHtml)
              enonce = numAlpha(0) + ' Reproduire la figure ci-dessous.<br>'
            else
              enonce =
                numAlpha(0) +
                ' Utiliser un crayon à papier afin de pouvoir gommer si besoin.<br>'
            enonce +=
              numAlpha(1) +
              ' Tracer la droite perpendiculaire à $(AB)$ passant par $B$.<br>'
            enonce +=
              numAlpha(2) +
              " Tracer la droite perpendiculaire à $(AB)$ passant par $C$ et nomme $M$, le point d'intersection de cette droite avec la droite $(AB)$.<br>"
            enonce +=
              numAlpha(3) +
              " Tracer la droite parallèle à $(AB)$ passant par $D$ et nomme $N$, le point d'intersection de cette droite avec la droite $(BE)$.<br>"
            enonce +=
              numAlpha(4) +
              " Tracer la droite parallèle à $(AB)$ passant par $E$ et nomme $O$, le point d'intersection de cette droite avec la droite $(CM)$.<br>"
            if (hasAutoCorrection) {
              enonce +=
                numAlpha(5) +
                " Mesurer les distances $AM$, $AN$ et $AO$. Pour l'auto-correction, comparer ces mesures avec celles données par l'ordinateur dans la correction."

              correction += `En auto-correction, on peut vérifier que : $AM \\approx ${texNombre(
                lC,
              )}\\text{ cm}$, $AN \\approx ${texNombre(
                lD,
              )}\\text{ cm}$ et $AO \\approx${texNombre(lE)}\\text{ cm}$.<br><br>`
            }
            correction += `Les angles droits en rouge se justifient par la propriété :<br> ${texteEnCouleur("Si deux droites sont parallèles, alors toute droite perpendiculaire à l'une est aussi perpendiculaire à l'autre", 'red')}.<br>`
            correction += "Vérifier les angles droits à l'équerre.<br><br>"
            Xmin = Math.floor(
              Math.min(A.x, B.x, C.x, D.x, E.x, F.x, EE.x, CC.x, DD.x) - 1,
            )
            Xmax = Math.ceil(
              Math.max(A.x, B.x, C.x, D.x, E.x, F.x, EE.x, CC.x, DD.x) + 1,
            )
            Ymin = Math.floor(
              Math.min(A.y, B.y, C.y, D.y, E.y, F.y, EE.y, CC.y, DD.y) - 1,
            )
            Ymax = Math.ceil(
              Math.max(A.y, B.y, C.y, D.y, E.y, F.y, EE.y, CC.y, DD.y) + 1,
            )
            anim.recadre(Xmin - 3, Ymax)
            anim.pointsCreer(A, B, C, D, E)
            anim.regleDroite(A, B)
            anim.perpendiculaireRegleEquerre2points3epoint(A, B, B)
            anim.perpendiculaireRegleEquerre2points3epoint(A, B, C)
            anim.paralleleRegleEquerre2points3epoint(A, B, D)
            anim.paralleleRegleEquerre2points3epoint(A, B, E)

            break
        }
      } while (
        longueur(A, CC) < 1 ||
        longueur(A, DD) < 1 ||
        (listeTypeDeQuestions[i] === 3 && longueurAEE < 1)
      ) // On refait une figure si les points d'intersection sont trop proches de A

      if (this.sup < 3) g = grille(Xmin, Ymin, Xmax, Ymax, 'gray', 0.7)
      else g = vide2d()
      if (this.sup === 2) {
        sc = 0.8
        carreaux = seyes(Xmin, Ymin, Xmax, Ymax)
      } else {
        sc = 0.5
        carreaux = vide2d()
      }
      objetsEnonce.push(g, carreaux)
      objetsCorrection.push(g, carreaux)

      enonce +=
        '<br>' +
        mathalea2d(
          {
            xmin: Xmin,
            ymin: Ymin,
            xmax: Xmax,
            ymax: Ymax,
            pixelsParCm: ppc,
            scale: sc,
          },
          objetsEnonce,
        )
      correction += mathalea2d(
        {
          xmin: Xmin,
          ymin: Ymin,
          xmax: Xmax,
          ymax: Ymax,
          pixelsParCm: ppc,
          scale: sc,
        },
        objetsCorrection,
      )
      /** ********************** AMC Open *****************************/
      this.autoCorrectionAMC[i] = {}
      this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      this.autoCorrectionAMC[i].options = { ordered: false }
      this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      this.autoCorrectionAMC[i].enonce = enonce + '<br>'
      this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      this.autoCorrectionAMC[i].propositions = [
        {
          texte: correction,
          statut: 3,
          sanscadre: true,
        },
      ]
      this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      // this.autoCorrection = [{ enonce: enonce + '<br>', propositions: [{ texte: correction, statut: 3, sanscadre: true }] }]
      /****************************************************/
      correction += anim.htmlBouton(this.numeroExercice ?? 0, i)
      if (this.questionJamaisPosee(i, Xmax, Xmin, Ymax, Ymin)) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = enonce ?? ''
        this.listeCorrections[i] = correction
        i++
      }
      cpt++
    }

    listeQuestionsToContenu(this)
  }
}
