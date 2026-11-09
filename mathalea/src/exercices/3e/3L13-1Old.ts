import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  texFractionFromString,
  texFractionReduite,
} from '../../lib/outils/deprecatedFractions'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { abs, signe } from '../../lib/outils/nombres'
import { pgcd } from '../../lib/outils/primalite'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Résoudre une équation du premier degré (utilisant la distributivité)'
export const interactifReady = true

export const dateDeModifImportante = '24/06/2024'

/**
 * Équation du premier degré
 * * Type 1 : ax+b=cx+d (EE : Supprimé car en inadéquation avec le titre. On retrouve ce genre d'équations ailleurs.)
 * * Type 2 : k(ax+b)=cx+d
 * * Type 3 : k-(ax+b)=cx+d
 * * Tous les types
 * @author Rémi Angot
 * Rendre interactif Laurence Candille
 */
export const uuid = '1802d'

export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export default class ExerciceEquation1Tiret2 extends Exercice {
  constructor() {
    super()

    // this.comment = 'Les équations sont de la forme :<br>$ax+b=cx+d$<br>$k(ax+b)=cx+d$<br>$k-(ax+b)=cx+d$<br>avec des nombres à un chiffre.'
    this.comment =
      'Les équations sont de la forme :<br>$k(ax+b)=cx+d$<br>$k-(ax+b)=cx+d$<br>avec des nombres à un chiffre.'
    this.spacing = 2
    this.spacingCorr = context.isHtml ? 3 : 2
    this.correctionDetailleeDisponible = true
    if (!context.isHtml) {
      this.correctionDetaillee = false
    }
    this.nbQuestions = 3
  }

  nouvelleVersion() {
    this.consigne =
      'Résoudre ' +
      (this.nbQuestions !== 1
        ? 'les équations suivantes'
        : "l'équation suivante") +
      '.'

    // let listeTypeDeQuestions = ['ax+b=cx+d', 'k(ax+b)=cx+d', 'k-(ax+b)=cx+d']
    let listeTypeDeQuestions = ['k(ax+b)=cx+d', 'k-(ax+b)=cx+d']
    listeTypeDeQuestions = combinaisonListes(
      listeTypeDeQuestions,
      this.nbQuestions,
    )
    for (
      let i = 0, a, b, c, d, k, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      // On limite le nombre d'essais pour chercher des valeurs nouvelles
      a = randint(-9, 9, 0)
      b = randint(-9, 9, 0)
      c = randint(-9, 9, 0)
      d = randint(-9, 9, 0)
      k = randint(2, 9)

      if (listeTypeDeQuestions[i] === 'k(ax+b)=cx+d') {
        if (c === k * a) {
          c = randint(1, 9, [a])
        } // sinon on arrive à une division par 0
        texte = `$${k}(${rienSi1(a)}x${ecritureAlgebrique(b)})=${rienSi1(c)}x${ecritureAlgebrique(d)}$<br>`
        texteCorr = texte
        if (this.interactif) {
          texte +=
            '$x = $' +
            ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierDeBaseAvecFraction,
            ) +
            '<br><br>'
          handleAnswers(this, i, {
            reponse: {
              value: new FractionEtendue(d - k * b, a * k - c),
              options: { fractionEgale: true, nombreDecimalSeulement: true },
            },
          })
        }
        if (this.correctionDetaillee) {
          texteCorr += 'On développe le membre de gauche.<br>'
        }
        texteCorr += `$${k * a}x${ecritureAlgebrique(k * b)}=${rienSi1(c)}x${ecritureAlgebrique(d)}$<br>`
        if (this.correctionDetaillee) {
          if (c > 0) {
            texteCorr += `On soustrait $${rienSi1(c)}x$ aux deux membres.<br>`
          } else {
            texteCorr += `On ajoute $${rienSi1(-1 * c)}x$ aux deux membres.<br>`
          }
        }
        texteCorr += `$${k * a}x${ecritureAlgebrique(k * b)}${miseEnEvidence(signe(-1 * c) + rienSi1(abs(c)) + 'x')}=${c}x${ecritureAlgebrique(d)}${miseEnEvidence(signe(-1 * c) + rienSi1(abs(c)) + 'x')}$<br>`
        texteCorr += `$${rienSi1(k * a - c)}x${ecritureAlgebrique(k * b)}=${d}$<br>`
        if (this.correctionDetaillee) {
          if (k * b > 0) {
            texteCorr += `On soustrait $${k * b}$ aux deux membres.<br>`
          } else {
            texteCorr += `On ajoute $${-k * b}$ aux deux membres.<br>`
          }
        }
        texteCorr += `$${rienSi1(k * a - c)}x${ecritureAlgebrique(k * b)}${miseEnEvidence(ecritureAlgebrique(-k * b))}=${d}${miseEnEvidence(ecritureAlgebrique(-k * b))}$<br>`
        texteCorr += `$${rienSi1(k * a - c)}x=${d - k * b}$<br>`

        if (this.correctionDetaillee) {
          texteCorr += `On divise les deux membres par $${k * a - c}$.<br>`
        }
        texteCorr += `$${rienSi1(k * a - c)}x${miseEnEvidence('\\div' + ecritureParentheseSiNegatif(k * a - c))}=${d - k * b + miseEnEvidence('\\div' + ecritureParentheseSiNegatif(k * a - c))}$<br>`
        texteCorr += `$x=${texFractionFromString(d - k * b, k * a - c)}$`
        if (pgcd(abs(d - k * b), abs(k * a - c)) > 1 || k * a - c < 0) {
          texteCorr += `<br>$x=${texFractionReduite(d - k * b, k * a - c)}$`
        }
        texteCorr += `<br> La solution est $${texFractionReduite(d - k * b, k * a - c)}$.`
      } else {
        // if (listeTypeDeQuestions[i] === 'k-(ax+b)=cx+d') {
        if (c === -a) {
          c = randint(-9, 9, [0, a, -a])
        } // sinon on arrive à une division par 0
        texte = `$${k}-(${rienSi1(a)}x${ecritureAlgebrique(b)})=${rienSi1(c)}x${ecritureAlgebrique(d)}$<br>`
        texteCorr = texte
        if (this.interactif) {
          texte +=
            '$x = $' +
            ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierDeBaseAvecFraction,
            ) +
            '<br><br>'
          handleAnswers(this, i, {
            reponse: {
              value: new FractionEtendue(k - b - d, a + c),
              options: { fractionEgale: true, nombreDecimalSeulement: true },
            },
          })
        }
        if (this.correctionDetaillee) {
          texteCorr += 'On développe le membre de gauche.<br>'
        }
        texteCorr += `$${k}${ecritureAlgebrique(-a)}x${ecritureAlgebrique(-b)}=${rienSi1(c)}x${ecritureAlgebrique(d)}$<br>`
        texteCorr += `$${rienSi1(-a)}x${ecritureAlgebrique(k - b)}=${rienSi1(c)}x${ecritureAlgebrique(d)}$<br>`

        // On reprend le cas ax+b=cx+d en changeant les valeurs de a et b
        a = -a
        b = k - b

        if (this.correctionDetaillee) {
          if (c > 0) {
            texteCorr += `On soustrait $${rienSi1(c)}x$ aux deux membres.<br>`
          } else {
            texteCorr += `On ajoute $${rienSi1(-1 * c)}x$ aux deux membres.<br>`
          }
        }
        texteCorr += `$${rienSi1(a)}x${ecritureAlgebrique(b)}${miseEnEvidence(signe(-1 * c) + rienSi1(abs(c)) + 'x')}=${c}x+${d}${miseEnEvidence(signe(-1 * c) + rienSi1(abs(c)) + 'x')}$<br>`
        texteCorr += `$${rienSi1(a - c)}x${ecritureAlgebrique(b)}=${d}$<br>`
        if (this.correctionDetaillee) {
          if (b > 0) {
            texteCorr += `On soustrait $${b}$ aux deux membres.<br>`
          } else {
            texteCorr += `On ajoute $${-1 * b}$ aux deux membres.<br>`
          }
        }
        texteCorr += `$${rienSi1(a - c)}x${ecritureAlgebrique(b)}${miseEnEvidence(ecritureAlgebrique(-1 * b))}=${d}${miseEnEvidence(ecritureAlgebrique(-1 * b))}$<br>`
        texteCorr += `$${rienSi1(a - c)}x=${d - b}$<br>`

        if (this.correctionDetaillee) {
          texteCorr += `On divise les deux membres par $${a - c}$.<br>`
        }
        texteCorr += `$${rienSi1(a - c)}x${miseEnEvidence('\\div' + ecritureParentheseSiNegatif(a - c))}=${d - b + miseEnEvidence('\\div' + ecritureParentheseSiNegatif(a - c))}$<br>`
        texteCorr += `$x=${texFractionFromString(d - b, a - c)}$`
        if (pgcd(abs(d - b), abs(a - c)) > 1 || a - c < 0) {
          texteCorr += `<br>$x=${texFractionReduite(d - b, a - c)}$`
        }
        texteCorr += `<br> La solution est $${texFractionReduite(d - b, a - c)}$.`
      }

      if (this.questionJamaisPosee(i, a, b, c, d, k)) {
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
