import { texNombre } from './texNombre'

/**
 * Dénominateurs (non décimaux en eux-mêmes) dont les seuls facteurs premiers sont 2 et 5 :
 * une fraction irréductible ayant l'un d'eux pour dénominateur est un nombre décimal.
 */
export const denominateursDecimaux = [5, 20, 25, 50, 200, 250, 500]

/**
 * Plus petite puissance de 10 multiple de d (d ne doit avoir que 2 et 5 comme facteurs premiers).
 * @example puissanceDeDixMultipleDe(8) // { exposant: 3, multiplicateur: 125 }
 */
export function puissanceDeDixMultipleDe(d: number) {
  let exposant = 1
  while (10 ** exposant % d !== 0) exposant++
  return { exposant, multiplicateur: 10 ** exposant / d }
}

/**
 * Code LaTeX de la conversion de n/d en fraction décimale, par exemple
 * `\dfrac{7}{4}=\dfrac{7\times25}{4\times25}=\dfrac{175}{100}`.
 * Le dernier membre (la fraction décimale) est renvoyé séparément pour pouvoir être mis en évidence.
 * @param n numérateur
 * @param d dénominateur, dont les seuls facteurs premiers sont 2 et 5
 */
export function conversionEnFractionDecimale(n: number, d: number) {
  const { exposant, multiplicateur } = puissanceDeDixMultipleDe(d)
  const denominateurDecimal = 10 ** exposant
  const fractionDecimale = `\\dfrac{${texNombre(n * multiplicateur, 0)}}{${texNombre(denominateurDecimal, 0)}}`
  return {
    debut: `\\dfrac{${n}}{${d}}=\\dfrac{${n}\\times${multiplicateur}}{${d}\\times${multiplicateur}}=`,
    fractionDecimale,
    exposant,
  }
}
