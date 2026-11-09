import { propositionsQcm } from '../../lib/interactif/qcm'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
  rienSi1,
} from '../../lib/outils/ecritures'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const amcReady = true
export const amcType = 'qcmMono'
export const interactifReady = true

export const titre = "Étudier la parité d'une fonction par le calcul"
export const dateDeModifImportante = '19/06/2023'
/**
 * Calculer la parité d'une fonction
 * @author Stéphane Guyon+GillesMora
 * 2F35-2
 */
export const uuid = '1e362'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class EtudierPariteFonction extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = [1, 2, 3, 4, 5, 6]
    let bonneReponse

    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const typesDeQuestions = listeTypeDeQuestions[i]

      // i3 = math.max(i1, i2)
      let texte = ''
      let texteCorr = ''
      const variables: number[] = []
      switch (typesDeQuestions) {
        case 1:
          {
            // Cas f(x)=ax+b
            const a = randint(-5, 5, 0) // Pour définir fonctions
            const b = randint(-3, 3, 0) // Pour définir fonctions
            texte = `Soit $f$ la fonction définie sur  $D=\\mathbb{R}$, par $f(x)=${reduireAxPlusB(a, b)}$.<br>`
            if (this.interactif) {
              texte += ''
              texteCorr = ''
            } else {
              texte +=
                '<br>$\\textbf{a. }$ Déterminer, en expliquant, si la fonction $f$'
              texte += "est paire, impaire, ou ni l'une, ni l'autre. <br>"
              texte +=
                '$\\textbf{b. }$ En déduire des éventuelles propriétés graphiques de la représentation graphique de $f$.<br>'
              texteCorr = '$\\textbf{a. }$'
            }
            texteCorr = `$D=\\mathbb{R}$, en conséquence, pour tout $x\\in D$, $-x\\in D$.<br>
            L'ensemble de définition est bien symétrique par rapport à $0$.<br>`
            texteCorr += 'Soit $x\\in D$.<br>'
            texteCorr += `$\\bullet$ $f(-x)=${a}\\times (-x) ${ecritureAlgebrique(b)}=${reduireAxPlusB(-a, b)}$<br>`
            texteCorr +=
              "On observe que $f(-x)\\neq f(x)$, la fonction $f$ n'est donc pas paire.<br>"
            texteCorr += `$\\bullet$ $-f(x)=-(${reduireAxPlusB(a, b)})=${reduireAxPlusB(-a, -b)}$<br>`
            texteCorr +=
              "On observe que $f(-x)\\neq -f(x)$, la fonction $f$ n'est donc pas impaire.<br>"
            texteCorr += `On peut conclure que $f$ ${texteEnCouleurEtGras("n'est ni paire, ni impaire")}.<br>`
            texteCorr +=
              '$\\textbf{Autre méthode :}$ On aurait pu aussi trouver un contre exemple :<br>'
            texteCorr += `$f(1)=${a}+${ecritureParentheseSiNegatif(b)}=${a + b}$ alors que $f(-1)=-${ecritureParentheseSiNegatif(a)}${ecritureAlgebrique(b)}=${-a + b}$<br>`
            texteCorr += '$f(1)$ et $f(-1)$ ne sont ni égaux, ni opposés.<br>'
            texteCorr +=
              "On peut conclure que $f$ n'est ni paire, ni impaire.<br>"
            texteCorr += 'Attention avec cette deuxième méthode :<br>'
            texteCorr +=
              "Un contre-exemple suffit à prouver qu'une propriété est fausse, comme ici.<br>"
            texteCorr +=
              "Mais un exemple ne suffit pas à prouver qu'une propriété est vraie.<br><br>"
            if (!this.interactif) {
              texteCorr +=
                "<br>$\\textbf{b. }$  La fonction n'étant ni paire, ni impaire, on ne peut pas déduire de symétrie sur sa courbe représentative."
            }
            bonneReponse = "$f$ n'est ni paire ni impaire"
            variables.push(a, b)
          }
          break

        case 2:
          {
            // Cas f(x)=ax ou f(x)=b
            let a: number, b: number
            if (choice([true, false])) {
              a = randint(-10, 10, 0) // Pour définir fonctions
              b = 0
            } else {
              a = 0 // Pour définir fonctions
              b = randint(-10, 10, 0)
            }

            texte = `Soit $f$ la fonction définie sur  $D=\\mathbb{R}$, par $f(x)=${reduireAxPlusB(a, b)}$.<br>`
            if (this.interactif) {
              texte += ''
              texteCorr = ''
            } else {
              texte +=
                '$\\textbf{a. }$ Déterminer, en expliquant, si la fonction $f$'
              texte += "est paire, impaire, ou ni l'une, ni l'autre. <br>"
              texte +=
                '$\\textbf{b. }$ En déduire des éventuelles propriétés graphiques de la représentation graphique de $f$.<br>'
              texteCorr = '$\\textbf{a. }$'
            }

            if (b === 0) {
              texteCorr += `L'ensemble de définition est symétrique par rapport à $0$ et pour $x\\in\\mathbb{R}$,  $f(-x)=${ecritureAlgebrique(a)}\\times (-x) =${reduireAxPlusB(-a, 0)}$.<br>
            <br>
            On observe alors que $f(-x)= -f(x)$, la fonction $f$ est ${texteEnCouleurEtGras(' impaire')}.`
            } else {
              texteCorr += `L'ensemble de définition est symétrique par rapport à $0$ et pour $x\\in\\mathbb{R}$,  $f(-x)=${b}$.
          <br>
          On observe alors que $f(-x)= f(x)$, la fonction $f$ est ${texteEnCouleurEtGras(' paire')}.<br>`
            }

            if (!this.interactif) {
              if (b === 0) {
                texteCorr +=
                  "<br>$\\textbf{b. }$ La fonction $f$ étant impaire, on peut déduire que sa courbe représentative admet une symétrie centrale autour de l'origine du repère."
              } else {
                texteCorr +=
                  "$\\textbf{b. }$  La fonction étant paire, sa courbe représentative admet une symétrie par rapport à l'axe des ordonnées."
              }
            }

            if (a === 0) {
              bonneReponse = '$f$ est paire'
            } else {
              bonneReponse = '$f$ est impaire'
            }
            variables.push(a, b)
          }
          break

        case 3:
          {
            // Cas f(x)=ax^2+bx+c
            const a = randint(-5, 5, 0) // Pour définir fonctions
            const b = randint(-3, 3, 0) // Pour définir fonctions
            const c = randint(-8, 8, [0]) // Pour définir fonctions
            texte = `Soit $f$ la fonction définie sur  $D=\\mathbb{R}$, par $f(x)=${rienSi1(a)}x^2${ecritureAlgebriqueSauf1(b)}x${ecritureAlgebrique(c)}.$`
            if (this.interactif) {
              texte += ''
              texteCorr = ''
            } else {
              texte +=
                '<br>$\\textbf{a. }$ Déterminer, en expliquant, si la fonction $f$'
              texte += "est paire, impaire, ou ni l'une, ni l'autre. <br>"
              texte +=
                '$\\textbf{b. }$ En déduire des éventuelles propriétés graphiques de la représentation graphique de $f$.<br>'
              texteCorr = '$\\textbf{a. }$'
            }
            texteCorr += `$D=\\mathbb{R}$, en conséquence, pour tout $x\\in D$, $-x\\in D$.<br>
            L'ensemble de définition est bien symétrique par rapport à $0$.<br>`
            texteCorr += 'Soit $x\\in D$.<br>'
            texteCorr += `$\\bullet$ $f(-x)=${rienSi1(a)}(-x)^2${ecritureAlgebrique(b)}\\times (-x)${ecritureAlgebrique(c)}=${rienSi1(a)}x^2${ecritureAlgebriqueSauf1(-b)}x${ecritureAlgebrique(c)}.$<br>`
            texteCorr +=
              "On observe que $f(-x)\\neq f(x)$, la fonction $f$ n'est donc pas paire.<br>"
            texteCorr += `$\\bullet$ $-f(x)=-(${rienSi1(a)}x^2${ecritureAlgebriqueSauf1(b)}x${ecritureAlgebrique(c)})=${rienSi1(-a)}x^2${ecritureAlgebriqueSauf1(-b)}x${ecritureAlgebrique(-c)}$<br>`
            texteCorr +=
              "On observe alors que $f(-x)\\neq -f(x)$, la fonction $f$ n'est donc pas impaire.<br>"
            texteCorr += `On peut conclure que $f$ ${texteEnCouleurEtGras("n'est ni paire, ni impaire")}.<br>`
            texteCorr +=
              '$\\textbf{Autre méthode :}$ On aurait pu aussi trouver un contre exemple :<br>'
            texteCorr += `$f(1)=${a}\\times 1^2${ecritureAlgebrique(b)}\\times 1${ecritureAlgebrique(c)}=${a + b + c}$<br>`
            texteCorr += `$f(-1)=${a}\\times (-1)^2${ecritureAlgebrique(b)}\\times (-1)${ecritureAlgebrique(c)}=${a} ${ecritureAlgebrique(-b)} ${ecritureAlgebrique(c)} =${a - b + c}$<br>`
            texteCorr += '$f(1)$ et $f(-1)$ ne sont ni égaux, ni opposés.<br>'
            texteCorr +=
              "On peut conclure que $f$ n'est ni paire, ni impaire.<br>"
            texteCorr += 'Attention avec cette deuxième méthode :<br>'
            texteCorr +=
              "Un contre-exemple suffit à prouver qu'une propriété est fausse, comme ici.<br>"
            texteCorr +=
              "Mais un exemple ne suffit pas à prouver qu'une propriété est vraie.<br>"
            if (!this.interactif) {
              texteCorr +=
                "$\\textbf{b. }$  La fonction n'étant ni paire, ni impaire, on ne peut pas déduire de symétrie sur sa courbe représentative."
            }
            bonneReponse = "$f$ n'est ni paire ni impaire"
            variables.push(a, b, c)
          }
          break
        case 4:
          {
            // Cas f(x)=ax^2+c sur R
            const a = randint(-5, 5, 0) // Pour définir fonctions
            const c = randint(-8, 8, [0]) // Pour définir fonctions
            const i1 = randint(1, 10) // pour définir un intervalle symétrique

            texte = `Soit $f$ la fonction définie sur  $D=[${-i1};${i1}]$, par $f(x)=${rienSi1(a)}x^2${ecritureAlgebrique(c)}.$`
            if (this.interactif) {
              texte += ''
              texteCorr = ''
            } else {
              texte +=
                '<br>$\\textbf{a. }$ Déterminer, en expliquant, si la fonction $f$'
              texte += "est paire, impaire, ou ni l'une, ni l'autre. <br>"
              texte +=
                '$\\textbf{b. }$ En déduire des éventuelles propriétés graphiques de la représentation graphique de $f$.<br>'
              texteCorr = '$\\textbf{a. }$'
            }

            texteCorr += `La fonction est définie sur $D=[${-i1};${i1}]$ .<br>`
            texteCorr += 'En conséquence, pour tout $x\\in D$, $-x\\in D$.<br>'
            texteCorr +=
              "L'ensemble de définition est bien symétrique par rapport à $0$.<br>"
            texteCorr += 'Soit $x\\in D$.<br>'

            texteCorr += `$f(-x)=${rienSi1(a)}(-x)^2${ecritureAlgebrique(c)}=${rienSi1(a)}x^2${ecritureAlgebrique(c)}.$<br>`
            texteCorr += `On observe que pour tout $x\\in D$, $f(-x)= f(x)$, la fonction $f$ est donc ${texteEnCouleurEtGras('paire')}.<br>`
            if (!this.interactif) {
              texteCorr +=
                "<br>$\\textbf{b. }$ La fonction étant paire, sa courbe représentative admet une symétrie par rapport à l'axe des ordonnées."
            }
            bonneReponse = '$f$ est paire'
            variables.push(a, c, i1)
          }
          break
        case 5:
          {
            // Cas f(x)=ax^2+c sur I non-symétrique
            const a = randint(-5, 5, 0) // Pour définir fonctions
            const c = randint(-8, 8, [0]) // Pour définir fonctions
            const i1 = randint(1, 10) // pour définir un intervalle symétrique
            const i2 = randint(1, 10, [i1]) // pour définir un intervalle non-symétrique

            texte = `Soit $f$ la fonction définie sur  $D=[${-i2};${i1}]$ par $f(x)=${rienSi1(a)}x^2${ecritureAlgebrique(c)}.$`
            if (this.interactif) {
              texte += ''
              texteCorr = ''
            } else {
              texte +=
                '<br>$\\textbf{a. }$ Déterminer, en expliquant, si la fonction $f$'
              texte += "est paire, impaire, ou ni l'une, ni l'autre. <br>"
              texte +=
                '$\\textbf{b. }$ En déduire des éventuelles propriétés graphiques de la représentation graphique de $f$.<br>'
              texteCorr = '$\\textbf{a. }$'
            }

            texteCorr += `On observe que la fonction est définie sur  $D=[${-i2};${i1}]$ qui n'est pas symétrique par rapport à $0$.<br>`
            if (i2 > i1) {
              texteCorr += `Par exemple, $x=${-i2} \\in D$, mais $-x=${i2} \\notin D$.<br>`
            } else {
              texteCorr += `Par exemple, $x=${i1} \\in D$, mais $-x=${-i1} \\notin D$.<br>`
            }
            texteCorr +=
              "En conséquence, il existe des réels dans $D$, dont l'opposé n'appartient pas à $D$.<br>"
            texteCorr += `On peut conclure que $f$ ${texteEnCouleurEtGras("n'est ni paire, ni impaire")}.<br>`
            if (!this.interactif) {
              texteCorr +=
                "<br>$\\textbf{b. }$ La représentation graphique ne peut pas admettre de symétrie centrale par rapport à l'origine, ni symétrie axiale par rapport à l'axe des ordonnées."
            }
            bonneReponse = "$f$ n'est ni paire ni impaire"
            variables.push(a, c, i1, i2)
          }
          break

        case 6:
        default:
          {
            // Cas f(x)=1/ax
            const a = randint(-5, 5, 0) // Pour définir fonctions

            texte = `Soit $f$ la fonction définie sur  $D=\\mathbb{R^{*}}$, par $f(x)=\\dfrac{${a}}{x}$.`
            if (this.interactif) {
              texte += ''
              texteCorr = ''
            } else {
              texte +=
                '<br>$\\textbf{a. }$ Déterminer, en expliquant, si la fonction $f$'
              texte += "est paire, impaire, ou ni l'une, ni l'autre. <br>"
              texte +=
                '$\\textbf{b. }$ En déduire des éventuelles propriétés graphiques de la représentation graphique de $f$.<br>'
              texteCorr = '$\\textbf{a. }$'
            }

            texteCorr +=
              '$D=\\mathbb{R^{*}}$, en conséquence, pour tout $x\\in D$, $-x\\in D$.<br>'
            texteCorr +=
              "L'ensemble de définition est bien symétrique par rapport à $0$.<br>"
            texteCorr += 'Soit $x\\in D$.<br>'
            texteCorr += `$\\bullet$ $f(-x)=\\dfrac{${a}}{-x}`
            if (a > 0) {
              texteCorr += `=-\\dfrac{${a}}{x}$<br>`
            } else {
              texteCorr += `=\\dfrac{${-a}}{x}$<br>`
            }
            texteCorr +=
              "On observe que $f(-x)\\neq f(x)$, la fonction $f$ n'est donc pas paire.<br>"
            texteCorr += `$\\bullet$$-f(x)=-\\dfrac{${a}}{x}`
            if (a < 0) {
              texteCorr += `=\\dfrac{${-a}}{x}$<br>`
            } else {
              texteCorr += '$<br>'
            }
            texteCorr += `On observe alors que $f(-x)= -f(x)$, la fonction $f$ est donc ${texteEnCouleurEtGras('impaire')}<br>`
            if (!this.interactif) {
              texteCorr +=
                "<br>$\\textbf{b. }$ La fonction $f$ étant impaire, on peut déduire que sa courbe représentative admet une symétrie centrale autour de l'origine du repère."
            }

            bonneReponse = '$f$ est impaire'
            variables.push(a)
          }
          break
      }

      this.autoCorrection[i] = {}
      this.autoCorrection[i].options = { ordered: true }
      this.autoCorrection[i].enonce = `${texte}\n`
      this.autoCorrection[i].propositions = [
        {
          texte: '$f$ est paire',
          statut: bonneReponse === '$f$ est paire',
        },
        {
          texte: '$f$ est impaire',
          statut: bonneReponse === '$f$ est impaire',
        },
        {
          texte: "$f$ n'est ni paire ni impaire",
          statut: bonneReponse === "$f$ n'est ni paire ni impaire",
        },
      ]
      const props = propositionsQcm(this, i)
      if (this.interactif) {
        texte += props.texte
      }
      if (this.questionJamaisPosee(i, variables.map(String).join(''))) {
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
