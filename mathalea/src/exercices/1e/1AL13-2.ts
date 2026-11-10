import { createList } from '../../lib/format/lists'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
} from '../../lib/outils/ecritures'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { toutAUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
export const titre = 'Étudier une suite arithmético-géométrique'
export const dateDePublication = '30/11/2024'
export const interactifReady = true

export const dateDeModificationImportante = '18/04/2026' // Passage en MultiMathfield, ce qui sous-entend la 1e question en Mathlive et plus en Qcm.

/**
 * Étudier une suite arithmético-géométrique
 * @author Gilles Mora
 */
export const uuid = '12afd'

export const refs = {
  'fr-fr': ['1AL13-2', 'TSA1-31'],
  'fr-ch': ['autres-10'],
}
export default class SuitesArithmeticoG extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.sup = '3'
    this.spacing = 1.5
    this.spacingCorr = 1.5
    this.besoinFormulaire2CaseACocher = ['Avec des décimaux']
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let a, u0, b, k
      const ListeNomS = ['u', 'w']
      const ListeNomSA = ['v', 'c']
      const NomS = choice(ListeNomS)
      const NomSA = choice(ListeNomSA)

      if (this.sup2) {
        a = randint(-19, 19, [0, -10, 10]) / 10
        u0 = randint(-19, 19, [0, -10, 10]) / 10
        k = randint(2, 8)
        b = k * (1 - a)
      } else {
        a = randint(-10, 10, [-1, 0, 1])
        u0 = randint(-10, 10)
        k = randint(-6, 6, [u0, 0])
        b = k * (1 - a)
      }

      texte = `Soit $(${NomS}_n)$ la suite définie pour tout entier naturel $n$ par $${NomS}_{n+1}=${texNombre(a, 1)}${NomS}_n ${ecritureAlgebrique(b)}$ et $${NomS}_0=${texNombre(u0, 1)}$.<br>`
      texte +=
        context.isHtml && this.interactif
          ? addMultiMathfield(this, i, {
              dataTemplate: `On pose $${NomSA}_n=${NomS}_n ${ecritureAlgebrique(-k)}$ pour tout entier naturel $n$.
      a) Exprimer $${NomSA}_{n+1}$ en fonction de $${NomSA}_n$.\n$${NomSA}_{n+1}=$%{champ1}
      b) Exprimer $${NomSA}_n$ en fonction de $n$.\n$${NomSA}_n=$%{champ2}
      c) En déduire l'expression de $${NomS}_n$ en fonction de $n$.\n$${NomS}_n=$%{champ3}`,
              dataOptions: {
                champ1: {
                  keyboard: KeyboardType.clavierSuite,
                },
                champ2: {
                  keyboard: KeyboardType.clavierSuite,
                },
                champ3: {
                  keyboard: KeyboardType.clavierSuite,
                },
              },
            })
          : createList({
              items: [
                `On pose $${NomSA}_n=${NomS}_n ${ecritureAlgebrique(-k)}$ pour tout entier naturel $n$.<br>
Montrer que  $(${NomSA}_n)$ est une suite géométrique.<br>
 Donner sa raison et son premier terme.`,
                `Exprimer $${NomSA}_n$ en fonction de $n$.`,
                `En déduire l'expression du terme général de $(${NomS}_n)$ en fonction de $n$.`,
              ],
              style: 'alpha',
            })
      handleAnswers(
        this,
        i,
        {
          bareme: toutAUnPoint,
          champ1: { value: `${texNombre(a, 1)}${NomSA}_n` },
          champ2: {
            value: `${u0 - k} \\times ${ecritureParentheseSiNegatif(a)}^n`,
          },
          champ3: {
            value: `${u0 - k}\\times ${ecritureParentheseSiNegatif(a)}^n ${ecritureAlgebrique(k)}`,
          },
        },
        { formatInteractif: 'multi-mathfield' },
      )

      texteCorr = createList({
        items: [
          `Pour tout entier naturel $n$, <br>
            $\\begin{aligned}
           ${NomSA}_{n+1}&=${NomS}_{n+1} ${ecritureAlgebrique(-k)}\\\\
           &=${texNombre(a, 1)}${NomS}_n ${ecritureAlgebrique(b)} ${ecritureAlgebrique(-k)}\\\\
           &=${texNombre(a, 1)}${NomS}_n ${ecritureAlgebrique(b - k)}\\\\
           &=${texNombre(a, 1)}(\\underbrace{${NomS}_n${ecritureAlgebrique(-k)}}_{${NomSA}_n})\\\\
           &=${texNombre(a, 1)}${NomSA}_n
           \\end{aligned}$<br>
           On a donc $${NomSA}_{n+1}=${miseEnEvidence(`${texNombre(a, 1)}${NomSA}_n`)}$.<br>
           `,
          `
          $(${NomSA}_n)$ est donc une suite géométrique de raison $${texNombre(a, 1)}$.<br>
           On calcule son premier terme $${NomSA}_0$ : <br>
           $\\begin{aligned}
          ${NomSA}_0&=${NomS}_0${ecritureAlgebrique(-k)}\\\\
          &=${texNombre(u0, 1)}${ecritureAlgebrique(-k)}\\\\
          &=${texNombre(u0 - k, 1)}
          \\end{aligned}$<br>
          On en déduit l'expression de $${NomSA}_n$ en fonction de $n$ pour tout entier naturel $n$ : $${NomSA}_n=${miseEnEvidence(`${texNombre(u0 - k, 1)}\\times ${ecritureParentheseSiNegatif(a)}^n`)}$.
           `,
          `Puisque $${NomSA}_n=${NomS}_n ${ecritureAlgebrique(-k)}$, alors $${NomS}_n=${NomSA}_n ${ecritureAlgebrique(k)}$.<br>
           Ainsi l'expression de $${NomS}_n$ en fonction de $n$ est donnée pour tout entier naturel $n$ par  : 
           $${NomS}_n=${miseEnEvidence(`${texNombre(u0 - k, 1)}\\times ${ecritureParentheseSiNegatif(a)}^n ${ecritureAlgebrique(k)}`)}$.`,
        ],
        style: 'alpha',
      })
      if (this.questionJamaisPosee(i, texte)) {
        // <- laisser le i et ajouter toutes les variables qui rendent les exercices différents (par exemple a, b, c et d)
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
