import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { Droite, droite } from '../../lib/2d/droites'
import { grille } from '../../lib/2d/Grille'
import { PointAbstrait, pointAbstrait } from '../../lib/2d/PointAbstrait'
import { Polygone, polygone } from '../../lib/2d/polygones'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { texteParPointEchelle } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { homothetie, translation } from '../../lib/2d/transformations'
import { milieu } from '../../lib/2d/utilitairesPoint'
import { vecteur, type Vecteur } from '../../lib/2d/Vecteur'
import { vide2d, type Vide2d } from '../../lib/2d/Vide2d'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { bleuMathalea } from '../../lib/colors'
import { centrage, deuxColonnes } from '../../lib/format/miseEnPage'
import { texcolors } from '../../lib/format/style'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleur,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { lettreDepuisChiffre, sp } from '../../lib/outils/outilString'
import type {
  RotationAnimee,
  SymetrieAnimee,
  TranslationAnimee,
} from '../../modules/2dAnimation'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  contraindreValeur,
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'
import { transfoPoly } from './4G12-1'
import { CHEMINS_PREDEFINIS } from './_4G12-paths'

export const titre = 'Trouver une série de transformations'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCOpen'

export const dateDePublication = '3/12/2021'

/**
 * À partir de la figure 0, l'idée est de trouver un chemin qui mène à la figure 28 par une série
 * de transformations entre deux figures strictement voisines.
 * @author : Jean-claude Lhote (et modifié par Éric Elter)
 */

export const uuid = '4ffdb'

export const refs = {
  'fr-fr': ['4G12'],
  'fr-ch': ['9R1ES4F-2', '9R2ES4F-2', '9R3ES4F-2', '10CTES2B-4', '10LCES2B-4', '10LSES2B-4', 'PRQES03A-3'],
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

function definitElements(
  type: 'symax' | 'trans' | 'rot90' | 'rot180',
  depart: number,
  arrivee: number,
  leSens = true,
  num = 0,
  poly1: Polygone,
) {
  let texte,
    texteCorr,
    texteInteractif,
    axeSymetrie,
    nomDroite,
    nomCentreRotation,
    centreRotation,
    centreSymetrie,
    nomSegment
  const sensProgression =
    arrivee - depart === 6
      ? 'Est'
      : arrivee - depart === -6
        ? 'Ouest'
        : arrivee - depart === 1
          ? 'Nord'
          : 'Sud'
  switch (type) {
    case 'symax': // vers l'est la droite est définie par arrivee et arrivee+1 sinon c'est arrivee et arrivee+6
      switch (sensProgression) {
        case 'Est':
          axeSymetrie = droite(noeuds[arrivee], noeuds[arrivee + 1])
          nomDroite = '(' + noeuds[arrivee].nom + noeuds[arrivee + 1].nom + ')'
          break
        case 'Ouest':
          axeSymetrie = droite(noeuds[depart], noeuds[depart + 1])
          nomDroite = '(' + noeuds[depart].nom + noeuds[depart + 1].nom + ')'
          break
        case 'Nord':
          axeSymetrie = droite(noeuds[arrivee], noeuds[arrivee + 6])
          nomDroite = '(' + noeuds[arrivee].nom + noeuds[arrivee + 6].nom + ')'
          break
        case 'Sud':
          axeSymetrie = droite(noeuds[depart], noeuds[depart + 6])
          nomDroite = '(' + noeuds[depart].nom + noeuds[depart + 6].nom + ')'
          break
      }
      texteCorr = `La figure ${texteEnCouleurEtGras(`$\\mathbf{${depart}}$`, texcolors(num + 11))} a pour image la figure ${texteEnCouleurEtGras(`$\\mathbf{${arrivee}}$`, texcolors(num + 12))} par la symétrie d'axe $${nomDroite}$.`
      texte = `La figure \\ldots${sp()}a pour image la figure${sp(1)}\\ldots${sp(1)}par la symétrie d'axe (${sp(1)}\\ldots${sp(1)})`
      texteInteractif =
        "Une symétrie axiale dont l'axe passe par deux points du quadrillage."
      return {
        texte,
        texteCorr,
        texteInteractif,
        type,
        axe: axeSymetrie,
        depart,
        arrivee,
      }
    case 'trans': // facile pour la translation : depart->arrivee
      texteCorr = `La figure ${texteEnCouleurEtGras(`$\\mathbf{${depart}}$`, texcolors(num + 11))} a pour image la figure ${texteEnCouleurEtGras(`$\\mathbf{${arrivee}}$`, texcolors(num + 12))} par la translation transformant $${noeuds[depart].nom}$ en $${noeuds[arrivee].nom}$.`
      texte = `La figure \\ldots${sp()}a pour image la figure${sp(1)}\\ldots${sp(1)}par la translation transformant${sp(1)}\\ldots${sp(1)}en${sp(1)}\\ldots${sp(1)}`
      texteInteractif =
        'Une translation définie par deux points du quadrillage.'
      return {
        texte,
        texteCorr,
        texteInteractif,
        type,
        vecteur: vecteur(noeuds[depart], noeuds[arrivee]),
        depart,
        arrivee,
      }
    case 'rot90': // la position du centre dépend du sens de rotation et de départ et arrivee.
      switch (sensProgression) {
        case 'Est':
          centreRotation = leSens ? noeuds[arrivee + 1] : noeuds[arrivee]
          nomCentreRotation = leSens
            ? noeuds[arrivee + 1].nom
            : noeuds[arrivee].nom
          break
        case 'Ouest':
          centreRotation = leSens ? noeuds[depart] : noeuds[depart + 1]
          nomCentreRotation = leSens
            ? noeuds[depart].nom
            : noeuds[depart + 1].nom
          break
        case 'Nord':
          centreRotation = leSens ? noeuds[arrivee] : noeuds[arrivee + 6]
          nomCentreRotation = leSens
            ? noeuds[arrivee].nom
            : noeuds[arrivee + 6].nom
          break
        case 'Sud':
          centreRotation = leSens ? noeuds[depart + 6] : noeuds[depart]
          nomCentreRotation = leSens
            ? noeuds[depart + 6].nom
            : noeuds[depart].nom
          break
      }
      texteCorr = `La figure ${texteEnCouleurEtGras(`$\\mathbf{${depart}}$`, texcolors(num + 11))} a pour image la figure ${texteEnCouleurEtGras(`$\\mathbf{${arrivee}}$`, texcolors(num + 12))} par la rotation de centre $${nomCentreRotation}$ d'angle $90^\\circ$ dans le sens ${leSens ? "contraire des aiguilles d'une montre" : "des aiguilles d'une montre"}.`
      texte = `La figure \\ldots${sp()}a pour image la figure${sp(1)}\\ldots${sp(1)}par la rotation de centre${sp(1)}\\ldots${sp(1)}d'angle $90^\\circ$ dans le sens ${leSens ? "contraire des aiguilles d'une montre" : "des aiguilles d'une montre"}`
      texteInteractif =
        "Une rotation d'angle $90^\\circ$ et dont le centre est un point du quadrillage."
      return {
        texte,
        texteCorr,
        texteInteractif,
        type,
        centre: centreRotation,
        sens: leSens,
        depart,
        arrivee,
      }
    case 'rot180': // pas besoin du sens, mais le milieu choisi dépend de depart et arrivee
      switch (sensProgression) {
        case 'Est':
          centreSymetrie = milieu(noeuds[arrivee], noeuds[arrivee + 1])
          nomSegment = '[' + noeuds[arrivee + 1].nom + noeuds[arrivee].nom + ']'
          break
        case 'Ouest':
          centreSymetrie = milieu(noeuds[depart], noeuds[depart + 1])
          nomSegment = '[' + noeuds[depart + 1].nom + noeuds[depart].nom + ']'
          break
        case 'Nord':
          centreSymetrie = milieu(noeuds[arrivee], noeuds[arrivee + 6])
          nomSegment = '[' + noeuds[arrivee + 6].nom + noeuds[arrivee].nom + ']'
          break
        case 'Sud':
          centreSymetrie = milieu(noeuds[depart], noeuds[depart + 6])
          nomSegment = '[' + noeuds[depart + 6].nom + noeuds[depart].nom + ']'
          break
      }
      texteCorr = `La figure ${texteEnCouleurEtGras(`$\\mathbf{${depart}}$`, texcolors(num + 11))} a pour image la figure ${texteEnCouleurEtGras(`$\\mathbf{${arrivee}}$`, texcolors(num + 12))} par la symétrie dont le centre est le milieu de $${nomSegment}$.`
      texte = `La figure \\ldots${sp()}a pour image la figure${sp(1)}\\ldots${sp(1)}par la symétrie dont le centre est le milieu de $[$${sp(1)}\\ldots${sp(1)}$]$`
      texteInteractif =
        "Une symétrie centrale dont le centre est un milieu d'un côté de case."
      return {
        texte,
        texteCorr,
        texteInteractif,
        type,
        centre: centreSymetrie,
        depart,
        arrivee,
      }
  }
}
export default class SerieDeTransformations extends Exercice {
  version: number
  constructor() {
    super()
    this.nbQuestions = 1
    this.besoinFormulaireNumerique = [
      'Types de transformations possibles',
      4,
      '1 : Symétries axiales seulement\n2 : Symétries axiales et centrales\n3 : Symétries et translations\n4 : Symétries, translations et quarts de tour',
    ]
    this.besoinFormulaire2Texte = [
      "Nombre de transformations entre le départ et l'arrivée",
      'Nombres séparés par des tirets(0 pour laisser le hasard choisir)\n8 \n10\n12\n14 \n16',
    ]
    this.besoinFormulaire3CaseACocher = ['Énoncés raccourcis', false]
    this.sup = 4
    this.sup2 = '8-10-12'
    this.sup3 = false
    this.version = 4
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const A = pointAbstrait(0, 0)
    let typeDeTransfos: ('symax' | 'trans' | 'rot90' | 'rot180')[]
    if (this.version === 1) {
      // On bride this.sup à 1 pour les 6èmes
      this.sup = 1
    } else if (this.version === 2) {
      this.sup = 2 // On le bride à 2 pour les 5èmes
    } // on ne bride pas pour ce 4G12 et visiblement, il n'existe pas en 3ème. c'est donc la référence max ici.

    this.sup = contraindreValeur(1, 4, this.sup, 4)
    if (this.sup === 1) typeDeTransfos = ['symax']
    else if (this.sup === 2) typeDeTransfos = ['symax', 'rot180']
    else if (this.sup === 3) typeDeTransfos = ['symax', 'trans', 'rot180']
    else typeDeTransfos = ['symax', 'trans', 'rot90', 'rot180']
    const nbTransfos = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      min: 8,
      max: 16,
      melange: 0,
      nbQuestions: this.nbQuestions,
      defaut: 10,
    })
      .map(Number)
      .map((el) => Math.floor(el / 2) * 2) // on force pair
    for (
      let i = 0,
        cpt = 0,
        texte,
        texteCorr,
        paramsCorrection,
        paramsEnonce,
        leurre0;
      i < this.nbQuestions && cpt < 10;
    ) {
      this.autoCorrectionAMC[i] = {}
      this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      let chemin: number[]

      const polys: (Polygone | Vide2d)[] = []
      const transfos: {
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
      }[] = []
      const unMotif = randint(0, motifs.length - 1)
      polys[0] = homothetie(motifs[unMotif], A, 0.4)
      leurre0 = translation(
        polys[0],
        vecteur(
          ...(choice([
            [0.4, 0],
            [0, 0.4],
            [0.4, 0.4],
          ]) as [number, number]),
        ),
      ) // on translate aléatoirement le motif de départ pour faire le leurre
      for (let x = 0; x < 5; x++) {
        for (let y = 0, dalle, transfoAlea, elements; y < 5; y++) {
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
              polys[dalle] = transfoPoly(
                dalle === 1 ? leurre0 : polys[dalle - 1],
                elements,
              )
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
              polys[dalle] = transfoPoly(
                dalle === 6 ? leurre0 : polys[dalle - 6],
                elements,
              )
            }
          }
        }
      }

      // Construction d'un chemin pour aller de la figure de départ à celle d'arrivée
      chemin = []
      chemin = genererCheminOptimise(nbTransfos[i])
      for (let k = 0; k < chemin.length - 1; k++) {
        transfos[k] = definitElements(
          choice(typeDeTransfos),
          chemin[k],
          chemin[k + 1],
          choice([true, false]),
          k,
          polys[chemin[k]] as Polygone,
        )
        polys[chemin[k + 1]] = transfoPoly(polys[chemin[k]], transfos[k])
      }
      const objetsEnonce: NestedObjetMathalea2dArray = []
      const objetsCorrection: NestedObjetMathalea2dArray = []
      texte = this.interactif
        ? this.sup === 1
          ? 'Compléter la liste des figures successives obtenues avec une suite de symétries axiales.<br>La liste commence par $0$, finit par $28$ et les numéros sont à séparer par des points-virgules.<br>'
          : 'Compléter la liste des figures successives obtenues avec cette suite de transformations.<br>La liste commence par $0$, finit par $28$ et les numéros sont à séparer par des points-virgules.<br>'
        : "On passe de la figure $0$ à la figure $28$ en passant par des cases adjacentes, en suivant les transformations listées dans l'ordre précis des phrases ci-dessous qu'il faut compléter.<br>"
      texteCorr = ''

      const maGrille = grilleDeBase()
      for (let x = 0; x < 5; x++) {
        for (let y = 0, numero; y < 5; y++) {
          numero = texteParPointEchelle(
            Number(x * 6 + y).toString(),
            pointAbstrait(x * 3.2 + 1.6, y * 3.2 + 1.6),
            0,
            'black',
            1.5,
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

      polys[0].opaciteDeRemplissage = 0.7
      polys[0].couleurDeRemplissage = colorToLatexOrHTML(texcolors(11))
      polys[28].opaciteDeRemplissage = 0.7
      polys[28].couleurDeRemplissage = colorToLatexOrHTML(
        texcolors(11 + (chemin.length - 1)),
      )
      objetsEnonce.push(...polys)
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
        }
      }
      if (this.sup === 1) {
        // cas des symétries axiales seules (une seule ligne par étape) plus de place pour la figure qui rétrécit en F° du nombre d'étapes.
        paramsEnonce = {
          xmin: -0.5,
          ymin: -0.5,
          xmax: 17,
          ymax: 16.5,
          pixelsParCm: 20,
          scale: 1.1 - chemin.length * 0.03125,
        }
        paramsCorrection = {
          xmin: -0.5,
          ymin: -0.5,
          xmax: 17,
          ymax: 16.5,
          pixelsParCm: 20,
          scale: 1 - chemin.length * 0.03125,
        }
      } else {
        // à partir de la symétrie centrale, il peut y avoir 2 lignes par étapes, donc on rétrécit davantage la figure.
        paramsEnonce = {
          xmin: -0.5,
          ymin: -0.5,
          xmax: 17,
          ymax: 16.5,
          pixelsParCm: 20,
          scale: 1.2 - chemin.length * 0.05,
        }
        paramsCorrection = {
          xmin: -0.5,
          ymin: -0.5,
          xmax: 17,
          ymax: 16.5,
          pixelsParCm: 20,
          scale: 1.1 - chemin.length * 0.05,
        }
      }
      for (let k = 1, figure; k < chemin.length - 1; k++) {
        figure = translation(
          polys[chemin[k]] as Polygone,
          vecteur(0, 0),
        ) as Polygone
        figure.color = colorToLatexOrHTML(texcolors(k + 11))
        figure.couleurDeRemplissage = colorToLatexOrHTML(texcolors(k + 11))
        figure.opaciteDeRemplissage = 0.6
        objetsCorrection.push(figure)
      }
      objetsCorrection.push(...objetsEnonce)
      for (let etape = 0; etape < chemin.length - 1; etape++) {
        texte +=
          this.interactif && context.isHtml
            ? this.sup === 1
              ? ''
              : `$${miseEnEvidence(etape + 1 + ')' + sp(1))}$` +
                texteEnCouleur(
                  transfos[etape].texteInteractif,
                  etape % 2 === 0 ? 'black' : 'brown',
                ) +
                '<br>'
            : etape === 0
              ? `$${miseEnEvidence(etape + 1 + ')' + sp(1))}$` +
                texteEnCouleur(
                  transfos[0].texte + (this.sup3 ? ',' : '.') + '<br>',
                  'black',
                )
              : this.sup3
                ? `$${miseEnEvidence(etape + 1 + ')' + sp(1))}$` +
                  texteEnCouleur(
                    'qui ' +
                      transfos[etape].texte.slice(context.isHtml ? 22 : 18) +
                      (etape === chemin.length - 2 ? '.' : ','),
                    etape % 2 === 0 ? 'black' : 'brown',
                  ) +
                  '<br>'
                : `$${miseEnEvidence(etape + 1 + ')' + sp(1))}$` +
                  texteEnCouleur(
                    transfos[etape].texte + '.',
                    etape % 2 === 0 ? 'black' : 'brown',
                  ) +
                  '<br>'
        texteCorr += transfos[etape].texteCorr + '<br>'
      }
      if (context.isHtml) {
        texte += ajouteChampTexteMathLive(
          this,
          i,
          KeyboardType.clavierNumbersAvecPointVirgule,
        )
        texte = deuxColonnes(texte, mathalea2d(paramsEnonce, objetsEnonce), 50)
        texteCorr = deuxColonnes(
          texteCorr,
          mathalea2d(paramsCorrection, objetsCorrection),
          50,
        )
      } else {
        texte += '\n' + centrage(mathalea2d(paramsEnonce, objetsEnonce))
        texteCorr +=
          '\n' + centrage(mathalea2d(paramsCorrection, objetsCorrection))
      }
      texteCorr += this.interactif
        ? 'La réponse était donc : ' +
          texteEnCouleurEtGras(
            chemin.map((n) => `$\\mathbf{${n}}$`).join(' ; '),
          ) +
          '.'
        : ''
      if (context.isAmc) {
        this.autoCorrectionAMC = [
          {
            enonce: texte,
            propositions: [
              {
                texte: texteCorr,
                statut: 3,
                feedback: '',
                sanscadre: true,
              },
            ],
          },
        ]
        this.questionsAMC = this.autoCorrectionAMC.map((questionAMC) =>
          amcConvert(questionAMC),
        )
      } else {
        handleAnswers(this, i, {
          reponse: {
            value: chemin.toString().replaceAll(',', ';'),
            options: { suiteRangeeDeNombres: true },
          },
        })
      }
      texte += context.isHtml ? '<br>' : '\n \\medskip'
      texteCorr += context.isHtml ? '<br>' : '\n \\medskip'
      if (
        this.questionJamaisPosee(
          i,
          chemin.map(String).join(''),
          unMotif.toString(),
        )
      ) {
        this.listeQuestions.push(texte)
        this.listeCorrections.push(texteCorr)
        this.listeReponsesCourtes.push(`$${chemin.join('\\,;\\,')}$`)
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}

function genererCheminOptimise(nbTransfos: number): number[] {
  if (nbTransfos < 8 || nbTransfos > 16 || nbTransfos % 2 !== 0) {
    nbTransfos = choice([8, 10, 12, 14, 16])
  }
  const longueursDisponibles = Object.keys(CHEMINS_PREDEFINIS)
    .map(Number)
    .filter((longueur) => longueur === nbTransfos)

  const longueursEligibles =
    longueursDisponibles.length > 0
      ? longueursDisponibles
      : Object.keys(CHEMINS_PREDEFINIS).map(Number)

  const longueurChoisie = choice(longueursEligibles)
  const cheminsPourLongueur = CHEMINS_PREDEFINIS[longueurChoisie]

  if (!cheminsPourLongueur || cheminsPourLongueur.length === 0) {
    window.notify(
      'Aucun chemin prédéfini disponible pour la longueur choisie.',
      { longueurChoisie },
    )
  }

  return [...choice(cheminsPourLongueur)]
}
