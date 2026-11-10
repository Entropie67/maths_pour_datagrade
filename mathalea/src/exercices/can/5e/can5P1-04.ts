import { choice } from '../../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../../lib/outils/embellissements'
import { arrondi } from '../../../lib/outils/nombres'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer avec une proportion'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

 * Date de publication
*/
export const uuid = 'eb6bc'

export const refs = {
  'fr-fr': ['can5P1-04', '5P1A-flash1', '2I11-flash4'],
  'fr-ch': ['9R1FA1D-7', '9R2FA1D-7', '9R3FA1D-7'],
}
export default class PoucentageP1 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.optionsChampTexte = { texteAvant: '<br>' }
  }

  nouvelleVersion() {
    let b
    const caractere = choice([
      'des lunettes',
      'un frère',
      'un chien',
      'un abonnement à une revue',
      'une licence à l’UNSS',
      'un sac à roulettes',
    ])

    switch (
      this.quotaChoice('typeDeQuestions', ['a', 'b', 'c', 'd', 'e', 'f'])
    ) {
      case 'a':
        b = randint(3, 7) * 5
        this.question = `$\\dfrac{1}{5}$ des élèves d'une classe de $${b}$ élèves a ${caractere}.<br>
        
              Quel est le nombre d'élèves n'en ayant pas ?`
        this.correction = `On calcule d'abord $\\dfrac{1}{5}$ de $${b}$.<br>
        $\\dfrac{1}{5}\\times ${b}=\\dfrac{${b}}{5}=${texNombre(b / 5)}$.<br>
        $${texNombre(b / 5)}$ élèves ont ${caractere} .<br>
          Le nombre d'élèves n'en ayant pas est donc donné par : $${b}-${texNombre(b / 5)}=${miseEnEvidence(texNombre(b - b / 5))}$.`
        this.correction += texteEnCouleur(`<br> Mentalement : <br>
          Pour calculer $\\dfrac{1}{5}$ d'une quantité, on la divise par $5$. <br>
          Ainsi, $\\dfrac{1}{5}\\times ${b}=${b}\\div 5=${b / 5}$.`)
        this.reponse = arrondi((4 * b) / 5)
        break
      case 'b':
        b = randint(3, 6) * 6
        this.question = `$\\dfrac{1}{6}$ des élèves d'une classe de $${b}$ élèves a ${caractere}.<br>

            Quel est le nombre d'élèves n'en ayant pas ?`
        this.correction = `On calcule d'abord $\\dfrac{1}{6}$ de $${b}$.<br>
        $\\dfrac{1}{6}\\times ${b}=\\dfrac{${b}}{6}=${texNombre(b / 6)}$.<br>
        $${texNombre(b / 6)}$ élèves ont ${caractere} .<br>
          Le nombre d'élèves n'en ayant pas est donc donné par : $${b}-${texNombre(b / 6)}=${miseEnEvidence(texNombre(b - b / 6))}$.`
        this.correction += texteEnCouleur(`<br> Mentalement : <br>
          Pour calculer $\\dfrac{1}{6}$ d'une quantité, on la divise par $6$. <br>
          Ainsi, $\\dfrac{1}{6}\\times ${b}=${b}\\div 6=${b / 6}$.`)
        this.reponse = arrondi((5 * b) / 6)
        break
      case 'c':
        b = randint(2, 5) * 7
        this.question = `$\\dfrac{1}{7}$ d'une classe de $${b}$ élèves a ${caractere}.<br>

        Quel est le nombre d'élèves n'en ayant pas ?`
        this.correction = `On calcule d'abord $\\dfrac{1}{7}$ de $${b}$.<br>
        $\\dfrac{1}{7}\\times ${b}=\\dfrac{${b}}{7}=${texNombre(b / 7)}$.<br>
        $${texNombre(b / 7)}$ élèves ont ${caractere} .<br>
          Le nombre d'élèves n'en ayant pas est donc donné par : $${b}-${texNombre(b / 7)}=${miseEnEvidence(texNombre(b - b / 7))}$.`
        this.correction += texteEnCouleur(`<br> Mentalement : <br>
          Pour calculer $\\dfrac{1}{7}$ d'une quantité, on la divise par $7$. <br>
          Ainsi, $\\dfrac{1}{7}\\times ${b}=${b}\\div 7=${b / 7}$.`)
        this.reponse = arrondi((6 * b) / 7)
        break
      case 'd':
        b = randint(3, 9) * 4
        this.question = `$\\dfrac{1}{4}$ d'une classe de $${b}$ élèves a ${caractere}.<br>

            Quel est le nombre d'élèves n'en ayant pas ?`
        this.correction = `On calcule d'abord $\\dfrac{1}{4}$ de $${b}$.<br>
            $\\dfrac{1}{4}\\times ${b}=\\dfrac{${b}}{4}=${texNombre(b / 4)}$.<br>
            $${texNombre(b / 4)}$ élèves ont ${caractere} .<br>
              Le nombre d'élèves n'en ayant pas est donc donné par : $${b}-${texNombre(b / 4)}=${miseEnEvidence(texNombre(b - b / 4))}$.`
        this.correction += texteEnCouleur(`<br> Mentalement : <br>
              Pour calculer $\\dfrac{1}{4}$ d'une quantité, on la divise par $4$. <br>
              Ainsi, $\\dfrac{1}{4}\\times ${b}=${b}\\div 4=${b / 4}$.`)
        this.reponse = arrondi((3 * b) / 4)
        break
      case 'e':
        b = randint(3, 7) * 5
        this.question = `$20\\,\\%$ des élèves d'une classe de $${b}$ élèves ont ${caractere}.<br>
              Quel est le nombre d'élèves n'en ayant pas ?`
        this.correction = `On calcule d'abord $20\\,\\%$ de $${b}$.<br>
             Prendre $20\\,\\%$ d'une quantité revient à en prendre le cinquième, c'est-à-dire à la diviser par $5$.<br>
              $20\\,\\%$ de $${b}$ est égal à $\\dfrac{${b}}{5}=${texNombre(b / 5)}$.<br>
                            $${texNombre(b / 5)}$ élèves ont ${caractere} .<br>
                Le nombre d'élèves n'en ayant pas est donc donné par : $${b}-${texNombre(b / 5)}=${miseEnEvidence(texNombre(b - b / 5))}$.`
        this.reponse = arrondi((8 * b) / 10)
        break
      case 'f':
        b = randint(3, 9) * 4
        this.question = `$25\\,\\%$ des élèves d'une classe de $${b}$ élèves ont ${caractere}.<br>

                  Quel est le nombre d'élèves n'en ayant pas ?`
        this.correction = `On calcule d'abord $25\\,\\%$ de $${b}$.<br>
                  Prendre $25\\,\\%$ d'une quantité revient à en prendre le quart, c'est-à-dire à la diviser par $4$.<br>
                   $25\\,\\%$ de $${b}$ est égal à $\\dfrac{${b}}{4}=${texNombre(b / 4)}$.<br>
                                 $${texNombre(b / 4)}$ élèves ont ${caractere} .<br>
                     Le nombre d'élèves n'en ayant pas est donc donné par : $${b}-${texNombre(b / 4)}=${miseEnEvidence(texNombre(b - b / 4))}$.`
        this.reponse = arrondi(b - 0.25 * b)
        break
    }
  }
}
