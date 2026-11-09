import Figure from 'apigeom'
import { Coords } from 'apigeom/src/elements/calculus/Coords'
import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { droite } from '../../lib/2d/droites'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { repere } from '../../lib/2d/reperes'
import { labelPoint, texteParPosition } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { figureAnswerJson } from '../../lib/apigeom/figureAnswer'
import { bleuMathalea } from '../../lib/colors'
import figureApigeom from '../../lib/figureApigeom'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { abs } from '../../lib/outils/nombres'
import { pgcd } from '../../lib/outils/primalite'
import { fraction } from '../../modules/fractions'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Tracer une droite donnée par un point et son coefficient directeur'
export const dateDePublication = '21/10/2026'
export const interactifReady = true
export const uuid = 'd8332'
export const refs = {
  'fr-fr': ['1A-F06-2'],
  'fr-ch': [],
}

/**
 * La droite passe par un point A et a un coefficient directeur p/d donné :
 * à partir de A, on se décale de d vers la droite et de p vers le haut ou le bas.
 * Figure interactive et vérification reprises de 2F21-3.
 * @author Arnaud Meistermann
 */
export default class TracerDroitePointCoefficient extends Exercice {
  // Deux points de la droite attendue, pour la vérification de la figure
  private pointsAttendus: [Coords, Coords][] = []

  constructor() {
    super()
    this.reponseCourteDisponible = false // La réponse est une figure ou un tableau.
    this.nbQuestions = 1
    this.sup = '1'
    this.besoinFormulaireTexte = [
      'Coefficient directeur',
      'Nombres séparés par des tirets :\n1 : Entier\n2 : Fractionnaire\n3 : Mélange des deux cas précédents',
    ]
  }

  nouvelleVersion() {
    this.figuresApiGeom = []
    this.pointsAttendus = []
    const typesDeQuestions = combinaisonListes(
      gestionnaireFormulaireTexte({
        saisie: this.sup,
        max: 2,
        melange: 3,
        defaut: 1,
        nbQuestions: 0,
        shuffle: false,
        listeOfCase: ['entier', 'fraction'],
      }),
      this.nbQuestions,
    )
    const origine = texteParPosition('O', -0.5, -0.5, 0, 'black', 1)
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      // Coefficient directeur p/d (d = 1 pour un entier), B est à (d ; p) de A
      let p: number
      let d: number
      if (typesDeQuestions[i] === 'entier') {
        p = randint(-4, 4, [0])
        d = 1
      } else {
        do {
          p = randint(-4, 4, [0])
          d = randint(2, 4)
        } while (pgcd(p, d) !== 1)
      }
      // A et B restent dans la grille, qui va de -5 à 5
      const xA = randint(-4, 4 - d)
      let yA: number
      do {
        yA = randint(-4, 4)
      } while (Math.abs(yA + p) > 5)
      const xB = xA + d
      const yB = yA + p
      const coefficientTex = d === 1 ? String(p) : fraction(p, d).texFSD

      let texte = `Tracer${this.interactif ? '' : ', dans le repère suivant,'} la droite passant par le point $A(${xA}\\,;\\,${yA})$ et de coefficient directeur $${coefficientTex}$.`
      let texteCorr = `On place le point $A(${xA}\\,;\\,${yA})$.<br>
      Le coefficient directeur est égal à $${coefficientTex}$. En se décalant ${d === 1 ? "d'une unité" : `de $${d}$ unités`} vers la droite à partir du point $A$, on ${p > 0 ? 'monte' : 'descend'} de $${abs(p)}$ ${abs(p) === 1 ? 'unité' : 'unités'}.<br>
      On obtient le point $B(${xB}\\,;\\,${yB})$.<br>
      On trace la droite $(AB)$.<br>`

      const A = pointAbstrait(xA, yA, 'A')
      const B = pointAbstrait(xB, yB, 'B')
      const droiteAB = droite(A, B)
      droiteAB.color = colorToLatexOrHTML('red')
      droiteAB.epaisseur = 2
      const traceA = tracePoint(A, 'red')
      const traceB = tracePoint(B, 'red')
      for (const trace of [traceA, traceB]) {
        trace.taille = 5
        trace.epaisseur = 2
      }
      const objets = [
        repere({ xMin: -5, yMin: -5, xMax: 5, yMax: 5 }),
        droiteAB,
        traceA,
        traceB,
        labelPoint(A, 'red'),
        labelPoint(B, 'red'),
        origine,
      ]
      texteCorr += mathalea2d(
        Object.assign({ scale: 0.6 }, fixeBordures(objets)),
        objets,
      )

      if (this.interactif) {
        const figure = new Figure({
          xMin: -5.5,
          yMin: -5.5,
          width: 330,
          height: 330,
        })
        this.figuresApiGeom[i] = figure
        figure.setToolbar({
          tools: ['POINT', 'LINE', 'DRAG', 'REMOVE'],
          position: 'top',
        })
        figure.create('Grid')
        figure.options.color = bleuMathalea
        figure.options.thickness = 2
        figure.snapGrid = true
        figure.dx = 0.5
        figure.dy = 0.5
        texte += `<br>${figureApigeom({ exercice: this, i, figure })}`
        if (figure.ui) figure.ui.send({ type: 'LINE' })
      } else {
        // Repère vide dans lequel tracer la droite
        const repereVide = [
          repere({ xMin: -5, yMin: -5, xMax: 5, yMax: 5 }),
          origine,
        ]
        texte += `<br>${mathalea2d(
          Object.assign({ scale: 0.6 }, fixeBordures(repereVide)),
          repereVide,
        )}`
      }

      if (this.questionJamaisPosee(i, xA, yA, p, d)) {
        this.pointsAttendus[i] = [new Coords(xA, yA), new Coords(xB, yB)]
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
    }
    listeQuestionsToContenu(this)
  }

  correctionInteractive = (i?: number) => {
    if (i === undefined || this.figuresApiGeom === undefined) return ['KO']
    let result: 'OK' | 'KO' = 'KO'
    if (this.figuresApiGeom[i] == null)
      throw new Error("La figure n'a pas été créée, n°" + i)
    const figure = this.figuresApiGeom[i]
    if (this.answers == null) this.answers = {}
    // Sauvegarde de la réponse pour Capytale
    this.answers[figure.id] = figureAnswerJson(figure)
    figure.isDynamic = false
    figure.divButtons.style.display = 'none'
    figure.divUserMessage.style.display = 'none'
    const lines = [...figure.elements.values()].filter((e) =>
      e.type.includes('Line'),
    )
    const [point1, point2] = this.pointsAttendus[i]
    const { isValid } = figure.checkLine({ point1, point2 })
    const divFeedback = document.querySelector(
      `#feedbackEx${this.numeroExercice}Q${i}`,
    )
    if (divFeedback != null) {
      if (isValid && lines.length === 1) {
        divFeedback.innerHTML = '😎'
        result = 'OK'
      } else {
        const message = document.createElement('p')
        message.innerText = '☹️'
        if (lines.length === 0) {
          message.innerHTML += " Aucune droite n'a été tracée."
        } else if (lines.length > 1) {
          message.innerHTML += " Il ne faut tracer qu'une seule droite."
        }
        divFeedback.insertBefore(message, divFeedback.firstChild)
      }
    }
    return result
  }
}
