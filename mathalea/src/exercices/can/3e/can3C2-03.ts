import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
import { sp } from '../../../lib/outils/outilString'
export const titre = 'Encadrer avec des puissances de $10$'
export const interactifReady = true

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

 * Date de publication 18/10/2021
*/
export const uuid = '3c064'

export const refs = {
  'fr-fr': ['can3C2-03', '2N44-flash1'],
  'fr-ch': [],
}
export default class EncadrementAvecPuissancesDe10 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    let a
    const choix = this.quotaChoice('choix', ['$a$', '$b$'])
    switch (this.quotaChoice('cas', ['a', 'b', 'c', 'd', 'e'])) {
      case 'a':
        a =
          randint(2, 9) * 10 ** 4 +
          randint(1, 9) * 10 ** 3 +
          randint(1, 9) * 10 ** 2 +
          randint(1, 9) * 10 +
          randint(1, 9)
        this.question = `L'encadrement de $${texNombre(a)}$ par deux puissances de $10$ d'exposants consécutifs est $10^a<${texNombre(a)}<10^b$.<br>
  
        Quelle est la valeur de ${choix}${sp()}?
  `
        if (choix === '$b$') {
          this.correction = `Comme $${texNombre(10000)}<${texNombre(a)}<${texNombre(100000)}$, alors${sp()}:<br>
       $10^4<${texNombre(a)}<10^5$. On en déduit que $b=${miseEnEvidence(5)}$.`
          this.reponse = ['5']
        } else {
          this.correction = `Comme $${texNombre(10000)}<${texNombre(a)}<${texNombre(100000)}$, alors${sp()}:<br>
           $10^4<${texNombre(a)}<10^5$. On en déduit que $a=${miseEnEvidence(4)}$.`
          this.reponse = ['4']
        }
        break

      case 'b':
        a =
          randint(2, 9) * 10 ** 5 +
          randint(1, 9) * 10 ** 4 +
          randint(1, 9) * 10 ** 3 +
          randint(1, 9) * 10 ** 2 +
          randint(1, 9) * 10 +
          randint(1, 9)
        this.question = `L'encadrement de $${texNombre(a)}$ par deux puissances de $10$ d'exposants consécutifs est $10^a<${texNombre(a)}<10^b$.<br>
      
        Quelle est la valeur de ${choix}${sp()}?
      `
        if (choix === '$b$') {
          this.correction = `Comme $${texNombre(100000)}<${texNombre(a)}<1000000$, alors${sp()}:<br>
       $10^5<${texNombre(a)}<10^6$. On en déduit $b=${miseEnEvidence(6)}$.`
          this.reponse = ['6']
        } else {
          this.correction = `Comme $${texNombre(100000)}<${texNombre(a)}<1000000$, alors${sp()}:<br>
           $10^5<${texNombre(a)}<10^6$. On en déduit $a=${miseEnEvidence(5)}$.`
          this.reponse = ['5']
        }
        break

      case 'c':
        a = randint(2, 9) * 0.001 + randint(1, 9) * 0.01
        this.question = `L'encadrement de $${texNombre(a)}$ par deux puissances de $10$ d'exposants consécutifs est $10^a<${texNombre(a)}<10^b$.<br>
        
        Quelle est la valeur de ${choix}${sp()}?
            `
        if (choix === '$b$') {
          this.correction = `Comme $0,01<${texNombre(a)}<0,1$, alors${sp()}:<br>
       $10^{-2}<${texNombre(a)}<10^{-1}$. On en déduit${sp()}: $b=${miseEnEvidence(-1)}$.`
          this.reponse = ['-1']
        } else {
          this.correction = `Comme $0,01<${texNombre(a)}<0,1$, alors${sp()}:<br>
        $10^{-2}<${texNombre(a)}<10^{-1}$. On en déduit${sp()}: $a=${miseEnEvidence(-2)}$.`
          this.reponse = ['-2']
        }
        break
      case 'd':
        a = randint(2, 9) * 0.001
        this.question = `L'encadrement de $${texNombre(a)}$ par deux puissances de $10$ d'exposants consécutifs est $10^a<${texNombre(a)}<10^b$.<br>
        
        Quelle est la valeur de ${choix}${sp()}?
              `
        if (choix === '$a$') {
          this.correction = `Comme $0,001<${texNombre(a)}<0,01$, alors${sp()}:<br>
       $10^{-3}<${texNombre(a)}<10^{-2}$, donc $a=${miseEnEvidence(-3)}$.`
          this.reponse = ['-3']
        } else {
          this.correction = `Comme $0,001<${texNombre(a)}<0,01$, alors${sp()}:<br>
        $10^{-3}<${texNombre(a)}<10^{-2}$, donc $b=${miseEnEvidence(-2)}$.`
          this.reponse = ['-2']
        }
        break
      case 'e':
        a = randint(2, 9) * 0.01 + randint(1, 5) * 0.1

        this.question = `L'encadrement de $${texNombre(a)}$ par deux puissances de $10$ d'exposants consécutifs est $10^a<${texNombre(a)}<10^b$.<br>
        
        Quelle est la valeur de ${choix}${sp()}?
                `
        if (choix === '$a$') {
          this.correction = `Comme $0,1<${texNombre(a)}<1$, alors${sp()}:<br>
         $10^{-1}<${texNombre(a)}<10^{0}$, donc $a=${miseEnEvidence(-1)}$.`
          this.reponse = ['-1']
        } else {
          this.correction = `Comme $0,1<${texNombre(a)}<1$, alors${sp()}:<br>
           $10^{-1}<${texNombre(a)}<10^{0}$, donc $b=${miseEnEvidence(0)}$.`
          this.reponse = ['0']
        }
        break
    }
  }
}
