import { antecedentParDichotomie } from './antecedentParDichotomie'

/**
 * @see : https://gist.github.com/ericelliott/80905b159e1f3b28634ce0a690682957
 * @private
 */
// y1: start value
// y2: end value
// mu: the current frame of the interpolation,
//     in a linear range from 0-1.

export const cosineInterpolate = (y1: number, y2: number, mu: number) => {
  const mu2 = (1 - Math.cos(mu * Math.PI)) / 2
  return y1 * (1 - mu2) + y2 * mu2
}

export function imageInterpolee(tableau: number[][], antecedent: number) {
  const x0 = tableau[0][0]
  const y0 = tableau[0][1]
  const x1 = tableau[1][0]
  const y1 = tableau[1][1]
  const f = (x: number) => cosineInterpolate(y0, y1, (x - x0) / (x1 - x0))
  return f(antecedent)
}

export function antecedentInterpole(tableau: number[][], image: number) {
  const x0 = tableau[0][0]
  const y0 = tableau[0][1]
  const x1 = tableau[1][0]
  const y1 = tableau[1][1]
  const f = (x: number) => cosineInterpolate(y0, y1, (x - x0) / (x1 - x0))
  return antecedentParDichotomie(x0, x1, f, image, 0.01)
}
