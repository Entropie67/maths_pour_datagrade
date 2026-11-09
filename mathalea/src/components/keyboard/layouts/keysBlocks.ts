import { keys } from '../lib/keycaps'
import type {
  BlockForKeyboard,
  CompleteKeysList,
  KeyboardBlock,
  KeysList,
} from '../types/keyboardContent'

// Keycaps lists
export const specialKeysCaps: CompleteKeysList = {
  inline: ['BACK', 'FWD', 'DEL', 'CLOSE'],
  block: ['BACK', 'FWD', 'DEL', 'CLOSE'],
}
const numbersCaps: CompleteKeysList = {
  inline: [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 'COMMA', 'PI'],
  block: [7, 8, 9, 4, 5, 6, 1, 2, 3, 0, 'COMMA', 'PI'],
}
const numbersPointVirguleCaps: CompleteKeysList = {
  inline: [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 'SEMICOLON'],
  block: [7, 8, 9, 4, 5, 6, 1, 2, 3, 0, 'SEMICOLON'],
}
const chiffresEtMultiplicationCaps: CompleteKeysList = {
  inline: [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 'MULT'],
  block: [7, 8, 9, 4, 5, 6, 1, 2, 3, 0, 'MULT'],
}
const complexesCap: CompleteKeysList = {
  inline: [
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    0,
    'iComplex',
    'ADD',
    'SUB',
    'FRAC',
    'POW',
    'PI',
    'COMMA',
    'PARENTHESES',
    'SQRT',
    'e^',
    'COS',
    'SIN',
    'THETA',
    'NORM',
  ],
  block: [
    7,
    8,
    9,
    'iComplex',
    'FRAC',
    'COS',
    4,
    5,
    6,
    'ADD',
    'POW',
    'SIN',
    1,
    2,
    3,
    'SUB',
    'PI',
    'THETA',
    0,
    'COMMA',
    'PARENTHESES',
    'SQRT',
    'e^',
    'NORM',
  ],
}
const numbersCapsInconnue: CompleteKeysList = {
  inline: [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 'COMMA', 'INCONNUE'],
  block: [7, 8, 9, 4, 5, 6, 1, 2, 3, 0, 'COMMA', 'INCONNUE'],
}
const numbersCaps2: CompleteKeysList = {
  inline: [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 'COMMA', '='],
  block: [7, 8, 9, 4, 5, 6, 1, 2, 3, 0, 'COMMA', '='],
}
const numbersCapsX: CompleteKeysList = {
  inline: [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 'COMMA', 'xMath'],
  block: [7, 8, 9, 4, 5, 6, 1, 2, 3, 0, 'COMMA', 'xMath'],
}
const numbersOperationsCaps: CompleteKeysList = {
  inline: [
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    0,
    'COMMA',
    'PI',
    'DIV',
    'MULT',
    'SUB',
    'ADD',
  ],
  block: [
    7,
    8,
    9,
    'DIV',
    4,
    5,
    6,
    'MULT',
    1,
    2,
    3,
    'SUB',
    0,
    'COMMA',
    'PI',
    'ADD',
  ],
}
const limitesCaps: CompleteKeysList = {
  inline: [
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    0,
    'COMMA',
    'INFTY',
    'FRAC',
    'SQRT',
    'e^',
    'LN',
    'DIV',
    'MULT',
    'SUB',
    'ADD',
  ],
  block: [
    'FRAC',
    'ADD',
    7,
    8,
    9,
    'SQRT',
    'SUB',
    4,
    5,
    6,
    'e^',
    'MULT',
    1,
    2,
    3,
    'LN',
    'DIV',
    'INFTY',
    0,
    'COMMA',
  ],
}
const lectureLimitesCaps: CompleteKeysList = {
  inline: [
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    0,
    'COMMA',
    'SUB',
    'PLUS_INFTY',
    'MINUS_INFTY',
    'NOT_EXISTS',
  ],
  block: [
    7,
    8,
    9,
    'PLUS_INFTY',
    4,
    5,
    6,
    'MINUS_INFTY',
    1,
    2,
    3,
    'NOT_EXISTS',
    'SUB',
    0,
    'COMMA',
  ],
}
const limitesSimpleCaps: CompleteKeysList = {
  inline: [
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    0,
    'COMMA',
    'SUB',
    'PLUS_INFTY',
    'MINUS_INFTY',
  ],
  block: [
    7,
    8,
    9,
    'PLUS_INFTY',
    4,
    5,
    6,
    'MINUS_INFTY',
    1,
    2,
    3,
    'SUB',
    0,
    'COMMA',
  ],
}
const numbersOperationsXCaps: CompleteKeysList = {
  inline: [
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    0,
    'COMMA',
    'xMath',
    'DIV',
    'MULT',
    'SUB',
    'ADD',
  ],
  block: [
    7,
    8,
    9,
    'DIV',
    4,
    5,
    6,
    'MULT',
    1,
    2,
    3,
    'SUB',
    0,
    'COMMA',
    'xMath',
    'ADD',
  ],
}
const numbersSpaceCaps: CompleteKeysList = {
  inline: [
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    0,
    'COMMA',
    'SPACE',
    'DIV',
    'MULT',
    'SUB',
    'ADD',
  ],
  block: [
    1,
    2,
    3,
    'DIV',
    4,
    5,
    6,
    'MULT',
    7,
    8,
    9,
    'SUB',
    0,
    'COMMA',
    'SPACE',
    'ADD',
  ],
}
const variableCaps: CompleteKeysList = {
  inline: [
    'aMath',
    'bMath',
    'cMath',
    'xMath',
    'yMath',
    'zMath',
    'kMath',
    'nMath',
    'iMath',
    'hMath',
    'V',
    'F',
  ],
  block: [
    'aMath',
    'xMath',
    'kMath',
    'bMath',
    'yMath',
    'nMath',
    'cMath',
    'zMath',
    'iMath',
    'hMath',
    'V',
    'F',
  ],
}
const variableNCaps: CompleteKeysList = {
  inline: ['nMath'],
  block: ['nMath'],
}
const basicOperationCaps: CompleteKeysList = {
  inline: ['ADD', 'SUB', 'MULT', 'DIV', 'SQ', 'FRAC', '(', ')'],
  block: ['ADD', 'SUB', 'MULT', 'DIV', 'SQ', 'FRAC', '(', ')'],
}
const basicOperationPlusCaps: CompleteKeysList = {
  inline: [
    'ADD',
    'SUB',
    'MULT',
    'DIV',
    'xMath',
    'SQ',
    'POW',
    'FRAC',
    '(',
    ')',
    'BRACKETS',
    'SEMICOLON',
  ],
  block: [
    'xMath',
    'ADD',
    'SUB',
    'SQ',
    'MULT',
    'DIV',
    'POW',
    'BRACKETS',
    'FRAC',
    'SEMICOLON',
    '(',
    ')',
  ],
}
const basicOperationCaps2: CompleteKeysList = {
  inline: ['ADD', 'SUB', 'MULT', 'DIV', '=', 'FRAC', '(', ')'],
  block: ['ADD', 'SUB', 'MULT', 'DIV', '=', 'FRAC', '(', ')'],
}
const basicOperationComplexesCaps: CompleteKeysList = {
  inline: ['ADD', 'SUB', 'MULT', 'DIV', '=', 'FRAC', '(', ')', 'iComplex'],
  block: ['ADD', 'SUB', 'MULT', 'DIV', '=', 'FRAC', '(', ')', 'iComplex'],
}
const fullOperationCaps: CompleteKeysList = {
  inline: [
    'ADD',
    'SUB',
    'MULT',
    'DIV',
    'FRAC',
    '=',
    '(',
    ')',
    'xMath',
    'SQRT',
    'SQ',
    'POW',
    'POW10',
    'DEG',
    'PERCENT',
    'SEMICOLON',
  ],
  block: [
    'ADD',
    'SUB',
    'xMath',
    'DEG',
    'MULT',
    'DIV',
    'SQ',
    'SQRT',
    '(',
    ')',
    'POW',
    'PERCENT',
    '=',
    'FRAC',
    'POW10',
    'SEMICOLON',
  ],
}
const terminaleCaps: CompleteKeysList = {
  inline: [
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    0,
    'LOG',
    'LN',
    'POW',
    'FRAC',
    'SEMICOLON',
    'COMMA',
    'DIV',
    'MULT',
    'SUB',
    'ADD',
    'SQRT',
    'SQRTN',
    'e^',
    'INFTY',
    'PARENTHESES',
    'POW10',
    'BRACES',
    'BRACKETS',
    'xMath',
  ],
  block: [
    'SQRT',
    'SQRTN',
    'LN',
    'LOG',
    7,
    8,
    9,
    'POW',
    'e^',
    'FRAC',
    'INFTY',
    4,
    5,
    6,
    'POW10',
    'PARENTHESES',
    'BRACES',
    'xMath',
    1,
    2,
    3,
    'ADD',
    'SUB',
    'MULT',
    'DIV',
    0,
    'COMMA',
    'SEMICOLON',
  ],
}

const numerationCaps: CompleteKeysList = {
  inline: [
    'MILLIARD',
    'MILLION',
    'MILLE',
    'CENTAINE',
    'DIZAINE',
    'UNITE',
    'DE',
    'DIXIEME',
    'CENTIEME',
    'MILLIEME',
    'DIX_MILLIEME',
    'CENT_MILLIEME',
    'MILLIONIEME',
    'HYPHEN',
    'DIX',
    'VINGT',
    'TRENTE',
    'QUARANTE',
    'CINQUANTE',
    'SOIXANTE',
    'SOIXANTE_DIX',
    'QUATRE_VINGT',
    'QUATRE_VINGT_DIX',
    'CENT',
  ],
  block: [
    'MILLIARD',
    'MILLION',
    'MILLE',
    'CENTAINE',
    'DIZAINE',
    'UNITE',
    'DE',
    'DIXIEME',
    'CENTIEME',
    'MILLIEME',
    'DIX_MILLIEME',
    'CENT_MILLIEME',
    'MILLIONIEME',
    'HYPHEN',
    'DIX',
    'VINGT',
    'TRENTE',
    'QUARANTE',
    'CINQUANTE',
    'SOIXANTE',
    'SOIXANTE_DIX',
    'QUATRE_VINGT',
    'QUATRE_VINGT_DIX',
    'CENT',
  ],
}

const probabiliteCaps: CompleteKeysList = {
  inline: [
    'PROB',
    'BINOM',
    'OVERLINE',
    'UNION',
    'INTER',
    'EMPTY',
    'SEMICOLON',
    'PARENTHESES',
    'POW',
    'INDICE',
    'QUOTE',
    '=',
  ],
  block: [
    'PROB',
    'BINOM',
    'OVERLINE',
    'UNION',
    'INTER',
    'EMPTY',
    'SEMICOLON',
    'PARENTHESES',
    'POW',
    'INDICE',
    'QUOTE',
    '=',
  ],
}

const ensembleCaps: CompleteKeysList = {
  inline: [
    'ADD',
    'SUB',
    'INFTY',
    'BRACES',
    '[',
    ']',
    'IN',
    'SEMICOLON',
    'FRAC',
    'SQRT',
    'POW',
    'POW10',
  ],
  block: [
    'ADD',
    'SUB',
    'INFTY',
    'BRACES',
    '[',
    ']',
    'IN',
    'SEMICOLON',
    'FRAC',
    'SQRT',
    'POW',
    'POW10',
  ],
}

const ensembleDefiniCaps: CompleteKeysList = {
  inline: [
    'COMP',
    'REAL',
    'RATIO',
    'DECIMAL',
    'REL',
    'INTEG',
    'EMPTY',
    'UNION',
    'INTER',
    'BACKSLASH',
  ],
  block: [
    'COMP',
    'REAL',
    'RATIO',
    'DECIMAL',
    'REL',
    'INTEG',
    'EMPTY',
    'UNION',
    'INTER',
    'BACKSLASH',
  ],
}

const equationsTerminaleCaps: CompleteKeysList = {
  inline: [
    'ADD',
    'SUB',
    'MULT',
    'INFTY',
    '[',
    ']',
    'SEMICOLON',
    'EMPTY',
    'BRACES',
    'PARENTHESES',
    'FRAC',
    'POW',
    'SQRT',
    'e^',
    'LOG',
    'LN',
  ],
  block: [
    'ADD',
    'SUB',
    'MULT',
    'INFTY',
    '[',
    ']',
    'SEMICOLON',
    'EMPTY',
    'BRACES',
    'PARENTHESES',
    'FRAC',
    'SQRT',
    'POW',
    'e^',
    'LOG',
    'LN',
  ],
}

const suiteCaps: CompleteKeysList = {
  inline: [
    'U_INDICE_N',
    'V_INDICE_N',
    'W_INDICE_N',
    'C_INDICE_N',
    'nMath',
    'kMath',
    'INDICE_N',
    'INDICE',
  ],
  block: [
    'U_INDICE_N',
    'V_INDICE_N',
    'W_INDICE_N',
    'C_INDICE_N',
    'nMath',
    'kMath',
    'INDICE_N',
    'INDICE',
  ],
}

const hmsCaps: CompleteKeysList = {
  inline: ['WEEK', 'DAY', 'HOUR', 'MIN', 'SEC'],
  block: ['WEEK', 'DAY', 'HOUR', 'MIN', 'SEC'],
}

const greekCaps: CompleteKeysList = {
  inline: [
    'ALPHA',
    'BETA',
    'GAMMA',
    'DELTA',
    'EPSILON',
    'THETA',
    'LAMBDA',
    'OMEGA',
  ],
  block: [
    'ALPHA',
    'BETA',
    'GAMMA',
    'DELTA',
    'EPSILON',
    'THETA',
    'LAMBDA',
    'OMEGA',
  ],
}

const compareCaps: CompleteKeysList = {
  inline: ['LESS', 'GREAT', '=', 'LESSEQ', 'GREATEQ'],
  block: ['LESS', 'GREAT', '=', 'LESSEQ', 'GREATEQ'],
}

const degreCaps: CompleteKeysList = {
  inline: ['DEG'],
  block: ['DEG'],
}

const degreCelsiusCaps: CompleteKeysList = {
  inline: ['DEGCELSIUS'],
  block: ['DEGCELSIUS'],
}

const emvxBlockCaps: CompleteKeysList = {
  inline: ['E', 'm', 'v', 'xMath'],
  block: ['E', 'm', 'v', 'xMath'],
}

const trigoCaps: CompleteKeysList = {
  inline: ['COS', 'SIN', 'TAN', 'ANG'],
  block: ['COS', 'SIN', 'TAN', 'ANG'],
}

const advancedCaps: CompleteKeysList = {
  inline: [
    'FCT',
    'LIM',
    'INT',
    'SIGMA',
    'BINOM', //
    'UNION',
    'INTER',
    'INFTY',
    'EMPTY',
    'PROB', //
    'VECT',
    'BRACKETS',
    'BRACES',
    'LESSEQ',
    'GREATEQ', //
    'COMP',
    'REAL',
    'RATIO',
    'REL',
    'INTEG',
  ],
  block: [
    'FCT',
    'LIM',
    'INT',
    'SIGMA',
    'BINOM', //
    'UNION',
    'INTER',
    'INFTY',
    'EMPTY',
    'PROB', //
    'VECT',
    'BRACKETS',
    'BRACES',
    'LESSEQ',
    'GREATEQ', //
    'COMP',
    'REAL',
    'RATIO',
    'REL',
    'INTEG',
  ],
}

const matrixCaps: CompleteKeysList = {
  inline: ['MATRIX'],
  block: ['MATRIX'],
}

const anglesCaps: CompleteKeysList = {
  inline: ['ANG', 'DEG', 'QUOTE', '='],
  block: ['ANG', 'DEG', 'QUOTE', '='],
}

const aToHCaps: CompleteKeysList = {
  inline: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
  block: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
}

const iToPCaps: CompleteKeysList = {
  inline: ['I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'],
  block: ['I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'],
}

const qToWCaps: CompleteKeysList = {
  inline: ['Q', 'R', 'S', 'T', 'U', 'V', 'W'],
  block: ['Q', 'R', 'S', 'T', 'U', 'V', 'W'],
}

const xToZCaps: CompleteKeysList = {
  inline: ['X', 'Y', 'Z'],
  block: ['X', 'Y', 'Z'],
}

const vFONCaps: CompleteKeysList = {
  inline: ['V', 'F', 'O', 'N'],
  block: ['V', 'F', 'O', 'N'],
}

const eosnCaps: CompleteKeysList = {
  inline: ['O', 'E', 'S', 'N', 'DEG', 'SEMICOLON'],
  block: ['O', 'E', 'S', 'N', 'DEG', 'SEMICOLON'],
}

const algoCaps: CompleteKeysList = {
  inline: [
    'NORD',
    'SUD',
    'EST',
    'OUEST',
    'AVANCE',
    'RECULE',
    'TOURNE_DROITE',
    'TOURNE_GAUCHE',
    'DEMITOUR',
    'SEMICOLON',
  ],
  block: [
    'NORD',
    'SUD',
    'EST',
    'OUEST',
    'AVANCE',
    'RECULE',
    'TOURNE_DROITE',
    'TOURNE_GAUCHE',
    'DEMITOUR',
    'SEMICOLON',
  ],
}
const majusculesCaps: CompleteKeysList = {
  inline: [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
  ],
  block: [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
  ],
}

const minusculesCaps: CompleteKeysList = {
  inline: [
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z',
  ],
  block: [
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z',
  ],
}

const lengthUnitsKeys = Object.keys(keys)
  .filter((k) => k.includes('LENGTH'))
  .reduce(
    (prev, k) => Object.assign(prev, { [k]: keys[k as keyof typeof keys] }),
    {} as Partial<typeof keys>,
  )

const lengthsCaps: CompleteKeysList = {
  inline: Object.keys(lengthUnitsKeys) as KeysList,
  block: Object.keys(lengthUnitsKeys) as KeysList,
}

const areasUnitsKeys = Object.keys(keys)
  .filter((k) => k.includes('AREA'))
  .reduce(
    (prev, k) => Object.assign(prev, { [k]: keys[k as keyof typeof keys] }),
    {},
  )
const areasCaps: CompleteKeysList = {
  inline: Object.keys(areasUnitsKeys) as KeysList,
  block: Object.keys(areasUnitsKeys) as KeysList,
}

const volumesUnitsKeys = Object.keys(keys)
  .filter((k) => k.includes('VOLUME'))
  .reduce(
    (prev, k) => Object.assign(prev, { [k]: keys[k as keyof typeof keys] }),
    {},
  )
const volumesCaps: CompleteKeysList = {
  inline: Object.keys(volumesUnitsKeys) as KeysList,
  block: Object.keys(volumesUnitsKeys) as KeysList,
}

const capacitiesUnitsKeys = Object.keys(keys)
  .filter((k) => k.includes('CAPACITY'))
  .reduce(
    (prev, k) => Object.assign(prev, { [k]: keys[k as keyof typeof keys] }),
    {},
  )
const capacitiesCaps: CompleteKeysList = {
  inline: Object.keys(capacitiesUnitsKeys) as KeysList,
  block: Object.keys(capacitiesUnitsKeys) as KeysList,
}

const massesUnitsKeys = Object.keys(keys)
  .filter((k) => k.includes('MASS'))
  .reduce(
    (prev, k) => Object.assign(prev, { [k]: keys[k as keyof typeof keys] }),
    {},
  )
const massesCaps: CompleteKeysList = {
  inline: Object.keys(massesUnitsKeys) as KeysList,
  block: Object.keys(massesUnitsKeys) as KeysList,
}

export const specialKeys: KeyboardBlock = {
  keycaps: specialKeysCaps,
  cols: 1,
  title: 'Touches spéciales',
  isUnits: false,
}

export const complexes: KeyboardBlock = {
  keycaps: complexesCap,
  cols: 6,
  title: 'Nombres complexes',
  isUnits: false,
}

export const numbers: KeyboardBlock = {
  keycaps: numbersCaps,
  cols: 3,
  title: 'Nombres',
  isUnits: false,
}
export const numbersPointVirgule: KeyboardBlock = {
  keycaps: numbersPointVirguleCaps,
  cols: 3,
  title: 'Nombres',
  isUnits: false,
}
export const chiffresEtMultiplication: KeyboardBlock = {
  keycaps: chiffresEtMultiplicationCaps,
  cols: 3,
  title: 'Chiffres et multiplication',
  isUnits: false,
}
export const numbersX: KeyboardBlock = {
  keycaps: numbersCapsX,
  cols: 3,
  title: 'Nombres',
  isUnits: false,
}
export const numbersInconnue: KeyboardBlock = {
  keycaps: numbersCapsInconnue,
  cols: 3,
  title: 'Nombres',
  isUnits: false,
}
export const numbers2: KeyboardBlock = {
  keycaps: numbersCaps2,
  cols: 3,
  title: 'Nombres',
  isUnits: false,
}
export const numbersOperations: KeyboardBlock = {
  keycaps: numbersOperationsCaps,
  cols: 4,
  title: 'Nombres+Opérations',
  isUnits: false,
}

export const numbersOperationsX: KeyboardBlock = {
  keycaps: numbersOperationsXCaps,
  cols: 4,
  title: 'Nombres+Opérations',
  isUnits: false,
}

export const limites: KeyboardBlock = {
  keycaps: limitesCaps,
  cols: 5,
  title: 'Clavier pour les Limites',
  isUnits: false,
}

export const lectureLimites: KeyboardBlock = {
  keycaps: lectureLimitesCaps,
  cols: 4,
  title: 'Lecture de limites',
  isUnits: false,
}

export const limitesSimple: KeyboardBlock = {
  keycaps: limitesSimpleCaps,
  cols: 4,
  title: 'Lecture de limites',
  isUnits: false,
}

export const numbersSpace: KeyboardBlock = {
  keycaps: numbersSpaceCaps,
  cols: 4,
  title: 'Nombres',
  isUnits: false,
}

export const variables: KeyboardBlock = {
  keycaps: variableCaps,
  cols: 3,
  title: 'Variables',
  isUnits: false,
}

export const variableN: KeyboardBlock = {
  keycaps: variableNCaps,
  cols: 1,
  title: 'Variable',
  isUnits: false,
}

export const vFON: KeyboardBlock = {
  keycaps: vFONCaps,
  cols: 1,
  title: 'Vrai/Faux/Impossible',
  isUnits: false,
}

export const basicOperations: KeyboardBlock = {
  keycaps: basicOperationCaps,
  cols: 2,
  title: 'Opérations de base',
  isUnits: false,
}

export const basicOperations2: KeyboardBlock = {
  keycaps: basicOperationCaps2,
  cols: 2,
  title: 'Opérations de base',
  isUnits: false,
}

export const basicOperationsComplexes: KeyboardBlock = {
  keycaps: basicOperationComplexesCaps,
  cols: 3,
  title: 'Opérations de base et i',
  isUnits: false,
}

export const basicOperationsPlus: KeyboardBlock = {
  keycaps: basicOperationPlusCaps,
  cols: 3,
  title: 'Opérations de base',
  isUnits: false,
}

export const fullOperations: KeyboardBlock = {
  keycaps: fullOperationCaps,
  cols: 4,
  title: 'Opérations complexes',
  isUnits: false,
}

export const clavierFonctionsTerminales: KeyboardBlock = {
  keycaps: terminaleCaps,
  cols: 7,
  title: 'Fonctions de Terminales',
  isUnits: false,
}

export const numeration: KeyboardBlock = {
  keycaps: numerationCaps,
  cols: 6,
  title: 'Logarithme et puissance',
  isUnits: false,
}

export const probabilite: KeyboardBlock = {
  keycaps: probabiliteCaps,
  cols: 3,
  title: 'Probabilités',
  isUnits: false,
}

export const hms: KeyboardBlock = {
  keycaps: hmsCaps,
  cols: 1,
  title: 'Temps',
  isUnits: true,
}

export const greek: KeyboardBlock = {
  keycaps: greekCaps,
  cols: 2,
  title: 'Lettres grecques',
  isUnits: false,
}

export const compare: KeyboardBlock = {
  keycaps: compareCaps,
  cols: 3,
  title: 'Comparaison',
  isUnits: false,
}

export const degre: KeyboardBlock = {
  keycaps: degreCaps,
  cols: 1,
  title: 'Degré',
  isUnits: true,
}

export const degreCelsius: KeyboardBlock = {
  keycaps: degreCelsiusCaps,
  cols: 1,
  title: 'Degré Celsius',
  isUnits: true,
}

export const emvxBlock: KeyboardBlock = {
  keycaps: emvxBlockCaps,
  cols: 1,
  title: 'Variables E, m, v, x',
  isUnits: false,
}

export const trigo: KeyboardBlock = {
  keycaps: trigoCaps,
  cols: 1,
  title: 'Trigonométrie',
  isUnits: false,
}
export const advanced: KeyboardBlock = {
  keycaps: advancedCaps,
  cols: 5,
  title: 'Fonctions avancées',
  isUnits: false,
}

export const lengths: KeyboardBlock = {
  keycaps: lengthsCaps,
  cols: 2,
  title: 'Longueurs',
  isUnits: true,
}

export const areas: KeyboardBlock = {
  keycaps: areasCaps,
  cols: 3,
  title: 'Aires',
  isUnits: true,
}

export const ensemble: KeyboardBlock = {
  keycaps: ensembleCaps,
  cols: 3,
  title: 'Ensembles',
  isUnits: false,
}

export const ensembleDefini: KeyboardBlock = {
  keycaps: ensembleDefiniCaps,
  cols: 3,
  title: 'EnsemblesDefinis',
  isUnits: false,
}

export const equationsTerminale: KeyboardBlock = {
  keycaps: equationsTerminaleCaps,
  cols: 4,
  title: 'Équations Terminale',
  isUnits: false,
}

export const suite: KeyboardBlock = {
  keycaps: suiteCaps,
  cols: 2,
  title: 'Suites',
  isUnits: false,
}

export const volumes: KeyboardBlock = {
  keycaps: volumesCaps,
  cols: 2,
  title: 'Volumes',
  isUnits: true,
}

export const capacities: KeyboardBlock = {
  keycaps: capacitiesCaps,
  cols: 2,
  title: 'Capacités',
  isUnits: true,
}

export const masses: KeyboardBlock = {
  keycaps: massesCaps,
  cols: 2,
  title: 'Masses',
  isUnits: true,
}

export const matrix: KeyboardBlock = {
  keycaps: matrixCaps,
  cols: 1,
  title: 'Matrice',
  isUnits: false,
}

export const majuscules: KeyboardBlock = {
  keycaps: majusculesCaps,
  cols: 7,
  title: 'Majuscules',
  isUnits: false,
}

export const minuscules: KeyboardBlock = {
  keycaps: minusculesCaps,
  cols: 7,
  title: 'Minuscules',
  isUnits: false,
}

export const angles: KeyboardBlock = {
  keycaps: anglesCaps,
  cols: 1,
  title: 'Angles',
  isUnits: false,
}

export const uppercaseAToH: KeyboardBlock = {
  keycaps: aToHCaps,
  cols: 2,
  title: 'Majuscules: A à H',
  isUnits: false,
}

export const uppercaseIToP: KeyboardBlock = {
  keycaps: iToPCaps,
  cols: 2,
  title: 'Majuscules: I à P',
  isUnits: false,
}

export const uppercaseQToW: KeyboardBlock = {
  keycaps: qToWCaps,
  cols: 2,
  title: 'Majuscules: Q à W',
  isUnits: false,
}

export const uppercaseXToZ: KeyboardBlock = {
  keycaps: xToZCaps,
  cols: 1,
  title: 'Majuscules: X à Z',
  isUnits: false,
}

export const estOuestSudNord: KeyboardBlock = {
  keycaps: eosnCaps,
  cols: 2,
  title: 'Points cardinaux',
  isUnits: false,
}

export const algo: KeyboardBlock = {
  keycaps: algoCaps,
  cols: 2,
  title: 'Clavier Algorithme',
  isUnits: false,
}

export const keyboardBlocks: {
  [key in Exclude<BlockForKeyboard, 'alphanumeric'>]: KeyboardBlock
} = {
  advanced,
  angles,
  areas,
  basicOperations,
  basicOperations2,
  basicOperationsComplexes,
  basicOperationsPlus,
  capacities,
  compare,
  complexes,
  degre,
  degreCelsius,
  emvxBlock,
  ensemble,
  ensembleDefini,
  equationsTerminale,
  suite,
  greek,
  fullOperations,
  hms,
  lengths,
  lectureLimites,
  limitesSimple,
  clavierFonctionsTerminales,
  majuscules,
  minuscules,
  masses,
  matrix,
  chiffresEtMultiplication,
  numbers,
  numbersPointVirgule,
  numbersSpace,
  numbersX,
  numbersInconnue,
  numbers2,
  numbersOperations,
  numbersOperationsX,
  limites,
  numeration,
  probabilite,
  trigo,
  variableN,
  variables,
  volumes,
  vFON,
  uppercaseAToH,
  uppercaseIToP,
  uppercaseQToW,
  uppercaseXToZ,
  estOuestSudNord,
  algo,
}
