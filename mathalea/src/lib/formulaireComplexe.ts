import { shuffle } from './outils/arrayOutils'

/**
 * Formulaire de paramétrage « complexe ».
 *
 * Les formulaires historiques (`besoinFormulaireNumerique`, `besoinFormulaireCaseACocher`,
 * `besoinFormulaireTexte`) n'offrent qu'un seul réglage par emplacement `sup`, ce qui limite
 * un exercice à cinq paramètres et impose des menus déroulants énumérant toutes les
 * combinaisons possibles.
 *
 * `besoinFormulaireComplexe` regroupe au contraire plusieurs champs de natures différentes
 * dans un seul emplacement (`this.sup`) :
 *
 * * `case` : une case à cocher (booléen) ;
 * * `selection` : un choix unique dans une liste d'options ;
 * * `nombre` : un entier saisi librement entre un minimum et un maximum ;
 * * `liste` : une liste d'items à activer ou désactiver ;
 * * `listePonderee` : idem, avec un poids d'apparition par item ;
 * * `listePondereeOrdonnee` : idem, avec en plus des flèches de réordonnancement et une
 *   case indiquant s'il faut tenir compte de l'ordre choisi.
 *
 * L'ensemble des valeurs est sérialisé dans une unique chaîne stockée dans `this.sup`
 * (et donc dans l'URL partagée).
 *
 * @author Rémi Angot
 */

/** Séparateur entre deux champs du formulaire. */
const SEPARATEUR_CHAMPS = '*'
/** Séparateur entre deux items d'une liste. */
const SEPARATEUR_ITEMS = '-'
/** Séparateur entre l'indice d'un item et son poids. */
const SEPARATEUR_POIDS = '.'
/** Séparateur entre l'indicateur « ordre imposé » et la liste des items. */
const SEPARATEUR_ORDRE = '_'

/** Poids maximal proposé par défaut dans le formulaire pour une liste pondérée. */
export const POIDS_MAX_DEFAUT = 10

/** Libellé par défaut de la case « tenir compte de l'ordre ». */
export const LABEL_ORDRE_DEFAUT = 'Respecter l’ordre choisi'

export type ChampCase = {
  type: 'case'
  /** Identifiant du champ, utilisé pour lire sa valeur dans l'exercice. */
  nom: string
  /** Libellé affiché à côté de la case. */
  label: string
  defaut?: boolean
}

export type OptionSelection = {
  /**
   * Valeur sérialisée dans l'URL : la limiter aux caractères alphanumériques
   * pour garder une URL lisible.
   */
  valeur: string
  label: string
}

export type ChampSelection = {
  type: 'selection'
  nom: string
  label: string
  options: OptionSelection[]
  /** Valeur d'une des options ; à défaut, la première option est utilisée. */
  defaut?: string
}

export type ChampNombre = {
  type: 'nombre'
  nom: string
  label: string
  min?: number
  max: number
  /** Valeur par défaut ; à défaut, `min` (ou 0). */
  defaut?: number
}

export type ItemListe = {
  nom: string
  label: string
  /** Coché par défaut (défaut : `true`). */
  actif?: boolean
}

export type ItemListePonderee = {
  nom: string
  label: string
  /** Poids d'apparition par défaut ; `0` signifie que l'item est décoché. */
  poids?: number
}

/** Liste d'items à cocher ou décocher, sans poids ni réordonnancement. */
export type ChampListe = {
  type: 'liste'
  nom: string
  label: string
  items: ItemListe[]
}

/** Liste d'items cochables, avec un poids d'apparition, sans réordonnancement. */
export type ChampListePonderee = {
  type: 'listePonderee'
  nom: string
  label: string
  items: ItemListePonderee[]
  /** Poids maximal saisissable (défaut : `POIDS_MAX_DEFAUT`). */
  poidsMax?: number
  /** Accepter les anciennes sélections binaires après migration depuis `liste`. */
  acceptLegacyBinary?: boolean
}

/**
 * Liste d'items cochables et pondérables, que l'enseignant peut réordonner. Une case
 * dédiée indique si la génération doit tenir compte de l'ordre affiché.
 */
export type ChampListePondereeOrdonnee = {
  type: 'listePondereeOrdonnee'
  nom: string
  label: string
  items: ItemListePonderee[]
  /** Poids maximal saisissable (défaut : `POIDS_MAX_DEFAUT`). */
  poidsMax?: number
  /** Libellé de la case « tenir compte de l'ordre » (défaut : `LABEL_ORDRE_DEFAUT`). */
  labelOrdre?: string
  /** Case « tenir compte de l'ordre » cochée par défaut (défaut : `false`). */
  defautOrdre?: boolean
}

export type ChampListeQuelconque =
  ChampListe | ChampListePonderee | ChampListePondereeOrdonnee

export type ChampFormulaireComplexe =
  ChampCase | ChampSelection | ChampNombre | ChampListeQuelconque

export type FormulaireComplexe = {
  titre?: string
  champs: ChampFormulaireComplexe[]
}

/** Un item de liste, avec son poids résolu (`0` = décoché). */
export type ItemPondere = {
  nom: string
  label: string
  poids: number
}

/** Valeur d'une liste pondérée ordonnée : les items et l'état de la case « ordre ». */
export type ValeurListeOrdonnee = {
  ordre: boolean
  items: ItemPondere[]
}

export type ValeurChampComplexe =
  boolean | string | number | ItemPondere[] | ValeurListeOrdonnee

export type ValeursFormulaireComplexe = Record<string, ValeurChampComplexe>

/** `true` si le champ est une liste, quelle qu'en soit la variante. */
export function estChampListe(
  champ: ChampFormulaireComplexe,
): champ is ChampListeQuelconque {
  return (
    champ.type === 'liste' ||
    champ.type === 'listePonderee' ||
    champ.type === 'listePondereeOrdonnee'
  )
}

/**
 * Poids maximal saisissable pour une liste. Une `liste` simple n'a que deux états
 * (décochée ou cochée), les listes pondérées utilisent `poidsMax`.
 *
 * Le test porte sur `champ.type` et non sur la présence de la propriété `poidsMax` :
 * celle-ci est facultative et absente de la plupart des déclarations.
 */
export function poidsMaximal(champ: ChampListeQuelconque): number {
  return champ.type === 'liste' ? 1 : (champ.poidsMax ?? POIDS_MAX_DEFAUT)
}

/** Poids déclaré d'un item, quel que soit le type de liste. */
function poidsDeclare(
  champ: ChampListeQuelconque,
  item: ItemListe | ItemListePonderee,
): number {
  if (champ.type === 'liste') {
    return (item as ItemListe).actif === false ? 0 : 1
  }
  return (item as ItemListePonderee).poids ?? 1
}

/** Items déclarés d'une liste, avec leur poids par défaut. */
function itemsParDefaut(champ: ChampListeQuelconque): ItemPondere[] {
  return champ.items.map((item) => ({
    nom: item.nom,
    label: item.label,
    poids: poidsDeclare(champ, item),
  }))
}

/**
 * Valeur par défaut d'un champ, telle que déclarée par l'exercice.
 */
function valeurParDefaut(champ: ChampFormulaireComplexe): ValeurChampComplexe {
  switch (champ.type) {
    case 'case':
      return champ.defaut ?? false
    case 'selection':
      return champ.defaut ?? champ.options[0]?.valeur ?? ''
    case 'nombre':
      return champ.defaut ?? champ.min ?? 0
    case 'listePondereeOrdonnee':
      return { ordre: champ.defautOrdre ?? false, items: itemsParDefaut(champ) }
    default:
      return itemsParDefaut(champ)
  }
}

/**
 * Valeurs par défaut de tous les champs d'un formulaire complexe.
 */
export function valeursParDefaut(
  formulaire: FormulaireComplexe,
): ValeursFormulaireComplexe {
  const valeurs: ValeursFormulaireComplexe = {}
  for (const champ of formulaire.champs) {
    valeurs[champ.nom] = valeurParDefaut(champ)
  }
  return valeurs
}

/** Items d'une valeur de liste, quelle que soit la variante du champ. */
export function itemsDeLaValeur(valeur: ValeurChampComplexe): ItemPondere[] {
  if (Array.isArray(valeur)) return valeur
  if (typeof valeur === 'object' && valeur !== null && 'items' in valeur) {
    return valeur.items
  }
  return []
}

/** État de la case « tenir compte de l'ordre » d'une valeur de liste. */
export function ordreDeLaValeur(valeur: ValeurChampComplexe): boolean {
  return (
    typeof valeur === 'object' &&
    valeur !== null &&
    !Array.isArray(valeur) &&
    valeur.ordre === true
  )
}

/**
 * Sérialise la valeur d'un champ.
 *
 * * `case` : `1` ou `0` ;
 * * `selection` : la valeur de l'option ;
 * * `nombre` : l'entier saisi ;
 * * `liste` : un caractère `1`/`0` par item, dans l'ordre de déclaration ;
 * * `listePonderee` : les poids séparés par `-`, dans l'ordre de déclaration ;
 * * `listePondereeOrdonnee` : `<ordre>_<indice>.<poids>-…`, dans l'ordre choisi.
 */
function serialiseChamp(
  champ: ChampFormulaireComplexe,
  valeur: ValeurChampComplexe | undefined,
): string {
  const valeurEffective = valeur ?? valeurParDefaut(champ)
  switch (champ.type) {
    case 'case':
      return valeurEffective ? '1' : '0'
    case 'selection':
      return String(valeurEffective)
    case 'nombre':
      return String(valeurEffective)
    case 'liste': {
      const items = itemsDeLaValeur(valeurEffective)
      return champ.items
        .map((reference) => {
          const item = items.find((candidat) => candidat.nom === reference.nom)
          return (item?.poids ?? poidsDeclare(champ, reference)) > 0 ? '1' : '0'
        })
        .join('')
    }
    case 'listePonderee': {
      const items = itemsDeLaValeur(valeurEffective)
      return champ.items
        .map((reference) => {
          const item = items.find((candidat) => candidat.nom === reference.nom)
          return Math.max(
            0,
            Math.round(item?.poids ?? poidsDeclare(champ, reference)),
          )
        })
        .join(SEPARATEUR_ITEMS)
    }
    case 'listePondereeOrdonnee': {
      const items = itemsDeLaValeur(valeurEffective)
      const liste = items
        .map((item) => {
          const indice = champ.items.findIndex((ref) => ref.nom === item.nom)
          return `${indice}${SEPARATEUR_POIDS}${Math.max(0, Math.round(item.poids))}`
        })
        .filter((partie) => !partie.startsWith('-1'))
        .join(SEPARATEUR_ITEMS)
      return `${ordreDeLaValeur(valeurEffective) ? '1' : '0'}${SEPARATEUR_ORDRE}${liste}`
    }
  }
}

/**
 * Sérialise l'ensemble des valeurs d'un formulaire complexe en une chaîne unique,
 * destinée à être stockée dans `this.sup` puis dans l'URL.
 *
 * Les caractères utilisés (`*`, `-`, `.`, `_` et alphanumériques) ne sont pas encodés
 * par `URLSearchParams`, ce qui garde l'URL lisible.
 */
export function serialiseFormulaireComplexe(
  formulaire: FormulaireComplexe,
  valeurs: ValeursFormulaireComplexe,
): string {
  return formulaire.champs
    .map((champ) => serialiseChamp(champ, valeurs[champ.nom]))
    .join(SEPARATEUR_CHAMPS)
}

/**
 * Désérialise une liste dont l'ordre est fixé par la déclaration : le n-ième élément de
 * `parties` donne le poids du n-ième item déclaré.
 */
function parseListePositionnelle(
  champ: ChampListe | ChampListePonderee,
  parties: (string | undefined)[],
): ItemPondere[] {
  return champ.items.map((reference, indice) => {
    const poids = Number.parseInt(parties[indice] ?? '')
    return {
      nom: reference.nom,
      label: reference.label,
      poids: Number.isNaN(poids)
        ? poidsDeclare(champ, reference)
        : Math.max(0, poids),
    }
  })
}

/**
 * Désérialise la valeur d'un champ. Toute valeur invalide est remplacée par la valeur
 * par défaut : une URL ancienne ou tronquée ne doit jamais casser l'exercice.
 */
function parseChamp(
  champ: ChampFormulaireComplexe,
  partie: string | undefined,
): ValeurChampComplexe {
  if (partie === undefined || partie === '') return valeurParDefaut(champ)
  switch (champ.type) {
    case 'case':
      return partie === '1' || partie === 'true'
    case 'selection':
      return champ.options.some((option) => option.valeur === partie)
        ? partie
        : (valeurParDefaut(champ) as string)
    case 'nombre': {
      const valeur = Number.parseInt(partie)
      if (Number.isNaN(valeur)) return valeurParDefaut(champ)
      return Math.min(champ.max, Math.max(champ.min ?? -Infinity, valeur))
    }
    case 'liste':
      return parseListePositionnelle(champ, [...partie])
    case 'listePonderee':
      return parseListePositionnelle(
        champ,
        champ.acceptLegacyBinary &&
          champ.items.length > 1 &&
          partie.length === champ.items.length &&
          /^[01]+$/.test(partie)
          ? [...partie]
          : partie.split(SEPARATEUR_ITEMS),
      )
    case 'listePondereeOrdonnee': {
      const [drapeau, liste] = partie.split(SEPARATEUR_ORDRE)
      const items: ItemPondere[] = []
      const dejaVus = new Set<number>()
      for (const morceau of (liste ?? '').split(SEPARATEUR_ITEMS)) {
        const [indiceBrut, poidsBrut] = morceau.split(SEPARATEUR_POIDS)
        const indice = Number.parseInt(indiceBrut)
        const poids = Number.parseInt(poidsBrut)
        const reference = champ.items[indice]
        if (reference === undefined || dejaVus.has(indice)) continue
        dejaVus.add(indice)
        items.push({
          nom: reference.nom,
          label: reference.label,
          poids: Number.isNaN(poids)
            ? poidsDeclare(champ, reference)
            : Math.max(0, poids),
        })
      }
      // Les items absents de l'URL (formulaire enrichi depuis) reprennent leur défaut.
      champ.items.forEach((reference, indice) => {
        if (dejaVus.has(indice)) return
        items.push({
          nom: reference.nom,
          label: reference.label,
          poids: poidsDeclare(champ, reference),
        })
      })
      return { ordre: drapeau === '1', items }
    }
  }
}

/**
 * Désérialise les valeurs d'un formulaire complexe depuis le contenu de `this.sup`.
 */
export function parseFormulaireComplexe(
  formulaire: FormulaireComplexe,
  sup: unknown,
): ValeursFormulaireComplexe {
  const parties =
    sup === undefined || sup === null || sup === false || sup === ''
      ? []
      : String(sup).split(SEPARATEUR_CHAMPS)
  const valeurs: ValeursFormulaireComplexe = {}
  formulaire.champs.forEach((champ, index) => {
    valeurs[champ.nom] = parseChamp(champ, parties[index])
  })
  return valeurs
}

/**
 * Items réellement utilisables : ceux qui sont cochés, sinon ceux que l'exercice déclare
 * cochés, sinon tous. Un exercice ne doit jamais rester sans question à générer.
 */
function itemsEffectifs(
  items: ItemPondere[],
  itemsDeReference: ItemPondere[],
): ItemPondere[] {
  const actifs = items.filter((item) => item.poids > 0)
  if (actifs.length > 0) return actifs
  const references = itemsDeReference.filter((item) => item.poids > 0)
  if (references.length > 0) return references
  return items.map((item) => ({ ...item, poids: 1 }))
}

/**
 * Nombre de questions attribué à chaque item, proportionnellement à son poids.
 *
 * La somme vaut exactement `taille` : les questions qui ne tombent pas juste sont
 * attribuées aux plus grandes parts fractionnaires (méthode des plus forts restes), à
 * égalité au premier item dans l'ordre reçu.
 */
export function repartitionExacte(
  items: ItemPondere[],
  taille: number,
  itemsDeReference: ItemPondere[] = [],
): { nom: string; nombre: number }[] {
  const effectifs = itemsEffectifs(items, itemsDeReference)
  const total = effectifs.reduce((somme, item) => somme + item.poids, 0)
  if (taille <= 0 || total === 0) return []
  const parts = effectifs.map((item, index) => {
    const exact = (taille * item.poids) / total
    return { index, nom: item.nom, nombre: Math.floor(exact), reste: exact % 1 }
  })
  const restant = taille - parts.reduce((somme, part) => somme + part.nombre, 0)
  const parRestesDecroissants = [...parts].sort(
    (a, b) => b.reste - a.reste || a.index - b.index,
  )
  for (let k = 0; k < restant; k++) parRestesDecroissants[k].nombre++
  return parts.map((part) => ({ nom: part.nom, nombre: part.nombre }))
}

/**
 * Répartit `taille` questions entre les items d'une liste, proportionnellement à leurs
 * poids, dans un ordre aléatoire (dépendant de la graine de l'exercice).
 */
export function repartitionPonderee(
  items: ItemPondere[],
  taille: number,
  itemsDeReference: ItemPondere[] = [],
): string[] {
  return shuffle(repartitionPondereeOrdonnee(items, taille, itemsDeReference))
}

/**
 * Répartit `taille` questions entre les items d'une liste en respectant l'ordre reçu :
 * les questions sont regroupées par item, chaque bloc étant proportionnel au poids.
 *
 * @example
 * // poids 1, 1, 1 sur 5 questions
 * repartitionPondereeOrdonnee(items, 5) // ['m', 'm', 'L', 'L', 'g']
 * // poids 3, 1, 1 sur 5 questions
 * repartitionPondereeOrdonnee(items, 5) // ['m', 'm', 'm', 'L', 'g']
 */
export function repartitionPondereeOrdonnee(
  items: ItemPondere[],
  taille: number,
  itemsDeReference: ItemPondere[] = [],
): string[] {
  return repartitionExacte(items, taille, itemsDeReference).flatMap((part) =>
    Array<string>(part.nombre).fill(part.nom),
  )
}

/**
 * Accès typé aux valeurs d'un formulaire complexe depuis un exercice.
 *
 * @example
 * const params = lireFormulaireComplexe(monFormulaire, this.sup)
 * if (params.case('decimaux')) { ... }
 * const unites = params.repartition('unites', this.nbQuestions)
 */
export class ParametresFormulaireComplexe {
  private readonly formulaire: FormulaireComplexe
  private readonly valeurs: ValeursFormulaireComplexe

  constructor(formulaire: FormulaireComplexe, sup: unknown) {
    this.formulaire = formulaire
    this.valeurs = parseFormulaireComplexe(formulaire, sup)
  }

  private champListe(nom: string): ChampListeQuelconque {
    const champ = this.formulaire.champs.find((c) => c.nom === nom)
    if (champ === undefined) {
      throw new Error(`Champ « ${nom} » absent du formulaire complexe`)
    }
    if (!estChampListe(champ)) {
      throw new Error(`Le champ « ${nom} » n'est pas une liste`)
    }
    return champ
  }

  /** Valeur d'une case à cocher. */
  case(nom: string): boolean {
    return this.valeurs[nom] === true
  }

  /** Valeur (identifiant de l'option) d'un champ de sélection. */
  selection(nom: string): string {
    return String(this.valeurs[nom] ?? '')
  }

  /** Valeur entière d'un champ nombre. */
  nombre(nom: string): number {
    return Number(this.valeurs[nom] ?? 0)
  }

  /** Items d'une liste, dans l'ordre affiché, items décochés (poids nul) compris. */
  liste(nom: string): ItemPondere[] {
    return itemsDeLaValeur(this.valeurs[nom])
  }

  /** Items cochés (poids strictement positif) d'une liste. */
  listeActive(nom: string): ItemPondere[] {
    return this.liste(nom).filter((item) => item.poids > 0)
  }

  /**
   * Items d'une liste tels que déclarés par l'exercice (poids par défaut, ordre de
   * déclaration), indépendamment de ce que l'enseignant a choisi. Utile pour filtrer
   * les items compatibles avec un autre réglage avant de répartir les questions :
   * voir `repartition()`.
   */
  declares(nom: string): ItemPondere[] {
    return itemsParDefaut(this.champListe(nom))
  }

  /**
   * `true` si l'enseignant a coché « tenir compte de l'ordre » d'une liste pondérée
   * ordonnée. Toujours `false` pour les autres types de listes.
   */
  ordreImpose(nom: string): boolean {
    return ordreDeLaValeur(this.valeurs[nom])
  }

  /**
   * Répartit `taille` questions selon les poids : dans l'ordre affiché si la case
   * « tenir compte de l'ordre » est cochée, au hasard sinon.
   */
  repartition(nom: string, taille: number): string[] {
    return this.ordreImpose(nom)
      ? this.repartitionOrdonnee(nom, taille)
      : repartitionPonderee(
          this.liste(nom),
          taille,
          itemsParDefaut(this.champListe(nom)),
        )
  }

  /** Répartition selon les poids, en respectant l'ordre affiché quoi qu'il arrive. */
  repartitionOrdonnee(nom: string, taille: number): string[] {
    return repartitionPondereeOrdonnee(
      this.liste(nom),
      taille,
      itemsParDefaut(this.champListe(nom)),
    )
  }

  /** Chaîne à stocker dans `this.sup` (utile pour figer les valeurs par défaut). */
  serialise(): string {
    return serialiseFormulaireComplexe(this.formulaire, this.valeurs)
  }
}

/**
 * Lit les paramètres d'un formulaire complexe depuis la valeur de `this.sup`.
 */
export function lireFormulaireComplexe(
  formulaire: FormulaireComplexe,
  sup: unknown,
): ParametresFormulaireComplexe {
  return new ParametresFormulaireComplexe(formulaire, sup)
}
