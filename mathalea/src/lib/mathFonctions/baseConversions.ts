import Decimal from 'decimal.js'

export function base10VersBaseN(nombre: number | Decimal, b: number) {
  if (nombre instanceof Decimal)
    return nombre.toNumber().toString(b).toUpperCase()
  else return nombre.toString(b).toUpperCase()
}
/**
 * Convertit une chaine correspondant à un nombre écrit en base b en un nombre entier en base 10.
 * @param {} nombre
 * @param {number} b la base de départ
 */

export function baseNVersBase10(
  stringNombre: number | Decimal | string,
  b: number,
) {
  let result = 0
  if (typeof stringNombre === 'number') {
    stringNombre = stringNombre.toString()
  } else if (stringNombre instanceof Decimal) {
    stringNombre = stringNombre.toNumber().toString()
  }
  for (let i = 0; i < stringNombre.length; i++) {
    result +=
      b ** i * valeurBase(stringNombre.charAt(stringNombre.length - 1 - i))
  }
  return result
}

/**
 * Renvoie la valeur du chiffre (8->8, A->10, B->11...)
 *
 * @author Rémi Angot
 */
export function valeurBase(n: string) {
  switch (n) {
    case 'A':
      return 10
    case 'B':
      return 11
    case 'C':
      return 12
    case 'D':
      return 13
    case 'E':
      return 14
    case 'F':
      return 15
    default:
      return parseInt(n)
  }
}

export function baseValeur(n: number) {
  switch (n) {
    case 10:
      return 'A'
    case 11:
      return 'B'
    case 12:
      return 'C'
    case 13:
      return 'D'
    case 14:
      return 'E'
    case 15:
      return 'F'
    default:
      return Number(n).toString()
  }
}
