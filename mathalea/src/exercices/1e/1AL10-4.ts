import Figure from 'apigeom'
import { wrapperApigeomToMathalea } from '../../lib/apigeom/apigeomZoom'
import { figureAnswerJson } from '../../lib/apigeom/figureAnswer'
import figureApigeom from '../../lib/figureApigeom'
import { choice } from '../../lib/outils/arrayOutils'
import { ecritureAlgebrique } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Représenter graphiquement les premiers termes d'une suite"
export const interactifReady = true
export const interactifType = 'custom'
export const dateDePublication = '08/11/2026'

/**
 * Représenter graphiquement les premiers termes d'une suite définie
 * de façon explicite ou par récurrence.
 * Les termes restent dans l'intervalle [-6 ; 10] pour tenir dans un repère
 * de taille raisonnable : on demande 4 points (de u_0 à u_3) et, quand le
 * quatrième terme sortirait du repère, seulement 3 points (de u_0 à u_2).
 * @author Stéphane Guyon
 */
export const uuid = '03fbf'
export const refs = {
  'fr-fr': ['1AL10-4'],
  'fr-ch': [],
}

const TERME_MIN = -6
const TERME_MAX = 10

type Suite = {
  /** Définition de la suite, en LaTeX (sans les `$`) */
  definition: string
  /** Les quatre premiers termes u_0, u_1, u_2, u_3 */
  termes: number[]
  /** Un calcul de la correction par terme, en LaTeX (sans les `$`) */
  calculs: string[]
}

/** Coefficient devant une variable : 1 → '', -1 → '-' */
function coef(a: number) {
  return a === 1 ? '' : a === -1 ? '-' : String(a)
}

const dansLeRepere = (v: number) => v >= TERME_MIN && v <= TERME_MAX

export default class RepresenterTermesSuite extends Exercice {
  figuresApiGeom: Figure[] = []
  pointsAttendus: { x: number; y: number }[][] = []
  exoCustomResultat = true

  constructor() {
    super()
    this.nbQuestions = 2
    this.sup = '3'
    this.sup2 = true
    this.spacing = context.isHtml ? 2 : 1
    this.spacingCorr = 1.5
    this.besoinFormulaireTexte = [
      'Définition de la suite',
      'Nombres séparés par des tirets :\n1 : Forme explicite\n2 : Relation de récurrence\n3 : Mélange',
    ]
    this.besoinFormulaire2CaseACocher = [
      'Fournir le repère (version non interactive)',
      true,
    ]
  }

  nouvelleVersion() {
    this.figuresApiGeom.forEach((figure) => figure.destroy())
    this.figuresApiGeom = []
    this.pointsAttendus = []
    this.answers = {}
    const modes = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 2,
      melange: 3,
      defaut: 3,
      nbQuestions: this.nbQuestions,
    })
    const anciennes: string[] = []

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 100; cpt++) {
      const nom = choice(['u', 'v', 'w'])
      const suite =
        Number(modes[i]) === 1
          ? this.suiteExplicite(nom)
          : this.suiteRecurrente(nom)
      // Les trois premiers termes doivent tenir dans le repère.
      if (!suite.termes.slice(0, 3).every(dansLeRepere)) continue
      // Éviter une suite constante, et une même suite deux fois.
      if (new Set(suite.termes).size < 3) continue
      if (anciennes.includes(suite.definition)) continue
      anciennes.push(suite.definition)

      const nbPoints = suite.termes.every(dansLeRepere) ? 4 : 3
      const termes = suite.termes.slice(0, nbPoints)
      const points = termes.map((y, x) => ({ x, y }))
      this.pointsAttendus[i] = points

      const enonce =
        Number(modes[i]) === 1
          ? `Soit $(${nom}_n)$ la suite définie pour tout entier naturel $n$ par $${suite.definition}$.`
          : `Soit $(${nom}_n)$ la suite définie par ${suite.definition}.`
      // En version non interactive, le repère est fourni sauf si l'option est décochée.
      const repereFourni = this.interactif || this.sup2
      const consigne = `Représenter graphiquement les premiers termes de la suite, de $${nom}_0$ à $${nom}_${nbPoints - 1}$, c'est-à-dire placer dans ${repereFourni ? 'le' : 'un'} repère les points de coordonnées $(n\\,;\\,${nom}_n)$ pour $n$ allant de $0$ à $${nbPoints - 1}$.`

      // Repère adapté : abscisses de -1 à 6, ordonnées autour des valeurs.
      const yMin = Math.min(0, ...termes) - 1
      const yMax = Math.max(0, ...termes) + 1
      const xMin = -1
      const xMax = 6
      const options = {
        xMin,
        yMin,
        width: (xMax - xMin) * 30,
        height: (yMax - yMin) * 30,
        scale: context.isTypst ? 0.9 : 1,
        snapGrid: true,
        dx: 1,
        dy: 1,
      }
      const creeRepere = (figure: Figure) =>
        figure.create('Grid', {
          xMin,
          xMax,
          yMin,
          yMax,
          stepX: 1,
          stepY: 1,
          color: 'gray',
          axeX: true,
          axeY: true,
          labelX: true,
          labelY: true,
        })

      const figure = new Figure(options)
      creeRepere(figure)
      figure.setToolbar({
        tools: ['POINT', 'DRAG', 'UNDO', 'REDO', 'REMOVE'],
        position: 'top',
      })
      const correction = new Figure({ ...options, isDynamic: false })
      creeRepere(correction)
      for (const { x, y } of points) {
        correction.create('Point', {
          x,
          y,
          color: 'red',
          shape: 'x',
          isFree: false,
        })
      }
      this.figuresApiGeom[i] = figure

      const rendu = !repereFourni
        ? ''
        : context.isHtml && this.interactif && !context.isTypst
          ? figureApigeom({ exercice: this, figure, i, defaultAction: 'POINT' })
          : context.isHtml
            ? wrapperApigeomToMathalea(figure)
            : figure.tikz()

      const coordonnees = points
        .map(({ x, y }) => `(${x}\\,;\\,${y})`)
        .join('\\quad')
      const texteCorr =
        suite.calculs
          .slice(0, nbPoints)
          .map((calcul) => `$${calcul}$`)
          .join('<br>') +
        `<br>Les points à placer ont pour coordonnées $${miseEnEvidence(coordonnees)}$.<br>` +
        (context.isHtml
          ? wrapperApigeomToMathalea(correction)
          : correction.tikz())

      this.listeQuestions[i] =
        `${enonce}<br>${consigne}` + (rendu === '' ? '' : `<br>${rendu}`)
      this.listeCorrections[i] = texteCorr
      i++
    }
    listeQuestionsToContenu(this)
  }

  /** Suite définie de façon explicite : u_n = f(n) */
  suiteExplicite(nom: string): Suite {
    const type = choice([1, 2, 3])
    const valeur = (f: (n: number) => number) => [0, 1, 2, 3].map(f)
    if (type === 1) {
      const a = choice([-3, -2, -1, 1, 2, 3])
      const b = randint(-4, 6)
      const def = `${nom}_n=${coef(a)}n${b === 0 ? '' : ecritureAlgebrique(b)}`
      const termes = valeur((n) => a * n + b)
      return {
        definition: def,
        termes,
        calculs: termes.map(
          (t, n) =>
            `${nom}_{${n}}=${a === 1 ? '' : a === -1 ? '-' : `${a}\\times`}${n}${b === 0 ? '' : ecritureAlgebrique(b)}=${t}`,
        ),
      }
    }
    if (type === 2) {
      const s = choice([-1, 1])
      const c = randint(-4, 6)
      const def = `${nom}_n=${s === 1 ? '' : '-'}n^2${c === 0 ? '' : ecritureAlgebrique(c)}`
      const termes = valeur((n) => s * n * n + c)
      return {
        definition: def,
        termes,
        calculs: termes.map(
          (t, n) =>
            `${nom}_{${n}}=${s === 1 ? '' : '-'}${n}^2${c === 0 ? '' : ecritureAlgebrique(c)}=${t}`,
        ),
      }
    }
    const [u0, q] = choice([
      [1, 2],
      [2, 2],
      [-1, 2],
      [1, 3],
      [1, -2],
      [-1, -2],
      [8, 0.5],
    ])
    const qs = q === 0.5 ? '\\dfrac{1}{2}' : q < 0 ? `(${q})` : `${q}`
    const base = q === 0.5 ? `\\left(${qs}\\right)` : qs
    const prefixe = u0 === 1 ? '' : u0 === -1 ? '-' : `${u0}\\times`
    const termes = valeur((n) => u0 * q ** n)
    return {
      definition: `${nom}_n=${prefixe}${base}^n`,
      termes,
      calculs: termes.map(
        (t, n) => `${nom}_{${n}}=${prefixe}${base}^{${n}}=${t}`,
      ),
    }
  }

  /** Suite définie par récurrence : u_0 donné et u_{n+1} = f(u_n) */
  suiteRecurrente(nom: string): Suite {
    const type = choice([1, 2, 3, 4, 5])
    const suivants = (
      u0: number,
      f: (u: number, n: number) => number,
    ): number[] => {
      const termes = [u0]
      for (let n = 0; n < 3; n++) termes.push(f(termes[n], n))
      return termes
    }
    const u = (n: string) => `${nom}_{${n}}`
    let u0: number
    let corps: string
    let termes: number[]
    let calc: (k: number, v: number[]) => string
    if (type === 1) {
      const r = choice([-3, -2, -1, 1, 2, 3])
      u0 = randint(-3, 6)
      corps = `${u('n+1')}=${u('n')}${ecritureAlgebrique(r)}`
      termes = suivants(u0, (v) => v + r)
      calc = (k, v) =>
        `${u(String(k + 1))}=${v[k]}${ecritureAlgebrique(r)}=${v[k + 1]}`
    } else if (type === 2) {
      const [d, q] = choice([
        [1, 2],
        [2, 2],
        [-1, 2],
        [1, 3],
        [1, -2],
        [-1, -2],
        [8, 0.5],
      ])
      u0 = d
      const qs = q === 0.5 ? '\\dfrac{1}{2}' : String(q)
      corps = `${u('n+1')}=${q === 0.5 ? qs : q}${u('n')}`
      termes = suivants(u0, (v) => v * q)
      calc = (k, v) =>
        `${u(String(k + 1))}=${qs}\\times${v[k] < 0 ? `(${v[k]})` : v[k]}=${v[k + 1]}`
    } else if (type === 3) {
      const a = choice([-2, 2, 3])
      const b = choice([-3, -2, -1, 1, 2, 3])
      u0 = randint(-2, 3)
      corps = `${u('n+1')}=${a}${u('n')}${ecritureAlgebrique(b)}`
      termes = suivants(u0, (v) => a * v + b)
      calc = (k, v) =>
        `${u(String(k + 1))}=${a}\\times${v[k] < 0 ? `(${v[k]})` : v[k]}${ecritureAlgebrique(b)}=${v[k + 1]}`
    } else if (type === 4) {
      const c = choice([1, 2])
      u0 = randint(-2, 2)
      corps = `${u('n+1')}=${u('n')}^2-${c}`
      termes = suivants(u0, (v) => v * v - c)
      calc = (k, v) =>
        `${u(String(k + 1))}=${v[k] < 0 ? `(${v[k]})` : v[k]}^2-${c}=${v[k + 1]}`
    } else {
      const a = choice([-1, 1, 2])
      u0 = randint(-3, 3)
      corps = `${u('n+1')}=${u('n')}${a === 1 ? '+' : a === -1 ? '-' : `+${a}`}n`
      termes = suivants(u0, (v, n) => v + a * n)
      calc = (k, v) =>
        `${u(String(k + 1))}=${v[k]}${ecritureAlgebrique(a * k)}=${v[k + 1]}`
    }
    return {
      definition: `$${u('0')}=${u0}$ et, pour tout entier naturel $n$, $${corps}$`,
      termes,
      calculs: [`${u('0')}=${u0}`, ...[0, 1, 2].map((k) => calc(k, termes))],
    }
  }

  correctionInteractive = (i?: number) => {
    if (i === undefined) return ['KO']
    const figure = this.figuresApiGeom[i]
    if (figure == null) return ['KO']
    this.answers ??= {}
    this.answers[figure.id] = figureAnswerJson(figure)
    const attendus = this.pointsAttendus[i]
    const places = [...figure.elements.values()].filter(
      (e) =>
        e.type !== 'pointer' &&
        e.type.startsWith('Point') &&
        'isSelectable' in e &&
        e.isSelectable,
    ) as unknown as { x: number; y: number }[]
    const manquants = attendus.filter(
      ({ x, y }) =>
        !places.some(
          (p) => Math.abs(p.x - x) < 1e-3 && Math.abs(p.y - y) < 1e-3,
        ),
    )
    const enTrop = places.length - (attendus.length - manquants.length)
    const feedback = document.querySelector(
      `#feedbackEx${this.numeroExercice}Q${i}`,
    )
    const messages: string[] = []
    if (manquants.length > 0)
      messages.push(
        `Placer tous les points : ${manquants.length} point${manquants.length > 1 ? 's sont' : ' est'} mal placé${manquants.length > 1 ? 's' : ''} ou manquant${manquants.length > 1 ? 's' : ''}.`,
      )
    if (enTrop > 0) messages.push('Supprimer les points en trop.')
    const valide = messages.length === 0
    if (feedback)
      feedback.innerHTML = valide ? 'Bravo !' : messages.join('<br>')
    figure.isDynamic = false
    figure.divButtons.style.display = 'none'
    figure.divUserMessage.style.display = 'none'
    // Un seul point par question, quel que soit le nombre de points à placer.
    return [valide ? 'OK' : 'KO']
  }
}
