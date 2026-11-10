import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import {
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
  reduirePolynomeDegre3,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Déterminer la fonction dérivée d’une fonction $1/u(x)$'
export const interactifReady = true

// Les exports suivants sont optionnels mais au moins la date de publication semble essentielle
export const dateDePublication = '24/06/2022' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
export const dateDeModifImportante = '01/02/2025' // Une date de modification importante au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

/**
     * Modèle d'exercice très simple pour la course aux nombres
     * @author Gilles Mora

    */
export const uuid = '12089'

export const refs = {
  'fr-fr': ['can1D3-02'],
  'fr-ch': ['3mA2-4'],
}
export default class CalculFonctionDeriveeUnsurU extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierFullOperations
  }

  nouvelleVersion() {
    let m
    let p
    switch (
      this.quotaChoice('type', [1, 2, 3]) //, 2, 3
    ) {
      case 1: // //1/(mx+p)
        m = randint(-5, 10, 0)
        p = randint(-10, 10, 0)
        this.question = `Soit $f$ la fonction définie par :
            $f(x)=\\dfrac{1}{${reduireAxPlusB(m, p)}}$.<br>`
        if (this.interactif) {
          this.question += "$f'(x)=$"
        } else {
          this.question += "Déterminer $f'(x)$."
        }
        this.correction = `$f$est de la forme $\\dfrac{1}{u}$ avec $u(x)=${reduireAxPlusB(m, p)}$.<br>
                 Or $\\left(\\dfrac{1}{u}\\right)'=\\dfrac{-u'}{u^2}$.<br>
          On a $u(x)=${reduireAxPlusB(m, p)}$ et $u'(x)=${m}$. <br>
          On en déduit, `
        if (m < 0) {
          this.correction += `$f'(x)= \\dfrac{-${ecritureParentheseSiNegatif(m)}}{(${reduireAxPlusB(m, p)})^2}=${miseEnEvidence(`\\dfrac{${-m}}{(${reduireAxPlusB(m, p)})^2}`)}$.`
        } else {
          this.correction += `$f'(x)= ${miseEnEvidence(`\\dfrac{-${ecritureParentheseSiNegatif(m)}}{(${reduireAxPlusB(m, p)})^2}`)}$.`
        }
        this.reponse = {
          reponse: {
            value: `\\dfrac{${-m}}{(${m}x+${p})^2}`,
            options: { fonction: true, variable: 'x' },
          },
        }
        break

      case 2: // //1/(p+mx)
        m = randint(-10, 10, 0)
        p = randint(5, 10, 0)
        this.question = `Soit $f$ la fonction définie par : $f(x)=\\dfrac{1}{${p}${ecritureAlgebriqueSauf1(m)}x}$.<br>`
        if (this.interactif) {
          this.question += "$f'(x)=$"
        } else {
          this.question += "Déterminer $f'(x)$."
        }
        this.correction = `$f$ est de la forme $\\dfrac{1}{u}$ avec $u(x)=${reduireAxPlusB(m, p)}$.<br>
                         Or $\\left(\\dfrac{1}{u}\\right)'=\\dfrac{-u'}{u^2}$.<br>
                  On a $u(x)=${reduireAxPlusB(m, p)}$ et $u'(x)=${m}$. <br>
                  On en déduit, `
        if (m < 0) {
          this.correction += `$f'(x)= \\dfrac{-${ecritureParentheseSiNegatif(m)}}{(${p}${ecritureAlgebriqueSauf1(m)}x)^2}=${miseEnEvidence(`\\dfrac{${-m}}{(${p}${ecritureAlgebriqueSauf1(m)}x)^2}`)}$.`
        } else {
          this.correction += `$f'(x)= ${miseEnEvidence(`\\dfrac{-${ecritureParentheseSiNegatif(m)}}{(${p}${ecritureAlgebriqueSauf1(m)}x)^2}`)}$.`
        }
        this.reponse = {
          reponse: {
            value: `\\dfrac{${-m}}{(${m}x+${p})^2}`,
            options: { fonction: true, variable: 'x' },
          },
        }
        break
      case 3: // //1/(mx^2+p)
      default:
        m = randint(-10, 10, 0)
        p = randint(-10, 10, 0)
        this.question = `Soit $f$ la fonction définie par : $f(x)=\\dfrac{1}{${reduirePolynomeDegre3(0, m, 0, p)}}$.<br>`
        if (this.interactif) {
          this.question += "$f'(x)=$"
        } else {
          this.question += "Déterminer $f'(x)$."
        }
        this.correction = `$f$est de la forme $\\dfrac{1}{u}$ avec $u(x)=${reduirePolynomeDegre3(0, m, 0, p)}$.<br>
                         Or $\\left(\\dfrac{1}{u}\\right)'=\\dfrac{-u'}{u^2}$.<br>
                  On a $u(x)=${reduirePolynomeDegre3(0, m, 0, p)}$ et $u'(x)=${2 * m}x$. <br>On en déduit, `
        if (m < 0) {
          this.correction += `$f'(x)=\\dfrac{-(${2 * m}x)}{(${reduirePolynomeDegre3(0, m, 0, p)})^2}=${miseEnEvidence(`\\dfrac{${ecritureParentheseSiNegatif(-2 * m)}x}{(${reduirePolynomeDegre3(0, m, 0, p)})^2}`)}$.`
        } else {
          this.correction += `$f'(x)=${miseEnEvidence(`\\dfrac{-${ecritureParentheseSiNegatif(2 * m)}x}{(${reduirePolynomeDegre3(0, m, 0, p)})^2}`)}$.`
        }
        this.reponse = {
          reponse: {
            value: `\\dfrac{${-2 * m}x}{(${reduirePolynomeDegre3(0, m, 0, p)})^2}`,
            options: { fonction: true, variable: 'x' },
          },
        }
        //  this.reponse = [`\\dfrac{${-2 * m}x}{(${reduirePolynomeDegre3(0, m, 0, p)})^2}`, `\\dfrac{${-2 * m}x}{(${reduirePolynomeDegre3(0, -m, 0, -p)})^2}`]
        break
    }
  }
}
