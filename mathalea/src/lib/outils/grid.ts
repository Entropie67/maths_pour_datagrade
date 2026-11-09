import { shuffle } from '../../lib/outils/arrayOutils';

/** 
 * Génère les lignes compatibles pour créer une grille nxn
 * tel que les valeurs soient unique sur chaque ligne et colonne.
 *
 * @param {number[]} values - Tableau de valeurs à répartir .
 * @param {number[]} participantId - Id permettant de générer des lignes uniques et compatibles
 * @returns {number[]} La ligne avec les valeurs dans le désordre.
 * @author adapted from https://damienmasson.com/tools/latin_square/
 * 
 * 
 * @example
 * var conditions = ["A", "B", "C", "D"];
 * balancedLatinRow(conditions, 0)  //=> ["A", "B", "D", "C"]
 * balancedLatinRow(conditions, 1)  //=> ["B", "C", "A", "D"]
 * balancedLatinRow(conditions, 2)  //=> ["C", "D", "B", "A"]
 * ATTENTION si le tableau est de taille n impaire, il faut générer 
 * n lignes avec des indices uniquement pair ou impair
*/
export function balancedLatinRow(
  values: number[], 
  participantId: number
): number[] {
  let result: number [] = [];
	// Based on "Bradley, J. V. Complete counterbalancing of immediate sequential effects in a Latin square design. J. Amer. Statist. Ass.,.1958, 53, 525-528. "
  for (let i = 0, j = 0, h = 0; i < values.length; ++i) {
	let val = 0;
	if (i < 2 || i % 2 != 0) {
	  val = j++;
	} else {
	  val = values.length - h - 1;
	  ++h;
	}
	result.push(values[(val + participantId) % values.length]);
  }

  if (values.length % 2 != 0 && participantId % 2 != 0) {
	result = result.reverse();
  }
  return result;
}

/** 
 * Generate a latin balanced nxn grid (based on input array size)
 *
 * @param {number[]} values - array with uniq values.
 * @returns {number[][]} Matrix with values of input arrays latin balanced.
 * @author 
 * 
 * 
 * @example
 * var conditions = ["A", "B", "C"];
 * balancedLatinSquare(conditions)  //=> [ ["C", "B", "A"],["A", "B", "C"],["B", "C", "A"]]
*/
export function balancedLatinSquare(
  values: number[], 
): number[][] {
  const grid: number[][] = Array();
  const unorder = shuffle(values); // shuffle input to generate random grid

  let indexes = Array.from(Array(values.length).keys())
  if (values.length % 2 === 1) { // array of odd length, take every other index
	  indexes = indexes.map(x => x*2);
  }
  indexes.forEach((current: number) => {
    grid.push(balancedLatinRow(unorder, current));
  });
  return grid;
}