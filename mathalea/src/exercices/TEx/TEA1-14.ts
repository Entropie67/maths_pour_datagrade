import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf0,
  reduireAxPlusB,
} from '../../lib/outils/ecritures'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../lib/outils/embellissements'
import { listeDesDiviseurs } from '../../lib/outils/primalite'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  "Déterminer l'ensemble des entiers naturels $n$ tels que $an+b$ divise $cn+d$"
export const interactifReady = true

export const dateDePublication = '08/09/2026'
export const uuid = '83362'

export const refs = {
  'fr-fr': ['TEA1-14'],
  'fr-ch': [],
}
/**
 *
 * @author Arnaud Meistermann

*/

// renvoie [g, u, v] tels que a*u + c*v = g = pgcd(a,c)
function pgcdEtendu(a: number, c: number): [number, number, number] {
  if (c === 0) return [a, 1, 0]
  const [g, u1, v1] = pgcdEtendu(c, a % c)
  return [g, v1, u1 - Math.floor(a / c) * v1]
}

// Génère une instance aléatoire de l'exercice "an+b divise cn+d"
function genererDivisibiliteBezout() {
  const NICE_N = [12, 18, 24, 30, 36, 48, -12, -18, -24, -30]

  let a: number, c: number, N: number, g: number, u: number, v: number
  let b: number, d: number, k: number
  do {
    do {
      a = randint(2, 6)
      c = randint(1, 6)
      N = choice(NICE_N)
      ;[g, u, v] = pgcdEtendu(a, c)
    } while (N % g !== 0 || a === c)

    k = N / g
    const d0 = u * k
    const b0 = -v * k

    // on décale b0 vers [0, borne] via le paramètre t
    const pasB = a / g
    const pasD = c / g
    const borne = 12
    let t = Math.ceil((0 - b0) / pasB)
    b = b0 + pasB * t
    d = d0 + pasD * t
    while (b > borne) {
      t -= 1
      b -= pasB
      d -= pasD
    }
    while (b < 0) {
      t += 1
      b += pasB
      d += pasD
    }
    if (b === 0) {
      t += 1
      b += pasB
      d += pasD
      while (b > borne) {
        t -= 1
        b -= pasB
        d -= pasD
      }
    }
    // on impose a et b premiers entre eux
  } while (pgcdEtendu(a, b)[0] !== 1)

  // recherche des candidats n (X divise k = N/pgcd(a,c), condition nécessaire optimisée)
  // puis des solutions réelles (X divise Y)
  const diviseurs = listeDesDiviseurs(Math.abs(k))
  const candidats = diviseurs
    .filter((delta) => delta >= b && (delta - b) % a === 0)
    .map((delta) => (delta - b) / a)
    .sort((n1, n2) => n1 - n2)
  // X divise k est nécessaire mais pas suffisant : on vérifie que X divise bien Y
  const solutions = candidats.filter((n) => (c * n + d) % (a * n + b) === 0)

  return { a, b, c, d, N, g, k, candidats, solutions }
}

export default class ExerciceDivisibiliteBezout extends Exercice {
  constructor() {
    super()
    this.consigne = ''
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const { a, b, c, d, g, k, candidats, solutions } =
        genererDivisibiliteBezout()
      const expX = reduireAxPlusB(a, b, 'n')
      const expY = reduireAxPlusB(c, d, 'n')
      const ag = a / g
      const cg = c / g
      const nCoef = ag * c // = cg * a, coefficient de n qui s'annule dans la combinaison

      const texte = `Déterminer l'ensemble des entiers naturels $n$ tels que $${expX}$ divise $${expY}$.`

      let texteCorr = ''
      texteCorr += `${texteEnCouleur('Analyse.', bleuMathalea)}<br>`
      texteCorr += `Soit $n\\in \\mathbb{N}$. Supposons que $${expX}$ divise $${expY}$.<br>`
      texteCorr += `Comme $${expX}$ divise aussi $${expX}$, $${expX}$ divise toute combinaison linéaire de $${expX}$ et $${expY}$.<br>`
      texteCorr += `En particulier, $${expX}$ divise $${cg}(${expX})-${ag}(${expY})$.<br>`
      const lignesCalcul = [
        `${cg}(${expX})-${ag}(${expY})&=${nCoef}n${ecritureAlgebrique(cg * b)}${ecritureAlgebrique(-nCoef)}n${ecritureAlgebriqueSauf0(-ag * d)}`,
      ]
      if (d !== 0) {
        lignesCalcul.push(`&=${cg * b}${ecritureAlgebriqueSauf0(-ag * d)}`)
      }
      lignesCalcul.push(`&=${-k}`)
      texteCorr += `$\\begin{aligned}
${lignesCalcul.join('\\\\\n')}
\\end{aligned}$<br>`

      texteCorr += `Donc $${expX}$ divise $${-k}$.<br>`
      if (-k < 0) {
        texteCorr += ` Ainsi $${expX}$ divise $${Math.abs(k)}$.<br>`
      }

      const absK = Math.abs(k)
      texteCorr += `Il nous faut trouver les diviseurs de $${absK}$ de la forme $${expX}$ avec $n\\geqslant 0$.<br>`
      if (candidats.length === 0) {
        texteCorr += `Aucun diviseur ne convient. Il n'y a donc aucune solution.<br>`
      } else {
        const lignesAxPlusB: string[] = []
        for (let n = 0; a * n + b <= absK; n++) {
          lignesAxPlusB.push(
            `\\text{pour } n=${n},\\quad ${expX}&=${a * n + b}`,
          )
        }
        texteCorr += `$\\begin{aligned}
${lignesAxPlusB.join('\\\\\n')}
\\end{aligned}$<br>`
        const valeursDiv = candidats.map((n) => a * n + b)
        if (valeursDiv.length === 0) {
          texteCorr += `Aucune de ces valeurs ne divise $${absK}$.<br>`
        } else if (valeursDiv.length === 1) {
          texteCorr += `La seule de ces valeurs qui divise $${absK}$ est $${valeursDiv[0]}$.<br>`
        } else {
          texteCorr += `Parmi ces valeurs, celles qui divisent $${absK}$ sont : $${valeursDiv.join('\\,;\\,')}$.<br>`
        }
        if (candidats.length === 1) {
          texteCorr += `La valeur de $n$ possible est donc $${candidats[0]}$.<br>`
        } else {
          texteCorr += `Les valeurs de $n$ possibles sont donc : $${candidats.join('\\,;\\,')}$.<br>`
        }
        texteCorr += `${texteEnCouleur('Synthèse.', bleuMathalea)}<br>`
        texteCorr += `Réciproquement,<br>`
        for (const n of candidats) {
          const x = a * n + b
          const y = c * n + d
          if (y % x === 0) {
            texteCorr += `Pour $n=${n}$ : $${expX}=${x}$ et $${expY}=${y}$. Donc $${expX}$ divise bien $${expY}$.<br>`
          } else {
            texteCorr += `Pour $n=${n}$ : $${expX}=${x}$ et $${expY}=${y}$. Or, $${x}$ ne divise pas $${y}$. Donc cette valeur ne convient pas.<br>`
          }
        }
        texteCorr += `<br>`
      }
      const reponse =
        solutions.length === 0 ? '\\emptyset' : `\\{${solutions.join(';')}\\}`
      texteCorr += `$S=${miseEnEvidence(reponse)}$.`

      if (this.questionJamaisPosee(i, a, b, c, d)) {
        this.listeQuestions[i] =
          texte +
          '<br>' +
          ajouteChampTexteMathLive(this, i, KeyboardType.clavierEnsemble, {
            texteAvant: ' $S=$',
          })
        this.listeCorrections[i] = texteCorr

        handleAnswers(this, i, {
          reponse: { value: reponse, options: { ensembleDeNombres: true } },
        })

        i++
      }
      cpt++
    }

    listeQuestionsToContenu(this)
  }
}
