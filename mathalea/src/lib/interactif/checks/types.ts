import type { OptionsComparaisonType, ResultType } from '../../types'

export type CheckResult = {
  passed: boolean
  feedbackKo: string
  feedbackOk?: string
}

export type CheckOverrides = {
  name?: string
  weight?: number
  feedbackEnabled?: boolean
  feedbackOnSuccess?: boolean
  feedbackKo?: string
  feedbackOk?: string
}

export type Check = {
  name: string
  weight?: number
  feedbackEnabled?: boolean
  feedbackOnSuccess?: boolean
  run: (saisie: string, answer: string) => CheckResult
}

export type CompareResult = ResultType & {
  score: number
  feedback: string
  details: Array<{ name: string; passed: boolean }>
}

export type Comparator = ((
  input: string,
  goodAnswer: string,
  options?: OptionsComparaisonType,
) => CompareResult) & {
  kind?: 'all' | 'seq'
  checks?: Check[]
}

export type CheckFactory<T extends object = object> = (
  options?: T & CheckOverrides,
) => Check

export type EqualsOptions = CheckOverrides & {
  tolerance?: number
  comparisonOptions?: OptionsComparaisonType
}

export type StringEqualsOptions = CheckOverrides & {
  trim?: boolean
  ignoreCase?: boolean
  ignoreLatexText?: boolean
  ignoreLatexDelimiters?: boolean
}
