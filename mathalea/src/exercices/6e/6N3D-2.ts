import { orangeMathalea } from '../../lib/colors'
import { demiDroiteInteractive } from '../../lib/customElements/demi_droite_interactive'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice } from '../../lib/outils/arrayOutils'
import { context } from '../../modules/context'
import { adverbeNumeral } from '../../modules/nombreEnLettres'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const dateDePublication = '05/07/2026'
export const titre =
  "Placer une abscisse fractionnaire sur une demi-droite graduée (partage de l'unité)"
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'

/** Placer une abscisse fractionnaire sur une demi-droite graduée
 * @author Jean-Claude Lhote
 */
export const uuid = 'cff14'

export const refs = {
  'fr-fr': ['6N3D-2'],
  'fr-2016': [],
  'fr-ch': ['9R1NO4B-10', '9R2NO4B-10', '9R3NO4B-10', 'PRQNO04B-10'],
}

export default class DonnerSensDefinitionQuotient2 extends Exercice {
  private reponsesAttendues: { nums: number[]; den: number }[] = []

  constructor() {
    super()
    this.nbQuestions = 5
    this.exoCustomResultat = true
    this.correctionDetaillee = true
    this.correctionDetailleeDisponible = true
    // La réponse est une construction graphique (demi-droite graduée) : pas de réponse courte.
    this.reponseCourteDisponible = false
    this.besoinFormulaireNumerique = [
      'Nombres de points à placer (de 1 à 3)',
      3,
    ]
    this.besoinFormulaire2CaseACocher = ['Origine visible', true]
    this.besoinFormulaire3Numerique = [
      'Nombre de clics nécessaires pour graduer',
      3,
      '1: 10 ou moins\n2: 15 ou moins\n3: 20 ou moins',
    ]
    this.besoinFormulaire4Numerique = [
      "Nombre d'unités visibles sur la demi-droite graduée (en LaTeX : 3 maxi)",
      3,
      '1: 2 unités\n2: 3 unités\n3: 4 unités',
    ]
    this.sup = 2
    this.sup2 = true
    this.sup3 = 1
    this.sup4 = 2

    this.comment = `Pour des exercices de placement de points d'abscisses fractionnaires, voir la série CM2N2E.<br>
    Celui-ci demande à l'élève de graduer l'axe.<br>
    En version HTML, on peut avoir un diviseur allant de 2 à 7 (les boutons +/- de « Nombre de graduations intermédiaires » permettent de modifier le nombre de parts).<br>
    En version LaTeX, les diviseurs sont limités à 2, 4 et 5 avec une unité à 4 cm pour faciliter la graduation de l'axe.`
  }

  nouvelleVersion() {
    const nbClicsMax = (1 + this.sup3) * 5
    const nbUnits = 1 + (context.isHtml ? this.sup4 : Math.min(this.sup4, 2))
    this.consigne =
      context.isHtml && !context.isTypst && this.interactif
        ? `Utiliser les boutons pour modifier la demi-droite graduée et créer les graduations nécessaires pour placer ${
            this.sup === 1
              ? 'le point $A$'
              : `les points ${['A', 'B', 'C']
                  .slice(0, this.sup - 1)
                  .map((p) => `$${p}$`)
                  .join(', ')}` + `et $${['A', 'B', 'C'][this.sup - 1]}$`
          }.`
        : `L'unité fait 4 cm. Graduer régulièrement l'axe et placer  ${
            this.sup === 1
              ? 'le point $A$'
              : `les points ${['A', 'B', 'C']
                  .slice(0, this.sup - 1)
                  .map((p) => `$${p}$`)
                  .join(', ')}` + `et $${['A', 'B', 'C'][this.sup - 1]}$`
          }.`
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const x0 = this.sup2 ? 0 : randint(1, 3)
      let den: number
      const abscisseT = x0 + nbUnits
      do {
        den = context.isHtml ? randint(2, 5) : choice([2, 4, 5])
      } while (den * (abscisseT - x0) > nbClicsMax)

      const nums: number[] = []
      for (let j = 0; j < this.sup; j++) {
        nums.push(randint(den * x0 + 1, den * abscisseT, [...nums]))
      }
      let texte =
        this.sup === 1
          ? `Placer le point $A$ d'abscisse $\\dfrac{${nums[0]}}{${den}}$ sur la demi-droite graduée ci-dessous.<br><br>`
          : `Placer les points ${nums.map((n, i) => `$${['A', 'B', 'C'][i]}\\left(\\dfrac{${n}}{${den}}\\right)$`).join(', ')} sur la demi-droite graduée ci-dessous.<br><br>`
      let texteCorr = `On partage le segment de $${nbUnits}$ unités en $${den * (abscisseT - x0)}$ parties égales.<br>`
      if (this.correctionDetaillee) {
        texteCorr += `En effet, $${abscisseT - x0} = ${den * (abscisseT - x0)} \\times \\dfrac{${1}}{${den}}$.<br><br>`
      }
      if (!this.sup2) {
        texteCorr += `À compter de l'abscisse $${x0}$ $\\ldots$<br>`
      }
      if (this.sup === 1) {
        texteCorr += `Le point A est placé sur la ${adverbeNumeral(nums[0] - x0 * den)} graduation${nums[0] - x0 * den < den ? '' : `, soit $${Math.floor((nums[0] - x0 * den) / den)}$ unités plus $${(nums[0] - x0 * den) % den}$ graduation${(nums[0] - x0 * den) % den < 2 ? '' : 's'}`}.<br>`
      } else {
        texteCorr += `${nums
          .map((num, i) => {
            return `Le point ${['A', 'B', 'C'][i]} est placé sur la ${adverbeNumeral(num - x0 * den)} graduation${num - x0 * den < den ? '' : `, soit $${Math.floor((num - x0 * den) / den)}$ unités plus $${(num - x0 * den) % den}$ graduation${(num - x0 * den) % den < 2 ? '' : 's'}`}.<br>`
          })
          .join('')}`
      }

      texteCorr +=
        this.sup === 1
          ? `Le point d'abscisse $\\dfrac{${nums[0]}}{${den}}$ est placé sur la demi-droite graduée ci-dessous.<br><br>`
          : `Les points d'abscisse ${['A', 'B', 'C']
              .slice(0, this.sup)
              .map((p, i) => `$${p}\\left(\\dfrac{${nums[i]}}{${den}}\\right)$`)
              .join(
                ', ',
              )} sont placés sur la demi-droite graduée ci-dessous.<br><br>`

      texte += demiDroiteInteractive(this, i, {
        initialT: abscisseT,
        minT: abscisseT,
        maxT: abscisseT,
        multiplePoints: this.sup > 1,
        x0,
        subdivisionMode: 'unit',
      })
      texteCorr += demiDroiteInteractive(this, i, {
        initialT: abscisseT,
        x0,
        minT: abscisseT,
        maxT: abscisseT,
        interactivityOn: false,
        partsCount: den,
        points: nums.map((num, i) => ({
          pointValue: num / den,
          label: ['A', 'B', 'C'][i],
        })),
        id: `demi-droite-gradueeEx${this.numeroExercice}Q${i}Corr`,
        pointsColor: orangeMathalea,
        multiplePoints: this.sup > 1,
        subdivisionMode: 'unit',
      })

      if (this.questionJamaisPosee(i, nums.join(''), den)) {
        handleAnswers(
          this,
          i,
          {
            reponse: {
              value: JSON.stringify({
                partsCount: den,
                maxT: abscisseT,
                showwNegative: false,
                points: nums.map((num, i) => ({
                  pointValue: num / den,
                  label: ['A', 'B', 'C'][i],
                })),
                x0,
              }),
            },
          },
          { formatInteractif: 'demi-droite-interactive' },
        )
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        this.reponsesAttendues[i] = { nums, den }
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
