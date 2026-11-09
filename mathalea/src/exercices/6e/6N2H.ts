import { amcConvert } from '../../lib/amc/amcBuilders'
import { ensureAmcParam } from '../../lib/amc/amcHelpers'
import { orangeMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import {
  arrondi,
  nombreDeChiffresDansLaPartieDecimale,
  nombreDeChiffresDansLaPartieEntiere,
} from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import operation from '../../modules/operations'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const amcReady = true
export const interactifReady = true

export const amcType = 'AMCNum'
export const titre = 'Effectuer divisions décimales'

/**
 * Effectuer les divisions décimales suivantes et donner la valeur exacte de leur quotient.
 *
 * Niveau de difficulté 1 :
 * * entier divisé par 4 quotient : xx,25 ou xx,75
 * * entier divisé par 8 quotient : x,125 ou x,375 ou x,625 ou x,875
 * * entier divisé par 6 quotient : xxx,5
 * * quotient xx,xx division par 2, 3, 4 ou 5
 * * quotient x,xxx division par 6 à 9
 * * un 0 dans le quotient
 *
 * Niveau de difficulté 2 : division par 3, 7 ou 9
 * @author Rémi Angot

 */
export const uuid = '294bb'

export const refs = {
  'fr-fr': ['6N2H'],
  'fr-2016': ['6C31'],
  'fr-ch': ['PR-29', '9R1NO7C-1', '9R2NO7C-1', '9R3NO7C-1', 'PRQNO06A-3'],
}
export default class DivisionDecimale extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Type de questions',
      2,
      '1 : Déterminer le quotient exact\n2 : Déterminer un quotient approché au millième près',
    ]
    this.spacing = 2
    this.spacingCorr = context.isHtml ? 2 : 1 // Important sinon opdiv n'est pas joli
    this.nbQuestions = 4
    this.sup = 1
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions === 1
        ? 'Effectuer la division décimale suivante et donner la valeur exacte de son quotient.'
        : 'Effectuer les divisions décimales suivantes et donner la valeur exacte de leur quotient.'

    let typesDeQuestionsDisponibles

    if (parseInt(this.sup) === 1) typesDeQuestionsDisponibles = [choice([1, 2, 3]), 4, 5, 6]
    else typesDeQuestionsDisponibles = [7, 8, 9]
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posées mais l'ordre diffère à chaque "cycle"
    let typesDeQuestions
    for (
      let i = 0, texte, texteCorr, cpt = 0, a, b, q;
      i < this.nbQuestions && cpt < 50;
    ) {
      typesDeQuestions = listeTypeDeQuestions[i]
      switch (typesDeQuestions) {
        case 1: // entier divisé par 4 quotient : xx,25 ou xx,75
          b = 4
          a = (randint(2, 9) * 10 + randint(2, 9)) * 4 + choice([1, 3])
          q = arrondi(a / b, 6)
          break
        case 2: // entier divisé par 8 quotient : x,125 ou x,375 ou x,625 ou x,875
          b = 8
          a = randint(2, 9) * 8 + choice([1, 3, 5, 7])
          q = arrondi(a / b, 6)
          break
        case 3: // entier divisé par 6 quotient : xxx,5
          b = 6
          q = arrondi(
            randint(2, 9) * 100 + randint(2, 9) * 10 + randint(2, 9) + 0.5,
            6,
          )
          a = q * 6
          break
        case 4: // quotient xx,xx division par 2, 3, 4 ou 5
          q = arrondi(
            randint(2, 5) * 10 +
              randint(2, 5) +
              randint(2, 5) / 10 +
              randint(2, 5) / 100,
            6,
          )
          b = randint(2, 5)
          a = b * q
          break
        case 5: // quotient x,xxx division par 6 à 9
          q = arrondi(
            randint(6, 9) +
              randint(5, 9) / 10 +
              randint(6, 9) / 100 +
              randint(6, 9) / 1000,
            6,
          )
          b = randint(6, 9)
          a = b * q
          break
        case 6: // un 0 dans le quotient
          if (randint(1, 2) === 1) {
            // x0x,x
            q = arrondi(
              randint(2, 9) * 100 + randint(2, 9) + randint(2, 9) / 10,
              6,
            )
          } else {
            // xx0,x
            q = arrondi(
              randint(2, 9) * 100 + randint(2, 9) * 10 + randint(2, 9) / 10,
              6,
            )
          }
          b = randint(7, 9)
          a = b * q
          break
        case 7: // division par 7
          a = randint(2, 9) * 7 + randint(1, 6)
          b = 7
          q = arrondi(a / b, 3)
          break
        case 8: // division par 9
          a = (randint(11, 19) * 9) / 10 + randint(1, 8) / 10
          b = 9
          q = arrondi(a / b, 3)
          break
        case 9: // division par 3
        default:
          a = (randint(11, 99) * 3) / 100 + randint(1, 2) / 100
          b = 3
          q = arrondi(a / b, 3)
      }
      if (this.sup === 2) {
        this.consigne =
          this.nbQuestions === 1
            ? 'Effectuer la division décimale suivante et donner une valeur approchée de son quotient au millième près.'
            : 'Effectuer les divisions décimales suivantes et donner une valeur approchée de leur quotient au millième près.'
      }
      texte = `$${texNombre(a)}\\div${b}`
      if (this.sup === 1) {
        texteCorr = operation({
          operande1: arrondi(a, 6),
          operande2: b,
          type: 'division',
          precision: 3,
          options: { solution: true, colore: orangeMathalea },
        })
        texteCorr += `<br>$${texNombre(a)}\\div${b}=${miseEnEvidence(texNombre(q))}$`
        texte += this.interactif ? '=$' : '$'
      } else {
        texteCorr = operation({
          operande1: arrondi(a, 6),
          operande2: b,
          type: 'division',
          precision: 4,
          options: { solution: true, colore: orangeMathalea },
        })
        texteCorr += `<br>$${texNombre(a)}\\div${b}\\approx${miseEnEvidence(texNombre(q))}$`
        texte += this.interactif ? '\\approx$' : '$'
      }
      handleAnswers(this, i, { reponse: { value: q } })
      if (context.isHtml && this.interactif)
        texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers)
      if (context.isAmc) {
        this.autoCorrectionAMC[i] = {
          enonce: texte,
          reponse: { texte: texteCorr, valeur: q },
        }
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        const amcParam = ensureAmcParam(this, i)
        amcParam.digits =
          nombreDeChiffresDansLaPartieEntiere(q) +
          nombreDeChiffresDansLaPartieDecimale(q) +
          2
        amcParam.decimals = nombreDeChiffresDansLaPartieDecimale(q) + 1
        amcParam.signe = false
        amcParam.exposantNbChiffres = 0
      }
      if (this.questionJamaisPosee(i, a, b)) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
