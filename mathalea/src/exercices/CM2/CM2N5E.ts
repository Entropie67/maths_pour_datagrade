import { amcConvert } from '../../lib/amc/amcBuilders'
import { orangeMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import {
  arrondi,
  nombreDeChiffresDansLaPartieDecimale,
  nombreDeChiffresDansLaPartieEntiere,
  troncature,
} from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import operation from '../../modules/operations'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const dateDePublication = '01/02/2026'
export const amcReady = true
export const interactifReady = true

export const amcType = 'AMCNum'
export const titre =
  'Poser et effectuer des divisions décimales avec un dividende décimal et un diviseur à un chiffre'

/**
 * Effectuer les divisions décimales
 * @author Éric Elter
 */
export const uuid = '294zd'

export const refs = {
  'fr-fr': ['CM2N5E'],
  'fr-ch': ['9R1NO7C-3', '9R2NO7C-3', '9R3NO7C-3'],
}
export default class DivisionDecimaleCM2 extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Type de questions',
      2,
      '1 : Déterminer le quotient exact\n2 : Déterminer un quotient approché au millième près',
    ]
    this.sup = 1
    this.besoinFormulaire2Numerique = [
      'Choix du nombre de décimales significatives dans le dividende',
      4,
      '1 : Aucune décimale\n2 : Une décimale\n3 : Deux décimales\n4 : Trois décimales',
    ]
    this.sup2 = 3
    this.besoinFormulaire3CaseACocher = [
      'Le dividende est plus petit que le diviseur',
    ]
    this.sup3 = false
    this.besoinFormulaire4Numerique = [
      'Dividende ',
      4,
      '1 : Entre 0 et 10\n2 : Entre 11 et 100\n3 : Entre 101 et 1 000\n4 : Entre 1 001 et 10 000',
    ]
    this.sup4 = 2
    this.besoinFormulaire5Numerique = [
      'Choix du diviseur à un chiffre (mettre 10 si laisser le hasard faire)',
      10,
    ]
    this.sup5 = 10
    this.spacing = 2
    this.spacingCorr = context.isHtml ? 2 : 1 // Important sinon opdiv n'est pas joli
    this.nbQuestions = 4
    this.comment =
      "Si deux paramètres sont contradictoires, alors c'est le paramètre le plus haut qui prend la priorité sur le plus bas."
  }

  nouvelleVersion() {
    const valeurExacte = this.sup === 1
    this.consigne = valeurExacte
      ? this.nbQuestions === 1
        ? 'Poser et effectuer la division décimale suivante et donner la valeur exacte de son quotient.'
        : 'Poser et effectuer les divisions décimales suivantes et donner la valeur exacte de leur quotient.'
      : this.nbQuestions === 1
        ? 'Poser et effectuer la division décimale suivante et donner une valeur approchée de son quotient au millième près.'
        : 'Poser et effectuer les divisions décimales suivantes et donner une valeur approchée de leur quotient au millième près.'
    const nbDecimales = this.sup2 - 1
    const dividendeLePlusPetit = this.sup3
    let puissanceDeDixDuDividende = this.sup4
    const diviseur = this.sup5

    for (
      let i = 0, texte, texteCorr, cpt = 0, a, b;
      i < this.nbQuestions && cpt < 50;
    ) {
      let q = 0
      b = valeurExacte
        ? nbDecimales === 0
          ? valeurExacte
            ? choice([2, 4, 5, 8])
            : choice([3, 6, 7, 9])
          : diviseur === 10
            ? randint(2, 9)
            : diviseur
        : choice([3, 6, 7, 9])

      if (dividendeLePlusPetit) {
        puissanceDeDixDuDividende = 1
        if (b === 1) b = randint(2, 9)
      }
      const maxDividende = 10 ** (puissanceDeDixDuDividende + nbDecimales)
      const minDividende =
        10 ** (puissanceDeDixDuDividende + nbDecimales - 1) + 1
      let compteurPourEmpecherBoucleInfinie = 0
      do {
        const dividendeEntier = randint(
          Math.ceil(minDividende / b),
          Math.floor(maxDividende / b),
        )
        q = arrondi(dividendeEntier / 10 ** nbDecimales, 3)
        a = arrondi(b * q, 3)
        compteurPourEmpecherBoucleInfinie++
        if (compteurPourEmpecherBoucleInfinie > 100) break
      } while (
        (dividendeLePlusPetit ? a > b : a < b) ||
        (q * 10 ** nbDecimales) % 10 === 0
      )
      if (compteurPourEmpecherBoucleInfinie > 100) {
        alert(
          'Impossible de générer une nouvelle question avec ces paramètres. Changez vos paramètres.',
        )
        break
      }
      if (
        (nbDecimales === 0 && q - parseInt(String(q)) === 0) ||
        (!valeurExacte && arrondi(q * 1000) % 10 === 0)
      ) {
        a = arrondi(a - randint(1, b - 1) / 10 ** nbDecimales)
        q = troncature(a / b, 3)
      }

      texte = `$${texNombre(a)}\\div${b}`
      if (valeurExacte) {
        texteCorr = operation({
          operande1: arrondi(a, 6),
          operande2: b,
          type: 'division',
          precision: 3,
          options: { solution: true, colore: orangeMathalea },
        })
        texteCorr += `<br>$${texNombre(a)}\\div${b}=${miseEnEvidence(texNombre(q, 3))}$`
        texte += this.interactif ? '=$' : '$'
      } else {
        texteCorr = operation({
          operande1: arrondi(a, 6),
          operande2: b,
          type: 'division',
          precision: 3,
          options: { solution: true, colore: orangeMathalea },
        })
        texteCorr += `<br>$${texNombre(a)}\\div${b}\\approx${miseEnEvidence(texNombre(q, 3))}$`
        texte += this.interactif ? '\\approx$' : '$'
      }
      handleAnswers(this, i, { reponse: { value: q } })
      if (context.isHtml && this.interactif)
        texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers)
      if (context.isAmc) {
        this.autoCorrectionAMC[i].enonce = texte
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        this.autoCorrectionAMC[i].propositions = [{ texte: texteCorr }]
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        // @ts-expect-error trop compliqué à typer
        this.autoCorrectionAMC[i].reponse.param = {
          digits:
            nombreDeChiffresDansLaPartieEntiere(q) +
            nombreDeChiffresDansLaPartieDecimale(q) +
            2,
          decimals: nombreDeChiffresDansLaPartieDecimale(q) + 1,
          signe: false,
          exposantNbChiffres: 0,
        }
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
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
