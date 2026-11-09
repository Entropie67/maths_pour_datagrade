import { bleuMathalea } from '../../lib/colors'
import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { enleveDoublonNum } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { numAlpha } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import {
  factorielle,
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Tirer des boules avec remise dans une urne'
export const interactifReady = true

export const dateDePublication = '18/11/2024'
export const dateDeModifImportante = '10/12/2025'
export const uuid = 'daabf'

/**
 * @author Stéphane Guyon
 */

export const refs = {
  'fr-fr': ['TSP2-20', 'TCP1-30'],
  'fr-ch': [],
}

export default class LoiBinomialeUrne extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets  :',
        '1 : $P(X>0)$',
        '2 : $P(X=k)$',
        '3 : Espérance de X',
        '4 : Mélange',
      ].join('\n'),
    ]
    this.sup = '4'
    this.spacing = 2
    this.spacingCorr = 2
  }

  nouvelleVersion() {
    let typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      max: 3,
      melange: 4,
      defaut: 4,
      nbQuestions: 3,
      shuffle: false,
    }).map(Number)
    typesDeQuestionsDisponibles = enleveDoublonNum(typesDeQuestionsDisponibles)

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let r, b, n, k, p, q, Xzero
      let texte = ''

      do {
        r = randint(4, 11) // nombre de boules rouges
        b = randint(4, 11, r) // nombre de boules bleues
        n = randint(4, r + b - 1) // nombre de tirages
        k = randint(3, n - 1) // nombre de succès

        p = new FractionEtendue(r, r + b)
        q = new FractionEtendue(b, r + b)
        Xzero = new FractionEtendue(b ** n, (r + b) ** n)
      } while (Xzero.valeurDecimale < 0.01)
      const esp = p.multiplieEntier(n)

      texte = `Une urne contient $${r}$ boules rouges et $${b}$ boules bleues. On effectue $${n}$ tirages successifs avec remise.`
      const questions: string[] = []
      const texteApres = '(Arrondir au centième.)'

      const champsOptions: object[] = [
        {
          champ1: { keyboard: KeyboardType.clavierFullOperations },
        },
      ]

      questions.push(
        this.interactif
          ? `On admet que $X$ suit une loi binomiale de paramètres $n$ et $p$. Quelles sont les valeurs de $n$ et $p$ ?\n$n=$`
          : `Déterminer la loi de probabilité suivie par la variable aléatoire $X$ qui compte le nombre de boules rouges obtenues.`,
      )
      if (this.interactif) {
        questions.push(`$p=$`)
      }
      champsOptions.push(
        {
          keyboard: KeyboardType.clavierDeBaseAvecFraction,
        },
        {
          keyboard: KeyboardType.clavierDeBaseAvecFraction,
        },
      )
      if (typesDeQuestionsDisponibles.includes(1)) {
        questions.push(
          `Calculer $P(X=0)$.${this.interactif ? `\n$P(X=0)\\approx$` : ''}`,
        )
        questions.push(
          `En déduire $P(X>0)$.${this.interactif ? `\n$P(X>0)\\approx$` : ''}`,
        )
        champsOptions.push(
          { keyboard: KeyboardType.clavierNumbers, texteApres },
          { keyboard: KeyboardType.clavierNumbers, texteApres },
        )
      }
      if (typesDeQuestionsDisponibles.includes(2)) {
        questions.push(
          `Calculer $P(X=${k})$.${this.interactif ? `\n$P(X=${k})\\approx$` : ''}`,
        )
        champsOptions.push({
          keyboard: KeyboardType.clavierNumbers,
          texteApres,
        })
      }
      if (typesDeQuestionsDisponibles.includes(3)) {
        questions.push(
          `Calculer l'espérance $E(X)$.${this.interactif ? `\n$E(X)=$` : ''}`,
        )
        champsOptions.push({
          keyboard: KeyboardType.clavierNumbers,
        })
      }
      const dataTemplate =
        `a) ${questions[0]} %{champ1}\n${questions[1]} %{champ2}\n` +
        questions
          .slice(2)
          .map(
            (q, index) =>
              `${String.fromCharCode(98 + index)}) ${q} %{champ${index + 3}}`,
          )
          .join('\n')
      const dataOptions = champsOptions.reduce(
        (acc, options, index) =>
          Object.assign(acc, { [`champ${index + 1}`]: options }),
        {},
      )
      texte +=
        '<br>On note $X$ la variable aléatoire qui compte le nombre de boules rouges obtenues.<br>'
      texte += addMultiMathfield(this, i, {
        dataTemplate,
        dataOptions,
      })

      const corrections: string[] = [
        `Les tirages sont identiques et indépendants puisque chaque tirage est effectué avec remise.<br>
      Il y a $${r}$ boules rouges pour un total de $${r + b}$ boules dans l'urne.<br>
      La probabilité d'obtenir une boule rouge lors d'un tirage est donc $p = ${p.texFractionSimplifiee}$ .<br>
      Si on appelle succès le fait d'obtenir une boule rouge, l'expérience consiste à répéter $${n}$ fois une épreuve de Bernoulli de paramètre $p = ${p.texFractionSimplifiee}$.<br>
      On a donc $${miseEnEvidence(`X \\sim \\mathcal B\\left(${n}\\,;\\,${p.texFractionSimplifiee}\\right)`, bleuMathalea)}$.<br>
      Donc $n=${miseEnEvidence(n)}$ et $p=${miseEnEvidence(p.texFractionSimplifiee)}$.`,
      ]
      const reponseNum0 = arrondi(Xzero.valeurDecimale, 2)
      const reponseNum1 = arrondi(1 - Xzero.valeurDecimale, 2)
      if (typesDeQuestionsDisponibles.includes(1)) {
        corrections.push(`On sait que la probabilité d'avoir $k$ succès quand $X$ suit une loi binomiale de paramètre $n$ et $p$ est :<br>
      $\\mathrm{P}(X=k)=\\displaystyle\\binom{n}{k}\\times p^k\\times (1-p)^{n-k}$.<br> 
      ce qui donne dans notre situation : $\\mathrm{P}(X=${k})=\\displaystyle\\binom{${n}}{k}\\times \\left(${p.texFractionSimplifiee}\\right)^k\\times \\left(${q.texFractionSimplifiee}\\right)^{${n}-k}\\quad$ (pour $0\\leqslant k\\leqslant ${n}$).<br> 
      Pour $k=0$, on a $\\mathrm{P}(X=0) = \\displaystyle\\binom{${n}}{0}\\times \\left(${p.texFractionSimplifiee}\\right)^0\\times \\left(${q.texFractionSimplifiee}\\right)^{${n}}$.<br>
      Par calcul, on obtient que $\\mathrm{P}(X=0)\\approx ${miseEnEvidence(texNombre(reponseNum0))}$.`)
      }
      const bino = factorielle(n) / (factorielle(k) * factorielle(n - k))
      const reponseNum = arrondi(
        bino * p.valeurDecimale ** k * q.valeurDecimale ** (n - k),
        2,
      )
      if (typesDeQuestionsDisponibles.includes(1)) {
        corrections.push(
          `Et comme $\\mathrm{P}(X>0) = 1 - \\mathrm{P}(X=0)$, on en déduit que $\\mathrm{P}(X>0) \\approx ${miseEnEvidence(texNombre(reponseNum1))}$.`,
        )
      }
      if (typesDeQuestionsDisponibles.includes(2)) {
        corrections.push(`On sait que  $P(X=${k}) = \\displaystyle\\binom{${n}}{${k}}\\times \\left(${p.texFractionSimplifiee}\\right)^{${k}}\\times \\left(${q.texFractionSimplifiee}\\right)^{${n - k}}$.<br>
          Par calcul, on obtient que $P(X=${k})\\approx ${miseEnEvidence(texNombre(arrondi(reponseNum, 2)))}$.`)
      }
      if (typesDeQuestionsDisponibles.includes(3)) {
        corrections.push(`On sait que l'espérance de $X \\sim \\mathcal B\\left(n\\,;\\,p\\right)$ est donnée par $\\mathrm{E}(X) = n\\,p $.<br>
          On obtient donc $\\mathrm{E}(X)= ${n}\\times ${p.texFractionSimplifiee}$ et finalement $\\mathrm{E}(X) = ${miseEnEvidence(esp.texFractionSimplifiee)}$.`)
      }

      const reponses: (string | number)[] = [n, p.texFractionSimplifiee]
      if (typesDeQuestionsDisponibles.includes(1)) {
        reponses.push(reponseNum0, reponseNum1)
      }
      if (typesDeQuestionsDisponibles.includes(2)) {
        reponses.push(reponseNum)
      }
      if (typesDeQuestionsDisponibles.includes(3)) {
        reponses.push(esp.texFractionSimplifiee)
      }
      const bareme = (listePoints: number[]) => {
        const petitA = Math.min(listePoints[0], listePoints[1])
        const nbPoints = listePoints.length
        let somme = petitA
        for (let k = 2; k < nbPoints; k++) {
          somme += listePoints[k]
        }
        return [somme, nbPoints - 1]
      }

      const objetsReponses = Object.assign(
        { bareme },
        ...reponses.map((r, index) => ({
          [`champ${index + 1}`]: { value: r },
        })),
      )
      handleAnswers(this, i, objetsReponses, {
        formatInteractif: 'multi-mathfield',
      })

      if (this.questionJamaisPosee(i, r, b, n, k)) {
        this.listeQuestions.push(texte)
        this.listeCorrections.push(
          corrections.map((c, index) => `${numAlpha(index)} ${c}`).join('<br>'),
        )
        i++
      }
      cpt++
    }

    listeQuestionsToContenu(this)
  }
}
