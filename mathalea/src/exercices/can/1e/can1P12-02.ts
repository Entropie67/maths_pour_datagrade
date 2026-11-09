import Decimal from 'decimal.js'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import { choice } from '../../../lib/outils/arrayOutils'
import { sp } from '../../../lib/outils/outilString'
import { texNombre } from '../../../lib/outils/texNombre'
import FractionEtendue from '../../../modules/FractionEtendue'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'

import { tableauColonneLigne } from '../../../lib/2d/tableau'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { miseEnEvidence } from '../../../lib/outils/embellissements'

export const titre =
  'Déterminer une probabilité dans un tableau de probabilités'
export const dateDePublication = '06/07/2022'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 *
 * @author Gilles Mora

 */
export const uuid = '73673'

export const refs = {
  'fr-fr': ['can1P12-02', 'can2P2-05'],
  'fr-ch': ['NR'],
}
export default class CalculProbaTableau extends Exercice {
  constructor() {
    super()

    this.sup = true

    this.nbQuestions = 1
  }

  nouvelleVersion() {
    for (
      let i = 0,
        cpt = 0,
        reponse,
        tableau,
        pAbarreinterBbarre,
        pA,
        pB,
        pAinterB,
        texte,
        texteCorr = '';
      i < this.nbQuestions && cpt < 50;
    ) {
      // On choisit les probas de l'arbre
      pA = new Decimal(randint(27, 40)).div(100)
      pB = new Decimal(randint(41, 70)).div(100)
      pAinterB = new Decimal(randint(11, 25)).div(100)
      pAbarreinterBbarre = new Decimal(1 - pA.toNumber()).sub(pB).add(pAinterB)

      tableau = tableauColonneLigne(
        ['', 'A', '\\overline{A}', '\\text{Total}'],
        ['B', '\\overline{B}', '\\text{Total}'],
        [
          `${texNombre(pAinterB, 2)}`,
          `${texNombre(pB.toNumber() - pAinterB.toNumber(), 2)}`,
          `${texNombre(pB, 2)}`,
          `${texNombre(pA.toNumber() - pAinterB.toNumber(), 2)}`,
          `${texNombre(pAbarreinterBbarre, 2)}`,
          `${texNombre(1 - pB.toNumber(), 2)}`,
          `${texNombre(pA, 2)}`,
          `${texNombre(1 - pA.toNumber(), 2)}`,
          '1',
        ],
      )
      texte =
        'Ce tableau est un tableau de probabilités avec deux événements $A$ et $B$ d’une expérience aléatoire.<br>'
      this.canEnonce = texte
      switch (
        choice([1, 2, 3, 4, 5, 6, 7, 8, 9]) //
      ) {
        case 1: // p_A(B)
          texte += `${tableau}`
          if (this.interactif) {
            texte += '<br> $P_A(B)=$ '
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierDeBaseAvecFraction,
              {
                texteApres: '(Résultat sous la forme d’une fraction d’entiers)',
              },
            )
          } else {
            texte += 'Déterminer $P_A(B)$. '
          }
          texteCorr = ` $P_A(B)=\\dfrac{P(A\\cap B)}{P(A)}=\\dfrac{${texNombre(pAinterB, 2)}}{${texNombre(pA, 2)}}=${miseEnEvidence(`\\dfrac{${texNombre(pAinterB.toNumber() * 100, 0)}}{${texNombre(pA.toNumber() * 100, 0)}}`)}$
      `
          reponse = new FractionEtendue(pAinterB, pA.toNumber())
          handleAnswers(this, i, {
            reponse: { value: reponse, options: { fractionEgale: true } },
          })
          this.canEnonce += `${tableau}<br>`
          this.canReponseACompleter = '$P_A(B)=\\ldots$'
          break
        case 2: // p(B)
          texte += `${tableau}`
          if (this.interactif) {
            texte += '<br>Calculer $P(B)$. '
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierNumbers,
              {
                texteApres: '(Résultat sous forme décimale)',
              },
            )
          } else {
            texte += 'Déterminer $P(B)$. '
          }
          texteCorr = ` $P(B)=${miseEnEvidence(texNombre(pB, 2))}$`
          reponse = pB
          handleAnswers(this, i, { reponse: { value: reponse } })
          this.canEnonce += `${tableau}<br>`
          this.canReponseACompleter = '$P_A(B)=\\ldots$'
          break

        case 3: // p(Bbarre)
          texte += `${tableau} `
          if (this.interactif) {
            texte += '<br>  $P(\\overline{B})=$ '
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierNumbers,
              {
                texteApres: '(Résultat sous forme décimale)',
              },
            )
          } else {
            texte += 'Déterminer $P(\\overline{B})$. '
          }
          texteCorr = ` $P(\\overline{B})=${miseEnEvidence(texNombre(1 - pB.toNumber(), 2))}$
      `
          reponse = new Decimal(pB).mul(-1).add(1)
          handleAnswers(this, i, { reponse: { value: reponse } })
          this.canEnonce += `${tableau}<br>`
          this.canReponseACompleter = '$P(\\overline{B})=\\ldots$'
          break
        case 4: // p(AinterB)
          texte += `${tableau}`
          if (this.interactif) {
            texte += '<br> $P(A\\cap B)=$ '
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierNumbers,
              {
                texteApres: '(Résultat sous forme décimale)',
              },
            )
          } else {
            texte += ' Déterminer $P(A\\cap B)$. '
          }
          texteCorr = ` $P(A\\cap B))=${miseEnEvidence(texNombre(pAinterB, 2))}$ `
          reponse = pAinterB
          handleAnswers(this, i, { reponse: { value: reponse } })
          this.canEnonce += `${tableau}<br>`
          this.canReponseACompleter = '$P(A\\cap B)=\\ldots$'
          break

        case 5: // p(AinterBbarre)
          texte += `${tableau} `
          if (this.interactif) {
            texte += '<br> $P(A\\cap \\overline{B})=$ '
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierNumbers,
              {
                texteApres: '(Résultat sous forme décimale)',
              },
            )
          } else {
            texte += '  Déterminer $P(A\\cap \\overline{B})$. '
          }
          texteCorr = ` $P(A\\cap \\overline{B})=${miseEnEvidence(texNombre(pA.toNumber() - pAinterB.toNumber(), 2))}$ `
          reponse = new Decimal(pA).sub(pAinterB)
          handleAnswers(this, i, { reponse: { value: reponse } })
          this.canEnonce += `${tableau}<br>`
          this.canReponseACompleter = '$P(A\\cap \\overline{B})=\\ldots$'
          break

        case 6: // p(AbarreinterBbarre)
          texte += `${tableau} `
          if (this.interactif) {
            texte += '<br>$P(\\overline{A}\\cap B)=$. '
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierNumbers,
              {
                texteApres: '(Résultat sous forme décimale)',
              },
            )
          } else {
            texte += `${sp(5)}Déterminer $P(\\overline{A}\\cap B)$. `
          }
          texteCorr = ` $P(\\overline{A}\\cap B)=${miseEnEvidence(texNombre(pB.toNumber() - pAinterB.toNumber(), 2))}$ `
          reponse = new Decimal(pB).sub(pAinterB)
          handleAnswers(this, i, { reponse: { value: reponse } })
          this.canEnonce += `${tableau}<br>`
          this.canReponseACompleter = '$P(\\overline{A}\\cap B)=\\ldots$'
          break

        case 7: // p_B(A)
          texte += `${tableau}`
          if (this.interactif) {
            texte += '<br>$P_B(A)=$ '
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierDeBaseAvecFraction,
              {
                texteApres: '(Résultat sous la forme d’une fraction d’entiers)',
              },
            )
          } else {
            texte += ' Déterminer $P_B(A)$. '
          }
          texteCorr = ` $P_B(A)=\\dfrac{P(A\\cap B)}{P(B)}=\\dfrac{${texNombre(pAinterB, 2)}}{${texNombre(pB, 2)}}=${miseEnEvidence(`\\dfrac{${texNombre(pAinterB.toNumber() * 100, 0)}}{${texNombre(pB.toNumber() * 100, 0)}}`)}$
        `
          reponse = new FractionEtendue(pAinterB, pB.toNumber())
          handleAnswers(this, i, {
            reponse: { value: reponse, options: { fractionEgale: true } },
          })
          this.canEnonce += `${tableau}<br>`
          this.canReponseACompleter = '$P_B(A)=\\ldots$'
          break
        case 8: // p_B(Abarre)
          texte += `${tableau}         `
          if (this.interactif) {
            texte += '<br> $P_B(\\overline{A})=$ '
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierDeBaseAvecFraction,
              {
                texteApres: '(Résultat sous la forme d’une fraction d’entiers)',
              },
            )
          } else {
            texte += 'Déterminer $P_B(\\overline{A})$. '
          }
          texteCorr = ` $P_B(\\overline{A})=\\dfrac{P(\\overline{A}\\cap B)}{P(B)}=\\dfrac{${texNombre(pB.toNumber() - pAinterB.toNumber(), 2)}}{${texNombre(pB, 2)}}=${miseEnEvidence(`\\dfrac{${texNombre((pB.toNumber() - pAinterB.toNumber()) * 100, 0)}}{${texNombre(pB.toNumber() * 100, 0)}}`)}$
          `
          reponse = new FractionEtendue(
            pB.toNumber() - pAinterB.toNumber(),
            pB.toNumber(),
          )
          handleAnswers(this, i, {
            reponse: { value: reponse, options: { fractionEgale: true } },
          })
          this.canEnonce += `${tableau}<br>`
          this.canReponseACompleter = '$P_B(\\overline{A})=\\ldots$'
          break

        case 9: // p_Bbare(Abarre)
          texte += `${tableau}`
          if (this.interactif) {
            texte += '<br>$P_{\\overline{B}}(\\overline{A})=$ '
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierDeBaseAvecFraction,
              {
                texteApres: '(Résultat sous la forme d’une fraction d’entiers)',
              },
            )
          } else {
            texte += '       Déterminer $P_{\\overline{B}}(\\overline{A})$. '
          }
          texteCorr = ` $P_{\\overline{B}}(\\overline{A})=\\dfrac{P(\\overline{A}\\cap \\overline{B})}{P(\\overline{B})}=\\dfrac{${texNombre(pAbarreinterBbarre, 2)}}{${texNombre(1 - pB.toNumber(), 2)}}=${miseEnEvidence(`\\dfrac{${texNombre(pAbarreinterBbarre.toNumber() * 100, 0)}}{${texNombre((1 - pB.toNumber()) * 100, 0)}}`)}$ `
          reponse = new FractionEtendue(pAbarreinterBbarre, 1 - pB.toNumber())
          handleAnswers(this, i, {
            reponse: { value: reponse, options: { fractionEgale: true } },
          })
          this.canEnonce += `${tableau}<br>`
          this.canReponseACompleter =
            '$P_{\\overline{B}}(\\overline{A})=\\ldots$'
          break
      }
      if (this.questionJamaisPosee(i, pA, pB)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr

        this.listeCanEnonces.push(this.canEnonce)
        this.listeCanReponsesACompleter.push(this.canReponseACompleter)
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
