import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { codageSegments } from '../../lib/2d/CodageSegment'
import { point } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { repere } from '../../lib/2d/reperes'
import { labelPoint } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { bleuMathalea } from '../../lib/colors'
import { all, isEqual } from '../../lib/interactif/checks'
import { troisPointsProportionnels } from '../../lib/interactif/fonctionsBaremes'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { createQuestion } from '../../lib/interactif/createQuestion'
import type { SubQuestion } from '../../lib/interactif/subQuestions'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import {
  addMultiMathfield,
  type DataOptionsMultiMathfield,
} from '../../lib/customElements/MultiMathfield'
import type { AnswerType } from '../../lib/types'
import { combinaisonListes, shuffle } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const dateDeModifImportante = '07/11/2026'
export const titre =
  "Déterminer la nature d'un triangle à partir des affixes de ses sommets"
export const interactifReady = true
export const dateDePublication = '29/10/2026'
export const uuid = '632d7'
export const refs = {
  'fr-fr': ['TEC2-23'],
  'fr-ch': [],
}

/** Nombre a + b√3 (a et b entiers). */
type Reel = { a: number; b: number }
/** Point du plan dont les coordonnées s'écrivent a + b√3. */
type Sommet = { x: Reel; y: Reel }

const valeur = ({ a, b }: Reel) => a + b * Math.sqrt(3)
const moins = (u: Reel, v: Reel): Reel => ({ a: u.a - v.a, b: u.b - v.b })

/** Écriture LaTeX de a + b√3, sans parenthèses. */
const texReel = ({ a, b }: Reel) => {
  const racine = b === 0 ? '' : `${b === 1 ? '' : b === -1 ? '-' : b}\\sqrt{3}`
  if (b === 0) return `${a}`
  if (a === 0) return racine
  return `${a}${b > 0 ? '+' : ''}${racine}`
}

/** Écriture LaTeX de l'affixe x + yi. */
const texAffixe = ({ x, y }: Sommet) => {
  const re = x.a === 0 && x.b === 0 ? '' : texReel(x)
  if (y.a === 0 && y.b === 0) return re === '' ? '0' : re
  let im: string
  if (y.a !== 0 && y.b !== 0) im = `+(${texReel(y)})\\mathrm{i}`
  else if (y.a === 0 && Math.abs(y.b) === 1)
    im = `${y.b > 0 ? '+' : '-'}\\sqrt{3}\\mathrm{i}`
  else if (y.b === 0 && Math.abs(y.a) === 1)
    im = `${y.a > 0 ? '+' : '-'}\\mathrm{i}`
  else {
    const t = texReel(y)
    im = `${t.startsWith('-') ? '' : '+'}${t}\\mathrm{i}`
  }
  if (re === '') return im.startsWith('+') ? im.slice(1) : im
  return re + im
}

const entier = (a: number, b = 0): Reel => ({ a, b })

/** Carré d'un nombre, entre parenthèses sauf pour un entier positif ou nul. */
const carre = (r: Reel) =>
  r.b === 0 && r.a >= 0 ? `${r.a}^2` : `\\left(${texReel(r)}\\right)^2`

/** Carré de la distance entre deux sommets, avec le détail du calcul. */
function distanceCarree(P: Sommet, Q: Sommet) {
  const dx = moins(Q.x, P.x)
  const dy = moins(Q.y, P.y)
  const n = Math.round(valeur(dx) ** 2 + valeur(dy) ** 2)
  return {
    n,
    detail: `${carre(dx)}+${carre(dy)}`,
  }
}

type FieldOptions = NonNullable<DataOptionsMultiMathfield['field0']>

type Nature = 'Isocèle' | 'Équilatéral' | 'Rectangle' | 'Isocèle rectangle'

/**
 * Déterminer la nature d'un triangle dont on donne les affixes des sommets
 * (isocèle, équilatéral, rectangle ou isocèle rectangle), avec une figure.
 * @author Stéphane Guyon
 */
export default class NatureTriangleAffixes extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.spacingCorr = 3
  }

  /** Trois sommets [sommet particulier, P, Q] selon le type de triangle. */
  tirageSommets(type: number): Sommet[] {
    const x0 = randint(-3, 3)
    const y0 = randint(-3, 3)
    const O = { x: entier(x0), y: entier(y0) }
    const decale = (u: number, v: number): Sommet => ({
      x: entier(x0 + u),
      y: entier(y0 + v),
    })
    if (type === 1) {
      // Isocèle non rectangle : deux vecteurs de même norme, non orthogonaux
      const normes = [
        [
          [1, 2],
          [2, 1],
          [-1, 2],
          [-2, 1],
          [2, -1],
          [1, -2],
          [-1, -2],
          [-2, -1],
        ],
        [
          [1, 3],
          [3, 1],
          [-1, 3],
          [-3, 1],
          [3, -1],
          [1, -3],
          [-1, -3],
          [-3, -1],
        ],
        [
          [3, 4],
          [4, 3],
          [-3, 4],
          [-4, 3],
          [4, -3],
          [3, -4],
          [-3, -4],
          [-4, -3],
          [5, 0],
          [0, 5],
          [-5, 0],
          [0, -5],
        ],
      ]
      const liste = normes[randint(0, 2)]
      let u: number[]
      let v: number[]
      do {
        u = liste[randint(0, liste.length - 1)]
        v = liste[randint(0, liste.length - 1)]
      } while (
        u[0] * v[0] + u[1] * v[1] === 0 || // angle droit
        u[0] * v[1] - u[1] * v[0] === 0 // points alignés ou confondus
      )
      return [O, decale(u[0], u[1]), decale(v[0], v[1])]
    }
    if (type === 2) {
      // Équilatéral : côté 2m, horizontal ou vertical
      const m = randint(1, 2)
      const s = randint(0, 1) === 0 ? 1 : -1
      const horizontal = randint(0, 1) === 0
      const xo = randint(-2, 2)
      const yo = randint(-2, 2)
      if (horizontal) {
        return [
          { x: entier(xo), y: entier(yo) },
          { x: entier(xo + 2 * m), y: entier(yo) },
          { x: entier(xo + m), y: entier(yo, s * m) },
        ]
      }
      return [
        { x: entier(xo), y: entier(yo) },
        { x: entier(xo), y: entier(yo + 2 * m) },
        { x: entier(xo, s * m), y: entier(yo + m) },
      ]
    }
    if (type === 3) {
      // Isocèle rectangle en O
      let a: number
      let b: number
      do {
        a = randint(-3, 3)
        b = randint(-3, 3)
      } while (a === 0 && b === 0)
      const s = randint(0, 1) === 0 ? 1 : -1
      return [O, decale(a, b), decale(-s * b, s * a)]
    }
    // Rectangle non isocèle en O : v = k × (rotation de u)
    let a: number
    let b: number
    do {
      a = randint(-2, 2)
      b = randint(-2, 2)
    } while (a === 0 && b === 0)
    const k = randint(0, 1) === 0 ? 2 : -2
    return [O, decale(a, b), decale(-k * b, k * a)]
  }

  nouvelleVersion() {
    const types = combinaisonListes([1, 2, 3, 4], this.nbQuestions)
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 100; cpt++) {
      const sommets = this.tirageSommets(types[i])
      const ordre = shuffle([0, 1, 2])
      const S = ordre.map((k) => sommets[k])
      const noms = shuffle(['A', 'B', 'C'])
      const [nA, nB, nC] = types[i] === 2 ? ['A', 'B', 'C'] : noms
      const [A, B, C] = S
      if (
        !this.questionJamaisPosee(
          i,
          ...S.flatMap((s) => [s.x.a, s.x.b, s.y.a, s.y.b]),
        )
      )
        continue

      const nom = [nA, nB, nC]
      // Distances au carré : cotés[k] est le côté opposé au sommet k
      const paires = [
        [1, 2],
        [0, 2],
        [0, 1],
      ]
      const dist = paires.map(([p, q]) => distanceCarree(S[p], S[q]))
      const nomCote = paires.map(([p, q]) => `${nom[p]}${nom[q]}`)
      const nombres = dist.map((d) => d.n)
      const egaux = (p: number, q: number) => nombres[p] === nombres[q]
      const droit = [0, 1, 2].find(
        (k) => nombres[k] === nombres[(k + 1) % 3] + nombres[(k + 2) % 3],
      )
      let nature: Nature
      if (egaux(0, 1) && egaux(1, 2)) nature = 'Équilatéral'
      else if (
        droit !== undefined &&
        [0, 1, 2].some((k) => egaux(k, (k + 1) % 3))
      )
        nature = 'Isocèle rectangle'
      else if (droit !== undefined) nature = 'Rectangle'
      else nature = 'Isocèle'

      // Figure
      const xs = S.map((s) => valeur(s.x))
      const ys = S.map((s) => valeur(s.y))
      const gx = (xs[0] + xs[1] + xs[2]) / 3
      const gy = (ys[0] + ys[1] + ys[2]) / 3
      const P = S.map((s, k) =>
        point(
          xs[k],
          ys[k],
          nom[k],
          `${ys[k] >= gy ? 'above' : 'below'} ${xs[k] >= gx ? 'right' : 'left'}`,
        ),
      )
      const xMin = Math.floor(Math.min(...xs, 0)) - 1
      const xMax = Math.ceil(Math.max(...xs, 0)) + 1
      const yMin = Math.floor(Math.min(...ys, 0)) - 1
      const yMax = Math.ceil(Math.max(...ys, 0)) + 1
      const figure = (codee: boolean) => {
        const objets: unknown[] = [
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
          polygone(P, bleuMathalea),
          tracePoint(...P),
          labelPoint(...P),
        ]
        if (codee) {
          if (droit !== undefined) {
            objets.push(
              codageAngleDroit(
                P[(droit + 1) % 3],
                P[droit],
                P[(droit + 2) % 3],
              ),
            )
          }
          const marques = ['×', '||', 'O']
          let m = 0
          const dejaCodes = new Set<number>()
          for (let p = 0; p < 3; p++) {
            const groupe = [0, 1, 2].filter(
              (q) => !dejaCodes.has(q) && egaux(p, q),
            )
            if (groupe.length > 1) {
              const args: unknown[] = []
              for (const q of groupe) {
                dejaCodes.add(q)
                args.push(P[paires[q][0]], P[paires[q][1]])
              }
              objets.push(codageSegments(marques[m++], 'red', ...args))
            }
          }
        }
        return mathalea2d(
          {
            xmin: xMin - 0.5,
            xmax: xMax + 0.5,
            ymin: yMin - 0.5,
            ymax: yMax + 0.5,
            pixelsParCm: 30,
            scale: 0.7,
          },
          ...(objets as never[]),
        )
      }

      const nomTri = `${nA}${nB}${nC}`
      const equilateral = nature === 'Équilatéral'
      const kMax = nombres.indexOf(Math.max(...nombres))
      const [a, b] = [0, 1, 2].filter((k) => k !== kMax)
      const sommeAutres = nombres[a] + nombres[b]
      const pythagore = nombres[kMax] === sommeAutres
      const kEgal = [0, 1, 2].find((k) => egaux(k, (k + 1) % 3))
      const choisir = { label: 'Choisir', value: '' }

      // Longueurs, avec la simplification de la racine
      const longueurs = nombres.map((n) => {
        let k = 1
        for (let c = 2; c * c <= n; c++) if (n % (c * c) === 0) k = c
        const m = n / (k * k)
        if (m === 1) return { tex: `${k}`, k, m }
        return { tex: `${k === 1 ? '' : k}\\sqrt{${m}}`, k, m }
      })
      const reponsesLongueur = [0, 1, 2].map((k) => ({
        question: `$${nomCote[k]}=$ %{0}`,
        answer: { value: longueurs[k].tex, compare: all([isEqual()]) },
        field: { keyboard: KeyboardType.clavierFullOperations },
        correction:
          `$${nomCote[k]}^2=\\left| z_${nom[paires[k][1]]}-z_${nom[paires[k][0]]}\\right|^2=${dist[k].detail}=${nombres[k]}$ ` +
          `donc $${nomCote[k]}=${miseEnEvidence(longueurs[k].tex)}$.`,
      }))

      const cotes = nomCote
      const observation = [
        { latex: `${cotes[0]}=${cotes[1]}=${cotes[2]}`, value: 'e' },
        ...[0, 1, 2].map((k) => ({
          latex: `${cotes[k]}=${cotes[(k + 1) % 3]}\\neq ${cotes[(k + 2) % 3]}`,
          value: `p${k}`,
        })),
        {
          latex: `${cotes[0]}\\neq ${cotes[1]},\\ ${cotes[1]}\\neq ${cotes[2]},\\ ${cotes[2]}\\neq ${cotes[0]}`,
          value: 'd',
        },
      ]
      const valObservation = equilateral
        ? 'e'
        : kEgal !== undefined
          ? `p${kEgal}`
          : 'd'
      const texObservation = observation.find(
        (o) => o.value === valObservation,
      )!.latex

      const natureCourte = equilateral
        ? 'eq'
        : kEgal !== undefined
          ? 'iso'
          : 'sca'
      const libelleCourt: Record<string, string> = {
        eq: 'équilatéral',
        iso: 'isocèle non équilatéral',
        sca: 'ni isocèle ni équilatéral',
      }

      // Le sommet de l'angle droit est précisé dans les choix
      const choixFinals: [string, string][] = [
        ['iso', 'isocèle non rectangle'],
        ...nom.map((n, k): [string, string] => [
          `rect${k}`,
          `rectangle non isocèle en ${n}`,
        ]),
        ...nom.map((n, k): [string, string] => [
          `isorect${k}`,
          `isocèle rectangle en ${n}`,
        ]),
        ['quel', 'quelconque'],
      ]
      const valeurFinale =
        nature === 'Rectangle'
          ? `rect${kMax}`
          : nature === 'Isocèle rectangle'
            ? `isorect${kMax}`
            : 'iso'
      const libelleFinal = Object.fromEntries(choixFinals)
      const subQuestions: SubQuestion[] = [
        ...reponsesLongueur,
        {
          question: 'On observe que %{0}',
          answer: { value: valObservation },
          field: {
            choices: [
              choisir,
              ...observation.map(({ latex, value }) => ({ latex, value })),
            ],
          },
          correction: `On observe que $${miseEnEvidence(texObservation)}$.`,
        },
        {
          question: 'Le triangle est %{0}',
          answer: { value: natureCourte },
          field: {
            choices: [
              choisir,
              ...['eq', 'iso', 'sca'].map((v) => ({
                label: libelleCourt[v],
                value: v,
              })),
            ],
          },
          correction: equilateral
            ? `Les trois côtés ont la même longueur : le triangle $${nomTri}$ est ${texteEnCouleurEtGras('équilatéral')}.`
            : `Le triangle $${nomTri}$ est ${texteEnCouleurEtGras(libelleCourt[natureCourte])}.`,
        },
      ]
      if (!equilateral) {
        const côtéMax = nomCote[kMax]
        subQuestions.push(
          {
            question: `$${côtéMax}^2$ %{0} $${nomCote[a]}^2+${nomCote[b]}^2$`,
            answer: { value: pythagore ? 'eg' : 'ne' },
            field: {
              choices: [
                choisir,
                { latex: '=', value: 'eg' },
                { latex: '\\neq', value: 'ne' },
              ],
            },
            correction:
              `$${côtéMax}^2=${nombres[kMax]}$ et $${nomCote[a]}^2+${nomCote[b]}^2=${nombres[a]}+${nombres[b]}=${sommeAutres}$.<br>` +
              (pythagore
                ? `Donc $${miseEnEvidence(`${côtéMax}^2=${nomCote[a]}^2+${nomCote[b]}^2`)}$ : d'après la réciproque du théorème de Pythagore, le triangle est rectangle en $${nom[kMax]}$.`
                : `Donc $${miseEnEvidence(`${côtéMax}^2\\neq ${nomCote[a]}^2+${nomCote[b]}^2`)}$ : d'après la contraposée du théorème de Pythagore, le triangle n'est pas rectangle.`),
          },
          {
            question: 'Le triangle est %{0}',
            answer: { value: valeurFinale },
            field: {
              choices: [
                choisir,
                ...choixFinals.map(([value, label]) => ({ label, value })),
              ],
            },
            correction: `Le triangle $${nomTri}$ est ${texteEnCouleurEtGras(libelleFinal[valeurFinale])}.`,
          },
        )
      }

      const enonce =
        `Dans le plan complexe, on considère les points $${nA}$, $${nB}$ et $${nC}$ d'affixes respectives ` +
        `$z_${nA}=${texAffixe(A)}$, $z_${nB}=${texAffixe(B)}$ et $z_${nC}=${texAffixe(C)}$.<br>` +
        `Déterminer la nature du triangle $${nomTri}$.`
      if (this.interactif) {
        // Un seul champ par ligne, sans repères a), b)… : les lignes se suivent
        const reponses: Record<string, AnswerType> = {}
        const dataOptions: Record<string, FieldOptions> = {}
        const lignes = subQuestions.map(({ question, answer, field }, k) => {
          reponses[`field${k}`] = answer as AnswerType
          dataOptions[`field${k}`] = (field ?? {}) as FieldOptions
          return question.replace('%{0}', `%{field${k}}`)
        })
        this.listeQuestions[i] =
          enonce +
          '<br>' +
          addMultiMathfield(this, i, {
            dataTemplate: lignes.join('<br>'),
            dataOptions,
          })
        this.listeCorrections[i] =
          figure(true) +
          '<br>' +
          subQuestions.map((s) => s.correction).join('<br>')
        handleAnswers(
          this,
          i,
          { ...reponses, bareme: troisPointsProportionnels },
          { formatInteractif: 'multi-mathfield' },
        )
      } else {
        // Hors interactivité, la question reste simple : pas de sous-questions a), b)…
        createQuestion(this, i, {
          question: enonce,
          correction: `${subQuestions.map((s) => s.correction).join('<br>')}<br>${figure(true)}`,
        })
      }
      i++
    }
    listeQuestionsToContenu(this)
  }
}
