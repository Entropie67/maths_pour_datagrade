import type { AllChoiceType } from '../../lib/customElements/ListeDeroulanteElement';
import type { TableauHybrideCell } from '../../lib/customElements/TableauHybride';
import { creeTableauHybrideElement } from '../../lib/customElements/TableauHybride';
import { troisPointsProportionnels } from '../../lib/interactif/fonctionsBaremes';
import { handleAnswers } from '../../lib/interactif/gestionInteractif';
import { coinSelect, Price, randCoin } from '../../lib/outils/Price';

import type { Valeur } from '../../lib/types';
import Exercice from '../Exercice';

export const dateDePublication = '02/09/2026'
export const titre = 'Résoudre une grille contenant des pièces de monnaie'
export const interactifReady = true
export const tags = ['ffjm']

/** Résoudre une grille de pièce de monnaie
 * @author Claire Stephan
 */

export const uuid = '2ead3'
export const refs = {
  'fr-fr': ['EN-Monnaie'],
  'fr-ch': [],
}

function celluleTexte(
  texte: string | number,
  header: boolean = true
): TableauHybrideCell {
  return { type: 'text', texte, header: header, latex: true }
}

function celluleListe(
  id: string,
  choices: AllChoiceType[],
  value: string | number,
): TableauHybrideCell {
  return {
    type: 'select',
    id,
    value,
    choix0: true,
    choices
  }
}


export default class coinGrid extends Exercice {
  // On déclare des propriétés supplémentaires pour cet exercice afin de pouvoir les réutiliser dans la correction

  constructor() {
    super()

    this.besoinFormulaireNumerique = ['Taille de la grille', 6]
    this.sup = 3
    this.nbQuestions = 1

    this.consigne = 'Cette grille contient une pièce de monnaie dans chaque case.<br>'
    this.consigne += 'La somme de ces pièces est indiquée en haut pour une colonne et à gauche pour une ligne.<br>'

  }

  computeClue(line: Price[]): Price {
    let res = 0
    for(const l of line) {
      res += l.value
    }
    return new Price(res)
  }


  nouvelleVersion(): void {
    this.consigne = 
      this.nbQuestions === 1
        ? 'Cette grille contient '
        : 'Ces grilles contiennent '
    this.consigne += 'une pièce de monnaie dans chaque case.<br>'
    this.consigne += 'La somme de ces pièces est indiquée en haut pour une colonne et à gauche pour une ligne.<br>'
    this.comment = "Plus la taille de la grille est grande plus l'exercice sera difficile."
    this.comment += ' Note : la question est notée sur 3 points, proportionnellement au nombre de cases correctement remplies, arrondi à l’entier le plus proche.'

    for (
      let i = 0, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      
      // create the game grid
      const grid : Price[][] = [];
      const inline_grid: number[] = [];
      for (let x = 0; x < this.sup; x++ ){
        const line: Price[] = [];
        for (let y = 0; y < this.sup; y++){
          const coin = randCoin(0.01, 2);
          line.push(coin)
          inline_grid.push(coin.value)
        }
        grid.push(line)
      }

      // compute the clues
      const line_clues: Price[] = grid.map(row => this.computeClue(row));
      const col_clues: Price[] = [];
      for (let i=0; i<this.sup; i++){
        const column: Price[] = [];
        for (let j=0; j<this.sup; j++){
          column.push(grid[j][i]);
        }
        col_clues.push(this.computeClue(column));
      }

      // transform it as tab header
      const corner = this.interactif ? [celluleTexte('~', false)] : [celluleTexte('\\phantom{rrrrr}', false)]
      const tabColHeaders = corner.concat(col_clues.map(x => celluleTexte(x.forLatex())));
      // create the whole tab
      const select = coinSelect(0.01, 2);
      const tab = {rows: [tabColHeaders]}; // init with header
      for (let i = 0; i < this.sup; i++ ){
        const line = [celluleTexte(line_clues[i].forLatex())]
        for (let j = 0; j < this.sup; j++){
          line.push(celluleListe(`L${i + 1}C${j + 1}`, select, grid[i][j].toString()));
        }
        tab.rows.push(line);
      }

      const texte: string = creeTableauHybrideElement({
        numeroExercice: this.numeroExercice ?? 0,
        questionIndex: i,
        tableau: tab,
        interactivityOn: this.interactif,
      })
      const texteCorr = 'Voici une solution possible :<br>' + creeTableauHybrideElement({
        numeroExercice: this.numeroExercice ?? 0,
        questionIndex: i,
        tableau: tab,
        interactivityOn: false,
        correctionOn: true,
      })

      let objetReponse :Valeur = {};
      for (let i=0; i<this.sup; i++){
        for (let j=0; j<this.sup; j++){
          // TODO
          // objetReponse[`L${i + 1}C${j + 1}`] = {value : grid[i][j], options: { fonction: true }}
          const cellule = Object.fromEntries([[`L${i + 1}C${j + 1}`, {value : grid[i][j].forLatex()}]])
          objetReponse = Object.assign(objetReponse, cellule);
        }
      }
      objetReponse.bareme = troisPointsProportionnels
      handleAnswers(this, i, objetReponse, { formatInteractif: 'tableau-hybride' },);

      if (this.questionJamaisPosee(i, ...inline_grid)) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
  }
}