import { bleuMathalea } from '../../../lib/colors'
import { shuffle } from '../../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer un volume de pyramide'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Jean-claude Lhote
  * Créé pendant l'été 2021

*/
export const uuid = 'f0128'

export const refs = {
  'fr-fr': ['can3M-02'],
  'fr-ch': ['11LCGM1B-3', '11LSGM1B-3'],
}
export default class CalculVolumePyramide extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1

    this.optionsChampTexte = { texteApres: `$\\text{cm}^3$` }
  }

  nouvelleVersion() {
    const triplet = shuffle([3, randint(2, 8) * 2, randint(1, 2) * 5])
    const a = triplet[0]
    const b = triplet[1]
    const h = triplet[2]
    this.reponse = (a * b * h) / 3
    this.question = `Une pyramide a une hauteur de $${h}\\text{ cm}$ et pour base un rectangle de dimensions $${a}\\text{ cm}$ et $${b}\\text{ cm}$.<br>
    
    Calculer son volume en $\\text{cm}^3$`
    this.question += this.interactif ? ' : ' : '.'
    this.correction = `Le volume de cette pyramide est : $\\dfrac{1}{3} \\times ${a} \\times ${b} \\times ${h}=${miseEnEvidence(this.reponse)}\\text{ cm}^3$`
    if (h === 3) {
      this.correction += texteEnCouleur(
        `<br> Mentalement : <br>
    Le volume d'une pyramide est $\\dfrac{1}{3}\\times \\text{Aire(Base)}\\times \\text{Hauteur}$.<br>
    Puisque la base est un rectangle et que l'aire d'un rectangle est donnée par le produit de la longueur par la largeur, le volume est donc
    le produit des trois valeurs données par $\\dfrac{1}{3}$.<br>
    Comme l'une des trois longueur est $3$ et que $\\dfrac{1}{3}\\times 3=1$, on obtient le volume en multipliant les deux autres longueurs : $${a} \\times ${b}=${a * b}$.
      `,
        bleuMathalea,
      )
    }
    if (a === 3) {
      this.correction += texteEnCouleur(
        `<br> Mentalement : <br>
    Le volume d'une pyramide est $\\dfrac{1}{3}\\times \\text{Aire(Base)}\\times \\text{Hauteur}$.<br>
    Puisque la base est un rectangle et que l'aire d'un rectangle est donnée par le produit de la longueur par la largeur, le volume est donc
    le produit des trois valeurs données par $\\dfrac{1}{3}$.<br>
    Comme l'une des trois longueur est $3$ et que $\\dfrac{1}{3}\\times 3=1$, on obtient le volume en multipliant les deux autres longueurs : $${b} \\times ${h}=${h * b}$.
      `,
        bleuMathalea,
      )
    }
    if (b === 3) {
      this.correction += texteEnCouleur(
        `<br> Mentalement : <br>
    Le volume d'une pyramide est $\\dfrac{1}{3}\\times \\text{Aire(Base)}\\times \\text{Hauteur}$.<br>
    Puisque la base est un rectangle et que l'aire d'un rectangle est donnée par le produit de la longueur par la largeur, le volume est donc
    le produit des trois valeurs données par $\\dfrac{1}{3}$.<br>
    Comme l'une des trois longueur est $3$ et que $\\dfrac{1}{3}\\times 3=1$, on obtient le volume en multipliant les deux autres longueurs : $${a} \\times ${h}=${h * a}$.
      `,
        bleuMathalea,
      )
    }

    this.canReponseACompleter = '$\\ldots\\text{ cm}^3$'
  }
}
