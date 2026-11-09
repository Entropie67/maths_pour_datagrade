import { courbe } from '../../lib/2d/Courbe'
import { repere } from '../../lib/2d/reperes'
import { latex2d } from '../../lib/2d/textes'
import { bleuMathalea } from '../../lib/colors'
import { deuxColonnes } from '../../lib/format/miseEnPage'
import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { toutPourUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'
import { sp } from '../../lib/outils/outilString'
export const dateDePublication = '28/07/2025'
export const dateDeModifImportante = '21/10/2026'
export const uuid = '8fa9b'

export const refs = {
  'fr-fr': ['1A-F02-13'],
  'fr-ch': ['1mQCM-40'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Reconnaître une parabole (forme canonique)'
const choixSignes = [
  { label: 'Choisir…', value: '' },
  { label: 'strictement positif', value: '+' },
  { label: 'strictement négatif', value: '-' },
]
// a est non nul (parabole) ; les autres nombres pourraient l'être.
const choixSignesOuNul = [...choixSignes, { label: 'nul', value: '0' }]

export default class AutoF2e extends ExerciceQcmA {
  // Pour la question ouverte : expression de f et signe des nombres demandés.
  private forme = ''
  private signes: { nom: string; positif: boolean }[] = []
  private questionsOuvertes = new Map<
    string,
    { correction: string; signes: { nom: string; positif: boolean }[] }
  >()

  private creerRepere(xMin: number, xMax: number, yMin: number, yMax: number) {
    const o = latex2d('\\text{O}', -0.2, -0.3, { letterSize: 'scriptsize' })
    const r = repere({
      xMin,
      yMin,
      yMax,
      xMax,
      grille: false,
      xThickListe: [0],
      yThickListe: [0],
      xLabelListe: [-6],
      yLabelListe: [-6],
      axeXStyle: '->',
      axeYStyle: '->',
    })
    return { o, r }
  }

  private creerEnonce(
    xMin: number,
    xMax: number,
    yMin: number,
    yMax: number,
    F: (x: number) => number,
  ) {
    const { o, r } = this.creerRepere(xMin, xMax, yMin, yMax)

    const texte = `On a représenté ci-contre une parabole $\\mathscr{P}$.<br><br>
       Une seule des quatre fonctions ci-dessous est susceptible d'être représentée par la parabole $\\mathscr{P}$. <br><br>
       ${this.interactif ? 'La fonction représentée par la parabole $\\mathscr{P}$ est :' : 'Laquelle ?'}`
    const figure = mathalea2d(
      {
        xmin: xMin,
        xmax: xMax,
        ymin: yMin,
        ymax: yMax,
        pixelsParCm: 25,
        scale: 0.65,
        center: !context.isHtml,
      },
      r,
      o,
      courbe(F, { repere: r, color: bleuMathalea, epaisseur: 2 }),
    )
    // En question ouverte, la figure est placée sous la première phrase.
    if (!this.sup3 && !context.isAmc) {
      const fin = texte.indexOf('<br><br>')
      const intro = texte.slice(0, fin)
      const suite = texte.slice(fin + '<br><br>'.length)
      return `${intro.replace('ci-contre', 'ci-dessous')}<br>${figure}<br>${suite}`
    }
    return `${deuxColonnes(texte, figure)}<br>`
  }

  private casFormeSimple(
    a: number,
    b: number,
    orientationHaut: boolean,
    ordonneePositive: boolean,
  ) {
    const F = (x: number) => a * x ** 2 + (ordonneePositive ? b : -b)
    this.forme = 'ax^2+b'
    this.signes = [
      { nom: 'a', positif: orientationHaut },
      { nom: 'b', positif: ordonneePositive },
    ]

    this.enonce = this.creerEnonce(-5, 5, -4, 3, F)

    this.correction = `Les paraboles proposées ont des équations de la forme $y=ax^2+b$.<br>
      La parabole $\\mathscr{P}$ a «${sp()}les bras${sp()}» tournés vers ${orientationHaut ? 'le haut' : 'le bas'}, on en déduit que $a ${orientationHaut ? '>' : '<'} 0$. <br>
      De plus, son sommet a une ordonnée ${ordonneePositive ? 'positive' : 'négative'}, donc $b ${ordonneePositive ? '>' : '<'} 0$.<br>
      On en déduit que la seule fonction susceptible de représenter $\\mathscr{P}$ est : $${miseEnEvidence(`x\\longmapsto ${texNombre(a)}x^2${ordonneePositive ? '+' : '-'}${b}`)}$.`

    this.reponses = [
      `$x\\longmapsto ${texNombre(a)}x^2${ordonneePositive ? '+' : '-'}${b}$`,
      `$x\\longmapsto ${texNombre(a)}x^2${ordonneePositive ? '-' : '+'}${b}$`,
      `$x\\longmapsto${texNombre(-a)}x^2${ordonneePositive ? '+' : '-'}${b}$`,
      `$x\\longmapsto${texNombre(-a)}x^2${ordonneePositive ? '-' : '+'}${b}$`,
    ]
  }

  private casFormeCanonique(
    a: number,
    alpha: number,
    b: number,
    orientationHaut: boolean,
    alphaPositif: boolean,
    betaPositif: boolean,
    xMin: number,
    xMax: number,
    yMin: number,
    yMax: number,
    fonction: (x: number) => number,
  ) {
    this.enonce = this.creerEnonce(xMin, xMax, yMin, yMax, fonction)
    this.forme = 'a(x-\\alpha)^2+\\beta'
    this.signes = [
      { nom: 'a', positif: orientationHaut },
      { nom: '\\alpha', positif: alphaPositif },
    ]

    this.correction = `Les paraboles proposées ont des équations de la forme $y=a(x-\\alpha)^2+\\beta$.<br>
      Le sommet de la parabole a pour coordonnées $(\\alpha\\, ;\\, \\beta)$.<br>
      La parabole $\\mathscr{P}$ a «${sp()}les bras${sp()}» tournés vers ${orientationHaut ? 'le haut' : 'le bas'}, on en déduit que $a ${orientationHaut ? '>' : '<'} 0$. <br>
      De plus, son sommet a une abscisse ${alphaPositif ? 'positive' : 'négative'} et une ordonnée ${betaPositif ? 'positive' : 'négative'}, donc $\\alpha ${alphaPositif ? '>' : '<'} 0$ et $\\beta ${betaPositif ? '>' : '<'} 0$.<br>
      On en déduit que la seule fonction susceptible de représenter $\\mathscr{P}$ est : $${miseEnEvidence(`x\\longmapsto ${texNombre(a)}(x${alphaPositif ? '-' : '+'}${alpha})^2${betaPositif ? '+' : '-'}${b}`)}$.`

    this.reponses = [
      `$x\\longmapsto ${texNombre(a)}(x${alphaPositif ? '-' : '+'}${alpha})^2${betaPositif ? '+' : '-'}${b}$`,
      `$x\\longmapsto ${texNombre(a)}(x${alphaPositif ? '+' : '-'}${alpha})^2${betaPositif ? '+' : '-'}${b}$`,
      `$x\\longmapsto${texNombre(-a)}(x${alphaPositif ? '+' : '-'}${alpha})^2${betaPositif ? '+' : '-'}${b}$`,
      `$x\\longmapsto${texNombre(-a)}(x${alphaPositif ? '-' : '+'}${alpha})^2${betaPositif ? '+' : '-'}${b}$`,
    ]
  }

  versionOriginale: () => void = () => {
    const F = (x: number) => -0.5 * x ** 2 + 3

    this.enonce = this.creerEnonce(-5, 5, -1.5, 4, F)
    this.forme = 'ax^2+b'
    this.signes = [
      { nom: 'a', positif: false },
      { nom: 'b', positif: true },
    ]

    this.correction = `Les paraboles proposées ont des équations de la forme $y=ax^2+b$.<br>
      La parabole $\\mathscr{P}$ a «${sp()}les bras${sp()}» tournés vers le bas, on en déduit que $a < 0$. <br>
      De plus, son sommet a une ordonnée positive ($10$).<br>
      On en déduit que la seule fonction susceptible de représenter $\\mathscr{P}$ est : $${miseEnEvidence(`x\\longmapsto -x^2+10`)}$.`

    this.reponses = [
      '$x\\longmapsto -x^2+10$',
      '$x\\longmapsto -x^2-10$',
      '$x\\longmapsto x^2+10$',
      '$x\\longmapsto x^2-10$',
    ]
  }

  versionAleatoire = () => {
    const cas = randint(1, 8)
    const a = randint(3, 8, 5) / 5
    const b = randint(2, 4)
    const alpha = randint(2, 5)

    switch (cas) {
      case 1: // a>0, b<0 (forme simple)
        this.casFormeSimple(a, b, true, false)
        break

      case 2: // a>0, alpha>0, beta<0
        this.casFormeCanonique(
          a,
          alpha,
          b,
          true,
          true,
          false,
          -2,
          5,
          -3,
          3,
          (x: number) => (x - 2) ** 2 - 2,
        )
        break

      case 3: // a>0, alpha>0, beta>0
        this.casFormeCanonique(
          a,
          alpha,
          b,
          true,
          true,
          true,
          -2,
          5,
          -1,
          5,
          (x: number) => (x - 2) ** 2 + 2,
        )
        break

      case 4: // a>0, alpha<0, beta<0
        this.casFormeCanonique(
          a,
          alpha,
          b,
          true,
          false,
          false,
          -5,
          2,
          -3,
          3,
          (x: number) => (x + 2) ** 2 - 2,
        )
        break

      case 5: // a>0, alpha<0, beta>0
        this.casFormeCanonique(
          a,
          alpha,
          b,
          true,
          false,
          true,
          -5,
          2,
          -1,
          5,
          (x: number) => (x + 2) ** 2 + 2,
        )
        break

      case 6: // a<0, alpha>0, beta>0
        this.casFormeCanonique(
          -a,
          alpha,
          b,
          false,
          true,
          true,
          -2,
          5,
          -3,
          5,
          (x: number) => -1 * (x - 2) ** 2 + 3,
        )
        break

      case 7: // a<0, alpha>0, beta<0
        this.casFormeCanonique(
          -a,
          alpha,
          b,
          false,
          true,
          false,
          -2,
          5,
          -5,
          1,
          (x: number) => -1 * (x - 2) ** 2 - 1,
        )
        break

      case 8: // a<0, alpha<0, beta>0
        this.casFormeCanonique(
          -a,
          alpha,
          b,
          false,
          false,
          true,
          -5,
          2,
          -3,
          5,
          (x: number) => -1 * (x + 2) ** 2 + 3,
        )
        break
    }
  }

  nouvelleVersion() {
    this.questionsOuvertes.clear()
    super.nouvelleVersion()
    if (this.sup3 || context.isAmc) return
    this.consigne = ''
    for (let i = 0; i < this.listeQuestions.length; i++) {
      const enonce = this.autoCorrection[i].enonce ?? ''
      const donnees = this.questionsOuvertes.get(enonce)
      if (!donnees) continue
      const [premier, second] = donnees.signes
      this.listeQuestions[i] = this.interactif
        ? enonce.replace(
            /Déterminer le signe de .*? et celui de .*?\./,
            addMultiMathfield(this, i, {
              dataTemplate: `Le nombre $${premier.nom}$ est %{field0} et le nombre $${second.nom}$ est %{field1}.`,
              dataOptions: {
                field0: { choices: choixSignes },
                field1: { choices: choixSignesOuNul },
              },
            }),
          )
        : enonce
      this.listeCorrections[i] = donnees.correction
      handleAnswers(
        this,
        i,
        {
          bareme: toutPourUnPoint,
          field0: { value: premier.positif ? '+' : '-' },
          field1: { value: second.positif ? '+' : '-' },
        },
        { formatInteractif: 'multi-mathfield' },
      )
    }
  }

  constructor() {
    super()
    this.sup3 = false
    this.besoinFormulaire3CaseACocher = ['Version QCM', false]
    const preparerQuestion = () => {
      if (this.sup3 || context.isAmc) return
      const [premier, second] = this.signes
      this.enonce = this.enonce.replace(
        /Une seule des quatre fonctions[\s\S]*?(?:Laquelle \?|La fonction représentée par la parabole \$\\mathscr\{P\}\$ est :)/,
        `$\\mathscr{P}$ est la courbe représentative d'une fonction $f$ définie sur $\\mathbb{R}$ par $f(x)=${this.forme}$.<br><br>
       Déterminer le signe de $${premier.nom}$ et celui de $${second.nom}$.`,
      )
      const signe = (positif: boolean) =>
        texteEnCouleurEtGras(
          positif ? 'strictement positif' : 'strictement négatif',
        )
      const correction = (this.correction ?? '')
        .replace(
          'Les paraboles proposées ont des équations de la forme $y=',
          'On a $f(x)=',
        )
        .replace(' ($10$).<br>', ', donc $b > 0$.<br>')
        .replace(
          /<br>\s*On en déduit que la seule fonction[\s\S]*$/,
          `<br>
      Ainsi, $${premier.nom}$ est ${signe(premier.positif)} et $${second.nom}$ est ${signe(second.positif)}.`,
        )
      this.questionsOuvertes.set(this.enonce, {
        correction,
        signes: this.signes,
      })
    }
    const aleatoire = this.versionAleatoire
    this.versionAleatoire = () => {
      aleatoire()
      preparerQuestion()
    }
    const originale = this.versionOriginale
    this.versionOriginale = () => {
      originale()
      preparerQuestion()
    }
    this.versionAleatoire()
    this.options.vertical = true
  }
}
