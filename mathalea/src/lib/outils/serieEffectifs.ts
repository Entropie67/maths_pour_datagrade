import { tableauColonneLigne } from '../2d/tableau'
import { miseEnEvidence } from './embellissements'
import { randint } from '../../modules/outils'

export type SerieEffectifs = { valeurs: number[]; effectifs: number[] }

/**
 * Tire `nbValeurs` valeurs distinctes rangées par ordre croissant,
 * à partir d'une valeur initiale comprise entre `min` et `min + 2`,
 * avec des écarts de 1 à `ecartMax`.
 */
export function valeursCroissantes(
  nbValeurs: number,
  min: number,
  ecartMax: number,
): number[] {
  const valeurs = [randint(min, min + 2)]
  while (valeurs.length < nbValeurs) {
    valeurs.push(valeurs[valeurs.length - 1] + randint(1, ecartMax))
  }
  return valeurs
}

/** Effectif total d'une série. */
export function effectifTotal({ effectifs }: SerieEffectifs): number {
  return effectifs.reduce((somme, e) => somme + e, 0)
}

/** Série dépliée, rangée par ordre croissant. */
export function serieDepliee({ valeurs, effectifs }: SerieEffectifs): number[] {
  return valeurs.flatMap((v, i) => Array<number>(effectifs[i]).fill(v))
}

/** Somme des valeurs d'une série donnée par ses effectifs (calcul en entiers). */
export function sommeSerie({ valeurs, effectifs }: SerieEffectifs): number {
  return valeurs.reduce((somme, v, i) => somme + v * effectifs[i], 0)
}

/** Moyenne d'une série donnée par ses effectifs. */
export function moyenneSerie(serie: SerieEffectifs): number {
  return sommeSerie(serie) / effectifTotal(serie)
}

/** Médiane d'une série donnée par ses effectifs. */
export function medianeSerie(serie: SerieEffectifs): number {
  const depliee = serieDepliee(serie)
  const n = depliee.length
  return n % 2 === 1
    ? depliee[(n - 1) / 2]
    : (depliee[n / 2 - 1] + depliee[n / 2]) / 2
}

/** Effectifs cumulés croissants. */
export function effectifsCumules(effectifs: number[]): number[] {
  let cumul = 0
  return effectifs.map((e) => (cumul += e))
}

/** Valeur de rang `rang` (à partir de 1) dans la série rangée par ordre croissant. */
export function valeurDeRang(serie: SerieEffectifs, rang: number): number {
  return serieDepliee(serie)[rang - 1]
}

/**
 * Tableau « valeur / effectif » : l'en-tête de colonne porte `nomValeur`,
 * puis les valeurs ; la seule ligne est celle des effectifs.
 */
export function tableauEffectifs(
  nomValeur: string,
  { valeurs, effectifs }: SerieEffectifs,
): string {
  return tableauColonneLigne(
    [`\\text{${nomValeur}}`, ...valeurs.map(String)],
    ['\\text{Effectif}'],
    effectifs.map(String),
  )
}

/**
 * Tableau des effectifs avec une ligne d'effectifs cumulés croissants (ECC).
 * Les colonnes de `colonnesMarquees` (indices) ont leur valeur et leur ECC en orange.
 */
export function tableauEffectifsCumules(
  nomValeur: string,
  { valeurs, effectifs }: SerieEffectifs,
  colonnesMarquees: number[] = [],
): string {
  const marque = (texte: string, i: number) =>
    colonnesMarquees.includes(i) ? miseEnEvidence(texte) : texte
  return tableauColonneLigne(
    [`\\text{${nomValeur}}`, ...valeurs.map((v, i) => marque(String(v), i))],
    ['\\text{Effectif}', '\\text{ECC}'],
    [
      ...effectifs.map(String),
      ...effectifsCumules(effectifs).map((e, i) => marque(String(e), i)),
    ],
  )
}

export type ContexteSerie = {
  phrase: string
  nomValeur: string
  /** Début de la phrase de réponse en interactif, avant le champ. */
  moyenne: string
  mediane: string
  min: number
  ecartMax: number
  /** Série relevée sur une classe : effectif total de 20 à 25 élèves. */
  classe?: boolean
}

/** Situations à petites valeurs entières, dans le même ordre de grandeur. */
export const contextesSerie: ContexteSerie[] = [
  {
    phrase: "On a relevé le nombre de frères et sœurs des élèves d'une classe.",
    nomValeur: 'Frères et sœurs',
    moyenne: 'Le nombre moyen de frères et sœurs est égal à ',
    mediane: 'Une valeur médiane du nombre de frères et sœurs est égale à ',
    min: 0,
    ecartMax: 2,
    classe: true,
  },
  {
    phrase:
      "On a relevé le nombre de livres lus pendant l'été par les élèves d'une classe.",
    nomValeur: 'Livres lus',
    moyenne: 'Le nombre moyen de livres lus est égal à ',
    mediane: 'Une valeur médiane du nombre de livres lus est égale à ',
    min: 0,
    ecartMax: 3,
    classe: true,
  },
  {
    phrase:
      'On a relevé le nombre de personnes présentes dans les voitures passées à un péage.',
    nomValeur: 'Personnes par voiture',
    moyenne: 'Le nombre moyen de personnes par voiture est égal à ',
    mediane:
      'Une valeur médiane du nombre de personnes par voiture est égale à ',
    min: 1,
    ecartMax: 1,
  },
  {
    phrase:
      'On a relevé le nombre de buts marqués par une équipe lors de ses matchs de football.',
    nomValeur: 'Buts marqués',
    moyenne: 'Le nombre moyen de buts marqués par match est égal à ',
    mediane:
      'Une valeur médiane du nombre de buts marqués par match est égale à ',
    min: 0,
    ecartMax: 2,
  },
  {
    phrase:
      "On a relevé le nombre d'animaux de compagnie dans les foyers d'un immeuble.",
    nomValeur: 'Animaux',
    moyenne: "Le nombre moyen d'animaux de compagnie par foyer est égal à ",
    mediane:
      "Une valeur médiane du nombre d'animaux de compagnie par foyer est égale à ",
    min: 0,
    ecartMax: 2,
  },
  {
    phrase: "On a relevé le nombre de pièces des appartements d'une résidence.",
    nomValeur: 'Pièces',
    moyenne: 'Le nombre moyen de pièces par appartement est égal à ',
    mediane:
      'Une valeur médiane du nombre de pièces par appartement est égale à ',
    min: 1,
    ecartMax: 1,
  },
  {
    phrase:
      "On a relevé le nombre de films vus au cinéma pendant les vacances par les élèves d'une classe.",
    nomValeur: 'Films vus',
    moyenne: 'Le nombre moyen de films vus est égal à ',
    mediane: 'Une valeur médiane du nombre de films vus est égale à ',
    min: 0,
    ecartMax: 2,
    classe: true,
  },
]
