import { bleuMathalea } from '../../lib/colors'
import { sameNumberList, seq } from '../../lib/interactif/checks'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence, texteGras } from '../../lib/outils/embellissements'
import { ppcm } from '../../lib/outils/primalite'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Déterminer des multiples communs à deux nombres entiers inférieurs à 15'
export const dateDePublication = '03/11/2026'
export const interactifReady = true

/**
 * On liste les multiples du plus grand nombre jusqu'à une limite et on garde
 * ceux qui sont aussi des multiples du plus petit
 * @author Rémi Angot
 */
export const uuid = '3921a'

export const refs = {
  'fr-fr': ['CM2N1L'],
  'fr-ch': [],
}

// Couples de nombres de 2 à 14, aucun n'étant multiple de l'autre, dont le
// plus petit multiple commun non nul ne dépasse pas 40
const couples: [number, number][] = []
for (let a = 2; a < 14; a++) {
  for (let b = a + 1; b <= 14; b++) {
    if (b % a !== 0 && ppcm(a, b) <= 40) couples.push([a, b])
  }
}

function multiplesInferieursA(n: number, limite: number): number[] {
  return Array.from(
    { length: Math.floor((limite - 1) / n) },
    (_, k) => n * (k + 1),
  )
}

export default class MultiplesCommuns extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4
    this.spacingCorr = 1.5
  }

  nouvelleVersion() {
    this.consigne = ''
    if (this.interactif) {
      this.consigne = `Séparer les nombres par un ${texteGras('point-virgule')}.`
    }
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const [a, b] = choice(couples)
      const m = ppcm(a, b)
      // 2 à 4 multiples communs, avec une limite qui est un nombre entier de dizaines
      const nbCommuns = randint(2, Math.min(4, Math.floor(99 / m)))
      const limite = Math.ceil((m * nbCommuns + 1) / 10) * 10
      const multiplesB = multiplesInferieursA(b, limite)
      const communs = multiplesB.filter((n) => n % a === 0)
      let texte = `Donner tous les multiples non nuls communs à $${a}$ et à $${b}$ qui sont inférieurs à $${limite}$.`
      if (this.interactif) {
        texte += ajouteChampTexteMathLive(
          this,
          i,
          KeyboardType.clavierNumbersAvecPointVirgule,
          { texteAvant: '<br>' },
        )
      }
      let texteCorr = `Les multiples non nuls de $${b}$ inférieurs à $${limite}$ sont : ${multiplesB
        .map((n) =>
          communs.includes(n)
            ? `$${miseEnEvidence(n, bleuMathalea)}$`
            : `$${n}$`,
        )
        .join(' ; ')}.<br>`
      texteCorr += `Parmi eux, ceux qui sont aussi des multiples de $${a}$ sont : $${miseEnEvidence(communs.join('~;~'))}$.`

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
