import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

import { choice } from '../../../lib/outils/arrayOutils'
import { ecritureAlgebrique } from '../../../lib/outils/ecritures'
import { abs } from '../../../lib/outils/nombres'
import { texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
export const titre =
  'Déterminer une image par une fonction affine (non définie explicitement)'
export const interactifReady = true

export const dateDePublication = '30/04/2024'
export const dateDeModifImportante = '06/08/2025'
export const uuid = 'b9c80'
export const refs = {
  'fr-fr': ['can2F20-02'],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class ImageFctAff extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.versionQcmDisponible = true
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.spacingCorr = 1.5
  }

  nouvelleVersion() {
    const nom = ['f', 'g', 'h']
    const nomF = choice(nom)
    const x1 = this.quotaRandint('x1', 1, 10)
    const x2 = x1 + 1
    const imx1 = this.quotaRandint('imx1', 1, 5)
    const imx2 = randint(imx1 + 2, 10)
    const n = this.quotaChoice('n', [-3, -2, -1, 1, 2, 3]) //
    const val = n > 0 ? x2 + n : x1 + n
    const coeff = imx2 - imx1
    const imx2n = imx2 + coeff * n
    const imx1n = imx1 + coeff * n
    this.question = `$${nomF}$ est une fonction affine vérifiant ${context.isDiaporama ? '<br>' : ''} $${nomF}(${x1})=${imx1}$ et $${nomF}(${x2})=${imx2}$.<br>`
    if (this.interactif && !this.versionQcm) {
      this.question += `$${nomF}(${val})=$`
    } else {
      if (this.versionQcm) {
        this.question += ` L'image de $${val}$ par $${nomF}$ est égale à :`
      } else {
        this.question += `Quelle est la valeur de $${nomF}(${val})$ ?`
      }
    }

    this.correction = `Puisque $f$ est une fonction affine, les accroissements des images ($f(x)$) sont proportionnels aux accroissements des antécédents ($x$). <br>
Les images données permettent d'établir graphiquement qu'une augmentation d'une unité en abscisse augmente l'ordonnée de $${imx2} - ${imx1}=${imx2 - imx1}$ ${imx2 - imx1 === 1 ? 'unité.' : 'unités.'} <br>`
    if (n > 0) {
      this.correction += `On calcule l'image de $${val}$ à partir de l'image de $${x2}$ par $${nomF}$.<br>
      Pour passer de $${x2}$ à $${val}$, on ajoute $${n}$ ${n === 1 ? 'unité' : 'unités'},
       donc on ajoute $${n}\\times ${imx2 - imx1}$ ${n * (imx2 - imx1) === 1 ? 'unité' : 'unités'} à l'image de $${x2}$, soit $${n * (imx2 - imx1)}$ ${n * (imx2 - imx1) === 1 ? 'unité' : 'unités'}.<br>
         Ainsi, l'image de $${val}$ par $${nomF}$ est $${nomF}(${val})=${imx2}+${coeff * n}=${miseEnEvidence(texNombre(imx2n))}$.`
      this.reponse = this.versionQcm ? `$${texNombre(imx2n)}$` : imx2n
      this.distracteurs = [
        `$${imx2 + 1}$`,
        `$${val + imx2}$`,
        `$${imx1 + imx2}$`,
        `$${val * imx2}$`,
      ]
    } else {
      this.correction += `On calcule l'image de $${val}$ à partir de l'image de $${x1}$ par $${nomF}$.<br>
      Pour passer de $${x1}$ à $${val}$, on retranche $${abs(n)}$ ${n === -1 ? 'unité' : 'unités'},
       donc on retranche $${abs(n)}\\times ${imx2 - imx1}$ ${coeff * n === -1 ? 'unité' : 'unités'} à l'image de $${x1}$${n === -1 ? '.' : `, soit $${n * (imx1 - imx2)}$ ${coeff * n === -1 ? 'unité' : 'unités'}.`}<br> 
      
      Ainsi, l'image de $${val}$ par $${nomF}$ est $${nomF}(${val})=${imx1}${ecritureAlgebrique(coeff * n)}=${miseEnEvidence(texNombre(imx1n))}$.`
      this.reponse = this.versionQcm ? `$${texNombre(imx1n)}$` : imx1n
      this.distracteurs = [
        `$${imx1 - 1}$`,
        `$${imx1 - val}$`,
        `$${imx1 - imx2}$`,
        `$${-1 * val * imx1}$`,
      ]
    }

    this.canEnonce = `$${nomF}$ est une fonction affine vérifiant $${nomF}(${x1})=${imx1}$ et $${nomF}(${x2})=${imx2}$.`
    this.canReponseACompleter = `$${nomF}(${val})=\\ldots$`
  }
}
