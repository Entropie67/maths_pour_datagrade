import { ecritureParentheseSiNegatif } from './ecritures'
import { miseEnEvidence } from './embellissements'
import { arrondi } from './nombres'

/**
 * Fonction pour écrire des notations scientifique de la forme a * b ^ n
 * @param a {number} mantisse
 * @param b {number} base
 * @param n {number} exposant
 * @author Erwan Duplessy
 */
export function puissance(b: number, n: number) {
  switch (b) {
    case 0:
      return '0'
    case 1:
      return '1'
    case -1:
      if (b % 2 === 0) {
        return '1'
      } else {
        return '-1'
      }
    default:
      if (b < 0) {
        return `(${b})^{${n}}`
      } else {
        return `${b}^{${n}}`
      }
  }
}

export function ecriturePuissance(a: number, b: number, n: number) {
  switch (a) {
    case 0:
      return '$0$'
    case 1:
      return `$${puissance(b, n)}$`
    default:
      return `$${String(arrondi(a, 3)).replace('.', ',')} \\times ${puissance(b, n)}$`.replace(
        '.',
        ',',
      )
  }
}

/**
 * Fonction pour simplifier les notations puissance dans certains cas
 * si la base vaut 1 ou -1 quelque soit l'exposant, retourne 1 ou -1,
 * si la base est négative on teste la parité de l'exposant pour alléger la notation sans le signe
 * si l'exposant vaut 0 ou 1 retourne 1, la base ou rien
 * @param b base
 * @param e exposant
 * @author Sébastien Lozano
 */
export function simpNotPuissance(b: number, e: number) {
  // on switch sur la base
  switch (b) {
    case -1: // si la base vaut -1 on teste la parité de l'exposant
      if (e % 2 === 0) {
        return ' 1'
        // break;
      } else {
        return ' -1'
        // break;
      }
    case 1: // si la base vaut 1 on renvoit toujours 1
      return ' 1'
    default: // sinon on switch sur l'exposant
      switch (e) {
        case 0: // si l'exposant vaut 0 on ranvoit toujours 1
          return '1'
        case 1: // si l'exposant vaut 1 on renvoit toujours la base
          return ` ${b}`
        default: // sinon on teste le signe de la base et la parité de l'exposant
          if (b < 0 && e % 2 === 0) {
            // si la base est négative et que l'exposant est pair, le signe est inutile
            return ` ${b * -1}^{${e}}`
            // break;
          } else {
            return ` ${b}^{${e}}`
            // return ` `;
            // break;
          }
      }
  }
}

/**
 * Fonction pour écrire en couleur la forme éclatée d'une puissance
 * @param b base
 * @param e exposant
 * @param couleur
 * @author Sébastien Lozano
 */
export function eclatePuissance(
  b: number | string,
  e: number,
  couleur: string,
) {
  let str
  switch (e) {
    case 0:
      return `${miseEnEvidence(1, couleur)}`
    case 1:
      return `${miseEnEvidence(b, couleur)}`
    default:
      str = `${miseEnEvidence(b, couleur)} `
      for (let i = 1; i < e; i++) {
        str = str + `\\times ${miseEnEvidence(b, couleur)} `
      }
      return str
  }
}

/**
 * Fonction pour écrire la forme éclatée d'une puissance
 * @param b {number} base
 * @param e {number} exposant
 * @author Rémi Angot
 * @return string
 */
export function puissanceEnProduit(b: number, e: number): string {
  let str = ''
  if (e === 0) {
    return '1'
  } else if (e === 1) {
    return `${b}`
  } else if (e > 1) {
    str = `${ecritureParentheseSiNegatif(b)}`
    for (let i = 1; i < e; i++) {
      str = str + `\\times ${ecritureParentheseSiNegatif(b)}`
    }
    return str
  } else if (e < 0) {
    return `\\dfrac{1}{${puissanceEnProduit(b, -e)}}`
  }
  return str
}

/**
 * Fonction pour simplifier l'ecriture lorsque l'exposant vaut 0 ou 1
 * retourne 1, la base ou rien
 * @param b base
 * @param e exposant
 * @author Sébastien Lozano
 */
export function simpExp(b: string | number, e: number) {
  switch (e) {
    case 1:
      return ` ${String(b)}`
    case 0:
      return ' 1'
    default:
      return ' '
  }
}

/**
 * Vérifie si n est une puissance entière de base
 * @param n nombre à tester
 * @param base base de la puissance
 * @returns true si n = base^k pour un entier k >= 0
 * @author Nathan Scheinmann
 */
export function estPuissanceDe(n: number, base: number): boolean {
  if (n <= 0 || base <= 1) return false
  let temp = n
  while (temp > 1) {
    if (temp % base !== 0) return false
    temp = temp / base
  }
  return temp === 1
}
