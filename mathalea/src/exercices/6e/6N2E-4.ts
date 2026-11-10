import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Déterminer le dernier chiffre d'un produit entre décimaux"
export const dateDePublication = '28/01/2026'
export const amcReady = true
export const interactifReady = true

export const amcType = 'AMCNum'

/**
 * Trouver le dernier chiffre d'un produit entre décimaux
 * @author Éric Elter
 */

export const uuid = 'em8m3'

export const refs = {
  'fr-fr': ['6N2E-4', '5N2autoA-4'],
  'fr-ch': ['9R1NO7D-3', '9R2NO7D-3', '9R3NO7D-3', 'PRQST03A-3'],
}

export default class DernierChiffreProduitDécimaux extends Exercice {
  version: string
  constructor() {
    super()
    this.besoinFormulaire2Numerique = [
      'Nombre de décimales sur les deux nombres',
      3,
      'Avec le même nombre de décimales\nAvec un nombre différent de décimales\nPeu importe le nombre de décimales',
    ]
    this.besoinFormulaire3CaseACocher = ['Avec un entier']

    this.sup2 = 3
    this.sup3 = false
    this.nbQuestions = 2 // Ici le nombre de questions
    this.version = '6e'
    this.correctionDetailleeDisponible = true
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions > 1
        ? 'Pour chaque calcul, déterminer le dernier chiffre (non nul) du résultat.'
        : 'Déterminer le dernier chiffre (non nul) du résultat de ce calcul.'

    if (this.sup3) this.sup2 = false
    for (
      let i = 0, a = 0, b = 0, texte = '', texteCorr = '', cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      let resultat = 0

      const memeNbDeDecimales =
        this.sup2 === 3 ? choice([true, false]) : this.sup2 === 1
      const exposant = randint(1, 3)
      let exposant1 = randint(1, 3)
      let exposant2 = randint(1, 3, exposant1)
      if (this.sup3) {
        if (choice([true, false])) exposant1 = 0
        else exposant2 = 0
      }
      const chiffreA = randint(1, 9)
      const chiffreB = randint(1, 9)
      a =
        randint(0, 1) * randint(1, 9) * 10000 +
        randint(100, 999) * 10 +
        chiffreA
      b =
        randint(0, 1) * randint(1, 9) * 10000 + randint(10, 999) * 10 + chiffreB
      if (memeNbDeDecimales) {
        a = arrondi(a / 10 ** exposant)
        b = arrondi(b / 10 ** exposant)
      } else {
        a = arrondi(a / 10 ** exposant1, exposant1)
        b = arrondi(b / 10 ** exposant2, exposant2)
      }
      resultat = (chiffreA * chiffreB) % 10
      texte = `$${texNombre(a)} \\times ${texNombre(b)}$`
      texteCorr = ''
      if (this.correctionDetaillee) {
        texteCorr += `Les derniers chiffres non nuls des deux facteurs ($${texNombre(a)}$ et $${texNombre(b)}$) sont respectivement $${chiffreA}$ et $${chiffreB}$.<br>`
        texteCorr += `Le dernier chiffre attendu sera donc le chiffre des unités du produit de $${chiffreA}$ et $${chiffreB}$, soit $${chiffreA}\\times${chiffreB}=${chiffreA * chiffreB < 10 ? '' : Math.floor((chiffreA * chiffreB) / 10)}${miseEnEvidence(resultat)}$.<br>`
      }
      texteCorr += `Le dernier chiffre de $${texNombre(a)} \\times ${texNombre(b)}$ est $${miseEnEvidence(resultat)}$.`

      if (this.interactif) {
        texte =
          'Le dernier chiffre de ' +
          texte +
          ' est :' +
          ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers)
      }
      handleAnswers(this, i, {
        reponse: {
          value: resultat,
          options: { nombreDecimalSeulement: true },
        },
      })
      if (this.questionJamaisPosee(i, a, b)) {
        // Si la question n'a jamais été posée, on la stocke dans la liste des questions
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this) // On envoie l'exercice à la fonction de mise en page
  }
}
