import Figure from 'apigeom'
import type { ObjetMathalea2D } from '../2d/ObjetMathalea2D'
import { colorToLatexOrHTML } from '../2d/colorToLatexOrHtml'
import { droite } from '../2d/droites'
import { pointAbstrait } from '../2d/PointAbstrait'
import { repere } from '../2d/reperes'
import { latex2d } from '../2d/textes'
import { figureAnswerJson } from '../apigeom/figureAnswer'
import { bleuMathalea, orangeMathalea } from '../colors'
import figureApigeom from '../figureApigeom'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import type ExerciceQcmA from '../../exercices/ExerciceQcmA'

/** Droite d'équation y = pente x + b, avec un vecteur directeur (dx ; dy) entier. */
export type DroiteOuverte = { b: number; dx: number; dy: number }

type Coords = { x: number; y: number }

const X_MIN = -5
const X_MAX = 5
const Y_MIN = -6
const Y_MAX = 6

type ExerciceDroite = ExerciceQcmA & {
  enonceOuvert: string
  correctionOuverte: string
  droiteOuverte: DroiteOuverte
  pointsDroite: { A: Coords; B: Coords }[]
}

function estDansLeRepere({ x, y }: Coords): boolean {
  return x >= X_MIN && x <= X_MAX && y >= Y_MIN && y <= Y_MAX
}

/**
 * Points A(0 ; b) et B = A ± (dx ; dy) : B est pris du côté où il reste dans le repère.
 */
export function pointsDeLaDroite({ b, dx, dy }: DroiteOuverte): {
  A: Coords
  B: Coords
  ux: number
  uy: number
} {
  const A = { x: 0, y: b }
  const plus = { x: dx, y: b + dy }
  const sens = estDansLeRepere(plus) ? 1 : -1
  return {
    A,
    B: { x: sens * dx, y: b + sens * dy },
    ux: sens * dx,
    uy: sens * dy,
  }
}

/** Phrase de correction qui décrit la construction de la droite. */
export function constructionDeLaDroite(
  droiteOuverte: DroiteOuverte,
  fonction: string,
): string {
  const { b } = droiteOuverte
  const { ux, uy } = pointsDeLaDroite(droiteOuverte)
  const unites = (n: number) =>
    `$${Math.abs(n)}$ ${Math.abs(n) === 1 ? 'unité' : 'unités'}`
  return `La représentation graphique de la fonction $f$ est la droite d'équation $y=${fonction}$.<br>
Elle coupe l'axe des ordonnées au point $A(0\\,;\\,${b})$ : on place ce point.<br>
À partir de $A$, on ${ux > 0 ? 'avance' : 'recule'} de ${unites(ux)} vers la ${ux > 0 ? 'droite' : 'gauche'}, puis on ${uy > 0 ? 'monte' : 'descend'} de ${unites(uy)} : on obtient un second point $B$ de la droite.<br>
On trace alors la droite $(AB)$.`
}

function figureStatique(droiteOuverte: DroiteOuverte, avecDroite: boolean) {
  const { A, B } = pointsDeLaDroite(droiteOuverte)
  const objets: ObjetMathalea2D[] = [
    repere({
      xMin: X_MIN,
      xMax: X_MAX,
      yMin: Y_MIN,
      yMax: Y_MAX,
      grilleX: true,
      grilleY: true,
      grilleSecondaire: true,
      grilleOpacite: 0.45,
      grilleSecondaireOpacite: 0.18,
      xLabelMin: X_MIN,
      xLabelMax: X_MAX,
      yLabelMin: Y_MIN,
      yLabelMax: Y_MAX,
      axeXStyle: '->',
      axeYStyle: '->',
    }),
    latex2d('\\text{O}', -0.25, -0.35, { letterSize: 'scriptsize' }),
  ]
  if (avecDroite) {
    const d = droite(pointAbstrait(A.x, A.y), pointAbstrait(B.x, B.y))
    d.color = colorToLatexOrHTML(orangeMathalea)
    d.epaisseur = 2
    objets.push(d)
  }
  return mathalea2d(
    {
      xmin: X_MIN - 1,
      xmax: X_MAX + 1,
      ymin: Y_MIN - 1,
      ymax: Y_MAX + 1,
      pixelsParCm: 25,
      scale: 0.6,
      center: true,
    },
    objets,
  )
}

/**
 * Version sans QCM : l'élève représente la droite dans un repère (apiGeom).
 * Mêmes tirages que le QCM (mêmes appels à `versionOriginale`/`versionAleatoire`).
 */
export function genereQuestionsDroiteApigeom(exercice: ExerciceDroite) {
  exercice.consigne = ''
  exercice.figuresApiGeom = []
  exercice.figuresApiGeomCorr = []
  exercice.pointsDroite = []
  for (let i = 0, cpt = 0; i < exercice.nbQuestions && cpt < 30; cpt++) {
    if (exercice.sup && exercice.versionOriginale != null)
      exercice.versionOriginale()
    else exercice.versionAleatoire()
    if (!exercice.questionJamaisPosee(i, exercice.enonceOuvert)) continue

    const { A, B } = pointsDeLaDroite(exercice.droiteOuverte)
    exercice.pointsDroite[i] = { A, B }

    const cadre = {
      xMin: X_MIN - 0.5,
      yMin: Y_MIN - 0.5,
      width: (X_MAX - X_MIN + 1) * 30,
      height: (Y_MAX - Y_MIN + 1) * 30,
    }
    const figure = new Figure(cadre)
    figure.create('Grid')
    figure.options.color = bleuMathalea
    figure.options.gridWithTwoPointsOnSamePosition = false
    figure.options.thickness = 2
    figure.snapGrid = true
    figure.setToolbar({
      tools: ['POINT', 'LINE', 'DRAG', 'REMOVE'],
      position: 'top',
    })
    const figureCorr = new Figure(cadre)
    figureCorr.loadJson(JSON.parse(figure.json))
    const A1 = figureCorr.create('Point', { x: A.x, y: A.y, label: 'A' })
    const B1 = figureCorr.create('Point', { x: B.x, y: B.y, label: 'B' })
    figureCorr.create('Line', {
      point1: A1,
      point2: B1,
      color: orangeMathalea,
    })
    exercice.figuresApiGeom[i] = figure
    exercice.figuresApiGeomCorr[i] = figureCorr

    exercice.listeQuestions[i] =
      exercice.enonceOuvert +
      '<br>' +
      (context.isHtml
        ? figureApigeom({ exercice, i, figure })
        : figureStatique(exercice.droiteOuverte, false))
    exercice.listeCorrections[i] =
      exercice.correctionOuverte +
      '<br>' +
      (context.isHtml
        ? figureApigeom({
            exercice,
            i,
            figure: figureCorr,
            idAddendum: 'correction',
            isDynamic: false,
          })
        : figureStatique(exercice.droiteOuverte, true))
    // Construction d'une droite : pas de réponse courte à afficher.
    exercice.listeReponsesCourtes[i] = null
    i++
    if (exercice.sup) break
  }
}

/** Correction interactive : une seule droite, confondue avec la droite attendue. */
export function verifieDroiteApigeom(
  exercice: ExerciceDroite,
  i: number,
): 'OK' | 'KO' {
  const figure = exercice.figuresApiGeom?.[i]
  const attendue = exercice.pointsDroite?.[i]
  if (figure == null || attendue == null) return 'KO'
  figure.isDynamic = false
  figure.divButtons.style.display = 'none'
  figure.divUserMessage.style.display = 'none'

  // Sauvegarde de la réponse pour Capytale
  if (exercice.answers == null) exercice.answers = {}
  exercice.answers[figure.id] = figureAnswerJson(figure)

  const divFeedback = document.querySelector(
    `#feedbackEx${exercice.numeroExercice}Q${i}`,
  )
  const lignes = [...figure.elements.values()].filter((e) =>
    e.type.includes('Line'),
  )
  const isValid = figure.checkLine({
    point1: attendue.A,
    point2: attendue.B,
  }).isValid
  if (isValid && lignes.length === 1) {
    if (divFeedback != null) divFeedback.innerHTML = '😎'
    return 'OK'
  }
  if (divFeedback != null) {
    const p = document.createElement('p')
    p.innerText = '☹️'
    if (lignes.length === 0) p.innerHTML += " Aucune droite n'a été tracée."
    else if (lignes.length > 1)
      p.innerHTML += " Il ne faut tracer qu'une seule droite."
    divFeedback.insertBefore(p, divFeedback.firstChild)
  }
  return 'KO'
}
