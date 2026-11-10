import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'

export const uuid = 'd9b39'
export const refs = {
  'fr-fr': ['1A-R02-8'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'
export const titre = 'Utiliser une proportion pour trouver le tout'
export const dateDePublication = '23/10/2026'
/**
 * @author Gilles Mora + ia (claude)
 */
export default class FractionPourTrouverLeTout extends ExerciceSimple {
  constructor() {
    super()
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.besoinFormulaireCaseACocher = ['Sujet original', false]
    this.sup = false
    this.versionQcmDisponible = true
    this.versionQcm = false
    this.spacing = 1.5
    this.versionQcmOptions = { radio: true, compact: true }
  }

  nouvelleVersion() {
    if (context.isAmc) this.versionQcm = true

    // Situations : la partie connue représente a/b du tout, on cherche le tout
    const situations = {
      lycee: {
        enonce: (effectif: number, frac: string) =>
          `Dans un lycée, $${texNombre(effectif)}$ élèves de première générale suivent la spécialité Mathématiques, ce qui représente $${frac}$ de l'ensemble des élèves de première générale.`,
        question:
          "Calculer le nombre d'élèves en première générale dans ce lycée.",
        questionQcm:
          "Le nombre d'élèves en première générale dans ce lycée est :",
        notation: "le nombre d'élèves en première générale de ce lycée",
        conclusion: (total: string) =>
          `Il y a $${total}$ élèves en première générale dans ce lycée.`,
        unite: 'élèves',
        totalMin: 150,
        totalMax: 450,
        pas: 10,
      },
      club: {
        enonce: (effectif: number, frac: string) =>
          `Dans un club de sport, $${texNombre(effectif)}$ adhérents ont moins de $18$ ans, ce qui représente $${frac}$ de l'ensemble des adhérents du club.`,
        question: "Calculer le nombre total d'adhérents de ce club.",
        questionQcm: "Le nombre total d'adhérents de ce club est :",
        notation: "le nombre total d'adhérents de ce club",
        conclusion: (total: string) =>
          `Ce club compte $${total}$ adhérents au total.`,
        unite: 'adhérents',
        totalMin: 200,
        totalMax: 600,
        pas: 10,
      },
      concert: {
        enonce: (effectif: number, frac: string) =>
          `Lors d'un concert, $${texNombre(effectif)}$ spectateurs ont acheté leur billet en ligne, ce qui représente $${frac}$ de l'ensemble des spectateurs.`,
        question: 'Calculer le nombre total de spectateurs de ce concert.',
        questionQcm: 'Le nombre total de spectateurs de ce concert est :',
        notation: 'le nombre total de spectateurs de ce concert',
        conclusion: (total: string) =>
          `Ce concert a accueilli $${total}$ spectateurs au total.`,
        unite: 'spectateurs',
        totalMin: 1200,
        totalMax: 3000,
        pas: 100,
      },
    }

    let cle: keyof typeof situations
    let a: number
    let b: number
    let part: number // valeur d'une part, c'est-à-dire de 1/b du tout
    if (this.sup) {
      cle = 'lycee'
      a = 2
      b = 3
      part = 100
    } else {
      cle = this.quotaChoice('situation', ['lycee', 'club', 'concert'])
      ;[a, b] = this.quotaChoice('fraction', [
        [2, 3],
        [3, 4],
        [2, 5],
        [3, 5],
        [4, 5],
        [1, 6],
        [5, 6],
      ])
      const s = situations[cle]
      part =
        s.pas *
        randint(
          Math.ceil(s.totalMin / (b * s.pas)),
          Math.floor(s.totalMax / (b * s.pas)),
        )
    }
    const s = situations[cle]
    const donnee = a * part
    const total = b * part
    const frac = `\\dfrac{${a}}{${b}}`

    this.question = `${s.enonce(donnee, frac)}<br>${this.versionQcm ? s.questionQcm : s.question}`

    const etapes =
      a === 1
        ? [`${texNombre(donnee)}\\times ${b}`]
        : [
            `${texNombre(donnee)}\\times \\dfrac{${b}}{${a}}`,
            `\\dfrac{${texNombre(donnee)}}{${a}}\\times ${b}`,
            `${texNombre(part)}\\times ${b}`,
          ]
    this.correction = `En notant $N$ ${s.notation}, on a :<br>
$\\begin{aligned}
${frac}\\times N&=${texNombre(donnee)}\\\\
${etapes.map((e) => `N&=${e}`).join('\\\\\n')}\\\\
N&=${this.versionQcm ? miseEnEvidence(texNombre(total)) : texNombre(total)}
\\end{aligned}$`
    if (!this.versionQcm) {
      this.correction += `<br>${s.conclusion(miseEnEvidence(texNombre(total)))}`
    }

    // Erreurs classiques : oubli de la division par a, valeur de l'autre partie,
    // multiplication par la fraction (si entière), une part de trop
    const candidats = [
      donnee * b,
      (b - a) * part,
      (donnee * a) % b === 0 ? (donnee * a) / b : total + part,
      total + part,
      total - part,
      2 * total,
    ]
    const distracteurs: number[] = []
    for (const d of candidats) {
      if (d > 0 && d !== total && !distracteurs.includes(d))
        distracteurs.push(d)
    }

    this.reponse = this.versionQcm ? `$${texNombre(total)}$ ${s.unite}` : total
    this.distracteurs = distracteurs
      .slice(0, 3)
      .map((d) => `$${texNombre(d)}$ ${s.unite}`)
    this.optionsChampTexte = { texteAvant: '<br>', texteApres: ` ${s.unite}` }

    this.canEnonce = s.enonce(donnee, frac)
    this.canReponseACompleter = `$\\ldots$ ${s.unite}`
  }
}
