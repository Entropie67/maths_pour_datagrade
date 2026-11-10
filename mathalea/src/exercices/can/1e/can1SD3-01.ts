import { texteEnCouleurEtGras } from '../../../lib/outils/embellissements'
import { propositionsQcm } from '../../../lib/interactif/qcm'
import { choice } from '../../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  reduirePolynomeDegre3,
  rienSi1,
} from '../../../lib/outils/ecritures'
import { abs } from '../../../lib/outils/nombres'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'
export const titre = 'Reconnaitre une fonction polynôme du second degré (V/F)'
export const interactifReady = true

export const dateDePublication = '24/09/2022'
/**
 *
 * @author Gilles Mora

 *
*/

export const uuid = '6e9df'

export const refs = {
  'fr-fr': ['can1SD3-01'],
  'fr-ch': [],
}
export default class ReconnaitreFonctionDegre2 extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const nomF = [['f'], ['g'], ['h'], ['u'], ['v'], ['w'], ['r']]
    let nom, choix
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let monQcm = { texte: '', texteCorr: '' }
      this.canEnonce = ''
      let a = 0
      let b = 0
      let c = 0
      let d = 0
      let x1 = 0
      let x2 = 0
      let alpha = 0
      let beta = 0
      let r1, r2
      switch (
        choice([1, 2, 3, 4, 5, 6]) //
      ) {
        case 1: // forme developpee ok
          a = randint(-3, 3, 0)
          b = randint(-9, 9, 0)
          c = randint(-9, 9, 0)
          d = choice([5, 7, 10])
          r1 = choice([2, 3, 5, 6, 7, 10])
          nom = choice(nomF)
          choix = choice(['a', 'b', 'c', 'd', 'e', 'f', 'g']) //
          if (choix === 'a') {
            texte = `Soit $${nom}$ la fonction définie par :<br>
            $${nom}(x)=${reduirePolynomeDegre3(0, a, b, c)}$. <br>
            $${nom}$ est une fonction polynôme du second degré.`
            this.canEnonce = texte
          } else if (choix === 'b') {
            texte = `Soit $${nom}$ la fonction définie par :<br>
            $${nom}(x)=${reduirePolynomeDegre3(0, a, 0, c)}$. <br>
            $${nom}$ est une fonction polynôme du second degré.`
            this.canEnonce = texte
          } else if (choix === 'c') {
            texte = `Soit $${nom}$ la fonction définie par :<br>
            $${nom}(x)=${reduirePolynomeDegre3(0, a, b, 0)}$. <br>
            $${nom}$ est une fonction polynôme du second degré.`
            this.canEnonce = texte
          } else if (choix === 'd') {
            texte = `Soit $${nom}$ la fonction définie par :<br>
            $${nom}(x)=${rienSi1(b)}x${ecritureAlgebrique(c)}${ecritureAlgebriqueSauf1(a)}x^2$. <br>
            $${nom}$ est une fonction polynôme du second degré.`
            this.canEnonce = texte
          } else if (choix === 'e') {
            texte = `Soit $${nom}$ la fonction définie par :<br>
            $${nom}(x)=${rienSi1(b)}x${ecritureAlgebriqueSauf1(a)}x^2${ecritureAlgebrique(c)}$. <br>
            $${nom}$ est une fonction polynôme du second degré.`
            this.canEnonce = texte
          } else if (choix === 'f') {
            texte = `Soit $${nom}$ la fonction définie par :<br>
            $${nom}(x)=\\dfrac{${reduirePolynomeDegre3(0, a, 0, c)}}{${d}}$. <br>
            $${nom}$ est une fonction polynôme du second degré.`
            this.canEnonce = texte
          } else {
            texte = `Soit $${nom}$ la fonction définie par :<br>
            $${nom}(x)=${rienSi1(a)}x^2+\\sqrt{${r1}}x${ecritureAlgebrique(c)}$. <br>
            $${nom}$ est une fonction polynôme du second degré.`
            this.canEnonce = texte
          }
          this.autoCorrection[i] = {
            enonce: texte,
            propositions: [
              {
                texte: 'Vrai',
                statut: a < 10,
              },
              {
                texte: 'Faux',
                statut: a > 10,
              },
            ],
            options: { ordered: true, radio: true },
          }
          monQcm = propositionsQcm(this, i)
          texte += monQcm.texte

          if (choix === 'a') {
            texteCorr =
              monQcm.texteCorr +
              `La fonction $${nom}$ ${texteEnCouleurEtGras('est')} une fonction polynôme du second degré. <br>
            $${nom}(x)$ est de la forme $ax^2+bx+c$ avec $a=${a}$, $b=${b}$ et $c=${c}$.<br>
             $a$, $b$ et $c$ sont bien des constantes et $a\\neq 0$. `
          } else if (choix === 'b') {
            texteCorr =
              monQcm.texteCorr +
              `La fonction $${nom}$ ${texteEnCouleurEtGras('est')} une fonction polynôme du second degré. <br>
            $${nom}(x)$ est de la forme $ax^2+bx+c$ avec $a=${a}$, $b=0$ et $c=${c}$.<br>
            $a$, $b$ et $c$ sont bien des constantes et $a\\neq 0$. `
          } else if (choix === 'c') {
            texteCorr =
              monQcm.texteCorr +
              `La fonction $${nom}$ ${texteEnCouleurEtGras('est')} une fonction polynôme du second degré. <br>
            $${nom}(x)$ est de la forme $ax^2+bx+c$ avec $a=${a}$, $b=${b}$ et $c=0$.<br>
            $a$, $b$ et $c$ sont bien des constantes et $a\\neq 0$. `
          } else if (choix === 'd') {
            texteCorr =
              monQcm.texteCorr +
              `La fonction $${nom}$ ${texteEnCouleurEtGras('est')} une fonction polynôme du second degré. <br>
            $${nom}(x)$ est de la forme $ax^2+bx+c$ avec $a=${a}$, $b=${b}$ et $c=${c}$.<br>
            $a$, $b$ et $c$ sont bien des constantes et $a\\neq 0$. `
          } else if (choix === 'e') {
            texteCorr =
              monQcm.texteCorr +
              `La fonction $${nom}$ ${texteEnCouleurEtGras('est')} une fonction polynôme du second degré. <br>
            $${nom}(x)$ est de la forme $ax^2+bx+c$ avec $a=${a}$, $b=${b}$ et $c=${c}$.<br>
            $a$, $b$ et $c$ sont bien des constantes et $a\\neq 0$. `
          } else if (choix === 'f') {
            texteCorr =
              monQcm.texteCorr +
              `La fonction $${nom}$ ${texteEnCouleurEtGras('est')} une fonction polynôme du second degré. <br>
            $${nom}(x)$ est de la forme $ax^2+bx+c$ avec $a=\\dfrac{${a}}{${d}}$, $b=0$ et $c=\\dfrac{${c}}{${d}}$.<br>
            $a$, $b$ et $c$ sont bien des constantes et $a\\neq 0$. `
          } else {
            texteCorr =
              monQcm.texteCorr +
              `La fonction $${nom}$ ${texteEnCouleurEtGras('est')} une fonction polynôme du second degré. <br>
                $${nom}(x)$ est de la forme $ax^2+bx+c$ avec $a=${a}$, $b=\\sqrt{${r1}}$ et $c=${c}$.<br>
                $a$, $b$ et $c$ sont bien des constantes et $a\\neq 0$. `
          }
          break

        case 2: // forme factorisee ok
          a = randint(-3, 3, 0)
          x1 = randint(-9, 9, 0)
          x2 = randint(-9, 9, [0, x1])
          nom = choice(nomF)
          r1 = choice([2, 3, 5, 6, 7, 10])
          r2 = choice([2, 3, 5, 6, 7, 10])
          choix = choice(['a', 'b', 'c', 'd', 'e', 'f']) //
          if (choix === 'a') {
            texte = `Soit $${nom}$ la fonction définie par :<br>
              $${nom}(x)=${rienSi1(a)}(x${ecritureAlgebrique(x1)})(x${ecritureAlgebrique(x2)})$. <br>
              $${nom}$ est une fonction polynôme du second degré.`
            this.canEnonce = texte
          } else if (choix === 'b') {
            texte = `Soit $${nom}$ la fonction définie par :<br>
              $${nom}(x)=${rienSi1(a)}x(x${ecritureAlgebrique(x2)})$. <br>
              $${nom}$ est une fonction polynôme du second degré.`
            this.canEnonce = texte
          } else if (choix === 'c') {
            texte = `Soit $${nom}$ la fonction définie par :<br>
              $${nom}(x)=x(x${ecritureAlgebrique(x2)})$. <br>
              $${nom}$ est une fonction polynôme du second degré.`
            this.canEnonce = texte
          } else if (choix === 'd') {
            texte = `Soit $${nom}$ la fonction définie par :<br>
                $${nom}(x)=(${x1}-x)(x${ecritureAlgebrique(x2)})$. <br>
                $${nom}$ est une fonction polynôme du second degré.`
            this.canEnonce = texte
          } else if (choix === 'e') {
            texte = `Soit $${nom}$ la fonction définie par :<br>
              $${nom}(x)=${rienSi1(a)}(x+\\sqrt{${r1}})(x-\\sqrt{${r2}})$. <br>
              $${nom}$ est une fonction polynôme du second degré.`
            this.canEnonce = texte
          } else {
            texte = `Soit $${nom}$ la fonction définie par :<br>
              $${nom}(x)=\\sqrt{${r1}}(x${ecritureAlgebrique(x1)})(x${ecritureAlgebrique(x2)})$. <br>
              $${nom}$ est une fonction polynôme du second degré.`
            this.canEnonce = texte
          }
          this.autoCorrection[i] = {
            enonce: texte,
            propositions: [
              {
                texte: 'Vrai',
                statut: a < 10,
              },
              {
                texte: 'Faux',
                statut: a > 10,
              },
            ],
            options: { ordered: true },
          }
          monQcm = propositionsQcm(this, i)
          texte += monQcm.texte

          if (choix === 'a') {
            texteCorr =
              monQcm.texteCorr +
              `La fonction $${nom}$ ${texteEnCouleurEtGras('est')} une fonction polynôme du second degré. <br>
              $${nom}(x)$ est de la forme $a(x-x_1)(x-x_2)$ avec $a=${a}$, $x_1=${-x1}$ et $x_2=${-x2}$.<br> Il s'agit de la forme factorisée d'une fonction polynôme du second degré. `
          } else if (choix === 'b') {
            texteCorr =
              monQcm.texteCorr +
              `La fonction $${nom}$ ${texteEnCouleurEtGras('est')} une fonction polynôme du second degré. <br>
              $${nom}(x)$ est de la forme $a(x-x_1)(x-x_2)$ avec $a=${a}$, $x_1=0$ et $x_2=${-x2}$.<br> Il s'agit de la forme factorisée d'une fonction polynôme du second degré. `
          } else if (choix === 'c') {
            texteCorr =
              monQcm.texteCorr +
              `La fonction $${nom}$ ${texteEnCouleurEtGras('est')} une fonction polynôme du second degré. <br>
              $${nom}(x)$ est de la forme $a(x-x_1)(x-x_2)$ avec $a=1$, $x_1=0$ et $x_2=${-x2}$.<br> Il s'agit de la forme factorisée d'une fonction polynôme du second degré. `
          } else if (choix === 'd') {
            texteCorr =
              monQcm.texteCorr +
              `La fonction $${nom}$ ${texteEnCouleurEtGras('est')} une fonction polynôme du second degré. <br>
                $${nom}(x)=(${x1}-x)(x${ecritureAlgebrique(x2)})=-(x${ecritureAlgebrique(-x1)})(x${ecritureAlgebrique(x2)})$.<br>
                $${nom}(x)$ est de la forme $a(x-x_1)(x-x_2)$ avec $a=1$, $x_1=0$ et $x_2=${-x2}$.<br> Il s'agit de la forme factorisée d'une fonction polynôme du second degré. `
          } else if (choix === 'e') {
            texteCorr =
              monQcm.texteCorr +
              `La fonction $${nom}$ ${texteEnCouleurEtGras('est')} une fonction polynôme du second degré. <br>
              $${nom}(x)$ est de la forme $a(x-x_1)(x-x_2)$ avec $a=${a}$, $x_1=-\\sqrt{${r1}}$ et $x_2=\\sqrt{${r2}}$.<br> Il s'agit de la forme factorisée d'une fonction polynôme du second degré. `
          } else {
            texteCorr =
              monQcm.texteCorr +
              `La fonction $${nom}$ ${texteEnCouleurEtGras('est')} une fonction polynôme du second degré. <br>
              $${nom}(x)$ est de la forme $a(x-x_1)(x-x_2)$ avec $a=\\sqrt{${r1}}$, $x_1=${-x1}$ et $x_2=${-x2}$.<br> Il s'agit de la forme factorisée d'une fonction polynôme du second degré. `
          }
          break

        case 3: // forme canonique ok
          a = randint(-5, 5, 0)
          x1 = randint(-9, 9, 0)
          x2 = randint(-9, 9, [0, x1])
          alpha = randint(-9, 9, 0)
          beta = randint(-9, 9, 0)
          nom = choice(nomF)
          choix = choice(['a', 'b', 'c']) //
          if (choix === 'a') {
            texte = `Soit $${nom}$ la fonction définie par :<br>
                  $${nom}(x)=${rienSi1(a)}(x${ecritureAlgebrique(alpha)})^2${ecritureAlgebrique(beta)}$. <br>         
                  $${nom}$ est une fonction polynôme du second degré.`
            this.canEnonce = texte
          } else if (choix === 'b') {
            texte = `Soit $${nom}$ la fonction définie par :<br>
                  $${nom}(x)=${rienSi1(a)}(x${ecritureAlgebrique(alpha)})^2$. <br>
                  $${nom}$ est une fonction polynôme du second degré.`
            this.canEnonce = texte
          } else {
            texte = `Soit $${nom}$ la fonction définie par :<br>
                  $${nom}(x)=(x${ecritureAlgebrique(alpha)})^2$. <br>
                  $${nom}$ est une fonction polynôme du second degré.`
            this.canEnonce = texte
          }
          this.autoCorrection[i] = {
            enonce: texte,
            propositions: [
              {
                texte: 'Vrai',
                statut: a < 10,
              },
              {
                texte: 'Faux',
                statut: a > 10,
              },
            ],
            options: { ordered: true },
          }
          monQcm = propositionsQcm(this, i)
          texte += monQcm.texte
          if (choix === 'a') {
            texteCorr =
              monQcm.texteCorr +
              `La fonction $${nom}$ ${texteEnCouleurEtGras('est')} une fonction polynôme du second degré. <br>
                  $${nom}(x)$ est de la forme $a(x-\\alpha)^2+\\beta$ avec $a=${a}$, $\\alpha=${-alpha}$ et $\\beta=${beta}$. <br> Il s'agit de la forme canonique d'une fonction polynôme du second degré. `
          } else if (choix === 'b') {
            texteCorr =
              monQcm.texteCorr +
              `La fonction $${nom}$ ${texteEnCouleurEtGras('est')} une fonction polynôme du second degré. <br>
                  $${nom}(x)$ est de la forme $a(x-\\alpha)^2+\\beta$ avec $a=${a}$, $\\alpha=${-alpha}$ et $\\beta=0$. <br> Il s'agit de la forme canonique d'une fonction polynôme du second degré. `
          } else {
            texteCorr =
              monQcm.texteCorr +
              `La fonction $${nom}$ ${texteEnCouleurEtGras('est')} une fonction polynôme du second degré. <br>
                    $${nom}(x)$ est de la forme $a(x-\\alpha)^2+\\beta$ avec $a=1$, $\\alpha=${-alpha}$ et $\\beta=0$. <br> Il s'agit de la forme canonique d'une fonction polynôme du second degré. `
          }
          break

        case 4: // forme developpe pas ok
          a = randint(-3, 3, 0)
          b = randint(-9, 9, 0)
          c = randint(-9, 9, 0)
          d = choice([5, 7])
          nom = choice(nomF)
          choix = choice(['a', 'b', 'c', 'd'])
          if (choix === 'a') {
            texte = `Soit $${nom}$ la fonction définie par :<br>
              $${nom}(x)=${reduirePolynomeDegre3(a, b, c, 0)}$. <br>
              $${nom}$ est une fonction polynôme du second degré.`
            this.canEnonce = texte
          } else if (choix === 'b') {
            texte = `Soit $${nom}$ la fonction définie par :<br>
              $${nom}(x)=${b}${ecritureAlgebriqueSauf1(c)}x^3$. <br>
              $${nom}$ est une fonction polynôme du second degré.`
            this.canEnonce = texte
          } else if (choix === 'c') {
            texte = `Soit $${nom}$ la fonction définie par :<br>
              $${nom}(x)=${rienSi1(a)}x^2${ecritureAlgebriqueSauf1(b)}x+\\dfrac{${abs(c)}}{x}$. <br>
              $${nom}$ est une fonction polynôme du second degré.`
            this.canEnonce = texte
          } else {
            texte = `Soit $${nom}$ la fonction définie par :<br>
              $${nom}(x)=${rienSi1(a)}x^2${ecritureAlgebriqueSauf1(b)}\\sqrt{x}${ecritureAlgebrique(c)}$. <br>          
              $${nom}$ est une fonction polynôme du second degré.`
            this.canEnonce = texte
          }

          this.autoCorrection[i] = {
            enonce: texte,
            propositions: [
              {
                texte: 'Vrai',
                statut: a > 10,
              },
              {
                texte: 'Faux',
                statut: a < 10,
              },
            ],
            options: { ordered: true },
          }
          monQcm = propositionsQcm(this, i)
          texte += monQcm.texte

          if (choix === 'a') {
            texteCorr =
              monQcm.texteCorr +
              `La fonction $${nom}$ ${texteEnCouleurEtGras("n'est pas")} une fonction polynôme du second degré. <br>
              $${nom}(x)$ est une fonction polynôme du troisième degré. `
          } else if (choix === 'b') {
            texteCorr =
              monQcm.texteCorr +
              `La fonction $${nom}$ ${texteEnCouleurEtGras("n'est pas")} une fonction polynôme du second degré. <br>
              $${nom}(x)$ est une fonction polynôme du troisième degré. `
          } else if (choix === 'c') {
            texteCorr =
              monQcm.texteCorr +
              `La fonction $${nom}$ ${texteEnCouleurEtGras("n'est pas")} une fonction polynôme du second degré. <br>
             L'expression $${nom}(x)$ contient une division par $x$. `
          } else {
            texteCorr =
              monQcm.texteCorr +
              `La fonction $${nom}$ ${texteEnCouleurEtGras('est')} une fonction polynôme du second. <br>
              L'expression $${nom}(x)$ contient une racine carrée de $x$. `
          }
          break

        case 5: // forme factorisee pas ok
          a = randint(-3, 3, 0)
          x1 = randint(-9, 9, 0)
          x2 = randint(-9, 9, [0, x1])
          nom = choice(nomF)
          choix = choice(['a', 'b']) //, 'b', 'c', 'd'
          if (choix === 'a') {
            texte = `Soit $${nom}$ la fonction définie par :<br>
                    $${nom}(x)=${rienSi1(a)}x(x${ecritureAlgebrique(x1)})(x${ecritureAlgebrique(x2)})$. <br>          
                    $${nom}$ est une fonction polynôme du second degré.`
            this.canEnonce = texte
          } else {
            texte = `Soit $${nom}$ la fonction définie par :<br>
                  $${nom}(x)=${rienSi1(a)}x(\\sqrt{x}${ecritureAlgebrique(x1)})(x${ecritureAlgebrique(x2)})$. <br>            
                  $${nom}$ est une fonction polynôme du second degré.`
            this.canEnonce = texte
          }

          this.autoCorrection[i] = {
            enonce: texte,
            propositions: [
              {
                texte: 'Vrai',
                statut: a > 10,
              },
              {
                texte: 'Faux',
                statut: a < 10,
              },
            ],
            options: { ordered: true },
          }
          monQcm = propositionsQcm(this, i)
          texte += monQcm.texte

          if (choix === 'a') {
            texteCorr =
              monQcm.texteCorr +
              `La fonction $${nom}$ ${texteEnCouleurEtGras("n'est pas")} une fonction polynôme du second degré. <br>
                   En développant l'expression, on obtient une fonction polynôme du troisième degré. `
          } else {
            texteCorr =
              monQcm.texteCorr +
              `La fonction $${nom}$ ${texteEnCouleurEtGras("n'est pas")} une fonction polynôme du second degré. <br>
                  L'expression $${nom}(x)$ contient une racine carrée de $x$. `
          }

          break

        case 6: // "forme canonique" pas ok
          a = randint(-5, 5, 0)
          alpha = randint(-9, 9, 0)
          beta = randint(-9, 9, 0)
          nom = choice(nomF)
          choix = choice(['a', 'b', 'c']) //, 'b', 'c'
          if (choix === 'a') {
            texte = `Soit $${nom}$ la fonction définie par :<br>
                            $${nom}(x)=${rienSi1(a)}x(x${ecritureAlgebrique(alpha)})^2${ecritureAlgebrique(beta)}$. <br>                
                            $${nom}$ est une fonction polynôme du second degré.`
            this.canEnonce = texte
          } else if (choix === 'b') {
            texte = `Soit $${nom}$ la fonction définie par :<br>
                            $${nom}(x)=${rienSi1(a)}(x${ecritureAlgebrique(alpha)})^2+\\sqrt{x}$. <br>
                            $${nom}$ est une fonction polynôme du second degré.`
            this.canEnonce = texte
          } else {
            texte = `Soit $${nom}$ la fonction définie par :<br>
                              $${nom}(x)=${rienSi1(a)}(\\sqrt{x}${ecritureAlgebrique(alpha)})^2${ecritureAlgebrique(beta)}$. <br>         
                              $${nom}$ est une fonction polynôme du second degré.`
            this.canEnonce = texte
          }

          this.autoCorrection[i] = {
            enonce: texte,
            propositions: [
              {
                texte: 'Vrai',
                statut: a > 10,
              },
              {
                texte: 'Faux',
                statut: a < 10,
              },
            ],
            options: { ordered: true },
          }
          monQcm = propositionsQcm(this, i)
          texte += monQcm.texte

          if (choix === 'a') {
            texteCorr =
              monQcm.texteCorr +
              `La fonction $${nom}$ ${texteEnCouleurEtGras("n'est pas")} une fonction polynôme du second degré. <br>
                      En développant l'expression, on obtient une fonction polynôme du troisième degré. `
          } else if (choix === 'b') {
            texteCorr =
              monQcm.texteCorr +
              `La fonction $${nom}$ ${texteEnCouleurEtGras("n'est pas")} une fonction polynôme du second degré. <br>
                      L'expression $${nom}(x)$ contient une racine carrée de $x$. `
          } else {
            texteCorr =
              monQcm.texteCorr +
              `La fonction $${nom}$ ${texteEnCouleurEtGras("n'est pas")} une fonction polynôme du second degré. <br>
                        L'expression $${nom}(x)$ contient une racine carrée de $x$. `
          }

          break
      }

      if (this.questionJamaisPosee(i, a, x1, x2, b, c, alpha, beta)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr

        this.canReponseACompleter = monQcm.texte
        this.listeCanEnonces.push(this.canEnonce)
        this.listeCanReponsesACompleter.push(this.canReponseACompleter)
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
