import type { KeysList, AlphanumericPages } from '../types/keyboardContent'

const rowsAlphaLow: KeysList[] = [
  ['a', 'z', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['q', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm'],
  ['ABC', 'w', 'x', 'c', 'v', 'b', 'n', 'DEL'],
  ['NUM', 'COMMA', 'SPACE', 'POINT', 'BACK', 'FWD', 'CLOSE'],
]
const rowsAlphaUp: KeysList[] = [
  ['A', 'Z', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['Q', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M'],
  ['abc', 'W', 'X', 'C', 'V', 'B', 'N', 'DEL'],
  ['NUM', 'COMMA', 'SPACE', 'POINT', 'BACK', 'FWD', 'CLOSE'],
]
const rowsNum: KeysList[] = [
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
  [
    'ADD',
    'SUB',
    'MULT',
    'DIV',
    'FRAC',
    '=',
    'COLON',
    'SEMICOLON',
    'QUOTE',
    'DBLQUOTE',
  ],
  ['SQ', 'CUBE', 'POW', 'POW10', 'SQRT', 'LESS', 'GREAT', 'AND', 'OR', 'AST'],
  ['abc', '(', ')', '[', ']', '{', '}', 'INTPOINT', 'EXCPOINT', 'PERCENT'],
]

export const alphanumericLayouts: { [key in AlphanumericPages]: KeysList[] } = {
  AlphaLow: rowsAlphaLow,
  AlphaUp: rowsAlphaUp,
  Numeric: rowsNum,
}
