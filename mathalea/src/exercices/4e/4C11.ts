import {
  addPossibleMultiLinesAnswer,
  baremeMultiLignes,
  besoinFormulaireVerificationMultiLignes,
  commentaireMultiLignes,
} from '../../lib/customElements/PossibleMultiLinesAnswerElement'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import {
  choice,
  combinaisonListes,
  enleveElement,
} from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { range1 } from '../../lib/outils/nombres'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import { listeDesDiviseurs } from '../../lib/outils/primalite'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { bleuMathalea } from './../../lib/colors'

export const titre = 'Effectuer des calculs avec des priorités opératoires'
export const interactifReady = true

/**
 * Plusieurs type de calcul avec des entiers.
 *
 * Sans parenthèses :
 * * a+b*c
 * * a+b÷c
 * * a/b*c
 * * a*b÷c
 * * a*b+c
 * * a-b+c
 * * a+b+c*d
 * * a*b+c*d
 * * a*b*c+d
 * * a*b-c÷d
 * * a*b+c÷d
 *
 * Avec parenthèses :
 * * a*(b-c)
 * * (a-b)*c
 * * (a-b)÷c
 * * a÷(b+c)
 * * (a-b)÷c
 * * a*(b-c)*d
 * * a*b*(c-d)
 * * a*(b-c*d)
 * * (a+b*c)÷d
 * * a*(b-c*d)
 * * a*b÷(c+d)
 * * a*(b÷c+d)
 * * a-(b+c)
 * * (a+b+c)*d
 * @author Rémi Angot
 * @author Matthieu Devillers pour l'amélioration des corrections
 */
export const uuid = '62f66'

export const refs = {
  'fr-fr': ['4C11'],
  'fr-ch': ['10LCNO2D-4', '10LSNO2D-4', '11CTNO1C-4', 'PRQNO13B-1'],
}
export default class PrioritesEtRelatifs extends Exercice {
  constructor() {
    super()

    this.consigne = 'Calculer.'
    this.comment = commentaireMultiLignes
    this.spacing = 2
    this.nbQuestions = 6
    this.nbCols = 2
    this.nbColsCorr = 2
    this.sup = 3
    this.sup2 = false
    this.sup3 = 1
    this.besoinFormulaireNumerique = [
      'Type de calculs',
      3,
      '1 : Sans opérations entre parenthèses\n2 : Avec des opérations entre parenthèses\n3 : Mélange',
    ]
    this.besoinFormulaire2CaseACocher = [
      'Présentation des corrections en ligne',
      false,
    ]
    this.besoinFormulaire3Numerique = besoinFormulaireVerificationMultiLignes
    this.listeAvecNumerotation = false
  }

  nouvelleVersion() {
    let listeQuestionsDisponibles
    if (this.sup === 1) {
      listeQuestionsDisponibles = range1(10)
    } else if (this.sup === 2) {
      listeQuestionsDisponibles = range1(20, range1(10))
    } else {
      listeQuestionsDisponibles = range1(20)
    }
    const listeTypeDeQuestions = combinaisonListes(
      listeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let a: number
      let b: number
      let c: number
      let d: number
      let sepa = ''
      let aligne = ''
      let endaligne = ''
      let egal = '='
      if (this.sup2 === false) {
        aligne = '~$<br>$\\begin{aligned}'
        endaligne = '\\end{aligned}'
        sepa = '\\\\'
        egal = '&='
      }
      switch (listeTypeDeQuestions[i]) {
        case 1: // a+b*c
          a = randint(2, 11) * choice([-1, 1])
          b = randint(2, 11) * choice([-1, 1])
          c = randint(2, 11) * choice([-1, 1])
          while (a > 0 && b > 0 && c > 0) {
            a = randint(2, 11) * choice([-1, 1])
            b = randint(2, 11) * choice([-1, 1])
            c = randint(2, 11) * choice([-1, 1])
          }
          if (this.sup2 === false) {
            sepa += `${lettreDepuisChiffre(i + 1)}`
          }
          texte = `$${lettreDepuisChiffre(i + 1)} = ${a}${ecritureAlgebrique(b)}\\times${ecritureParentheseSiNegatif(c)}$`
          texteCorr = `$${aligne}${lettreDepuisChiffre(i + 1)} ${egal} ${a}${miseEnEvidence('~' + ecritureAlgebrique(b) + '\\times' + ecritureParentheseSiNegatif(c), bleuMathalea)} ${sepa}`
          texteCorr += `${egal}${a}${ecritureAlgebrique(b * c)} ${sepa}`
          texteCorr += `${egal}${miseEnEvidence(`${a + b * c}`)} ${endaligne}$`
          handleAnswers(this, i, { reponse: { value: a + b * c } })
          break
        case 2: // a+b/c
          a = randint(2, 11) * choice([-1, 1])
          c = randint(2, 11) * choice([-1, 1])
          b = c * randint(2, 11) * choice([-1, 1])
          while (a > 0 && b > 0 && c > 0) {
            a = randint(2, 11) * choice([-1, 1])
            c = randint(2, 11) * choice([-1, 1])
            b = c * randint(2, 11) * choice([-1, 1])
          }
          if (this.sup2 === false) {
            sepa += `${lettreDepuisChiffre(i + 1)}`
          }
          texte = `$  ${lettreDepuisChiffre(i + 1)} = ${a}${ecritureAlgebrique(b)}\\div${ecritureParentheseSiNegatif(c)}$`
          texteCorr = `$${aligne}${lettreDepuisChiffre(i + 1)} ${egal} ${a}${miseEnEvidence('~' + ecritureAlgebrique(b) + '\\div' + ecritureParentheseSiNegatif(c), bleuMathalea)}${sepa}${egal} ${a}${ecritureAlgebrique(
            b / c,
          )}${sepa}${egal}${miseEnEvidence(`${a + b / c}`)}${endaligne}$`
          handleAnswers(this, i, { reponse: { value: a + b / c } })
          break
        case 3: // a/b*c
          b = randint(2, 11) * choice([-1, 1])
          c = randint(2, 11) * choice([-1, 1])
          a = b * randint(2, 11) * choice([-1, 1])
          while (a > 0 && b > 0 && c > 0) {
            b = randint(2, 11) * choice([-1, 1])
            c = randint(2, 11) * choice([-1, 1])
            a = b * randint(2, 11) * choice([-1, 1])
          }
          if (this.sup2 === false) {
            sepa += `${lettreDepuisChiffre(i + 1)}`
          }
          texte = `$${lettreDepuisChiffre(i + 1)} = ${a}\\div${ecritureParentheseSiNegatif(b)}\\times${ecritureParentheseSiNegatif(c)}$`
          texteCorr = `$${aligne} ${lettreDepuisChiffre(i + 1)} ${egal} ( ${miseEnEvidence(a + '\\div' + ecritureParentheseSiNegatif(b), bleuMathalea)} )\\times${ecritureParentheseSiNegatif(c)}${sepa}${egal}${
            a / b
          }\\times${ecritureParentheseSiNegatif(c)}${sepa}${egal}${miseEnEvidence(`${(a / b) * c}`)}${endaligne}$`
          handleAnswers(this, i, { reponse: { value: (a / b) * c } })
          break
        case 4: // a*b/c
          if (choice([true, false])) {
            // a est un multiple de c
            c = randint(2, 6) * choice([-1, 1])
            a = c * randint(2, 5) * choice([-1, 1])
            b = randint(2, 6) * choice([-1, 1])
            while (a > 0 && b > 0 && c > 0) {
              c = randint(2, 6) * choice([-1, 1])
              a = c * randint(2, 5) * choice([-1, 1])
              b = randint(2, 6) * choice([-1, 1])
            }
          } else {
            // b est un multiple de c
            c = randint(2, 6) * choice([-1, 1])
            b = c * randint(2, 5) * choice([-1, 1])
            a = randint(2, 6) * choice([-1, 1])
            while (a > 0 && b > 0 && c > 0) {
              c = randint(2, 6) * choice([-1, 1])
              b = c * randint(2, 5) * choice([-1, 1])
              a = randint(2, 6) * choice([-1, 1])
            }
          }
          if (this.sup2 === false) {
            sepa += `${lettreDepuisChiffre(i + 1)}`
          }
          texte = `$${lettreDepuisChiffre(i + 1)} = ${a}\\times${ecritureParentheseSiNegatif(b)}\\div${ecritureParentheseSiNegatif(c)}$`
          texteCorr = `$${aligne}${lettreDepuisChiffre(i + 1)} ${egal} ${miseEnEvidence(a + '\\times' + ecritureParentheseSiNegatif(b), bleuMathalea)}\\div${ecritureParentheseSiNegatif(c)}${sepa}${egal}${
            a * b
          }\\div${ecritureParentheseSiNegatif(c)}${sepa}${egal} ${miseEnEvidence(`${(a * b) / c}`)}${endaligne}$`
          handleAnswers(this, i, { reponse: { value: (a * b) / c } })
          break
        case 5: // a*b+c
          a = randint(2, 11) * choice([-1, 1])
          b = randint(2, 11) * choice([-1, 1])
          c = randint(2, 11) * choice([-1, 1])
          while (a > 0 && b > 0 && c > 0) {
            a = randint(2, 11) * choice([-1, 1])
            b = randint(2, 11) * choice([-1, 1])
            c = randint(2, 11) * choice([-1, 1])
          }
          if (this.sup2 === false) {
            sepa += `${lettreDepuisChiffre(i + 1)}`
          }
          texte = `$${lettreDepuisChiffre(i + 1)} = ${a}\\times${ecritureParentheseSiNegatif(b)}${ecritureAlgebrique(c)}$`
          texteCorr = `$${aligne}${lettreDepuisChiffre(i + 1)} ${egal} ${miseEnEvidence(a + '\\times' + ecritureParentheseSiNegatif(b), bleuMathalea)}${ecritureAlgebrique(c)}${sepa}${egal}${
            a * b
          }${ecritureAlgebrique(c)}${sepa}${egal}${miseEnEvidence(`${a * b + c}`)}${endaligne}$`
          handleAnswers(this, i, { reponse: { value: a * b + c } })
          break
        case 6: // a-b+c
          a = randint(2, 11) * choice([-1, 1])
          b = randint(2, 11) * choice([-1, 1])
          c = randint(2, 11) * choice([-1, 1])
          while (a > 0 && b > 0 && c > 0) {
            a = randint(2, 11) * choice([-1, 1])
            b = randint(2, 11) * choice([-1, 1])
            c = randint(2, 11) * choice([-1, 1])
          }
          if (this.sup2 === false) {
            sepa += `${lettreDepuisChiffre(i + 1)}`
          }
          texte = `$${lettreDepuisChiffre(i + 1)} = ${a}-(${ecritureAlgebrique(b)})${ecritureAlgebrique(c)}$`
          texteCorr = `$${aligne}${lettreDepuisChiffre(i + 1)} ${egal} ${a}${miseEnEvidence(ecritureAlgebrique(-b), bleuMathalea)}${ecritureAlgebrique(c)}${sepa}${egal}${a - b}${ecritureAlgebrique(c)}${sepa}${egal}${miseEnEvidence(`${a - b + c}`)}${endaligne}$`
          handleAnswers(this, i, { reponse: { value: a - b + c } })
          break
        case 7: // a+b+c*d
          a = randint(2, 20) * choice([-1, 1])
          b = randint(2, 20) * choice([-1, 1])
          c = randint(2, 11) * choice([-1, 1])
          d = randint(2, 11) * choice([-1, 1])
          while (a > 0 && b > 0 && c > 0 && d > 0) {
            a = randint(2, 20) * choice([-1, 1])
            b = randint(2, 20) * choice([-1, 1])
            c = randint(2, 11) * choice([-1, 1])
            d = randint(2, 11) * choice([-1, 1])
          }
          if (this.sup2 === false) {
            sepa += `${lettreDepuisChiffre(i + 1)}`
          }
          texte = `$${lettreDepuisChiffre(i + 1)} = ${a}${ecritureAlgebrique(b)}${ecritureAlgebrique(c)}\\times${ecritureParentheseSiNegatif(d)}$`
          texteCorr = `$${aligne}${lettreDepuisChiffre(i + 1)} ${egal} ${a}${ecritureAlgebrique(b)}${miseEnEvidence(
            ecritureAlgebrique(c) + '\\times' + ecritureParentheseSiNegatif(d),
            bleuMathalea,
          )}${sepa}${egal}${a}${ecritureAlgebrique(b)}${ecritureAlgebrique(c * d)}${sepa}${egal}${miseEnEvidence(`${a + b + c * d}`)}${endaligne}$`
          handleAnswers(this, i, { reponse: { value: a + b + c * d } })
          break
        case 8: // a*b+c*d
          a = randint(2, 11) * choice([-1, 1])
          b = randint(2, 11) * choice([-1, 1])
          c = randint(2, 11) * choice([-1, 1])
          d = randint(2, 11) * choice([-1, 1])
          while (a > 0 && b > 0 && c > 0 && d > 0) {
            a = randint(2, 20) * choice([-1, 1])
            b = randint(2, 20) * choice([-1, 1])
            c = randint(2, 11) * choice([-1, 1])
            d = randint(2, 11) * choice([-1, 1])
          }
          if (this.sup2 === false) {
            sepa += `${lettreDepuisChiffre(i + 1)}`
          }
          texte = `$${lettreDepuisChiffre(i + 1)} = ${a}\\times${ecritureParentheseSiNegatif(b)}${ecritureAlgebrique(c)}\\times${ecritureParentheseSiNegatif(d)}$`
          texteCorr = `$${aligne}${lettreDepuisChiffre(i + 1)} ${egal} ${
            a +
            miseEnEvidence('\\times', bleuMathalea) +
            ecritureParentheseSiNegatif(b)
          }${ecritureAlgebrique(c) + miseEnEvidence('\\times', bleuMathalea) + ecritureParentheseSiNegatif(d)}${sepa}${egal}${a * b}${ecritureAlgebrique(c * d)}${sepa}${egal} ${miseEnEvidence(
            `${a * b + c * d}`,
          )}${endaligne}$`
          handleAnswers(this, i, { reponse: { value: a * b + c * d } })
          break
        case 9: // a*b*c+d
          a = randint(2, 5) * choice([-1, 1])
          b = randint(2, 5) * choice([-1, 1])
          c = randint(2, 5) * choice([-1, 1])
          d = randint(2, 11) * choice([-1, 1])
          while (a > 0 && b > 0 && c > 0 && d > 0) {
            a = randint(2, 5) * choice([-1, 1])
            b = randint(2, 5) * choice([-1, 1])
            c = randint(2, 5) * choice([-1, 1])
            d = randint(2, 11) * choice([-1, 1])
          }
          if (this.sup2 === false) {
            sepa += `${lettreDepuisChiffre(i + 1)}`
          }
          texte = `$${lettreDepuisChiffre(i + 1)} = ${a}\\times${ecritureParentheseSiNegatif(b)}\\times${ecritureParentheseSiNegatif(c)}${ecritureAlgebrique(d)}$`
          texteCorr = `$${aligne}${lettreDepuisChiffre(i + 1)} ${egal} ${miseEnEvidence(
            a + '\\times' + ecritureParentheseSiNegatif(b),
            bleuMathalea,
          )}\\times${ecritureParentheseSiNegatif(c)}${ecritureAlgebrique(d)}${sepa}${egal}${miseEnEvidence(a * b + '\\times' + ecritureParentheseSiNegatif(c), bleuMathalea)}${ecritureAlgebrique(d)}
          ${sepa}${egal}${a * b * c}${ecritureAlgebrique(d)}
          ${sepa}${egal} ${miseEnEvidence(`${a * b * c + d}`)}${endaligne}$`
          handleAnswers(this, i, { reponse: { value: a * b * c + d } })
          break
        case 10:
          a = randint(2, 11) * choice([-1, 1])
          b = randint(2, 11) * choice([-1, 1])
          d = randint(2, 11) * choice([-1, 1])
          c = d * randint(2, 8) * choice([-1, 1])
          if (this.sup2 === false) {
            sepa += `${lettreDepuisChiffre(i + 1)}`
          }
          texte = `$${lettreDepuisChiffre(i + 1)} = ${a}\\times${ecritureParentheseSiNegatif(b)}${ecritureAlgebrique(c)}\\div${ecritureParentheseSiNegatif(d)}$`
          texteCorr = `$${aligne}${lettreDepuisChiffre(i + 1)} ${egal} ${
            a +
            miseEnEvidence('\\times', bleuMathalea) +
            ecritureParentheseSiNegatif(b) +
            ecritureAlgebrique(c) +
            miseEnEvidence('\\div', bleuMathalea) +
            ecritureParentheseSiNegatif(d)
          }${sepa}${egal}${a * b}${ecritureAlgebrique(c / d)}${sepa}${egal}${miseEnEvidence(`${a * b + c / d}`)}${endaligne}$`
          handleAnswers(this, i, { reponse: { value: a * b + c / d } })
          break
        case 11: // a*(b+c)
          a = randint(2, 11) * choice([-1, 1])
          b = randint(1, 11) * choice([-1, 1])
          c = randint(1, 11) * choice([-1, 1])
          while (a > 0 && b > 0 && c > 0) {
            a = randint(2, 11) * choice([-1, 1])
            b = randint(1, 11) * choice([-1, 1])
            c = randint(1, 11) * choice([-1, 1])
          }
          if (this.sup2 === false) {
            sepa += `${lettreDepuisChiffre(i + 1)}`
          }
          texte = `$${lettreDepuisChiffre(i + 1)} = ${a}\\times(${b}${ecritureAlgebrique(c)})$`
          texteCorr = `$${aligne}${lettreDepuisChiffre(i + 1)} ${egal} ${a}\\times(${miseEnEvidence(b + ecritureAlgebrique(c), bleuMathalea)})${sepa}${egal}${a}\\times${ecritureParentheseSiNegatif(b + c)}${sepa}${egal}${miseEnEvidence(`${a * (b + c)}`)}${endaligne}$`
          handleAnswers(this, i, { reponse: { value: a * (b + c) } })
          break
        case 12: // (a+b)*c
          a = randint(1, 11) * choice([-1, 1])
          b = randint(1, 11) * choice([-1, 1])
          c = randint(2, 11) * choice([-1, 1])
          while (a > 0 && b > 0 && c > 0) {
            a = randint(1, 11) * choice([-1, 1])
            b = randint(1, 11) * choice([-1, 1])
            c = randint(2, 11) * choice([-1, 1])
          }
          if (this.sup2 === false) {
            sepa += `${lettreDepuisChiffre(i + 1)}`
          }
          texte = `$${lettreDepuisChiffre(i + 1)} = (${a}${ecritureAlgebrique(b)})\\times${ecritureParentheseSiNegatif(c)}$`
          texteCorr = `$${aligne}${lettreDepuisChiffre(i + 1)} ${egal} (${miseEnEvidence(a + ecritureAlgebrique(b), bleuMathalea)})\\times${ecritureParentheseSiNegatif(c)}${sepa}${egal}${a + b}\\times${ecritureParentheseSiNegatif(c)}${sepa}${egal}${miseEnEvidence(`${(a + b) * c}`)}${endaligne}$`
          handleAnswers(this, i, { reponse: { value: (a + b) * c } })
          break
        case 13: // (a+b)/c
          c = randint(2, 11) * choice([-1, 1])
          b = randint(11, 39) * choice([-1, 1])
          a = c * randint(2, 9) * choice([-1, 1]) - b
          while (a > 0 && b > 0 && c > 0) {
            c = randint(2, 11) * choice([-1, 1])
            b = randint(11, 39) * choice([-1, 1])
            a = c * randint(2, 9) * choice([-1, 1]) - b
          }
          if (this.sup2 === false) {
            sepa += `${lettreDepuisChiffre(i + 1)}`
          }
          texte = `$${lettreDepuisChiffre(i + 1)} = (${a}${ecritureAlgebrique(b)})\\div${ecritureParentheseSiNegatif(c)}$`
          texteCorr = `$${aligne}${lettreDepuisChiffre(i + 1)} ${egal} (${miseEnEvidence(a + ecritureAlgebrique(b), bleuMathalea)})\\div${ecritureParentheseSiNegatif(c)}${sepa}${egal}${
            a + b
          }\\div${ecritureParentheseSiNegatif(c)}${sepa}${egal}${miseEnEvidence(`${(a + b) / c}`)}${endaligne}$`
          handleAnswers(this, i, { reponse: { value: (a + b) / c } })
          break
        case 14: // a/(b+c)
          b = randint(-5, 5, [-1, 0, 1])
          c = randint(-6, 6, [-1, 0, 1, -b])
          a = (b + c) * randint(2, 9) * choice([-1, 1])
          while (a > 0 && b > 0 && c > 0) {
            b = randint(-5, 5, [-1, 0, 1])
            c = randint(-6, 6, [-1, 0, 1, -b])
            a = (b + c) * randint(2, 9) * choice([-1, 1])
          }
          if (this.sup2 === false) {
            sepa += `${lettreDepuisChiffre(i + 1)}`
          }
          texte = `$${lettreDepuisChiffre(i + 1)} = ${a}\\div(${b}${ecritureAlgebrique(c)})$`
          texteCorr = `$${aligne}${lettreDepuisChiffre(i + 1)} ${egal} ${a}\\div(${miseEnEvidence(b + ecritureAlgebrique(c), bleuMathalea)})${sepa}${egal}${a}\\div${ecritureParentheseSiNegatif(b + c)}${sepa}${egal}${miseEnEvidence(`${a / (b + c)}`)}${endaligne}$`
          handleAnswers(this, i, { reponse: { value: a / (b + c) } })
          break
        case 15: // a(b+c)*d
          c = randint(11, 39) * choice([-1, 1])
          b = randint(2, 5) * choice([-1, 1]) - c
          a = randint(2, 5) * choice([-1, 1])
          d = randint(2, 5) * choice([-1, 1])
          while (a > 0 && b > 0 && c > 0 && d > 0) {
            c = randint(11, 39) * choice([-1, 1])
            b = (randint(2, 5) - c) * choice([-1, 1])
            a = randint(2, 5) * choice([-1, 1])
            d = randint(2, 5) * choice([-1, 1])
          }
          if (this.sup2 === false) {
            sepa += `${lettreDepuisChiffre(i + 1)}`
          }
          texte = `$${lettreDepuisChiffre(i + 1)} = ${a}\\times(${b}${ecritureAlgebrique(c)})\\times${ecritureParentheseSiNegatif(d)}$`
          texteCorr = `$${aligne}${lettreDepuisChiffre(i + 1)} ${egal} ${a}\\times(${miseEnEvidence(b + ecritureAlgebrique(c), bleuMathalea)})\\times${ecritureParentheseSiNegatif(d)}${sepa}${egal}${a}\\times${ecritureParentheseSiNegatif(b + c)}\\times${ecritureParentheseSiNegatif(d)}${sepa}${egal}${miseEnEvidence(`${a * (b + c) * d}`)}${endaligne}$`
          handleAnswers(this, i, { reponse: { value: a * (b + c) * d } })
          break
        case 16: // a*b*(c+d)
          d = randint(11, 39) * choice([-1, 1])
          c = randint(2, 5) * choice([-1, 1]) - d
          a = randint(2, 5) * choice([-1, 1])
          b = randint(2, 5) * choice([-1, 1])
          while (a > 0 && b > 0 && c > 0 && d > 0) {
            d = randint(11, 39) * choice([-1, 1])
            c = randint(2, 5) * choice([-1, 1]) - d
            a = randint(2, 5) * choice([-1, 1])
            b = randint(2, 5) * choice([-1, 1])
          }
          if (this.sup2 === false) {
            sepa += `${lettreDepuisChiffre(i + 1)}`
          }
          texte = `$${lettreDepuisChiffre(i + 1)} = ${a}\\times${ecritureParentheseSiNegatif(b)}\\times(${c}${ecritureAlgebrique(d)})$`
          texteCorr = `$${aligne}${lettreDepuisChiffre(i + 1)} ${egal} ${a}\\times${ecritureParentheseSiNegatif(b)}\\times(${miseEnEvidence(
            c + ecritureAlgebrique(d),
            bleuMathalea,
          )})${sepa}${egal}${a}\\times${ecritureParentheseSiNegatif(b)}\\times${ecritureParentheseSiNegatif(c + d)}${sepa}${egal}${miseEnEvidence(`${a * b * (c + d)}`)}${endaligne}$`
          handleAnswers(this, i, { reponse: { value: a * b * (c + d) } })
          break
        case 17: // a*(b/c+d)
          a = randint(2, 11) * choice([-1, 1])
          c = randint(2, 11) * choice([-1, 1])
          b = c * randint(2, 5) * choice([-1, 1])
          d = randint(2, 6) * choice([-1, 1])
          if (this.sup2 === false) {
            sepa += `${lettreDepuisChiffre(i + 1)}`
          }
          texte = `$${lettreDepuisChiffre(i + 1)} = ${a}\\times(${b}\\div${ecritureParentheseSiNegatif(c)}${ecritureAlgebrique(d)})$`
          texteCorr = `$${aligne}${lettreDepuisChiffre(i + 1)} ${egal} ${a}\\times(${miseEnEvidence(
            b + '\\div' + ecritureParentheseSiNegatif(c),
            bleuMathalea,
          )}${ecritureAlgebrique(d)})${sepa}${egal}${a}\\times(${miseEnEvidence(
            b / c + ecritureAlgebrique(d),
            bleuMathalea,
          )})${sepa}${egal}${a}\\times${ecritureParentheseSiNegatif(b / c + d)}${sepa}${egal}${miseEnEvidence(`${a * (b / c + d)}`)}${endaligne}$`
          handleAnswers(this, i, { reponse: { value: a * (b / c + d) } })
          break
        case 18:
          {
            // a*b/(c+d)
            a = randint(2, 11)
            b = randint(2, 11)
            while (listeDesDiviseurs(a * b).length < 5) {
              a = randint(2, 11)
              b = randint(2, 11)
            }
            const liste = listeDesDiviseurs(a * b)
            if (liste.length > 2) {
              liste.pop() // on supprime le plus grand diviseur qui est le produit
              enleveElement(liste, a) // on supprime a
              enleveElement(liste, b) // on supprime b
            }
            const somme = choice(liste, [1]) * choice([-1, 1]) // la somme doit être un diviseur différent de 1
            c = randint(-30, 30, [0])
            d = somme - c
            while (a > 0 && b > 0 && c > 0 && d > 0) {
              c = randint(-30, 30, [0])
              d = somme - c
              a *= choice([-1, 1])
              b *= choice([-1, 1])
            }
            if (this.sup2 === false) {
              sepa += `${lettreDepuisChiffre(i + 1)}`
            }
            texte = `$${lettreDepuisChiffre(i + 1)} = ${a}\\times${ecritureParentheseSiNegatif(b)}\\div(${c}${ecritureAlgebrique(d)})$`
            texteCorr = `$${aligne}${lettreDepuisChiffre(i + 1)} ${egal} ${a}\\times${ecritureParentheseSiNegatif(b)}\\div(${miseEnEvidence(
              c + ecritureAlgebrique(d),
              bleuMathalea,
            )})${sepa}${egal}${miseEnEvidence(a + '\\times' + ecritureParentheseSiNegatif(b), bleuMathalea)}\\div${ecritureParentheseSiNegatif(c + d)}${sepa}${egal}${
              a * b
            }\\div${ecritureParentheseSiNegatif(c + d)}${sepa}${egal}${miseEnEvidence(`${(a * b) / (c + d)}`)}${endaligne}$`
            handleAnswers(this, i, { reponse: { value: (a * b) / (c + d) } })
          }
          break
        case 19: // a-(b+c)
          a = randint(1, 9) * choice([-1, 1])
          b = randint(1, 9) * choice([-1, 1])
          c = randint(1, 9) * choice([-1, 1])
          while (a > 0 && b > 0 && c > 0) {
            a = randint(1, 9) * choice([-1, 1])
            b = randint(1, 9) * choice([-1, 1])
            c = randint(1, 9) * choice([-1, 1])
          }
          if (this.sup2 === false) {
            sepa += `${lettreDepuisChiffre(i + 1)}`
          }
          texte = `$${lettreDepuisChiffre(i + 1)} = ${a}-(${b}${ecritureAlgebrique(c)})$`
          texteCorr = `$${aligne}${lettreDepuisChiffre(i + 1)} ${egal} ${a}-(${miseEnEvidence(b + ecritureAlgebrique(c), bleuMathalea)})${sepa}${egal}${a}-(${ecritureAlgebrique(b + c)})${sepa}${egal}${a + ecritureAlgebrique(-b - c)}${sepa}${egal}${miseEnEvidence(`${a - b - c}`)}${endaligne}$`
          handleAnswers(this, i, { reponse: { value: a - b - c } })
          break
        case 20: // (a+b+c)*d
        default:
          a = randint(1, 9) * choice([-1, 1])
          b = randint(1, 9) * choice([-1, 1])
          c = randint(1, 9) * choice([-1, 1])
          d = randint(2, 5) * choice([-1, 1])
          while (a > 0 && b > 0 && c > 0) {
            a = randint(1, 9) * choice([-1, 1])
            b = randint(1, 9) * choice([-1, 1])
            c = randint(1, 9) * choice([-1, 1])
          }
          if (this.sup2 === false) {
            sepa += `${lettreDepuisChiffre(i + 1)}`
          }
          texte = `$${lettreDepuisChiffre(i + 1)} = (${a + ecritureAlgebrique(b) + ecritureAlgebrique(c)})\\times${ecritureParentheseSiNegatif(d)}$`
          texteCorr = `$${aligne}${lettreDepuisChiffre(i + 1)} ${egal} (${miseEnEvidence(a + ecritureAlgebrique(b) + ecritureAlgebrique(c), bleuMathalea)})\\times${ecritureParentheseSiNegatif(d)}${sepa}${egal}${a + b + c}\\times${ecritureParentheseSiNegatif(d)}${sepa}${egal}${miseEnEvidence(`${(a + b + c) * d}`)}${endaligne} $`
          handleAnswers(this, i, { reponse: { value: (a + b + c) * d } })
          break
      }
      texte += addPossibleMultiLinesAnswer(this, i, {
        prefix: `${lettreDepuisChiffre(i + 1)} =`,
        style: KeyboardType.clavierDeBaseAvecFraction,
        bareme: baremeMultiLignes(this.sup3),
      })
      if (this.questionJamaisPosee(i, listeTypeDeQuestions[i], a, b, c)) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
