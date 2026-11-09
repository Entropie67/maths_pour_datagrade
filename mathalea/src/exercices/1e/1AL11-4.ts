import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

import Decimal from 'decimal.js'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { ecritureParentheseSiMoins } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
export const titre =
  "Calculer la raison d'une suite arithmétique ou géométrique"
export const interactifReady = true

export const dateDePublication = '23/10/2024'

/**
 *
 * @author Gilles Mora

*/
export const uuid = 'db786'

export const refs = {
  'fr-fr': ['1AL11-4'],
  'fr-ch': [],
}
export default class SuitesRaison extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.sup = '5'
    this.spacing = 1.5
    this.spacingCorr = 2
    this.besoinFormulaire2CaseACocher = ['Avec des décimaux']
    this.correctionDetaillee = false
    this.correctionDetailleeDisponible = true
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets :',
        '1 : Suite arithmétique avec deux termes consécutifs',
        '2 : Suite arithmétique avec deux termes non consécutifs',
        '3 : Suite géométrique avec deux termes consécutifs',
        '4 : Suite géométrique avec deux termes non consécutifs',
        '5 : Mélange',
      ].join('\n'),
    ]
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      max: 4,
      melange: 5,
      defaut: 5,
      nbQuestions: this.nbQuestions,
    })
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let reponse
      const ListeNomS = ['u', 'v', 'w', 't']
      const NomS = choice(ListeNomS)
      let k
      let r
      let a, b
      let q, q2
      let indice
      let indiceP
      switch (listeTypeDeQuestions[i]) {
        case 1: // SA avec deux termes consécutifs
          a = this.sup2
            ? new Decimal(randint(1, 99)).div(10)
            : randint(-12, 12, 0)
          r = this.sup2
            ? new Decimal(randint(-99, 99, 0)).div(10)
            : randint(-15, 15, 0)
          b = new Decimal(a).add(r)
          indice = randint(0, 10)
          indiceP = indice + 1
          reponse = texNombre(r, 2)
          handleAnswers(this, i, { reponse: { value: reponse } })
          texte = `Soit $(${NomS}_n)$ une suite arithmétique telle que $${NomS}_{${indice}}=${texNombre(a, 2)}$ et $${NomS}_{${indiceP}}=${texNombre(b, 2)}$.<br>
         Quelle est la valeur de la raison $r$ de cette suite ?`
          if (this.correctionDetaillee) {
            texteCorr = `Si $(u_n)$ est une suite arithmétique de raison $r$, alors pour tout entier naturel $n$, $u_{n+1}=u_n+r$.<br>
           Ainsi, $r=u_{n+1}-u_n$.<br>`
          } else {
            texteCorr = ''
          }
          texteCorr += `La suite $(${NomS}_n)$ est arithmétique, on obtient donc la raison de la suite en effectuant la différence de deux termes consécutifs : <br>
          $\\begin{aligned}        
          r&=${NomS}_{${indiceP}}-${NomS}_{${indice}}\\\\
          &=${texNombre(b, 2)}-${ecritureParentheseSiMoins(texNombre(a, 2))}\\\\
          &=${miseEnEvidence(reponse)}
          \\end{aligned}$    
          `

          break
        case 2: // SA avec deux termes non consécutifs
          a = this.sup2
            ? new Decimal(randint(1, 99)).div(10)
            : randint(-12, 12, 0)
          k = randint(5, 15)
          r = this.sup2
            ? new Decimal(randint(-99, 99, 0)).div(10)
            : randint(-15, 15, 0)
          b = new Decimal(r).mul(k).add(a)
          reponse = texNombre(r, 2)
          indice = randint(0, 10)
          indiceP = indice + k
          handleAnswers(this, i, { reponse: { value: reponse } })
          texte = `Soit $(${NomS}_n)$ une suite arithmétique telle que $${NomS}_{${indice}}=${texNombre(a, 2)}$ et $${NomS}_{${indiceP}}=${texNombre(b, 2)}$.<br>
         Quelle est la valeur de la raison $r$ de cette suite ?`
          if (this.correctionDetaillee) {
            texteCorr = `Si $(u_n)$ est une suite arithmétique de raison $r$, alors pour tout entier naturel $n$ et $p$, on a $u_n=u_p+(n-p)\\times r$. <br>
            Ainsi, $r=\\dfrac{u_n-u_p}{n-p}$.<br>`
          } else {
            texteCorr = ''
          }
          texteCorr += `$(${NomS}_n)$ est une suite arithmétique, alors $${NomS}_{${indiceP}}=${NomS}_{${indice}}+(${indiceP}-${indice})\\times r$. <br>
          Ainsi : <br>
          $\\begin{aligned}
          r&=\\dfrac{${NomS}_{${indiceP}}-${NomS}_{${indice}}}{${indiceP}-${indice}}\\\\
          &=\\dfrac{${texNombre(b, 2)}-${ecritureParentheseSiMoins(texNombre(a, 2))}}{${indiceP - indice}}\\\\
          &=${miseEnEvidence(reponse)}
          \\end{aligned}$
          <br>   
           `

          break

        case 3: // suite géométrique avec deux termes consécutifs
          a = this.sup2
            ? new Decimal(randint(1, 99, 0)).div(10)
            : randint(-12, 12, 0)
          q = this.sup2
            ? new Decimal(randint(0, 10, [0, 10])).div(10)
            : randint(-15, 15, [0, 1])
          b = new Decimal(a).mul(q)
          indice = randint(0, 10)
          indiceP = indice + 1
          reponse = texNombre(q, 2)
          handleAnswers(this, i, { reponse: { value: reponse } })
          texte = `Soit $(${NomS}_n)$ une suite géométrique telle que $${NomS}_{${indice}}=${texNombre(a, 2)}$ et $${NomS}_{${indiceP}}=${texNombre(b, 2)}$.<br>
         Quelle est la valeur de la raison $q$ de cette suite ?`
          if (this.correctionDetaillee) {
            texteCorr = `Si $(u_n)$ est une suite géométrique de raison $q$, alors pour tout entier naturel $n$, $u_{n+1}=q\\times u_n$.<br>
           Ainsi, $q=\\dfrac{u_{n+1}}{u_n}$.<br>`
          } else {
            texteCorr = ''
          }
          texteCorr += `La suite $${NomS}_n$ est géométrique, on obtient donc la raison de la suite en effectuant le quotient de deux termes consécutifs : <br>
          $\\begin{aligned}        
          q&=\\dfrac{${NomS}_{${indiceP}}}{${NomS}_{${indice}}}\\\\
          &=\\dfrac{${texNombre(b, 2)}}{${texNombre(a, 2)}}\\\\
          &=${miseEnEvidence(reponse)}
          \\end{aligned}$    
          `

          break

        case 4:
          a = this.sup2
            ? new Decimal(randint(1, 99, 0)).div(10)
            : randint(-12, 12, 0)
          k = 2
          q = this.sup2
            ? new Decimal(randint(-99, 99, [0, 10])).div(10)
            : randint(-15, 15, [0, 1])
          b = new Decimal(q).pow(k).mul(a)
          q2 = new Decimal(b).div(a)
          reponse = texNombre(q, 2)
          indice = randint(1, 10)
          indiceP = indice + k
          handleAnswers(this, i, { reponse: { value: reponse } })
          texte = `Soit $(${NomS}_n)$ une suite géométrique de raison $q$ strictement ${Decimal.sign(q) === 1 ? 'positive' : 'négative'} telle que $${NomS}_{${indice}}=${texNombre(a, 5)}$ et $${NomS}_{${indiceP}}=${texNombre(b, 5)}$.<br>
           Quelle est la valeur de la raison de cette suite ?`
          if (this.correctionDetaillee) {
            texteCorr =
              'Si $(u_n)$ est une suite géométrique de raison $q$, alors pour tout entier naturel $n$ et $p$, on a $u_n=u_p\\times q^{n-p}$.<br>'
          } else {
            texteCorr = ''
          }
          texteCorr += `$(${NomS}_n)$ est une suite géométrique, alors $${NomS}_{${indiceP}}=${NomS}_{${indice}}\\times q^{${indiceP}-${indice}}$. <br>
            Ainsi : <br>
            $\\begin{aligned}
            ${NomS}_{${indiceP}}&=${NomS}_{${indice}}\\times q^{${indiceP}-${indice}}\\\\
            ${texNombre(b, 2)}&=${texNombre(a, 2)}\\times q^{${indiceP - indice}}\\\\
           q^{${indiceP - indice}} &=\\dfrac{${texNombre(b, 2)}}{${texNombre(a, 2)}}\\\\
           q^{${indiceP - indice}}&=${texNombre(q2, 4)}\\\\
           q&=${Decimal.sign(q) === 1 ? '' : '-'}\\sqrt{${texNombre(q2, 4)}}${Decimal.sign(q) === 1 ? "\\text{ car d'après l'énoncé la raison est strictement positive.}" : "\\text{ car d'après l'énoncé la raison est strictement négative.}"}\\\\
            q&=${miseEnEvidence(reponse)}
            \\end{aligned}$  
             `
          break
      }

      if (listeTypeDeQuestions[i] === 1 || listeTypeDeQuestions[i] === 2) {
        texte +=
          '<br>' +
          ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase, {
            texteAvant: '$r=$',
          })
      } else {
        texte +=
          '<br>' +
          ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase, {
            texteAvant: '$q=$',
          })
      }
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
