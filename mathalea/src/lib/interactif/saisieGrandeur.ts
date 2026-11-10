import type { CompareFunction } from '../types'
import { fonctionComparaison } from './comparisonFunctions'
import type { OptionsChamp } from './questionMathLive'

/** Écrit un nombre avec le point décimal attendu par la comparaison avec unité. */
function nombreBrut(valeur: number) {
  return String(Math.round(valeur * 1e6) / 1e6)
}

/**
 * Réponse attendue pour une grandeur dont la valeur est un nombre, par exemple
 * `reponseGrandeur(12.5, 'cm^2')`. À associer à `compareGrandeur`.
 */
export function reponseGrandeur(valeur: number, unite: string) {
  return `${nombreBrut(valeur)}${unite}`
}

/**
 * Compare une grandeur saisie avec unité à la réponse attendue. Une saisie
 * exprimée dans une autre unité de même nature est acceptée (`1250 mm²` pour
 * `12,5 cm²`).
 */
export const compareGrandeur: CompareFunction = (saisie, reponse) =>
  fonctionComparaison(saisie, reponse, { unite: true })

const MARQUE_UNITE = '\\operatorname'

/**
 * Réponse attendue pour une grandeur exacte contenant π, par exemple
 * `reponseGrandeurAvecPi('16\\pi', 'cm^2')`. À associer à `compareGrandeurAvecPi`.
 */
export function reponseGrandeurAvecPi(coefficientTex: string, unite: string) {
  const [base, exposant] = unite.split('^')
  return `${coefficientTex}${MARQUE_UNITE}{\\mathrm{${base}}}${exposant ? `^${exposant}` : ''}`
}

/** Sépare une saisie `valeur\operatorname{\mathrm{unité}}` en valeur et unité. */
function separeValeurEtUnite(saisie: string) {
  const position = saisie.indexOf(MARQUE_UNITE)
  if (position === -1) return { valeur: saisie, unite: '' }
  const unite = saisie
    .slice(position)
    .replace(/\\operatorname|\\mathrm|\\text/g, '')
    .replace(/[{}\s]/g, '')
  return { valeur: saisie.slice(0, position), unite }
}

/**
 * Compare une valeur exacte avec π et une unité, comme `16\pi cm^2`.
 * La valeur est comparée sans exiger une écriture particulière ; l'unité doit
 * être celle de la réponse attendue.
 */
export const compareGrandeurAvecPi: CompareFunction = (saisie, reponse) => {
  const attendue = separeValeurEtUnite(reponse)
  const donnee = separeValeurEtUnite(saisie)
  const valeurJuste = fonctionComparaison(
    donnee.valeur,
    attendue.valeur,
    {},
  ).isOk
  if (!valeurJuste) return { isOk: false }
  if (donnee.unite === '') {
    return {
      isOk: false,
      feedback:
        "La réponse pourrait être correcte si l'unité avait été précisée.",
    }
  }
  if (donnee.unite !== attendue.unite) {
    return {
      isOk: false,
      feedback: "L'unité choisie n'est, déjà, pas correcte.",
    }
  }
  return { isOk: true }
}

/**
 * Variante de `compareGrandeurAvecPi` qui accepte aussi d'autres réponses
 * équivalentes dans une autre unité, écrites comme `reponseGrandeurAvecPi`
 * (`0.03\\pi dm³` pour `30\\pi cm³`). Utile quand l'énoncé mélange deux unités
 * sans imposer celle de la réponse.
 */
export function compareGrandeurAvecPiEtAlternatives(
  alternatives: string[],
): CompareFunction {
  return (saisie, reponse) => {
    const resultat = compareGrandeurAvecPi(saisie, reponse)
    if (resultat.isOk) return resultat
    for (const alternative of alternatives) {
      if (compareGrandeurAvecPi(saisie, alternative).isOk) return { isOk: true }
    }
    return resultat
  }
}

const ORDRE_UNITES = ['mm', 'cm', 'dm', 'm', 'km']

/**
 * Touches du clavier d'une saisie avec unité, à passer à `dataKeys` avec
 * `KeyboardType.clavierEntierementPersonnalisable` : les chiffres, la virgule,
 * éventuellement π et la fraction (`avecFraction`, pour une valeur exacte comme
 * `\dfrac{500}{3}\pi`), et seulement les unités utiles à la question.
 *
 * Les unités proposées sont celles de l'énoncé (`unitesEnonce`, par exemple
 * `['mm', 'cm']`), leur puissance de la dimension attendue (`dimension` : 1 pour
 * un périmètre, 2 pour une aire, 3 pour un volume) et les trois puissances de
 * l'unité principale, ainsi que `mm` et `cm` à chaque puissance, pour que l'élève ait
 * à choisir entre `cm`, `cm²`, `cm³`, `mm`, `mm²` et `mm³`.
 */
export function optionsClavierGrandeur({
  unitesEnonce,
  dimension,
  unitePrincipale,
  avecPi = false,
  avecFraction = false,
}: {
  unitesEnonce: string[]
  dimension: 1 | 2 | 3
  unitePrincipale: string
  avecPi?: boolean
  avecFraction?: boolean
}): Pick<OptionsChamp, 'dataKeys'> {
  const puissance = (unite: string, exposant: number) =>
    `\\operatorname{ ${unite}}${exposant > 1 ? `^${exposant}` : ''}`
  const unites = [...new Set([...unitesEnonce, unitePrincipale])].sort(
    (a, b) => ORDRE_UNITES.indexOf(a) - ORDRE_UNITES.indexOf(b),
  )
  const touchesUnites = new Set<string>()
  for (const unite of unites) touchesUnites.add(puissance(unite, dimension))
  for (const unite of new Set(['mm', 'cm', unitePrincipale])) {
    for (const exposant of [1, 2, 3]) {
      touchesUnites.add(puissance(unite, exposant))
    }
  }
  const triees = [...touchesUnites].sort((a, b) => {
    const exposant = (touche: string) => Number(/\^(\d)/.exec(touche)?.[1] ?? 1)
    const unite = (touche: string) => /\{ (\w+)\}/.exec(touche)?.[1] ?? ''
    return (
      exposant(a) - exposant(b) ||
      ORDRE_UNITES.indexOf(unite(a)) - ORDRE_UNITES.indexOf(unite(b))
    )
  })
  return {
    dataKeys: [
      [
        '7',
        '8',
        '9',
        '4',
        '5',
        '6',
        '1',
        '2',
        '3',
        '0',
        ',',
        ...(avecPi ? ['\\pi'] : []),
        ...(avecFraction ? ['\\dfrac{#@}{#?}'] : []),
      ],
      triees,
    ],
  }
}
