import { createList } from '../../lib/format/lists'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
  rienSi1,
} from '../../lib/outils/ecritures'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../lib/outils/embellissements'
export const titre = 'Étudier une suite arithmético-géométrique'
export const dateDePublication = '30/11/2024'
export const interactifReady = true

/**
 * Étudier une suite arithmético-géométrique
 * @author Gilles Mora
 */
export const uuid = '12afc'

export const refs = {
  'fr-fr': [],
  'fr-ch': [],
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
      const ListeNomSA = ['v', 't']
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
      this.autoCorrection[3 * i] = {
        enonce: texte,
        options: { vertical: true },
        propositions: [
          {
            texte: `Pour tout entier naturel $n$, $${NomSA}_{n+1}=${texNombre(a, 1)}${NomSA}_n$`,
            statut: true,
          },
          {
            texte: `Pour tout entier naturel $n$, $${NomSA}_{n+1}=${texNombre(b, 1)}${NomSA}_n$`,
            statut: false,
          },
          {
            texte: `Pour tout entier naturel $n$, $${NomSA}_{n+1}= ${rienSi1(-k)}${NomSA}_n$`,
            statut: false,
          },
          {
            texte: `Pour tout entier naturel $n$, $${NomSA}_{n+1}=${NomSA}_n${ecritureAlgebrique(-k)}$`,
            statut: false,
          },
        ],
      }
      const monQcm = propositionsQcm(this, 3 * i)
      if (this.interactif) texte += monQcm.texte

      texte = `Soit $(${NomS}_n)$ la suite définie pour tout entier naturel $n$ par $${NomS}_{n+1}=${texNombre(a, 1)}${NomS}_n ${ecritureAlgebrique(b)}$ et $${NomS}_0=${texNombre(u0, 1)}$.`
      texte += createList({
        items: [
          `${
            this.interactif
              ? `On pose $${NomSA}_n=${NomS}_n ${ecritureAlgebrique(-k)}$ pour tout entier naturel $n$.<br>
` + monQcm.texte
              : `On pose $${NomSA}_n=${NomS}_n ${ecritureAlgebrique(-k)}$ pour tout entier naturel $n$.<br>
Montrer que  $(${NomSA}_n)$ est une suite géométrique.<br>
 Donner sa raison et son premier terme.`
          }`,
          `Exprimer $${NomSA}_n$ en fonction de $n$.` +
            ajouteChampTexteMathLive(
              this,
              3 * i + 1,
              KeyboardType.clavierSuite,
              {
                texteAvant: `<br>$${NomSA}_n=$`,
              },
            ),
          `En déduire l'expression du terme général de $(${NomS}_n)$ en fonction de $n$.` +
            ajouteChampTexteMathLive(
              this,
              3 * i + 2,
              KeyboardType.clavierSuite,
              {
                texteAvant: `<br>$${NomS}_n=$`,
              },
            ),
        ],
        style: 'nombres',
      })

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
           On a donc $${miseEnEvidence(`${NomSA}_{n+1}=${texNombre(a, 1)}${NomSA}_n`)}$.<br>
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
        style: 'nombres',
      })
      const reponse1 = `${u0 - k} \\times ${ecritureParentheseSiNegatif(a)}^n`
      const reponse2 = `${u0 - k}\\times ${ecritureParentheseSiNegatif(a)}^n ${ecritureAlgebrique(k)}`
      handleAnswers(this, 3 * i + 1, { reponse: { value: reponse1 } })
      handleAnswers(this, 3 * i + 2, { reponse: { value: reponse2 } })
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
