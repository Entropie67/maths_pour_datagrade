import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { propositionsQcm } from '../../lib/interactif/qcm'
import {
  choice,
  combinaisonListes,
  enleveElement,
} from '../../lib/outils/arrayOutils'
import { arrondi } from '../../lib/outils/nombres'
import { creerNomDePolygone } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Déterminer si un triangle est rectangle ou pas'
export const amcReady = true
export const amcType = 'AMCHybride'

export const interactifReady = true
/**
 * À partir de la donnée des 3 longueurs d'un triangle, déterminer s'il est rectangle ou pas.
 * @author Rémi Angot
 * 4G21
 */
export const uuid = 'ab5d4'

export const refs = {
  'fr-fr': ['4G21', 'BP2G9'],
  'fr-ch': ['11LCGM2B-1', '11LSGM2B-1', 'PRQMG03B-2'],
}
export default class ReciproquePythagore extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Type de questions',
      3,
      "1 : Démontrer qu'un triangle est rectangle\n2 : Démontrer qu'un triangle n'est pas rectangle\n3 : Déterminer si un triangle est rectangle ou pas ",
    ]

    this.besoinFormulaire2CaseACocher = [
      'Correction avec le mot « contraposée »',
      false,
    ]

    this.amcReady = amcReady
    this.amcType = amcType

    this.nbQuestions = 3

    this.sup = 3
    this.sup2 = false
    this.spacingCorr = context.isHtml ? 2 : 1
  }

  nouvelleVersion() {
    let listeTypeDeQuestions = []
    if (this.sup === 1) {
      listeTypeDeQuestions = combinaisonListes(['rectangle'], this.nbQuestions)
    } else if (this.sup === 2) {
      listeTypeDeQuestions = combinaisonListes(
        ['pas_rectangle'],
        this.nbQuestions,
      )
    } else {
      // (this.sup === 3)
      listeTypeDeQuestions = combinaisonListes(
        ['rectangle', 'pas_rectangle'],
        this.nbQuestions,
      )
    }
    const listeTripletsPythagoriciens = [
      [3, 4, 5],
      [5, 12, 13],
      [6, 8, 10],
      [7, 24, 25],
      [8, 15, 17],
      [9, 12, 15],
      [9, 40, 41],
      [10, 24, 26],
      [11, 60, 61],
      [12, 16, 20],
      [12, 35, 37],
      [13, 84, 85],
      [14, 48, 50],
      [15, 20, 25],
      [15, 36, 39],
      [16, 30, 34],
      [16, 63, 65],
      [18, 24, 30],
      [18, 80, 82],
      [20, 21, 29],
      [20, 48, 52],
      [21, 28, 35],
      [21, 72, 75],
      [24, 32, 40],
      [24, 45, 51],
      [24, 70, 74],
      [25, 60, 65],
      [27, 36, 45],
      [28, 45, 53],
      [28, 96, 100],
      [30, 40, 50],
      [30, 72, 78],
      [32, 60, 68],
      [33, 44, 55],
      [33, 56, 65],
      [35, 84, 91],
      [36, 48, 60],
      [36, 77, 85],
      [39, 52, 65],
      [39, 80, 89],
      [40, 42, 58],
      [40, 75, 85],
      [42, 56, 70],
      [45, 60, 75],
      [48, 55, 73],
      [48, 64, 80],
      [51, 68, 85],
      [54, 72, 90],
      [57, 76, 95],
      [60, 63, 87],
      [60, 80, 100],
      [65, 72, 97],
    ]
    let nomsTriangles: string[] = [] // on mémorise les noms des triangles pour ne pas les redonner
    for (
      let i = 0,
        texte,
        texteCorr,
        a,
        b,
        c,
        A,
        B,
        C,
        nomTriangle,
        triplet,
        ordreDesCotes,
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      if (!context.isAmc) {
        this.autoCorrection[i] = {}

        this.autoCorrection[i].options = { ordered: true, radio: true }
        this.autoCorrection[i].propositions = [
          {
            texte: 'Oui',
            statut: false,
          },
          {
            texte: 'Non',
            statut: false,
          },
        ]
      }
      if (i % 4 === 0) nomsTriangles = ['QD'] // toutes les 4 question on peut à nouveau choisir les mêms sauf Q et D (problème clavier mathLive)
      nomTriangle = creerNomDePolygone(3, nomsTriangles)
      nomsTriangles.push(nomTriangle)
      A = nomTriangle[0]
      B = nomTriangle[1]
      C = nomTriangle[2]
      triplet = choice(listeTripletsPythagoriciens)
      enleveElement(listeTripletsPythagoriciens, triplet) // Supprime le triplet pour les prochaines questions
      a = triplet[0]
      b = triplet[1]
      c = triplet[2]
      if (listeTypeDeQuestions[i] === 'pas_rectangle') {
        c = randint(Math.max(c - 3, b + 1), c + 3) // on modifie c en faisant attention à ce qu'il reste plus grand que b
        let [c1, c2, c3] = [a, b, c].sort((a, b) => a - b)
        let cptWhile = 0
        while (
          (a ** 2 + b ** 2 === c ** 2 || c3 >= c1 + c2) &&
          cptWhile++ < 50
        ) {
          // si par hasard (est-ce possible ?) on retombe sur un triplet pythagoricien on change les valeurs
          // ou si le triangle n'est pas constructible
          c = randint(Math.max(c - 3, b + 1), c + 3) // on modifie c en faisant attention à ce qu'il reste plus grand que b
          ;[c1, c2, c3] = [a, b, c].sort((a, b) => a - b)
        }
      }
      if (a > 9 && choice([true, true, true, false])) {
        // le plus souvent on utilise des décimaux
        a = arrondi(a / 10, 1)
        b = arrondi(b / 10, 1)
        c = arrondi(c / 10, 1)
      }
      ordreDesCotes = randint(1, 3)
      switch (ordreDesCotes) {
        case 1:
          texte = `Le triangle $${nomTriangle}$ est tel que $${
            A + B
          }=${texNombre(c)}\\text{ cm}$, $${A + C}=${texNombre(b)}\\text{ cm}$ et $${
            B + C
          }=${texNombre(a)}\\text{ cm}$.`
          break
        case 2:
          texte = `Le triangle $${nomTriangle}$ est tel que $${
            B + C
          }=${texNombre(a)}\\text{ cm}$, $${A + C}=${texNombre(b)}\\text{ cm}$ et $${
            A + B
          }=${texNombre(c)}\\text{ cm}$.`
          break
        case 3:
        default:
          texte = `Le triangle $${nomTriangle}$ est tel que $${
            A + C
          }=${texNombre(b)}\\text{ cm}$, $${A + B}=${texNombre(c)}\\text{ cm}$, et $${
            B + C
          }=${texNombre(a)}\\text{ cm}$.`
          break
      }
      texte += '<br>Ce triangle est-il rectangle ?'
      texteCorr = `Dans le triangle $${nomTriangle}$, le plus grand côté est $[${
        A + B
      }]$.`
      texteCorr += `<br>$${A + B}^2=${texNombre(c)}^2=${texNombre(c ** 2)}$`
      texteCorr += `<br>$${A + C}^2+${B + C}^2=${texNombre(b)}^2+${texNombre(a)}^2=${texNombre(b ** 2)}+${texNombre(a ** 2)}=${texNombre(b ** 2 + a ** 2)}$`
      if (listeTypeDeQuestions[i] === 'rectangle') {
        if (!context.isAmc)
          this.autoCorrection[i].propositions![0].statut = true
        texteCorr += `<br>On constate que $${A + B}^2=${A + C}^2+${
          B + C
        }^2$, l'égalité de Pythagore est vérifiée.<br> D'après la réciproque du théorème de Pythagore, le triangle $${nomTriangle}$ ${texteEnCouleurEtGras('est rectangle')} en $${C}$.`
      } else {
        if (!context.isAmc)
          this.autoCorrection[i].propositions![1].statut = true
        texteCorr += `<br>On constate que $${A + B}^2\\not=${A + C}^2+${
          B + C
        }^2$, l'égalité de Pythagore n'est pas vérifiée.<br> D'après ${this.sup2 ? 'la contraposée du' : 'le'} théorème de Pythagore, le triangle $${nomTriangle}$ ${texteEnCouleurEtGras("n'est pas rectangle")}.`
      }
      if (context.isAmc) {
        this.autoCorrectionAMC[i] = {
          enonce: '',
          enonceAvant: false,
          propositions: [
            {
              type: 'AMCOpen',
              propositions: [
                {
                  texte: texteCorr,
                  enonce: '<br>' + texte + '<br>',
                  statut: 4,
                  feedback: ' ',
                },
              ],
            },
          ],
        }
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      } else {
        this.autoCorrection[i].enonce = texte
        this.autoCorrection[i].propositions![0].feedback = texteCorr
        this.autoCorrection[i].propositions![1].feedback = texteCorr
      }
      const props = propositionsQcm(this, i)
      if (this.interactif) {
        texte += props.texte
      }
      if (this.questionJamaisPosee(i, a, b, c)) {
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
