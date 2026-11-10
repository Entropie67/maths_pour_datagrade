import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../../lib/interactif/questionMathLive'
import { tableauDeVariation } from '../../../lib/mathFonctions/etudeFonction'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import { context } from '../../../modules/context'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'
export const titre = 'Encadrer en utilisant un tableau de variations'
export const interactifReady = true

// Les exports suivants sont optionnels mais au moins la date de publication semble essentielle
export const dateDePublication = '22/12/2021' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
export const dateDeModifImportante = '09/03/2025' // Une date de modification importante au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

 */
export const uuid = 'e0405'

export const refs = {
  'fr-fr': ['can2F4-01', '2F41-flash1'],
  'fr-ch': [],
}
export default class EncadrerTableau extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    let texte, texteCorr
    let ligne1
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const x1 = randint(-20, 10)
      const x2 = randint(x1 + 1, 15)
      const x3 = randint(x2 + 1, 20)
      const x4 = randint(x3 + 1, 25)
      const y1 = randint(-10, 10)
      const y2 = randint(y1 - 10, y1 - 1)
      const y3 = randint(y2 + 1, y2 + 10, y1)
      const y4 = randint(y3 - 10, y3 - 1, y2)
      const M = Math.max(y1, y3)
      const m = Math.min(y2, y4)
      const choix = randint(1, 2)
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
      texte = `Voici le tableau de variations d'une fonction $f$ définie ${context.isDiaporama ? '<br>' : ''} sur $[${x1}\\,;\\,${x4}]$ :<br>`

      this.canEnonce =
        `Voici le tableau de variations d'une fonction $f$ définie sur $[${x1}\\,;\\,${x4}]$ :
      
    ` +
        tableauDeVariation({
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
          espcl: 2, // taille en cm entre deux antécédents
          deltacl: 1, // distance entre la bordure et les premiers et derniers antécédents
          lgt: 3, // taille de la première colonne en cm
          scale: context.isHtml ? 1 : 0.6,
        })
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
        scale: context.isHtml ? 1 : 0.6,
      })
      if (choice([true, false])) {
        texte += ` <br>
      Encadrer le plus précisément possible $f(x)$ ${context.isDiaporama ? '<br>' : ''} lorsque $x\\in[${x1}\\,;\\,${x3}]$.<br>`
        texte += remplisLesBlancs(
          this,
          i,
          ' %{champ1} \\,\\leqslant\\, f(x)\\,\\leqslant\\, %{champ2}',
          KeyboardType.clavierDeBase,
        )
        this.canEnonce += `<br>
        Encadrer le plus précisément possible $f(x)$ ${context.isDiaporama ? '<br>' : ''} lorsque $x\\in[${x1};${x3}]$.<br>`
        this.canReponseACompleter =
          '$\\ldots \\leqslant f(x)\\leqslant \\ldots$'
        if (choix === 1) {
          if (M === y1) {
            texteCorr = `Sur $[${x1}\\,;\\,${x3}]$, le minimum de $f$ est $${y2}$ et le maximum est
          $${y1}$. <br>
          Ainsi, pour $x\\in[${x1}\\,;\\,${x3}]$, ${sp(3)} $${miseEnEvidence(y2)}\\leqslant f(x)\\leqslant ${miseEnEvidence(y1)}$.<br>`
            handleAnswers(this, i, {
              bareme: (listePoints) => [
                Math.min(listePoints[0], listePoints[1]),
                1,
              ],
              champ1: { value: y2 },
              champ2: { value: y1 },
            })
          } else {
            texteCorr = `Sur $[${x1}\\,;\\,${x3}]$, le minimum de $f$ est $${y2}$ et le maximum est
          $${y3}$. <br>
          Ainsi, pour $x\\in[${x1}\\,;\\,${x3}]$, ${sp(3)} $${miseEnEvidence(y2)}\\leqslant f(x)\\leqslant ${miseEnEvidence(y3)}$.<br>`
            handleAnswers(this, i, {
              bareme: (listePoints) => [
                Math.min(listePoints[0], listePoints[1]),
                1,
              ],
              champ1: { value: y2 },
              champ2: { value: y3 },
            })
          }
        } else {
          if (M === y1) {
            texteCorr = `Sur $[${x1}\\,;\\,${x3}]$, le minimum de $f$ est $${-y1}$ et le maximum est
          $${-y2}$. <br>
          Ainsi, pour $x\\in[${x1}\\,;\\,${x3}]$, ${sp(3)} $${miseEnEvidence(-y1)}\\leqslant f(x)\\leqslant ${miseEnEvidence(-y2)}$. `
            handleAnswers(this, i, {
              bareme: (listePoints) => [
                Math.min(listePoints[0], listePoints[1]),
                1,
              ],
              champ1: { value: -y1 },
              champ2: { value: -y2 },
            })
          } else {
            texteCorr = `Sur $[${x1}\\,;\\,${x3}]$, le minimum de $f$ est $${-y3}$ et le maximum est
          $${-y2}$. <br>
          Ainsi, pour $x\\in[${x1}\\,;\\,${x3}]$, ${sp(3)} $${miseEnEvidence(-y3)}\\leqslant f(x)\\leqslant ${miseEnEvidence(-y2)}$. `
            handleAnswers(this, i, {
              bareme: (listePoints) => [
                Math.min(listePoints[0], listePoints[1]),
                1,
              ],
              champ1: { value: -y3 },
              champ2: { value: -y2 },
            })
          }
        }
      } else {
        texte += `<br>Encadrer le plus précisément possible $f(x)$ ${context.isDiaporama ? '<br>' : ''} lorsque $x\\in[${x2}\\,;\\,${x4}]$.<br>`
        texte += remplisLesBlancs(
          this,
          i,
          ' %{champ1} \\,\\leqslant\\, f(x)\\,\\leqslant\\, %{champ2}',
          KeyboardType.clavierDeBase,
        )
        this.canEnonce += `<br>Encadrer le plus précisément possible $f(x)$ lorsque $x\\in[${x2}\\,;\\,${x4}]$.`
        if (choix === 1) {
          if (m === y2) {
            texteCorr = `Sur $[${x2}\\,;\\,${x4}]$, le minimum de $f$ est $${y2}$ et le maximum est
          $${y3}$. <br>
          Ainsi, pour $x\\in[${x2}\\,;\\,${x4}]$, ${sp(3)} $${miseEnEvidence(y2)}\\leqslant f(x)\\leqslant ${miseEnEvidence(y3)}$.`
            handleAnswers(this, i, {
              bareme: (listePoints) => [
                Math.min(listePoints[0], listePoints[1]),
                1,
              ],
              champ1: { value: y2 },
              champ2: { value: y3 },
            })
          } else {
            texteCorr = `Sur $[${x2}\\,;\\,${x4}]$, le minimum de $f$ est $${y4}$ et le maximum est
          $${y3}$. <br>
          Ainsi, pour $x\\in[${x2}\\,;\\,${x4}]$, ${sp(3)} $${miseEnEvidence(y4)}\\leqslant f(x)\\leqslant ${miseEnEvidence(y3)}$. `
            handleAnswers(this, i, {
              bareme: (listePoints) => [
                Math.min(listePoints[0], listePoints[1]),
                1,
              ],
              champ1: { value: y4 },
              champ2: { value: y3 },
            })
          }
        } else {
          if (m === y2) {
            texteCorr = `Sur $[${x2}\\,;\\,${x4}]$, le minimum de $f$ est $${-y3}$ et le maximum est
          $${-y2}$. <br>
          Ainsi, pour $x\\in[${x2}\\,;\\,${x4}]$, ${sp(3)} $${miseEnEvidence(-y3)}\\leqslant f(x)\\leqslant ${miseEnEvidence(-y2)}$. `
            handleAnswers(this, i, {
              bareme: (listePoints) => [
                Math.min(listePoints[0], listePoints[1]),
                1,
              ],
              champ1: { value: -y3 },
              champ2: { value: -y2 },
            })
          } else {
            texteCorr = `Sur $[${x2}\\,;\\,${x4}]$, le minimum de $f$ est $${-y3}$ et le maximum est
          $${-y4}$. <br>
          Ainsi, pour $x\\in[${x2}\\,;\\,${x4}]$, ${sp(3)} $${miseEnEvidence(-y3)}\\leqslant f(x)\\leqslant ${miseEnEvidence(-y4)}$. `
            handleAnswers(this, i, {
              bareme: (listePoints) => [
                Math.min(listePoints[0], listePoints[1]),
                1,
              ],
              champ1: { value: -y3 },
              champ2: { value: -y4 },
            })
          }
        }
      }
      if (this.questionJamaisPosee(i, x1, y1, x2, y2)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        this.canReponseACompleter =
          '$\\ldots \\leqslant f(x) \\leqslant \\ldots $'
        this.listeCanEnonces.push(this.canEnonce)
        this.listeCanReponsesACompleter.push(this.canReponseACompleter)
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
