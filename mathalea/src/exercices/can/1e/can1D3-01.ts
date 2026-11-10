import { miseEnEvidence } from '../../../lib/outils/embellissements'
import Decimal from 'decimal.js'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre =
  'Déterminer la fonction dérivée d’une fonction $k/x$ ou $k\\sqrt{x}$'
export const interactifReady = true

// Les exports suivants sont optionnels mais au moins la date de publication semble essentielle
export const dateDePublication = '21/06/2022' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
// export const dateDeModifImportante = '14/02/2022' // Une date de modification importante au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

/**
     * Modèle d'exercice très simple pour la course aux nombres
     * @author Gilles Mora

    */
export const uuid = 'e794b'

export const refs = {
  'fr-fr': ['can1D3-01'],
  'fr-ch': [],
}
export default class CalculFonctionDeriveeFctRef extends ExerciceSimple {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierFullOperations
    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    let a
    let b
    switch (
      this.quotaChoice('type', [1, 2]) //
    ) {
      case 1: // a/x
        a = randint(2, 15) * choice([-1, 1])

        this.question = `Soit $f$ la fonction définie sur $\\mathbb{R}^*$ par : <br>

            $f(x)=\\dfrac{${a}}{x}$. <br>

           Déterminer $f'(x)$.<br>     `
        if (this.interactif) {
          this.question += "$f'(x)=$"
        }
        this.correction = `$f(x)=\\dfrac{${a}}{x}=${a}\\times \\dfrac{1}{x}$.<br>
          Or  $x\\longmapsto \\dfrac{1}{x}$ a pour dérivée $x\\longmapsto -\\dfrac{1}{x^2}$.<br>
          Par conséquent, $f'(x)=${a}\\times \\left(-\\dfrac{1}{x^2}\\right)=${miseEnEvidence(`\\dfrac{${-a}}{x^2}`)}$.`

        this.reponse = [
          `\\dfrac{${-a}}{x^2}`,
          `-\\dfrac{${a}}{x^2}`,
          `${a}\\dfrac{-1}{x^2}`,
        ]

        break
      case 2: // asqrt(x)
        a = randint(2, 15) * choice([-1, 1])
        b = new Decimal(a).div(2)
        this.question = `Soit $f$ la fonction définie sur $[0;+\\infty[$ par : <br>

            $f(x)=${a}\\sqrt{x}$. <br>

            Déterminer $f'(x)$ pour $x\\in ]0;+\\infty[$ .<br>     `
        if (this.interactif) {
          this.question += "$f'(x)=$"
        }
        this.correction = `$f(x)=${a}\\sqrt{x}=${a}\\times\\sqrt{x}$.<br>
          Or  $x\\longmapsto \\sqrt{x}$ a pour dérivée $x\\longmapsto \\dfrac{1}{2\\sqrt{x}}$.<br>
          Par conséquent, $f'(x)=${a}\\times \\dfrac{1}{2\\sqrt{x}}=\\dfrac{${a}}{2\\sqrt{x}}=${miseEnEvidence(`\\dfrac{${texNombre(b, 1)}}{\\sqrt{x}}`)}$.`

        this.reponse = [
          `\\dfrac{${a}}{2\\sqrt{x}}`,
          `\\dfrac{${b}}{\\sqrt{x}}`,
          `${a}\\dfrac{1}{2\\sqrt{x}}`,
        ]

        break
    }
  }
}
