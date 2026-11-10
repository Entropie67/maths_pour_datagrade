import { tableauColonneLigne } from '../../lib/2d/tableau'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Déterminer l'inverse d'un entier modulo k"
// Bug : Si on écrit $k$ dans le titre alors inverse s'écrit en mode maths
export const interactifReady = true

export const dateDePublication = '27/11/2025'
export const uuid = '42f60'

export const refs = {
  'fr-fr': ['TEA1-34'],
  'fr-ch': [],
}
/**
 *
 * @author Stéphane Guyon

*/

// modulo positif
function mod(n: number, k: number): number {
  return ((n % k) + k) % k
}

// pgcd
function pgcd(a: number, b: number): number {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b !== 0) {
    const t = b
    b = a % b
    a = t
  }
  return a
}

export default class ExerciceInverseModulo extends Exercice {
  constructor() {
    super()
    this.consigne = ''
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      // k entre 3 et 10
      const k = randint(3, 10)

      // a dans [-9, 9] sans -1,0,1 et pgcd(a,k)=1 pour assurer l'inversibilité
      const possibles = [-9, -8, -7, -6, -5, -4, -3, -2, 2, 3, 4, 5, 6, 7, 8, 9]
      let a: number
      do a = possibles[randint(0, possibles.length - 1)]
      while (pgcd(a, k) !== 1)

      // inverse de a modulo k
      const aMod = mod(a, k)
      let invA = 1
      for (let t = 1; t < k; t++) {
        if (mod(aMod * t, k) === 1) {
          invA = t
          break
        }
      }

      // Construction du tableau (compatible HTML / LaTeX)
      const entetesColonnes = [
        `x \\equiv \\ldots [${k}]`,
        ...Array.from({ length: k }, (_, n) =>
          n === invA ? miseEnEvidence(n) : `${n}`,
        ),
      ]
      const entetesLignes = [`${a}x \\equiv \\ldots [${k}]`]
      const cellules = [
        ...Array.from({ length: k }, (_, n) => {
          const valeur = mod(a * n, k)
          return valeur === 1 ? miseEnEvidence(valeur, '#2563a5') : `${valeur}`
        }),
      ]
      const style: { [key: string]: string } = {
        L0C0: '#f4f4f4',
        LC0: '#f5f5f5',
      }
      for (let col = 0; col < k; col++) {
        style[`L0C${col + 1}`] = '#f4f4f4'
      }
      style[`L1C${invA + 1}`] = '#fde7dd'
      const table = tableauColonneLigne(
        entetesColonnes,
        entetesLignes,
        cellules,
        1.2,
        true,
        this.numeroExercice ?? 0,
        i,
        this.interactif,
        style,
      )

      // Énoncé
      const texte = `
Déterminer l'inverse de $${a}$ modulo $${k}$. <br>`

      // Correction
      let texteCorr = ''
      texteCorr += `Déterminer l'inverse de $${a}$ modulo $${k}$, c'est trouver un entier $x$ tel que $${a}x \\equiv 1 \\,[${k}]$.<br>`
      texteCorr += `On dresse pour cela une table des congruences modulo $${k}$ :<br>`
      texteCorr += table
      texteCorr += `<br>On observe que si $x\\equiv ${invA} [${k}]$ alors $${a}\\times${invA} \\equiv 1 \\,[${k}]$.`
      texteCorr += `<br>Donc l'inverse de $${a}$ modulo $${k}$ est $${miseEnEvidence(`${invA}`)}$.`

      if (this.questionJamaisPosee(i, texte)) {
        // Question affichée + champ interactif
        this.listeQuestions[i] =
          texte +
          ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers, {
            texteAvant: `L'inverse de $${a}$ modulo $${k}$ est`,
            texteApres: ``,
          })

        this.listeCorrections[i] = texteCorr

        handleAnswers(this, i, {
          reponse: { value: `${invA}` },
        })

        i++
      }
      cpt++
    }

    listeQuestionsToContenu(this)
  }
}
