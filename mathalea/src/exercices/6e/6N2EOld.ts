import { amcConvert } from '../../lib/amc/amcBuilders'
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
  'Poser des multiplications de nombres décimaux (Version $2$)'

export const dateDePublication = '08/06/2022'

/**
 * Multiplication de deux nombres décimaux avec des paramètres sur le nombre de chiffres et de décimales dans chaque facteur
 * Ref 6C30
 * @author Éric Elter (sur la base de 6C30)
 * Publié le 08/06/2022
 */
export const uuid = 'f6413'

export const refs = {
  'fr-fr': [],
  'fr-2016': ['6C30-0'],
  'fr-ch': [],
}
export default class MultiplierDecimauxOld extends Exercice {
  constructor() {
    super()

    this.spacing = 2

    this.nbQuestions = 4
    this.sup = 3
    this.sup2 = 3
    this.sup3 = 1
    this.sup4 = 2
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
      3,
      '1 : Une décimale\n2 : Deux décimales\n3 : Trois décimales',
    ]
    this.besoinFormulaire4Numerique = [
      'Choix du nombre de décimales significatives dans le second facteur',
      3,
      '1 : Une décimale\n2 : Deux décimales\n3 : Trois décimales',
    ]
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions === 1
        ? 'Poser et effectuer le calcul suivant.'
        : 'Poser et effectuer les calculs suivants.'
    let reponse
    const nbChiffresa = parseInt(this.sup)
    const nbChiffresb = parseInt(this.sup2)
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
      a = a / Math.pow(10, parseInt(this.sup3))
      b =
        this.sup2 === 1
          ? randint(2, 9)
          : 10 *
              randint(
                Math.pow(10, nbChiffresb - 2) + 1,
                Math.pow(10, nbChiffresb - 1) - 1,
              ) +
            randint(1, 9)
      b = b / Math.pow(10, parseInt(this.sup4))
      texte = `$${texNombre(a)}\\times${texNombre(b)}$`
      reponse = arrondi(a * b)
      texteCorr = operation({
        operande1: a,
        operande2: b,
        type: 'multiplication',
        display: 'inline',
        options: { solution: true, colore: orangeMathalea },
      })
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
        handleAnswers(this, i, { reponse: { value: reponse } })
      } else if (context.isAmc) {
        this.autoCorrectionAMC[i] = {
          enonce: texte,
          enonceAvant: false,
          reponse: {
            texte: texteCorr,
            valeur: reponse,
          },
        }
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      }

      if (this.listeQuestions.indexOf(texte) === -1) {
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
