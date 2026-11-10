import { choice } from '../../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  reduireAxPlusB,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import FractionEtendue from '../../../modules/FractionEtendue'
import { randint } from '../../../modules/outils'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Déterminer la fonction dérivée d’une fonction affine'
export const interactifReady = true

// Les exports suivants sont optionnels mais au moins la date de publication semble essentielle
export const dateDePublication = '20/06/2022' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
// export const dateDeModifImportante = '14/02/2022' // Une date de modification importante au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export const uuid = '45511'

export const refs = {
  'fr-fr': ['can1D2-01'],
  'fr-ch': ['3mA2-6'],
}
export default class CalculFonctionDeriveeAffine extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.nbQuestions = 1
    this.optionsDeComparaison = { calculFormel: true }
  }

  nouvelleVersion() {
    let m, p, f
    switch (
      this.quotaChoice('type', [1, 2, 3]) //
    ) {
      case 1: // mx+p
        m = choice([
          randint(1, 10) * choice([-1, 1]),
          randint(-19, 19, [0, -10, 10]) / 10,
        ])
        p = choice([
          randint(1, 10) * choice([-1, 1]),
          randint(-19, 19, [0, -10, 10]) / 10,
        ])
        f = new FractionEtendue(Math.round(m * 10), 10)
        this.question = `Soit $f$ la fonction définie sur $\\mathbb{R}$ par : <br>
       $f(x)=${reduireAxPlusB(m, p)}$.<br>
        Déterminer $f'(x)$.`
        if (this.interactif) {
          this.question += "<br>$f'(x)=$"
        }
        this.correction = `On reconnaît une fonction affine de la forme $f(x)=mx+p$ avec $m=${texNombre(m, 1)}$ et $p=${texNombre(p, 1)}$.<br>
        La fonction dérivée est donnée par $f'(x)=m$, soit ici $f'(x)=${miseEnEvidence(texNombre(m, 1))}$. `

        this.reponse = f.texFraction
        this.canEnonce = `Soit $f$ la fonction définie sur $\\mathbb{R}$ par : <br>
        $f(x)=${reduireAxPlusB(m, p)}$.`
        this.canReponseACompleter = '$f^\\prime(x)=\\ldots$'
        break
      case 2: // p+mx
        m = choice([
          randint(2, 10) * choice([-1, 1]),
          randint(-19, 19, [0, -10, 10]) / 10,
        ])
        p = choice([
          randint(1, 10) * choice([-1, 1]),
          randint(-19, 19, [0, -10, 10]) / 10,
        ])
        f = new FractionEtendue(Math.round(m * 10), 10)
        this.question = `Soit $f$ la fonction définie sur $\\mathbb{R}$ par : <br>
      $f(x)=${texNombre(p, 1)}${ecritureAlgebrique(m)}x$.<br>
        Déterminer $f'(x)$.`
        if (this.interactif) {
          this.question += "<br>$f'(x)=$"
        }
        this.correction = `On reconnaît une fonction affine de la forme $f(x)=mx+p$ avec $m=${texNombre(m, 1)}$ et $p=${texNombre(p, 1)}$.<br>
        La fonction dérivée est donnée par $f'(x)=m$, soit ici $f'(x)=${miseEnEvidence(texNombre(m, 1))}$. `
        this.reponse = f.texFraction
        this.canEnonce = `Soit $f$ la fonction définie sur $\\mathbb{R}$ par : <br>
        $f(x)=${texNombre(p, 1)}${ecritureAlgebrique(m)}x$.`
        this.canReponseACompleter = '$f^\\prime(x)=\\ldots$'
        break
      case 3: // x+p
        p = choice([
          randint(1, 10) * choice([-1, 1]),
          randint(-19, 19, [0, -10, 10]) / 10,
        ])
        m = choice([-1, 1])
        if (choice([true, false])) {
          this.question = `Soit $f$ la fonction définie sur $\\mathbb{R}$ par :<br>
       $f(x)=${reduireAxPlusB(m, p)}$.<br>
       Déterminer $f'(x)$.`
          this.canEnonce = `Soit $f$ la fonction définie sur $\\mathbb{R}$ par : <br>
       $f(x)=${reduireAxPlusB(m, p)}$.`
          this.canReponseACompleter = '$f^\\prime(x)=\\ldots$'
        } else {
          this.question = `Soit $f$ la fonction définie sur $\\mathbb{R}$ par : <br>
        $f(x)=${texNombre(p, 1)}${ecritureAlgebriqueSauf1(m)}x$.<br>
        Déterminer $f'(x)$.`
          this.canEnonce = `Soit $f$ la fonction définie sur $\\mathbb{R}$ par : <br>
        $f(x)=${texNombre(p, 1)}${ecritureAlgebriqueSauf1(m)}x$.`
          this.canReponseACompleter = '$f^\\prime(x)=\\ldots$'
        }
        if (this.interactif) {
          this.question += "<br>$f'(x)=$"
        }
        this.correction = `On reconnaît une fonction affine de la forme $f(x)=mx+p$ avec $m=${m}$ et $p=${texNombre(p, 1)}$.<br>
        La fonction dérivée est donnée par $f'(x)=m$, soit ici $f'(x)=${miseEnEvidence(m)}$. `
        this.reponse = m

        break
    }
  }
}
