import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { Droite, droite } from '../../lib/2d/droites'
import { grille } from '../../lib/2d/Grille'
import { pointAbstrait, PointAbstrait } from '../../lib/2d/PointAbstrait'
import { Polygone, polygone } from '../../lib/2d/polygones'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { texteParPointEchelle } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import {
  homothetie,
  rotation,
  symetrieAxiale,
  translation,
} from '../../lib/2d/transformations'
import { milieu } from '../../lib/2d/utilitairesPoint'
import { vecteur, type Vecteur } from '../../lib/2d/Vecteur'
import { vide2d, Vide2d } from '../../lib/2d/Vide2d'
import { bleuMathalea } from '../../lib/colors'
import { choixDeroulant } from '../../lib/customElements/ListeDeroulanteElement'
import { texcolors } from '../../lib/format/style'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import {
  choice,
  combinaisonListes,
  shuffle,
  shuffle3tableaux,
} from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { lettreDepuisChiffre, numAlpha, sp } from '../../lib/outils/outilString'
import {
  RotationAnimee,
  rotationAnimee,
  SymetrieAnimee,
  symetrieAnimee,
  TranslationAnimee,
  translationAnimee,
} from '../../modules/2dAnimation'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  contraindreValeur,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'

export const dateDePublication = '3/12/2021'
export const dateDeModifImportante = '25/11/2025'
export const titre = 'Trouver la transformation'
export const interactifReady = true

export const uuid = '8ac93'

export const refs = {
  'fr-fr': ['4G12-1'],
  'fr-ch': ['9R1ES4F-3', '9R2ES4F-3', '9R3ES4F-3', '10CTES2B-5', '10LCES2B-5', '10LSES2B-5', 'PRQES03A-1'],
}

const motifs = [
  polygone([
    pointAbstrait(1, 1),
    pointAbstrait(2, 1),
    pointAbstrait(2, 4),
    pointAbstrait(6, 4),
    pointAbstrait(6, 5),
    pointAbstrait(3, 5),
    pointAbstrait(3, 6),
    pointAbstrait(1, 6),
  ]),
  polygone([
    pointAbstrait(1, 1),
    pointAbstrait(3, 1),
    pointAbstrait(3, 4),
    pointAbstrait(6, 4),
    pointAbstrait(6, 6),
    pointAbstrait(3, 6),
    pointAbstrait(3, 5),
    pointAbstrait(1, 5),
  ]),
  polygone([
    pointAbstrait(2, 1),
    pointAbstrait(3, 1),
    pointAbstrait(3, 3),
    pointAbstrait(4, 3),
    pointAbstrait(4, 4),
    pointAbstrait(3, 4),
    pointAbstrait(3, 5),
    pointAbstrait(5, 5),
    pointAbstrait(5, 6),
    pointAbstrait(2, 6),
    pointAbstrait(2, 4),
    pointAbstrait(1, 4),
    pointAbstrait(1, 3),
    pointAbstrait(2, 3),
  ]),
  polygone([
    pointAbstrait(1, 1),
    pointAbstrait(4, 1),
    pointAbstrait(4, 2),
    pointAbstrait(5, 2),
    pointAbstrait(5, 4),
    pointAbstrait(4, 4),
    pointAbstrait(4, 5),
    pointAbstrait(3, 5),
    pointAbstrait(3, 6),
    pointAbstrait(2, 6),
    pointAbstrait(2, 2),
    pointAbstrait(1, 2),
  ]),
  polygone([
    pointAbstrait(2, 1),
    pointAbstrait(5, 1),
    pointAbstrait(5, 3),
    pointAbstrait(6, 3),
    pointAbstrait(6, 4),
    pointAbstrait(4, 4),
    pointAbstrait(4, 3),
    pointAbstrait(3, 3),
    pointAbstrait(3, 5),
    pointAbstrait(5, 5),
    pointAbstrait(5, 6),
    pointAbstrait(2, 6),
  ]),
  polygone([
    pointAbstrait(1, 1),
    pointAbstrait(5, 1),
    pointAbstrait(5, 2),
    pointAbstrait(2, 2),
    pointAbstrait(2, 3),
    pointAbstrait(3, 3),
    pointAbstrait(3, 4),
    pointAbstrait(2, 4),
    pointAbstrait(2, 5),
    pointAbstrait(4, 5),
    pointAbstrait(4, 6),
    pointAbstrait(1, 6),
  ]),
  polygone([
    pointAbstrait(2, 6),
    pointAbstrait(2, 1),
    pointAbstrait(5, 1),
    pointAbstrait(5, 2),
    pointAbstrait(3, 2),
    pointAbstrait(3, 6),
  ]),
  polygone([
    pointAbstrait(2, 6),
    pointAbstrait(5, 6),
    pointAbstrait(5, 5),
    pointAbstrait(4, 5),
    pointAbstrait(4, 1),
    pointAbstrait(1, 1),
    pointAbstrait(1, 2),
    pointAbstrait(3, 2),
    pointAbstrait(3, 5),
    pointAbstrait(2, 5),
  ]),
  polygone([
    pointAbstrait(2, 1),
    pointAbstrait(3, 1),
    pointAbstrait(6, 1),
    pointAbstrait(6, 2),
    pointAbstrait(3, 2),
    pointAbstrait(3, 3),
    pointAbstrait(5, 3),
    pointAbstrait(5, 5),
    pointAbstrait(3, 5),
    pointAbstrait(3, 6),
    pointAbstrait(2, 6),
  ]),
  polygone([
    pointAbstrait(2, 1),
    pointAbstrait(3, 1),
    pointAbstrait(3, 3),
    pointAbstrait(5, 3),
    pointAbstrait(5, 6),
    pointAbstrait(2, 6),
  ]),
  polygone([
    pointAbstrait(2, 1),
    pointAbstrait(2, 6),
    pointAbstrait(5, 6),
    pointAbstrait(5, 3),
    pointAbstrait(3, 3),
    pointAbstrait(5, 1),
    pointAbstrait(4, 1),
    pointAbstrait(3, 2),
    pointAbstrait(3, 1),
  ]),
  polygone([
    pointAbstrait(2, 1),
    pointAbstrait(6, 1),
    pointAbstrait(6, 4),
    pointAbstrait(3, 4),
    pointAbstrait(3, 5),
    pointAbstrait(5, 5),
    pointAbstrait(5, 6),
    pointAbstrait(2, 6),
    pointAbstrait(2, 3),
    pointAbstrait(5, 3),
    pointAbstrait(5, 2),
    pointAbstrait(2, 2),
  ]),
  polygone([
    pointAbstrait(2, 1),
    pointAbstrait(4, 1),
    pointAbstrait(5, 2),
    pointAbstrait(5, 1),
    pointAbstrait(6, 1),
    pointAbstrait(6, 6),
    pointAbstrait(5, 6),
    pointAbstrait(5, 3),
    pointAbstrait(4, 2),
    pointAbstrait(3, 2),
    pointAbstrait(3, 6),
    pointAbstrait(2, 6),
  ]),
  polygone([
    pointAbstrait(1, 6),
    pointAbstrait(2, 6),
    pointAbstrait(4, 3),
    pointAbstrait(5, 5),
    pointAbstrait(6, 5),
    pointAbstrait(4, 1),
    pointAbstrait(3, 1),
  ]),
  polygone([
    pointAbstrait(2, 6),
    pointAbstrait(3, 6),
    pointAbstrait(4, 4),
    pointAbstrait(5, 6),
    pointAbstrait(6, 6),
    pointAbstrait(3, 1),
    pointAbstrait(2, 1),
    pointAbstrait(3, 3),
  ]),
  polygone([
    pointAbstrait(1, 1),
    pointAbstrait(6, 1),
    pointAbstrait(6, 2),
    pointAbstrait(3, 5),
    pointAbstrait(5, 5),
    pointAbstrait(5, 6),
    pointAbstrait(1, 6),
    pointAbstrait(5, 2),
    pointAbstrait(1, 2),
  ]),
  polygone([
    pointAbstrait(3, 6),
    pointAbstrait(3, 5),
    pointAbstrait(2, 5),
    pointAbstrait(2, 4),
    pointAbstrait(3, 4),
    pointAbstrait(3, 3),
    pointAbstrait(1, 3),
    pointAbstrait(1, 2),
    pointAbstrait(3, 2),
    pointAbstrait(3, 1),
    pointAbstrait(4, 1),
    pointAbstrait(4, 2),
    pointAbstrait(5, 2),
    pointAbstrait(5, 3),
    pointAbstrait(4, 3),
    pointAbstrait(4, 4),
    pointAbstrait(6, 4),
    pointAbstrait(6, 5),
    pointAbstrait(4, 5),
    pointAbstrait(4, 6),
  ]),
  polygone([
    pointAbstrait(2, 1),
    pointAbstrait(3, 3),
    pointAbstrait(2, 3),
    pointAbstrait(2, 4),
    pointAbstrait(6, 4),
    pointAbstrait(6, 3),
    pointAbstrait(5, 3),
    pointAbstrait(5, 1),
    pointAbstrait(4, 1),
    pointAbstrait(4, 3),
    pointAbstrait(3, 1),
  ]),
  polygone([
    pointAbstrait(2, 2),
    pointAbstrait(3, 3),
    pointAbstrait(3, 2),
    pointAbstrait(4, 3),
    pointAbstrait(4, 2),
    pointAbstrait(5, 3),
    pointAbstrait(5, 2),
    pointAbstrait(6, 3),
    pointAbstrait(6, 5),
    pointAbstrait(2, 5),
  ]),
  polygone([
    pointAbstrait(1, 1),
    pointAbstrait(3, 1),
    pointAbstrait(3, 5),
    pointAbstrait(5, 5),
    pointAbstrait(5, 6),
    pointAbstrait(2, 6),
    pointAbstrait(2, 2),
    pointAbstrait(1, 2),
  ]),
  polygone([
    pointAbstrait(1, 1),
    pointAbstrait(6, 1),
    pointAbstrait(6, 2),
    pointAbstrait(4, 2),
    pointAbstrait(4, 4),
    pointAbstrait(5, 4),
    pointAbstrait(5, 5),
    pointAbstrait(1, 5),
    pointAbstrait(1, 4),
    pointAbstrait(3, 4),
    pointAbstrait(3, 2),
    pointAbstrait(1, 2),
  ]),
  polygone([
    pointAbstrait(2, 1),
    pointAbstrait(2, 3),
    pointAbstrait(4, 3),
    pointAbstrait(4, 4),
    pointAbstrait(3, 4),
    pointAbstrait(3, 6),
    pointAbstrait(6, 6),
    pointAbstrait(6, 4),
    pointAbstrait(5, 4),
    pointAbstrait(5, 3),
    pointAbstrait(6, 3),
    pointAbstrait(6, 1),
    pointAbstrait(5, 1),
    pointAbstrait(5, 2),
    pointAbstrait(4, 2),
    pointAbstrait(4, 1),
  ]),
  polygone([
    pointAbstrait(2, 6),
    pointAbstrait(2, 4),
    pointAbstrait(1, 4),
    pointAbstrait(1, 2),
    pointAbstrait(2, 2),
    pointAbstrait(2, 1),
    pointAbstrait(3, 1),
    pointAbstrait(3, 3),
    pointAbstrait(5, 3),
    pointAbstrait(5, 4),
    pointAbstrait(4, 4),
    pointAbstrait(4, 5),
    pointAbstrait(3, 5),
    pointAbstrait(3, 6),
  ]),
  polygone([
    pointAbstrait(1, 3),
    pointAbstrait(1, 1),
    pointAbstrait(3, 1),
    pointAbstrait(3, 2),
    pointAbstrait(6, 2),
    pointAbstrait(6, 5),
    pointAbstrait(3, 5),
    pointAbstrait(3, 3),
  ]),
  polygone([
    pointAbstrait(2, 1),
    pointAbstrait(2, 2),
    pointAbstrait(1, 2),
    pointAbstrait(1, 4),
    pointAbstrait(2, 4),
    pointAbstrait(2, 3),
    pointAbstrait(3, 3),
    pointAbstrait(3, 2),
    pointAbstrait(4, 2),
    pointAbstrait(4, 4),
    pointAbstrait(3, 4),
    pointAbstrait(3, 6),
    pointAbstrait(6, 6),
    pointAbstrait(6, 4),
    pointAbstrait(5, 4),
    pointAbstrait(5, 3),
    pointAbstrait(6, 3),
    pointAbstrait(6, 1),
  ]),
  polygone([
    pointAbstrait(3, 1),
    pointAbstrait(3, 2),
    pointAbstrait(1, 2),
    pointAbstrait(1, 3),
    pointAbstrait(2, 3),
    pointAbstrait(2, 4),
    pointAbstrait(3, 4),
    pointAbstrait(3, 5),
    pointAbstrait(5, 5),
    pointAbstrait(5, 4),
    pointAbstrait(6, 4),
    pointAbstrait(6, 3),
    pointAbstrait(5, 3),
    pointAbstrait(5, 2),
    pointAbstrait(4, 2),
    pointAbstrait(4, 1),
  ]),
]
const noeuds: PointAbstrait[] = []
const labels = []
for (let i = 0; i < 6; i++) {
  for (let j = 0; j < 6; j++) {
    labels[i * 6 + j] =
      i * 6 + j < 26
        ? lettreDepuisChiffre(i * 6 + j + 1)
        : lettreDepuisChiffre(((i * 6 + j) % 26) + 1) + "'"
    noeuds[i * 6 + j] = pointAbstrait(
      i * 3.2,
      j * 3.2,
      labels[i * 6 + j],
      'above right',
    )
  }
}

// Construite à chaque génération : un tableau partagé par le module
// accumulerait les numéros des dalles d'une génération à l'autre.
function grilleDeBase(): NestedObjetMathalea2dArray {
  const maGrille: NestedObjetMathalea2dArray = [
    grille(0, 0, 16, 16, 'black', 0.2, 0.4),
  ]
  for (let i = 0; i < 6; i++) {
    maGrille.push(segment(i * 3.2, 0, i * 3.2, 16))
    maGrille.push(segment(0, i * 3.2, 16, i * 3.2))
    for (let j = 0; j < 6; j++) {
      maGrille.push(tracePoint(noeuds[i * 6 + j]))
    }
  }
  return maGrille
}

export function transfoPoly(
  pol: Polygone | Vide2d,
  {
    type = 'symax',
    centre,
    axe,
    vecteur,
    angle = 90,
    sens = true,
  }: {
    type: 'symax' | 'trans' | 'rot90' | 'rot180'
    centre?: PointAbstrait
    axe?: Droite
    vecteur?: Vecteur
    angle?: number
    sens?: boolean
  },
) {
  if (pol instanceof Vide2d) return pol
  switch (
    type // type est l'une des chaines suivantes 'symax', 'trans', 'rot90', 'rot180'
  ) {
    case 'symax':
      if (axe != null) return symetrieAxiale(pol, axe)
      break
    case 'trans':
      if (vecteur != null) return translation(pol, vecteur)
      break
    case 'rot90':
      if (centre != null) return rotation(pol, centre, sens ? angle : -angle)
      break
    case 'rot180':
      if (centre != null) return rotation(pol, centre, 180)
      break
    default:
      return pol
  }
  return pol
}

// type est le type de transformation (voir ci-dessus)
// depart est le N° de la figure de départ, arrivee celui de la figure d'arrivée
// leSens = true pour rotation de sens direct
// num est un nombre pour définir la couleur de l'élément de départ et celui d'arrivée.
// poly1 est le polygone de départ (utilisé pour réaliser l'animation)
function definitElements(
  type: 'symax' | 'trans' | 'rot90' | 'rot180',
  depart: number,
  arrivee: number,
  leSens = true,
  num = 0,
  poly1: Polygone,
): {
  texte: string
  axe?: Droite
  centre?: PointAbstrait
  sens?: boolean
  texteCorr: string
  texteInteractif: string
  animation?: TranslationAnimee | RotationAnimee | SymetrieAnimee | Vide2d
  vecteur?: Vecteur
  depart: number
  arrivee: number
  type: 'symax' | 'trans' | 'rot90' | 'rot180'
} {
  let texte, texteCorr, texteInteractif, animation, axe, centre, vector
  const Est = arrivee - depart === 6 // si on va vers la droite il y a 6 numéros d'écart entre arrivée et départ sinon, c'est 1 (vers le haut)
  switch (type) {
    case 'symax': // vers l'est la droite est définie par arrivee et arrivee+1 sinon c'est arrivee et arrivee+6
      texteCorr = `La figure ${texteEnCouleurEtGras(`$\\mathbf{${depart}}$`, texcolors(num + 8))} a pour image la figure ${texteEnCouleurEtGras(`$\\mathbf{${arrivee}}$`, texcolors(num + 9))} par ${texteEnCouleurEtGras("la symétrie d'axe ")}$${miseEnEvidence('(' + noeuds[arrivee].nom + (Est ? noeuds[arrivee + 1].nom : noeuds[arrivee + 6].nom) + ')')}$.`
      texte = `La figure ${sp(1)}\\ldots${sp(1)} a pour image la figure ${sp(1)}\\ldots${sp(1)} par la symétrie d'axe $(${sp(1)}\\ldots${sp(1)})$.`
      texteInteractif = `la symétrie d'axe (${noeuds[arrivee].nom}${Est ? noeuds[arrivee + 1].nom : noeuds[arrivee + 6].nom})`
      axe = Est
        ? droite(noeuds[arrivee], noeuds[arrivee + 1])
        : droite(noeuds[arrivee], noeuds[arrivee + 6])
      if (poly1 != null) {
        animation = symetrieAnimee(
          poly1,
          axe,
          'begin="0s" dur="5s" repeatCount="indefinite"',
        )
      } else animation = vide2d()
      if (context.isHtml)
        return {
          animation,
          depart,
          arrivee,
          texte,
          texteCorr,
          texteInteractif,
          type,
          axe,
        }
      else
        return { depart, arrivee, texte, texteCorr, texteInteractif, type, axe }
    case 'trans': // facile pour la translation : depart->arrivee
      texteCorr = `La figure ${texteEnCouleurEtGras(`$\\mathbf{${depart}}$`, texcolors(num + 8))} a pour image la figure ${texteEnCouleurEtGras(`$\\mathbf{${arrivee}}$`, texcolors(num + 9))} par ${texteEnCouleurEtGras(`la translation transformant $${noeuds[depart].nom}$ en $${noeuds[arrivee].nom}$`)}.`
      texte = `La figure ${sp(1)}\\ldots${sp(1)} a pour image la figure ${sp(1)}\\ldots${sp(1)} par la translation transformant ${sp(1)}\\ldots${sp(1)} en ${sp(1)}\\ldots${sp(1)}.`
      texteInteractif = `la translation transformant ${noeuds[depart].nom} en ${noeuds[arrivee].nom}`
      vector = vecteur(noeuds[depart], noeuds[arrivee])
      if (poly1 != null) {
        animation = translationAnimee(
          [poly1],
          vector,
          'begin="0s" dur="5s" repeatCount="indefinite"',
        )
      } else animation = vide2d()
      if (context.isHtml) {
        return {
          animation,
          depart,
          arrivee,
          texte,
          texteCorr,
          texteInteractif,
          type,
          vecteur: vector,
        }
      } else {
        return {
          depart,
          arrivee,
          texte,
          texteCorr,
          texteInteractif,
          type,
          vecteur: vector,
        }
      }
    case 'rot90': // la position du centre dépend du sens de rotation et de départ et arrivee.
      texteCorr = `La figure ${texteEnCouleurEtGras(`$\\mathbf{${depart}}$`, texcolors(num + 8))} a pour image la figure ${texteEnCouleurEtGras(`$\\mathbf{${arrivee}}$`, texcolors(num + 9))} par ${texteEnCouleurEtGras(`la rotation de centre $${Est ? (leSens ? noeuds[arrivee + 1].nom : noeuds[arrivee].nom) : leSens ? noeuds[arrivee].nom : noeuds[arrivee + 6].nom}$, d'angle $90^\\circ$ dans le sens ${leSens ? "inverse des aiguilles d'une montre" : "des aiguilles d'une montre"}`)}.`
      texte = `La figure ${sp(1)}\\ldots${sp(1)} a pour image la figure ${sp(1)}\\ldots${sp(1)} par la rotation de centre ${sp(1)}\\ldots${sp(1)}, d'angle $90^\\circ$ dans le sens  ${leSens ? "inverse des aiguilles d'une montre" : "des aiguilles d'une montre"}.`
      texteInteractif = `la rotation de centre ${Est ? (leSens ? noeuds[arrivee + 1].nom : noeuds[arrivee].nom) : leSens ? noeuds[arrivee].nom : noeuds[arrivee + 6].nom}, d'angle 90° dans le sens ${leSens ? "inverse des aiguilles d'une montre" : "des aiguilles d'une montre"}`
      centre = Est
        ? leSens
          ? noeuds[arrivee + 1]
          : noeuds[arrivee]
        : leSens
          ? noeuds[arrivee]
          : noeuds[arrivee + 6]
      if (poly1 != null) {
        animation = rotationAnimee(
          [poly1],
          centre,
          leSens ? 90 : -90,
          'begin="0s" dur="5s" repeatCount="indefinite"',
        )
      } else animation = vide2d()
      if (context.isHtml)
        return {
          animation,
          depart,
          arrivee,
          texte,
          texteCorr,
          texteInteractif,
          type,
          centre,
          sens: leSens,
        }
      else
        return {
          depart,
          arrivee,
          texte,
          texteCorr,
          texteInteractif,
          type,
          centre,
          sens: leSens,
        }
    case 'rot180': // pas besoin du sens, mais le milieu choisit dépend de depart et arrivee
      texteCorr = `La figure ${texteEnCouleurEtGras(`$\\mathbf{${depart}}$`, texcolors(num + 8))} a pour image la figure ${texteEnCouleurEtGras(`$\\mathbf{${arrivee}}$`, texcolors(num + 9))} par ${texteEnCouleurEtGras('la symétrie dont le centre est le milieu de ')}$${miseEnEvidence('[' + noeuds[arrivee].nom + (Est ? noeuds[arrivee + 1].nom : noeuds[arrivee + 6].nom) + ']')}$.`
      texte = `La figure ${sp(1)}\\ldots${sp(1)} a pour image la figure ${sp(1)}\\ldots${sp(1)} par la symétrie dont le centre est le milieu de $[${sp(1)}\\ldots${sp(1)}]$.`
      texteInteractif = `la symétrie dont le centre est le milieu de [${noeuds[arrivee].nom}${Est ? noeuds[arrivee + 1].nom : noeuds[arrivee + 6].nom}]`
      centre = milieu(
        noeuds[arrivee],
        Est ? noeuds[arrivee + 1] : noeuds[arrivee + 6],
      )
      if (poly1 != null) {
        animation = rotationAnimee(
          [poly1],
          centre,
          180,
          'begin="0s" dur="5s" repeatCount="indefinite"',
        )
      } else animation = vide2d()
      if (context.isHtml)
        return {
          animation,
          depart,
          arrivee,
          texte,
          texteCorr,
          texteInteractif,
          type,
          centre,
        }
      else
        return {
          depart,
          arrivee,
          texte,
          texteCorr,
          texteInteractif,
          type,
          centre,
        }
  }
}
/**
 * @author Jean-claude Lhote
 */
export default class TrouverLaTransformation extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Types de transformations possibles',
      3,
      '1 : Symétries axiales et centrales\n2 : Symétries et translations\n3 : Symétries, translations et quarts de tour',
    ]
    this.besoinFormulaire2Texte = [
      'Nombre de transformations par grille',
      'Choix entre 1 et 4',
    ]

    this.nbQuestions = 1
    this.spacing = 1.5
    this.sup = 3
    this.sup2 = 3
  }

  nouvelleVersion() {
    let typeDeTransfos: ('symax' | 'trans' | 'rot90' | 'rot180')[]
    const A = pointAbstrait(0, 0)

    this.sup = contraindreValeur(1, 3, this.sup, 3)
    this.sup2 = contraindreValeur(1, 4, isNaN(this.sup2) ? 3 : this.sup2, 3)
    const nbSousQuestions = this.sup2

    if (this.sup === 1) typeDeTransfos = ['symax', 'rot180']
    else if (this.sup === 2) typeDeTransfos = ['symax', 'trans', 'rot180']
    else typeDeTransfos = ['symax', 'trans', 'rot90', 'rot180']
    typeDeTransfos = combinaisonListes(typeDeTransfos, 4)

    for (
      let i = 0, texte, texteCorr, trans, cpt = 0;
      i < this.nbQuestions && cpt < 50;
      i++
    ) {
      const objetsEnonce: NestedObjetMathalea2dArray = []
      const objetsCorrection: NestedObjetMathalea2dArray = []
      const polys: (Polygone | Vide2d)[] = []
      type transformations = {
        texte: string
        axe?: Droite
        centre?: PointAbstrait
        sens?: boolean
        texteCorr: string
        texteInteractif: string
        animation?: TranslationAnimee | RotationAnimee | SymetrieAnimee | Vide2d
        vecteur?: Vecteur
        depart: number
        arrivee: number
        type: 'symax' | 'trans' | 'rot90' | 'rot180'
      }
      const transfos: transformations[] = []
      polys[0] = homothetie(choice(motifs), A, 0.4)
      for (let x = 0; x < 5; x++) {
        for (let y = 0, dalle, transfoAlea; y < 5; y++) {
          let elements: {
            texte: string
            axe?: Droite
            centre?: PointAbstrait
            sens?: boolean
            texteCorr: string
            texteInteractif: string
            animation?:
              TranslationAnimee | RotationAnimee | SymetrieAnimee | Vide2d
            vecteur?: Vecteur
            depart: number
            arrivee: number
            type: 'symax' | 'trans' | 'rot90' | 'rot180'
          }
          if (x + y > 0) {
            dalle = x * 6 + y
            transfoAlea = choice(typeDeTransfos)
            if (y > 0) {
              elements = definitElements(
                transfoAlea,
                dalle - 1,
                dalle,
                choice([true, false]),
                0,
                polys[dalle - 1] as Polygone,
              )
              polys[dalle] = transfoPoly(polys[dalle - 1], elements)
              if (y === 4) polys[dalle + 1] = vide2d()
            } else {
              elements = definitElements(
                transfoAlea,
                dalle - 6,
                dalle,
                choice([true, false]),
                0,
                polys[dalle - 6] as Polygone,
              )
              polys[dalle] = transfoPoly(polys[dalle - 6], elements)
            }
          }
        }
      }
      const depart = []
      const arrivee = []
      depart[0] = randint(0, 3)
      arrivee[0] = depart[0] + (choice([true, false]) ? 1 : 6)
      let choixTransfo = typeDeTransfos[0]
      let choixSens = choice([true, false])
      transfos[0] = definitElements(
        choixTransfo,
        depart[0],
        arrivee[0],
        choixSens,
        12,
        polys[depart[0]] as Polygone,
      )
      polys[arrivee[0]] = transfoPoly(polys[depart[0]], transfos[0])
      let choixArrivee = []
      for (let ee = 1; ee < 4; ee++) {
        depart[ee] = choice([ee * 6, ee * 6 + 1, ee * 6 + 2, ee * 6 + 3])
        choixArrivee = shuffle([1, 6])
        arrivee[ee] = arrivee.includes(depart[ee] + choixArrivee[0])
          ? depart[ee] + choixArrivee[1]
          : depart[ee] + choixArrivee[0]
        choixTransfo = typeDeTransfos[ee]
        choixSens = choice([true, false])
        transfos[ee] = definitElements(
          choixTransfo,
          depart[ee],
          arrivee[ee],
          choixSens,
          12,
          polys[depart[ee]] as Polygone,
        )
        polys[arrivee[ee]] = transfoPoly(polys[depart[ee]], transfos[ee])
      }

      const maGrille = grilleDeBase()
      for (let x = 0; x < 5; x++) {
        for (let y = 0, numero; y < 5; y++) {
          numero = texteParPointEchelle(
            Number(x * 6 + y).toString(),
            pointAbstrait(x * 3.2 + 1.6, y * 3.2 + 1.6),
            0,
            context.isHtml ? 'yellow' : 'black',
            1.2,
            'milieu',
            true,
            0.4,
          )
          numero.contour = context.isHtml
          numero.couleurDeRemplissage = colorToLatexOrHTML('black')
          numero.opacite = context.isHtml ? 0.5 : 1
          numero.opaciteDeRemplissage = 1
          maGrille.push(numero)
          polys[x * 6 + y].opacite = 0.7
          polys[x * 6 + y].color = colorToLatexOrHTML(bleuMathalea)
        }
      }
      objetsEnonce.push(...polys)
      objetsCorrection.push(...polys)
      objetsCorrection.push(...maGrille)
      objetsEnonce.push(...maGrille)
      for (let x = 0; x < 6; x++) {
        for (let y = 0, label; y < 6; y++) {
          label = texteParPointEchelle(
            noeuds[x * 6 + y].nom,
            translation(noeuds[x * 6 + y], vecteur(0.3, 0.3)),
            0,
            context.isHtml ? 'red' : 'black',
            1.2,
            'milieu',
            true,
            0.4,
          )
          label.contour = context.isHtml
          label.couleurDeRemplissage = colorToLatexOrHTML('black')
          label.opacite = context.isHtml ? 0.8 : 1
          label.opaciteDeRemplissage = 1
          objetsEnonce.push(label)
          objetsCorrection.push(label)
        }
      }

      const paramsEnonce = {
        xmin: -0.5,
        ymin: -0.5,
        xmax: 17,
        ymax: 16.5,
        pixelsParCm: 20,
        scale: 0.6,
      }
      const paramsCorrection = {
        xmin: -0.5,
        ymin: -0.5,
        xmax: 17,
        ymax: 16.5,
        pixelsParCm: 20,
        scale: 0.6,
      }

      const textePossible = []
      const texteCorrPossible = []
      const reponsePossible = []
      const propositions: (
        { latex: string; value: string } | { label: string; value: string }
      )[][] = []
      const objetEnonce = []
      for (let k = 0; k < 4; k++) {
        // On va mettre dans les propositions toutes les transformations possibles pour passer de transfo|k].depart à transfo[k].arrivee
        propositions[k] = []
        for (const transforme of [...new Set(typeDeTransfos)]) {
          switch (transforme) {
            case 'rot90':
              {
                trans = definitElements(
                  'rot90',
                  transfos[k].depart,
                  transfos[k].arrivee,
                  false,
                  12,
                  polys[transfos[k].depart] as Polygone,
                )
                let centre = trans.centre
                if (centre == null) break
                propositions[k].push({
                  latex: `\\text{la rotation de centre }\\,${centre.nom}\\text{, d'angle }\\,90°~\\text{ dans le sens des aiguilles d'une montre}`,
                  value: `la rotation de centre ${centre.nom}, d'angle 90° dans le sens des aiguilles d'une montre`,
                })
                propositions[k].push({
                  latex: `\\text{la rotation de centre}\\,${centre.nom}\\text{, d'angle }\\,90°~\\text{ dans le sens inverse des aiguilles d'une montre}`,
                  value: `la rotation de centre ${centre.nom}, d'angle 90° dans le sens inverse des aiguilles d'une montre`,
                })

                trans = definitElements(
                  'rot90',
                  transfos[k].depart,
                  transfos[k].arrivee,
                  true,
                  12,
                  polys[transfos[k].depart] as Polygone,
                )
                centre = trans.centre
                if (centre == null) break
                propositions[k].push({
                  latex: `\\text{la rotation de centre}\\, ${centre.nom}\\text{, d'angle }\\, 90°~\\text{ dans le sens des aiguilles d'une montre}`,
                  value: `la rotation de centre ${centre.nom}, d'angle 90° dans le sens des aiguilles d'une montre`,
                })
                propositions[k].push({
                  latex: `\\text{la rotation de centre }\\,${centre.nom}\\text{, d'angle }\\,90°~\\text{ dans le sens inverse des aiguilles d'une montre}`,
                  value: `la rotation de centre ${centre.nom}, d'angle 90° dans le sens inverse des aiguilles d'une montre`,
                })
              }
              break
            case 'trans':
              //    trans = definitElements('trans', transfos[k].depart, transfos[k].arrivee, true, 12, polys[transfos[k].depart])
              propositions[k].push({
                latex: `\\text{la translation transformant }\\,${noeuds[transfos[k].depart].nom}\\,\\text{ en }\\,${noeuds[transfos[k].arrivee].nom}`,
                value: `la translation transformant ${noeuds[transfos[k].depart].nom} en ${noeuds[transfos[k].arrivee].nom}`,
              })
              break
            case 'rot180':
              //    trans = definitElements('rot180', transfos[k].depart, transfos[k].arrivee, true, 12, polys[transfos[k].depart])
              propositions[k].push({
                latex: `\\text{la symétrie dont le centre est le milieu de }\\,[${noeuds[transfos[k].arrivee].nom}${transfos[k].arrivee - transfos[k].depart === 6 ? noeuds[transfos[k].arrivee + 1].nom : noeuds[transfos[k].arrivee + 6].nom}]`,
                value: `la symétrie dont le centre est le milieu de [${noeuds[transfos[k].arrivee].nom}${transfos[k].arrivee - transfos[k].depart === 6 ? noeuds[transfos[k].arrivee + 1].nom : noeuds[transfos[k].arrivee + 6].nom}]`,
              })
              break

            case 'symax':
              //    trans = definitElements('symax', transfos[k].depart, transfos[k].arrivee, true, 12, polys[transfos[k].depart])
              propositions[k].push({
                latex: `\\text{la symétrie d'axe }\\,(${noeuds[transfos[k].arrivee].nom}${transfos[k].arrivee - transfos[k].depart === 6 ? noeuds[transfos[k].arrivee + 1].nom : noeuds[transfos[k].arrivee + 6].nom})`,
                value: `la symétrie d'axe (${noeuds[transfos[k].arrivee].nom}${transfos[k].arrivee - transfos[k].depart === 6 ? noeuds[transfos[k].arrivee + 1].nom : noeuds[transfos[k].arrivee + 6].nom})`,
              })
              break
          }
        }
        objetEnonce.push({
          textePossible: `Quelle transformation permet de passer de la figure $${transfos[k].depart}$ à la figure $${transfos[k].arrivee}$ ? `,
          texteCorrPossible: transfos[k].texteCorr,
          reponsePossible: transfos[k].texteInteractif,
        })
        textePossible.push(
          `Quelle transformation permet de passer de la figure $${transfos[k].depart}$ à la figure $${transfos[k].arrivee}$ ? `,
        )
        texteCorrPossible.push(transfos[k].texteCorr)
        reponsePossible.push(transfos[k].texteInteractif)
      }

      function hasConsecutiveDuplicates(transfos: transformations[]) {
        for (let i = 0; i < transfos.length - 1; i++) {
          if (transfos[i].type === transfos[i + 1].type) {
            return true
          }
        }
        return false
      }
      do {
        shuffle3tableaux(objetEnonce, transfos, propositions)
      } while (hasConsecutiveDuplicates(transfos))

      texte = mathalea2d(paramsEnonce, objetsEnonce)
      let texteCorrComplement = ''
      for (let ee = 0; ee < nbSousQuestions; ee++) {
        texte += ee > 0 ? '<br>' : ''
        texte += nbSousQuestions > 1 ? numAlpha(ee) : ''
        propositions[ee].unshift({
          label: 'Choisir une transformation',
          value: '',
        })
        texte +=
          objetEnonce[ee].textePossible +
          choixDeroulant(this, i * nbSousQuestions + ee, {
            choices: propositions[ee],
          })
        texteCorrComplement += ee > 0 ? '<br>' : ''
        texteCorrComplement += nbSousQuestions > 1 ? numAlpha(ee) : ''
        texteCorrComplement += objetEnonce[ee].texteCorrPossible
        const anim = transfos[ee].animation
        if (anim != null) objetsCorrection.push(anim)
        handleAnswers(
          this,
          i * nbSousQuestions + ee,
          { reponse: { value: objetEnonce[ee].reponsePossible } },
          { formatInteractif: 'liste-deroulante' },
        )
      }

      texteCorr =
        mathalea2d(paramsCorrection, objetsCorrection) + texteCorrComplement
      if (this.questionJamaisPosee(i, texte)) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
      }
      listeQuestionsToContenu(this)
      cpt++
    }
  }
}
