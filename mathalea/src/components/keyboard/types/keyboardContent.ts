import { specialKeys } from '../layouts/keysBlocks'
import type { keys } from '../lib/keycaps'
import { GAP_BETWEEN_KEYS, KEYCAP_WIDTH } from '../lib/sizes'
export type Keys = keyof typeof keys
export type KeysList = Keys[]
export type AlphanumericPages = 'AlphaUp' | 'AlphaLow' | 'Numeric'
export type BlockForKeyboard =
  | 'alphanumeric'
  | 'advanced'
  | 'angles'
  | 'areas'
  | 'basicOperations'
  | 'basicOperations2'
  | 'basicOperationsComplexes'
  | 'basicOperationsPlus'
  | 'capacities'
  | 'chiffresEtMultiplication'
  | 'compare'
  | 'complexes'
  | 'degre'
  | 'degreCelsius'
  | 'emvxBlock'
  | 'equationsTerminale'
  | 'ensemble'
  | 'ensembleDefini'
  | 'fullOperations'
  | 'greek'
  | 'hms'
  | 'lengths'
  | 'clavierFonctionsTerminales'
  | 'lectureLimites'
  | 'limitesSimple'
  | 'majuscules'
  | 'minuscules'
  | 'masses'
  | 'matrix'
  | 'numbers'
  | 'numbersPointVirgule'
  | 'numbersX'
  | 'numbersInconnue'
  | 'numbers2'
  | 'numbersOperations'
  | 'numbersOperationsX'
  | 'limites'
  | 'numbersSpace'
  | 'numeration'
  | 'probabilite'
  | 'suite'
  | 'trigo'
  | 'variableN'
  | 'variables'
  | 'volumes'
  | 'vFON'
  | 'uppercaseAToH'
  | 'uppercaseIToP'
  | 'uppercaseQToW'
  | 'uppercaseXToZ'
  | 'estOuestSudNord'
  | 'algo'

export interface CompleteKeysList {
  inline: KeysList
  block: KeysList
}

export interface KeyboardBlock {
  keycaps: CompleteKeysList
  cols: number
  title: string
  isUnits: boolean
}

export class Keyboard {
  blocks: KeyboardBlock[] = [specialKeys]

  constructor(kb?: KeyboardBlock) {
    if (kb) {
      this.blocks.push(kb)
    }
  }

  /**
   * Ajoute un bloc de touche au clavier
   * @param kb {KeyboardBlock} bloc de touches à ajouter
   * @returns le clavier lui-même (on peut donc chaîner cette fonction)
   */
  add = (kb: KeyboardBlock): Keyboard => {
    this.blocks.push(kb)
    return this
  }

  empty = (): void => {
    this.blocks.length = 0
    this.blocks.push(specialKeys)
  }

  /**
   * Retrouve le nombre de blocs dans le clavier
   * @returns nombre de blocs dans le clavier
   */
  numberOfBlocks = (): number => this.blocks.length

  /**
   * Construit un tableau dont les éléments sont le nombre de touche par bloc
   * @returns nombre de touches par bloc (liste de nombres)
   */
  numberOfKeysPerBlock = (): number[] => {
    const result: number[] = []
    for (const block of this.blocks) {
      result.push(block.keycaps.inline.length)
    }
    return result
  }

  /**
   * Calcule le nombre total de touches dans le clavier
   * @returns nombre total de touches
   */
  numberOfKeys = (): number =>
    this.numberOfKeysPerBlock().reduce((prev, current) => prev + current)

  /**
   * Décide si on passe le bloc des touches spéciales sur deux colonnes
   * lorsqu'on a que deux touches par bloc
   * (utile dans la cas de clavier cotenant très peu de touches)
   */
  checkSmallLayoutAllowed = (): void => {
    const maximumNbKeysPerBlock = this.numberOfKeysPerBlock()
      .slice(1)
      .reduce((prev, current) => (prev < current ? current : prev), 0)
    if (maximumNbKeysPerBlock <= 2) {
      // le premier bloc est celui des touches spéciales, on le passe en deux colonnes.
      this.blocks[0].cols = 2
    }
  }
}

export const inLineBlockWidth = (
  block: KeyboardBlock,
  mode: 'sm' | 'md' | 'lg' | 'xl',
): number => {
  // 3G30-1 renvoie un keycaps undefined, pourquoi ?
  const numberOfKeys = block?.keycaps?.inline?.length || 0
  // console.log('nb of keys: ' + numberOfKeys + ' / key width: ' + KEYCAP_WIDTH[mode]s + ' / gap between keys: ' + GAP_BETWEEN_KEYS[mode])
  return (
    numberOfKeys * KEYCAP_WIDTH[mode] +
    (numberOfKeys - 1) * GAP_BETWEEN_KEYS[mode]
  )
}
export const usualBlockWidth = (
  block: KeyboardBlock,
  mode: 'sm' | 'md' | 'lg' | 'xl',
): number => {
  const numberOfCols = block.cols
  return (
    numberOfCols * KEYCAP_WIDTH[mode] +
    (numberOfCols - 1) * GAP_BETWEEN_KEYS[mode]
  )
}

/**
 * Découpe un bloc en tranches de touches consécutives dont la largeur en ligne
 * ne dépasse pas `largeurMax`, pour qu'un bloc trop large ne déborde pas de
 * l'écran. Un bloc qui tient en entier est renvoyé tel quel.
 * @param block bloc à découper
 * @param mode mode d'affichage (tailles des touches)
 * @param largeurMax largeur maximale d'une tranche, en pixels
 */
export const decoupeBlocEnLigne = (
  block: KeyboardBlock,
  mode: 'sm' | 'md' | 'lg' | 'xl',
  largeurMax: number,
): KeyboardBlock[] => {
  const touches = block?.keycaps?.inline ?? []
  const nbTouchesMax = Math.max(
    1,
    Math.floor(
      (largeurMax + GAP_BETWEEN_KEYS[mode]) /
        (KEYCAP_WIDTH[mode] + GAP_BETWEEN_KEYS[mode]),
    ),
  )
  if (touches.length <= nbTouchesMax) return [block]
  // Tranches de tailles voisines pour éviter une touche isolée sur sa page.
  const nbTranches = Math.ceil(touches.length / nbTouchesMax)
  const taille = Math.ceil(touches.length / nbTranches)
  const tranches: KeyboardBlock[] = []
  for (let debut = 0; debut < touches.length; debut += taille) {
    const inline = touches.slice(debut, debut + taille)
    tranches.push({
      ...block,
      keycaps: { inline, block: inline },
      cols: inline.length,
    })
  }
  return tranches
}
