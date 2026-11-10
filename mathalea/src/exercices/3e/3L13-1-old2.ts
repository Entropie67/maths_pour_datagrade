// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 57ba1 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { bleuMathalea } from '../../lib/colors'
import { addMathaleaSolveur } from '../../lib/customElements/MathaleaSolveurElement'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
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

export const dateDeModifImportante = '30/09/2026'

/**
 * Équation du premier degré
 * * Type 1 : ax+b=cx+d
 * * Type 2 : k(ax+b)=cx+d
 * * Type 3 : k-(ax+b)=cx+d
 * * Type 4 : x²+a=(x+b)²
 * * Tous les types
 * @author Rémi Angot
 * Rendre interactif Laurence Candille
 * Éric Elter : Rajouter de deux paramètres, passage de la réponse en couleur
 * Arnaud Meistermann : ajout du cas x²+a=(x+b)²
 */
export const uuid = '57ba1'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class ExerciceEquation1Tiret2Old2 extends Exercice {
  protected niveau: number

  constructor(niveau = 3) {
    super()
    this.niveau = niveau

    this.comment = `Les équations sont de la forme :<br>$ax+b=cx+d$<br>$k(ax+b)=cx+d$<br>$k-(ax+b)=cx+d$${this.niveau === 2 ? '<br>$x^2+a=(x+b)^2$' : ''}<br>avec des nombres à un chiffre${this.niveau === 2 ? ' (sauf pour le dernier type où $a$ et $b$ sont compris entre $-10$ et $10$)' : ''}.`
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
        '0 : Mélange', // Important pour que Mélange coïncide quels que soient le niveau et le formulaire.
        '1 : $ax+b=cx+d$',
        '2 : $k(ax+b)=cx+d$',
        '3 : $k-(ax+b)=cx+d$',
        ...(this.niveau === 2 ? ['4 : $x^2+a=(x+b)^2$'] : []),
      ].join('\n'),
    ]
    this.sup = '0'

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
      max: this.niveau === 3 ? 3 : 4,
      melange: 0,
      defaut: 0,
      nbQuestions: this.nbQuestions,
      listeOfCase: [
        'ax+b=cx+d',
        'k(ax+b)=cx+d',
        'k-(ax+b)=cx+d',
        'x²+a=(x+b)²',
      ],
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
        if (listeTypeDeQuestions[i] === 'x²+a=(x+b)²') {
          a = randint(-10, 10, 0)
          b = randint(-10, 10, 0)
        }
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
          listeTypeDeQuestions[i] === 'x²+a=(x+b)²'
            ? new FractionEtendue(a - b ** 2, 2 * b)
            : listeTypeDeQuestions[i] === 'k(ax+b)=cx+d'
              ? new FractionEtendue(d - k * b, k * a - c)
              : listeTypeDeQuestions[i] === 'k-(ax+b)=cx+d'
                ? new FractionEtendue(d + b - k, -a - c)
                : new FractionEtendue(d - b, a - c)
      } while (this.sup2 && !reponse.estEntiere)

      const questionJamaisPosee =
        listeTypeDeQuestions[i] === 'x²+a=(x+b)²'
          ? this.questionJamaisPosee(i, a, b)
          : this.questionJamaisPosee(i, a, b, c, d, k)
      if (questionJamaisPosee) {
        // Si la question n'a jamais été posée, on en créé une autre
        if (listeTypeDeQuestions[i] === 'ax+b=cx+d') {
          if (c === a) {
            c = randint(1, 9, [a])
          } // sinon on arrive à une division par 0
          if (!this.sup && a < c) {
            c = randint(1, 9)
            a = randint(c + 1, 15) // a sera plus grand que c pour que a-c>0
          }
          // a et/ou c ont pu être retirés au sort ci-dessus : on remet la
          // réponse en cohérence avec l'équation réellement affichée (sinon la
          // phrase de conclusion et la correction interactive utilisent une
          // ancienne valeur, cf. liens partagés avec s=0).
          reponse = new FractionEtendue(d - b, a - c)
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
          texteCorr += `$${rienSi1(a)}x${ecritureAlgebrique(b)}${miseEnEvidence(signe(-1 * c) + rienSi1(abs(c)) + 'x', bleuMathalea)}=${c}x${ecritureAlgebrique(d)}${miseEnEvidence(signe(-1 * c) + rienSi1(abs(c)) + 'x', bleuMathalea)}$<br>`
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
        } else if (listeTypeDeQuestions[i] === 'k-(ax+b)=cx+d') {
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
          texteCorr += `$${rienSi1(a)}x${ecritureAlgebrique(b)}${miseEnEvidence(signe(-1 * c) + rienSi1(abs(c)) + 'x', bleuMathalea)}=${c}x${ecritureAlgebrique(d)}${miseEnEvidence(signe(-1 * c) + rienSi1(abs(c)) + 'x', bleuMathalea)}$<br>`
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
        } else {
          equation = `$x^2${ecritureAlgebrique(a)}=(x${ecritureAlgebrique(b)})^2$`
          texte = equation + '<br>'
          texteCorr = texte

          if (this.correctionDetaillee) {
            if (b > 0) {
              texteCorr += `On développe le membre de droite à l'aide de l'identité remarquable $(a+b)^2=a^2+2ab+b^2$, avec $a=x$ et $b=${b}$.<br>`
              texteCorr += `$x^2${ecritureAlgebrique(a)}=x^2+2\\times x\\times ${b}+${b}^2$<br>`
            } else {
              texteCorr += `On développe le membre de droite à l'aide de l'identité remarquable $(a-b)^2=a^2-2ab+b^2$, avec $a=x$ et $b=${-b}$.<br>`
              texteCorr += `$x^2${ecritureAlgebrique(a)}=x^2-2\\times x\\times ${-b}+${-b}^2$<br>`
            }
          }
          texteCorr += `$x^2${ecritureAlgebrique(a)}=x^2${ecritureAlgebrique(2 * b)}x${ecritureAlgebrique(b ** 2)}$<br>`
          if (this.correctionDetaillee) {
            texteCorr += 'On soustrait $x^2$ aux deux membres.<br>'
          }
          texteCorr += `$x^2${ecritureAlgebrique(a)}${miseEnEvidence('-x^2', bleuMathalea)}=x^2${ecritureAlgebrique(2 * b)}x${ecritureAlgebrique(b ** 2)}${miseEnEvidence('-x^2', bleuMathalea)}$<br>`
          texteCorr += `$${a}=${rienSi1(2 * b)}x${ecritureAlgebrique(b ** 2)}$<br>`
          if (this.correctionDetaillee) {
            texteCorr += `On soustrait $${b ** 2}$ aux deux membres.<br>`
          }
          texteCorr += `$${a}${miseEnEvidence(ecritureAlgebrique(-(b ** 2)), bleuMathalea)}=${rienSi1(2 * b)}x${ecritureAlgebrique(b ** 2)}${miseEnEvidence(ecritureAlgebrique(-(b ** 2)), bleuMathalea)}$<br>`
          texteCorr += `$${a - b ** 2}=${rienSi1(2 * b)}x$<br>`
          if (this.correctionDetaillee) {
            texteCorr += `On divise les deux membres par $${2 * b}$.<br>`
          }
          texteCorr += `$${a - b ** 2}${miseEnEvidence(`\\div${ecritureParentheseSiNegatif(2 * b)}`, bleuMathalea)}=${rienSi1(2 * b)}x${miseEnEvidence(`\\div${ecritureParentheseSiNegatif(2 * b)}`, bleuMathalea)}$<br>`
          texteCorr += `$x=${reponse.texFSD}$`
          if (pgcd(abs(a - b ** 2), abs(2 * b)) > 1) {
            texteCorr += `<br>Par simplification, $x=${reponse.simplifie().texFSD}$.`
          }
          texteCorr += '<br>'
        }

        texteCorr += `La solution de l'équation ${equation} est $${miseEnEvidence(reponse.simplifie().texFSD)}$.`

        texte = addMathaleaSolveur(this, i, {
          initial: equation.slice(1, -1),
          kind: 'equation',
          mode: this.interactif ? 'evaluation' : 'entrainement',
        })
        handleAnswers(
          this,
          i,
          {
            reponse: {
              value: `x=${reponse.simplifie().texFSD}`,
            },
          },
          { formatInteractif: 'mathalea-solveur' },
        )

        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
