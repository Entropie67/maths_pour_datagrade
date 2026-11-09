import { randInt } from 'three/src/math/MathUtils.js'
import { tableauColonneLigne } from '../../lib/2d/tableau'
import { troisPointsProportionnels } from '../../lib/interactif/fonctionsBaremes'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { AddTabDbleEntryMathlive } from '../../lib/interactif/tableaux/AjouteTableauMathlive'
import { balancedLatinSquare } from '../../lib/outils/grid'
import { texNombre } from '../../lib/outils/texNombre'

import type { Valeur } from '../../lib/types'
import Exercice from '../Exercice'

export const dateDePublication = '15/08/2026'
export const titre = 'Résoudre une grille contenant des chiffres et des zéros'
export const interactifReady = true
export const tags = ['ffjm']

/** Résoudre une grille contenant des chiffre unique et des zéros
 * @author Claire Stephan
 */

export const uuid = 'f6e1a'
export const refs = {
  'fr-fr': ['EN-Zeros'],
  'fr-ch': [],
}

export default class zerosGrid extends Exercice {
  // On déclare des propriétés supplémentaires pour cet exercice afin de pouvoir les réutiliser dans la correction

  constructor() {
    super()

    this.besoinFormulaireNumerique = ['Taille de la grille', 6]
    this.besoinFormulaire2Numerique = [
      'Nombre maximal de zéros pour une case',
      6,
    ]
    this.sup = 3
    this.sup2 = 3
    this.nbQuestions = 1
    this.reponseCourteDisponible = false // La réponse est une grille complète à remplir.

    this.consigne = `Cette grille contient une fois chaque chiffre de $1$ à $${this.sup}$ par ligne et par colonne `
    this.consigne += 'auxquels on aura pu ajouter un ou plusieurs $0$.<br>'
    this.consigne +=
      'La somme des cases est indiquée en haut pour une colonne et à gauche pour une ligne.<br>'

    this.comment =
      'Pour augmenter la difficulté on peut augmenter la taille de la grille ou diminuer le nombre de zéros.'
    this.comment +=
      ' Note : la question est notée sur 3 points, proportionnellement au nombre de cases correctement remplies, arrondi à l’entier le plus proche.'
  }

  computeClue(line: number[]): number {
    let res = 0
    for (const l of line) {
      res += l
    }
    return res
  }

  nouvelleVersion(): void {
    const range = Array.from(Array(this.sup).keys()).map((x) => x + 1)

    this.consigne =
      this.nbQuestions === 1
        ? 'Cette grille contient '
        : 'Ces grilles contiennent '
    this.consigne += `une fois chaque chiffre de $1$ à $${this.sup}$ par ligne et par colonne `
    this.consigne += 'auxquels on aura pu ajouter un '
    if (this.sup2 != 1) this.consigne += 'ou plusieurs '
    this.consigne += '$0$.<br>'
    this.consigne +=
      'La somme des cases est indiquée en haut pour une colonne et à gauche pour une ligne.<br>'

    const tabStyle = { L0C0: 'white' }

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let grid = balancedLatinSquare(range) // create grid with uniq number
      // feed with some zeros
      grid = grid.map((l) => l.map((c) => c * 10 ** randInt(0, this.sup2)))
      const inline_grid: number[] = []
      grid.forEach((x) => {
        inline_grid.push(...x)
      })

      // compute the clues
      const line_clues = grid.map((row) => this.computeClue(row))
      const col_clues: number[] = []
      for (let i = 0; i < this.sup; i++) {
        const column: number[] = []
        for (let j = 0; j < this.sup; j++) {
          column.push(grid[j][i])
        }
        col_clues.push(this.computeClue(column))
      }

      // transform it as tab header and footer
      const corner = this.interactif ? ['~'] : ['\\phantom{rrrrr}']
      const tabColHeaders = corner.concat(col_clues.map((x) => texNombre(x)))
      const tabLineHeaders = line_clues.map((x) => texNombre(x))

      let texte: string
      if (this.interactif) {
        const emptyTab = AddTabDbleEntryMathlive.convertTclToTableauMathlive(
          tabColHeaders,
          tabLineHeaders,
          Array.from({ length: this.sup * this.sup }, () => ''),
        )
        const mathliveTab = AddTabDbleEntryMathlive.create(
          this.numeroExercice,
          i,
          emptyTab,
          `tableauMathlive`,
          true,
          tabStyle,
        )
        texte = mathliveTab.output
      } else {
        texte = tableauColonneLigne(
          tabColHeaders,
          tabLineHeaders,
          Array.from({ length: this.sup * this.sup }, () => '\\phantom{rrrrr}'),
          2.5,
          true,
          this.numeroExercice,
          i,
          false,
          tabStyle,
        )
      }
      const texteCorr = tableauColonneLigne(
        tabColHeaders,
        tabLineHeaders,
        inline_grid.map(x=> texNombre(x)),
        1.2,
        true,
        this.numeroExercice,
        i,
        false,
        tabStyle,
      )

      let objetReponse: Valeur = {}
      for (let i = 0; i < this.sup; i++) {
        for (let j = 0; j < this.sup; j++) {
          // TODO
          // objetReponse[`L${i + 1}C${j + 1}`] = {value : grid[i][j], options: { fonction: true }}
          const cellule = Object.fromEntries([
            [
              `L${i + 1}C${j + 1}`,
              { value: grid[i][j], options: { fonction: true } },
            ],
          ])
          objetReponse = Object.assign(objetReponse, cellule)
        }
      }
      objetReponse.bareme = troisPointsProportionnels

      handleAnswers(this, i, objetReponse)

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
