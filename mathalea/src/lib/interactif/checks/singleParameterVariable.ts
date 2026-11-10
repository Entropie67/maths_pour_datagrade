import type { Check, CheckOverrides } from './types'
import type { LineDimension } from './parametricSystem'
import { variablesInSystem } from './parametricSystem'

type SingleParameterVariableOptions = CheckOverrides & {
  dimension?: LineDimension
  expectedParameter?: string | string[]
  strictExpectedParameter?: boolean
}

export function singleParameterVariable({
  dimension = 3,
  expectedParameter,
  strictExpectedParameter = false,
  ...options
}: SingleParameterVariableOptions = {}): Check {
  return {
    name: options.name ?? 'singleParameterVariable',
    weight: options.weight,
    feedbackEnabled: options.feedbackEnabled,
    feedbackOnSuccess: options.feedbackOnSuccess,
    run: (saisie) => {
      const variables = variablesInSystem(saisie, dimension)
      if ('error' in variables) {
        return {
          passed: false,
          feedbackKo: options.feedbackKo ?? variables.error,
          feedbackOk: options.feedbackOk,
        }
      }

      if (variables.length === 0) {
        return {
          passed: false,
          feedbackKo:
            options.feedbackKo ??
            'On attend une représentation paramétrique contenant une variable, par exemple $k$.',
          feedbackOk: options.feedbackOk,
        }
      }

      if (variables.length > 1) {
        return {
          passed: false,
          feedbackKo:
            options.feedbackKo ??
            'Une seule variable de paramétrage doit être utilisée.',
          feedbackOk: options.feedbackOk,
        }
      }

      const [variable] = variables
      const expectedParameters =
        typeof expectedParameter === 'string'
          ? [expectedParameter]
          : (expectedParameter ?? [])
      if (
        expectedParameters.length > 0 &&
        !expectedParameters.includes(variable)
      ) {
        const expected =
          expectedParameters.length === 1
            ? `$${expectedParameters[0]}$`
            : expectedParameters
                .map((expectedParameter) => `$${expectedParameter}$`)
                .join(' ou ')
        const feedback =
          options.feedbackKo ??
          `La variable de paramétrage attendue est ${expected} plutôt que $${variable}$.`

        return {
          passed: !strictExpectedParameter,
          feedbackKo: feedback,
          feedbackOk: strictExpectedParameter ? options.feedbackOk : feedback,
        }
      }

      return {
        passed: true,
        feedbackKo: '',
        feedbackOk: options.feedbackOk,
      }
    },
  }
}
