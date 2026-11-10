import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import {
  addPossibleMultiLinesAnswer,
  baremeMultiLignes,
  besoinFormulaireVerificationMultiLignes,
  commentaireMultiLignes,
} from '../../lib/customElements/PossibleMultiLinesAnswerElement'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { ecritureParentheseSiNegatif } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Calculer une expression littérale simple pour une valeur donnée'
export const interactifReady = true
export const dateDePublication = '31/03/2026'

export const uuid = 'd05d3'
export const refs = {
  'fr-fr': ['5N5B'],
  'fr-2016': ['5L14'],
  'fr-ch': ['9R2FA3A-1', '9R3FA3A-1', '10CTFA4B-1', '10LCFA4B-1', '10LSFA4B-1', '11CTFA3B-1', '11LCFA3B-1', '11LSFA3B-1', 'PRQAL02A-1'],
}
/**
 *
 * @author Rémi Angot
 */
export default class CalculerUneExpressionSimple extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4
    this.besoinFormulaireCaseACocher = ['Afficher tous les signes ✕']
    this.sup = true
    this.besoinFormulaire2CaseACocher = ['Avec des nombres relatifs']
    this.sup2 = false
    this.besoinFormulaire3Texte = [
      "Types d'expressions",
      `1 : ax + b
2 : a(x + b)
3 : (x + a)(x + b)
4 : x*x + a
5 : x*x + a*x
6 : ax - b
7 : a(x - b)
8 : Mélange`,
    ]
    this.sup3 = 8
    this.besoinFormulaire4CaseACocher = ['Avec uniquement la lettre $x$']
    this.sup4 = true
    this.besoinFormulaire5Numerique = besoinFormulaireVerificationMultiLignes
    this.sup5 = 2
    this.comment = commentaireMultiLignes
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup3,
      min: 1,
      max: 7,
      melange: 8,
      defaut: 7,
      nbQuestions: this.nbQuestions,
      listeOfCase: [
        'ax+b',
        'a(x+b)',
        '(x+a)(x+b)',
        'x*x+a',
        'x*x+a*x',
        'ax-b',
        'a(x-b)',
      ],
    })
    const listeTypeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    const signeDisponible = this.sup2 ? [1, -1] : [1]
    const signes = combinaisonListes(signeDisponible, this.nbQuestions)
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const inconnue = this.sup4
        ? 'x'
        : choice(['x', 'y', 'z', 'm', 't', 'a', 'b', 'c'])
      let texte = ''
      let texteCorr = ''
      let expression = ''
      let answer: number
      const a = randint(2, 15)
      let b = randint(2, 15)
      const x = randint(2, 15) * signes[i]

      switch (listeTypeQuestions[i]) {
        case 'ax+b':
          expression = this.sup
            ? `${a} \\times ${inconnue} + ${b}`
            : `${a}${inconnue} + ${b}`
          texteCorr = `$${lettreDepuisChiffre(i + 1)} = ${a} \\times ${ecritureParentheseSiNegatif(x)} + ${b}$<br>`
          texteCorr += `$${lettreDepuisChiffre(i + 1)} = ${miseEnEvidence(a * x + b)}$`
          answer = a * x + b
          break
        case 'a(x+b)':
          expression = this.sup
            ? `${a} \\times (${inconnue} + ${b})`
            : `${a}(${inconnue} + ${b})`
          texteCorr = `$${lettreDepuisChiffre(i + 1)} = ${a} \\times (${x} + ${b})$<br>`
          texteCorr += `$${lettreDepuisChiffre(i + 1)} = ${a} \\times ${ecritureParentheseSiNegatif(x + b)}$<br>`
          texteCorr += `$${lettreDepuisChiffre(i + 1)} = ${miseEnEvidence(a * x + a * b)}$`
          answer = a * (x + b)
          break
        case '(x+a)(x+b)':
          expression = this.sup
            ? `(${inconnue} + ${a}) \\times (${inconnue} + ${b})`
            : `(${inconnue} + ${a})(${inconnue} + ${b})`
          texteCorr = `$${lettreDepuisChiffre(i + 1)} = (${x} + ${a}) \\times (${x} + ${b})$<br>`
          texteCorr += `$${lettreDepuisChiffre(i + 1)} = ${x + a} \\times ${ecritureParentheseSiNegatif(x + b)}$<br>`
          texteCorr += `$${lettreDepuisChiffre(i + 1)} = ${miseEnEvidence(x * x + a * x + b * x + a * b)}$`
          answer = (x + a) * (x + b)
          break
        case 'x*x+a':
          expression = this.sup
            ? `${inconnue} \\times ${inconnue} + ${a}`
            : `${inconnue}^2 + ${a}`
          texteCorr = `$${lettreDepuisChiffre(i + 1)} = ${x} \\times ${ecritureParentheseSiNegatif(x)} + ${a}$<br>`
          texteCorr += `$${lettreDepuisChiffre(i + 1)} = ${x * x} + ${a}$<br>`
          texteCorr += `$${lettreDepuisChiffre(i + 1)} = ${miseEnEvidence(x * x + a)}$`
          answer = x * x + a
          break
        case 'x*x+a*x':
          expression = this.sup
            ? `${inconnue} \\times ${inconnue} + ${a} \\times ${inconnue}`
            : `${inconnue}^2 + ${a}${inconnue}`
          texteCorr = `$${lettreDepuisChiffre(i + 1)} = ${x} \\times ${ecritureParentheseSiNegatif(x)} + ${a} \\times ${ecritureParentheseSiNegatif(x)}$<br>`
          texteCorr += `$${lettreDepuisChiffre(i + 1)} = ${x * x} + ${ecritureParentheseSiNegatif(a * x)}$<br>`
          texteCorr += `$${lettreDepuisChiffre(i + 1)} = ${miseEnEvidence(x * x + a * x)}$`
          answer = x * x + a * x
          break
        case 'ax-b':
          if (!this.sup2) {
            b = randint(1, a * x)
          }
          expression = this.sup
            ? `${a} \\times ${inconnue} - ${b}`
            : `${a}${inconnue} - ${b}`
          texteCorr = `$${lettreDepuisChiffre(i + 1)} = ${a} \\times ${ecritureParentheseSiNegatif(x)} - ${b}$<br>`
          texteCorr += `$${lettreDepuisChiffre(i + 1)} = ${a * x} - ${b}$<br>`
          texteCorr += `$${lettreDepuisChiffre(i + 1)} = ${miseEnEvidence(a * x - b)}$`
          answer = a * x - b
          break
        default:
          // case 'a(x-b)':
          if (!this.sup2) {
            b = randint(1, x)
          }
          expression = this.sup
            ? `${a} \\times (${inconnue} - ${b})`
            : `${a}(${inconnue} - ${b})`
          texteCorr = `$${lettreDepuisChiffre(i + 1)} = ${a} \\times (${x} - ${b})$<br>`
          texteCorr += `$${lettreDepuisChiffre(i + 1)} = ${a} \\times ${ecritureParentheseSiNegatif(x - b)}$<br>`
          texteCorr += `$${lettreDepuisChiffre(i + 1)} = ${miseEnEvidence(a * x - a * b)}$`
          answer = a * (x - b)
          break
      }
      texte = `Calculer $${lettreDepuisChiffre(i + 1)} = ${expression}$, pour $${inconnue} = ${x}$.`
      if (this.interactif) {
        handleAnswers(this, i, { reponse: { value: answer } })
        texte += addPossibleMultiLinesAnswer(this, i, {
          prefix: `${lettreDepuisChiffre(i + 1)} =`,
          style: KeyboardType.clavierDeBaseAvecFraction,
          bareme: baremeMultiLignes(this.sup5),
        })
      }
      if (this.questionJamaisPosee(i, texte)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
