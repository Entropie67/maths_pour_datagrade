import { repere } from '../../lib/2d/reperes'
import { latex2d } from '../../lib/2d/textes'
import { choixDeroulant } from '../../lib/customElements/ListeDeroulanteElement'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { spline } from '../../lib/mathFonctions/Spline'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import ExerciceQcmACourt from '../ExerciceQcmACourt'

export const uuid = 'e70ce'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Déterminer un signe avec un graphique'
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ3AGs2026 extends ExerciceQcmACourt {
  // Signe de f sur la courbe fixe : zéros en -3, 2, 6 ; + sur ]-5;-3[ et ]2;6[ ; - sinon.
  private signeF(x: number): number {
    if (x === -3 || x === 2 || x === 6) return 0
    if ((x >= -5 && x < -3) || (x > 2 && x < 6)) return 1
    return -1
  }

  private appliquerLesValeurs(a: number, b: number): void {
    const sa = this.signeF(a)
    const sb = this.signeF(b) // ≠ 0 par construction

    // --- COURBE (spline) ---
    const noeuds = [
      { x: -5, y: 3, deriveeGauche: -1, deriveeDroit: -1, isVisible: false },
      {
        x: -3,
        y: 0,
        deriveeGauche: -1.5,
        deriveeDroit: -1.5,
        isVisible: false,
      },
      { x: -1, y: -2, deriveeGauche: 0, deriveeDroit: 0, isVisible: false },
      { x: 2, y: 0, deriveeGauche: 1, deriveeDroit: 1, isVisible: false },
      { x: 4, y: 2, deriveeGauche: 0, deriveeDroit: 0, isVisible: false },
      { x: 6, y: 0, deriveeGauche: -1, deriveeDroit: -1, isVisible: false },
      { x: 9, y: -2, deriveeGauche: 0, deriveeDroit: 0, isVisible: false },
    ]
    const theSpline = spline(noeuds)

    const xMin = -6
    const xMax = 10
    const yMin = -4
    const yMax = 4
    const r = repere({
      xMin,
      xMax,
      yMin,
      yMax,
      grilleX: true,
      grilleY: true,
      grilleSecondaire: true,
      grilleSecondaireXDistance: 0.5,
      grilleSecondaireYDistance: 0.5,
      axesEpaisseur: 1.5,
    })
    const courbe = theSpline.courbe({
      epaisseur: 1.2,
      ajouteNoeuds: false,
      color: 'red',
    })
    const o = latex2d('\\text{O}', -0.3, -0.3, { letterSize: 'scriptsize' })
    const figure = mathalea2d(
      {
        xmin: xMin - 0.5,
        xmax: xMax + 0.5,
        ymin: yMin - 0.5,
        ymax: yMax + 0.5,
        pixelsParCm: 25,
        scale: 0.55,
        display: 'block',
        center: !context.isHtml,
      },
      r,
      courbe,
      o,
    )

    // --- ÉNONCÉ ---
    this.enonce = `On considère une fonction $f$ définie sur l'intervalle $[-5\\,;\\,9]$. On a représenté ci-dessous sa courbe représentative dans un repère orthogonal.<br><br>`
    this.enonce += `${figure}
    `
    this.enonce += `On note $A = \\dfrac{f(${a})}{f(${b})}$.<br>`
    this.enonce += `Laquelle de ces propositions est vraie ?`

    // --- PROPOSITIONS ---
    const propNul = `$A = 0$`
    const propNeg = `$A < 0$`
    const propPos = `$A > 0$`
    const propIndet = `On ne peut pas connaître le signe de $A$.`

    let correct: string
    if (sa === 0) correct = propNul
    else if (sa !== sb) correct = propNeg
    else correct = propPos

    this.reponses = [
      correct,
      ...[propNul, propNeg, propPos, propIndet].filter((p) => p !== correct),
    ]

    // --- CORRECTION ---
    const motSigne = (s: number) =>
      s > 0 ? 'positif' : s < 0 ? 'négatif' : 'nul'
    const motPos = (s: number) =>
      s > 0
        ? "au-dessus de l'axe des abscisses"
        : s < 0
          ? "en dessous de l'axe des abscisses"
          : "sur l'axe des abscisses"

    this.correction = `On lit le signe de $f(${a})$ et de $f(${b})$ sur le graphique :<br>`
    this.correction += `$\\bullet$ $f(${a})$ est ${motSigne(sa)} (la courbe est ${motPos(sa)} en $x = ${a}$) ;<br>`
    this.correction += `$\\bullet$ $f(${b})$ est ${motSigne(sb)} (la courbe est ${motPos(sb)} en $x = ${b}$).<br>`
    if (sa === 0) {
      this.correction += `Le numérateur est nul, donc $A = \\dfrac{0}{f(${b})} = ${miseEnEvidence('0')}$.`
    } else if (sa !== sb) {
      this.correction += `Le quotient de deux nombres de signes contraires est négatif, donc $${miseEnEvidence('A < 0')}$.`
    } else {
      this.correction += `Le quotient de deux nombres de même signe est positif, donc $${miseEnEvidence('A > 0')}$.`
    }
  }

  versionOriginale: () => void = () => {
    // Sujet de l'image : A = f(-4)/f(-1), f(-4) > 0 et f(-1) < 0  =>  A < 0
    this.appliquerLesValeurs(-4, -1)
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    const positifs = [-5, -4, 3, 4, 5]
    const negatifs = [-2, -1, 0, 1, 7, 8, 9]
    const zeros = [-3, 2, 6]

    const type = choice(['negatif', 'positif', 'nul'])
    let a: number, b: number
    if (type === 'nul') {
      a = choice(zeros) // f(a) = 0  =>  A = 0
      b = choice([...positifs, ...negatifs])
    } else if (type === 'negatif') {
      if (choice([true, false])) {
        a = choice(positifs)
        b = choice(negatifs)
      } else {
        a = choice(negatifs)
        b = choice(positifs)
      }
    } else {
      if (choice([true, false])) {
        a = choice(positifs)
        b = choice(positifs.filter((v) => v !== a))
      } else {
        a = choice(negatifs)
        b = choice(negatifs.filter((v) => v !== a))
      }
    }

    this.appliquerLesValeurs(a, b)
  }

  /** Symbole de la bonne réponse du QCM : « $A < 0$ » donne « < ». */
  private symboleBonneReponse(): string {
    return /^\$A ([=<>]) 0\$$/.exec(this.reponses[0])?.[1] ?? '='
  }

  /**
   * La question n'est un QCM que si la case « Version QCM » est cochée. Sinon, l'élève compare
   * $A$ à $0$ avec une liste déroulante : les tirages sont ceux du QCM.
   */
  nouvelleVersion() {
    if (this.sup3) {
      super.nouvelleVersion()
      return
    }
    this.consigne = ''
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 30; cpt++) {
      this.versionAleatoire()
      const enonce = this.enonceCourt?.() ?? this.enonce
      const symbole = this.symboleBonneReponse()
      if (this.questionJamaisPosee(i, enonce, symbole)) {
        this.listeQuestions[i] =
          enonce +
          (this.interactif
            ? `<br>$A$${sp(2)}${choixDeroulant(this, i, {
                choices: [
                  { label: '?', value: '' },
                  { latex: '<', value: '<' },
                  { latex: '>', value: '>' },
                  { latex: '=', value: '=' },
                ],
              })}${sp(2)}$0$`
            : '')
        this.listeCorrections[i] = this.correction ?? ''
        if (this.interactif) {
          handleAnswers(
            this,
            i,
            { reponse: { value: symbole } },
            { formatInteractif: 'liste-deroulante' },
          )
        }
        i++
      }
    }
  }

  constructor() {
    super()
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.enonceCourt = () =>
      this.enonce.replace(
        /Laquelle de ces propositions est vraie \?\s*$/,
        'Comparer $A$ à $0$.',
      )
    this.options = { vertical: true }
  }
}
