import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  choice,
  combinaisonListes,
  shuffle,
} from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { rangeMinMax } from '../../lib/outils/nombres'
import { numAlpha, sp } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import {
  contraindreValeur,
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const amcReady = true
export const amcType = 'qcmMono'
export const interactifReady = true

export const titre = 'Deviner : je suis un nombre mystère'

export const dateDePublication = '30/09/2026'

/**
 * Devinette sur les chiffres d'un nombre : l'élève doit retrouver un nombre
 * à partir d'indices portant sur ses chiffres (valeur directe, comparaison,
 * ou relation type double/moitié, triple/tiers, quadruple/quart entre deux
 * chiffres du nombre).
 * @author Éric Elter
 */
export const uuid = 'a41ba'

export const refs = {
  'fr-fr': ['6N1A-7'],
  'fr-ch': ['9R1NO2A-11', '9R2NO2A-11', '9R3NO2A-11', 'PRQST04A-5', 'PRQNO02A-9'],
}

// -------------------------------------------------------------------------
// Données et fonctions utilitaires propres à cet exercice
// -------------------------------------------------------------------------

// Nom des positions (rangs), la clé étant l'exposant de la puissance de 10
// correspondante (0 = unités, 1 = dizaines, -1 = dixièmes, etc.)
const nomsPositions: { [rang: number]: string } = {
  [-3]: 'millièmes',
  [-2]: 'centièmes',
  [-1]: 'dixièmes',
  0: 'unités',
  1: 'dizaines',
  2: 'centaines',
  3: 'milliers',
  4: 'dizaines de milliers',
  5: 'centaines de milliers',
}

type TypeVocabBinaire =
  'double' | 'moitié' | 'triple' | 'tiers' | 'quadruple' | 'quart'
type TypeVocabTernaire = 'somme' | 'difference'
type TypeVocab = TypeVocabBinaire | TypeVocabTernaire

function estVocabTernaire(mot: TypeVocab): mot is TypeVocabTernaire {
  return mot === 'somme' || mot === 'difference'
}

const definitionsVocab: {
  [mot in TypeVocabBinaire]: {
    k: number
    type: 'mult' | 'div'
    article: string
  }
} = {
  double: { k: 2, type: 'mult', article: 'le double' },
  moitié: { k: 2, type: 'div', article: 'la moitié' },
  triple: { k: 3, type: 'mult', article: 'le triple' },
  tiers: { k: 3, type: 'div', article: 'le tiers' },
  quadruple: { k: 4, type: 'mult', article: 'le quadruple' },
  quart: { k: 4, type: 'div', article: 'le quart' },
}

// Énumère toutes les paires distinctes (non ordonnées) d'un tableau.
function toutesPaires<T>(tableau: T[]): [T, T][] {
  const paires: [T, T][] = []
  for (let i = 0; i < tableau.length; i++) {
    for (let j = i + 1; j < tableau.length; j++) {
      paires.push([tableau[i], tableau[j]])
    }
  }
  return paires
}

// Nombre de propositions fausses à afficher dans le QCM (le total affiché,
// bonne réponse comprise, fait donc toujours NB_PROPOSITIONS_FAUSSES + 1).
const NB_PROPOSITIONS_FAUSSES = 5

// Énumère toutes les permutations d'un tableau (utilisé pour garantir,
// quel que soit le tirage, qu'on peut toujours trouver le nombre de
// distracteurs voulu, plutôt que de compter sur des tirages aléatoires
// répétés qui peuvent parfois échouer).
function permutationsDe<T>(tableau: T[]): T[][] {
  if (tableau.length <= 1) return [tableau]
  const resultats: T[][] = []
  for (let i = 0; i < tableau.length; i++) {
    const reste = [...tableau.slice(0, i), ...tableau.slice(i + 1)]
    for (const suite of permutationsDe(reste)) {
      resultats.push([tableau[i], ...suite])
    }
  }
  return resultats
}

// Correspondance entre le nom de "case" du formulaire (this.besoinFormulaire2Texte
// / gestionnaireFormulaireTexte) et le rang (exposant de la puissance de 10)
// correspondant.
const rangParCase: { [nomCase: string]: number } = {
  centaineMille: 5,
  dizaineMille: 4,
  uniteMille: 3,
  centaine: 2,
  dizaine: 1,
  unite: 0,
  dixieme: -1,
  centieme: -2,
  millieme: -3,
}

// Bornes des rangs connus (voir nomsPositions).
const RANG_MIN = -3
const RANG_MAX = 5

// Construit la liste des rangs (du plus grand au plus petit) utilisés pour
// une question donnée. Les unités de numération choisies dans le formulaire
// sont des ancres qui DOIVENT apparaître dans le nombre mystère ; s'il en
// manque pour atteindre nbChiffres, on comble d'abord les éventuels rangs
// intermédiaires (ex. dizaines + dixièmes → on ajoute les unités entre les
// deux), puis on étend vers l'extérieur, en alternant, jusqu'à obtenir
// exactement nbChiffres rangs CONTIGUS.
// (On ne renvoie jamais des rangs non contigus : les positions
// intermédiaires non choisies s'afficheraient quand même comme des chiffres
// 0 dans le nombre reconstitué, ce qui contredirait la consigne "tous les
// chiffres sont différents".)
function construireRangsDepuisUnites(
  unitesChoisies: string[],
  nbChiffres: number,
): number[] {
  const rangsChoisis = Array.from(
    new Set(
      unitesChoisies
        .map((nomCase) => rangParCase[nomCase])
        .filter((r) => r !== undefined),
    ),
  )
  // Repli si aucune unité n'est cochée : on centre autour des unités.
  if (rangsChoisis.length === 0) rangsChoisis.push(0)

  let bas = Math.min(...rangsChoisis)
  let haut = Math.max(...rangsChoisis)

  // Le rang des unités (0) doit TOUJOURS faire partie du nombre : sans lui,
  // le nombre imprimé aurait un chiffre des unités implicite (par exemple
  // "4250" au lieu de "425" si on s'arrêtait aux dizaines), qui ne fait
  // partie ni des chiffres annoncés ni de la contrainte "tous différents".
  // C'est précisément ce qui rend "impossible", pour un nombre à 3 chiffres,
  // d'utiliser les milliers ou les millièmes (il faudrait alors dépasser 3
  // rangs pour aussi couvrir les unités) : plus bas, la réduction à une
  // fenêtre de nbChiffres rangs exige justement que 0 en fasse partie, ce
  // qui exclut d'elle-même les unités de numération trop éloignées, et ce
  // quel que soit nbChiffres (3, 4, 5 ou 6).
  bas = Math.min(bas, 0)
  haut = Math.max(haut, 0)

  // Si aucune unité décimale (dixièmes, centièmes, millièmes...) n'a été
  // choisie au départ, on ne doit jamais en introduire par extension : le
  // nombre mystère doit rester un nombre entier.
  const decimalAutorise = rangsChoisis.some((r) => r < 0)

  // On comble les rangs intermédiaires puis on étend symétriquement vers
  // l'extérieur (en alternant) jusqu'à atteindre nbChiffres rangs, dans la
  // limite des rangs connus.
  while (haut - bas + 1 < nbChiffres) {
    const peutMonter = haut + 1 <= RANG_MAX
    const peutDescendre = decimalAutorise && bas - 1 >= RANG_MIN
    if (!peutMonter && !peutDescendre) break
    if (peutMonter && (!peutDescendre || randint(0, 1) === 1)) {
      haut++
    } else {
      bas--
    }
  }

  let rangs: number[] = []
  for (let r = haut; r >= bas; r--) rangs.push(r)

  // Si l'étendue dépasse déjà nbChiffres (unités choisies trop écartées, ou
  // trop loin des unités elles-mêmes), on réduit à une fenêtre contiguë de
  // nbChiffres rangs qui contient toujours le rang 0, en conservant un
  // maximum d'unités choisies à l'intérieur.
  if (rangs.length > nbChiffres) {
    let meilleureFenetre = rangs.slice(0, nbChiffres)
    let meilleurScore = -1
    for (let depart = 0; depart + nbChiffres <= rangs.length; depart++) {
      const fenetre = rangs.slice(depart, depart + nbChiffres)
      if (!fenetre.includes(0)) continue
      const score = fenetre.filter((r) => rangsChoisis.includes(r)).length
      if (score > meilleurScore) {
        meilleurScore = score
        meilleureFenetre = fenetre
      }
    }
    rangs = meilleureFenetre
  }

  return rangs
}

// Reconstitue la valeur numérique du nombre à partir des chiffres par rang.
// Chaque chiffre est replacé à son poids réel (10^rang).
function rangsVersValeur(
  rangs: number[],
  chiffresParRang: { [rang: number]: number },
): number {
  let valeur = 0
  for (const r of rangs) {
    valeur += chiffresParRang[r] * Math.pow(10, r)
  }
  const nbDecimales = Math.max(0, ...rangs.filter((r) => r < 0).map((r) => -r))
  return parseFloat(valeur.toFixed(nbDecimales))
}

// Un indice de la devinette : le texte affiché dans l'énoncé, le texte
// utilisé dans la correction pas-à-pas, et la contrainte structurée qui lui
// correspond (utilisée par le solveur pour retrouver TOUS les nombres
// compatibles avec l'ensemble des indices, voir solutionsCompatibles).
type Contrainte =
  | { type: 'direct'; rang: number; valeur: number }
  | {
      type: 'relation'
      rangSujet: number
      rangComplement: number
      mot: TypeVocabBinaire
    }
  | {
      type: 'relationTernaire'
      rangResultat: number
      rangA: number
      rangB: number
      operation: TypeVocabTernaire
    }
  | { type: 'comparaison'; rangA: number; rangB: number; sens: 'sup' | 'inf' }

interface Indice {
  texteEnonce: string
  texteCorrection: string
  contrainte: Contrainte
}

// Différentes façons de formuler un indice "valeur directe d'un chiffre".
function indiceValeurDirecte(rang: number, chiffre: number): Indice {
  const nom = nomsPositions[rang]
  const formulations = [
    `Mon chiffre des ${nom} est $${chiffre}$.`,
    `Le chiffre des ${nom} de mon nombre est $${chiffre}$.`,
    `Dans mon nombre, le chiffre des ${nom} vaut $${chiffre}$.`,
    `On trouve $${chiffre}$ au rang des ${nom}.`,
  ]
  const t = choice(formulations, [])
  return {
    texteEnonce: t,
    texteCorrection: `Le chiffre des ${texteEnCouleurEtGras(nom, bleuMathalea)} est donné directement${sp()}: $${miseEnEvidence(chiffre, bleuMathalea)}$.`,
    contrainte: { type: 'direct', rang, valeur: chiffre },
  }
}

// Différentes façons de formuler un indice de comparaison entre deux
// chiffres. chiffresConnus est la liste des chiffres déjà fixés avec
// certitude par les indices PRÉCÉDENTS (valeur directe ou relation) : elle
// sert à exclure ces chiffres de la liste des possibles, puisqu'un chiffre
// déjà pris ailleurs ne peut plus être réutilisé (tous les chiffres sont
// différents).
function indiceComparaison(
  rangA: number,
  chiffreA: number,
  rangB: number,
  chiffreB: number,
  chiffresConnus: number[],
): Indice {
  const nomA = nomsPositions[rangA]
  const nomB = nomsPositions[rangB]
  const plusGrand = chiffreA > chiffreB
  const formulationsSup = [
    `Mon chiffre des ${nomA} est supérieur à mon chiffre des ${nomB}.`,
    `Mon chiffre des ${nomA} est plus grand que mon chiffre des ${nomB}.`,
    `Le chiffre des ${nomA} de mon nombre est plus grand que celui des ${nomB}.`,
  ]
  const formulationsInf = [
    `Mon chiffre des ${nomA} est inférieur à mon chiffre des ${nomB}.`,
    `Le chiffre des ${nomA} de mon nombre est plus petit que celui des ${nomB}.`,
    `Mon chiffre des ${nomA} est plus petit que mon chiffre des ${nomB}.`,
  ]
  const t = choice(plusGrand ? formulationsSup : formulationsInf, [])
  const candidats = rangeMinMax(0, 9)
    .filter((d) => (plusGrand ? d > chiffreB : d < chiffreB))
    .filter((d) => !chiffresConnus.includes(d))
    .sort((a, b) => b - a)
  const texteCandidats = candidats.map((d) => `soit $${d}$`).join(', ')
  return {
    texteEnonce: t,
    texteCorrection: `On sait que le chiffre des ${texteEnCouleurEtGras(nomA, bleuMathalea)} est ${plusGrand ? 'supérieur' : 'inférieur'} au chiffre des ${texteEnCouleurEtGras(nomB, bleuMathalea)} (ici $${miseEnEvidence(chiffreB, bleuMathalea)}$), donc le chiffre est ${texteCandidats}.`,
    contrainte: {
      type: 'comparaison',
      rangA,
      rangB,
      sens: plusGrand ? 'sup' : 'inf',
    },
  }
}

// Différentes façons de formuler un indice de relation type double/moitié...
// rangSujet, chiffreSujet est le chiffre décrit par "le double / la moitié...
// de mon chiffre des rangComplement".
function indiceRelation(
  mot: TypeVocabBinaire,
  rangSujet: number,
  chiffreSujet: number,
  rangComplement: number,
  chiffreComplement: number,
): Indice {
  const def = definitionsVocab[mot]
  const nomSujet = nomsPositions[rangSujet]
  const nomComplement = nomsPositions[rangComplement]
  const formulations = [
    `Mon chiffre des ${nomSujet} est ${def.article} de mon chiffre des ${nomComplement}.`,
    `${def.article[0].toUpperCase()}${def.article.slice(1)} de mon chiffre des ${nomComplement} est mon chiffre des ${nomSujet}.`,
  ]
  const t = choice(formulations, [])
  return {
    texteEnonce: t,
    texteCorrection: `Comme le chiffre des ${texteEnCouleurEtGras(nomComplement, bleuMathalea)} est $${miseEnEvidence(chiffreComplement, bleuMathalea)}$, ${def.article} donne $${miseEnEvidence(chiffreSujet, bleuMathalea)}$${sp()}: c'est bien le chiffre des ${texteEnCouleurEtGras(nomSujet, bleuMathalea)}.`,
    contrainte: { type: 'relation', rangSujet, rangComplement, mot },
  }
}

// Différentes façons de formuler un indice de somme ou de différence entre
// DEUX chiffres de référence (rangA, rangB) pour en trouver un troisième
// (rangResultat). La différence est prise en valeur absolue (l'écart entre
// les deux chiffres), pour rester un chiffre valide (0 à 9) quel que soit
// l'ordre des deux chiffres de référence.
function indiceSommeDifference(
  operation: TypeVocabTernaire,
  rangResultat: number,
  chiffreResultat: number,
  rangA: number,
  chiffreA: number,
  rangB: number,
  chiffreB: number,
): Indice {
  const nomResultat = nomsPositions[rangResultat]
  const nomA = nomsPositions[rangA]
  const nomB = nomsPositions[rangB]
  const formulations =
    operation === 'somme'
      ? [
          `Mon chiffre des ${nomResultat} est la somme de mon chiffre des ${nomA} et de mon chiffre des ${nomB}.`,
          `Si j'additionne mon chiffre des ${nomA} et mon chiffre des ${nomB}, j'obtiens mon chiffre des ${nomResultat}.`,
        ]
      : [
          `Mon chiffre des ${nomResultat} est la différence entre mon chiffre des ${nomA} et mon chiffre des ${nomB}.`,
          `L'écart entre mon chiffre des ${nomA} et mon chiffre des ${nomB} est mon chiffre des ${nomResultat}.`,
        ]
  const t = choice(formulations, [])
  const operationTexte =
    operation === 'somme'
      ? `${chiffreA} + ${chiffreB} = ${chiffreResultat}`
      : `${Math.max(chiffreA, chiffreB)} - ${Math.min(chiffreA, chiffreB)} = ${chiffreResultat}`
  return {
    texteEnonce: t,
    texteCorrection: `Comme les chiffres des ${texteEnCouleurEtGras(nomA, bleuMathalea)} et des ${texteEnCouleurEtGras(nomB, bleuMathalea)} sont $${miseEnEvidence(chiffreA, bleuMathalea)}$ et $${miseEnEvidence(chiffreB, bleuMathalea)}$, $${operationTexte}$${sp()}: c'est bien le chiffre des ${texteEnCouleurEtGras(nomResultat, bleuMathalea)}.`,
    contrainte: {
      type: 'relationTernaire',
      rangResultat,
      rangA,
      rangB,
      operation,
    },
  }
}

// Vérifie si la relation ternaire (somme ou différence) est vraie :
// chiffreResultat = chiffreA + chiffreB, ou |chiffreA - chiffreB|.
function relationTernaireValide(
  operation: TypeVocabTernaire,
  chiffreResultat: number,
  chiffreA: number,
  chiffreB: number,
): boolean {
  return operation === 'somme'
    ? chiffreResultat === chiffreA + chiffreB
    : chiffreResultat === Math.abs(chiffreA - chiffreB)
}

// Vérifie qu'une contrainte est satisfaite par une attribution complète de
// chiffres (un chiffre par rang).
function verifieContrainte(
  c: Contrainte,
  chiffres: { [rang: number]: number },
): boolean {
  if (c.type === 'direct') return chiffres[c.rang] === c.valeur
  if (c.type === 'relation') {
    const def = definitionsVocab[c.mot]
    return def.type === 'mult'
      ? chiffres[c.rangSujet] === def.k * chiffres[c.rangComplement]
      : chiffres[c.rangComplement] === def.k * chiffres[c.rangSujet]
  }
  if (c.type === 'relationTernaire') {
    return relationTernaireValide(
      c.operation,
      chiffres[c.rangResultat],
      chiffres[c.rangA],
      chiffres[c.rangB],
    )
  }
  return c.sens === 'sup'
    ? chiffres[c.rangA] > chiffres[c.rangB]
    : chiffres[c.rangA] < chiffres[c.rangB]
}

// Recherche EXHAUSTIVE, par force brute, de tous les nombres compatibles
// avec un ensemble de contraintes : on essaie toutes les façons d'attribuer
// des chiffres distincts (0 à 9, sans chiffre nul en tête) aux rangs, et on
// ne garde que celles qui vérifient toutes les contraintes. On déduit ainsi
// le ou les nombres à partir des phrases elles-mêmes, plutôt que de supposer
// que la construction des indices garantit à elle seule l'unicité (une
// comparaison, en particulier, ne fixe jamais un chiffre unique à elle
// seule : c'est la combinaison de toutes les contraintes qui décide).
// Avec au plus 6 rangs et 10 chiffres possibles, l'énumération reste très
// rapide (au plus 10×9×8×7×6×5 ≈ 151 200 attributions testées).
function solutionsCompatibles(
  rangs: number[],
  contraintes: Contrainte[],
): number[] {
  const rangMax = rangs[0]
  const resultats: number[] = []
  const assignation: { [rang: number]: number } = {}

  function essaie(index: number, dejaUtilises: Set<number>) {
    if (index === rangs.length) {
      if (contraintes.every((c) => verifieContrainte(c, assignation))) {
        resultats.push(rangsVersValeur(rangs, assignation))
      }
      return
    }
    const r = rangs[index]
    for (let d = 0; d <= 9; d++) {
      if (dejaUtilises.has(d)) continue
      if (r === rangMax && d === 0) continue
      assignation[r] = d
      dejaUtilises.add(d)
      essaie(index + 1, dejaUtilises)
      dejaUtilises.delete(d)
    }
  }

  essaie(0, new Set())
  return Array.from(new Set(resultats)).sort((a, b) => a - b)
}

export default class DevinetteNombreMystere extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Nombre de chiffres du nombre mystère (entre 3 et 6)',
      6,
    ]
    this.besoinFormulaire2Texte = [
      'Unités de numération utilisées',
      [
        'Nombres séparés par des tirets :',
        '1 : Centaines de mille',
        '2 : Dizaines de mille',
        '3 : Unités de mille',
        '4 : Centaines',
        '5 : Dizaines',
        '6 : Unités',
        '7 : Dixièmes',
        '8 : Centièmes',
        '9 : Millièmes',
        '10 : Mélange',
      ].join('\n'),
    ]
    this.besoinFormulaire3Texte = [
      'Vocabulaire utilisé',
      [
        'Nombres séparés par des tirets :',
        '1 : Moitié',
        '2 : Double',
        '3 : Tiers',
        '4 : Triple',
        '5 : Quadruple',
        '6 : Quart',
        '7 : Somme',
        '8 : Différence',
        '9 : Mélange',
      ].join('\n'),
    ]
    // Remarque : par défaut, l'unicité n'est pas exigée : elle est
    // déterminée automatiquement pour chaque question ; elle n'est possible
    // que si le rang des unités ('unite') fait partie des unités de
    // numération tirées pour cette question ; sinon, un indice est
    // automatiquement omis et l'énoncé est reformulé en conséquence (voir
    // plus bas, variable questionUnique). La case ci-dessous permet
    // d'exiger l'unicité systématiquement : une question dont la solution
    // ne serait pas unique est alors abandonnée et retirée au sort.
    this.besoinFormulaire4CaseACocher = ['Version QCM', true]
    this.besoinFormulaire5CaseACocher = ['Unicité de la solution', false]

    this.nbQuestions = 2

    this.sup = 5
    this.sup2 = '5-9'
    this.sup3 = 9
    this.sup4 = false
    this.sup5 = false
    this.correctionDetailleeDisponible = true
    this.correctionDetaillee = true
  }

  nouvelleVersion() {
    const nbChiffres = contraindreValeur(3, 6, this.sup, 5)
    const unitesNumeration = gestionnaireFormulaireTexte({
      nbQuestions: 10,
      saisie: this.sup2,
      max: 9,
      melange: 10,
      defaut: 10,
      enleveDoublons: true,
      listeOfCase: [
        'centaineMille',
        'dizaineMille',
        'uniteMille',
        'centaine',
        'dizaine',
        'unite',
        'dixieme',
        'centieme',
        'millieme',
      ],
    }).map(String)

    const vocabulaireChoisi = gestionnaireFormulaireTexte({
      nbQuestions: 10,
      saisie: this.sup3,
      max: 8,
      melange: 9,
      defaut: 9,
      enleveDoublons: true,
      listeOfCase: [
        'moitié',
        'double',
        'tiers',
        'triple',
        'quadruple',
        'quart',
        'somme',
        'difference',
      ],
    }) as TypeVocab[]
    // Quand un seul mot a été choisi (ou aucun), on fait tourner ce mot
    // unique d'une question à l'autre (comme avant). Quand plusieurs mots
    // ont été choisis, vocabulaireCycle n'est utile qu'en repli (voir plus
    // bas, si jamais this.nbQuestions dépasse la longueur du cycle).
    const vocabulaireCycle = combinaisonListes(
      vocabulaireChoisi,
      this.nbQuestions,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      const rangs = construireRangsDepuisUnites(unitesNumeration, nbChiffres)
      const rangMax = rangs[0]
      // vocabulaireActif : l'ensemble des mots éligibles pour cette
      // question. Si un seul mot a été choisi dans les paramètres, on le
      // fait tourner d'une question à l'autre (comme avant). Si plusieurs
      // mots ont été choisis, ils sont TOUS éligibles ; c'est la
      // construction de la chaîne, plus bas, qui privilégie systématiquement
      // un mot pas encore utilisé plutôt qu'une répétition (voir
      // motsUtilises), tant qu'il en reste un de disponible.
      const vocabulaireActif: TypeVocab[] =
        vocabulaireChoisi.length > 1
          ? vocabulaireChoisi
          : vocabulaireCycle[i]
            ? [vocabulaireCycle[i]]
            : []

      // Construction du nombre mystère par une véritable CHAÎNE de
      // déduction : on choisit d'abord un rang "ancre" TIRÉ AU HASARD (pas
      // forcément le rang le plus élevé), qui reçoit le seul indice de
      // valeur directe de toute la devinette. Tous les autres rangs sont
      // ensuite traités dans un ordre lui aussi tiré au hasard (donc la
      // dernière ligne ne correspond pas forcément au rang le plus faible),
      // et chacun est déduit UNIQUEMENT à partir d'une relation de
      // vocabulaire (double, moitié, somme...) ou d'une comparaison
      // (supérieur/inférieur) portant sur des rangs déjà connus.
      // On garantit :
      //  - le VOCABULAIRE est toujours prioritaire, et sans répétition
      //    évitable : chaque mot actif est utilisé au plus une fois avant
      //    qu'un autre ne soit répété (donc avec N mots actifs et au moins N
      //    rangs disponibles pour une relation, les N mots apparaissent tous,
      //    chacun une seule fois) ; une répétition ne survient que si le
      //    nombre de rangs disponibles dépasse le nombre de mots actifs ; si
      //    un seul mot est actif, il est réutilisé autant de fois que
      //    nécessaire pour combler les rangs restants ;
      //  - les comparaisons ("supérieur"/"inférieur") ne servent qu'à
      //    COMBLER ce que le vocabulaire ne couvre pas : on essaie d'en
      //    placer une de chaque, mais seulement dans la place laissée
      //    libre par le vocabulaire (jamais au détriment d'un mot encore
      //    inutilisé).
      // Le rang le plus élevé (rangMax) reçoit toujours un chiffre non nul,
      // qu'il soit l'ancre ou déduit plus tard dans la chaîne.

      const chiffresParRang: { [rang: number]: number } = {}
      // chiffresUtilises : TOUS les chiffres déjà attribués (pour la règle
      // "tous les chiffres différents"), y compris ceux d'un rang seulement
      // borné par une comparaison.
      const chiffresUtilises: number[] = []
      // rangsConnus/chiffresConnus : seulement les rangs dont le chiffre est
      // fixé avec CERTITUDE pour le lecteur (valeur directe ou relation) ;
      // seuls eux peuvent servir de point d'appui à un indice suivant, et ce
      // sont ces chiffres qui sont exclus des candidats affichés dans la
      // correction d'une comparaison (voir indiceComparaison).
      const rangsConnus: number[] = []
      const chiffresConnus: number[] = []
      const indices: Indice[] = []

      const chiffreValide = (candidat: number, rang: number): boolean =>
        Number.isInteger(candidat) &&
        candidat >= 0 &&
        candidat <= 9 &&
        !chiffresUtilises.includes(candidat) &&
        !(rang === rangMax && candidat === 0)

      const enregistre = (
        r: number,
        digit: number,
        indice: Indice,
        connu: boolean,
      ) => {
        chiffresParRang[r] = digit
        chiffresUtilises.push(digit)
        indices.push(indice)
        if (connu) {
          rangsConnus.push(r)
          chiffresConnus.push(digit)
        }
      }

      // 1) Chiffres "amicaux" pour l'ancre : un chiffre de référence isolé
      // ne permet une relation de vocabulaire que si au moins un des mots
      // binaires actifs (double, moitié...) donne, à partir de lui, un
      // résultat entier compris entre 0 et 9. Par exemple 5 et 7 ne
      // fonctionnent avec AUCUN des 6 mots binaires (5/2, 5/3, 5/4 ne sont
      // pas entiers, et 2×5, 3×5, 4×5 dépassent 9) : les choisir comme ancre
      // bloquerait toute relation tant qu'aucun autre rang n'est connu. On
      // calcule donc, pour le vocabulaire réellement actif cette fois-ci,
      // l'ensemble des chiffres d'ancrage qui laissent au moins une relation
      // possible, et on choisit l'ancre parmi eux.
      const motsBinairesActifs = vocabulaireActif.filter(
        (m): m is TypeVocabBinaire => !estVocabTernaire(m),
      )
      const chiffresAmicaux =
        motsBinairesActifs.length === 0
          ? rangeMinMax(1, 8)
          : rangeMinMax(1, 8).filter((d) =>
              motsBinairesActifs.some((mot) => {
                const def = definitionsVocab[mot]
                const candSujet = def.type === 'mult' ? def.k * d : d / def.k
                const candComplement =
                  def.type === 'mult' ? d / def.k : def.k * d
                return (
                  (Number.isInteger(candSujet) &&
                    candSujet >= 0 &&
                    candSujet <= 9 &&
                    candSujet !== d) ||
                  (Number.isInteger(candComplement) &&
                    candComplement >= 0 &&
                    candComplement <= 9 &&
                    candComplement !== d)
                )
              }),
            )
      const rangAncre = choice(rangs, [])
      const chiffreAncre = choice(
        chiffresAmicaux.length > 0 ? chiffresAmicaux : rangeMinMax(1, 8),
        [],
      )
      enregistre(
        rangAncre,
        chiffreAncre,
        indiceValeurDirecte(rangAncre, chiffreAncre),
        true,
      )

      // 2) Mots de vocabulaire déjà utilisés jusqu'ici. Tant qu'il reste un
      // mot actif encore jamais utilisé, on le préfère systématiquement à
      // une répétition (voir ordreMots plus bas) : avec N mots actifs, les
      // N premiers rangs qui utilisent une relation reçoivent donc N mots
      // tous différents ; une répétition ne peut survenir que si le nombre
      // de rangs disponibles pour des relations dépasse le nombre de mots
      // actifs.
      const motsUtilises: TypeVocab[] = []

      // 3) Comparaisons à garantir : une "supérieur", une "inférieur".
      let needSup = 1
      let needInf = 1

      // 4) Ordre de traitement des rangs restants, tiré au hasard (donc la
      // dernière ligne ne correspond pas forcément au rang le plus faible).
      const rangsRestants = shuffle(rangs.filter((r) => r !== rangAncre))

      rangsRestants.forEach((r) => {
        const quotaRestant = needSup + needInf
        const sensRequis: ('sup' | 'inf')[] = shuffle([
          ...(needSup > 0 ? (['sup'] as ('sup' | 'inf')[]) : []),
          ...(needInf > 0 ? (['inf'] as ('sup' | 'inf')[]) : []),
        ])
        const motsPasEncoreUtilises = vocabulaireActif.filter(
          (m) => !motsUtilises.includes(m),
        )
        const ordreMots = [
          ...shuffle(motsPasEncoreUtilises),
          ...shuffle(vocabulaireActif.filter((m) => motsUtilises.includes(m))),
        ]

        let indiceTrouve: Indice | null = null
        let digitTrouve: number | null = null
        let motSatisfait: TypeVocab | null = null

        const tenterRelation = () => {
          if (indiceTrouve) return
          for (const mot of ordreMots) {
            if (indiceTrouve) break
            if (estVocabTernaire(mot)) {
              if (rangsConnus.length < 2) continue
              for (const [rA, rB] of shuffle(toutesPaires(rangsConnus))) {
                const digitA = chiffresParRang[rA]
                const digitB = chiffresParRang[rB]
                const candidat =
                  mot === 'somme' ? digitA + digitB : Math.abs(digitA - digitB)
                if (chiffreValide(candidat, r)) {
                  indiceTrouve = indiceSommeDifference(
                    mot,
                    r,
                    candidat,
                    rA,
                    digitA,
                    rB,
                    digitB,
                  )
                  digitTrouve = candidat
                  motSatisfait = mot
                  break
                }
              }
            } else {
              const def = definitionsVocab[mot]
              for (const rRef of shuffle(rangsConnus)) {
                const chiffreRef = chiffresParRang[rRef]
                // r comme "sujet" (rRef comme "complément").
                const candidatSujet =
                  def.type === 'mult' ? def.k * chiffreRef : chiffreRef / def.k
                if (chiffreValide(candidatSujet, r)) {
                  indiceTrouve = indiceRelation(
                    mot,
                    r,
                    candidatSujet,
                    rRef,
                    chiffreRef,
                  )
                  digitTrouve = candidatSujet
                  motSatisfait = mot
                  break
                }
                // r comme "complément" (rRef comme "sujet").
                const candidatComplement =
                  def.type === 'mult' ? chiffreRef / def.k : def.k * chiffreRef
                if (chiffreValide(candidatComplement, r)) {
                  indiceTrouve = indiceRelation(
                    mot,
                    rRef,
                    chiffreRef,
                    r,
                    candidatComplement,
                  )
                  digitTrouve = candidatComplement
                  motSatisfait = mot
                  break
                }
              }
            }
          }
        }

        const tenterComparaisonRequise = () => {
          if (indiceTrouve || quotaRestant === 0 || rangsConnus.length === 0)
            return
          for (const sens of sensRequis) {
            if (indiceTrouve) break
            for (const rRef of shuffle(rangsConnus)) {
              const chiffreRef = chiffresParRang[rRef]
              const candidats = rangeMinMax(0, 9).filter(
                (d) =>
                  (sens === 'sup' ? d > chiffreRef : d < chiffreRef) &&
                  chiffreValide(d, r),
              )
              if (candidats.length > 0) {
                const candidat = choice(candidats, [])
                indiceTrouve = indiceComparaison(
                  r,
                  candidat,
                  rRef,
                  chiffreRef,
                  chiffresConnus,
                )
                digitTrouve = candidat
                if (sens === 'sup') needSup--
                else needInf--
                break
              }
            }
          }
        }

        const tenterComparaisonLibre = () => {
          if (indiceTrouve || rangsConnus.length === 0) return
          for (const sens of shuffle(['sup', 'inf'] as const)) {
            if (indiceTrouve) break
            for (const rRef of shuffle(rangsConnus)) {
              const chiffreRef = chiffresParRang[rRef]
              const candidats = rangeMinMax(0, 9).filter(
                (d) =>
                  (sens === 'sup' ? d > chiffreRef : d < chiffreRef) &&
                  chiffreValide(d, r),
              )
              if (candidats.length > 0) {
                const candidat = choice(candidats, [])
                indiceTrouve = indiceComparaison(
                  r,
                  candidat,
                  rRef,
                  chiffreRef,
                  chiffresConnus,
                )
                digitTrouve = candidat
                break
              }
            }
          }
        }

        // Ordre de priorité : le vocabulaire passe toujours avant tout tant
        // qu'il reste un mot à garantir, pour ne jamais manquer l'occasion
        // de l'utiliser. Les comparaisons ("supérieur"/"inférieur") ne
        // servent qu'à combler les rangs restants une fois le vocabulaire
        // placé (ou quand une relation échoue) : il se peut donc, si le
        // vocabulaire choisi occupe déjà toute la place disponible, qu'il
        // n'y ait pas de "supérieur" et/ou d'"inférieur" dans une devinette
        // donnée.
        if (motsPasEncoreUtilises.length > 0) {
          tenterRelation()
          tenterComparaisonRequise()
          tenterComparaisonLibre()
        } else if (quotaRestant > 0) {
          tenterComparaisonRequise()
          tenterRelation()
          tenterComparaisonLibre()
        } else {
          tenterRelation()
          tenterComparaisonLibre()
        }

        if (motSatisfait && !motsUtilises.includes(motSatisfait)) {
          motsUtilises.push(motSatisfait)
        }

        // c) Filet de sécurité ultime (ne devrait quasiment jamais se
        // produire avec au plus 6 rangs et 10 chiffres disponibles) : un
        // chiffre encore libre quelconque, décrit directement.
        if (!indiceTrouve) {
          const candidats = rangeMinMax(0, 9).filter((d) => chiffreValide(d, r))
          const candidat = candidats.length > 0 ? choice(candidats, []) : 0
          indiceTrouve = indiceValeurDirecte(r, candidat)
          digitTrouve = candidat
        }

        enregistre(
          r,
          digitTrouve as number,
          indiceTrouve,
          indiceTrouve.contrainte.type !== 'comparaison',
        )
      })

      // On déduit le (ou les) nombre(s) à partir des indices eux-mêmes,
      // plutôt que de supposer que leur construction garantit à elle seule
      // l'unicité : le solveur essaie toutes les attributions de chiffres
      // possibles et ne garde que celles qui vérifient TOUS les indices.
      // Une comparaison, en particulier, n'impose jamais un chiffre unique à
      // elle seule ; mais combinée aux autres indices (chiffres déjà pris,
      // valeurs directes, relations), il arrive que la solution le devienne
      // quand même. On affiche donc systématiquement tous les indices tirés
      // (aucun n'est retiré), et c'est le nombre de solutions trouvées par
      // le solveur qui décide si la devinette est unique ou non.
      const valeurCorrecte = rangsVersValeur(rangs, chiffresParRang)
      const nbDecimales = Math.max(
        0,
        ...rangs.filter((r) => r < 0).map((r) => -r),
      )
      const nombresPossibles = solutionsCompatibles(
        rangs,
        indices.map((indice) => indice.contrainte),
      )
      const questionUnique = nombresPossibles.length <= 1

      const introductions = [
        `Je suis un nombre ${nbDecimales === 0 ? 'entier' : ''} à $${rangs.length}$ chiffres, tous différents.<br>`,
        `Je suis un mystérieux nombre ${nbDecimales === 0 ? 'entier' : ''} composé de $${rangs.length}$ chiffres, tous différents les uns des autres.<br>`,
      ]
      texte = choice(introductions, [])
      indices.forEach((indice, k) => {
        texte += `${numAlpha(k)} ${indice.texteEnonce}<br>`
      })
      texte += questionUnique
        ? choice([`Qui suis-je${sp()}?`, `Quel est ce nombre${sp()}?`], [])
        : choice(
            [
              `Quel nombre pourrais-je être${sp()}?`,
              'Trouver un nombre qui vérifie tous les indices.',
            ],
            [],
          )

      // Correction
      texteCorr = this.correctionDetaillee
        ? `Reprenons les indices dans l'ordre${sp()}: <br>`
        : ''
      if (this.correctionDetaillee) {
        indices.forEach((indice, k) => {
          texteCorr += `${numAlpha(k)} ${indice.texteCorrection}<br>`
        })
      } else {
        // texteCorr += `En combinant tous les indices, on retrouve chaque chiffre du nombre.<br>`
      }
      if (questionUnique) {
        texteCorr += `Le nombre mystère est ${this.correctionDetaillee ? 'donc' : ''} $${miseEnEvidence(texNombre(valeurCorrecte, nbDecimales))}$.`
      } else {
        const valeursAffichees = nombresPossibles
          .slice(0, 10)
          .map((v) => `$${miseEnEvidence(texNombre(v, nbDecimales))}$`)

        const listeTexte =
          valeursAffichees.length > 1
            ? `${valeursAffichees.slice(0, -1).join(' ; ')} et ${valeursAffichees.at(-1)}`
            : valeursAffichees.join('')
        texteCorr +=
          'Les indices ne suffisent pas, à eux seuls, à déterminer un unique nombre. En combinant tous les indices donnés, voici '
        if (nombresPossibles.length < 15)
          texteCorr += `les $${nombresPossibles.length}$ nombres qui peuvent convenir${sp()}: ${listeTexte}.`
        else
          texteCorr += `${10} nombres parmi les $${nombresPossibles.length}$ qui peuvent convenir${sp()}: ${listeTexte}.`
      }

      if (this.sup4 || context.isAmc) {
        texte += ' Cocher la bonne réponse.'
        // QCM : on énumère toutes les permutations des chiffres tirés (elles
        // violent en général au moins un des indices donnés puisque les
        // chiffres changent de place), on écarte celles qui commencent par un
        // 0 ou qui correspondent à une réponse valide (nombresPossibles), puis
        // on en garde exactement NB_PROPOSITIONS_FAUSSES, tirées au hasard
        // parmi les candidates restantes. Cette énumération complète garantit
        // toujours ce nombre exact de distracteurs (à la différence d'un
        // tirage aléatoire répété, qui peut parfois échouer à en trouver
        // assez).
        const chiffresListe = rangs.map((r) => chiffresParRang[r])
        const valeursValides = new Set<number>(nombresPossibles)
        const valeursVues = new Set<number>()
        const propositionsFausses: number[] = []
        for (const permutation of shuffle(permutationsDe(chiffresListe))) {
          if (propositionsFausses.length >= NB_PROPOSITIONS_FAUSSES) break
          const chiffresPermutes: { [rang: number]: number } = {}
          rangs.forEach((r, idx) => {
            chiffresPermutes[r] = permutation[idx]
          })
          if (rangMax >= 0 && chiffresPermutes[rangMax] === 0) continue
          const valeur = rangsVersValeur(rangs, chiffresPermutes)
          if (valeursValides.has(valeur) || valeursVues.has(valeur)) continue
          valeursVues.add(valeur)
          propositionsFausses.push(valeur)
        }

        this.autoCorrection[i] = {}
        this.autoCorrection[i].enonce = `${texte}\n`
        this.autoCorrection[i].propositions = [
          {
            texte: `$${texNombre(valeurCorrecte, nbDecimales)}$`,
            statut: true,
          },
          ...propositionsFausses.map((v) => ({
            texte: `$${texNombre(v, nbDecimales)}$`,
            statut: false,
          })),
        ]
        this.autoCorrection[i].options = {
          ordered: false,
          lastChoice: NB_PROPOSITIONS_FAUSSES + 2,
        }
        const props = propositionsQcm(this, i)
        texte += '<br>' + props.texte
      } else {
        texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers)
        handleAnswers(this, i, {
          reponse: {
            value: nombresPossibles,
            options: { nombreDecimalSeulement: true },
          },
        })
      }
      // Si l'unicité est demandée mais reste hors d'atteinte avec le vocabulaire
      // choisi (un seul mot, par exemple), on finit par accepter une devinette
      // à plusieurs solutions plutôt que de ne générer aucune question.
      const unicitePossible = cpt < 49
      if (
        (!this.sup5 || questionUnique || !unicitePossible) &&
        this.questionJamaisPosee(i, valeurCorrecte)
      ) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
