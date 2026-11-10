// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 87538 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { tableauColonneLigne } from '../../lib/2d/tableau'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
export const titre =
  'Résoudre une équation de congruence du type $ax \\equiv b \\,[k]$'
export const interactifReady = true

export const dateDePublication = '26/11/2025'
export const uuid = '87538'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
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

export default class ExerciceEquationAxCongruenceOld extends Exercice {
  constructor() {
    super()
    this.consigne = ''
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      // k entre 3 et 8
      const k = randint(3, 8)

      // a dans [-5,5] sans -1,0,1 et pgcd(a,k)=1 pour équation du type ax - b[k]
      const possibles = [-5, -4, -3, -2, 2, 3, 4, 5]
      let a: number
      do a = possibles[randint(0, possibles.length - 1)]
      while (pgcd(a, k) !== 1)

      // b entre 0 et k−1
      const b = randint(0, k - 1)

      // inverse de a modulo k
      const aMod = mod(a, k)
      let invA = 1
      for (let t = 1; t < k; t++) {
        if (mod(aMod * t, k) === 1) {
          invA = t
          break
        }
      }

      const r = mod(invA * b, k)

      // Construction du tableau (compatible HTML / LaTeX)
      const entetesColonnes = [
        `x \\equiv \\ldots [${k}]`,
        ...Array.from({ length: k }, (_, n) =>
          n === r ? miseEnEvidence(n) : `${n}`,
        ),
      ]
      const entetesLignes = [`${a}x \\equiv \\ldots [${k}]`]
      const cellules = [
        ...Array.from({ length: k }, (_, n) => {
          const valeur = mod(a * n, k)
          return valeur === b
            ? miseEnEvidence(valeur, bleuMathalea)
            : `${valeur}`
        }),
      ]
      const style: { [key: string]: string } = {
        L0C0: '#f4f4f4',
        LC0: '#f5f5f5',
      }
      for (let col = 0; col < k; col++) {
        style[`L0C${col + 1}`] = '#f4f4f4'
      }
      style[`L1C${r + 1}`] = '#fde7dd'
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
Résoudre dans $\\mathbb{Z}$ l'équation  :  
$${a}x \\equiv ${b} \\,[${k}]$.<br> `

      // Correction
      let texteCorr = ''
      texteCorr += `On cherche les entiers $x$ tels que $${a}x \\equiv ${b} \\,[${k}]$.<br>`
      texteCorr += `On procède à une disjonction des cas en dressant une table de congruence modulo $${k}$ :<br>`
      texteCorr += table
      texteCorr += `<br>On en déduit que $x \\equiv ${miseEnEvidence(r)} \\,[${k}]$.`
      texteCorr += `<br>On vérifie réciproquement que si $x \\equiv ${r} \\,[${k}]$ alors $${a}x \\equiv ${b} \\,[${k}]$.`
      texteCorr += `<br>L'ensemble des solutions est donc : $${miseEnEvidence(`S=\\{  ${r} + ${k}n, n \\in \\mathbb{Z} \\}`, bleuMathalea)}$. `

      if (this.questionJamaisPosee(i, texte)) {
        // Question affichée + champ interactif
        this.listeQuestions[i] =
          texte +
          ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers, {
            texteAvant: `<br>$x \\equiv ~~$`,
            texteApres: `$~[${k}]$.`,
          })

        this.listeCorrections[i] = texteCorr

        handleAnswers(this, i, {
          reponse: { value: `${r}` },
        })

        i++
      }
      cpt++
    }

    listeQuestionsToContenu(this)
  }
}
