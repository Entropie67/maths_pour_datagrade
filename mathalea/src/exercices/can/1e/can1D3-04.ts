import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import {
  ecritureAlgebrique,
  reduireAxPlusB,
  reduirePolynomeDegre3,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre =
  'Calculer une dérivée et écrire le résultat sous la forme d’un quotient'
export const interactifReady = true

// Les exports suivants sont optionnels mais au moins la date de publication semble essentielle
export const dateDePublication = '24/06/2022' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
// export const dateDeModifImportante = '14/02/2022' // Une date de modification importante au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

/**
     * Modèle d'exercice très simple pour la course aux nombres
     * @author Gilles Mora

    */
export const uuid = 'c7f8e'

export const refs = {
  'fr-fr': ['can1D3-04'],
  'fr-ch': [],
}
export default class CalculFonctionDeriveeQuotient extends ExerciceSimple {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierFullOperations
    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    let m
    let p
    let a
    switch (
      this.quotaChoice('type', [1, 2, 3, 4, 5, 6, 7]) //,
    ) {
      case 1: // //mx+p+a/x
        a = randint(1, 10)
        m = randint(-10, 10, 0)
        p = randint(-10, 10, 0)
        this.question = `Soit $f$ la fonction définie par : <br>
           $f(x)=${reduireAxPlusB(m, p)}+\\dfrac{${a}}{x}$.<br>
            Déterminer $f'(x)$ (écrire le résultat sous la forme d'un seul quotient).`
        if (this.interactif) {
          this.question += "<br>$f'(x)=$"
        }
        this.correction = `$f$ est de la forme $u+v$ avec $u(x)=${reduireAxPlusB(m, p)}$ et $v(x)=\\dfrac{${a}}{x}$.<br>
                 On a $u'(x)=${m}$ et $v'(x)=\\dfrac{-${a}}{x^2}$.<br>
          Ainsi,
          $f'(x)= ${m}+\\dfrac{-${a}}{x^2}=\\dfrac{${m}x^2}{x^2}+\\dfrac{${-a}}{x^2}=${miseEnEvidence(`\\dfrac{${m}x^2-${a}}{x^2}`)}$.`
        this.reponse = `\\dfrac{${m}x^2-${a}}{x^2}`
        break

      case 2: // //mx+p-a/x
        a = randint(1, 10)
        m = randint(-10, 10, 0)
        p = randint(-10, 10, 0)
        this.question = `Soit $f$ la fonction définie par :<br>
             $f(x)=${reduireAxPlusB(m, p)}-\\dfrac{${a}}{x}$. <br>
              Déterminer $f'(x)$ (écrire le résultat sous la forme d'un seul quotient).`
        if (this.interactif) {
          this.question += "<br>$f'(x)=$"
        }
        this.correction = `$f$ est de la forme $u-v$ avec $u(x)=${reduireAxPlusB(m, p)}$ et $v(x)=\\dfrac{${a}}{x}$.<br>
                   On a $u'(x)=${m}$ et $v'(x)=\\dfrac{-${a}}{x^2}$.<br>
            Ainsi,
            $f'(x)= ${m}-\\dfrac{-${a}}{x^2}=\\dfrac{${m}x^2}{x^2}-\\dfrac{${-a}}{x^2}=${miseEnEvidence(`\\dfrac{${m}x^2+${a}}{x^2}`)}$.`
        this.reponse = `\\dfrac{${m}x^2+${a}}{x^2}`
        break

      case 3: // //p+mx+a/x
        a = randint(1, 10)
        m = randint(-10, 10, 0)
        p = randint(-10, 10, 0)
        this.question = `Soit $f$ la fonction définie par : <br>
               $f(x)=${p}${ecritureAlgebrique(m)}x+\\dfrac{${a}}{x}$. <br>
                Déterminer $f'(x)$ (écrire le résultat sous la forme d'un seul quotient). `
        if (this.interactif) {
          this.question += "<br> $f'(x)=$"
        }
        this.correction = `$f$ est de la forme $u+v$ avec $u(x)=${p}${ecritureAlgebrique(m)}x$ et $v(x)=\\dfrac{${a}}{x}$.<br>
                     On a $u'(x)=${m}$ et $v'(x)=\\dfrac{-${a}}{x^2}$.<br>
              Ainsi,
              $f'(x)= ${m}+\\dfrac{-${a}}{x^2}=\\dfrac{${m}x^2}{x^2}+\\dfrac{${-a}}{x^2}=${miseEnEvidence(`\\dfrac{${m}x^2-${a}}{x^2}`)}$.`
        this.reponse = [`\\dfrac{${m}x^2-${a}}{x^2}`]

        break
      case 4: // //p+mx-a/x
        a = randint(1, 10)
        m = randint(-10, 10, 0)
        p = randint(-10, 10, 0)
        this.question = `Soit $f$ la fonction définie par : <br>
                  $f(x)=${p}${ecritureAlgebrique(m)}x-\\dfrac{${a}}{x}$. <br>
                  Déterminer $f'(x)$ (écrire le résultat sous la forme d'un seul quotient).`
        if (this.interactif) {
          this.question += "<br>$f'(x)=$"
        }
        this.correction = `$f$ est de la forme $u+v$ avec $u(x)=${p}${ecritureAlgebrique(m)}x$ et $v(x)=\\dfrac{${a}}{x}$.<br>
                       On a $u'(x)=${m}$ et $v'(x)=\\dfrac{-${a}}{x^2}$.<br>
                Ainsi,
                $f'(x)= ${m}-\\dfrac{-${a}}{x^2}=\\dfrac{${m}x^2}{x^2}-\\dfrac{${-a}}{x^2}=${miseEnEvidence(`\\dfrac{${m}x^2+${a}}{x^2}`)}$.`
        this.reponse = `\\dfrac{${m}x^2+${a}}{x^2}`

        break

      case 5: // //mx^2+p+a/x
        a = randint(1, 10)
        m = randint(-10, 10, 0)
        p = randint(-10, 10, 0)
        this.question = `Soit $f$ la fonction définie par : <br>
            $f(x)=${reduirePolynomeDegre3(0, m, 0, p)}+\\dfrac{${a}}{x}$. <br>
            Déterminer $f'(x)$ (écrire le résultat sous la forme d'un seul quotient).`
        if (this.interactif) {
          this.question += "<br>$f'(x)=$"
        }
        this.correction = `$f$ est de la forme $u+v$ avec $u(x)=${reduirePolynomeDegre3(0, m, 0, p)}$ et $v(x)=\\dfrac{${a}}{x}$.<br>
                 On a $u'(x)=${2 * m}x$ et $v'(x)=\\dfrac{-${a}}{x^2}$.<br>
          Ainsi,
          $f'(x)= ${2 * m}x+\\dfrac{-${a}}{x^2}=\\dfrac{${2 * m}x^3}{x^2}+\\dfrac{${-a}}{x^2}=${miseEnEvidence(`\\dfrac{${2 * m}x^3-${a}}{x^2}`)}$.`
        this.reponse = `\\dfrac{${2 * m}x^3-${a}}{x^2}`
        break
      case 6: // //p+mx^2+a/x
        a = randint(1, 10)
        m = randint(-10, 10, 0)
        p = randint(-10, 10, 0)
        this.question = `Soit $f$ la fonction définie par : <br>
         $f(x)=${p}${ecritureAlgebrique(m)}x^2+\\dfrac{${a}}{x}$. <br>
          Déterminer $f'(x)$ (écrire le résultat sous la forme d'un seul quotient).`
        if (this.interactif) {
          this.question += "<br>$f'(x)=$"
        }
        this.correction = `$f$ est de la forme $u+v$ avec $u(x)=${p}${ecritureAlgebrique(m)}x^2$ et $v(x)=\\dfrac{${a}}{x}$.<br>
               On a $u'(x)=${2 * m}x$ et $v'(x)=\\dfrac{-${a}}{x^2}$.<br>
        Ainsi,
        $f'(x)= ${2 * m}x+\\dfrac{-${a}}{x^2}=\\dfrac{${2 * m}x^3}{x^2}+\\dfrac{${-a}}{x^2}=${miseEnEvidence(`\\dfrac{${2 * m}x^3-${a}}{x^2}`)}$.`
        this.reponse = `\\dfrac{${2 * m}x^3-${a}}{x^2}`

        break

      case 7: // //mx^2+p-a/x
        a = randint(1, 10)
        m = randint(-10, 10, 0)
        p = randint(-10, 10, 0)
        this.question = `Soit $f$ la fonction définie par : <br>
       $f(x)=${reduirePolynomeDegre3(0, m, 0, p)}-\\dfrac{${a}}{x}$.<br>
        Déterminer $f'(x)$ (écrire le résultat sous la forme d'un seul quotient).`
        if (this.interactif) {
          this.question += "<br>$f'(x)=$"
        }
        this.correction = `$f$ est de la forme $u-v$ avec $u(x)=${reduirePolynomeDegre3(0, m, 0, p)}$ et $v(x)=\\dfrac{${a}}{x}$.<br>
             On a $u'(x)=${2 * m}x$ et $v'(x)=\\dfrac{-${a}}{x^2}$.<br>
      Ainsi,
      $f'(x)= ${2 * m}x-\\dfrac{-${a}}{x^2}=\\dfrac{${2 * m}x^3}{x^2}-\\dfrac{${-a}}{x^2}=${miseEnEvidence(`\\dfrac{${2 * m}x^3+${a}}{x^2}`)}$.`
        this.reponse = `\\dfrac{${2 * m}x^3+${a}}{x^2}`
        break
    }
  }
}
