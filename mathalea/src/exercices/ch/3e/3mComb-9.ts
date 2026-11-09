import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import { choice } from '../../../lib/outils/arrayOutils'
import {
    ecritureAlgebrique,
    ecritureParentheseSiNegatif,
    rienSi1,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import {
    factorielle,
    gestionnaireFormulaireTexte,
    listeQuestionsToContenu,
    randint,
} from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre = 'Utiliser le binôme de Newton'
export const dateDePublication = '05/02/2026'
export const interactifReady = true

export const uuid = 'cvt2e'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['3mComb-9'],
}

/**
 * Binôme de Newton - Développements et coefficients
 * @author Nathan Scheinmann
 */

function combinaison(n: number, k: number): number {
  if (k < 0 || k > n) return 0
  return Math.round(factorielle(n) / (factorielle(k) * factorielle(n - k)))
}

export default class BinomeNewton extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets :',
        "1 : Coefficient d'un terme (combinaison)",
        '2 : Somme de coefficients binomiaux (combinaison)',
        '3 : Développement simplifié (combinaison)',
        '4 : Terme général (combinaison)',
        '5 : Mélange',
      ].join('\n'),
    ]
    this.sup = '5'
  }

  nouvelleVersion() {
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 4,
      melange: 5,
      defaut: 5,
      listeOfCase: ['coefficient', 'somme', 'developpement', 'terme'],
      nbQuestions: this.nbQuestions,
      shuffle: true,
    })

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let reponse = 0

      const typeQuestion = listeTypeDeQuestions[i]

      if (typeQuestion === 'coefficient') {
        const variante = choice(['xPuissanceK', 'avecCoeffs'])

        if (variante === 'xPuissanceK') {
          const n = randint(3, 10)
          const k = randint(2, n - 2)
          reponse = combinaison(n, k)

          texte = `Dans le développement de $(1+x)^{${n}}$, quel est le coefficient de $x^{${k}}$ ?`

          texteCorr = `D'après le binôme de Newton, $(1+x)^{${n}} = \\sum_{j=0}^{${n}} C_j^{${n}} x^j$.<br>`
          texteCorr += `Le coefficient de $x^{${k}}$ est la combinaison :<br>`
          texteCorr += `$C_{${k}}^{${n}} = \\dfrac{${n}!}{${k}! \\times ${n - k}!} = ${miseEnEvidence(texNombre(reponse, 0))}$`
        } else {
          const n = randint(4, 7)
          const k = randint(2, n - 2)
          const a = randint(1, 3)
          const b = choice([-3, -2, -1, 1, 2, 3])

          reponse = combinaison(n, k) * Math.pow(a, n - k) * Math.pow(b, k)

          // Display formatting
          const bTexte = `${ecritureAlgebrique(b)}x`
          const bPar = ecritureParentheseSiNegatif(b)

          const bFactor = b === 1 ? 'x' : b === -1 ? '(-x)' : `(${b}x)`

          texte = `Dans le développement de $(${a}${bTexte})^{${n}}$, quel est le coefficient de $x^{${k}}$ ?`

          const bPowK = Math.pow(b, k)
          texteCorr = `D'après le binôme de Newton :<br>`
          texteCorr += `$(${a}${bTexte})^{${n}} = \\sum_{j=0}^{${n}} C_j^{${n}} \\cdot ${a}^{${n}-j} \\cdot ${bFactor}^j$<br><br>`
          texteCorr += `Le terme en $x^{${k}}$ correspond à $j = ${k}$ (combinaison $C_{${k}}^{${n}}$) :<br>`
          texteCorr += `$\\begin{aligned}C_{${k}}^{${n}} \\cdot ${ecritureParentheseSiNegatif(a)}^{${n - k}} \\cdot ${bPar}^{${k}} &= ${combinaison(n, k)} \\times ${Math.pow(a, n - k)} \\times ${ecritureParentheseSiNegatif(bPowK)}\\\\`
          texteCorr += `&= ${miseEnEvidence(texNombre(reponse, 0))}\\end{aligned}$`
        }
      } else if (typeQuestion === 'somme') {
        const variante = choice(['simple', 'alternee', 'partielle', 'ponderee'])

        if (variante === 'simple') {
          const n = randint(4, 12)
          reponse = Math.pow(2, n)

          texte = `Calculer $\\displaystyle\\sum_{k=0}^{${n}} C_k^{${n}}$.`

          texteCorr = `En appliquant le binôme de Newton à $(1+1)^{${n}}$ :<br>`
          texteCorr += `$2^{${n}} = \\sum_{k=0}^{${n}} C_k^{${n}} \\cdot 1^{${n}-k} \\cdot 1^k = \\sum_{k=0}^{${n}} C_k^{${n}}$<br><br>`
          texteCorr += `Donc $\\sum_{k=0}^{${n}} C_k^{${n}} = 2^{${n}} = ${miseEnEvidence(texNombre(reponse, 0))}$`
        } else if (variante === 'alternee') {
          const n = randint(4, 12)
          reponse = 0

          texte = `Calculer $\\displaystyle\\sum_{k=0}^{${n}} (-1)^k C_k^{${n}}$.`

          texteCorr = `En appliquant le binôme de Newton à $(1-1)^{${n}}$ :<br>`
          texteCorr += `$0^{${n}} = \\sum_{k=0}^{${n}} C_k^{${n}} \\cdot 1^{${n}-k} \\cdot (-1)^k = \\sum_{k=0}^{${n}} (-1)^k C_k^{${n}}$<br><br>`
          texteCorr += `Donc $\\sum_{k=0}^{${n}} (-1)^k C_k^{${n}} = ${miseEnEvidence(texNombre(reponse, 0))}$`
        } else if (variante === 'partielle') {
          const n = randint(4, 12)
          const pairs = choice([true, false])

          reponse = Math.pow(2, n - 1)

          if (pairs) {
            texte = `Calculer $C_0^{${n}} + C_2^{${n}} + C_4^{${n}} + \\ldots$`

            texteCorr = `On additionne les relations du binôme de Newton :<br>`
            texteCorr += `$(1+1)^{${n}} = \\sum_{k=0}^{${n}} C_k^{${n}} = 2^{${n}}$<br>`
            texteCorr += `$(1-1)^{${n}} = \\sum_{k=0}^{${n}} (-1)^k C_k^{${n}} = 0$<br><br>`
            texteCorr += `En additionnant : $2(C_0^{${n}} + C_2^{${n}} + \\ldots) = 2^{${n}}$<br>`
            texteCorr += `Donc $C_0^{${n}} + C_2^{${n}} + \\ldots = 2^{${n - 1}} = ${miseEnEvidence(texNombre(reponse, 0))}$`
          } else {
            texte = `Calculer $C_1^{${n}} + C_3^{${n}} + C_5^{${n}} + \\ldots$`

            texteCorr = `On utilise les relations du binôme de Newton :<br>`
            texteCorr += `$(1+1)^{${n}} = 2^{${n}}$ et $(1-1)^{${n}} = 0$<br><br>`
            texteCorr += `En soustrayant : $2(C_1^{${n}} + C_3^{${n}} + \\ldots) = 2^{${n}}$<br>`
            texteCorr += `Donc $C_1^{${n}} + C_3^{${n}} + \\ldots = 2^{${n - 1}} = ${miseEnEvidence(texNombre(reponse, 0))}$`
          }
        } else {
          // Somme pondérée
          const n = randint(4, 10)
          reponse = n * Math.pow(2, n - 1)

          texte = `Calculer $\\displaystyle\\sum_{k=0}^{${n}} k \\cdot C_k^{${n}}$.`

          texteCorr = `On dérive le binôme $(1+x)^{${n}} = \\sum_{k=0}^{${n}} C_k^{${n}} x^k$ par rapport à $x$ :<br>`
          texteCorr += `$${n}(1+x)^{${n - 1}} = \\sum_{k=1}^{${n}} k \\cdot C_k^{${n}} x^{k-1}$<br><br>`
          texteCorr += `En posant $x = 1$ :<br>`
          texteCorr += `$${n} \\cdot 2^{${n - 1}} = \\sum_{k=0}^{${n}} k \\cdot C_k^{${n}}$<br><br>`
          texteCorr += `Donc $\\sum_{k=0}^{${n}} k \\cdot C_k^{${n}} = ${n} \\times ${Math.pow(2, n - 1)} = ${miseEnEvidence(texNombre(reponse, 0))}$`
        }
      } else if (typeQuestion === 'developpement') {
        const n = randint(3, 6)
        const a = choice([1, 2, 3])
        const b = choice([-2, -1, 1, 2, 3])
        const k = randint(1, n - 1)

        reponse = combinaison(n, k) * Math.pow(a, n - k) * Math.pow(b, k)

        const bStr = ecritureAlgebrique(b)
        const aStr = rienSi1(a)

        texte = `Dans le développement de $(${rienSi1(a)}x${bStr})^{${n}}$, quel est le coefficient de $x^{${n - k}}$ ?`

        const bPowK = Math.pow(b, k)

        texteCorr = `$(${aStr}x${bStr})^{${n}} = \\sum_{j=0}^{${n}} C_j^{${n}} (${aStr}x)^{${n}-j} \\cdot (${b})^j$<br><br>`
        texteCorr += `Le terme en $x^{${n - k}}$ correspond à $j = ${k}$ (combinaison $C_{${k}}^{${n}}$) :<br>`
        texteCorr += `$\\begin{aligned}C_{${k}}^{${n}} \\cdot ${a}^{${n - k}} \\cdot (${b})^{${k}} &= ${combinaison(n, k)} \\times ${Math.pow(a, n - k)} \\times ${bPowK < 0 ? `(${bPowK})` : bPowK}\\\\`
        texteCorr += `&= ${miseEnEvidence(texNombre(reponse, 0))}\\end{aligned}$`
      } else {
        // Terme général
        const variante = choice(['trouverK', 'termeSansx'])

        if (variante === 'trouverK') {
          const n = randint(4, 10)
          const k = randint(2, n - 2)
          reponse = combinaison(n, k)

          texte = `Dans le développement de $\\left(x + \\dfrac{1}{x}\\right)^{${n}}$, donner le coefficient du terme en $x^{${n - 2 * k}}$.`

          texteCorr = `Le terme général est $C_j^{${n}} x^{${n}-j} \\cdot \\dfrac{1}{x^j} = C_j^{${n}} x^{${n}-2j}$.<br><br>`
          texteCorr += `Pour obtenir $x^{${n - 2 * k}}$, on résout $${n} - 2j = ${n - 2 * k}$, donc $j = ${k}$.<br>`
          texteCorr += `Le coefficient est la combinaison $C_{${k}}^{${n}} = \\dfrac{${n}!}{${k}! \\times ${n - k}!} = ${miseEnEvidence(texNombre(reponse, 0))}$`
        } else {
          const nPair = 2 * randint(2, 5)
          reponse = combinaison(nPair, nPair / 2)

          texte = `Dans le développement de $\\left(x + \\dfrac{1}{x}\\right)^{${nPair}}$, quel est le terme constant (sans $x$) ?`

          texteCorr = `Le terme général est $C_j^{${nPair}} x^{${nPair}-2j}$.<br>`
          texteCorr += `Le terme constant correspond à $${nPair} - 2j = 0$, soit $j = ${nPair / 2}$.<br><br>`
          texteCorr += `Le terme constant est la combinaison $C_{${nPair / 2}}^{${nPair}} = \\dfrac{${nPair}!}{${nPair / 2}! \\times ${nPair / 2}!} = ${miseEnEvidence(texNombre(reponse, 0))}$`
        }
      }

      if (this.interactif) {
        texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase, {
          texteAvant: '<br>',
        })
        handleAnswers(this, i, {
          reponse: { value: reponse.toString() },
        })
      }

      if (this.questionJamaisPosee(i, typeQuestion, reponse)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
