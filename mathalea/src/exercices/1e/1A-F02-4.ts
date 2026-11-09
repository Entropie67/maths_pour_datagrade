import { context } from '../../modules/context'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import FractionEtendue from '../../modules/FractionEtendue'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'
export const dateDePublication = '20/09/2025'
export const dateDeModifImportante = '21/10/2026'
export const uuid = 'd294c'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export const refs = {
  'fr-fr': ['1A-F02-4'],
  'fr-ch': ['1mQCM-48', '11LSFA2G-1', '11LSQCMFA2D-1'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Calculer une image avec le second degré'
export default class AutoF1e extends ExerciceQcmA {
  private questionsOuvertes = new Map<
    string,
    { correction: string; reponse: string }
  >()

  versionOriginale: () => void = () => {
    this.enonce = `On considère la fonction $f$ définie sur $\\mathbb{R}$ par $f(x)=7-\\dfrac{1}{2}(x-3)^2$<br>
    L'image de $3$ par cette fonction est : `
    this.correction = `On remplace $x$ par $3$ dans l'expression de $f$ :<br>
     
    $\\begin{aligned}
    f\\left(3\\right)&=7-\\dfrac{1}{2}(3-3)^2\\\\
    &=7-\\dfrac{1}{2}\\times 0\\\\
    &=7
    \\end{aligned}$<br>
    
    
    L'image de $3$ par la fonction $f$ est : $${miseEnEvidence('7')}$.`

    this.reponses = [
      '$7$',
      '$7-\\dfrac{1}{2}$',
      '$7-\\dfrac{1}{2}(9+9)$',
      '$0$',
    ]
  }

  versionAleatoire = () => {
    const listeFractions = [
      [1, 2],
      [1, 3],
      [2, 3],
      [3, 4],
      [3, 5],
      [4, 5],
      [5, 3],
      [4, 3],
      [5, 4],
      [6, 5],
      [5, 3],
      [2, 5],
    ]
    const frac = choice(listeFractions)
    const f = new FractionEtendue(frac[0], frac[1])
    const a = frac[0] + 1
    const b = randint(2, 5)
    const val = choice([b, b - 1, b + 1])
    this.enonce = `On considère la fonction $f$ définie sur $\\mathbb{R}$ par $f(x)=${a}-${f.texFraction}(x-${b})^2$<br>
    L'image de $${val}$ par cette fonction est : `
    this.correction = `On remplace $x$ par $${val}$ dans l'expression de $f$ :<br>`

    if (val === b) {
      this.correction = `
    $\\begin{aligned}
    f\\left(${val}\\right)&=${a}-${f.texFraction}(${val}-${b})^2\\\\
    &=${a}-${f.texFraction}\\times 0\\\\
    &=${a}
    \\end{aligned}$<br>
    
    
    L'image de $${val}$ par la fonction $f$ est : $${miseEnEvidence(a)}$.`

      this.reponses = [
        `$${a}$`,
        '$0$',
        `$${a}-${f.texFraction}$`,
        `$${a}-${f.texFraction}(${val ** 2}+${b ** 2})$`,
      ]
    } else {
      this.correction = `
    $\\begin{aligned}
    f\\left(${val}\\right)&=${a}-${f.texFraction}(${val}-${b})^2\\\\
    &=${a}-${f.texFraction}\\times 1\\\\
    &=${f.entierMoinsFraction(a).texFraction}
    \\end{aligned}$<br>
    
    
    L'image de $${val}$ par la fonction $f$ est : $${miseEnEvidence(f.entierMoinsFraction(a).texFraction)}$.`

      this.reponses = [
        `$${f.entierMoinsFraction(a).texFraction}$`,
        `$${a}$`,
        `$${f.ajouteEntier(a).texFraction}$`,
        `$${new FractionEtendue(1, frac[1]).texFraction}$`,
      ]
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
            /Calculer l'image de \$(.*?)\$ par cette fonction\./,
            (_, valeur) =>
              `L'image de $${valeur}$ par la fonction $f$ est ${ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBaseAvecFraction)}.`,
          )
        : enonce
      this.listeCorrections[i] = donnees.correction
      handleAnswers(
        this,
        i,
        { reponse: { value: donnees.reponse } },
        { formatInteractif: 'mathalea-mathfield' },
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
        /L'image de \$(.*?)\$ par cette fonction est :\s*/,
        "Calculer l'image de $$$1$ par cette fonction.",
      )
      this.questionsOuvertes.set(this.enonce, {
        correction: this.correction ?? '',
        reponse: this.reponses[0].replace(/\$/g, '').trim(),
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
  }
}
