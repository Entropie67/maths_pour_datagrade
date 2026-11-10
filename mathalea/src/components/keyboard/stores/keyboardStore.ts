import { writable } from 'svelte/store'
import type {
  AlphanumericPages,
  BlockForKeyboard,
} from '../types/keyboardContent'

export const keyboardState = writable<{
  isVisible: boolean
  isInLine: boolean
  idMathField: string
  alphanumericLayout: AlphanumericPages
  blocks: BlockForKeyboard[]
  /** Blocs de touches demandés par la question en cours, en plus des blocs. */
  customKeys: string[][]
}>({
  isVisible: false,
  isInLine: !('ontouchstart' in window),
  idMathField: '',
  alphanumericLayout: 'AlphaLow',
  blocks: ['numbers', 'fullOperations'],
  customKeys: [],
})
