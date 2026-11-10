import type { MetaInteractif2dInputs } from '../../types/2d'
import type { IExercice } from '../types'
import { ObjetMathalea2D } from './ObjetMathalea2D'

export class MetaInteractif2d extends ObjetMathalea2D {
  exercice: IExercice
  question: number
  inputs: MetaInteractif2dInputs
  constructor(
    inputs: MetaInteractif2dInputs,
    {
      exercice,
      question = 0,
    }: {
      exercice: IExercice
      question: number
    },
  ) {
    super()
    this.inputs = inputs
    this.exercice = exercice
    this.question = question
    this.bordures = this.computeBordures(
      inputs.map((input) => [
        input.x - 0.5,
        input.y - 0.5,
        input.x + 0.5,
        input.y + 0.5,
      ]),
    )
  }

  svg(): {
    exercice: IExercice
    question: number
    inputs: MetaInteractif2dInputs
  } {
    return {
      exercice: this.exercice,
      question: this.question,
      inputs: this.inputs,
    }
  }

  tikz() {
    return this.inputs
      .map(
        (input) =>
          `\\draw[opacity=${input.opacity ?? 1}] (${input.x},${input.y}) node[anchor = center, rotate=${this.orientation ?? 0}] {$${(
            input.content ?? ''
          ).replaceAll(/%\{champ(\d+)\}/g, '\\ldots')}$};`,
      )
      .join('\n')
  }

  computeBordures(borduresList: [number, number, number, number][]) {
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    for (const bordures of borduresList) {
      const [x1, y1, x2, y2] = bordures
      if (x1 < minX) minX = x1
      if (y1 < minY) minY = y1
      if (x2 > maxX) maxX = x2
      if (y2 > maxY) maxY = y2
    }

    return [minX, minY, maxX, maxY] as [number, number, number, number]
  }
}
