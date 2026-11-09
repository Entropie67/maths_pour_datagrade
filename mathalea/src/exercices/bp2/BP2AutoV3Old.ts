import { afficheLongueurSegment } from '../../lib/2d/afficheLongueurSegment'
import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { codageSegments } from '../../lib/2d/CodageSegment'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygoneAvecNom } from '../../lib/2d/polygones'
import { rotation, similitude, translation } from '../../lib/2d/transformations'
import { pointAdistance } from '../../lib/2d/utilitairesPoint'
import { vecteur } from '../../lib/2d/Vecteur'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { enleveDoublonNum } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { creerNomDePolygone } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import Grandeur from '../../modules/Grandeur'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Calculer l'aire de carré, rectangle ou triangle rectangle"
export const dateDeModifImportante = '24/04/2025'
export const amcReady = true
export const amcType = 'AMCNum'

export const interactifReady = true

/**
 * Un carré, un rectangle et un triangle rectangle sont tracés.
 *
 * Il faut calculer les aires
 *
 * @author Rémi Angot

 */
export const uuid = 'eb45a'

export const refs = {
  'fr-fr': [],
  'fr-2016': [],
  'fr-ch': [],
}
export default class AireCarresRectanglesTrianglesOld extends Exercice {
  constructor() {
    super()

    this.amcReady = amcReady
    this.amcType = amcType
    this.interactif = false

    this.spacing = 2

    this.spacingCorr = context.isHtml ? 3 : 2
    this.nbQuestions = 3
    this.nbQuestionsModifiable = false
    this.besoinFormulaireTexte = [
      'Type de figures',
      [
        'Nombres séparés par des tirets  :',
        '1 : Carré',
        '2 : Rectangle',
        '3 : Triangle',
        '4 : Mélange',
      ].join('\n'),
    ]
    this.sup = '4'
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 4,
      shuffle: true,
      nbQuestions: 50,
    }).map(Number)
    enleveDoublonNum(typesDeQuestionsDisponibles)

    this.nbQuestions = typesDeQuestionsDisponibles.length
    let texte = ''
    let texteCorr = ''
    const nom = creerNomDePolygone(11, 'QD')

    const c = randint(2, 6)
    const L = randint(2, 5)
    const l = randint(2, 5, L)
    const a = randint(2, 5)
    const b = randint(2, 5)
    const A = pointAbstrait(0, 0, nom[0])
    const B = rotation(pointAbstrait(c, 0), A, randint(-15, 15), nom[1])
    const C = rotation(A, B, -90, nom[2])
    const D = rotation(B, A, 90, nom[3])
    const carre = polygoneAvecNom(A, B, C, D)
    const E = pointAbstrait(8, 0, nom[4])
    const F = pointAdistance(E, L, randint(-15, 15), nom[5])
    const G = similitude(E, F, -90, l / L, nom[6])
    const H = translation(G, vecteur(F, E), nom[7])
    const rectangle = polygoneAvecNom(E, F, G, H)
    const I = pointAbstrait(15, 0, nom[8])
    const J = pointAdistance(I, a, randint(-25, 25), nom[9])
    const K = similitude(I, J, -90, b / a, nom[10])
    const triangle = polygoneAvecNom(I, J, K)
    const objetsCarre = [
      carre,
      codageAngleDroit(A, B, C),
      codageAngleDroit(A, D, C),
      codageAngleDroit(D, C, B),
      codageAngleDroit(B, A, D),
      codageSegments('//', bleuMathalea, [A, B, C, D]),
      afficheLongueurSegment(B, A),
    ]
    const objetsRectangle = [
      rectangle,
      codageAngleDroit(E, F, G),
      codageAngleDroit(F, G, H),
      codageAngleDroit(G, H, E),
      codageAngleDroit(H, E, F),
      codageSegments('/', 'red', E, F, G, H),
      codageSegments('||', bleuMathalea, F, G, H, E),
      afficheLongueurSegment(F, E),
      afficheLongueurSegment(G, F),
    ]
    const objetsTriangle = [
      triangle,
      codageAngleDroit(I, J, K),
      afficheLongueurSegment(J, I),
      afficheLongueurSegment(K, J),
      afficheLongueurSegment(I, K),
    ]

    for (let i = 0; i < typesDeQuestionsDisponibles.length; i++) {
      let figure: string = ''
      texte = ''
      texteCorr = ''
      switch (typesDeQuestionsDisponibles[i] - 1) {
        case 0:
          figure = mathalea2d(
            Object.assign({}, fixeBordures(objetsCarre)),
            objetsCarre,
          )
          texte = figure + "Calculer l'aire du carré."

          texteCorr += `$\\mathcal{A}_{${nom[0] + nom[1] + nom[2] + nom[3]}}=${c}\\text{ cm}\\times${c}\\text{ cm}=${miseEnEvidence(c * c)}\\text{ cm}^2$`
          handleAnswers(
            this,
            i,
            {
              reponse: {
                value: new Grandeur(c * c, 'cm^2'),
                options: { unite: true },
              },
            },
            {
              formatInteractif: 'mathlive',
            },
          )
          if (context.isAmc) {
            this.autoCorrectionAMC[i] = {
              enonce: `Calculer l'aire du carré de côté $${c}\\text{ cm}$ en $\\text{cm}^2$`,
              propositions: [{ texte: texteCorr, statut: 0 }],
              reponse: {
                texte: 'Aire en cm\\up{2}',
                valeur: c * c,
                param: {
                  digits: 2,
                  decimals: 0,
                  signe: false,
                  exposantNbChiffres: 0,
                  exposantSigne: false,
                  approx: 0,
                },
              },
            }
          }
          break
        case 1:
          figure = mathalea2d(
            Object.assign({}, fixeBordures(objetsRectangle)),
            objetsRectangle,
          )
          texte = figure + "Calculer l'aire du rectangle."
          texteCorr += `$\\mathcal{A}_{${nom[4] + nom[5] + nom[6] + nom[7]}}=${L}\\text{ cm}\\times${l}\\text{ cm}=${miseEnEvidence(L * l)}\\text{ cm}^2$`
          handleAnswers(
            this,
            i,
            {
              reponse: {
                value: new Grandeur(L * l, 'cm^2'),
                options: { unite: true },
              },
            },
            {
              formatInteractif: 'mathlive',
            },
          )
          if (context.isAmc) {
            this.autoCorrectionAMC[i] = {
              enonce: `Calculer l'aire du rectangle de longueur $${L}\\text{ cm}$ et de largeur $${l}\\text{ cm}$ en $\\text{cm}^2$`,
              propositions: [{ texte: texteCorr, statut: 0 }],
              reponse: {
                texte: 'Aire en cm\\up{2}',
                valeur: L * l,
                param: {
                  digits: 2,
                  decimals: 0,
                  signe: false,
                  exposantNbChiffres: 0,
                  exposantSigne: false,
                  approx: 0,
                },
              },
            }
          }
          break
        case 2:
          figure = mathalea2d(
            Object.assign({}, fixeBordures(objetsTriangle)),
            objetsTriangle,
          )
          texte = figure + "Calculer l'aire du triangle rectangle."
          texteCorr += `$\\mathcal{A}_{${nom[8] + nom[9] + nom[10]}}=${a}\\text{ cm}\\times${b}\\text{ cm}\\div2=${miseEnEvidence(texNombre((a * b) / 2))}\\text{ cm}^2$`
          handleAnswers(
            this,
            i,
            {
              reponse: {
                value: new Grandeur(arrondi((a * b) / 2), 'cm^2'),
                options: { unite: true },
              },
            },
            {
              formatInteractif: 'mathlive',
            },
          )
          if (context.isAmc) {
            this.autoCorrectionAMC[i] = {
              enonce: `Calculer l'aire du triangle rectangle dont les côtés de l'angle droit mesurent $${a}\\text{ cm}$ et $${b}\\text{ cm}$ en $\\text{cm}^2$`,
              propositions: [{ texte: texteCorr, statut: 0 }],
              reponse: {
                texte: 'Aire en cm\\up{2}',
                valeur: arrondi((a * b) / 2),
                param: {
                  digits: 2,
                  decimals: 0,
                  signe: false,
                  exposantNbChiffres: 0,
                  exposantSigne: false,
                  approx: 0,
                },
              },
            }
          }
          break
      }
      texte += ajouteChampTexteMathLive(this, i, KeyboardType.aire, {
        texteApres: '<em class="ml-2">(Une unité d\'aire est attendue.)</em>',
      })
      this.listeQuestions.push(texte)
      this.listeCorrections.push(texteCorr)
    }
    listeQuestionsToContenu(this)
  }
}
