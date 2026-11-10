import { bleuMathalea } from '../../lib/colors'
import { combinaisonListes, shuffle } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
  ecritureAlgebriqueSauf1,
  rienSi1,
} from '../../lib/outils/ecritures'
import {
  texteEnCouleur,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
import { texNombre } from '../../lib/outils/texNombre'

export const titre = "Tester si un nombre est solution d'une équation"
export const dateDeModificationImportante = '13/01/2026' // Correction de la rédaction Jean-claude Lhote

/**
 * Tester si un nombre est solution d'une équation
 * * adaptation de l'exo 5L14 de Rémi Angot
 * @author Sébastien Lozano
 */
export const uuid = 'a1c9a'

export const refs = {
  'fr-fr': ['4L14-0', 'BP2RES4'],
  'fr-ch': ['10LCFA5B-1', '10LSFA5B-1', '11CTFA4B-1', 'PRQST03B-3', 'PRQAL04B-1', 'PRQAL05A-3', '11LSFA4E-1'],
}

/**
 * Tester une égalité pour 2 valeurs données (une vraie et une fausse)
 *
 * * 1) 3x-a=2x+b  =>  x=a+b
 * * 2) 3x+a=5x-b  => x=(a+b)/2
 * * 3) 10(x-a)=4(2x+b) => x=(10a+4b)/2
 * * 4) ax+b=(a+1)x-c => x=b+c
 * * 5) a-2x=b+2x => x=(a-b)/4
 * * 6) ax-ab=x²-bx => (a-x)(x-b)=0 solutions a et b
 * * 7) adx-bd=acx²-bcx  => (ax-b)(d-cx)=0 solutions b/a et d/c.
 * * 8) 12x-4a=4(2x+b) => x=(4a+4b)/4
 * * 9) x²-bx-ax+ab=0 => (a-x)(x-b)=0 solutions a et b.
 */

export default class TesterSiUnNombreEstSolutionDUneEquation extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      2,
      '1 : Entiers naturels\n2 : Entiers relatifs',
    ]
    this.besoinFormulaire2Texte = [
      'Choix des équations',
      'Nombres séparés par des tirets :\n1 : 3x-a=2x+b\n2 : 3x+a=5x-b\n3 : 10(x-a)=4(2x+b)\n4 : ax+b=(a+1)x-c\n5 : a-2x=b+2x\n6 : ax-ab=x²-bx\n7 : adx-bd=acx²-bcx\n8 : 2x-4a=4(2x+b)\n9 : x²-bx-ax+ab=0\n10 : Mélange\n',
    ]
    this.sup = 1
    this.nbQuestions = 4
    this.sup2 = '1-2-3-4-5-6-7-8-9'
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      min: 1,
      max: 9,
      melange: 10,
      defaut: 10,
      nbQuestions: this.nbQuestions,
    })

    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posées mais l'ordre diffère à chaque "cycle"

    // let listeTypeDeQuestions = combinaisonListesSansChangerOrdre(typesDeQuestionsDisponibles,this.nbQuestions) // Tous les types de questions sont posées --> à remettre comme ci-dessus
    this.consigne =
      "Justifier si les nombres proposés sont des solutions de l'équation donnée ou non."

    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      let a, b, c, d, x1, x2, x3
      switch (listeTypeDeQuestions[i]) {
        case 1: // 3x-a=2x+b  =>  x=a+b
          if (this.sup === 1) {
            a = randint(1, 6)
            b = randint(1, 6, [a])
            x2 = a + b
            x1 = randint(2, 10, [x2])
          } else {
            a = randint(-6, 6, [0])
            b = randint(-6, 6, [a, 0])
            x2 = a + b
            x1 = randint(-10, 10, [0, x2])
          }

          texte = `$3x-${ecritureParentheseSiNegatif(a)}=2x${ecritureAlgebrique(
            b,
          )}~$ pour $~x=${x1}~$ puis pour $~x=${x2}$`
          texteCorr = `Pour $x=${x1}$ : <br>`
          texteCorr += `$3x-${ecritureParentheseSiNegatif(
            a,
          )}=3\\times ${ecritureParentheseSiNegatif(
            x1,
          )}${ecritureAlgebrique(-a)}=${3 * x1 - a}$<br>
           $2x${ecritureAlgebrique(b)}=2\\times${ecritureParentheseSiNegatif(
             x1,
           )} ${ecritureAlgebrique(
             b,
           )}=${2 * x1}${ecritureAlgebrique(b)}=${2 * x1 + b}$<br>`
          texteCorr += `$${3 * x1 - a}\\not=${2 * x1 + b}$ donc l'égalité n'est pas vraie.<br>`
          texteCorr += `${texteEnCouleur(
            `$x=${x1}$ ${texteEnCouleurEtGras("n'est donc pas solution")} de l'équation $3x${ecritureAlgebrique(-a)}=2x${ecritureAlgebrique(b)}~$`,
            bleuMathalea,
          )}<br><br>`
          texteCorr += `Pour $x=${ecritureParentheseSiNegatif(x2)}$ : <br>`
          texteCorr += `$3x-${ecritureParentheseSiNegatif(
            a,
          )}=3\\times ${ecritureParentheseSiNegatif(
            x2,
          )}${ecritureAlgebrique(-a)}=${3 * x2 - a}$ <br> $2x${ecritureAlgebrique(
            b,
          )}=2\\times ${ecritureParentheseSiNegatif(
            x2,
          )}${ecritureAlgebrique(b)}=${2 * x2 + b}$<br>`
          texteCorr +=
            "On trouve le même résultat pour le membre de gauche et pour le membre de droite donc l'égalité est vraie.<br>"
          texteCorr += `${texteEnCouleur(
            `$x=${x2}$ ${texteEnCouleurEtGras('est donc solution')} de l'équation $3x${ecritureAlgebrique(
              -a,
            )}=2x${ecritureAlgebrique(b)}~$`,
            bleuMathalea,
          )}`
          break
        case 2: // 3x+a=5x-b  => x=(a+b)/2 donc a et b impairs pour une solution entière
          if (this.sup === 1) {
            a = randint(1, 9)
            b = randint(0, 4) * 2 + (a % 2)
            x1 = (a + b) / 2
            x2 = randint(1, 9, x1)
          } else {
            a = randint(-9, 9, [0])
            b = randint(-4, 4, [a, 0]) * 2 + (a % 2)
            x1 = (a + b) / 2
            x2 = randint(-9, 9, [0, x1])
          }

          texte = `$3x${ecritureAlgebrique(a)}=5x-${ecritureParentheseSiNegatif(b)}~$ pour $~x=${x1}~$ puis pour $~x=${x2}$`
          texteCorr = `Pour $x=${x1}$ : <br>`
          texteCorr += `$3x${ecritureAlgebrique(a)}=3\\times ${ecritureParentheseSiNegatif(x1)}${ecritureAlgebrique(
            a,
          )}=${3 * x1}${ecritureAlgebrique(a)}=${3 * x1 + a}$<br>
           $5x-${ecritureParentheseSiNegatif(b)}=5\\times ${ecritureParentheseSiNegatif(x1)}${ecritureAlgebrique(
             -b,
           )}=${5 * x1}${ecritureAlgebrique(-b)}=${5 * x1 - b}$<br>`
          texteCorr +=
            "On trouve le même résultat pour le membre de gauche et pour le membre de droite donc l'égalité est vraie.<br>"
          texteCorr += `${texteEnCouleur(
            `$x=${x1}$ ${texteEnCouleurEtGras('est donc solution')} de l'équation $3x${ecritureAlgebrique(a)}=5x-${ecritureParentheseSiNegatif(b)}~$`,
            bleuMathalea,
          )}<br><br>`
          texteCorr += `Pour $x=${x2}$ : <br>`
          texteCorr += `$3x${ecritureAlgebrique(a)}=3\\times ${ecritureParentheseSiNegatif(x2)}${ecritureAlgebrique(
            a,
          )}=${3 * x2}${ecritureAlgebrique(a)}=${3 * x2 + a}$<br>
           $5x-${ecritureParentheseSiNegatif(b)}=5\\times ${ecritureParentheseSiNegatif(x2)}${ecritureAlgebrique(
             -b,
           )}=${5 * x2}${ecritureAlgebrique(-b)}=${5 * x2 - b}$<br>`
          texteCorr += `$${3 * x2 + a}\\not=${5 * x2 - b}$ donc l'égalité n'est pas vraie.<br>`
          texteCorr += `${texteEnCouleur(
            `$x=${x2}$ ${texteEnCouleurEtGras("n'est donc pas solution")} de l'équation $3x${ecritureAlgebrique(a)}=5x-${ecritureParentheseSiNegatif(b)}~$`,
            bleuMathalea,
          )}`
          break
        case 3: // 10(x-a)=4(2x+b) => x=(10a+4b)/2
          if (this.sup === 1) {
            a = randint(1, 3)
            b = randint(1, 3)
            x2 = (10 * a + 4 * b) / 2
            x1 = randint(1, 9, x2)
          } else {
            a = randint(-3, 3, [0])
            b = randint(-3, 3, [0])
            x2 = (10 * a + 4 * b) / 2
            x1 = randint(-9, 9, [0, x2])
          }

          texte = `$10\\Big(x-${ecritureParentheseSiNegatif(
            a,
          )}\\Big)=4(2x${ecritureAlgebrique(
            b,
          )})~$ pour $~x=${x1}~$ puis pour $~x=${x2}$`
          texteCorr = `Pour $x=${x1}$ : <br>`
          texteCorr += `$10\\Big(x-${ecritureParentheseSiNegatif(
            a,
          )}\\Big)=10\\times (${x1}${ecritureAlgebrique(-a)})=10\\times ${ecritureParentheseSiNegatif(x1 - a)}=${10 * (x1 - a)}$ <br> $4(2x${ecritureAlgebrique(
            b,
          )})=4\\times \\Big(2\\times ${ecritureParentheseSiNegatif(
            x1,
          )}${ecritureAlgebrique(b)}\\Big)=4\\times ${ecritureParentheseSiNegatif(2 * x1 + b)}=${4 * (2 * x1 + b)}$<br>`
          texteCorr += `$${10 * (x1 - a)}\\not=${4 * (2 * x1 + b)}$ donc l'égalité n'est pas vraie.<br>`
          texteCorr += `${texteEnCouleur(
            `$x=${x1}$ ${texteEnCouleurEtGras("n'est donc pas solution")} de l'équation $10\\Big(x-${ecritureParentheseSiNegatif(
              a,
            )}\\Big)=4(2x${ecritureAlgebrique(b)})~$`,
            bleuMathalea,
          )}<br><br>`
          texteCorr += `Pour $x=${x2}$ : <br>`
          texteCorr += `$10\\Big(x-${ecritureParentheseSiNegatif(
            a,
          )}\\Big)=10\\times (${ecritureParentheseSiNegatif(
            x2,
          )}${ecritureAlgebrique(-a)})=10\\times ${ecritureParentheseSiNegatif(x2 - a)}=${10 * (x2 - a)}$ <br> $4(2x${ecritureAlgebrique(
            b,
          )})=4\\times \\Big(2\\times ${ecritureParentheseSiNegatif(
            x2,
          )}${ecritureAlgebrique(b)}\\Big)=4\\times ${ecritureParentheseSiNegatif(2 * x2 + b)}=${4 * (2 * x2 + b)}$<br>`
          texteCorr +=
            "On trouve le même résultat pour le membre de gauche et pour le membre de droite donc l'égalité est vraie.<br>"
          texteCorr += `${texteEnCouleur(
            `$x=${x2}$ ${texteEnCouleurEtGras('est donc solution')} de l'équation $10\\Big(x-${ecritureParentheseSiNegatif(
              a,
            )}\\Big)=4(2x${ecritureAlgebrique(b)})~$`,
            bleuMathalea,
          )}`
          break
        case 4: // ax+b=(a+1)x-c => x=b+c
          do {
            if (this.sup === 1) {
              a = randint(2, 9)
              b = randint(2, 9)
              c = randint(1, 3)
              x1 = b + c
              x2 = randint(2, 10, x1)
            } else {
              a = randint(2, 9)
              b = randint(2, 9) * randint(-1, 1, 0)
              c = randint(1, 3) * randint(-1, 1, 0)
              x1 = b + c
              x2 = randint(2, 10, x1) * randint(-1, 1, 0)
            }
          } while (x1 === x2)

          texte = `$${ecritureParentheseSiNegatif(
            a,
          )}x${ecritureAlgebrique(b)}=${a + 1}x${ecritureAlgebrique(-c)}~$ pour $~x=${x1}~$ puis pour $~x=${x2}$`
          texteCorr = `Pour $x=${x1}$ : <br>`
          texteCorr += `$${rienSi1(a)}x${ecritureAlgebrique(b)}=${a}\\times ${ecritureParentheseSiNegatif(
            x1,
          )}${ecritureAlgebrique(b)}=${a * x1}${ecritureAlgebrique(b)}=${a * x1 + b}$ <br>
           $${a + 1}x${ecritureAlgebrique(-c)}=${a + 1}\\times ${ecritureParentheseSiNegatif(
             x1,
           )}${ecritureAlgebrique(-c)}=${(a + 1) * x1}${ecritureAlgebrique(-c)}=${(a + 1) * x1 - c}$<br>`
          texteCorr +=
            "On trouve le même résultat pour le membre de gauche et pour le membre de droite donc l'égalité est vraie.<br>"
          texteCorr += `${texteEnCouleur(
            `$x=${x1}$ ${texteEnCouleurEtGras('est donc solution')} de l'équation $${ecritureParentheseSiNegatif(
              a,
            )}x${ecritureAlgebrique(b)}=${a + 1}x${ecritureAlgebrique(-c)}~$`,
            bleuMathalea,
          )}<br><br>`
          texteCorr += `Pour $x=${x2}$ : <br>`
          texteCorr += `$${rienSi1(a)}x${ecritureAlgebrique(b)}=${a}\\times ${ecritureParentheseSiNegatif(
            x2,
          )}${ecritureAlgebrique(b)}=${a * x2}${ecritureAlgebrique(b)}=${a * x2 + b}$ <br>
           $${a + 1}x${ecritureAlgebrique(-c)}=${a + 1}\\times ${ecritureParentheseSiNegatif(
             x2,
           )}${ecritureAlgebrique(-c)}=${(a + 1) * x2}${ecritureAlgebrique(-c)}=${(a + 1) * x2 - c}$<br>`
          texteCorr += `$${a * x2 + b}\\not=${(a + 1) * x2 - c}$ donc l'égalité n'est pas vraie.<br>`
          texteCorr += `${texteEnCouleur(
            `$x=${x2}$ ${texteEnCouleurEtGras("n'est donc pas solution")} de l'équation $${ecritureParentheseSiNegatif(
              a,
            )}x${ecritureAlgebrique(b)}=${a + 1}x${ecritureAlgebrique(-c)}~$`,
            bleuMathalea,
          )}<br><br>`
          break
        case 5: // a-2x=b+2x => x=(a-b)/4
          if (this.sup === 1) {
            x1 = randint(1, 9)
            b = randint(1, 9)
            a = b + 4 * x1
            x2 = randint(1, 11, x1)
          } else {
            x1 = randint(-9, 9)
            b = randint(-9, 9, 0)
            a = b + 4 * x1
            x2 = randint(1, 11, x1)
          }

          texte = `$${a}-2x=${b}+2x~$ pour $~x=${x1}~$ puis pour $~x=${x2}$`
          texteCorr = `Pour $x=${x1}$ : <br>`
          texteCorr += `$${a}-2x=${a}-2\\times ${ecritureParentheseSiNegatif(
            x1,
          )}=${a}${ecritureAlgebrique(-2 * x1)}=${a - 2 * x1}$ <br> $${b}+2x=${b}+2\\times ${ecritureParentheseSiNegatif(
            x1,
          )}=${b}${ecritureAlgebrique(2 * x1)}=${b + 2 * x1}$<br>`
          texteCorr +=
            "On trouve le même résultat pour le membre de gauche et pour le membre de droite donc l'égalité est vraie.<br>"
          texteCorr += `${texteEnCouleur(
            `$x=${x1}$ ${texteEnCouleurEtGras('est donc solution')} de l'équation $${a}-2x=${b}+2x~$`,
            bleuMathalea,
          )}<br><br>`
          texteCorr += `Pour $x=${x2}$ : <br>`
          texteCorr += `$${a}-2x=${a}-2\\times ${ecritureParentheseSiNegatif(
            x2,
          )}=${a}${ecritureAlgebrique(-2 * x2)}=${a - 2 * x2}$ <br> $${b}+2x=${b}+2\\times ${ecritureParentheseSiNegatif(
            x2,
          )}=${b}${ecritureAlgebrique(2 * x2)}=${b + 2 * x2}$<br>`
          texteCorr += `$${a - 2 * x2}\\not=${b + 2 * x2}$ donc l'égalité n'est pas vraie.<br>`
          texteCorr += `${texteEnCouleur(
            `$x=${x2}$ ${texteEnCouleurEtGras("n'est donc pas solution")} de l'équation $${a}-2x=${b}+2x~$`,
            bleuMathalea,
          )}<br><br>`
          break
        case 6: // ax-ab=x²-bx => (a-x)(x-b)=0 solutions a et b.
          if (this.sup === 1) {
            b = randint(2, 9)
            a = randint(2, 9, [b])
            x3 = b
            x1 = a
            x2 = randint(1, 9, [x1, x3])
          } else {
            a = randint(-9, 9, [0, 1])
            b = randint(-9, 9, [0, a])
            x1 = a
            x3 = b
            x2 = randint(-9, 9, [x1, x3])
          }
          ;[x1, x2, x3] = shuffle([x1, x2, x3])
          texte = `$${rienSi1(a)}x${ecritureAlgebrique(-1 * a * b)}=x^2${ecritureAlgebriqueSauf1(-1 * b)}x~$ pour $~x=${x1}~$, pour $~x=${x2}~$ puis pour $~x=${x3}$`

          texteCorr = testOneValueForCase6(x1, a, b)
          texteCorr += testOneValueForCase6(x2, a, b)
          texteCorr += testOneValueForCase6(x3, a, b)
          break
        case 7: // adx-bd=acx²-bcx  => (ax-b)(d-cx)=0 solutions b/a et d/c.
          if (this.sup === 1) {
            c = randint(2, 5)
            a = randint(2, 5)
            x2 = randint(2, 6)
            x3 = randint(2, 6, x2)
            x1 = randint(1, 7, [x2, x3])
            b = a * x2
            d = c * x3
          } else {
            c = randint(2, 5) * randint(-1, 1, 0)
            a = randint(2, 5) * randint(-1, 1, 0)
            x2 = randint(1, 6) * randint(-1, 1, 0)
            x3 = randint(-6, 6, [x2, 0, 1])
            x1 = randint(-7, 7, [0, 1, x2, x3])
            b = a * x2
            d = c * x3
          }
          ;[x1, x2, x3] = shuffle([x1, x2, x3])

          texte = `$${rienSi1(a * d)}x${ecritureAlgebrique(-1 * b * d)}=${rienSi1(a * c)}x^2${ecritureAlgebriqueSauf1(-1 * b * c)}x~$ pour $~x=${x1}~$, pour $~x=${x2}~$ puis pour $~x=${x3}$`

          texteCorr = testOneValueForCase7(x1, a, d, b, c)
          texteCorr += testOneValueForCase7(x2, a, d, b, c)
          texteCorr += testOneValueForCase7(x3, a, d, b, c)
          break
        case 8: // 12x-4a=4(2x+b) => x=a+b
          if (this.sup === 1) {
            a = randint(1, 3)
            b = randint(1, 3)
            x2 = a + b
            x1 = randint(9, x2)
          } else {
            a = randint(-3, 3, [0])
            b = randint(-3, 3, [0, -a])
            x2 = a + b
            x1 = randint(-9, 9, [0, x2])
          }

          texte = `$12x-${ecritureParentheseSiNegatif(4 * a)}=4(2x${ecritureAlgebrique(b)})~$ pour $~x=${x1}~$ puis pour $~x=${x2}$`
          texteCorr = `Pour $x=${x1}$ : <br>`
          texteCorr += `$12x-${ecritureParentheseSiNegatif(
            4 * a,
          )}=12\\times ${ecritureParentheseSiNegatif(
            x1,
          )}${ecritureAlgebrique(-4 * a)}=${12 * x1}${ecritureAlgebrique(-4 * a)}=${12 * x1 - 4 * a}$ <br>
           $4(2x${ecritureAlgebrique(
             b,
           )})=4\\times \\Big(2\\times ${ecritureParentheseSiNegatif(
             x1,
           )}${ecritureAlgebrique(b)}\\Big)=4\\times (${2 * x1}${ecritureAlgebrique(b)})=4\\times ${ecritureParentheseSiNegatif(2 * x1 + b)}=${4 * (2 * x1 + b)}$<br>`
          texteCorr += `$${12 * x1 - 4 * a}\\not=${4 * (2 * x1 + b)}$ donc l'égalité n'est pas vraie.<br>`
          texteCorr += `${texteEnCouleur(
            `$x=${x1}$ ${texteEnCouleurEtGras("n'est donc pas solution")} de l'équation $12x-${ecritureParentheseSiNegatif(4 * a)}=4(2x${ecritureAlgebrique(b)})~$`,
            bleuMathalea,
          )}<br><br>`
          texteCorr += `Pour $x=${x2}$ : <br>`
          texteCorr += `$12x-${ecritureParentheseSiNegatif(
            4 * a,
          )}=12\\times ${ecritureParentheseSiNegatif(
            x2,
          )}${ecritureAlgebrique(-4 * a)}=${12 * x2}${ecritureAlgebrique(-4 * a)}=${12 * x2 - 4 * a}$ <br> $4(2x${ecritureAlgebrique(
            b,
          )})=4\\times \\Big(2\\times ${ecritureParentheseSiNegatif(
            x2,
          )}${ecritureAlgebrique(b)}\\Big)=4\\times (${2 * x2}${ecritureAlgebrique(b)})=4\\times ${ecritureParentheseSiNegatif(2 * x2 + b)}=${4 * (2 * x2 + b)}$<br>`
          texteCorr +=
            "On trouve le même résultat pour le membre de gauche et pour le membre de droite donc l'égalité est vraie.<br>"
          texteCorr += `${texteEnCouleur(
            `$x=${x2}$ ${texteEnCouleurEtGras('est donc solution')} de l'équation $12x-${ecritureParentheseSiNegatif(4 * a)}=4(2x${ecritureAlgebrique(b)})~$`,
            bleuMathalea,
          )}<br><br>`
          break
        case 9: // x²-bx-ax+ab=0 => (a-x)(x-b)=0 solutions a et b.
        default:
          if (this.sup === 1) {
            b = randint(2, 9)
            a = randint(2, 9, a)
            x3 = b
            x1 = a
            x2 = randint(1, 9, [x1, x3])
          } else {
            do {
              a = randint(-9, 9, [0, 1])
              b = randint(-9, 9, [0, a, 1])
              x1 = a
              x3 = b
              x2 = randint(-9, 9, [x1, x3])
            } while (a + b === 0 || a + b === 1)
          }
          ;[x1, x2, x3] = shuffle([x1, x2, x3])

          texte = `$x^2${ecritureAlgebriqueSauf1(-1 * (b + a))}x${ecritureAlgebrique(a * b)}=0~$ pour $~x=${x1}~$, pour $~x=${x2}~$ puis pour $~x=${x3}$`

          texteCorr = testOneValueForCase9(x1, b, a)
          texteCorr += testOneValueForCase9(x2, b, a)
          texteCorr += testOneValueForCase9(x3, b, a)
          break
      }

      if (this.questionJamaisPosee(i, a, b, listeTypeDeQuestions[i])) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}

function testOneValueForCase6(x1: number, a: number, b: number) {
  let texteCorr = `Pour $x=${x1}$ : <br>`
  texteCorr += `$${rienSi1(a)}x${ecritureAlgebrique(-1 * a * b)}=
        ${a === -1 ? '-' : `${a}\\times`} ${ecritureParentheseSiNegatif(x1)}${ecritureAlgebrique(-1 * a * b)}=${a * x1 - a * b}$ <br>`
  texteCorr += `$x^2${ecritureAlgebriqueSauf1(-1 * b)}x=
        ${ecritureParentheseSiNegatif(x1)}^2${ecritureAlgebrique(-1 * b)}\\times ${ecritureParentheseSiNegatif(x1)}=${x1 * x1} ${ecritureAlgebrique(-1 * b * x1)} = ${x1 * x1 - b * x1}$<br>`

  if (a * x1 - a * b === x1 * x1 - b * x1) {
    texteCorr +=
      "On trouve le même résultat pour le membre de gauche et pour le membre de droite donc l'égalité est vraie.<br>"
    texteCorr += `${texteEnCouleur(
      `$x=${x1}$ ${texteEnCouleurEtGras('est donc solution')} de l'équation $${rienSi1(a)}x${ecritureAlgebrique(-1 * a * b)}=x^2${ecritureAlgebriqueSauf1(-1 * b)}x~$`,
      bleuMathalea,
    )}<br><br>`
  } else {
    texteCorr += `$${a * x1 - a * b}\\not=${x1 * x1 - b * x1}$ donc l'égalité n'est pas vraie.<br>`

    texteCorr += `${texteEnCouleur(
      `$x=${x1}$ ${texteEnCouleurEtGras("n'est donc pas solution")} de l'équation $${rienSi1(a)}x${ecritureAlgebrique(-1 * a * b)}=x^2${ecritureAlgebriqueSauf1(-1 * b)}x~$`,
      bleuMathalea,
    )}<br><br>`
  }
  return texteCorr
}

function testOneValueForCase7(
  x1: number,
  a: number,
  d: number,
  b: number,
  c: number,
) {
  let texteCorr = `Pour $x=${x1}$ : <br>`

  texteCorr += `$${rienSi1(a * d)}x${ecritureAlgebrique(-1 * b * d)}=
        ${a * d}\\times ${ecritureParentheseSiNegatif(x1)}${ecritureAlgebrique(-1 * b * d)}=${a * d * x1 - d * b}$ <br>`
  texteCorr += `$${rienSi1(a * c)}x^2${ecritureAlgebriqueSauf1(-1 * b * c)}x=
        ${a * c}\\times ${ecritureParentheseSiNegatif(x1)}^2${ecritureAlgebrique(-1 * b * c)}\\times ${ecritureParentheseSiNegatif(x1)}=
        ${texNombre(a * c * x1 * x1)}${ecritureAlgebrique(-b * c * x1)}=${a * c * x1 * x1 - b * c * x1}$<br>`

  if (a * d * x1 - d * b === a * c * x1 * x1 - b * c * x1) {
    texteCorr +=
      "On trouve le même résultat pour le membre de gauche et pour le membre de droite donc l'égalité est vraie.<br>"

    texteCorr += `${texteEnCouleur(
      `$x=${x1}$ ${texteEnCouleurEtGras('est donc solution')} de l'équation $${rienSi1(a * d)}x${ecritureAlgebrique(-1 * b * d)}=${rienSi1(a * c)}x^2${ecritureAlgebriqueSauf1(-1 * b * c)}x~$`,
      bleuMathalea,
    )}<br><br>`
  } else {
    texteCorr += `$${a * d * x1 - d * b}\\not=${a * c * x1 * x1 - b * c * x1}$ donc l'égalité n'est pas vraie.<br>`

    texteCorr += `${texteEnCouleur(
      `$x=${x1}$ ${texteEnCouleurEtGras("n'est donc pas solution")} de l'équation $${rienSi1(a * d)}x${ecritureAlgebrique(-1 * b * d)}=${rienSi1(a * c)}x^2${ecritureAlgebriqueSauf1(-1 * b * c)}x~$`,
      bleuMathalea,
    )}<br><br>`
  }
  return texteCorr
}

function testOneValueForCase9(x1: number, b: number, a: number) {
  let texteCorr = `Pour $x=${x1}$ : <br>`

  texteCorr += `$x^2${ecritureAlgebrique(-1 * (b + a))}\\times  x${ecritureAlgebrique(a * b)}=
        ${ecritureParentheseSiNegatif(x1)}^2${ecritureAlgebrique(-1 * (b + a))}\\times ${ecritureParentheseSiNegatif(x1)}${ecritureAlgebrique(a * b)}=
        ${x1 * x1}${ecritureAlgebrique(-1 * (a + b) * x1)}${ecritureAlgebrique(a * b)}=${x1 * x1 - (a + b) * x1 + a * b}$<br>`

  if (x1 * x1 - (a + b) * x1 + a * b === 0) {
    texteCorr +=
      "On trouve bien $0$ pour le membre de gauche donc l'égalité est vraie.<br>"

    texteCorr += `${texteEnCouleur(
      `$x=${x1}$ ${texteEnCouleurEtGras('est donc solution')} de l'équation $x^2${ecritureAlgebriqueSauf1(-1 * (b + a))}x${ecritureAlgebrique(a * b)}=0~$`,
      bleuMathalea,
    )}<br><br>`
  } else {
    texteCorr += `$${x1 * x1 - (a + b) * x1 + a * b}\\not=0$ donc l'égalité n'est pas vraie.<br>`

    texteCorr += `${texteEnCouleur(
      `$x=${x1}$ ${texteEnCouleurEtGras("n'est donc pas solution")} de l'équation $x^2${ecritureAlgebriqueSauf1(-1 * (b + a))}x${ecritureAlgebrique(a * b)}=0~$`,
      bleuMathalea,
    )}<br><br>`
  }
  return texteCorr
}
