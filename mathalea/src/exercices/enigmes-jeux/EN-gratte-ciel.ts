import {
  ajouteCanvas3d,
  type Canvas3DContentDescription,
} from '../../lib/3d/3d_dynamique/Canvas3DElement'
import { bleuMathalea } from '../../lib/colors'
import type { AllChoiceType } from '../../lib/customElements/ListeDeroulanteElement'
import type { TableauHybrideCell } from '../../lib/customElements/TableauHybride'
import { creeTableauHybrideElement } from '../../lib/customElements/TableauHybride'
import { troisPointsProportionnels } from '../../lib/interactif/fonctionsBaremes'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import {
  texteEnCouleur,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { balancedLatinSquare } from '../../lib/outils/grid'

import type { Valeur } from '../../lib/types'
import { context } from '../../modules/context'
import Exercice from '../Exercice'

export const dateDePublication = '15/08/2026'
export const dateDeModificationImportante = '06/09/2026'
export const titre = 'Résoudre une grille de Gratte-ciel'
export const interactifReady = true
export const tags = ['ffjm']

/** Résoudre une grille de gratte ciel
 * @author Claire Stephan
 */

export const uuid = '74d07'
export const refs = {
  'fr-fr': ['EN-Gratte-ciel'],
  'fr-ch': [],
}

function celluleTexte(
  texte: string | number,
  header: boolean = true,
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
    choices,
  }
}

export function responseSelect(immeubles: number[]): AllChoiceType[] {
  const select: AllChoiceType[] = [{ label: 'Choisir', value: '' }]
  immeubles.forEach((val) => select.push({ latex: `${val}`, value: `${val}` }))
  return select
}

type Direction = 'north' | 'south' | 'west' | 'east'

type CellPlacement = {
  row: number
  column: number
  value: number
}

type ResolutionStep = {
  kind: 'direct-one' | 'direct-all' | 'forced' | 'choice'
  placements: CellPlacement[]
  reason?: 'row' | 'column' | 'cross'
  candidates: number[]
  direction?: Direction
  lineIndex?: number
  knownBefore?: CellPlacement[]
}

type SkyscraperClues = {
  north: number[]
  south: number[]
  west: number[]
  east: number[]
}

function visibleBuildings(line: number[]): number {
  let maximum = 0
  let visible = 0
  for (const height of line) {
    if (height > maximum) {
      maximum = height
      visible++
    }
  }
  return visible
}

function permutations(values: number[]): number[][] {
  if (values.length <= 1) return [values]
  const result: number[][] = []
  for (let i = 0; i < values.length; i++) {
    const remaining = values.slice(0, i).concat(values.slice(i + 1))
    for (const permutation of permutations(remaining)) {
      result.push([values[i], ...permutation])
    }
  }
  return result
}

/**
 * Produit une résolution déterministe menant à la solution générée.
 * Les choix ne sont utilisés que lorsqu'aucune valeur n'est forcée ; ils sont
 * explicitement distingués des déductions dans la correction rédigée.
 */
export function solveSkyscraperWithTrace(
  target: number[][],
  clues: SkyscraperClues,
): ResolutionStep[] {
  const size = target.length
  const values = [...target[0]].sort((a, b) => a - b)
  const allPermutations = permutations(values)
  const lineCandidates = (start: number, end: number) =>
    allPermutations.filter(
      (line) =>
        visibleBuildings(line) === start &&
        visibleBuildings([...line].reverse()) === end,
    )
  let rowCandidates = clues.west.map((west, row) =>
    lineCandidates(west, clues.east[row]),
  )
  let columnCandidates = clues.north.map((north, column) =>
    lineCandidates(north, clues.south[column]),
  )
  const assigned: Array<Array<number | null>> = Array.from(
    { length: size },
    () => Array<number | null>(size).fill(null),
  )
  const steps: ResolutionStep[] = []

  const clueGroups: Array<{ direction: Direction; clues: number[] }> = [
    { direction: 'west', clues: clues.west },
    { direction: 'east', clues: clues.east },
    { direction: 'north', clues: clues.north },
    { direction: 'south', clues: clues.south },
  ]
  const coordinatesFrom = (
    direction: Direction,
    lineIndex: number,
    offset: number,
  ): [number, number] => {
    if (direction === 'west') return [lineIndex, offset]
    if (direction === 'east') return [lineIndex, size - 1 - offset]
    if (direction === 'north') return [offset, lineIndex]
    return [size - 1 - offset, lineIndex]
  }
  const addDirectStep = (
    kind: 'direct-one' | 'direct-all',
    direction: Direction,
    lineIndex: number,
    expectedValues: number[],
  ) => {
    const placements: CellPlacement[] = []
    expectedValues.forEach((value, offset) => {
      const [row, column] = coordinatesFrom(direction, lineIndex, offset)
      if (target[row][column] !== value) {
        throw new Error(
          'La solution cible est incompatible avec ses informations de bord.',
        )
      }
      if (assigned[row][column] === null) {
        assigned[row][column] = value
        placements.push({ row, column, value })
      }
    })
    if (placements.length > 0) {
      steps.push({
        kind,
        placements,
        candidates: expectedValues,
        direction,
        lineIndex,
      })
    }
  }

  // Commencer par les informations qui ordonnent une rangée entière : elles
  // placent aussi le plus haut immeuble indiqué par le 1 du bord opposé.
  for (const { direction, clues: directionClues } of clueGroups) {
    directionClues.forEach((clue, lineIndex) => {
      if (clue === size) {
        addDirectStep('direct-all', direction, lineIndex, values)
      }
    })
  }
  for (const { direction, clues: directionClues } of clueGroups) {
    directionClues.forEach((clue, lineIndex) => {
      if (clue === 1) {
        addDirectStep('direct-one', direction, lineIndex, [values.at(-1)!])
      }
    })
  }

  const valuesAt = (candidates: number[][], position: number) =>
    new Set(candidates.map((candidate) => candidate[position]))

  const propagate = () => {
    // Ne conserver ici que les conséquences directement vérifiables à partir
    // des nombres de bord et des cases déjà remplies. Une compatibilité
    // indirecte avec une autre rangée ne doit pas être présentée comme une
    // déduction propre à cette ligne ou à cette colonne.
    rowCandidates = rowCandidates.map((candidates, row) =>
      candidates.filter((candidate) =>
        candidate.every(
          (value, column) =>
            assigned[row][column] === null || assigned[row][column] === value,
        ),
      ),
    )
    columnCandidates = columnCandidates.map((candidates, column) =>
      candidates.filter((candidate) =>
        candidate.every(
          (value, row) =>
            assigned[row][column] === null || assigned[row][column] === value,
        ),
      ),
    )
  }

  while (assigned.some((row) => row.some((value) => value === null))) {
    propagate()
    let forcedStep: ResolutionStep | undefined
    let choiceStep: ResolutionStep | undefined
    const knownBefore = assigned.flatMap((line, row) =>
      line.flatMap((value, column) =>
        value === null ? [] : [{ row, column, value }],
      ),
    )

    for (let row = 0; row < size; row++) {
      for (let column = 0; column < size; column++) {
        if (assigned[row][column] !== null) continue
        const rowValues = valuesAt(rowCandidates[row], column)
        const columnValues = valuesAt(columnCandidates[column], row)
        const candidates = [...rowValues]
          .filter((value) => columnValues.has(value))
          .sort((a, b) => a - b)
        if (!candidates.includes(target[row][column])) {
          throw new Error(
            'La solution cible est incompatible avec ses informations de bord.',
          )
        }
        if (candidates.length === 1 && !forcedStep) {
          forcedStep = {
            kind: 'forced',
            placements: [{ row, column, value: candidates[0] }],
            reason:
              rowValues.size === 1
                ? 'row'
                : columnValues.size === 1
                  ? 'column'
                  : 'cross',
            candidates,
            knownBefore,
          }
        } else if (
          candidates.length > 1 &&
          (!choiceStep || candidates.length < choiceStep.candidates.length)
        ) {
          choiceStep = {
            kind: 'choice',
            placements: [{ row, column, value: target[row][column] }],
            candidates,
            knownBefore,
          }
        }
      }
    }

    const step = forcedStep ?? choiceStep
    if (!step) break
    const [placement] = step.placements
    assigned[placement.row][placement.column] = placement.value
    steps.push(step)
  }

  return steps
}

function formatValues(values: number[]): string {
  if (values.length === 1) return `$${values[0]}$`
  return `${values
    .slice(0, -1)
    .map((value) => `$${value}$`)
    .join(', ')} ou $${values.at(-1)}$`
}

function formatSequence(values: number[]): string {
  if (values.length <= 2) return formatValues(values).replace(' ou ', ' puis ')
  return `${values
    .slice(0, -1)
    .map((value) => `$${value}$`)
    .join(', ')}, puis $${values.at(-1)}$`
}

function borderLocation(direction: Direction, lineIndex: number): string {
  if (direction === 'west') return `à gauche de la ligne $${lineIndex + 1}$`
  if (direction === 'east') return `à droite de la ligne $${lineIndex + 1}$`
  if (direction === 'north') return `au-dessus de la colonne $${lineIndex + 1}$`
  return `au-dessous de la colonne $${lineIndex + 1}$`
}

function readingDirection(direction: Direction): string {
  if (direction === 'west') return 'de gauche à droite'
  if (direction === 'east') return 'de droite à gauche'
  if (direction === 'north') return 'de haut en bas'
  return 'de bas en haut'
}

function explanationWithTwoVisible(
  step: ResolutionStep,
  grid: number[][],
  clues: SkyscraperClues,
): string | undefined {
  if (step.kind !== 'forced' || step.placements.length !== 1) return undefined
  const [placement] = step.placements
  const maximum = Math.max(...grid[0])
  const knownMaximum = step.knownBefore?.find(
    ({ row, column, value }) =>
      value === maximum &&
      (step.reason === 'row'
        ? row === placement.row
        : column === placement.column),
  )
  if (!knownMaximum) return undefined

  let observerPosition: string | undefined
  if (
    step.reason === 'row' &&
    placement.column === 0 &&
    clues.west[placement.row] === 2 &&
    knownMaximum.column > placement.column
  ) {
    observerPosition = `la gauche de la ligne $${placement.row + 1}$`
  } else if (
    step.reason === 'row' &&
    placement.column === grid.length - 1 &&
    clues.east[placement.row] === 2 &&
    knownMaximum.column < placement.column
  ) {
    observerPosition = `la droite de la ligne $${placement.row + 1}$`
  } else if (
    step.reason === 'column' &&
    placement.row === 0 &&
    clues.north[placement.column] === 2 &&
    knownMaximum.row > placement.row
  ) {
    observerPosition = `le haut de la colonne $${placement.column + 1}$`
  } else if (
    step.reason === 'column' &&
    placement.row === grid.length - 1 &&
    clues.south[placement.column] === 2 &&
    knownMaximum.row < placement.row
  ) {
    observerPosition = `le bas de la colonne $${placement.column + 1}$`
  }
  if (!observerPosition) return undefined

  return `Puisque l’on ne voit que $2$ immeubles depuis ${observerPosition} et que l’immeuble de $${maximum}$ étages situé plus loin est toujours visible, le premier immeuble est forcément celui de $${placement.value}$ étages. Le placer dans la case située colonne $${placement.column + 1}$ de la ligne $${placement.row + 1}$.`
}

function buildDetailedCorrection(
  grid: number[][],
  clues: SkyscraperClues,
): string {
  const steps = solveSkyscraperWithTrace(grid, clues)
  const descriptions = steps
    .slice(0, Math.ceil(grid.length ** 2 / 2))
    .map((step) => {
      if (
        (step.kind === 'direct-one' || step.kind === 'direct-all') &&
        step.direction !== undefined &&
        step.lineIndex !== undefined
      ) {
        const position = borderLocation(step.direction, step.lineIndex)
        if (step.kind === 'direct-one') {
          const [placement] = step.placements
          return `Le nombre $1$ placé ${position} signifie qu’un seul immeuble est visible depuis ce côté.<br>
        Le premier immeuble rencontré est donc le plus haut : placer l’immeuble de $${placement.value}$ étages dans la case située colonne $${placement.column + 1}$ de la ligne $${placement.row + 1}$.`
        }
        const lineKind =
          step.direction === 'west' || step.direction === 'east'
            ? 'cette ligne'
            : 'cette colonne'
        return `Le nombre $${grid.length}$ placé ${position} signifie que tous les immeubles sont visibles depuis ce côté. Compléter ${lineKind} par tailles croissantes ${readingDirection(step.direction)} : ${formatSequence([...grid[0]].sort((a, b) => a - b))}.`
      }

      const [placement] = step.placements
      const visibilityExplanation = explanationWithTwoVisible(step, grid, clues)
      if (visibilityExplanation) return visibilityExplanation
      const location = `dans la case située colonne $${placement.column + 1}$ de la ligne $${placement.row + 1}$`
      if (step.kind === 'choice') {
        return `Les hauteurs ${formatValues(step.candidates)} restent possibles ${location}. Pour construire la solution proposée, choisir l’immeuble de $${placement.value}$ étages.`
      }
      if (step.reason === 'row') {
        return `Sur la ligne $${placement.row + 1}$, il faut voir $${clues.west[placement.row]}$ immeubles depuis la gauche et $${clues.east[placement.row]}$ depuis la droite. Avec les immeubles déjà placés, ces deux informations imposent celui de $${placement.value}$ étages dans la colonne $${placement.column + 1}$.`
      }
      if (step.reason === 'column') {
        return `Dans la colonne $${placement.column + 1}$, il faut voir $${clues.north[placement.column]}$ immeubles depuis le haut et $${clues.south[placement.column]}$ depuis le bas. Avec les immeubles déjà placés, ces deux informations imposent celui de $${placement.value}$ étages dans la ligne $${placement.row + 1}$.`
      }
      return `En croisant les possibilités de la ligne $${placement.row + 1}$ avec celles de la colonne $${placement.column + 1}$, une seule hauteur reste possible à leur intersection : placer l’immeuble de $${placement.value}$ étages.`
    })
  descriptions.push(
    'Utiliser les informations de bord restantes pour compléter la grille.',
  )
  const title = texteEnCouleurEtGras(
    'Méthode pour construire cette solution possible.',
    bleuMathalea,
  )
  const introduction = texteEnCouleur(
    `S'il y a un $${grid.length}$ : il permet de remplir toute la rangée du plus petit au plus grand car cela veut dire qu'on voit tous les immeubles.<br>
  S'il y a un $1$, il permet de remplir la première case de la rangée ou de la colonne avec l'immeuble le plus haut qui cache les autres.<br>
  Pour les rangées restantes, croiser les informations verticales et horizontales restantes dans les deux sens afin d'ajouter des immeubles.`,
    bleuMathalea,
  )
  if (context.isHtml) {
    return `${title}<br>${introduction}<ol class="nombres">${descriptions.map((description) => `<li>${texteEnCouleur(description, bleuMathalea)}</li>`).join('')}</ol>`
  }
  return `${title} ${introduction}\\begin{enumerate}${descriptions.map((description) => `\\item ${texteEnCouleur(description, bleuMathalea)}`).join('')}\\end{enumerate}`
}

export default class gratteciel extends Exercice {
  // On déclare des propriétés supplémentaires pour cet exercice afin de pouvoir les réutiliser dans la correction

  constructor() {
    super()

    this.besoinFormulaireNumerique = ['Taille de la grille', 6]
    this.sup = 3
    this.nbQuestions = 1
    this.correctionDetailleeDisponible = true
    this.correctionDetaillee = false
    this.comment =
      'Note : la question est notée sur 3 points, proportionnellement au nombre de cases correctement remplies, arrondi à l’entier le plus proche.'
  }

  // compute the clue displayed at the beginning of each line
  computeClue(line: number[]): number {
    return visibleBuildings(line)
  }

  nouvelleVersion(): void {
    const immeubles = Array.from(Array(this.sup).keys()).map(
      (x) => (x + 1) * 10,
    )

    this.consigne = `${
      this.nbQuestions === 1
        ? 'Cette grille représente une ville '
        : 'Ces grilles représentent des villes '
    }vue du ciel.<br>
    Chaque case contient un immeuble de ${immeubles.slice(0, -1).map((n) => `$${n}$`).join(', ')} ou $${immeubles[this.sup - 1]}$ étages.<br>
    Les immeubles d’une même ligne ou d’une même colonne sont tous de tailles différentes.<br>
    Les informations données sur les bords indiquent le nombre d’immeubles visibles sur la rangée correspondante par un observateur situé à cet endroit.<br>
    Le but du jeu est de trouver la disposition des immeubles dans la grille.<br>`

    // this.comment = "aide au formulaire?"

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      // fill the grid using balancedLatinSquare
      const grid = balancedLatinSquare(immeubles)
      const inline_grid: number[] = []
      grid.forEach((x) => {
        inline_grid.push(...x)
      })

      // compute the clues
      const west = grid.map((row) => this.computeClue(row))
      const east = grid.map((row) => this.computeClue([...row].reverse()))
      const north: number[] = []
      const south: number[] = []
      for (let i = 0; i < this.sup; i++) {
        const column: number[] = []
        for (let j = 0; j < this.sup; j++) {
          column.push(grid[j][i])
        }
        north.push(this.computeClue(column))
        south.push(this.computeClue([...column].reverse()))
      }

      // transform it as tab header and footer
      const corner = this.interactif
        ? [celluleTexte('~', false)]
        : [celluleTexte('\\phantom{rrrrr}', false)]
      const tabColHeaders: TableauHybrideCell[] = corner
        .concat(north.map((x) => celluleTexte(x.toString())))
        .concat(corner)
      const tabColFooters: TableauHybrideCell[] = corner
        .concat(south.map((x) => celluleTexte(x.toString())))
        .concat(corner)

      // create the whole tab
      const select: AllChoiceType[] = responseSelect(immeubles)
      const tab = { rows: [tabColHeaders] } // init with header
      for (let i = 0; i < this.sup; i++) {
        const line = [celluleTexte(west[i])]
        for (let j = 0; j < this.sup; j++) {
          line.push(celluleListe(`L${i + 1}C${j + 1}`, select, grid[i][j]))
        }
        line.push(celluleTexte(east[i]))
        tab.rows.push(line)
      }
      tab.rows.push(tabColFooters)

      const texte: string = creeTableauHybrideElement({
        numeroExercice: this.numeroExercice ?? 0,
        questionIndex: i,
        tableau: tab,
        interactivityOn: this.interactif,
      })

      const correctionDetaillee = `${buildDetailedCorrection(grid, { north, south, west, east })}<br><br>`
      let texteCorr = this.correctionDetaillee
        ? correctionDetaillee
        : correctionDetaillee.split(
            context.isHtml ? '<ol' : '\\begin{enumerate}',
          )[0]
      texteCorr += creeTableauHybrideElement({
        numeroExercice: this.numeroExercice ?? 0,
        questionIndex: i,
        tableau: tab,
        interactivityOn: false,
        correctionOn: true,
      })

      if (context.isHtml) {
        const content: Canvas3DContentDescription = {
          objects: [
            { type: 'skyscraperGrid', grid, north, south, west, east },
            { type: 'ambientLight', color: 0xffffff, intensity: 1.3 },
            {
              type: 'directionalLight',
              color: 0xffffff,
              intensity: 1.6,
              position: [8, 12, 10],
            },
            {
              type: 'directionalLight',
              color: 0xb8d8ff,
              intensity: 0.8,
              position: [-8, 6, -10],
            },
          ],
          backgroundColor: 0xe8f0f5,
          autoCenterZoomMargin: 1.25,
        }
        texteCorr +=
          '<br><br>' +
          ajouteCanvas3d({
            id: `canvas3d-gratte-ciel-${this.numeroExercice ?? 0}-${i}`,
            content,
            width: 500,
            height: 500,
            buttonLabel: 'Visualisation 3D',
          })
      }

      let objetReponse: Valeur = {}
      for (let i = 0; i < this.sup; i++) {
        for (let j = 0; j < this.sup; j++) {
          // TODO
          // objetReponse[`L${i + 1}C${j + 1}`] = {value : grid[i][j], options: { fonction: true }}
          const cellule = Object.fromEntries([
            [`L${i + 1}C${j + 1}`, { value: grid[i][j] }],
          ])
          objetReponse = Object.assign(objetReponse, cellule)
        }
      }
      objetReponse.bareme = troisPointsProportionnels

      handleAnswers(this, i, objetReponse, {
        formatInteractif: 'tableau-hybride',
      })

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
