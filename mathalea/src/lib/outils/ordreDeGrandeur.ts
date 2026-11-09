import Decimal from 'decimal.js'
import { randint } from '../../modules/outils'
import { choice } from './arrayOutils'
import { texNombre } from './texNombre'

/**
 * Nombre positif tiré au hasard, avec son écriture scientifique `mantisse × 10^exposant`
 * et l'exposant de la puissance de 10 la plus proche.
 */
export type NombreOdg = {
  valeur: Decimal
  /** Chiffres significatifs, sans zéro final (ex : `'81425610'` pour 81 425 610) */
  chiffres: string
  mantisse: Decimal
  /** Exposant de l'écriture scientifique */
  exposant: number
  /** Exposant de la puissance de 10 la plus proche */
  exposantOdg: number
}

/** Exposant de la puissance de 10 la plus proche de `mantisse × 10^exposant` (mantisse dans [1 ; 10[) */
export function exposantOrdreDeGrandeur(
  mantisse: Decimal,
  exposant: number,
): number {
  return mantisse.gte(5) ? exposant + 1 : exposant
}

/** Deux premiers chiffres significatifs : le nombre commence par 1, 2, 8 ou 9, donc la puissance de 10 la plus proche est indiscutable */
function deuxPremiersChiffres(seulement1Et9: boolean): number {
  return seulement1Et9
    ? choice([randint(10, 19), randint(90, 99)])
    : choice([randint(10, 29), randint(80, 99)])
}

/**
 * Tire un nombre dont l'écriture scientifique a l'exposant donné.
 * @param exposant exposant de l'écriture scientifique
 * @param chiffresSupplementaires nombre de chiffres significatifs au-delà des deux premiers
 * @param seulement1Et9 le nombre commence par 1 ou 9 (sinon par 1, 2, 8 ou 9)
 */
export function tireNombreOdg(
  exposant: number,
  chiffresSupplementaires: number,
  seulement1Et9 = false,
): NombreOdg {
  let chiffres = String(deuxPremiersChiffres(seulement1Et9))
  for (let i = 0; i < chiffresSupplementaires; i++) {
    // le dernier chiffre n'est jamais nul, pour que `chiffres` n'ait pas de zéro final
    chiffres += String(
      i === chiffresSupplementaires - 1 ? randint(1, 9) : randint(0, 9),
    )
  }
  if (chiffres.endsWith('0')) chiffres = chiffres.slice(0, -1) + '1'
  const mantisse = new Decimal(chiffres).div(
    Decimal.pow(10, chiffres.length - 1),
  )
  return {
    valeur: mantisse.mul(Decimal.pow(10, exposant)),
    chiffres,
    mantisse,
    exposant,
    exposantOdg: exposantOrdreDeGrandeur(mantisse, exposant),
  }
}

/** Écriture `10^{n}` en LaTeX */
export function puissanceDeDix(n: number): string {
  return `10^{${n}}`
}

/**
 * Phrase de correction qui passe d'un nombre à la puissance de 10 la plus proche.
 * @param nb nombre tiré par `tireNombreOdg()`
 * @param ecriture écriture du nombre dans l'énoncé (par défaut son écriture décimale)
 */
export function correctionPuissanceLaPlusProche(
  nb: NombreOdg,
  ecriture: string = texNombre(nb.valeur),
): string {
  const { mantisse, exposant, exposantOdg } = nb
  const mantisseTex = texNombre(mantisse)
  const vers10 = exposantOdg > exposant
  return `$${ecriture}=${mantisseTex}\\times10^{${exposant}}$ et $${mantisseTex}$ est plus proche de $${vers10 ? 10 : 1}$ que de $${vers10 ? 1 : 10}$.<br>
  Donc $${ecriture}\\approx${vers10 ? `10\\times10^{${exposant}}` : `1\\times10^{${exposant}}`}=${puissanceDeDix(exposantOdg)}$.`
}

const chiffres = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '0']

/**
 * Touches du clavier virtuel (avec `KeyboardType.clavierEntierementPersonnalisable`) : seulement
 * celles dont la réponse a besoin.
 */
export const touchesPuissanceDeDix: string[][] = [chiffres, ['-', 'POW']]
export const touchesNotationScientifique: string[][] = [
  chiffres,
  ['\\times', 'POW'],
]
export const touchesEntier: string[][] = [chiffres]
export const touchesDecimal: string[][] = [[...chiffres, '{,}']]
