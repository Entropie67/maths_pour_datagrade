/**
 * Logique de la « calculette » : une calculatrice très basique (quatre
 * opérations, écriture en ligne sans parenthèses, virgule décimale, valeur
 * approchée du résultat). Comme sur une calculatrice simple, il n'y a pas de
 * priorité des opérations : dès la saisie du 2e opérateur, le calcul en cours
 * est effectué (comme si on avait tapé « = »), on passe à la ligne et
 * l'opérateur s'applique au résultat. Fonctions pures, indépendantes de
 * l'interface.
 */

export type CalculetteOperator = '+' | '−' | '×' | '÷'

export type CalculetteKey =
  | '0'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | ','
  | CalculetteOperator
  | '='
  | 'effacer'
  | 'tout-effacer'

export interface CalculetteState {
  /** Ligne précédente, calcul déjà effectué (ex. « 4+3 = 7 »), ou null */
  previous: string | null
  /** Calcul saisi sur la ligne courante (ex. « 4×3,5 ») */
  expression: string
  /** Résultat affiché après « = » (null tant que le calcul n'est pas validé) */
  result: string | null
  error: boolean
}

/** Nombre maximal de chiffres d'un nombre saisi */
export const CALCULETTE_MAX_DIGITS = 12
/** Longueur maximale du calcul saisi */
export const CALCULETTE_MAX_LENGTH = 80
/** Nombre de chiffres significatifs de la valeur approchée affichée */
export const CALCULETTE_SIGNIFICANT_DIGITS = 10

export const initialCalculetteState: CalculetteState = {
  previous: null,
  expression: '',
  result: null,
  error: false,
}

const OPERATORS: string[] = ['+', '−', '×', '÷']

function isOperator(char: string | undefined): boolean {
  return char !== undefined && OPERATORS.includes(char)
}

/** Nombre en cours de saisie (partie après le dernier opérateur) */
function lastNumber(expression: string): string {
  const match = expression.match(/[0-9,]*$/)
  return match ? match[0] : ''
}

/** Vrai si l'expression est un calcul complet (« a op b ») prêt à être effectué */
function isCompleteOperation(expression: string): boolean {
  const tokens = tokenize(expression)
  return tokens !== null && tokens.length >= 3
}

/** Retire tous les opérateurs qui terminent l'expression */
function stripTrailingOperators(expression: string): string {
  let result = expression
  while (isOperator(result.at(-1))) result = result.slice(0, -1)
  return result
}

/**
 * Découpe l'expression en nombres et opérateurs. Un « − » en début de calcul
 * ou après « × » / « ÷ » est un signe moins qui s'applique au nombre suivant.
 * Renvoie null si l'expression est mal formée.
 */
function tokenize(expression: string): (number | CalculetteOperator)[] | null {
  const tokens: (number | CalculetteOperator)[] = []
  let sign = 1
  let index = 0
  while (index < expression.length) {
    const char = expression[index]
    if (isOperator(char)) {
      const previous = tokens.at(-1)
      const expectsNumber = previous === undefined || typeof previous !== 'number'
      if (expectsNumber) {
        if (char !== '−') return null
        sign = -sign
      } else {
        tokens.push(char as CalculetteOperator)
      }
      index++
    } else {
      // l'exposant n'apparaît que dans un résultat en notation scientifique
      const match = expression
        .slice(index)
        .match(/^([0-9]+(,[0-9]*)?|,[0-9]+)(E−?[0-9]+)?/)
      if (!match) return null
      tokens.push(
        sign * Number(match[0].replace(',', '.').replace('E−', 'E-')),
      )
      sign = 1
      index += match[0].length
    }
  }
  if (typeof tokens.at(-1) !== 'number') return null
  return tokens
}

/**
 * Valeur exacte (en flottant) du calcul, ou null si impossible (÷0, syntaxe).
 * Les opérations sont effectuées de gauche à droite, sans priorité.
 */
export function evaluateExpression(expression: string): number | null {
  const tokens = tokenize(expression)
  if (tokens === null) return null

  let total = tokens[0] as number
  for (let i = 1; i < tokens.length; i += 2) {
    const operator = tokens[i] as CalculetteOperator
    const value = tokens[i + 1] as number
    if (operator === '+') total += value
    else if (operator === '−') total -= value
    else if (operator === '×') total *= value
    else {
      if (value === 0) return null
      total /= value
    }
  }
  return Number.isFinite(total) ? total : null
}

/** Retire les zéros inutiles de la partie décimale d'un nombre écrit en texte */
function trimZeros(text: string): string {
  return text.includes('.') ? text.replace(/\.?0+$/, '') : text
}

/**
 * Valeur approchée à 10 chiffres significatifs, avec la virgule décimale.
 * Notation scientifique (« 1,5E12 ») hors de l'intervalle [10⁻⁴ ; 10¹⁰[.
 */
export function formatCalculetteResult(value: number): string {
  // l'arrondi peut faire changer de plage (9 999 999 999,6 → 1E10)
  const rounded = Number(value.toPrecision(CALCULETTE_SIGNIFICANT_DIGITS))
  if (rounded === 0) return '0'
  const absolute = Math.abs(rounded)
  let text: string
  if (absolute >= 1e10 || absolute < 1e-4) {
    const [mantissa, exponent] = rounded
      .toExponential(CALCULETTE_SIGNIFICANT_DIGITS - 1)
      .split('e')
    text = `${trimZeros(mantissa)}E${exponent.replace('+', '')}`
  } else {
    text = trimZeros(rounded.toPrecision(CALCULETTE_SIGNIFICANT_DIGITS))
  }
  return text.replace(/-/g, '−').replace('.', ',')
}

function withoutError(state: CalculetteState): CalculetteState {
  return state.error ? { ...initialCalculetteState } : state
}

/** Applique la pression d'une touche et renvoie le nouvel état */
export function pressCalculetteKey(
  previous: CalculetteState,
  key: CalculetteKey,
): CalculetteState {
  if (key === 'tout-effacer') return { ...initialCalculetteState }

  // une erreur affichée disparaît à la touche suivante
  const state = withoutError(previous)

  if (key === 'effacer') {
    return {
      previous: state.previous,
      expression: state.expression.slice(0, -1),
      result: null,
      error: false,
    }
  }

  if (key === '=') {
    const expression = stripTrailingOperators(state.expression)
    if (expression === '' || state.result !== null) return state
    const value = evaluateExpression(expression)
    if (value === null) {
      return { previous: state.previous, expression, result: null, error: true }
    }
    return {
      previous: state.previous,
      expression,
      result: formatCalculetteResult(value),
      error: false,
    }
  }

  // après « = », un opérateur poursuit avec le résultat, un chiffre (ou la
  // virgule) démarre un nouveau calcul
  let expression = state.expression
  let lastLine = state.previous
  if (state.result !== null) {
    if (isOperator(key)) {
      lastLine = `${expression} = ${state.result}`
      expression = state.result
    } else {
      lastLine = null
      expression = ''
    }
  } else if (isOperator(key) && isCompleteOperation(expression)) {
    // 2e opérateur : le calcul en cours est effectué, on passe à la ligne
    const value = evaluateExpression(expression)
    if (value === null) {
      return { previous: lastLine, expression, result: null, error: true }
    }
    const result = formatCalculetteResult(value)
    lastLine = `${expression} = ${result}`
    expression = result
  }

  if (isOperator(key)) {
    const operator = key as CalculetteOperator
    const last = expression.at(-1)
    if (expression === '') {
      if (operator !== '−') return state
    } else if (operator === '−' && (last === '×' || last === '÷')) {
      // signe moins devant le nombre suivant (ex. 3×−2)
    } else {
      expression = stripTrailingOperators(expression)
      if (expression === '' && operator !== '−') return state
    }
    expression += operator
  } else if (key === ',') {
    const number = lastNumber(expression)
    if (number.includes(',')) return state
    if (number === '') expression += '0'
    expression += ','
  } else {
    const number = lastNumber(expression)
    if (number.replace(',', '').length >= CALCULETTE_MAX_DIGITS) return state
    // pas de zéro initial superflu (« 05 » devient « 5 »)
    expression = number === '0' ? expression.slice(0, -1) + key : expression + key
  }

  if (expression.length > CALCULETTE_MAX_LENGTH) return state
  return { previous: lastLine, expression, result: null, error: false }
}

/** Touche de la calculette correspondant à une touche du clavier physique */
export function calculetteKeyFromKeyboard(key: string): CalculetteKey | null {
  if (/^[0-9]$/.test(key)) return key as CalculetteKey
  switch (key) {
    case ',':
    case '.':
      return ','
    case '+':
      return '+'
    case '-':
    case '−':
      return '−'
    case '*':
    case 'x':
    case '×':
      return '×'
    case '/':
    case '÷':
      return '÷'
    case 'Enter':
    case '=':
      return '='
    case 'Backspace':
      return 'effacer'
    case 'Escape':
    case 'Delete':
      return 'tout-effacer'
    default:
      return null
  }
}
