// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 8cf80 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import Decimal from 'decimal.js'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
// import ExerciceQcmA from '../../ExerciceQcmA'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = '8cf80'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Résoudre un problème de facture'
export const dateDePublication = '29/07/2025'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class Auto1C19Old extends ExerciceQcmA {
  // S'occupe de passser les données originales à la fonction appliquerLesValeurs

  versionOriginale: () => void = () => {
    this.enonce = `Dans une région de France, le tarif de l'eau est le suivant : <br>
              Un abonnement annuel et $3,50$ € par mètre cube consommé. <br>
              Une famille a payé une facture de $352,50$ € pour une consommation de $85\\text{ m}^3$.<br>
            Le prix de l'abonnement est donné par le calcul :`

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
                  Le prix de l'abonnement est donné par le calcul :`

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
                  Le prix du mètre cube consommé est donné par le calcul :`

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
                  Le nombre de mètres cubes consommés est donné par le calcul :`

          this.correction = `La facture s'élève à $${texNombre(fac, 3)}$ € pour la consommation annuelle.<br>
                         En notant $a$ le nombre de  mètres cubes consommés, on obtient : <br>
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

    this.versionAleatoire()
    this.spacing = 1.5
  }
}
