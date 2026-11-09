import {
  isEqual,
  noSquareRootInDenominator,
  seq,
} from '../../lib/interactif/checks'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { texFractionFromString } from '../../lib/outils/deprecatedFractions'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { abs } from '../../lib/outils/nombres'
import { lettreIndiceeDepuisChiffre, sp } from '../../lib/outils/outilString'
import { pgcd } from '../../lib/outils/primalite'
import FractionEtendue from '../../modules/FractionEtendue'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Simplifier une fraction pour supprimer la racine carrée de son dénominateur'
export const dateDeModifImportante = '30/10/2026'
export const interactifReady = true

/**
 *
 * @author Stéphane Guyon
 */
export const uuid = '4771d'

export const refs = {
  'fr-fr': ['2N51-6'],
  'fr-ch': ['1mCN-12'],
}
export default class Rendreentier extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets :',
        '1 : Dénominateur «\u00a0racine de a\u00a0»',
        '2 : Dénominateur «\u00a0a + racine de b\u00a0»',
        '3 : Dénominateur «\u00a0a + b racine de x\u00a0»',
        '4 : Mélange',
      ].join('\n'),
    ]
    this.nbQuestions = 1
    this.nbCols = 2
    this.nbColsCorr = 2
    this.sup = 2
    this.listeAvecNumerotation = false
  }

  nouvelleVersion() {
    this.consigne =
      ' Trouver une fraction égale à celle proposée en supprimant la racine carrée de son dénominateur.'

    const listeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 4,
      nbQuestions: this.nbQuestions,
    }).map(Number)

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const a = randint(2, 11)
      const b = randint(2, 11, [a, 4, 8, 9])
      const c = randint(2, 9)
      const d = randint(-7, 7, [-1, 0, 1])
      let n = 0
      let reponse = ''
      let texte = ''
      let texteCorr = ''
      switch (listeQuestions[i]) {
        case 1:
          n = pgcd(a, b)
          texte = `$${lettreIndiceeDepuisChiffre(i + 1)}=\\dfrac{ ${a} }{\\sqrt{${b}}} $`
          reponse = texFractionFromString(a + `\\sqrt{${b}}`, b)
          texteCorr = `Pour lever l'irrationalité du dénominateur, il suffit de multiplier le numérateur et le dénominateur de la fraction par $\\sqrt{${b}}$.`
          texteCorr += `<br>$${lettreIndiceeDepuisChiffre(i + 1)}=\\dfrac{ ${a} }{\\sqrt{${b}}}=\\dfrac{ ${a} \\times \\sqrt{${b}}} {\\sqrt{${b}} \\times \\sqrt{${b}}} $`
          texteCorr += `<br><br>$${lettreIndiceeDepuisChiffre(i + 1)}=${n !== 1 ? reponse : miseEnEvidence(reponse)}$`
          if (n !== 1) {
            if (b === n && a === n)
              reponse = texFractionFromString(`\\sqrt{${b}}`, 1)
            else if (b === n)
              reponse = texFractionFromString(`${a / n}\\sqrt{${b}}`, 1)
            else if (a === n)
              reponse = texFractionFromString(`\\sqrt{${b}}`, `${b / n}`)
            else
              reponse = texFractionFromString(
                `${a / n} \\sqrt{${b}}`,
                `${b / n}`,
              )
            texteCorr += `<br><br> $${lettreIndiceeDepuisChiffre(i + 1)}=${miseEnEvidence(reponse)}$`
          }
          break
        case 2:
          texte = `$${lettreIndiceeDepuisChiffre(i + 1)}=\\dfrac{ ${a} }{${c}${ecritureAlgebrique(d)}\\sqrt{${b}}} $ `
          texteCorr =
            "Pour lever l'irrationalité du dénominateur d'une fraction, la stratégie consiste à utiliser sa «\u00a0quantité conjuguée\u00a0» pour faire apparaître l'identité remarquable $a^2-b^2$ au dénominateur."
          texteCorr +=
            '<br>Ici, il faut donc multiplier le numérateur et le dénominateur de la fraction par '
          texteCorr += ` $${c}${ecritureAlgebrique(-d)}\\sqrt{${b}}$.`
          texteCorr += `<br><br>$${lettreIndiceeDepuisChiffre(i + 1)}=\\dfrac{ ${a} }{${c}${ecritureAlgebrique(d)}\\sqrt{${b}}}$`
          texteCorr += `<br><br>$${lettreIndiceeDepuisChiffre(i + 1)}=\\dfrac{ ${a}\\times (${c}${ecritureAlgebrique(-d)}\\sqrt{${b}}) }{(${c}${ecritureAlgebrique(d)}\\sqrt{${b}})(${c}${ecritureAlgebrique(-d)}\\sqrt{${b}})}$`
          texteCorr += `<br><br>$${lettreIndiceeDepuisChiffre(i + 1)}=\\dfrac{ ${a * c} ${ecritureAlgebrique(-a * d)}\\sqrt{${b}}}{(${c})^2-\\left(${abs(d)}\\sqrt{${b}}\\right)^2}$ `
          texteCorr += `<br><br>$${lettreIndiceeDepuisChiffre(i + 1)}=\\dfrac{ ${a * c} ${ecritureAlgebriqueSauf1(-a * d)}\\sqrt{${b}}}{${c * c}-(${d * d}\\times${b})}$`
          texteCorr += `<br><br>$${lettreIndiceeDepuisChiffre(i + 1)}=\\dfrac{ ${a * c} ${ecritureAlgebriqueSauf1(-a * d)}\\sqrt{${b}}}{${c * c}-${d * d * b}}$`
          n = pgcd(a * c, -a * d, c * c - d * d * b)
          if (n === 1) {
            reponse = texFractionFromString(
              `${a * c} ${ecritureAlgebriqueSauf1(-a * d)}\\sqrt{${b}}`,
              c * c - d * d * b,
            )
            texteCorr += `<br><br>$${lettreIndiceeDepuisChiffre(i + 1)}=${c * c - d * d * b < 0 ? reponse : miseEnEvidence(reponse)}$`
            if (c * c - d * d * b < 0) {
              reponse = texFractionFromString(
                `${-a * c} ${ecritureAlgebriqueSauf1(a * d)}\\sqrt{${b}}`,
                -c * c + d * d * b,
              )
              texteCorr += `<br><br>$${lettreIndiceeDepuisChiffre(i + 1)}=${miseEnEvidence(reponse)}$`
            }
          } else {
            texteCorr += `<br><br>$${lettreIndiceeDepuisChiffre(i + 1)}=\\dfrac{ ${a * c} ${ecritureAlgebriqueSauf1(-a * d)}\\sqrt{${b}}}{${c * c - d * d * b}}$`
            reponse = texFractionFromString(
              `${(a * c) / n} ${ecritureAlgebriqueSauf1((-a * d) / n)}\\sqrt{${b}}`,
              (c * c) / n - (d * d * b) / n,
            )
            texteCorr += `<br><br>$${lettreIndiceeDepuisChiffre(i + 1)}=${c * c - d * d * b < 0 ? reponse : miseEnEvidence(reponse)}$`
            if (c * c - d * d * b < 0) {
              reponse = texFractionFromString(
                `${(-a * c) / n} ${ecritureAlgebriqueSauf1((a * d) / n)}\\sqrt{${b}}`,
                (-c * c) / n + (d * d * b) / n,
              )
              texteCorr += `<br><br>$${lettreIndiceeDepuisChiffre(i + 1)}=${miseEnEvidence(reponse)}$`
            }
          }
          break
        case 3:
        default: {
          const d = randint(2, 9)

          texte = `$${lettreIndiceeDepuisChiffre(i + 1)}=\\dfrac{ ${a} }{${c}${ecritureAlgebrique(d)}\\sqrt{x}} $ définie sur $D=\\left]${new FractionEtendue(c ** 2, d ** 2).texFSD};+\\infty\\right[$`
          texteCorr =
            "Pour lever l'irrationalité du dénominateur d'une fraction, la stratégie consiste à utiliser sa «\u00a0quantité conjuguée\u00a0» pour faire apparaître l'identité remarquable $a^2-b^2$ au dénominateur."
          texteCorr +=
            '<br>Ici, il faut donc multiplier le numérateur et le dénominateur de la fraction par '
          texteCorr += ` $ ${c}${ecritureAlgebrique(-d)}\\sqrt{x}$.<br>`
          texteCorr +=
            "On vérifie bien que cette expression ne s'annule pas sur $D$ :<br>"
          texteCorr += ` $\\begin{aligned} \\phantom{\\iff} &${c}${ecritureAlgebrique(-d)}\\sqrt{x}=0\\\\`
          texteCorr += ` \\iff & ${d}\\sqrt{x}=${c}\\\\`
          const fractionAttendue = new FractionEtendue(c, d)
          texteCorr +=
            fractionAttendue.d === fractionAttendue.den
              ? ''
              : ` \\iff & \\sqrt{x}=${fractionAttendue.texFSD}\\\\`
          texteCorr += ` \\iff & \\sqrt{x}=${fractionAttendue.texFractionSimplifiee}\\\\`
          texteCorr += ` \\iff & x=${new FractionEtendue(c ** 2, d ** 2).texFractionSimplifiee}\\\\`
          texteCorr += '\\end{aligned}$'
          texteCorr += `<br>Comme $${new FractionEtendue(c ** 2, d ** 2).texFractionSimplifiee} \\notin D$, la «${sp()}quantité conjuguée${sp()}» $${c}${ecritureAlgebrique(-d)}\\sqrt{x}$ ne s'annule pas sur $D$.`
          texteCorr += "<br>On peut donc simplifier l'expression :"
          texteCorr += `<br><br>$${lettreIndiceeDepuisChiffre(i + 1)}=\\dfrac{ ${a} }{${c}${ecritureAlgebrique(d)}\\sqrt{x}}$`
          texteCorr += `<br><br>$${lettreIndiceeDepuisChiffre(i + 1)}=\\dfrac{ ${a}\\times (${c}${ecritureAlgebrique(-d)}\\sqrt{x}) }{(${c}${ecritureAlgebrique(d)}\\sqrt{x})(${c}${ecritureAlgebrique(-d)}\\sqrt{x})}$`
          texteCorr += `<br><br>$${lettreIndiceeDepuisChiffre(i + 1)}=\\dfrac{ ${a * c} ${ecritureAlgebrique(-a * d)}\\sqrt{x}}{(${c})^2-\\left(${abs(d)}\\sqrt{x}\\right)^2}$ `
          reponse = texFractionFromString(
            `${a * c} ${ecritureAlgebriqueSauf1(-a * d)}\\sqrt{x}`,
            `${c * c}-${d * d} x`,
          )
          n = pgcd(a * d, c * c, d * d, a * c)
          texteCorr += `<br><br>$${lettreIndiceeDepuisChiffre(i + 1)}=${n !== 1 ? reponse : miseEnEvidence(reponse)}$`
          if (n !== 1) {
            reponse = texFractionFromString(
              `${(a * c) / n} ${ecritureAlgebriqueSauf1((-a * d) / n)}\\sqrt{x}`,
              `${(c * c) / n}${ecritureAlgebriqueSauf1((-d * d) / n)}x`,
            )
            texteCorr += `$${lettreIndiceeDepuisChiffre(i + 1)}=${miseEnEvidence(reponse)}$`
          }
        }
      }
      texte += ajouteChampTexteMathLive(
        this,
        i,
        KeyboardType.clavierFullOperations,
        {
          texteAvant:
            listeQuestions[i] < 3
              ? `$${sp()}=$`
              : `<br><br>$${lettreIndiceeDepuisChiffre(i + 1)}=$`,
        },
      )
      handleAnswers(this, i, {
        reponse: {
          value: reponse,
          compare: seq([isEqual(), noSquareRootInDenominator()]),
        },
      })

      if (this.questionJamaisPosee(i, a, b, c, d)) {
        // <- laisser  le i et ajouter toutes les variables qui rendent les exercices différents (par exemple a, b, c et d)
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
