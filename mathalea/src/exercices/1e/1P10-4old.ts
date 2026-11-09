import { tableauColonneLigne } from '../../lib/2d/tableau'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, shuffle3tableaux } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
export const titre = 'Calculer une probabilité avec un tableau'
export const interactifReady = true

export const dateDePublication = '29/04/2025'

/**
 *
 * @author Gilles Mora
 */
export const uuid = 'faacc'

export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export default class CalculerProbaTableau extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.sup = 4
    this.spacing = 1.5
    this.spacingCorr = 3
  }

  nouvelleVersion() {
    // Tous les types de questions sont posées mais l'ordre diffère à chaque "cycle"

    for (
      let i = 0,
        texte,
        texteCorr,
        reponse,
        cpt = 0,
        pA,
        pB,
        nA,
        nB,
        Total,
        calcul,
        calculCorr,
        tableau,
        pBb,
        nAinterB,
        pAsachantBb,
        pBsachantA,
        pAbinterBb,
        pAbinterB,
        pAinterBb,
        pAinterB,
        pBsachantAb,
        pAb,
        pBbsachantA,
        listeEV,
        ev;
      i < this.nbQuestions && cpt < 50;
    ) {
      listeEV = [
        ['A', 'B'],
        ['A', 'C'],
        ['R', 'T'],
        ['K', 'L'],
        ['R', 'U'],
        ['S', 'T'],
      ]
      ev = choice(listeEV)
      nA = randint(27, 80)
      nB = randint(41, 70)
      nAinterB = randint(5, 20)
      Total = randint(160, 180)
      pA = new FractionEtendue(nA, Total) // 1
      pB = new FractionEtendue(nB, Total) // 2
      pBb = new FractionEtendue(Total - nB, Total) // 4
      pAb = new FractionEtendue(Total - nA, Total) // 3
      pAinterB = new FractionEtendue(nAinterB, Total) // 4
      pAinterBb = new FractionEtendue(nA - nAinterB, Total) // 1
      pAbinterBb = new FractionEtendue(Total - nA - nB + nAinterB, Total) // 2
      pAbinterB = new FractionEtendue(nB - nAinterB, Total) // 3
      pBsachantA = new FractionEtendue(nAinterB, nA) // 3
      pBbsachantA = new FractionEtendue(nA - nAinterB, nA) // 4
      pBsachantAb = new FractionEtendue(nB - nAinterB, Total - nA) // 1
      // pAbsachantBb = new FractionEtendue(Total - nA - nB + nAinterB, Total - nB)
      pAsachantBb = new FractionEtendue(nA - nAinterB, Total - nB) // 2

      tableau = tableauColonneLigne(
        ['', `${ev[0]}`, `\\overline{${ev[0]}}`, '\\text{Total}'],
        [`${ev[1]}`, `\\overline{${ev[1]}}`, '\\text{Total}'],
        [
          `${texNombre(nAinterB, 2)}`,
          `${texNombre(nB - nAinterB, 0)}`,
          `${texNombre(nB, 0)}`,
          `${texNombre(nA - nAinterB)}`,
          `${texNombre(Total - nA - nB + nAinterB)}`,
          `${texNombre(Total - nB)}`,
          `${texNombre(nA)}`,
          `${texNombre(Total - nA)}`,
          `${texNombre(Total)}`,
        ],
      )

      texte =
        "On donne le tableau d'effectifs suivant :<br>" +
        `${context.isHtml ? '' : '[1em]'}`
      texte += tableau + '<br>' + `${context.isHtml ? '' : '[1em]'}`
      switch (randint(1, 4)) {
        case 1: // PA, PAinterBb, PBsachantAb
          calcul = [
            `P(${ev[0]})`,
            `P(${ev[0]}\\cap \\overline{${ev[1]}})`,
            `P_{\\overline{${ev[0]}}}(${ev[1]})`,
          ]
          calculCorr = [
            `P(${ev[0]})=\\dfrac{\\text{Effectif de } ${ev[0]}}{\\text{Effectif total}}=${miseEnEvidence(pA.texFraction)}`,
            `P(${ev[0]}\\cap \\overline{${ev[1]}})=\\dfrac{\\text{Effectif de } ${ev[0]}\\cap \\overline{${ev[1]}}}{\\text{Effectif total}}=${miseEnEvidence(pAinterBb.texFraction)}`,
            `P_{\\overline{${ev[0]}}}(${ev[1]})=\\dfrac{\\text{Effectif de } \\overline{${ev[0]}}\\cap ${ev[1]}}{\\text{Effectif de }\\overline{${ev[0]}}}=${miseEnEvidence(pBsachantAb.texFraction)}`,
          ]
          reponse = [
            `${pA.texFraction}`,
            `${pAinterBb.texFraction}`,
            `${pBsachantAb.texFraction}`,
          ]
          shuffle3tableaux(calcul, calculCorr, reponse)
          texte += ` Calculer $${calcul[0]}$, $${calcul[1]}$ et $${calcul[2]}$.`
          texte +=
            ajouteChampTexteMathLive(
              this,
              3 * i,
              KeyboardType.clavierDeBaseAvecFraction,
              { texteAvant: `<br>$${calcul[0]}=$` },
            ) +
            ajouteChampTexteMathLive(
              this,
              3 * i + 1,
              KeyboardType.clavierDeBaseAvecFraction,
              { texteAvant: `<br>$${calcul[1]}=$` },
            ) +
            ajouteChampTexteMathLive(
              this,
              3 * i + 2,
              KeyboardType.clavierDeBaseAvecFraction,
              { texteAvant: `<br>$${calcul[2]}=$` },
            )
          handleAnswers(this, 3 * i, { reponse: { value: reponse } })
          handleAnswers(this, 3 * i + 1, { reponse: { value: reponse } })
          handleAnswers(this, 3 * i + 2, { reponse: { value: reponse } })
          texteCorr = `$${calculCorr[0]}$<br>
          $${calculCorr[1]}$ <br> 
          $${calculCorr[2]}$`
          break
        case 2: // PB, pAbinterBb, pAsachantBb
          calcul = [
            `P(${ev[1]})`,
            `P(\\overline{${ev[0]}}\\cap \\overline{${ev[1]}})`,
            `P_{\\overline{${ev[1]}}}(${ev[0]})`,
          ]
          calculCorr = [
            `P(${ev[1]})=\\dfrac{\\text{Effectif de } ${ev[1]}}{\\text{Effectif total}}=${miseEnEvidence(pB.texFraction)}`,
            `P(\\overline{${ev[0]}}\\cap \\overline{${ev[1]}})=\\dfrac{\\text{Effectif de } \\overline{${ev[0]}}\\cap \\overline{${ev[1]}}}{\\text{Effectif total}}=${miseEnEvidence(pAbinterBb.texFraction)}`,
            `P_{\\overline{${ev[1]}}}(${ev[0]})=\\dfrac{\\text{Effectif de } \\overline{${ev[1]}}\\cap ${ev[0]}}{\\text{Effectif de }\\overline{${ev[1]}}}=${miseEnEvidence(pAsachantBb.texFraction)}`,
          ]
          reponse = [
            `${pB.texFraction}`,
            `${pAbinterBb.texFraction}`,
            `${pAsachantBb.texFraction}`,
          ]
          shuffle3tableaux(calcul, calculCorr, reponse)
          texte += ` Calculer $${calcul[0]}$, $${calcul[1]}$ et $${calcul[2]}$.`
          texte +=
            ajouteChampTexteMathLive(
              this,
              3 * i,
              KeyboardType.clavierDeBaseAvecFraction,
              { texteAvant: `<br>$${calcul[0]}=$` },
            ) +
            ajouteChampTexteMathLive(
              this,
              3 * i + 1,
              KeyboardType.clavierDeBaseAvecFraction,
              { texteAvant: `<br>$${calcul[1]}=$` },
            ) +
            ajouteChampTexteMathLive(
              this,
              3 * i + 2,
              KeyboardType.clavierDeBaseAvecFraction,
              { texteAvant: `<br>$${calcul[2]}=$` },
            )
          handleAnswers(this, 3 * i, { reponse: { value: reponse } })
          handleAnswers(this, 3 * i + 1, { reponse: { value: reponse } })
          handleAnswers(this, 3 * i + 2, { reponse: { value: reponse } })
          texteCorr = `$${calculCorr[0]}$<br>
          $${calculCorr[1]}$ <br> 
          $${calculCorr[2]}$`
          break
        case 3: // pAb,pAbinterB, pBsachantA
          calcul = [
            `P(\\overline{${ev[0]}})`,
            `P(\\overline{${ev[0]}}\\cap ${ev[1]})`,
            `P_{${ev[0]}}(${ev[1]})`,
          ]
          calculCorr = [
            `P(\\overline{${ev[0]}})=\\dfrac{\\text{Effectif de } \\overline{${ev[0]}}}{\\text{Effectif total}}=${miseEnEvidence(pAb.texFraction)}`,
            `P(\\overline{${ev[0]}}\\cap ${ev[1]})=\\dfrac{\\text{Effectif de } \\overline{${ev[0]}}\\cap ${ev[1]}}{\\text{Effectif total}}=${miseEnEvidence(pAbinterB.texFraction)}`,
            `P_{${ev[0]}}(${ev[1]})=\\dfrac{\\text{Effectif de } ${ev[0]}\\cap ${ev[1]}}{\\text{Effectif de }${ev[0]}}=${miseEnEvidence(pBsachantA.texFraction)}`,
          ]
          reponse = [
            `${pAb.texFraction}`,
            `${pAbinterB.texFraction}`,
            `${pBsachantA.texFraction}`,
          ]
          shuffle3tableaux(calcul, calculCorr, reponse)
          texte += ` Calculer $${calcul[0]}$, $${calcul[1]}$ et $${calcul[2]}$.`
          texte +=
            ajouteChampTexteMathLive(
              this,
              3 * i,
              KeyboardType.clavierDeBaseAvecFraction,
              { texteAvant: `<br>$${calcul[0]}=$` },
            ) +
            ajouteChampTexteMathLive(
              this,
              3 * i + 1,
              KeyboardType.clavierDeBaseAvecFraction,
              { texteAvant: `<br>$${calcul[1]}=$` },
            ) +
            ajouteChampTexteMathLive(
              this,
              3 * i + 2,
              KeyboardType.clavierDeBaseAvecFraction,
              { texteAvant: `<br>$${calcul[2]}=$` },
            )
          handleAnswers(this, 3 * i, { reponse: { value: reponse } })
          handleAnswers(this, 3 * i + 1, { reponse: { value: reponse } })
          handleAnswers(this, 3 * i + 2, { reponse: { value: reponse } })
          texteCorr = `$${calculCorr[0]}$<br>
          $${calculCorr[1]}$ <br> 
          $${calculCorr[2]}$`
          break
        case 4: // pBb, pAinterB, pBbsachantA
        default:
          calcul = [
            `P(\\overline{${ev[1]}})`,
            `P(${ev[0]}\\cap ${ev[1]})`,
            `P_{${ev[0]}}(\\overline{${ev[1]}})`,
          ]
          calculCorr = [
            `P(\\overline{${ev[1]}})=\\dfrac{\\text{Effectif de } \\overline{${ev[1]}}}{\\text{Effectif total}}=${miseEnEvidence(pBb.texFraction)}`,
            `P(${ev[0]}\\cap ${ev[1]})=\\dfrac{\\text{Effectif de }${ev[0]}\\cap ${ev[1]}}{\\text{Effectif total}}=${miseEnEvidence(pAinterB.texFraction)}`,
            `P_{${ev[0]}}(\\overline{${ev[1]}})=\\dfrac{\\text{Effectif de } ${ev[0]}\\cap \\overline{${ev[1]}}}{\\text{Effectif de }${ev[0]}}=${miseEnEvidence(pBbsachantA.texFraction)}`,
          ]
          reponse = [
            `${pBb.texFraction}`,
            `${pAinterB.texFraction}`,
            `${pBbsachantA.texFraction}`,
          ]
          shuffle3tableaux(calcul, calculCorr, reponse)
          texte += ` Calculer $${calcul[0]}$, $${calcul[1]}$ et $${calcul[2]}$.`
          texte +=
            ajouteChampTexteMathLive(
              this,
              3 * i,
              KeyboardType.clavierDeBaseAvecFraction,
              { texteAvant: `<br>$${calcul[0]}=$` },
            ) +
            ajouteChampTexteMathLive(
              this,
              3 * i + 1,
              KeyboardType.clavierDeBaseAvecFraction,
              { texteAvant: `<br>$${calcul[1]}=$` },
            ) +
            ajouteChampTexteMathLive(
              this,
              3 * i + 2,
              KeyboardType.clavierDeBaseAvecFraction,
              { texteAvant: `<br>$${calcul[2]}=$` },
            )
          handleAnswers(this, 3 * i, { reponse: { value: reponse } })
          handleAnswers(this, 3 * i + 1, { reponse: { value: reponse } })
          handleAnswers(this, 3 * i + 2, { reponse: { value: reponse } })
          texteCorr = `$${calculCorr[0]}$<br>
          $${calculCorr[1]}$ <br> 
          $${calculCorr[2]}$`
          break
      }

      if (this.questionJamaisPosee(i, pA, pB)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
