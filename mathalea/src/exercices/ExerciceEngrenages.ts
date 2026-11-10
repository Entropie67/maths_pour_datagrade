import { amcConvert } from '../lib/amc/amcBuilders'
import { createList } from '../lib/format/lists'
import { addMultiMathfield } from '../lib/customElements/MultiMathfield'
import { KeyboardType } from '../lib/interactif/claviers/keyboard'
import { toutAUnPoint } from '../lib/interactif/fonctionsBaremes'
import { handleAnswers } from '../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../lib/interactif/questionMathLive'
import { figureAnimee, figureImmobile } from '../lib/outils/animationRoues'
import type { Train } from '../lib/outils/engrenages'
import { context } from '../modules/context'
import { listeQuestionsToContenu } from '../modules/outils'
import Exercice from './Exercice'

/** Ce que doit fournir un exercice d'engrenages pour chaque question. */
export type CasEngrenage = {
  train: Train
  /** Nombres de dents dessinés dans l'énoncé, quand ils diffèrent de ceux du train. */
  dentsDessinees?: number[]
  introduction: string
  /** Une consigne par champ de réponse. */
  questions: string[]
  /** Réponse attendue pour chaque consigne. */
  reponses: number[]
  /** Début de la correction, commun à toutes les consignes. */
  correction: string
  /** Correction de chaque consigne, affichée sous forme de liste quand il y en a plusieurs. */
  corrections?: string[]
  /** Ce qui distingue la question des autres dans l'exercice. */
  signature?: (string | number)[]
}

function correctionComplete({ correction, corrections = [] }: CasEngrenage) {
  if (corrections.length === 0) return correction
  return (
    correction +
    (corrections.length > 1
      ? createList({ items: corrections, style: 'alpha' })
      : corrections[0])
  )
}

/**
 * Base des exercices d'engrenages interactifs : les sous-classes décrivent
 * une question (`nouveauCas`) et celle-ci se charge du reste (champs de réponse,
 * barème, figures, export AMC).
 *
 * Une seule consigne donne un champ simple ; plusieurs consignes donnent un
 * seul champ multiple (le nombre de points d'une question est donc fixe).
 */
export default abstract class ExerciceEngrenages extends Exercice {
  /** Tire les valeurs d'une question et rédige son énoncé et sa correction. */
  protected abstract nouveauCas(i: number): CasEngrenage

  /** Appelé une fois avant les tirages (lecture des paramètres, par exemple). */
  protected prepare() {}

  /** L'animation de la correction s'arrête-t-elle après un cycle ? */
  protected get animationUnCycle() {
    return Boolean(this.sup)
  }

  nouvelleVersion(numeroExercice: number) {
    this.prepare()
    for (let i = 0, essais = 0; i < this.nbQuestions && essais < 50; essais++) {
      const cas = this.nouveauCas(i)
      if (!this.questionJamaisPosee(i, ...(cas.signature ?? cas.train.dents))) {
        continue
      }
      const { dents, tours } = cas.train
      this.listeQuestions[i] =
        `${cas.introduction}<br>${this.champs(cas, i)}` +
        figureImmobile(cas.dentsDessinees ?? dents)
      this.listeCorrections[i] =
        correctionComplete(cas) +
        figureAnimee(
          dents,
          tours,
          `${numeroExercice}-${i}`,
          this.animationUnCycle,
        )
      if (context.isAmc) this.exporteAmc(cas, i)
      i++
    }
    listeQuestionsToContenu(this)
  }

  private champs({ questions, reponses }: CasEngrenage, i: number) {
    if (questions.length === 1) {
      handleAnswers(this, i, { reponse: { value: reponses[0] } })
      return (
        questions[0] +
        ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers)
      )
    }
    const noms = questions.map((_, k) => `champ${k + 1}`)
    const gabarit = createList({
      items: questions.map((q, k) => `${q} %{${noms[k]}}`),
      style: 'alpha',
    })
    const rendu = addMultiMathfield(this, i, {
      dataTemplate: gabarit,
      dataOptions: Object.fromEntries(
        noms.map((nom) => [nom, { keyboard: KeyboardType.clavierNumbers }]),
      ),
    })
    handleAnswers(
      this,
      i,
      {
        ...Object.fromEntries(
          noms.map((nom, k) => [nom, { value: reponses[k] }]),
        ),
        bareme: toutAUnPoint,
      },
      { formatInteractif: 'multi-mathfield' },
    )
    return rendu
  }

  private exporteAmc(cas: CasEngrenage, i: number) {
    const consignes =
      cas.questions.length > 1
        ? createList({ items: cas.questions, style: 'alpha' })
        : cas.questions[0]
    this.autoCorrectionAMC[i] = {
      enonce: `Dans un engrenage, il y a ${cas.train.dents.length} roues. ${cas.introduction}<br>${consignes}`,
      propositions: [
        {
          texte: correctionComplete(cas),
          statut: 3,
          feedback: '',
          sanscadre: false,
          pointilles: false,
        },
      ],
    }
    this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
  }
}
