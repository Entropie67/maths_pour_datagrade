import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
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
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Résoudre une équation du premier degré (utilisant éventuellement la distributivité)'
export const interactifReady = true

export const dateDeModifImportante = '29/10/2025'

/**
 * Équation du premier degré
 * * Type 1 : ax+b=cx+d
 * * Type 2 : k(ax+b)=cx+d
 * * Type 3 : k-(ax+b)=cx+d
 * * Tous les types
 * @author Rémi Angot
 * Rendre interactif Laurence Candille
 * Éric Elter : Rajouter de deux paramètres, passage de la réponse en couleur
 */
export const uuid = 'b81d0'

export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export default class ExerciceEquation1Tiret2 extends Exercice {
  constructor() {
    super()

    this.comment =
      'Les équations sont de la forme :<br>$ax+b=cx+d$<br>$k(ax+b)=cx+d$<br>$k-(ax+b)=cx+d$<br>avec des nombres à un chiffre.'
    this.spacing = 2
    this.spacingCorr = context.isHtml ? 3 : 2
    this.correctionDetailleeDisponible = true
    if (!context.isHtml) {
      this.correctionDetaillee = false
    }
    this.nbQuestions = 3
    this.besoinFormulaireTexte = [
      "Type d'équations",
      [
        'Nombres séparés par des tirets  :',
        '1 : $ax+b=cx+d$',
        '2 : $k(ax+b)=cx+d$',
        '3 : $k-(ax+b)=cx+d$',
        '4 : Mélange',
      ].join('\n'),
    ]
    this.sup = '4'

    this.besoinFormulaire2CaseACocher = [
      'Avec des solutions uniquement entières',
      false,
    ]
    this.sup2 = false
  }

  nouvelleVersion() {
    this.consigne =
      'Résoudre ' +
      (this.nbQuestions !== 1
        ? 'les équations suivantes'
        : "l'équation suivante") +
      '.'

    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      max: 3,
      melange: 4,
      defaut: 4,
      nbQuestions: this.nbQuestions,
      listeOfCase: ['ax+b=cx+d', 'k(ax+b)=cx+d', 'k-(ax+b)=cx+d'],
    })

    let listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )

    listeTypeDeQuestions = combinaisonListes(
      listeTypeDeQuestions,
      this.nbQuestions,
    )
    for (
      let i = 0, a, b, c, d, k, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      let reponse = new FractionEtendue(1, 1)
      let equation = ''
      // On limite le nombre d'essais pour chercher des valeurs nouvelles
      do {
        a = randint(-9, 9, 0)
        b = randint(-9, 9, 0)
        k = randint(2, 9)
        c =
          listeTypeDeQuestions[i] === 'ax+b=cx+d'
            ? randint(-9, 9, [0, a]) // sinon on arrive à une division par 0
            : listeTypeDeQuestions[i] === 'k-(ax+b)=cx+d'
              ? randint(-9, 9, [0, -a]) // sinon on arrive à une division par 0
              : Math.abs(k * a) < 10
                ? randint(-9, 9, [0, k * a])
                : randint(-9, 9, 0)

        d = randint(-9, 9, 0)
        reponse =
          listeTypeDeQuestions[i] === 'k(ax+b)=cx+d'
            ? new FractionEtendue(d - k * b, k * a - c)
            : listeTypeDeQuestions[i] === 'k-(ax+b)=cx+d'
              ? new FractionEtendue(d + b - k, -a - c)
              : new FractionEtendue(d - b, a - c)
      } while (this.sup2 && !reponse.estEntiere)

      if (this.questionJamaisPosee(i, a, b, c, d, k)) {
        // Si la question n'a jamais été posée, on en créé une autre
        if (listeTypeDeQuestions[i] === 'ax+b=cx+d') {
          if (c === a) {
            c = randint(1, 9, [a])
          } // sinon on arrive à une division par 0
          if (!this.sup && a < c) {
            c = randint(1, 9)
            a = randint(c + 1, 15) // a sera plus grand que c pour que a-c>0
          }
          equation = `$${rienSi1(a)}x${ecritureAlgebrique(b)}=${rienSi1(c)}x${ecritureAlgebrique(d)}$`
          texte = equation + '<br>'
          texteCorr = texte

          if (this.correctionDetaillee) {
            if (c > 0) {
              texteCorr += `On soustrait $${rienSi1(c)}x$ aux deux membres.<br>`
            } else {
              texteCorr += `On ajoute $${rienSi1(-1 * c)}x$ aux deux membres.<br>`
            }
          }
          texteCorr += `$${rienSi1(a)}x${ecritureAlgebrique(b)}${miseEnEvidence(signe(-1 * c) + rienSi1(abs(c)) + 'x', bleuMathalea)}=${c}x+${d}${miseEnEvidence(signe(-1 * c) + rienSi1(abs(c)) + 'x', bleuMathalea)}$<br>`
          texteCorr += `$${rienSi1(a - c)}x${ecritureAlgebrique(b)}=${d}$<br>`
          if (this.correctionDetaillee) {
            if (b > 0) {
              texteCorr += `On soustrait $${b}$ aux deux membres.<br>`
            } else {
              texteCorr += `On ajoute $${-1 * b}$ aux deux membres.<br>`
            }
          }
          texteCorr += `$${rienSi1(a - c)}x${ecritureAlgebrique(b)}${miseEnEvidence(ecritureAlgebrique(-1 * b), bleuMathalea)}=${d}${miseEnEvidence(ecritureAlgebrique(-1 * b), bleuMathalea)}$<br>`
          texteCorr += `$${rienSi1(a - c)}x=${d - b}$<br>`
          if (a - c !== 1) {
            if (this.correctionDetaillee) {
              texteCorr += `On divise les deux membres par $${a - c}$.<br>`
            }
            texteCorr += `$${rienSi1(a - c)}x${miseEnEvidence('\\div' + ecritureParentheseSiNegatif(a - c), bleuMathalea)}=${d - b + miseEnEvidence('\\div' + ecritureParentheseSiNegatif(a - c), bleuMathalea)}$<br>`
            texteCorr += `$x=${reponse.texFSD}$`
            if (pgcd(abs(d - b), abs(a - c)) > 1) {
              texteCorr += `<br>Par simplification, $x=${reponse.simplifie().texFSD}$.`
            }
            texteCorr += `<br>`
          }
        } else if (listeTypeDeQuestions[i] === 'k(ax+b)=cx+d') {
          equation = `$${k}(${rienSi1(a)}x${ecritureAlgebrique(b)})=${rienSi1(c)}x${ecritureAlgebrique(d)}$`
          texte = equation + '<br>'
          texteCorr = texte

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
          texteCorr += `$${k * a}x${ecritureAlgebrique(k * b)}${miseEnEvidence(signe(-1 * c) + rienSi1(abs(c)) + 'x', bleuMathalea)}=${c}x${ecritureAlgebrique(d)}${miseEnEvidence(signe(-1 * c) + rienSi1(abs(c)) + 'x', bleuMathalea)}$<br>`
          texteCorr += `$${rienSi1(k * a - c)}x${ecritureAlgebrique(k * b)}=${d}$<br>`
          if (this.correctionDetaillee) {
            if (k * b > 0) {
              texteCorr += `On soustrait $${k * b}$ aux deux membres.<br>`
            } else {
              texteCorr += `On ajoute $${-k * b}$ aux deux membres.<br>`
            }
          }
          texteCorr += `$${rienSi1(k * a - c)}x${ecritureAlgebrique(k * b)}${miseEnEvidence(ecritureAlgebrique(-k * b), bleuMathalea)}=${d}${miseEnEvidence(ecritureAlgebrique(-k * b), bleuMathalea)}$<br>`
          texteCorr += `$${rienSi1(k * a - c)}x=${d - k * b}$<br>`

          if (this.correctionDetaillee) {
            texteCorr += `On divise les deux membres par $${k * a - c}$.<br>`
          }
          texteCorr += `$${rienSi1(k * a - c)}x${miseEnEvidence('\\div' + ecritureParentheseSiNegatif(k * a - c), bleuMathalea)}=${d - k * b + miseEnEvidence('\\div' + ecritureParentheseSiNegatif(k * a - c), bleuMathalea)}$<br>`
          texteCorr += `$x=${reponse.texFSD}$`
          if (pgcd(abs(d - k * b), abs(k * a - c)) > 1) {
            texteCorr += `<br>Par simplification, $x=${reponse.simplifie().texFSD}$.`
          }
          texteCorr += `<br>`
        } else {
          equation = `$${k}-(${rienSi1(a)}x${ecritureAlgebrique(b)})=${rienSi1(c)}x${ecritureAlgebrique(d)}$`
          texte = equation + '<br>'
          texteCorr = texte

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
          texteCorr += `$${rienSi1(a)}x${ecritureAlgebrique(b)}${miseEnEvidence(signe(-1 * c) + rienSi1(abs(c)) + 'x', bleuMathalea)}=${c}x+${d}${miseEnEvidence(signe(-1 * c) + rienSi1(abs(c)) + 'x', bleuMathalea)}$<br>`
          texteCorr += `$${rienSi1(a - c)}x${ecritureAlgebrique(b)}=${d}$<br>`
          if (this.correctionDetaillee) {
            if (b > 0) {
              texteCorr += `On soustrait $${b}$ aux deux membres.<br>`
            } else {
              texteCorr += `On ajoute $${-1 * b}$ aux deux membres.<br>`
            }
          }
          texteCorr += `$${rienSi1(a - c)}x${ecritureAlgebrique(b)}${miseEnEvidence(ecritureAlgebrique(-1 * b), bleuMathalea)}=${d}${miseEnEvidence(ecritureAlgebrique(-1 * b), bleuMathalea)}$<br>`
          texteCorr += `$${rienSi1(a - c)}x=${d - b}$<br>`

          if (this.correctionDetaillee) {
            texteCorr += `On divise les deux membres par $${a - c}$.<br>`
          }
          texteCorr += `$${rienSi1(a - c)}x${miseEnEvidence('\\div' + ecritureParentheseSiNegatif(a - c), bleuMathalea)}=${d - b + miseEnEvidence('\\div' + ecritureParentheseSiNegatif(a - c), bleuMathalea)}$<br>`
          texteCorr += `$x=${reponse.texFSD}$`
          if (pgcd(abs(d - b), abs(a - c)) > 1) {
            texteCorr += `<br>Par simplification, $x=${reponse.simplifie().texFSD}$.`
          }
          texteCorr += `<br>`
        }

        texteCorr += `La solution de l'équation ${equation} est $${miseEnEvidence(reponse.simplifie().texFSD)}$.`

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
              value: reponse,
              options: { fractionEgale: true, nombreDecimalSeulement: true },
            },
          })
        }

        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
