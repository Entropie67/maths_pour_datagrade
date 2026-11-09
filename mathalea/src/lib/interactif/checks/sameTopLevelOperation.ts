import { isFunction } from '@cortex-js/compute-engine'
import { parseOperationPrincipale } from '../comparisonFunctions'
import type { Check, CheckOverrides } from './types'

type TypeOperation = {
  libelle: string
  // Opérateurs acceptés dans la saisie (comme pour le produit et le quotient)
  operateurs: string[]
  // Élément neutre : une saisie qui le contient est refusée
  neutre: number
}

const TYPES_OPERATION: Record<string, TypeOperation> = {
  somme: { libelle: 'somme', operateurs: ['Add'], neutre: 0 },
  différence: { libelle: 'différence', operateurs: ['Subtract'], neutre: 0 },
  produit: {
    libelle: 'multiplication',
    operateurs: ['Multiply', 'Power'],
    neutre: 1,
  },
  quotient: {
    libelle: 'division',
    operateurs: ['Rational', 'Divide', 'Power'],
    neutre: 1,
  },
}

const NOMS_PAR_OPERATEUR: Record<string, string> = {
  Add: 'somme',
  Subtract: 'différence',
  Multiply: 'produit',
  Divide: 'quotient',
  Rational: 'quotient',
}

/**
 * La saisie a la même opération de plus haut niveau que la réponse attendue :
 * une somme attendue ne se répond pas par une différence, un produit ne se
 * répond pas par un quotient, et un calcul ne se répond pas par son résultat.
 * Les sommes par 0 et les produits par 1 sont refusés. La valeur n'est pas
 * vérifiée : combiner avec `isEqual`. Si la réponse attendue n'est pas une
 * opération, le contrôle ne contraint rien.
 */
export function sameTopLevelOperation(options: CheckOverrides = {}): Check {
  return {
    name: options.name ?? 'sameTopLevelOperation',
    weight: options.weight,
    feedbackEnabled: options.feedbackEnabled,
    feedbackOnSuccess: options.feedbackOnSuccess,
    run: (saisie, answer) => {
      const attendue = parseOperationPrincipale(answer)
      if (!isFunction(attendue)) return { passed: true, feedbackKo: '' }
      const nom = NOMS_PAR_OPERATEUR[attendue.operator]
      if (nom === undefined) return { passed: true, feedbackKo: '' }
      const type = TYPES_OPERATION[nom]
      const saisieOperation = parseOperationPrincipale(saisie)
      if (!isFunction(saisieOperation)) {
        return {
          passed: false,
          feedbackKo:
            options.feedbackKo ??
            'Résultat incorrect car un calcul est attendu.',
          feedbackOk: options.feedbackOk,
        }
      }
      if (!type.operateurs.includes(saisieOperation.operator)) {
        return {
          passed: false,
          feedbackKo:
            options.feedbackKo ??
            `Résultat incorrect car c'est une ${type.libelle} qui est attendue.`,
          feedbackOk: options.feedbackOk,
        }
      }
      // Un élément neutre présent dans la réponse attendue n'est pas refusé
      const contientNeutre = saisieOperation.ops.some((terme) =>
        terme.is(type.neutre),
      )
      const attendueContientNeutre = attendue.ops.some((terme) =>
        terme.is(type.neutre),
      )
      return {
        passed: attendueContientNeutre || !contientNeutre,
        feedbackKo:
          options.feedbackKo ??
          `Résultat incorrect car la ${type.libelle} par ${type.neutre} est inutile.`,
        feedbackOk: options.feedbackOk,
      }
    },
  }
}
