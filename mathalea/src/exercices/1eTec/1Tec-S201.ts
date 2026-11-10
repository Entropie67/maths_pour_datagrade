import { texNombre } from '../../lib/outils/texNombre'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { ecritureParentheseSiMoins } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { fraction } from '../../modules/fractions'

export const titre = 'Calculer avec des suites arithmétiques et géométriques'
export const interactifReady = true

export const amcReady = true
export const dateDePublication = '25/05/2026' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

export const uuid = 'db3ef'
export const refs = {
  'fr-fr': ['1Tec-S201'],
  'fr-ch': [],
} /**
 *
 * @author Arnaud Meistermann

*/
export default class Suites extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 6
    this.besoinFormulaireTexte = [
      'Choix des questions',
      '1 : Calculer le terme suivant (suite arithmétique) \n2 : Calculer le terme précédent (suite arithmétique)  \n3 : Calculer la raison (suite arithmétique) \n4 : Calculer le terme suivant (suite géométrique)  \n5 : Calculer le terme précédent (suite arithmétique) \n6 : Calculer la raison (suite géométrique) \n7 : Mélange  ',
    ]
    this.sup = '7'

    this.spacing = 1.5 // Interligne des questions
    this.spacingCorr = 2 // Interligne des réponses
  }

  nouvelleVersion() {
    const listeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 6,
      melange: 7,
      defaut: 7,
      nbQuestions: this.nbQuestions,
    })
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const u = randint(-10, 10, 0)
      const r = randint(-10, 10, 0)
      const num = randint(-10, 10, 0)
      const den = randint(-10, 10, 0)
      const q = fraction(num, den).simplifie()
      const n = randint(1, 20)
      let texte = ''
      let texteCorr = ''
      // Boucle principale où i+1 correspond au numéro de la question
      switch (listeDeQuestions[i]) {
        case 1: // suite arith terme suivant
          {
            const reponse1 = u + r
            texte = `On considère une suite arithmétique $(u_n)$ de raison $${texNombre(r)}$. On sait que $u_{${n}}=${u}$.<br>
              Calculer   $u_{${n + 1}}$.<br>`
            if (this.interactif) {
              texte += `$u_{${n + 1}}=$ `
              texte += `${ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBaseAvecFraction)}`
              handleAnswers(this, i, {
                reponse: {
                  value: reponse1,
                },
              })
            }
            texteCorr = `Si une suite est arithmétique de raison $r$, alors on peut calculer chaque terme en ajoutant $r$ au terme précédent. Ainsi, <br>`
          }
          texteCorr += ` $\\begin{aligned} u_{${n + 1}}&=u_{${n}}+r\\\\&=${u}+${ecritureParentheseSiMoins(r)}\\\\&=${miseEnEvidence(u + r)} \\end{aligned}$`

          break

        case 2: //
          {
            const reponse2 = u - r
            texte = `On considère une suite arithmétique $(u_n)$ de raison $${texNombre(r)}$. On sait que $u_{${n}}=${u}$.<br> Calculer   $u_{${n - 1}}$.<br>`
            if (this.interactif) {
              texte += `$u_{${n - 1}}=$ `
              texte += `${ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBaseAvecFraction)}`
              handleAnswers(this, i, {
                reponse: {
                  value: reponse2,
                },
              })
            }
            texteCorr = `Si une suite est arithmétique de raison $r$, alors on peut calculer chaque terme en ajoutant $r$ au terme précédent.<br>`
          }
          texteCorr += `Ainsi, $u_{${n}}=u_{${n - 1}}+r$. Donc, <br>`
          texteCorr += `$\\begin{aligned}u_{${n - 1}}&=u_{${n}}-r\\\\ &={${u}} -${ecritureParentheseSiMoins(r)}\\\\ &=${miseEnEvidence(u - r)} \\end{aligned}$`
          break
        case 3: //
          {
            const reponse3 = r
            texte = `On considère une suite arithmétique $(u_n)$. On sait que $u_{${n}}=${u}$ et $u_{${n + 1}}=${u + r}$.<br> Calculer la raison $r$ de la suite $(u_n)$.<br>`
            if (this.interactif) {
              texte += `$r=$ `
              texte += `${ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBaseAvecFraction)}`
              handleAnswers(this, i, {
                reponse: {
                  value: reponse3,
                },
              })
            }
            texteCorr = `Si une suite est arithmétique de raison $r$, alors on peut calculer chaque terme en ajoutant $r$ au terme précédent.<br>`
          }
          texteCorr += `Ainsi, $u_{${n + 1}}=u_{${n}}+r$. <br>`
          texteCorr += `Donc, $r=u_{${n + 1}}-u_{${n}}=${u + r}-${ecritureParentheseSiMoins(u)}={${miseEnEvidence(r)}}  $`
          break
        case 4: // suite géométrique : terme suivant
          {
            const reponse4 = q.produitFraction(u).simplifie()
            texte = `On considère une suite géométrique $(u_n)$ de raison $${q.texFraction}$. On sait que $u_{${n}}=${u}$.<br> Calculer   $u_{${n + 1}}$.<br>`
            if (this.interactif) {
              texte += `$u_{${n + 1}}=$ `
              texte += `${ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBaseAvecFraction)}`
              handleAnswers(this, i, {
                reponse: {
                  value: reponse4.simplifie().texFSD,
                  options: { fractionEgale: true },
                },
              })
            }
            texteCorr = `Si une suite est géométrique de raison $q$, alors on calcule chaque terme en multipliant le terme précédent par $q$. Ainsi, <br>`
            if (q.estEntiere && num * den < 0) {
              texteCorr += `$\\begin{aligned}u_{${n + 1}}&=u_{${n}}\\times q \\\\ &=${u}\\times (${q.texFraction}) \\\\&=${miseEnEvidence(reponse4.texFractionSimplifiee)} \\end{aligned}$`
            } else {
              texteCorr += `$\\begin{aligned}u_{${n + 1}}&=u_{${n}}\\times q \\\\ &=${u}\\times ${q.texFraction} \\\\&=${miseEnEvidence(reponse4.texFractionSimplifiee)} \\end{aligned}$`
            }
          }
          break

        case 5: // suite géométrique : terme précédent
          {
            const reponse5 = fraction(u).diviseFraction(q).simplifie()
            texte = `On considère une suite géométrique $(u_n)$ de raison $${q.texFraction}$. On sait que $u_{${n}}=${u}$.<br> Calculer   $u_{${n - 1}}$.<br>`
            if (this.interactif) {
              texte += `$u_{${n - 1}}=$ `
              texte += `${ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBaseAvecFraction)}`
              handleAnswers(this, i, {
                reponse: {
                  value: reponse5.simplifie().texFSD,
                  options: { fractionEgale: true },
                },
              })
            }
            texteCorr = `Si une suite est géométrique de raison $q$, alors on calcule chaque terme en multipliant le terme précédent par $q$.<br>`
            texteCorr += `Ainsi, $u_{${n}}=u_{${n - 1}}\\times q$. Donc, <br>`
            texteCorr += `$\\begin{aligned}u_{${n - 1}}&=u_{${n}}\\div{q}\\\\&=${u} \\div ${q.texFraction}\\\\&=${u} \\times ${fraction(den, num).simplifie().ecritureParentheseSiNegatif}\\\\&=${miseEnEvidence(reponse5.texFractionSimplifiee)} \\end{aligned}$`
          }
          break

        case 6: // suite géométrique : raison
          {
            const reponse6 = q.simplifie()
            texte = `On considère une suite géométrique $(u_n)$. On sait que $u_{${n}}=${u}$ et $u_{${n + 1}}=${q.produitFraction(u).simplifie().texFraction}$.<br> Calculer la raison $q$ de la suite $(u_n)$.<br>`
            if (this.interactif) {
              texte += `$q=$ `
              texte += `${ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBaseAvecFraction)}`
              handleAnswers(this, i, {
                reponse: {
                  value: reponse6.simplifie().texFSD,
                  options: {
                    fractionEgale: true,
                    nombreDecimalSeulement: true,
                  },
                },
              })
            }
            texteCorr = `Si une suite est géométrique de raison $q$, alors on calcule chaque terme en multipliant le terme précédent par $q$.<br>`
            texteCorr += `Ainsi, $u_{${n + 1}}=u_{${n}}\\times q$. Donc, <br>`
            texteCorr += `$\\begin{aligned}q &=u_{${n + 1}}\\div u_{${n}}\\\\&=${q.produitFraction(u).simplifie().texFraction} \\div ${ecritureParentheseSiMoins(u)}\\\\&=${q.produitFraction(u).simplifie().texFraction} \\times \\dfrac{1}{${u}}\\\\&=${miseEnEvidence(reponse6.texFractionSimplifiee)} \\end{aligned}$`
          }
          break
      }

      if (this.questionJamaisPosee(i, texte)) {
        this.listeQuestions[i] = texte

        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
