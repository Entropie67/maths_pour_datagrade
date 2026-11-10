import { diagrammeBarresEmpilees } from '../../lib/2d/diagrammes'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'
import { sp } from '../../lib/outils/outilString'

export const uuid = '04254'
export const refs = {
  'fr-fr': ['1A-S01-10'],
  'fr-ch': ['9R1FA2B-10', '9R2FA2B-10', '9R3FA2B-10'],
}
export const interactifReady = true
export const interactifType = 'mathLive'
export const amcReady = 'true'
export const amcType = 'AMCNum'
export const titre = 'Lire un diagramme en barres empilées'
export const dateDePublication = '27/10/2026'

type Contexte = {
  titre: string
  axe: string
  /** Libellés des trois couches, de la plus basse à la plus haute */
  couches: [string, string, string]
  /** Groupe nominal désignant la grandeur lue pour chaque couche */
  grandeurs: [string, string, string]
  /** Début de la phrase de présentation */
  presentation: string
  /** Valeurs minimale et maximale (multiples de 10) de chaque couche */
  bornes: [[number, number], [number, number], [number, number]]
}

const bornes: Contexte['bornes'] = [
  [90, 220],
  [70, 150],
  [50, 100],
]

const contextes: Contexte[] = [
  {
    titre: 'Fréquentation du parc Aquaville',
    axe: 'En milliers de visiteurs',
    couches: ['Adultes', 'Enfants', 'Groupes'],
    grandeurs: [
      "le nombre d'adultes",
      "le nombre d'enfants",
      'le nombre de visiteurs en groupe',
    ],
    presentation:
      'Le diagramme en barres ci-dessous donne la répartition des visiteurs du parc aquatique Aquaville',
    bornes,
  },
  {
    titre: 'Ventes de la boulangerie Les Délices',
    axe: 'En centaines de produits vendus',
    couches: ['Pains', 'Viennoiseries', 'Pâtisseries'],
    grandeurs: [
      'le nombre de pains vendus',
      'le nombre de viennoiseries vendues',
      'le nombre de pâtisseries vendues',
    ],
    presentation:
      'Le diagramme en barres ci-dessous donne la répartition des ventes de la boulangerie Les Délices',
    bornes,
  },
  {
    titre: 'Prêts de la médiathèque Jules-Verne',
    axe: "En centaines d'emprunts",
    couches: ['Livres', 'DVD', 'Jeux vidéo'],
    grandeurs: [
      'le nombre de livres empruntés',
      'le nombre de DVD empruntés',
      'le nombre de jeux vidéo empruntés',
    ],
    presentation:
      'Le diagramme en barres ci-dessous donne la répartition des emprunts de la médiathèque Jules-Verne',
    bornes,
  },
  {
    titre: 'Production de la ferme du Val-Joli',
    axe: 'En tonnes',
    couches: ['Blé', 'Maïs', 'Orge'],
    grandeurs: [
      'le nombre de tonnes de blé récoltées',
      'le nombre de tonnes de maïs récoltées',
      "le nombre de tonnes d'orge récoltées",
    ],
    presentation:
      'Le diagramme en barres ci-dessous donne la répartition des récoltes de la ferme du Val-Joli',
    bornes,
  },
]

type Question = 'minimum' | 'maximum'

/**
 * Le diagramme est dessiné avec une graduation de 50 ; les valeurs sont des multiples de 10,
 * et les valeurs de la couche interrogée sont toutes distinctes pour que l'année soit unique.
 */
export default class LireDiagrammeBarresEmpilees extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierNumbers
  }

  nouvelleVersion() {
    const contexte = choice(contextes)
    const question: Question = choice(['minimum', 'maximum'])
    const nbBarres = 8
    const debut = randint(2013, 2025 - nbBarres + 1)
    const annees = Array.from({ length: nbBarres }, (_, i) => debut + i)
    // Couche interrogée : couche 1 (la seconde), valeurs toutes distinctes
    const couche = randint(0, 1) === 0 ? 1 : 0
    let valeurs: number[][]
    do {
      valeurs = annees.map(() =>
        contexte.bornes.map(([min, max]) => randint(min / 10, max / 10) * 10),
      )
    } while (
      new Set(valeurs.map((v) => v[couche])).size < nbBarres ||
      valeurs.some((v) => v[0] + v[1] + v[2] > 500)
    )
    const cible = valeurs.map((v) => v[couche])
    const extremum =
      question === 'minimum' ? Math.min(...cible) : Math.max(...cible)
    const indexReponse = cible.indexOf(extremum)
    const annee = annees[indexReponse]

    const objets = diagrammeBarresEmpilees(
      [
        { nom: contexte.couches[0], couleur: 'white' },
        { nom: contexte.couches[1], couleur: 'black' },
        { nom: contexte.couches[2], hachures: 'bricks' },
      ],
      valeurs,
      annees.map(String),
      {
        valeurMax: 500,
        graduation: 50,
        hauteur: 6,
        titre: contexte.titre,
        titreAxeVertical: contexte.axe,
      },
    )
    const figure = mathalea2d(
      Object.assign(
        fixeBordures(objets, {
          rxmin: -0.5,
          rxmax: 0.5,
          rymin: -0.5,
          rymax: 0.5,
        }),
        {
          pixelsParCm: 30,
          scale: 0.8,
          center: true,
        },
      ),
      objets,
    )
    const nomCouche = contexte.couches[couche].toLowerCase()
    const adjectif = question === 'minimum' ? 'faible' : 'élevé'
    const phrase = `L'année où ${contexte.grandeurs[couche]} a été le plus ${adjectif} est`
    this.question = `${contexte.presentation} entre $${annees[0]}$ et $${annees[nbBarres - 1]}$.<br>${figure}<br>${this.interactif ? 'Compléter la phrase suivante.<br>' : `Déterminer l'année où ${contexte.grandeurs[couche]} a été le plus ${adjectif}.`}`
    this.optionsChampTexte = { texteAvant: `${phrase} `, texteApres: '.' }
    this.correction = `On repère la couche «${sp()}${nomCouche}${sp()}» dans chaque barre et on compare sa hauteur.<br>
    ${phrase} $${miseEnEvidence(String(annee))}$.`
    this.reponse = String(annee)
  }
}
