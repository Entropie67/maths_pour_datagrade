import MathaleaLabyrintheElement from '../lib/customElements/MathaleaLabyrintheElement'
import { handleAnswers } from '../lib/interactif/gestionInteractif'
import { listeQuestionsToContenu } from '../modules/outils'
import Exercice from './Exercice'
export const interactifReady = true

/**
 * @author Rémi Angot
 */
export default class ExerciceLabyrinthe extends Exercice {
  consigneDeplacement =
    '<br>Dans ce labyrinthe, on peut se déplacer horizontalement, verticalement et en diagonale.'
  labyrintheElement!: MathaleaLabyrintheElement
  cols = 6
  rows = 6
  orientation?: 'horizontal' | 'vertical'
  goodAnswers: string[] = []
  badAnswers: string[] = []

  constructor() {
    super()
    this.nbQuestions = 1
    this.interactifObligatoire = true
    this.nbQuestionsModifiable = false
  }

  init() {}

  nouvelleVersion() {
    this.goodAnswers = []
    this.badAnswers = []

    this.init()
    const cellCounts = MathaleaLabyrintheElement.getCellCounts({
      seed: this.seed ?? '',
      rows: this.rows,
      cols: this.cols,
      orientation: this.orientation,
    })

    for (let i = 0; i < cellCounts.goodAnswers; i++) {
      this.goodAnswers.push(String(this.generateGoodAnswers()))
    }
    for (let i = 0; i < cellCounts.badAnswers; i++) {
      this.badAnswers.push(String(this.generateBadAnswers()))
    }

    let texte = ''
    let texteCorr = ''
    texte = MathaleaLabyrintheElement.create({
      id: `labyrintheEx${this.numeroExercice}Q0`,
      seed: this.seed ?? '',
      rows: this.rows,
      cols: this.cols,
      orientation: this.orientation,
      goodAnswers: this.goodAnswers,
      badAnswers: this.badAnswers,
      disabled: !this.interactif,
      numeroExercice: this.numeroExercice,
      feedback: true,
      questionIndex: 0,
    })

    texteCorr = MathaleaLabyrintheElement.create({
      id: `labyrintheCorrectionExo${this.numeroExercice}Question0`,
      seed: this.seed ?? '',
      rows: this.rows,
      cols: this.cols,
      orientation: this.orientation,
      goodAnswers: this.goodAnswers,
      badAnswers: this.badAnswers,
      correction: true,
      disabled: true,
    })

    handleAnswers(
      this,
      0,
      {
        reponse: {
          value: JSON.stringify({
            seed: this.seed ?? '',
            rows: this.rows,
            cols: this.cols,
            orientation: this.orientation,
            goodAnswers: this.goodAnswers,
            badAnswers: this.badAnswers,
          }),
        },
      },
      { formatInteractif: MathaleaLabyrintheElement.elementTag },
    )
    this.listeQuestions[0] = texte
    this.listeCorrections[0] = texteCorr
    listeQuestionsToContenu(this)
  }

  generateGoodAnswers(): number | string {
    return 1
  }

  generateBadAnswers(): number | string {
    return 0
  }
}
