import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import Exercice from '../Exercice'

import Decimal from 'decimal.js'
import { tableauColonneLigne } from '../../lib/2d/tableau'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
export const titre =
  "Calculer des probabilités avec des unions et intersections d'événements"
export const dateDePublication = '25/05/2024'
export const interactifReady = true

/**
 *
 * @author Gilles Mora
 */
export const uuid = 'ea35b'
export const refs = {
  'fr-fr': ['2P10-6', 'BP1SP01'],
  'fr-ch': [],
}
export default class ProbaUnionInter extends Exercice {
  constructor() {
    super()
    // this.consigne = 'Calculer '
    this.sup = 7
    this.nbQuestions = 1
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets :',
        '1 : On cherche P(A union B)',
        '2 : On cherche P(A inter B)',
        '3 : On cherche P(A)',
        '4 : Avec des événements incompatibles',
        '5 : Avec des événements contraires',
        '6 : Avec un tableau',
        '7 : Mélange',
      ].join('\n'),
    ]
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 6,
      melange: 7,
      defaut: 7,
      nbQuestions: this.nbQuestions,
    })

    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const a = randint(1, 20)
      let reponse = ''
      let texte = ''
      let texteCorr = ''
      let pA
      let pB
      pA = new Decimal(randint(1, 99)).div(100)
      pB = new Decimal(randint(1, 99)).div(100)
      let pAinterB
      pAinterB = new Decimal(randint(1, 99)).div(100)
      let pAunionB = pA.add(pB).sub(pAinterB)
      while (
        pAunionB.greaterThan(0.99) === true ||
        pAunionB.lessThan(0.01) === true ||
        pAinterB.greaterThan(pA.sub(0.01)) === true ||
        pAinterB.greaterThan(pB.sub(0.01)) === true
      ) {
        pA = new Decimal(randint(1, 99)).div(100)
        pB = new Decimal(randint(1, 99)).div(100)
        pAinterB = new Decimal(randint(1, 99)).div(100)
        pAunionB = pA.add(pB).sub(pAinterB)
      }
      switch (listeTypeDeQuestions[i]) {
        case 1: // on cherche p(A union B)
          reponse = texNombre(pAunionB, 2)
          texte = `Soient $A$ et $B$ deux événements vérifiant : <br>
           $\\bullet$ $P(A)=${texNombre(pA, 2)}$ ${sp(4)} $\\bullet$ $P(B)=${texNombre(pB, 2)}$ ${sp(4)}
           $\\bullet$ $P(A\\cap B)=${texNombre(pAinterB, 2)}$.<br>
            Calculer $P(A\\cup B)$.
           `
          texteCorr = `On sait que $P(A\\cup B)=P(A)+P(B)-P(A\\cap B)$.<br><br>
            $\\begin{aligned}
            P(A\\cup B)&=P(A)+P(B)-P(A\\cap B)\\\\
            &=${texNombre(pA, 2)}+${texNombre(pB, 2)}-${texNombre(pAinterB, 2)}\\\\
            &=${reponse}
            \\end{aligned}$<br>
            Ainsi $P(A\\cup B)=${miseEnEvidence(reponse)}$.`
          texte +=
            '<br>' +
            ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase, {
              texteAvant: ' $P(A\\cup B)=$',
            })
          break
        case 2: // on cherche P(Ainter B)
          reponse = texNombre(pAinterB, 2)
          texte = `Soient $A$ et $B$ deux événements vérifiant : <br>
         $\\bullet$ $P(A)=${texNombre(pA, 2)}$ ${sp(4)} $\\bullet$ $P(B)=${texNombre(pB, 2)}$ ${sp(4)} $\\bullet$ $P(A\\cup B)=${texNombre(pAunionB, 2)}$.<br>
          Calculer $P(A\\cap B)$.
         `
          texteCorr = `On sait que $P(A\\cup B)=P(A)+P(B)-P(A\\cap B)$.<br><br>
          $\\begin{aligned}
          P(A\\cup B)&=P(A)+P(B)-P(A\\cap B)\\\\
          ${texNombre(pAunionB, 2)} &=${texNombre(pA, 2)}+${texNombre(pB, 2)}-P(A\\cap B)\\\\
          P(A\\cap B) &=${texNombre(pA, 2)}+${texNombre(pB, 2)}-${texNombre(pAunionB, 2)}\\\\
          P(A\\cap B)&=${reponse}
          \\end{aligned}$<br>
          Ainsi $P(A\\cap B)=${miseEnEvidence(reponse)}$.`
          texte +=
            '<br>' +
            ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase, {
              texteAvant: '$P(A\\cap B)=$',
            })
          break

        case 3: // on cherche P(A)
          reponse = texNombre(pA, 2)
          texte = `Soient $A$ et $B$ deux événements vérifiant : <br>
           $\\bullet$ $P(B)=${texNombre(pB, 2)}$ ${sp(4)} $\\bullet$ $P(A\\cap B)=${texNombre(pAinterB, 2)}$ ${sp(4)}$\\bullet$ $P(A\\cup B)=${texNombre(pAunionB, 2)}$.<br>
            Calculer $P(A)$.
           `
          texteCorr = `On sait que $P(A\\cup B)=P(A)+P(B)-P(A\\cap B)$.<br><br>
            $\\begin{aligned}
            P(A\\cup B)&=P(A)+P(B)-P(A\\cap B)\\\\
            ${texNombre(pAunionB, 2)}&=P(A)+${texNombre(pB, 2)}-${texNombre(pAinterB, 2)}\\\\
            P(A)&=${texNombre(pAunionB, 2)}-${texNombre(pB, 2)}+${texNombre(pAinterB, 2)}\\\\
            &=${reponse}
            \\end{aligned}$<br>
            Ainsi $P(A)=${miseEnEvidence(reponse)}$.`
          texte +=
            '<br>' +
            ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase, {
              texteAvant: '$P(A)=$',
            })
          break
        case 4: // on cherche P(A union B) avec événements incompatibles
          {
            const pAI = new Decimal(randint(1, 40)).div(100)
            const pBI = new Decimal(randint(1, 40)).div(100)
            const pAIunionBI = pAI.add(pBI)
            reponse = texNombre(pAIunionBI, 2)
            texte = `Soient $A$ et $B$ deux événements incompatibles vérifiant : <br>
          $\\bullet$ $P(A)=${texNombre(pAI, 2)}$ ${sp(4)} $\\bullet$ $P(B)=${texNombre(pBI, 2)}$.<br>
           Calculer $P(A\\cup B)$.`
            texteCorr = `Lorsque deux événements sont incompatibles, $P(A\\cup B)=P(A)+P(B)$.<br><br>
          $\\begin{aligned}
            P(A\\cup B)&=P(A)+P(B)\\\\
            P(A\\cup B)&=${texNombre(pAI, 2)}+${texNombre(pBI, 2)}\\\\
            P(A\\cup B) &=${reponse}
            \\end{aligned}$<br>
            Ainsi $P(A\\cup B)=${miseEnEvidence(reponse)}$.`
            texte +=
              '<br>' +
              ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase, {
                texteAvant: '$P(A\\cup B)=$',
              })
          }
          break
        case 5:
          {
            // on cherche P(A union  B) avec des événements contraires
            const pAbarre = pA.mul(-1).add(1)
            const pBbarre = pB.mul(-1).add(1)
            reponse = texNombre(pAunionB, 2)
            texte = `Soient $A$ et $B$ deux événements vérifiant : <br>
             $\\bullet$ $P(\\bar{A})=${texNombre(pAbarre, 2)}$ ${sp(4)} $\\bullet$ $P(\\bar{B})=${texNombre(pBbarre, 2)}$ ${sp(4)} $\\bullet$ $P(A\\cap B)=${texNombre(pAinterB, 2)}$.<br>
              Calculer $P(A\\cup B)$.`
            texteCorr = `On sait que $P(A\\cup B)=P(A)+P(B)-P(A\\cap B)$.<br><br>
             Or $P(A)=1-P(\\bar{A})=${texNombre(pA, 2)}$ et $P(B)=1-P(\\bar{B})=${texNombre(pB, 2)}$.<br>
             <br>$\\begin{aligned}
             P(A\\cup B)&=P(A)+P(B)-P(A\\cap B)\\\\
             P(A\\cup B)&=${texNombre(pA, 2)}+${texNombre(pB, 2)}-${texNombre(pAinterB, 2)}\\\\
             P(A\\cup B)&=${texNombre(pAunionB, 2)}
             \\end{aligned}$<br>
             Ainsi $P(A\\cup B)=${miseEnEvidence(reponse)}$.`
            texte +=
              '<br>' +
              ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase, {
                texteAvant: '$P(A\\cup B)=$',
              })
          }
          break

        case 6:
          {
            // avec un tableau
            const pAbarre = pA.mul(-1).add(1)
            const pBbarre = pB.mul(-1).add(1)
            const nbA = pA.mul(100)
            const nbB = pB.mul(100)
            const nbAinterB = pAinterB.mul(100)
            const nbAbinterB = nbB.sub(nbAinterB)
            const nbAinterBb = nbA.sub(nbAinterB)
            const nbAb = pAbarre.mul(100)
            const nbBb = pBbarre.mul(100)
            const nbAbinterBb = nbAb.sub(nbAbinterB)
            const tableau = tableauColonneLigne(
              ['', 'A', '\\overline{A}', '\\text{Total}'],
              ['B', '\\overline{B}', '\\text{Total}'],
              [
                `${texNombre(nbAinterB, 2)}`,
                `${texNombre(nbAbinterB, 2)}`,
                `${texNombre(nbB, 2)}`,
                `${texNombre(nbAinterBb, 2)}`,
                `${texNombre(nbAbinterBb, 2)}`,
                `${texNombre(nbBb, 2)}`,
                `${texNombre(nbA, 2)}`,
                `${texNombre(nbAb, 2)}`,
                100,
              ],
            )
            reponse = texNombre(pAunionB, 2)
            texte = `Voici un tableau d'effectifs concernant deux événements $A$ et $B$ : <br>
            ${tableau}

                Calculer $P(A\\cup B)$.`
            texteCorr = `On sait que $P(A\\cup B)=P(A)+P(B)-P(A\\cap B)$.<br><br>
               <br>$\\begin{aligned}
               P(A\\cup B)&=P(A)+P(B)-P(A\\cap B)\\\\
               P(A\\cup B)&=${texNombre(pA, 2)}+${texNombre(pB, 2)}-${texNombre(pAinterB, 2)}\\\\
               P(A\\cup B)&=${texNombre(pAunionB, 2)}
               \\end{aligned}$<br>
               Ainsi $P(A\\cup B)=${miseEnEvidence(reponse)}$.`
            texte +=
              '<br>' +
              ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase, {
                texteAvant: '$P(A\\cup B)=$',
              })
          }
          break
      }

      handleAnswers(this, i, { reponse: { value: reponse } })
      if (this.questionJamaisPosee(i, listeTypeDeQuestions[i], a)) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
