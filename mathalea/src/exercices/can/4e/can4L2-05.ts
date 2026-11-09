import { texteEnCouleurEtGras } from '../../../lib/outils/embellissements'
import { propositionsQcm } from '../../../lib/interactif/qcm'
import { choice } from '../../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
  rienSi1,
} from '../../../lib/outils/ecritures'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'
export const titre = 'Reconnaitre une expression littérale (QCM)'
export const interactifReady = true

// Les exports suivants sont optionnels mais au moins la date de publication semble essentielle
export const dateDePublication = '27/02/2022' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
// export const dateDeModifImportante = '24/10/2021' // Une date de modification importante au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export const uuid = 'a6e97'

export const refs = {
  'fr-fr': ['can4L2-05', '2L10-flash3'],
  'fr-ch': [],
}
export default class ReconnaitreExpL extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    let texte, texteCorr, a, b, c, d, e, monQcm
    const nomVar = ['a', 'b', 'x', 'y']
    const inc = choice(nomVar)
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      switch (
        choice([1, 2, 3, 4, 5, 6, 7, 8, 9]) //
      ) {
        case 1: // a(x+b)
          a = randint(-10, 10, [-1, 0, 1])
          b = randint(1, 10)
          c = 0 // c'est pour this.questionJamaisPosee

          texte = `Quelle est la nature de ce calcul ?<br>

            $${a}(${inc}+${b})$`
          this.canEnonce = texte
          this.autoCorrection[i] = {
            enonce: texte,

            propositions: [
              {
                texte: 'Somme',
                statut: false,
              },
              {
                texte: 'Produit',
                statut: true,
              },
            ],
          }
          monQcm = propositionsQcm(this, i)
          texte += monQcm.texte

          texteCorr = `La dernière opération à effectuer pour faire ce calcul est un produit. <br>
            On en déduit que l’expression est ${texteEnCouleurEtGras('un produit')} de deux facteurs $A$ et $B$ :`
          texteCorr += `<br>$\\underbrace{${a}}_{A}(\\underbrace{${inc}+ ${b}}_{B})$`

          break

        case 2: // ax + b ou a+b*x
          if (choice([true, false])) {
            a = randint(-10, 10, [0, 1])
            b = randint(-10, 10, [-1, 0, 1])
            c = 0 // c'est pour this.questionJamaisPosee

            texte = `Quelle est la nature de ce calcul ?<br>
          
            $${ecritureParentheseSiNegatif(a)}\\times ${inc} ${ecritureAlgebrique(b)}$`
            this.canEnonce = texte
            this.autoCorrection[i] = {
              enonce: texte,

              propositions: [
                {
                  texte: 'Somme',
                  statut: true,
                },

                {
                  texte: 'Produit',
                  statut: false,
                },
              ],
            }
            monQcm = propositionsQcm(this, i)
            texte += monQcm.texte
            if (b > 0) {
              texteCorr = `La dernière opération à effectuer pour faire ce calcul est une somme (la multiplication étant prioritaire). <br>
          On en déduit que l’expression est ${texteEnCouleurEtGras('une somme')} de deux termes $A$ et $B$ :`
              texteCorr += `<br>$\\underbrace{${a}\\times ${inc}}_{A}+\\underbrace{${b}}_{B}$`
            } else {
              texteCorr = `La dernière opération à effectuer pour faire ce calcul est une somme (la multiplication étant prioritaire). <br>
          On en déduit que l’expression est ${texteEnCouleurEtGras('une somme')} de deux termes $A$ et $B$ :`
              texteCorr += `<br>$\\underbrace{${rienSi1(a)}${inc}}_{A}+\\underbrace{(${b})}_{B}$`
            }
          } else {
            a = randint(-10, 10, [0, 1])
            b = randint(-10, 10, [-1, 0, 1])
            c = 0 // c'est pour this.questionJamaisPosee

            texte = `Quelle est la nature de ce calcul ?<br>
          
            $${ecritureParentheseSiNegatif(a)}${ecritureAlgebrique(b)}\\times ${inc}$`
            this.canEnonce = texte
            this.autoCorrection[i] = {
              enonce: texte,

              propositions: [
                {
                  texte: 'Somme',
                  statut: true,
                },

                {
                  texte: 'Produit',
                  statut: false,
                },
              ],
            }
            monQcm = propositionsQcm(this, i)
            texte += monQcm.texte
            if (b > 0) {
              texteCorr = `La dernière opération à effectuer pour faire ce calcul est une somme (la multiplication étant prioritaire). <br>
          On en déduit que l’expression est ${texteEnCouleurEtGras('une somme')} de deux termes $A$ et $B$ :`
              texteCorr += `<br>$\\underbrace{${a}}_{A}+\\underbrace{${b}\\times ${inc}}_{B}$`
            } else {
              texteCorr = `La dernière opération à effectuer pour faire ce calcul est une somme (la multiplication étant prioritaire). <br>
          On en déduit que l’expression est ${texteEnCouleurEtGras('une somme')} de deux termes $A$ et $B$ :`
              texteCorr += `<br>$\\underbrace{${a}}_{A}+\\underbrace{(${b})\\times x}_{B}$`
            }
          }
          break

        case 3: // ax +/- by
          a = randint(-10, 10, [-1, 0, 1])
          b = randint(-10, 10, [-1, 0, 1])
          c = 0 // c'est pour this.questionJamaisPosee
          texte = `Quelle est la nature de ce calcul ?<br>
          
            $${a}a${ecritureAlgebrique(b)}b$`
          this.canEnonce = texte
          this.autoCorrection[i] = {
            enonce: texte,

            propositions: [
              {
                texte: 'Somme',
                statut: true,
              },
              {
                texte: 'Produit',
                statut: false,
              },
            ],
          }
          monQcm = propositionsQcm(this, i)
          texte += monQcm.texte
          if (b > 0) {
            texteCorr = `La dernière opération à effectuer pour faire ce calcul est une somme (la multiplication étant prioritaire). <br>
          On en déduit que l’expression est ${texteEnCouleurEtGras('une somme')} de deux termes $A$ et $B$ :`
            texteCorr += `<br>$\\underbrace{${a}a}_{A}+\\underbrace{${b}b}_{B}$`
          } else {
            texteCorr = `La dernière opération à effectuer pour faire ce calcul est une somme (la multiplication étant prioritaire). <br>
          On en déduit que l’expression est ${texteEnCouleurEtGras('une somme')} de deux termes $A$ et $B$ :`
            texteCorr += `<br>$\\underbrace{${a}a}_{A}+\\underbrace{(${b}b)}_{B}$`
          }

          break

        case 4: // ax+b(x+c)
          if (choice([true, false])) {
            a = randint(-10, 10, [-1, 0, 1])
            b = randint(2, 10)
            c = randint(-10, 10, 0)
            texte = `Quelle est la nature de ce calcul ?<br>
          
            $${a}x+${b}\\times(x${ecritureAlgebrique(c)})$`
            this.canEnonce = texte
            this.autoCorrection[i] = {
              enonce: texte,

              propositions: [
                {
                  texte: 'Somme',
                  statut: true,
                },

                {
                  texte: 'Produit',
                  statut: false,
                },
              ],
            }
            monQcm = propositionsQcm(this, i)
            texte += monQcm.texte
            texteCorr = `La dernière opération à effectuer pour faire ce calcul est une somme (la multiplication étant prioritaire). <br>
          On en déduit que l’expression est ${texteEnCouleurEtGras('une somme')} de deux termes $A$ et $B$ :`
            texteCorr += `<br>$\\underbrace{${a}x}_{A}+\\underbrace{${b}\\times(x${ecritureAlgebrique(c)})}_{B}$`
          } else {
            a = randint(2, 10)
            b = randint(2, 10)
            c = randint(-10, 10, [-1, 0, 1])
            texte = `Quelle est la nature de ce calcul ?<br>
            
            $${b}\\times(x${ecritureAlgebrique(c)})+${a}x$`
            this.canEnonce = texte
            this.autoCorrection[i] = {
              enonce: texte,

              propositions: [
                {
                  texte: 'Somme',
                  statut: true,
                },

                {
                  texte: 'Produit',
                  statut: false,
                },
              ],
            }
            monQcm = propositionsQcm(this, i)
            texte += monQcm.texte
            texteCorr = `La dernière opération à effectuer pour faire ce calcul est une somme (la multiplication étant prioritaire). <br>
          On en déduit que l’expression est ${texteEnCouleurEtGras('une somme')} de deux termes $A$ et $B$ :`
            texteCorr += `<br>$\\underbrace{${b}\\times(x${ecritureAlgebrique(c)})}_{A}+\\underbrace{${a}x}_{B}$`
          }

          break

        case 5: // (ax+b)(cx+d)
          a = randint(-10, 10, [-1, 0, 1])
          b = randint(2, 10)
          c = randint(-10, 10, [-1, 0, 1])
          d = randint(-10, 10, 0)
          texte = `Quelle est la nature de ce calcul ?<br>
          
              $(${a}x+${b})(${c}x${ecritureAlgebrique(d)})$`
          this.canEnonce = texte
          this.autoCorrection[i] = {
            enonce: texte,

            propositions: [
              {
                texte: 'Somme',
                statut: false,
              },

              {
                texte: 'Produit',
                statut: true,
              },
            ],
          }
          monQcm = propositionsQcm(this, i)
          texte += monQcm.texte
          texteCorr = `La dernière opération à effectuer pour faire ce calcul est un produit. <br>
            On en déduit que l’expression est ${texteEnCouleurEtGras('un produit')} de deux facteurs  $A$ et $B$ :`
          texteCorr += `<br>$\\underbrace{(${a}x+${b})}_{A}\\underbrace{(${c}x${ecritureAlgebrique(d)})}_{B}$`

          break
        case 6: // (ax+b)+(cx+d)
          a = randint(-10, 10, [-1, 0, 1])
          b = randint(2, 10)
          c = randint(-10, 10, [-1, 0, 1])
          d = randint(-10, 10, 0)
          texte = `Quelle est la nature de ce calcul ?<br>
          
              $(${a}x+${b})+(${c}x${ecritureAlgebrique(d)})$`
          this.canEnonce = texte
          this.autoCorrection[i] = {
            enonce: texte,

            propositions: [
              {
                texte: 'Somme',
                statut: true,
              },

              {
                texte: 'Produit',
                statut: false,
              },
            ],
          }
          monQcm = propositionsQcm(this, i)
          texte += monQcm.texte
          texteCorr = `La dernière opération à effectuer pour faire ce calcul est une somme. <br>
            On en déduit que l’expression est ${texteEnCouleurEtGras('une somme')} de deux termes  $A$ et $B$ :`
          texteCorr += `<br>$\\underbrace{(${a}x+${b})}_{A}+\\underbrace{(${c}x${ecritureAlgebrique(d)})}_{B}$`

          break
        case 7: // (ax+b)+(cx+d)(ax+b)
          a = randint(-10, 10, [-1, 0, 1])
          b = randint(2, 10)
          c = randint(-10, 10, [-1, 0, 1])
          d = randint(-10, 10, 0)
          texte = `Quelle est la nature de ce calcul ?<br>
          
              $(${a}x+${b})+(${c}x${ecritureAlgebrique(d)})(${a}x${ecritureAlgebrique(b)})$`
          this.canEnonce = texte
          this.autoCorrection[i] = {
            enonce: texte,

            propositions: [
              {
                texte: 'Somme',
                statut: true,
              },

              {
                texte: 'Produit',
                statut: false,
              },
            ],
          }
          monQcm = propositionsQcm(this, i)
          texte += monQcm.texte
          texteCorr = `La dernière opération à effectuer pour faire ce calcul est une somme. <br>
            On en déduit que l’expression est ${texteEnCouleurEtGras('une somme')} de deux termes  $A$ et $B$ :`
          texteCorr += `<br>$\\underbrace{(${a}x+${b})}_{A}+\\underbrace{(${c}x${ecritureAlgebrique(d)})(${a}x${ecritureAlgebrique(b)})}_{B}$<br>
              Dans cette somme, il y a un facteur commun $${a}x${ecritureAlgebrique(b)}$ permettant de factoriser cette expression.`

          break

        case 8: // (ax+b)(cx+d)+e
          a = randint(-10, 10, [-1, 0, 1])
          b = randint(2, 10)
          c = randint(-10, 10, [-1, 0, 1])
          d = randint(-10, 10, 0)
          e = randint(2, 10)
          texte = `Quelle est la nature de ce calcul ?<br>
          
              $(${a}x+${b})(${c}x${ecritureAlgebrique(d)})+${e}$`
          this.canEnonce = texte
          this.autoCorrection[i] = {
            enonce: texte,

            propositions: [
              {
                texte: 'Somme',
                statut: true,
              },

              {
                texte: 'Produit',
                statut: false,
              },
            ],
          }
          monQcm = propositionsQcm(this, i)
          texte += monQcm.texte
          texteCorr = `La dernière opération à effectuer pour faire ce calcul est une somme. <br>
            On en déduit que l’expression est ${texteEnCouleurEtGras('une somme')} de deux termes  $A$ et $B$ :`
          texteCorr += `<br>$\\underbrace{(${a}x+${b})(${c}x${ecritureAlgebrique(d)})}_{A}+\\underbrace{${e}}_{B}$
              `

          break

        case 9: // e(ax+b)(cx+d)
        default:
          a = randint(-10, 10, [-1, 0, 1])
          b = randint(2, 10)
          c = randint(-10, 10, [-1, 0, 1])
          d = randint(-10, 10, 0)
          e = randint(2, 10)
          texte = `Quelle est la nature de ce calcul ?<br>

              $${e}(${a}x+${b})(${c}x${ecritureAlgebrique(d)})$`
          this.canEnonce = texte
          this.autoCorrection[i] = {
            enonce: texte,

            propositions: [
              {
                texte: 'Somme',
                statut: false,
              },

              {
                texte: 'Produit',
                statut: true,
              },
            ],
          }
          monQcm = propositionsQcm(this, i)
          texte += monQcm.texte
          texteCorr = `La dernière opération à effectuer pour faire ce calcul est un produit. <br>
            On en déduit que l’expression est ${texteEnCouleurEtGras('un produit')} de trois facteurs  $A$, $B$ et $C$ :`
          texteCorr += `<br>$\\underbrace{${e}}_{A}\\underbrace{(${a}x+${b})}_{B}\\underbrace{(${c}x${ecritureAlgebrique(d)})}_{C}$
              `

          break
      }

      if (this.questionJamaisPosee(i, a, b, c)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      this.canReponseACompleter = monQcm.texte
      this.listeCanEnonces.push(this.canEnonce)
      this.listeCanReponsesACompleter.push(this.canReponseACompleter)
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
