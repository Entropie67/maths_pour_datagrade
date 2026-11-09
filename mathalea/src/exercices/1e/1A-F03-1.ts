import { choice } from '../../lib/outils/arrayOutils'
import {
  reduireAxPlusB,
  reduireAxPlusByPlusC,
  rienSi1,
} from '../../lib/outils/ecritures'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'
export const dateDePublication = '28/07/2025'
export const uuid = '4c3c0'

export const refs = {
  'fr-fr': ['1A-F03-1', '2A-F3-1'],
  'fr-ch': ['1mQCM-52'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Reconnaître une fonction affine ($1$)'
export default class AutoF3 extends ExerciceQcmA {
  versionOriginale: () => void = () => {
    this.enonce = `On considère les trois fonctions définies sur $\\mathbb{R}$ par : <br>
    $f_1\\,:\\,x \\longmapsto x^2-(1-x)^2$${sp(8)}$f_2\\,:\\,x \\longmapsto \\dfrac{x}{2}-\\left(1+\\dfrac{1}{\\sqrt{2}}\\right)$${sp(8)}$f_3\\,:\\,x \\longmapsto\\dfrac{5-\\dfrac{2}{3}x}{0,7}$<br>

    On peut affirmer que :`
    this.correction = `En développant, on obtient :<br> 
    $\\begin{aligned}
    f_1(x)&=x^2-(1-x)^2\\\\
    &=x^2-(1-2x+x^2)\\\\
    &=2x-1
    \\end{aligned}$<br>
    On retrouve une forme $mx+p$ avec $m=2$ et $p=-1$, donc $f_1$ est une fonction affine.<br><br>
    
$f_2$ est une fonction affine avec $m=\\dfrac{1}{2}$ et $p=-\\left(1+\\dfrac{1}{\\sqrt{2}}\\right)$.<br><br>

 $\\begin{aligned}
    f_3(x)&=\\dfrac{5-\\dfrac{2}{3}x}{0,7}\\\\
    &=-\\dfrac{2}{2,1}x+\\dfrac{5}{0,7}
    \\end{aligned}$<br>
    On retrouve une forme $mx+p$ avec $m=-\\dfrac{2}{2,1}$ et $p=\\dfrac{5}{0,7}$, donc $f_3$ est une fonction affine.<br><br>
    `

    this.reponses = [
      'Toutes ces fonctions sont affines.',
      "Aucune de ces fonctions n'est affine.",
      'Uniquement la fonction $f_1$ est affine.',
      'Uniquement les fonctions $f_2$ et $f_3$ sont affines.',
    ]
  }

  versionAleatoire = () => {
    const cas = randint(1, 4)
    const cours =
      "On cherche si les fonctions $f$ peuvent s'écrire sous la forme $f(x)=mx+p$.<br>"
    switch (cas) {
      case 1: // Toutes ces fonctions sont affines
        {
          // Pour f1 : ax² - (ax + b)(x - c) = ax² - (ax² - acx + bx - bc) = (ac - b)x + bc
          const a1 = randint(2, 5)
          const b1 = randint(1, 4)
          const c1 = randint(2, 4)

          const a2 = randint(1, 3)

          const num2 = randint(4, 12)
          const b2 = num2 + choice([-1, 1])

          const a3 = choice([1, 3])
          const b3 = choice([1, 2])
          const c3 = choice([3, 5, 7, 9])
          const denom3 = choice([0.7, 0.9, 0.5, 0.6])

          this.enonce = `On considère les trois fonctions définies par : <br>
        $f_1\\,:\\,x \\longmapsto ${reduireAxPlusB(a1, 0, 'x^2')}-(${reduireAxPlusB(a1, b1)})(x-${c1})$${sp(8)}$f_2\\,:\\,x \\longmapsto \\dfrac{${reduireAxPlusB(a2 * b2, num2)}}{${b2}}$${sp(8)}$f_3\\,:\\,x \\longmapsto\\dfrac{${a3}-\\dfrac{${b3}}{${c3}}x}{${texNombre(denom3, 1)}}$<br>

        On peut affirmer que :`

          this.correction =
            cours +
            ` $\\bullet$ En développant, on obtient :<br> 
        $\\begin{aligned}
        f_1(x)&=${reduireAxPlusB(a1, 0, 'x^2')}-(${reduireAxPlusB(a1, b1)})(x-${c1})\\\\
        &=${reduireAxPlusB(a1, 0, 'x^2')}-(${reduireAxPlusB(a1, 0, 'x^2')}-${reduireAxPlusB(a1 * c1, 0)}+${reduireAxPlusB(b1, 0)}-${b1 * c1})\\\\
        &=${reduireAxPlusB(a1, 0, 'x^2')}-${reduireAxPlusB(a1, 0, 'x^2')}+${reduireAxPlusB(a1 * c1, 0)}-${reduireAxPlusB(b1, 0)}+${b1 * c1}\\\\
        &=${reduireAxPlusB(a1 * c1 - b1, b1 * c1)}
        \\end{aligned}$<br>
        On retrouve une forme $mx+p$, donc $f_1$ est une fonction affine.<br>
        
         $\\bullet$ $f_2(x)=\\dfrac{${reduireAxPlusB(a2 * b2, num2)}}{${b2}}=${reduireAxPlusB(a2, 0)}+\\dfrac{${num2}}{${b2}}$<br>
        $f_2$ est une fonction affine.<br>

        $\\bullet$ $f_3(x)=\\dfrac{${a3}-\\dfrac{${b3}}{${c3}}x}{${texNombre(denom3, 1)}}=-\\dfrac{${b3}}{${texNombre(c3 * denom3, 1)}}x+\\dfrac{${a3}}{${texNombre(denom3, 1)}}$<br>
        $f_3$ est une fonction affine.<br>
${texteEnCouleurEtGras('Toutes ces fonctions sont affines.')}`
          this.reponses = [
            'Toutes ces fonctions sont affines.',
            "Aucune de ces fonctions n'est affine.",
            'Uniquement la fonction $f_1$ est affine.',
            'Uniquement les fonctions $f_2$ et $f_3$ sont affines.',
          ]
        }
        break

      case 2: // Aucune de ces fonctions n'est affine
        {
          const a1 = randint(2, 5)
          const b1 = randint(1, 4)
          const c1 = randint(2, 6)

          const a2 = randint(3, 7)

          const a3 = randint(2, 5)
          const b3 = randint(3, 8)

          this.enonce = `On considère les trois fonctions définies par : <br>
        $f_1\\,:\\,x \\longmapsto \\dfrac{${reduireAxPlusB(a1, b1)}}{x}$${sp(8)}$f_2\\,:\\,x \\longmapsto ${a2}\\sqrt{x}-${c1}$${sp(8)}$f_3\\,:\\,x \\longmapsto\\dfrac{${a3}}{x}+${b3}$<br>

        On peut affirmer que :`

          this.correction =
            cours +
            ` $\\bullet$ $f_1(x)=\\dfrac{${reduireAxPlusB(a1, b1)}}{x}=${a1}+\\dfrac{${b1}}{x}$<br>
        Après simplification, cette fonction contient un terme en $\\dfrac{1}{x}$, elle n'est donc pas affine.<br>
        
         $\\bullet$ $f_2(x)=${a2}\\sqrt{x}-${c1}$<br>
        Cette fonction contient un terme en $\\sqrt{x}$, elle n'est donc pas affine.<br>

        $\\bullet$ $f_3(x)=\\dfrac{${a3}}{x}+${b3}$<br>
        Cette fonction contient un terme en $\\dfrac{1}{x}$, elle n'est donc pas affine.<br>
${texteEnCouleurEtGras("Aucune de ces fonctions n'est affine.")}`
          this.reponses = [
            "Aucune de ces fonctions n'est affine.",
            'Toutes ces fonctions sont affines.',
            'Uniquement la fonction $f_1$ est affine.',
            'Uniquement les fonctions $f_2$ et $f_3$ sont affines.',
          ]
        }
        break

      case 3: // Uniquement la fonction f_1 est affine
        {
          // Pour f1 : ax² - (x + b)(x - c) = ax² - (x² - cx + bx - bc) = (a-1)x² + (c-b)x + bc
          // Pour que ce soit affine, il faut a = 1
          const b1 = randint(2, 5)
          const c1 = randint(3, 7, b1)

          const a2 = randint(2, 5)
          const b2 = randint(3, 7)

          const a3 = randint(2, 4)
          const b3 = randint(3, 8)

          this.enonce = `On considère les trois fonctions définies par : <br>
        $f_1\\,:\\,x \\longmapsto x^2-(x+${b1})(x-${c1})$${sp(8)}$f_2\\,:\\,x \\longmapsto ${a2}\\sqrt{x}+${b2}$${sp(8)}$f_3\\,:\\,x \\longmapsto\\dfrac{${a3}}{x}-${b3}$<br>

        On peut affirmer que :`

          this.correction =
            cours +
            ` $\\bullet$ En développant, on obtient :<br> 
        $\\begin{aligned}
        f_1(x)&=x^2-(x+${b1})(x-${c1})\\\\
        &=x^2-(x^2-${c1}x+${reduireAxPlusB(b1, 0)}-${b1 * c1})\\\\
        &=x^2-x^2+${c1}x-${reduireAxPlusB(b1, 0)}+${b1 * c1}\\\\
        &=${reduireAxPlusB(c1 - b1, b1 * c1)}
        \\end{aligned}$<br>
        On retrouve une forme $mx+p$, donc $f_1$ est une fonction affine.<br>
        
         $\\bullet$ $f_2(x)=${a2}\\sqrt{x}+${b2}$<br>
        Cette fonction contient un terme en $\\sqrt{x}$, elle n'est donc pas affine.<br>

         $\\bullet$ $f_3(x)=\\dfrac{${a3}}{x}-${b3}$<br>
        Cette fonction contient un terme en $\\dfrac{1}{x}$, elle n'est donc pas affine.<br>
        ${texteEnCouleurEtGras('Uniquement la fonction ')}$${miseEnEvidence('f_1')}$${texteEnCouleurEtGras(' est affine.')}`
          this.reponses = [
            'Uniquement la fonction $f_1$ est affine.',
            'Toutes ces fonctions sont affines.',
            "Aucune de ces fonctions n'est affine.",
            'Uniquement les fonctions $f_2$ et $f_3$ sont affines.',
          ]
        }
        break

      case 4: // Uniquement les fonctions f_2 et f_3 sont affines
        {
          const a1 = randint(2, 5)
          const b1 = randint(3, 7)

          // Pour f2 : ax² - a(x-b)(x+c) = ax² - a(x² + cx - bx - bc) = ax² - ax² - acx + abx + abc = a(b-c)x + abc
          const a2 = randint(2, 4)
          const b2 = randint(3, 6)
          const c2 = randint(1, 5)

          const a3 = randint(4, 9)
          const b3 = randint(2, 5)
          const c3 = randint(21, 29) / 100

          this.enonce = `On considère les trois fonctions définies sur leur domaine de définition par : <br>
        $f_1\\,:\\,x \\longmapsto ${reduireAxPlusByPlusC(a1, 0, b1, 'x^2')}$${sp(8)}$f_2\\,:\\,x \\longmapsto ${reduireAxPlusB(a2, 0, 'x^2')}-${rienSi1(a2)}(x-${b2})(x+${c2})$${sp(8)}$f_3\\,:\\,x \\longmapsto\\dfrac{${a3}+${reduireAxPlusB(b3, 0)}}{${texNombre(c3, 2)}}$<br>

        On peut affirmer que :`

          this.correction =
            cours +
            ` $\\bullet$ $f_1(x)=${reduireAxPlusByPlusC(a1, 0, b1, 'x^2')}$<br>
        Cette fonction contient un terme en $x^2$, elle n'est donc pas affine.<br>
        
         $\\bullet$ En développant, on obtient :<br> 
        $\\begin{aligned}
        f_2(x)&=${reduireAxPlusB(a2, 0, 'x^2')}-${rienSi1(a2)}(x-${b2})(x+${c2})\\\\
        &=${reduireAxPlusB(a2, 0, 'x^2')}-${rienSi1(a2)}(x^2+${reduireAxPlusB(c2, 0)}-${reduireAxPlusB(b2, 0)}-${b2 * c2})\\\\
        &=${reduireAxPlusB(a2, 0, 'x^2')}-${reduireAxPlusB(a2, 0, 'x^2')}-${reduireAxPlusB(a2 * c2, 0)}+${reduireAxPlusB(a2 * b2, 0)}+${a2 * b2 * c2}\\\\
        &=${a2 * (b2 - c2)}x+${a2 * b2 * c2}
        \\end{aligned}$<br>
        On retrouve une forme $mx+p$, donc $f_2$ est une fonction affine.<br>

       $\\bullet$ $f_3(x)=\\dfrac{${a3}+${reduireAxPlusB(b3, 0)}}{${texNombre(c3, 2)}}=\\dfrac{${b3}}{${texNombre(c3, 2)}}x+\\dfrac{${a3}}{${texNombre(c3, 2)}}$<br>
        On retrouve une forme $mx+p$, donc $f_3$ est une fonction affine.<br>
        ${texteEnCouleurEtGras('Uniquement les fonctions ')}$${miseEnEvidence('f_2')}$${texteEnCouleurEtGras(' et ')}$${miseEnEvidence('f_3')}$${texteEnCouleurEtGras(' sont affines.')}`

          this.reponses = [
            'Uniquement les fonctions $f_2$ et $f_3$ sont affines.',
            'Toutes ces fonctions sont affines.',
            "Aucune de ces fonctions n'est affine.",
            'Uniquement la fonction $f_1$ est affine.',
          ]
        }
        break
    }
  }

  nouvelleVersion() {
    this.sansLettreCorrection = true
    super.nouvelleVersion()
  }

  constructor() {
    super()
    this.versionAleatoire()
    this.options.vertical = true
  }
}
