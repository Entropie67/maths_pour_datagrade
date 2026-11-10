import { remplisLesBlancs } from '../../../lib/interactif/questionMathLive'
import { choice } from '../../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
  rienSi1,
} from '../../../lib/outils/ecritures'
import { pgcd } from '../../../lib/outils/primalite'
import FractionEtendue from '../../../modules/FractionEtendue'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'

import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { miseEnEvidence } from '../../../lib/outils/embellissements'

export const titre = 'Reconnaitre une fonction affine'
export const interactifReady = true

// Les exports suivants sont optionnels mais au moins la date de publication semble essentielle
export const dateDePublication = '25/10/2021' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
export const dateDeModifImportante = '06/02/2025'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

 */
export const uuid = 'b60f4'

export const refs = {
  'fr-fr': ['can3F3-04', '2F21-flash1'],
  'fr-ch': [],
}
export default class ReconnaitreFonctionAffine extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 1
  }

  nouvelleVersion() {
    let a, b, c, texte, texteCorr
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      switch (
        choice([1, 2, 3, 4]) //, 2, 3
      ) {
        case 1: // ax+b
          a = randint(-7, 7)
          b = randint(-9, 9, [a, 0])
          texte = `Soit $f(x)=${reduireAxPlusB(a, b)}$.<br>
            $f$ est une fonction affine de la forme $f(x)=ax+b$.<br>
            On a `
          texteCorr = `On identifie les valeurs de $a$ et de $b$ : <br>
          la valeur de $a$ est le coefficient devant $x$ ${a === 1 ? '(attention, $x=1x$)' : ''} et la valeur de $b$ est la constante. <br>
        $f(x)=${reduireAxPlusB(a, b)}=\\underbrace{${a}}_{a}x+\\underbrace{${ecritureParentheseSiNegatif(b)}}_{b}$.<br>
        On a donc $a=${miseEnEvidence(a)}$ et $b=${miseEnEvidence(b)}$.`
          texte += remplisLesBlancs(
            this,
            i,
            'a =\\text{ }%{champ1}  \\text{ et  } b=\\text{ }%{champ2}.',
          )
          handleAnswers(this, i, {
            bareme: (listePoints) => [
              Math.min(listePoints[0], listePoints[1]),
              1,
            ],
            champ1: { value: String(a) },
            champ2: { value: String(b) },
          })
          this.canEnonce = `Soit $f(x)=${reduireAxPlusB(a, b)}$.<br>    
         La fonction $f$ est une fonction affine de la forme $f(x)=ax+b$.`
          break

        case 2: // b+ax
          a = randint(1, 5)
          b = randint(-9, 9, [a, 0])
          texte = `Soit $f(x)=${b}${ecritureAlgebriqueSauf1(a)}x$.<br>
            $f$ est une fonction affine de la forme $f(x)=ax+b$.<br>
            On a `
          texteCorr = `On identifie les valeurs de $a$ et de $b$ : <br>
          la valeur de $a$ est le coefficient devant $x$ ${a === 1 ? '(attention, $x=1x$)' : ''} et la valeur de $b$ est la constante. <br>
        $f(x)=${b}${ecritureAlgebriqueSauf1(a)}x=\\underbrace{${a}}_{a}x+\\underbrace{${ecritureParentheseSiNegatif(b)}}_{b}$.<br>
        On a donc $a=${miseEnEvidence(a)}$ et $b=${miseEnEvidence(b)}$.`

          texte += remplisLesBlancs(
            this,
            i,
            'a =\\text{ }%{champ1}  \\text{ et  } b =\\text{ }%{champ2}.',
          )
          handleAnswers(this, i, {
            bareme: (listePoints) => [
              Math.min(listePoints[0], listePoints[1]),
              1,
            ],
            champ1: { value: String(a) },
            champ2: { value: String(b) },
          })
          this.canEnonce = `Soit $f(x)=${reduireAxPlusB(a, b)}$.<br>    
         La fonction $f$ est une fonction affine de la forme $f(x)=ax+b$.`
          break

        case 3: // a/bx +c
          a = randint(-9, 9, 0)
          b = randint(2, 10, a)
          c = randint(-9, 9, 0)
          while (pgcd(a, b) !== 1) {
            a = randint(-5, 5, 0)
          }
          texte = `Soit $f(x)=\\dfrac{${rienSi1(a)}x}{${b}}${ecritureAlgebrique(c)}$.<br>
           $f$ est une fonction affine de la forme $f(x)=ax+b$.<br>
            On a `
          this.canEnonce = `Soit $f(x)=\\dfrac{${rienSi1(a)}x}{${b}}${ecritureAlgebrique(c)}$.<br>    
         La fonction $f$ est une fonction affine de la forme $f(x)=ax+b$.`
          texteCorr = `On identifie les valeurs de $a$ et de $b$ : la valeur de $a$ est le coefficient devant $x$ (attention, $\\dfrac{ax}{b}=\\dfrac{a}{b}x$) et la valeur de $b$ est la constante.<br>
        $f(x)=\\dfrac{${rienSi1(a)}x}{${b}}${ecritureAlgebrique(c)}=\\underbrace{\\dfrac{${a}}{${b}}}_{a}x+\\underbrace{${ecritureParentheseSiNegatif(c)}}_{b}$<br>
         On a donc $a=${miseEnEvidence(new FractionEtendue(a, b).texFSD)}$ et $b=${miseEnEvidence(c)}$.`
          texte += remplisLesBlancs(
            this,
            i,
            'a =\\text{ }%{champ1}  \\text{ et  } b=\\text{ }%{champ2}',
          )
          handleAnswers(this, i, {
            bareme: (listePoints) => [
              Math.min(listePoints[0], listePoints[1]),
              1,
            ],
            champ1: { value: new FractionEtendue(a, b) },
            champ2: { value: String(c) },
          })
          break

        case 4: // (ax+c)/b)
        default:
          a = randint(-9, 9, 0)
          b = randint(2, 10, a)
          c = randint(-9, 9, 0)
          while (pgcd(a, b) !== 1 || pgcd(c, b) !== 1) {
            a = randint(-9, 9, 0)
            c = randint(-9, 9, 0)
            b = randint(2, 10)
          }

          texte = `Soit $f(x)=\\dfrac{${reduireAxPlusB(a, c)}}{${b}}$.<br>
 $f$ est une fonction affine de la forme $f(x)=ax+b$.<br>
            On a `
          this.canEnonce = `Soit $f(x)=\\dfrac{${reduireAxPlusB(a, c)}}{${b}}$.<br>
          La fonction $f$ est une fonction affine de la forme $f(x)=ax+b$.`

          texte += remplisLesBlancs(
            this,
            i,
            'a =\\text{ }%{champ1}  \\text{ et  } b=\\text{ }%{champ2}',
          )
          handleAnswers(this, i, {
            bareme: (listePoints) => [
              Math.min(listePoints[0], listePoints[1]),
              1,
            ],
            champ1: { value: new FractionEtendue(a, b) },
            champ2: { value: new FractionEtendue(c, b) },
          })

          texteCorr = `On identifie les valeurs de $a$ et de $b$ : la valeur de $a$ est le coefficient devant $x$  et la valeur de $b$ est la constante.<br>
        $f(x)=\\dfrac{${rienSi1(a)}x${ecritureAlgebrique(c)}}{${b}}=\\underbrace{\\dfrac{${a}}{${b}}}_{a}x+\\underbrace{\\dfrac{${c}}{${b}}}_{b}$<br>
         On a donc $a=${miseEnEvidence(new FractionEtendue(a, b).texFSD)}$ et $b=${miseEnEvidence(new FractionEtendue(c, b).texFSD)}$.`
          break
      }

      this.canReponseACompleter =
        'Les valeurs de $a$ et de $b$ sont : <br>$a=\\ldots $ et $b=\\ldots$'
      if (this.questionJamaisPosee(i, a, b)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr

        this.listeCanEnonces.push(this.canEnonce)
        this.listeCanReponsesACompleter.push(this.canReponseACompleter)
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
