import { orangeMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { arrondi } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import operation from '../../modules/operations'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const amcReady = true
export const amcType = 'AMCNum'
export const interactifReady = true

export const titre =
  'Poser des multiplications de nombres décimaux (paramétrables)'

export const dateDePublication = '08/06/2022'
export const dateDeModifImportante = '01/02/2026'

/**
 * Multiplication de deux nombres décimaux avec des paramètres sur le nombre de chiffres et de décimales dans chaque facteur
 * @author Éric Elter (sur la base de 6C30)
 */
export const uuid = 'f9113'

export const refs = {
  'fr-fr': ['6N2E'],
  'fr-2016': ['6C30-0'],
  'fr-ch': ['9R1NO7B-1', '9R2NO7B-1', '9R3NO7B-1', 'PRQNO06A-2'],
}
export default class MultiplierDecimauxParametres extends Exercice {
  version: string
  constructor() {
    super()

    this.spacing = 2

    this.nbQuestions = 4
    this.sup = 3
    this.sup2 = 3
    this.sup3 = 2
    this.sup4 = 3
    this.besoinFormulaireNumerique = [
      'Choix du nombre de chiffres significatifs dans le premier facteur',
      4,
      '1 : Un chiffre\n2 : Deux chiffres\n3 : Trois chiffres\n4 : Quatre chiffres',
    ]
    this.besoinFormulaire2Numerique = [
      'Choix du nombre de chiffres significatifs dans le second facteur',
      4,
      '1 : Un chiffre\n2 : Deux chiffres\n3 : Trois chiffres\n4 : Quatre chiffres',
    ]
    this.besoinFormulaire3Numerique = [
      'Choix du nombre de décimales significatives dans le premier facteur',
      4,
      '1 : Aucune décimale\n2 : Une décimale\n3 : Deux décimales\n4 : Trois décimales',
    ]
    this.besoinFormulaire4Numerique = [
      'Choix du nombre de décimales significatives dans le second facteur',
      4,
      '1 : Aucune décimale\n2 : Une décimale\n3 : Deux décimales\n4 : Trois décimales',
    ]
    this.version = '6eme'
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions === 1
        ? 'Poser et effectuer le calcul suivant.'
        : 'Poser et effectuer les calculs suivants.'
    let reponse
    const nbChiffresa = this.sup
    const nbChiffresb = this.sup2
    for (
      let i = 0, texte, texteCorr, cpt = 0, a, b;
      i < this.nbQuestions && cpt < 50;
    ) {
      a =
        this.sup === 1
          ? randint(2, 9)
          : 10 *
              randint(
                Math.pow(10, nbChiffresa - 2) + 1,
                Math.pow(10, nbChiffresa - 1) - 1,
              ) +
            randint(1, 9)
      a = a / Math.pow(10, this.sup3 - 1)
      if (this.version === 'CM1') {
        b = this.sup2 === 10 ? randint(2, 9) : this.sup2
      } else {
        b =
          this.sup2 === 1
            ? randint(2, 9)
            : 10 *
                randint(
                  Math.pow(10, nbChiffresb - 2) + 1,
                  Math.pow(10, nbChiffresb - 1) - 1,
                ) +
              randint(1, 9)
        b = b / Math.pow(10, this.sup4 - 1)
      }
      texte = `$${texNombre(a)}\\times${texNombre(b)}$`
      reponse = arrondi(a * b)
      texteCorr = operation({
        operande1: a,
        operande2: b,
        type: 'multiplication',
        display: 'inline',
        options: { solution: true, colore: orangeMathalea },
      })
      if (this.version === '6eme')
        texteCorr +=
          '$\\phantom{espace}$' +
          operation({
            operande1: b,
            operande2: a,
            type: 'multiplication',
            display: 'inline',
            options: { solution: true, colore: orangeMathalea },
          })
      if (context.isHtml && this.interactif) {
        texte +=
          '$~=$' +
          ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers)
      }

      handleAnswers(this, i, {
        reponse: {
          value: reponse,
          options: { nombreDecimalSeulement: true },
        },
      })
      if (this.questionJamaisPosee(i, a, b)) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        // L'opération posée n'est pas extractible : la réponse est fournie explicitement
        this.listeReponsesCourtes[i] = `$${texNombre(reponse)}$`
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
