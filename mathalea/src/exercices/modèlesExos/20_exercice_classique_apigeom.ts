import Figure from 'apigeom'
import figureApigeom from '../../lib/figureApigeom'
import { choice } from '../../lib/outils/arrayOutils'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'
import { figureAnswerJson } from '../../lib/apigeom/figureAnswer'

export const titre = 'TITRE'

export const dateDePublication = '11/01/2025'
export const interactifReady = true

export const uuid = 'babybel'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * TITRE
 * @author
 */
export default class nomExercice extends Exercice {
  constructor() {
    super()
    this.consigne = 'Consigne'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    this.figuresApiGeom = []
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; ) {
      let texte = ''
      const texteCorr = ''

      this.figuresApiGeom[i] = new Figure({
        xMin: -5.5,
        yMin: -5.5,
        width: 330,
        height: 330,
      })

      this.figuresApiGeom[i].setToolbar({
        tools: ['POINT', 'LINE', 'DRAG', 'REMOVE'],
        position: 'top',
      })
      this.figuresApiGeom[i].create('Grid')
      this.figuresApiGeom[i].options.color = 'blue' // Ne pas mettre bleuMathalea quand il s'agit d'apigeom
      texte = figureApigeom({
        exercice: this,
        i,
        figure: this.figuresApiGeom[i],
        idAddendum: '6GXX' + i,
        defaultAction: 'POINT',
      })
      if (this.questionJamaisPosee(i, texte)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }

  // Toujours indexer par `i` (figure, feedback, resultatCheck) et jamais en dur
  // par 0 : c'est ce qui permet à l'exercice d'être agrégé comme une question
  // parmi d'autres par un méta-exercice (MetaExerciceCan, « Sélection
  // d'automatismes »), qui appelle alors la correction avec l'index de la
  // question dans l'exercice affiché.
  correctionInteractive = (i: number) => {
    if (this.answers == null) this.answers = {}
    // Sauvegarde de la réponse pour Capytale
    this.answers[this.figuresApiGeom![i].id] = figureAnswerJson(this.figuresApiGeom![i])
    const divFeedback = document.querySelector(
      `#feedbackEx${this.numeroExercice}Q${i}`,
    )

    // Toute la partie ci-dessous joue avec les tests propres à apiGeom (voir exercices pour exemple)
    // Il n'y a pas de méthode générique, chaque correction va dépendre de l'exercice....

    const isValid = choice([true, false]) // Ce isValid n'est que pour l'exemple ici, ce n'est pas à reproduire.

    if (divFeedback != null) {
      if (isValid) {
        divFeedback.innerHTML = 'Bravo !'
        return ['OK']
      }
      divFeedback.innerHTML = 'Non réussi. À adapter évidemment'
      return ['KO']
    }
    return [
      'EE : Je ne sais pas quoi mettre si le divFeedback est null, ni même d ailleurs pourquoi il le serait',
    ]
  }
}
