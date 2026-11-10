import Decimal from 'decimal.js'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { touchesEntier } from '../../lib/outils/ordreDeGrandeur'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'

export const dateDePublication = '26/10/2026'
export const uuid = 'eff84'
// @Author Stéphane Guyon
export const refs = {
  'fr-fr': ['1A-C05-10', '2A-N5-10'],
  'fr-ch': [],
}
export const interactifReady = true
export const titre =
  'Déterminer un ordre de grandeur d’un volume ou d’une aire avec conversion'

type Unite = 'm' | 'dm' | 'cm' | 'dam'

/** Nombre d'unités dans 1 m */
const parMetre: Record<Unite, number> = { dam: 0.1, m: 1, dm: 10, cm: 100 }

type Forme = {
  intro: string
  /** Libellés des dimensions (tous féminins) */
  dimensions: string[]
  /** Valeurs arrondies possibles de chaque dimension, dans l'unité de référence */
  arrondies: number[][]
  /** Unité de référence des valeurs arrondies, dans laquelle le résultat est demandé */
  reference: Unite
  /** Unités possibles pour écrire les dimensions dans l'énoncé */
  unites: Unite[]
  /** Unité du résultat : `L` pour un volume en dm³ */
  resultat: 'volume' | 'litre' | 'aire'
}

const formes: Forme[] = [
  {
    intro: "Un garage a la forme d'un parallélépipède rectangle.",
    dimensions: ['longueur', 'largeur', 'hauteur'],
    arrondies: [
      [6, 8, 10],
      [3, 4, 5],
      [2, 3],
    ],
    reference: 'm',
    unites: ['m', 'dm', 'cm'],
    resultat: 'volume',
  },
  {
    intro: "Une salle de classe a la forme d'un parallélépipède rectangle.",
    dimensions: ['longueur', 'largeur', 'hauteur'],
    arrondies: [[8, 10], [6, 8], [3]],
    reference: 'm',
    unites: ['m', 'dm', 'cm'],
    resultat: 'volume',
  },
  {
    intro: "Une piscine a la forme d'un parallélépipède rectangle.",
    dimensions: ['longueur', 'largeur', 'profondeur'],
    arrondies: [[10, 20], [5, 10], [2]],
    reference: 'm',
    unites: ['m', 'dm', 'cm'],
    resultat: 'volume',
  },
  {
    intro: "Un entrepôt a la forme d'un parallélépipède rectangle.",
    dimensions: ['longueur', 'largeur', 'hauteur'],
    arrondies: [
      [20, 30],
      [10, 20],
      [4, 5],
    ],
    reference: 'm',
    unites: ['m', 'dm', 'cm'],
    resultat: 'volume',
  },
  {
    intro: "Un aquarium a la forme d'un parallélépipède rectangle.",
    dimensions: ['longueur', 'largeur', 'hauteur'],
    arrondies: [
      [6, 8, 10],
      [3, 4, 5],
      [3, 4, 5],
    ],
    reference: 'dm',
    unites: ['m', 'dm', 'cm'],
    resultat: 'litre',
  },
  {
    intro: 'Un terrain de sport a la forme d’un rectangle.',
    dimensions: ['longueur', 'largeur'],
    arrondies: [
      [40, 50, 60],
      [20, 30],
    ],
    reference: 'm',
    unites: ['m', 'dam'],
    resultat: 'aire',
  },
  {
    intro: 'Un jardin a la forme d’un rectangle.',
    dimensions: ['longueur', 'largeur'],
    arrondies: [
      [20, 30, 40],
      [10, 20],
    ],
    reference: 'm',
    unites: ['m', 'dam'],
    resultat: 'aire',
  },
  {
    intro: 'Une salle de classe a la forme d’un rectangle.',
    dimensions: ['longueur', 'largeur'],
    arrondies: [
      [8, 10],
      [6, 8],
    ],
    reference: 'm',
    unites: ['m', 'dm'],
    resultat: 'aire',
  },
  {
    intro: 'Un parking a la forme d’un rectangle.',
    dimensions: ['longueur', 'largeur'],
    arrondies: [
      [30, 40, 50],
      [20, 30],
    ],
    reference: 'm',
    unites: ['m', 'dam'],
    resultat: 'aire',
  },
]

/** Valeur proche de `arrondie` : l'arrondi à un chiffre significatif redonne `arrondie` */
function valeurProche(arrondie: number): Decimal {
  const ecart = arrondie <= 10 ? 4 : 39
  return new Decimal(arrondie).add(
    new Decimal(randint(-ecart, ecart, 0)).div(10),
  )
}

/** Valeur exprimée dans l'unité `vers`, sachant qu'elle vaut `valeur` dans l'unité `depuis` */
function convertit(valeur: Decimal, depuis: Unite, vers: Unite): Decimal {
  return valeur.mul(parMetre[vers]).div(parMetre[depuis])
}

const uniteTex = (u: Unite) => `\\text{${u}}`

/**
 * Ordre de grandeur d'un volume ou d'une aire dont les dimensions sont données dans des unités
 * différentes : le résultat est demandé dans l'unité la plus cohérente, ce qui oblige à convertir
 * avant d'arrondir.
 */
export default class OrdreDeGrandeurVolumeAire extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.spacing = 1.5
    this.spacingCorr = 1.5
    this.formatChampTexte = KeyboardType.clavierEntierementPersonnalisable
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  nouvelleVersion() {
    const forme = this.quotaChoice('forme', formes)
    const arrondies = forme.arrondies.map((valeurs) => choice(valeurs))
    const reelles = arrondies.map(valeurProche)
    // au moins deux unités différentes dans l'énoncé
    let unites: Unite[]
    do {
      unites = forme.dimensions.map(() => choice(forme.unites))
    } while (new Set(unites).size < 2)
    const ref = forme.reference
    const exposant = forme.resultat === 'aire' ? 2 : 3
    const produit = arrondies.reduce((a, b) => a * b, 1)
    const parties = forme.dimensions.map((nom, k) => {
      const affichee = convertit(reelles[k], ref, unites[k])
      return `${k === 0 ? 'Sa' : 'sa'} ${nom} ${k === 0 ? 'est ' : ''}de $${texNombre(affichee, 2)}$ ${unites[k]}`
    })
    const phrase =
      parties.length === 2
        ? parties.join(' et ')
        : `${parties.slice(0, -1).join(', ')} et ${parties[parties.length - 1]}`
    const nomGrandeur = forme.resultat === 'aire' ? 'aire' : 'volume'
    const uniteResultat =
      forme.resultat === 'litre' ? '\\text{L}' : `${uniteTex(ref)}^${exposant}`
    const conversions = forme.dimensions
      .map((_, k) =>
        unites[k] === ref
          ? ''
          : `$${texNombre(convertit(reelles[k], ref, unites[k]), 2)}\\text{ ${unites[k]}}=${texNombre(reelles[k], 1)}\\text{ ${ref}}$`,
      )
      .filter(Boolean)
      .join(', ')
    const arrondis = reelles
      .map((r, k) => `$${texNombre(r, 1)}\\approx${arrondies[k]}$`)
      .join('<br>')
    this.question = `${forme.intro}<br>${phrase}.<br>Donner un ordre de grandeur de son ${nomGrandeur} en $${uniteResultat}$.`
    this.optionsChampTexte = {
      dataKeys: touchesEntier,
      texteAvant: `<br>${nomGrandeur === 'aire' ? 'L’aire' : 'Le volume'} est environ `,
      texteApres: `$${uniteResultat}$.`,
    }
    this.reponse = produit
    this.correction = `On exprime les dimensions dans la même unité (en $${uniteTex(ref)}$) : ${conversions}.<br>
    On arrondit chaque dimension :<br>${arrondis}<br>
    Donc ${nomGrandeur === 'aire' ? "l'aire" : 'le volume'} est environ $${arrondies.join('\\times')}=${miseEnEvidence(texNombre(produit, 0))}$ $${
      forme.resultat === 'litre'
        ? '\\text{dm}^3=' + texNombre(produit, 0) + '\\text{ L}'
        : uniteResultat
    }$.`
  }
}
