import { orangeMathalea } from '../../../lib/colors'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import Decimal from 'decimal.js'
import { choice } from '../../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  reduireAxPlusB,
} from '../../../lib/outils/ecritures'
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
export const uuid = '84ae6'

export const refs = {
  'fr-fr': ['can1D2-02'],
  'fr-ch': [],
}
export default class CalculFonctionDeriveeAffine2 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const listeFractions = [
      [2, 5],
      [-2, 3],
      [-3, 4],
      [5, 7],
      [-3, 7],
      [3, 5],
      [4, 5],
      [-2, 7],
      [-7, 9],
      [-4, 9],
      [4, 7],
      [2, 11],
      [-3, 11],
      [8, 9],
      [6, 7],
      [-8, 3],
      [-7, 3],
      [2, 15],
      [-2, 15],
      [3, 17],
      [-3, 10],
    ]
    const listeFractions2 = [
      [2, 5],
      [2, 3],
      [3, 4],
      [5, 7],
      [3, 7],
      [3, 5],
      [4, 5],
      [2, 7],
      [7, 9],
      [-4, 9],
      [4, 7],
      [2, 11],
      [3, 11],
      [8, 9],
      [6, 7],
      [10, 7],
      [11, 7],
      [9, 8],
      [7, 8],
      [11, 3],
      [2, 15],
    ]
    let a
    let p
    let m
    let f
    let fraction = []
    let fraction2 = []
    switch (
      this.quotaChoice('type', [1, 2, 3, 4]) //
    ) {
      case 1: // x/a+p
        a = randint(2, 15)
        p = choice([
          randint(1, 10) * choice([-1, 1]),
          new Decimal(randint(-19, 19, [0, -10, 10])).div(10),
        ])

        if (choice([true, false])) {
          this.question = `Soit $f$ la fonction définie sur $\\mathbb{R}$ par : <br>

            $f(x)=\\dfrac{x}{${a}}${ecritureAlgebrique(p)}$. <br>

            Déterminer $f'(x)$.   <br>       `
          if (this.interactif) {
            this.question += "$f'(x)=$"
          }
          this.correction = `On reconnaît une fonction affine de la forme $f(x)=mx+p$ avec $m=\\dfrac{1}{${a}}$ et $p=${texNombre(p, 1)}$.<br>
            La fonction dérivée est donnée par $f'(x)=m$, soit ici $f'(x)=${miseEnEvidence(`\\dfrac{1}{${a}}`)}$. `

          this.reponse = new FractionEtendue(1, a)
        } else {
          this.question = `Soit $f$ la fonction définie sur $\\mathbb{R}$ par : <br>

         $f(x)=-\\dfrac{x}{${a}}${ecritureAlgebrique(p)}$.<br>
         
          Déterminer $f'(x)$.   <br>  `
          if (this.interactif) {
            this.question += "$f'(x)=$"
          }
          this.correction = `On reconnaît une fonction affine de la forme $f(x)=mx+p$ avec $m=-\\dfrac{1}{${a}}$ et $p=${texNombre(p, 1)}$.<br>
            La fonction dérivée est donnée par $f'(x)=m$, soit ici $f'(x)=${miseEnEvidence(`-\\dfrac{1}{${a}}`)}$. `

          this.reponse = new FractionEtendue(-1, a)
        }

        break
      case 2: // (mx+p)/a
        m = randint(2, 15) * choice([-1, 1])
        p = choice([
          randint(1, 10) * choice([-1, 1]),
          new Decimal(randint(-19, 19, [0, -10, 10])).div(10),
        ])
        a = randint(2, 15)
        f = new FractionEtendue(m, a)
        if (choice([true, false])) {
          this.question = `Soit $f$ la fonction définie sur $\\mathbb{R}$ par : <br>

           $f(x)=\\dfrac{${reduireAxPlusB(m, p)}}{${a}}$. <br>

            Déterminer $f'(x)$.   <br>  `
          if (this.interactif) {
            this.question += "$f'(x)=$"
          }
          this.correction = `On reconnaît une fonction affine de la forme $f(x)=mx+p$ avec $m=\\dfrac{${m}}{${a}}$ et $p=\\dfrac{${texNombre(p, 1)}}{${a}}$.<br>
            La fonction dérivée est donnée par $f'(x)=m$, soit ici $f'(x)=${f.estIrreductible && f.num * f.den > 0 ? miseEnEvidence(`\\dfrac{${m}}{${a}}`) : `\\dfrac{${m}}{${a}}${f.texSimplificationAvecEtapes(false, orangeMathalea)}`}$. `

          this.reponse = f
        } else {
          this.question = `Soit $f$ la fonction définie sur $\\mathbb{R}$ par :<br>

           $f(x)=\\dfrac{${texNombre(p, 1)}${ecritureAlgebrique(m)}x}{${a}}$.<br>
           
            Déterminer $f'(x)$.   <br>  `
          if (this.interactif) {
            this.question += "$f'(x)=$"
          }
          this.correction = `On reconnaît une fonction affine de la forme $f(x)=mx+p$ avec $m=\\dfrac{${m}}{${a}}$ et $p=\\dfrac{${texNombre(p, 1)}}{${a}}$.<br>
            La fonction dérivée est donnée par $f'(x)=m$, soit ici $f'(x)=${f.estIrreductible && f.num * f.den > 0 ? miseEnEvidence(`\\dfrac{${m}}{${a}}`) : `\\dfrac{${m}}{${a}}${f.texSimplificationAvecEtapes(false, orangeMathalea)}`}$. `

          this.reponse = f
        }

        break

      case 3: // mx/a+p ou mx/a
        m = randint(2, 15) * choice([-1, 1])
        p = choice([
          randint(1, 10) * choice([-1, 1]),
          new Decimal(randint(-19, 19, [0, -10, 10])).div(10),
        ])
        a = randint(2, 15)
        fraction = choice(listeFractions)
        f = new FractionEtendue(fraction[0], fraction[1])
        if (choice([true, false])) {
          this.question = `Soit $f$ la fonction définie sur $\\mathbb{R}$ par : <br>

         $f(x)=\\dfrac{${fraction[0]}x}{${fraction[1]}}${ecritureAlgebrique(p)}$.<br>

          Déterminer $f'(x)$.   <br>  `
          if (this.interactif) {
            this.question += "$f'(x)=$"
          }
          this.correction = `On reconnaît une fonction affine de la forme $f(x)=mx+p$ avec $m=\\dfrac{${fraction[0]}}{${fraction[1]}}$  et $p=${texNombre(p, 1)}$.<br>
            La fonction dérivée est donnée par $f'(x)=m$, soit ici $f'(x)=${miseEnEvidence(`\\dfrac{${fraction[0]}}{${fraction[1]}}`)}$. `

          this.reponse = f
        } else {
          this.question = `Soit $f$ la fonction définie sur $\\mathbb{R}$ par : <br>

            $f(x)=\\dfrac{${fraction[0]}x}{${fraction[1]}}$.<br>

            Déterminer $f'(x)$.   <br>  `
          if (this.interactif) {
            this.question += "$f'(x)=$"
          }
          this.correction = `On reconnaît une fonction linéaire de la forme $f(x)=mx$ avec $m=\\dfrac{${fraction[0]}}{${fraction[1]}}$.<br>
              La fonction dérivée est donnée par $f'(x)=m$, soit ici $f'(x)=${miseEnEvidence(`\\dfrac{${fraction[0]}}{${fraction[1]}}`)}$. `

          this.reponse = f
        }

        break

      case 4: // p+/-mx/a
        m = randint(2, 15) * choice([-1, 1])
        p = choice([
          randint(1, 10) * choice([-1, 1]),
          new Decimal(randint(-19, 19, [0, -10, 10])).div(10),
        ])
        a = randint(2, 15)
        fraction2 = choice(listeFractions2)
        if (choice([true, false])) {
          f = new FractionEtendue(fraction2[0], fraction2[1])

          this.question = `Soit $f$ la fonction définie sur $\\mathbb{R}$ par : <br>

          $f(x)=${texNombre(p, 1)}+\\dfrac{${fraction2[0]}x}{${fraction2[1]}}$. <br>
          
          Déterminer $f'(x)$.   <br>  `
          if (this.interactif) {
            this.question += "$f'(x)=$"
          }
          this.correction = `On reconnaît une fonction affine de la forme $f(x)=mx+p$ avec $m=\\dfrac{${fraction2[0]}}{${fraction2[1]}}$  et $p=${texNombre(p, 1)}$.<br>
            La fonction dérivée est donnée par $f'(x)=m$, soit ici $f'(x)=${miseEnEvidence(`\\dfrac{${fraction2[0]}}{${fraction2[1]}}`)}$. `

          this.reponse = f
        } else {
          f = new FractionEtendue(-fraction2[0], fraction2[1])
          this.question = `Soit $f$ la fonction définie sur $\\mathbb{R}$ par : <br>

           $f(x)=${texNombre(p, 1)}-\\dfrac{${fraction2[0]}x}{${fraction2[1]}}$. <br>

            Déterminer $f'(x)$.   <br>  `
          if (this.interactif) {
            this.question += "$f'(x)=$"
          }
          this.correction = `On reconnaît une fonction affine de la forme $f(x)=mx+p$ avec $m=-\\dfrac{${fraction2[0]}}{${fraction2[1]}}$  et $p=${texNombre(p, 1)}$.<br>
              La fonction dérivée est donnée par $f'(x)=m$, soit ici $f'(x)=${miseEnEvidence(`-\\dfrac{${fraction2[0]}}{${fraction2[1]}}`)}$. `

          this.reponse = f
        }

        break
    }
  }
}
