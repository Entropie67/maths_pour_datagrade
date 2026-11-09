import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  reduireAxPlusB,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { lettreDepuisChiffre, sp } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import {
  listeQuestionsToContenuSansNumero,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

import { bleuMathalea, vertMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'

export const titre = 'Factoriser une expression complexe'
export const interactifReady = true

export const dateDePublication = '22/05/2021'

/**
 * Factoriser avec un facteur commun évident des expressions complexes
 * @author Jean-claude Lhote
 */
export const uuid = '51360'

export const refs = {
  'fr-fr': ['3L11-6', 'BP2AutoI22'],
  'fr-ch': ['11LSFA3H-4'],
}
export default class FactoriserUneExpression3e extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Type de facteurs non communs',
      3,
      '1 : Facteurs non communs simples\n2 : Facteurs non communs de la forme ax + b\n3 : Mélange',
    ]
    this.besoinFormulaire2Numerique = [
      "Type d'expression",
      3,
      '1 : Somme\n2 : Différence\n3 : Mélange',
    ]
    this.nbQuestions = 5
    this.nbCols = 2
    this.nbColsCorr = 2
    this.sup = 1
    this.sup2 = 3
    this.correctionDetailleeDisponible = true
    this.correctionDetaillee = true
    this.spacing = context.isHtml ? 3 : 2
    this.spacingCorr = context.isHtml ? 3 : 2

    this.listeAvecNumerotation = false
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions > 1
        ? 'Factoriser les expressions suivantes.'
        : "Factoriser l'expression suivante."
    const typesDeQuestionsDisponibles = []
    if (this.sup % 2 === 1) {
      if (this.sup2 % 2 === 1) {
        typesDeQuestionsDisponibles.push(
          'c(ax+b)+x(ax+b)',
          'x(ax+b)+c(ax+b)',
          'c(ax+b)+x(ax+b)',
          'x(ax+b)+c(ax+b)',
        )
      }
      if (this.sup2 > 1) {
        typesDeQuestionsDisponibles.push(
          'c(ax+b)-x(ax+b)',
          'x(ax+b)-c(ax+b)',
          'c(ax+b)-x(ax+b)',
          'x(ax+b)-c(ax+b)',
        )
      }
    }
    if (this.sup > 1) {
      if (this.sup2 % 2 === 1) {
        typesDeQuestionsDisponibles.push(
          '(ax+b)(cx+d)+(ax+b)(ex+f)',
          '(cx+d)(ax+b)+(ax+b)(ex+f)',
          '(ax+b)(cx+d)+(ex+f)(ax+b)',
          '(cx+d)(ax+b)+(ex+f)(ax+b)',
        )
      }
      if (this.sup2 > 1) {
        typesDeQuestionsDisponibles.push(
          '(ax+b)(cx+d)-(ax+b)(ex+f)',
          '(cx+d)(ax+b)-(ax+b)(ex+f)',
          '(ax+b)(cx+d)-(ex+f)(ax+b)',
          '(cx+d)(ax+b)-(ex+f)(ax+b)',
        )
      }
    }
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posées mais l'ordre diffère à chaque "cycle"
    for (
      let i = 0, texte, texteCorr, a, b, c, d, e, f, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      texte = ''
      texteCorr = ''
      a = randint(1, 3)
      b = randint(1, 5) * choice([-1, 1])
      c = randint(2, 5)
      d = randint(2, 5, c) * choice([-1, 1])
      e = randint(1, 6, c)
      f = randint(1, 5, Math.abs(d)) * choice([-1, 1])
      switch (listeTypeDeQuestions[i]) {
        case 'c(ax+b)+x(ax+b)':
          texte = `$${lettreDepuisChiffre(i + 1)} = ${c}(${rienSi1(a)}x${ecritureAlgebrique(b)})+x(${rienSi1(a)}x${ecritureAlgebrique(b)})$`
          texteCorr = texte
          if (this.correctionDetaillee) {
            texteCorr += `${sp(2)}On remarque que $(${rienSi1(a)}x${ecritureAlgebrique(b)})$ est un facteur commun.`
            texteCorr += `<br>$\\phantom{ABC}=${miseEnEvidence(c, bleuMathalea)}${miseEnEvidence('(' + rienSi1(a) + 'x' + ecritureAlgebrique(b) + ')', vertMathalea)}+${miseEnEvidence('x', bleuMathalea)}${miseEnEvidence('(' + rienSi1(a) + 'x' + ecritureAlgebrique(b) + ')', vertMathalea)}$`
            texteCorr += `<br>$\\phantom{ABC}=${miseEnEvidence('(' + rienSi1(a) + 'x' + ecritureAlgebrique(b) + ')' + '(' + c + '+x)')}$<br>`
          } else {
            texteCorr += `<br>$\\phantom{ABC}=(${rienSi1(a)}x${ecritureAlgebrique(b)})(${c}+x)$<br>`
          }
          handleAnswers(this, i, {
            reponse: {
              value: `(${reduireAxPlusB(1, c)})(${reduireAxPlusB(a, b)})`,
              options: { factorisation: true },
            },
          })
          break
        case 'c(ax+b)-x(ax+b)':
          texte = `$${lettreDepuisChiffre(i + 1)} = ${c}(${rienSi1(a)}x${ecritureAlgebrique(b)})-x(${rienSi1(a)}x${ecritureAlgebrique(b)})$`
          texteCorr = texte
          if (this.correctionDetaillee) {
            texteCorr += `${sp(2)}On remarque que $(${rienSi1(a)}x${ecritureAlgebrique(b)})$ est un facteur commun.`
            texteCorr += `<br>$\\phantom{ABC}=${miseEnEvidence(c, bleuMathalea)}${miseEnEvidence('(' + rienSi1(a) + 'x' + ecritureAlgebrique(b) + ')', vertMathalea)}-${miseEnEvidence('x', bleuMathalea)}${miseEnEvidence('(' + rienSi1(a) + 'x' + ecritureAlgebrique(b) + ')', vertMathalea)}$`
            texteCorr += `<br>$\\phantom{ABC}=${miseEnEvidence('(' + rienSi1(a) + 'x' + ecritureAlgebrique(b) + ')' + '(' + c + '-x)')}$<br>`
          } else {
            texteCorr += `<br>$\\phantom{ABC}=(${rienSi1(a)}x${ecritureAlgebrique(b)})(${c}-x)$<br>`
          }
          handleAnswers(this, i, {
            reponse: {
              value: `(${reduireAxPlusB(-1, c)})(${reduireAxPlusB(a, b)})`,
              options: { factorisation: true },
            },
          })
          break
        case 'x(ax+b)+c(ax+b)':
          texte = `$${lettreDepuisChiffre(i + 1)} = x(${rienSi1(a)}x${ecritureAlgebrique(b)})+${c}(${rienSi1(a)}x${ecritureAlgebrique(b)})$`
          texteCorr = texte
          if (this.correctionDetaillee) {
            texteCorr += `${sp(2)}On remarque que $(${rienSi1(a)}x${ecritureAlgebrique(b)})$ est un facteur commun.`
            texteCorr += `<br>$\\phantom{ABC}=${miseEnEvidence('x', bleuMathalea)}${miseEnEvidence('(' + rienSi1(a) + 'x' + ecritureAlgebrique(b) + ')', vertMathalea)}+${miseEnEvidence(c, bleuMathalea)}${miseEnEvidence('(' + rienSi1(a) + 'x' + ecritureAlgebrique(b) + ')', vertMathalea)}$`
            texteCorr += `<br>$\\phantom{ABC}=${miseEnEvidence('(' + rienSi1(a) + 'x' + ecritureAlgebrique(b) + ')' + '(x+' + c + ')')}$<br>`
          } else {
            texteCorr += `<br>$\\phantom{ABC}=(${rienSi1(a)}x${ecritureAlgebrique(b)})(x+${c})$<br>`
          }
          handleAnswers(this, i, {
            reponse: {
              value: `(${reduireAxPlusB(a, b)})(${reduireAxPlusB(1, c)})`,
              options: { factorisation: true },
            },
          })
          break
        case 'x(ax+b)-c(ax+b)':
          texte = `$${lettreDepuisChiffre(i + 1)} = x(${rienSi1(a)}x${ecritureAlgebrique(b)})-${c}(${rienSi1(a)}x${ecritureAlgebrique(b)})$`
          texteCorr = texte
          if (this.correctionDetaillee) {
            texteCorr += `${sp(2)}On remarque que $(${rienSi1(a)}x${ecritureAlgebrique(b)})$ est un facteur commun.`
            texteCorr += `<br>$\\phantom{ABC}=${miseEnEvidence('x', bleuMathalea)}${miseEnEvidence('(' + rienSi1(a) + 'x' + ecritureAlgebrique(b) + ')', vertMathalea)}-${miseEnEvidence(c, bleuMathalea)}${miseEnEvidence('(' + rienSi1(a) + 'x' + ecritureAlgebrique(b) + ')', vertMathalea)}$`
            texteCorr += `<br>$\\phantom{ABC}=${miseEnEvidence('(' + rienSi1(a) + 'x' + ecritureAlgebrique(b) + ')' + '(x-' + c + ')')}$<br>`
          } else {
            texteCorr += `<br>$\\phantom{ABC}=(${rienSi1(a)}x${ecritureAlgebrique(b)})(x-${c})$<br>`
          }
          handleAnswers(this, i, {
            reponse: {
              value: `(${reduireAxPlusB(1, -c)})(${reduireAxPlusB(a, b)})`,
              options: { factorisation: true },
            },
          })
          break
        case '(ax+b)(cx+d)+(ax+b)(ex+f)':
          texte = `$${lettreDepuisChiffre(i + 1)}=(${rienSi1(a)}x${ecritureAlgebrique(b)})(${c}x${ecritureAlgebrique(d)})+(${rienSi1(a)}x${ecritureAlgebrique(b)})(${rienSi1(e)}x${ecritureAlgebrique(f)})$`
          texteCorr = texte
          if (this.correctionDetaillee) {
            texteCorr += `<br>On remarque que $(${rienSi1(a)}x${ecritureAlgebrique(b)})$ est un facteur commun.`
            texteCorr += `<br>$${lettreDepuisChiffre(i + 1)}=${miseEnEvidence('(' + rienSi1(a) + 'x' + ecritureAlgebrique(b) + ')', vertMathalea)}${miseEnEvidence('(' + c + 'x' + ecritureAlgebrique(d) + ')', bleuMathalea)}+${miseEnEvidence('(' + rienSi1(a) + 'x' + ecritureAlgebrique(b) + ')', vertMathalea)}${miseEnEvidence('(' + rienSi1(e) + 'x' + ecritureAlgebrique(f) + ')', bleuMathalea)}$`
            texteCorr += `<br>$${lettreDepuisChiffre(i + 1)}=${miseEnEvidence('(' + rienSi1(a) + 'x' + ecritureAlgebrique(b) + ')', vertMathalea)}${miseEnEvidence('(' + c + 'x' + ecritureAlgebrique(d) + '+' + rienSi1(e) + 'x' + ecritureAlgebrique(f) + ')', bleuMathalea)}$`
            texteCorr += `<br>$${lettreDepuisChiffre(i + 1)}=${miseEnEvidence('(' + rienSi1(a) + 'x' + ecritureAlgebrique(b) + ')' + '(' + rienSi1(c + e) + 'x' + ecritureAlgebrique(d + f) + ')')}$<br>`
          } else {
            texteCorr += `<br>$${lettreDepuisChiffre(i + 1)}=(${rienSi1(a)}x${ecritureAlgebrique(b)})(${c + e}x${ecritureAlgebrique(d + f)})$<br>`
          }
          handleAnswers(this, i, {
            reponse: {
              value: `(${reduireAxPlusB(c + e, d + f)})(${reduireAxPlusB(a, b)})`,
              options: { factorisation: true },
            },
          })
          break
        case '(ax+b)(cx+d)-(ax+b)(ex+f)':
          texte = `$${lettreDepuisChiffre(i + 1)}=(${rienSi1(a)}x${ecritureAlgebrique(b)})(${c}x${ecritureAlgebrique(d)})-(${rienSi1(a)}x${ecritureAlgebrique(b)})(${rienSi1(e)}x${ecritureAlgebrique(f)})$`
          texteCorr = texte
          if (this.correctionDetaillee) {
            texteCorr += `<br>On remarque que $(${rienSi1(a)}x${ecritureAlgebrique(b)})$ est un facteur commun.`
            texteCorr += `<br>$${lettreDepuisChiffre(i + 1)}=${miseEnEvidence('(' + rienSi1(a) + 'x' + ecritureAlgebrique(b) + ')', vertMathalea)}${miseEnEvidence('(' + c + 'x' + ecritureAlgebrique(d) + ')', bleuMathalea)}-${miseEnEvidence('(' + rienSi1(a) + 'x' + ecritureAlgebrique(b) + ')', vertMathalea)}${miseEnEvidence('(' + rienSi1(e) + 'x' + ecritureAlgebrique(f) + ')', bleuMathalea)}$`
            texteCorr += `<br>$${lettreDepuisChiffre(i + 1)}=${miseEnEvidence('(' + rienSi1(a) + 'x' + ecritureAlgebrique(b) + ')', vertMathalea)}${miseEnEvidence('(' + c + 'x' + ecritureAlgebrique(d) + '-(' + rienSi1(e) + 'x' + ecritureAlgebrique(f) + '))', bleuMathalea)}$`
            texteCorr += `<br>$${lettreDepuisChiffre(i + 1)}=${miseEnEvidence('(' + rienSi1(a) + 'x' + ecritureAlgebrique(b) + ')', vertMathalea)}${miseEnEvidence('(' + c + 'x' + ecritureAlgebrique(d) + '-' + rienSi1(e) + 'x' + ecritureAlgebrique(-f) + ')', bleuMathalea)}$`
            texteCorr += `<br>$${lettreDepuisChiffre(i + 1)}=${miseEnEvidence('(' + rienSi1(a) + 'x' + ecritureAlgebrique(b) + ')' + '(' + rienSi1(c - e) + 'x' + ecritureAlgebrique(d - f) + ')')}$<br>`
          } else {
            texteCorr += `<br>$\\phantom{ABC}=(${rienSi1(a)}x${ecritureAlgebrique(b)})(${rienSi1(c - e)}x${ecritureAlgebrique(d - f)})$<br>`
          }
          handleAnswers(this, i, {
            reponse: {
              value: `(${reduireAxPlusB(c - e, d - f)})(${reduireAxPlusB(a, b)})`,
              options: { factorisation: true },
            },
          })
          break
        case '(cx+d)(ax+b)+(ax+b)(ex+f)':
          texte = `$${lettreDepuisChiffre(i + 1)}=(${c}x${ecritureAlgebrique(d)})(${rienSi1(a)}x${ecritureAlgebrique(b)})+(${rienSi1(a)}x${ecritureAlgebrique(b)})(${rienSi1(e)}x${ecritureAlgebrique(f)})$`
          texteCorr = texte
          if (this.correctionDetaillee) {
            texteCorr += `<br>On remarque que $(${rienSi1(a)}x${ecritureAlgebrique(b)})$ est un facteur commun.`
            texteCorr += `<br>$${lettreDepuisChiffre(i + 1)}=${miseEnEvidence('(' + c + 'x' + ecritureAlgebrique(d) + ')', bleuMathalea)}${miseEnEvidence('(' + rienSi1(a) + 'x' + ecritureAlgebrique(b) + ')', vertMathalea)}+${miseEnEvidence('(' + rienSi1(a) + 'x' + ecritureAlgebrique(b) + ')', vertMathalea)}${miseEnEvidence('(' + rienSi1(e) + 'x' + ecritureAlgebrique(f) + ')', bleuMathalea)}$`
            texteCorr += `<br>$${lettreDepuisChiffre(i + 1)}=${miseEnEvidence('(' + rienSi1(a) + 'x' + ecritureAlgebrique(b) + ')', vertMathalea)}${miseEnEvidence('(' + c + 'x' + ecritureAlgebrique(d) + '+' + rienSi1(e) + 'x' + ecritureAlgebrique(f) + ')', bleuMathalea)}$`
            texteCorr += `<br>$${lettreDepuisChiffre(i + 1)}=${miseEnEvidence('(' + rienSi1(a) + 'x' + ecritureAlgebrique(b) + ')' + '(' + rienSi1(c + e) + 'x' + ecritureAlgebrique(d + f) + ')')}$<br>`
          } else {
            texteCorr += `<br>$\\phantom{ABC}=(${rienSi1(a)}x${ecritureAlgebrique(b)})(${c + e}x${ecritureAlgebrique(d + f)})$<br>`
          }
          handleAnswers(this, i, {
            reponse: {
              value: `(${reduireAxPlusB(c + e, d + f)})(${reduireAxPlusB(a, b)})`,
              options: { factorisation: true },
            },
          })
          break
        case '(cx+d)(ax+b)-(ax+b)(ex+f)':
          texte = `$${lettreDepuisChiffre(i + 1)}=(${c}x${ecritureAlgebrique(d)})(${rienSi1(a)}x${ecritureAlgebrique(b)})-(${rienSi1(a)}x${ecritureAlgebrique(b)})(${rienSi1(e)}x${ecritureAlgebrique(f)})$`
          texteCorr = texte
          if (this.correctionDetaillee) {
            texteCorr += `<br>On remarque que $(${rienSi1(a)}x${ecritureAlgebrique(b)})$ est un facteur commun.`
            texteCorr += `<br>$${lettreDepuisChiffre(i + 1)}=${miseEnEvidence('(' + c + 'x' + ecritureAlgebrique(d) + ')', bleuMathalea)}${miseEnEvidence('(' + rienSi1(a) + 'x' + ecritureAlgebrique(b) + ')', vertMathalea)}-${miseEnEvidence('(' + rienSi1(a) + 'x' + ecritureAlgebrique(b) + ')', vertMathalea)}${miseEnEvidence('(' + rienSi1(e) + 'x' + ecritureAlgebrique(f) + ')', bleuMathalea)}$`
            texteCorr += `<br>$${lettreDepuisChiffre(i + 1)}=${miseEnEvidence('(' + rienSi1(a) + 'x' + ecritureAlgebrique(b) + ')', vertMathalea)}${miseEnEvidence('(' + c + 'x' + ecritureAlgebrique(d) + '-(' + rienSi1(e) + 'x' + ecritureAlgebrique(f) + '))', bleuMathalea)}$`
            texteCorr += `<br>$${lettreDepuisChiffre(i + 1)}=${miseEnEvidence('(' + rienSi1(a) + 'x' + ecritureAlgebrique(b) + ')', vertMathalea)}${miseEnEvidence('(' + c + 'x' + ecritureAlgebrique(d) + '-' + rienSi1(e) + 'x' + ecritureAlgebrique(-f) + ')', bleuMathalea)}$`
            texteCorr += `<br>$${lettreDepuisChiffre(i + 1)}=${miseEnEvidence('(' + rienSi1(a) + 'x' + ecritureAlgebrique(b) + ')' + '(' + rienSi1(c - e) + 'x' + ecritureAlgebrique(d - f) + ')')}$<br>`
          } else {
            texteCorr += `<br>$\\phantom{ABC}=(${rienSi1(a)}x${ecritureAlgebrique(b)})(${rienSi1(c - e)}x${ecritureAlgebrique(d - f)})$<br>`
          }
          handleAnswers(this, i, {
            reponse: {
              value: `(${reduireAxPlusB(c - e, d - f)})(${reduireAxPlusB(a, b)})`,
              options: { factorisation: true },
            },
          })
          break
        case '(ax+b)(cx+d)+(ex+f)(ax+b)':
          texte = `$${lettreDepuisChiffre(i + 1)}=(${rienSi1(a)}x${ecritureAlgebrique(b)})(${c}x${ecritureAlgebrique(d)})+(${rienSi1(e)}x${ecritureAlgebrique(f)})(${rienSi1(a)}x${ecritureAlgebrique(b)})$`
          texteCorr = texte
          if (this.correctionDetaillee) {
            texteCorr += `<br>On remarque que $(${rienSi1(a)}x${ecritureAlgebrique(b)})$ est un facteur commun.`
            texteCorr += `<br>$${lettreDepuisChiffre(i + 1)}=${miseEnEvidence('(' + rienSi1(a) + 'x' + ecritureAlgebrique(b) + ')', vertMathalea)}${miseEnEvidence('(' + c + 'x' + ecritureAlgebrique(d) + ')', bleuMathalea)}+${miseEnEvidence('(' + rienSi1(e) + 'x' + ecritureAlgebrique(f) + ')', bleuMathalea)}${miseEnEvidence('(' + rienSi1(a) + 'x' + ecritureAlgebrique(b) + ')', vertMathalea)}$`
            texteCorr += `<br>$${lettreDepuisChiffre(i + 1)}=${miseEnEvidence('(' + rienSi1(a) + 'x' + ecritureAlgebrique(b) + ')', vertMathalea)}${miseEnEvidence('(' + c + 'x' + ecritureAlgebrique(d) + '+' + rienSi1(e) + 'x' + ecritureAlgebrique(f) + ')', bleuMathalea)}$`
            texteCorr += `<br>$${lettreDepuisChiffre(i + 1)}=${miseEnEvidence('(' + rienSi1(a) + 'x' + ecritureAlgebrique(b) + ')' + '(' + rienSi1(c + e) + 'x' + ecritureAlgebrique(d + f) + ')')}$<br>`
          } else {
            texteCorr += `<br>$\\phantom{ABC}=(${rienSi1(a)}x${ecritureAlgebrique(b)})(${c + e}x${ecritureAlgebrique(d + f)})$<br>`
          }
          handleAnswers(this, i, {
            reponse: {
              value: `(${reduireAxPlusB(c + e, d + f)})(${reduireAxPlusB(a, b)})`,
              options: { factorisation: true },
            },
          })
          break
        case '(ax+b)(cx+d)-(ex+f)(ax+b)':
          texte = `$${lettreDepuisChiffre(i + 1)}=(${rienSi1(a)}x${ecritureAlgebrique(b)})(${c}x${ecritureAlgebrique(d)})-(${rienSi1(e)}x${ecritureAlgebrique(f)})(${rienSi1(a)}x${ecritureAlgebrique(b)})$`
          texteCorr = texte
          if (this.correctionDetaillee) {
            texteCorr += `<br>On remarque que $(${rienSi1(a)}x${ecritureAlgebrique(b)})$ est un facteur commun.`
            texteCorr += `<br>$${lettreDepuisChiffre(i + 1)}=${miseEnEvidence('(' + rienSi1(a) + 'x' + ecritureAlgebrique(b) + ')', vertMathalea)}${miseEnEvidence('(' + c + 'x' + ecritureAlgebrique(d) + ')', bleuMathalea)}-${miseEnEvidence('(' + rienSi1(e) + 'x' + ecritureAlgebrique(f) + ')', bleuMathalea)}${miseEnEvidence('(' + rienSi1(a) + 'x' + ecritureAlgebrique(b) + ')', vertMathalea)}$`
            texteCorr += `<br>$${lettreDepuisChiffre(i + 1)}=${miseEnEvidence('(' + rienSi1(a) + 'x' + ecritureAlgebrique(b) + ')', vertMathalea)}${miseEnEvidence('(' + c + 'x' + ecritureAlgebrique(d) + '-(' + rienSi1(e) + 'x' + ecritureAlgebrique(f) + '))', bleuMathalea)}$`
            texteCorr += `<br>$${lettreDepuisChiffre(i + 1)}=${miseEnEvidence('(' + rienSi1(a) + 'x' + ecritureAlgebrique(b) + ')', vertMathalea)}${miseEnEvidence('(' + c + 'x' + ecritureAlgebrique(d) + '-' + rienSi1(e) + 'x' + ecritureAlgebrique(-f) + ')', bleuMathalea)}$`
            texteCorr += `<br>$${lettreDepuisChiffre(i + 1)}=${miseEnEvidence('(' + rienSi1(a) + 'x' + ecritureAlgebrique(b) + ')' + '(' + rienSi1(c - e) + 'x' + ecritureAlgebrique(d - f) + ')')}$<br>`
          } else {
            texteCorr += `<br>$\\phantom{ABC}=(${rienSi1(a)}x${ecritureAlgebrique(b)})(${rienSi1(c - e)}x${ecritureAlgebrique(d - f)})$<br>`
          }
          handleAnswers(this, i, {
            reponse: {
              value: `(${reduireAxPlusB(c - e, d - f)})(${reduireAxPlusB(a, b)})`,
              options: { factorisation: true },
            },
          })
          break
        case '(cx+d)(ax+b)+(ex+f)(ax+b)':
          texte = `$${lettreDepuisChiffre(i + 1)}=(${c}x${ecritureAlgebrique(d)})(${rienSi1(a)}x${ecritureAlgebrique(b)})+(${rienSi1(e)}x${ecritureAlgebrique(f)})(${rienSi1(a)}x${ecritureAlgebrique(b)})$`
          texteCorr = texte
          if (this.correctionDetaillee) {
            texteCorr += `<br>On remarque que $(${rienSi1(a)}x${ecritureAlgebrique(b)})$ est un facteur commun.`
            texteCorr += `<br>$${lettreDepuisChiffre(i + 1)}=${miseEnEvidence('(' + c + 'x' + ecritureAlgebrique(d) + ')', bleuMathalea)}${miseEnEvidence('(' + rienSi1(a) + 'x' + ecritureAlgebrique(b) + ')', vertMathalea)}+${miseEnEvidence('(' + rienSi1(e) + 'x' + ecritureAlgebrique(f) + ')', bleuMathalea)}${miseEnEvidence('(' + rienSi1(a) + 'x' + ecritureAlgebrique(b) + ')', vertMathalea)}$`
            texteCorr += `<br>$${lettreDepuisChiffre(i + 1)}=${miseEnEvidence('(' + rienSi1(a) + 'x' + ecritureAlgebrique(b) + ')', vertMathalea)}${miseEnEvidence('(' + c + 'x' + ecritureAlgebrique(d) + '+' + rienSi1(e) + 'x' + ecritureAlgebrique(f) + ')', bleuMathalea)}$`
            texteCorr += `<br>$${lettreDepuisChiffre(i + 1)}=${miseEnEvidence('(' + rienSi1(a) + 'x' + ecritureAlgebrique(b) + ')' + '(' + rienSi1(c + e) + 'x' + ecritureAlgebrique(d + f) + ')')}$<br>`
          } else {
            texteCorr += `<br>$\\phantom{ABC}=(${rienSi1(a)}x${ecritureAlgebrique(b)})(${c + e}x${ecritureAlgebrique(d + f)})$<br>`
          }
          handleAnswers(this, i, {
            reponse: {
              value: `(${reduireAxPlusB(c + e, d + f)})(${reduireAxPlusB(a, b)})`,
              options: { factorisation: true },
            },
          })
          break
        case '(cx+d)(ax+b)-(ex+f)(ax+b)':
          texte = `$${lettreDepuisChiffre(i + 1)}=(${c}x${ecritureAlgebrique(d)})(${rienSi1(a)}x${ecritureAlgebrique(b)})-(${rienSi1(e)}x${ecritureAlgebrique(f)})(${rienSi1(a)}x${ecritureAlgebrique(b)})$`
          texteCorr = texte
          if (this.correctionDetaillee) {
            texteCorr += `<br>On remarque que $(${rienSi1(a)}x${ecritureAlgebrique(b)})$ est un facteur commun.`
            texteCorr += `<br>$${lettreDepuisChiffre(i + 1)}=${miseEnEvidence('(' + c + 'x' + ecritureAlgebrique(d) + ')', bleuMathalea)}${miseEnEvidence('(' + rienSi1(a) + 'x' + ecritureAlgebrique(b) + ')', vertMathalea)}-${miseEnEvidence('(' + rienSi1(e) + 'x' + ecritureAlgebrique(f) + ')', bleuMathalea)}${miseEnEvidence('(' + rienSi1(a) + 'x' + ecritureAlgebrique(b) + ')', vertMathalea)}$`
            texteCorr += `<br>$${lettreDepuisChiffre(i + 1)}=${miseEnEvidence('(' + rienSi1(a) + 'x' + ecritureAlgebrique(b) + ')', vertMathalea)}${miseEnEvidence('(' + c + 'x' + ecritureAlgebrique(d) + '-(' + rienSi1(e) + 'x' + ecritureAlgebrique(f) + '))', bleuMathalea)}$`
            texteCorr += `<br>$${lettreDepuisChiffre(i + 1)}=${miseEnEvidence('(' + rienSi1(a) + 'x' + ecritureAlgebrique(b) + ')', vertMathalea)}${miseEnEvidence('(' + c + 'x' + ecritureAlgebrique(d) + '-' + rienSi1(e) + 'x' + ecritureAlgebrique(-f) + ')', bleuMathalea)}$`
            texteCorr += `<br>$${lettreDepuisChiffre(i + 1)}=${miseEnEvidence('(' + rienSi1(a) + 'x' + ecritureAlgebrique(b) + ')' + '(' + rienSi1(c - e) + 'x' + ecritureAlgebrique(d - f) + ')')}$<br>`
          } else {
            texteCorr += `<br>$\\phantom{ABC}=(${rienSi1(a)}x${ecritureAlgebrique(b)})(${rienSi1(c - e)}x${ecritureAlgebrique(d - f)})$<br>`
          }
          handleAnswers(this, i, {
            reponse: {
              value: `(${reduireAxPlusB(c - e, d - f)})(${reduireAxPlusB(a, b)})`,
              options: { factorisation: true },
            },
          })
          break
      }
      texte += ajouteChampTexteMathLive(
        this,
        i,
        KeyboardType.clavierDeBaseAvecVariable,
        { texteAvant: `<br>$${lettreDepuisChiffre(i + 1)} = $` },
      )

      if (this.questionJamaisPosee(i, a, b, c, d)) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenuSansNumero(this)
  }
}
