import { orangeMathalea } from '../colors'
import { context } from '../../modules/context'
import type { IExercice } from '../types'
import MathaleaCustomElement, {
  registerMathaleaCustomElement,
} from './MathaleaCustomElement'

/**
 * Custom element « schéma en barre » : les six schémas de modélisation des
 * problèmes arithmétiques (additif ou multiplicatif ; parties-tout, comparaison
 * ou comparaison avec total), dont tous les textes sont éditables, et trois
 * schémas de problèmes à plusieurs étapes.
 *
 * Trois rendus : HTML (interactif ou figé), LaTeX (TikZ) et Typst.
 * La recette côté exercice est dans `addSchemaEnBarre()` ; l'outil du
 * professeur est l'exercice `P030`.
 */

export const TYPES_SCHEMA_EN_BARRE = [
  'additif-parties-tout',
  'additif-comparaison',
  'additif-comparaison-total',
  'multiplicatif-parties-tout',
  'multiplicatif-comparaison',
  'multiplicatif-comparaison-total',
] as const
export type SchemaEnBarreType = (typeof TYPES_SCHEMA_EN_BARRE)[number]

/**
 * Schémas des problèmes à plusieurs étapes (exercice `6N4A-2`). Ils ne sont pas
 * proposés dans le choix des six vignettes : un exercice les impose ou les
 * dessine avec `schemaEnBarreFige()`.
 */
export const TYPES_SCHEMA_EN_BARRE_ETAPES = [
  'additif-trois-parties',
  'additif-somme-comparaison',
  'multiplicatif-avec-reste',
] as const
export type SchemaEnBarreTypeEtapes =
  (typeof TYPES_SCHEMA_EN_BARRE_ETAPES)[number]
export type SchemaEnBarreTypeEtendu =
  SchemaEnBarreType | SchemaEnBarreTypeEtapes

export const CLES_TEXTE_SCHEMA = [
  'tout',
  'partieA',
  'partieB',
  'partieC',
  'difference',
  'part',
  'nombreDeParts',
  'etiquetteA',
  'etiquetteB',
  'nFois',
  'partPartage',
  'nombrePartages',
  'reste',
] as const
export type CleTexteSchema = (typeof CLES_TEXTE_SCHEMA)[number]

/** 2 à 5 rectangles dessinés, ou `'plus'` : trois rectangles puis des pointillés. */
export type NbRectangles = 2 | 3 | 4 | 5 | 'plus'
export const NB_RECTANGLES_CHOIX: NbRectangles[] = [2, 3, 4, 5, 'plus']

export type TextesSchema = Record<CleTexteSchema, string>

export type SchemaEnBarreState = {
  type: SchemaEnBarreTypeEtendu | null
  textes: TextesSchema
  nbRectangles: NbRectangles
}

/**
 * Schéma attendu par un exercice : seuls les textes renseignés (non vides)
 * sont vérifiés ; `nbRectangles` absent n'est pas vérifié (par exemple quand
 * le nombre de parts est l'inconnue du problème).
 */
export type SchemaEnBarreAttendu = {
  type: SchemaEnBarreTypeEtendu
  textes: Partial<TextesSchema>
  nbRectangles?: NbRectangles
  /**
   * Textes affichés dans le schéma de la correction mais non vérifiés
   * (par exemple les étiquettes A et B, que l'élève nomme comme il veut).
   */
  textesIndicatifs?: Partial<TextesSchema>
}

export const TITRES_SCHEMA: Record<SchemaEnBarreTypeEtendu, string> = {
  'additif-parties-tout': 'Additif de parties-tout',
  'additif-comparaison': 'Additif de comparaison',
  'additif-comparaison-total': 'Additif de comparaison avec total',
  'multiplicatif-parties-tout': 'Multiplicatif de parties-tout',
  'multiplicatif-comparaison': 'Multiplicatif de comparaison',
  'multiplicatif-comparaison-total': 'Multiplicatif de comparaison avec total',
  'additif-trois-parties': 'Additif de parties-tout à trois parties',
  'additif-somme-comparaison': "Comparaison d'une somme et d'une quantité",
  'multiplicatif-avec-reste': 'Multiplicatif puis partage avec reste',
}

/** Libellés génériques, affichés dans les vignettes du choix et en `aria-label` des champs. */
export const LIBELLES_TEXTE: TextesSchema = {
  tout: 'Tout',
  partieA: 'Partie A',
  partieB: 'Partie B',
  partieC: 'Partie C',
  difference: 'Différence',
  part: 'Part',
  nombreDeParts: 'Nombre de parts',
  etiquetteA: 'A',
  etiquetteB: 'B',
  nFois: 'N fois',
  partPartage: 'Part du partage',
  nombrePartages: 'Nombre de parts du partage',
  reste: 'Reste',
}

/** Textes qui ont un sens dans chaque type de schéma. */
export const CLES_PAR_TYPE: Record<SchemaEnBarreTypeEtendu, CleTexteSchema[]> =
  {
    'additif-parties-tout': ['tout', 'partieA', 'partieB'],
    'additif-comparaison': ['partieA', 'partieB', 'difference'],
    'additif-comparaison-total': ['partieA', 'partieB', 'difference', 'tout'],
    'multiplicatif-parties-tout': ['tout', 'part', 'nombreDeParts'],
    'multiplicatif-comparaison': ['etiquetteA', 'etiquetteB', 'part', 'nFois'],
    'multiplicatif-comparaison-total': [
      'etiquetteA',
      'etiquetteB',
      'part',
      'nFois',
      'tout',
    ],
    'additif-trois-parties': ['tout', 'partieA', 'partieB', 'partieC'],
    'additif-somme-comparaison': [
      'partieA',
      'partieB',
      'partieC',
      'difference',
    ],
    'multiplicatif-avec-reste': [
      'nombreDeParts',
      'part',
      'partPartage',
      'reste',
      'nombrePartages',
    ],
  }

/** Les comparaisons avec total ajoutent une accolade « Tout » (A + B) à droite. */
function estComparaisonAvecTotal(type: SchemaEnBarreTypeEtendu): boolean {
  return (
    type === 'additif-comparaison-total' ||
    type === 'multiplicatif-comparaison-total'
  )
}

const NB_RECTANGLES_PAR_DEFAUT: NbRectangles = 3

export function textesVides(): TextesSchema {
  return Object.fromEntries(
    CLES_TEXTE_SCHEMA.map((cle) => [cle, '']),
  ) as TextesSchema
}

function estTypeSchema(value: unknown): value is SchemaEnBarreTypeEtendu {
  return (
    typeof value === 'string' &&
    (
      [...TYPES_SCHEMA_EN_BARRE, ...TYPES_SCHEMA_EN_BARRE_ETAPES] as string[]
    ).includes(value)
  )
}

/** Le nombre de rectangles ne se règle que sur les schémas multiplicatifs simples. */
function aNombreDeRectanglesReglable(type: SchemaEnBarreTypeEtendu): boolean {
  return type.startsWith('multiplicatif') && type !== 'multiplicatif-avec-reste'
}

function estNbRectangles(value: unknown): value is NbRectangles {
  return value === 'plus' || (NB_RECTANGLES_CHOIX as unknown[]).includes(value)
}

function lisCles(value: string | null): CleTexteSchema[] {
  if (value == null) return []
  try {
    const cles: unknown = JSON.parse(value)
    return Array.isArray(cles)
      ? cles.filter((cle): cle is CleTexteSchema =>
          (CLES_TEXTE_SCHEMA as readonly unknown[]).includes(cle),
        )
      : []
  } catch {
    return []
  }
}

function normaliseTextes(value: unknown): TextesSchema {
  const textes = textesVides()
  if (value == null || typeof value !== 'object') return textes
  for (const cle of CLES_TEXTE_SCHEMA) {
    const texte = (value as Record<string, unknown>)[cle]
    if (typeof texte === 'string') textes[cle] = texte
    else if (typeof texte === 'number') textes[cle] = String(texte)
  }
  return textes
}

/** Relit un état (objet ou JSON), en tolérant les champs manquants. */
export function parseSchemaEnBarreState(
  value: unknown,
): SchemaEnBarreState | null {
  if (typeof value === 'string') {
    if (value.trim() === '') return null
    try {
      return parseSchemaEnBarreState(JSON.parse(value))
    } catch {
      return null
    }
  }
  if (value == null || typeof value !== 'object') return null
  const candidate = value as Partial<SchemaEnBarreState> & {
    toutVisible?: unknown
  }
  const textes = normaliseTextes(candidate.textes)
  let type = estTypeSchema(candidate.type) ? candidate.type : null
  // Les anciennes copies affichaient le tout d'une comparaison à la demande
  // (`toutVisible`), ou dès qu'il portait un texte : c'est le schéma avec total.
  if (candidate.toutVisible === true || textes.tout !== '') {
    if (type === 'additif-comparaison') type = 'additif-comparaison-total'
    if (type === 'multiplicatif-comparaison') {
      type = 'multiplicatif-comparaison-total'
    }
  }
  return {
    type,
    textes,
    nbRectangles: estNbRectangles(candidate.nbRectangles)
      ? candidate.nbRectangles
      : NB_RECTANGLES_PAR_DEFAUT,
  }
}

function parseSchemaAttendu(value: unknown): SchemaEnBarreAttendu | null {
  if (typeof value === 'string') {
    try {
      return parseSchemaAttendu(JSON.parse(value))
    } catch {
      return null
    }
  }
  if (value == null || typeof value !== 'object') return null
  const candidate = value as Partial<SchemaEnBarreAttendu>
  if (!estTypeSchema(candidate.type)) return null
  const textes: Partial<TextesSchema> = {}
  const source = candidate.textes ?? {}
  for (const cle of CLES_TEXTE_SCHEMA) {
    const texte = (source as Record<string, unknown>)[cle]
    if (typeof texte === 'string' && texte.trim() !== '') textes[cle] = texte
    else if (typeof texte === 'number') textes[cle] = String(texte)
  }
  return {
    type: candidate.type,
    textes,
    nbRectangles: estNbRectangles(candidate.nbRectangles)
      ? candidate.nbRectangles
      : undefined,
  }
}

/* -------------------------------------------------------------------------- */
/*                         Comparaison de deux schémas                         */
/* -------------------------------------------------------------------------- */

/** Les nombres contenus dans un texte (`3 €`, `Matin\n1 200,5 km`). */
function nombresDans(texte: string): number[] {
  const nombres = texte
    .replace(/[\u00a0\u202f]/g, ' ')
    .match(/-?\d+(?: \d{3})*(?:[.,]\d+)?/g)
  if (nombres == null) return []
  return nombres.map((nombre) =>
    Number(nombre.replace(/ /g, '').replace(',', '.')),
  )
}

/**
 * Un nombre est bien placé si le texte de l'élève contient le nombre du
 * texte attendu. Les textes eux-mêmes (grandeur, unité, `?`) ne sont pas
 * vérifiés : un texte attendu sans nombre est toujours accepté.
 */
export function nombreBienPlace(attendu: string, donne: string): boolean {
  const nombresAttendus = nombresDans(attendu)
  if (nombresAttendus.length !== 1) return true
  return nombresDans(donne).some(
    (nombre) => Math.abs(nombre - nombresAttendus[0]) < 1e-9,
  )
}

/**
 * Les textes dont le nombre est vérifié, c'est-à-dire ceux qui portent un
 * seul nombre (voir `nombreBienPlace()`). Ce sont les nombres que l'élève doit
 * obligatoirement placer pour que son schéma soit compté juste.
 */
export function clesNombresVerifies(
  textes: Partial<TextesSchema>,
): CleTexteSchema[] {
  return (Object.keys(textes) as CleTexteSchema[]).filter(
    (cle) => nombresDans(textes[cle] ?? '').length === 1,
  )
}

/* -------------------------------------------------------------------------- */
/*                         Nombres mis en évidence                             */
/* -------------------------------------------------------------------------- */

/**
 * Les nombres à mettre en évidence (en orange, dans la correction) sont
 * encadrés par deux caractères privés avant le rendu ; chaque rendu les
 * remplace, après protection du texte, par sa propre mise en forme.
 */
const DEBUT_EVIDENCE = '\uE000'
const FIN_EVIDENCE = '\uE001'
/**
 * Dans un texte du rendu HTML, marque la place d'un champ de saisie fourni par
 * l'exercice (voir `champs` dans `schemaEnBarreFige()`).
 */
export const MARQUE_CHAMP_SCHEMA = '\uE002'
const REGEXP_BALISES_EVIDENCE = new RegExp(
  `${DEBUT_EVIDENCE}(.*?)${FIN_EVIDENCE}`,
  'g',
)
const REGEXP_NOMBRE = /-?\d+(?:[ \u00a0\u202f]\d{3})*(?:[.,]\d+)?/g

function textesAvecEvidence(
  textes: TextesSchema,
  cles: CleTexteSchema[],
): TextesSchema {
  if (cles.length === 0) return textes
  const resultat = { ...textes }
  for (const cle of cles) {
    resultat[cle] = textes[cle].replace(
      REGEXP_NOMBRE,
      (nombre) => `${DEBUT_EVIDENCE}${nombre}${FIN_EVIDENCE}`,
    )
  }
  return resultat
}

export type ResultatComparaisonSchema = {
  isOk: boolean
  typeOk: boolean
  nbRectanglesOk: boolean
  /** Textes dont le nombre attendu n'est pas retrouvé (après l'éventuel échange A/B). */
  clesFausses: CleTexteSchema[]
  /** `true` si le schéma est accepté avec les parties A et B échangées. */
  echangeAB: boolean
}

function clesFaussesPour(
  attendu: SchemaEnBarreAttendu,
  textes: TextesSchema,
): CleTexteSchema[] {
  return (Object.keys(attendu.textes) as CleTexteSchema[]).filter(
    (cle) => !nombreBienPlace(attendu.textes[cle] ?? '', textes[cle]),
  )
}

/**
 * Compare le schéma d'un élève au schéma attendu : le type, le nombre de
 * rectangles s'il est attendu, et la place des nombres. Dans un schéma additif
 * parties-tout, les deux parties jouent le même rôle : leur échange est
 * accepté.
 */
export function comparerSchemas(
  attendu: SchemaEnBarreAttendu,
  donne: SchemaEnBarreState,
): ResultatComparaisonSchema {
  const typeOk = donne.type === attendu.type
  const nbRectanglesOk =
    !attendu.type.startsWith('multiplicatif') ||
    attendu.nbRectangles == null ||
    attendu.nbRectangles === donne.nbRectangles
  let clesFausses = clesFaussesPour(attendu, donne.textes)
  let echangeAB = false
  if (attendu.type === 'additif-parties-tout' && clesFausses.length > 0) {
    const echange: TextesSchema = {
      ...donne.textes,
      partieA: donne.textes.partieB,
      partieB: donne.textes.partieA,
    }
    const clesFaussesEchange = clesFaussesPour(attendu, echange)
    if (clesFaussesEchange.length < clesFausses.length) {
      clesFausses = clesFaussesEchange
      echangeAB = true
    }
  }
  return {
    isOk: typeOk && nbRectanglesOk && clesFausses.length === 0,
    typeOk,
    nbRectanglesOk,
    clesFausses,
    echangeAB,
  }
}

/* -------------------------------------------------------------------------- */
/*                                  Géométrie                                  */
/* -------------------------------------------------------------------------- */

/**
 * Dimensions communes aux trois rendus, en `em` pour le HTML (ce qui permet
 * les vignettes réduites par un simple `font-size`), converties en cm pour
 * LaTeX et en pt pour Typst.
 */
const GEO = {
  hauteurRect: 2.2,
  hauteurRectDeuxLignes: 3.4,
  hauteurRectTroisLignes: 4.6,
  largeurA: 7,
  largeurB: 8,
  largeurGrandeComparaison: 12,
  largeurPetiteComparaison: 6,
  largeurPart: 5,
  ecartParts: 0.25,
  largeurPointilles: 2.5,
  // Trois parties : assez larges pour une étiquette et un champ de saisie.
  largeurTroisParties: 8,
  // Somme comparée à une quantité : a + b = c + d.
  sommeA: 8,
  sommeB: 12.5,
  sommeC: 12,
  sommeDifference: 8.5,
  // Multiplicatif avec reste : largeur minimale d'une part (assez pour un champ
  // de saisie et son unité à l'écran, pour un texte sur deux lignes au papier).
  largeurMinPartEcran: 5.75,
  largeurMinPartPapier: 5,
  largeurMinReste: 1.5,
  largeurMinPointillesReste: 2.5,
}

/**
 * Les nombres d'un produit partagé en parts égales avec un reste :
 * `nbHaut × partHaut = nbBas × partBas + reste`.
 */
export type RepartitionAvecReste = {
  nbHaut: number
  partHaut: number
  nbBas: number
  partBas: number
  reste: number
}

/** Exemple dessiné quand un schéma avec reste n'a pas encore de nombres. */
const REPARTITION_PAR_DEFAUT: RepartitionAvecReste = {
  nbHaut: 4,
  partHaut: 6,
  nbBas: 3,
  partBas: 7,
  reste: 3,
}

const NB_PARTS_MAX_DESSINEES = 5
/** Écart minimal et maximal entre les largeurs de parts quand tout n'est pas à l'échelle. */
const RAPPORT_MIN_PARTS = 1.15
const RAPPORT_MAX_PARTS = 1.6
/** Au-delà, les rectangles d'une rangée complète se rapprochent du rapport minimal. */
const LARGEUR_CIBLE_RANGEE = 32

/** Toutes les parts jusqu'à 5, sinon deux rectangles, des pointillés et le dernier. */
function dispositionAvecCoupure(nb: number): {
  avant: number
  pointilles: boolean
  apres: number
} {
  return nb <= NB_PARTS_MAX_DESSINEES
    ? { avant: nb, pointilles: false, apres: 0 }
    : { avant: 2, pointilles: true, apres: 1 }
}

export type GeometrieAvecReste = {
  largeurPartHaut: number
  largeurPartBas: number
  /** Largeur des pointillés de chaque rangée (0 si toutes les parts sont dessinées). */
  pointillesHaut: number
  pointillesBas: number
  largeurReste: number
  /** Largeur commune des deux rangées, reste compris. */
  largeurTotale: number
  /** Largeur des parts du bas, sans le reste : celle de la flèche du dessous. */
  largeurPartsBas: number
}

/**
 * Largeurs du schéma avec reste, en `em`. Dans une rangée, toutes les parts ont
 * la même largeur et la plus grande part de l'énoncé est la plus large. Les deux
 * rangées finissent au même endroit : quand toutes les parts sont dessinées, tout
 * est à l'échelle ; sinon les pointillés occupent la place des parts non dessinées.
 *
 * Chaque « pas » contient une part et l'écart qui la suit.
 */
export function geometrieAvecReste(
  { nbHaut, partHaut, nbBas, partBas, reste }: RepartitionAvecReste,
  largeurMinPart: number,
): GeometrieAvecReste {
  const ecart = GEO.ecartParts
  const pasMin = largeurMinPart + ecart
  const pasResteMin = GEO.largeurMinReste + ecart
  const pasPointillesMin = GEO.largeurMinPointillesReste + ecart
  const coupeHaut = nbHaut > NB_PARTS_MAX_DESSINEES
  const coupeBas = nbBas > NB_PARTS_MAX_DESSINEES
  let pasHaut: number
  let pasBas: number
  let pasReste: number
  let total: number

  if (!coupeHaut && !coupeBas) {
    const totalInitial = Math.max(nbHaut * pasMin, nbBas * pasMin + pasResteMin)
    pasReste = Math.max(
      pasResteMin,
      (totalInitial * reste) / (nbHaut * partHaut),
    )
    total = Math.max(totalInitial, nbBas * pasMin + pasReste)
    pasHaut = total / nbHaut
    pasBas = (total - pasReste) / nbBas
  } else {
    const partHautPlusGrande = partHaut > partBas
    const nbRangeeLarge = partHautPlusGrande ? nbHaut : nbBas
    const rapportPlafond =
      nbRangeeLarge <= NB_PARTS_MAX_DESSINEES
        ? Math.max(
            RAPPORT_MIN_PARTS,
            Math.min(
              RAPPORT_MAX_PARTS,
              LARGEUR_CIBLE_RANGEE / (nbRangeeLarge * pasMin),
            ),
          )
        : RAPPORT_MAX_PARTS
    const rapport =
      partHaut === partBas
        ? 1
        : Math.max(
            RAPPORT_MIN_PARTS,
            Math.min(
              rapportPlafond,
              Math.max(partHaut, partBas) / Math.min(partHaut, partBas),
            ),
          )
    pasHaut = partHautPlusGrande ? pasMin * rapport : pasMin
    pasBas = partHaut < partBas ? pasMin * rapport : pasMin
    pasReste = Math.max(
      pasResteMin,
      Math.min(1.5 * pasBas, (pasBas * reste) / partBas),
    )
    const dessinHaut = coupeHaut ? 3 : nbHaut
    const dessinBas = coupeBas ? 3 : nbBas
    total = Math.max(
      dessinHaut * pasHaut + (coupeHaut ? pasPointillesMin : 0),
      dessinBas * pasBas + (coupeBas ? pasPointillesMin : 0) + pasReste,
    )
    // Une rangée dessinée entièrement occupe toute la largeur.
    if (!coupeHaut) pasHaut = total / nbHaut
    if (!coupeBas) pasBas = (total - pasReste) / nbBas
  }
  const pointilles = (reserve: number) => Math.max(0, reserve - ecart)
  return {
    largeurPartHaut: pasHaut - ecart,
    largeurPartBas: pasBas - ecart,
    pointillesHaut: coupeHaut ? pointilles(total - 3 * pasHaut) : 0,
    pointillesBas: coupeBas ? pointilles(total - pasReste - 3 * pasBas) : 0,
    largeurReste: pasReste - ecart,
    largeurTotale: total - ecart,
    largeurPartsBas: total - pasReste - ecart,
  }
}

/** Nombre de rectangles réellement dessinés et présence des pointillés. */
function dispositionParts(nbRectangles: NbRectangles): {
  avant: number
  pointilles: boolean
  apres: number
} {
  if (nbRectangles !== 'plus')
    return { avant: nbRectangles, pointilles: false, apres: 0 }
  // Les pointillés précèdent le dernier rectangle, qui ferme la barre.
  return { avant: 3, pointilles: true, apres: 1 }
}

function largeurLigneParts(nbRectangles: NbRectangles): number {
  const { avant, pointilles, apres } = dispositionParts(nbRectangles)
  const nbRect = avant + apres
  const nbEcarts = nbRect - 1 + (pointilles ? 1 : 0)
  return (
    nbRect * GEO.largeurPart +
    nbEcarts * GEO.ecartParts +
    (pointilles ? GEO.largeurPointilles : 0)
  )
}

/* -------------------------------------------------------------------------- */
/*                                 Rendu HTML                                  */
/* -------------------------------------------------------------------------- */

function echappeHtml(texte: string): string {
  return texte
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

const SVG_ACCOLADE_HAUT =
  '<svg class="schema-en-barre__svg" viewBox="0 0 100 12" preserveAspectRatio="none" aria-hidden="true"><path d="M0,12 C0,7 3,6 8,6 L44,6 C48,6 50,3 50,0 C50,3 52,6 56,6 L92,6 C97,6 100,7 100,12" fill="none" stroke="currentColor" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>'
const SVG_ACCOLADE_DROITE =
  '<svg class="schema-en-barre__svg" viewBox="0 0 12 100" preserveAspectRatio="none" aria-hidden="true"><path d="M0,0 C5,0 6,3 6,8 L6,44 C6,48 9,50 12,50 C9,50 6,52 6,56 L6,92 C6,97 5,100 0,100" fill="none" stroke="currentColor" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>'

/** Le champ grandit avec son contenu (une ligne, puis deux). */
function ajusteHauteur(champ: HTMLTextAreaElement): void {
  champ.style.height = 'auto'
  if (champ.scrollHeight > 0) champ.style.height = `${champ.scrollHeight}px`
}

type OptionsRenduHtml = {
  editable: boolean
  /** Textes affichés quand le texte est vide (vignettes du choix). */
  placeholdersVisibles?: boolean
  /** HTML des champs de saisie, placés à l'endroit de `MARQUE_CHAMP_SCHEMA`. */
  champs?: Partial<Record<CleTexteSchema, string>>
  /** Les nombres qui fixent le dessin du schéma avec reste. */
  repartition?: RepartitionAvecReste
}

function em(valeur: number): string {
  return `${Number(valeur.toFixed(3))}em`
}

function champHtml(
  cle: CleTexteSchema,
  textes: TextesSchema,
  options: OptionsRenduHtml,
  classe = '',
): string {
  const libelle = LIBELLES_TEXTE[cle]
  const texte = textes[cle]
  if (options.editable) {
    // Un textarea plutôt qu'un input : un texte long passe sur deux lignes.
    return `<textarea class="schema-en-barre__champ ${classe}" rows="1" data-cle="${cle}" aria-label="${echappeHtml(libelle)}" autocomplete="off" spellcheck="false">${echappeHtml(texte)}</textarea>`
  }
  const affiche =
    texte === '' && options.placeholdersVisibles === true ? libelle : texte
  const html = echappeHtml(affiche)
    .replace(
      REGEXP_BALISES_EVIDENCE,
      `<span style="color:${orangeMathalea};font-weight:bold">$1</span>`,
    )
    .replaceAll('\n', '<br>')
    .replace(MARQUE_CHAMP_SCHEMA, () => options.champs?.[cle] ?? '')
  return `<span class="schema-en-barre__texte ${classe}" data-cle="${cle}">${html}</span>`
}

function rectHtml(
  cle: CleTexteSchema,
  largeur: number,
  variante: 'a' | 'b',
  textes: TextesSchema,
  options: OptionsRenduHtml,
  style = '',
): string {
  return `<div class="schema-en-barre__rect schema-en-barre__rect--${variante}" style="width:${em(largeur)};${style}">${champHtml(cle, textes, options)}</div>`
}

function accoladeHautHtml(
  cle: CleTexteSchema,
  largeur: number,
  textes: TextesSchema,
  options: OptionsRenduHtml,
  style = '',
): string {
  return `<div class="schema-en-barre__accolade schema-en-barre__accolade--haut" style="width:${em(largeur)};${style}"><div class="schema-en-barre__etiquette">${champHtml(cle, textes, options)}</div>${SVG_ACCOLADE_HAUT}</div>`
}

const SVG_POINTILLES = `<svg class="schema-en-barre__pointilles" style="width:${em(GEO.largeurPointilles)}" viewBox="0 0 40 4" aria-hidden="true"><path d="M2,2 H38" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="1 5"/></svg>`

function ligneParts(
  nbRectangles: NbRectangles,
  textes: TextesSchema,
  options: OptionsRenduHtml,
  style = '',
): string {
  const { avant, pointilles, apres } = dispositionParts(nbRectangles)
  const rect = () => rectHtml('part', GEO.largeurPart, 'a', textes, options)
  const morceaux = [
    ...Array.from({ length: avant }, rect),
    ...(pointilles ? [SVG_POINTILLES] : []),
    ...Array.from({ length: apres }, rect),
  ]
  return `<div class="schema-en-barre__ligne schema-en-barre__ligne--parts" style="${style}">${morceaux.join('')}</div>`
}

/** L'accolade « Tout » à droite des deux rangées d'une comparaison avec total. */
function accoladeToutHtml(
  textes: TextesSchema,
  options: OptionsRenduHtml,
): string {
  return `<div class="schema-en-barre__accolade schema-en-barre__accolade--droite" style="grid-column:3;grid-row:1/3">${SVG_ACCOLADE_DROITE}</div><div class="schema-en-barre__etiquette schema-en-barre__etiquette--cote" style="grid-column:4;grid-row:1/3">${champHtml('tout', textes, options)}</div>`
}

/** Une rangée de parts égales : seule la première porte le texte. */
function rangeePartsHtml(
  cle: CleTexteSchema,
  nb: number,
  largeur: number,
  largeurPointilles: number,
  textes: TextesSchema,
  options: OptionsRenduHtml,
): string {
  const { avant, pointilles, apres } = dispositionAvecCoupure(nb)
  const vide = `<div class="schema-en-barre__rect schema-en-barre__rect--a" style="width:${em(largeur)}"></div>`
  return [
    rectHtml(cle, largeur, 'a', textes, options),
    ...Array.from({ length: avant - 1 }, () => vide),
    ...(pointilles
      ? [
          `<div class="schema-en-barre__pointilles-reste" style="width:${em(largeurPointilles)}"></div>`,
        ]
      : []),
    ...Array.from({ length: apres }, () => vide),
  ].join('')
}

/** Le HTML d'un schéma seul, sans le choix du type ni les réglages. */
export function schemaHtml(
  type: SchemaEnBarreTypeEtendu,
  textes: TextesSchema,
  nbRectangles: NbRectangles,
  options: OptionsRenduHtml,
): string {
  const classe = `schema-en-barre__schema schema-en-barre__schema--${type}`
  const tout = estComparaisonAvecTotal(type)
    ? accoladeToutHtml(textes, options)
    : ''
  switch (type) {
    case 'additif-parties-tout': {
      const largeur = GEO.largeurA + GEO.largeurB
      return `<div class="${classe}"><div class="schema-en-barre__colonne">${accoladeHautHtml('tout', largeur, textes, options)}<div class="schema-en-barre__ligne">${rectHtml('partieA', GEO.largeurA, 'a', textes, options)}${rectHtml('partieB', GEO.largeurB, 'b', textes, options)}</div></div></div>`
    }
    case 'additif-comparaison':
    case 'additif-comparaison-total': {
      const petite = GEO.largeurPetiteComparaison
      const grande = GEO.largeurGrandeComparaison
      return `<div class="${classe}"><div class="schema-en-barre__grille" style="grid-template-columns:${em(petite)} ${em(grande - petite)} auto auto">${rectHtml('partieA', grande, 'a', textes, options, 'grid-column:1/3;grid-row:1')}${rectHtml('partieB', petite, 'b', textes, options, 'grid-column:1;grid-row:2')}<div class="schema-en-barre__difference" style="grid-column:2;grid-row:2"><div class="schema-en-barre__fleche"></div></div><div class="schema-en-barre__etiquette schema-en-barre__etiquette--sous" style="grid-column:2;grid-row:3">${champHtml('difference', textes, options)}</div>${tout}</div></div>`
    }
    case 'multiplicatif-parties-tout': {
      const largeur = largeurLigneParts(nbRectangles)
      return `<div class="${classe}"><div class="schema-en-barre__colonne">${accoladeHautHtml('tout', largeur, textes, options)}${ligneParts(nbRectangles, textes, options)}<div class="schema-en-barre__fleche" style="width:${em(largeur)}"></div><div class="schema-en-barre__etiquette schema-en-barre__etiquette--sous">${champHtml('nombreDeParts', textes, options)}</div></div></div>`
    }
    case 'multiplicatif-comparaison':
    case 'multiplicatif-comparaison-total': {
      const largeur = largeurLigneParts(nbRectangles)
      return `<div class="${classe}"><div class="schema-en-barre__grille" style="grid-template-columns:auto auto auto auto"><div class="schema-en-barre__etiquette schema-en-barre__etiquette--rangee" style="grid-column:1;grid-row:1">${champHtml('etiquetteA', textes, options)}</div><div class="schema-en-barre__ligne" style="grid-column:2;grid-row:1">${rectHtml('part', GEO.largeurPart, 'a', textes, options)}</div><div class="schema-en-barre__etiquette schema-en-barre__etiquette--rangee" style="grid-column:1;grid-row:2">${champHtml('etiquetteB', textes, options)}</div>${ligneParts(nbRectangles, textes, options, 'grid-column:2;grid-row:2')}<div class="schema-en-barre__fleche" style="grid-column:2;grid-row:3;width:${em(largeur)}"></div><div class="schema-en-barre__etiquette schema-en-barre__etiquette--sous" style="grid-column:2;grid-row:4">${champHtml('nFois', textes, options)}</div>${tout}</div></div>`
    }
    case 'additif-trois-parties': {
      const largeur = GEO.largeurTroisParties
      return `<div class="${classe}"><div class="schema-en-barre__colonne">${accoladeHautHtml('tout', 3 * largeur, textes, options)}<div class="schema-en-barre__ligne schema-en-barre__ligne--etiree">${rectHtml('partieA', largeur, 'a', textes, options)}${rectHtml('partieB', largeur, 'b', textes, options)}${rectHtml('partieC', largeur, 'a', textes, options)}</div></div></div>`
    }
    case 'additif-somme-comparaison': {
      const { sommeA, sommeB, sommeC, sommeDifference } = GEO
      return `<div class="${classe}"><div class="schema-en-barre__grille schema-en-barre__grille--etiree" style="grid-template-columns:${em(sommeA)} ${em(sommeC - sommeA)} ${em(sommeDifference)}">${rectHtml('partieA', sommeA, 'a', textes, options, 'grid-column:1;grid-row:1')}${rectHtml('partieB', sommeB, 'b', textes, options, 'grid-column:2/4;grid-row:1')}${rectHtml('partieC', sommeC, 'a', textes, options, 'grid-column:1/3;grid-row:2')}<div class="schema-en-barre__difference" style="grid-column:3;grid-row:2"><div class="schema-en-barre__fleche"></div></div><div class="schema-en-barre__etiquette schema-en-barre__etiquette--sous" style="grid-column:3;grid-row:3">${champHtml('difference', textes, options)}</div></div></div>`
    }
    case 'multiplicatif-avec-reste': {
      const repartition = options.repartition ?? REPARTITION_PAR_DEFAUT
      const geometrie = geometrieAvecReste(repartition, GEO.largeurMinPartEcran)
      const haut = rangeePartsHtml(
        'part',
        repartition.nbHaut,
        geometrie.largeurPartHaut,
        geometrie.pointillesHaut,
        textes,
        options,
      )
      const bas = rangeePartsHtml(
        'partPartage',
        repartition.nbBas,
        geometrie.largeurPartBas,
        geometrie.pointillesBas,
        textes,
        options,
      )
      const rectReste = `<div class="schema-en-barre__rect schema-en-barre__rect--b" style="width:${em(geometrie.largeurReste)}"></div>`
      // Le texte du reste précède celui du nombre de parts dans le code (l'ordre
      // de lecture des nombres), mais s'affiche à droite (`order` en CSS).
      const texteReste = `<div class="schema-en-barre__etiquette schema-en-barre__etiquette--reste">${champHtml('reste', textes, options)}</div>`
      const total = em(geometrie.largeurTotale)
      const partsBas = em(geometrie.largeurPartsBas)
      return `<div class="${classe}"><div class="schema-en-barre__colonne schema-en-barre__colonne--gauche"><div class="schema-en-barre__etiquette" style="width:${total}">${champHtml('nombreDeParts', textes, options)}</div><div class="schema-en-barre__fleche" style="width:${total}"></div><div class="schema-en-barre__ligne schema-en-barre__ligne--parts schema-en-barre__ligne--etiree">${haut}</div><div class="schema-en-barre__ligne schema-en-barre__ligne--parts schema-en-barre__ligne--etiree schema-en-barre__ligne--seconde">${bas}${rectReste}</div><div class="schema-en-barre__fleche" style="width:${partsBas}"></div><div class="schema-en-barre__textes-bas" style="width:${total}">${texteReste}<div class="schema-en-barre__etiquette schema-en-barre__etiquette--sous" style="flex:0 1 ${partsBas}">${champHtml('nombrePartages', textes, options)}</div></div></div></div>`
    }
  }
}

/* -------------------------------------------------------------------------- */
/*                                 Rendu LaTeX                                 */
/* -------------------------------------------------------------------------- */

/** 1 em du rendu HTML vaut 0,45 cm sur le papier. */
const CM_PAR_EM = 0.45
const COULEUR_A_TIKZ = '{rgb,255:red,33;green,109;blue,154}'
const COULEUR_B_TIKZ = '{rgb,255:red,95;green,174;blue,221}'

function cm(valeur: number): string {
  return Number((valeur * CM_PAR_EM).toFixed(3)).toString()
}

/** Texte saisi (chiffres, unités, prénoms) protégé pour LaTeX. */
export function echappeLatex(texte: string): string {
  return texte
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/([%$&#_{}])/g, '\\$1')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}')
    .replace(
      REGEXP_BALISES_EVIDENCE,
      `{\\bfseries\\color[HTML]{${orangeMathalea.replace('#', '')}}$1}`,
    )
}

/** Un texte de rectangle peut tenir sur deux lignes (`Roses\n6 fleurs`). */
function texteRectLatex(texte: string): string {
  return texte.split('\n').map(echappeLatex).join('\\\\')
}

/** Hauteur des rectangles : plus haute si un texte occupe deux lignes. */
function hauteurRect(textes: TextesSchema): number {
  return CLES_TEXTE_SCHEMA.some((cle) => textes[cle].includes('\n'))
    ? GEO.hauteurRectDeuxLignes
    : GEO.hauteurRect
}

/** Nombre de caractères d'une ligne au-delà duquel une étiquette revient à la ligne. */
const NB_CARACTERES_MAX_PAR_LIGNE = 14

/**
 * Sur le papier, la hauteur est fixée d'avance : dans les schémas à étapes, une
 * étiquette longue (« Ordinateur portable ») prend une ligne de plus que prévu.
 */
function hauteurRectImprime(
  type: SchemaEnBarreTypeEtendu,
  textes: TextesSchema,
): number {
  // Les parts étroites du schéma avec reste écrivent leur texte sur deux lignes.
  if (type === 'multiplicatif-avec-reste') return GEO.hauteurRectDeuxLignes
  const etiquetteLongue =
    (TYPES_SCHEMA_EN_BARRE_ETAPES as readonly string[]).includes(type) &&
    (['partieA', 'partieB', 'partieC'] as const)
      .flatMap((cle) => textes[cle].split('\n'))
      .some((ligne) => ligne.length > NB_CARACTERES_MAX_PAR_LIGNE)
  return etiquetteLongue ? GEO.hauteurRectTroisLignes : hauteurRect(textes)
}

function rectTikz(
  x: number,
  y: number,
  largeur: number,
  h: number,
  couleur: string,
  texte: string,
  /** Une étiquette longue revient à la ligne au lieu de sortir du rectangle. */
  coupureAutomatique = false,
): string {
  const largeurTexte = coupureAutomatique
    ? `, text width=${cm(largeur - 0.25)}cm`
    : ''
  return `\\draw[draw=${couleur}, line width=0.8pt] (${cm(x)},${cm(y)}) rectangle (${cm(x + largeur)},${cm(y + h)}) node[midway, text=${couleur}, font=\\bfseries, align=center${largeurTexte}] {${texteRectLatex(texte)}};`
}

function accoladeHautTikz(
  x1: number,
  x2: number,
  y: number,
  texte: string,
): string {
  return `\\draw[decorate, decoration={brace, amplitude=5pt}, color=${COULEUR_A_TIKZ}, line width=0.8pt] (${cm(x1)},${cm(y)}) -- (${cm(x2)},${cm(y)}) node[midway, above=6pt, color=${COULEUR_A_TIKZ}] {${echappeLatex(texte)}};`
}

function accoladeDroiteTikz(
  x: number,
  y1: number,
  y2: number,
  texte: string,
): string {
  return `\\draw[decorate, decoration={brace, amplitude=5pt}, color=${COULEUR_A_TIKZ}, line width=0.8pt] (${cm(x)},${cm(y2)}) -- (${cm(x)},${cm(y1)}) node[midway, right=6pt, color=${COULEUR_A_TIKZ}] {${echappeLatex(texte)}};`
}

function flecheTikz(
  x1: number,
  x2: number,
  y: number,
  texte: string,
  position: 'below' | 'above' = 'below',
): string {
  return `\\draw[<->, >=stealth, color=${COULEUR_A_TIKZ}, line width=0.8pt] (${cm(x1)},${cm(y)}) -- (${cm(x2)},${cm(y)}) node[midway, ${position}=2pt, color=${COULEUR_A_TIKZ}] {${echappeLatex(texte)}};`
}

function partsTikz(
  nbRectangles: NbRectangles,
  y: number,
  h: number,
  texte: string,
): string[] {
  const { avant, pointilles, apres } = dispositionParts(nbRectangles)
  const lignes: string[] = []
  let x = 0
  for (let i = 0; i < avant; i++) {
    lignes.push(rectTikz(x, y, GEO.largeurPart, h, COULEUR_A_TIKZ, texte))
    x += GEO.largeurPart + GEO.ecartParts
  }
  if (pointilles) {
    lignes.push(
      `\\node[color=${COULEUR_A_TIKZ}] at (${cm(x + GEO.largeurPointilles / 2)},${cm(y + h / 2)}) {$\\cdots$};`,
    )
    x += GEO.largeurPointilles + GEO.ecartParts
  }
  for (let i = 0; i < apres; i++) {
    lignes.push(rectTikz(x, y, GEO.largeurPart, h, COULEUR_A_TIKZ, texte))
    x += GEO.largeurPart + GEO.ecartParts
  }
  return lignes
}

/** Le code TikZ d'un schéma, ou une chaîne vide si aucun type n'est choisi. */
export function schemaLatex(
  type: SchemaEnBarreTypeEtendu | null,
  textes: TextesSchema,
  nbRectangles: NbRectangles,
  nombresEnEvidence: CleTexteSchema[] = [],
  repartition: RepartitionAvecReste = REPARTITION_PAR_DEFAUT,
): string {
  if (type == null) return ''
  const h = hauteurRectImprime(type, textes)
  textes = textesAvecEvidence(textes, nombresEnEvidence)
  const interligne = 0.6
  const lignes: string[] = []
  switch (type) {
    case 'additif-parties-tout': {
      lignes.push(
        rectTikz(0, 0, GEO.largeurA, h, COULEUR_A_TIKZ, textes.partieA),
      )
      lignes.push(
        rectTikz(
          GEO.largeurA,
          0,
          GEO.largeurB,
          h,
          COULEUR_B_TIKZ,
          textes.partieB,
        ),
      )
      lignes.push(
        accoladeHautTikz(0, GEO.largeurA + GEO.largeurB, h + 0.3, textes.tout),
      )
      break
    }
    case 'additif-comparaison':
    case 'additif-comparaison-total': {
      const grande = GEO.largeurGrandeComparaison
      const petite = GEO.largeurPetiteComparaison
      const yA = h + interligne
      lignes.push(rectTikz(0, yA, grande, h, COULEUR_A_TIKZ, textes.partieA))
      lignes.push(rectTikz(0, 0, petite, h, COULEUR_B_TIKZ, textes.partieB))
      lignes.push(
        `\\draw[dashed, color=${COULEUR_A_TIKZ}] (${cm(grande)},${cm(yA)}) -- (${cm(grande)},${cm(0)});`,
      )
      lignes.push(flecheTikz(petite, grande, h / 2, textes.difference))
      if (estComparaisonAvecTotal(type))
        lignes.push(accoladeDroiteTikz(grande + 0.4, 0, yA + h, textes.tout))
      break
    }
    case 'multiplicatif-parties-tout': {
      const largeur = largeurLigneParts(nbRectangles)
      lignes.push(...partsTikz(nbRectangles, 0, h, textes.part))
      lignes.push(accoladeHautTikz(0, largeur, h + 0.3, textes.tout))
      lignes.push(flecheTikz(0, largeur, -0.5, textes.nombreDeParts))
      break
    }
    case 'multiplicatif-comparaison':
    case 'multiplicatif-comparaison-total': {
      const largeur = largeurLigneParts(nbRectangles)
      const yA = h + interligne
      lignes.push(
        rectTikz(0, yA, GEO.largeurPart, h, COULEUR_A_TIKZ, textes.part),
      )
      lignes.push(
        `\\node[anchor=east, align=right, color=${COULEUR_A_TIKZ}] at (${cm(-0.4)},${cm(yA + h / 2)}) {${texteRectLatex(textes.etiquetteA)}};`,
      )
      lignes.push(...partsTikz(nbRectangles, 0, h, textes.part))
      lignes.push(
        `\\node[anchor=east, align=right, color=${COULEUR_A_TIKZ}] at (${cm(-0.4)},${cm(h / 2)}) {${texteRectLatex(textes.etiquetteB)}};`,
      )
      lignes.push(flecheTikz(0, largeur, -0.5, textes.nFois))
      if (estComparaisonAvecTotal(type))
        lignes.push(
          accoladeDroiteTikz(
            Math.max(largeur, GEO.largeurPart) + 0.4,
            0,
            yA + h,
            textes.tout,
          ),
        )
      break
    }
    case 'additif-trois-parties': {
      const largeur = GEO.largeurTroisParties
      const couleurs = [COULEUR_A_TIKZ, COULEUR_B_TIKZ, COULEUR_A_TIKZ]
      ;[textes.partieA, textes.partieB, textes.partieC].forEach((texte, k) => {
        lignes.push(
          rectTikz(k * largeur, 0, largeur, h, couleurs[k], texte, true),
        )
      })
      lignes.push(accoladeHautTikz(0, 3 * largeur, h + 0.3, textes.tout))
      break
    }
    case 'additif-somme-comparaison': {
      const { sommeA, sommeB, sommeC } = GEO
      const total = sommeA + sommeB
      const yA = h + interligne
      lignes.push(
        rectTikz(0, yA, sommeA, h, COULEUR_A_TIKZ, textes.partieA, true),
      )
      lignes.push(
        rectTikz(sommeA, yA, sommeB, h, COULEUR_B_TIKZ, textes.partieB, true),
      )
      lignes.push(
        rectTikz(0, 0, sommeC, h, COULEUR_A_TIKZ, textes.partieC, true),
      )
      lignes.push(
        `\\draw[dashed, color=${COULEUR_A_TIKZ}] (${cm(total)},${cm(yA)}) -- (${cm(total)},${cm(0)});`,
      )
      lignes.push(flecheTikz(sommeC, total, h / 2, textes.difference))
      break
    }
    case 'multiplicatif-avec-reste': {
      const geometrie = geometrieAvecReste(
        repartition,
        GEO.largeurMinPartPapier,
      )
      const yHaut = h + interligne
      /** Dessine une rangée et renvoie l'abscisse de fin. */
      const rangee = (
        texte: string,
        nb: number,
        largeur: number,
        largeurPointilles: number,
        y: number,
      ) => {
        const { avant, pointilles, apres } = dispositionAvecCoupure(nb)
        let x = 0
        const part = (contenu: string) => {
          lignes.push(rectTikz(x, y, largeur, h, COULEUR_A_TIKZ, contenu, true))
          x += largeur + GEO.ecartParts
        }
        part(texte)
        for (let k = 1; k < avant; k++) part('')
        if (pointilles) {
          lignes.push(
            `\\draw[dotted, line width=1pt, color=${COULEUR_A_TIKZ}] (${cm(x)},${cm(y + h / 2)}) -- (${cm(x + largeurPointilles)},${cm(y + h / 2)});`,
          )
          x += largeurPointilles + GEO.ecartParts
          for (let k = 0; k < apres; k++) part('')
        }
        return x
      }
      rangee(
        textes.part,
        repartition.nbHaut,
        geometrie.largeurPartHaut,
        geometrie.pointillesHaut,
        yHaut,
      )
      const xReste = rangee(
        textes.partPartage,
        repartition.nbBas,
        geometrie.largeurPartBas,
        geometrie.pointillesBas,
        0,
      )
      lignes.push(
        rectTikz(xReste, 0, geometrie.largeurReste, h, COULEUR_B_TIKZ, ''),
      )
      lignes.push(
        `\\node[anchor=north east, align=right, color=${COULEUR_A_TIKZ}] at (${cm(geometrie.largeurTotale)},${cm(-0.7)}) {${texteRectLatex(textes.reste)}};`,
      )
      lignes.push(
        flecheTikz(
          0,
          geometrie.largeurTotale,
          yHaut + h + 0.5,
          textes.nombreDeParts,
          'above',
        ),
      )
      lignes.push(
        flecheTikz(0, geometrie.largeurPartsBas, -0.5, textes.nombrePartages),
      )
      break
    }
  }
  return `\\begin{center}\n\\begin{tikzpicture}[baseline]\n${lignes.join('\n')}\n\\end{tikzpicture}\n\\end{center}`
}

/* -------------------------------------------------------------------------- */
/*                                 Rendu Typst                                 */
/* -------------------------------------------------------------------------- */

/** Texte saisi protégé pour le balisage Typst. */
export function echappeTypst(texte: string): string {
  return texte
    .replace(/[\\#$[\]*_`<>@~]/g, (caractere) => `\\${caractere}`)
    .replace(
      REGEXP_BALISES_EVIDENCE,
      `#text(fill: rgb("${orangeMathalea}"), weight: "bold")[$1]`,
    )
}

const COULEUR_A_TYPST = 'rgb("#216d9a")'
const COULEUR_B_TYPST = 'rgb("#5faedd")'

function texteRectTypst(texte: string): string {
  return texte.split('\n').map(echappeTypst).join(' #linebreak() ')
}

function rectTypst(
  largeur: number,
  h: number,
  couleur: string,
  texte: string,
): string {
  return `box(width: ${em(largeur)}, height: ${em(h)}, fill: none, stroke: 0.8pt + ${couleur}, align(center + horizon, text(fill: ${couleur}, weight: "bold")[${texteRectTypst(texte)}]))`
}

function etiquetteTypst(texte: string): string {
  return `text(fill: ${COULEUR_A_TYPST})[${texteRectTypst(texte)}]`
}

function accoladeHautTypst(largeur: number, texte: string): string {
  return `box(width: ${em(largeur)}, mathalea-schema-span(${etiquetteTypst(texte)}, color: ${COULEUR_A_TYPST}))`
}

/** Flèche double avec son texte, dessous par défaut, au-dessus si `dessus`. */
function flecheTypst(largeur: number, texte: string, dessus = false): string {
  return `box(width: ${em(largeur)}, mathalea-schema-span(${etiquetteTypst(texte)}, kind: "arrow", flip: ${!dessus}, color: ${COULEUR_A_TYPST}))`
}

/**
 * Accolade verticale à droite de `contenu`, étiquetée `texte`. La hauteur de
 * l'accolade est celle de `contenuMesure` (les barres seules, sans la flèche
 * du dessous), mesurée à la composition.
 */
function accoladeDroiteTypst(
  contenu: string,
  contenuMesure: string,
  texte: string,
): string {
  return `context {
  let taille = measure(${contenuMesure})
  stack(dir: ltr, spacing: 4pt, ${contenu}, box(height: taille.height, align(horizon, text(fill: ${COULEUR_A_TYPST}, size: 0.9em)[$ stretch(brace.r, size: #taille.height) $])), box(height: taille.height, align(horizon, ${etiquetteTypst(texte)})))
}`
}

function partsTypst(
  nbRectangles: NbRectangles,
  h: number,
  texte: string,
): string {
  const { avant, pointilles, apres } = dispositionParts(nbRectangles)
  const rect = () => rectTypst(GEO.largeurPart, h, COULEUR_A_TYPST, texte)
  const morceaux = [
    ...Array.from({ length: avant }, rect),
    ...(pointilles
      ? [
          `box(width: ${em(GEO.largeurPointilles)}, height: ${em(h)}, align(center + horizon, text(fill: ${COULEUR_A_TYPST})[$ dots.c $]))`,
        ]
      : []),
    ...Array.from({ length: apres }, rect),
  ]
  return `stack(dir: ltr, spacing: ${em(GEO.ecartParts)}, ${morceaux.join(', ')})`
}

/** Le code Typst d'un schéma, ou une chaîne vide si aucun type n'est choisi. */
export function schemaTypst(
  type: SchemaEnBarreTypeEtendu | null,
  textes: TextesSchema,
  nbRectangles: NbRectangles,
  nombresEnEvidence: CleTexteSchema[] = [],
  repartition: RepartitionAvecReste = REPARTITION_PAR_DEFAUT,
): string {
  if (type == null) return ''
  const h = hauteurRectImprime(type, textes)
  textes = textesAvecEvidence(textes, nombresEnEvidence)
  let corps = ''
  switch (type) {
    case 'additif-parties-tout': {
      const largeur = GEO.largeurA + GEO.largeurB
      corps = `stack(dir: ttb, spacing: 2pt, ${accoladeHautTypst(largeur, textes.tout)}, stack(dir: ltr, ${rectTypst(GEO.largeurA, h, COULEUR_A_TYPST, textes.partieA)}, ${rectTypst(GEO.largeurB, h, COULEUR_B_TYPST, textes.partieB)}))`
      break
    }
    case 'additif-comparaison':
    case 'additif-comparaison-total': {
      const grande = GEO.largeurGrandeComparaison
      const petite = GEO.largeurPetiteComparaison
      const barres = `stack(dir: ttb, spacing: ${em(0.6)}, ${rectTypst(grande, h, COULEUR_A_TYPST, textes.partieA)}, stack(dir: ltr, ${rectTypst(petite, h, COULEUR_B_TYPST, textes.partieB)}, box(width: ${em(grande - petite)}, height: ${em(h)}, stroke: (right: (paint: ${COULEUR_A_TYPST}, dash: "dashed", thickness: 0.8pt)), align(center + horizon, text(fill: ${COULEUR_A_TYPST}, size: 0.9em)[$ stretch(<->, size: #${em(grande - petite - 0.4)}) $]))))`
      const avecDifference = `stack(dir: ttb, spacing: 2pt, ${barres}, stack(dir: ltr, box(width: ${em(petite)}), box(width: ${em(grande - petite)}, align(center, ${etiquetteTypst(textes.difference)}))))`
      corps = estComparaisonAvecTotal(type)
        ? accoladeDroiteTypst(avecDifference, barres, textes.tout)
        : avecDifference
      break
    }
    case 'multiplicatif-parties-tout': {
      const largeur = largeurLigneParts(nbRectangles)
      corps = `stack(dir: ttb, spacing: 2pt, ${accoladeHautTypst(largeur, textes.tout)}, ${partsTypst(nbRectangles, h, textes.part)}, ${flecheTypst(largeur, textes.nombreDeParts)})`
      break
    }
    case 'multiplicatif-comparaison':
    case 'multiplicatif-comparaison-total': {
      const largeur = largeurLigneParts(nbRectangles)
      // Assez large pour un prénom ou « 45 timbres », sans coupure de ligne.
      const largeurEtiquette = 6
      const rangee = (etiquette: string, contenu: string) =>
        `stack(dir: ltr, spacing: 4pt, box(width: ${em(largeurEtiquette)}, align(right + horizon, ${etiquetteTypst(etiquette)})), ${contenu})`
      const barres = `stack(dir: ttb, spacing: ${em(0.6)}, ${rangee(textes.etiquetteA, rectTypst(GEO.largeurPart, h, COULEUR_A_TYPST, textes.part))}, ${rangee(textes.etiquetteB, partsTypst(nbRectangles, h, textes.part))})`
      const avecFleche = `stack(dir: ttb, spacing: 2pt, ${barres}, ${rangee('', flecheTypst(largeur, textes.nFois))})`
      corps = estComparaisonAvecTotal(type)
        ? accoladeDroiteTypst(avecFleche, barres, textes.tout)
        : avecFleche
      break
    }
    case 'additif-trois-parties': {
      const largeur = GEO.largeurTroisParties
      const rect = (couleur: string, texte: string) =>
        rectTypst(largeur, h, couleur, texte)
      corps = `stack(dir: ttb, spacing: 2pt, ${accoladeHautTypst(3 * largeur, textes.tout)}, stack(dir: ltr, ${rect(COULEUR_A_TYPST, textes.partieA)}, ${rect(COULEUR_B_TYPST, textes.partieB)}, ${rect(COULEUR_A_TYPST, textes.partieC)}))`
      break
    }
    case 'additif-somme-comparaison': {
      const { sommeA, sommeB, sommeC, sommeDifference } = GEO
      const fleche = `box(width: ${em(sommeDifference)}, height: ${em(h)}, stroke: (right: (paint: ${COULEUR_A_TYPST}, dash: "dashed", thickness: 0.8pt)), align(center + horizon, text(fill: ${COULEUR_A_TYPST}, size: 0.9em)[$ stretch(<->, size: #${em(sommeDifference - 0.4)}) $]))`
      const barres = `stack(dir: ttb, spacing: ${em(0.6)}, stack(dir: ltr, ${rectTypst(sommeA, h, COULEUR_A_TYPST, textes.partieA)}, ${rectTypst(sommeB, h, COULEUR_B_TYPST, textes.partieB)}), stack(dir: ltr, ${rectTypst(sommeC, h, COULEUR_A_TYPST, textes.partieC)}, ${fleche}))`
      corps = `stack(dir: ttb, spacing: 2pt, ${barres}, stack(dir: ltr, box(width: ${em(sommeC)}), box(width: ${em(sommeDifference)}, align(center, ${etiquetteTypst(textes.difference)}))))`
      break
    }
    case 'multiplicatif-avec-reste': {
      const geometrie = geometrieAvecReste(
        repartition,
        GEO.largeurMinPartPapier,
      )
      const morceaux = (
        texte: string,
        nb: number,
        largeur: number,
        largeurPointilles: number,
      ) => {
        const { avant, pointilles, apres } = dispositionAvecCoupure(nb)
        const part = (contenu = '') =>
          rectTypst(largeur, h, COULEUR_A_TYPST, contenu)
        return [
          part(texte),
          ...Array.from({ length: avant - 1 }, () => part()),
          ...(pointilles
            ? [
                `box(width: ${em(largeurPointilles)}, height: ${em(h)}, align(center + horizon, line(length: 100%, stroke: (paint: ${COULEUR_A_TYPST}, thickness: 1pt, dash: "dotted"))))`,
              ]
            : []),
          ...Array.from({ length: apres }, () => part()),
        ]
      }
      const rangee = (contenu: string[]) =>
        `stack(dir: ltr, spacing: ${em(GEO.ecartParts)}, ${contenu.join(', ')})`
      const haut = rangee(
        morceaux(
          textes.part,
          repartition.nbHaut,
          geometrie.largeurPartHaut,
          geometrie.pointillesHaut,
        ),
      )
      const bas = rangee([
        ...morceaux(
          textes.partPartage,
          repartition.nbBas,
          geometrie.largeurPartBas,
          geometrie.pointillesBas,
        ),
        rectTypst(geometrie.largeurReste, h, COULEUR_B_TYPST, ''),
      ])
      const largeurBas = em(geometrie.largeurPartsBas)
      const flecheBas = flecheTypst(geometrie.largeurPartsBas, '')
      const textesBas = `box(width: ${em(geometrie.largeurTotale)}, { place(left, box(width: ${largeurBas}, align(center, ${etiquetteTypst(textes.nombrePartages)}))); align(right, ${etiquetteTypst(textes.reste)}) })`
      corps = `stack(dir: ttb, spacing: ${em(0.4)}, ${flecheTypst(geometrie.largeurTotale, textes.nombreDeParts, true)}, ${haut}, ${bas}, ${flecheBas}, ${textesBas})`
      break
    }
  }
  // `align(left)` : sans lui, les rangées de largeurs différentes seraient
  // centrées les unes par rapport aux autres par le `align(center)` extérieur.
  return `#align(center, block(breakable: false, align(left, ${corps})))`
}

/**
 * Les six schémas en barre vides, légendés, disposés en grille de deux
 * colonnes (Typst uniquement) : l'élève en choisit un et le recopie.
 */
export function sixSchemasVidesTypst(): string {
  const cellules = TYPES_SCHEMA_EN_BARRE.map((type) => {
    const schema = schemaTypst(type, textesVides(), NB_RECTANGLES_PAR_DEFAUT)
    // `schemaTypst` renvoie du code précédé de `#`, valable dans le bloc de
    // contenu `[...]` de la cellule.
    return `[#align(center, text(weight: "bold", size: 0.9em)[${echappeTypst(TITRES_SCHEMA[type])}]) #v(0.3em) ${schema} #v(0.6em)]`
  })
  return `<mathalea-typst>#grid(columns: (1fr, 1fr), row-gutter: 0.8em, column-gutter: 1em, ${cellules.join(', ')})</mathalea-typst>`
}

/* -------------------------------------------------------------------------- */
/*                               Le custom element                             */
/* -------------------------------------------------------------------------- */

export type SchemaEnBarreCreateOptions = {
  id?: string
  numeroExercice?: number
  questionIndex?: number
  /** Impose le type : le choix entre les six schémas n'est pas proposé. */
  typeImpose?: SchemaEnBarreTypeEtendu
  /** État initial (type déjà choisi, textes, nombre de rectangles). */
  initialState?: Partial<SchemaEnBarreState>
  /**
   * Textes dont le nombre est mis en évidence (orange) dans le schéma figé :
   * dans une correction, les nombres que l'élève doit placer.
   */
  nombresEnEvidence?: CleTexteSchema[]
  interactivityOn?: boolean
}

/**
 * Schéma en barre interactif et ses rendus imprimés.
 * @author Rémi Angot
 */
export class SchemaEnBarreElement extends MathaleaCustomElement {
  static readonly elementTag = 'schema-en-barre'

  private state: SchemaEnBarreState = {
    type: null,
    textes: textesVides(),
    nbRectangles: NB_RECTANGLES_PAR_DEFAUT,
  }
  private typeImpose: SchemaEnBarreTypeEtendu | null = null
  private nombresEnEvidence: CleTexteSchema[] = []
  private zoneSchema: HTMLElement | null = null
  private zoneChoix: HTMLElement | null = null
  private boutonChangerDeSchema: HTMLButtonElement | null = null
  /** Le choix du type et le schéma ne sont jamais affichés en même temps. */
  private choixVisible = false
  private zoneNbRectangles: HTMLElement | null = null
  private erreurs: { type: boolean; cles: Set<CleTexteSchema> } = {
    type: false,
    cles: new Set(),
  }

  static create({
    id,
    numeroExercice = 0,
    questionIndex = 0,
    typeImpose,
    initialState,
    nombresEnEvidence = [],
    interactivityOn = true,
  }: SchemaEnBarreCreateOptions = {}): string {
    const state = parseSchemaEnBarreState({
      ...initialState,
      type: initialState?.type ?? typeImpose ?? null,
    }) as SchemaEnBarreState
    if (context.isTypst) {
      return `<mathalea-typst>${schemaTypst(state.type, state.textes, state.nbRectangles, nombresEnEvidence)}</mathalea-typst>`
    }
    if (!context.isHtml) {
      // À l'impression, l'élève dessine lui-même le schéma s'il doit le choisir.
      if (interactivityOn && typeImpose == null) return ''
      return schemaLatex(
        state.type,
        state.textes,
        state.nbRectangles,
        nombresEnEvidence,
      )
    }
    const elementId =
      id ?? `${this.elementTag}Ex${numeroExercice}Q${questionIndex}`
    const html = super.create({
      id: elementId,
      typeImpose,
      initialState: state,
      nombresEnEvidence:
        nombresEnEvidence.length > 0 ? nombresEnEvidence : undefined,
      interactivityOn,
    })
    if (!interactivityOn) return html
    return `${html}<span id="resultatCheckEx${numeroExercice}Q${questionIndex}"></span><div id="feedbackEx${numeroExercice}Q${questionIndex}" style="display: none"></div>`
  }

  static verifQuestion(
    exercice: IExercice,
    questionIndex: number,
  ): {
    isOk: boolean
    feedback: string
    score: { nbBonnesReponses: number; nbReponses: number }
  } {
    const elementId = `${this.elementTag}Ex${exercice.numeroExercice}Q${questionIndex}`
    const element = document.getElementById(
      elementId,
    ) as SchemaEnBarreElement | null
    const attendu = parseSchemaAttendu(
      exercice.autoCorrection?.[questionIndex]?.valeur?.reponse?.value,
    )
    exercice.answers ??= {}
    if (element != null) exercice.answers[elementId] = element.value

    let isOk = false
    let feedback = ''
    if (element == null) {
      feedback = 'Le schéma est introuvable.'
    } else if (attendu == null) {
      feedback = 'Aucun schéma attendu pour cette question.'
    } else {
      const resultat = comparerSchemas(attendu, element.state)
      isOk = resultat.isOk
      element.marquerErreurs(resultat)
      if (element.state.type == null) {
        feedback = "Aucun schéma n'a été choisi."
      } else if (!resultat.typeOk) {
        feedback = `Ce n'est pas le bon type de schéma : il fallait un schéma ${TITRES_SCHEMA[attendu.type].toLowerCase()}.`
      } else if (!resultat.nbRectanglesOk) {
        feedback = 'Le nombre de rectangles ne correspond pas au problème.'
      } else if (resultat.clesFausses.length > 0) {
        const placement =
          resultat.clesFausses.length > 1
            ? 'certains nombres ne sont pas à la bonne place'
            : "un nombre n'est pas à la bonne place"
        feedback =
          element.typeImpose == null
            ? `Le schéma est du bon type mais ${placement}.`
            : `${placement[0].toUpperCase()}${placement.slice(1)}.`
      }
      element.interactivityOn = false
    }

    const resultatCheck = document.querySelector(
      `#resultatCheckEx${exercice.numeroExercice}Q${questionIndex}`,
    )
    if (resultatCheck != null) resultatCheck.innerHTML = isOk ? '😎' : '☹️'
    const zoneFeedback = document.querySelector(
      `#feedbackEx${exercice.numeroExercice}Q${questionIndex}`,
    ) as HTMLElement | null
    if (zoneFeedback != null) {
      zoneFeedback.textContent = feedback
      zoneFeedback.style.display = feedback === '' ? 'none' : 'block'
    }
    return {
      isOk,
      feedback,
      score: { nbBonnesReponses: isOk ? 1 : 0, nbReponses: 1 },
    }
  }

  static formatStudentAnswer(rawAnswer: string): string {
    const state = parseSchemaEnBarreState(rawAnswer)
    if (state == null) return rawAnswer
    if (state.type == null) return 'aucun schéma choisi'
    const textes = CLES_PAR_TYPE[state.type]
      .filter((cle) => state.textes[cle] !== '')
      .map((cle) => `${LIBELLES_TEXTE[cle]} : ${state.textes[cle]}`)
    return [TITRES_SCHEMA[state.type], ...textes].join(' ; ')
  }

  connectedCallback(): void {
    this.hydrateCommonAttributes()
    const typeImpose = this.getAttribute('type-impose')
    this.typeImpose = estTypeSchema(typeImpose) ? typeImpose : null
    const initial = parseSchemaEnBarreState(this.getAttribute('initial-state'))
    if (initial != null) this.state = initial
    if (this.typeImpose != null) this.state.type = this.typeImpose
    this.nombresEnEvidence = lisCles(this.getAttribute('nombres-en-evidence'))
    this.render()
    if (!this.interactivityOn) this.renderReadOnlyMath()
  }

  disconnectedCallback(): void {
    this.innerHTML = ''
  }

  render(): string | void {
    if (context.isTypst) return this.renderTypst()
    if (!context.isHtml) return this.renderLatex()
    this.className = 'schema-en-barre'
    this.innerHTML = ''
    this.zoneChoix = null
    this.boutonChangerDeSchema = null
    this.zoneNbRectangles = null
    if (this.interactivityOn && this.typeImpose == null) {
      this.choixVisible = this.state.type == null
      this.zoneChoix = document.createElement('div')
      this.zoneChoix.className = 'schema-en-barre__choix'
      this.zoneChoix.setAttribute('role', 'radiogroup')
      this.zoneChoix.setAttribute('aria-label', 'Type de schéma')
      this.zoneChoix.innerHTML = TYPES_SCHEMA_EN_BARRE.map(
        (type) =>
          `<button type="button" class="schema-en-barre__vignette" data-type="${type}" role="radio" aria-checked="false"><span class="schema-en-barre__vignette-schema" aria-hidden="true">${schemaHtml(type, LIBELLES_TEXTE, NB_RECTANGLES_PAR_DEFAUT, { editable: false })}</span><span class="schema-en-barre__vignette-titre">${TITRES_SCHEMA[type]}</span></button>`,
      ).join('')
      this.zoneChoix
        .querySelectorAll<HTMLButtonElement>('[data-type]')
        .forEach((bouton) =>
          bouton.addEventListener('click', () => {
            const type = bouton.dataset.type
            if (estTypeSchema(type)) this.choisirType(type)
          }),
        )
      this.appendChild(this.zoneChoix)
    }
    this.zoneSchema = document.createElement('div')
    this.zoneSchema.className = 'schema-en-barre__zone'
    this.appendChild(this.zoneSchema)
    if (this.zoneChoix != null) {
      this.boutonChangerDeSchema = document.createElement('button')
      this.boutonChangerDeSchema.type = 'button'
      this.boutonChangerDeSchema.className = 'schema-en-barre__changer'
      this.boutonChangerDeSchema.textContent = 'Changer de schéma'
      this.boutonChangerDeSchema.addEventListener('click', () => {
        this.choixVisible = true
        this.dessinerSchema()
      })
    }
    if (this.interactivityOn) {
      this.zoneNbRectangles = document.createElement('div')
      this.zoneNbRectangles.className = 'schema-en-barre__nb-rectangles'
      this.zoneNbRectangles.innerHTML = `<span>Nombre de rectangles :</span>${NB_RECTANGLES_CHOIX.map(
        (nb) =>
          `<button type="button" data-nb="${nb}" aria-pressed="false" aria-label="${nb === 'plus' ? 'Plus de 5 rectangles' : `${nb} rectangle${nb > 1 ? 's' : ''}`}">${nb === 'plus' ? '+' : nb}</button>`,
      ).join('')}`
      this.zoneNbRectangles
        .querySelectorAll<HTMLButtonElement>('[data-nb]')
        .forEach((bouton) =>
          bouton.addEventListener('click', () => {
            const nb =
              bouton.dataset.nb === 'plus' ? 'plus' : Number(bouton.dataset.nb)
            if (estNbRectangles(nb)) this.choisirNbRectangles(nb)
          }),
        )
      this.appendChild(this.zoneNbRectangles)
    }
    if (this.boutonChangerDeSchema != null)
      this.appendChild(this.boutonChangerDeSchema)
    this.dessinerSchema()
  }

  protected renderLatex(): string {
    return schemaLatex(
      this.state.type,
      this.state.textes,
      this.state.nbRectangles,
      this.nombresEnEvidence,
    )
  }

  protected renderTypst(): string {
    return schemaTypst(
      this.state.type,
      this.state.textes,
      this.state.nbRectangles,
      this.nombresEnEvidence,
    )
  }

  get value(): string {
    return JSON.stringify(this.state)
  }

  set value(nextValue: string) {
    this.update(nextValue)
  }

  update(nextValue: string | Partial<SchemaEnBarreState>): void {
    const parsed = parseSchemaEnBarreState(nextValue)
    if (parsed == null) return
    this.state = parsed
    if (this.typeImpose != null) this.state.type = this.typeImpose
    this.erreurs = { type: false, cles: new Set() }
    if (this.isConnected) this.render()
  }

  protected onInteractivityChanged(): void {
    if (this.isConnected) this.render()
  }

  /** Colore les éléments faux après la vérification. */
  marquerErreurs(resultat: ResultatComparaisonSchema): void {
    this.erreurs = {
      type: !resultat.typeOk,
      cles: new Set(resultat.clesFausses),
    }
  }

  private choisirType(type: SchemaEnBarreTypeEtendu): void {
    this.choixVisible = false
    if (this.state.type !== type) {
      this.state.type = type
      // Un texte masqué ne reste pas dans la réponse : au rejeu, il ferait
      // passer une comparaison simple pour une comparaison avec total.
      if (!CLES_PAR_TYPE[type].includes('tout')) this.state.textes.tout = ''
      this.signalerChangement()
    }
    this.dessinerSchema()
  }

  private choisirNbRectangles(nb: NbRectangles): void {
    if (this.state.nbRectangles === nb) return
    this.state.nbRectangles = nb
    this.dessinerSchema()
    this.signalerChangement()
  }

  private dessinerSchema(): void {
    if (this.zoneSchema == null) return
    const { type, textes, nbRectangles } = this.state
    if (this.zoneChoix != null) {
      this.zoneChoix.hidden = !this.choixVisible
      this.zoneSchema.hidden = this.choixVisible
      if (this.boutonChangerDeSchema != null)
        this.boutonChangerDeSchema.hidden = this.choixVisible
      this.zoneChoix
        .querySelectorAll<HTMLButtonElement>('[data-type]')
        .forEach((bouton) => {
          const choisi = bouton.dataset.type === type
          bouton.classList.toggle('is-choisi', choisi)
          bouton.setAttribute('aria-checked', choisi ? 'true' : 'false')
          bouton.classList.toggle('is-faux', choisi && this.erreurs.type)
        })
    }
    if (this.zoneNbRectangles != null) {
      this.zoneNbRectangles.hidden =
        this.choixVisible || type == null || !aNombreDeRectanglesReglable(type)
      this.zoneNbRectangles
        .querySelectorAll<HTMLButtonElement>('[data-nb]')
        .forEach((bouton) => {
          const actif = bouton.dataset.nb === String(nbRectangles)
          bouton.classList.toggle('is-actif', actif)
          bouton.setAttribute('aria-pressed', actif ? 'true' : 'false')
        })
    }
    if (type == null) {
      this.zoneSchema.innerHTML = ''
      return
    }
    const textesAffiches = this.interactivityOn
      ? textes
      : textesAvecEvidence(textes, this.nombresEnEvidence)
    this.zoneSchema.innerHTML = schemaHtml(type, textesAffiches, nbRectangles, {
      editable: this.interactivityOn,
    })
    this.zoneSchema
      .querySelectorAll<HTMLElement>('[data-cle]')
      .forEach((champ) => {
        const cle = champ.dataset.cle as CleTexteSchema
        champ.classList.toggle('is-faux', this.erreurs.cles.has(cle))
        if (champ instanceof HTMLTextAreaElement) {
          champ.addEventListener('input', () => this.saisir(cle, champ))
          ajusteHauteur(champ)
        }
      })
  }

  private saisir(cle: CleTexteSchema, champ: HTMLTextAreaElement): void {
    this.state.textes[cle] = champ.value
    ajusteHauteur(champ)
    // Les parts d'un schéma multiplicatif partagent le même texte.
    this.zoneSchema
      ?.querySelectorAll<HTMLTextAreaElement>(`textarea[data-cle="${cle}"]`)
      .forEach((autre) => {
        if (autre !== champ && autre.value !== champ.value) {
          autre.value = champ.value
          ajusteHauteur(autre)
        }
      })
    this.signalerChangement()
  }

  private signalerChangement(): void {
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }))
    this.dispatchEvent(
      new CustomEvent('value-changed', {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    )
  }
}

export type SchemaEnBarreFigeOptions = {
  type: SchemaEnBarreTypeEtendu
  textes: Partial<TextesSchema>
  nbRectangles?: NbRectangles
  /** Textes dont le nombre est mis en évidence (orange), comme dans `create()`. */
  nombresEnEvidence?: CleTexteSchema[]
  /** HTML des champs de saisie, placés à l'endroit de `MARQUE_CHAMP_SCHEMA`. */
  champs?: Partial<Record<CleTexteSchema, string>>
  /** Les nombres qui fixent le dessin du schéma avec reste. */
  repartition?: RepartitionAvecReste
}

/**
 * Un schéma figé, sans custom element : du HTML ordinaire, du TikZ ou du Typst.
 * Il sert aux exercices dont le schéma porte directement des nombres et des
 * champs MathLive corrigés par l'exercice (`6N4A-2`) : ses nombres font partie
 * du texte de l'énoncé, contrairement à ceux de l'attribut d'un custom element.
 */
export function schemaEnBarreFige({
  type,
  textes,
  nbRectangles = NB_RECTANGLES_PAR_DEFAUT,
  nombresEnEvidence = [],
  champs,
  repartition,
}: SchemaEnBarreFigeOptions): string {
  const complets = { ...textesVides(), ...textes }
  if (context.isTypst) {
    return `<mathalea-typst>${schemaTypst(type, complets, nbRectangles, nombresEnEvidence, repartition)}</mathalea-typst>`
  }
  if (!context.isHtml) {
    return schemaLatex(
      type,
      complets,
      nbRectangles,
      nombresEnEvidence,
      repartition,
    )
  }
  const html = schemaHtml(
    type,
    textesAvecEvidence(complets, nombresEnEvidence),
    nbRectangles,
    { editable: false, champs, repartition },
  )
  return `<div class="schema-en-barre schema-en-barre--fige"><div class="schema-en-barre__zone">${html}</div></div>`
}

export type SchemaEnBarreOptions = Omit<
  SchemaEnBarreCreateOptions,
  'numeroExercice' | 'questionIndex'
> & {
  /** Schéma attendu pour la correction interactive. */
  attendu?: SchemaEnBarreAttendu
}

/**
 * Insère un schéma en barre dans une question. Avec `attendu`, la question
 * devient corrigeable : `verifQuestion()` compare le schéma de l'élève au
 * schéma attendu.
 */
export function addSchemaEnBarre(
  exercice: IExercice,
  questionIndex: number,
  { attendu, ...options }: SchemaEnBarreOptions = {},
): string {
  if (attendu != null) {
    exercice.autoCorrection[questionIndex] ??= {}
    exercice.autoCorrection[questionIndex].formatInteractif =
      SchemaEnBarreElement.elementTag
    exercice.autoCorrection[questionIndex].valeur = {
      reponse: { value: JSON.stringify(attendu) },
    }
  }
  return SchemaEnBarreElement.create({
    ...options,
    numeroExercice: exercice.numeroExercice ?? 0,
    questionIndex,
  })
}

registerMathaleaCustomElement(SchemaEnBarreElement)
