import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { choice } from '../../../lib/outils/arrayOutils'
import { ecritureAlgebrique } from '../../../lib/outils/ecritures'
import { scriptPython } from '../../../lib/outils/scriptPython'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
import { sp } from '../../../lib/outils/outilString'
export const titre = 'Donner le résultat d’un programme Python'
export const interactifReady = true

// Les exports suivants sont optionnels mais au moins la date de publication semble essentielle
export const dateDePublication = '21/02/2022' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
// export const dateDeModifImportante = '14/02/2022' // Une date de modification importante au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export const uuid = '0f014'

export const refs = {
  'fr-fr': ['can1S1-05'],
  'fr-ch': ['autres-7'],
}
export default class CalculSuitePython extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    let a, b, k, u, r, q
    let n = 0
    switch (
      this.quotaChoice('cas', ['a', 'b', 'c']) //
    ) {
      case 'a': // u=u+r
        a = randint(2, 5)
        u = randint(1, 8) * choice([-1, 1])
        r = randint(1, 9) * choice([-1, 1])
        k = a
        this.question = `Que renvoie l'instruction $\\texttt{suite(${a})}$${sp()}?<br>
       ${scriptPython(
         `def suite(n) :
 u = ${u}
 for i in range(n) :
  u = u${ecritureAlgebrique(r)}
 return u`,
         6,
       )}`

        this.correction = ` L'instruction $\\texttt{for i in range(n)}$ signifie${sp()}: pour i allant de $0$ à $${a - 1}$.<br>
      On calcule les valeurs successives de la variable u${sp()}:<br>`

        for (let indice = 0; indice < k; indice++) {
          this.correction += `Pour i=${indice}, u = $${u} ${ecritureAlgebrique(r)} = ${u + r}$<br>`
          u = u + r
        }
        this.reponse = u
        this.correction += `L'algorithme retourne $${miseEnEvidence(u)}$.`
        break

      case 'b': // suite u=u+i
        a = randint(3, 4)
        u = randint(1, 8) * choice([-1, 1])
        k = a
        this.question = `Que renvoie l'instruction $\\texttt{suite(${a})}$${sp()}?<br>
        ${scriptPython(
          `def suite(n) :
 u = ${u}
 for i in range(1,n) :
  u = u+i
 return u`,
          6,
        )}`

        this.correction = ` L'instruction $\\texttt{for i in range(1,n)}$ signifie${sp()}: pour i allant de 1 à $${a - 1}$.<br>
        On calcule les valeurs successives de la variable u${sp()}:<br>`

        for (let indice = 1; indice < k; indice++) {
          this.correction += `Pour i=${indice}, u = $${u} +${indice} = ${u + indice}$<br>`
          u = u + indice
        }
        this.reponse = u
        this.correction += `L'algorithme retourne $${miseEnEvidence(u)}$.`
        break

      case 'c': // suite u=u+i
        a = randint(1, 5)
        b = randint(6, 80)
        q = randint(2, 3)
        k = a
        this.question = `Que renvoie l'instruction $\\texttt{suite(${a})}$${sp()}?<br>
        ${scriptPython(
          `def suite(u) :
 n=0
 while u<${b}:
  u = u*${q}
  n = n+1
 return n`,
          6,
        )}`
        this.correction = ` L'instruction $\\texttt{while u<${b}}$ signifie${sp()}: tant que u<${b}.<br>
On calcule les valeurs successives des variables u et n. On s'arrête dès que u dépasse $${b}$${sp()}:<br>
        On a au départ, u=${a} et n=0, puis, `

        while (a < b) {
          this.correction += `<br>n=${n + 1} et u=${a}$\\times$ ${q} = ${a * q}`
          n = n + 1
          a = q * a
        }
        this.correction += `$> ${b}$. Donc l'algorithme retourne $${miseEnEvidence(n)}$.`
        this.reponse = n
        break
    }
  }
}
