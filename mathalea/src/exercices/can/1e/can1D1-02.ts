import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { ecritureParentheseSiNegatif } from '../../../lib/outils/ecritures'
import FractionEtendue from '../../../modules/FractionEtendue'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre =
  'Déterminer le coefficient directeur d’une tangente (fonctions de référence)'
export const interactifReady = true

// Les exports suivants sont optionnels mais au moins la date de publication semble essentielle
export const dateDePublication = '21/06/2022' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
// export const dateDeModifImportante = '14/02/2022' // Une date de modification importante au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

/**
     * Modèle d'exercice très simple pour la course aux nombres
     * @author Gilles Mora

    */
export const uuid = '3c690'

export const refs = {
  'fr-fr': ['can1D1-02'],
  'fr-ch': [],
}
export default class CalculCoeffDir extends ExerciceSimple {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierFullOperations
    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    let a
    let f
    switch (
      this.quotaChoice('type', [1, 1, 2, 2, 3, 3, 4]) //
    ) {
      case 1: // x^2
        a = randint(2, 15) * choice([-1, 1])

        this.question = `Déterminer le coefficient directeur de la tangente à la courbe représentative de la fonction carré au point d'abscisse $${a}$. `

        this.correction = `Le coefficient directeur de la tangente au point d'abscisse $a$ est donné par le nombre dérivé $f'(a)$.<br>
        La fonction $f$ définie par $f(x)=x^2$ a pour fonction dérivée la fonction $f'$ définie par $f'(x)=2x$.<br>
        Comme $f'(${a})=2\\times ${ecritureParentheseSiNegatif(a)}=${2 * a}$, le coefficient directeur de la tangente au point d'abscisse $${a}$ est : $${miseEnEvidence(2 * a)}$. `

        this.reponse = 2 * a

        break
      case 2: // sqrt(x)
        a = randint(1, 25)

        this.question = `Déterminer le coefficient directeur de la tangente à la courbe représentative de la fonction racine carrée au point d'abscisse $${a}$.
         `

        this.correction = `Le coefficient directeur de la tangente au point d'abscisse $a$ est donné par le nombre dérivé $f'(a)$.<br>
        La fonction $f$ définie par $f(x)=\\sqrt{x}$ a pour fonction dérivée la fonction $f'$ définie par $f'(x)=${miseEnEvidence(`\\dfrac{1}{2\\sqrt{x}}`)}$.<br>

`
        if (a === 1 || a === 4 || a === 9 || a === 16 || a === 25) {
          f = new FractionEtendue(1, 2 * Math.sqrt(a))
          this.correction += `Comme $f'(${a})=\\dfrac{1}{2\\sqrt{${a}}}=\\dfrac{1}{${2 * Math.sqrt(a)}}$, le coefficient directeur de la tangente au point d'abscisse $${a}$ est : $${miseEnEvidence(`\\dfrac{1}{${2 * Math.sqrt(a)}}`)}$.`
          this.reponse = [`\\dfrac{1}{2\\sqrt{${a}}}`, f.texFraction]
        } else {
          this.correction += `Comme $f'(${a})=\\dfrac{1}{2\\sqrt{${a}}}$, le coefficient directeur de la tangente au point d'abscisse $${a}$ est : $${miseEnEvidence(`\\dfrac{1}{2\\sqrt{${a}}}`)}$.`
          this.reponse = [
            `\\dfrac{1}{2\\sqrt{${a}}}`,
            `\\dfrac{0,5}{\\sqrt{${a}}}`,
          ]
        }
        break
      case 3: // 1/x
        a = randint(1, 10) * choice([-1, 1])
        f = new FractionEtendue(-1, a * a)
        this.question = `Déterminer le coefficient directeur de la tangente à la courbe représentative de la fonction inverse au point d'abscisse $${a}$.
                 `

        this.correction = `Le coefficient directeur de la tangente au point d'abscisse $a$ est donné par le nombre dérivé $f'(a)$.<br>
        La fonction $f$ définie par $f(x)=\\dfrac{1}{x}$ a pour fonction dérivée la fonction $f'$ définie par $f'(x)=-\\dfrac{1}{x^2}$.<br>
Comme $f'(${a})=-\\dfrac{1}{${ecritureParentheseSiNegatif(a)}^2}=-\\dfrac{1}{${a * a}}$, le coefficient directeur de la tangente au point d'abscisse $${a}$ est : $${miseEnEvidence(`-\\dfrac{1}{${a * a}}`)}$`

        if (a === 1 || a === -1) {
          this.correction += '$=-1$.'

          this.reponse = [
            `\\dfrac{-1}{${a * a}}`,
            `-\\dfrac{1}{${a * a}}`,
            f.texFraction,
            String(-1),
          ]
        } else {
          this.correction += '.'
          this.reponse = [
            `\\dfrac{-1}{${a * a}}`,
            `-\\dfrac{1}{${a * a}}`,
            f.texFraction,
            String(-1),
          ]
        }

        break

      case 4: // x^3
        a = randint(1, 5) * choice([-1, 1])

        this.question = `Déterminer le coefficient directeur de la tangente à la courbe représentative de la fonction cube au point d'abscisse $${a}$.
                        `

        this.correction = `Le coefficient directeur de la tangente au point d'abscisse $a$ est donné par le nombre dérivé $f'(a)$.<br>
        La fonction $f$ définie par $f(x)=x^3$ a pour fonction dérivée la fonction $f'$ définie par $f'(x)=3x^2$.<br>
        Comme $f'(${a})=3\\times ${ecritureParentheseSiNegatif(a)}^2=${3 * a * a}$, le coefficient directeur de la tangente au point d'abscisse $${a}$ est : $${miseEnEvidence(3 * a * a)}$. `

        this.reponse = String(3 * a * a)

        break
    }
  }
}
