import { codageAngle } from '../../lib/2d/angles'
import { droite, droiteParPointEtParallele } from '../../lib/2d/droites'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { labelPoint } from '../../lib/2d/textes'
import { rotation, similitude } from '../../lib/2d/transformations'
import { angle, longueur } from '../../lib/2d/utilitairesGeometriques'
import {
  pointIntersectionDD,
  pointSurSegment,
} from '../../lib/2d/utilitairesPoint'
import { bleuMathalea, orangeMathalea } from '../../lib/colors'
import { choisitLettresDifferentes } from '../../lib/outils/aleatoires'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { numAlpha, sp } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'

export const titre = "Déterminer des angles en utilisant les cas d'égalité"
export const amcReady = true
export const amcType = 'AMCHybride'
export const dateDePublication = '14/11/2020'
export const dateDeModifImportante = '10/12/2023'

/**
 * Déterminer des angles en utilisant les cas d'égalités : opposés par le sommet, alternes-internes, correspondants...
 * @author Jean-claude Lhote inspiré d'exercices du manuel sésamath.
 */
export const uuid = 'd12db'

export const refs = {
  'fr-fr': ['5G4A-1'],
  'fr-2016': ['5G30-1'],
  'fr-ch': ['1mG1-5', '11LCES1A-5', '11LSES1A-5'],
}
export default class EgaliteDAngles extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Type de figure',
      3,
      '1 : Le trapèze\n2 : Le papillon\n3 : Au hasard',
    ]

    this.sup = 1
    this.nbQuestions = 1
    this.spacing = 2
    this.spacingCorr = context.isHtml ? 3 : 2
  }

  nouvelleVersion() {
    const choix =
      this.sup === 3
        ? combinaisonListes([1, 2], this.nbQuestions)
        : combinaisonListes([this.sup], this.nbQuestions)
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      let figure = []
      const noms = choisitLettresDifferentes(5, 'Q', true)
      const A = pointAbstrait(0, 0, noms[0], 'above left')
      const fig1 = function (): [
        objets: NestedObjetMathalea2dArray,
        params: { xmin: number; xmax: number; ymin: number; ymax: number },
        correction: string,
        enonceAMC: string[],
        reponseAMC: number[],
      ] {
        const objets = []
        const enonceAMC = []
        let correction
        const gras = context.isHtml ? orangeMathalea : 'black'
        let a = randint(45, 85)
        const ac = randint(8, 10)
        const ce = randint(7, 10, ac)
        const C = similitude(
          rotation(pointAbstrait(1, 0), A, randint(-45, 45)),
          A,
          a,
          ac,
          noms[2],
          'left',
        )
        const c = randint(45, 70)
        const E = similitude(A, C, c, ce / ac, noms[4], 'above right')
        const CA = droite(C, A)
        const CE = droite(C, E)
        const AE = droite(A, E, '', orangeMathalea)
        // AE.epaisseur = 2
        const B = pointSurSegment(
          A,
          C,
          randint(3, ac - 4),
          noms[1],
          'above left',
        )
        const BD = droiteParPointEtParallele(B, AE, '', orangeMathalea)
        // BD.epaisseur = 2
        const D = pointIntersectionDD(BD, CE, noms[3], 'above right')
        const m1 = codageAngle(
          E,
          A,
          C,
          1,
          '',
          'black',
          2,
          1,
          context.isAmc ? 'none' : 'black',
          0.1,
          true,
        )
        const m2 = codageAngle(
          A,
          C,
          E,
          1,
          '',
          'black',
          2,
          1,
          context.isAmc ? 'none' : 'black',
          0.1,
          true,
        )
        const l1 = labelPoint(A, B, C, D, E)
        const c1 = codageAngle(D, B, A, 1, '', bleuMathalea, 2, 1, bleuMathalea)
        const c2 = codageAngle(
          B,
          D,
          E,
          1,
          '',
          orangeMathalea,
          2,
          1,
          orangeMathalea,
        )
        const c3 = codageAngle(D, E, A, 1, '', 'green', 2, 1, 'green')
        const c4 = codageAngle(D, B, C, 1, '', 'pink', 2, 1, 'pink')
        const c5 = codageAngle(C, D, B, 1, '', 'red', 2, 1, 'red')
        if (context.isAmc) objets.push(CA, CE, AE, BD, m1, m2, l1)
        else objets.push(CA, CE, AE, BD, m1, m2, c1, c2, c3, c4, c5, l1)
        a = Math.round(angle(E, A, C))
        enonceAMC[0] = `Dans la figure ci-dessous, les droites $(${noms[0]}${noms[4]})$ et $(${noms[1]}${noms[3]})$ sont parallèles.<br>`
        enonceAMC[0] += "La figure n'est pas en vraie grandeur.<br>"
        enonceAMC[0] += context.isAmc
          ? '<br>'
          : `On veut déterminer la mesure des angles du quadrilatère $${noms[0]}${noms[1]}${noms[3]}${noms[4]}$ (toutes les réponses doivent être justifiées).`
        enonceAMC[1] = `${numAlpha(0)} Déterminer la mesure de l'angle $\\widehat{${noms[3]}${noms[1]}${noms[2]}}$.`
        enonceAMC[2] = `${numAlpha(1)} En déduire la mesure de l'angle $\\widehat{${noms[0]}${noms[1]}${noms[3]}}$.`
        // enonceAMC[3] = `${numAlpha(2)} En utilisant la question ${numAlpha(0)}, déterminer la mesure de l'angle $\\widehat{${noms[1]}${noms[3]}${noms[2]}}$.`
        enonceAMC[3] = `${numAlpha(2)} Déterminer la mesure de l'angle $\\widehat{${noms[1]}${noms[3]}${noms[2]}}$.`
        enonceAMC[4] = `${numAlpha(3)} En déduire la mesure de l'angle $\\widehat{${noms[1]}${noms[3]}${noms[4]}}$.`
        // enonceAMC[5] = `${numAlpha(4)} En utilisant la question ${numAlpha(2)} déterminer la mesure de l'angle $\\widehat{${noms[3]}${noms[4]}${noms[0]}}$.`
        enonceAMC[5] = `${numAlpha(4)} Déterminer la mesure de l'angle $\\widehat{${noms[3]}${noms[4]}${noms[0]}}$.`
        if (!context.isAmc)
          enonceAMC[6] = `${numAlpha(5)} Vérifier la conjecture suivante : «${sp()}La somme des angles d'un quadrilatère vaut $360^\\circ$.${sp()}»`
        correction = `${numAlpha(0)} Comme les droites $(${noms[0]}${noms[4]})$ et $(${noms[1]}${noms[3]})$ sont parallèles, les angles correspondants $\\widehat{${noms[4]}${noms[0]}${noms[1]}}$ et $\\widehat{${noms[3]}${noms[1]}${noms[2]}}$ sont égaux, donc $\\widehat{${noms[3]}${noms[1]}${noms[2]}}$ mesure $${miseEnEvidence(a)}^\\circ$.<br>`
        correction += `${numAlpha(1)} Les angles $\\widehat{${noms[0]}${noms[1]}${noms[3]}}$ et $\\widehat{${noms[3]}${noms[1]}${noms[2]}}$ sont adjacents supplémentaires, donc $\\widehat{${noms[0]}${noms[1]}${noms[3]}}$ mesure $180^\\circ-${a}^\\circ=${miseEnEvidence(180 - a, gras)}^\\circ$.<br>`
        correction += `${numAlpha(2)} Dans un triangle, la somme des angles vaut $180^\\circ$ donc $\\widehat{${noms[1]}${noms[3]}${noms[2]}}=180^\\circ-\\widehat{${noms[3]}${noms[1]}${noms[2]}}-\\widehat{${noms[1]}${noms[2]}${noms[3]}}=180^\\circ-${a}^\\circ-${c}^\\circ=${miseEnEvidence(180 - a - c)}^\\circ$.<br>`
        correction += `${numAlpha(3)} Les angles $\\widehat{${noms[1]}${noms[3]}${noms[2]}}$ et $\\widehat{${noms[1]}${noms[3]}${noms[4]}}$ sont adjacents supplémentaires, donc $\\widehat{${noms[1]}${noms[3]}${noms[4]}}$ mesure $180^\\circ-${180 - a - c}^\\circ=${miseEnEvidence(a + c, gras)}^\\circ$.<br>`
        correction += `${numAlpha(4)} Comme les droites $(${noms[0]}${noms[4]})$ et $(${noms[1]}${noms[3]})$ sont parallèles, les angles correspondants $\\widehat{${noms[1]}${noms[3]}${noms[2]}}$ et $\\widehat{${noms[3]}${noms[4]}${noms[0]}}$ sont égaux, donc $\\widehat{${noms[3]}${noms[4]}${noms[0]}}$ mesure $${miseEnEvidence(180 - a - c, gras)}^\\circ$.<br>`
        correction += context.isAmc
          ? 'none'
          : `${numAlpha(5)} La somme des angles du quadrilatère vaut donc : $${a}^\\circ+${miseEnEvidence(180 - a, bleuMathalea)}^\\circ+${miseEnEvidence(a + c, bleuMathalea)}^\\circ+${miseEnEvidence(180 - a - c, bleuMathalea)}^\\circ=${miseEnEvidence(360)}^\\circ$.<br>`
        correction += '$\\phantom{f/}$ La conjecture est bien vérifiée.'
        const reponsesAMC = [a, 180 - a, 180 - a - c, a + c, 180 - a - c]
        const params = {
          xmin: Math.min(A.x - 8, C.x - 8, E.x - 8),
          ymin: Math.min(A.y - 1, E.y - 1, C.y - 1),
          xmax: Math.max(E.x + 2, A.x + 2, C.x + 2),
          ymax: Math.max(C.y + 2, A.y + 2, E.y + 2),
          scale: 0.7,
        }

        return [objets, params, correction, enonceAMC, reponsesAMC]
      }
      const fig2 = function (): [
        objets: NestedObjetMathalea2dArray,
        params: { xmin: number; xmax: number; ymin: number; ymax: number },
        correction: string,
        enonceAMC: string[],
        reponseAMC: number[],
      ] {
        const objets = []
        const enonceAMC = []
        let correction
        let d, CA, AB, CE, BE, B, C, D, E, ab, ac, a, cd, ad
        do {
          B = rotation(
            pointAbstrait(randint(8, 10), randint(1, 3)),
            A,
            randint(-40, 40),
            noms[1],
            'right',
          )
          ab = longueur(A, B)
          ac = randint(6, 8)
          a = randint(40, 60)
          C = similitude(B, A, a, ac / ab, noms[2], 'above left')
          CA = droite(C, A)
          AB = droite(A, B)
          D = pointSurSegment(
            A,
            B,
            ab / 2 + randint(-1, 1, 0) / 10,
            noms[3],
            'below',
          )
          CE = droite(C, D)
          cd = longueur(C, D)
          ad = longueur(A, D)
          E = pointSurSegment(C, D, (cd * ab) / ad, noms[4], 'below right')
          BE = droite(B, E)
          d = arrondi(angle(C, D, B), 0)
        } while (d === 90) // Pour éviter d'avoir un angle droit
        const cA = codageAngle(
          D,
          A,
          C,
          1,
          '',
          'black',
          2,
          1,
          'black',
          0.2,
          true,
        )
        const cD = codageAngle(C, D, B, 1, '', 'red', 2, 1, 'red', 0.2, true)
        const cE = codageAngle(
          D,
          E,
          B,
          1,
          '',
          bleuMathalea,
          2,
          1,
          bleuMathalea,
          0.2,
          true,
        )
        const c4 = codageAngle(A, C, D, 1, '', 'green', 2, 1, 'green', 0.2)
        const c5 = codageAngle(
          B,
          D,
          E,
          1,
          '',
          orangeMathalea,
          2,
          1,
          orangeMathalea,
          0.2,
        )
        const c6 = codageAngle(E, B, D, 1, '', 'pink', 2, 1, 'pink', 0.2)
        const c3 = codageAngle(A, D, C, 1, '', 'gray', 2, 1, 'gray', 0.2)
        const l1 = labelPoint(A, B, C, D, E)
        objets.push(CA, AB, CE, BE, cA, cD, cE, c3, c4, c5, c6, l1)
        enonceAMC[0] =
          "La figure ci-dessous n'est pas en vraie grandeur. Toutes les réponses devront être justifiées."
        enonceAMC[1] = `${numAlpha(0)} Déterminer la mesure de l'angle $\\widehat{${noms[0]}${noms[3]}${noms[2]}}$.`
        enonceAMC[2] = `${numAlpha(1)} En déduire la mesure de l'angle $\\widehat{${noms[3]}${noms[2]}${noms[0]}}$.`
        enonceAMC[3] = `${numAlpha(2)} Déterminer si les droites $(${noms[0]}${noms[2]})$ et $(${noms[4]}${noms[1]})$ sont parallèles.`
        enonceAMC[4] = `${numAlpha(3)} Si on considère que les segments $[${noms[0]}${noms[2]}]$ et $[${noms[4]}${noms[1]}]$ sont de même longueur, Déterminer la nature du quadrilatère $${noms[0]}${noms[2]}${noms[1]}${noms[4]}$.`
        correction = `${numAlpha(0)} Les angles $\\widehat{${noms[0]}${noms[3]}${noms[2]}}$ et $\\widehat{${noms[2]}${noms[3]}${noms[1]}}$ sont adjacents supplémentaires, donc $\\widehat{${noms[0]}${noms[3]}${noms[2]}}$ mesure $180^\\circ-${d}^\\circ=${miseEnEvidence(180 - d)}^\\circ$.<br>`
        correction += `${numAlpha(1)} Dans un triangle, la somme des angles vaut $180^\\circ$ donc $\\widehat{${noms[0]}${noms[2]}${noms[3]}}=180-\\widehat{${noms[3]}${noms[0]}${noms[2]}}-\\widehat{${noms[0]}${noms[3]}${noms[2]}}=180^\\circ-${a}^\\circ-${180 - d}^\\circ=${miseEnEvidence(-a + d)}^\\circ$.<br>`
        correction += `${numAlpha(2)} Pour les droites $(${noms[0]}${noms[2]})$ et $(${noms[4]}${noms[1]})$ coupées par la sécante $(${noms[2]}${noms[4]})$ les angles $\\widehat{${noms[0]}${noms[2]}${noms[3]}}$ et $\\widehat{${noms[1]}${noms[4]}${noms[3]}}$ sont des angles alternes-internes.<br>`
        correction +=
          '$\\phantom{c/}$ Or, si des angles alternes-internes sont égaux, alors cela signifie que les droites coupées par la sécante sont parallèles.<br>'
        correction += `$\\phantom{c/}$ Les droites $(${noms[0]}${noms[2]})$ et $(${noms[4]}${noms[1]})$ sont donc ${texteEnCouleurEtGras('parallèles')}.<br>`
        correction += `${numAlpha(3)} Les droites $(${noms[0]}${noms[2]})$ et $(${noms[4]}${noms[1]})$ sont parallèles et les segments $[${noms[0]}${noms[2]}]$ et $[${noms[4]}${noms[1]}]$ sont de même longueur.<br>`
        correction +=
          '$\\phantom{c/}$ Or, un quadrilatère qui possède des côtés opposés parallèles et de même longueur est un parallélogramme.<br>'
        correction += `$\\phantom{c/}$ Donc $${noms[0]}${noms[2]}${noms[1]}${noms[4]}$ est un ${texteEnCouleurEtGras('parallélogramme')} et $${noms[3]}$ est son centre.`
        const reponsesAMC = [180 - d, -a + d]
        const params = {
          xmin: Math.min(A.x, B.x, C.x, D.x, E.x) - 1,
          ymin: Math.min(A.y, B.y, C.y, D.y, E.y) - 1,
          xmax: Math.max(A.x, B.x, C.x, D.x, E.x) + 2,
          ymax: Math.max(A.y, B.y, C.y, D.y, E.y) + 2,
        }

        return [objets, params, correction, enonceAMC, reponsesAMC]
      }

      if (this.sup === 3) {
        choix[i] = randint(1, 2)
      } else {
        choix[i] = this.sup
      }

      figure = choix[i] === 1 ? fig1() : fig2()
      let enonceFinal = ''
      for (let ee = 0; ee < figure[3].length; ee++) {
        enonceFinal += figure[3][ee] + '<br>'
        enonceFinal += ee === 0 ? mathalea2d(figure[1], figure[0]) : ''
      }

      if (context.isAmc) {
        if (choix[i] === 1) {
          // Cas du trapèze
          this.autoCorrectionAMC[i] = {
            enonce: figure[3][0] + mathalea2d(figure[1], figure[0]),
            options: { barreseparation: true, numerotationEnonce: true }, // facultatif.
            propositions: [
              {
                type: 'AMCOpen',
                propositions: [
                  {
                    texte: '',
                    numQuestionVisible: false,
                    statut: 3, // (ici c'est le nombre de lignes du cadre pour la réponse de l'élève sur AMC)
                    feedback: '',
                    multicolsBegin: true,
                    //    enonce: figure[3][0] + mathalea2d(figure[1], figure[0]) + '<br>' + figure[3][1] + ' Justifier la réponse.' // EE : ce champ est facultatif et fonctionnel qu'en mode hybride (en mode normal, il n'y a pas d'intérêt)
                    enonce: figure[3][1] + ' Justifier la réponse.', // EE : ce champ est facultatif et fonctionnel qu'en mode hybride (en mode normal, il n'y a pas d'intérêt)
                  },
                ],
              },
              {
                type: 'AMCNum',
                propositions: [
                  {
                    texte: '',
                    multicolsEnd: true,
                    reponse: {
                      texte: `Valeur de l'angle $\\widehat{${noms[3]}${noms[1]}${noms[2]}}$`,
                      valeur: figure[4][0],
                      param: {
                        signe: false,
                        digits: 3,
                        decimals: 0,
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
                    reponse: {
                      texte: figure[3][2] + '<br>',
                      valeur: figure[4][1],
                      param: {
                        signe: false,
                        digits: 3,
                        decimals: 0,
                      },
                    },
                  },
                ],
              },
              {
                type: 'AMCOpen',

                propositions: [
                  {
                    texte: '',
                    numQuestionVisible: false,
                    statut: 3, // (ici c'est le nombre de lignes du cadre pour la réponse de l'élève sur AMC)
                    feedback: '',
                    multicolsBegin: true,
                    enonce: figure[3][3] + ' Justifier la réponse.', // EE : ce champ est facultatif et fonctionnel qu'en mode hybride (en mode normal, il n'y a pas d'intérêt)
                  },
                ],
              },
              {
                type: 'AMCNum',

                propositions: [
                  {
                    texte: '',
                    multicolsEnd: true,
                    reponse: {
                      texte: `Valeur de l'angle $\\widehat{${noms[1]}${noms[3]}${noms[2]}}$`,
                      valeur: figure[4][2],
                      param: {
                        signe: false,
                        digits: 3,
                        decimals: 0,
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
                    reponse: {
                      texte: figure[3][4] + '<br>',
                      valeur: figure[4][3],
                      param: {
                        signe: false,
                        digits: 3,
                        decimals: 0,
                      },
                    },
                  },
                ],
              },
              {
                type: 'AMCOpen',

                propositions: [
                  {
                    texte: '',
                    numQuestionVisible: false,
                    statut: 3, // (ici c'est le nombre de lignes du cadre pour la réponse de l'élève sur AMC)
                    feedback: '',
                    multicolsBegin: true,
                    enonce: figure[3][5] + ' Justifier la réponse.', // EE : ce champ est facultatif et fonctionnel qu'en mode hybride (en mode normal, il n'y a pas d'intérêt)
                  },
                ],
              },
              {
                type: 'AMCNum',

                propositions: [
                  {
                    texte: '',
                    multicolsEnd: true,
                    reponse: {
                      texte: `Valeur de l'angle $\\widehat{${noms[3]}${noms[4]}${noms[0]}}$`,
                      valeur: figure[4][4],
                      param: {
                        signe: false,
                        digits: 3,
                        decimals: 0,
                      },
                    },
                  },
                ],
              },
            ],
          }
        } else {
          // Cas du papillon
          this.autoCorrectionAMC[i] = {
            enonce:
              figure[3][0] +
              '<br>' +
              mathalea2d(figure[1], figure[0]) +
              '<br>Dans cette configuration, pas de version AMC développée.<br>',
            options: { barreseparation: true, numerotationEnonce: true }, // facultatif.
            propositions: [],
          }
        }
      }

      // if (this.questionJamaisPosee(i, u, d, c)) {
      // Si la question n'a jamais été posée, on en crée une autre
      this.listeQuestions.push(enonceFinal)
      this.listeCorrections.push(figure[2])
      i++
    }
    listeQuestionsToContenu(this)
  }
}
