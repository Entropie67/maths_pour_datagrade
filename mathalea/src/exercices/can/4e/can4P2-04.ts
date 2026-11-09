import { bleuMathalea } from '../../../lib/colors'
import { choice } from '../../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleur,
  texteEnCouleurEtGras,
} from '../../../lib/outils/embellissements'
import { arrondi } from '../../../lib/outils/nombres'
import { texNombre, texPrix } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer avec un pourcentage de proportion'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 * Ajout du paramètre Déterminer/calculer/mélange par Guillaume Valmont le 17/02/2023 (supprimer le 06/07/2025 car exercice cassé en deux avec can6P2-04)

 * Date de publication
*/
export const dateDeModifImportante = '06/07/2025'
export const uuid = 'bd5d1'

export const refs = {
  'fr-fr': ['can4P2-04'],
  'fr-ch': ['NR'],
}
export default class PoucentageP2 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.spacing = 1
    this.spacingCorr = 1.5
    this.versionQcmDisponible = true
  }

  nouvelleVersion() {
    const listeCarac2 = [
      ['maisons', '$\\text{T}2$'],
      ['maisons', '$\\text{T}3$'],
      ['appartements', '$\\text{T}2$'],
      ['appartements', '$\\text{T}3$'],
    ]
    let a, b, c, n, d, carac2, choix

    switch (this.quotaRandint('cas', 1, 2)) {
      case 1:
        a = randint(1, 5) * 1000
        b = randint(1, 8) * 10
        c = randint(1, 8) * 10
        carac2 = choice(listeCarac2)
        n = carac2[0]
        d = carac2[1]
        if (n === 'maisons') {
          this.question = `
        Parmi les $${texNombre(a, 0)}$ logements que compte une ville, $${b}\\,\\%$ sont des ${n} et $${c}\\,\\%$ de celles-ci sont des ${d}.<br> `
          if (!this.versionQcm) {
            this.question += `Quel est le nombre de ${n} de type ${d} dans cette ville ?`
          } else {
            this.question += ` Le nombre de ${n} de type ${d} dans cette ville est :`
          }
        } else {
          this.question = `Parmi les $${texNombre(a, 0)}$ logements que compte une ville, $${b}\\,\\%$ sont des ${n} et $${c}\\,\\%$ de ceux-ci sont des ${d}.<br>`
          if (!this.versionQcm) {
            this.question += ` Quel est le nombre d' ${n} de type ${d} dans cette ville ?`
          } else {
            this.question += ` Le nombre d' ${n} de type ${d} dans cette ville est :`
          }
        }
        this.distracteurs = [
          `$${texNombre((c * b * a) / 1000, 2)}$`,
          `$${texNombre((a * c * b) / 100000, 2)}$`,
          `$${texNombre(a - b - c, 2)}$`,
        ]
        this.optionsChampTexte = { texteAvant: '<br>' }
        this.correction = `Les ${n} représentent $${b}\\,\\%$ des logements.<br>
        Il y en a donc : $${texNombre(b / 100)}\\times ${texNombre(a)}=${texNombre((b * a) / 100)}$.<br>
        Dans cette ville, il y a $${texNombre((b * a) / 100, 2)}$ ${n}.<br>
        Parmi ces ${n}, il y a $${c}\\,\\%$ de ${d}.<br>
        $${c}\\,\\%$ de $${texNombre((b * a) / 100)}=${texNombre(c / 100, 2)}\\times ${texNombre((b * a) / 100, 2)}=${texNombre((c * b * a) / 10000, 2)}$.<br>
        Il y a donc $${miseEnEvidence(texNombre((c * b * a) / 10000, 2))}$ ${n} de type ${d} dans cette ville.<br>`
        this.correction += texteEnCouleur(
          `Mentalement : <br>
                Prendre $10\\,\\%$ d'une quantité revient à la diviser par $10$. <br>
       Pour calculer $20\\,\\%$, $30\\,\\, \\%$, $40\\,\\%$, $\\ldots$ d'une quantité, on
       commence par calculer $10\\,\\%$ de cette quantité en la divisant par $10$, puis on multiplie
       par $2$ ce résultat si on veut en calculer $20\\, \\%$, par $3$ si on veut en calculer $30\\,\\%$, $\\ldots$<br>`,
          bleuMathalea,
        )
        this.reponse = this.versionQcm
          ? `$${texNombre((c * b * a) / 10000, 2)}$`
          : arrondi((c * b * a) / 10000)

        break

      case 2:
      default:
        a = choice([20, 25, 10, 50])
        b = randint(10, 30)
        choix = choice([true, false])
        this.question = ` Une ${choix ? ' réduction' : 'augmentation'} de $${a}~\\%$ d'un article entraîne une ${choix ? 'réduction' : 'augmentation'} du prix de $${b}$ €.<br>`
        if (!this.versionQcm) {
          this.question += `Quel était le prix de cet article avant ${choix ? ' la réduction' : 'l’augmentation'} ? `
        } else {
          this.question += ` Le prix de cet article avant ${choix ? ' la réduction' : 'l’augmentation'} est : `
        }

        this.optionsChampTexte = { texteAvant: '<br>', texteApres: '€' }
        if (a === 25) {
          this.correction = ` $25\\,\\%$ du prix représente $${b}$ €, donc $100~\\%$ du prix représente $4$ fois plus que $${b}$ € (car $4\\times 25=100$).<br>
        Le prix de l'article était donc : $4\\times${b}=${miseEnEvidence(4 * b)}$`
        }
        if (a === 20) {
          this.correction = ` $20\\,\\%$ du prix représente $${b}$ €, donc $100~\\%$ du prix représente $5$ fois plus que $${b}$ € (car $5\\times 20=100$).<br>
          Le prix de l'article était donc : $5\\times${b}=${miseEnEvidence(5 * b)}$`
        }
        if (a === 10) {
          this.correction = ` $10\\,\\%$ du prix représente $${b}$ €, donc $100~\\%$ du prix représente $10$ fois plus que $${b}$ € (car $10\\times 10=100$).<br>
          Le prix de l'article était donc : $10\\times${b}=${miseEnEvidence(10 * b)}$`
        }
        if (a === 50) {
          this.correction = ` $50\\,\\%$ du prix représente $${b}$ €, donc $100~\\%$ du prix représente $2$ fois plus que $${b}$ € (car $2\\times 50=100$).<br>
           Le prix de l'article était donc : $2\\times${b}=${miseEnEvidence(2 * b)}$`
        }
        this.correction += ' ' + texteEnCouleurEtGras('€') + '.'
        this.distracteurs = [
          `$${texPrix(b + (b * a) / 100)}$ €`,
          `$${texPrix(b - (b * a) / 100)}$ €`,
          `$${texPrix(a + b)}$ €`,
        ]
        this.reponse = this.versionQcm
          ? `$${texPrix((100 * b) / a)}$ €`
          : arrondi((100 * b) / a)

        this.canReponseACompleter = '$\\ldots$ €'
        break
    }
  }
}
