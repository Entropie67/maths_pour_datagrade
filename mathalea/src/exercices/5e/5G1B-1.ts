import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { codageSegments } from '../../lib/2d/CodageSegment'
import { droite, droiteAvecNomLatex } from '../../lib/2d/droites'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { PointAbstrait, pointAbstrait } from '../../lib/2d/PointAbstrait'
import { repere } from '../../lib/2d/reperes'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { labelPoint } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { rotation, translation } from '../../lib/2d/transformations'
import { pointEstSur } from '../../lib/2d/utilitairesGeometriques'
import { milieu } from '../../lib/2d/utilitairesPoint'
import { vecteur } from '../../lib/2d/Vecteur'
import { bleuMathalea, orangeMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { createQuestion } from '../../lib/interactif/createQuestion'
import type { SubQuestion } from '../../lib/interactif/subQuestions'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { numAlpha } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import {
  imagePointParTransformation,
  type TransformationsIndex,
} from '../../modules/imagePointParTransformation'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  "Trouver les coordonnées de l'image d'un point par une symétrie axiale (quart de plan)"
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'
export const dateDeCreation = '26/09/2025'
export const dateDeModifImportante = '26/10/2026'

/**
 * Trouver les coordonnées d'un point transformé d'un autre par une des transformations du plan
 * @author Jean-claude Lhote
 */
export const uuid = 'd4090'

export const refs = {
  'fr-fr': ['5G1B-1'],
  'fr-2016': ['5G11-51'],
  'fr-ch': ['9R1ES4C-8', '9R2ES4C-8', '9R3ES4C-8', 'PRQES02D-10'],
}
export default class SymAxeEtCoordonnees extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.sup = '1'
    this.besoinFormulaireTexte = [
      "Choix de l'axe de symétrie",
      "nombres séparés par des tirets\n1 : parallèle à première bissectrice\n2 : parallèle à deuxième bissectrice\n3 : parallèle à l'axe des abscisses\n4 : parallèle à l'axe des ordonnées\n5 : Mélange",
    ]
  }

  nouvelleVersion() {
    context.fenetreMathalea2d = [0, 0, 20, 20]
    const axes = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 4,
      defaut: 1,
      melange: 5,
      nbQuestions: this.nbQuestions,
    }).map(Number)
    const k: number[] = []
    // On initialise les PointAbstrait pour éviter les erreurs typescript type undefined.
    let A: PointAbstrait = pointAbstrait(0, 0)
    let B: PointAbstrait = pointAbstrait(0, 0)
    let C: PointAbstrait = pointAbstrait(0, 0)
    let Aprime: PointAbstrait = pointAbstrait(0, 0)
    let Bprime: PointAbstrait = pointAbstrait(0, 0)
    let Cprime: PointAbstrait = pointAbstrait(0, 0)
    const lettre1 = ['A', 'B', 'C']
    const punto: number[][] = [[]]
    const couleurs = ['brown', 'green', bleuMathalea]
    for (
      let ee = 0,
        texte,
        texteCorr,
        xA = 0,
        yA = 0,
        xB = 0,
        yB = 0,
        xC = 0,
        yC = 0,
        objetsEnonce,
        objetsCorrection,
        cpt = 0;
      ee < this.nbQuestions && cpt < 50;
    ) {
      const subQuestions: SubQuestion[] = []
      let enonceAmc = ''
      texte = ''
      texteCorr = ''
      objetsEnonce = []
      objetsCorrection = []

      const xO = randint(8, 12) // PointAbstrait O' (origine du repère dans lequel les transformations sont simples (centre des rotations et punto d'intersection des axes))
      const yO = randint(8, 12)

      const O = pointAbstrait(xO, yO, 'O', 'above left') // on crée le point O'
      const d =
        axes[ee] === 1
          ? droite(O, translation(O, vecteur(1, 1)))
          : axes[ee] === 2
            ? droite(O, translation(O, vecteur(1, -1)))
            : axes[ee] === 3
              ? droite(O, translation(O, vecteur(1, 0)))
              : droite(O, translation(O, vecteur(0, 1)))
      const dLatex = droiteAvecNomLatex(d, '(d)', bleuMathalea)
      let trouve = false
      let compteur = 0
      while (!trouve) {
        xA = randint(1, 19) // PointAbstrait A
        yA = randint(1, 19)
        if (xA === xO && yA === yO) xA = randint(1, 19, [0, xO])
        punto[0] = imagePointParTransformation(
          axes[ee] as TransformationsIndex,
          [xA, yA],
          [xO, yO],
          [xO, yO],
          1,
        )
        punto[0] = punto[0].map((e) => Number(e)) // supprime les fractions étendues, on revient à la notation décimale
        compteur = 0
        while (
          (punto[0][0] < 1 ||
            punto[0][0] > 19 ||
            punto[0][1] < 1 ||
            punto[0][1] > 19) &&
          compteur < 20
        ) {
          // on teste si A est dans la fenêtre sinon on en choisit un autre
          xA = randint(1, 19, [xO, xO - 1]) // PointAbstrait A
          yA = randint(1, 19, [yO, yO - 1])
          punto[0] = imagePointParTransformation(
            axes[ee] as TransformationsIndex,
            [xA, yA],
            [xO, yO],
            [xO, yO],
            k[0],
          )
          punto[0] = punto[0].map((e) => Number(e)) // supprime les fractions étendues, on revient à la notation décimale
          compteur++
        }
        A = pointAbstrait(xA, yA, 'A')
        Aprime = pointAbstrait(punto[0][0], punto[0][1], "A'")

        // xB = randint(-7, 7, [xA, 0]) // PointAbstrait B
        xB = randint(1, 19, [xA, xO, xO - 1, punto[0][0]]) // PointAbstrait B
        yB = randint(1, 19, [yA, yO, yO - 1])
        punto[1] = imagePointParTransformation(
          axes[ee] as TransformationsIndex,
          [xB, yB],
          [xO, yO],
          [xO, yO],
          1,
        )
        punto[1] = punto[1].map((e) => Number(e)) // supprime les fractions étendues, on revient à la notation décimale
        compteur = 0
        while (
          (punto[1][0] < 1 ||
            punto[1][0] > 19 ||
            punto[1][1] < 1 ||
            punto[1][1] > 19) &&
          compteur < 20
        ) {
          // on teste si on est dans les clous, sinon on choisit un autre punto B
          xB = randint(1, 19, [xA, xO, xO - 1, punto[0][0]]) // PointAbstrait B
          yB = randint(1, 19, [yA, yO, yO - 1])
          punto[1] = imagePointParTransformation(
            axes[ee] as TransformationsIndex,
            [xB, yB],
            [xO, yO],
            [xO, yO],
            1,
          )
          punto[1] = punto[1].map((e) => Number(e)) // supprime les fractions étendues, on revient à la notation décimale
          compteur++
        }

        B = pointAbstrait(xB, yB, 'B')
        Bprime = pointAbstrait(punto[1][0], punto[1][1], "B'")

        // xC = randint(-7, 7, 0) // PointAbstrait C
        xC = randint(1, 19, [xA, xB, xO, xO - 1, punto[0][0], punto[1][0]]) // PointAbstrait C
        yC = randint(1, 19, [yA, yB, yO, yO - 1])
        punto[2] = imagePointParTransformation(
          axes[ee] as TransformationsIndex,
          [xC, yC],
          [xO, yO],
          [xO, yO],
          1,
        )
        punto[2] = punto[2].map((e) => Number(e)) // supprime les fractions étendues, on revient à la notation décimale
        compteur = 0
        while (
          (punto[2][0] < 1 ||
            punto[2][0] > 19 ||
            punto[2][1] < 1 ||
            punto[2][1] > 19) &&
          compteur < 20
        ) {
          // on vérifie que C est dans le repère sinon on change le punto C.
          xC = randint(1, 19, [xA, xB, xO, xO - 1, punto[0][0], punto[1][0]]) // PointAbstrait C
          yC = randint(1, 19, [yA, yB, yO, yO - 1])
          punto[2] = imagePointParTransformation(
            axes[ee] as TransformationsIndex,
            [xC, yC],
            [xO, yO],
            [xO, yO],
            1,
          )
          punto[2] = punto[2].map((e) => Number(e)) // supprime les fractions étendues, on revient à la notation décimale
          compteur++
        }
        if (compteur < 20) {
          trouve = true
        } else {
          continue
        }
        C = pointAbstrait(xC, yC, 'C')
        Cprime = pointAbstrait(punto[2][0], punto[2][1], "C'")
      }
      const antecedents = [A, B, C]
      const images = [Aprime, Bprime, Cprime]
      objetsEnonce.push(
        tracePoint(...antecedents),
        labelPoint(...antecedents),
        d,
        dLatex[1],
      )
      objetsCorrection.push(
        tracePoint(...antecedents),
        tracePoint(...images, orangeMathalea),
        labelPoint(...antecedents),
        labelPoint(...images, orangeMathalea),
        d,
        dLatex[1],
      )

      for (let i = 0; i < 3; i++) {
        const m = milieu(antecedents[i], images[i])
        const p = rotation(antecedents[i], m, 90)
        if (!pointEstSur(antecedents[i], d)) {
          objetsCorrection.push(
            segment(antecedents[i], images[i], couleurs[i]),
            codageSegments('//', couleurs[i], m, antecedents[i], m, images[i]),
            codageAngleDroit(antecedents[i], m, p),
          )
        }

        if (context.isAmc) {
          enonceAmc +=
            (i === 0 ? numAlpha(i) : '<br>' + numAlpha(i)) +
            ` Donner les coordonnées de l'image de $${lettre1[i]}$ par la symétrie d'axe $(d)$.`
        }
        subQuestions.push({
          question: `Donner les coordonnées de l'image de $${lettre1[i]}$ par la symétrie d'axe $(d)$. $${lettre1[i]}^{\\prime}($ %{0} $)$`,
          correction: `$${lettre1[i]}'$, l'image de $${lettre1[i]}$ par la symétrie d'axe $(d)$ a pour coordonnées $(${miseEnEvidence(`${texNombre(punto[i][0])};${texNombre(punto[i][1])}`)})$.`,
          answer: {
            value: `${punto[i][0]};${punto[i][1]}`,
            options: { coordonnees: true },
          },
          field: { keyboard: KeyboardType.lyceeClassique },
        })

        if (context.isAmc) {
          enonceAmc += '<br>'
        }
      }
      objetsEnonce.push(
        repere({
          xMin: 0,
          yMin: 0,
          xMax: 20,
          yMax: 20,
          grilleOpacite: 0.2,
        }),
      )
      objetsCorrection.push(
        repere({
          xMin: 0,
          yMin: 0,
          xMax: 20,
          yMax: 20,
          grilleOpacite: 0.2,
        }),
      )
      if (context.isAmc) {
        this.autoCorrectionAMC.push({
          enonce:
            '\\begin{center}' +
            mathalea2d(
              Object.assign(
                {
                  pixelsParCm: 20,
                  scale: 0.45,
                  mainlevee: false,
                },
                fixeBordures(objetsEnonce),
              ),
              objetsEnonce,
            ) +
            '\\\\' +
            '\\end{center}' +
            enonceAmc,
          enonceAvant: false,
          enonceApresNumQuestion: true,
          options: { barreseparation: false },
          propositions: [
            {
              type: 'AMCNum',
              propositions: [
                {
                  texte: '',
                  statut: '',
                  multicolsBegin: true,
                  reponse: {
                    texte: numAlpha(0) + " Abscisse de l'image de A",
                    valeur: punto[0][0],
                    param: {
                      digits: 1,
                      decimals: 0,
                      signe: true,
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
                  texte: `A(${punto[0][0]};${punto[0][1]})`,
                  statut: '',
                  multicolsEnd: true,
                  reponse: {
                    texte: "Ordonnée de l'image de A",
                    valeur: punto[0][1],
                    param: {
                      digits: 1,
                      decimals: 0,
                      signe: true,
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
                  multicolsBegin: true,
                  reponse: {
                    texte: numAlpha(1) + " Abscisse de l'image de B",
                    valeur: punto[1][0],
                    param: {
                      digits: 1,
                      decimals: 0,
                      signe: true,
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
                  texte: `B(${punto[1][0]};${punto[1][1]})`,
                  statut: '',
                  multicolsEnd: true,
                  reponse: {
                    texte: "Ordonnée de l'image de B",
                    valeur: punto[1][1],
                    param: {
                      digits: 1,
                      decimals: 0,
                      signe: true,
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
                  multicolsBegin: true,
                  reponse: {
                    texte: numAlpha(2) + " Abscisse de l'image de C",
                    valeur: punto[2][0],
                    param: {
                      digits: 1,
                      decimals: 0,
                      signe: true,
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
                  texte: `C(${punto[2][0]};${punto[2][1]})`,
                  statut: '',
                  multicolsEnd: true,
                  reponse: {
                    texte: "Ordonnée de l'image de C",
                    valeur: punto[2][1],
                    param: {
                      digits: 1,
                      decimals: 0,
                      signe: true,
                      approx: 0,
                    },
                  },
                },
              ],
            },
          ],
        })
      }
      if (this.questionJamaisPosee(ee, xA, yA, xB, yB, xC, yC)) {
        createQuestion(this, ee, { question: '', subQuestions })
        texte = this.listeQuestions[ee]
        texteCorr = this.listeCorrections[ee]
        this.listeQuestions[ee] =
          texte +
          '<br>' +
          mathalea2d(
            Object.assign(
              {
                pixelsParCm: 20,
                scale: 0.45,
                mainlevee: false,
              },
              fixeBordures(objetsEnonce),
            ),
            objetsEnonce,
          )
        this.listeCorrections[ee] =
          texteCorr +
          '<br>' +
          mathalea2d(
            Object.assign(
              {
                pixelsParCm: 20,
                scale: 0.45,
                mainlevee: false,
              },
              fixeBordures(objetsCorrection),
            ),
            objetsCorrection,
          )
        ee++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
