import { randint } from '../../modules/outils';
import type { AllChoiceType } from '../customElements/ListeDeroulanteElement';
import { formatMinute } from './texNombre';

export const coins: number[] = [500, 200, 100, 50, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1, 0.05, 0.02, 0.01];

/**
 * Renvoie une valeur de pièce ou billet en euro.
 *
 * @param {number} [min = 0.01] - valeur minimale attendue
 * @param {number} [max = 500] - valeur maximale attendue
 * @param {number[]} [exclude = [10, 50]] - valeur à exclure de la liste
 *
 * @returns {Price} 
 *  
 *
 * @author Claire Stephan
 *
 * @example
 * randCoin();
 * // → {value: 0.2}
 *
 * @example
 * randCoin(1,2,1);
 * // → {value: 2}
 */
export function randCoin(
  min: number = 0.01,
  max: number = 500,
  exclude: number[] = []
): Price {
  const blacklist = new Set(exclude);
  const shortlist = coins.filter(x => x >= min).filter(x => x <= max).filter(x => !blacklist.has(x))
  if (shortlist.length === 0) {
    window.notify(
      `Il n'y a plus de pièce disponible dans la liste. On renvoie arbitrairement ${max}`,
      { min, max, exclude },
    )
    return new Price(max)
  }
  return new Price(shortlist[randint(0, shortlist.length - 1)], true)
}

/**
 * Renvoie le tableau necessaire pour fabriquer un select 
 * contenant toutes les valeurs entre min et max inclus
 */
export function coinSelect(
  min: number = 0.01,
  max: number = 500
): AllChoiceType[]{
  const select = [{ latex: 'Choisir', value: '' }]
  coins.filter(x => x >= min).filter(x => x <= max)
    .forEach(
      (val) => {
        const price = new Price(val, true);
        select.push({latex: price.forLatex(), value: price.forLatex()});
  })
  return select;
}

/**
 * Définit l'objet Price
 * @author Claire Stephan
 * 
 */
export class Price {
  value: number
  is_coin: boolean
  constructor(price: number, is_coin= false) {
    this.value = Math.round(price * 100) / 100
    this.is_coin = is_coin
  }

  /**
   * Renvoie la valeur formattée en latex SANS les $ ouvrant et fermant
   *
   * @returns {string}
   *
   * @example
   * {value: 0.20, is_coin: false}.forLatex()
   * // → "20~\\text{centimes}"
   *
   * {value: 0.20, is_coin: false}.forLatex()
   * // → "0~$€$~20"
   *
   * {value: 1.05}.forLatex()
   * // → "1~$€$~05"
   *
   * {value: 2}.forLatex()
   * // → "2~$€$~"
   */

  public forLatex(): string {
    const euro = Math.floor(this.value)
    const cent = Math.round((this.value - euro)*100)
    if (euro === 0 && this.is_coin) {
      return `${cent}~\\text{centime${cent !== 1 ? 's' : ''}}`
    } else {
      return `${euro}~$€$~${cent === 0 ? '' : formatMinute(cent)}`
    }
  }

  /**
   * Renvoie la valeur formattée en latex AVEC les $ ouvrant et fermant (voir forLatex())
   * @returns {string}
   */
  public toString(): string {
    return `$${this.forLatex()}$`;
  }
}
