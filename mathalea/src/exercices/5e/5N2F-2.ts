import Decimal from 'decimal.js'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
export const titre = 'Encadrer un nombre relatif'

export const dateDePublication = '25/9/2024'
export const uuid = '4b644'
export const interactifReady = true

export const refs = {
  'fr-fr': ['5N2F-2'],
  'fr-2016': ['5R13-2'],
  'fr-ch': ['9R1NO3B-6', '9R2NO3B-6', '9R3NO3B-6'],
}

/**
 * Encadrer un nombre relatif à l'unité, au dixième ou au centième
 * @author Rémi Angot
 */
export default class EncadrerRelatif extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4
    this.comment =
      "Trois fois sur 4, le nombre à encadrer sera négatif. L'encadrement se fera à l'unité, au dixième ou au centième avec équiprobabilité"
  }

  nouvelleVersion() {
    const typeQuestionsDisponibles = ['unite', 'dixieme', 'centieme']

    const listeTypeQuestions = combinaisonListes(
      typeQuestionsDisponibles,
      this.nbQuestions,
    )
    const nombreDeChiffresPartieDecimaleEnPlus = combinaisonListes(
      [1, 2, 3],
      this.nbQuestions,
    )
    const signe = combinaisonListes([1, -1, -1, -1], this.nbQuestions)
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let a = new Decimal(
        choice([true, false]) ? randint(1, 100) : randint(1, 10),
      )
      let nombreDeChiffresPartieDecimale =
        nombreDeChiffresPartieDecimaleEnPlus[i]
      if (
        listeTypeQuestions[i] === 'dixieme' &&
        nombreDeChiffresPartieDecimale < 2
      ) {
        nombreDeChiffresPartieDecimale = 2
      } else if (
        listeTypeQuestions[i] === 'centieme' &&
        nombreDeChiffresPartieDecimale < 3
      ) {
        nombreDeChiffresPartieDecimale = 3
      }
      for (let j = 0; j < nombreDeChiffresPartieDecimale; j++) {
        const partieDecimale = new Decimal(randint(1, 9)).div(10 ** (j + 1))
        a = a.add(partieDecimale)
      }
      a = a.mul(signe[i])
      let borneInf: Decimal
      let borneSup: Decimal
      let texte = `Encadrer $${texNombre(a)}$ `
      let remarque = ''
      switch (listeTypeQuestions[i]) {
        case 'unite':
          texte += "à l'unité."
          borneInf = a.floor()
          borneSup = a.ceil()
          break
        case 'dixieme':
          texte += 'au dixième.'
          borneInf = a.mul(10).floor().div(10)
          borneSup = a.mul(10).ceil().div(10)
          break
        default:
          {
            // 'centieme
            texte += 'au centième.'
            borneInf = a.mul(100).floor().div(100)
            borneSup = a.mul(100).ceil().div(100)
            const borneInfDixieme = a.mul(10).floor().div(10)
            const borneSupDixieme = a.mul(10).ceil().div(10)
            if (borneInfDixieme.equals(borneInf)) {
              remarque = `Remarque : $${texNombre(borneInf)} = ${texNombre(borneInf)}0$.`
            }
            if (borneSupDixieme.equals(borneSup)) {
              remarque = `Remarque : $${texNombre(borneSup)} = ${texNombre(borneSup)}0$.`
            }
          }
          break
      }
      let texteCorr = `$${miseEnEvidence(texNombre(borneInf))}<${texNombre(a)}<${miseEnEvidence(texNombre(borneSup))}$`
      if (remarque) {
        texteCorr += `<br><br>${remarque}`
      }
      texte +=
        '<br><br>' +
        remplisLesBlancs(
          this,
          i,
          `%{champ1}\\quad<\\quad${texNombre(a)}\\quad<\\quad%{champ2}`,
          ` ${KeyboardType.clavierDeBase}`,
          '\\ldots\\ldots',
        )
      handleAnswers(this, i, {
        champ1: { value: borneInf.toString() },
        champ2: { value: borneSup.toString() },
      })
      if (this.questionJamaisPosee(i, a.toString())) {
        // <- laisser le i et ajouter toutes les variables qui rendent les exercices différents (par exemple a, b, c et d)
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
