import { courbe } from '../../lib/2d/Courbe'
import { plot } from '../../lib/2d/Plot'
import { repere } from '../../lib/2d/reperes'
import { latex2d } from '../../lib/2d/textes'
import { bleuMathalea } from '../../lib/colors'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import { mathalea2d } from '../../modules/mathalea2d'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'

export const titre =
  'Déterminer graphiquement les intervalles de continuité d’une fonction'
export const interactifReady = false
export const dateDePublication = '22/08/2026'

export const uuid = 'a7c4e'

export const refs = {
  'fr-fr': ['TSA4-10', 'TCA3-10'],
  'fr-ch': [],
}

type ObjetGraphique =
  | ReturnType<typeof courbe>
  | ReturnType<typeof plot>
  | ReturnType<typeof latex2d>

const xMin = -6
const xMax = 6
const yMin = -5
const yMax = 5

const r = repere({
  xMin,
  xMax,
  yMin,
  yMax,
  grilleSecondaire: true,
  grilleSecondaireXDistance: 1,
  grilleSecondaireYDistance: 1,
})

function figure(objets: ObjetGraphique[]): string {
  return mathalea2d(
    {
      xmin: xMin - 0.5,
      xmax: xMax + 0.5,
      ymin: yMin - 0.5,
      ymax: yMax + 0.5,
      pixelsParCm: 25,
      scale: 0.65,
    },
    r,
    ...objets,
  )
}

function branche(
  f: (x: number) => number,
  domaineMin: number,
  domaineMax: number,
): ReturnType<typeof courbe> {
  return courbe(f, {
    repere: r,
    color: bleuMathalea,
    epaisseur: 2.5,
    xMin: domaineMin,
    xMax: domaineMax,
    yMin,
    yMax,
    step: 0.02,
  })
}

/**
 * @author Stéphane Guyon
 */
export default class IntervallesContinuiteGraphique extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4
    this.nbQuestionsModifiable = true
    this.spacing = 2
    this.spacingCorr = 2
    this.sup = 5
    this.besoinFormulaireNumerique = [
      'Type de fonctions',
      5,
      '1 : Fonction continue sur ℝ\n2 : Fonction continue sur ℝ mais non dérivable en un réel a\n3 : Fonction discontinue en un réel a\n4 : Fonction continue par morceaux\n5 : Mélange',
    ]
  }

  nouvelleVersion(): void {
    this.consigne =
      this.nbQuestions === 1
        ? 'La fonction $f$ représentée ci-dessous est définie sur $\\mathbb{R}$. Par convention, la courbe se prolonge sans changement au-delà de la fenêtre graphique. Déterminer les intervalles sur lesquels cette fonction est continue.'
        : 'Les fonctions $f$ représentées ci-dessous sont définies sur $\\mathbb{R}$. Par convention, les courbes se prolongent sans changement au-delà de la fenêtre graphique. Pour chaque fonction représentée, déterminer les intervalles sur lesquels la fonction est continue.'

    const types = gestionnaireFormulaireTexte({
      saisie: this.sup,
      max: 4,
      melange: 5,
      defaut: 5,
      nbQuestions: this.nbQuestions,
      shuffle: true,
    }).map(Number)

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const type = types[i]
      const objets: ObjetGraphique[] = []
      let correction = ''
      let parametres: number[] = []

      if (type === 1) {
        // Fonction continue sur R, avec au moins une limite infinie.
        const a = randint(-2, 2)
        const k = randint(1, 3) * (randint(0, 1) === 0 ? -1 : 1)
        const b = randint(-2, 2)
        const degre = randint(2, 3)
        const f =
          degre === 2
            ? (x: number) => (k * (x - a) ** 2) / 4 + b
            : (x: number) => (k * (x - a) ** 3) / 8 + b
        objets.push(branche(f, xMin, xMax))
        correction = `À la lecture graphique, la courbe peut être tracée sans lever le stylo et ne présente aucune rupture. La fonction $f$ est donc continue en tout réel.<br>
        Le fait que la fonction possède une ou deux limites infinies lorsque $x$ tend vers l’infini n’empêche pas cette continuité.<br>
        La fonction est donc continue sur $${miseEnEvidence('\\mathbb{R}')}$.`
        parametres = [type, a, k, b, degre]
      } else if (type === 3) {
        // Une unique discontinuité par saut.
        const a = randint(-2, 2)
        const penteGauche = randint(-2, 2, 0)
        const penteDroite = randint(-2, 2, 0)
        const valeurGauche = randint(-2, 2)
        let valeurDroite = randint(-3, 3, valeurGauche)
        if (Math.abs(valeurDroite - valeurGauche) < 2)
          valeurDroite += valeurDroite <= valeurGauche ? -2 : 2
        const gauche = (x: number) => valeurGauche + (penteGauche * (x - a)) / 3
        const droite = (x: number) => valeurDroite + (penteDroite * (x - a)) / 3
        objets.push(
          branche(gauche, xMin, a - 0.01),
          branche(droite, a, xMax),
          latex2d('\\boldsymbol{(}', a, valeurGauche, {
            color: bleuMathalea,
            letterSize: 'large',
          }),
          plot(a, valeurDroite, {
            rayon: 0.11,
            couleur: bleuMathalea,
            couleurDeRemplissage: bleuMathalea,
          }),
        )
        correction = `À la lecture graphique, la courbe est obtenue en levant le stylo en $x=${a}$. La fonction $f$ n’est clairement pas continue en $${a}$.<br>
        On a :<br>
        $\\displaystyle\\lim_{x\\to ${a}^-}f(x)=${valeurGauche}\\quad\\text{et}\\quad f(${a})=${valeurDroite}$.<br>
        Donc :<br>
        $f(${a})\\neq\\displaystyle\\lim_{x\\to ${a}^-}f(x)$.<br>
        Cela confirme que $f$ n’est pas continue en $${a}$.<br>
        La fonction $f$ est continue sur $${miseEnEvidence(`]-\\infty~;~${a}[`)}$ et $${miseEnEvidence(`[${a}~;~+\\infty[`)}$.`
        parametres = [
          type,
          a,
          penteGauche,
          penteDroite,
          valeurGauche,
          valeurDroite,
        ]
      } else if (type === 2) {
        // Point anguleux : continuité sans dérivabilité.
        const a = randint(-2, 2)
        const b = randint(-2, 2)
        const coefficient = randint(1, 2)
        const pente = randint(-1, 1)
        const f = (x: number) =>
          coefficient * Math.abs(x - a) + pente * (x - a) + b
        objets.push(branche(f, xMin, xMax))
        correction = `À la lecture graphique, la courbe peut être tracée sans lever le stylo et ne présente aucune rupture. La fonction $f$ semble donc continue sur $\\mathbb{R}$.<br>
        On a :<br>
        $\\displaystyle\\lim_{x\\to ${a}^-}f(x)=${b},\\quad \\lim_{x\\to ${a}^+}f(x)=${b}\\quad\\text{et}\\quad f(${a})=${b}$.<br>
        La fonction est donc continue en $${a}$.<br>
        La fonction est continue sur $${miseEnEvidence('\\mathbb{R}')}$.<br>
        Remarque : la courbe présente un «${sp()}point anguleux${sp()}» d’abscisse $${a}$. La fonction $f$ n’est pas dérivable en $${a}$. Cette situation illustre qu’une fonction dérivable sur un intervalle y est nécessairement continue, mais que la réciproque est fausse.`
        parametres = [type, a, b, coefficient, pente]
      } else {
        // Fonction continue par morceaux, avec deux sauts.
        const a = randint(-2, -1)
        const b = a + 3
        const y1 = randint(-2, 2)
        const y2 = randint(-2, 2, y1)
        const p1 = randint(-2, 2, 0)
        const p2 = randint(-2, 2, 0)
        const p3 = randint(-2, 2, 0)
        const valeurGaucheEnB = y2 + (p2 * (b - a)) / 3
        const y3 = randint(-2, 2, [y1, y2, valeurGaucheEnB])
        const f1 = (x: number) => y1 + (p1 * (x - a)) / 3
        const f2 = (x: number) => y2 + (p2 * (x - a)) / 3
        const f3 = (x: number) => y3 + (p3 * (x - b)) / 3
        objets.push(
          branche(f1, xMin, a - 0.01),
          branche(f2, a, b - 0.01),
          branche(f3, b, xMax),
          latex2d('\\boldsymbol{(}', a, y1, {
            color: bleuMathalea,
            letterSize: 'large',
          }),
          plot(a, y2, {
            rayon: 0.11,
            couleur: bleuMathalea,
            couleurDeRemplissage: bleuMathalea,
          }),
          latex2d('\\boldsymbol{(}', b, f2(b), {
            color: bleuMathalea,
            letterSize: 'large',
          }),
          plot(b, y3, {
            rayon: 0.11,
            couleur: bleuMathalea,
            couleurDeRemplissage: bleuMathalea,
          }),
        )
        correction = `À la lecture graphique, la courbe est obtenue en levant le stylo en $x=${a}$ et en $x=${b}$. La fonction $f$ n’est donc pas continue en ces deux réels.<br>
        En $${a}$, on a :<br>
        $\\displaystyle\\lim_{x\\to ${a}^-}f(x)=${y1}\\quad\\text{et}\\quad f(${a})=${y2}$.<br>
        Donc :<br>
        $f(${a})\\neq\\displaystyle\\lim_{x\\to ${a}^-}f(x)$.<br>
        La fonction n’est pas continue en $${a}$.<br>
        En $${b}$, on a :<br>
        $\\displaystyle\\lim_{x\\to ${b}^-}f(x)=${valeurGaucheEnB}\\quad\\text{et}\\quad f(${b})=${y3}$.<br>
        Donc :<br>
        $f(${b})\\neq\\displaystyle\\lim_{x\\to ${b}^-}f(x)$.<br>
        La fonction n’est pas continue en $${b}$.<br>
        La fonction est continue sur $${miseEnEvidence(`]-\\infty~;~${a}[`)}$, $${miseEnEvidence(`[${a}~;~${b}[`)}$ et $${miseEnEvidence(`[${b}~;~+\\infty[`)}$.`
        parametres = [type, a, b, y1, y2, y3, p1, p2, p3]
      }

      if (this.questionJamaisPosee(i, ...parametres)) {
        this.listeQuestions.push(figure(objets))
        this.listeCorrections.push(correction)
        i++
      }
      cpt++
    }

    listeQuestionsToContenu(this)
  }
}
