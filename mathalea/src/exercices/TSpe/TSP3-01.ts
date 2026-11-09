import { fixeBordures } from '../../lib/2d/fixeBordures'
import { tableauColonneLigne } from '../../lib/2d/tableau'
import { createList } from '../../lib/format/lists'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import {
  texteEnCouleurEtGras,
  texteItalique,
} from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { Arbre } from '../../modules/arbres'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'
import { sp } from '../../lib/outils/outilString'
export const titre = "Calculer la variance d'une somme de variables aléatoires"
export const interactifReady = false
export const dateDePublication = '26/12/2025'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Stéphane Guyon

 *
*/
export const uuid = 'd5829'

export const refs = {
  'fr-fr': ['TSP3-01'],
  'fr-ch': [],
}
export default class VarianceVariablesAleatoires extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.formatChampTexte = KeyboardType.clavierFullOperations
    this.optionsChampTexte = { texteAvant: '<br>$I=$ ' }

    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const pA = randint(2, 8) / 10
    const pBsipA = randint(2, 8) / 10
    const pBsiNonpA = randint(2, 8) / 10
    const pB = pA * pBsipA + (1 - pA) * pBsiNonpA
    const p0 = (1 - pA) * (1 - pBsiNonpA)
    const p1 = 1 - p0 - pA * pBsipA
    const p2 = pA * pBsipA
    const E1 = pA
    const E2 = pB
    const E = E1 + E2
    const V =
      4 * pA * pBsipA + 1 - (1 - pA) * (1 - pBsiNonpA) - pA * pBsipA - E * E
    const V1 = pA * (1 - pA)
    const V2 = pB * (1 - pB)
    const omega = new Arbre({
      racine: true,
      rationnel: true,
      nom: '',
      proba: 1,
      visible: true,
      alter: '',
      enfants: [
        new Arbre({
          rationnel: true,
          nom: `A`,
          proba: pA,
          enfants: [
            new Arbre({
              rationnel: true,
              nom: `B`,
              proba: pBsipA,
            }),
            new Arbre({
              rationnel: true,
              nom: `\\overline{B}`,
              proba: 1 - pBsipA,
            }),
          ],
        }),
        new Arbre({
          rationnel: true,
          nom: `\\overline{A}`,
          proba: 1 - pA,
          enfants: [
            new Arbre({
              rationnel: true,
              nom: `B`,
              proba: pBsiNonpA,
            }),
            new Arbre({
              rationnel: true,
              nom: `\\overline{B}`,
              proba: 1 - pBsiNonpA,
            }),
          ],
        }),
      ],
    })

    omega.setTailles() // On calcule les tailles des arbres.
    const objets = omega.represente(0, 9, 0, 3, true, 1, 2)
    this.question = `Chaque question est notée sur un point. `
    this.question += createList({
      items: [
        `Une réponse correcte rapporte un point.`,
        `Une réponse incorrecte, incomplète ou une absence de réponse rapporte zéro point.`,
      ],
      style: 'fleches',
    })
    this.question += `On considère que${sp()}:`
    this.question += createList({
      items: [
        `Un candidat pris au hasard a une probabilité $${texNombre(pA)}$ de répondre correctement à la question $Q_1.$`,
        `Si le candidat répond correctement à $Q_1$, il a une probabilité $${texNombre(pBsipA)}$ de répondre correctement à
$Q_2.$`,
        ` S’il ne répond pas correctement à $Q_1$, il a une probabilité $${texNombre(pBsiNonpA)}$ de répondre correctement
à $Q_2.$`,
      ],
      style: 'fleches',
    })
    this.question += `On prend un candidat au hasard et on note${sp()}:`
    this.question += createList({
      items: [
        `$A$ l’évènement${sp()}: «${sp()}le candidat répond correctement à la question $Q_1$${sp()}» ;`,
        `$B$ l’évènement${sp()}: «${sp()}le candidat répond correctement à la question $Q_2$${sp()}»;`,
        '$\\overline{A}$ et $\\overline{B}$ sont les évènements contraires de $A$ et de $B.$',
      ],
      style: 'fleches',
    })
    this.question += `${texteEnCouleurEtGras(`Partie A${sp()}:`)}`
    this.question += createList({
      items: [
        `Calculer la probabilité que le candidat réponde correctement aux deux questions $Q_1$ et $Q_2.$`,
        `Calculer la probabilité que le candidat réponde correctement à la question  $Q_2.$`,
        `Les évènements $A$ et $B$ sont-ils indépendants${sp()}? Justifier la réponse.`,
      ],
      style: 'nombres',
    })
    this.question += `${texteEnCouleurEtGras(`Partie B${sp()}:`)}`
    this.question +=
      `<br>On définit les variables aléatoires suivantes${sp()}:` +
      createList({
        items: [
          `$X_1$ la variable aléatoire qui, à un candidat, associe sa note à la question $Q_1.$`,
          `$X_2$ la variable aléatoire qui, à un candidat, associe sa note à la question $Q_2.$`,
          `$X$ la variable aléatoire qui, à un candidat, associe sa note à l’exercice, c’est-à-dire $X = X_1 + X_2.$`,
        ],
        style: 'carres',
      })
    this.question += createList({
      items: [
        `On souhaite déterminer l'espérance de $X$.` +
          createList({
            items: [
              `Déterminer l’espérance de $X_1$ et de $X_2$.`,
              `En déduire l’espérance de $X$.`,
              `Donner une interprétation de l’espérance de $X$ dans le contexte de l’exercice.`,
            ],
            style: 'alpha',
          }),
        `On souhaite déterminer la loi et la variance de $X$.` +
          createList({
            items: [
              `Déterminer $\\mathrm P (X = 0)$.`,
              `Déterminer la probabilité d'avoir deux points au questionnaire.`,
              `En déduire la loi de probabilité de $X$.`,
              `Montrer que la variance de $X$ vaut $${texNombre(V, 4)}$.`,
              `A-t-on $\\mathrm V (X)= \\mathrm V (X_1) + \\mathrm V (X_2)$${sp()}? Que peut-on conclure${sp()}?`,
            ],
            style: 'alpha',
          }),
      ],
      style: 'nombres',
    })
    this.correction = `${texteEnCouleurEtGras(`Partie A${sp()}:`)}<br>`
    this.correction += `On commence par construire un arbre de probabilité qui illustre la situation${sp()}:<br>`
    this.correction += mathalea2d(
      Object.assign({ scale: 0.7, display: 'inline' } as const, fixeBordures(objets)),
      objets,
    )
    const correction1 = `L'évènement «${sp()}${texteItalique('le candidat répond correctement aux deux questions $Q_1$ et $Q_2$')}${sp()}» est $A\\cap B.$<br>
        $\\begin{aligned}\\mathrm P (A\\cap B) &= \\mathrm P (A) \\times \\mathrm P_A (B)\\\\& = ${texNombre(pA)} \\times ${texNombre(pBsipA)}\\\\& = ${texNombre(pA * pBsipA)}\\end{aligned}.$`
    const correction2 = `L'évènement «${sp()}${texteItalique('le candidat répond correctement à la question $Q_2$')}${sp()}» est $B.$<br>
       Comme $A$ et $\\overline{A}$ forment une partition de l'univers, on utilise la formule des probabilités totales${sp()}: <br>
       $\\begin{aligned}\\mathrm P (B) &= \\mathrm P (A) \\times \\mathrm P_A (B) + \\mathrm P (\\overline{A}) \\times \\mathrm P_{\\overline{A}} (B)\\\\& = ${texNombre(pA)} \\times ${texNombre(pBsipA)} + ${texNombre(1 - pA)} \\times ${texNombre(pBsiNonpA)}\\\\& = ${texNombre(pB)}\\end{aligned}.$`
    const correction3 = `On calcule $\\mathrm P (A) \\times \\mathrm P (B) :$ <br>
       $\\begin{aligned}\\mathrm P (A) \\times \\mathrm P (B) &= ${texNombre(pA)} \\times ${texNombre(pB)}\\\\& = ${texNombre(pA * pB)}\\end{aligned}.$ <br>
       Or, on a vu précédemment que $\\mathrm P (A \\cap B) = ${texNombre(pA * pBsipA)}.$ <br>
       Comme $\\mathrm P (A) \\times \\mathrm P (B) \\ne \\mathrm P (A \\cap B)$, on en déduit que les évènements $A$ et $B$ ne sont pas indépendants.`
    this.correction += createList({
      items: [correction1, correction2, correction3],
      style: 'nombres',
    })
    this.correction += `${texteEnCouleurEtGras(`Partie B${sp()}:`)}<br>`
    let correction4 = `Pour chaque question, le candidat peut soit répondre correctement (succès), soit répondre incorrectement (échec).<br>
      On peut donc modéliser chaque question par une épreuve de Bernoulli.<br>
      La variable aléatoire $X_1$ suit donc une loi de Bernoulli de paramètre $\\mathrm{P}(A)$ et la variable aléatoire $X_2$ suit une loi de Bernoulli de paramètre $\\mathrm{P}(B).$<br>`
    correction4 += tableauColonneLigne(
      ['x_i', '0', '1'],
      ['\\mathrm{P}(X_1=x_i)'],
      [`${texNombre(1 - pA)}`, `${texNombre(pA)}`],
    )
    correction4 +=
      '<br>' +
      tableauColonneLigne(
        ['x_i', '0', '1'],
        ['\\mathrm{P}(X_2=x_i)'],
        [`${texNombre(1 - pB)}`, `${texNombre(pB)}`],
      )

    // Partie B  Question 1
    correction4 += createList({
      items: [
        `On sait que l'espérance de la variable aléatoire $X_1$ vaut${sp()}: <br>
      $\\begin{aligned}\\mathrm E (X_1) &= 0 \\times \\mathrm P (X_1 = 0) + 1 \\times \\mathrm P (X_1 = 1)\\\\& = 0 \\times ${texNombre(1 - pA)} + 1 \\times ${texNombre(pA)}\\\\& = ${texNombre(E1)}\\end{aligned}.$<br>
      De même, pour $X_2$${sp()}: <br>
      $\\begin{aligned}\\mathrm E (X_2) &= 0 \\times \\mathrm P (X_2 = 0) + 1 \\times \\mathrm P (X_2 = 1)\\\\& = 0 \\times ${texNombre(1 - pB)} + 1 \\times ${texNombre(pB)}\\\\& = ${texNombre(E2)}\\end{aligned}.$<br>
      ${texteEnCouleurEtGras(`Remarque${sp()}:`)} on retrouve un résultat de cours, que l'on pouvait utiliser ici directement${sp()}: l'espérance d'une variable aléatoire suivant une loi de Bernoulli de paramètre $p$ est égale à $p.$<br>`,
        ` Par linéarité de l'espérance, on en déduit${sp()}: <br>
      $\\begin{aligned}\\mathrm E (X) &= \\mathrm E (X_1 + X_2) = \\mathrm E (X_1) + \\mathrm E (X_2)\\\\& = ${texNombre(E1)} + ${texNombre(E2)}\\\\& = ${texNombre(E)}\\end{aligned}.$`,
        `L'espérance de $X$ représente la note moyenne à cet exercice, pour un grand nombre de candidats.`,
      ],
      style: 'alpha',
    })

    const loiX = tableauColonneLigne(
      ['x_i', '0', '1', '2'],
      ['\\mathrm{P}(X=x_i)'],
      [`${texNombre(p0)}`, `${texNombre(p1)}`, `${texNombre(p2)}`],
    )

    const tableauVariance = tableauColonneLigne(
      ['x_i', '0', '1', '2'],
      ['x_i^2', '\\mathrm{P}(X=x_i)'],
      [
        '0',
        '1',
        '4',
        `${texNombre(p0)}`,
        `${texNombre(p1)}`,
        `${texNombre(p2)}`,
      ],
    )

    const comparaisonVariances =
      V1 + V2 !== V
        ? `Comme $\\mathrm V (X) \\ne \\mathrm V (X_1) + \\mathrm V (X_2).$, on peut conclure que les variables $X_1$ et $X_2$ ne sont donc pas indépendantes. <br>`
        : `On observe que $\\mathrm V (X) = \\mathrm V (X_1) + \\mathrm V (X_2).$, cela ne permet pas de conclure que $X_1$ et $X_2$ sont indépendantes. `

    // Partie B  Question 2
    const correction5 = createList({
      items: [
        `La situation correspondant à $X = 0$ est celle où le candidat répond incorrectement à $Q_1$ et à $Q_2.$ Avec les notations de la partie A, cela correspond à l'évènement $\\overline{A} \\cap \\overline{B}.$<br>
          On obtient${sp()}: <br>  $\\begin{aligned}\\mathrm P (X = 0) &= \\mathrm{P}(\\overline A \\cap \\overline B).\\\\
          & = \\mathrm{P}(\\overline A)\\times \\mathrm{P}_{\\overline A}(\\overline B)\\\\&=${texNombre(1 - pA)} \\times  ${texNombre(1 - pBsiNonpA)} \\\\&= ${texNombre(p0)}\\end{aligned}.$`,
        `L'évènement «${sp()}${texteItalique(`avoir $2$ points au questionnaire`)}${sp()}» est l'évènement $\\{X = 2\\}$, c’est-à-dire à l'évènement $A \\cap B$, donc d'après la question A.$1$., $\\mathrm P (X = 2) = ${texNombre(p2)}.$`,
        `Comme l'ensemble des valeurs prises par $X$ est $\\{0,1,2\\}$, on a${sp()}:<br>$\\begin{aligned}\\mathrm P (X = 0)+\\mathrm P (X = 1)+\\mathrm P (X = 2)&=1\\\\\\mathrm P (X = 1) &= 1 - ${texNombre((1 - pA) * (1 - pBsiNonpA))} - ${texNombre(pA * pBsipA)}\\\\ \\mathrm P (X = 1)&= ${texNombre(1 - (1 - pA) * (1 - pBsiNonpA) - pA * pBsipA)}\\end{aligned}.$ <br>
          La loi de probabilité de $X$ est donnée par${sp()}:${loiX}.`,
        `Pour calculer la variance de $X$, on peut revenir à la définition ou bien utiliser la formule de König-Huygens${sp()}:<br>
          ${texteEnCouleurEtGras(`Utilisation de la définition${sp()}:`)}<br>
          On sait que la variance de la variable aléatoire $\\mathrm X$ est donnée par la formule suivante${sp()}: <br>
          $\\begin{aligned}
          \\mathrm V (X) &= P(X=0)\\times\\left(\\mathrm{E}(X)-0\\right)^2+P(X=1)\\times\\left(\\mathrm{E}(X)-1\\right)^2 +P(X=2)\\times\\left(\\mathrm{E}(X)-2\\right)^2\\\\
          &=${texNombre(p0)}\\times\\left(${texNombre(E)}-0\\right)^2+${texNombre(p1)}\\times\\left(${texNombre(E)}-1\\right)^2 +${texNombre(p2)}\\times\\left(${texNombre(E)}-2\\right)^2\\\\
          &=${texNombre(V)}\\end{aligned}$<br>

           ${texteEnCouleurEtGras(`Utilisation de la formule de König-Huygens${sp()}:`)}
           Pour toute variable aléatoire $X$, on a l'égalité${sp()}: $\\mathrm V (X) = \\mathrm E (X^2) - \\mathrm E (X)^2.$ <br>
          On calcule $\\mathrm E (X^2)$ grâce au tableau suivant${sp()}: <br>
          ${tableauVariance}
          d'où <br>
          $\\begin{aligned}\\mathrm E (X^2)&= 0^2\\times \\mathrm{P}(X=0) + 1^2\\times \\mathrm{P}(X=1) + 2^2\\times \\mathrm{P}(X=2)\\\\
          & = \\mathrm{P}(X=1) + 4\\times \\mathrm{P}(X=2)\\\\&=${texNombre(4 * pA * pBsipA + 1 - (1 - pA) * pBsiNonpA - pA * pBsipA)}\\end{aligned}$ <br>
          puis <br>$\\begin{aligned}\\mathrm V (X) &= \\mathrm E (X^2) - \\mathrm E (X)^2\\\\
          &=${texNombre(4 * pA * pBsipA + 1 - (1 - pA) * pBsiNonpA - pA * pBsipA)}-(${texNombre(E)})^2\\\\
          &=${texNombre(V)}\\end{aligned}.$`,
        `Pour calculer les variances de $X_1$ et $X_2$, on peut utiliser une des deux méthodes précédentes ou bien connaître le cours${sp()}: la variance d'une variable aléatoire, suivant une loi de Bernoulli de paramètre $p$, est égale à $p(1-p).$ <br>
          On peut aussi appliquer la même méthode que précédemment${sp()}:<br>
           $\\begin{aligned}\\mathrm V (X_1) &= ${texNombre(pA)}\\times ${texNombre(1 - pA)}\\\\
           &= ${texNombre(V1)}\\end{aligned}.$<br>
           De même, pour $X_2$${sp()}: <br>
           $\\begin{aligned}\\mathrm V (X_2) &= ${texNombre(pB)}\\times ${texNombre(1 - pB)}\\\\
           &= ${texNombre(V2)}\\end{aligned}.$<br>
           On observe que $\\mathrm V (X_1) + \\mathrm V (X_2) = ${texNombre(V1 + V2)}$ et que la variance de $X$ vaut $\\mathrm V(X)=${texNombre(V)}.$<br>
          ${comparaisonVariances}`,
      ],
      style: 'alpha',
    })
    this.reponse = this.canEnonce = this.question
    this.correction += createList({
      items: [correction4, correction5],
      style: 'nombres',
    })
  }
}
