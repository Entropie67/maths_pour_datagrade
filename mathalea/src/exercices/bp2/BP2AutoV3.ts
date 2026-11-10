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
export const dateDeModifImportante = '14/09/2026'
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
export const uuid = 'eb45e'

export const refs = {
  'fr-fr': ['BP2AutoV3', 'BP1AUTO100'],
  'fr-2016': ['6M11', 'BP2AutoV3'],
  'fr-ch': ['9R1GM2B-5', '9R2GM2B-5', '9R3GM2B-5'],
}
// Génère une longueur décimale (un seul chiffre après la virgule, jamais
// un ",0" qui ressemblerait à un entier) comprise entre min et max inclus.
function genereLongueurDecimale(min: number, max: number): number {
  let valeurX10 = 0
  do {
    valeurX10 = randint(min * 10, max * 10)
  } while (valeurX10 % 10 === 0)
  return arrondi(valeurX10 / 10, 1)
}

// Génère une longueur, entière si `entier` vaut true, décimale (un chiffre
// après la virgule) sinon.
function genereLongueur(min: number, max: number, entier: boolean): number {
  return entier ? randint(min, max) : genereLongueurDecimale(min, max)
}

// Triplets pythagoriciens (côtés de l'angle droit) à valeurs entières,
// utilisés pour que la longueur de l'hypoténuse affichée sur la figure
// soit toujours une valeur exacte.
const triplesPythagoriciensEntiers: [number, number][] = [
  [3, 4],
  [6, 8],
  [5, 12],
  [9, 12],
  [8, 15],
]

// Triplets pythagoriciens (côtés de l'angle droit) à valeurs décimales
// (un chiffre après la virgule), obtenus en multipliant des triplets
// entiers par un facteur décimal, ce qui garantit que l'hypoténuse reste
// elle aussi une valeur exacte (avec au plus un chiffre après la virgule).
const triplesPythagoriciensDecimaux: [number, number][] = [
  [1.8, 2.4],
  [2.4, 1.8],
  [2.1, 2.8],
  [2.8, 2.1],
  [2.4, 3.2],
  [3.2, 2.4],
  [2.7, 3.6],
  [3.6, 2.7],
  [3.6, 4.8],
  [4.8, 3.6],
  [4.2, 5.6],
  [5.6, 4.2],
  [3.5, 8.4],
  [8.4, 3.5],
  [2.4, 4.5],
  [4.5, 2.4],
]

export default class AireCarresRectanglesTriangles extends Exercice {
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
    this.besoinFormulaire2CaseACocher = ['Seulement des nombres entiers']
    this.sup2 = true
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

    // this.sup2 === true : seulement des nombres entiers (comportement par
    // défaut). this.sup2 === false : des longueurs décimales (un chiffre
    // après la virgule) sont autorisées pour les 3 figures.
    const entier = this.sup2

    const c = genereLongueur(2, 6, entier)
    const L = genereLongueur(2, 5, entier)
    let l = genereLongueur(2, 5, entier)
    while (l === L) {
      l = genereLongueur(2, 5, entier)
    }

    // Triplets pythagoriciens (côtés de l'angle droit) utilisés pour le
    // triangle rectangle, afin que la longueur de l'hypoténuse affichée
    // sur la figure soit toujours une valeur exacte, que les côtés soient
    // entiers ou décimaux.
    const [a, b]: [number, number] = entier
      ? (() => {
          const tripleChoisi =
            triplesPythagoriciensEntiers[
              randint(0, triplesPythagoriciensEntiers.length - 1)
            ]
          // On mélange aléatoirement l'ordre des deux côtés de l'angle
          // droit pour varier l'aspect du triangle (côté a horizontal ou
          // vertical).
          return randint(0, 1) === 0
            ? tripleChoisi
            : [tripleChoisi[1], tripleChoisi[0]]
        })()
      : triplesPythagoriciensDecimaux[
          randint(0, triplesPythagoriciensDecimaux.length - 1)
        ]
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

          texteCorr += `$\\mathcal{A}_{${nom[0] + nom[1] + nom[2] + nom[3]}}=${texNombre(c)}\\text{ cm}\\times${texNombre(c)}\\text{ cm}=${miseEnEvidence(`${texNombre(arrondi(c * c, 2))}\\text{ cm}^2`)}$`
          handleAnswers(
            this,
            i,
            {
              reponse: {
                value: new Grandeur(arrondi(c * c, 2), 'cm^2'),
                options: { unite: true },
              },
            },
            {
              formatInteractif: 'mathlive',
            },
          )
          if (context.isAmc) {
            this.autoCorrectionAMC[i] = {
              enonce: `Calculer l'aire du carré de côté $${texNombre(c)}\\text{ cm}$ en $\\text{cm}^2$`,
              propositions: [{ texte: texteCorr, statut: 0 }],
              reponse: {
                texte: 'Aire en cm\\up{2}',
                valeur: arrondi(c * c, 2),
                param: {
                  digits: 2,
                  decimals: entier ? 0 : 2,
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
          texteCorr += `$\\mathcal{A}_{${nom[4] + nom[5] + nom[6] + nom[7]}}=${texNombre(L)}\\text{ cm}\\times${texNombre(l)}\\text{ cm}=${miseEnEvidence(`${texNombre(arrondi(L * l, 2))}\\text{ cm}^2`)}$`
          handleAnswers(
            this,
            i,
            {
              reponse: {
                value: new Grandeur(arrondi(L * l, 2), 'cm^2'),
                options: { unite: true },
              },
            },
            {
              formatInteractif: 'mathlive',
            },
          )
          if (context.isAmc) {
            this.autoCorrectionAMC[i] = {
              enonce: `Calculer l'aire du rectangle de longueur $${texNombre(L)}\\text{ cm}$ et de largeur $${texNombre(l)}\\text{ cm}$ en $\\text{cm}^2$`,
              propositions: [{ texte: texteCorr, statut: 0 }],
              reponse: {
                texte: 'Aire en cm\\up{2}',
                valeur: arrondi(L * l, 2),
                param: {
                  digits: 2,
                  decimals: entier ? 0 : 2,
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
          texteCorr += `$\\mathcal{A}_{${nom[8] + nom[9] + nom[10]}}=${texNombre(a)}\\text{ cm}\\times${texNombre(b)}\\text{ cm}\\div2=${miseEnEvidence(`${texNombre(arrondi((a * b) / 2, 2))}\\text{ cm}^2`)}$`
          handleAnswers(
            this,
            i,
            {
              reponse: {
                value: new Grandeur(arrondi((a * b) / 2, 2), 'cm^2'),
                options: { unite: true },
              },
            },
            {
              formatInteractif: 'mathlive',
            },
          )
          if (context.isAmc) {
            this.autoCorrectionAMC[i] = {
              enonce: `Calculer l'aire du triangle rectangle dont les côtés de l'angle droit mesurent $${texNombre(a)}\\text{ cm}$ et $${texNombre(b)}\\text{ cm}$ en $\\text{cm}^2$`,
              propositions: [{ texte: texteCorr, statut: 0 }],
              reponse: {
                texte: 'Aire en cm\\up{2}',
                valeur: arrondi((a * b) / 2, 2),
                param: {
                  digits: 2,
                  decimals: entier ? 0 : 2,
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
