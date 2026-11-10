import { bleuMathalea } from '../../lib/colors'
import { sameNumberList, seq } from '../../lib/interactif/checks'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence, texteGras } from '../../lib/outils/embellissements'
import { listeDesDiviseurs, pgcd } from '../../lib/outils/primalite'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Déterminer les diviseurs communs à deux nombres entiers inférieurs ou égaux à 30'
export const dateDePublication = '03/11/2026'
export const interactifReady = true

/**
 * On liste les diviseurs de chaque nombre et on garde ceux qui sont dans les deux listes
 * @author Rémi Angot
 */
export const uuid = '783de'

export const refs = {
  'fr-fr': ['CM2N1K'],
  'fr-ch': [],
}

// Couples de nombres de 4 à 30 qui ont au moins un diviseur commun autre que 1
const couples: [number, number][] = []
for (let a = 4; a < 30; a++) {
  for (let b = a + 1; b <= 30; b++) {
    if (pgcd(a, b) > 1 && b % a !== 0) couples.push([a, b])
  }
}

export default class DiviseursCommuns extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4
    this.spacingCorr = 1.5
  }

  nouvelleVersion() {
    this.consigne = 'Donner tous les diviseurs communs aux deux nombres.'
    if (this.interactif) {
      this.consigne += ` Séparer les nombres par un ${texteGras('point-virgule')}.`
    }
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const [a, b] = choice(couples)
      const diviseursA = listeDesDiviseurs(a)
      const diviseursB = listeDesDiviseurs(b)
      const communs = diviseursA.filter((d) => diviseursB.includes(d))
      const listeColoree = (diviseurs: number[]) =>
        diviseurs
          .map((d) =>
            communs.includes(d)
              ? `$${miseEnEvidence(d, bleuMathalea)}$`
              : `$${d}$`,
          )
          .join(' ; ')

      let texte = `Diviseurs communs à $${a}$ et à $${b}$ :`
      if (this.interactif) {
        texte += ajouteChampTexteMathLive(
          this,
          i,
          KeyboardType.clavierNumbersAvecPointVirgule,
        )
      }
      let texteCorr = `Les diviseurs de $${a}$ sont : ${listeColoree(diviseursA)}.<br>`
      texteCorr += `Les diviseurs de $${b}$ sont : ${listeColoree(diviseursB)}.<br>`
      texteCorr += `Les diviseurs communs à $${a}$ et à $${b}$ sont ceux qui sont dans les deux listes : $${miseEnEvidence(communs.join('~;~'))}$.`

      if (this.questionJamaisPosee(i, a, b)) {
        handleAnswers(this, i, {
          reponse: {
            value: communs.join(';'),
            compare: seq([sameNumberList()]),
          },
        })
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
