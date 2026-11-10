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
export const dateDePublication = '15/09/2025'
export const dateDeModifImportante = '21/10/2026'
export const uuid = '11090'

export const refs = {
  'fr-fr': ['1A-F02-14', 'BP1F2D02'],
  'fr-ch': ['1mF3-15'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Reconnaître une parabole (forme factorisée)'
const choixSignes = [
  { label: 'Choisir…', value: '' },
  { label: 'strictement positif', value: '+' },
  { label: 'strictement négatif', value: '-' },
]
// a est non nul (parabole) ; les autres nombres pourraient l'être.
const choixSignesOuNul = [...choixSignes, { label: 'nul', value: '0' }]

export default class AutoF2f extends ExerciceQcmA {
  // Pour la question ouverte : signes de a et des racines x_1 < x_2.
  private signes: boolean[] = []
  private questionsOuvertes = new Map<
    string,
    { correction: string; signes: boolean[] }
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
      xLabelListe: [-10],
      yLabelListe: [-10],
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
        pixelsParCm: 20,
        scale: 0.6,
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
    return `${deuxColonnes(texte, figure)}`
  }

  private casFormeFactorisee(
    a: number,
    x1: number,
    x2: number,
    orientationHaut: boolean,
    fonction: (x: number) => number,
    descriptionRacines: string,
  ) {
    // Calcul automatique de la fenêtre d'affichage
    const xSommet = (x1 + x2) / 2
    const ySommet = fonction(xSommet)

    // Fenêtre en x : centré sur les racines avec une marge ET incluant l'axe Y (x=0)
    let xMin = Math.min(x1, x2) - 3
    let xMax = Math.max(x1, x2) + 3

    // S'assurer que l'axe Y est visible
    if (xMin > 0) xMin = -1
    if (xMax < 0) xMax = 1

    // Fenêtre en y selon l'orientation ET incluant l'axe X (y=0)
    let yMin, yMax
    if (orientationHaut) {
      // a > 0 : min au sommet - 1, max 2 unités au-dessus de l'axe x
      yMin = Math.min(ySommet - 1, -0.5) // S'assurer que l'axe X est visible
      yMax = 2
    } else {
      // a < 0 : min 2 unités en dessous de l'axe x, max au sommet + 1
      yMin = -2
      yMax = Math.max(ySommet + 1, 0.5) // S'assurer que l'axe X est visible
    }

    this.enonce = this.creerEnonce(xMin, xMax, yMin, yMax, fonction)
    this.signes = [orientationHaut, Math.min(x1, x2) > 0, Math.max(x1, x2) > 0]

    // Déterminer les signes des racines pour l'explication
    const x1Positif = x1 > 0
    const x2Positif = x2 > 0

    this.correction = `Les paraboles proposées ont des équations de la forme $y=a(x-x_1)(x-x_2)$ où $x_1$ et $x_2$ sont les racines.<br>
      La parabole $\\mathscr{P}$ a «${sp()}les bras${sp()}» tournés vers ${orientationHaut ? 'le haut' : 'le bas'}, on en déduit que $a ${orientationHaut ? '>' : '<'} 0$.<br>
      ${descriptionRacines}<br>
      On en déduit que la seule fonction susceptible de représenter $\\mathscr{P}$ est : $${miseEnEvidence(`x\\longmapsto ${texNombre(a)}(x${x1Positif ? '-' : '+'}${Math.abs(x1)})(x${x2Positif ? '-' : '+'}${Math.abs(x2)})`)}$.`

    // Génération des réponses avec différentes variations
    this.reponses = [
      // Bonne réponse
      `$x\\longmapsto ${texNombre(a)}(x${x1Positif ? '-' : '+'}${Math.abs(x1)})(x${x2Positif ? '-' : '+'}${Math.abs(x2)})$`,
      // Mauvais signe pour a
      `$x\\longmapsto ${texNombre(-a)}(x${x1Positif ? '-' : '+'}${Math.abs(x1)})(x${x2Positif ? '-' : '+'}${Math.abs(x2)})$`,
      // Mauvais signe pour x1
      `$x\\longmapsto ${texNombre(a)}(x${x1Positif ? '+' : '-'}${Math.abs(x1)})(x${x2Positif ? '-' : '+'}${Math.abs(x2)})$`,
      // Mauvais signe pour x2
      `$x\\longmapsto ${texNombre(-a)}(x${x1Positif ? '-' : '+'}${Math.abs(x1)})(x${x2Positif ? '+' : '-'}${Math.abs(x2)})$`,
    ]
  }

  versionOriginale: () => void = () => {
    // Parabole avec racines en -1 et 3, a = 0.5, tournée vers le haut
    const F = (x: number) => 0.5 * (x + 1) * (x - 3)

    this.enonce = this.creerEnonce(-3, 5, -3, 2, F)
    this.signes = [true, false, true]

    this.correction = `Les paraboles proposées ont des équations de la forme $y=a(x-x_1)(x-x_2)$ où $x_1$ et $x_2$ sont les racines.<br>
      La parabole $\\mathscr{P}$ a «${sp()}les bras${sp()}» tournés vers le haut, on en déduit que $a > 0$.<br>
      Les racines de la parabole (intersections avec l'axe des abscisses) ont des signes contraires (l'une est positive, l'autre est négative).<br>
      On en déduit que la seule fonction susceptible de représenter $\\mathscr{P}$ est : $${miseEnEvidence(`x\\longmapsto 0,5(x+1)(x-3)`)}$.`

    this.reponses = [
      '$x\\longmapsto 0,5(x+1)(x-3)$',
      '$x\\longmapsto -0,5(x+1)(x-3)$',
      '$x\\longmapsto 0,5(x-1)(x+3)$',
      '$x\\longmapsto -0,5(x+1)(x+3)$',
    ]
  }

  versionAleatoire = () => {
    const cas = randint(1, 6)

    switch (cas) {
      case 1: // a>0, racines négatives
        {
          const a = randint(7, 9) / 5 // Coefficient fractionnaire
          const x1 = -randint(1, 2)
          const x2 = -randint(3, 4)
          this.casFormeFactorisee(
            a,
            x1,
            x2,
            true,
            (x: number) => a * (x - x1) * (x - x2),
            "Les racines de la parabole (intersections avec l'axe des abscisses) sont toutes les deux négatives.",
          )
        }
        break

      case 2: // a>0, racines de signes opposés
        {
          const a = randint(1, 3) / 5 // Coefficient fractionnaire
          const x1 = -randint(1, 2)
          const x2 = randint(2, 3)
          this.casFormeFactorisee(
            a,
            x1,
            x2,
            true,
            (x: number) => a * (x - x1) * (x - x2),
            "Les racines de la parabole (intersections avec l'axe des abscisses) ont des signes contraires (l'une est positive, l'autre est négative).",
          )
        }
        break

      case 3: // a>0, racines positives
        {
          const a = randint(3, 7, [5]) / 5 // Coefficient fractionnaire (excluant 5)
          const x1 = randint(1, 2)
          const x2 = randint(4, 5)
          this.casFormeFactorisee(
            a,
            x1,
            x2,
            true,
            (x: number) => a * (x - x1) * (x - x2),
            "Les racines de la parabole (intersections avec l'axe des abscisses) sont toutes les deux positives.",
          )
        }
        break

      case 4: // a<0, racines négatives
        {
          const a = randint(3, 7, [5]) / 5 // Coefficient fractionnaire (excluant 5)
          const x1 = -randint(1, 2)
          const x2 = -randint(4, 5)
          this.casFormeFactorisee(
            -a,
            x1,
            x2,
            false,
            (x: number) => -a * (x - x1) * (x - x2),
            "Les racines de la parabole (intersections avec l'axe des abscisses) sont toutes les deux négatives.",
          )
        }
        break

      case 5: // a<0, racines de signes opposés
        {
          const a = randint(1, 3) / 5 // Coefficient fractionnaire
          const x1 = -randint(2, 3)
          const x2 = randint(2, 4)
          this.casFormeFactorisee(
            -a,
            x1,
            x2,
            false,
            (x: number) => -a * (x - x1) * (x - x2),
            "Les racines de la parabole (intersections avec l'axe des abscisses) ont des signes contraires (l'une est positive, l'autre est négative).",
          )
        }
        break

      case 6: // a<0, racines positives
      default:
        {
          const a = randint(8, 9, [5]) / 5 // Coefficient fractionnaire (excluant 5)
          const x1 = randint(1, 2)
          const x2 = randint(4, 5)
          this.casFormeFactorisee(
            -a,
            x1,
            x2,
            false,
            (x: number) => -a * (x - x1) * (x - x2),
            "Les racines de la parabole (intersections avec l'axe des abscisses) sont toutes les deux positives.",
          )
        }
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
      this.listeQuestions[i] = this.interactif
        ? enonce.replace(
            'Déterminer le signe de $a$, de $x_1$ et de $x_2$.',
            addMultiMathfield(this, i, {
              dataTemplate:
                'Le nombre $a$ est %{field0}, $x_1$ est %{field1} et $x_2$ est %{field2}.',
              dataOptions: {
                field0: { choices: choixSignes },
                field1: { choices: choixSignesOuNul },
                field2: { choices: choixSignesOuNul },
              },
            }),
          )
        : enonce
      this.listeCorrections[i] = donnees.correction
      const [a, x1, x2] = donnees.signes.map((positif) => (positif ? '+' : '-'))
      handleAnswers(
        this,
        i,
        {
          bareme: toutPourUnPoint,
          field0: { value: a },
          field1: { value: x1 },
          field2: { value: x2 },
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
      this.enonce = this.enonce.replace(
        /Une seule des quatre fonctions[\s\S]*?(?:Laquelle \?|La fonction représentée par la parabole \$\\mathscr\{P\}\$ est :)/,
        `$\\mathscr{P}$ est la courbe représentative d'une fonction $f$ définie sur $\\mathbb{R}$ par $f(x)=a(x-x_1)(x-x_2)$, où $x_1$ et $x_2$ sont les racines de $f$, avec $x_1\\lt x_2$.<br><br>
       Déterminer le signe de $a$, de $x_1$ et de $x_2$.`,
      )
      const [a, x1, x2] = this.signes.map((positif) =>
        texteEnCouleurEtGras(
          positif ? 'strictement positif' : 'strictement négatif',
        ),
      )
      const correction = (this.correction ?? '')
        .replace(
          /Les paraboles proposées ont des équations de la forme \$y=a\(x-x_1\)\(x-x_2\)\$ où \$x_1\$ et \$x_2\$ sont les racines\./,
          'On a $f(x)=a(x-x_1)(x-x_2)$ où $x_1$ et $x_2$ sont les racines de $f$, avec $x_1\\lt x_2$.',
        )
        .replace(
          /<br>\s*On en déduit que la seule fonction[\s\S]*$/,
          `<br>
      Ainsi, $a$ est ${a}, $x_1$ est ${x1} et $x_2$ est ${x2}.`,
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
