import type { TbiCalculatorKind } from './stores/tbiStore'

/**
 * Calculatrices autorisées pour un exercice en vue élève (paramètre d'URL
 * `calc`) : 0 aucune, 1 calculette, 2 calculatrice collège, 3 calculatrice
 * lycée, 9 toutes.
 */
export type CalculatricesAutorisees = '0' | '1' | '2' | '3' | '9'

export const CALCULATRICES_AUTORISEES_OPTIONS: {
  value: CalculatricesAutorisees
  label: string
}[] = [
  { value: '0', label: 'Aucune calculatrice' },
  { value: '1', label: 'Calculette' },
  { value: '2', label: 'Calculatrice collège' },
  { value: '3', label: 'Calculatrice lycée' },
  { value: '9', label: 'Toutes les calculatrices' },
]

/**
 * Réglage global de la vue élève (dernier caractère du paramètre `es`) qui
 * passe outre les réglages individuels des exercices : `-` les laisse tels
 * quels, les autres valeurs sont celles de `calc` et s'appliquent à tous les
 * exercices.
 */
export type CalculatricesForcees = CalculatricesAutorisees | '-'

export const CALCULATRICES_NON_FORCEES = '-'

export const CALCULATRICES_FORCEES_OPTIONS: {
  value: CalculatricesForcees
  label: string
}[] = [
  {
    value: CALCULATRICES_NON_FORCEES,
    label: 'Selon les réglages de chaque exercice',
  },
  ...CALCULATRICES_AUTORISEES_OPTIONS,
]

export function isCalculatricesForcees(
  value: unknown,
): value is CalculatricesForcees {
  return value === CALCULATRICES_NON_FORCEES || isCalculatricesAutorisees(value)
}

/**
 * Codes `calc` effectivement appliqués : le réglage global, s'il force une
 * calculatrice, remplace ceux des exercices.
 */
export function codesCalculatricesEffectifs(
  forcees: string | undefined,
  codesDesExercices: (string | undefined)[],
): (string | undefined)[] {
  return isCalculatricesAutorisees(forcees) ? [forcees] : codesDesExercices
}

export function isCalculatricesAutorisees(
  value: unknown,
): value is CalculatricesAutorisees {
  return CALCULATRICES_AUTORISEES_OPTIONS.some(
    (option) => option.value === value,
  )
}

const CALCULATRICE_DU_CODE: Record<
  Exclude<CalculatricesAutorisees, '0' | '9'>,
  TbiCalculatorKind
> = {
  '1': 'calculette',
  '2': 'college',
  '3': 'lycee',
}

/** Le code autorise-t-il cette calculatrice ? (absent ou inconnu : non) */
export function isCalculatriceAutorisee(
  code: string | undefined,
  kind: TbiCalculatorKind,
): boolean {
  if (code === '9') return true
  return (
    code !== undefined &&
    code in CALCULATRICE_DU_CODE &&
    CALCULATRICE_DU_CODE[code as keyof typeof CALCULATRICE_DU_CODE] === kind
  )
}
