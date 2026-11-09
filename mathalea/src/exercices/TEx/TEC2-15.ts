import Figure from 'apigeom'
import { figureAnswerJson } from '../../lib/apigeom/figureAnswer'
import { bleuMathalea } from '../../lib/colors'
import figureApigeom from '../../lib/figureApigeom'
import { point } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { repere } from '../../lib/2d/reperes'
import { labelPoint } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { toutAUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { createQuestion } from '../../lib/interactif/createQuestion'
import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { Complexe } from '../../lib/mathFonctions/Complexe'
import { miseEnEvidence, texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const interactifReady = true
export const titre = 'Démontrer qu’un quadrilatère est un parallélogramme avec les affixes'
export const dateDePublication = '28/10/2026'
export const uuid = 'e8e03'
export const refs = { 'fr-fr': ['TEC2-11'], 'fr-ch': [] }

const estUnTerme = (x: number, y: number) => x === 0 || y === 0

/** Premier opérande : parenthèses seulement pour un complexe à deux termes. */
const premier = (x: number, y: number) => (estUnTerme(x, y) ? new Complexe(x, y).tex() : `(${new Complexe(x, y).tex()})`)

/** Opérande après + ou − : parenthèses sauf pour un réel ou un imaginaire pur positif. */
const suivant = (x: number, y: number) =>
  estUnTerme(x, y) && x + y >= 0 ? new Complexe(x, y).tex() : `(${new Complexe(x, y).tex()})`

/**
 * Placer quatre points d'affixes données, démontrer qu'ABCD est un parallélogramme (ni losange, ni rectangle)
 * avec les affixes des vecteurs AB et DC, puis déterminer l'affixe de son centre.
 * @author Stéphane Guyon
 */
export default class NatureQuadrilatereComplexes extends Exercice {
  /** Points à placer dans la figure de la question 0 (nom et coordonnées). */
  pointsAttendus: { label: string; x: number; y: number }[] = []

  constructor() {
    super()
    // Un tirage = trois questions liées : placer les points (apiGeom), démontrer, centre M.
    this.nbQuestions = 3
    this.nbQuestionsModifiable = false
    this.exoCustomResultat = true
    this.spacingCorr = 2
  }

  nouvelleVersion(): void {
    this.figuresApiGeom = []
    this.pointsAttendus = []
    this.listeReponsesCourtes[0] = null // La question 0 a pour réponse une figure.
    for (let cpt = 0; cpt < 100; ) {
      cpt++
      const xA = randint(-6, 2)
      const yA = randint(-4, 4)
      const p = randint(-6, 6, [0])
      const q = randint(-6, 6, [0])
      const r = randint(-6, 6, [0])
      const s = randint(-6, 6, [0])
      // AB = (p, q), AD = (r, s) : ni alignés, ni orthogonaux, ni de même longueur
      const nonAlignes = Math.abs(p * s - q * r) >= 12 // évite un parallélogramme quasi aplati
      const nonRectangle = p * r + q * s !== 0
      const nonLosange = p * p + q * q !== r * r + s * s
      const xB = xA + p
      const yB = yA + q
      const xD = xA + r
      const yD = yA + s
      const xC = xB + r
      const yC = yB + s
      const tous = [xA, xB, xC, xD]
      const tousY = [yA, yB, yC, yD]
      // Le centre M, milieu de [AC], a des coordonnées entières
      const centreEntier = (p + r) % 2 === 0 && (q + s) % 2 === 0
      const dansLaFenetre = Math.min(...tous, ...tousY) >= -8 && Math.max(...tous, ...tousY) <= 8
      if (!(nonAlignes && nonRectangle && nonLosange && centreEntier && dansLaFenetre)) continue
      const zA = new Complexe(xA, yA)
      const zB = new Complexe(xB, yB)
      const zC = new Complexe(xC, yC)
      const zD = new Complexe(xD, yD)
      const zAB = new Complexe(p, q)
      const zDC = new Complexe(xC - xD, yC - yD)
      const xM = (xA + xC) / 2
      const yM = (yA + yC) / 2
      const zM = new Complexe(xM, yM)

      const A = point(xA, yA, 'A', 'above left')
      const B = point(xB, yB, 'B', 'below right')
      const C = point(xC, yC, 'C', 'above right')
      const D = point(xD, yD, 'D', 'above left')
      const M = point(xM, yM, 'M', 'below')
      const xMin = Math.min(...tous, 0) - 1
      const xMax = Math.max(...tous, 0) + 1
      const yMin = Math.min(...tousY, 0) - 1
      const yMax = Math.max(...tousY, 0) + 1
      const figure = mathalea2d(
        {
          xmin: xMin - 0.5,
          xmax: xMax + 0.5,
          ymin: yMin - 0.5,
          ymax: yMax + 0.5,
          pixelsParCm: 30,
          scale: 0.6,
        },
        repere({
          xMin,
          xMax,
          yMin,
          yMax,
          xUnite: 1,
          yUnite: 1,
          grille: true,
          grilleDistance: 1,
          grilleCouleur: 'gray',
          grilleOpacite: 0.4,
          xThickDistance: 1,
          yThickDistance: 1,
          xLegende: '',
          yLegende: '',
          axeXStyle: '->',
          axeYStyle: '->',
        }),
        polygone([A, B, C, D], bleuMathalea),
        tracePoint(A, B, C, D, M),
        labelPoint(A, B, C, D, M),
      )

      const enonceAffixes = `Dans le plan complexe, on considère les points $A$, $B$, $C$ et $D$ d’affixes respectives $z_A=${zA.tex()}$, $z_B=${zB.tex()}$, $z_C=${zC.tex()}$ et $z_D=${zD.tex()}$.`

      // Question 0 : placer les points (figure apiGeom, correction maison)
      this.pointsAttendus = [
        { label: 'A', x: xA, y: yA },
        { label: 'B', x: xB, y: yB },
        { label: 'C', x: xC, y: yC },
        { label: 'D', x: xD, y: yD },
      ]
      const figureEleve = new Figure({ xMin: -9, yMin: -9, width: 540, height: 540, snapGrid: true, dx: 1, dy: 1 })
      figureEleve.create('Grid')
      figureEleve.options.color = 'blue'
      figureEleve.options.labelAutomaticBeginsWith = 'A'
      figureEleve.options.labelAutomaticForPoints = true
      figureEleve.setToolbar({ tools: ['POINT', 'NAME_POINT', 'DRAG', 'REMOVE', 'UNDO', 'REDO'], position: 'top' })
      this.figuresApiGeom[0] = figureEleve
      this.listeQuestions[0] =
        `${enonceAffixes}<br>Placer ces points dans le plan complexe.` +
        figureApigeom({ exercice: this, i: 0, figure: figureEleve, defaultAction: 'POINT' })
      this.listeCorrections[0] = figure

      // Question 1 : affixes des vecteurs et conséquence
      const choices = [
        { label: 'Choisir', value: '' },
        { label: 'quadrilatère quelconque', value: 'quelconque' },
        { label: 'trapèze', value: 'trapeze' },
        { label: 'parallélogramme', value: 'parallelogramme' },
        { label: 'losange', value: 'losange' },
        { label: 'rectangle', value: 'rectangle' },
        { label: 'carré', value: 'carre' },
      ]
      const rappel = `On rappelle que $z_A=${zA.tex()}$, $z_B=${zB.tex()}$, $z_C=${zC.tex()}$ et $z_D=${zD.tex()}$.`
      const calculs = `${rappel}<br>Calculer les affixes des vecteurs $\\overrightarrow{AB}$ et $\\overrightarrow{DC}$.`
      // Hors interactivité, les affixes sont déjà données à la question précédente
      const enonce =
        'Calculer les affixes des vecteurs $\\overrightarrow{AB}$ et $\\overrightarrow{DC}$. Que peut-on en déduire ?'
      if (this.interactif && context.isHtml && !context.isTypst) {
        this.listeQuestions[1] = addMultiMathfield(this, 1, {
          dataTemplate: `${calculs}<br>
            $z_{\\overrightarrow{AB}}=$ %{field0}<br>
            $z_{\\overrightarrow{DC}}=$ %{field1}<br>
            Que peut-on en déduire ?<br>
            On en déduit que %{field2} donc $ABCD$ est un %{field3}.`,
          dataOptions: {
            field0: { keyboard: KeyboardType.complexes },
            field1: { keyboard: KeyboardType.complexes },
            field2: {
              keyboard: KeyboardType.clavierEntierementPersonnalisable,
              dataKeys: ['VECT', '=', 'A', 'B', 'C', 'D'],
            },
            field3: { choices },
          },
        })
        handleAnswers(
          this,
          1,
          {
            field0: { value: zAB.tex() },
            field1: { value: zDC.tex() },
            field2: { value: '\\overrightarrow{AB}=\\overrightarrow{DC}' },
            field3: { value: 'parallelogramme' },
            bareme: toutAUnPoint,
          },
          { formatInteractif: 'multi-mathfield' },
        )
      } else {
        this.listeQuestions[1] = enonce
      }
      this.listeCorrections[1] = `$z_{\\overrightarrow{AB}}=z_B-z_A=${premier(xB, yB)}-${suivant(xA, yA)}=${zAB.tex()}$ ;<br>
        $z_{\\overrightarrow{DC}}=z_C-z_D=${premier(xC, yC)}-${suivant(xD, yD)}=${zDC.tex()}$<br>
        Les affixes des vecteurs $\\overrightarrow{AB}$ et $\\overrightarrow{DC}$ sont égales, donc $\\overrightarrow{AB}=\\overrightarrow{DC}$.<br>
        Ainsi, $ABCD$ est un ${texteEnCouleurEtGras('parallélogramme')}.`

      // Question 2 : affixe du centre
      createQuestion(this, 2, {
        question: 'Déterminer l’affixe du point $M$, centre du quadrilatère $ABCD$.',
        correction: `Le centre $M$ d’un parallélogramme est le milieu de ses diagonales, en particulier de $[AC]$ :<br>$z_M=\\dfrac{z_A+z_C}{2}=\\dfrac{${premier(xA, yA)}+${suivant(xC, yC)}}{2}=\\dfrac{${new Complexe(xA + xC, yA + yC).tex()}}{2}=${miseEnEvidence(zM.tex())}$`,
        answer: { value: zM.tex() },
        field: { keyboard: KeyboardType.complexes, texteAvant: '<br>$z_M=$' },
      })
      break
    }
    listeQuestionsToContenu(this)
  }

  /** Corrige la question 0 : la figure de l'élève. Les autres questions sont corrigées par le moteur. */
  correctionInteractive = (i: number) => {
    if (this.answers == null) this.answers = {}
    const figure = this.figuresApiGeom![i]
    this.answers[figure.id] = figureAnswerJson(figure)
    const divFeedback = document.querySelector(`#feedbackEx${this.numeroExercice}Q${i}`)
    const resultat: string[] = []
    let feedback = ''
    for (const { label, x, y } of this.pointsAttendus) {
      const { isValid, message } = figure.checkCoords({ label, x, y })
      resultat.push(isValid ? 'OK' : 'KO')
      if (message !== '') feedback += `${message}<br>`
    }
    if (divFeedback != null) divFeedback.innerHTML = feedback
    figure.isDynamic = false
    return resultat
  }
}
