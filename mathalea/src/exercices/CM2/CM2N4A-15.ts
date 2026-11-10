import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'

export const titre = 'Trouver le complément à une dizaine'
export const amcReady = true
export const interactifReady = true

export const amcType = 'AMCNum'

/**
 * Une soustraction dont le premier terme est un multiple de 10
 * @author Rémi Angot

 */
export const uuid = '5e009'

export const refs = {
  'fr-fr': ['CM2N4A-15'],
  'fr-2016': ['CM013'],
  'fr-ch': ['9R1NO6A-11', '9R2NO6A-11', '9R3NO6A-11'],
}
export default class ComplementAUneDizaine extends Exercice {
  constructor() {
    super()
    this.consigne = `Compléter${sp()}:`
    this.besoinFormulaireNumerique = [
      "Type d'écriture",
      2,
      '1 : Soustraction\n2 : Addition à trou',
    ]
    this.sup = 1
    this.nbCols = 2
    this.nbColsCorr = 2
  }

  nouvelleVersion() {
    for (
      let i = 0, texte, texteCorr, a, b, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      a = randint(2, 9) * 10
      b = randint(2, a - 11)
      if (this.sup === 1) texte = `$${texNombre(a)} - ${texNombre(b)}=$`
      else texte = `$${texNombre(b)} + $`
      if (this.sup === 1 && this.interactif) {
        texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers)
      } else if (this.sup === 1) {
        texte += `$ \\ldots\\ldots $`
      }
      if (this.sup === 2 && this.interactif) {
        texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers)
        texte += `$ = ${a} $`
      } else if (this.sup === 2) {
        texte += `$ \\ldots\\ldots = ${a} $`
      }

      if (this.sup === 1) texteCorr = `$${texNombre(a)} - ${texNombre(b)} = ${miseEnEvidence(texNombre(a - b))}$`
      else texteCorr = `$${texNombre(b)} + ${miseEnEvidence(texNombre(a - b))} = ${texNombre(a)}$`

      handleAnswers(this, i, {
        reponse: {
          value: texNombre(a - b),
        },
      })

      if (this.questionJamaisPosee(i, a, b)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
