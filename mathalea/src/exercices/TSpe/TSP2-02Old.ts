import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  compteOccurences,
  enleveDoublonNum,
} from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { numAlpha, sp } from '../../lib/outils/outilString'
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
export const uuid = 'dabbf'

/**
 * @author Stéphane Guyon
 */

export const refs = {
  'fr-fr': [],
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

    let nbDeQuestions = typesDeQuestionsDisponibles.length
    if (compteOccurences(typesDeQuestionsDisponibles, 1) > 0) nbDeQuestions++

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let r, b, n, k, p, q, Xzero
      do {
        r = randint(4, 11) // nombre de boules rouges
        b = randint(4, 11, r) // nombre de boules bleues
        n = randint(4, r + b - 1) // nombre de tirages
        k = randint(3, n - 1) // nombre de succès

        p = new FractionEtendue(r, r + b)
        q = new FractionEtendue(b, r + b)
        Xzero = new FractionEtendue(b ** n, (r + b) ** n)
      } while (Xzero.valeurDecimale < 0.01)
      if (this.questionJamaisPosee(i, r, b, n, k)) {
        const esp = p.multiplieEntier(n)

        let texte = `Une urne contient $${r}$ boules rouges et $${b}$ boules bleues. On effectue $${n}$ tirages successifs avec remise.`
        texte +=
          '<br>On note $X$ la variable aléatoire qui compte le nombre de boules rouges obtenues.<br>'
        texte +=
          numAlpha(0) +
          ' Déterminer la loi de probabilité suivie par la variable aléatoire $X$.<br>'
        // let texteCorr = `${texteGras('1. Déterminer la loi de probabilité suivie par la variable aléatoire $X$.<br>')}`
        let texteCorr = ''
        texteCorr +=
          numAlpha(0) +
          `Les tirages sont identiques et indépendants puisque chaque tirage est effectué avec remise.<br>
      Il y a $${r}$ boules rouges pour un total de $${r + b}$ boules dans l'urne.<br>
      La probabilité d'obtenir une boule rouge lors d'un tirage est donc $p = ${p.texFractionSimplifiee}$ .<br>
      Si on appelle succès le fait d'obtenir une boule rouge, l'expérience consiste à répéter $${n}$ fois une épreuve de Bernoulli de paramètre $p = ${p.texFractionSimplifiee}$.`
        texteCorr += `<br>On a donc $${miseEnEvidence(`X \\sim \\mathcal B\\left(${n}\\,;\\,${p.texFractionSimplifiee}\\right)`, bleuMathalea)}$.<br>`
        let texteApres = sp(5) + '(Arrondir au centième.)'
        let indiceInteractif = 0
        for (let j = 0; j < typesDeQuestionsDisponibles.length; j++) {
          texte += numAlpha(j + 1)
          texteCorr += numAlpha(j + 1)
          switch (typesDeQuestionsDisponibles[j]) {
            case 1:
              {
                texte += 'Calculer $P(X=0)$ et en déduire $P(X>0)$.<br>'
                // texteCorr += `${texteGras('2. Calculer $P(X=0)$ puis $P(X>0)$.<br>')}`
                const reponseNum0 = arrondi(Xzero.valeurDecimale, 2)
                const reponseNum1 = arrondi(1 - Xzero.valeurDecimale, 2)
                texteCorr += `On sait que la probabilité d'avoir $k$ succès quand $X$ suit une loi binomiale de paramètre $n$ et $p$ est :<br>
      $\\mathrm{P}(X=k)=\\displaystyle\\binom{n}{k}\\times p^k\\times (1-p)^{n-k}$.<br> 
      ce qui donne dans notre situation : $\\mathrm{P}(X=k)=\\displaystyle\\binom{${n}}{k}\\times \\left(${p.texFractionSimplifiee}\\right)^k\\times \\left(${q.texFractionSimplifiee}\\right)^{${n}-k}\\quad$ (pour $0\\leqslant k\\leqslant ${n}$).<br> 
      Pour $k=0$, on a $\\mathrm{P}(X=0) = \\displaystyle\\binom{${n}}{0}\\times \\left(${p.texFractionSimplifiee}\\right)^0\\times \\left(${q.texFractionSimplifiee}\\right)^{${n}}$.<br>
      Par calcul, on obtient que $\\mathrm{P}(X=0)\\approx ${miseEnEvidence(texNombre(reponseNum0))}$.<br>`
                texteCorr += `Et comme $\\mathrm{P}(X>0) = 1 - \\mathrm{P}(X=0)$, on en déduit que $\\mathrm{P}(X>0) \\approx ${miseEnEvidence(texNombre(reponseNum1))}$.<br>`
                if (this.interactif) {
                  texte += ajouteChampTexteMathLive(
                    this,
                    i * nbDeQuestions + indiceInteractif,
                    KeyboardType.clavierNumbers,
                    { texteAvant: `$P(X=0)=$`, texteApres },
                  )
                  texte += '<br>'
                  texte += ajouteChampTexteMathLive(
                    this,
                    i * nbDeQuestions + indiceInteractif + 1,
                    KeyboardType.clavierNumbers,
                    { texteAvant: `$P(X>0)=$`, texteApres },
                  )
                  texte += '<br>'
                  handleAnswers(this, i * nbDeQuestions + indiceInteractif, {
                    reponse: {
                      value: reponseNum0,
                      options: {
                        nombreDecimalSeulement: true,
                      },
                    },
                  })
                  handleAnswers(
                    this,
                    i * nbDeQuestions + indiceInteractif + 1,
                    {
                      reponse: {
                        value: reponseNum1,
                        options: {
                          nombreDecimalSeulement: true,
                        },
                      },
                    },
                  )
                }
                indiceInteractif = indiceInteractif + 2
              }
              break
            case 2:
              {
                texte += `Calculer $P(X=${k})$.<br>`
                // texteCorr += `${texteGras(`3. Calculer $P(X=${k})$.<br>`)}`
                texteCorr += `On sait que  $P(X=${k}) = \\displaystyle\\binom{${n}}{${k}}\\times \\left(${p.texFractionSimplifiee}\\right)^{${k}}\\times \\left(${q.texFractionSimplifiee}\\right)^{${n - k}}$.<br>`
                const bino =
                  factorielle(n) / (factorielle(k) * factorielle(n - k))
                const reponseNum = arrondi(
                  bino * p.valeurDecimale ** k * q.valeurDecimale ** (n - k),
                  2,
                )
                texteCorr += `Par calcul, on obtient que $P(X=${k})\\approx ${miseEnEvidence(texNombre(arrondi(reponseNum, 2)))}$.<br>`
                if (this.interactif) {
                  texte += ajouteChampTexteMathLive(
                    this,
                    i * nbDeQuestions + indiceInteractif,
                    KeyboardType.clavierNumbers,
                    { texteAvant: `$P(X=${k})=$`, texteApres },
                  )
                  texte += '<br>'
                  handleAnswers(this, i * nbDeQuestions + indiceInteractif, {
                    reponse: {
                      value: reponseNum,
                      options: {
                        nombreDecimalSeulement: true,
                      },
                    },
                  })
                }
                indiceInteractif++
              }
              break
            default:
              {
                // texte += "Calculer l'espérance $E(X)$ et interpréter ce résultat."
                texte += "Calculer l'espérance $\\mathrm{E}(X)$.<br>"
                // texteCorr += `${texteGras("4. Calculer l'espérance $E(X)$ et interprétez ce résultat.<br>")}`
                const reponse = esp.texFractionSimplifiee
                texteCorr += `On sait que l'espérance de $X \\sim \\mathcal B\\left(n\\,;\\,p\\right)$ est donnée par $\\mathrm{E}(X) = n\\,p $.<br>
                On obtient donc $\\mathrm{E}(X)= ${n}\\times ${p.texFractionSimplifiee}$ et finalement $\\mathrm{E}(X) = ${miseEnEvidence(reponse)}$.<br>`
                texteApres = sp(5) + '(Saisir la valeur exacte.)'
                if (this.interactif) {
                  texte += ajouteChampTexteMathLive(
                    this,
                    i * nbDeQuestions + indiceInteractif,
                    KeyboardType.clavierNumbers,
                    { texteAvant: `$E(X)=$`, texteApres },
                  )
                  texte += '<br>'
                  handleAnswers(this, i * nbDeQuestions + indiceInteractif, {
                    reponse: {
                      value: reponse,
                      options: {
                        nombreDecimalSeulement: true,
                        fractionEgale: true,
                      },
                    },
                  })
                }
                indiceInteractif++
              }
              break
          }
        }

        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }

    listeQuestionsToContenu(this)
  }
}
