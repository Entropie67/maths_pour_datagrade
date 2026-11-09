import Figure from 'apigeom'
import { Coords } from 'apigeom/src/elements/calculus/Coords'
import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { repere } from '../../lib/2d/reperes'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { labelPoint, latex2d } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { figureAnswerJson } from '../../lib/apigeom/figureAnswer'
import { bleuMathalea } from '../../lib/colors'
import figureApigeom from '../../lib/figureApigeom'
import { choice } from '../../lib/outils/arrayOutils'
import { reduireAxPlusB } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { abs } from '../../lib/outils/nombres'
import { pgcd } from '../../lib/outils/primalite'
import { sp } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'

export const titre = 'Représenter graphiquement une fonction affine'
export const dateDePublication = '05/11/2026'
export const interactifReady = true
export const uuid = 'ccb3e'
export const refs = {
  'fr-fr': ['1A-F03-8'],
  'fr-ch': [],
}

/**
 * Automatisme tiré de 2F21-3 : tracer la droite représentant une fonction affine
 * (figure apiGeom), ou la reconnaître parmi quatre graphiques en version QCM.
 * @author Gilles Mora
 */

// Fonction affine x ↦ (p/d)x + b
type Affine = { p: number; d: number; b: number }

// Fenêtre des repères (figure interactive, correction et propositions du QCM)
const xMin = -5
const xMax = 5
const yMin = -5
const yMax = 5

const pente = ({ p, d }: Affine) => p / d

const memeFonction = (f: Affine, g: Affine) =>
  pente(f) === pente(g) && f.b === g.b

// Coefficient directeur sous forme de nombre ou de fraction irréductible
const coefficient = ({ p, d }: Affine) =>
  d === 1 ? p : new FractionEtendue(p, d).simplifie()

const texCoefficient = (f: Affine) => {
  const a = coefficient(f)
  return typeof a === 'number' ? String(a) : a.texFSD
}

// Repère quadrillé et gradué de -5 à 5 sur chaque axe
const repereQuadrille = () => [
  repere({
    xMin,
    xMax,
    yMin,
    yMax,
    grilleX: true,
    grilleY: true,
    grilleOpacite: 0.4,
    axeXStyle: '->',
    axeYStyle: '->',
  }),
  latex2d('\\text{O}', -0.3, -0.35, { letterSize: 'scriptsize' }),
]

// La droite, limitée au repère
const traceDroite = (f: Affine, couleur: string) => {
  const m = pente(f)
  const xAvecYMin = (yMin - f.b) / m
  const xAvecYMax = (yMax - f.b) / m
  const xDebut = Math.max(xMin, Math.min(xAvecYMin, xAvecYMax))
  const xFin = Math.min(xMax, Math.max(xAvecYMin, xAvecYMax))
  const s = segment(
    pointAbstrait(xDebut, m * xDebut + f.b),
    pointAbstrait(xFin, m * xFin + f.b),
  )
  s.color = colorToLatexOrHTML(couleur)
  s.epaisseur = 2
  return s
}

const figure2d = (objets: NestedObjetMathalea2dArray, scale: number) =>
  mathalea2d(
    {
      xmin: xMin - 0.6,
      xmax: xMax + 0.6,
      ymin: yMin - 0.6,
      ymax: yMax + 0.6,
      pixelsParCm: 20,
      scale,
      display: 'inline-block',
      center: !context.isHtml,
    },
    objets,
  )

export default class RepresenterFonctionAffine extends ExerciceQcmA {
  private fonction: Affine = { p: 1, d: 1, b: 0 }
  private fonctions: Affine[] = []
  private enonceOuvert = ''
  private correctionOuverte = ''
  private figureCorrigee = ''

  constructor() {
    super()
    this.nbQuestions = 1
    this.besoinFormulaireCaseACocher = ['Version QCM', false]
    this.sup = false
  }

  /** Version sans QCM : l'élève trace la droite (apiGeom). */
  nouvelleVersion() {
    this.fonctions = []
    if (this.sup) {
      super.nouvelleVersion()
      for (let i = 0; i < this.listeQuestions.length; i++) {
        const index = this.autoCorrection[i]?.propositions?.findIndex(
          (proposition) => proposition.statut,
        )
        if (index != null && index >= 0) {
          this.listeReponsesCourtes[i] = String.fromCharCode(65 + index)
        }
      }
      return
    }
    this.consigne = ''
    this.figuresApiGeom = []
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 30; cpt++) {
      this.versionAleatoire()
      if (!this.questionJamaisPosee(i, this.enonceOuvert)) continue
      this.fonctions[i] = this.fonction
      let texte = this.enonceOuvert
      if (this.interactif && context.isHtml) {
        const figure = new Figure({
          xMin: xMin - 0.5,
          yMin: yMin - 0.5,
          width: (xMax - xMin + 1) * 30,
          height: (yMax - yMin + 1) * 30,
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
        texte += `<br>${figure2d(repereQuadrille(), 0.6)}`
      }
      this.listeQuestions[i] = texte
      this.listeCorrections[i] = this.correctionOuverte
      this.listeReponsesCourtes[i] = this.figureCorrigee
      i++
    }
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
    const { p, d, b } = this.fonctions[i]
    const { isValid } = figure.checkLine({
      point1: new Coords(0, b),
      point2: new Coords(d, b + p),
    })
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

  // Trois fonctions distinctes de f et deux à deux, issues d'erreurs classiques
  private fonctionsDistractrices(f: Affine): Affine[] {
    const { p, d, b } = f
    const candidats: Affine[] = [
      { p: -p, d, b }, // erreur de signe sur le coefficient directeur
      { p: Math.sign(p) * d, d: abs(p), b }, // déplacements horizontal et vertical inversés
      { p, d, b: -b }, // erreur de signe sur l'ordonnée à l'origine
      { p: -p, d, b: -b },
      { p, d, b: b > 0 ? b - 2 : b + 2 },
      { p: -p, d, b: b > 0 ? b - 2 : b + 2 },
    ]
    const retenus: Affine[] = []
    for (const g of candidats) {
      if ([f, ...retenus].every((h) => !memeFonction(g, h))) retenus.push(g)
      if (retenus.length === 3) break
    }
    return retenus
  }

  private appliquerLesValeurs(f: Affine) {
    const { p, d, b } = f
    this.fonction = f
    const expression = reduireAxPlusB(coefficient(f), b)
    const coeffTex = texCoefficient(f)
    const xB = d
    const yB = b + p

    // Figure de la correction : la droite et les points A et B
    const A = pointAbstrait(0, b, 'A')
    const B = pointAbstrait(xB, yB, 'B')
    const traces = [tracePoint(A, 'red'), tracePoint(B, 'red')]
    for (const trace of traces) {
      trace.taille = 5
      trace.epaisseur = 2
    }
    const objetsCorrection: NestedObjetMathalea2dArray = [
      ...repereQuadrille(),
      traceDroite(f, 'red'),
      ...traces,
      labelPoint(A, 'red'),
      labelPoint(B, 'red'),
    ]
    this.figureCorrigee = figure2d(objetsCorrection, 0.6)

    const debut = `On considère la fonction affine $f$ définie sur $\\mathbb{R}$ par $f(x)=${expression}$.<br>`
    this.enonceOuvert = `${debut}Tracer${this.interactif ? '' : ', dans le repère suivant,'} la représentation graphique de $f$.`
    this.enonce = `${debut}Quelle est la représentation graphique de $f$${sp()}?`

    const explication = `La représentation graphique de $f$ est la droite d'équation $y=${expression}$.<br>
L'ordonnée à l'origine est $${b}$, on place donc le point $A(0\\,;\\,${b})$.<br>
Le coefficient directeur est égal à $${coeffTex}$. En se décalant ${d === 1 ? "d'une unité" : `de $${d}$ unités`} vers la droite à partir du point $A$, on ${p > 0 ? 'monte' : 'descend'} de $${abs(p)}$ ${abs(p) === 1 ? 'unité' : 'unités'}${sp()}: on obtient le point $B(${xB}\\,;\\,${yB})$.<br>`

    this.correctionOuverte = `${explication}On trace la droite $${miseEnEvidence('(AB)')}$.<br>${this.figureCorrigee}`
    this.correction = `${explication}La représentation graphique de $f$ est donc la droite $(AB)$${sp()}:<br>${this.figureCorrigee}`

    this.reponses = [f, ...this.fonctionsDistractrices(f)].map((g) =>
      figure2d(
        [...repereQuadrille(), traceDroite(g, bleuMathalea)],
        context.isHtml ? 0.4 : 0.3,
      ),
    )
  }

  versionOriginale = () => {
    this.appliquerLesValeurs({ p: 2, d: 1, b: -1 })
  }

  versionAleatoire = () => {
    // Coefficient directeur entier ou fractionnaire, au hasard
    const fractionnaire = choice([false, true])
    let p: number
    let d: number
    let b: number
    // Le point B(d ; b + p) reste dans le repère
    do {
      p = randint(-3, 3, [0])
      d = fractionnaire ? randint(2, 3) : 1
      b = randint(-3, 3)
    } while (pgcd(p, d) !== 1 || abs(b + p) > 4)
    this.appliquerLesValeurs({ p, d, b })
  }
}
