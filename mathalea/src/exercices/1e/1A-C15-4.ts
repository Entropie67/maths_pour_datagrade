import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import Decimal from 'decimal.js'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
// import ExerciceQcmA from '../../ExerciceQcmA'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'
import ExerciceQcmACourt from '../ExerciceQcmACourt'

export const dateDeModifImportante = '30/09/2026'

export const uuid = '94dbd'
export const refs = {
  'fr-fr': ['1A-C15-4'],
  'fr-ch': ['10LCQCMFA5-1', '10LSQCMFA5-1', '11CTQCMFA5-4', '11LCQCMFA5-4', '11LSQCMFA5-8'],
}
export const interactifReady = true

export const amcReady = 'true'
export const titre = 'Résoudre un problème de facture'
export const dateDePublication = '29/07/2025'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class Auto1C19 extends ExerciceQcmACourt {
  // S'occupe de passser les données originales à la fonction appliquerLesValeurs

  versionOriginale: () => void = () => {
    this.enonce = `Dans une région de France, le tarif de l'eau est le suivant : <br>
              Un abonnement annuel et $3,50$ € par mètre cube consommé. <br>
              Une famille a payé une facture de $352,50$ € pour une consommation de $85\\text{ m}^3$.<br>
            ${this.sup3 ? "Écrire le calcul permettant de déterminer le prix de l'abonnement." : "On note $a$ le prix de l'abonnement annuel, en euros.<br>Déterminer $a$ sous forme d'un calcul qu'on ne demande pas d'effectuer."}`

    this.correction = `La facture s'élève à $352,50$ € pour une consommation de $85\\text{ m}^3$.<br>
                   En notant $a$ le montant de l'abonnement, on obtient : <br>
                   $\\begin{aligned}
                   a+3,50\\times 85 &=352,50\\\\
                   a&=${miseEnEvidence('352,50-3,50\\times 85')}
                   \\end{aligned}$`

    this.reponses = [
      '$352,50-3,50\\times 85$',
      '$\\dfrac{352,50}{3,50\\times 85}$',
      '$\\dfrac{3,50\\times 85}{352,50}$',
      '$352,50+3,50\\times 85$',
    ]
  }

  versionAleatoire: () => void = () => {
    switch (choice([1, 2, 3])) {
      case 1:
        {
          const abo = new Decimal(randint(451, 691)).div(10) // abonnement
          const p = new Decimal(randint(301, 399)).div(100) // prix du m3
          const n = randint(70, 99)
          const fac = new Decimal(p).mul(n).add(abo)
          this.enonce = `Dans une région de France, le tarif de l'eau est le suivant : <br>
                    un abonnement annuel et $${texNombre(p, 2, true)}$ € par mètre cube consommé. <br>
                    Une famille a payé une facture de $${texNombre(fac, 2, true)}$ € pour une consommation de $${n}\\text{ m}^3$.<br>
                  ${this.sup3 ? "Écrire le calcul permettant de déterminer le prix de l'abonnement." : "On note $a$ le prix de l'abonnement annuel, en euros.<br>Déterminer $a$ sous forme d'un calcul qu'on ne demande pas d'effectuer."}`

          this.correction = `La facture s'élève à $${texNombre(fac, 3)}$ € pour une consommation de $${n}\\text{ m}^3$.<br>
                         En notant $a$ le montant de l'abonnement, on obtient : <br>
                         $\\begin{aligned}
                         a+${texNombre(p, 2, true)}\\times ${n} &=${texNombre(fac, 3)}\\\\
                         a&=${miseEnEvidence(`${texNombre(fac, 3)}-${texNombre(p, 2, true)}\\times ${n}`)}
                         \\end{aligned}$`

          this.reponses = [
            `$${texNombre(fac, 3)}-${texNombre(p, 2, true)}\\times ${n}$`,
            `$\\dfrac{${texNombre(fac, 3)}}{${texNombre(p, 2, true)}\\times ${n}}$`,
            `$\\dfrac{${texNombre(p, 2, true)}\\times ${n}}{${texNombre(fac, 3)}}$`,
            `$${texNombre(fac, 3)}+${texNombre(p, 2, true)}\\times ${n}$`,
          ]
        }
        break

      case 2:
        {
          const abo = new Decimal(randint(451, 691)).div(10) // abonnement
          const p = new Decimal(randint(301, 399)).div(100) // prix du m3
          const n = randint(70, 99)
          const fac = new Decimal(p).mul(n).add(abo)
          this.enonce = `Dans une région de France, le tarif de l'eau est le suivant : <br>
                    un abonnement annuel de $${texNombre(abo, 2, true)}$ € et un prix par mètre cube consommé. <br>
                    Une famille a payé une facture de $${texNombre(fac, 2, true)}$ € pour une consommation de $${n}\\text{ m}^3$.<br>
                  ${this.sup3 ? 'Écrire le calcul permettant de déterminer le prix du mètre cube consommé.' : "On note $a$ le prix du mètre cube consommé, en euros.<br>Déterminer $a$ sous forme d'un calcul qu'on ne demande pas d'effectuer."}`

          this.correction = `La facture s'élève à $${texNombre(fac, 3)}$ € pour une consommation de $${n}\\text{ m}^3$.<br>
                         En notant $a$ le prix du mètre cube, on obtient : <br>
                         $\\begin{aligned}
                         ${texNombre(abo, 2)}+a\\times ${n} &=${texNombre(fac, 3)}\\\\
                         a&=${miseEnEvidence(`\\dfrac{${texNombre(fac, 3)}-${texNombre(abo, 2, true)}}{${n}}`)}
                         \\end{aligned}$
                         `

          this.reponses = [
            `$\\dfrac{${texNombre(fac, 3)}-${texNombre(abo, 2, true)}}{${n}}$`,
            `$\\dfrac{${texNombre(fac, 3)}-${n}}{${texNombre(abo, 2, true)}}$`,
            `$${texNombre(fac, 3)}-${texNombre(abo, 2, true)}\\times ${n}$`,
            `$\\dfrac{${texNombre(p, 2, true)}\\times ${n}}{${texNombre(fac, 3)}}$`,
          ]
        }
        break
      case 3:
      default:
        {
          const abo = new Decimal(randint(451, 691)).div(10) // abonnement
          const p = new Decimal(randint(301, 399)).div(100) // prix du m3
          const n = randint(70, 99)
          const fac = new Decimal(p).mul(n).add(abo)
          this.enonce = `Dans une région de France, le tarif de l'eau est le suivant : <br>
                  un abonnement annuel de $${texNombre(abo, 2, true)}$ € et $${texNombre(p, 2, true)}$ € par mètre cube consommé. <br>
                    Une famille a payé une facture de $${texNombre(fac, 2, true)}$ € pour sa consommation annuelle.<br>
                  ${this.sup3 ? 'Écrire le calcul permettant de déterminer le nombre de mètres cubes consommés.' : "On note $a$ le nombre de mètres cubes consommés.<br>Déterminer $a$ sous forme d'un calcul qu'on ne demande pas d'effectuer."}`

          this.correction = `La facture s'élève à $${texNombre(fac, 3)}$ € pour la consommation annuelle.<br>
                         En notant $a$ le nombre de mètres cubes consommés, on obtient : <br>
                         $\\begin{aligned}
                         ${texNombre(abo, 2)}+${texNombre(p, 2, true)}\\times a &=${texNombre(fac, 3)}\\\\
                         a&=${miseEnEvidence(`\\dfrac{${texNombre(fac, 3)}-${texNombre(abo, 2, true)}}{${texNombre(p, 2, true)}}`)}
                         \\end{aligned}$
                         `

          this.reponses = [
            `$\\dfrac{${texNombre(fac, 3)}-${texNombre(abo, 2, true)}}{${texNombre(p, 2, true)}}$`,
            `$\\dfrac{${texNombre(fac, 3)}-${texNombre(p, 2, true)}}{${texNombre(abo, 2, true)}}$`,
            `$${texNombre(fac, 3)}-${texNombre(abo, 2, true)}\\times ${texNombre(p, 2, true)}$`,
            `$${texNombre(abo, 2, true)}\\times${texNombre(p, 3)}-${texNombre(fac, 2, true)}$`,
          ]
        }
        break
    }
  }

  // Ici il n'y a rien à faire, on appelle juste la version aleatoire (pour un qcm aleatoirisé, c'est le fonctionnement par défaut)
  constructor() {
    super()
    this.clavierReponseCourte = KeyboardType.clavierDeBaseAvecFraction

    this.versionAleatoire()
    this.texteAvantReponseCourte = '$a =$'
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, { expressionNumerique: true })
    this.spacing = 1.5
  }
}
