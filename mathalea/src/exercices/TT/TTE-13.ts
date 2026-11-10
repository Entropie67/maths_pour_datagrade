import { courbe } from '../../lib/2d/Courbe'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { repere } from '../../lib/2d/reperes'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { texteParPosition } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  "Déterminer l'expression d'une fonction exponentielle à partir de sa courbe"
export const dateDePublication = '10/10/2026'
export const uuid = 'd6875'
export const interactifReady = true
export const refs = {
  'fr-fr': ['TTE-13'],
  'fr-ch': [],
}

export default class ExpressionExponentielleGraphique extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierFonctionsTerminales
    this.sup = '5'
    this.besoinFormulaireTexte = [
      'Abscisse du point à lire',
      'Nombres séparés par des tirets :\n1 : x = 1\n2 : x = -1\n3 : x = 2\n4 : x = -2\n5 : Mélange',
    ]
  }

  nouvelleVersion() {
    const types = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 4,
      melange: 5,
      defaut: 5,
      nbQuestions: this.nbQuestions,
    })

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const x = [1, -1, 2, -2][Number(types[i]) - 1]
      const n = randint(2, Math.abs(x) === 1 ? 5 : 3)
      const y = n ** Math.abs(x)
      const base = x > 0 ? n : 1 / n
      const baseTex = x > 0 ? `${n}` : `\\dfrac{1}{${n}}`
      const expression = x > 0 ? `${n}^x` : `\\left(${baseTex}\\right)^x`

      if (!this.questionJamaisPosee(i, x, n)) continue

      // Une ordonnée entière permet une lecture exacte, même pour a < 1.
      const yMax = y + 1
      const xUnite = 1.5
      const yUnite = 5 / yMax
      const r = repere({
        xMin: -2.5,
        xMax: 2.5,
        yMin: 0,
        yMax,
        xUnite,
        yUnite,
        xThickDistance: 1,
        xThickMin: -2,
        xThickMax: 2,
        yThickDistance: 1,
        // Le pas de la grille est exprimé en unités de dessin.
        grilleXDistance: xUnite,
        grilleYDistance: yUnite,
      })
      const a = pointAbstrait(x * r.xUnite, y * yUnite)
      const objets = [
        r,
        courbe((t) => base ** t, {
          repere: r,
          color: bleuMathalea,
          step: 0.02,
        }),
        tracePoint(a, bleuMathalea),
        texteParPosition('A', a.x + (x > 0 ? -0.35 : 0.35), a.y + 0.25),
      ]
      const optionsFigure = {
        xmin: -4.3,
        xmax: 4.3,
        ymin: -0.6,
        ymax: 5.6,
        pixelsParCm: 35,
        scale: 0.65,
      }
      const enonce = `La courbe ci-dessous représente une fonction $f$ définie sur $\\mathbb{R}$ par $f(x)=a^x$, avec $a>0$.<br>
        À l'aide des coordonnées du point $A$, déterminer l'expression de $f(x)$.<br>
        ${mathalea2d(optionsFigure, objets)}`
      this.listeQuestions[i] = enonce
      if (this.interactif) {
        this.listeQuestions[i] += ajouteChampTexteMathLive(
          this,
          i,
          KeyboardType.clavierFonctionsTerminales,
          { texteAvant: '<br>$f(x)=$' },
        )
      }
      handleAnswers(this, i, {
        reponse: {
          value: expression,
          options: { fonction: true, variable: 'x', domaine: [-2, 2] },
        },
      })

      let correction = `Le point $A$ a pour coordonnées $(${x}\\,;\\,${y})$, donc $f(${x})=${y}$, soit $a^{${x}}=${y}$.<br>`
      if (x === 1) correction += `Ainsi, $a=${n}$.<br>`
      if (x === -1) {
        correction += `Comme $a^{-1}=\\dfrac{1}{a}$, on obtient $\\dfrac{1}{a}=${n}$, donc $a=${baseTex}$.<br>`
      }
      if (x === 2) {
        correction += `Comme $a>0$, l'équation $a^2=${y}$ donne $a=\\sqrt{${y}}=${n}$.<br>`
      }
      if (x === -2) {
        correction += `Comme $a^{-2}=\\dfrac{1}{a^2}$, on obtient $a^2=\\dfrac{1}{${y}}$.<br>
          Comme $a>0$, on en déduit $a=\\dfrac{1}{\\sqrt{${y}}}=${baseTex}$.<br>`
      }
      const vertical = segment(a, pointAbstrait(a.x, 0), bleuMathalea)
      const horizontal = segment(a, pointAbstrait(0, a.y), bleuMathalea)
      vertical.pointilles = horizontal.pointilles = 2
      this.listeCorrections[i] =
        correction +
        `Ainsi, $f(x)=${miseEnEvidence(expression)}$.<br>` +
        mathalea2d(optionsFigure, objets, vertical, horizontal)
      this.listeCanEnonces[i] = enonce
      this.listeCanReponsesACompleter[i] = '$f(x)=\\ldots$'
      i++
    }
    listeQuestionsToContenu(this)
  }
}
