import { tableauDeVariation } from '../../lib/mathFonctions/etudeFonction'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { numAlpha, sp } from '../../lib/outils/outilString'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  "Déterminer un extremum ou encadrer par lecture d'un tableau de variations"
export const dateDePublication = '20/12/2021'
/**
 * @author Gilles Mora
 * Lintage et typage typescript incomplet à cause de tableauDeVariation qui n'est pas typé correctement
 */
export const uuid = 'acee0'

export const refs = {
  'fr-fr': ['2F42-2'],
  'fr-ch': [],
}
export default class LireUnTableauDevariations extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Choix des questions',
      3,
      '1 : Minimum et maximum\n2 :Encadrement\n3 :Mélange',
    ]

    this.nbQuestions = 1
    this.sup = 3 // Niveau de difficulté
  }

  nouvelleVersion() {
    let typeDeQuestionsDisponibles
    if (this.sup === 1) {
      typeDeQuestionsDisponibles = ['typeE1']
    } else {
      if (this.sup === 2) {
        typeDeQuestionsDisponibles = ['typeE2']
      } else {
        typeDeQuestionsDisponibles = ['typeE1', 'typeE2']
      }
    }
    const listeTypeQuestions = combinaisonListes(
      typeDeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posés mais l'ordre diffère à chaque "cycle"
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      // Boucle principale où i+1 correspond au numéro de la question
      let x1: number,
        x2: number,
        x3: number,
        x4: number,
        y1: number,
        y2: number,
        y3: number,
        y4: number,
        M: number,
        m: number,
        M1: number,
        M2: number,
        m1: number,
        choix: number
      let ligne1: (string | number)[]
      switch (
        listeTypeQuestions[i] // Suivant le type de question, le contenu sera différent
      ) {
        case 'typeE1':
          x1 = randint(-20, 10)
          x2 = randint(x1 + 1, 15)
          x3 = randint(x2 + 1, 20)
          x4 = randint(x3 + 1, 25)
          y1 = randint(-10, 10)
          y2 = randint(y1 - 10, y1 - 1)
          y3 = randint(y2 + 1, y2 + 10, y1)
          y4 = randint(y3 - 10, y3 - 1, y2)
          M = Math.max(y1, y2, y3, y4)
          m = Math.min(y1, y2, y3, y4)
          choix = randint(1, 2)
          if (choix === 1) {
            ligne1 = [
              'Var',
              10,
              `+/$${y1}$`,
              10,
              `-/$${y2}$`,
              10,
              `+/$${y3}$`,
              10,
              `-/$${y4}$`,
              10,
            ]
          } else {
            ligne1 = [
              'Var',
              10,
              `-/$${-y1}$`,
              10,
              `+/$${-y2}$`,
              10,
              `-/$${-y3}$`,
              10,
              `+/$${-y4}$`,
              10,
            ]
          }
          // xmin détermine la marge à gauche, ymin la hauteur réservée pour le tableau, xmax la largeur réservée pour le tableau et ymax la marge au-dessus du tableau

          texte = ` Voici le tableau de variations d'une fonction $f$ définie sur $[${x1};${x4}]$.<br><br>
              `
          texte += tableauDeVariation({
            tabInit: [
              [
                // Première colonne du tableau avec le format [chaine d'entête, hauteur de ligne, nombre de pixels de largeur estimée du texte pour le centrage]
                ['$x$', 2, 10],
                ['$f(x)$', 4, 30],
              ],
              // Première ligne du tableau avec chaque antécédent suivi de son nombre de pixels de largeur estimée du texte pour le centrage
              [`$${x1}$`, 10, `$${x2}$`, 10, `$${x3}$`, 10, `$${x4}$`, 10],
            ],
            // tabLines ci-dessous contient les autres lignes du tableau.
            tabLines: [ligne1],
            espcl: 4, // taille en cm entre deux antécédents
            deltacl: 1, // distance entre la bordure et les premiers et derniers antécédents
            lgt: 3, // taille de la première colonne en cm,
            scale: 0.6,
          })

          texte +=
            ' <br>Déterminer le minimum et le maximum de $f$ sur son ensemble de définition. Préciser en quelles valeurs de $x$ ils sont atteints.'

          texteCorr = `$\\bullet~$ $f$ admet un maximum en $a$ sur un intervalle $I$ signifie que pour tout réel $x$ de $I$, $f(x)\\leqslant f(a)$.<br>
          Le nombre $f(a)$ est le maximum de $f$ sur $I$.<br>
          $\\bullet~$ $f$ admet un minimum en $b$ sur un intervalle $I$ signifie que pour tout réel $x$ de $I$, $f(x)\\geqslant f(b)$.<br>
          Le nombre $f(b)$ est le minimum de $f$ sur $I$.<br>
          <br>`
          if (choix === 1) {
            if (M === y1) {
              texteCorr += `Pour tout réel $x$ de $[${x1};${x4}]$, on a  $f(x)\\leqslant ${y1}$, c'est-à-dire  $f(x)\\leqslant f(${x1})$.<br>
           Ainsi, le maximum de $f$ est $${miseEnEvidence(y1)}$. Il est atteint en $x=${miseEnEvidence(x1)}$. `
            } else {
              texteCorr += `Pour tout réel $x$ de $[${x1};${x4}]$, on a  $f(x)\\leqslant ${y3}$, c'est-à-dire  $f(x)\\leqslant f(${x3})$.<br>
          Ainsi, le maximum de $f$ est $${miseEnEvidence(y3)}$. Il est atteint en $x=${miseEnEvidence(x3)}$.  `
            }
            if (m === y2) {
              texteCorr += `<br>Pour tout réel $x$ de $[${x1};${x4}]$, on a  $f(x)\\geqslant ${y2}$, c'est-à-dire  $f(x)\\geqslant f(${x2})$.<br>
          Ainsi, le minimum de $f$ est $${miseEnEvidence(y2)}$. Il est atteint en $x=${miseEnEvidence(x2)}$. `
            } else {
              texteCorr += `<br>Pour tout réel $x$ de $[${x1};${x4}]$, on a  $f(x)\\geqslant ${y4}$, c'est-à-dire  $f(x)\\geqslant f(${x4})$.<br>
         Ainsi, le minimum de $f$ est $${miseEnEvidence(y4)}$. Il est atteint en $x=${miseEnEvidence(x4)}$.  `
            }
          } else {
            if (M === y1) {
              texteCorr += `Pour tout réel $x$ de $[${x1};${x4}]$, on a  $f(x)\\geqslant ${-y1}$, c'est-à-dire  $f(x)\\geqslant f(${x1})$.<br>
           Ainsi, le minimum de $f$ est $${miseEnEvidence(-y1)}$. Il est atteint en $x=${miseEnEvidence(x1)}$. `
            } else {
              texteCorr += `Pour tout réel $x$ de $[${x1};${x4}]$, on a  $f(x)\\geqslant ${-y3}$, c'est-à-dire  $f(x)\\geqslant f(${x3})$.<br>
          Ainsi, le minimum de $f$ est $${miseEnEvidence(-y3)}$. Il est atteint en $x=${miseEnEvidence(x3)}$.  `
            }
            if (m === y2) {
              texteCorr += `<br>Pour tout réel $x$ de $[${x1};${x4}]$, on a  $f(x)\\leqslant ${-y2}$, c'est-à-dire  $f(x)\\leqslant f(${x2})$.<br>
          Ainsi, le maximum de $f$ est $${miseEnEvidence(-y2)}$. Il est atteint en $x=${miseEnEvidence(x2)}$. `
            } else {
              texteCorr += `<br>Pour tout réel $x$ de $[${x1};${x4}]$, on a  $f(x)\\leqslant ${-y4}$, c'est-à-dire  $f(x)\\leqslant f(${x4})$.<br>
         Ainsi, le maximum de $f$ est $${miseEnEvidence(-y4)}$. Il est atteint en $x=${miseEnEvidence(x4)}$.  `
            }
          }
          break
        case 'typeE2':
        default:
          x1 = randint(-20, 10)
          x2 = randint(x1 + 1, 15)
          x3 = randint(x2 + 1, 20)
          x4 = randint(x3 + 1, 25)
          y1 = randint(-10, 10)
          y2 = randint(y1 - 10, y1 - 1)
          y3 = randint(y2 + 1, y2 + 10, y1)
          y4 = randint(y3 - 10, y3 - 1, y2)
          M1 = Math.max(y1, y3)
          M2 = Math.max(y1, y3)
          m1 = Math.min(y2, y4)
          choix = randint(1, 2)
          if (choix === 1) {
            ligne1 = [
              'Var',
              10,
              `+/$${y1}$`,
              10,
              `-/$${y2}$`,
              10,
              `+/$${y3}$`,
              10,
              `-/$${y4}$`,
              10,
            ]
          } else {
            ligne1 = [
              'Var',
              10,
              `-/$${-y1}$`,
              10,
              `+/$${-y2}$`,
              10,
              `-/$${-y3}$`,
              10,
              `+/$${-y4}$`,
              10,
            ]
          }
          texte = ` Voici le tableau de variations d'une fonction $f$ définie sur $[${x1};${x4}]$.<br><br>
              `
          texte += tableauDeVariation({
            tabInit: [
              [
                // Première colonne du tableau avec le format [chaine d'entête, hauteur de ligne, nombre de pixels de largeur estimée du texte pour le centrage]
                ['$x$', 2, 10],
                ['$f(x)$', 4, 30],
              ],
              // Première ligne du tableau avec chaque antécédent suivi de son nombre de pixels de largeur estimée du texte pour le centrage
              [`$${x1}$`, 10, `$${x2}$`, 10, `$${x3}$`, 10, `$${x4}$`, 10],
            ],
            // tabLines ci-dessous contient les autres lignes du tableau.
            tabLines: [ligne1],
            espcl: 4, // taille en cm entre deux antécédents
            deltacl: 1, // distance entre la bordure et les premiers et derniers antécédents
            lgt: 3, // taille de la première colonne en cm
            scale: 0.6,
          })

          texte +=
            ' <br>Encadrer le plus précisément possible $f(x)$ (en déterminant les valeurs de $m$ et de $M$ telles que $m\\leqslant f(x)\\leqslant M$) dans chacun des cas suivants :<br>'
          texte += numAlpha(0) + ` $x\\in[${x1};${x3}]$<br>`
          texte += numAlpha(1) + ` $x\\in[${x2};${x4}]$`
          texteCorr = ''
          if (choix === 1) {
            if (M1 === y1) {
              texteCorr +=
                numAlpha(0) +
                `Sur $[${x1};${x3}]$, le minimum de $f$ est $${y2}$ et le maximum est
          $${y1}$. <br>
          Ainsi, pour $x\\in[${x1};${x3}]$, ${sp(3)} $${miseEnEvidence(`${y2}\\leqslant f(x)\\leqslant ${y1}`)}$.<br>`
            } else {
              texteCorr +=
                numAlpha(0) +
                `Sur $[${x1};${x3}]$, le minimum de $f$ est $${y2}$ et le maximum est
          $${y3}$. <br>
          Ainsi, pour $x\\in[${x1};${x3}]$, ${sp(3)} $${miseEnEvidence(`${y2}\\leqslant f(x)\\leqslant ${y3}`)}$.<br>`
            }
            if (m1 === y2) {
              texteCorr +=
                numAlpha(1) +
                `Sur $[${x2};${x4}]$, le minimum de $f$ est $${y2}$ et le maximum est
          $${y3}$. <br>
          Ainsi, pour $x\\in[${x2};${x4}]$, ${sp(3)} $${miseEnEvidence(`${y2}\\leqslant f(x)\\leqslant ${y3}`)}$.<br>`
            } else {
              texteCorr +=
                numAlpha(1) +
                `Sur $[${x2};${x4}]$, le minimum de $f$ est $${y4}$ et le maximum est
          $${y3}$. <br>
          Ainsi, pour $x\\in[${x2};${x4}]$, ${sp(3)} $${miseEnEvidence(`${y4}\\leqslant f(x)\\leqslant ${y3}`)}$.<br>`
            }
          } else {
            if (M2 === y1) {
              texteCorr +=
                numAlpha(0) +
                `Sur $[${x1};${x3}]$, le minimum de $f$ est $${-y1}$ et le maximum est
            $${-y2}$. <br>
            Ainsi, pour $x\\in[${x1};${x3}]$, ${sp(3)} $${miseEnEvidence(`${-y1}\\leqslant f(x)\\leqslant ${-y2}`)}$.<br>`
            } else {
              texteCorr +=
                numAlpha(0) +
                `Sur $[${x1};${x3}]$, le minimum de $f$ est $${-y3}$ et le maximum est
            $${-y2}$. <br>
            Ainsi, pour $x\\in[${x1};${x3}]$, ${sp(3)} $${miseEnEvidence(`${-y3}\\leqslant f(x)\\leqslant ${-y2}`)}$.<br>`
            }
            if (m1 === y2) {
              texteCorr +=
                numAlpha(1) +
                `Sur $[${x2};${x4}]$, le minimum de $f$ est $${-y3}$ et le maximum est
            $${-y2}$. <br>
            Ainsi, pour $x\\in[${x2};${x4}]$, ${sp(3)} $${miseEnEvidence(`${-y3}\\leqslant f(x)\\leqslant ${-y2}`)}$.<br>`
            } else {
              texteCorr +=
                numAlpha(1) +
                `Sur $[${x2};${x4}]$, le minimum de $f$ est $${-y3}$ et le maximum est
            $${-y4}$. <br>
            Ainsi, pour $x\\in[${x2};${x4}]$, ${sp(3)} $${miseEnEvidence(`${-y3}\\leqslant f(x)\\leqslant ${-y4}`)}$.<br>`
            }
          }
          break
      }
      if (this.questionJamaisPosee(i, x1, x2, x3, x4, y1, y2, y3, y4)) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
