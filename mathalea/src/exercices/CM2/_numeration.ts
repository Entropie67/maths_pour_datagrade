import { bleuMathalea } from '../../lib/colors'
import { texteEnCouleur } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'

const nomsDesRangs: Record<number, string> = {
  [-3]: 'millièmes',
  [-2]: 'centièmes',
  [-1]: 'dixièmes',
  0: 'unités',
  1: 'dizaines',
  2: 'centaines',
  3: 'milliers',
}

/** Nom du rang associé à l'exposant de 10 (`-2` donne « centièmes », `2` donne « centaines »). */
export function nomDuRang(exposant: number) {
  return nomsDesRangs[exposant]
}

/**
 * Explication, en bleu, du déplacement du chiffre des unités quand on multiplie
 * ou divise par 10, 100 ou 1 000.
 * @param nombre nombre de départ
 * @param nbDecimales nombre de chiffres après la virgule de `nombre`
 * @param facteur 10, 100 ou 1000
 * @param operation `multiplier` ou `diviser`
 */
export function explicationDecalageDesChiffres(
  nombre: number,
  nbDecimales: number,
  facteur: 10 | 100 | 1000,
  operation: 'multiplier' | 'diviser',
) {
  const exposant = Math.round(Math.log10(facteur))
  const rang = nomDuRang(operation === 'multiplier' ? exposant : -exposant)
  const chiffreDesUnites = Math.floor(nombre) % 10
  const verbe = operation === 'multiplier' ? 'multiplie' : 'divise'
  return texteEnCouleur(
    `Quand on ${verbe} un nombre par $${texNombre(facteur, 0)}$, le chiffre des unités devient le chiffre des ${rang}.<br>` +
      `Ici, le chiffre des unités de $${texNombre(nombre, nbDecimales)}$ est $${chiffreDesUnites}$ : il devient le chiffre des ${rang}.`,
    bleuMathalea,
  )
}
