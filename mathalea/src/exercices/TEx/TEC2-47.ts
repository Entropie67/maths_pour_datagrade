import { seq, sameTrigonometricForm } from '../../lib/interactif/checks'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import {
  ajouteChampTexteMathLive,
  remplisLesBlancs,
} from '../../lib/interactif/questionMathLive'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { pgcd } from '../../lib/outils/primalite'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Reconnaître et écrire la forme trigonométrique'
export const interactifReady = true
export const interactifType = 'mathLive'
export const dateDePublication = '31/10/2026'
export const uuid = 'af3a0'
export const refs = {
  'fr-fr': ['TEC2-47'],
  'fr-ch': [],
}

/** Angle exprimé en multiple rationnel de π : `[n, d]` désigne nπ/d. */
type Angle = [number, number]

/** Écriture LaTeX de nπ/d, simplifiée. */
function texAngle([n, d]: Angle): string {
  if (n === 0) return '0'
  const g = pgcd(Math.abs(n), d)
  const num = n / g
  const den = d / g
  const signe = num < 0 ? '-' : ''
  const absNum = Math.abs(num)
  const pi = absNum === 1 ? '\\pi' : `${absNum}\\pi`
  return den === 1 ? `${signe}${pi}` : `${signe}\\dfrac{${pi}}{${den}}`
}

/** Ramène nπ/d dans l'intervalle ]-π ; π]. */
function argumentPrincipal([n, d]: Angle): Angle {
  let m = n
  while (m > d) m -= 2 * d
  while (m <= -d) m += 2 * d
  return [m, d]
}

/** Ramène nπ/d dans l'intervalle [0 ; 2π[. */
function argumentZeroDeuxPi([n, d]: Angle): Angle {
  let m = n
  while (m < 0) m += 2 * d
  while (m >= 2 * d) m -= 2 * d
  return [m, d]
}

const opp = ([n, d]: Angle): Angle => [-n, d]
const piMoins = ([n, d]: Angle): Angle => [d - n, d]

type Ecriture = {
  /** Écriture de z proposée dans l'énoncé. */
  z: string
  /** Module de la forme trigonométrique. */
  module: number
  /** Argument de la forme trigonométrique, dans ]-π ; π]. */
  argument: Angle
  /** Explication de la transformation, sans la conclusion. */
  explication: string
  /** L'écriture de l'énoncé est-elle déjà trigonométrique ? */
  dejaTrigo: boolean
}

/** Facteur devant la parenthèse (le 1 n'est pas écrit). */
function facteur(r: number, negatif: boolean): string {
  return `${negatif ? '-' : ''}${r === 1 ? '' : r}`
}

/**
 * Construit une écriture de z à partir du module r > 0 et d'un angle aigu θ.
 * Le type choisit la forme du piège.
 */
function construit(type: string, r: number, theta: Angle): Ecriture {
  const t = texAngle(theta)
  const mt = texAngle(opp(theta))
  const pt = texAngle(piMoins(theta))
  const cos = (a: string) => `\\cos\\left(${a}\\right)`
  const sin = (a: string) => `\\sin\\left(${a}\\right)`
  const parenthese = (c: string, s: string, signe: '+' | '-') =>
    `\\left(${c}${signe}\\mathrm{i}${s}\\right)`
  const base = (
    negatif: boolean,
    c: string,
    s: string,
    signe: '+' | '-',
    argument: Angle,
    explication: string,
    dejaTrigo = false,
  ): Ecriture => ({
    z: `${facteur(r, negatif)}${parenthese(cos(c), sin(s), signe)}`,
    module: r,
    argument: argumentPrincipal(argument),
    explication,
    dejaTrigo,
  })
  switch (type) {
    case 'direct':
      return base(
        false,
        t,
        t,
        '+',
        theta,
        `Le module $${r}$ est strictement positif et les arguments de $\\cos$ et de $\\sin$ sont égaux : cette écriture est déjà trigonométrique.`,
        true,
      )
    case 'directNegatif': {
      const th: Angle = opp(theta)
      return base(
        false,
        mt,
        mt,
        '+',
        th,
        `Le module $${r}$ est strictement positif et les arguments de $\\cos$ et de $\\sin$ sont égaux : cette écriture est déjà trigonométrique.`,
        true,
      )
    }
    case 'facteurNegatif':
      return base(
        true,
        t,
        t,
        '+',
        [theta[0] - theta[1], theta[1]],
        `Le facteur $-${r === 1 ? '1' : r}$ est négatif : ce n'est pas un module. Comme $-1=\\cos(\\pi)$ et que multiplier par $-1$ ajoute $\\pi$ à l'argument, on a $\\arg(z)=${t}+\\pi$ à $2\\pi$ près, soit $${texAngle([theta[0] - theta[1], theta[1]])}$.`,
      )
    case 'facteurNegatifMoins':
      return base(
        true,
        t,
        t,
        '-',
        piMoins(theta),
        `Le facteur $-${r === 1 ? '1' : r}$ est négatif, et le signe $-$ devant le sinus montre que $${r}\\left(\\cos\\left(${t}\\right)-\\mathrm{i}\\sin\\left(${t}\\right)\\right)=${r}\\left(\\cos\\left(${mt}\\right)+\\mathrm{i}\\sin\\left(${mt}\\right)\\right)$. Multiplier par $-1$ ajoute $\\pi$ à l'argument : $-${t}+\\pi=${pt}$.`,
      )
    case 'moinsSin':
      return base(
        false,
        t,
        t,
        '-',
        opp(theta),
        `Comme $\\cos(\\theta)=\\cos(-\\theta)$ et $-\\sin(\\theta)=\\sin(-\\theta)$, on a $\\cos\\left(${t}\\right)-\\mathrm{i}\\sin\\left(${t}\\right)=\\cos\\left(${mt}\\right)+\\mathrm{i}\\sin\\left(${mt}\\right)$.`,
      )
    case 'opposesCosPaire':
      return base(
        false,
        mt,
        t,
        '+',
        theta,
        `Comme $\\cos(-\\theta)=\\cos(\\theta)$, on a $\\cos\\left(${mt}\\right)=\\cos\\left(${t}\\right)$ : les arguments deviennent égaux.`,
      )
    case 'opposesSinImpair':
      return base(
        false,
        t,
        mt,
        '+',
        opp(theta),
        `Comme $\\sin(-\\theta)=-\\sin(\\theta)$, on a $\\mathrm{i}\\sin\\left(${mt}\\right)=-\\mathrm{i}\\sin\\left(${t}\\right)$ : on reconnaît $\\cos(\\theta)-\\mathrm{i}\\sin(\\theta)$, soit $\\cos\\left(${mt}\\right)+\\mathrm{i}\\sin\\left(${mt}\\right)$.`,
      )
    case 'opposesMoins':
      return base(
        false,
        mt,
        mt,
        '-',
        theta,
        `Comme $\\cos(-\\theta)=\\cos(\\theta)$ et $\\sin(-\\theta)=-\\sin(\\theta)$, on a $\\cos\\left(${mt}\\right)-\\mathrm{i}\\sin\\left(${mt}\\right)=\\cos\\left(${t}\\right)+\\mathrm{i}\\sin\\left(${t}\\right)$.`,
      )
    case 'horsPrincipal': {
      const phi: Angle = choice([
        [theta[0] + theta[1], theta[1]],
        [theta[0] + 2 * theta[1], theta[1]],
        [-theta[0] - theta[1], theta[1]],
      ])
      const p = texAngle(phi)
      return base(
        false,
        p,
        p,
        '+',
        phi,
        `Les arguments de $\\cos$ et de $\\sin$ sont égaux et le module $${r}$ est positif : l'écriture est trigonométrique, mais l'argument $${p}$ n'est pas dans l'intervalle demandé. On lui ajoute ou on lui retire un multiple de $2\\pi$.`,
        true,
      )
    }
    case 'sinSupplementaire':
      return base(
        false,
        t,
        pt,
        '+',
        theta,
        `Comme $\\sin(\\pi-\\theta)=\\sin(\\theta)$, on a $\\sin\\left(${pt}\\right)=\\sin\\left(${t}\\right)$ : les arguments deviennent égaux.`,
      )
    case 'cosSupplementaire':
      return base(
        false,
        pt,
        t,
        '+',
        piMoins(theta),
        `Comme $\\sin(\\pi-\\theta)=\\sin(\\theta)$, on a $\\sin\\left(${t}\\right)=\\sin\\left(${pt}\\right)$ : les arguments deviennent égaux.`,
      )
    case 'sinPlusPi':
      return base(
        false,
        t,
        texAngle([theta[0] + theta[1], theta[1]]),
        '+',
        opp(theta),
        `Comme $\\sin(\\theta+\\pi)=-\\sin(\\theta)$, on a $\\sin\\left(${texAngle([theta[0] + theta[1], theta[1]])}\\right)=-\\sin\\left(${t}\\right)=\\sin\\left(${mt}\\right)$, et $\\cos\\left(${t}\\right)=\\cos\\left(${mt}\\right)$ : les arguments deviennent égaux.`,
      )
    case 'cosPlusPi':
      return base(
        false,
        texAngle([theta[0] + theta[1], theta[1]]),
        t,
        '+',
        piMoins(theta),
        `Comme $\\cos(\\theta+\\pi)=-\\cos(\\theta)=\\cos(\\pi-\\theta)$, on a $\\cos\\left(${texAngle([theta[0] + theta[1], theta[1]])}\\right)=\\cos\\left(${pt}\\right)$, et $\\sin\\left(${t}\\right)=\\sin\\left(${pt}\\right)$ : les arguments deviennent égaux.`,
      )
    case 'moinsCos':
      return {
        z: `${facteur(r, false)}\\left(-\\cos\\left(${t}\\right)+\\mathrm{i}\\sin\\left(${t}\\right)\\right)`,
        module: r,
        argument: piMoins(theta),
        explication: `Comme $\\cos(\\pi-\\theta)=-\\cos(\\theta)$ et $\\sin(\\pi-\\theta)=\\sin(\\theta)$, on a $-\\cos\\left(${t}\\right)+\\mathrm{i}\\sin\\left(${t}\\right)=\\cos\\left(${pt}\\right)+\\mathrm{i}\\sin\\left(${pt}\\right)$.`,
        dejaTrigo: false,
      }
    default: // 'moinsCosMoinsSin'
      return {
        z: `${facteur(r, false)}\\left(-\\cos\\left(${t}\\right)-\\mathrm{i}\\sin\\left(${t}\\right)\\right)`,
        module: r,
        argument: argumentPrincipal([theta[0] - theta[1], theta[1]]),
        explication: `Comme $\\cos(\\theta-\\pi)=-\\cos(\\theta)$ et $\\sin(\\theta-\\pi)=-\\sin(\\theta)$, on a $-\\cos\\left(${t}\\right)-\\mathrm{i}\\sin\\left(${t}\\right)=\\cos\\left(${texAngle([theta[0] - theta[1], theta[1]])}\\right)+\\mathrm{i}\\sin\\left(${texAngle([theta[0] - theta[1], theta[1]])}\\right)$.`,
        dejaTrigo: false,
      }
  }
}

// Familles de pièges, selon la valeur de `sup`
const famillesDeTypes: Record<number, string[]> = {
  1: ['direct', 'directNegatif'],
  2: ['facteurNegatif', 'facteurNegatifMoins'],
  3: ['moinsSin', 'opposesCosPaire', 'opposesSinImpair', 'opposesMoins'],
  4: [
    'moinsCos',
    'moinsCosMoinsSin',
    'sinSupplementaire',
    'cosSupplementaire',
    'sinPlusPi',
    'cosPlusPi',
  ],
  5: ['horsPrincipal'],
}

const anglesAigus: Angle[] = [
  [1, 6],
  [1, 4],
  [1, 3],
]

/**
 * Reconnaître si un nombre complexe est écrit sous forme trigonométrique et, sinon, l'écrire sous cette forme.
 * @author Stéphane Guyon
 */
export default class ReconnaitreFormeTrigonometrique extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 5
    this.besoinFormulaireNumerique = [
      'Type de formulaire pour la réponse en interactif',
      2,
      '1 : Formulaire pré-rempli\n2 : Formulaire vierge',
    ]
    this.sup = 1
    this.besoinFormulaire2Texte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets  :',
        '1 : Écriture déjà trigonométrique',
        '2 : Facteur négatif',
        '3 : Arguments opposés ou signe moins devant le sinus',
        '4 : Signe moins devant le cosinus ou arguments différents dans cos et sin',
        "5 : Argument hors de l'intervalle demandé",
        '6 : Mélange',
      ].join('\n'),
    ]
    this.sup2 = '6'
    this.besoinFormulaire3Numerique = [
      "Intervalle pour l'argument",
      2,
      '1 : ]-π ; π]\n2 : [0 ; 2π[',
    ]
    this.sup3 = 1
  }

  nouvelleVersion() {
    const saisieComplete = Number(this.sup) === 2
    const zeroDeuxPi = Number(this.sup3) === 2
    const intervalle = zeroDeuxPi
      ? '$\\left[0\\,;\\,2\\pi\\right[$'
      : '$]-\\pi\\,;\\,\\pi]$'
    this.consigne =
      this.nbQuestions === 1
        ? `Le nombre complexe suivant est-il écrit sous forme trigonométrique avec un argument dans ${intervalle} ? Si ce n'est pas le cas, l'écrire sous cette forme.`
        : `Les nombres complexes suivants sont-ils écrits sous forme trigonométrique avec un argument dans ${intervalle} ? Si ce n'est pas le cas, les écrire sous cette forme.`
    const types = combinaisonListes(
      gestionnaireFormulaireTexte({
        saisie: this.sup2,
        max: 5,
        melange: 6,
        defaut: 6,
        nbQuestions: this.nbQuestions,
      }) as number[],
      this.nbQuestions,
    )
    const forme = (r: number, arg: string) =>
      `${r}\\left(\\cos\\left(${arg}\\right)+\\mathrm{i}\\sin\\left(${arg}\\right)\\right)`

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const type = choice(famillesDeTypes[types[i]])
      const r = randint(1, 6)
      const theta = choice(anglesAigus)
      if (!this.questionJamaisPosee(i, type, r, theta[1])) continue
      const e = construit(type, r, theta)
      const nom = this.nbQuestions === 1 ? 'z' : `z_${i + 1}`
      const arg = texAngle(
        zeroDeuxPi ? argumentZeroDeuxPi(e.argument) : e.argument,
      )
      const attendu = forme(e.module, arg)
      let texte = `$${nom}=${e.z}$`
      if (this.interactif) {
        if (saisieComplete) {
          texte += ajouteChampTexteMathLive(this, i, KeyboardType.complexes, {
            texteAvant: `<br>$${nom}=$`,
          })
        } else {
          texte += `<br>${remplisLesBlancs(
            this,
            i,
            `${nom}=%{champ1}\\left(\\cos\\left(%{champ2}\\right)+\\mathrm{i}\\sin\\left(%{champ3}\\right)\\right)`,
            KeyboardType.complexes,
          )}`
        }
      }
      if (saisieComplete) {
        handleAnswers(this, i, {
          reponse: { value: attendu, compare: seq([sameTrigonometricForm()]) },
        })
      } else {
        handleAnswers(
          this,
          i,
          {
            // Le module 1 peut ne pas être écrit : un champ vide est alors accepté.
            champ1: { value: e.module === 1 ? ['1', ''] : String(e.module) },
            champ2: { value: arg },
            champ3: { value: arg },
          },
          { formatInteractif: 'fill-in-the-blank' },
        )
      }
      this.listeQuestions[i] = texte
      this.listeCorrections[i] =
        `${e.explication}<br>${zeroDeuxPi || type === 'horsPrincipal' ? `Avec un argument dans ${intervalle}, on retient $${arg}$.<br>` : ''}Donc $${nom}=${miseEnEvidence(attendu)}$.`
      i++
    }
    listeQuestionsToContenu(this)
  }
}
