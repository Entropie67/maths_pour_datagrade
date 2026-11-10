import type { Check, CheckOverrides } from './types'
import { fromOptions } from './adapter'
import Hms from '../../../modules/Hms'
import Grandeur from '../../../modules/Grandeur'
import { grandeurDepuisSaisie } from '../comparisonFunctions'

type UnitOptions = CheckOverrides & {
  precision?: number
  strictSameUnit?: boolean
}

type DurationOptions = CheckOverrides & {
  unit?: 'any' | 'hms' | 'h' | 'min' | 's'
}

type SameNumberListOptions = CheckOverrides & {
  allowRepeatedNumbers?: boolean
}

function domainCheck(
  name: string,
  defaultFeedbackKo: string,
  check: Check,
  options: CheckOverrides,
): Check {
  return {
    ...check,
    name: options.name ?? name,
    feedbackEnabled: options.feedbackEnabled,
    feedbackOnSuccess: options.feedbackOnSuccess,
    weight: options.weight,
    run: (saisie, answer) => {
      const result = check.run(saisie, answer)
      return {
        passed: result.passed,
        feedbackKo: options.feedbackKo ?? result.feedbackKo ?? defaultFeedbackKo,
        feedbackOk: options.feedbackOk,
      }
    },
  }
}

function hasDurationUnit(value: string, unit: Exclude<DurationOptions['unit'], undefined>): boolean {
  if (unit === 'any') return true
  if (unit === 'hms') return /(?:h|min|s)\b/.test(value)
  return new RegExp(`${unit}\\b`).test(value)
}

export function sameDuration(options: DurationOptions = {}): Check {
  const unit = options.unit ?? 'any'
  return {
    name: options.name ?? 'sameDuration',
    weight: options.weight,
    feedbackEnabled: options.feedbackEnabled,
    feedbackOnSuccess: options.feedbackOnSuccess,
    run: (saisie, answer) => {
      const passed =
        hasDurationUnit(saisie, unit) &&
        Hms.fromString(saisie).isEquivalentToString(answer)
      return {
        passed,
        feedbackKo:
          options.feedbackKo ??
          'La durée saisie ne correspond pas à la durée attendue.',
        feedbackOk: options.feedbackOk,
      }
    },
  }
}

export function sameCoordinates(options: CheckOverrides = {}): Check {
  return domainCheck(
    'sameCoordinates',
    'Les coordonnées saisies ne correspondent pas aux coordonnées attendues.',
    fromOptions({ coordonnees: true }),
    options,
  )
}

export function sameInterval(options: CheckOverrides = {}): Check {
  return domainCheck(
    'sameInterval',
    "L'intervalle saisi ne correspond pas à l'intervalle attendu.",
    fromOptions({ intervalle: true }),
    options,
  )
}

export function valueInInterval(options: CheckOverrides = {}): Check {
  return domainCheck(
    'valueInInterval',
    "La valeur saisie n'appartient pas à l'intervalle attendu.",
    fromOptions({ estDansIntervalle: true }),
    options,
  )
}

// La saisie MathLive écrit l'unité `\operatorname{\mathrm{cm}}`, que
// Grandeur.fromString() ne sait pas lire : on passe d'abord par la lecture de
// l'option `unite`, puis par fromString() pour une réponse attendue comme `1m`.
function uniteDe(valeur: string): string {
  const grandeur = grandeurDepuisSaisie(valeur)
  return grandeur === false ? Grandeur.fromString(valeur).unite : grandeur.unite
}

export function sameWithUnit(options: UnitOptions = {}): Check {
  const compare = fromOptions({ unite: true, precisionUnite: options.precision })
  return {
    name: options.name ?? 'sameWithUnit',
    weight: options.weight,
    feedbackEnabled: options.feedbackEnabled,
    feedbackOnSuccess: options.feedbackOnSuccess,
    run: (saisie, answer) => {
      const result = compare.run(saisie, answer)
      let passed = result.passed
      if (passed && options.strictSameUnit) {
        try {
          passed = uniteDe(saisie) === uniteDe(answer)
        } catch {
          passed = false
        }
      }
      return {
        passed,
        feedbackKo:
          options.feedbackKo ??
          (options.strictSameUnit
            ? "La grandeur est correcte mais l'unité attendue n'est pas respectée."
            : result.feedbackKo),
        feedbackOk: options.feedbackOk,
      }
    },
  }
}

function stripTuple(value: string): string | undefined {
  const normalized = value
    .trim()
    .replaceAll('\\left', '')
    .replaceAll('\\right', '')
  if (
    (normalized.startsWith('(') && normalized.endsWith(')')) ||
    (normalized.startsWith('\\lparen') && normalized.endsWith('\\rparen'))
  ) {
    return normalized
      .replace(/^\\lparen|^[(]/, '')
      .replace(/\\rparen$|[)]$/, '')
      .trim()
  }
  return undefined
}

export function sameNumberTuple(options: CheckOverrides = {}): Check {
  const orderedList = fromOptions({ suiteRangeeDeNombres: true })
  return {
    name: options.name ?? 'sameNumberTuple',
    weight: options.weight,
    feedbackEnabled: options.feedbackEnabled,
    feedbackOnSuccess: options.feedbackOnSuccess,
    run: (saisie, answer) => {
      const input = stripTuple(saisie)
      const expected = stripTuple(answer)
      const result =
        input === undefined || expected === undefined
          ? {
              passed: false,
              feedbackKo:
                'Un tuple doit être écrit entre parenthèses, par exemple $(1;2;3)$.',
            }
          : orderedList.run(input, expected)
      return {
        passed: result.passed,
        feedbackKo: options.feedbackKo ?? result.feedbackKo,
        feedbackOk: options.feedbackOk,
      }
    },
  }
}

function deduplicateNumberList(value: string): string {
  const seen = new Set<string>()
  return value
    .split(';')
    .map((part) => part.trim())
    .filter((part) => {
      if (seen.has(part)) return false
      seen.add(part)
      return true
    })
    .join(';')
}

export function sameNumberList(options: SameNumberListOptions = {}): Check {
  const compare = fromOptions({ suiteDeNombres: true })
  return {
    name: options.name ?? 'sameNumberList',
    weight: options.weight,
    feedbackEnabled: options.feedbackEnabled,
    feedbackOnSuccess: options.feedbackOnSuccess,
    run: (saisie, answer) => {
      const result = compare.run(
        options.allowRepeatedNumbers ? deduplicateNumberList(saisie) : saisie,
        answer,
      )
      return {
        passed: result.passed,
        feedbackKo:
          options.feedbackKo ??
          result.feedbackKo ??
          'La suite de nombres saisie ne correspond pas à la suite attendue.',
        feedbackOk: options.feedbackOk,
      }
    },
  }
}

export function sameOrderedNumberList(options: CheckOverrides = {}): Check {
  return domainCheck(
    'sameOrderedNumberList',
    'La suite de nombres saisie ne correspond pas à la suite ordonnée attendue.',
    fromOptions({ suiteRangeeDeNombres: true }),
    options,
  )
}
