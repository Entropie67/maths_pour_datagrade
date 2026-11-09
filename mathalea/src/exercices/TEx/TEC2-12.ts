import Figure from 'apigeom'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { repere } from '../../lib/2d/reperes'
import { labelPoint } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { figureAnswerJson } from '../../lib/apigeom/figureAnswer'
import { bleuMathalea } from '../../lib/colors'
import figureApigeom from '../../lib/figureApigeom'
import { Complexe } from '../../lib/mathFonctions/Complexe'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Placer un point d'affixe donnée dans le plan complexe"
export const interactifReady = true
export const dateDePublication = '28/10/2026'
export const uuid = '3f15d'
export const refs = {
  'fr-fr': ['TEC2-10-2'],
  'fr-ch': [],
}

/** Demi-largeur du repère : les points sont dans [-limite ; limite]². */
const limite = 6
/** « A », « A et B », « A, B et C ». */
function listeAvecEt(elements: string[]): string {
  if (elements.length < 2) return elements.join('')
  return `${elements.slice(0, -1).join(', ')} et ${elements[elements.length - 1]}`
}

const noms = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

/**
 * Placer dans le plan complexe des points dont on connait l'affixe
 * (version interactive avec apigeom). Plusieurs points se placent dans le même
 * repère, avec une seule consigne et une seule correction.
 * @author Stéphane Guyon
 */
export default class PlacerPointAffixe extends Exercice {
  /** Points attendus pour la question `i`, dans l'ordre des noms. */
  goodAnswers: { re: number; im: number }[][] = []

  constructor() {
    super()
    this.nbQuestions = 1
    this.besoinFormulaireCaseACocher = [
      "Afficher le repère dans l'énoncé (version non interactive)",
      true,
    ]
    this.sup = true
  }

  nouvelleVersion() {
    const figures: Figure[] = []
    this.figuresApiGeom = figures
    this.goodAnswers = []
    const points: { re: number; im: number }[] = []
    for (
      let i = 0, cpt = 0;
      i < Math.min(this.nbQuestions, noms.length) && cpt < 50;
    ) {
      const re = randint(-5, 5)
      const im = randint(-5, 5)
      if ((re !== 0 || im !== 0) && this.questionJamaisPosee(i, re, im)) {
        points.push({ re, im })
        i++
      }
      cpt++
    }
    const pluriel = points.length > 1
    // Plusieurs points : une seule question, un seul repère
    const questions = pluriel ? [points] : points.map((point) => [point])

    questions.forEach((pointsQuestion, i) => {
      const nomsQuestion = noms.slice(0, pluriel ? points.length : 1)
      const figure = new Figure({
        xMin: -limite - 0.5,
        yMin: -limite - 0.5,
        width: (2 * limite + 1) * 30,
        height: (2 * limite + 1) * 30,
        border: false,
        scale: 0.65,
      })
      figure.create('Grid', {
        strokeWidthGrid: 1,
        color: 'black',
        xMin: -limite,
        xMax: limite,
        yMin: -limite,
        yMax: limite,
        axeX: true,
        axeY: true,
        labelX: true,
        labelY: true,
      })
      figure.snapGrid = true
      figure.setToolbar({
        tools: ['DRAG', 'REMOVE', 'POINT'],
        position: 'top',
      })
      figure.options.color = 'blue' // Ne pas mettre bleuMathalea avec apigeom
      figure.options.labelAutomaticBeginsWith = 'A'
      figure.options.labelAutomaticForPoints = true

      const affixes = pointsQuestion.map(({ re, im }) =>
        new Complexe(re, im).tex(),
      )
      const consigne = `Dans le plan complexe muni d'un repère orthonormé $(O\\,;\\,\\vec u,\\vec v)$, placer ${listeAvecEt(
        nomsQuestion.map((n, k) => `le point $${n}$ d'affixe $${affixes[k]}$`),
      )}.`
      const texte =
        consigne +
        (this.interactif || this.sup
          ? figureApigeom({
              exercice: this,
              i,
              figure,
              idAddendum: 'TEC2-10-2' + i,
              defaultAction: 'POINT',
            })
          : '')
      const pointsCorrection = pointsQuestion.map(({ re, im }, k) =>
        pointAbstrait(re, im, nomsQuestion[k]),
      )
      const coordonnees = pointsQuestion.map(
        ({ re, im }, k) =>
          `$${miseEnEvidence(`${nomsQuestion[k]}(${re}\\,;\\,${im})`)}$`,
      )
      const texteCorr =
        `On place le point d'affixe $a+\\mathrm{i}b$ au point de coordonnées $(a\\,;\\,b)$ : ici ${listeAvecEt(coordonnees)}.<br>` +
        mathalea2d(
          {
            xmin: -limite - 1,
            xmax: limite + 1,
            ymin: -limite - 1,
            ymax: limite + 1,
            scale: 0.5,
          },
          repere({
            xMin: -limite,
            xMax: limite,
            yMin: -limite,
            yMax: limite,
            grille: true,
            grilleDistance: 1,
            grilleCouleur: bleuMathalea,
            grilleOpacite: 0.3,
          }),
          ...pointsCorrection.flatMap((point) => [
            tracePoint(point, 'red'),
            labelPoint(point, 'red'),
          ]),
        )
      figures[i] = figure
      this.goodAnswers[i] = pointsQuestion
      this.listeQuestions[i] = texte
      this.listeCorrections[i] = texteCorr
    })
    listeQuestionsToContenu(this)
  }

  correctionInteractive = (i: number) => {
    const figure = this.figuresApiGeom?.[i]
    const attendu = this.goodAnswers[i]
    if (figure == null || attendu == null) return 'KO'
    if (this.answers == null) this.answers = {}
    // Sauvegarde de la réponse pour Capytale
    this.answers[figure.id] = figureAnswerJson(figure)
    const divFeedback = document.querySelector(
      `#feedbackEx${this.numeroExercice}Q${i}`,
    )
    figure.isDynamic = false
    figure.divButtons.style.display = 'none'
    figure.divUserMessage.style.display = 'none'

    const nbPoints = [...figure.elements.values()].filter(
      (e) => e.type === 'Point',
    ).length
    const plusieurs = attendu.length > 1
    // Avec plusieurs points, le nom donné par apigeom (A, B, C…) doit correspondre
    // Trop de points : aucun point n'est accordé
    const resultats = attendu.map(({ re, im }, k) =>
      nbPoints <= attendu.length &&
      figure.checkPoint({
        x: re,
        y: im,
        label: plusieurs ? noms[k] : undefined,
      }).isValid
        ? 'OK'
        : 'KO',
    )
    const nbBienPlaces = resultats.filter((r) => r === 'OK').length
    const isOk = nbBienPlaces === attendu.length
    if (divFeedback != null) {
      divFeedback.innerHTML = isOk
        ? 'Bravo !'
        : nbPoints === 0
          ? "Aucun point n'est placé."
          : nbPoints > attendu.length
            ? plusieurs
              ? `Seuls ${attendu.length} points doivent être placés.`
              : 'Un seul point doit être placé.'
            : plusieurs
              ? `${nbBienPlaces} point${nbBienPlaces > 1 ? 's' : ''} bien placé${nbBienPlaces > 1 ? 's' : ''} sur ${attendu.length} (les points se placent dans l'ordre ${noms.slice(0, attendu.length).join(', ')}).`
              : "Le point n'est pas à la bonne place."
    }
    return resultats
  }
}
