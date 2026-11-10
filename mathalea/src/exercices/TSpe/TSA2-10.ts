import { courbe } from '../../lib/2d/Courbe'
import { repere } from '../../lib/2d/reperes'
import { latex2d } from '../../lib/2d/textes'
import { bleuMathalea } from '../../lib/colors'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = 'be12d'
export const refs = {
  'fr-fr': ['TSA2-10', 'TCA2-10'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Conjecturer des limites à partir d’une courbe'
export const dateDePublication = '06/08/2026'

type Limite = number | '+inf' | '-inf' | 'pas'
type ValeurLimite = Exclude<Limite, 'pas'>
type CoupleLimites = [Limite, Limite]

type Situation = {
  fonction: (x: number) => number
  limites: CoupleLimites
}

/**
 * @author Stéphane Guyon
 */
export default class ConjecturerLimitesGraphiquement extends ExerciceQcmA {
  private typesDeQuestions: number[] = []

  private limiteTex(limite: ValeurLimite): string {
    if (limite === '+inf') return '+\\infty'
    if (limite === '-inf') return '-\\infty'
    return `${limite}`
  }

  private expressionLimiteTex(
    sens: '-' | '+',
    limite: Limite,
    miseEnValeur = false,
  ): string {
    const expression = `\\displaystyle \\lim_{x\\to${sens}\\infty}f(x)`
    if (limite === 'pas') return `$${expression}$ n'existe pas`
    const valeur = this.limiteTex(limite)
    return `$${expression}=${miseEnValeur ? miseEnEvidence(valeur) : valeur}$`
  }

  private propositionTex([limiteMoins, limitePlus]: CoupleLimites): string {
    return `${this.expressionLimiteTex('-', limiteMoins)} et ${this.expressionLimiteTex('+', limitePlus)}`
  }

  private construireSituation(type: number): Situation {
    const constante = choice([-3, -2, -1, 1, 2, 3])
    const signe = choice([-1, 1])

    switch (type) {
      case 0: {
        const limiteGauche = constante
        const limiteDroite = constante + choice([-3, -2, 2, 3])
        const milieu = (limiteGauche + limiteDroite) / 2
        const demiEcart = (limiteDroite - limiteGauche) / 2
        return {
          fonction: (x) => milieu + demiEcart * Math.tanh(x / 2),
          limites: [limiteGauche, limiteDroite],
        }
      }
      case 1:
        return {
          fonction: (x) => constante + 2 / (x * x + 1),
          limites: [constante, constante],
        }
      case 2:
        return {
          fonction: (x) => signe * 0.8 * x + constante / 2,
          limites: signe > 0 ? ['-inf', '+inf'] : ['+inf', '-inf'],
        }
      case 3:
        return {
          fonction: (x) => signe * (x / 2.5) ** 2 + constante / 2,
          limites: signe > 0 ? ['+inf', '+inf'] : ['-inf', '-inf'],
        }
      case 4:
        return {
          fonction: (x) => constante + signe * Math.exp(x / 2),
          limites: [constante, signe > 0 ? '+inf' : '-inf'],
        }
      case 5:
        return {
          fonction: (x) => constante + signe * Math.exp(-x / 2),
          limites: [signe > 0 ? '+inf' : '-inf', constante],
        }
      case 6:
        return {
          fonction: (x) => constante + 2 * Math.sin(x),
          limites: ['pas', 'pas'],
        }
      case 7:
        return {
          fonction: (x) =>
            constante + (2 * Math.sin(2 * x)) / (1 + Math.exp(-x)),
          limites: [constante, 'pas'],
        }
      case 8:
        return {
          fonction: (x) =>
            constante + (2 * Math.sin(2 * x)) / (1 + Math.exp(x)),
          limites: ['pas', constante],
        }
      default:
        return {
          fonction: (x) => signe * (x / 2.2) ** 3 + constante / 2,
          limites: signe > 0 ? ['-inf', '+inf'] : ['+inf', '-inf'],
        }
    }
  }

  private appliquerLesValeurs(type: number): void {
    const situation = this.construireSituation(type)
    const r = repere({
      xMin: -8,
      xMax: 8,
      yMin: -6,
      yMax: 6,
      xThickDistance: 1,
      yThickDistance: 1,
      grilleXDistance: 1,
      grilleYDistance: 1,
    })
    const c = courbe(situation.fonction, {
      repere: r,
      xMin: -8,
      xMax: 8,
      yMin: -6,
      yMax: 6,
      step: 0.05,
      color: bleuMathalea,
      epaisseur: 2,
    })
    const nomCourbe = latex2d('\\mathcal C_f', 6.8, 5.3, {
      color: bleuMathalea,
      letterSize: 'normalsize',
    })
    const figure = mathalea2d(
      {
        xmin: -8.8,
        xmax: 8.8,
        ymin: -6.8,
        ymax: 6.8,
        pixelsParCm: 25,
        scale: 0.65,
        center: !context.isHtml,
      },
      r,
      c,
      nomCourbe,
    )

    const [limiteGauche, limiteDroite] = situation.limites
    const candidats: CoupleLimites[] = [
      [limiteDroite, limiteGauche],
      ['+inf', '+inf'],
      ['-inf', '-inf'],
      ['-inf', '+inf'],
      ['+inf', '-inf'],
      ['pas', 'pas'],
      [0, 0],
      [limiteGauche, 'pas'],
      ['pas', limiteDroite],
    ]
    const reponses = [this.propositionTex(situation.limites)]
    for (const candidat of candidats) {
      const proposition = this.propositionTex(candidat)
      if (!reponses.includes(proposition)) reponses.push(proposition)
      if (reponses.length === 4) break
    }
    this.reponses = reponses

    const propositionsTypst = context.isTypst
      ? `<br><br>${reponses
          .map(
            (proposition, index) =>
              `${String.fromCharCode(65 + index)}. ${proposition}`,
          )
          .join('<br><br>')}`
      : ''
    this.enonce = `On a représenté ci-dessous la courbe $\\mathcal C_f$ d'une fonction $f$ définie sur $\\mathbb R$.<br>
      ${figure}<br>
      À l'aide de cette représentation graphique, conjecturer les limites de $f$ en $-\\infty$ et en $+\\infty$.${propositionsTypst}`

    const conclusionGauche =
      limiteGauche === 'pas'
        ? `Lorsque $x$ prend des valeurs négatives de plus en plus grandes en valeur absolue, la courbe continue d'osciller : $f$ n'admet pas de limite en $-\\infty$.`
        : `Lorsque $x$ tend vers $-\\infty$, la courbe suggère que $f(x)$ tend vers $${this.limiteTex(limiteGauche)}$.`
    const conclusionDroite =
      limiteDroite === 'pas'
        ? `Lorsque $x$ prend des valeurs positives de plus en plus grandes, la courbe continue d'osciller : $f$ n'admet pas de limite en $+\\infty$.`
        : `Lorsque $x$ tend vers $+\\infty$, la courbe suggère que $f(x)$ tend vers $${this.limiteTex(limiteDroite)}$.`
    this.correction = `${conclusionGauche}<br>${conclusionDroite}<br>
      On conjecture donc :<br>
      ${this.expressionLimiteTex('-', limiteGauche, true)} et
      ${this.expressionLimiteTex('+', limiteDroite, true)}.`
  }

  versionAleatoire: () => void = () => {
    const type = this.typesDeQuestions.shift() ?? randint(0, 9)
    this.appliquerLesValeurs(type)
  }

  nouvelleVersion(): void {
    const typesDisponibles = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    this.typesDeQuestions = combinaisonListes(
      typesDisponibles,
      this.nbQuestions,
    )
    for (let index = 1; index < this.nbQuestions; index++) {
      if (this.typesDeQuestions[index] === this.typesDeQuestions[index - 1]) {
        const indexEchange = this.typesDeQuestions.findIndex(
          (type, autreIndex) =>
            autreIndex > index && type !== this.typesDeQuestions[index - 1],
        )
        if (indexEchange >= 0) {
          const typeActuel = this.typesDeQuestions[index]
          this.typesDeQuestions[index] = this.typesDeQuestions[indexEchange]
          this.typesDeQuestions[indexEchange] = typeActuel
        } else {
          this.typesDeQuestions[index] = choice(
            typesDisponibles.filter(
              (type) => type !== this.typesDeQuestions[index - 1],
            ),
          )
        }
      }
    }
    super.nouvelleVersion()
  }

  constructor() {
    super()
    this.options.ordered = context.isTypst
    this.options.vertical = true

    this.versionAleatoire()
  }
}
