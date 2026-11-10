import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import Exercice from '../Exercice'

import Decimal from 'decimal.js'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
import { cribleEratostheneN, pgcd } from '../../lib/outils/primalite'
import { stringNombre, texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
export const titre = 'Calculer des probabilités dans des cas simples'
export const dateDeModifImportante = '02/06/2024'
export const interactifReady = true

/**
 *
 * @author Gilles Mora
 */
export const uuid = '0cf54'

export const refs = {
  'fr-fr': ['2P10-3', 'BP2FLUC2', 'BP1AUTO002'],
  'fr-ch': ['4mProbStat-5', '11LSNO4C-4'],
}
export default class ProbaUnionInter extends Exercice {
  constructor() {
    super()
    // this.consigne = 'Calculer '
    this.sup = 6
    this.nbQuestions = 1
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets :',
        '1 : Probabilité de gagner/perdre un match',
        '2 : Probabilité et nombres premiers',
        '3 : Probabilité tirage dans une urne',
        '4 : Probabilité Pile/face',
        '5 : Probabilité et nombre de boules',
        '6 : Mélange',
      ].join('\n'),
    ]
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      max: 5,
      melange: 6,
      defaut: 6,
      nbQuestions: this.nbQuestions,
    })

    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const a = randint(1, 20)
      let reponse
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
        case 1: // probabilité de gagner/perdre le match
          {
            const choix = choice([true, false])

            const pG = new Decimal(randint(40, 65)).div(100) // gagner
            const pN = new Decimal(randint(10, 30)).div(100) // nul
            const NG = pG.add(pN) // nul ou gagner
            const pP = NG.mul(-1).add(1) // perdre

            const sport = choice([
              'hand-ball',
              'football',
              'rugby',
              'basket',
              'volley-ball',
              'water-polo',
              'baseball',
            ])

            texte = `Lors d'un match de ${sport}, l'équipe qui reçoit un adversaire a une probabilité de $${texNombre(pG, 2)}$ de gagner son match et $${texNombre(pN, 2)}$ de faire un match nul.`
            if (choix === true) {
              reponse = texNombre(NG, 2)
              texte +=
                '<br>Quelle est la probabilité, pour cette équipe, de ne pas perdre le match ?'
              texteCorr =
                "Ne pas perdre un match, c'est, soit le gagner, soit faire un match nul. La probabilité est donc : <br> <br>"
              texteCorr += `$P=$ P(«${sp()}${sp(1)}Gagner le match${sp(1)}${sp()}») + P(«${sp()}${sp(1)}Match nul${sp(1)}${sp()}») <br>`
              texteCorr += `$P= ${texNombre(pG, 2)} + ${texNombre(pN, 2)}$ <br> `
              texteCorr += `$P= ${miseEnEvidence(reponse)}$ <br>`
            } else {
              reponse = texNombre(pP, 2)
              texte +=
                '<br>Quelle est la probabilité, pour cette équipe, de perdre le match ?'
              texteCorr = `L'événement «${sp()}${sp(1)}Perdre le match${sp(1)}${sp()}» est l'événement contraire de «${sp()}${sp(1)}Ne pas perdre le match${sp(1)}${sp()}». On peut donc affirmer que : <br> <br>`
              texteCorr += `P(«${sp()}${sp(1)}Perdre le match${sp(1)}${sp()}») $+$ P(«${sp()}${sp(1)}Ne pas perdre le match${sp(1)}${sp()}») $= 1$ <br>`
              texteCorr += `$P=1-$ P(«${sp()}${sp(1)}Ne pas perdre le match${sp(1)}${sp()}»)<br>`
              texteCorr += `$P=1-$(P(«${sp()}${sp(1)}Gagner le match${sp(1)}${sp()}») + P(«${sp()}${sp(1)}Match nul${sp(1)}${sp()}»))<br>`
              texteCorr += `$P=1-(${texNombre(pG, 2)} + ${texNombre(pN, 2)})$<br>`
              texteCorr += `$P=1-${texNombre(NG, 2)}$<br>`
              texteCorr += `$P=${miseEnEvidence(reponse)}$<br>`
            }

            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierDeBaseAvecFraction,
              { texteAvant: sp(5) },
            )
            handleAnswers(this, i, { reponse: { value: reponse } })
          }
          break
        case 2: // proba d'obtenir un nombre premier
          {
            const a = randint(6, 40)
            reponse = new FractionEtendue(cribleEratostheneN(a).length, a)
              .texFraction
            texte = `Une urne contient $${a}$ boules numérotées de $1$ à $${a}$. <br>
        On choisit une boule au hasard. <br>
        Quelle est la probabilité d'obtenir un nombre premier ? `
            texteCorr =
              `Les nombres premiers inférieurs à $${a}$ sont : $` +
              cribleEratostheneN(a)[0]
            for (let k = 1; k < cribleEratostheneN(a).length; k++) {
              texteCorr += ', ' + cribleEratostheneN(a)[k]
            }
            texteCorr += '$'
            if (pgcd(cribleEratostheneN(a).length, a) === 1) {
              texteCorr += `.<br>
        La probabilité d'obtenir un nombre premier est donc : $${miseEnEvidence(reponse)}$. `
            } else {
              texteCorr += `.<br>
        La probabilité d'obtenir un nombre premier est donc : $${miseEnEvidence(reponse)}${new FractionEtendue(cribleEratostheneN(a).length, a).texSimplificationAvecEtapes()}$. `
            }

            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierDeBaseAvecFraction,
              { texteAvant: sp(5) },
            )
            handleAnswers(this, i, { reponse: { value: reponse } })
          }
          break

        case 3: // proba d'obtenir une boule rouge
          {
            const a = randint(3, 10)
            const b = a - randint(-1, 1, 0)
            const nbBoules = texNombre(a + b, 0)
            const choix1 = choice([true, false])
            const reponse1 = new FractionEtendue(a, a + b).texFraction
            const reponse2 = new FractionEtendue(b, a + b).texFraction
            if (choix1 === true) {
              reponse = reponse1
            } else {
              reponse = reponse2
            }
            texte = `Une urne contient $${a}$ boules rouges et $${b}$ boules bleues. <br>
                On tire une boule au hasard. <br>
              Quelle est la probabilité de tirer une boule ${choix1 ? 'rouge' : 'bleue'} ? `
            texteCorr = `Dans l'urne, il y a $${a}$ boules rouges et $${b}$ boules bleues, soit un total de $${a + b}$ boules. <br>
                On a donc $${choix1 ? a : b}$ chances sur $${nbBoules}$ de tirer une boule ${choix1 ? 'rouge' : 'bleue'}.<br>
                Ainsi, la probabilité de tirer une boule ${choix1 ? 'rouge' : 'bleue'} est $${miseEnEvidence(`\\dfrac{${choix1 ? a : b}}{${nbBoules}}`)}$.`

            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierDeBaseAvecFraction,
              { texteAvant: sp(5) },
            )
            handleAnswers(this, i, { reponse: { value: reponse } })
          }
          break
        case 4: //
          {
            const c = choice([2, 3, 11, 12])
            const choix = choice(['a', 'b', 'c', 'd'])
            if (choix === 'a') {
              texte = `On lance deux fois de suite une pièce de monnaie parfaitement équilibrée.<br>Quelle est la probabilité de l'événement : «${sp()}On obtient au moins une fois ${c ? 'pile' : 'face'}${sp()}» ?`
              texteCorr = `Il y a $4$ issues équiprobables : $(P,P)$, $(P,F)$, $(F,P)$ et $(F,F)$.<br>
              Il y a $3$ issues qui comportent au moins une fois ${c ? 'pile' : 'face'}. Ainsi, la probabilité cherchée est : $${miseEnEvidence('\\dfrac{3}{4}')}$.`
              reponse = new FractionEtendue(3, 4).texFraction
            }
            if (choix === 'b') {
              texte = `On lance deux fois de suite une pièce de monnaie parfaitement équilibrée.<br>Quelle est la probabilité de l'événement : «${sp()}On obtient au plus une fois ${c ? 'pile' : 'face'}${sp()}» ?`
              texteCorr = `Il y a $4$ issues équiprobables : $(P,P)$, $(P,F)$, $(F,P)$ et $(F,F)$.<br>
              Il y a $3$ issues qui comportent au plus une fois ${c ? 'pile' : 'face'}. Ainsi, la probabilité cherchée est : $${miseEnEvidence('\\dfrac{3}{4}')}$.`
              reponse = new FractionEtendue(3, 4).texFraction
            }

            if (choix === 'c') {
              texte = `On lance deux fois de suite une pièce de monnaie parfaitement équilibrée.<br>Quelle est la probabilité de l'événement : «${sp()}On obtient une seule fois ${c ? 'pile' : 'face'}${sp()}» ?`
              texteCorr = `Il y a $4$ issues équiprobables : $(P,P)$, $(P,F)$, $(F,P)$ et $(F,F)$.<br>
              Il y a $2$ issues qui comportent une seule fois ${c ? 'pile' : 'face'}. Ainsi, la probabilité cherchée est : $${miseEnEvidence('\\dfrac{1}{2}')}$.`
              reponse = new FractionEtendue(1, 2).texFraction
            } else {
              // if (choix === 'd') {
              texte = `On lance deux fois de suite une pièce de monnaie parfaitement équilibrée.<br>Quelle est la probabilité de l'événement : «${sp()}On obtient deux fois ${c ? 'piles' : 'faces'}${sp()}» ?`
              texteCorr = `Il y a $4$ issues équiprobables : $(P,P)$, $(P,F)$, $(F,P)$ et $(F,F)$.<br>
              Il y a $1$ issue qui comporte deux fois ${c ? 'piles' : 'faces'}. Ainsi, la probabilité cherchée est : $${miseEnEvidence('\\dfrac{1}{4}')}$.`
              reponse = new FractionEtendue(1, 4).texFraction
            }
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierDeBaseAvecFraction,
              { texteAvant: sp(5) },
            )
            handleAnswers(this, i, { reponse: { value: reponse } })
          }
          break
        case 5:
          {
            const listeFractionProba = [
              [1, 3],
              [2, 5],
              [3, 7],
              [1, 8],
              [6, 11],
              [4, 7],
              [3, 4],
              [3, 5],
              [2, 9],
              [4, 5],
              [7, 8],
              [6, 7],
              [3, 10],
              [2, 9],
              [2, 7],
              [3, 11],
            ]
            const choixProba = choice(listeFractionProba)
            const proba1 = new FractionEtendue(choixProba[0], choixProba[1])
              .texFraction
            const k = randint(2, 10)
            const nbBoulesV = k * choixProba[0]
            const reponse = stringNombre(
              k * choixProba[1] - k * choixProba[0],
              0,
            )

            texte = `Dans une urne contenant des boules vertes et des boules bleues, on tire au hasard
          une boule et on regarde sa couleur. <br>
          La probabilité d'obtenir une boule verte est $${proba1}$.<br>
          Déterminer le nombre de boules bleues dans cette urne sachant qu'il y a $${nbBoulesV}$
          boules vertes`
            texte += this.interactif ? ' : ' : '.'
            texteCorr = `La probabilité d'obtenir une boule verte est $${proba1}$, soit $\\dfrac{${k * choixProba[0]}}{${k * choixProba[1]}}$.<br>
          Il y a donc $${k * choixProba[1]}$ boules au total dans l'urne et donc $${k * choixProba[1]}-${k * choixProba[0]}=${miseEnEvidence(reponse)}$ boules bleues.`

            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierDeBaseAvecFraction,
              { texteAvant: sp(), texteApres: 'boules bleues' },
            )
            handleAnswers(this, i, { reponse: { value: reponse } })
          }
          break
      }

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
